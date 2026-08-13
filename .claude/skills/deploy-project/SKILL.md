---
name: deploy-project
description: Build a Docker image for a given project directory - writes a Dockerfile into that project path if one doesn't already exist, then runs `docker build` with a derived tag. Use when the user asks to deploy, dockerize, containerize, or build a docker image for a specific project/lab folder.
---

# Deploy Project

Builds a Docker image for a single project directory. This skill only **builds** the
image locally — it never pushes to a registry and never runs `docker run` /
`docker-compose up`, unless the user explicitly asks for that as a separate step.

## Input

The **project path** is required and must come from the user's invocation (e.g.
`/deploy-project lab_36_authentication_jwt_api` or a full/relative path). If no path
was given in `args`, Abort the operation and write `MISSING_FOLDER_PATH`.

## Steps

1. **Resolve and validate the path.**
   - Resolve the given path relative to the current working directory if it isn't absolute.
   - Confirm it exists and is a directory (`ls -ld <path>`). If not, stop and tell the user.

2. **Detect the stack** by inspecting the project directory (don't assume — read what's there):
   - `package.json` present → Node.js/TypeScript project. Check for a `build` script (e.g.
     `tsc`, produces `dist/`) and a `start` script to know the run command.
   - Look for a `client/` subdirectory with its own `package.json` (a separate Vite/React
     frontend, as seen in this workspace's labs) — if present, ask the user whether the
     Dockerfile should cover just the API, just the client, or both (default: whichever one
     the given project path points at).
   - Note any existing `Dockerfile`, `.dockerignore`, or `docker-compose.yml` already in the
     project path before generating anything.

3. **Write the Dockerfile.**
   - If a `Dockerfile` already exists at `<path>/Dockerfile`, do not overwrite it silently —
     show the user the existing file and ask before replacing it.
   - Otherwise generate a multi-stage Dockerfile appropriate to the detected stack. For a
     Node/TypeScript API (the common case in this workspace), use this shape:

     ```dockerfile
     FROM node:20-alpine AS builder
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci
     COPY . .
     RUN npm run build

     FROM node:20-alpine AS runtime
     WORKDIR /app
     ENV NODE_ENV=production
     COPY package*.json ./
     RUN npm ci --omit=dev
     COPY --from=builder /app/dist ./dist
     EXPOSE 4000
     CMD ["node", "dist/server.js"]
     ```

     Adjust `EXPOSE`/`CMD`/build output paths to match what's actually in the project's
     `package.json` scripts and `tsconfig.json` `outDir` — don't hardcode values that
     contradict what you found in step 2.

   - Also add a `.dockerignore` (node_modules, dist, .env, .git) if one doesn't already exist,
     to keep the build context small.

4. **Derive the image tag.**
   - Base name: the project directory's basename, lowercased, with underscores turned into
     hyphens (Docker tags reject `_`... actually underscores are allowed, but keep it simple
     and consistent: lowercase, hyphen-separated).
   - Version part: prefer the short git SHA of the current commit if the path is inside a git
     repo (`git -C <path> rev-parse --short HEAD`); fall back to `latest` if there's no commit
     yet (e.g. untracked new project).
   - Tag will be taken from Package.json version, always increase the tag version of the package.json and then use the new tag for the docker (always increment patch version).

5. **Build the image.**
   - Run `docker build -t <tag> <path>` from the resolved project path.
   - Stream the build output back to the user; on failure, show the relevant error rather than
     just "build failed."

6. **Report.**
   - On success, state the final image tag and remind the user this only built the image
     locally (no push, no container started).

## Notes

- This is a local, reversible action (an image build), so proceed without asking for
  confirmation before running `docker build` itself — but do ask before overwriting an
  existing Dockerfile, since that's user-authored content.
- Never add registry push commands (`docker push`), deployment to a remote host, or
  `docker run` unless the user explicitly asks for those as a next step — this skill's scope
  is "build a tagged image," nothing more.
