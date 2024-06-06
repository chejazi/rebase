import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits, Address } from 'viem';
import CreatableSelect from 'react-select/creatable';

import { DropdownOption, DropdownOptionLabel, NumberMap } from "./types";
import Stake from "./Stake";
import { rebaseABI, rebaseAddress } from "./rebase-abi";
import { readABI, readAddress } from "./batch-read-rebase";
import { rewardsAddress } from "./rebase-rewards";
import erc20ABI from "./erc20-abi.json";
import * as data from "./data";
// const UINT256MAX = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const options: readonly DropdownOption[] = [
  { value: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', label: '$AERO', symbol: 'aero'},
  { value: '0x3C281A39944a2319aA653D81Cfd93Ca10983D234', label: '$BUILD', symbol: 'build'},
  { value: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', label: '$DEGEN', symbol: 'degen'},
  { value: '0x4200000000000000000000000000000000000006', label: '$ETH', symbol: 'eth'},
  { value: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe', label: '$HIGHER', symbol: 'higher'},
];

const formatOptionLabel = ({ label, description }: DropdownOptionLabel) => (
  <div>
    <div style={{ fontWeight: 'bold' }}>{label}</div>
    <div className="tvl" style={{ fontWeight: 'normal', fontSize: '.75em' }}>{description}</div>
  </div>
);

function Home() {
  const account = useAccount();

  const [token, setToken] = useState<Address|null>(null);
  const [quantity, setQuantity] = useState('');
  const [stakingETH, setStakingETH] = useState(false);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);
  const [prices, setPrices] = useState<NumberMap>({});

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    data.getPrices().then((res) => {
      setPrices(res as NumberMap);
    });
  }, []);
  console.log(prices);

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
    abi: readABI,
    address: readAddress as Address,
    functionName: "getTokenStakes",
    args: [options.map(o => o.value)],
  });
  const stakes = (stakesRes || []) as bigint[];
  console.log(stakes);

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
    address: rebaseAddress as Address,
    functionName: "getTokenStake",
    args: [token],
    scopeKey: `home-${cacheBust}`
  });
  const totalStakedWei = (getTokenStakeRes || 0n) as bigint;

  const { data: getUserTokenStakeRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
    functionName: "getUserTokenStake",
    args: [account.address, token],
    scopeKey: `home-${cacheBust}`
  });
  const userStakedWei = (getUserTokenStakeRes || 0n) as bigint;

  const { data: getUserStakedTokensRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
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
    args: [account.address, rebaseAddress],
    scopeKey: `home-${cacheBust}`
  });
  const allowance = (allowanceRes || 0n) as bigint;

  const wei = parseUnits((quantity || '0').toString(), decimals);
  const input = parseFloat(quantity || '0');

  const hasAllowance = allowance >= wei;

  const approve = () => {
    setApproving(true);
    writeContract({
      abi: erc20ABI,
      address: token as Address,
      functionName: "approve",
      args: [rebaseAddress, wei],
    });
  };

  const stake = () => {
    setStaking(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "stake",
      args: [token, wei, [rewardsAddress]],
    });
  };

  const stakeETH = () => {
    setStakingETH(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "stakeETH",
      args: [[rewardsAddress]],
      value: wei
    });
  };

  const unstake = () => {
    setUnstaking(true);
    writeContract({
      abi: rebaseABI,
      address: rebaseAddress,
      functionName: "unstake",
      args: [token, wei],
    });
  };

  const totalStakedUnits = formatUnits(totalStakedWei, decimals);
  const userStakedUnits = formatUnits(userStakedWei, decimals);
  const userWalletUnits = formatUnits(userWalletWei, decimals);

  const pending = staking || unstaking || stakingETH;

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Rebase</h1>
          <p>Rebase is a protocol for launching tokens. <Link to="/about">Learn more</Link></p>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            marginBottom: "1em",
            padding: "1em",
            borderRadius: "12px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div className="flex" style={{ alignItems: "end" }}>
            <div className="flex-grow" style={{ fontWeight: "bold" }}>
              <CreatableSelect
                isClearable
                options={options.map((o, i) => {
                  const price = prices[o.symbol] as number;
                  const tvl = price && stakes[i] ? (price * parseFloat(formatUnits(stakes[i], 18))) : null;
                  return {
                    value: o.value,
                    label: o.label,
                    description: tvl ? `$${parseFloat(tvl.toFixed(0)).toLocaleString()} staked` : '',
                  };
                })}
                id="coin-selector"
                classNamePrefix="coin-selector"
                onChange={(e) => setToken(e ? e.value as Address : null)}
                formatCreateLabel={(inputValue) => `Stake ${inputValue}`}
                formatOptionLabel={formatOptionLabel}
              />
            </div>
          </div>
          {
            symbol ? (
              <div>
                <h2>${symbol}</h2>
                <div style={{ fontSize: '.8em', marginTop: '1em' }}>
                <div>{totalStakedUnits} ${symbol} staked in total</div>
                <div>{userStakedUnits} ${symbol} staked by you</div>
                <div>{userWalletUnits} ${symbol} available to stake</div>
                </div>
                <br />
                <input
                  className="buy-input"
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
                <br />
                <br />
                <div className="flex" style={{ alignItems: "end" }}>
                {
                  symbol == "WETH" && (
                    <button
                      type="button"
                      className="buy-button"
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
                  )
                }
                  {
                    hasAllowance ? (
                      <button
                        type="button"
                        className="buy-button"
                        onClick={stake}
                        disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                        style={{ marginRight: '.5em'}}
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
                        className="buy-button"
                        onClick={approve}
                        disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                        style={{ marginRight: '.5em'}}
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
                  <button
                    type="button"
                    className="buy-button"
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
              </div>
            ) : (
              <div style={{ fontSize: '.75em' }}><br />Stake one of the tokens above to start earning $REBASE. You can unstake at any time. Rewards run through early July.</div>
            )
          }
        </div>
        <h2>My stakes</h2>
        <div>
          {
            (stakedTokens || []).map(t => {
              return (
                <Stake key={`stake-${t}`} token={t} />
              )
            })
          }
        </div>
      </div>
    </div>
  );
}

export default Home;
