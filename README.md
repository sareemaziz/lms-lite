# LMS-Lite

A lightweight Library Management System for a small campus library. The system tracks books, members, and borrowing operations. It is built as a construction-quality exercise demonstrating encapsulated OOP, defensive programming, a custom exception hierarchy, clock injection for deterministic testing, and a decomposed service layer — all verified by a comprehensive Jest test suite.

## Objectives

- Model a library domain with `Book`, `Member`, and `Loan` entities.
- Enforce pre-conditions and post-conditions at class boundaries.
- Provide a service layer (`LibraryService`) that orchestrates domain operations.
- Use a clock abstraction (`SystemClock`/`FakeClock`) to make date-dependent logic testable.
- Maintain full encapsulation using JavaScript private fields (`#`).
- Achieve high test coverage with deterministic, focused unit tests.

## Technologies

| Tool | Purpose |
|---|---|
| Node.js (ESM) | Runtime (`"type": "module"`) |
| Jest 30 | Unit testing with native ES module support |
| ESLint 10 | Static analysis |
| ES2022+ | Private class fields (`#`), `Number.isInteger`, `Array.filter` |

## Architecture

The system follows a layered architecture:

```
CLI Demo (src/cli/index.js)
        │
        ▼
LibraryService (orchestrator)
        │
   ┌────┴────┐
   ▼         ▼
 Book      Member      Loan (domain entities)
   │                   │
   └───── errors ──────┘
```

### Classes

| Class | Responsibility |
|---|---|
| **Book** | Encapsulates book data with copy-tracking (`borrowCopy`/`returnCopy`) and search (`matches`). |
| **Member** | Encapsulates member identity with validation. |
| **Loan** | Tracks a borrowing relationship: due-date calculation, overdue detection, and late-fee calculation. |
| **LibraryService** | Orchestrator — delegates to private helpers for lookup, validation, loan creation, and return processing. |
| **SystemClock** | Production clock — `now()` returns `new Date()`. |
| **FakeClock** | Test double — `now()` returns an injected fixed date; `setNow(date)` advances it. |
| **LibraryError** | Base class for all custom exceptions. Eight subclasses cover distinct error conditions. |

### Custom Exceptions

All exceptions extend `LibraryError` (which extends `Error`):

`InvalidBookDataError`, `InvalidMemberDataError`, `BookNotAvailableError`, `BookNotFoundError`, `MemberNotFoundError`, `LoanNotFoundError`, `DuplicateIsbnError`, `DuplicateMemberError`

### Clock Abstraction

`LibraryService` accepts a clock object via constructor injection. In production, `SystemClock` provides real time. In tests, `FakeClock` returns a fixed date, making all date-dependent logic (due dates, overdue checks, late fees) fully deterministic.

## Core Functionality

| Operation | Description |
|---|---|
| Add book | Validates input, creates a `Book`, checks for duplicate ISBN. |
| Search catalog | Case-insensitive substring match across title and author. |
| Register member | Validates input, creates a `Member`, checks for duplicate ID. |
| Borrow book | Validates book exists, member exists, and copies are available. Creates a `Loan` with a 14-day due date. |
| Return book | Calculates and stores late fee, marks loan as returned, restores the book copy. |
| List overdue loans | Filters active loans by a given date. |

### Late Fee

- $0.50 per day after the due date.
- Returning on or before the due date results in a fee of $0.
- Same-day borrow-and-return always yields $0 (never negative).
- The fee is stored on the `Loan` via `setLateFee()` during `returnBook`.

## Validation and Error Handling

All model constructors validate their inputs and throw domain-specific exceptions:

- **Book**: title/author/isbn must be non-empty strings; totalCopies must be a positive integer.
- **Member**: name/memberId must be non-empty strings.
- **LibraryService**: checks for duplicate ISBNs, duplicate member IDs, missing books/members, and unavailable copies.

## Project Structure

```
lms-lite/
├── src/
│   ├── models/
│   │   ├── Book.js
│   │   ├── Member.js
│   │   └── Loan.js
│   ├── services/
│   │   ├── LibraryService.js
│   │   └── Clock.js
│   ├── errors/
│   │   ├── index.js
│   │   ├── LibraryError.js
│   │   ├── InvalidBookDataError.js
│   │   ├── InvalidMemberDataError.js
│   │   ├── BookNotAvailableError.js
│   │   ├── BookNotFoundError.js
│   │   ├── MemberNotFoundError.js
│   │   ├── LoanNotFoundError.js
│   │   ├── DuplicateIsbnError.js
│   │   └── DuplicateMemberError.js
│   └── cli/
│       └── index.js
├── test/
│   ├── Book.test.js
│   ├── Member.test.js
│   ├── Loan.test.js
│   └── LibraryService.test.js
├── docs/
│   ├── specs.md
│   ├── class-diagram.md
│   └── refactoring-log.md
├── package.json
└── README.md
```

## Getting Started

### Install

```bash
npm install
```

### Run the demo

```bash
node src/cli/index.js
```

### Run tests

```bash
npm test
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Lint

```bash
npm run lint
```

## Testing Strategy

- **Framework:** Jest 30 with native ES module support (`--experimental-vm-modules`).
- **Determinism:** All tests use `FakeClock` to control the system clock. No test depends on real time.
- **Isolation:** Each test sets up its own `LibraryService` instance. Tests do not share state.
- **Coverage:** One test file per production class. Tests cover valid construction, boundary values, error paths, and integration through `LibraryService`.

### Coverage

```
All files          | 99.24% Stmts | 100% Branch | 98% Funcs | 99.2% Lines
 errors (9 files)  | 100%         | 100%        | 100%      | 100%
 models (3 files)  | 100%         | 100%        | 100%      | 100%
 services (2 files)| 98.24%       | 100%        | 94.44%    | 98.03%
```

- 4 test suites, 97 tests, all passing.
- Uncovered lines: `SystemClock.now()` (production clock not used in tests) and `errors/index.js` (barrel re-export, no logic).

## Git Workflow

| Branch | Purpose |
|---|---|
| `main` | Stable, merged via pull requests. |
| `feature/book-catalog` | Initial implementation: errors, Book, Member, Loan, Clock, LibraryService, CLI demo. |
| `feature/testing` | Jest test suite added. |
| `feature/late-fee-tdd` | Late-fee TDD cycles: stored fee, calculation boundary, same-day regression. |
| `feature/refactor` | Late-fee refactoring: constant naming, conditional merging, clock-read extraction. |

Pull requests were used to merge `feature/book-catalog` and `feature/testing` into `main`. The late-fee and refactor branches are in-progress feature branches.

## Design Highlights

- **Full encapsulation:** All model state uses JavaScript `#` private fields. No direct property access from outside the class.
- **Defensive programming:** Constructors validate all inputs and throw descriptive custom exceptions.
- **Clock injection:** `LibraryService` receives a clock via its constructor. This is the single test-double seam that makes all date logic deterministic in tests.
- **Decomposed service layer:** `LibraryService.borrowBook` and `returnBook` are broken into named private helpers (`#findBookOrThrow`, `#assertAvailable`, `#createLoan`, etc.) rather than being monolithic methods.
- **Single source of truth for late fees:** `calculateLateFee` computes the fee; `setLateFee` stores it; `getLateFee` exposes it. The computation and storage are separated.
