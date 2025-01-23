import CustomConnectButton from './CustomConnectButton'
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';
import About from './About';
import REFI from './REFI';
import Wallet from './Wallet/Wallet';
import PoolPage from './Pool/PoolPage';
import CreatePool from './Pool/CreatePool';
import BrowsePools from './Pool/BrowsePools';
import Launcher from './Launcher';

function App() {
  const location = useLocation();

  const isCrowdfund = location.pathname.indexOf('/crowdpool') > -1;
  const isRefi = location.pathname == '/refi';
  // const isWallet = location.pathname == '/wallet';
  const isHome = location.pathname == '/';
  const isInfo = location.pathname == '/about';

  return (
    <div style={{ position: "relative" }}>
      <div className="nav">
        <span />
        <Link style={{ fontSize: "1.5em", textDecoration: "none" }} to="/">
        {
          isHome ? (
            <i className="fa-solid fa-house"></i>
          ) : (
            <i className="fa-light fa-house"></i>
          )
        }
        </Link>
        <span />
        <Link style={{ fontSize: "1.5em", textDecoration: "none" }} to="/refi">
        {
          isRefi ? (
            <img src="/logo.svg" style={{ width: '1em' }} />
          ) : (
            [
              <img key="rl-d" src="/logo-stencil.png" className="daymode" style={{ width: '1em' }} />,
              <img key="rl-n" src="/logo-stencil-white.png" className="nightmode" style={{ width: '1em' }} />
            ]
          )
        }
        </Link>
        <span />
        <Link style={{ fontSize: "1.5em", textDecoration: "none" }} to="/crowdpools">
          {
            isCrowdfund ? (
              <i className="fa-solid fa-galaxy"></i>
            ) : (
              <i className="fa-light fa-galaxy"></i>
            )
          }
        </Link>
        <span />
        <Link style={{ fontSize: "1.5em", textDecoration: "none" }} to="/about">
          {
            isInfo ? (
              <i className="fa-solid fa-square-info"></i>
            ) : (
              <i className="fa-light fa-square-info"></i>
            )
          }
        </Link>
        <span />
      </div>
      <div 
        style={{ 
          position: "fixed", 
          right: ".5em", 
          zIndex: 5, 
          display: 'flex', 
          alignItems: 'center', 
          border: '1px solid #ccc', 
          borderRadius: '12px', 
        }}
      >
        <CustomConnectButton />
        <span />
        <Link
          style={{ 
            fontSize: "1.5em", 
            textDecoration: "none", 
            padding: "0 .5em", 
            borderLeft: '1px solid #ccc'
          }}
          to={`/wallet`}
        >
          <i className="fa-solid fa-wallet"></i>
        </Link>
      </div>
      <br />
      <br />
      <Routes>
        <Route path="/crowdpools/token/:address" element={<BrowsePools />} />
        <Route path="/crowdpools" element={<BrowsePools />} />
        <Route path="/crowdpool/:poolId" element={<PoolPage />} />
        <Route path="/crowdpool" element={<CreatePool />} />
        <Route path="/launcher" element={<Launcher />} />
        <Route path="/refi" element={<REFI />} />
        <Route path="/about" element={<About />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/:token?" element={<Home />} />
      </Routes>
      <br />
      <br />
      <br />
    </div>
  );
}

export default App;
