import { InvalidMemberDataError } from "../errors/index.js";

class Member {
  #name;
  #memberId;

  /**
   * @param {string} name
   * @param {string} memberId
   *
   * @pre name is a non-empty string.
   * @pre memberId is a non-empty string.
   * @post name and memberId are stored.
   * @throws {InvalidMemberDataError} if any pre-condition is violated.
   */
  constructor(name, memberId) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new InvalidMemberDataError("name must be a non-empty string");
    }
    if (typeof memberId !== "string" || memberId.trim() === "") {
      throw new InvalidMemberDataError("memberId must be a non-empty string");
    }
    this.#name = name.trim();
    this.#memberId = memberId.trim();
  }

  /** @returns {string} */
  getName() {
    return this.#name;
  }

  /** @returns {string} */
  getMemberId() {
    return this.#memberId;
  }
}

export default Member;
