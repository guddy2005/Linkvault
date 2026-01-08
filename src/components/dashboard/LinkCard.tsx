'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ShortLink, canGenerateQRCode } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Copy, 
  ExternalLink, 
  Trash2, 
  QrCode, 
  Lock, 
  BarChart3,
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { truncateUrl, getBaseUrl, copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

interface LinkCardProps {
  link: ShortLink;
  userXP: number;
  onDelete: (slug: string) => void;
}

export function LinkCard({ link, userXP, onDelete }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const shortUrl = `${getBaseUrl()}/${link.shortSlug}`;

  const handleCopy = async () => {
    await copyToClipboard(shortUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateQR = async () => {
    if (!canGenerateQRCode(userXP)) {
      toast.error('Unlock QR codes at Level 5 (50 XP)!');
      return;
    }
    
    try {
      const dataUrl = await QRCode.toDataURL(shortUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#a855f7',
          light: '#12121a',
        },
      });
      setQrDataUrl(dataUrl);
      setShowQR(true);
    } catch (err) {
      toast.error('Failed to generate QR code');
    }
  };

  return (
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-purple hover:text-neon-cyan font-medium transition-colors truncate"
            >
              {shortUrl}
            </a>
            {link.isPasswordProtected && (
              <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">
            {truncateUrl(link.originalUrl, 50)}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              {link.clickCount} clicks
            </span>
            <span>
              {formatDistanceToNow(link.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="!p-2"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateQR}
            className={`!p-2 ${!canGenerateQRCode(userXP) ? 'opacity-50' : ''}`}
          >
            <QrCode className="w-4 h-4" />
          </Button>

          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="!p-2">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(link.shortSlug)}
            className="!p-2 hover:!bg-red-500/20 hover:!text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-space-600"
          >
            <div className="flex items-center justify-center">
              <img src={qrDataUrl} alt="QR Code" className="rounded-lg" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQR(false)}
              className="mt-2 w-full"
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
