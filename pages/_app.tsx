import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import '../styles/globals.css';
import useTelegram from '../hooks/useTelegram';
import Preloader from '../components/Preloader';

export default function MyApp({ Component, pageProps }: AppProps) {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(true);

  // Simple preloader: hide after a short delay or when Telegram user is resolved
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Head>
        <title>Animal Family</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      {loading ? <Preloader /> : <Component {...pageProps} />}
    </>
  );
}