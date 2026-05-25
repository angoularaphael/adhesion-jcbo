-- Métadonnées de checkout en attente (NotchPay / fallback)
CREATE TABLE IF NOT EXISTS checkout_pending (
  reference TEXT PRIMARY KEY,
  adherent_email TEXT NOT NULL,
  cours_ids TEXT NOT NULL,
  cours_titres TEXT NOT NULL DEFAULT '',
  montant NUMERIC NOT NULL DEFAULT 0,
  provider TEXT NOT NULL DEFAULT 'notchpay',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_pending_email ON checkout_pending (adherent_email);
