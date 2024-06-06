import { Link } from "react-router-dom";
import { rebaseAddress } from "./rebase-abi";

function About() {
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1>About</h1>
        <p>Rebase is a new protocol for launching tokens. You start by selecting which token comunities, e.g. $BUILD, to launch your token to. Holders of those tokens can then stake to earn your token.</p>
        <p>This site is a frontend to the <Link to={`https://basescan.org/address/${rebaseAddress}`} target="_blank">Rebase contract</Link>. The contract lets you stake funds once, then restake those funds across different tokens.</p>
        <p>There are no fees for staking / restaking / unstaking using Rebase.</p>
        <h2>$REBASE</h2>
        <p><Link to={`https://basescan.org/token/${rebaseAddress}`} target="_blank">$REBASE</Link> is the protocol token. It is the first token launched using the Rebase protocol. It has a supply of 1,000,000,000 (1B) which is distributed over five weeks to anyone who stakes one of five coins:</p>
        <ul>
          <li><b>20%</b> - $AERO</li>
          <li><b>20%</b> - $BUILD</li>
          <li><b>20%</b> - $DEGEN</li>
          <li><b>20%</b> - $ETH</li>
          <li><b>20%</b> - $HIGHER</li>
        </ul>
        <p>When new tokens are launched on Rebase, a % of their supply is reserved for Rebase holders that stake $REBASE on those tokens.</p>
        <h2>reTokens</h2>
        <p>Whenever you stake tokens on Rebase, you receive an equal amount of reTokens. Stake 10 $DEGEN, receive 10 $reDEGEN. This enables use cases like liquid staking to arise in the future. Only the wallet that staked reTokens can unstake them. You can unstake at any time.</p>
      </div>
    </div>
  );
}

export default About;
