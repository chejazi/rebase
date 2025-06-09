import { FrameNotificationDetails } from "@farcaster/frame-sdk";

const baseUrl = process.env.FARSTORE_API_URL;
const apiKey = `Bearer ${process.env.FARSTORE_API_KEY}`;

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  const response = await fetch(`${baseUrl}/private/notification_target?fid=${fid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": apiKey,
    },
  });
  const json = await response.json();
  return json.results as FrameNotificationDetails;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  await fetch(`${baseUrl}/private/notification_target`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": apiKey,
    },
    body: JSON.stringify({
      fid,
      token: notificationDetails.token,
      endpoint: notificationDetails.url,
    })
  });
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  await fetch(`${baseUrl}/private/notification_target`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": apiKey,
    },
    body: JSON.stringify({
      fid,
    })
  });
}
