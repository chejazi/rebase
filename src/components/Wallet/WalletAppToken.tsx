import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { prettyPrint } from 'utils/formatting';
import { getTokenImageNoFallback, getLPTokenImage } from 'utils/data';
import { tokenABI } from 'constants/abi-token';
import { lpWrapperABI, lpWrapperAddress } from 'constants/abi-lp-wrapper-v1';

function Wallet({ stakeToken, stake, rewardToken }: { stakeToken: string; stake: bigint, rewardToken: string; }) {
  const { data: tokenSymbolRes } = useReadContract({
    abi: tokenABI,
    address: stakeToken as Address,
    functionName: "symbol",
    args: [],
  });
  const tokenSymbol = (tokenSymbolRes || '') as string;

  const { data: tokenDecimalsRes } = useReadContract({
    abi: tokenABI,
    address: stakeToken as Address,
    functionName: "decimals",
    args: [],
  });
  const tokenDecimals = Number(tokenDecimalsRes || 18n);

  const { data: tokenImageRes } = useReadContract({
    abi: tokenABI,
    address: stakeToken as Address,
    functionName: "image",
    args: [],
  });
  const tokenImage = (tokenImageRes || '') as string;

  const { data: isLPTokenRes } = useReadContract({
    abi: lpWrapperABI,
    address: lpWrapperAddress,
    functionName: "isLPToken",
    args: [stakeToken],
  });
  const isLPToken = (isLPTokenRes || false) as boolean;

  return (
    <Link to={`/${rewardToken}`} className="flex" style={{ padding: '.25em 0', textDecoration: 'none' }}>
      <div
        className="flex-shrink"
        style={{ width: '24px', height: '24px', marginRight: '.5em' }}
      >
        <img
          src={isLPToken ? getLPTokenImage() : (getTokenImageNoFallback(stakeToken) || tokenImage)}
          style={{ width: '24px', height: '24px', borderRadius: '500px' }}
        />
      </div>
      <div className="flex-grow" style={{ fontWeight: 'bold' }}>
        <div>
          {
            isLPToken ? (
              <span>${tokenSymbol} LP</span>
            ) : (
              <span>{prettyPrint(formatUnits(stake, tokenDecimals), 4)} ${tokenSymbol}</span>
            )
          }
          <i className="fa-light fa-arrow-up-right-from-square" style={{ marginLeft: '.5em' }}/>
        </div>
      </div>
    </Link>
  );
}

export default Wallet;
