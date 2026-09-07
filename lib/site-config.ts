// Configuration centrale de l'événement — modifie ces valeurs pour personnaliser le site.
export const siteConfig = {
  title: "Baby Shower de Bébé Lafrenière",
  heroHeading: "Joignez-vous à nous pour célébrer l'arrivée de Bébé Lafrenière",
  heroSubheading:
    "Un après-midi tout en douceur pour accueillir le prochain membre de la famille. Votre présence serait un beau cadeau.",
  eventDate: "2026-11-28",
  // Heure à confirmer — ajuste selon l'horaire réel de l'événement.
  eventTimeLabel: "14 h 00",
  eventDateLabel: "Samedi 28 novembre 2026",
  location: {
    name: "207 rue St-Roch",
    city: "Trois-Rivières, QC",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=207+rue+St-Roch+Trois-Rivi%C3%A8res",
  },
  description:
    "Confirmez votre présence au baby shower de Bébé Lafrenière et laissez un message de bienvenue.",
  amazonRegistryUrl:
    "https://www.amazon.ca/baby-reg/karl-lafreniere-fvrier-2027-trois-rivieres/28YPZXQGAC0O0",
} as const;
