import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from "wagmi/chains";
import { formatUnits, parseUnits, Address } from 'viem';
import { Link } from "react-router-dom";

import LPStake from './LPStake';
import { lpWrapperABI, lpWrapperAddress } from 'constants/abi-lp-wrapper-v1';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { erc20ABI } from 'constants/abi-erc20';
import { prettyPrint } from 'utils/formatting';
import { getRebase } from 'utils/data';

interface StakeManagerProps {
  stakeToken: Address;
  rewardToken: Address;
  appAddress: Address;
  onTransaction: () => void;
  stakeSymbol: string;
  stakeDecimals: number;
}

function StakeManager({
  stakeToken,
  rewardToken,
  appAddress,
  onTransaction,
  stakeSymbol,
  stakeDecimals,
}: StakeManagerProps) {
  const account = useAccount();
  const userAddress = account.address;

  const [quantity, setQuantity] = useState('');
  const [stakingETH, setStakingETH] = useState(false);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);
  const [mode, setMode] = useState(0);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    setMode(0);
    setQuantity('');
  }, [stakeToken]);

  useEffect(() => {
    if (writeError) {
      setApproving(false);
      setStaking(false);
      setStakingETH(false);
      setUnstaking(false);
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      if (staking || unstaking) {
        setQuantity('');
      }
      setApproving(false);
      setStaking(false);
      setStakingETH(false);
      setUnstaking(false);
      setCacheBust(cacheBust + 1);
      onTransaction();
    }
  }, [writeError, isConfirmed]);

  const { data: versionRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress,
    functionName: "getRebaseVersion",
    args: [appAddress],
  });
  const version = Number(versionRes || 0n);
  console.log(version);
  const { rebaseABI, rebaseAddress } = getRebase(version);

  // Tokens staked by all users
  const { data: appStakeRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getAppStake",
    args: [appAddress, stakeToken],
    scopeKey: `stakemanager-${cacheBust}`,
  });
  const totalStakedWei = (appStakeRes || 0n) as bigint;

  // Tokens staked by user
  const { data: userAppStakeRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getUserStake",
    args: [appAddress, stakeToken, userAddress],
    scopeKey: `stakemanager-${cacheBust}`,
  });
  const userStakedWei = (userAppStakeRes || 0n) as bigint;

  // User's Token Balance / Allowance
  const { data: balanceOfRes } = useReadContract({
    abi: erc20ABI,
    address: stakeToken,
    functionName: "balanceOf",
    args: [userAddress],
    scopeKey: `stakemanager-${cacheBust}`
  });
  const userWalletWei = (balanceOfRes || 0n) as bigint;

  const { data: allowanceRes } = useReadContract({
    abi: erc20ABI,
    address: stakeToken,
    functionName: "allowance",
    args: [userAddress, rebaseAddress],
    scopeKey: `stakemanager-${cacheBust}`
  });
  const allowance = (allowanceRes || 0n) as bigint;

  const { data: isLPTokenRes } = useReadContract({
    abi: lpWrapperABI,
    address: lpWrapperAddress,
    functionName: "isLPToken",
    args: [stakeToken],
    scopeKey: `stakemanager-${cacheBust}`
  });
  const isLPToken = (isLPTokenRes || false) as boolean;

  const wei = parseUnits((quantity || '0').toString(), stakeDecimals);
  const input = parseFloat(quantity || '0');
  const hasAllowance = allowance >= wei;

  const approve = () => {
    setApproving(true);
    writeContract({
      abi: erc20ABI,
      address: stakeToken,
      functionName: "approve",
      args: [rebaseAddress, wei],
      chainId: base.id,
    });
  };

  const stake = () => {
    setStaking(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "stake",
      args: [stakeToken, wei, version == 0 ? [appAddress] : appAddress],
      chainId: base.id,
    });
  };

  const stakeETH = () => {
    setStakingETH(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "stakeETH",
      args: [version == 0 ? [appAddress] : appAddress],
      chainId: base.id,
      value: wei
    });
  };

  const unstake = () => {
    setUnstaking(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "unstake",
      args: version == 0 ? [stakeToken, wei] : [stakeToken, wei, appAddress],
      chainId: base.id,
    });
  };

  const unstakeETH = () => {
    if (version == 0) {
      window.alert('Unsupported');
      return;
    }
    setUnstaking(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "unstakeETH",
      args: [wei, appAddress],
      chainId: base.id,
    });
  };

  const totalStakedUnits = formatUnits(totalStakedWei, stakeDecimals);
  const userStakedUnits = formatUnits(userStakedWei, stakeDecimals);
  const userWalletUnits = formatUnits(userWalletWei, stakeDecimals);

  const pending = staking || unstaking || stakingETH;

  const isAll = mode == 0 ? quantity == userWalletUnits : quantity == userStakedUnits;
  return (
    <div>
      {
        isLPToken ? (
          <LPStake
            appAddress={appAddress}
            userStakedWei={userStakedWei}
            userWalletWei={userWalletWei}
            stakeToken={stakeToken}
            rewardToken={rewardToken}
            onTransaction={() => setCacheBust(cacheBust + 1)}
          />
        ) : (
          <div style={{ marginTop: "1em" }}>
            <div className="flex">
              <div
                className="flex-grow"
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '.25em 0',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: mode == 0 ? '1px solid #999' : '1px solid transparent'
                }}
                onClick={() => {
                  setMode(0);
                  setQuantity("")
                }}
              >
                Stake
              </div>
              <div
                className="flex-grow"
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '.25em 0',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: mode == 1 ? '1px solid #999' : '1px solid transparent'
                }}
                onClick={() => {
                  setMode(1);
                  setQuantity("")
                }}
              >
                Unstake
              </div>
              {
                isLPToken ? (
                  null
                ) : (
                  <Link
                    to={`https://dexscreener.com/base/${stakeToken}`}
                    className="flex-grow"
                    target="_blank"
                    style={{
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      // color: '#666',
                      padding: '.25em 0',
                      cursor: 'pointer',
                      border: '1px solid transparent'
                    }}
                  >
                    Trade&nbsp;<i className="fa-light fa-up-right-from-square"></i>
                  </Link>
                )
              }
            </div>
            <div style={{ fontSize: '.8em', marginTop: '1em' }}>
              <div>{prettyPrint(totalStakedUnits, 4)} ${stakeSymbol} staked in total</div>
              <div>{prettyPrint(userStakedUnits, 4)} ${stakeSymbol} staked by you ({(100 * parseFloat(String(userStakedWei)) / parseFloat(String(totalStakedWei || 1))).toFixed(0)}%)</div>
              <div>{prettyPrint(userWalletUnits, 4)} ${stakeSymbol} available to stake</div>
            </div>
            <br />
            <div className="flex">
              <div className="flex-shrink">&nbsp;</div>
              <input
                className="flex-grow buy-input"
                type="text"
                name="quantity"
                autoComplete="off"
                placeholder="quantity"
                style={{ width: "100%" }}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value.replace(/[^0-9.]/g, ''));
                }}
              />
              <div
                className="flex-shrink"
                style={{ marginLeft: '1em', minWidth: '4em' }}
                onClick={() => isAll ? setQuantity("") : setQuantity(mode == 0 ? userWalletUnits : userStakedUnits)}
              >
                <input
                  id="all"
                  type="checkbox"
                  checked={isAll}
                />
                <label htmlFor="all">&nbsp;all</label>
              </div>
            </div>
            <br />
            {
              mode == 0 ? (
                <div>
                  {
                    stakeSymbol == "WETH" && (
                      <div>
                        <div className="flex" style={{ alignItems: "end" }}>
                          <button
                            type="button"
                            className="buy-button flex-grow"
                            onClick={stakeETH}
                            disabled={pending || !(input > 0)}
                              style={{ marginRight: '.5em'}}
                          >
                            {stakingETH ? 'staking' : 'stake ETH'}
                            {
                              stakingETH ? (
                                <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                              ) : null
                            }
                          </button>
                        </div>
                        <div style={{ textAlign: 'center', fontStyle: 'italic' }}>or</div>
                      </div>
                    )
                  }
                  <div className="flex" style={{ alignItems: "end" }}>
                    {
                      hasAllowance ? (
                        <button
                          type="button"
                          className="buy-button flex-grow"
                          onClick={stake}
                          disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                        >
                          {staking ? 'staking' : 'stake'}
                          {stakeSymbol == 'WETH' ? ' WETH' : ''}
                          {
                            staking ? (
                              <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                            ) : null
                          }
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="buy-button flex-grow"
                          onClick={approve}
                          disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                        >
                          {approving ? 'approving' : 'approve and stake'}
                          {stakeSymbol == 'WETH' ? ' WETH' : ''}
                          {
                            approving ? (
                              <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                            ) : null
                          }
                        </button>
                      )
                    }
                  </div>
                </div>
              ) : (
                <div className="flex" style={{ alignItems: "end" }}>
                  <button
                    type="button"
                    className="buy-button flex-grow"
                    onClick={stakeSymbol == 'WETH' ? unstakeETH : unstake}
                    disabled={pending || !(input > 0 && parseFloat(userStakedUnits) >= input)}
                  >
                    {unstaking ? 'unstaking' : 'unstake'}
                    {
                      unstaking ? (
                        <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                      ) : null
                    }
                  </button>
                </div>
              )
            }
          </div>
        )
      }
    </div>
  );
}

export default StakeManager;
