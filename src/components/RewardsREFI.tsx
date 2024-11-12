import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { rebaseABI, rebaseAddress } from 'constants/abi-rebase-v0';
import { rewardsAddress, lpRewardsAddress, rewardsABI } from 'constants/abi-rebase-rewards';
import { refiAddress, refiABI } from 'constants/abi-refi';
import { prettyPrint } from 'utils/formatting';
const UINT256MAX = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

function RewardsREFI() {
  const account = useAccount();

  const [claimingRebaseRewards, setClaimingRebaseRewards] = useState(false);
  const [claimingRefiRewards, setClaimingRefiRewards] = useState(false);
  const [convertingRebase, setConvertingRebase] = useState(false);
  const [allowingRefi, setAllowingRefi] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setClaimingRebaseRewards(false);
      setClaimingRefiRewards(false);
      setConvertingRebase(false);
      setAllowingRefi(false);
      setTimeout(() => window.alert(writeError), 1);
    } else if (isConfirmed) {
      setClaimingRebaseRewards(false);
      setClaimingRefiRewards(false);
      setConvertingRebase(false);
      setAllowingRefi(false);
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

  const { data: getRefiRewardsRes } = useReadContract({
    abi: rewardsABI,
    address: lpRewardsAddress as Address,
    functionName: "getRewards",
    args: [account.address],
    scopeKey: `home-${cacheBust}`
  });
  const refiRewardsWei = (getRefiRewardsRes || 0n) as bigint;

  const { data: getRebaseBalanceRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
    functionName: "balanceOf",
    args: [account.address],
    scopeKey: `home-${cacheBust}`
  });
  const rebaseBalanceWei = (getRebaseBalanceRes || 0n) as bigint;

  const { data: allowanceRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
    functionName: "allowance",
    args: [account.address, refiAddress],
    scopeKey: `home-${cacheBust}`
  });
  const allowance = (allowanceRes || 0n) as bigint;

  const claimRebaseRewards = () => {
    setClaimingRebaseRewards(true);
    writeContract({
      abi: rewardsABI,
      address: rewardsAddress,
      functionName: "claimRewards",
      args: [],
    });
  };

  const claimRefiRewards = () => {
    setClaimingRefiRewards(true);
    writeContract({
      abi: rewardsABI,
      address: lpRewardsAddress,
      functionName: "claimRewards",
      args: [],
    });
  };

  const approve = () => {
    setAllowingRefi(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress as Address,
      functionName: "approve",
      args: [refiAddress, UINT256MAX],
    });
  };

  const convert = () => {
    setConvertingRebase(true);
    writeContract({
      abi: refiABI,
      address: refiAddress,
      functionName: "convert",
      args: [],
    });
  };

  const rewardsUnits = parseFloat(formatUnits(rewardsWei, 18)).toFixed(4);
  const refiRewardsUnits = parseFloat(formatUnits(refiRewardsWei, 18)).toFixed(4);
  const rebaseBalanceUnits = parseFloat(formatUnits(rebaseBalanceWei, 18)).toFixed(4);
  const hasAllowance = allowance >= rebaseBalanceWei;

  return (
    <div>
      <h3 style={{ marginTop: '0' }}>$REFI</h3>
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
        You have {prettyPrint(refiRewardsUnits, 0)} $REFI to claim.
        <br />
        <br />
        <div className="flex">
          <button
            type="button"
            className="buy-button flex-grow"
            onClick={claimRefiRewards}
            disabled={refiRewardsWei === 0n || claimingRefiRewards}
          >
            {claimingRefiRewards ? 'claiming' : 'claim'}
            {
              claimingRefiRewards ? (
                <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
              ) : null
            }
          </button>
        </div>
      </div>
      <h3>$REBASE (Legacy)</h3>
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
        You have {prettyPrint(rewardsUnits, 0)} $REBASE to claim.
        <br />
        <br />
        <div className="flex">
          <button
            type="button"
            className="buy-button flex-grow"
            onClick={claimRebaseRewards}
            disabled={rewardsWei === 0n || claimingRebaseRewards}
          >
            {claimingRebaseRewards ? 'claiming' : 'claim'}
            {
              claimingRebaseRewards ? (
                <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
              ) : null
            }
          </button>
        </div>
      </div>
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
        You have {prettyPrint(rebaseBalanceUnits, 0)} $REBASE to convert to $REFI
        <br />
        <br />
        <div className="flex">
          {
            hasAllowance ? (
              <button
                type="button"
                className="buy-button flex-grow"
                onClick={convert}
                disabled={rebaseBalanceWei === 0n || convertingRebase}
              >
                {convertingRebase ? 'converting' : 'convert'}
                {
                  convertingRebase ? (
                    <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                  ) : null
                }
              </button>
            ) : (
              <button
                type="button"
                className="buy-button flex-grow"
                onClick={approve}
                disabled={rebaseBalanceWei === 0n || allowingRefi}
              >
                {allowingRefi ? 'approving' : 'approve and convert'}
                {
                  allowingRefi ? (
                    <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                  ) : null
                }
              </button>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default RewardsREFI;
