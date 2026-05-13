/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: {
      email: string;
      role: "admin" | "adherent";
    } | null;
  }
}
