import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonContent } from './skeleton-content';

interface PageLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingMessage?: string;
}

export function PageLoading({ 
  isLoading, 
  children, 
  loadingMessage = "Carregando página..." 
}: PageLoadingProps) {
  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Skeleton */}
            <SkeletonContent />

            {/* Overlay mais sutil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                {/* Spinner animado */}
                <motion.div
                  className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                {/* Mensagem */}
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-medium text-primary/90 drop-shadow-sm"
                >
                  {loadingMessage}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
