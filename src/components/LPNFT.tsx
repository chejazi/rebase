import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, Address } from 'viem';

import { prettyPrint } from 'utils/formatting';
import { lpWrapperAddress, lpWrapperABI } from 'constants/abi-lp-wrapper';
import { lpNFTABI, lpNFTAddress } from 'constants/abi-lp-nft';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

interface LPNFTProps {
  tokenId: number;
  feeTier: number;
  isWrapped?: boolean;
  symbol: string;
  onTransaction: () => void;
  walletWei: bigint;
}

function LPNFT({ tokenId, feeTier, isWrapped, symbol, onTransaction, walletWei }: LPNFTProps) {
  const account = useAccount();
  const userAddress = account.address;

  const [loading, setLoading] = useState(false);

  /*
    uint96 nonce,
    address operator,
    address token0,
    address token1,
    uint24 fee,
    int24 minTick,
    int24 maxTick,
    uint128 liquidity,
    uint256 feeGrowthInside0LastX128,
    uint256 feeGrowthInside1LastX128,
    uint128 tokensOwed0,
    uint128 tokensOwed1
  */
  const { data: positionsRawRes } = useReadContract({
    abi: lpNFTABI,
    address: lpNFTAddress,
    functionName: "positions",
    args: [tokenId],
  });
  const positionsRes = (positionsRawRes || [0n, NULL_ADDRESS, NULL_ADDRESS, NULL_ADDRESS, 0n, 0n, 0n, 0n]) as [bigint, Address, Address, Address, bigint, bigint, bigint, bigint];
  // const token0 = positionsRes[2] as Address;
  // const token1 = positionsRes[3] as Address;
  const fee = Number(positionsRes[4] as bigint);
  const minTick = Number(positionsRes[5] as bigint);
  const maxTick = Number(positionsRes[6] as bigint);
  const liquidity = positionsRes[7] as bigint;

  let feeSupported = feeTier == fee;
  let inRange = false;
  if (fee == 100) {
    inRange = (minTick == -887272 && maxTick == 887272);
  } else if (fee == 500) {
    inRange = (minTick == -887270 && maxTick == 887270);
  } else if (fee == 3000) {
    inRange = (minTick == -887220 && maxTick == 887220);
  } else if (fee == 10000) {
    inRange = (minTick == -887200 && maxTick == 887200);
  }

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setLoading(false);
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      setLoading(false);
      onTransaction()
    }
  }, [writeError, isConfirmed]);

  const wrap = () => {
    setLoading(true);
    writeContract({
      abi: lpNFTABI,
      address: lpNFTAddress,
      functionName: "safeTransferFrom",
      args: [userAddress, lpWrapperAddress, tokenId],
    });
  };

  const unwrap = () => {
    setLoading(true);
    writeContract({
      abi: lpWrapperABI,
      address: lpWrapperAddress,
      functionName: "unwrap",
      args: [tokenId],
    });
  };

  const lpLiquidity = prettyPrint(formatUnits(liquidity, 18), 3);
  if (liquidity == 0n) {
    return null;
  }
  return (
    <div style={{ marginBottom: '.5em', alignItems: 'center', borderRadius: '12px', border: '1px solid #999', padding: '.5em 1em', margin: '1em 0' }} className="flex secondary-bg">
      <div className="flex-grow">
        LP #{tokenId}&nbsp;&nbsp;<Link to={`https://app.uniswap.org/positions/v3/base/${tokenId}`} target="_blank"><i className="fa-light fa-arrow-up-right-from-square" /></Link>
        {
          inRange && feeSupported ? (
            <div style={{ fontSize: '.75em' }}>
              {
                isWrapped ? (
                  <span>{walletWei < liquidity ? 'Unstake ' : ''}{lpLiquidity} ${symbol} to unwrap</span>
                ) : (
                  <span>{lpLiquidity} ${symbol}</span>
                )
              }
            </div>
          ) : (
            <div style={{ fontSize: '.75em' }}>
              {
                inRange ? (
                  <span><i className="fa-solid fa-triangle-exclamation"></i>&nbsp;&nbsp;Wrong fee tier</span>
                ) : (
                  <span><i className="fa-solid fa-triangle-exclamation"></i>&nbsp;&nbsp;Position ineligible - not full range.</span>
                )
              }
            </div>
          )
        }
      </div>
      <div className="flex-shrink">
        {
          isWrapped ? (
            <button className="buy-button" type="button" disabled={loading || walletWei < liquidity} onClick={unwrap}>
              unwrap
              {
                loading ? (
                  <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                ) : null
              }
            </button>
          ) : (
            <button className="buy-button" type="button" disabled={loading || !inRange || !feeSupported} onClick={wrap}>
              wrap
              {
                loading ? (
                  <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                ) : null
              }
            </button>
          )
        }
      </div>
    </div>
  );
}

export default LPNFT;
