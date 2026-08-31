---
title: Claude Managed Agents
type: concept
sources:
  - sources/lab-notes/lab-37-managed-agent.md
  - sources/course/readme.md
updated: 2026-08-31
tags: [anthropic, managed-agents, sessions]
---

# Claude Managed Agents

Anthropic-hosted agents configured in the Claude console with instructions, tools, and environments. Accessed via API using `AGENT_ID` and `ENVIRONMENT_ID`.

## Course lab

[[labs/lab-37-managed-agent]] wraps Managed Agents in an Express API:

- Each `/ask` creates a **new session**
- Seeds with `initial_events` containing the user message
- Streams events until idle; collects `agent.message` blocks
- Archives session after response

## Console exercise (Aug 27)

Create **Release Notes Assistant** agent:

- Input: list of software changes
- Output: summary, risks, recommended tests

## vs self-hosted LangChain agents

| | Managed Agent | LangChain agent (e.g. Lab 10) |
|---|---------------|-------------------------------|
| Hosting | Anthropic | Your Node server |
| Config | Console instructions + env IDs | Code + prompts + tools |
| Session | API session lifecycle | In-process or custom state |

## Related

- [[labs/lab-37-managed-agent]]
- [[entities/langchain]] — alternative for self-hosted agents
