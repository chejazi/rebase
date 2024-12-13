import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import { rebaseABI, rebaseAddress } from 'constants/abi-rebase-v1';
import WalletApp from './WalletApp';

function Wallet() {
  const account = useAccount();
  const userAddress = account.address;

  const { data: userAppsRes } = useReadContract({
    abi: rebaseABI,
    address: rebaseAddress as Address,
    functionName: "getUserApps",
    args: [userAddress],
  });
  const userApps = (userAppsRes || []) as string[];

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center" }}>Assets</h1>
        <br />
        {userApps.map(a => <WalletApp app={a} />)}
      </div>
    </div>
  );
}

export default Wallet;
