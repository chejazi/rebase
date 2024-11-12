import { ConnectKitButton } from 'connectkit';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Launch from './Launch';

function App() {
  const location = useLocation();

  const isLaunch = location.pathname == '/launch';
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
        <Link
          style={{ fontSize: "1.5em", textDecoration: "none" }}
          to={`/launch`}
        >
          {
            isLaunch ? (
              <i className="fa-sharp fa-solid fa-square-plus"></i>
            ) : (
              <i className="fa-sharp fa-light fa-square-plus"></i>
            )
          }
        </Link>
        <span />
        <Link style={{ fontSize: "1.5em", textDecoration: "none" }} to="/about">
          {
            isInfo ? (
              <i className="fa-solid fa-circle-info"></i>
            ) : (
              <i className="fa-light fa-circle-info"></i>
            )
          }
        </Link>
        <span />
      </div>
      <div style={{ position: "fixed", right: ".5em", zIndex: 5 }}>
        <ConnectKitButton />
      </div>
      <br />
      <br />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/launch" element={<Launch />} />
        <Route path="/" element={<Home />} />
      </Routes>
      <br />
      <br />
      <br />
    </div>
  );
}

export default App;
