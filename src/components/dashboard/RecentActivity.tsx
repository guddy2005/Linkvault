'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { ShortLink } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentActivityProps {
  links: ShortLink[];
}

export function RecentActivity({ links }: RecentActivityProps) {
  // Get links with recent clicks (sorted by click count)
  const activeLinks = [...links]
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 5);

  return (
    <GlassCard className="p-6 col-span-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Top Performing Links</h3>
      </div>

      <div className="space-y-3">
        {activeLinks.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No links yet. Create your first link to get started!
          </p>
        ) : (
          activeLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-space-700/50 hover:bg-space-600/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium text-neon-purple w-6">
                  #{index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    /{link.shortSlug}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {link.originalUrl}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">{link.clickCount}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
