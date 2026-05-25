export type DbAdherent = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  mot_de_passe: string;
  telephone: string;
  entreprise: string;
  secteur: string;
  statut: string;
  date_adhesion: string;
  numero_adherent: string;
  abonnement_plan: string | null;
  abonnement_statut: string | null;
  abonnement_date_debut: string | null;
  cours_inscrits: string[];
  photo_url: string;
};

export type DbActualite = {
  id: string;
  titre: string;
  contenu: string;
  statut: string;
  date: string;
  image_url: string | null;
  categorie: string;
  extrait: string;
  slug: string | null;
};

export type DbConversation = {
  id: string;
  email: string;
  adherent: string;
  entreprise: string;
  sujet: string;
  dernier_message: string;
  date: string;
  non_lu: number;
  non_lu_adherent: number;
};

export type DbMessage = {
  id: string;
  conversation_id: string;
  de: string;
  texte: string;
  heure: string;
  created_at: string;
};

export type DbRessource = {
  id: string;
  titre: string;
  categorie: string;
  date: string;
  fichier: string;
  nom_fichier: string | null;
};

export type DbCours = {
  id: string;
  titre: string;
  description: string;
  duree: string;
  niveau: string;
  statut: string;
  prix: number | null;
  date: string;
  competences?: string[];
  certificat_intro?: string | null;
  certificat_code?: string | null;
};

export type DbModule = {
  id: string;
  cours_id: string;
  titre: string;
  duree: string;
  type: string;
  ordre: number;
};

export type DbProgression = {
  adherent_email: string;
  cours_id: string;
  modules_termines: string[];
  date_debut: string;
};

export type DbQuizResultat = {
  adherent_email: string;
  cours_id: string;
  module_id: string;
  score: number;
  passe: boolean;
};

export type DbPaiement = {
  id: string;
  adherent_email: string;
  cours_id: string;
  cours_titre: string;
  montant: number;
  date: string;
  stripe_session_id: string;
  numer_transaction: string;
};

export type DbNotification = {
  id: string;
  adherent_email: string;
  type: string;
  titre: string;
  message: string;
  date: string;
  lue: boolean;
};

export type DbCertificat = {
  id: string;
  adherent_email: string;
  cours_id: string;
  numero: string;
  programme_code: string;
  niveau_code: string;
  annee: number;
  date_emission: string;
};

export type DbAdminNotification = {
  id: string;
  type: string;
  titre: string;
  message: string;
  metadata: Record<string, unknown>;
  lue: boolean;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      config: { Row: { cle: string; valeur: string }; Insert: { cle: string; valeur: string }; Update: { valeur?: string } };
      adherents: { Row: DbAdherent; Insert: DbAdherent; Update: Partial<DbAdherent> };
      actualites: { Row: DbActualite; Insert: DbActualite; Update: Partial<DbActualite> };
      conversations: { Row: DbConversation; Insert: DbConversation; Update: Partial<DbConversation> };
      messages: { Row: DbMessage; Insert: Omit<DbMessage, "id" | "created_at"> & { id?: string; created_at?: string }; Update: never };
      ressources: { Row: DbRessource; Insert: DbRessource; Update: Partial<DbRessource> };
      cours: { Row: DbCours; Insert: DbCours; Update: Partial<DbCours> };
      modules: { Row: DbModule; Insert: DbModule; Update: Partial<DbModule> };
      progressions: { Row: DbProgression; Insert: DbProgression; Update: Partial<DbProgression> };
      quiz_resultats: { Row: DbQuizResultat; Insert: DbQuizResultat; Update: Partial<DbQuizResultat> };
      paiements: { Row: DbPaiement; Insert: DbPaiement; Update: Partial<DbPaiement> };
      notifications: { Row: DbNotification; Insert: DbNotification; Update: Partial<DbNotification> };
      certificats_emis: { Row: DbCertificat; Insert: DbCertificat; Update: Partial<DbCertificat> };
      compteurs_certificats: { Row: { cle: string; valeur: number }; Insert: { cle: string; valeur: number }; Update: { valeur?: number } };
      admin_notifications: {
        Row: DbAdminNotification;
        Insert: Omit<DbAdminNotification, "created_at"> & { created_at?: string };
        Update: Partial<DbAdminNotification>;
      };
    };
  };
}
