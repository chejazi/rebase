import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address, getAddress, formatUnits } from 'viem';

import Project from './Project';
import ProjectREFI from './ProjectREFI';

import { getTokenImage, getStakingApps, getTokenPrices, getTokenPrice } from 'utils/data';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
// import { launcherABI, launcherAddress } from 'constants/abi-launcher';
import { tokenABI } from 'constants/abi-token';

// const hardcodedTokens = [
//   '0x1215163D2c569433b9104cC92c5dB231e7FB62A1', // $LAUNCHER
//   '0x0Db510e79909666d6dEc7f5e49370838c16D950f', // $ANON
//   '0x3C281A39944a2319aA653D81Cfd93Ca10983D234', // $BUILD
//   '0xd21111c0e32df451eb61A23478B438e3d71064CB', // $JOBS
//   '0x01929f1ae2dc8cac021e67987500389ae3536ced', // $PROXY
//   '0x1d35741c51fb615ca70e28d3321f6f01e8d8a12d', // $RaTcHeT
//   '0x7dbdBF103Bb03c6bdc584c0699AA1800566f0F84', // $REFI
//   '0x1E6bA8BC42Bbd8C68Ca7E891bAc191F0e07B1d6F', // $VROOM
// ];

const WETH = '0x4200000000000000000000000000000000000006';

function AltHome() {
  const { token } = useParams();
  const [cacheBust, setCacheBust] = useState<number>(1);

  // const { data: dynamicTokensRes } = useReadContract({
  //   abi: launcherABI,
  //   address: launcherAddress as Address,
  //   functionName: "getTokens",
  //   args: [],
  // });
  // const dynamicTokens = (dynamicTokensRes || []) as string[];
  // const tokenAddresses = dynamicTokens.concat(hardcodedTokens)//.concat(dynamicTokens);
  // const tokenAddresses = hardcodedTokens;

  const apps = getStakingApps();

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
  const tokenSymbol = (tokenSymbolRes || '') as string;

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
                <img className="token-logo" src={tokenImage || getTokenImage(token)} />
                <div className="token-name">${tokenSymbol}</div>
              </Link>
            </div>
            <div style={{ fontSize: '.75em' }}>
              CA: <Link to={`https://basescan.org/token/${token}`}>{getAddress(token)}</Link>
            </div>
          </div>
        </div>
        {
          tokenSymbol == 'REFI' ? (
            <ProjectREFI name={tokenSymbol} />
          ) : (
            <Project tokenAddress={getAddress(token) as Address} projectSymbol={tokenSymbol} />
          )
        }
      </div>
    );
  }

  const apys: number[] = [];
  const wethPrice = getTokenPrice(WETH);
  const SECONDS_YEAR = 31536000n;
  tokenAddresses.forEach((t,i) => {
    const tokenPrice = getTokenPrice(t);
    const rewardsUsd = tokenPrice * parseFloat(formatUnits(rewardsPerSecond[i] * SECONDS_YEAR, decimals[i]));
    const tokenUsd = tokenPrice * parseFloat(formatUnits(tokenAmounts[i], decimals[i]));
    const wethUsd = wethPrice * parseFloat(formatUnits(wethAmounts[i], 18));
    if (tokenUsd > 0 && wethUsd > 0 && rewardsUsd > 0) {
      const apy = 100 * (rewardsUsd / (tokenUsd + wethUsd));
      apys.push(apy);
    } else {
      apys.push(0);
    }
  });

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Rebase</h1>
          <p>Rebase is a protocol for rewarding LPs and stakers. <Link to="/about">Learn more</Link></p>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ textAlign: 'right', padding: '1em 2em', fontWeight: 'bold' }}>LP APY</div>
          {
            tokenAddresses.map((t, i) => {
              const image = images[i] || getTokenImage(t);
              return (
                <Link to={`/${t}`} className="flex ui-island" style={{ marginBottom: '1em', padding: '1em', alignItems: 'center', textDecoration: 'none', fontWeight: 'bold' }}>
                  <img style={{ width: '40px', height: '40px', borderRadius: '500px' }} src={image} />
                  <div className="flex-grow" style={{ padding: '0 1em' }}>${symbols[i]}</div>
                  <div className="flex-shrink">{apys[i].toFixed(2)}%</div>
                </Link>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

export default AltHome;
