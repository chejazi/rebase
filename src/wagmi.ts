import { getDefaultConfig } from "connectkit";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    chains: [base],
    walletConnectProjectId: import.meta.env.VITE_WC_PROJECT_ID,
    appName: "🆙",
    transports: {
      [base.id]: http(),
      // [mainnet.id]: http(),
    },
  }),
);

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
