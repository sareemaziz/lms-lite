import Member from "../src/models/Member.js";
import { InvalidMemberDataError } from "../src/errors/index.js";

describe("Member", () => {
  // ── constructor ─────────────────────────────────────────

  describe("constructor", () => {
    it("creates a member with valid arguments", () => {
      const member = new Member("Alice Johnson", "M001");
      expect(member.getName()).toBe("Alice Johnson");
      expect(member.getMemberId()).toBe("M001");
    });

    it("trims whitespace from name and memberId", () => {
      const member = new Member("  Alice  ", "  M001  ");
      expect(member.getName()).toBe("Alice");
      expect(member.getMemberId()).toBe("M001");
    });

    it("throws InvalidMemberDataError for empty name", () => {
      expect(() => new Member("", "M001")).toThrow(InvalidMemberDataError);
    });

    it("throws InvalidMemberDataError for whitespace-only name", () => {
      expect(() => new Member("   ", "M001")).toThrow(InvalidMemberDataError);
    });

    it("throws InvalidMemberDataError for non-string name", () => {
      expect(() => new Member(123, "M001")).toThrow(InvalidMemberDataError);
    });

    it("throws InvalidMemberDataError for empty memberId", () => {
      expect(() => new Member("Alice", "")).toThrow(InvalidMemberDataError);
    });

    it("throws InvalidMemberDataError for whitespace-only memberId", () => {
      expect(() => new Member("Alice", "   ")).toThrow(InvalidMemberDataError);
    });

    it("throws InvalidMemberDataError for non-string memberId", () => {
      expect(() => new Member("Alice", 123)).toThrow(InvalidMemberDataError);
    });

    it("throws InvalidMemberDataError with a descriptive message for name", () => {
      expect(() => new Member("", "M001")).toThrow("name must be a non-empty string");
    });

    it("throws InvalidMemberDataError with a descriptive message for memberId", () => {
      expect(() => new Member("Alice", "")).toThrow("memberId must be a non-empty string");
    });
  });

  // ── getters ─────────────────────────────────────────────

  describe("getters", () => {
    it("return the correct values", () => {
      const member = new Member("Bob Smith", "M002");
      expect(member.getName()).toBe("Bob Smith");
      expect(member.getMemberId()).toBe("M002");
    });
  });
});
