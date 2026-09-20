import LibraryError from "./LibraryError.js";

class InvalidBookDataError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "InvalidBookDataError";
  }
}

export default InvalidBookDataError;
