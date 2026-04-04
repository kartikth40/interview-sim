---
inclusion: always
---

# Tech Stack

- Runtime: Node.js (ES Modules — `"type": "module"` in package.json)
- Language: JavaScript (no TypeScript)
- Test framework: Vitest v4
- Property-based testing: fast-check v4
- No build step — source files run directly

# Common Commands

| Task | Command |
|------|---------|
| Run all tests | `npx vitest --run` |
| Run tests in watch mode | `npx vitest` |
| Run a specific test file | `npx vitest --run src/interview-utils.test.js` |

# Conventions

- Use ES module syntax (`import`/`export`) — no CommonJS (`require`/`module.exports`)
- Use `===` strict equality (never `==`)
- Declare all variables with `const` or `let` (never undeclared or `var`)
- Functions are exported via a named export block at the bottom of the file
- JSDoc comments on every exported function, including `@param` and `@returns`
- JSDoc includes a "Validates:" line referencing requirement and design property IDs
