---
name: check-npm-deprecated
description: >-
  Check whether an npm package is deprecated by querying the npm registry.
  Returns the deprecation notice (if any) plus the latest version number.
---

# check-npm-deprecated

## Overview

Determine if an npm package is deprecated by calling the public npm registry API.

## Instructions

1. Receive the package name from the user.
2. Invoke the `check_npm_deprecated` tool with the package name.
3. Report whether the package is deprecated.
4. If deprecated, include the deprecation message in the answer.
5. Always include the latest version number for context.
6. If the package does not exist on npm, report that clearly.

## Output format

A single short paragraph:
- State clearly if the package is deprecated or not.
- If deprecated, quote the deprecation notice.
- End with the latest published version.
