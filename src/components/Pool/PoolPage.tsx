import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { base } from "wagmi/chains";
import { Address, formatUnits, parseUnits } from 'viem';
import { poolFunderAddress, poolFunderABI } from 'constants/abi-pool-funder';
import { batchReadABI, batchReadAddress } from 'constants/abi-batch-read';
import { erc20ABI } from 'constants/abi-erc20';
import { getNullAddress, getTokenImage } from 'utils/data';
import { getDurationDays, prettyPrint } from 'utils/formatting';
import UserIdentity from '../UserIdentity';
import Username from '../Username';

function PoolPage() {
  const account = useAccount();
  const userAddress = account.address;
  const { poolId } = useParams();

  const [showFund, setShowFund] = useState(false);

  const [inputQuantity, setInputQuantity] = useState('');
  const [funding, setFunding] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [approving, setApproving] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setApproving(false);
      setFunding(false);
      setRefunding(false);
      setDeploying(false);
      setCancelling(false);
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      if (funding) {
        setInputQuantity('');
      }
      setApproving(false);
      setFunding(false);
      setRefunding(false);
      setDeploying(false);
      setCancelling(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);

  const { data: baseTokenRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getBaseToken",
    args: [poolId],
  });
  const baseToken = (baseTokenRes || getNullAddress()) as string;

  const { data: quoteTokenRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getQuoteToken",
    args: [poolId],
  });
  const quoteToken = (quoteTokenRes || getNullAddress()) as string;

  const { data: tokenMetadataRes } = useReadContract({
    abi: batchReadABI,
    address: batchReadAddress as Address,
    functionName: "getTokenMetadata",
    args: [[baseToken, quoteToken]],
  });
  const tokenMetadata = (tokenMetadataRes || [[''], [''], [0n], [1n], ['']]) as [string[], string[], bigint[], bigint[], string[]];
  // const name = tokenMetadata[0][0];
  const symbol = tokenMetadata[1][0];
  const qSymbol = tokenMetadata[1][1];
  const decimals = Number(tokenMetadata[2][0]);
  const supply = tokenMetadata[3][0];
  const image = tokenMetadata[4][0];

  // User's Token Balance / Allowance
  const { data: balanceOfRes } = useReadContract({
    abi: erc20ABI,
    address: baseToken as Address,
    functionName: "balanceOf",
    args: [userAddress],
    scopeKey: `pool-${cacheBust}`,
  });
  const userWalletWei = (balanceOfRes || 0n) as bigint;

  const { data: allowanceRes } = useReadContract({
    abi: erc20ABI,
    address: baseToken as Address,
    functionName: "allowance",
    args: [userAddress, poolFunderAddress],
    scopeKey: `pool-${cacheBust}`,
  });
  const allowance = (allowanceRes || 0n) as bigint;

  const { data: managerRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress as Address,
    functionName: "getManager",
    args: [poolId],
  });
  const manager = (managerRes || getNullAddress()) as string;

  const { data: statusRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress as Address,
    functionName: "getStatus",
    args: [poolId],
    scopeKey: `pool-${cacheBust}`,
  });
  const status = Number((statusRes || 0n) as bigint);

  const { data: fundersRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getFunderQuantities",
    args: [poolId],
    scopeKey: `pool-${cacheBust}`,
  });
  const [funderAddresses, funderQuantities] = (fundersRes || [[],[]]) as [string[],bigint[]];

  const { data: quantityRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getQuantity",
    args: [poolId],
    scopeKey: `pool-${cacheBust}`,

  });
  const quantity = (quantityRes || 0n) as bigint;

  const { data: durationRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getDuration",
    args: [poolId],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const duration = Number((durationRes || 0n) as bigint);

  const percentOfSupply = Number(10000n * quantity / supply) / 100;

  // const userStakedUnits = formatUnits(userStakedWei, decimals);
  const userWalletUnits = formatUnits(userWalletWei, decimals);

  const wei = parseUnits((inputQuantity || '0').toString(), decimals);
  const input = parseFloat(inputQuantity || '0');
  const hasAllowance = allowance >= wei;
  const pending = funding || refunding;
  const fund = () => {
    setFunding(true);
    writeContract({
      abi: poolFunderABI,
      address: poolFunderAddress as Address,
      functionName: "fund",
      args: [poolId, wei],
      chainId: base.id,
    });
  };

  const approve = () => {
    setApproving(true);
    writeContract({
      abi: erc20ABI,
      address: baseToken as Address,
      functionName: "approve",
      args: [poolFunderAddress, wei],
      chainId: base.id,
    });
  };

  const refund = () => {
    setRefunding(true);
    writeContract({
      abi: poolFunderABI,
      address: poolFunderAddress as Address,
      functionName: "refund",
      args: [poolId],
      chainId: base.id,
    });
  };

  const cancel = () => {
    setCancelling(true);
    writeContract({
      abi: poolFunderABI,
      address: poolFunderAddress as Address,
      functionName: "cancel",
      args: [poolId],
      chainId: base.id,
    });
  };

  const deploy = () => {
    setDeploying(true);
    writeContract({
      abi: poolFunderABI,
      address: poolFunderAddress as Address,
      functionName: "deploy",
      args: [poolId],
      chainId: base.id,
    });
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ padding: '0 .5em' }}>
        <div
          className="ui-island"
          style={{
            marginTop: '1em',
            padding: '1em',
          }}
        >
          <div className="flex" style={{ alignItems: 'center' }}>
            <img
              style={{ width: '50px', height: '50px', borderRadius: '500px', marginRight: '1em' }}
              src={image || getTokenImage(baseToken)}
            />
            <div className="flex-grow" style={{ fontWeight: 'bold' }}>
              <div>{prettyPrint(formatUnits(quantity, decimals), 0)} ${symbol} over {getDurationDays(duration)}</div>
              <div style={{ fontSize: '.75em' }}>({percentOfSupply.toFixed(2)}% of supply)</div>
            </div>
            <div className={`crowdfund-status-indicator crowdfund-status-${status}`} />
          </div>
          <br />
          <div style={{ fontSize: '.75em' }}>
            <div>${symbol}: <Link to={`https://dexscreener.com/base/${baseToken}`} target="_blank">{baseToken}</Link></div>
            <div>Pooled funds pay ${symbol}/${qSymbol} LPs</div>
            <div>Once deployed, LPs earn by staking <Link to={`/${baseToken}`}>here</Link></div>
          </div>
          <div style={{ fontWeight: 'bold', margin: '1em 0' }}>Pool by <Username address={manager} /></div>
          {
            manager == userAddress ? (
              <div>
                {
                  status == 1 &&
                  <div>
                    <button className="buy-button" onClick={deploy}>
                      {deploying ? 'deploying' : 'deploy'}
                      {
                        deploying ? (
                          <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                        ) : null
                      }
                    </button>
                    &nbsp;&nbsp;
                    <button className="secondary-button" onClick={cancel}>
                      {cancelling ? 'cancelling' : 'cancel'}
                      {
                        cancelling ? (
                          <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                        ) : null
                      }
                    </button>
                    {

                    <div style={{ fontSize: '.75em', marginTop: '.5em' }}>Only you can deploy/cancel the pool</div>
                    }
                  </div>
                }
              </div>
            ) : (
              <div style={{ fontSize: '.75em' }}>Only the creator can deploy the pool</div>
            )
          }
        </div>
        <div
          className="ui-island"
          style={{
            marginTop: '1em',
            padding: '1em',
          }}
        >
          <div className="flex" style={{ marginBottom: '1em', alignItems: 'center' }}>
            <div className="flex-grow">
              <div style={{ fontWeight: 'bold' }}>Funders</div>
            </div>
            <div className="flex-shrink" style={{ visibility: showFund || status != 1 ? 'hidden' : 'visible' }}>
              <button className="buy-button" onClick={() => setShowFund(true)}>Fund</button>
            </div>
          </div>
          {
            showFund &&
            <div style={{ marginBottom: '1em' }}>
              <div className="flex" style={{ alignItems: 'center' }}>
                <input
                  className="flex-grow buy-input"
                  type="text"
                  name="quantity"
                  autoComplete="off"
                  placeholder="quantity"
                  style={{ width: "100%", textAlign: 'right' }}
                  value={inputQuantity}
                  onChange={(e) => {
                    setInputQuantity(e.target.value.replace(/[^0-9.]/g, ''));
                  }}
                />
                <div className="flex-shrink" style={{ marginLeft: '.5em'}}>${symbol}</div>
              </div>
              <div className="flex" style={{ alignItems: "end", marginTop: '.5em' }}>
                {
                  hasAllowance ? (
                    <button
                      type="button"
                      className="buy-button flex-grow"
                      onClick={fund}
                      disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                    >
                      {funding ? 'funding' : 'fund'}
                      {
                        funding ? (
                          <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                        ) : null
                      }
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="buy-button flex-grow"
                      onClick={approve}
                      disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                    >
                      {approving ? (
                        <span>approving<i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i></span>
                      ) : (
                        <span>
                          {
                            input > 0 && parseFloat(userWalletUnits) < input ? 'insufficient balance' : 'approve and fund'
                          }
                        </span>
                      )}
                    </button>
                  )
                }
              </div>
            </div>
          }
          {
            funderAddresses.map((a, i) => (
              <div key={`funder-${a}`} style={{ marginBottom: '.5em' }}>
                <UserIdentity address={a}>
                  <div className="flex" style={{ alignItems: 'center' }}>
                    <span style={{ fontSize: '.75em' }}>{prettyPrint(formatUnits(funderQuantities[i], decimals), 0)} ${symbol}</span>
                    {
                      (status == 1 || status == 3) && (funderQuantities[i] > 0n) && a == userAddress &&
                      <span style={{ fontSize: '.5em', marginLeft: '.5em' }}>
                        <button className="secondary-button" onClick={refund}>
                          {refunding ? (
                            <span>cancelling<i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i></span>
                          ) : 'cancel'}
                        </button>
                      </span>
                    }
                  </div>
                </UserIdentity>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default PoolPage;
