// src/lib/registrationNo.ts

export const generateRegNo = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000); // 4‑digit random
  const year = new Date().getFullYear();
  return `NA-${year}-${random}`;
};
