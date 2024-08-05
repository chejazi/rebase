import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, Address } from 'viem';
import Select from 'react-select';
import { Link } from "react-router-dom";

import { DropdownOption, DropdownOptionLabel, NumberMap } from '../types';
import Stake from './Stake';
import RewardsREFI from './RewardsREFI';
import StakeManager from './StakeManager';
import RewardProgressBar from './RewardProgressBar';
import { rebaseABI, rebaseAddress } from 'constants/abi-rebase-v0';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read-v0';
import { rewardsAddress, lpRewardsAddress } from 'constants/abi-rebase-rewards';
import { lpWrapperABI, lpWrapperAddress } from 'constants/abi-lp-wrapper';
import { erc20ABI } from 'constants/abi-erc20';
import { getPrices, getTokenImage, getStakingApp } from 'utils/data';
import { prettyPrint } from 'utils/formatting';

const wethToken = '0x4200000000000000000000000000000000000006';
const wethRefiLPToken = '0x32abE75D06D455e8b5565D47fC3c21d0877AcDD4';

const FIVE_WEEKS = 5 * 7 * 24 * 60 * 60;
const FIFTY_WEEKS = FIVE_WEEKS * 10;

const rewardPeriods = [
  { tokens: 200000000, startTime: 1717102721, duration: FIVE_WEEKS },
  { tokens: 500000000, startTime: 1718034255, duration: FIVE_WEEKS },
  { tokens: 200000000, startTime: 1718034255, duration: FIFTY_WEEKS },
];

export const refiOptions: readonly DropdownOption[] = [
  { value: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', label: 'AERO', symbol: 'AERO', rewardPeriods: [0]},
  { value: '0x3C281A39944a2319aA653D81Cfd93Ca10983D234', label: 'BUILD', symbol: 'BUILD', rewardPeriods: [0]},
  { value: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', label: 'DEGEN', symbol: 'DEGEN', rewardPeriods: [0]},
  { value: wethToken, label: 'ETH', symbol: 'WETH', rewardPeriods: [0]},
  { value: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe', label: 'HIGHER', symbol: 'higher', rewardPeriods: [0]},
  { value: wethRefiLPToken, label: 'vAMM-WETH/REFI', symbol: 'WETH', rewardPeriods: [1]},
];

const uniLPToken = '0x064Cc7EBec6067745CE28FE065b45C6589620845';

const lpOptions: readonly DropdownOption[] = [
  { value: uniLPToken, label: 'WETH/REFI', symbol: 'WETH/REFI', rewardPeriods: [2]}
];

const formatOptionLabel = ({ label, description, image }: DropdownOptionLabel) => (
  <div className="flex" style={{ alignItems: "center" }}>
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
  name: string;
}

function Project({ name }: ProjectProps) {
  const account = useAccount();

  const [token, setToken] = useState<Address|null>(null);
  const [quantity, setQuantity] = useState('');
  const [stakingETH, setStakingETH] = useState(false);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);
  const [prices, setPrices] = useState<NumberMap>({});
  const [mode, setMode] = useState(0);

  const stakingContract: Address = rebaseAddress as Address;
  const options: readonly DropdownOption[] = refiOptions;

  const appAddress = getStakingApp(name) as Address;

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    getPrices().then((res) => {
      setPrices(res as NumberMap);
    });
  }, []);

  useEffect(() => {
    if (writeError) {
      setApproving(false);
      setStaking(false);
      setStakingETH(false);
      setUnstaking(false);
      setTimeout(() => window.alert(writeError), 1);
    } else if (isConfirmed) {
      if (staking || unstaking) {
        setQuantity('');
      }
      setApproving(false);
      setStaking(false);
      setStakingETH(false);
      setUnstaking(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);

  const { data: stakesRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenStakes",
    args: [options.map(o => o.value)],
  });
  const stakes = (stakesRes || []) as bigint[];

  const { data: lpWethRes } = useReadContract({
    abi: erc20ABI,
    address: wethToken as Address,
    functionName: "balanceOf",
    args: [wethRefiLPToken],
  });
  const lpWethWei = (lpWethRes || 0) as bigint;
  stakes[stakes.length - 1] = lpWethWei;

  const { data: symbolRes } = useReadContract({
    abi: erc20ABI,
    address: token as Address,
    functionName: "symbol",
    args: [],
  });
  const symbol = symbolRes as string;

  const { data: decimalsRes } = useReadContract({
    abi: erc20ABI,
    address: token as Address,
    functionName: "decimals",
    args: [],
  });
  const decimals = (decimalsRes || 0) as number;

  const { data: getTokenStakeRes } = useReadContract({
    abi: rebaseABI,
    address: stakingContract,
    functionName: "getTokenStake",
    args: [token],
    scopeKey: `home-${cacheBust}`
  });
  const totalStakedWei = (getTokenStakeRes || 0n) as bigint;

  const { data: getUserTokenStakeRes } = useReadContract({
    abi: rebaseABI,
    address: stakingContract,
    functionName: "getUserTokenStake",
    args: [account.address, token],
    scopeKey: `home-${cacheBust}`
  });
  const userStakedWei = (getUserTokenStakeRes || 0n) as bigint;

  const { data: getUserStakedTokensRes } = useReadContract({
    abi: rebaseABI,
    address: stakingContract,
    functionName: "getUserStakedTokens",
    args: [account.address],
    scopeKey: `home-${cacheBust}`
  });
  const stakedTokens = (getUserStakedTokensRes || []) as Address[];

  const { data: balanceOfRes } = useReadContract({
    abi: erc20ABI,
    address: token as Address,
    functionName: "balanceOf",
    args: [account.address],
    scopeKey: `home-${cacheBust}`
  });
  const userWalletWei = (balanceOfRes || 0n) as bigint;

  const { data: allowanceRes } = useReadContract({
    abi: erc20ABI,
    address: token as Address,
    functionName: "allowance",
    args: [account.address, stakingContract],
    scopeKey: `home-${cacheBust}`
  });
  const allowance = (allowanceRes || 0n) as bigint;

  const { data: isLPTokenRes } = useReadContract({
    abi: lpWrapperABI,
    address: lpWrapperAddress,
    functionName: "isLPToken",
    args: [token],
    scopeKey: `home-${cacheBust}`
  });
  const isLPToken = (isLPTokenRes || false) as boolean;

  const wei = parseUnits((quantity || '0').toString(), decimals);
  const input = parseFloat(quantity || '0');

  const hasAllowance = allowance >= wei;

  const approve = () => {
    setApproving(true);
    writeContract({
      abi: erc20ABI,
      address: token as Address,
      functionName: "approve",
      args: [stakingContract, wei],
    });
  };

  const stake = () => {
    setStaking(true);
    writeContract({
      abi: rebaseABI,
      address: stakingContract,
      functionName: "stake",
      args: [token, wei, [
        token == wethRefiLPToken ? lpRewardsAddress : rewardsAddress
      ]],
    });
  };

  const stakeETH = () => {
    setStakingETH(true);
    writeContract({
      abi: rebaseABI,
      address: stakingContract,
      functionName: "stakeETH",
      args: [[rewardsAddress]],
      value: wei
    });
  };

  const unstake = () => {
    setUnstaking(true);
    writeContract({
      abi: rebaseABI,
      address: stakingContract,
      functionName: "unstake",
      args: [token, wei],
    });
  };

  const totalStakedUnits = formatUnits(totalStakedWei, decimals);
  const userStakedUnits = formatUnits(userStakedWei, decimals);
  const userWalletUnits = formatUnits(userWalletWei, decimals);

  const pending = staking || unstaking || stakingETH;

  const isAll = mode == 0 ? quantity == userWalletUnits : quantity == userStakedUnits;

  let allTVL = 0;
  options.forEach((o, i) => {
    const price = prices[o.symbol] as number;
    const tvl = price && stakes[i] ? (price * parseFloat(formatUnits(stakes[i], 18))) : null;
    if (tvl) {
      allTVL += tvl;
    }
  });

  const transformedOptions = options.map((o, i) => {
    const price = prices[o.symbol] as number;
    const stake = stakes[i] || 0n;
    const tvl = price && stake ? (price * parseFloat(formatUnits(stake, 18))) : null;
    return {
      value: o.value,
      label: `$${o.label}`,
      rewardPeriods: o.rewardPeriods,
      image: getTokenImage(o.value),
      description: tvl ? `$${prettyPrint(tvl.toString(), 0)} staked` : `${prettyPrint(formatUnits(stake, 18), 0)} ${o.label} staked`,
    };
  });

  const newOptions = lpOptions.map((o) => {
    return {
      value: o.value,
      label: `$${o.label}`,
      rewardPeriods: o.rewardPeriods,
      image: getTokenImage(o.value),
      description: 'Uniswap Position NFTs'
    };
  });
  console.log(newOptions);

  const selectedOption = transformedOptions.filter(t => t.value == token)?.[0];

  const rewards = selectedOption ? rewardPeriods[selectedOption.rewardPeriods[0]] : null;

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
                options={transformedOptions}
                id="coin-selector"
                classNamePrefix="coin-selector"
                onChange={(e) => {
                  setMode(0);
                  setQuantity("");
                  setToken(e ? e.value as Address : null)
                }}
                value={selectedOption}
                formatOptionLabel={formatOptionLabel}
              />
            </div>
          </div>
          {
            symbol ? (
              <div>
                {
                  rewards ? (
                    <RewardProgressBar
                      rewardTotal={BigInt(rewards.tokens)}
                      decimals={0}
                      rewardSymbol={name}
                      stakeSymbol={symbol}
                      startTime={rewards.startTime}
                      endTime={rewards.startTime + rewards.duration}
                    />
                  ) : null
                }
                <br />
                {
                  isLPToken ? (
                    <StakeManager
                      token={token as Address}
                      appAddress={appAddress}
                      onTransaction={() => setCacheBust(cacheBust + 1)}
                      stakeSymbol={symbol}
                      stakeDecimals={decimals}
                    />
                  ) : (
                    <div>
                      <div className="flex">
                        <div
                          className="flex-grow"
                          style={{
                            textAlign: "center",
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
                            textAlign: "center",
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
                        <Link
                          to={`https://dexscreener.com/base/${token}`}
                          className="flex-grow"
                          target="_blank"
                          style={{
                            textDecoration: 'none',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            padding: '.25em 0',
                            cursor: 'pointer',
                            border: '1px solid transparent'
                          }}
                        >
                          Trade&nbsp;<i className="fa-light fa-up-right-from-square"></i>
                        </Link>
                      </div>
                      <div style={{ fontSize: '.8em', marginTop: '1em' }}>
                        <div>{prettyPrint(totalStakedUnits, 4)} ${symbol} staked in total</div>
                        <div>{prettyPrint(userStakedUnits, 4)} ${symbol} staked by you ({(100 * parseFloat(String(userStakedWei)) / parseFloat(String(totalStakedWei || 1))).toFixed(0)}%)</div>
                        <div>{prettyPrint(userWalletUnits, 4)} ${symbol} available to stake</div>
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
                              symbol == "WETH" && (
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
                                    {symbol == 'WETH' ? ' WETH' : ''}
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
                                    {symbol == 'WETH' ? ' WETH' : ''}
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
                              onClick={unstake}
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
            ) : (
              <div style={{ fontSize: '.75em' }}>
                <br />
                {
                  allTVL > 0
                  ? `Join $${prettyPrint(allTVL.toString(), 0)} worth of stakers earning $${name}. `
                  : `Stake the tokens above to earn $${name}. `
                }
                Unstake at any time.
              </div>
            )
          }
        </div>
        <h2>Manage</h2>
        {
          stakedTokens.length == 0 ? (
            <div>
              You have no assets staked. Stake them above.
            </div>
          ) : (
            <div>
              {
                (stakedTokens || []).map(t => {
                  return (
                    <div key={`stake-${t}`} onClick={() => setToken(t as Address)}>
                      <Stake token={t} />
                    </div>
                  )
                })
              }
            </div>
          )
        }
        <h2>Claim</h2>
        <div className="ui-island" style={{ padding: '1em' }}>
          <RewardsREFI />
        </div>
      </div>
    </div>
  );
}

export default Project;
