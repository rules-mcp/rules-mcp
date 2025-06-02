---
name: GLOB_TEST_FILE_CONVENTIONS
globs:
  - '**/*.test.ts'
  - '**/*.spec.ts'
  - '**/*.test.js'
  - '**/*.spec.js'
description: 'Conventions for writing unit and integration test files. Includes naming, structure, and assertion style guides.'
---

# Glob Rule: Test File Conventions

- Test files should be co-located with the source files or in a `__tests__` directory.
- Test function names should clearly describe what they are testing.
- Use a consistent assertion library (e.g., Jest's `expect`).
- Each test should be independent.
