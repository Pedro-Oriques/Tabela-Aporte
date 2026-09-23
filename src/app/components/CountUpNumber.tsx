import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect } from 'react';

interface CountUpNumberProps {
  value: number;
  delay?: number;
  className?: string;
}

export function CountUpNumber({ value, delay = 0, className = '' }: CountUpNumberProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(count, value, {
        duration: 1.2,
        ease: 'easeOut',
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
