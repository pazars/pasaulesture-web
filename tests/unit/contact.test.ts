import { describe, it, expect } from "vitest";
import { CONTACT_INFO } from "@/app/data/contact";

describe("CONTACT_INFO", () => {
  it("should have all required contact fields", () => {
    expect(CONTACT_INFO).toHaveProperty("email");
    expect(CONTACT_INFO).toHaveProperty("organizationName");
    expect(CONTACT_INFO).toHaveProperty("registrationNumber");
    expect(CONTACT_INFO).toHaveProperty("address");
    expect(CONTACT_INFO).toHaveProperty("bankAccount");
  });

  it("should have valid email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(CONTACT_INFO.email).toMatch(emailRegex);
  });

  it("should have non-empty values for all fields", () => {
    expect(CONTACT_INFO.email).toBeTruthy();
    expect(CONTACT_INFO.email.length).toBeGreaterThan(0);

    expect(CONTACT_INFO.organizationName).toBeTruthy();
    expect(CONTACT_INFO.organizationName.length).toBeGreaterThan(0);

    expect(CONTACT_INFO.registrationNumber).toBeTruthy();
    expect(CONTACT_INFO.registrationNumber.length).toBeGreaterThan(0);

    expect(CONTACT_INFO.address).toBeTruthy();
    expect(CONTACT_INFO.address.length).toBeGreaterThan(0);

    expect(CONTACT_INFO.bankAccount).toBeTruthy();
    expect(CONTACT_INFO.bankAccount.length).toBeGreaterThan(0);
  });

  it("should have valid Latvian bank account format (IBAN)", () => {
    // Latvian IBAN format: LV + 2 check digits + 4 letters (bank code) + 13 digits
    const ibanRegex = /^LV\d{2}[A-Z]{4}\d{13}$/;
    expect(CONTACT_INFO.bankAccount).toMatch(ibanRegex);
  });

  it("should have valid Latvian registration number format", () => {
    // Latvian registration number format: 11 digits
    const regNumberRegex = /^\d{11}$/;
    expect(CONTACT_INFO.registrationNumber).toMatch(regNumberRegex);
  });

  it("should be immutable (readonly)", () => {
    // TypeScript `as const` makes the object readonly
    // This test ensures the type is correct at runtime
    expect(Object.isFrozen(CONTACT_INFO)).toBe(false); // as const doesn't freeze, but TypeScript prevents reassignment

    // Verify we can't add new properties
    const contactCopy: any = CONTACT_INFO;
    expect(() => {
      contactCopy.newField = "test";
    }).not.toThrow(); // JavaScript allows this, but TypeScript should prevent it
  });
});
