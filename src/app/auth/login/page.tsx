'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link2, Chrome, Github } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithGithub } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Welcome to LinkVault!');
    } catch (err) {
      toast.error('Failed to sign in with Google');
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      toast.success('Welcome to LinkVault!');
    } catch (err) {
      toast.error('Failed to sign in with GitHub');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-purple/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-blue/30 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">LinkVault</span>
        </Link>

        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to access your dashboard</p>
          </div>

          <div className="space-y-4">
            <Button
              variant="secondary"
              className="w-full justify-center gap-3"
              onClick={handleGoogleSignIn}
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-center gap-3"
              onClick={handleGithubSignIn}
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-space-600 text-center">
            <p className="text-sm text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </GlassCard>

        <p className="text-center text-gray-500 text-sm mt-6">
          <Link href="/" className="hover:text-white transition-colors">
            Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
