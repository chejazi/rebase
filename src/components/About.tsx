import { Link } from 'react-router-dom';
import { refiAddress } from 'constants/abi-refi';

function About() {
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: 'center' }}>
          <h1>About</h1>
        </div>
        <br />
            <p>Rebase powers LP incentive programs for tokens on Base.</p>
            <p>The Rebase smart contracts have been <Link className="text-link" target="_blank" to="https://drive.google.com/file/d/1cl8lfKiuIit7Pjn6MJuYtBOYmaDXctds/view">audited</Link> by Hashlock to ensure staked funds are always safe.</p>
          <br />
          <h2 style={{ textAlign: 'center' }}>What is $REFI ?</h2>
            <p><Link className="text-link" to={`https://dexscreener.com/base/${refiAddress}`} target="_blank">$REFI</Link> is the protocol token. It has a supply of 2 billion tokens.</p>
            <p>Whenever an LP incentive campaign is created on Rebase, 5% of the campaign is distributed to <Link className="text-link" to={`/refi`}>$REFI stakers</Link>.</p>
          <br />
          <h2 style={{ textAlign: 'center' }}>Why did I get reTokens instead?</h2>
            <p>Whenever you stake tokens using the Rebase protocol, you receive reTokens. Stake 10 $DEGEN, receive 10 $reDEGEN. You <b>must</b> have these tokens in your wallet to unstake. We rely on reTokens to enable future use cases such as liquid staking.</p>
      </div>
    </div>
  );
}

export default About;
