# git-branch-commit-push-pr

Reusable workflow prompt — run this in Cursor Agent whenever you want to ship local changes on a dated branch and open a PR to `main`.

---

## Prompt (copy from here)

Run the full git ship workflow below. Do not ask for confirmation unless something is ambiguous or blocked.

### Goal

Create a dated feature branch, commit all current work, push it to the remote, and open a pull request into `main`.

### Branch name

- Format: `branch_<YYYY-MM-DD>` using **today's date** (example: `branch_2026-06-22`).
- If that branch already exists locally or on the remote, append a suffix: `branch_<YYYY-MM-DD>_2`, then `_3`, etc., until the name is free.

### Steps

1. **Inspect state**
   - Run `git status`, `git diff`, and `git diff --staged`.
   - If there are no changes to commit, stop and tell me — do not create an empty branch or empty PR.

2. **Create branch**
   - Start from the latest `main`: `git fetch origin main` then `git checkout -b branch_<date> origin/main` (or checkout `main`, pull, then create the branch).
   - Do not commit directly on `main`.

3. **Stage and commit**
   - Stage all relevant changes (`git add` for modified/untracked files that belong in the repo).
   - **Do not** stage secrets (`.env`, credentials, tokens, keys).
   - Write a concise commit message (1–2 sentences) that explains **why**, based on the actual diff — not a generic message.

4. **Push**
   - `git push -u origin HEAD`

5. **Open pull request to `main`**
   - Base branch: `main` (this repo uses `main`, not `master`).
   - Head branch: the branch you just pushed.
   - Title: short summary of the change.
   - Body must include:

     ```markdown
     ## Summary

     - <1–3 bullets describing the change>

     ## Test plan

     - [ ] <how to verify>
     ```

   - Create the PR using the first method that works:
     1. `gh pr create` (if GitHub CLI is installed and authenticated)
     2. GitHub MCP `create_pull_request`
     3. GitHub REST API via stored git credentials
   - Return the **PR URL** when done.

### Rules

- Do not force-push.
- Do not amend unless a hook modified files after commit.
- Do not push or merge to `main` — only open the PR.
- If PR creation fails, still report the pushed branch name and the compare URL: `https://github.com/<owner>/<repo>/compare/main...<branch>`.

### Done when

- Branch exists on the remote with my commits.
- An open PR from that branch → `main` exists (or you give me the compare link if PR creation failed).

---

## Quick invoke (one line)

```
Run the git branch → commit → push → PR workflow from prompts/full_fit_flow.md using today's date for the branch name.
```
