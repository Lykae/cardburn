import { motion } from "framer-motion";

export default function LoadingScreen({
  progress,
}: {
  progress: number;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center text-white"
      initial={{ opacity: 0 }}
      animate={{opacity: 1}}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-5xl font-black mb-6">
        CARD<span className="text-red-500">BURN</span>
      </h1>

      <div className="w-72 h-3 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-red-500"
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>

      <div className="mt-3 text-gray-400">
        {progress}%
      </div>
    </motion.div>
  );
}