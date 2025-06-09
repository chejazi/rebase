'use client';
import { BrowserRouter } from 'react-router-dom'

import WagmiProvider from "~/components/providers/WagmiProvider";

export default function Client({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <BrowserRouter>
      <WagmiProvider>
        {children}
      </WagmiProvider>
    </BrowserRouter>
  );
}
