import {
  InvalidBookDataError,
  BookNotAvailableError,
} from "../errors/index.js";

class Book {
  #title;
  #author;
  #isbn;
  #totalCopies;
  #availableCopies;

  /**
   * @param {string} title
   * @param {string} author
   * @param {string} isbn
   * @param {number} totalCopies
   *
   * @pre title, author, isbn are non-empty strings (after trim).
   * @pre totalCopies is an integer > 0.
   * @post availableCopies is set equal to totalCopies.
   * @throws {InvalidBookDataError} if any pre-condition is violated.
   */
  constructor(title, author, isbn, totalCopies) {
    if (typeof title !== "string" || title.trim() === "") {
      throw new InvalidBookDataError("title must be a non-empty string");
    }
    if (typeof author !== "string" || author.trim() === "") {
      throw new InvalidBookDataError("author must be a non-empty string");
    }
    if (typeof isbn !== "string" || isbn.trim() === "") {
      throw new InvalidBookDataError("isbn must be a non-empty string");
    }
    if (!Number.isInteger(totalCopies) || totalCopies <= 0) {
      throw new InvalidBookDataError(
        "totalCopies must be an integer greater than 0",
      );
    }

    this.#title = title.trim();
    this.#author = author.trim();
    this.#isbn = isbn.trim();
    this.#totalCopies = totalCopies;
    this.#availableCopies = totalCopies;
  }

  /**
   * @pre availableCopies > 0.
   * @post availableCopies is decremented by 1.
   * @throws {BookNotAvailableError} if availableCopies is 0.
   */
  borrowCopy() {
    if (this.#availableCopies === 0) {
      throw new BookNotAvailableError(
        `No copies available for "${this.#title}"`,
      );
    }
    this.#availableCopies -= 1;
  }

  /**
   * @pre availableCopies < totalCopies.
   * @post availableCopies is incremented by 1 (capped at totalCopies).
   */
  returnCopy() {
    if (this.#availableCopies < this.#totalCopies) {
      this.#availableCopies += 1;
    }
  }

  /**
   * @param {string} searchTerm
   * @returns {boolean}
   *
   * @pre None.
   * @post Returns true if title or author contains searchTerm (case-insensitive).
   */
  matches(searchTerm) {
    const term = searchTerm.toLowerCase();
    return (
      this.#title.toLowerCase().includes(term) ||
      this.#author.toLowerCase().includes(term)
    );
  }

  /** @returns {string} */
  getTitle() {
    return this.#title;
  }

  /** @returns {string} */
  getAuthor() {
    return this.#author;
  }

  /** @returns {string} */
  getIsbn() {
    return this.#isbn;
  }

  /** @returns {number} */
  getAvailableCopies() {
    return this.#availableCopies;
  }

  /** @returns {number} */
  getTotalCopies() {
    return this.#totalCopies;
  }
}

export default Book;
