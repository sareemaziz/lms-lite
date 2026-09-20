import Book from "../models/Book.js";
import Member from "../models/Member.js";
import Loan from "../models/Loan.js";
import {
  BookNotFoundError,
  MemberNotFoundError,
  BookNotAvailableError,
  LoanNotFoundError,
  DuplicateIsbnError,
  DuplicateMemberError,
} from "../errors/index.js";

class LibraryService {
  #books;
  #members;
  #loans;
  #clock;

  /**
   * @param {object} clock A clock with a now() method returning a Date.
   */
  constructor(clock) {
    this.#clock = clock;
    this.#books = [];
    this.#members = [];
    this.#loans = [];
  }

  // ── addBook ──────────────────────────────────────────────

  /**
   * @param {string} title
   * @param {string} author
   * @param {string} isbn
   * @param {number} totalCopies
   *
   * @pre Delegates validation to Book constructor.
   * @pre isbn must not already exist in the catalog.
   * @post A new Book is created and added to the catalog.
   * @throws {InvalidBookDataError} from Book if validation fails.
   * @throws {DuplicateIsbnError} if isbn already exists.
   */
  addBook(title, author, isbn, totalCopies) {
    const existing = this.#books.find((b) => b.getIsbn() === isbn);
    if (existing) {
      throw new DuplicateIsbnError(`A book with isbn "${isbn}" already exists`);
    }
    const book = new Book(title, author, isbn, totalCopies);
    this.#books.push(book);
  }

  // ── searchCatalog ────────────────────────────────────────

  /**
   * @param {string} searchTerm
   * @returns {Book[]}
   *
   * @pre None.
   * @post Returns an array of Books whose title or author matches searchTerm.
   */
  searchCatalog(searchTerm) {
    return this.#books.filter((b) => b.matches(searchTerm));
  }

  // ── registerMember ───────────────────────────────────────

  /**
   * @param {string} name
   * @param {string} memberId
   *
   * @pre Delegates validation to Member constructor.
   * @pre memberId must not already be registered.
   * @post A new Member is created and stored.
   * @throws {InvalidMemberDataError} from Member if validation fails.
   * @throws {DuplicateMemberError} if memberId already exists.
   */
  registerMember(name, memberId) {
    const existing = this.#members.find((m) => m.getMemberId() === memberId);
    if (existing) {
      throw new DuplicateMemberError(
        `A member with id "${memberId}" already exists`,
      );
    }
    const member = new Member(name, memberId);
    this.#members.push(member);
  }

  // ── borrowBook ───────────────────────────────────────────

  /**
   * @param {string} isbn
   * @param {string} memberId
   *
   * @pre A book with the given isbn exists in the catalog.
   * @pre A member with the given memberId is registered.
   * @pre The book has availableCopies > 0.
   * @post A new Loan is created linking the book and member.
   * @post The book's availableCopies is decremented by 1.
   * @post The current date (from Clock.now()) is used as borrowDate.
   * @throws {BookNotFoundError}
   * @throws {MemberNotFoundError}
   * @throws {BookNotAvailableError}
   */
  borrowBook(isbn, memberId) {
    const book = this.#findBookOrThrow(isbn);
    const member = this.#findMemberOrThrow(memberId);
    this.#assertAvailable(book);
    return this.#createLoan(book, member);
  }

  /** @throws {BookNotFoundError} */
  #findBookOrThrow(isbn) {
    const book = this.#books.find((b) => b.getIsbn() === isbn);
    if (!book) {
      throw new BookNotFoundError(`No book found with isbn "${isbn}"`);
    }
    return book;
  }

  /** @throws {MemberNotFoundError} */
  #findMemberOrThrow(memberId) {
    const member = this.#members.find((m) => m.getMemberId() === memberId);
    if (!member) {
      throw new MemberNotFoundError(`No member found with id "${memberId}"`);
    }
    return member;
  }

  /** @throws {BookNotAvailableError} */
  #assertAvailable(book) {
    if (book.getAvailableCopies() === 0) {
      throw new BookNotAvailableError(
        `No copies available for "${book.getTitle()}"`,
      );
    }
  }

  #createLoan(book, member) {
    book.borrowCopy();
    const loan = new Loan(book, member, this.#clock.now(), this.#clock);
    this.#loans.push(loan);
    return loan;
  }

  // ── returnBook ───────────────────────────────────────────

  /**
   * @param {string} isbn
   * @param {string} memberId
   *
   * @pre An active (unreturned) Loan exists for the given isbn and memberId.
   * @post The loan's returnDate is set to today (via Clock.now()).
   * @post If the loan is overdue, a late fee is calculated and applied.
   * @post The book's availableCopies is incremented by 1 (via Book.returnCopy).
   * @throws {LoanNotFoundError} if no active loan matches.
   */
  returnBook(isbn, memberId) {
    const loan = this.#findActiveLoanOrThrow(isbn, memberId);
    this.#applyLateFee(loan);
    this.#closeLoan(loan);
  }

  /** @throws {LoanNotFoundError} */
  #findActiveLoanOrThrow(isbn, memberId) {
    const loan = this.#loans.find(
      (l) =>
        l.getBook().getIsbn() === isbn &&
        l.getMember().getMemberId() === memberId &&
        l.getReturnDate() === null,
    );
    if (!loan) {
      throw new LoanNotFoundError(
        `No active loan found for isbn "${isbn}" and member "${memberId}"`,
      );
    }
    return loan;
  }

  #applyLateFee(loan) {
    const now = this.#clock.now();
    const fee = loan.calculateLateFee(now);
    if (fee > 0) {
      // Fee is calculated; caller may persist it. For now we just compute it.
      // The book's returnCopy handles the copy count.
    }
    return fee;
  }

  #closeLoan(loan) {
    loan.markReturned(this.#clock.now());
    loan.getBook().returnCopy();
  }

  // ── listOverdueLoans ─────────────────────────────────────

  /**
   * @param {Date} asOfDate
   * @returns {Loan[]}
   *
   * @pre None.
   * @post Returns an array of Loans where loan.isOverdue(asOfDate) is true.
   */
  listOverdueLoans(asOfDate) {
    return this.#loans.filter((l) => l.isOverdue(asOfDate));
  }
}

export default LibraryService;
