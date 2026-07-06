#!/usr/bin/env python3
"""Chain /tests-passed to /push when Tests-Passed output is detected."""

import json
import re
import sys
from pathlib import Path

STATE_DIR = Path(__file__).resolve().parent / "state"
STATE_FILE = STATE_DIR / "tests-passed-push.json"

TESTS_PASSED_OUTPUT = re.compile(r"Tests-Passed", re.IGNORECASE)
TESTS_PASSED_COMMAND = re.compile(r"/tests-passed\b")


def load_state() -> dict:
    if not STATE_FILE.exists():
        return {}
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def save_state(state: dict) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def conversation_state(state: dict, conversation_id: str) -> dict:
    return state.setdefault(
        conversation_id,
        {
            "awaiting_output": False,
            "output_detected": False,
        },
    )


def read_payload() -> dict:
    return json.load(sys.stdin)


def emit(response: dict | None = None) -> None:
    print(json.dumps(response or {}))
    raise SystemExit(0)


def handle_before_submit(payload: dict) -> None:
    prompt = payload.get("prompt", "")
    conversation_id = payload.get("conversation_id", "")

    if conversation_id and TESTS_PASSED_COMMAND.search(prompt):
        state = load_state()
        conv = conversation_state(state, conversation_id)
        conv["awaiting_output"] = True
        conv["output_detected"] = False
        save_state(state)

    emit({"continue": True})


def mark_output_detected(conversation_id: str) -> None:
    if not conversation_id:
        return

    state = load_state()
    conv = conversation_state(state, conversation_id)
    if conv.get("awaiting_output"):
        conv["output_detected"] = True
        save_state(state)


def handle_after_agent_response(payload: dict) -> None:
    if TESTS_PASSED_OUTPUT.search(payload.get("text", "")):
        mark_output_detected(payload.get("conversation_id", ""))
    emit()


def handle_after_shell_execution(payload: dict) -> None:
    if TESTS_PASSED_OUTPUT.search(payload.get("output", "")):
        mark_output_detected(payload.get("conversation_id", ""))
    emit()


def handle_stop(payload: dict) -> None:
    conversation_id = payload.get("conversation_id", "")
    status = payload.get("status", "")

    if status != "completed" or not conversation_id:
        emit()

    state = load_state()
    conv = state.get(conversation_id, {})

    if conv.get("awaiting_output") and conv.get("output_detected"):
        state.pop(conversation_id, None)
        save_state(state)
        emit({"followup_message": "/push"})

    emit()


def main() -> None:
    if len(sys.argv) < 2:
        emit()

    handlers = {
        "beforeSubmitPrompt": handle_before_submit,
        "afterAgentResponse": handle_after_agent_response,
        "afterShellExecution": handle_after_shell_execution,
        "stop": handle_stop,
    }

    handler = handlers.get(sys.argv[1])
    if handler is None:
        emit()

    handler(read_payload())


if __name__ == "__main__":
    main()
