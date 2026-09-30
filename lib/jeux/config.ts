// Configuration centrale du jeu "Mission Bébé Lafrenière" — modifie ici les
// textes, le nombre de formes, l'image du puzzle (voir puzzle-image.tsx) et
// les paramètres de révélation, sans toucher à la logique des mini-jeux.

export const jeuxConfig = {
  familyName: "Bébé Lafrenière",

  intro: {
    title: "Mission Bébé Lafrenière",
    subtitle:
      "Trois petites missions se dressent entre vous et le plus grand secret de l'année. Prêt·e ?",
    startLabel: "Commencer la mission",
  },

  missions: [
    { label: "Le labyrinthe du biberon", symbol: "🌙" },
    { label: "Les formes de bébé", symbol: "⭐" },
    { label: "Le casse-tête de bébé", symbol: "☁️" },
  ],

  maze: {
    successTitle: "Mission réussie ! Bébé a son biberon.",
    clueTitle: "Premier indice récupéré",
  },

  shapes: {
    successTitle: "Toutes les formes sont à leur place !",
    clueTitle: "Deuxième indice récupéré",
    // Couleurs pastel neutres uniquement — jamais de bleu/rose avant le reveal.
    palette: ["#e8ede0", "#d3dcc3", "#e6dcc9", "#f0e6d6", "#f5f7f1"],
  },

  puzzle: {
    successTitle: "Puzzle terminé !",
    clueTitle: "Dernier indice récupéré",
  },

  finalTransition: {
    lines: [
      "Vous avez découvert les trois indices…",
      "Mais ils ne voulaient rien dire. 😏",
      "Parce qu'il ne reste qu'une chose à découvrir…",
    ],
    buttonLabel: "Découvrir le secret",
  },

  countdown: {
    heartbeatLine: `${"Bébé Lafrenière"} est…`,
    secondLine: "Cette fois, c'est la vraie…",
  },

  gotcha: {
    twistLine: "Haha, on vous a bien eu ! 😄",
    subLine: "Une dernière question avant de vous dévoiler le secret…",
    question: "Vous êtes plutôt…",
    optionGirl: "Team Fille 💕",
    optionBoy: "Team Garçon 💙",
  },

  reveal: {
    girl: {
      title: "C'est une fille !",
      subtitle: "Bienvenue Sofia Lafrenière 💕",
      color: "#e8a3b8",
      colorSoft: "#fbe7ee",
    },
    boy: {
      title: "C'est un garçon !",
      subtitle: "Bienvenue August Lafrenière 💙",
      color: "#7fa8c9",
      colorSoft: "#e7f0f7",
    },
    unconfigured: {
      title: "Bientôt dévoilé…",
      subtitle: "Le secret n'est pas encore prêt — revenez un peu plus tard !",
    },
  },

  restartLabel: "Recommencer le jeu",
} as const;
