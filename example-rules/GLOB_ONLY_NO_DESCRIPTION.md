---
name: GLOB_ONLY_NO_DESCRIPTION
globs:
  - 'src/specific-module/**/*.js'
---

# Glob Rule: Specific JS Module

This rule applies to JavaScript files within `src/specific-module/`.
It has globs defined but no `description`, so it should only be loaded via `ListGlobRules` when relevant files are active, not by `ListAgentRequestedRules`.
