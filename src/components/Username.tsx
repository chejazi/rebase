import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { address2FC } from 'utils/data';
import { prettyPrintAddress } from 'utils/formatting';

function Username({ address, link, both }: { address: string, link?: boolean, both?: boolean }) {
  const [username, setUsername] = useState<string|null>('');

  useEffect(() => {
    if (address && address != '0x0000000000000000000000000000000000000000') {
      address2FC(address).then(u => {
        setUsername(u);
      });
    }
  }, [address]);

  let handleElt = null;
  if (username) {
    handleElt = (
      <span>
        {username}
        <span onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.open(`https://warpcast.com/${username}`);
        }}>
          <img src="/fc.svg" style={{ height: '1em', marginLeft: '.25em', marginBottom: '-.1em', cursor: 'pointer' }} />
        </span>
      </span>
    );
  }
  let addressElt = <span>{prettyPrintAddress(address)}</span>;

  if (link) {
    if (handleElt) {
      handleElt = (<Link to={`https://warpcast.com/${username}`} target="_blank" style={{ marginRight: '.5em' }}>{handleElt}</Link>);
    }
    addressElt = (<Link to={`https://basescan.org/address/${address}`} target="_blank">{addressElt}</Link>)
  }
  if (both) {
    return <span>{handleElt}<span className="secondary-text">{addressElt}</span></span>
  }  else {
    return handleElt || addressElt;
  }
}

export default Username;
