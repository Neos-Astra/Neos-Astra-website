// src/lib/registrationNo.ts

/**
 * Standard format for student registrations:
 * NA-YYYYBBSS
 * E.g. NA-20260101 (or NA-202600101)
 * Prefix: NA-
 * Year: 2026
 * Batch: 01
 * Student ID: 01
 */

export interface RegNoComponents {
  prefix?: string;
  year?: string | number;
  batch?: string | number;
  studentId?: string | number;
}

export function buildRegistrationNo(
  year: string | number = new Date().getFullYear(),
  batch: string | number = "01",
  studentId: string | number = "01",
  prefix: string = "NA-"
): string {
  const y = String(year || new Date().getFullYear()).trim();
  const b = String(batch || "01").trim();
  const s = String(studentId || "01").trim();
  const cleanPrefix = prefix.endsWith("-") ? prefix : `${prefix}-`;
  return `${cleanPrefix}${y}${b}${s}`;
}

export const generateRegNo = (): string => {
  return buildRegistrationNo();
};
