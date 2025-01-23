import { ConnectKitButton } from "connectkit";
import styled from "styled-components";

const CustomConnectButton = styled.button`
  --primary-color: #181818 ;
  --secondary-color: #fff;
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 8px 15px;
  color: var(--secondary-color);
  background: #181818;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 11px 0 0 11px;
  transition: all 0.3s ease;

  span {
    display: inline-block;
    transition: transform 0.3s ease;
    transform: translateY(0); 
  }

  &:hover span {
    transform: translateY(-1px);
  }

  @media (prefers-color-scheme: light) {
    color: var(--primary-color);
    background: #f8f8f8;
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
                  <span>{ensName ?? truncatedAddress}</span>
                </div>
              ) : (
                <span>Connect Wallet</span>
              )}
            </CustomConnectButton>
          );
        }}
      </ConnectKitButton.Custom>
    );
};

export default CustomButton;

