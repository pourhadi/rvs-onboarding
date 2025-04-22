import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle logout for signed-in users
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect to sign-in page after logout
    router.push('/');
  };

  return (
    <>
      {session && (
        <button
          onClick={handleLogout}
          style={{ position: 'absolute', top: 10, right: 10 }}
        >
          Logout
        </button>
      )}
      <Component {...pageProps} supabaseSession={session} />
    </>
  );
}

export default MyApp;