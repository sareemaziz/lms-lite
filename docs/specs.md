# LMS-Lite — Method Specifications

Pre-conditions, post-conditions, and exception contracts for every public method.

---

## Book

**Private fields:** `#title`, `#author`, `#isbn`, `#totalCopies`, `#availableCopies`

### `constructor(title, author, isbn, totalCopies)`

| Aspect | Detail |
|---|---|
| **Purpose** | Create a new book entry with validated input. |
| **Parameters** | `title` (string), `author` (string), `isbn` (string), `totalCopies` (number) |
| **Pre** | `title`, `author`, `isbn` are non-empty strings (after `trim()`). `totalCopies` is an integer > 0. |
| **Post** | All fields stored. `availableCopies` equals `totalCopies`. |
| **Throws** | `InvalidBookDataError` if any pre-condition is violated. |

### `borrowCopy()`

| Aspect | Detail |
|---|---|
| **Purpose** | Record that one copy of this book has been borrowed. |
| **Pre** | `availableCopies > 0`. |
| **Post** | `availableCopies` decremented by 1. |
| **Throws** | `BookNotAvailableError` if `availableCopies` is 0. |

### `returnCopy()`

| Aspect | Detail |
|---|---|
| **Purpose** | Record that one copy has been returned. |
| **Pre** | None enforced (safe no-op if all copies already available). |
| **Post** | `availableCopies` incremented by 1, capped at `totalCopies`. |
| **Throws** | None. |

### `matches(searchTerm)`

| Aspect | Detail |
|---|---|
| **Purpose** | Check whether a search term appears in the title or author. |
| **Parameters** | `searchTerm` (string) |
| **Pre** | None. |
| **Post** | Returns `true` if `title` or `author` contains `searchTerm` (case-insensitive substring match). Empty string matches everything. |

### Getters

`getTitle()`, `getAuthor()`, `getIsbn()`, `getAvailableCopies()`, `getTotalCopies()` — return the corresponding private field value.

---

## Member

**Private fields:** `#name`, `#memberId`

### `constructor(name, memberId)`

| Aspect | Detail |
|---|---|
| **Purpose** | Create a new library member with validated input. |
| **Parameters** | `name` (string), `memberId` (string) |
| **Pre** | Both `name` and `memberId` are non-empty strings (after `trim()`). |
| **Post** | Both values stored (trimmed). |
| **Throws** | `InvalidMemberDataError` if any pre-condition is violated. |

### Getters

`getName()`, `getMemberId()` — return the corresponding private field value.

---

## Loan

**Private fields:** `#book`, `#member`, `#borrowDate`, `#dueDate`, `#returnDate`, `#lateFee`

### `constructor(book, member, borrowDate)`

| Aspect | Detail |
|---|---|
| **Purpose** | Create a loan record linking a book to a member. |
| **Parameters** | `book` (Book), `member` (Member), `borrowDate` (Date) |
| **Pre** | None (validation delegated to `LibraryService`). |
| **Post** | `book`, `member`, `borrowDate` stored. `dueDate` = `borrowDate + 14 days`. `returnDate` = `null`. `lateFee` = `0`. |

### `markReturned(returnDate)`

| Aspect | Detail |
|---|---|
| **Purpose** | Record that the loan has been returned. |
| **Parameters** | `returnDate` (Date) |
| **Pre** | `returnDate` is currently `null` (loan not yet returned). |
| **Post** | `returnDate` set to the provided value. |
| **Throws** | `Error("Loan has already been returned")` if called twice. |

### `isOverdue(asOfDate)`

| Aspect | Detail |
|---|---|
| **Purpose** | Determine whether a loan is currently overdue. |
| **Parameters** | `asOfDate` (Date) |
| **Pre** | None. |
| **Post** | Returns `true` if `returnDate` is `null` AND `asOfDate > dueDate`. Returns `false` otherwise. |

### `calculateLateFee(asOfDate, feePerDay = 0.5)`

| Aspect | Detail |
|---|---|
| **Purpose** | Calculate the late fee based on days overdue. |
| **Parameters** | `asOfDate` (Date), `feePerDay` (number, default `0.5`) |
| **Pre** | None. |
| **Post** | Returns `0` if the loan has been returned or if `asOfDate <= dueDate`. Otherwise returns `ceil(days overdue) × feePerDay`. Fee is never negative. |
| **Boundary** | Same-day return (asOfDate = borrowDate) always yields `0`. |

### `getLateFee()` / `setLateFee(fee)`

| Aspect | Detail |
|---|---|
| **Purpose** | Read/write the stored late fee. Set by `LibraryService` during return. |
| **Post** | `getLateFee()` returns the stored fee. `setLateFee(fee)` stores the value. |

### Getters

`getBook()`, `getMember()`, `getBorrowDate()`, `getDueDate()`, `getReturnDate()` — return the corresponding private field.

---

## Clock

Both classes implement the same duck-typed interface: `now() → Date`.

### `SystemClock`

| Method | Behavior |
|---|---|
| `now()` | Returns `new Date()` (real system time). |

### `FakeClock`

| Aspect | Detail |
|---|---|
| **Constructor** | `FakeClock(fixedDate)` — stores a Date as the fixed time. |
| `now()` | Returns the stored fixed date. |
| `setNow(date)` | Advances the clock to a new fixed date for subsequent `now()` calls. |

**Test-double seam:** `FakeClock` replaces `SystemClock` in tests to make date-dependent logic deterministic.

---

## LibraryService

**Private fields:** `#books`, `#members`, `#loans`, `#clock`

### `constructor(clock)`

| Aspect | Detail |
|---|---|
| **Purpose** | Create a service instance with an injected clock. |
| **Parameters** | `clock` — an object with a `now()` method returning a `Date`. |
| **Post** | Internal arrays initialized empty. Clock stored for date operations. |

### `addBook(title, author, isbn, totalCopies)`

| Aspect | Detail |
|---|---|
| **Purpose** | Add a validated book to the catalog. |
| **Pre** | ISBN must not already exist in the catalog. |
| **Post** | A new `Book` is created and stored. |
| **Throws** | `InvalidBookDataError` (from Book), `DuplicateIsbnError` if ISBN exists. |

### `searchCatalog(searchTerm)`

| Aspect | Detail |
|---|---|
| **Purpose** | Find books matching a search term. |
| **Post** | Returns an array of `Book` instances where `book.matches(searchTerm)` is true. Empty array if no matches. |

### `registerMember(name, memberId)`

| Aspect | Detail |
|---|---|
| **Purpose** | Register a new library member. |
| **Pre** | `memberId` must not already be registered. |
| **Post** | A new `Member` is created and stored. |
| **Throws** | `InvalidMemberDataError` (from Member), `DuplicateMemberError` if memberId exists. |

### `borrowBook(isbn, memberId)`

| Aspect | Detail |
|---|---|
| **Purpose** | Create a loan for a member to borrow a book. |
| **Internal helpers** | `#findBookOrThrow` → `#findMemberOrThrow` → `#assertAvailable` → `#createLoan` |
| **Pre** | Book with ISBN exists. Member with memberId exists. Book has `availableCopies > 0`. |
| **Post** | A new `Loan` is created. Book's `availableCopies` decremented by 1. `borrowDate` = `clock.now()`. |
| **Throws** | `BookNotFoundError`, `MemberNotFoundError`, `BookNotAvailableError`. |

### `returnBook(isbn, memberId)`

| Aspect | Detail |
|---|---|
| **Purpose** | Process the return of a borrowed book. |
| **Internal helpers** | `#findActiveLoanOrThrow` → `#applyLateFee` → `#closeLoan` |
| **Pre** | An active (unreturned) loan exists for the given ISBN and memberId. |
| **Post** | Late fee calculated and stored on the loan. `returnDate` set to `clock.now()`. Book's `availableCopies` incremented by 1. |
| **Throws** | `LoanNotFoundError` if no active loan matches. |

### `listOverdueLoans(asOfDate)`

| Aspect | Detail |
|---|---|
| **Purpose** | Retrieve all loans that are overdue as of a given date. |
| **Post** | Returns an array of `Loan` instances where `loan.isOverdue(asOfDate)` is true. Empty array if none. |

---

## Exception Hierarchy

All custom exceptions extend `LibraryError`, which extends `Error`.

```
Error
└── LibraryError
    ├── InvalidBookDataError
    ├── InvalidMemberDataError
    ├── BookNotAvailableError
    ├── BookNotFoundError
    ├── MemberNotFoundError
    ├── LoanNotFoundError
    ├── DuplicateIsbnError
    └── DuplicateMemberError
```

Each subclass sets `this.name` to its own class name for identification.
