import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  .top-bar.scrolled .connect-button:hover {
    background-color:rgb(54, 54, 54) !important; 
  }
  @media (prefers-color-scheme: light) {
    .top-bar.scrolled .connect-button:hover {
      background-color: rgb(212, 212, 212) !important; 
    }
  }
`;

export default GlobalStyles;
