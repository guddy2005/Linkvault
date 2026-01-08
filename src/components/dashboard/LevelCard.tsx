'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Trophy, Zap, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  calculateLevel,
  getNextLevelXP,
  getCurrentLevelConfig,
  getNextLevelConfig,
  canGenerateQRCode,
  canCreateSecretLinks,
  canUseCustomAliases,
} from '@/types';

interface LevelCardProps {
  totalXP: number;
}

export function LevelCard({ totalXP }: LevelCardProps) {
  const level = calculateLevel(totalXP);
  const currentConfig = getCurrentLevelConfig(totalXP);
  const nextConfig = getNextLevelConfig(totalXP);
  const nextLevelXP = getNextLevelXP(totalXP);

  const features = [
    { name: 'QR Codes', unlocked: canGenerateQRCode(totalXP), xpNeeded: 50 },
    { name: 'Secret Links', unlocked: canCreateSecretLinks(totalXP), xpNeeded: 200 },
    { name: 'Custom Aliases', unlocked: canUseCustomAliases(totalXP), xpNeeded: 500 },
  ];

  return (
    <GlassCard className="p-6 col-span-2 row-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{currentConfig.name}</h3>
            <p className="text-sm text-gray-400">Level {level}</p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-space-700"
        >
          <Zap className="w-4 h-4 text-neon-cyan" />
          <span className="text-xl font-bold text-white">{totalXP}</span>
          <span className="text-sm text-gray-400">XP</span>
        </motion.div>
      </div>

      <p className="text-gray-400 mb-4">{currentConfig.description}</p>

      {nextConfig && (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">
            Progress to Level {nextConfig.level} ({nextConfig.name})
          </p>
          <ProgressBar current={totalXP} max={nextLevelXP} />
          <p className="text-xs text-gray-500 mt-2">
            {nextLevelXP - totalXP} XP until next unlock
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Feature Unlocks</h4>
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              feature.unlocked
                ? 'bg-neon-purple/10 border border-neon-purple/30'
                : 'bg-space-700/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {feature.unlocked ? (
                <Unlock className="w-4 h-4 text-neon-purple" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500" />
              )}
              <span className={feature.unlocked ? 'text-white' : 'text-gray-500'}>
                {feature.name}
              </span>
            </div>
            <span className={`text-sm ${feature.unlocked ? 'text-neon-purple' : 'text-gray-500'}`}>
              {feature.unlocked ? 'Unlocked!' : `${feature.xpNeeded} XP`}
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
