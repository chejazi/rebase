import { useReadContract } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { prettyPrint } from 'utils/formatting';
import { getTokenImage } from 'utils/data';
import { tokenABI } from 'constants/abi-token';

function Wallet({ token, stake }: { token: string; stake: bigint }) {
  const { data: tokenSymbolRes } = useReadContract({
    abi: tokenABI,
    address: token as Address,
    functionName: "symbol",
    args: [],
  });
  const tokenSymbol = (tokenSymbolRes || '') as string;

  const { data: tokenDecimalsRes } = useReadContract({
    abi: tokenABI,
    address: token as Address,
    functionName: "decimals",
    args: [],
  });
  const tokenDecimals = Number(tokenDecimalsRes || 18n);

  const { data: tokenImageRes } = useReadContract({
    abi: tokenABI,
    address: token as Address,
    functionName: "image",
    args: [],
  });
  const tokenImage = (tokenImageRes || '') as string;

  return (
    <div className="flex" style={{ padding: '0em 0 .5em' }}>
      <div
        className="flex-shrink"
        style={{ width: '24px', height: '24px', marginRight: '.5em' }}
      >
        <img
          src={tokenImage || getTokenImage(token)}
          style={{ width: '24px', height: '24px', borderRadius: '500px' }}
        />
      </div>
      <div className="flex-grow">
        <div>
          {prettyPrint(formatUnits(stake, tokenDecimals), 4)} ${tokenSymbol}
        </div>
      </div>
    </div>
  );
}

export default Wallet;
