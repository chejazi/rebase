import { getDefaultConfig } from "connectkit";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    chains: [base],
    walletConnectProjectId: 'aa5ce756d374d1956cc6489edcb9446c',
    appName: "Rebase",
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
