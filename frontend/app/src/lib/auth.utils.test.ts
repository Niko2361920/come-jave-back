import { describe, expect, it } from "vitest";
import { getDisplayName, isJaverianaEmail } from "./auth.utils";

describe("auth utils", () => {
  it("accepts institutional Javeriana emails", () => {
    expect(isJaverianaEmail("nombre@javerianacali.edu.co")).toBe(true);
    expect(isJaverianaEmail("nombre@javerianacali.edu.co ")).toBe(true);
  });

  it("rejects non-institutional emails", () => {
    expect(isJaverianaEmail("nombre@gmail.com")).toBe(false);
    expect(isJaverianaEmail("nombre@outlook.com")).toBe(false);
  });

  it("extracts a friendly user name from a full name", () => {
    expect(getDisplayName("Ana María Gómez")).toBe("Ana María Gómez");
    expect(getDisplayName("  ")).toBe("Javeriano");
  });
});
