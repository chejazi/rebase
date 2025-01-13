import { ConnectKitButton } from 'connectkit';
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
        <h1 style={{ textAlign: "center" }}>Staked Assets</h1>
        {
          !userAddress &&
          <div style={{ textAlign: 'center' }}>
            <div className="ui-island" style={{ display: 'inline-block' }}>
              <ConnectKitButton />
            </div>
          </div>
        }
        <br />
        {userApps.map(a => <WalletApp key={`app-${a}`} app={a} />)}
        {userApps.length == 0 ? (
          <div style={{ textAlign: 'center' }}>Alas, nothing staked!</div>
        ) : null}
      </div>
    </div>
  );
}

export default Wallet;
