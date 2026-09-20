# Library Management System — Specification

Pre-conditions, post-conditions, and error contracts for every public method.

---

## Book

**Fields:** `title`, `author`, `isbn`, `totalCopies`, `availableCopies`

### `constructor(title, author, isbn, totalCopies)`

- **Pre:**
  - `title` is a non-empty string.
  - `author` is a non-empty string.
  - `isbn` is a non-empty string.
  - `totalCopies` is an integer > 0.
- **Post:**
  - `availableCopies` is set equal to `totalCopies`.
- **Throws:** `InvalidBookDataError` if any pre-condition is violated.

### `borrowCopy()`

- **Pre:**
  - `availableCopies > 0`.
- **Post:**
  - `availableCopies` is decremented by 1.
- **Throws:** `BookNotAvailableError` if `availableCopies` is 0.

### `returnCopy()`

- **Pre:**
  - `availableCopies < totalCopies`.
- **Post:**
  - `availableCopies` is incremented by 1.
- **Throws:** N/A (caller must guarantee the pre-condition via Loan validation).

### `matches(searchTerm)`

- **Pre:** None.
- **Post:**
  - Returns `true` if `title` or `author` contains `searchTerm` (case-insensitive substring match).
  - Returns `false` otherwise.

---

## Member

**Fields:** `name`, `memberId`

### `constructor(name, memberId)`

- **Pre:**
  - `name` is a non-empty string.
  - `memberId` is a non-empty string.
- **Post:**
  - `name` and `memberId` are stored.
- **Throws:** `InvalidMemberDataError` if any pre-condition is violated.

---

## Loan

**Fields:** `book`, `member`, `borrowDate`, `dueDate`, `returnDate` (null until returned)

### `constructor(book, member, borrowDate, clock)`

- **Pre:** None (validation is delegated to `LibraryService`).
- **Post:**
  - `book`, `member`, `borrowDate` are stored.
  - `dueDate` is set to `borrowDate + 14 days`.
  - `returnDate` is `null`.

### `markReturned(returnDate)`

- **Pre:**
  - `returnDate` is currently `null` (loan has not already been returned).
- **Post:**
  - `returnDate` is set to the provided value.
- **Throws:** Error if `returnDate` is already set (loan already returned).

### `isOverdue(asOfDate)`

- **Pre:** None.
- **Post:**
  - Returns `true` if `returnDate` is `null` AND `asOfDate > dueDate`.
  - Returns `false` otherwise.

### `calculateLateFee(asOfDate, feePerDay = 0.5)`

- **Pre:** None.
- **Post:**
  - If not returned or not late (`asOfDate <= dueDate`): returns `0`.
  - Otherwise: returns `(daysBetween(dueDate, asOfDate)) × feePerDay`.

---

## Clock

**Interface seam for time injection — replaces direct `new Date()` calls.**

### `SystemClock.now()`

- **Production implementation.**
- **Post:** Returns `new Date()`.

### `FakeClock.now()`

- **Test-double implementation.**
- **Constructor:** Accepts a fixed `Date` (or timestamp).
- **Post:** Returns the injected fixed date every time.
- **Mutation:** `set(date)` advances the clock to a new fixed date for subsequent calls.

---

## LibraryService

Orchestrator class. All public methods delegate to internal helpers.
Internal helpers are listed in parentheses after each public method.

### `addBook(title, author, isbn, totalCopies)`

- **Pre:**
  - Delegates validation to `Book` constructor.
  - `isbn` must not already exist in the catalog.
- **Post:**
  - A new `Book` is created and added to the catalog.
- **Throws:** `InvalidBookDataError` (from Book), `DuplicateIsbnError` if ISBN already exists.

### `searchCatalog(searchTerm)`

- **Pre:** None.
- **Post:**
  - Returns an array of `Book` instances where `book.matches(searchTerm)` is `true`.
  - Returns an empty array if no matches.

### `registerMember(name, memberId)`

- **Pre:**
  - Delegates validation to `Member` constructor.
  - `memberId` must not already be registered.
- **Post:**
  - A new `Member` is created and stored.
- **Throws:** `InvalidMemberDataError` (from Member), `DuplicateMemberError` if memberId already exists.

### `borrowBook(isbn, memberId)`

Decomposed internally into: `findBookOrThrow`, `findMemberOrThrow`, `assertAvailable`, `createLoan`.

- **Pre:**
  - A book with the given `isbn` exists in the catalog.
  - A member with the given `memberId` is registered.
  - The book has `availableCopies > 0`.
- **Post:**
  - A new `Loan` is created linking the book and member.
  - The book's `availableCopies` is decremented by 1.
  - The current date (from `Clock.now()`) is used as `borrowDate`.
- **Throws:** `BookNotFoundError`, `MemberNotFoundError`, `BookNotAvailableError`.

### `returnBook(isbn, memberId)`

Decomposed internally into: `findActiveLoanOrThrow`, `applyLateFee`, `closeLoan`.

- **Pre:**
  - An active (unreturned) `Loan` exists for the given `isbn` and `memberId`.
- **Post:**
  - The loan's `returnDate` is set to today (via `Clock.now()`).
  - If the loan is overdue, a late fee is calculated and applied (via `Loan.calculateLateFee`).
  - The book's `availableCopies` is incremented by 1 (via `Book.returnCopy`).
- **Throws:** `ActiveLoanNotFoundError` if no active loan matches.

### `listOverdueLoans(asOfDate)`

- **Pre:** None.
- **Post:**
  - Returns an array of `Loan` instances where `loan.isOverdue(asOfDate)` is `true`.
  - Returns an empty array if none are overdue.
