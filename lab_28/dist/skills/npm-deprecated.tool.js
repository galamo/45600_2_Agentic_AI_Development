import { tool } from "@langchain/core/tools";
import { z } from "zod";
async function fetchNpmLatest(packageName) {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`;
    const res = await fetch(url);
    if (res.status === 404) {
        return { error: `Package "${packageName}" not found on npm registry.` };
    }
    if (!res.ok) {
        return { error: `npm registry returned HTTP ${res.status} for "${packageName}".` };
    }
    return res.json();
}
export const checkNpmDeprecatedTool = tool(async ({ packageName }) => {
    const data = await fetchNpmLatest(packageName);
    if (data.error)
        return data.error;
    const version = data.version ?? "unknown";
    if (data.deprecated) {
        return [
            `Package "${packageName}" IS DEPRECATED (latest: ${version}).`,
            `Deprecation notice: ${data.deprecated}`,
        ].join("\n");
    }
    return `Package "${packageName}" is NOT deprecated. Latest version: ${version}.`;
}, {
    name: "check_npm_deprecated",
    description: "Check if an npm package is deprecated by querying the public npm registry. " +
        "Returns the deprecation notice and latest version number.",
    schema: z.object({
        packageName: z
            .string()
            .min(1)
            .describe("The exact npm package name to check (e.g. 'lodash', 'request')"),
    }),
});
