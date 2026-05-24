-- ============================================================
-- JCBO Conseil — Photo de profil adhérent + notifications admin
-- ============================================================

-- 1) Photo de profil pour les adhérents
ALTER TABLE adherents
  ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT '';

-- 2) Notifications côté admin (paiements vitrine, réservations, etc.)
CREATE TABLE IF NOT EXISTS admin_notifications (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,                   -- 'reservation', 'paiement_vitrine', 'contact', etc.
  titre      TEXT NOT NULL,
  message    TEXT NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}',     -- ex: { montant, email, sessionId, ... }
  lue        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_notifications_lue_idx ON admin_notifications(lue);
CREATE INDEX IF NOT EXISTS admin_notifications_created_idx ON admin_notifications(created_at DESC);
