import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from "wagmi/chains";
import { formatUnits, Address } from 'viem';
import { appABI } from 'constants/abi-staking-app';
import { tokenABI } from 'constants/abi-token';
import { prettyPrint } from 'utils/formatting';
import { getTokenImage } from 'utils/data';

interface RewardsProps {
  rewardSymbol: string;
  rewardToken: string;
  appAddress: string;
}

function Rewards({ rewardSymbol, rewardToken, appAddress }: RewardsProps) {
  const account = useAccount();
  const userAddress = account.address;
  const [claimingRewards, setClaimingRewards] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setClaimingRewards(false);
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      setClaimingRewards(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);

  const { data: rewardsRes } = useReadContract({
    abi: appABI,
    address: appAddress as Address,
    functionName: "getRewards",
    args: [userAddress],
    scopeKey: `home-${cacheBust}`
  });
  const rewardsWei = (rewardsRes || 0n) as bigint;

  const { data: tokenImageRes } = useReadContract({
    abi: tokenABI,
    address: rewardToken as Address,
    functionName: "image",
    args: [],
  });
  const tokenImage = (tokenImageRes || '') as string;

  const claimRewards = () => {
    setClaimingRewards(true);
    writeContract({
      abi: appABI,
      address: appAddress as Address,
      functionName: "claimRewards",
      args: [],
      chainId: base.id,
    });
  };

  const rewardsUnits = parseFloat(formatUnits(rewardsWei, 18));

  return (
    <div>
      <div className="flex" style={{ alignItems: 'center' }}>
        <div
          className="flex-shrink"
          style={{ width: '24px', height: '24px', marginRight: '.5em' }}
        >
          <img
            src={tokenImage || getTokenImage(rewardToken)}
            style={{ width: '24px', height: '24px', borderRadius: '500px' }}
          />
        </div>
        <div className="flex-grow" style={{ fontWeight: 'bold' }}>
          {prettyPrint(rewardsUnits.toFixed(4), rewardsUnits < 10 ? 3 : 0)} ${rewardSymbol}
        </div>
        <button
          type="button"
          className="buy-button flex-shrink"
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
