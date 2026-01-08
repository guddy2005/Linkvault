'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ current, max, className, showLabel = true }: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{current} XP</span>
          <span>{max} XP</span>
        </div>
      )}
      <div className="relative h-3 bg-space-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan rounded-full"
        />
        {/* Shimmer effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'linear',
          }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>
    </div>
  );
}
