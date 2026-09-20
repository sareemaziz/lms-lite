# LMS-Lite — Class Diagram

## Mermaid Diagram

```mermaid
classDiagram
    class Book {
        -#title string
        -#author string
        -#isbn string
        -#totalCopies number
        -#availableCopies number
        +constructor(title, author, isbn, totalCopies)
        +borrowCopy()
        +returnCopy()
        +matches(searchTerm) boolean
        +getTitle() string
        +getAuthor() string
        +getIsbn() string
        +getAvailableCopies() number
        +getTotalCopies() number
    }

    class Member {
        -#name string
        -#memberId string
        +constructor(name, memberId)
        +getName() string
        +getMemberId() string
    }

    class Loan {
        -#book Book
        -#member Member
        -#borrowDate Date
        -#dueDate Date
        -#returnDate Date
        -#lateFee number
        +constructor(book, member, borrowDate)
        +markReturned(returnDate)
        +isOverdue(asOfDate) boolean
        +calculateLateFee(asOfDate, feePerDay) number
        +getLateFee() number
        +setLateFee(fee)
        +getBook() Book
        +getMember() Member
        +getBorrowDate() Date
        +getDueDate() Date
        +getReturnDate() Date
    }

    class LibraryService {
        -#books Book[]
        -#members Member[]
        -#loans Loan[]
        -#clock object
        +constructor(clock)
        +addBook(title, author, isbn, totalCopies)
        +searchCatalog(searchTerm) Book[]
        +registerMember(name, memberId)
        +borrowBook(isbn, memberId) Loan
        +returnBook(isbn, memberId)
        +listOverdueLoans(asOfDate) Loan[]
    }

    class LibraryError {
        +constructor(message)
    }

    class InvalidBookDataError
    class InvalidMemberDataError
    class BookNotAvailableError
    class BookNotFoundError
    class MemberNotFoundError
    class LoanNotFoundError
    class DuplicateIsbnError
    class DuplicateMemberError

    class SystemClock {
        +now() Date
    }

    class FakeClock {
        -#currentDate Date
        +constructor(fixedDate)
        +now() Date
        +setNow(date)
    }

    LibraryService --> Book : manages
    LibraryService --> Member : manages
    LibraryService --> Loan : creates
    LibraryService --> SystemClock : uses
    LibraryService --> FakeClock : uses (tests)
    Loan --> Book : references
    Loan --> Member : references
    InvalidBookDataError --|> LibraryError
    InvalidMemberDataError --|> LibraryError
    BookNotAvailableError --|> LibraryError
    BookNotFoundError --|> LibraryError
    MemberNotFoundError --|> LibraryError
    LoanNotFoundError --|> LibraryError
    DuplicateIsbnError --|> LibraryError
    DuplicateMemberError --|> LibraryError
    LibraryError --|> Error
```

## Text Diagram (for contexts where Mermaid is not rendered)

```
LibraryService
 ├── #books: Book[]
 ├── #members: Member[]
 ├── #loans: Loan[]
 ├── #clock: SystemClock | FakeClock
 │
 ├── addBook()        → creates Book
 ├── searchCatalog()  → filters Book[]
 ├── registerMember() → creates Member
 ├── borrowBook()     → creates Loan
 ├── returnBook()     → updates Loan, restores Book
 └── listOverdueLoans() → filters Loan[]

Loan
 ├── #book: Book      → reference to borrowed book
 ├── #member: Member  → reference to borrower
 ├── #borrowDate, #dueDate, #returnDate: Date
 ├── #lateFee: number
 ├── calculateLateFee() → days × feePerDay
 └── isOverdue()        → returnDate == null && asOf > dueDate

Book
 ├── #title, #author, #isbn: string
 ├── #totalCopies, #availableCopies: number
 ├── borrowCopy()   → availableCopies--
 └── returnCopy()   → availableCopies++ (capped)

Member
 ├── #name: string
 └── #memberId: string

Exception Hierarchy
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

Clock (duck-typed interface)
 ├── SystemClock.now()  → new Date()
 └── FakeClock.now()    → fixed injected date
```

## Relationships

| Relationship | Type | Description |
|---|---|---|
| `LibraryService` → `Book` | Composition (manages) | Service creates and stores books in an internal array. |
| `LibraryService` → `Member` | Composition (manages) | Service creates and stores members. |
| `LibraryService` → `Loan` | Composition (creates) | Service creates loans and tracks them. |
| `Loan` → `Book` | Aggregation (references) | Loan holds a reference to the borrowed book. |
| `Loan` → `Member` | Aggregation (references) | Loan holds a reference to the borrowing member. |
| `LibraryService` → `Clock` | Dependency (injection) | Service receives a clock via constructor injection. |
| All exceptions → `LibraryError` | Inheritance | Custom exceptions form a hierarchy rooted at `LibraryError`. |

## Design Notes

- **All model fields are private** (`#` prefix). Public access is through getters and specific mutation methods.
- **Clock is injected**, not created internally. This is the test-double seam that allows `FakeClock` to replace `SystemClock` in tests.
- **LibraryService is decomposed** into private helper methods (`#findBookOrThrow`, `#assertAvailable`, `#createLoan`, `#findActiveLoanOrThrow`, `#applyLateFee`, `#closeLoan`) rather than being a monolithic class.
