import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { trpc } from '@/providers/trpc';

export default function AuthCallback() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  useEffect(() => {
    const handleCallback = async () => {
      // Check for PKCE flow (query string has ?code=...)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorDesc = params.get('error_description');

      if (errorDesc) {
        console.error('Magic link error', errorDesc);
        toast.error(errorDesc);
        window.location.href = '/checkout';
        return;
      }

      if (code) {
        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Exchange error:', error);
          toast.error('Failed to complete login');
        } else {
          toast.success('Logged in successfully');
          await utils.invalidate();
        }
        window.location.href = '/checkout';
        return;
      }

      // Fallback for implicit flow (#access_token=...)
      // Supabase handles this automatically on init, so we just check if session exists
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        toast.success('Logged in successfully');
        await utils.invalidate();
      } else {
        toast.error('Invalid or expired login link');
      }
      window.location.href = '/checkout';
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-lg">Processing login…</p>
    </div>
  );
}
