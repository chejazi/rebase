import { Link } from 'react-router-dom';

import Dog from './Dog';

function Launch() {
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1>Launch</h1>
        <p>Launching a token on Rebase is in closed beta.</p>
        <p>To launch before Rebase goes permissionless, DM <Link to="https://warpcast.com/kompreni">@kompreni</Link>.</p>
        <p>You can also post thoughts or questions in the <Link to="https://warpcast.com/~/channel/rebase">Rebase channel</Link> on Warpcast.</p>
        <Dog />
      </div>
    </div>
  );
}

export default Launch;
