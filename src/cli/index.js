import { SystemClock } from "../services/Clock.js";
import LibraryService from "../services/LibraryService.js";

const clock = new SystemClock();
const lib = new LibraryService(clock);

// ── addBook ──────────────────────────────────────────────
console.log("=== addBook ===");
lib.addBook("The Pragmatic Programmer", "David Thomas", "978-0135957059", 3);
lib.addBook("Clean Code", "Robert C. Martin", "978-0132350884", 2);
console.log("Added 2 books\n");

// ── searchCatalog ────────────────────────────────────────
console.log("=== searchCatalog('pragmatic') ===");
const results = lib.searchCatalog("pragmatic");
results.forEach((b) =>
  console.log(`  ${b.getTitle()} by ${b.getAuthor()} [${b.getIsbn()}]`),
);
console.log();

// ── registerMember ───────────────────────────────────────
console.log("=== registerMember ===");
lib.registerMember("Alice Johnson", "M001");
lib.registerMember("Bob Smith", "M002");
console.log("Registered 2 members\n");

// ── borrowBook ───────────────────────────────────────────
console.log("=== borrowBook('978-0135957059', 'M001') ===");
const loan = lib.borrowBook("978-0135957059", "M001");
console.log(
  `  Loan created: "${loan.getBook().getTitle()}" → ${loan.getMember().getName()}`,
);
console.log(`  Borrow date:  ${loan.getBorrowDate().toISOString().slice(0, 10)}`);
console.log(`  Due date:     ${loan.getDueDate().toISOString().slice(0, 10)}`);
console.log(`  Copies left:  ${loan.getBook().getAvailableCopies()}`);
console.log();

// ── listOverdueLoans (none overdue yet) ──────────────────
console.log("=== listOverdueLoans (today) ===");
const overdueNow = lib.listOverdueLoans(clock.now());
console.log(`  Overdue count: ${overdueNow.length}`);
console.log();

// ── returnBook ───────────────────────────────────────────
console.log("=== returnBook('978-0135957059', 'M001') ===");
lib.returnBook("978-0135957059", "M001");
console.log(
  `  Copies after return: ${lib.searchCatalog("pragmatic")[0].getAvailableCopies()}`,
);
console.log();

// ── listOverdueLoans (still none) ────────────────────────
console.log("=== listOverdueLoans (still today) ===");
const overdueAfter = lib.listOverdueLoans(clock.now());
console.log(`  Overdue count: ${overdueAfter.length}`);
console.log();

console.log("=== Done — all public methods exercised ===");
