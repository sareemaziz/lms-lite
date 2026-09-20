# Report Outline

A structured outline for the final 4–6 page assignment report. Each section contains concise factual content drawn from this repository.

---

## 1. Introduction (0.5 page)

- LMS-Lite is a library management system for tracking books, members, and borrowing at a small campus library.
- Built as a JavaScript/Node.js application using ES modules and ES2022+ private class fields.
- The project demonstrates OOP design, defensive programming, test-driven development, and Git feature-branch workflow.
- Key technologies: Node.js, Jest 30, ESLint 10.

## 2. System Overview (0.5 page)

- Three domain entities: `Book`, `Member`, `Loan`.
- One service orchestrator: `LibraryService`.
- One test-double seam: `SystemClock`/`FakeClock`.
- One exception hierarchy: `LibraryError` with 8 subclasses.
- The service layer delegates to private helper methods for each step of complex operations (borrow, return).
- The clock abstraction replaces `new Date()` calls, making date-dependent logic injectable and testable.

## 3. Requirements and Specifications (0.5 page)

- `docs/specs.md` defines pre-conditions, post-conditions, parameters, and exceptions for every public method.
- Validation rules: non-empty strings for names/identifiers, positive integers for copies, unique ISBNs and member IDs.
- Business rules: 14-day loan period, $0.50/day late fee, fee never negative.
- The specification was written before implementation and used as the contract for development.

## 4. Object-Oriented Design (1 page)

- **Encapsulation:** All model state uses `#` private fields. Access is through getters and specific mutation methods (`borrowCopy`, `returnCopy`, `markReturned`, `setLateFee`).
- **Single Responsibility:** Each class has a focused role — `Book` manages copies, `Loan` manages dates and fees, `LibraryService` orchestrates.
- **Dependency Injection:** `LibraryService` receives a clock via its constructor, not creating it internally. This enables `FakeClock` substitution in tests.
- **Defensive Boundaries:** Constructors validate all inputs and throw descriptive custom exceptions.
- **Decomposed Service:** `borrowBook` and `returnBook` are broken into named private helpers, each handling one concern (lookup, validation, creation, fee calculation, closure).

## 5. Class Diagram (0.5 page)

- Reference `docs/class-diagram.md` for the full Mermaid diagram.
- Key relationships: LibraryService → Book/Member (manages), LibraryService → Loan (creates), Loan → Book/Member (references), LibraryService → Clock (injection), all exceptions → LibraryError (inheritance).
- Text diagram included as fallback for non-Mermaid renderers.

## 6. Git Workflow (0.5 page)

- **Branches:** `main` (stable), `feature/book-catalog` (initial implementation), `feature/testing` (test suite), `feature/late-fee-tdd` (late-fee TDD), `feature/refactor` (refactoring).
- **Pull requests:** PR #1 merged `feature/book-catalog` into `main`. PR #2 merged `feature/testing` into `main`.
- **Commit convention:** Conventional commits — `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`.
- **Incremental development:** 18 commits showing scaffold → entities → service → CLI → tests → late-fee feature → refactoring.

## 7. Testing Strategy (0.5 page)

- **Framework:** Jest 30 with `--experimental-vm-modules` for native ESM support.
- **Structure:** One test file per production class (`Book.test.js`, `Member.test.js`, `Loan.test.js`, `LibraryService.test.js`).
- **Determinism:** All date-dependent tests use `FakeClock`. No test depends on the real system clock.
- **Isolation:** Each test creates its own `LibraryService` instance. No shared state between tests.
- **Scope:** Tests cover valid construction, boundary values (empty strings, zero copies, same-day return), error paths (duplicate ISBN, missing book, no available copies), and integration through the service layer.

## 8. TDD and Late-Fee Development (0.5 page)

- The late-fee feature was developed using test-first practices on the `feature/late-fee-tdd` branch.
- **Cycle 1 (stored fee):** Test defined that a newly created loan has `getLateFee() === 0` and that returning on the due date stores a fee of 0. Implementation added `#lateFee` field, `getLateFee()`, `setLateFee()`, and wired `#applyLateFee` to store the result.
- **Cycle 2 (boundary):** Test confirmed that returning exactly on the due date results in a stored fee of 0. This verified the existing `calculateLateFee` guard (`asOfDate <= dueDate`).
- **Cycle 3 (same-day regression):** Test confirmed that borrowing and returning on the same date yields `getLateFee() === 0`, never negative.
- Refactoring followed each cycle: constant naming, conditional merging, clock-read extraction.

## 9. Coverage (0.25 page)

- **97 tests, all passing.**
- **99.24% statements, 100% branches, 98% functions, 99.2% lines.**
- Uncovered: `SystemClock.now()` (production clock not exercised in tests), `errors/index.js` (barrel re-export, no logic).
- Coverage is maintained across all model, service, and error classes.

## 10. Linting and Refactoring (0.25 page)

- ESLint 10 configured with `@eslint/js`. `npm run lint` passes with zero errors.
- Three documented refactorings in `docs/refactoring-log.md`:
  1. Named constant for zero-fee value (`6319731`).
  2. Merged redundant conditional guards in `calculateLateFee` (`55a8d98`).
  3. Extracted single clock read in `returnBook` (`e027b81`).
- Each refactoring was verified by running the full test suite with no behavior change.

## 11. Refactoring Log (reference section)

- Full details in `docs/refactoring-log.md`.
- Each entry includes: smell, problem, technique, before/after code, benefit, and Git commit hash.

## 12. Results (0.25 page)

- All 6 core operations implemented and working: add book, search catalog, register member, borrow book, return book, list overdue loans.
- 97 unit tests passing.
- 99.24% statement coverage.
- Zero lint errors.
- Clean Git history with feature branches and pull requests.

## 13. Reflection (0.5 page)

- The clock injection seam was the most impactful design decision — it made all date logic testable without mocking `Date`.
- Decomposing `borrowBook` and `returnBook` into private helpers improved readability and made each step independently testable through the service layer.
- The custom exception hierarchy provided clear, catchable error types for each failure mode.
- TDD with FakeClock ensured late-fee boundary behavior was correct before implementation.
- Challenge: maintaining clean TDD cycles under time pressure; some cycles had intermediate fix commits.

## 14. Conclusion (0.25 page)

- LMS-Lite demonstrates practical OOP principles in a small but complete system.
- The combination of encapsulation, defensive validation, clock injection, and comprehensive testing produces a reliable, maintainable codebase.
- The Git workflow with feature branches and pull requests provided structured incremental development.
