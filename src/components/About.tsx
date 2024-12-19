import { Link } from 'react-router-dom';
import { refiAddress } from 'constants/abi-refi';

function About() {
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1>About</h1>
        <p>Rebase is a protocol for distributing tokens to stakers of tokens, particularly Uniswap LP tokens. Holders of those tokens can then stake to earn your token.</p>
        <p>There are no fees for staking / restaking / unstaking using Rebase. Staked funds can be unstaked at any time.</p>
        <p>The Rebase smart contracts have been <Link target="_blank" to="https://drive.google.com/file/d/1cl8lfKiuIit7Pjn6MJuYtBOYmaDXctds/view">audited</Link> by Hashlock to ensure staked funds are always safe.</p>
        <h2>$REFI</h2>
        <p><Link to={`https://basescan.org/token/${refiAddress}`} target="_blank">$REFI</Link> is the protocol token, launched <i>using</i> the Rebase protocol. It has a supply of 2,000,000,000 (2B). 75% has been distributed over five weeks to stakers of several popular coins on Base.</p>
        <p>Whenever a new stake pool is launched on Rebase, 1% of the staker rewards are distributed to people that stake $REFI.</p>
        <h2>reTokens</h2>
        <p>Whenever you stake tokens on Rebase, you are sent an equal amount of reTokens. Stake 10 $DEGEN, receive 10 $reDEGEN. You <b>must</b> hold these tokens in your wallet in order to unstake. ReTokens enable use cases like liquid staking to arise in the future.</p>
      </div>
    </div>
  );
}

export default About;
