# Push

Stage all changes, commit with a timestamped message, and push to the current branch.

## Workflow

Run these steps in order. Do not skip ahead.

### 1. Preflight

Run in parallel:

- `git status`
- `git branch --show-current`

If there are **no changes** to commit (working tree clean and nothing staged), reply:

> **Nothing to push.** Working tree is clean.

Then stop.

### 2. Build the commit message

Format: `{datetime}_{gitUser}`

**datetime** — local timestamp, filesystem-safe:

```bash
date +%Y-%m-%d_%H-%M-%S
```

Example: `2026-07-06_19-31-45`

**gitUser** — resolve in this order:

1. `git config user.name`
2. If empty, local part of `git config user.email` (before `@`)
3. If still empty, `user_`

Normalize `gitUser` for the commit message: trim whitespace, replace spaces with `_`, remove characters that are unsafe in git commit subjects.

Final message example: `2026-07-06_19-31-45_Gal_Amouyal`

### 3. Stage, commit, push

Run sequentially:

```bash
git add -A
git commit -m "<datetime>_<gitUser>"
git push -u origin HEAD
```

Use the HEREDOC form for the commit message if shell escaping is needed:

```bash
git commit -m "$(cat <<'EOF'
<datetime>_<gitUser>
EOF
)"
```

### 4. Report

When finished, summarize:

1. Branch pushed
2. Commit hash and message
3. Remote push result (`origin/<branch>`)

if commit Or push failed, Write output: ERROR
