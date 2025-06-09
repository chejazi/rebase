export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { getAppUrl } from "~/lib/data";
import App from "~/components/App";

const appUrl = getAppUrl();

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Open",
    action: {
      type: "launch_frame",
      name: "Rebase",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Rebase",
    openGraph: {
      title: "Rebase",
      description: "LP incentives for tokens on Base",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function AppPage() {
  return (
    <App />
  );
}
