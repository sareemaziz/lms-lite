import LibraryError from "./LibraryError.js";

class DuplicateIsbnError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "DuplicateIsbnError";
  }
}

export default DuplicateIsbnError;
