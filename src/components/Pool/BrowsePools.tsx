import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address } from 'viem';
import { poolFunderAddress, poolFunderABI } from 'constants/abi-pool-funder';
import { erc20ABI } from 'constants/abi-erc20';
import PoolListItem from './PoolListItem';

function BrowsePools() {
  const { address } = useParams();
  const [filter, setFilter] = useState('getOpen');

  const { data: rewardIdRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: filter,
    args: address ? [address] : [],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const rewardIds = (rewardIdRes as bigint[] || []).map(id => Number(id)).sort((a, b) => a < b ? 1 : -1);

  const { data: tokenSymbolRes } = useReadContract({
    abi: erc20ABI,
    address: address as Address,
    functionName: "symbol",
    args: [],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const tokenSymbol = (tokenSymbolRes || null) as string|null;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Crowdpools</h1>
        <p>Crowdfund an LP incentive campaign for a token</p>
      </div>
      <br />
      <div className="flex" style={{ alignItems: 'center' }}>
        <div className="flex-shrink">
          <select
            className="text-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="get">All</option>
            <option value="getOpen">Open</option>
            <option value="getDeployed">Funded</option>
            <option value="getCancelled">Closed</option>
          </select>
        </div>
        <div className="flex-grow" style={{ fontWeight: 'bold', marginLeft: '1em' }}>
          {
            tokenSymbol ? ` for $${tokenSymbol}` : ''
          }
        </div>
        <div className="flex-shrink">
          <Link to="/crowdpool">
            <button className="create-button">Create</button>
          </Link>
        </div>
      </div>
      {
        rewardIds.map(id => (
          <PoolListItem key={`pool-${id}`} poolId={id} />
        ))
      }
    </div>
  );
}

export default BrowsePools;
