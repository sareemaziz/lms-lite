class SystemClock {
  /**
   * @pre None.
   * @post Returns the current date/time.
   */
  now() {
    return new Date();
  }
}

class FakeClock {
  #currentDate;

  /**
   * @param {Date} fixedDate The date returned by every now() call.
   * @pre fixedDate is a Date instance.
   */
  constructor(fixedDate) {
    this.#currentDate = fixedDate;
  }

  /**
   * @pre None.
   * @post Returns the injected fixed date.
   */
  now() {
    return this.#currentDate;
  }

  /**
   * Advance the clock to a new fixed date for subsequent now() calls.
   * @param {Date} date
   */
  setNow(date) {
    this.#currentDate = date;
  }
}

export { SystemClock, FakeClock };
