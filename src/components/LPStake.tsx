import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from "wagmi/chains";
import { formatUnits, Address, parseUnits } from 'viem';

import LPNFT from './LPNFT';
import { prettyPrintTruncated } from 'utils/formatting';
import { getTokenPrices, getTokenPrice, getRebase } from 'utils/data';
import { lpWrapperAddress, lpWrapperABI } from 'constants/abi-lp-wrapper-v1';
import { lpCreatorAddress, lpCreatorABI } from 'constants/abi-lp-creator';
import { erc20ABI } from 'constants/abi-erc20';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
const WETH = '0x4200000000000000000000000000000000000006';

function LPStake({
  appAddress,
  stakeToken,
  rewardToken,
  onTransaction,
  userWalletWei,
  userStakedWei,
}: {
  appAddress: Address;
  stakeToken: Address;
  rewardToken: Address;
  onTransaction: () => void;
  userWalletWei: bigint;
  userStakedWei: bigint;
}) {
  const account = useAccount();
  const userAddress = account.address;

  const [cacheBust, setCacheBust] = useState(1);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showLPForm, setShowLPForm] = useState(false);
  const [token0Input, setToken0Input] = useState("");
  const [token1Input, setToken1Input] = useState("");
  const [approving0, setApproving0] = useState(false);
  const [approving1, setApproving1] = useState(false);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setStaking(false);
      setUnstaking(false);
      setApproving0(false);
      setApproving1(false);
      setCreating(false);
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      setStaking(false);
      setUnstaking(false);
      setCreating(false);
      if (!approving0 && !approving1) {
        setShowLPForm(false);
        onTransaction();
      } else {
        setApproving0(false);
        setApproving1(false);
      }
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);

  // Fetch the Tokens and Liquidity
  const { data: stakedLiquidityRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getStakedLiquidity",
    args: [appAddress, stakeToken],
  });
  const [
    token0,
    token1,
    token0Amount,
    token1Amount,
    fee,
    poolExists,
  ] = (stakedLiquidityRes || [NULL_ADDRESS, NULL_ADDRESS, 0n, 0n, 0n, true]) as [Address, Address, bigint, bigint, bigint, boolean];

  useEffect(() => {
    if (token0 != NULL_ADDRESS && token1 != NULL_ADDRESS && rewardToken) {
      getTokenPrices([token0, token1, rewardToken]).then(() => setCacheBust(cacheBust + 1));
    }
  }, [token0, token1, rewardToken]);


  // Fetch the metadata for each token
  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [[token0, token1, rewardToken]],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], []]) as [string[], string[], bigint[]];
  // const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  const decimals = tokenMetadata[2].map(n => Number(n));

  const { data: rewardsPerSecondRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getRewardsPerSecond",
    args: [appAddress, stakeToken],
  });
  const rewardsPerSecond = (rewardsPerSecondRes as bigint) || 0n;

  // Fetch LP NFTs the user has wrapped
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

  // Fetch the LP NFTs the user has not wrapped
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

  const { data: versionRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getRebaseVersion",
    args: [appAddress],
  });
  const version = Number(versionRes || 0n);
  const { rebaseABI, rebaseAddress } = getRebase(version);

  const { data: balance0Res } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getUserBalance",
    args: [userAddress, token0],
    scopeKey: `lp-stake-${cacheBust}`
  });
  const balance0 = (balance0Res || 0n) as bigint;

  const { data: balance1Res } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getUserBalance",
    args: [userAddress, token1],
    scopeKey: `lp-stake-${cacheBust}`
  });
  const balance1 = (balance1Res || 0n) as bigint;

  const { data: allowance0Res } = useReadContract({
    abi: erc20ABI,
    address: token0,
    functionName: "allowance",
    args: [userAddress, lpCreatorAddress],
    scopeKey: `lp-stake-${cacheBust}`
  });
  const allowance0 = (allowance0Res || 0n) as bigint;

  const { data: allowance1Res } = useReadContract({
    abi: erc20ABI,
    address: token1,
    functionName: "allowance",
    args: [userAddress, lpCreatorAddress],
    scopeKey: `lp-stake-${cacheBust}`
  });
  const allowance1 = (allowance1Res || 0n) as bigint;

  const stake = () => {
    setStaking(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "stake",
      args: [stakeToken, userWalletWei, appAddress],
      chainId: base.id,
    });
  };

  const unstake = () => {
    setUnstaking(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress as Address,
      functionName: "unstake",
      args: [stakeToken, userStakedWei, appAddress],
      chainId: base.id,
    });
  };

  const token0Wei = parseUnits((token0Input || '0').toString(), decimals[0]);
  const token1Wei = parseUnits((token1Input || '0').toString(), decimals[1]);

  const approve0 = () => {
    setApproving0(true);
    writeContract({
      abi: erc20ABI,
      address: token0,
      functionName: "approve",
      args: [lpCreatorAddress, token0Wei],
      chainId: base.id,
    });
  };

  const approve1 = () => {
    setApproving1(true);
    writeContract({
      abi: erc20ABI,
      address: token1,
      functionName: "approve",
      args: [lpCreatorAddress, token1Wei],
      chainId: base.id,
    });
  };
  const create = () => {
    setCreating(true);
    let value = 0n;
    if (token0 == WETH) {
      value = token0Wei;
    } else if (token1 == WETH) {
      value = token1Wei;
    }
    const deadline = Math.floor(new Date().getTime() / 1000) + 1800;
    writeContract({
      abi: lpCreatorABI,
      address: lpCreatorAddress,
      functionName: poolExists ? "create" : "createAndInitializePool",
      args: [token0, token1, token0Wei, token1Wei, fee, deadline],
      chainId: base.id,
      value,
    });
  };

  console.log(poolExists);

  const onTxn = () => {
    onTransaction();
    setCacheBust(cacheBust + 1);
  }

  const token0Quantity = formatUnits(token0Amount, decimals[0]);
  const token1Quantity = formatUnits(token1Amount, decimals[1]);

  const token0Price = getTokenPrice(token0);
  const token1Price = getTokenPrice(token1);
  const rewardTokenPrice = getTokenPrice(rewardToken);

  const token0Usd = token0Price ? (parseFloat(token0Quantity) * token0Price) : 0;
  const token1Usd = token1Price ? (parseFloat(token1Quantity) * token1Price) : 0;
  const rewardsPerSecondUsd = rewardTokenPrice ? (parseFloat(formatUnits(rewardsPerSecond, decimals[2])) * rewardTokenPrice) : 0;
  const rewardsPerYearUsd = 31536000 * rewardsPerSecondUsd;
  const principalUsd = token0Usd + token1Usd;
  const apy = token0Usd > 0 && token1Usd > 0 ? 100 * (rewardsPerYearUsd / principalUsd) : 0;

  const tokensUsd = token0Usd > 0 && token1Usd > 0 ? (token0Usd + token1Usd) : 0;

  const hasAllowance0 = token0 == WETH ? true : allowance0 >= token0Wei;
  const hasAllowance1 = token1 == WETH ? true : allowance1 >= token1Wei;
  const invalidQuantity = token0Wei > balance0 || token1Wei > balance1;
  const zeroQuantity = token0Wei == 0n || token1Wei == 0n;

  const symbol0 = symbols[0] == "WETH" ? "ETH" : symbols[0];
  const symbol1 = symbols[1] == "WETH" ? "ETH" : symbols[1];

  const wallet0Units = formatUnits(balance0, decimals[0]);
  const wallet1Units = formatUnits(balance1, decimals[1]);

  return (
    <div style={{ position: "relative" }}>
      {
        rewardsPerSecond > 0 && token0Usd > 0 && token1Usd > 0 ? (
          <div>
            <h4 style={{ marginBottom: '.5em' }}>Pool APY: {apy.toFixed(2)}%</h4>
            <div style={{ fontSize: '.75em' }}>
              <div>
                Based on total assets staked{tokensUsd ? `: $${prettyPrintTruncated(tokensUsd, 2)}` : null}
              </div>
              <div>{prettyPrintTruncated(token1Quantity, 3)} ${symbol1}</div>
              <div>{prettyPrintTruncated(token0Quantity, 3)} ${symbol0}</div>
            </div>
          </div>
        ) : null
      }
      <div className="flex" style={{ alignItems: "center" }}>
        <h4 className="flex-grow">My LP Positions</h4>
        <div
          className="flex-shrink ui-island"
          style={{ padding: '.5em 1em', fontWeight: 'bold', cursor: 'pointer', visibility: showLPForm ? 'hidden' : 'visible' }}
          onClick={() => setShowLPForm(true)}
        >
          <i className="fa-solid fa-plus" />&nbsp;Create
        </div>
      </div>
      {
        showLPForm ? (
          <div className="ui-island" style={{ padding: '0 1em 1em 1em' }}>
            <div className="flex" style={{ alignItems: "start" }}>
              <h4 className="flex-grow">
                Create LP Position
                <div style={{ fontSize: '.75em', fontWeight: 'normal', fontStyle: 'italic' }}>
                  You can also create one on the <Link
                    to="https://app.uniswap.org/positions/create/v3"
                    target="_blank"
                  >Uniswap App</Link>.
                </div>
              </h4>
              <div
                className="flex-shrink"
                style={{ padding: '1em 0', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => setShowLPForm(false)}
              >
                <i className="fa-solid fa-xmark" />
              </div>
            </div>
            {
              (!token0Price || !token1Price) &&
              <div className="secondary-bg" style={{ fontWeight: 'bold', textAlign: 'center', padding: '1em', border: '1px solid #999', borderRadius: '12px', marginBottom: '1em' }}>
                <div><i className="fa-solid fa-exclamation-triangle" /> Price data missing</div>
                <div style={{ fontSize: '.75em', marginTop: '.5em' }}>Ensure the amounts you provide below both have the same USD value</div>
              </div>
            }
            <div className="flex">
              <div className="flex-grow" style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold" }}>${symbol0}</div>
                <input
                  className="flex-grow buy-input"
                  type="text"
                  name="quantity"
                  autoComplete="off"
                  placeholder={`amount ${symbol0}`}
                  style={{ width: "100%", padding: '.5em', textAlign: "center" }}
                  value={token0Input}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setToken0Input(value);
                    if (value.length == 0) {
                      setToken1Input("");
                    } else if (token0Price && token1Price) {
                      const conversion = parseFloat(value) * token0Price / token1Price;
                      if (token1 == WETH) {
                        setToken1Input(conversion.toFixed(6));
                      } else {
                        setToken1Input(conversion.toFixed(3));
                      }
                    }
                  }}
                />
                <div style={{ padding: '1em 0', fontSize: '.75em' }}>
                  {prettyPrintTruncated(wallet0Units, 4)} available
                </div>
                <button
                  type="button"
                  className="buy-button"
                  style={{ width: '100%', display: hasAllowance0 ? 'none' : 'block' }}
                  onClick={approve0}
                  disabled={approving0 || hasAllowance0}
                >
                  approve
                  {
                    approving0 ? (
                      <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: ".5em" }}></i>
                    ) : null
                  }
                </button>
              </div>
              <div className="flex-shrink" style={{ width: '1em' }}></div>
              <div className="flex-grow" style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold" }}>${symbol1}</div>
                <input
                  className="flex-grow buy-input"
                  type="text"
                  name="quantity"
                  autoComplete="off"
                  placeholder={`amount ${symbol1}`}
                  style={{ width: "100%", padding: '.5em', textAlign: "center" }}
                  value={token1Input}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setToken1Input(value);
                    if (value.length == 0) {
                      setToken0Input("");
                    } else if (token0Price && token1Price) {
                      const conversion = parseFloat(value) * token1Price / token0Price;
                      if (token0 == WETH) {
                        setToken0Input(conversion.toFixed(6));
                      } else {
                        setToken0Input(conversion.toFixed(3));
                      }
                    }
                  }}
                />
                <div style={{ padding: '1em 0', fontSize: '.75em' }}>
                  {prettyPrintTruncated(wallet1Units, 4)} available
                </div>
                <button
                  type="button"
                  className="buy-button"
                  style={{ width: '100%', display: hasAllowance1 ? 'none' : 'block' }}
                  onClick={approve1}
                  disabled={approving1 || hasAllowance1}
                >
                  approve
                  {
                    approving1 ? (
                      <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: ".5em" }}></i>
                    ) : null
                  }
                </button>
              </div>
            </div>
            <div className="flex" style={{ marginTop: '1em' }}>
              <button
                className="buy-button flex-grow"
                type="button"
                disabled={creating || !hasAllowance0 || !hasAllowance1 || invalidQuantity || zeroQuantity}
                onClick={create}
              >
                {
                  invalidQuantity ? (
                    <span>insufficient balance</span>
                  ) : (
                    <div>
                      create position
                      {
                        creating ? (
                          <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                        ) : null
                      }
                    </div>
                  )
                }
              </button>
            </div>
          </div>
        ) : null
      }
      <div>
        {
          unwrappedTokenIds.map((tokenId) => (
            <LPNFT
              walletWei={userWalletWei}
              key={`unwrapped-${tokenId}`}
              feeTier={Number(fee)}
              tokenId={tokenId}
              onTransaction={onTxn}
            />
          ))
        }
        {
          wrappedTokenIds.map((tokenId) => (
            <LPNFT
              isWrapped
              walletWei={userWalletWei}
              key={`wrapped-${tokenId}`}
              feeTier={Number(fee)}
              tokenId={tokenId}
              onTransaction={onTxn}
            />
          ))
        }
        {
          !showLPForm &&
          <div>
            {
              userWalletWei != 0n &&
              <div className="flex" style={{ padding: '1em', alignItems: 'center' }}>
                <div className="flex-grow">
                  Stake to earn {apy.toFixed(2)}% APY
                </div>
                <button className="buy-button flex-shrink" type="button" disabled={staking} onClick={stake}>
                  stake
                  {
                    staking ? (
                      <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                    ) : null
                  }
                </button>
              </div>
            }
            {
              userStakedWei != 0n &&
              <div className="flex" style={{ padding: '1em', alignItems: 'center', marginTop: '1em' }}>
                <div className="flex-grow">
                  Unstake to unwrap your LP
                </div>
                <button className="buy-button flex-shrink" type="button" disabled={unstaking} onClick={unstake}>
                  unstake
                  {
                    unstaking ? (
                      <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                    ) : null
                  }
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  );
}

export default LPStake;
