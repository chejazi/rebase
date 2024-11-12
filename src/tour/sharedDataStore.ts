// tour/sharedDataStore.ts
import { create } from 'zustand';

interface SharedDataState {
  rewardTotal: bigint;
  endTime: number;
  startTime: number;
  totalStakedUnits: string;
  userStakedWei: bigint;
  userWalletUnits: string;
  decimals: number; // Added decimals field
  setSharedData: (data: Partial<SharedDataState>) => void;
}

export const useSharedDataStore = create<SharedDataState>((set) => ({
  rewardTotal: 0n,
  endTime: 0,
  startTime: 0,
  totalStakedUnits: '',
  userStakedWei: 0n,
  userWalletUnits: '',
  decimals: 18, // Default to 18 decimals if not provided
  setSharedData: (data) => set((state) => ({ ...state, ...data })),
}));
