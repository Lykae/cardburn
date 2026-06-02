import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function StatPop({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const controls = useAnimation();

  useEffect(() => {
    controls
      .start({
        scale: 1.6,
        x: -2,
        transition: { duration: 0.06 },
      })
      .then(() => {
        controls
          .start({
            scale: 0.97,
            x: 2,
            transition: { duration: 0.1 },
          })
          .then(() => {
            controls.start({
              scale: 1,
              x: 0,
              transition: { duration: 0.15 },
            });
          });
      });
  }, [controls, value]);

  return (
    <motion.p animate={controls} className="text-lg md:text-2xl">
      {label}: {value}
    </motion.p>
  );
}
