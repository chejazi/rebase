import { ConnectKitButton } from "connectkit";
import styled from "styled-components";

const CustomConnectButton = styled.button`
  --primary-color: #181818 ;
  --secondary-color: #fff;
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 10px 15px;
  color: var(--secondary-color);
  background: none;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (prefers-color-scheme: light) {
    color: var(--primary-color);
  } 

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const CustomButton = () => {
    return (
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName }) => {
          return (
            <CustomConnectButton onClick={show}>
              {isConnected ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {ensName ?? truncatedAddress}
                </div>
              ) : (
                "Connect Wallet"
              )}
            </CustomConnectButton>
          );
        }}
      </ConnectKitButton.Custom>
    );
};

export default CustomButton;

