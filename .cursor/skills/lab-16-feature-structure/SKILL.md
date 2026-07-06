---
name: lab-16-feature-structure
description: Organizes lab_16 React client work into feature-based folders with colocated container, interfaces, sub-components, and index exports. Use when creating or updating components, pages, or features under lab_16/client.
---

# Lab 16 Feature-Based Structure

## Instructions

in lab 16 every time you are creating new component or page or feature, build it with feature-base folder structure
it means the component page - container component located in the same folder with her relevant interfaces + sub components + functional components + and expose the component from index.tsx

Apply this skill for all new or refactored work in `lab_16/client`.

## Folder layout

Create one folder per feature under `lab_16/client/src/features/<feature-name>/`:

```
features/<feature-name>/
├── index.tsx                 # public API — re-export the container only
├── <FeatureName>Page.tsx     # container (page / smart component)
├── interfaces.ts             # feature-local types and props
├── components/               # sub-components and presentational pieces
│   ├── <SubComponent>.tsx
│   └── ...
└── ...                       # hooks, utils, etc. only when needed
```

Use kebab-case for the folder name (`companies`, `post-feed`) and PascalCase for React files.

## Roles

| File | Role |
|------|------|
| `<FeatureName>Page.tsx` | Container: data, state, effects, wiring sub-components |
| `components/*.tsx` | Sub-components and functional (presentational) components |
| `interfaces.ts` | Props, view models, and feature-only types |
| `index.tsx` | Barrel export — expose the feature's public entry |

## Workflow

1. **Pick a feature name** and create `lab_16/client/src/features/<feature-name>/`.
2. **Add `interfaces.ts`** for feature-local types. Import shared domain types from `lab_16/client/src/interfaces.ts` (see [lab-16-interface-reuse](../lab-16-interface-reuse/SKILL.md)) — do not duplicate `User`, `Post`, `Comment`, `Company`, etc.
3. **Add the container** as `<FeatureName>Page.tsx` in the feature root.
4. **Add sub-components** under `components/` — keep them presentational when possible.
5. **Add `index.tsx`** that re-exports the container (and only what callers need):

```tsx
export { default } from "./CompaniesPage";
export { default as CompaniesPage } from "./CompaniesPage";
```

6. **Import from the feature barrel** elsewhere in the app:

```tsx
import CompaniesPage from "./features/companies";
```

Do not import deep paths like `./features/companies/CompaniesPage` from outside the feature.

## Rules

- Every new page or feature gets its own folder under `src/features/` — not loose files in `src/pages/` or `src/components/`.
- Colocate everything the feature owns: container, interfaces, sub-components, and helpers.
- Container holds orchestration; `components/` holds UI pieces with minimal logic.
- `index.tsx` is the only public surface — external code imports from the feature folder, not internal files.
- Shared domain interfaces stay in `lab_16/client/src/interfaces.ts`; feature `interfaces.ts` holds props and feature-specific shapes only.
- When extending an existing flat component (`src/components/`, `src/pages/`), move it into a feature folder if the task scope includes that feature.

## Checklist

- [ ] Feature folder created under `src/features/<feature-name>/`
- [ ] Container component at feature root
- [ ] Feature-local `interfaces.ts` added (shared domain types imported, not duplicated)
- [ ] Sub-components and functional components under `components/`
- [ ] `index.tsx` exports the public entry
- [ ] App and other features import from the feature barrel

## Example

`src/features/companies/`:

```
companies/
├── index.tsx
├── CompaniesPage.tsx
├── interfaces.ts
└── components/
    └── CompanyCard.tsx
```

`interfaces.ts`:

```ts
import type { Company } from "../../interfaces";

export interface CompanyCardProps {
  company: Company;
}
```

`components/CompanyCard.tsx`:

```tsx
import type { CompanyCardProps } from "../interfaces";

export default function CompanyCard({ company }: CompanyCardProps) {
  // presentational UI
}
```

`CompaniesPage.tsx`:

```tsx
import CompanyCard from "./components/CompanyCard";
import type { Company } from "../../interfaces";

export default function CompaniesPage() {
  // container: data + layout
}
```

`index.tsx`:

```tsx
export { default } from "./CompaniesPage";
```

`App.tsx`:

```tsx
import CompaniesPage from "./features/companies";
```
