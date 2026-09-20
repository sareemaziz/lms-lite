import LibraryError from "./LibraryError.js";

class LoanNotFoundError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "LoanNotFoundError";
  }
}

export default LoanNotFoundError;
