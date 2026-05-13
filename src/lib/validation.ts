import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'e-mail est requis")
    .email("Adresse e-mail invalide")
    .max(254, "E-mail trop long")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .max(128, "Mot de passe trop long"),
});

export const contactSchema = z.object({
  sujet: z
    .string()
    .min(3, "Sujet trop court (min. 3 caractères)")
    .max(100, "Sujet trop long (max. 100 caractères)")
    .trim(),
  message: z
    .string()
    .min(10, "Message trop court (min. 10 caractères)")
    .max(2000, "Message trop long (max. 2000 caractères)")
    .trim(),
});

export const actualiteSchema = z.object({
  titre: z
    .string()
    .min(3, "Titre trop court")
    .max(200, "Titre trop long")
    .trim(),
  contenu: z
    .string()
    .min(10, "Contenu trop court")
    .max(5000, "Contenu trop long")
    .trim(),
  statut: z.enum(["Publié", "Brouillon"], {
    errorMap: () => ({ message: "Statut invalide" }),
  }),
});

export const identifiantSchema = z.object({
  nom: z
    .string()
    .min(2, "Nom trop court")
    .max(100, "Nom trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s'\-]+$/, "Nom invalide (caractères non autorisés)")
    .trim(),
  email: z
    .string()
    .email("Adresse e-mail invalide")
    .max(254, "E-mail trop long")
    .toLowerCase()
    .trim(),
});

export const profilSchema = z.object({
  telephone: z
    .string()
    .regex(/^[\d\s\+\-\.\(\)]{7,20}$/, "Numéro de téléphone invalide")
    .trim(),
  entreprise: z.string().min(2).max(100).trim(),
  secteur: z.string().min(2).max(100).trim(),
});

export const messageSchema = z.object({
  texte: z
    .string()
    .min(1, "Le message ne peut pas être vide")
    .max(1000, "Message trop long")
    .trim(),
  conversationId: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ActualiteInput = z.infer<typeof actualiteSchema>;
export type IdentifiantInput = z.infer<typeof identifiantSchema>;
export type ProfilInput = z.infer<typeof profilSchema>;
