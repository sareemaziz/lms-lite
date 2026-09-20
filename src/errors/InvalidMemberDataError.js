import LibraryError from "./LibraryError.js";

class InvalidMemberDataError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "InvalidMemberDataError";
  }
}

export default InvalidMemberDataError;
