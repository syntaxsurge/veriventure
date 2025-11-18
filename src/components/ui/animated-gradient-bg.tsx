"use client";

import { motion } from "framer-motion";

export function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-background/50 via-background/80 to-background" />
    </div>
  );
}
