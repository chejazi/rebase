// components/Apr.tsx
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { useSharedDataStore } from '../tour/sharedDataStore';
import { erc20ABI } from 'constants/abi-erc20';
import { poolABI } from 'constants/abi-reward-pool';
import { appABI } from 'constants/abi-staking-app';

import { prettyPrint } from 'utils/formatting';

interface AprProps {
  app: Address;
  pool: string;
  token: string;
  stakeSymbol: string;
  rewardSymbol: string;
  cacheBust: number;
  synced: boolean;
  onSync: () => void;
}

function Pool({ app, pool, token, stakeSymbol, rewardSymbol, cacheBust, synced, onSync }: AprProps) {
  const setSharedData = useSharedDataStore((state) => state.setSharedData);
  const account = useAccount();
  const userAddress = account.address;

  const [joining, setJoining] = useState(false);

  // Write contract setup for sync pools
  const { writeContract, error: writeError, data: writeData } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: writeData });

  // Pool contract address
  const poolAddress = pool as Address;

  // Reading contract values
  const { data: startTimeRes } = useReadContract({
    abi: poolABI,
    address: poolAddress,
    functionName: "getStartTime",
  });
  const startTime = Number(startTimeRes || 0);

  console.log('start', startTimeRes)

  const { data: endTimeRes } = useReadContract({
    abi: poolABI,
    address: poolAddress,
    functionName: "getEndTime",
  });
  const endTime = Number(endTimeRes || 0);

  const { data: rewardTotalRes } = useReadContract({
    abi: poolABI,
    address: poolAddress,
    functionName: "getTotalReward",
    scopeKey: `pool-${cacheBust}`,
  });
  const rewardTotal = (rewardTotalRes || 0n) as bigint;

  const { data: decimalsRes } = useReadContract({
    abi: erc20ABI,
    address: token as Address,
    functionName: "decimals",
  });
  const decimals = Number(decimalsRes || 18);

  console.log('decimals', decimalsRes)

  // Sync pools function
  const syncPools = () => {
    setJoining(true);
    writeContract({
      abi: appABI,
      address: app,
      functionName: "syncPools",
      args: [[token]],
    });
  };

  // Calculate progress and status
  const now = Math.floor(Date.now() / 1000);
  const duration = endTime - startTime;
  const progress = Math.min((now - startTime), duration) / duration * 100;
  const done = progress === 100;

  // Set shared data in store
  useEffect(() => {
    setSharedData({
      rewardTotal,
      endTime,
      rewardSymbol,
      startTime,
      decimals, // Include decimals here
    });
  }, [rewardTotal, endTime, rewardSymbol, startTime, decimals, setSharedData]);

  // Handle contract write and transaction confirmation
  useEffect(() => {
    if (writeError) {
      setJoining(false);
      setTimeout(() => window.alert(writeError), 1);
    } else if (isConfirmed) {
      setJoining(false);
      onSync();
    }
  }, [writeError, isConfirmed]);

  return (
    <div className="flex" style={{ alignItems: 'center', marginTop: '1em' }}>
      <div className="flex-grow">
        <div style={{ fontSize: '.8em' }}>
          <div>{prettyPrint(formatUnits(rewardTotal, decimals), 0)} ${rewardSymbol} ({progress.toFixed(0)}% complete)</div>
          {done ? (
            <div>Ended {new Date(endTime * 1000).toLocaleString()}</div>
          ) : (
            <div>Active until {new Date(endTime * 1000).toLocaleString()}</div>
          )}
        </div>
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
