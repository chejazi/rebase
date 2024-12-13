import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, Address } from 'viem';
import Select from 'react-select';

import { DropdownOptionLabel, StringNumberMap, TokenMap, Token, StringBooleanMap } from '../types';
import Pool from './Pool';
import Rewards from './Rewards';
import StakeManager from './StakeManager';
import { rebaseABI, rebaseAddress } from 'constants/abi-rebase-v1';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { tokenABI } from 'constants/abi-token';
import { appABI } from 'constants/abi-staking-app';
import { getTokenPrices, getTokenImage, getStakingApp, getUnknownToken } from 'utils/data';
import { prettyPrint } from 'utils/formatting';

const formatOptionLabel = ({ label, description, image }: DropdownOptionLabel) => (
  <div className="flex" style={{ alignItems: 'center' }}>
    <div className="flex-shrink" style={{ width: '24px', height: '24px', marginRight: '.5em' }}>
      <img src={image} style={{ width: '24px', height: '24px', borderRadius: '500px' }} />
    </div>
    <div className="flex-grow">
      <div style={{ fontWeight: 'bold' }}>{label}</div>
      <div className="tvl" style={{ fontWeight: 'normal', fontSize: '.75em' }}>{description}</div>
    </div>
  </div>
);

interface ProjectProps {
  projectSymbol: string;
  tokenAddress: string;
}

function Project({ projectSymbol, tokenAddress }: ProjectProps) {
  const account = useAccount();
  const userAddress = account.address;

  const [token, setToken] = useState<Address|null>(null);
  const [cacheBust, setCacheBust] = useState(1);
  const [prices, setPrices] = useState<StringNumberMap>({});

  const { data: stakerRes } = useReadContract({
    abi: tokenABI,
    address: tokenAddress as Address,
    functionName: "getStaker",
    args: [],
  });
  const appAddress = (stakerRes || getStakingApp(projectSymbol)) as Address;

  const tokenMap: TokenMap = {};

  // Tokens (for Dropdown)
  const { data: tokensRes } = useReadContract({
    abi: appABI,
    address: appAddress,
    functionName: "getTokens",
    args: [],
  });
  const tokens = (tokensRes || []) as Address[];
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

  tokens.forEach((t, i) => tokenMap[t] = {
    name: names[i] || '',
    symbol: symbols[i] || '',
    decimals: decimals[i] || 18,
    image: getTokenImage(t),
    price: prices[t] || 0,
    appStake: 0n,
    userStake: 0n,
  });

  const tokenStr = tokens.join();

  useEffect(() => {
    if (tokens.length > 0) {
      getTokenPrices(tokens).then((res: any) => {
        setPrices(res as StringNumberMap);
      });
    }
  }, [tokens, tokenStr]);

  // Tokens staked by all users
  const { data: appStakesRawRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
    functionName: "getAppStakes",
    args: [appAddress],
    scopeKey: `home-${cacheBust}`,
  });
  const appStakesRes = (appStakesRawRes || [[], []]) as [Address[], bigint[]];
  const appTokens = appStakesRes[0];
  const appStakes = appStakesRes[1];

  // Tokens staked by user
  const { data: userAppStakesRawRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
    functionName: "getUserAppStakes",
    args: [userAddress, appAddress],
    scopeKey: `home-${cacheBust}`,
  });
  const userAppStakesRes = (userAppStakesRawRes || [[], []]) as [Address[], bigint[]];
  const userAppTokens = userAppStakesRes[0];
  const userAppStakes = userAppStakesRes[1];

  appTokens.forEach((t, i) => tokenMap[t].appStake = appStakes[i]);
  userAppTokens.forEach((t, i) => tokenMap[t].userStake = userAppStakes[i]);


  // Pools staked by user
  const { data: userPoolsRes } = useReadContract({
    abi: appABI,
    address: appAddress,
    functionName: "getUserPools",
    args: [userAddress],
    scopeKey: `home-${cacheBust}`,
  });
  const userPools = (userPoolsRes || []) as Address[];
  const userPoolSynced = {} as StringBooleanMap;
  userPools.forEach(pool => userPoolSynced[pool] = true);

  // TOKEN SPECIFIC LOOKUPS
  const stakeSymbol = token && tokenMap[token] ? tokenMap[token].symbol : null;
  const stakeDecimals = token && tokenMap[token] ? tokenMap[token].decimals : 18;

  // Get the reward pools
  const { data: poolsRes } = useReadContract({
    abi: appABI,
    address: appAddress,
    functionName: "getTokenPools",
    args: [token],
    scopeKey: `home-${cacheBust}`,
  });
  const pools = ((poolsRes || []) as Address[]).slice(0).reverse();

  let allTVL = 0;
  const options = Object.keys(tokenMap).map(address => {
    const t: Token = tokenMap[address];
    const stakedUnits = formatUnits(t.appStake, t.decimals);
    let description = `${prettyPrint(stakedUnits, 0)} $${t.symbol} staked`;
    if (t.price && t.appStake) {
      const tvl = t.price * parseFloat(stakedUnits);
      allTVL += tvl;
      description = `$${prettyPrint(tvl.toString(), 0)} staked`;
    }
    return {
      value: address,
      label: `$${t.symbol}`,
      image: t.image || getUnknownToken(),
      description,
    };
  });

  const selectedOption = options.filter(t => t.value == token)?.[0];
  console.log('X', options);
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2>Stake</h2>
        <div
          className="ui-island"
          style={{
            marginBottom: "1em",
            padding: "1em",
            textDecoration: "none",
          }}
        >
          <div className="flex" style={{ alignItems: "end" }}>
            <div className="flex-grow" style={{ fontWeight: "bold" }}>
              <Select
                isClearable
                options={options}
                id="coin-selector"
                classNamePrefix="coin-selector"
                onChange={(e) => {
                  setToken(e ? e.value as Address : null)
                }}
                value={selectedOption}
                formatOptionLabel={formatOptionLabel}
              />
            </div>
          </div>
          {
            token && stakeSymbol ? (
              <div>
                {
                  pools.map(p => (
                    <Pool
                      app={appAddress}
                      pool={p as string}
                      token={token as string}
                      rewardSymbol={projectSymbol}
                      stakeSymbol={stakeSymbol}
                      key={`pool-${p}`}
                      synced={userPoolSynced[p]}
                      onSync={() => setCacheBust(cacheBust + 1)}
                      cacheBust={cacheBust}
                    />
                  ))
                }
                <br />
                <StakeManager
                  token={token as Address}
                  appAddress={appAddress}
                  onTransaction={() => setCacheBust(cacheBust + 1)}
                  stakeSymbol={stakeSymbol}
                  stakeDecimals={stakeDecimals}
                />
              </div>
            ) : (
              <div style={{ fontSize: '.75em' }}>
                <br />
                {
                  `Stake the tokens above to earn $${projectSymbol}. `
                }
                Unstake at any time.
              </div>
            )
          }
        </div>
        <h2>Manage</h2>
        {
          userAppTokens.length == 0 ? (
            <div>
              You have no assets staked. Stake them above.
            </div>
          ) : (
            <div>
              {
                userAppTokens.map((t, i) => {
                  const token = tokenMap[t];
                  const stake = userAppStakes[i];
                  return (
                    <div
                      key={`stake-${t}`} onClick={() => setToken(t as Address)}
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
                            src={token.image}
                            style={{ width: '24px', height: '24px', borderRadius: '500px' }}
                          />
                        </div>
                        <div className="flex-grow">
                          <div style={{ fontWeight: 'bold' }}>
                            {prettyPrint(formatUnits(stake, token.decimals), 4)} ${token.symbol}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          )
        }
        <h2>Claim</h2>
        <div className="ui-island" style={{ padding: '1em' }}>
          <Rewards tokenAddress={tokenAddress} tokenSymbol={projectSymbol} />
        </div>
      </div>
    </div>
  );
}

export default Project;
