/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SESSION_SECRET?: string;
  readonly ADMIN_EMAIL?: string;
  readonly CONTACT_EMAIL?: string;
  readonly NOTIFY_EMAIL?: string;
  readonly REPLY_TO_EMAIL?: string;
  readonly ADMIN_PASSWORD?: string;
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly CLOUDINARY_CLOUD_NAME?: string;
  readonly CLOUDINARY_API_KEY?: string;
  readonly CLOUDINARY_API_SECRET?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly PUBLIC_STRIPE_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly STRIPE_CONNECTED_ACCOUNT_ID?: string;
  readonly NOTCHPAY_PUBLIC_KEY?: string;
  readonly NOTCHPAY_SECRET_KEY?: string;
  readonly NOTCHPAY_CONNECTED_ACCOUNT_ID?: string;
  readonly FAPSHI_API_USER?: string;
  readonly FAPSHI_API_KEY?: string;
  readonly FAPSHI_WEBHOOK_SECRET?: string;
  readonly FAPSHI_ENV?: string;
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly FROM_EMAIL?: string;
  readonly PUBLIC_VITRINE_URL?: string;
  readonly PUBLIC_DIAGNOSTIC_URL?: string;
  readonly PUBLIC_ADHESION_URL?: string;
  readonly CORS_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

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
