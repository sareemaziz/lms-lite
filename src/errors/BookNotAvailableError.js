import LibraryError from "./LibraryError.js";

class BookNotAvailableError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "BookNotAvailableError";
  }
}

export default BookNotAvailableError;
