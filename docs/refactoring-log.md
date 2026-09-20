# Refactoring Log

Each entry documents a specific refactoring performed during development, with evidence from the Git history.

---

## 1. Replace Duplicate Literal with Named Constant

| Aspect | Detail |
|---|---|
| **Smell** | Magic number — the literal `0` was used to represent "no late fee" without semantic meaning. |
| **Why it was a problem** | The value `0` appeared in the constructor initialization without indicating its purpose as a fee value. |
| **Technique** | Introduce Named Constant (Replace Magic Number with Symbolic Constant). |
| **Before** | `this.#lateFee = 0;` |
| **After** | `const NO_LATE_FEE = 0;` declared at module scope; `this.#lateFee = NO_LATE_FEE;` |
| **Benefit** | The constant name communicates intent. Future changes to the zero-fee value require a single edit. |
| **Commit** | `6319731 refactor: remove duplicate late-fee constant` |

---

## 2. Merge Redundant Conditional Guards

| Aspect | Detail |
|---|---|
| **Smell** | Two separate `if` blocks returning the same value with no intervening logic. |
| **Why it was a problem** | The two early-return paths in `calculateLateFee` (`returnDate !== null` and `asOfDate <= dueDate`) both returned `0` independently, making the control flow unnecessarily verbose. |
| **Technique** | Consolidate Conditional Expression. |
| **Before** | Two separate `if` blocks, each `return 0;` |
| **After** | Single combined condition: `if (this.#returnDate !== null \|\| asOfDate <= this.#dueDate) return NO_LATE_FEE;` |
| **Benefit** | Fewer branches, clearer expression of the combined "not applicable" condition, consistent use of `NO_LATE_FEE` constant. |
| **Commit** | `55a8d98 refactor: simplify late-fee calculation` |

---

## 3. Extract Variable — Single Clock Read

| Aspect | Detail |
|---|---|
| **Smell** | Duplicated method call — `this.#clock.now()` was called independently in `#applyLateFee` and `#closeLoan`. |
| **Why it was a problem** | Two separate clock reads could theoretically return different timestamps if time advanced between calls, leading to the late-fee calculation and the return date being based on different moments. |
| **Technique** | Extract Variable. |
| **Before** | `#applyLateFee(loan)` called `this.#clock.now()` internally; `#closeLoan(loan)` also called `this.#clock.now()` independently. |
| **After** | `returnBook` reads `const now = this.#clock.now()` once and passes it to both `#applyLateFee(loan, now)` and `#closeLoan(loan, now)`. |
| **Benefit** | Guarantees the fee calculation and the return date use the exact same timestamp. Eliminates redundant clock access. |
| **Commit** | `e027b81 refactor: simplify late-fee boundary handling` |

---

## Verification

All refactoring was verified by running the test suite:

- **Test suites:** 4 passed
- **Tests:** 97 passed, 0 failed
- **Coverage:** 99.24% statements, 100% branches, 98% functions, 99.2% lines
