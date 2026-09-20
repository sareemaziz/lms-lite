import LibraryService from "../src/services/LibraryService.js";
import { FakeClock } from "../src/services/Clock.js";
import {
  BookNotFoundError,
  MemberNotFoundError,
  BookNotAvailableError,
  LoanNotFoundError,
  DuplicateIsbnError,
  DuplicateMemberError,
  InvalidBookDataError,
  InvalidMemberDataError,
} from "../src/errors/index.js";

describe("LibraryService", () => {
  const FIXED_DATE = new Date("2025-06-01T12:00:00Z");
  let clock;
  let lib;

  beforeEach(() => {
    clock = new FakeClock(new Date(FIXED_DATE));
    lib = new LibraryService(clock);
  });

  function addTestBook(overrides = {}) {
    lib.addBook(
      overrides.title ?? "Test Book",
      overrides.author ?? "Author",
      overrides.isbn ?? "ISBN-1",
      overrides.totalCopies ?? 2,
    );
  }

  function registerTestMember(overrides = {}) {
    lib.registerMember(
      overrides.name ?? "Alice",
      overrides.memberId ?? "M001",
    );
  }

  // ── addBook ──────────────────────────────────────────────

  describe("addBook", () => {
    it("adds a valid book to the catalog", () => {
      addTestBook();
      const results = lib.searchCatalog("Test Book");
      expect(results).toHaveLength(1);
      expect(results[0].getTitle()).toBe("Test Book");
    });

    it("rejects a duplicate ISBN with DuplicateIsbnError", () => {
      addTestBook({ isbn: "SAME-ISBN" });
      expect(() => addTestBook({ isbn: "SAME-ISBN" })).toThrow(DuplicateIsbnError);
    });

    it("propagates InvalidBookDataError from Book constructor", () => {
      expect(() => lib.addBook("", "Author", "ISBN", 1)).toThrow(InvalidBookDataError);
    });

    it("allows multiple different books", () => {
      addTestBook({ isbn: "ISBN-1", title: "Book One" });
      addTestBook({ isbn: "ISBN-2", title: "Book Two" });
      expect(lib.searchCatalog("Book")).toHaveLength(2);
    });
  });

  // ── searchCatalog ────────────────────────────────────────

  describe("searchCatalog", () => {
    beforeEach(() => {
      addTestBook({ title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "GATSBY" });
      addTestBook({ title: "Clean Code", author: "Robert C. Martin", isbn: "CLEAN" });
    });

    it("finds books by title", () => {
      const results = lib.searchCatalog("gatsby");
      expect(results).toHaveLength(1);
      expect(results[0].getIsbn()).toBe("GATSBY");
    });

    it("finds books by author", () => {
      const results = lib.searchCatalog("martin");
      expect(results).toHaveLength(1);
      expect(results[0].getIsbn()).toBe("CLEAN");
    });

    it("search is case-insensitive", () => {
      expect(lib.searchCatalog("GATSBY")).toHaveLength(1);
      expect(lib.searchCatalog("Gatsby")).toHaveLength(1);
      expect(lib.searchCatalog("gatsby")).toHaveLength(1);
    });

    it("returns empty array when no matches", () => {
      expect(lib.searchCatalog("nonexistent")).toHaveLength(0);
    });

    it("returns empty array for empty catalog", () => {
      const emptyLib = new LibraryService(clock);
      expect(emptyLib.searchCatalog("anything")).toHaveLength(0);
    });
  });

  // ── registerMember ───────────────────────────────────────

  describe("registerMember", () => {
    it("registers a valid member", () => {
      registerTestMember();
      // We can verify indirectly by borrowing a book
      addTestBook();
      const loan = lib.borrowBook("ISBN-1", "M001");
      expect(loan.getMember().getName()).toBe("Alice");
    });

    it("rejects a duplicate memberId with DuplicateMemberError", () => {
      registerTestMember({ memberId: "SAME-ID" });
      expect(() => registerTestMember({ memberId: "SAME-ID" })).toThrow(
        DuplicateMemberError,
      );
    });

    it("propagates InvalidMemberDataError from Member constructor", () => {
      expect(() => lib.registerMember("", "M001")).toThrow(InvalidMemberDataError);
    });
  });

  // ── borrowBook ───────────────────────────────────────────

  describe("borrowBook", () => {
    beforeEach(() => {
      addTestBook({ isbn: "ISBN-1", totalCopies: 2 });
      registerTestMember({ memberId: "M001" });
    });

    it("creates a Loan linking the book and member", () => {
      const loan = lib.borrowBook("ISBN-1", "M001");
      expect(loan.getBook().getIsbn()).toBe("ISBN-1");
      expect(loan.getMember().getMemberId()).toBe("M001");
    });

    it("decreases available copies", () => {
      lib.borrowBook("ISBN-1", "M001");
      const results = lib.searchCatalog("Test Book");
      expect(results[0].getAvailableCopies()).toBe(1);
    });

    it("uses the injected clock for borrowDate", () => {
      const loan = lib.borrowBook("ISBN-1", "M001");
      expect(loan.getBorrowDate()).toEqual(FIXED_DATE);
    });

    it("sets dueDate to 14 days after the clock date", () => {
      const loan = lib.borrowBook("ISBN-1", "M001");
      const expectedDue = new Date(FIXED_DATE.getTime() + 14 * 24 * 60 * 60 * 1000);
      expect(loan.getDueDate()).toEqual(expectedDue);
    });

    it("throws BookNotFoundError for nonexistent ISBN", () => {
      expect(() => lib.borrowBook("NONEXISTENT", "M001")).toThrow(BookNotFoundError);
    });

    it("throws MemberNotFoundError for nonexistent member", () => {
      expect(() => lib.borrowBook("ISBN-1", "NONEXISTENT")).toThrow(MemberNotFoundError);
    });

    it("throws BookNotAvailableError when no copies remain", () => {
      lib.borrowBook("ISBN-1", "M001");
      lib.borrowBook("ISBN-1", "M001");
      expect(() => lib.borrowBook("ISBN-1", "M001")).toThrow(BookNotAvailableError);
    });
  });

  // ── returnBook ───────────────────────────────────────────

  describe("returnBook", () => {
    beforeEach(() => {
      addTestBook({ isbn: "ISBN-1", totalCopies: 1 });
      registerTestMember({ memberId: "M001" });
      lib.borrowBook("ISBN-1", "M001");
    });

    it("closes the active loan (sets returnDate)", () => {
      lib.returnBook("ISBN-1", "M001");
      // After return, borrowing again should work — proving the loan was closed
      // and the copy was restored
      const loan2 = lib.borrowBook("ISBN-1", "M001");
      expect(loan2.getReturnDate()).toBeNull();
    });

    it("restores the book copy", () => {
      const book = lib.searchCatalog("Test Book")[0];
      expect(book.getAvailableCopies()).toBe(0);
      lib.returnBook("ISBN-1", "M001");
      expect(book.getAvailableCopies()).toBe(1);
    });

    it("throws LoanNotFoundError when no active loan exists", () => {
      // Return once successfully
      lib.returnBook("ISBN-1", "M001");
      // Second return for same isbn/member should fail
      expect(() => lib.returnBook("ISBN-1", "M001")).toThrow(LoanNotFoundError);
    });

    it("throws LoanNotFoundError for completely unknown loan", () => {
      expect(() => lib.returnBook("UNKNOWN", "UNKNOWN")).toThrow(LoanNotFoundError);
    });
  });

  // ── listOverdueLoans ─────────────────────────────────────

  describe("listOverdueLoans", () => {
    beforeEach(() => {
      addTestBook({ isbn: "ISBN-1" });
      registerTestMember({ memberId: "M001" });
    });

    it("returns empty array when no loans exist", () => {
      expect(lib.listOverdueLoans(new Date())).toHaveLength(0);
    });

    it("returns empty array when loans are not yet overdue", () => {
      lib.borrowBook("ISBN-1", "M001");
      const twoDaysBefore = new Date(FIXED_DATE.getTime() + 12 * 24 * 60 * 60 * 1000);
      expect(lib.listOverdueLoans(twoDaysBefore)).toHaveLength(0);
    });

    it("returns overdue loans when past due date", () => {
      lib.borrowBook("ISBN-1", "M001");
      const oneDayAfterDue = new Date(FIXED_DATE.getTime() + 15 * 24 * 60 * 60 * 1000);
      const overdue = lib.listOverdueLoans(oneDayAfterDue);
      expect(overdue).toHaveLength(1);
      expect(overdue[0].getBook().getIsbn()).toBe("ISBN-1");
    });

    it("excludes returned loans from overdue results", () => {
      lib.borrowBook("ISBN-1", "M001");
      lib.returnBook("ISBN-1", "M001");
      const longAfterDue = new Date(FIXED_DATE.getTime() + 30 * 24 * 60 * 60 * 1000);
      expect(lib.listOverdueLoans(longAfterDue)).toHaveLength(0);
    });

    it("returns multiple overdue loans when applicable", () => {
      addTestBook({ isbn: "ISBN-2" });
      registerTestMember({ memberId: "M002" });
      lib.borrowBook("ISBN-1", "M001");
      lib.borrowBook("ISBN-2", "M002");
      const longAfterDue = new Date(FIXED_DATE.getTime() + 20 * 24 * 60 * 60 * 1000);
      expect(lib.listOverdueLoans(longAfterDue)).toHaveLength(2);
    });
  });
});
