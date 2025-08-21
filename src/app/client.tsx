'use client';
import dynamic from 'next/dynamic';
const Router = dynamic(() => import('./router'), { ssr: false });
const WagmiProvider = dynamic(() => import("~/components/providers/WagmiProvider"), { ssr: false });

export default function Client({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <WagmiProvider>
      <Router>
        {children}
      </Router>
    </WagmiProvider>
  );
}
