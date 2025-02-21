import { Link } from 'react-router-dom';
import { refiAddress } from 'constants/abi-refi';

function About() {
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto", wordBreak: 'break-word' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>About</h1>
        </div>
        <br />
        <p>Rebase is a permissionless protocol for launching LP Staking Incentive Campaigns for tokens on Base.</p>
        <p>The Rebase smart contracts have been audited by Hashlock to ensure staked assets are always safe. The audit report can be found <Link className="text-link" target="_blank" to="https://drive.google.com/file/d/1cl8lfKiuIit7Pjn6MJuYtBOYmaDXctds/view">here</Link>.</p>
        <br />
        <h2><i className="fa-light fa-house" /> LP Staking Incentive Campaigns</h2>
        <p>Tokenized projects looking to increase the pool of liquidity surrounding their project token may want to launch an LP Staking Incentive Campaign on Rebase to incentivize additional liquidity providers seeking to maximize their yield using native token awards.</p>
        <p>Every live LP Staking Incentive Campaign on Rebase contains two immutable fields: 1) an end date that the Campaign will expire on and 2) a specific amount of native token rewards to be streamed to users who stake eligible LP position NFTs to the campaign.</p>
        <h2>
          <div className="icon-container" style={{ display: 'inline-block', marginRight: '.25em', verticalAlign: 'middle' }}>
            <img src="/logo-stencil.png" className="daymode" alt="logo" style={{ width: "1em" }} />
            <img src="/logo-stencil-white.png" className="nightmode" alt="logo" style={{ width: "1em" }} />
          </div>
          $REFI
        </h2>
        <p>$REFI is the Rebase protocol token. The contract address (CA) for $REFI is <Link style={{ textDecoration: 'underline' }} to={`https://dexscreener.com/base/${refiAddress}`} target="_blank">{refiAddress}</Link>. There are a total of 2 billion $REFI tokens.</p>
        <h3>Global $REFI Staking Rewards</h3>
        <p>Whenever a new LP Staking Incentive Campaign is launched on Rebase, 5% of the new campaign reward tokens are pro-rata distributed to users who have their $REFI staked in the <Link className="text-link" to="/refi">Global $REFI Staking Pool</Link> based on their percentage share of $REFI staked to the global staking pool.</p>
        <p>Here’s an illustrative example to help clarify how $REFI Staking Rewards:</p>
        <p style={{ fontStyle: 'italic' }}>Johnny has staked 20M $REFI and there is 100M $REFI currently staked. Someone deploys a $DEGEN LP Staking Incentive Campaign offering 1M $DEGEN as LP incentives. 50K $DEGEN (5%) of that is distributed to $REFI stakers. Therefore, Johnny will be able to claim 10k $DEGEN since he accounted for 20% of the total staked $REFI at the time of Campaign deployment.</p>
        <h3>reTokens</h3>
        <p>Whenever you stake tokens using the Rebase protocol, you receive reTokens. Stake 10 $REFI, receive 10 $reREFI. You must have these tokens in your wallet to unstake. We may use reTokens to enable future use cases such as liquid staking.</p>
        <h2><i className="fa-light fa-galaxy" /> Crowdpools</h2>
        <p>Crowdpools are a permissionless way to create, fund, and deploy LP Staking Incentive Campaigns on Rebase. </p>
        <p>A single user can create a new Crowdpool by: 1) inputting the specific contract address of the token they would like to create an LP Staking Incentive Campaign for and 2) setting the duration of the campaign that will begin when the Crowdpool is deployed. </p>
        <p>New Crowdpools can be funded by the creator of the Crowdpool as well as any other users that have a non-zero balance of the token associated with the Crowdpool up until the Crowdpool is deployed onchain. </p>
        <p>To deploy a Crowdpool: 1) a minimum threshold of 0.5% of the total token supply of the token associated with the Crowdpool must be committed to the Crowdpool and 2) the user who created the Crowdpool must sign an onchain transaction confirming the deployment of the Crowdpool.</p>
        <p style={{ fontStyle: 'italic' }}>Note: Tokens committed to a Crowdpool may be removed at any point if the Crowdpool has not been deployed yet and the onchain wallet address initiating the onchain request to remove tokens is the same address that added the tokens to the Crowdpool in the first place. Committing tokens to a Crowdpool does not make the user who committed tokens to the Crowdpool eligible for any subsequent protocol or Campaign rewards. </p>
      </div>
    </div>
  );
}

export default About;
