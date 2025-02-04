import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from "wagmi/chains";
import { Address } from 'viem';

import { erc20ABI } from 'constants/abi-erc20';
import { appABI } from 'constants/abi-staking-app';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import RewardProgressBar from '../RewardProgressBar';

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
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      setJoining(false);
      onSync();
    }
  }, [writeError, isConfirmed]);


  const { data: poolDetailsRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getPoolDetails",
    args: [pool],
  });
  const poolDetails = (poolDetailsRes as [bigint, bigint, bigint]) || [0n,0n,0n];
  const [startTime, endTime, rewardTotal] = [
    Number(poolDetails[0] as bigint),
    Number(poolDetails[1] as bigint),
    BigInt(poolDetails[2] as bigint),
  ];

  const { data: stakeTotalRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getUserStake",
    args: [app, token, userAddress],
    scopeKey: `pool-${cacheBust}`,
  });
  const stakeTotal = (stakeTotalRes || 0n) as bigint;

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
      chainId: base.id,
    });
  };

  const now = Math.floor(new Date().getTime() / 1000);

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
        !synced && userAddress && stakeTotal > 0 && now < endTime ? (
          <div className="flex-shrink">
            <button
              type="button"
              className="buy-button"
              onClick={syncPools}
              disabled={joining}
              style={{ marginLeft: '.5em'}}
            >
              {joining ? 'joining' : 'join'}
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
