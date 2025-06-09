"use client";

import { getDefaultConfig } from "connectkit";
import { ConnectKitProvider } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const defaultConfig = getDefaultConfig({
  chains: [base],
  walletConnectProjectId: 'aa5ce756d374d1956cc6489edcb9446c',
  appName: "Rebase",
  transports: {
    [base.id]: http("https://base-rpc.publicnode.com"),
  },
});
// @ts-expect-error: TS2339
defaultConfig.connectors?.push(farcasterFrame());
export const config = createConfig(defaultConfig);

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
