import { getAppUrl } from "~/lib/data";

export async function GET() {
  const appUrl = getAppUrl();
  const accountAssociation = JSON.parse(process.env.FARCASTER_WELLKNOWN_JSON);
  const config = {
    accountAssociation,
    frame: {
      version: "1",
      name: "Rebase",
      iconUrl: `${appUrl}/logo-gradient-200x200.png`,
      homeUrl: `${appUrl}`,
      imageUrl: `${appUrl}/start-image-1260x660.png`,
      buttonTitle: "Tap to explore!",
      splashImageUrl: `${appUrl}/logo-stencil-white.png`,
      splashBackgroundColor: "#131313",
      webhookUrl: `${appUrl}/api/webhook`,
    }
  };

  return Response.json(config);
}
