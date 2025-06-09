export async function GET() {
  const accountAssociation = JSON.parse(process.env.FARCASTER_WELLKNOWN_JSON);

  const config = {
    accountAssociation,
    frame: {
      version: "1",
      name: "Rebase",
      iconUrl: "https://www.rebase.finance/logo-gradient-200x200.png",
      homeUrl: "https://www.rebase.finance",
      imageUrl: "https://www.rebase.finance/start-image-1260x660.png",
      buttonTitle: "Tap to explore!",
      splashImageUrl: "https://www.rebase.finance/logo-stencil-white.png",
      splashBackgroundColor: "#131313",
      webhookUrl: "https://www.rebase.finance/api/webhook"
    }
  };

  return Response.json(config);
}
