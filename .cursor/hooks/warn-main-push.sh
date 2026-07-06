#!/bin/bash

set -euo pipefail

payload_file=$(mktemp)
cat > "$payload_file"

python3 - "$payload_file" <<'PY'
import json
import subprocess
import sys

payload_path = sys.argv[1]

with open(payload_path, "r", encoding="utf-8") as fh:
    payload = json.load(fh)

command = payload.get("command", "")
tokens = command.split()

protected_refs = {"main", "master"}
targets = set()

for token in tokens[2:]:
    if token.startswith("-"):
        continue
    if ":" in token:
        _, remote_ref = token.split(":", 1)
        token = remote_ref
    ref = token.removeprefix("refs/heads/")
    if ref in protected_refs:
        targets.add(ref)

if not targets and tokens[:2] == ["git", "push"]:
    non_flag_tokens = [token for token in tokens[2:] if not token.startswith("-")]
    if len(non_flag_tokens) <= 1:
        try:
            current_branch = subprocess.check_output(
                ["git", "rev-parse", "--abbrev-ref", "HEAD"],
                text=True,
                stderr=subprocess.DEVNULL,
            ).strip()
        except Exception:
            current_branch = ""
        if current_branch in protected_refs:
            targets.add(current_branch)

response = {"permission": "allow"}

if targets:
    branches = ", ".join(sorted(targets))
    response["user_message"] = (
        f"Non-blocking reminder: this push targets protected branch {branches}. "
        "Double-check before continuing."
    )

print(json.dumps(response))
PY

rm -f "$payload_file"
