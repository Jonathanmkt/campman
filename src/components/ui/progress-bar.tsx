import { motion, AnimatePresence } from 'framer-motion';

interface ProgressBarProps {
  isLoading: boolean;
}

export function ProgressBar({ isLoading }: ProgressBarProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ 
              width: "100%",
              transition: { 
                duration: 2,
                ease: "easeInOut"
              }
            }}
            exit={{
              width: "100%",
              transition: { duration: 0.2 }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
