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
  // stakeSymbol,
  startTime,
  endTime,
}: RewardProgressBarProps) {
  const now = Math.floor((new Date().getTime()) / 1000);
  const duration = endTime - startTime;
  const progress = Math.abs(Math.min((now - startTime), duration) / duration * 100);
  const done = progress == 100;
  return (
    <div>
      <div style={{ fontSize: '.8em' }}>
        <div>{prettyPrint(formatUnits(rewardTotal, decimals), 0)} ${rewardSymbol} to stakers</div>
        <div className="loading-bar">
          <div className="loading-progress" style={{ width: `${progress}%`, minWidth: '1em' }} />
        </div>
        {
          done ? (
            <div>Ended {new Date(endTime * 1000).toLocaleString()}</div>
          ) : (
            <div>Active until {new Date(endTime * 1000).toLocaleString()} ({(progress).toFixed(0)}% complete)</div>
          )
        }
      </div>
    </div>
  );
}

export default RewardProgressBar;
