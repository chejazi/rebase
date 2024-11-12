
import { useSharedDataStore } from '../tour/sharedDataStore';
import { prettyPrint } from 'utils/formatting';
import { formatUnits } from 'viem';

const SharedAprStake = () => {
  const {
    rewardTotal,
    endTime,
    startTime,
    totalStakedWei,
    userStakedWei,
    rewardSymbol,
    stakeSymbol,
    decimals, 
  } = useSharedDataStore();

  // Calculate progress
  const progress = Math.min((Date.now() / 1000 - startTime) / (endTime - startTime), 1) * 100;

  // Calculate remaining reward
  const remainingReward = parseFloat(formatUnits(rewardTotal, decimals)) * (1 - progress / 100);

  // Calculate Your Share (percentage of total staked)
  const YourShare = (parseFloat(formatUnits(userStakedWei, decimals)) / parseFloat(formatUnits(totalStakedWei, decimals)));

  // Calculate Your Share of the Remaining Reward Pool
  const YourReward = remainingReward * YourShare 

  // Calculate the Annual Percentage Rate (APR)
  const Apr = (YourReward / parseFloat(formatUnits(userStakedWei, decimals)) ) * 100 || 0

  return (
    <div style={{ margin: '1em 0' }}>
      <div style={{ fontSize: '.8em' }}>
        <div>
          {prettyPrint(formatUnits(rewardTotal, decimals), 0)} ${rewardSymbol} Reward (progress: {progress.toFixed(0)}%)
        </div>
        <div>Receive up to {Apr.toFixed(2)}% in return </div>
      </div>


      
    </div>
  );
};

export default SharedAprStake;
