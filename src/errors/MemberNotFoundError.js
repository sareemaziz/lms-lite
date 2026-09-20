import LibraryError from "./LibraryError.js";

class MemberNotFoundError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "MemberNotFoundError";
  }
}

export default MemberNotFoundError;
