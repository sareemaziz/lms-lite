import Book from "../src/models/Book.js";
import Member from "../src/models/Member.js";
import Loan from "../src/models/Loan.js";
import LibraryService from "../src/services/LibraryService.js";
import { FakeClock } from "../src/services/Clock.js";

describe("Loan", () => {
  const BORROW_DATE = new Date("2025-06-01");

  function makeBook(overrides = {}) {
    return new Book(
      overrides.title ?? "Test Book",
      overrides.author ?? "Author",
      overrides.isbn ?? "ISBN-1",
      overrides.totalCopies ?? 3,
    );
  }

  function makeMember(overrides = {}) {
    return new Member(
      overrides.name ?? "Alice",
      overrides.memberId ?? "M001",
    );
  }

  function makeLoan(overrides = {}) {
    const book = overrides.book ?? makeBook();
    const member = overrides.member ?? makeMember();
    const borrowDate = overrides.borrowDate ?? BORROW_DATE;
    const clock = overrides.clock ?? new FakeClock(BORROW_DATE);
    return new Loan(book, member, borrowDate, clock);
  }

  // ── constructor ─────────────────────────────────────────

  describe("constructor", () => {
    it("stores book, member, and borrowDate", () => {
      const book = makeBook();
      const member = makeMember();
      const loan = makeLoan({ book, member });

      expect(loan.getBook()).toBe(book);
      expect(loan.getMember()).toBe(member);
      expect(loan.getBorrowDate()).toBe(BORROW_DATE);
    });

    it("sets dueDate to exactly 14 days after borrowDate", () => {
      const loan = makeLoan();
      const expectedDue = new Date(BORROW_DATE.getTime() + 14 * 24 * 60 * 60 * 1000);
      expect(loan.getDueDate()).toEqual(expectedDue);
    });

    it("sets returnDate to null", () => {
      const loan = makeLoan();
      expect(loan.getReturnDate()).toBeNull();
    });
  });

  // ── markReturned ────────────────────────────────────────

  describe("markReturned", () => {
    it("sets returnDate", () => {
      const loan = makeLoan();
      const returnDate = new Date("2025-06-10");
      loan.markReturned(returnDate);
      expect(loan.getReturnDate()).toBe(returnDate);
    });

    it("throws if already returned", () => {
      const loan = makeLoan();
      loan.markReturned(new Date("2025-06-10"));
      expect(() => loan.markReturned(new Date("2025-06-15"))).toThrow(
        "Loan has already been returned",
      );
    });

    it("throws a plain Error (not a custom error class)", () => {
      const loan = makeLoan();
      loan.markReturned(new Date("2025-06-10"));
      expect(() => loan.markReturned(new Date("2025-06-15"))).toThrow(Error);
    });
  });

  // ── isOverdue ───────────────────────────────────────────

  describe("isOverdue", () => {
    it("returns false before the due date", () => {
      const loan = makeLoan();
      const twoDaysBefore = new Date(BORROW_DATE.getTime() + 12 * 24 * 60 * 60 * 1000);
      expect(loan.isOverdue(twoDaysBefore)).toBe(false);
    });

    it("returns false on the due date", () => {
      const loan = makeLoan();
      const dueDate = loan.getDueDate();
      expect(loan.isOverdue(dueDate)).toBe(false);
    });

    it("returns true after the due date", () => {
      const loan = makeLoan();
      const dayAfterDue = new Date(loan.getDueDate().getTime() + 1);
      expect(loan.isOverdue(dayAfterDue)).toBe(true);
    });

    it("returns false for a returned loan even if past due date", () => {
      const loan = makeLoan();
      loan.markReturned(new Date("2025-06-10"));
      const longAfterDue = new Date("2025-12-01");
      expect(loan.isOverdue(longAfterDue)).toBe(false);
    });
  });

  // ── calculateLateFee ────────────────────────────────────

  describe("calculateLateFee", () => {
    it("returns 0 before the due date", () => {
      const loan = makeLoan();
      const twoDaysBefore = new Date(BORROW_DATE.getTime() + 12 * 24 * 60 * 60 * 1000);
      expect(loan.calculateLateFee(twoDaysBefore)).toBe(0);
    });

    it("returns 0 on the due date", () => {
      const loan = makeLoan();
      expect(loan.calculateLateFee(loan.getDueDate())).toBe(0);
    });

    it("uses the default fee of $0.50 per day", () => {
      const loan = makeLoan();
      const twoDaysLate = new Date(loan.getDueDate().getTime() + 2 * 24 * 60 * 60 * 1000);
      expect(loan.calculateLateFee(twoDaysLate)).toBe(1.0);
    });

    it("calculates correctly for a single day late", () => {
      const loan = makeLoan();
      const oneDayLate = new Date(loan.getDueDate().getTime() + 1 * 24 * 60 * 60 * 1000);
      expect(loan.calculateLateFee(oneDayLate)).toBe(0.5);
    });

    it("calculates correctly for 5 days late", () => {
      const loan = makeLoan();
      const fiveDaysLate = new Date(loan.getDueDate().getTime() + 5 * 24 * 60 * 60 * 1000);
      expect(loan.calculateLateFee(fiveDaysLate)).toBe(2.5);
    });

    it("accepts a custom feePerDay", () => {
      const loan = makeLoan();
      const threeDaysLate = new Date(loan.getDueDate().getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(loan.calculateLateFee(threeDaysLate, 1.0)).toBe(3.0);
      expect(loan.calculateLateFee(threeDaysLate, 2.0)).toBe(6.0);
    });

    it("returns 0 for a returned loan even if past due date", () => {
      const loan = makeLoan();
      loan.markReturned(new Date("2025-06-10"));
      const longAfterDue = new Date("2025-12-01");
      expect(loan.calculateLateFee(longAfterDue)).toBe(0);
    });

    it("charges exactly $0.50 for one day late", () => {
      const loan = makeLoan();
      const oneDayLate = new Date(loan.getDueDate().getTime() + 1 * 24 * 60 * 60 * 1000);
      expect(loan.calculateLateFee(oneDayLate)).toBe(0.50);
    });
  });

  // ── lateFee (stored property — not yet implemented) ──────

  describe("lateFee", () => {
    it("is 0 on a newly created loan", () => {
      const loan = makeLoan();
      expect(loan.getLateFee()).toBe(0);
    });

    it("is 0 when returned on the due date via LibraryService", () => {
      const clock = new FakeClock(new Date("2025-06-01"));
      const lib = new LibraryService(clock);
      lib.addBook("Test Book", "Author", "ISBN-1", 1);
      lib.registerMember("Alice", "M001");

      const loan = lib.borrowBook("ISBN-1", "M001");

      // Advance clock to the due date (borrow + 14 days)
      clock.setNow(new Date("2025-06-15"));
      lib.returnBook("ISBN-1", "M001");

      expect(loan.getLateFee()).toBe(0);
    });

    it("is 0 when borrowed and returned on the same date, never negative", () => {
      const clock = new FakeClock(new Date("2025-06-01"));
      const lib = new LibraryService(clock);
      lib.addBook("Test Book", "Author", "ISBN-1", 1);
      lib.registerMember("Alice", "M001");

      const loan = lib.borrowBook("ISBN-1", "M001");

      // Return on the same date — no time has passed
      lib.returnBook("ISBN-1", "M001");

      expect(loan.getLateFee()).toBe(0);
    });
  });
});
