import axios from 'axios';
import { getAddress } from 'viem'
import { StringMap } from '../types';

export const getPrices = async () => {
  const response = await axios.get('https://up.army/_/prices', {});
  return (response.data.results as any);
};

export const getTokenPrices = async (addresses: string[]) => {
  const response = await axios.get(`https://up.army/_/token-prices?addresses=${addresses.join()}`, {});
  return (response.data.results as any);
};

export const getTokenImage = (address: string) => {
  return tokenImages[address] || tokenImages[getAddress(address)] || tokenImages['NONE'];
};

const tokenImages: StringMap = {
  '0x940181a94A35A4569E4529A3CDfB74e38FD98631': '/tokens/aero.webp',
  '0x3C281A39944a2319aA653D81Cfd93Ca10983D234': '/tokens/build.webp',
  '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe': '/tokens/higher.webp',
  '0xBf4Db8b7A679F89Ef38125d5F84dd1446AF2ea3B': '/tokens/bleu.webp',
  '0x70737489DFDf1A29b7584d40500d3561bD4Fe196': '/tokens/bored.jpeg',
  '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed': '/tokens/degen.webp',
  '0x4200000000000000000000000000000000000006': '/tokens/eth.webp',
  '0x8ad5b9007556749DE59E088c88801a3Aaa87134B': '/tokens/farther.png',
  '0xd21111c0e32df451eb61A23478B438e3d71064CB': '/tokens/jobs.png',
  '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d': '/tokens/miggles.webp',
  '0x9A6d24c02eC35ad970287eE8296D4D6552a31DbE': '/tokens/opn.webp',
  '0x7dbdBF103Bb03c6bdc584c0699AA1800566f0F84': '/tokens/refi.png',
  '0xb488fCB23333e7bAA28D1dFd7B69a5D3a8BfeB3a': '/tokens/terminal.png',
  '0x5B5dee44552546ECEA05EDeA01DCD7Be7aa6144A': '/tokens/tn100x.png',
  '0x6888c2409D48222E2CB738eB5a805A522a96CE80': '/tokens/tree.webp',
  '0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE': '/tokens/tybg.jpeg',
  '0x88E2dA7B5dE075d4Cf4414e2D8162b51491461F8': '/tokens/wtw.png',

  '0x376b6EA60dB5D1851c13522378234B2b9846f6C0': '/tokens/lp-tokens.png', // UniV3 WETH/JOBS 1%
  '0x064Cc7EBec6067745CE28FE065b45C6589620845': '/tokens/lp-tokens.png', // UniV3 WETH/REFI 1%
  '0x32abE75D06D455e8b5565D47fC3c21d0877AcDD4': '/tokens/lp-tokens.png', // Aerodrome WETH/REFI
  'NONE': '/tokens/unknown-tokens.png',
};

export const getStakingApp = (symbol: string) => {
  return stakingApps[symbol];
}

const stakingApps: StringMap = {
  // 'REFI': '0x9Db748Ef3d6c6d7DA2475c48d6d09a7D75251F81',
  'JOBS': '0x9Db748Ef3d6c6d7DA2475c48d6d09a7D75251F81',
};
