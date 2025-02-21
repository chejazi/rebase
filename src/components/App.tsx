import WalletControl from './CustomConnectButton'
import GlobalStyles from "./GlobalStyles";
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  const isWallet = location.pathname == '/wallet';
  const isHome = location.pathname == '/';
  const isInfo = location.pathname == '/about';

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    // Add event listener for scrolling
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <GlobalStyles />
      <div style={{ position: "relative" }}>
        <div className={`top-bar ${isScrolled ? 'scrolled' : ''}`}>
          <div className="logo">
            <img src="/logo-rebase-white.png" className="nightmode" alt="logo" />
            <img src="/logo-rebase-black.png" className="daymode" alt="logo" />
          </div>
          <div className="nav-icons">
            <Link className={`nav-icon ${isHome ? 'active' : ''}`} to="/">
              <i className="fa-light fa-house"></i>
              <span>Home</span>
            </Link>
            <Link className={`nav-icon ${isRefi ? 'active' : ''}`} to="/refi">
              <img src="/logo-stencil.png" className="daymode" style={{ width: '1em' }} alt="logo" />
              <img src="/logo-stencil-white.png" className="nightmode" style={{ width: '1em' }} alt="logo" />
              <span>REFI</span>
            </Link>
            <Link className={`nav-icon ${isCrowdfund ? 'active' : ''}`} to="/crowdpools">
              <i className="fa-light fa-galaxy"></i>
              <span>Crowdpools</span>
            </Link>
            <Link className={`nav-icon ${isWallet ? 'active' : ''}`} to="/wallet">
              <i className="fa-light fa-wallet"></i>
              <span>Wallet</span>
            </Link>
            <Link className={`nav-icon ${isInfo ? 'active' : ''}`} to="/about">
              <i className="fa-light fa-square-info"></i>
              <span>About</span>
            </Link>
          </div>
          <div className="wallet-connect">
            <WalletControl />
          </div>
        </div>
        <div className="nav">
          <Link className={`nav-icon-mobile ${isHome ? 'active' : ''}`} to="/">
            <div className="icon-container">
              <i className="fa-light fa-house"></i>
            </div>
          </Link>
          <Link className={`nav-icon-mobile ${isRefi ? 'active' : ''}`} to="/refi">
            <div className="icon-container">
              <img src="/logo-stencil.png" className="daymode" style={{ width: '1em' }} alt="logo" />
              <img src="/logo-stencil-white.png" className="nightmode" style={{ width: '1em' }} alt="logo" />
            </div>          
          </Link>
          <Link className={`nav-icon-mobile ${isCrowdfund ? 'active' : ''}`} to="/crowdpools">
            <div className="icon-container">
              <i className="fa-light fa-galaxy"></i>
            </div>
          </Link>
          <Link className={`nav-icon-mobile ${isWallet ? 'active' : ''}`} to="/wallet">
            <div className="icon-container">
              <i className="fa-light fa-wallet"></i>
            </div>
          </Link>
          <Link className={`nav-icon-mobile ${isInfo ? 'active' : ''}`} to="/about">
            <div className="icon-container">
              <i className="fa-light fa-square-info"></i>
            </div>
          </Link>
        </div>
        <div className="mobile-wallet-connect">
          <WalletControl />
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
    </>
  );
}

export default App;
