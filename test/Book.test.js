import Book from "../src/models/Book.js";
import {
  InvalidBookDataError,
  BookNotAvailableError,
} from "../src/errors/index.js";

describe("Book", () => {
  const validArgs = {
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    isbn: "978-0135957059",
    totalCopies: 3,
  };

  function makeBook(overrides = {}) {
    return new Book(
      overrides.title ?? validArgs.title,
      overrides.author ?? validArgs.author,
      overrides.isbn ?? validArgs.isbn,
      overrides.totalCopies ?? validArgs.totalCopies,
    );
  }

  // ── constructor ─────────────────────────────────────────

  describe("constructor", () => {
    it("creates a book with valid arguments", () => {
      const book = makeBook();
      expect(book.getTitle()).toBe("The Pragmatic Programmer");
      expect(book.getAuthor()).toBe("David Thomas");
      expect(book.getIsbn()).toBe("978-0135957059");
      expect(book.getTotalCopies()).toBe(3);
      expect(book.getAvailableCopies()).toBe(3);
    });

    it("trims whitespace from title, author, and isbn", () => {
      const book = new Book("  Title  ", "  Author  ", "  ISBN  ", 1);
      expect(book.getTitle()).toBe("Title");
      expect(book.getAuthor()).toBe("Author");
      expect(book.getIsbn()).toBe("ISBN");
    });

    it("sets availableCopies equal to totalCopies", () => {
      const book = makeBook({ totalCopies: 5 });
      expect(book.getAvailableCopies()).toBe(5);
    });

    it.each([
      ["title", ""],
      ["title", "   "],
      ["title", 123],
      ["title", null],
      ["title", undefined],
      ["author", ""],
      ["author", "   "],
      ["author", 123],
      ["author", null],
      ["author", undefined],
      ["isbn", ""],
      ["isbn", "   "],
      ["isbn", 123],
      ["isbn", null],
      ["isbn", undefined],
    ])("throws InvalidBookDataError for invalid %s: %j", (field, value) => {
      const args = { ...validArgs, [field]: value };
      expect(() => new Book(args.title, args.author, args.isbn, args.totalCopies)).toThrow(
        InvalidBookDataError,
      );
    });

    it.each([
      ["totalCopies", 0],
      ["totalCopies", -1],
      ["totalCopies", 1.5],
      ["totalCopies", "3"],
      ["totalCopies", null],
      ["totalCopies", undefined],
    ])("throws InvalidBookDataError for invalid %s: %j", (field, value) => {
      const args = { ...validArgs, [field]: value };
      expect(() => new Book(args.title, args.author, args.isbn, args.totalCopies)).toThrow(
        InvalidBookDataError,
      );
    });
  });

  // ── borrowCopy ──────────────────────────────────────────

  describe("borrowCopy", () => {
    it("decreases availableCopies by 1", () => {
      const book = makeBook({ totalCopies: 3 });
      book.borrowCopy();
      expect(book.getAvailableCopies()).toBe(2);
    });

    it("allows borrowing all copies one at a time", () => {
      const book = makeBook({ totalCopies: 2 });
      book.borrowCopy();
      book.borrowCopy();
      expect(book.getAvailableCopies()).toBe(0);
    });

    it("throws BookNotAvailableError when no copies remain", () => {
      const book = makeBook({ totalCopies: 1 });
      book.borrowCopy();
      expect(() => book.borrowCopy()).toThrow(BookNotAvailableError);
    });

    it("throws BookNotAvailableError with a descriptive message", () => {
      const book = makeBook({ totalCopies: 1 });
      book.borrowCopy();
      expect(() => book.borrowCopy()).toThrow("No copies available");
    });
  });

  // ── returnCopy ──────────────────────────────────────────

  describe("returnCopy", () => {
    it("increases availableCopies by 1", () => {
      const book = makeBook({ totalCopies: 2 });
      book.borrowCopy();
      book.borrowCopy();
      book.returnCopy();
      expect(book.getAvailableCopies()).toBe(1);
    });

    it("does not exceed totalCopies", () => {
      const book = makeBook({ totalCopies: 1 });
      book.returnCopy();
      expect(book.getAvailableCopies()).toBe(1);
    });

    it("is a safe no-op when all copies are already available", () => {
      const book = makeBook({ totalCopies: 3 });
      book.returnCopy();
      expect(book.getAvailableCopies()).toBe(3);
    });
  });

  // ── matches ─────────────────────────────────────────────

  describe("matches", () => {
    it("matches title case-insensitively", () => {
      const book = makeBook();
      expect(book.matches("pragmatic")).toBe(true);
      expect(book.matches("PRAGMATIC")).toBe(true);
      expect(book.matches("Pragmatic")).toBe(true);
    });

    it("matches author case-insensitively", () => {
      const book = makeBook();
      expect(book.matches("thomas")).toBe(true);
      expect(book.matches("THOMAS")).toBe(true);
    });

    it("returns false when the term does not appear in title or author", () => {
      const book = makeBook();
      expect(book.matches("science")).toBe(false);
    });

    it("returns true for an empty search term (String.includes('') is always true)", () => {
      const book = makeBook();
      expect(book.matches("")).toBe(true);
    });

    it("matches partial substrings", () => {
      const book = makeBook();
      expect(book.matches("prog")).toBe(true);
      expect(book.matches("dav")).toBe(true);
    });
  });

  // ── getters ─────────────────────────────────────────────

  describe("getters", () => {
    it("return the correct values", () => {
      const book = makeBook();
      expect(book.getTitle()).toBe("The Pragmatic Programmer");
      expect(book.getAuthor()).toBe("David Thomas");
      expect(book.getIsbn()).toBe("978-0135957059");
      expect(book.getTotalCopies()).toBe(3);
      expect(book.getAvailableCopies()).toBe(3);
    });
  });
});
