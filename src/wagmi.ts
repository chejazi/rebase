import { getDefaultConfig } from "connectkit";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const defaultConfig = getDefaultConfig({
  chains: [base],
  walletConnectProjectId: 'aa5ce756d374d1956cc6489edcb9446c',
  appName: "Rebase",
  transports: {
    [base.id]: http(),
  },
});
// @ts-ignore: TS2339
defaultConfig.connectors?.push(farcasterFrame());

export const config = createConfig(defaultConfig);

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
