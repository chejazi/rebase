import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address, getAddress, formatUnits } from 'viem';

import Project from './Project';

import { getTokenImageNoFallback, getStakingApps, getTokenPrices, getTokenPrice, getUnknownToken } from 'utils/data';
import { prettyPrintTruncated } from 'utils/formatting';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { poolDeployerABI, poolDeployerAddress } from 'constants/abi-pool-deployer';
import { tokenABI } from 'constants/abi-token';

const WETH = '0x4200000000000000000000000000000000000006';

function Home() {
  const { token: rawToken } = useParams();
  let token = rawToken;
  if (token) {
    token = getAddress(token.toLowerCase());
  }
  const [cacheBust, setCacheBust] = useState<number>(1);

  const { data: getStakersRes } = useReadContract({
    abi: poolDeployerABI,
    address: poolDeployerAddress as Address,
    functionName: "getStakers",
    args: [],
  });
  const dynamicApps = (getStakersRes || []) as string[];
  const hardcodedApps = getStakingApps();
  const apps = hardcodedApps.concat(dynamicApps);

  const { data: tokenLpRewardsRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenLpRewards",
    args: [apps],
  });
  const tokenLpRewards = (tokenLpRewardsRes || [[], [], [], []]) as [bigint[], string[], bigint[], bigint[]];
  const rewardsPerSecond = tokenLpRewards[0];
  const tokenAddresses = tokenLpRewards[1];
  const tokenAmounts = tokenLpRewards[2];
  const wethAmounts = tokenLpRewards[3];

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [tokenAddresses],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], [], [], []]) as [string[], string[], bigint[], bigint[], string[]];
  // const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  const decimals = tokenMetadata[2].map(n => Number(n));
  const images = tokenMetadata[4];

  const { data: tokenSymbolRes } = useReadContract({
    abi: tokenABI,
    address: token as Address,
    functionName: "symbol",
    args: [],
  });
  const tokenSymbol = (tokenSymbolRes || '...') as string;

  const { data: tokenImageRes } = useReadContract({
    abi: tokenABI,
    address: token as Address,
    functionName: "image",
    args: [],
  });
  const tokenImage = (tokenImageRes || '') as string;

  const serializedTokens = tokenAddresses.join();
  useEffect(() => {
    if (serializedTokens.length > 0) {
      getTokenPrices(serializedTokens.split(',').concat([WETH])).then(() => setCacheBust(cacheBust + 1));
    }
  }, [serializedTokens]);

  if (token) {
    return (
      <div>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div>
              <Link
                to={`/${token}`}
                className={'token-box selected'}
              >
                <img className="token-logo" src={getTokenImageNoFallback(token) || tokenImage || getUnknownToken()} />
                <div className="token-name">${tokenSymbol}</div>
              </Link>
            </div>
            <div style={{ fontSize: '.75em' }}>
              CA: <Link to={`https://basescan.org/token/${token}`}>{getAddress(token)}</Link>
            </div>
          </div>
        </div>
        <Project tokenAddress={getAddress(token) as Address} projectSymbol={tokenSymbol} />
      </div>
    );
  }

  const apys: number[] = [];
  const tvls: number[] = [];
  const wethPrice = getTokenPrice(WETH);
  const SECONDS_YEAR = 31536000n;
  tokenAddresses.forEach((t,i) => {
    const tokenPrice = getTokenPrice(t);
    const rewardsUsd = tokenPrice * parseFloat(formatUnits(rewardsPerSecond[i] * SECONDS_YEAR, decimals[i]));
    const tokenUsd = tokenPrice * parseFloat(formatUnits(tokenAmounts[i], decimals[i]));
    const wethUsd = wethPrice * parseFloat(formatUnits(wethAmounts[i], 18));
    if (rewardsUsd > 0) {
      tvls.push(parseFloat((tokenUsd + wethUsd).toFixed(0)));
      // Sometimes, tokenUsd or wethUsd can be zero, resulting in APY errononeously doubling. Exclude that below
      if (tokenUsd > 0 && wethUsd > 0 && tokenUsd + wethUsd > 100) {
        const apy = 100 * (rewardsUsd / (tokenUsd + wethUsd));
        apys.push(parseFloat(apy.toFixed(0)));
      } else {
        apys.push(-1)
      }
    } else {
      tvls.push(0);
      apys.push(0);
    }
  });

  // @ts-ignore: TS6133
  const tokensSorted = apys.slice(0).map((x, i) => i).filter((i) => apys[i] > 0).sort((i, j) => tvls[i] < tvls[j] ? 1 : -1);

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="heading">
            <span>Powering</span>
            <span>Liquidity</span> 
            <span>Incentives</span>
          </h1>
          <p>Audited platform to incentivize, stake and manage liquidity for your token. <Link className="text-link" to="/about">Learn more</Link></p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Link to="./crowdpools">
            <button className="primary-button-white" >Crowdpool</button>
          </Link>
          <Link to="./refi">
            <button className="primary-button-dark" >Stake $REFI</button>
          </Link>
        </div>
        <br />
        <br />
        <div style={{ textAlign: 'left' }}>
          <div className="flex" style={{ padding: '1em 1em', fontWeight: 'bold' }}>
            <div className="flex-grow">Active LP Campaigns</div>
            <div className="flex" style={{ textAlign: 'right' }}>LP APY</div>
          </div>
          {
            tokensSorted.map((i) => {
              const tokenAddress = tokenAddresses[i];
              const image = getTokenImageNoFallback(tokenAddress) || images[i] || getUnknownToken();
              return (
                <Link to={`/${tokenAddress}`} className="flex ui-island" style={{ marginBottom: '1em', padding: '1em', alignItems: 'center', textDecoration: 'none', fontWeight: 'bold' }}>
                  <img style={{ width: '40px', height: '40px', borderRadius: '500px' }} src={image} />
                  <div className="flex-grow" style={{ padding: '0 1em' }}>
                    <div>${symbols[i]}</div>
                    <div style={{ fontSize: '.8em', fontWeight: 'normal' }}>${prettyPrintTruncated(tvls[i], 0)} staked</div>
                  </div>
                  <div className="flex-shrink">{apys[i] > 0 ? `${apys[i].toLocaleString()}%` : '<1%'}</div>
                </Link>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

export default Home;
