// src/lib/permissions.ts

export const canManageTeam = (role: string) => role === "SUPER_ADMIN";
export const canManageCourses = (role: string) => role === "ADMIN" || role === "SUPER_ADMIN";
export const canManageHomeMedia = (role: string) => role === "ADMIN" || role === "SUPER_ADMIN";
