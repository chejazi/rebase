import { useEffect, useState } from 'react';

import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { splitterAddress, splitterABI } from 'constants/abi-pool-splitter';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { getNullAddress, getRefiAddress, getTokenImageNoFallback, getUnknownToken } from 'utils/data';
import { prettyPrint } from 'utils/formatting';

function RewardListItem({ snapshotId }: { snapshotId: number }) {
  const account = useAccount();
  const userAddress = account.address;

  const [claiming, setClaiming] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setClaiming(false);
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      setClaiming(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);


  const { data: splitRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getRefiSplit",
    args: [userAddress || getRefiAddress(), snapshotId],
    scopeKey: `split-${cacheBust}`,
  });
  const [
    token,
    totalReward,
    userReward,
    claimed,
  ] = (splitRes || [getNullAddress(), 0n, 0n, false]) as [string, bigint, bigint, boolean];

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [[token]],
  });
  const tokenMetadata = (tokenMetadataRes || [[''], [''], [18n], [1n], ['']]) as [string[], string[], bigint[], bigint[], string[]];
  // const name = tokenMetadata[0][0];
  const symbol = tokenMetadata[1][0];
  const decimals = Number(tokenMetadata[2][0]);
  // const supply = tokenMetadata[3][0];
  const image = tokenMetadata[4][0];

  const claim = () => {
    setClaiming(true);
    writeContract({
      abi: splitterABI,
      address: splitterAddress as Address,
      functionName: "claim",
      args: [userAddress, [getRefiAddress()], [[snapshotId]]],
    });
  };

  return (
    <div
      className="flex ui-island"
      style={{
        marginTop: '1em',
        padding: '1em',
        alignItems: 'center',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}
    >
      <img style={{ width: '40px', height: '40px', borderRadius: '500px' }} src={getTokenImageNoFallback(token) || image || getUnknownToken()} />
      {
        userAddress ? (
          <div className="flex-grow" style={{ padding: '0 1em' }}>
            <div>{prettyPrint(formatUnits(userReward, decimals), 0)} ${symbol}</div>
            <div style={{ fontSize: '.75em' }}>of {prettyPrint(formatUnits(totalReward, decimals), 0)} total</div>
          </div>
        ) : (
          <div className="flex-grow" style={{ padding: '0 1em' }}>
            <div>{prettyPrint(formatUnits(totalReward, decimals), 0)} ${symbol}</div>
          </div>
        )
      }
      {
        userAddress &&
        <div className="flex-shrink">
          <button className="buy-button" onClick={claim} disabled={claimed || claiming || userReward == 0n} >
            {claiming ? 'claiming' : (claimed ? 'claimed' : 'claim')}
            {
              claiming ? (
                <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
              ) : null
            }
          </button>
        </div>
      }
    </div>
  );
}

export default RewardListItem;
