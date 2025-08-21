import type { Metadata } from "next";
import Script from 'next/script';
import { Inter } from 'next/font/google';
import "~/app/globals.css";
import Client from "./client";
export const metadata: Metadata = {
  title: "Rebase",
  description: "LP Incentives for tokens on Base",
  icons: [
    { rel: "icon", url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
  ],
  appleWebApp: {
    title: "Rebase",
  },
  manifest: "/site.webmanifest",
};
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className={inter.className}>
      <head>
        <Script src="https://kit.fontawesome.com/07c36dbac1.js" crossOrigin="anonymous" />
      </head>
      <body>
        <Client>{children}</Client>
      </body>
    </html>
  );
}

