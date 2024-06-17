import { Link } from "react-router-dom";
import { rebaseAddress } from "./rebase-abi";
import { refiAddress } from "./refi";

function About() {
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1>About</h1>
        <p>Rebase is a new protocol for launching tokens. You start by selecting which token comunities, e.g. $BUILD, to launch your token to. Holders of those tokens can then stake to earn your token.</p>
        <p>This site is a frontend to the <Link to={`https://basescan.org/address/${rebaseAddress}`} target="_blank">Rebase contract</Link>. The contract lets you stake funds once, then restake those funds across different tokens.</p>
        <p>There are no fees for staking / restaking / unstaking using Rebase. Staked funds can be unstaked at any time.</p>
        <h2>$REFI</h2>
        <p><Link to={`https://basescan.org/token/${refiAddress}`} target="_blank">$REFI</Link> is the protocol token, launched <i>using</i> the Rebase protocol. It has a supply of 2,000,000,000 (2B). 75% is distributed over five weeks to anyone who stakes the following:</p>
        <b>May 30 thru July 4:</b>
        <ul>
          <li><b>10%</b> - $AERO</li>
          <li><b>10%</b> - $BUILD</li>
          <li><b>10%</b> - $DEGEN</li>
          <li><b>10%</b> - $ETH</li>
          <li><b>10%</b> - $HIGHER</li>
        </ul>
        <b>June 10 thru July 15:</b>
        <ul>
          <li><b>25%</b> - $vAMM-WETH/REFI (on <Link to={'https://aerodrome.finance/deposit?token0=eth&token1=0x7dbdbf103bb03c6bdc584c0699aa1800566f0f84&type=-1'} target="_blank">Aerodrome</Link>)</li>
        </ul>
        <p>When new tokens are launched on Rebase, a % of their supply is reserved for holders that stake $REFI.</p>
        <h2>reTokens</h2>
        <p>Whenever you stake tokens on Rebase, you are sent an equal amount of reTokens. Stake 10 $DEGEN, receive 10 $reDEGEN. You <b>must</b> hold these tokens in your wallet in order to unstake. ReTokens enable use cases like liquid staking to arise in the future.</p>
      </div>
    </div>
  );
}

export default About;
