---
name: update_company_skills
description: Syncs company skills from https://github.com/galamo/skills into .cursor/skills while preserving local project skills. Use only when the user invokes /update_company_skills (manual invocation).
disable-model-invocation: true
---

# Update Company Skills

Sync company-wide Cursor skills from [galamo/skills](https://github.com/galamo/skills) into this project's `.cursor/skills/` directory. Do not run this workflow unless the user explicitly invoked **/update_company_skills**.

## What this does

| Action    | Behavior                                                                                     |
| --------- | -------------------------------------------------------------------------------------------- |
| Fetch     | Shallow-clone `https://github.com/galamo/skills` (branch `main`)                             |
| Validate  | Check each `SKILL.md` includes `name` and `description` before copying                     |
| Merge     | Copy each valid company skill folder into `.cursor/skills/<skill-name>/`                     |
| Tag       | Write `.company-managed.json` in each successfully synced skill folder                       |
| Preserve  | Keep local-only skills (e.g. `save-prompt`, `update_company_skills`) untouched               |
| Update    | Overwrite files when a valid company skill shares a folder name with an existing skill       |
| Full sync | With `full`, delete previously synced skills that no longer exist in the company repo        |
| Track     | Write `.cursor/skills/.company-skills-manifest.json` listing successfully synced skill names |

## Workflow

1. Confirm **/update_company_skills** was explicitly requested. If not, stop.
2. From the workspace root, run merge sync (default):

```bash
bash .cursor/skills/update_company_skills/scripts/sync-company-skills.sh
```

For **full sync** (also remove company-managed skills no longer in the repo):

```bash
bash .cursor/skills/update_company_skills/scripts/sync-company-skills.sh --full
```

3. Read the script output. Report to the user:
   - Skills **added** (new folders)
   - Skills **updated** (existing folders overwritten)
   - Skills **skipped** (missing `SKILL.md`, or missing `name` / `description`)
   - Skills **removed** (full sync only; previously synced skills deleted because they are gone from the company repo)
   - Local-only skills **preserved**
4. If the script exits non-zero, show the error and do not claim success.

## Sync modes

| Mode   | Invocation | Deletes local skills? |
| ------ | ---------- | --------------------- |
| Merge  | default    | No — only adds or updates |
| Full   | `--full`   | Yes — removes folders tagged `.company-managed.json` when the skill is no longer in the company repo |

## Merge rules

- **Local-only skills** — folders without `.company-managed.json` are never deleted by sync (e.g. `save-prompt`, `update_company_skills`).
- **Company-managed tag** — every successful sync writes `.company-managed.json` into the skill folder so later full syncs know it came from the company repo.
- **Name collision** — if both local and company have the same folder name (e.g. `skill_b`), the company version wins on sync.
- **Invalid company skills** — directories without `SKILL.md`, or whose `SKILL.md` is missing `name` or `description`, are skipped and listed in the report. Invalid skills are **not** copied or updated locally; any existing local copy is left unchanged.
- **Merge mode** — never deletes skill folders; only adds or updates.
- **Full sync mode** — deletes only company-managed skills (tagged with `.company-managed.json`) that are absent from the current company repo fetch.

## SKILL.md validation

Before a company skill is copied, its `SKILL.md` must include:

| Requirement   | Rule              |
| ------------- | ----------------- |
| `name`        | Required, non-empty |
| `description` | Required, non-empty |

No other format checks are applied.

## Examples

**User message:**

```
/update_company_skills
```

**Expected result:** Company skills copied into `.cursor/skills/`, each synced skill tagged with `.company-managed.json`, manifest updated, brief summary of changes.

**User message (full sync):**

```
/update_company_skills full
```

Pass `--full` to the script:

```bash
bash .cursor/skills/update_company_skills/scripts/sync-company-skills.sh --full
```

**Expected result:** Same as merge sync, plus removal of any previously synced company-managed skills that no longer exist in the company repo.

**User message (with branch override):**

```
/update_company_skills branch: develop
```

Pass `develop` to the script: `bash .cursor/skills/update_company_skills/scripts/sync-company-skills.sh develop`

Full sync on a branch: `bash .cursor/skills/update_company_skills/scripts/sync-company-skills.sh develop --full`

## Do not

- Auto-sync on every session (this skill is manual-only).
- Delete local-only skill folders (those without `.company-managed.json`).
- Run full sync unless the user explicitly requests it.
- Commit or push unless the user separately asks.

## Troubleshooting

| Issue                            | Fix                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `git: command not found`         | Install Git or run from an environment with Git available                                                   |
| Network / clone failed           | Check connectivity and repo access to `github.com/galamo/skills`                                            |
| Skill skipped (no SKILL.md)      | Fix the skill in the company repo — each skill folder must contain `SKILL.md`                               |
| Skill skipped (invalid SKILL.md) | Add non-empty `name` and `description` fields to `SKILL.md` in the company repo |
