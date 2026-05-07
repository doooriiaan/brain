/**
 * Enhanced animation utilities using Framer Motion
 */

export const animationVariants = {
  // Fade animations
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  },

  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },

  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },

  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  },

  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  },

  // Scale animations
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  },

  scaleInLarge: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
  },

  // Rotation animations
  rotateIn: {
    hidden: { opacity: 0, rotate: -10 },
    visible: { opacity: 1, rotate: 0, transition: { duration: 0.6 } },
  },

  // Blur animations
  blurIn: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.6 } },
  },

  // Bounce animations
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 0.3,
      },
    },
  },

  // Pulse animations
  pulse: {
    animate: {
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  },

  // Shimmer animations
  shimmer: {
    animate: {
      backgroundPosition: ["0% 0%", "100% 0%"],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  },

  // Slide animations
  slideInLeft: {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  },

  slideInRight: {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  },

  // Float animations
  float: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  },

  // Glow animations
  glow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(242, 184, 75, 0.5)",
        "0 0 40px rgba(242, 184, 75, 0.8)",
        "0 0 20px rgba(242, 184, 75, 0.5)",
      ],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  },

  // Container animations with stagger
  containerStagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  // Item animations for staggered containers
  itemStagger: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  },

  // Card hover animations
  cardHover: {
    whileHover: {
      y: -5,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.3 },
    },
  },

  // Button animations
  buttonHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },

  // Input animations
  inputFocus: {
    whileFocus: {
      scale: 1.02,
      boxShadow: "0 0 20px rgba(99, 178, 255, 0.3)",
    },
  },

  // Loading spinner
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  },

  // Typing animation
  typing: {
    animate: {
      width: ["0%", "100%"],
      opacity: [0, 1],
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
  },

  // Wave animation
  wave: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.5,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  },
};

// Transition presets
export const transitions = {
  smooth: { duration: 0.3, ease: [0.42, 0, 0.58, 1] as const },
  smoothSlow: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as const },
  snappy: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  bouncy: { duration: 0.5, type: "spring", stiffness: 300 },
};

// Viewport animation settings
export const viewportSettings = {
  once: true,
  amount: 0.2 as const,
};

export const viewportSettingsHalf = {
  once: true,
  amount: 0.5 as const,
};
