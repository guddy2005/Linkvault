import Link from 'next/link';
import { Link2, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue">
            <Link2 className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Link Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The short link you are looking for does not exist or has expired.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
