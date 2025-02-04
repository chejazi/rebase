import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, Address } from 'viem';

import { StringNumberMap, Token, StringBooleanMap } from '../types';

import PoolCard from './Pool/PoolCard';
import Rewards from './Rewards';
import StakeManager from './StakeManager';
import { poolDeployerABI, poolDeployerAddress } from 'constants/abi-pool-deployer';
import * as legacyRefiApps from 'constants/abi-rebase-rewards';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { tokenABI } from 'constants/abi-token';
import { refiAddress } from 'constants/abi-refi';
import { appABI } from 'constants/abi-staking-app';
import { rewardTargetsABI, rewardTargetsAddress } from 'constants/abi-reward-targets';
import { getTokenPrices, getTokenImage, getLPTokenImage, getStakingApp, getNullAddress } from 'utils/data';
import { prettyPrint } from 'utils/formatting';

interface ProjectProps {
  projectSymbol: string;
  tokenAddress: string;
}

function Project({ projectSymbol, tokenAddress }: ProjectProps) {
  const account = useAccount();
  const userAddress = account.address;

  const [token, setToken] = useState<Address|null>(null);
  const [staker, setStaker] = useState<Address|null>(null);
  const [cacheBust, setCacheBust] = useState(1);
  const [prices, setPrices] = useState<StringNumberMap>({});
  const [open, setOpen] = useState(false);

  // LEGACY / TODO: REMOVE
  const { data: launcherAppRes } = useReadContract({
    abi: tokenABI,
    address: tokenAddress as Address,
    functionName: "getStaker",
    args: [],
  });
  const { data: poolDeployerAppRes } = useReadContract({
    abi: poolDeployerABI,
    address: poolDeployerAddress as Address,
    functionName: "getTokenStaker",
    args: [tokenAddress],
  });
  let appAddress = poolDeployerAppRes as Address;
  if (appAddress == getNullAddress()) {
    appAddress = (launcherAppRes || getStakingApp(projectSymbol)) as Address;
  }
  const { data: tokensRes } = useReadContract({
    abi: appABI,
    address: appAddress,
    functionName: "getTokens",
    args: [],
  });
  const tokensLegacy = (tokensRes || []) as Address[];

  const targets: Token[] = [];

  const { data: targetsRes,  } = useReadContract({
    abi: rewardTargetsABI,
    address: rewardTargetsAddress,
    functionName: "getTargets",
    args: [tokenAddress],
  });
  const [stakersNew, tokensNew] = (targetsRes || [[], []]) as ([Address[], Address[]]);


  let tokens = tokensNew;
  let stakers = stakersNew;
  if (tokenAddress != refiAddress) {
    tokens = tokensLegacy;
    stakers = tokens.map(() => appAddress);
  }

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [tokens],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], []]) as [string[], string[], bigint[]];
  const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  const decimals = tokenMetadata[2].map(n => Number(n));

  const { data: rewardsPerSecondRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getRewardsPerSecondBatchV2",
    args: [stakers, tokens],
    scopeKey: `home-${cacheBust}`,
  });
  const rewardsPerSecond = (rewardsPerSecondRes || tokens.map(() => 0n)) as bigint[];

  const tokenStr = tokens.join();

  useEffect(() => {
    if (tokens.length > 0) {
      getTokenPrices(tokens.concat([tokenAddress as Address])).then((res: any) => {
        setPrices(res as StringNumberMap);
      });
    }
  }, [tokens, tokenStr]);

  // Tokens staked by all users
  const { data: isLPTokenRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "isLPTokenBatch",
    args: [tokens],
    scopeKey: `home-${cacheBust}`,
  });
  const isLPToken = (isLPTokenRes || []) as boolean[];

  // Tokens staked by all users
  const { data: appStakesRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getAppStakes",
    args: [stakers, tokens],
    scopeKey: `home-${cacheBust}`,
  });
  const appStakes = (appStakesRes || []) as bigint[];

  // Tokens staked by user
  const { data: userStakesRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getUserStakes",
    args: [stakers, tokens, tokens.map(() => userAddress)],
    scopeKey: `home-${cacheBust}`,
  });
  const userStakes = (userStakesRes || []) as bigint[];

  tokens.forEach((t, i) => targets.push({
    staker: stakers[i],
    token: tokens[i],
    name: names[i] || '',
    symbol: symbols[i] || '',
    decimals: decimals[i] || 18,
    isLPToken: isLPToken[i],
    image: isLPToken[i] ? getLPTokenImage() : getTokenImage(t),
    price: prices[t] || 0,
    appStake: appStakes[i] || 0n,
    userStake: userStakes[i] || 0n,
    rewardsPerSecond: rewardsPerSecond[i],
  }));

  // Stakers for the Rewards widgets
  const stakerMap: StringBooleanMap = {};
  stakers.forEach(s => {
    if (s != legacyRefiApps.rewardsAddress && s != legacyRefiApps.lpRewardsAddress) {
      stakerMap[s as string] = true;
    }
  });

  useEffect(() => {
    if (!token && stakers.length > 0 && tokens.length > 0 && rewardsPerSecond.length > 0) {
      let maxIndex = -1;
      let maxRPS = 0n;
      rewardsPerSecond.forEach((rps, i) => {
        if (rps > maxRPS) {
          maxRPS = rps;
          maxIndex = i;
        }
      });
      if (maxIndex > -1) {
        setStaker(stakers[maxIndex] as Address);
        setToken(tokens[maxIndex] as Address);
      }
    }
  }, [token, stakers, tokens, rewardsPerSecond]);

  // SELECTED TARGET-SPECIFIC
  // Pools staked by user
  const { data: userPoolsRes } = useReadContract({
    abi: appABI,
    address: staker as Address,
    functionName: "getUserPools",
    args: [userAddress],
    scopeKey: `home-${cacheBust}`,
  });
  const userPools = (userPoolsRes || []) as Address[];
  const userPoolSynced = {} as StringBooleanMap;
  userPools.forEach(pool => userPoolSynced[pool] = true);

  const { data: poolsRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getPools",
    args: [staker, token],
    scopeKey: `home-${cacheBust}`,
  });
  const pools = ((poolsRes || []) as Address[]).slice(0).reverse();

  const selectedTarget = targets.filter(t => t.token == token && t.staker == staker).length > 0
    ? targets.filter(t => t.token == token && t.staker == staker)[0]
    : null;
  const activeTargets = targets.filter(t => (t.token != token || t.staker != staker) && t.rewardsPerSecond > 0n);
  const inactiveTargets = targets.filter(t => (t.token != token || t.staker != staker) && t.rewardsPerSecond == 0n);
  const userTargets = targets.filter(t => t.userStake > 0n);

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2>Reward Pools</h2>
        <div>
          {
            selectedTarget &&
            <div
              className='ui-island'
              style={{
                marginBottom: "1em",
                padding: "1em",
                textDecoration: "none",
              }}
            >
              <div className="flex">
                <div
                  className="flex-shrink"
                  style={{ width: '24px', height: '24px', marginRight: '.5em' }}
                >
                  <img
                    src={selectedTarget.image}
                    style={{ width: '24px', height: '24px', borderRadius: '500px' }}
                  />
                </div>
                <div className="flex-grow">
                  <div style={{ fontWeight: 'bold' }}>
                    {selectedTarget.name}
                  </div>
                </div>
              </div>
              {
                pools.map(p => (
                  <PoolCard
                    app={staker as Address}
                    pool={p as string}
                    token={token as string}
                    rewardSymbol={projectSymbol}
                    stakeSymbol={selectedTarget.symbol}
                    key={`pool-${p}`}
                    synced={userPoolSynced[p]}
                    onSync={() => setCacheBust(cacheBust + 1)}
                    cacheBust={cacheBust}
                  />
                ))
              }
              <StakeManager
                stakeToken={token as Address}
                rewardToken={tokenAddress as Address}
                appAddress={staker as Address}
                onTransaction={() => setCacheBust(cacheBust + 1)}
                stakeSymbol={selectedTarget.symbol}
                stakeDecimals={selectedTarget.decimals}
              />
            </div>
          }
          {
            activeTargets.map(t => (
              <div
                key={`stake-${t.staker}-${t.token}`} onClick={() => {
                  setToken(t.token as Address);
                  setStaker(t.staker as Address);
                  setOpen(false);
                }}
                className='ui-island'
                style={{
                  cursor: "pointer",
                  marginBottom: "1em",
                  padding: "1em",
                  textDecoration: "none",
                }}
              >
                <div className="flex">
                  <div
                    className="flex-shrink"
                    style={{ width: '24px', height: '24px', marginRight: '.5em' }}
                  >
                    <img
                      src={t.image}
                      style={{ width: '24px', height: '24px', borderRadius: '500px' }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div style={{ fontWeight: 'bold' }}>
                      {t.name}
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
          {
            inactiveTargets.length > 0 &&
            <div>
              {
                open ? (
                  inactiveTargets.map(t => (
                    <div
                      key={`stake-${t.staker}-${t.token}`} onClick={() => {
                        setToken(t.token as Address);
                        setStaker(t.staker as Address);
                        setOpen(false);
                      }}
                      className='ui-island'
                      style={{
                        cursor: "pointer",
                        marginBottom: "1em",
                        padding: "1em",
                        textDecoration: "none",
                      }}
                    >
                      <div className="flex">
                        <div
                          className="flex-shrink"
                          style={{ width: '24px', height: '24px', marginRight: '.5em' }}
                        >
                          <img
                            src={t.image}
                            style={{ width: '24px', height: '24px', borderRadius: '500px' }}
                          />
                        </div>
                        <div className="flex-grow">
                          <div style={{ fontWeight: 'bold' }}>
                            {t.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    key={`stake-inactive`} onClick={() => setOpen(true)}
                    style={{
                      cursor: "pointer",
                      marginBottom: "1em",
                      padding: "1em",
                      textDecoration: "none",
                    }}
                  >
                    <div className="flex">
                      <div
                        className="flex-shrink"
                        style={{ width: '24px', height: '24px', marginRight: '.5em' }}
                      >
                        <img
                          src={'/tokens/add-token.png'}
                          style={{ width: '24px', height: '24px', borderRadius: '500px' }}
                        />
                      </div>
                      <div className="flex-grow">
                        <div style={{ fontWeight: 'bold' }}>
                          {inactiveTargets.length} inactive pool{inactiveTargets.length != 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
          }
        </div>
        <h2>My Staked Assets</h2>
        {
          userTargets.length == 0 ? (
            <div>
              You have no assets staked. Stake them above.
            </div>
          ) : (
            <div>
              {
                userTargets.map(t => (
                  <div
                    key={`stake-${t.token}`} onClick={() => {
                      setToken(t.token as Address);
                      setStaker(t.staker as Address);
                      setOpen(false);
                    }}
                    className="ui-island"
                    style={{
                      cursor: "pointer",
                      marginBottom: "1em",
                      padding: "1em",
                      textDecoration: "none",
                    }}
                  >
                    <div className="flex">
                      <div
                        className="flex-shrink"
                        style={{ width: '24px', height: '24px', marginRight: '.5em' }}
                      >
                        <img
                          src={t.image}
                          style={{ width: '24px', height: '24px', borderRadius: '500px' }}
                        />
                      </div>
                      <div className="flex-grow">
                        <div style={{ fontWeight: 'bold' }}>
                          {
                            t.isLPToken ? (
                              <span>Wrapped {t.symbol} LP</span>
                            ) : (
                              <span>{prettyPrint(formatUnits(t.userStake, t.decimals), 4)} ${t.symbol}</span>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )
        }
        <h2>Rewards</h2>
        {
          Object.keys(stakerMap).map(app => (
            <div key={`rewards-app-${app}`} className="ui-island" style={{ padding: '1em', marginBottom: '1em' }}>
              <Rewards
                rewardToken={tokenAddress}
                rewardSymbol={projectSymbol}
                appAddress={app}
              />
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default Project;
