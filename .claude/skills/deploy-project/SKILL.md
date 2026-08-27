---
name: deploy-project
description: Build a Docker image for a given project directory - writes a Dockerfile into that project path if one doesn't already exist, runs the project's tests inside the Docker build (skipping that stage if there is no `test` script), builds a tagged image, and pushes it to Docker Hub under the doctordocker88 account. Use when the user asks to deploy, dockerize, containerize, or build/push a docker image for a specific project/lab folder.
---

# Deploy Project

Builds a Docker image for a single project directory, running the project's tests as a
build stage so a failing test blocks the image from being produced, then pushes the
resulting image to Docker Hub under the `doctordocker88` account. It never runs
`docker run` / `docker-compose up` on the local machine unless the user explicitly asks
for that as a separate step. The one exception is the `lab_35_MCP` project: step 8
runs `docker compose up -d` on its remote deployment host via a browser console, as
part of this skill's default flow for that project only.

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
   - Check whether `package.json` has a `test` script (`.scripts.test`) and whether it's a
     real command (npm's default placeholder is `echo "Error: no test specified" && exit 1`,
     which must be treated as "no tests", not a passing test). This determines whether the
     Dockerfile gets a test stage in step 3.
   - Look for a `client/` subdirectory with its own `package.json` (a separate Vite/React
     frontend, as seen in this workspace's labs) — if present, ask the user whether the
     Dockerfile should cover just the API, just the client, or both (default: whichever one
     the given project path points at).
   - Note any existing `Dockerfile`, `.dockerignore`, or `docker-compose.yml` already in the
     project path before generating anything.

3. **Write the Dockerfile.**
   - If a `Dockerfile` already exists at `<path>/Dockerfile`, do not overwrite it silently —
     show the user the existing file and ask before replacing it.
   - Otherwise generate a multi-stage Dockerfile appropriate to the detected stack, with a
     dedicated **test stage** that later stages depend on via `FROM test AS ...` — this is
     what makes a failing `RUN npm test` abort the build before an image is produced. Only
     include the test stage if step 2 found a real `test` script; if there is none, drop the
     `test` stage entirely and chain `builder`/`runtime` straight off `deps`.

     With a test script present, for a Node/TypeScript API (the common case in this
     workspace), use this shape:

     ```dockerfile
     FROM node:20-alpine AS deps
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci

     FROM deps AS test
     COPY . .
     RUN npm test

     FROM test AS builder
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

     Without a test script, drop the `test` stage:

     ```dockerfile
     FROM node:20-alpine AS deps
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci

     FROM deps AS builder
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

     For a plain JS project with no `build` script (no `dist/` output), collapse `builder`
     into `runtime` but keep the same principle: if there's a `test` script, a `test` stage
     runs `npm test` and `runtime` is declared `FROM test` (after installing full deps) so
     tests execute before the image is finalized; if there's no `test` script, `runtime`
     installs deps and copies source directly, no test stage involved.

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

5. **Build the image (tests run as part of this).**
   - Always target `linux/amd64` explicitly, regardless of the host machine's own
     architecture (e.g. an Apple Silicon/M1 Mac build defaults to `arm64`, which will not run
     on a standard x86_64 EC2 instance or most other Linux hosts). Use buildx with `--load` so
     the image lands in the local Docker image store for the push step:
     `docker buildx build --platform linux/amd64 -t <tag> --load <path>`.
   - If the target deployment host is known to be ARM-based (e.g. AWS Graviton), ask the user
     before overriding the platform — otherwise default to `linux/amd64` for broadest
     compatibility.
   - Stream the build output back to the user. If the `test` stage's `RUN npm test` fails,
     the whole `docker build` fails at that step — no image is produced. Report that failure
     as "tests failed" (show the test output), not a generic build error, and stop here: do
     not proceed to push. On any other build failure, show the relevant error rather than
     just "build failed."

6. **Push to Docker Hub.**
   - The target repository is always under the `doctordocker88` account:
     `doctordocker88/<image-name>:<tag>` (same `<image-name>:<tag>` derived in step 4).
   - Check whether Docker is already authenticated as `doctordocker88` (e.g. `docker info` /
     `~/.docker/config.json` auths). If not logged in, do not attempt to run `docker login`
     with a password yourself — ask the user to run it interactively (suggest
     `! docker login -u doctordocker88`) since credentials must never be typed into or
     stored by the agent. Wait for confirmation before continuing.
   - Tag the locally built image for the registry: `docker tag <tag> doctordocker88/<tag>`.
   - Push it: `docker push doctordocker88/<tag>`.
   - Stream push output back to the user; on failure (auth, network, denied), show the actual
     error.

7. **Report.**
   - On success, state the local image tag, the pushed Docker Hub reference
     (`doctordocker88/<image-name>:<tag>`), and confirm tests passed (or that no `test` script
     existed, so the stage was skipped).

8. **Deploy the new image on the remote host via its browser console.**
   - This step only applies to the `lab_35_MCP` project (the MCP server). For any other
     project path, skip this step entirely.
   - Load the `claude-in-chrome` tools if not already loaded (`tabs_context_mcp`, `navigate`,
     `computer`, `read_page`, `tabs_create_mcp`).
   - Navigate to `http://108.131.138.177:5000/` — a browser-based console/terminal into the
     deployment host.
   - From the `/mcp-server` folder on that host, run the pulled image at the exact `<TAG>`
     derived in step 4 (the just-incremented `package.json` version):
     ```
     sudo MCP_VERSION=<TAG> docker compose up -d
     ```
   - Read the console output back and confirm the `mcp-server` container reports as started
     (and healthy, once its healthcheck's `start_period` has elapsed) before reporting success.
     If the command fails or the container doesn't come up, show the actual console output —
     do not report success on a guess.

## Notes

- This is a local, reversible action up through the build (an image build), so proceed
  without asking for confirmation before running `docker build` itself — but do ask before
  overwriting an existing Dockerfile, since that's user-authored content.
- The Docker Hub push (step 6) is a remote, shared-state action and is now part of this
  skill's default flow — but never handle `doctordocker88` credentials directly (no
  passwords/tokens in commands, files, or Dockerfiles); if the session isn't already
  authenticated, stop and have the user log in themselves.
- Never run `docker run` / `docker-compose up` locally, or push to any other registry/account,
  unless the user explicitly asks for that as a separate step.
- A failing test stage must hard-block both the image build and the push — never fall back to
  building or pushing an image whose tests failed. It must also block step 8: never bring up
  the remote host on an image whose tests failed.
- Step 8 (remote deploy via browser console) runs `sudo docker compose up -d` on a live,
  shared host (`54.229.23.161`) — it is scoped to the `lab_35_MCP` project only. Do not
  generalize it to other projects or other hosts without the user explicitly asking.
