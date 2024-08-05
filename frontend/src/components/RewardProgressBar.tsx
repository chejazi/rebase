import { formatUnits } from 'viem';

import { prettyPrint } from 'utils/formatting';

interface RewardProgressBarProps {
  rewardTotal: bigint;
  decimals: number;
  rewardSymbol: string;
  stakeSymbol: string;
  startTime: number;
  endTime: number;
}

function RewardProgressBar({
  rewardTotal,
  decimals,
  rewardSymbol,
  stakeSymbol,
  startTime,
  endTime,
}: RewardProgressBarProps) {
  const now = Math.floor((new Date().getTime()) / 1000);
  const duration = endTime - startTime;
  const progress = Math.min((now - startTime), duration) / duration * 100;

  return (
    <div>
      <br />
      <div style={{ fontSize: '.8em' }}>
        <div>{prettyPrint(formatUnits(rewardTotal, decimals), 0)} ${rewardSymbol} rewarded to ${stakeSymbol} stakers</div>
        <div className="loading-bar">
          <div className="loading-progress" style={{ width: `${progress}%`, minWidth: '1em' }} />
        </div>
        <div>Rewards end {new Date(endTime * 1000).toLocaleString()} ({(progress).toFixed(0)}% complete)</div>
      </div>
    </div>
  );
}

export default RewardProgressBar;
