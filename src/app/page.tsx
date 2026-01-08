'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Sparkles, Zap, Shield, QrCode, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { createGuestLink } from '@/lib/firebase-utils';
import { isValidUrl, getBaseUrl, copyToClipboard } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Link from 'next/link';

const features = [
  { icon: Zap, title: 'Lightning Fast', description: 'Links redirect in milliseconds.' },
  { icon: Shield, title: 'Password Protection', description: 'Keep links secure.' },
  { icon: QrCode, title: 'QR Code Generation', description: 'Generate QR codes.' },
  { icon: Sparkles, title: 'Gamified Experience', description: 'Earn XP for clicks.' },
];

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading } = useAuth();

  const handleQuickShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setShortUrl('');
    if (!url) { setError('Please enter a URL'); return; }
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) { finalUrl = 'https://' + url; }
    if (!isValidUrl(finalUrl)) { setError('Please enter a valid URL'); return; }
    setIsLoading(true);
    try { const slug = await createGuestLink(finalUrl); setShortUrl(getBaseUrl() + '/' + slug); toast.success('Link shortened!'); }
    catch { toast.error('Failed to shorten link'); } finally { setIsLoading(false); }
  };

  const handleCopy = async () => { await copyToClipboard(shortUrl); toast.success('Copied!'); };

  return (
    <div className="min-h-screen bg-space-900 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-purple/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-blue/30 rounded-full blur-[120px]" />
      </div>
      <header className="relative z-10 border-b border-space-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue"><Link2 className="w-6 h-6 text-white" /></div>
              <span className="text-xl font-bold text-white">LinkVault</span>
            </div>
            <div className="flex items-center gap-4">
              {!loading && (user ? <Link href="/dashboard"><Button>Dashboard</Button></Link> : <><Link href="/auth/login"><Button variant="ghost">Sign In</Button></Link><Link href="/auth/login"><Button>Get Started</Button></Link></>)}
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 pt-20 pb-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Shorten Links. <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">Level Up.</span></h1>
            <p className="text-xl text-gray-400 mb-12">The only URL shortener that rewards you. Earn XP for every click.</p>
            <GlassCard className="p-8 max-w-2xl mx-auto">
              <form onSubmit={handleQuickShorten} className="space-y-4">
                <div className="flex gap-3"><div className="flex-1"><Input type="text" placeholder="Paste your long URL..." value={url} onChange={(e) => setUrl(e.target.value)} icon={<Link2 className="w-4 h-4" />} error={error} /></div><Button type="submit" size="lg" isLoading={isLoading}>Shorten</Button></div>
                {shortUrl && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 rounded-xl bg-space-700/50 border border-neon-purple/30"><span className="text-neon-purple font-medium">{shortUrl}</span><Button variant="secondary" size="sm" onClick={handleCopy}>Copy</Button></motion.div>}
              </form>
              <p className="text-sm text-gray-500 mt-4">Guest links expire after 24h. <Link href="/auth/login" className="text-neon-purple hover:underline">Sign up</Link> for permanent links!</p>
            </GlassCard>
          </motion.div>
        </section>
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => <GlassCard key={f.title} className="p-6"><div className="p-3 rounded-xl bg-neon-purple/20 w-fit mb-4"><f.icon className="w-6 h-6 text-neon-purple" /></div><h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3><p className="text-gray-400 text-sm">{f.description}</p></GlassCard>)}
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t border-space-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue"><Link2 className="w-5 h-5 text-white" /></div><span className="text-lg font-bold text-white">LinkVault</span></div>
          <p className="text-gray-500 text-sm">Built with Next.js + Firebase</p>
        </div>
      </footer>
    </div>
  );
}
