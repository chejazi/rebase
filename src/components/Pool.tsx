import { useReadContract } from 'wagmi';
import { Address } from 'viem';

import { erc20ABI } from 'constants/abi-erc20';
import { poolABI } from 'constants/abi-reward-pool';
import RewardProgressBar from './RewardProgressBar';

interface PoolProps {
  pool: string;
  token: string;
  stakeSymbol: string;
  rewardSymbol: string;
  cacheBust: number;
}

function Pool({ pool, token, stakeSymbol, rewardSymbol, cacheBust }: PoolProps) {
  const poolAddress = pool as Address;

  const { data: startTimeRes } = useReadContract({
    abi: poolABI,
    address: poolAddress,
    functionName: "getStartTime",
    args: [],
  });
  const startTime = Number(startTimeRes || 0);

  const { data: endTimeRes } = useReadContract({
    abi: poolABI,
    address: poolAddress,
    functionName: "getEndTime",
    args: [],
  });
  const endTime = Number(endTimeRes || 0);

  const { data: rewardTotalRes } = useReadContract({
    abi: poolABI,
    address: poolAddress,
    functionName: "getTotalReward",
    args: [],
    scopeKey: `pool-${cacheBust}`,
  });
  const rewardTotal = (rewardTotalRes || 0n) as bigint;

  // Used for the reward token
  const { data: decimalsRes } = useReadContract({
    abi: erc20ABI,
    address: token as Address,
    functionName: "decimals",
    args: [],
  });
  const decimals = Number(decimalsRes || 18);

  return (
    <RewardProgressBar
      rewardTotal={rewardTotal}
      decimals={decimals}
      rewardSymbol={rewardSymbol}
      stakeSymbol={stakeSymbol}
      startTime={startTime}
      endTime={endTime}
    />
  );
}

export default Pool;
