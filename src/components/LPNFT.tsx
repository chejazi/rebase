import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from "wagmi/chains";
import { formatUnits, Address } from 'viem';

import { prettyPrintTruncated } from 'utils/formatting';
import { lpWrapperAddress, lpWrapperABI } from 'constants/abi-lp-wrapper-v1';
import { batchReadAddress, batchReadABI } from 'constants/abi-batch-read';
import { lpNFTABI, lpNFTAddress } from 'constants/abi-lp-nft';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

interface LPNFTProps {
  tokenId: number;
  feeTier: number;
  isWrapped?: boolean;
  onTransaction: () => void;
  walletWei: bigint;
}

function LPNFT({ tokenId, feeTier, isWrapped, onTransaction, walletWei }: LPNFTProps) {
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
  const token0 = positionsRes[2] as Address;
  const token1 = positionsRes[3] as Address;
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

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [[token0,token1]],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], [], [], []]) as [string[], string[], bigint[], bigint[], string[]];
  // const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  const decimals = tokenMetadata[2].map(n => Number(n));
  // const images = tokenMetadata[4];

  const { data: underlyingAssetsRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getUnderlyingAssets",
    args: [tokenId],
  });
  const [token0Amount, token1Amount] = (underlyingAssetsRes || [0n, 0n]) as [bigint, bigint];

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
      onTransaction();
    }
  }, [writeError, isConfirmed]);

  const wrap = () => {
    setLoading(true);
    writeContract({
      abi: lpNFTABI,
      address: lpNFTAddress,
      functionName: "safeTransferFrom",
      args: [userAddress, lpWrapperAddress, tokenId],
      chainId: base.id,
    });
  };

  const unwrap = () => {
    setLoading(true);
    writeContract({
      abi: lpWrapperABI,
      address: lpWrapperAddress,
      functionName: "unwrap",
      args: [tokenId],
      chainId: base.id,
    });
  };

  if (liquidity == 0n) {
    return null;
  }
  return (
    <div style={{ marginBottom: '.5em', alignItems: 'center', borderRadius: '12px', border: '1px solid #999', padding: '.5em 1em', marginTop: '1em' }} className="flex secondary-bg">
      <div className="flex-grow">
        <div>
          <Link to={`https://app.uniswap.org/positions/v3/base/${tokenId}`} target="_blank" className="space-right">
            <i className="fa-solid fa-arrow-up-right-from-square" />
          </Link>
          <span>{isWrapped ? 'Wrapped LP' : 'Wrap to stake'}</span>
        </div>
        <div style={{ fontSize: '.75em' }}>
          {
            inRange && feeSupported ? (
              <div>
                <div>{prettyPrintTruncated(formatUnits(token1Amount, decimals[1] || 18), 3)} {symbols[1]}</div>
                <div>{prettyPrintTruncated(formatUnits(token0Amount, decimals[0] || 18), 3)} {symbols[0]}</div>
              </div>
            ) : (
              <div>
                {
                  inRange ? (
                    <span className="space-right"><i className="fa-solid fa-triangle-exclamation"></i>Wrong fee tier</span>
                  ) : (
                    <span className="space-right"><i className="fa-solid fa-triangle-exclamation"></i>Position ineligible - not full range.</span>
                  )
                }
              </div>
            )
          }
        </div>
      </div>
      <div className="flex-shrink" style={{ textAlign: 'right' }}>
        {
          isWrapped ? (
            <div>
              <button className="buy-button" type="button" disabled={loading || walletWei < liquidity} onClick={unwrap}>
                unwrap
                {
                  loading ? (
                    <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                  ) : null
                }
              </button>
            </div>
          ) : (
            <div>
              <button className="buy-button" type="button" disabled={loading || !inRange || !feeSupported} onClick={wrap}>
                wrap
                {
                  loading ? (
                    <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                  ) : null
                }
              </button>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default LPNFT;
