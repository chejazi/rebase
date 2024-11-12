import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { appABI } from 'constants/abi-staking-app';
import { erc20ABI } from 'constants/abi-erc20';
import { prettyPrint } from 'utils/formatting';
import { getStakingApp } from 'utils/data';

interface RewardsProps {
  tokenSymbol: string;
  tokenAddress: string;
}

function Rewards({ tokenSymbol, tokenAddress }: RewardsProps) {
  const account = useAccount();
  const userAddress = account.address;

  const [claimingRewards, setClaimingRewards] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);

  const appAddress = getStakingApp(tokenSymbol) as Address;

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setClaimingRewards(false);
      setTimeout(() => window.alert(writeError), 1);
    } else if (isConfirmed) {
      setClaimingRewards(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);

  const { data: rewardsRes } = useReadContract({
    abi: appABI,
    address: appAddress,
    functionName: "getRewards",
    args: [userAddress],
    scopeKey: `home-${cacheBust}`
  });
  const rewardsWei = (rewardsRes || 0n) as bigint;

  const { data: balanceOfRes } = useReadContract({
    abi: erc20ABI,
    address: tokenAddress as Address,
    functionName: "balanceOf",
    args: [userAddress],
    scopeKey: `home-${cacheBust}`
  });
  const balanceWei = (balanceOfRes || 0n) as bigint;

  const claimRewards = () => {
    setClaimingRewards(true);
    writeContract({
      abi: appABI,
      address: appAddress,
      functionName: "claimRewards",
      args: [],
    });
  };

  const rewardsUnits = parseFloat(formatUnits(rewardsWei, 18));
  const balanceUnits = parseFloat(formatUnits(balanceWei, 18));

  return (
    <div>
      You own {prettyPrint(balanceUnits.toFixed(4), balanceUnits < 10 ? 3 : 0)} ${tokenSymbol} and have {prettyPrint(rewardsUnits.toFixed(4), rewardsUnits < 10 ? 3 : 0)} ${tokenSymbol} to claim.
      <br />
      <br />
      <div className="flex">
        <button
          type="button"
          className="buy-button flex-grow"
          onClick={claimRewards}
          disabled={rewardsWei === 0n || claimingRewards}
        >
          {claimingRewards ? 'claiming' : 'claim'}
          {
            claimingRewards ? (
              <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
            ) : null
          }
        </button>
      </div>
    </div>
  );
}

export default Rewards;
