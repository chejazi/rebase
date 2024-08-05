import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address } from 'viem';

import Project from './Project';
import ProjectREFI from './ProjectREFI';

import { getTokenImage } from 'utils/data';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read-v1';

const tokenAddresses = [
  '0x7dbdBF103Bb03c6bdc584c0699AA1800566f0F84', // $REFI
  '0xd21111c0e32df451eb61A23478B438e3d71064CB', // $JOBS
];

function Home() {
  const [tokenSymbol, setTokenSymbol] = useState<string|null>(null);
  const [tokenAddress, setTokenAddress] = useState<string|null>(null);

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [tokenAddresses],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], []]) as [string[], string[], bigint[]];
  // const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  // const decimals = tokenMetadata[2].map(n => Number(n));

  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Rebase</h1>
          <p>Rebase is a protocol for launching tokens to holders of other tokens. Stake eligible assets to earn the tokens below. <Link to="/about">Learn more</Link></p>
        </div>
        <br />
        <div style={{ textAlign: 'center' }}>
          {
            tokenAddresses.map((t, i) => (
              <div
                className={`token-box ${symbols[i] == tokenSymbol ? 'selected' : ''}`}
                onClick={() => {
                  setTokenAddress(t);
                  setTokenSymbol(symbols[i]);
                }}
              >
                <img className="token-logo" src={getTokenImage(t)} />
                <div className="token-name">${symbols[i]}</div>
              </div>
            ))
          }
          <Link to="/launch" className="token-box no-shadow" style={{ textDecoration: 'none' }}>
            <div className="token-logo">
              <i className="far fa-plus" />
            </div>
            <div className="token-name">Launch</div>
          </Link>
        </div>
        <br />
        {
          tokenSymbol ? (
            <div>
              {
                tokenSymbol == 'REFI' ? (
                  <ProjectREFI name={tokenSymbol} />
                ) : (
                  <Project tokenAddress={tokenAddress as Address} projectSymbol={tokenSymbol} />
                )
              }
            </div>
          ) : null
        }
      </div>
    </div>
  );
}

export default Home;
