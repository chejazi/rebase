import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, Address } from 'viem';

import { rewardsAddress, rewardsABI } from "./rebase-rewards";

function Rewards() {
  const account = useAccount();

  const [claimingRewards, setClaimingRewards] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);

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

  const { data: getRewardsRes } = useReadContract({
    abi: rewardsABI,
    address: rewardsAddress as Address,
    functionName: "getRewards",
    args: [account.address],
    scopeKey: `home-${cacheBust}`
  });
  const rewardsWei = (getRewardsRes || 0n) as bigint;

  const claimRewards = () => {
    setClaimingRewards(true);
    writeContract({
      abi: rewardsABI,
      address: rewardsAddress,
      functionName: "claimRewards",
      args: [],
    });
  };

  const rewardsUnits = parseFloat(formatUnits(rewardsWei, 18)).toFixed(4);

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Rewards</h1>
          <p>$REBASE rewards are live through June. <Link to="/about">Learn more</Link></p>
        </div>
        <h2>My rewards</h2>
        <div
          style={{
            border: "1px solid #ccc",
            marginBottom: "1em",
            padding: "1em",
            borderRadius: "12px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          You have {rewardsUnits} $REBASE to claim.
          <br />
          <br />
          <button
            type="button"
            className="buy-button"
            onClick={claimRewards}
            disabled={rewardsWei === 0n || claimingRewards}
            style={{ marginRight: '.5em'}}
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
    </div>
  );
}

export default Rewards;
