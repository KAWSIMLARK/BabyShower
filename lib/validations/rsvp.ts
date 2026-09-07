import { z } from "zod";

// Schéma partagé entre le formulaire client (react-hook-form) et l'API /api/rsvp
export const rsvpSchema = z.object({
  fullName: z
    .string({
      required_error: "Le nom complet est requis.",
      invalid_type_error: "Le nom complet est requis.",
    })
    .trim()
    .min(2, "Le nom complet doit contenir au moins 2 caractères.")
    .max(100, "Le nom complet est trop long."),
  email: z
    .string({
      required_error: "L'adresse courriel est requise.",
      invalid_type_error: "L'adresse courriel est requise.",
    })
    .trim()
    .min(1, "L'adresse courriel est requise.")
    .email("Veuillez entrer une adresse courriel valide."),
  guestCount: z.coerce
    .number({
      required_error: "Veuillez sélectionner un nombre de personnes.",
      invalid_type_error: "Veuillez sélectionner un nombre de personnes.",
    })
    .int()
    .min(1, "Le nombre de personnes doit être entre 1 et 5.")
    .max(5, "Le nombre de personnes doit être entre 1 et 5."),
  messageForBaby: z
    .string()
    .trim()
    .max(500, "Le message ne peut pas dépasser 500 caractères.")
    .optional()
    .or(z.literal("")),
  dietaryRestrictions: z
    .string()
    .trim()
    .max(300, "Ce champ ne peut pas dépasser 300 caractères.")
    .optional()
    .or(z.literal("")),
  allowPublicMessage: z.boolean().optional().default(false),
});

export type RsvpFormValues = z.infer<typeof rsvpSchema>;
