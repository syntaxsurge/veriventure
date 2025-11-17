"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, Star } from "lucide-react";

const floatingIcons = [
  { Icon: Sparkles, delay: 0, x: "10%", y: "20%" },
  { Icon: Zap, delay: 2, x: "80%", y: "30%" },
  { Icon: Shield, delay: 4, x: "15%", y: "70%" },
  { Icon: Star, delay: 3, x: "85%", y: "60%" },
];

export function FloatingElements() {
  return (
    <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: x, top: y }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay,
          }}
        >
          <Icon className="h-8 w-8 text-primary/20" />
        </motion.div>
      ))}
    </div>
  );
}
