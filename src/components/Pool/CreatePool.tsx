import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from "wagmi/chains";
import { Address } from 'viem';

import { getWethAddress } from 'utils/data';
import { erc20ABI } from 'constants/abi-erc20';
import { poolFunderAddress, poolFunderABI } from 'constants/abi-pool-funder';

function CreatePool() {
  const navigate = useNavigate();
  const account = useAccount();
  const userAddress = account.address;

  const [token, setToken] = useState<string>('');
  const [duration, setDuration] = useState('');
  const [posting, setPosting] = useState(false);
  const [lastManaged, setLastManaged] = useState(-1);
  const [cacheBust, setCacheBust] = useState(1);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const tokenAddress = token as Address;

  useEffect(() => {
    if (writeError) {
      setPosting(false);
      // @ts-ignore: TS2339
      setTimeout(() => window.alert(writeError.shortMessage), 1);
    } else if (isConfirmed) {
      setPosting(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);

  // User's Token Balance / Allowance
  const { isError: invalidToken, isLoading: checkingToken } = useReadContract({
    abi: erc20ABI,
    address: tokenAddress,
    functionName: "allowance",
    args: [userAddress, poolFunderAddress],
    scopeKey: `postmanager-${cacheBust}`
  });

  // Token Metadata
  const { data: symbolRes } = useReadContract({
    abi: erc20ABI,
    address: tokenAddress,
    functionName: "symbol",
    args: [],
  });
  const symbol = (symbolRes || '') as string;

  const { data: managedRes } = useReadContract({
    abi: poolFunderABI,
    address: poolFunderAddress,
    functionName: "getManaged",
    args: [userAddress],
    scopeKey: `postmanager-${cacheBust}`
  });
  const managed = managedRes ? (managedRes as bigint[]).map(r => Number(r)) : null;

  useEffect(() => {
    if (managed) {
      const poolId = managed.sort((a, b) => a < b ? 1 : -1)[0];
      if (lastManaged < 0) {
        setLastManaged(poolId);
      } else if (lastManaged != poolId) {
        navigate(`/crowdpool/${poolId}`);
      }
    }
  }, [managed, lastManaged])

  let seconds: number = duration.length > 0 ? Number(duration) : 30;
  seconds *= 86400;

  const post = () => {
    if (seconds < (30 * 86400)) {
      window.alert('Minimum 30 day duration');
      return;
    }
    setPosting(true);
    console.log([token, getWethAddress(), seconds, 1]);
    writeContract({
      abi: poolFunderABI,
      address: poolFunderAddress,
      functionName: "create",
      args: [token, getWethAddress(), seconds, 1],
      chainId: base.id,
    });
  };

  const pending = posting;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Create Pool</h1>
      </div>
      <div className="ui-island" style={{ padding: '1em' }}>
        <h2 style={{ marginTop: '0' }}>Token</h2>
        <input
          className="flex-grow text-input"
          type="text"
          name="address"
          autoComplete="off"
          placeholder="contract address"
          style={{ width: "100%", textAlign: 'left' }}
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
          }}
        />
        <p style={{ fontSize: '.75em' }}>Specify the token you want to provide LP incentives for.</p>
        {
          symbol &&
          <div style={{ fontWeight: 'bold' }}>${symbol} <i className="fas fa-circle-check" style={{ color: 'green'}} /></div>
        }
        {
          checkingToken && token != '' &&
          <div style={{ fontStyle: 'italic' }}>Checking token...</div>
        }
        {
          invalidToken && token != '' &&
          <div style={{ fontWeight: 'bold' }}>Invalid token address <i className="fas fa-circle-x" style={{ color: 'red'}} /></div>
        }
        <h2>Duration</h2>
        <div className="flex" style={{ alignItems: 'center' }}>
          <input
            className="flex-shrink text-input"
            type="text"
            name="duration"
            autoComplete="off"
            placeholder="30"
            style={{ width: "4em", textAlign: 'right' }}
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value.replace(/[^0-9.]/g, ''));
            }}
          />
          <div className="flex-shrink" style={{ marginLeft: '1em' }}>
            days
          </div>
          <div className="flex-grow" />
        </div>
        <p style={{ fontSize: '.75em' }}>Specify the duration of the incentives. Pools are paid out evenly over this time.</p>
        <br />
        <div className="flex">
          <button
            type="button"
            className="buy-button flex-grow"
            onClick={post}
            disabled={pending || invalidToken || checkingToken}
          >
            {posting ? 'creating' : 'create'}
            {
              posting ? (
                <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
              ) : null
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePool;
