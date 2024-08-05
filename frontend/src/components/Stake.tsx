import { Link } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, Address } from 'viem';

import { prettyPrint } from 'utils/formatting';
import { getTokenImage } from 'utils/data';
import { rebaseABI, rebaseAddress } from 'constants/abi-rebase-v0';
import { erc20ABI } from 'constants/abi-erc20';


function Stake({ token }: { token: Address }) {
  const account = useAccount();

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
        className="ui-island"
        style={{
          cursor: "pointer",
          marginBottom: "1em",
          padding: "1em",
          textDecoration: "none",
        }}
      >
        <div className="flex">
          <div className="flex-shrink" style={{ width: '24px', height: '24px', marginRight: '.5em' }}>
            <img src={getTokenImage(token as string)} style={{ width: '24px', height: '24px', borderRadius: '500px' }} />
          </div>
          <div className="flex-grow">
            <div style={{ fontWeight: 'bold' }}>
              {prettyPrint(formatUnits(userStakedWei, decimals), 4)} ${symbol}
            </div>
          </div>
        </div>
        {
          false && (
            <div
              style={{ fontSize: '.75em' }}
            >
              <br />
              Staked in {(appList.length)} token{appList.length != 1 ? 's' : ''}
              <div>
                {
                  appList.map(app =>
                    <Link style={{ marginTop: '.5em', display: 'block' }} target="_blank" key={`${token}-${app}`} to={`https://basescan.org/address/${app}`}>{app} ↗</Link>
                  )
                }
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default Stake;
