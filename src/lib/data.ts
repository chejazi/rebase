import axios from "axios";
import { Address } from "viem";


export interface FrameMetadata {
  name: string;
  iconUrl: string;
  homeUrl: string;
  tagline: string;
  imageUrl: string;
}

export interface AppMetadata {
  symbol: string;
  domain: string;
  frame: FrameMetadata;
  owner: string;
  token: string | null;
  liquidity: number;
  funding: number;
  createTime: number;
}

export interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  power_badge: boolean;
  profile: {
    bio: {
      text: string;
    }
  }
  custody_address: string;
  verified_addresses: {
    eth_addresses: string[];
    primary: {
      eth_address: string | null;
    }
  }
}

export interface UserMetadata {
  address: string;
  user: NeynarUser;
}

interface FrameVerification {
  domain: string;
  owner: string;
  signature: string;
}

export interface AppReviewerCast {
  timestamp: string;
  hash: string;
  text: string;
}

export interface AppReviewer {
  fid: string;
  username: string;
  recentCasts: AppReviewerCast[];
}

export interface AppReviewResponse {
  [promoters: string]: AppReviewer[];
}

export const getAppByDomain = async (domain: string) => {
  const { data } = await axios.get(`/api/app?domain=${domain}`);
  return data as AppMetadata;
};

export const getAppReviews = async (domain: string) => {
  const { data } = await axios.get(`/api/app-reviews?domain=${domain}`);
  return data as AppReviewResponse;
};

export const getAllApps = async () => {
  const { data } = await axios.get('/api/apps');
  return data as AppMetadata[];
};

export const getUsers = async (addresses: string) => {
  const { data } = await axios.get(`/api/users?addresses=${addresses}`);
  return data as UserMetadata[];
}

export const verifyFrame = async (domain: string) => {
  const { data } = await axios.get(`/api/verify-frame?domain=${domain}`);
  return data as FrameVerification;
};

export const getNullAddress = () => "0x0000000000000000000000000000000000000000" as Address;

export const getAppUrl = () => process.env.NEXT_PUBLIC_URL as string;
export const getApiUrl = () => process.env.FARSTORE_API_URL as string;
