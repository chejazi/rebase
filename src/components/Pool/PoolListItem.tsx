import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { poolFunderAddress, poolFunderABI } from 'constants/abi-pool-funder';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { getNullAddress, getTokenImageNoFallback, getUnknownToken } from 'utils/data';
import { getDurationDays, prettyPrint } from 'utils/formatting';
import Username from '../Username';

function PoolListItem({ poolId }: { poolId: number }) {
  const { data: baseTokenRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getBaseToken",
    args: [poolId],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const baseToken = (baseTokenRes || getNullAddress()) as string;

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [[baseToken]],
  });
  const tokenMetadata = (tokenMetadataRes || [[''], [''], [18n], [1n], ['']]) as [string[], string[], bigint[], bigint[], string[]];
  // const name = tokenMetadata[0][0];
  const symbol = tokenMetadata[1][0];
  // const qSymbol = tokenMetadata[1][1];
  const decimals = Number(tokenMetadata[2][0]);
  // const supply = tokenMetadata[3][0];
  const image = tokenMetadata[4][0];

  const { data: quantityRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getQuantity",
    args: [poolId],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const quantity = (quantityRes || 0n) as bigint;

  const { data: durationRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getDuration",
    args: [poolId],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const duration = Number((durationRes || 0n) as bigint);

  const { data: statusRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getStatus",
    args: [poolId],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const status = Number((statusRes || 0n) as bigint);

  const { data: managerRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getManager",
    args: [poolId],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const manager = (managerRes || getNullAddress()) as string;

  return (
    <Link
      to={`/crowdpool/${poolId}`}
      className="flex ui-island"
      style={{
        marginTop: '1em',
        padding: '1em',
        alignItems: 'center',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}
    >
      <img style={{ width: '40px', height: '40px', borderRadius: '500px' }} src={getTokenImageNoFallback(baseToken) || image || getUnknownToken()} />
      <div className="flex-grow" style={{ padding: '0 1em' }}>
        <div>{prettyPrint(formatUnits(quantity, decimals), 0)} ${symbol} LP</div>
        <div style={{ fontSize: '.75em' }}>
          {getDurationDays(duration)} &middot; <Username address={manager} />
        </div>
      </div>
      <div className="flex-shrink"><div className={`crowdfund-status-indicator crowdfund-status-${status}`} /></div>
    </Link>
  );
}

export default PoolListItem;
