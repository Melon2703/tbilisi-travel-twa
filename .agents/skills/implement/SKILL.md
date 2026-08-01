---
name: implement
description: "Implement a piece of work based on a spec or set of tickets, including visual UI verification."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

1. **Test-Driven Development**: Use /tdd where possible, at pre-agreed seams.
2. **Type & Test Checks**: Run typechecking regularly, single test files regularly, and the full test suite once code is ready.
3. **Visual UI Verification**: If any UI/frontend components were modified:
   - Perform visual verification using Chrome DevTools MCP following [VISUAL_VERIFICATION.md](VISUAL_VERIFICATION.md).
   - Audit visual rendered output against [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md).
4. **Code Review**: Once tests and visual verification pass, use /code-review to review the work.
5. **Commit**: Commit your work to the current branch.
