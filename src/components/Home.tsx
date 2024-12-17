import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address, getAddress } from 'viem';

import Project from './Project';
import ProjectREFI from './ProjectREFI';

import { getTokenImage } from 'utils/data';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
// import { launcherABI, launcherAddress } from 'constants/abi-launcher';
import { tokenABI } from 'constants/abi-token';

const hardcodedTokens = [
  '0x1215163D2c569433b9104cC92c5dB231e7FB62A1', // $LAUNCHER
  '0x0Db510e79909666d6dEc7f5e49370838c16D950f', // $ANON
  '0x3C281A39944a2319aA653D81Cfd93Ca10983D234', // $BUILD
  '0xd21111c0e32df451eb61A23478B438e3d71064CB', // $JOBS
  '0x01929f1ae2dc8cac021e67987500389ae3536ced', // $PROXY
  '0x1d35741c51fb615ca70e28d3321f6f01e8d8a12d', // $RaTcHeT
  '0x7dbdBF103Bb03c6bdc584c0699AA1800566f0F84', // $REFI
  '0x1E6bA8BC42Bbd8C68Ca7E891bAc191F0e07B1d6F', // $VROOM
];

function Home() {
  const { token } = useParams();
  const [refresh, setRefresh] = useState<boolean>(false);

  // const { data: dynamicTokensRes } = useReadContract({
  //   abi: launcherABI,
  //   address: launcherAddress as Address,
  //   functionName: "getTokens",
  //   args: [],
  // });
  // const dynamicTokens = (dynamicTokensRes || []) as string[];
  // const tokenAddresses = dynamicTokens.concat(hardcodedTokens)//.concat(dynamicTokens);
  const tokenAddresses = hardcodedTokens;

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [tokenAddresses],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], [], [], []]) as [string[], string[], bigint[], bigint[], string[]];
  // const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  // const decimals = tokenMetadata[2].map(n => Number(n));
  const images = tokenMetadata[4];

  const { data: tokenSymbolRes } = useReadContract({
    abi: tokenABI,
    address: token as Address,
    functionName: "symbol",
    args: [],
  });
  const tokenSymbol = (tokenSymbolRes || '') as string;

  const { data: tokenImageRes } = useReadContract({
    abi: tokenABI,
    address: token as Address,
    functionName: "image",
    args: [],
  });
  const tokenImage = (tokenImageRes || '') as string;

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [token, refresh]);

  if (token) {
    return (
      <div>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div>
              <Link
                to={`/${token}`}
                className={'token-box selected'}
              >
                <img className="token-logo" src={tokenImage || getTokenImage(token)} />
                <div className="token-name">${tokenSymbol}</div>
              </Link>
            </div>
            <div style={{ fontSize: '.75em' }}>
              CA: <Link to={`https://basescan.org/token/${token}`}>{getAddress(token)}</Link>
            </div>
          </div>
        </div>
        {
          tokenSymbol == 'REFI' ? (
            <ProjectREFI name={tokenSymbol} />
          ) : (
            <div>
              {
                !refresh ? (
                  <Project tokenAddress={getAddress(token) as Address} projectSymbol={tokenSymbol} />
                ) : null
              }
            </div>
          )
        }
      </div>
    );
  }

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Rebase</h1>
          <p>Rebase is a protocol for distributing tokens to stakers. Stake eligible assets to earn the tokens below. <Link to="/about">Learn more</Link></p>
        </div>
        <br />
        <div style={{ textAlign: 'center' }}>
          {
            tokenAddresses.map((t, i) => {
              const image = images[i] || getTokenImage(t);
              return (
                <Link
                  to={`/${t}`}
                  className='token-box'
                  onClick={() => setRefresh(true)}
                >
                  <img className="token-logo" src={image} />
                  <div className="token-name">${symbols[i]}</div>
                </Link>
              );
            })
          }
          <Link to="/launcher" className="token-box no-shadow" style={{ textDecoration: 'none' }}>
            <div className="token-logo" style={{ textAlign: "center", margin: '0 auto' }}>
              <i className="fal fa-list" />
            </div>
            <div className="token-name">Launchers</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
