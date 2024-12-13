import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address, getAddress } from 'viem';

import Project from './Project';

import { getTokenImage } from 'utils/data';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { launcherABI, launcherAddress } from 'constants/abi-launcher';
import { tokenABI } from 'constants/abi-token';

function Home() {
  const { token } = useParams();
  const [refresh, setRefresh] = useState<boolean>(false);

  const { data: dynamicTokensRes } = useReadContract({
    abi: launcherABI,
    address: launcherAddress as Address,
    functionName: "getTokens",
    args: [],
  });
  const dynamicTokens = (dynamicTokensRes || []) as string[];
  const tokenAddresses = dynamicTokens;

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
            <div>
              CA: <Link to={`https://basescan.org/token/${token}`}>{getAddress(token)}</Link>
            </div>
          </div>
        </div>
        {
          !refresh ? (
            <Project tokenAddress={getAddress(token) as Address} projectSymbol={tokenSymbol} />
          ) : null
        }
      </div>
    );
  }

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Launcher Tokens</h1>
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
        </div>
      </div>
    </div>
  );
}

export default Home;
