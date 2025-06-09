import { Metadata } from "next";
import App from "~/components/App";
import { getAppUrl } from "~/lib/data";

type Props = {
  params: Promise<{ page: string }>
}

const appUrl = getAppUrl();

const getFrameTemplate = (path: string) => {
  return {
    version: "next",
    imageUrl: `${appUrl}/opengraph-image`,
    button: {
      title: "Open",
      action: {
        type: "launch_frame",
        name: "Rebase",
        url: `${appUrl}/${path}`,
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    }
  }
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const frame = getFrameTemplate(page || '');
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
