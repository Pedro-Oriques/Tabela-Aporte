'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface CountUpNumberProps {
  value: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUpNumber({ value, delay = 0, className = '', style }: CountUpNumberProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(count, value, { duration: 1.2, ease: 'easeOut' });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay, count]);

  return <motion.span className={className} style={style}>{rounded}</motion.span>;
}
