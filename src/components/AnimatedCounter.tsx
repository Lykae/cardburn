import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function AnimatedCounter({ value }: { value: number }) {
  const controls = useAnimation();

  useEffect(() => {
    controls
      .start({
        scale: 1.4,
        transition: { duration: 0.08, ease: "easeOut" },
      })
      .then(() => {
        controls
          .start({
            scale: 0.92,
            transition: { duration: 0.12, ease: "easeInOut" },
          })
          .then(() => {
            controls.start({
              scale: 1,
              transition: { duration: 0.18, ease: "easeOut" },
            });
          });
      });
  }, [controls, value]);

  return (
    <motion.span animate={controls} style={{ display: "inline-block" }}>
      {value}
    </motion.span>
  );
}