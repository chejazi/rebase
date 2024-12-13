import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';

import LPNFT from './LPNFT';
import { lpWrapperAddress, lpWrapperABI } from 'constants/abi-lp-wrapper';
import { lpTokenABI } from 'constants/abi-lp-token';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
const WETH = '0x4200000000000000000000000000000000000006';

function LPStake({ token, onTransaction, symbol }: { token: Address; onTransaction: () => void; symbol: string; }) {
  const account = useAccount();
  const userAddress = account.address;

  const [cacheBust, setCacheBust] = useState(1);

  const { data: getPairRes } = useReadContract({
    abi: lpTokenABI,
    address: token,
    functionName: "getPair",
    args: [],
  });
  const getPair = (getPairRes || [NULL_ADDRESS, NULL_ADDRESS, 0n]) as [Address, Address, bigint];
  const token0 = getPair[0];
  const token1 = getPair[1];
  const fee = Number(getPair[2]);

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
    if (lpToken == token) {
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

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: '.75em', marginBottom: '1em' }}>
        To stake, first wrap your Uniswap Position NFTs below
      </div>
      {
        unwrappedTokenIds.map((tokenId) => (
          <LPNFT
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
      <br />
    </div>
  );
}

export default LPStake;
