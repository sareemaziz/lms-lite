const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NO_LATE_FEE = 0;

class Loan {
  #book;
  #member;
  #borrowDate;
  #dueDate;
  #returnDate;
  #lateFee;

  /**
   * @param {object} book   A Book instance.
   * @param {object} member A Member instance.
   * @param {Date}   borrowDate
   * @param {object} clock  A clock with a now() method returning a Date.
   *
   * @pre None (validation is delegated to LibraryService).
   * @post book, member, borrowDate are stored.
   * @post dueDate is borrowDate + 14 days.
   * @post returnDate is null.
   */
  constructor(book, member, borrowDate, clock) {
    this.#book = book;
    this.#member = member;
    this.#borrowDate = borrowDate;
    this.#dueDate = new Date(borrowDate.getTime() + 14 * MS_PER_DAY);
    this.#returnDate = null;
    this.#lateFee = NO_LATE_FEE;
  }

  /**
   * @param {Date} returnDate The date the book was returned.
   *
   * @pre returnDate is currently null (loan has not already been returned).
   * @post returnDate is set to the provided value.
   * @throws {Error} if the loan has already been returned.
   */
  markReturned(returnDate) {
    if (this.#returnDate !== null) {
      throw new Error("Loan has already been returned");
    }
    this.#returnDate = returnDate;
  }

  /**
   * @param {Date} asOfDate
   * @returns {boolean}
   *
   * @pre None.
   * @post Returns true if returnDate is null AND asOfDate > dueDate.
   */
  isOverdue(asOfDate) {
    return this.#returnDate === null && asOfDate > this.#dueDate;
  }

  /**
   * @param {Date}   asOfDate
   * @param {number} [feePerDay=0.5]
   * @returns {number}
   *
   * @pre None.
   * @post If not returned or not late (asOfDate <= dueDate): returns 0.
   * @post Otherwise: returns (daysBetween(dueDate, asOfDate)) * feePerDay.
   */
  calculateLateFee(asOfDate, feePerDay = 0.5) {
    if (this.#returnDate !== null || asOfDate <= this.#dueDate) {
      return NO_LATE_FEE;
    }
    const diffMs = asOfDate.getTime() - this.#dueDate.getTime();
    const days = Math.ceil(diffMs / MS_PER_DAY);
    return days * feePerDay;
  }

  /** @returns {object} */
  getBook() {
    return this.#book;
  }

  /** @returns {object} */
  getMember() {
    return this.#member;
  }

  /** @returns {Date} */
  getBorrowDate() {
    return this.#borrowDate;
  }

  /** @returns {Date} */
  getDueDate() {
    return this.#dueDate;
  }

  /** @returns {Date|null} */
  getReturnDate() {
    return this.#returnDate;
  }

  /** @returns {number} */
  getLateFee() {
    return this.#lateFee;
  }

  /** @param {number} fee */
  setLateFee(fee) {
    this.#lateFee = fee;
  }
}

export default Loan;
