import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';

import { erc20ABI } from 'constants/abi-erc20';
import { poolABI } from 'constants/abi-reward-pool';
import { appABI } from 'constants/abi-staking-app';
import RewardProgressBar from './RewardProgressBar';

interface PoolProps {
  app: Address;
  pool: string;
  token: string;
  stakeSymbol: string;
  rewardSymbol: string;
  cacheBust: number;
  synced: boolean;
  onSync: () => void;
}

function Pool({ app, pool, token, stakeSymbol, rewardSymbol, cacheBust, synced, onSync }: PoolProps) {
  const account = useAccount();
  const userAddress = account.address;

  const [joining, setJoining] = useState(false);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setJoining(false);
      setTimeout(() => window.alert(writeError), 1);
    } else if (isConfirmed) {
      setJoining(false);
      onSync();
    }
  }, [writeError, isConfirmed]);


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

  const syncPools = () => {
    setJoining(true);
    writeContract({
      abi: appABI,
      address: app,
      functionName: "syncPools",
      args: [[token]],
    });
  };

  return (
    <div className="flex" style={{ alignItems: 'center', marginTop: '1em' }}>
      <div className="flex-grow">
        <RewardProgressBar
          rewardTotal={rewardTotal}
          decimals={decimals}
          rewardSymbol={rewardSymbol}
          stakeSymbol={stakeSymbol}
          startTime={startTime}
          endTime={endTime}
        />
      </div>
      {
        !synced && userAddress ? (
          <div className="flex-shrink">
            <button
              type="button"
              className="buy-button"
              onClick={syncPools}
              disabled={joining}
              style={{ marginLeft: '.5em'}}
            >
              {joining ? 'adding' : 'add'}
              {
                joining ? (
                  <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                ) : null
              }
            </button>
          </div>
        ) : null
      }
    </div>
  );
}

export default Pool;
