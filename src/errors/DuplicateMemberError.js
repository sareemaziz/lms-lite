import LibraryError from "./LibraryError.js";

class DuplicateMemberError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "DuplicateMemberError";
  }
}

export default DuplicateMemberError;
