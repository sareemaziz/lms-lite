import LibraryError from "./LibraryError.js";

class BookNotFoundError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "BookNotFoundError";
  }
}

export default BookNotFoundError;
