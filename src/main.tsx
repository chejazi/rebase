import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import FrameSDK from "@farcaster/frame-sdk";

import App from "components/App.tsx";
import { config } from "./wagmi.ts";

import "styles/index.css";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();

function FarcasterFrameProvider({ children }: React.PropsWithChildren) {
  useEffect(() => {
    const init = async () => {
      const context = await FrameSDK.context;

      // Autoconnect if running in a frame
      if (context?.client.clientFid) {
        // Hide splash screen after UI renders
        setTimeout(() => {
          FrameSDK.actions.ready();
        }, 500);
      }
    };

    init();
  }, []);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FarcasterFrameProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </FarcasterFrameProvider>
  </React.StrictMode>,
);
