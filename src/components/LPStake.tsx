import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, Address } from 'viem';

import LPNFT from './LPNFT';
import { prettyPrint } from 'utils/formatting';
import { getTokenPrices, getTokenPrice } from 'utils/data';
import { lpWrapperAddress, lpWrapperABI } from 'constants/abi-lp-wrapper';
import { lpTokenABI } from 'constants/abi-lp-token';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
const WETH = '0x4200000000000000000000000000000000000006';

function LPStake({
  stakeToken,
  rewardToken,
  onTransaction,
  symbol,
  rewardsPerSecond,
  userWalletWei,
}: {
  stakeToken: Address;
  rewardToken: Address;
  onTransaction: () => void;
  symbol: string;
  rewardsPerSecond: bigint;
  userWalletWei: bigint;
}) {
  const account = useAccount();
  const userAddress = account.address;

  const [cacheBust, setCacheBust] = useState(1);
  const [open, setOpen] = useState(false);

  const { data: getPairRes } = useReadContract({
    abi: lpTokenABI,
    address: stakeToken,
    functionName: "getPair",
    args: [],
  });
  const getPair = (getPairRes || [NULL_ADDRESS, NULL_ADDRESS, 0n]) as [Address, Address, bigint];
  const token0 = getPair[0];
  const token1 = getPair[1];
  const fee = Number(getPair[2]);

  const { data: wrappedLiquidityRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getWrappedLiquidity",
    args: [token0, token1],
    scopeKey: `unwrapped-positions-${cacheBust}`,
  });
  const wrappedLiquidity = (wrappedLiquidityRes || [0n, 0n]) as [bigint, bigint];

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [[token0, token1]],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], []]) as [string[], string[], bigint[]];
  // const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  const decimals = tokenMetadata[2].map(n => Number(n));

  useEffect(() => {
    if (token0 != NULL_ADDRESS && token1 != NULL_ADDRESS) {
      getTokenPrices([token0, token1, rewardToken]).then(() => setCacheBust(cacheBust + 1));
    }
  }, [token0, token1]);

  const { data: getUserPositionsRes } = useReadContract({
    abi: lpWrapperABI,
    address: lpWrapperAddress,
    functionName: "getUserPositions",
    args: [userAddress],
    scopeKey: `wrapped-user-${cacheBust}`,
  });
  const getUserPositions = (getUserPositionsRes || [[], [], []]) as [bigint[], Address[], bigint[]];
  const wrappedTokenIds: number[] = [];
  getUserPositions[1].forEach((lpToken, i) => {
    if (lpToken == stakeToken) {
      wrappedTokenIds.push(Number(getUserPositions[0][i]));
    }
  });

  const { data: getLPNFTsRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getLPNFTs",
    args: [userAddress],
    scopeKey: `unwrapped-positions-${cacheBust}`,
  });
  const getLPNFTs = (getLPNFTsRes || [[], [], []]) as [bigint[], Address[], Address[]];
  console.log(getLPNFTs);
  const unwrappedTokenIds: number[] = [];
  getLPNFTs[0].forEach((tokenId, i) => {
    if (
      (token0 == getLPNFTs[1][i] && token1 == getLPNFTs[2][i]) ||
      (token1 == getLPNFTs[1][i] && token0 == getLPNFTs[2][i])
    ) {
      unwrappedTokenIds.push(Number(tokenId));
    }
  });

  const onTxn = () => {
    onTransaction();
    setCacheBust(cacheBust + 1);
  }

  const token0Quantity = formatUnits(wrappedLiquidity[0], decimals[0]);
  const token1Quantity = formatUnits(wrappedLiquidity[1], decimals[1]);
  let token0Usd = 0;
  let token1Usd = 0;
  if (getTokenPrice(token0)) {
    token0Usd = parseFloat(token0Quantity) * getTokenPrice(token0);
  }
  if (getTokenPrice(token1)) {
    token1Usd = parseFloat(token1Quantity) * getTokenPrice(token1);
  }
  let rewardsPerSecondUsd = 0;
  if (rewardToken == token0) {
    rewardsPerSecondUsd = parseFloat(formatUnits(rewardsPerSecond, decimals[0])) * getTokenPrice(token0);
  } else if (rewardToken == token1) {
    rewardsPerSecondUsd = parseFloat(formatUnits(rewardsPerSecond, decimals[1])) * getTokenPrice(token1);
  }
  const rewardsPerYearUsd = 31536000 * rewardsPerSecondUsd;
  const principalUsd = token0Usd + token1Usd;
  const apr = rewardsPerYearUsd > 0 ? 100 * (rewardsPerYearUsd / principalUsd) : 0;

  return (
    <div style={{ position: "relative" }}>
      {
        token0Usd > 0 && token1Usd > 0 ? (
          <div>
            <b
              style={{ cursor: 'pointer', display: 'block' }}
              onClick={() => setOpen(!open)}
            >
              {
                open ? (<i className="fas fa-caret-down" />) : (<i className="fas fa-caret-right" />)
              }&nbsp;&nbsp;APR: {apr.toFixed(2)}%
            </b>
            <div style={{ fontSize: '.75em', display: open ? 'block' : 'none' }}>
              <br />
              <span>APR is based on the quantity and value of assets staked:</span>
              <br />
              {prettyPrint(token0Quantity, 3)} ${symbols[0]} (${token0Usd.toFixed(2)})
              <br />
              {prettyPrint(token1Quantity, 3)} ${symbols[1]} (${token1Usd.toFixed(2)})
            </div>
            <br />
          </div>
        ) : null
      }
      <div className='secondary-bg' style={{ padding: '.5em 1em', marginBottom: '1em', borderRadius: '12px' }}>
        <div style={{ fontSize: '.75em', marginBottom: '1em' }}>
          To stake, create and wrap a Uniswap Position NFT:
        </div>
        {
          unwrappedTokenIds.map((tokenId) => (
            <LPNFT
              walletWei={userWalletWei}
              key={`unwrapped-${tokenId}`}
              feeTier={fee}
              tokenId={tokenId}
              onTransaction={onTxn}
              symbol={symbol}
            />
          ))
        }
        {
          wrappedTokenIds.map((tokenId) => (
            <LPNFT
              isWrapped
              walletWei={userWalletWei}
              key={`wrapped-${tokenId}`}
              feeTier={fee}
              tokenId={tokenId}
              onTransaction={onTxn}
              symbol={symbol}
            />
          ))
        }
        {
          wrappedTokenIds.length == 0 && unwrappedTokenIds.length == 0 ? (
            <div style={{ fontSize: '.75em', fontStyle: 'italic' }}>
              None found. Create a full-range position <Link
                to={`https://app.uniswap.org/add/${token0 == WETH ? 'eth' : token0}/${token1 == WETH ? 'eth' : token1}/${fee}?minPrice=0.0&maxPrice=115792089237316195423570985008687907853269984665640564039457584007913129639935`}
                target="_blank"
              >here</Link>.
            </div>
          ) : (
            null
          )
        }
      </div>
    </div>
  );
}

export default LPStake;
