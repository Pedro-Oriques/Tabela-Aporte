import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface NeumorphicCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function NeumorphicCard({ children, className = '', delay = 0, hover = false }: NeumorphicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`neu-raised ${hover ? 'neu-raised-hover' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
