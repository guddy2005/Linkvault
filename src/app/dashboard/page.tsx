'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link2, MousePointerClick, TrendingUp, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToUserLinks, subscribeToUserProfile, deleteLink } from '@/lib/firebase-utils';
import { ShortLink, UserProfile } from '@/types';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LevelCard } from '@/components/dashboard/LevelCard';
import { LinkCard } from '@/components/dashboard/LinkCard';
import { CreateLinkForm } from '@/components/dashboard/CreateLinkForm';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile: initialProfile, loading, signOut } = useAuth();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsubLinks = subscribeToUserLinks(user.uid, (updatedLinks) => {
      setLinks(updatedLinks);
      setIsLoadingLinks(false);
    });
    const unsubProfile = subscribeToUserProfile(user.uid, (updatedProfile) => {
      if (updatedProfile) setProfile(updatedProfile);
    });
    return () => { unsubLinks(); unsubProfile(); };
  }, [user]);

  const handleDeleteLink = async (slug: string) => {
    try {
      await deleteLink(slug);
      toast.success('Link deleted successfully');
    } catch (err) {
      toast.error('Failed to delete link');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const refreshLinks = useCallback(() => {}, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-space-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  const topLink = links.reduce((top, link) => (link.clickCount > (top?.clickCount || 0) ? link : top), null as ShortLink | null);

  return (
    <div className="min-h-screen bg-space-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-space-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LinkVault</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {profile.photoURL ? (
                  <Image src={profile.photoURL} alt={profile.displayName} width={36} height={36} className="rounded-full" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-space-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{profile.displayName}</p>
                  <p className="text-xs text-gray-400">Level {Math.floor(profile.totalXP / 50) + 1}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.displayName.split(' ')[0]}!</h1>
          <p className="text-gray-400">Here is an overview of your link performance.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Links" value={links.length} icon={Link2} delay={0} />
          <StatsCard title="Total Clicks" value={formatNumber(totalClicks)} icon={MousePointerClick} delay={0.1} />
          <LevelCard totalXP={profile.totalXP} />
          <GlassCard className="p-6" delay={0.2}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Top Performing</p>
                {topLink ? (
                  <>
                    <p className="text-lg font-bold text-white truncate">/{topLink.shortSlug}</p>
                    <p className="text-2xl font-bold text-neon-purple mt-1">{topLink.clickCount} clicks</p>
                  </>
                ) : (<p className="text-gray-500">No links yet</p>)}
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30">
                <TrendingUp className="w-6 h-6 text-neon-purple" />
              </div>
            </div>
          </GlassCard>
          <RecentActivity links={links} />
        </div>

        <div className="mb-8">
          <CreateLinkForm userId={user.uid} userXP={profile.totalXP} onLinkCreated={refreshLinks} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Your Links</h2>
            <span className="text-sm text-gray-400">{links.length} {links.length === 1 ? 'link' : 'links'}</span>
          </div>

          {isLoadingLinks ? (
            <div className="flex justify-center py-12">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full" />
            </div>
          ) : links.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Link2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No links yet</h3>
              <p className="text-gray-400">Create your first short link using the form above!</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {links.map((link, index) => (
                <motion.div key={link.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <LinkCard link={link} userXP={profile.totalXP} onDelete={handleDeleteLink} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
