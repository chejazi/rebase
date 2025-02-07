import { ConnectKitButton } from "connectkit";
import styled from "styled-components";

const ButtonWalletWrapper = styled.div`
  display: flex;
  justify-content: center;
  border: 0px solid var(--color-border-dark);
  border-radius: 8px;
  overflow: hidden; 

  @media {
    margin-right: -5px;
  }

  .connect-button {
    cursor: pointer;
    align-items: center;
    padding: 10px 14px;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background-color: var(--color-surface-dark);
    color: var(--color-text-dark);

    &:hover {
      background:rgb(63, 63, 63);
    }

    @media (prefers-color-scheme: light) {
      color: var(--color-text-light);
      background-color: #e6e6e6;

      &:hover {
        background-color:rgb(212, 212, 212);
    }
    }

    @media (max-width: 768px) {
      font-size: 14px;
    }
  }
`;

const WalletControl = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => (
        <ButtonWalletWrapper>
          <button className="connect-button" onClick={show}>
            {isConnected ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>{ensName ?? truncatedAddress}</span>
              </div>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </ButtonWalletWrapper>
      )}
    </ConnectKitButton.Custom>
  );
};

export default WalletControl;
