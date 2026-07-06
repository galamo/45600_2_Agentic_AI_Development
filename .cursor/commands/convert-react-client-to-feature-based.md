# Convert React client to feature-based structure

Convert the React client project at the **folder path provided after this command** into a feature-based folder layout. If the project already uses a hybrid structure, convert **only** the parts that are not yet feature-based — leave existing `src/features/*` folders untouched.

## Input (required)

The user must pass a folder path as text after the command name.

Example: `/convert-react-client-to-feature-based lab_16/client`

### Optional: delete empty folders

The user may pass **`--delete-empty`** or **`delete-empty`** after the folder path.

Example: `/convert-react-client-to-feature-based lab_16/client --delete-empty`

| Flag                              | Behavior                                                                |
| --------------------------------- | ----------------------------------------------------------------------- |
| _(omitted)_                       | Remove migrated files only; leave empty legacy directories in place     |
| `--delete-empty` / `delete-empty` | After migration, delete legacy folders under `src/` that are left empty |

When `--delete-empty` is set, remove empty directories that were sources of migrated code, including (when empty):

- `src/pages/`
- `src/components/`
- `src/hooks/`
- `src/utils/`

Do **not** delete folders that still contain files, or shared locations such as `src/contexts/`, `src/assets/`, `src/features/`, or the `src/` root itself. Only remove a folder if it has no remaining files (recursively empty).

### No folder → stop

If **no folder path** was provided after the command (empty input, only whitespace, or no recognizable path):

1. **Do not** read files, plan, or make any changes.
2. Reply with **only** this message:

> **No folder provided.** Run this command with a client root path, for example:
> `/convert-react-client-to-feature-based lab_16/client`

## Skills and rules (read first)

Before changing code, read and follow:

1. **`.cursor/skills/lab-16-feature-structure/SKILL.md`** — target folder layout, naming, barrel exports, and checklist. Generalize its patterns to the input folder (replace hard-coded `lab_16/client` paths with the provided client root).
2. **`.cursor/skills/lab-16-interface-reuse/SKILL.md`** — when the target is under `lab_16/client`, reuse shared types from `src/interfaces.ts`; do not duplicate domain interfaces.
3. **`.cursor/rules/http-axios.mdc`** — if any moved file uses HTTP, keep or refactor to Axios (never introduce `fetch`).
4. **`.cursor/skills/axios-http-enforcer/SKILL.md`** — reuse existing Axios instances when touching API calls during the refactor.

## Target folder layout

Each feature lives under `<client>/src/features/<feature-name>/`:

```
features/<feature-name>/
├── index.tsx                 # public API — re-export the container only
├── <FeatureName>Page.tsx     # container (page / smart component)
├── interfaces.ts             # feature-local types and props only
├── components/               # sub-components and presentational pieces
│   └── ...
├── hooks/                    # only when feature-specific
├── utils/                    # only when feature-specific
└── *.css                     # feature-scoped styles when applicable
```

Conventions:

- Folder name: **kebab-case** (`companies`, `post-feed`)
- React files: **PascalCase**
- External imports use the feature barrel: `import X from "./features/companies"` — never deep imports from outside the feature

## What stays outside `features/`

Do **not** move these unless they clearly belong to a single feature:

| Location                       | Keep when                                      |
| ------------------------------ | ---------------------------------------------- |
| `src/contexts/`                | App-wide providers (auth, theme, audit, etc.)  |
| `src/interfaces.ts`            | Shared domain types used across features       |
| `src/main.tsx`, `src/App.tsx`  | App shell, routing, global nav                 |
| `src/assets/`                  | Static assets                                  |
| `src/index.css`, `src/app.css` | Global styles                                  |
| `src/features/*`               | Already feature-based — **do not restructure** |

## Hybrid detection

1. Resolve the input to an absolute path and confirm it exists. If missing, report the error and stop.
2. Locate `src/` under the client root (e.g. `<client>/src`).
3. Classify the tree:

**Already feature-based (skip):**

- Any folder under `src/features/<name>/` that has a container page and `index.tsx` barrel export
- Features that already follow the layout above

**Candidates for conversion:**

- Files in `src/pages/` (one page → one feature)
- Loose files in `src/components/` that serve a specific page or domain area
- Feature-specific `hooks/`, `utils/`, or CSS colocated with a page but still outside `src/features/`
- Deep imports elsewhere pointing at `src/pages/` or `src/components/<Feature>*`

**Shared (do not convert into a feature):**

- Components used by multiple unrelated features → leave in `src/components/` or extract to a shared folder only if the project already has one
- Global contexts, shared interfaces, app entry files

## Conversion workflow

### 1. Audit

List every file/folder that needs conversion. For each candidate, determine:

- Feature name (kebab-case folder)
- Container component (`<FeatureName>Page.tsx`)
- Sub-components to move under `components/`
- Feature-local types for `interfaces.ts` (import shared domain types from `src/interfaces.ts`)
- All import sites that must be updated (`App.tsx`, routes, other features)

Print a short migration plan before editing.

### 2. Migrate one feature at a time

For each non-feature-based area:

1. Create `src/features/<feature-name>/`.
2. Add `interfaces.ts` with feature-local props/types; import shared types from `src/interfaces.ts`.
3. Move the page/container to `<FeatureName>Page.tsx` in the feature root.
4. Move dedicated sub-components into `components/`.
5. Move feature-specific hooks, utils, workers, and CSS into the feature folder.
6. Add `index.tsx` barrel:

```tsx
export { default } from "./CompaniesPage";
export { default as CompaniesPage } from "./CompaniesPage";
```

7. Update all external imports to use the barrel path.
8. Remove the old files under `src/pages/` or `src/components/` once nothing references them.

### 3. Clean up

- Remove migrated files from `src/pages/`, `src/components/`, and other legacy locations once nothing references them.
- Remove orphaned components from `src/components/` only when fully moved or unused.
- Fix broken relative imports and CSS import paths.
- Ensure `App.tsx` and routing import from feature barrels.
- **If `--delete-empty` / `delete-empty` was passed:** scan legacy folders (`src/pages/`, `src/components/`, `src/hooks/`, `src/utils/`) and delete any that are empty after migration. Report each deleted folder in the summary.
- **If the flag was not passed:** do not delete empty directories — only remove the migrated files.

### 4. Verify

- No remaining imports from migrated `src/pages/` paths.
- No deep imports into `src/features/<name>/<Container>.tsx` from outside that feature.
- Existing `src/features/*` folders are unchanged (hybrid case).
- App builds without TypeScript errors.

## Checklist (per converted feature)

- [ ] `src/features/<feature-name>/` created
- [ ] Container at feature root (`<FeatureName>Page.tsx`)
- [ ] Feature-local `interfaces.ts` (shared domain types imported, not duplicated)
- [ ] Sub-components under `components/`
- [ ] `index.tsx` exports the public entry
- [ ] `App.tsx` / routes import from the feature barrel
- [ ] Old flat files removed
- [ ] Empty legacy folders deleted (only when `--delete-empty` / `delete-empty` was passed)

## Output

When finished, summarize:

1. Input folder used
2. Whether `--delete-empty` was enabled
3. Features already compliant (skipped)
4. Features migrated (old path → new path)
5. Empty folders deleted (if `--delete-empty` was used), or empty folders left in place
6. Files left in shared locations and why
7. Any manual follow-up (e.g. ambiguous shared components)
