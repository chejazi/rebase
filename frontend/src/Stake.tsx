import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits, Address } from 'viem';

import { rebaseABI, rebaseAddress } from "./rebase-abi";
import erc20ABI from "./erc20-abi.json";

function Stake({ token }: { token: Address }) {
  const account = useAccount();
  const [expanded, setExpanded] = useState(false);

  const { data: getUserTokenStakeRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress,
    functionName: "getUserTokenStake",
    args: [account.address, token],
  });
  const userStakedWei = (getUserTokenStakeRes || 0n) as bigint;

  const { data: getUserTokenAppsRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress,
    functionName: "getUserTokenApps",
    args: [account.address, token],
  });
  const appList = (getUserTokenAppsRes || []) as Address[];

  const { data: symbolRes } = useReadContract({
    abi: erc20ABI,
    address: token,
    functionName: "symbol",
    args: [],
  });
  const symbol = symbolRes as string;

  const { data: decimalsRes } = useReadContract({
    abi: erc20ABI,
    address: token,
    functionName: "decimals",
    args: [],
  });
  const decimals = (decimalsRes || 0) as number;

  return (
    <div style={{ position: "relative" }}>
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
        <div style={{ fontWeight: 'bold' }}>
          {formatUnits(userStakedWei, decimals)} ${symbol}
        </div>
        <div
          style={{ fontSize: '.75em', cursor: 'pointer' }}
          onClick={() => setExpanded(!expanded)}
        >
          <br />
          Restaked in {(appList.length)} token{appList.length != 1 ? 's' : ''}
          {
            appList.length > 0 &&
            <span>&nbsp;&nbsp;
              {
                expanded ? (
                  <i className="fa-solid fa-chevron-down" />
                ) : (
                  <i className="fa-solid fa-chevron-up" />
                )
              }
            </span>
          }
          {
            expanded ? (
              <div>
                {
                  appList.map(app =>
                    <Link style={{ marginTop: '.5em', display: 'block' }} target="_blank" key={`${token}-${app}`} to={`https://basescan.org/address/${app}`}>{app} ↗</Link>
                  )
                }
              </div>
            ) : null
          }
        </div>
      </div>
    </div>
  );
}

export default Stake;
