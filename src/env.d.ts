/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: {
      email: string;
      role: "admin" | "adherent" | "diagnostic";
      adminId?: string;
      adminRole?: "super_admin" | "admin";
      diagnosticId?: string;
    } | null;
  }
}
