# Submission Checklist

Evidence-based checklist against assignment requirements. Status is derived from the actual repository state.

---

## Phase 1: OOP / Design

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1.1 | Encapsulated classes with private fields | COMPLETE | All model classes use `#` private fields (`src/models/Book.js`, `Member.js`, `Loan.js`). |
| 1.2 | Book class with title, author, isbn, totalCopies, availableCopies | COMPLETE | `src/models/Book.js` — 5 private fields, getters, borrowCopy/returnCopy. |
| 1.3 | Member class with name, memberId | COMPLETE | `src/models/Member.js` — 2 private fields, getters. |
| 1.4 | Loan class with book, member, borrowDate, dueDate, returnDate, lateFee | COMPLETE | `src/models/Loan.js` — 6 private fields, 14-day due date, late-fee calculation. |
| 1.5 | LibraryService orchestrator with addBook, searchCatalog, registerMember, borrowBook, returnBook, listOverdueLoans | COMPLETE | `src/services/LibraryService.js` — 6 public methods, decomposed into private helpers. |
| 1.6 | Clock abstraction (SystemClock/FakeClock) | COMPLETE | `src/services/Clock.js` — SystemClock for production, FakeClock for tests. |
| 1.7 | Custom exception hierarchy | COMPLETE | `src/errors/` — `LibraryError` base + 8 subclasses, all in index.js barrel export. |
| 1.8 | Defensive pre-condition validation | COMPLETE | Book and Member constructors throw on invalid input. Service checks duplicates and existence. |
| 1.9 | Decomposed service (not monolithic) | COMPLETE | `borrowBook` uses `#findBookOrThrow`, `#findMemberOrThrow`, `#assertAvailable`, `#createLoan`. `returnBook` uses `#findActiveLoanOrThrow`, `#applyLateFee`, `#closeLoan`. |

---

## Phase 2: Git Workflow

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 2.1 | Feature branches used | COMPLETE | `feature/book-catalog`, `feature/testing`, `feature/late-fee-tdd`, `feature/refactor` all exist. |
| 2.2 | Pull requests for merging | COMPLETE | PR #1 (`feature/book-catalog` → `main`), PR #2 (`feature/testing` → `main`) visible in `git log --graph`. |
| 2.3 | Meaningful commit messages | COMPLETE | All commits use conventional format: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`. |
| 2.4 | Multiple commits showing incremental development | COMPLETE | 18 commits across the history showing scaffold → implementation → testing → refactoring. |

---

## Phase 3: Linting / Refactoring

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 3.1 | ESLint configured | COMPLETE | `package.json` devDependency `@eslint/js` + `eslint`. `npm run lint` script runs `eslint src/`. |
| 3.2 | ESLint passes with zero errors | COMPLETE | `npm run lint` exits cleanly. |
| 3.3 | Refactoring performed | COMPLETE | 3 documented refactorings in `docs/refactoring-log.md` with commit hashes. |
| 3.4 | Refactoring did not change behavior | COMPLETE | All 97 tests pass after each refactoring commit. |

---

## Phase 4: Testing / TDD / Coverage

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 4.1 | Jest test suite | COMPLETE | 4 test files in `test/`: `Book.test.js`, `Member.test.js`, `Loan.test.js`, `LibraryService.test.js`. |
| 4.2 | Tests cover valid and invalid inputs | COMPLETE | Tests cover construction, boundary values, error paths, and integration. |
| 4.3 | Tests use FakeClock (deterministic) | COMPLETE | `Loan.test.js` and `LibraryService.test.js` use `FakeClock` for all date-dependent tests. |
| 4.4 | Coverage ≥ 80% | COMPLETE | 99.24% statements, 100% branches, 98% functions, 99.2% lines. |
| 4.5 | TDD cycles for late-fee feature | PARTIAL | Git history shows red/green/refactor commit patterns on `feature/late-fee-tdd`. The commits include `test: red - late fee on due date` and `test: red - same-day return has no late fee` followed by implementation and refactoring commits. However, the history does not contain three cleanly separated, explicitly named red-green-refactor triplets — some cycles share commits or have intermediate fixes. |
| 4.6 | Tests do not modify production code | COMPLETE | Test files only import from `src/`. No test writes to production files. |

---

## Documentation / Deliverables

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 5.1 | README.md | COMPLETE | Project overview, install, run, test, lint, architecture, coverage, Git workflow. |
| 5.2 | Method specifications (specs.md) | COMPLETE | All public methods documented with pre/post conditions, parameters, exceptions. |
| 5.3 | Class diagram | COMPLETE | `docs/class-diagram.md` — Mermaid diagram + text fallback, relationships, design notes. |
| 5.4 | Refactoring log | COMPLETE | `docs/refactoring-log.md` — 3 entries with smell, technique, before/after, commit hash. |

---

## Incomplete Items

| Item | Reason |
|---|---|
| 4.5 TDD cycles (partial) | The Git history shows red/test-first commits but the three cycles are not cleanly separated into three distinct red→green→refactor triplets. Some test additions and implementation fixes are interleaved. This is honest documentation of the actual development process. |
