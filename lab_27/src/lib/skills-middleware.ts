import path from "path";
import {
  FilesystemBackend,
  createFilesystemMiddleware,
  createSkillsMiddleware,
} from "deepagents";

/**
 * Shared filesystem + skills middleware for createAgent.
 *
 * Skills live under ./skills as Agent Skills directories (SKILL.md + frontmatter).
 * Paths passed to createSkillsMiddleware are virtual POSIX paths relative to
 * the FilesystemBackend root (project cwd) when virtualMode is true.
 */
export function createSkillsAwareMiddleware(skillSources: string[]) {
  const backend = new FilesystemBackend({
    rootDir: process.cwd(),
    virtualMode: true,
  });

  return {
    backend,
    skillsRoot: path.join(process.cwd(), "skills"),
    middleware: [
      createSkillsMiddleware({
        backend,
        sources: skillSources,
      }),
      createFilesystemMiddleware({
        backend,
        // Skills need read/list tools; keep the surface small for this lab.
        tools: ["read_file", "ls", "glob"],
      }),
    ],
  };
}
