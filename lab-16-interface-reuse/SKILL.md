---
name: lab-16-interface-reuse
description: Reuses shared TypeScript interfaces in the lab_16 React client and prevents duplicate interface definitions. Use when creating or updating components, features, props, state shapes, or other TypeScript models under lab_16/client.
---

# Lab 16 Interface Reuse

## Instructions

Apply this skill for work in `lab_16/client` that adds or changes React components or functionality.

whenever the agent requested to create new componets or new functionality, make sure to check first the `@lab_16/client/src/interfaces.ts` and reuse the interfaces from this file.
DONT DUPLICATE INTERFACES
if needed create interface in the `@lab_16/client/src/interfaces.ts` file and then reuse it

## Workflow

1. Before writing types, props, or data models in `lab_16/client`, read `lab_16/client/src/interfaces.ts`.
2. Reuse an existing exported interface whenever it already matches the needed shape.
3. Do not redefine the same interface in component files, hooks, pages, or utility files.
4. If the needed shape does not exist, add or update the shared interface in `lab_16/client/src/interfaces.ts` first.
5. After adding the shared interface, import and reuse it from the consuming file instead of creating a local duplicate.

## Rules

- Keep shared domain interfaces centralized in `lab_16/client/src/interfaces.ts`.
- Prefer extending an existing shared interface over creating a near-duplicate.
- If a component needs props, check whether those props should also be a shared interface in `lab_16/client/src/interfaces.ts`.
- When editing a file in `lab_16/client` that already has duplicated interfaces, consolidate them into `lab_16/client/src/interfaces.ts` if that is in scope for the task.

## Checklist

- [ ] Checked `lab_16/client/src/interfaces.ts` before adding types
- [ ] Reused an existing interface when possible
- [ ] Added any new shared interface to `lab_16/client/src/interfaces.ts`
- [ ] Avoided duplicate interface declarations in feature files

## Example

Instead of declaring a new `Post` shape inside `lab_16/client/src/components/Post.tsx`, import `Post` from `lab_16/client/src/interfaces.ts`.
