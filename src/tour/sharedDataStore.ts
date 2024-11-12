// tour/sharedDataStore.ts
import { create } from 'zustand';

interface SharedDataState {
  rewardTotal: bigint;
  endTime: number;
  startTime: number;
  totalStakedWei: bigint;
  userStakedWei: bigint;
  userWalletUnits: string;
  stakeSymbol: string;
  rewardSymbol: string;
  decimals: number; 
  setSharedData: (data: Partial<SharedDataState>) => void;
}

export const useSharedDataStore = create<SharedDataState>((set) => ({
  rewardTotal: 0n,
  endTime: 0,
  startTime: 0,
  totalStakedWei: 0n,
  userStakedWei: 0n,
  userWalletUnits: '',
  rewardSymbol: '',
  stakeSymbol: '',
  decimals: 18, 
  setSharedData: (data) => set((state) => ({ ...state, ...data })),
}));
