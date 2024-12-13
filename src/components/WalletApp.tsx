import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import { Link } from 'react-router-dom';
import { rebaseABI, rebaseAddress } from 'constants/abi-rebase-v1';
import { tokenABI } from 'constants/abi-token';
import { appABI } from 'constants/abi-staking-app';
import WalletAppToken from './WalletAppToken';

const missingRewardTokens: { [key: string]: string } = {
  '0x9Db748Ef3d6c6d7DA2475c48d6d09a7D75251F81': '0xd21111c0e32df451eb61A23478B438e3d71064CB'
};

function WalletApp({ app }: { app: string }) {
  const account = useAccount();
  const userAddress = account.address;

  const { data: rewardTokenRes } = useReadContract({
    abi: appABI,
    address: app as Address,
    functionName: "getRewardToken",
    args: [],
  });
  const rewardToken = rewardTokenRes || missingRewardTokens[app];

  const { data: userAppStakesRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
    functionName: "getUserAppStakes",
    args: [userAddress, app],
  });
  const userAppStakes = (userAppStakesRes || [[],[]]) as [string[], bigint[]];
  const tokens = userAppStakes[0];
  const stakes = userAppStakes[1];

  const { data: tokenSymbolRes } = useReadContract({
    abi: tokenABI,
    address: rewardToken as Address,
    functionName: "symbol",
    args: [],
  });
  const tokenSymbol = (tokenSymbolRes || '') as string;

  if (!tokenSymbol) {
    return null;
  }
  return (
    <div style={{ position: "relative", padding: "0 .5em .5em .5em" }}>
      <Link
        to={`/${rewardToken}`}
        className="ui-island"
        style={{
          display: 'block',
          cursor: "pointer",
          marginBottom: "1em",
          padding: "1em",
          textDecoration: "none",
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Earning ${tokenSymbol}</div>
        <p>
          {tokens.map((t, i) => (
            <WalletAppToken token={t} stake={stakes[i]} />
          ))}
        </p>
      </Link>
    </div>
  );
}

export default WalletApp;
