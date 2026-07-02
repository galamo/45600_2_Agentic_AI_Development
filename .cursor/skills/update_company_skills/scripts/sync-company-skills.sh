#!/usr/bin/env bash
set -euo pipefail

COMPANY_REPO="https://github.com/galamo/skills.git"
BRANCH="main"
FULL_SYNC=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
WORKSPACE_ROOT="$(cd "${SKILLS_DIR}/../.." && pwd)"
MANIFEST="${SKILLS_DIR}/.company-skills-manifest.json"
MANAGED_MARKER=".company-managed.json"
TEMP_DIR=""

for arg in "$@"; do
  case "${arg}" in
    --full|full)
      FULL_SYNC=true
      ;;
    *)
      BRANCH="${arg}"
      ;;
  esac
done

cleanup() {
  if [[ -n "${TEMP_DIR}" && -d "${TEMP_DIR}" ]]; then
    rm -rf "${TEMP_DIR}"
  fi
}
trap cleanup EXIT

added=()
updated=()
skipped=()
removed=()
preserved=()
synced_names=()

write_managed_marker() {
  local skill_dir="$1"
  local skill_name="$2"
  local synced_at
  synced_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  cat > "${skill_dir}/${MANAGED_MARKER}" <<EOF
{
  "managedBy": "update_company_skills",
  "skill": "${skill_name}",
  "source": "${COMPANY_REPO}",
  "branch": "${BRANCH}",
  "syncedAt": "${synced_at}"
}
EOF
}

is_synced_skill() {
  local target="$1"
  local name

  for name in "${synced_names[@]:-}"; do
    if [[ "${name}" == "${target}" ]]; then
      return 0
    fi
  done

  return 1
}

# Validate SKILL.md: must include non-empty name and description fields.
# Prints a failure reason to stdout and returns non-zero when invalid.
validate_skill_md() {
  local file="$1"

  if [[ ! -f "${file}" ]]; then
    echo "missing file"
    return 1
  fi

  local reason=""
  reason="$(
    awk '
      function trim(s) {
        sub(/^[ \t]+/, "", s)
        sub(/[ \t]+$/, "", s)
        return s
      }
      BEGIN { name = ""; desc = "" }
      $0 ~ /^name:[[:space:]]*/ {
        sub(/^name:[[:space:]]*/, "")
        name = trim($0)
      }
      $0 ~ /^description:[[:space:]]*/ {
        sub(/^description:[[:space:]]*/, "")
        desc = trim($0)
      }
      END {
        if (name == "") print "missing or empty name"
        else if (desc == "") print "missing or empty description"
      }
    ' "${file}"
  )"

  if [[ -n "${reason}" ]]; then
    echo "${reason}"
    return 1
  fi

  return 0
}

TEMP_DIR="$(mktemp -d)"
git clone --depth 1 --branch "${BRANCH}" "${COMPANY_REPO}" "${TEMP_DIR}/repo" 2>&1

mkdir -p "${SKILLS_DIR}"

for skill_path in "${TEMP_DIR}/repo"/*/; do
  [[ -d "${skill_path}" ]] || continue
  skill_name="$(basename "${skill_path}")"
  skill_md="${skill_path}/SKILL.md"

  if [[ ! -f "${skill_md}" ]]; then
    skipped+=("${skill_name} (missing SKILL.md)")
    continue
  fi

  validation_error=""
  if ! validation_error="$(validate_skill_md "${skill_md}")"; then
    skipped+=("${skill_name} (invalid SKILL.md: ${validation_error})")
    continue
  fi

  dest="${SKILLS_DIR}/${skill_name}"
  if [[ -d "${dest}" ]]; then
    updated+=("${skill_name}")
  else
    added+=("${skill_name}")
  fi

  mkdir -p "${dest}"
  rsync -a --delete "${skill_path%/}/" "${dest}/"
  write_managed_marker "${dest}" "${skill_name}"
  synced_names+=("${skill_name}")
done

if [[ "${FULL_SYNC}" == "true" ]]; then
  for local_path in "${SKILLS_DIR}"/*/; do
    [[ -d "${local_path}" ]] || continue
    local_name="$(basename "${local_path}")"
    [[ "${local_name}" == "update_company_skills" ]] && continue
    [[ -f "${local_path}/${MANAGED_MARKER}" ]] || continue

    if ! is_synced_skill "${local_name}"; then
      rm -rf "${local_path}"
      removed+=("${local_name}")
    fi
  done
fi

# List local skills not managed by this sync (preserved)
company_names=()
if [[ ${#synced_names[@]} -gt 0 ]]; then
  company_names=("${synced_names[@]}")
fi

for local_path in "${SKILLS_DIR}"/*/; do
  [[ -d "${local_path}" ]] || continue
  local_name="$(basename "${local_path}")"
  [[ "${local_name}" == "update_company_skills" ]] && continue

  is_company=false
  for cn in "${company_names[@]:-}"; do
    if [[ "${cn}" == "${local_name}" ]]; then
      is_company=true
      break
    fi
  done

  if ! ${is_company}; then
    preserved+=("${local_name}")
  fi
done

# Write manifest
{
  printf '{\n'
  printf '  "source": "%s",\n' "${COMPANY_REPO}"
  printf '  "branch": "%s",\n' "${BRANCH}"
  printf '  "syncedAt": "%s",\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  printf '  "syncMode": "%s",\n' "$([[ "${FULL_SYNC}" == "true" ]] && echo "full" || echo "merge")"
  printf '  "managedSkills": ['
  if [[ ${#company_names[@]} -gt 0 ]]; then
    for i in "${!company_names[@]}"; do
      [[ "${i}" -gt 0 ]] && printf ', '
      printf '"%s"' "${company_names[$i]}"
    done
  fi
  printf ']\n}\n'
} > "${MANIFEST}"

sync_mode_label="merge"
if [[ "${FULL_SYNC}" == "true" ]]; then
  sync_mode_label="full"
fi

echo "Company skills sync complete (branch: ${BRANCH}, mode: ${sync_mode_label})"
echo ""
echo "Added (${#added[@]}):"
if [[ ${#added[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  - %s\n' "${added[@]}"
fi
echo ""
echo "Updated (${#updated[@]}):"
if [[ ${#updated[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  - %s\n' "${updated[@]}"
fi
echo ""
echo "Skipped (${#skipped[@]}):"
if [[ ${#skipped[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  - %s\n' "${skipped[@]}"
fi
echo ""
echo "Removed (${#removed[@]}):"
if [[ ${#removed[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  - %s\n' "${removed[@]}"
fi
echo ""
echo "Local-only preserved (${#preserved[@]}):"
if [[ ${#preserved[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  - %s\n' "${preserved[@]}"
fi
echo ""
echo "Manifest: ${MANIFEST}"
