import axios from 'axios';
import { getAddress } from 'viem'
import { StringMap, NumberMap, StringNumberMap } from '../types';

const cache = {
  tokenPrices: {} as StringNumberMap,
  ttl: {} as NumberMap,
};

interface DexScreenerPair {
  quoteToken: {
    symbol: string;
    address: string;
  }
  baseToken: {
    symbol: string;
    address: string;
  }
  volume: {
    h24: number;
  }
  priceUsd: number;
}

const fetchPricesByAddress = async (addresses: string[]) => {
  const now = new Date().getTime();
  const addressesToFetch = addresses
    .map(a => getAddress(a))
    .filter(a => !cache.ttl[a] || cache.ttl[a] < now)
    .slice(0, 30);

  if (addressesToFetch.length > 0) {
    const response = await axios.get(
      'https://api.dexscreener.com/latest/dex/tokens/' + addresses.join(',')
    );
    const results = {
      price: {} as StringNumberMap,
      volume: {} as StringNumberMap,
    };
    if (response.data && response.data.pairs) {
      response.data.pairs
      .filter((p: DexScreenerPair) => p.quoteToken.address == "0x4200000000000000000000000000000000000006")
      .forEach((p: DexScreenerPair) => {
        if (
          results.volume[p.baseToken.symbol] === undefined ||
          results.volume[p.baseToken.symbol] < p.volume.h24
        ) {
          results.volume[p.baseToken.symbol] = p.volume.h24;
          results.price[p.baseToken.address] = p.priceUsd;
        }
      });
    }
    Object.keys(results.price).forEach((a) => {
      cache.ttl[a] = now + (30 * 60 * 1000); // 30 minutes
      cache.tokenPrices[a] = results.price[a];
    });
  }
}

export const getPrices = async () => {
  const response = await axios.get('https://up.army/_/prices', {});
  return (response.data.results as any);
};

export const getTokenPrices = async (addresses: string[]) => {
  await fetchPricesByAddress(addresses);
  return cache.tokenPrices as any;
  // const response = await axios.get(`https://up.army/_/token-prices?addresses=${addresses.join()}`, {});
  // return (response.data.results as any);
};

export const getTokenImage = (address: string) => {
  return tokenImages[address] || tokenImages[getAddress(address)] || tokenImages['NONE'];
};

const tokenImages: StringMap = {
  '0x940181a94A35A4569E4529A3CDfB74e38FD98631': '/tokens/aero.webp',
  '0x3C281A39944a2319aA653D81Cfd93Ca10983D234': '/tokens/build.png',
  '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe': '/tokens/higher.webp',
  '0xBf4Db8b7A679F89Ef38125d5F84dd1446AF2ea3B': '/tokens/bleu.webp',
  '0x70737489DFDf1A29b7584d40500d3561bD4Fe196': '/tokens/bored.jpeg',
  '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed': '/tokens/degen.webp',
  '0x4200000000000000000000000000000000000006': '/tokens/eth.webp',
  '0x8ad5b9007556749DE59E088c88801a3Aaa87134B': '/tokens/farther.png',
  '0xd21111c0e32df451eb61A23478B438e3d71064CB': '/tokens/jobs.png',
  '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d': '/tokens/miggles.webp',
  '0x9A6d24c02eC35ad970287eE8296D4D6552a31DbE': '/tokens/opn.webp',
  '0x01929F1aE2dc8Cac021E67987500389aE3536CeD': '/tokens/proxy.png',
  '0x7dbdBF103Bb03c6bdc584c0699AA1800566f0F84': '/tokens/refi.png',
  '0xb488fCB23333e7bAA28D1dFd7B69a5D3a8BfeB3a': '/tokens/terminal.png',
  '0x5B5dee44552546ECEA05EDeA01DCD7Be7aa6144A': '/tokens/tn100x.png',
  '0x6888c2409D48222E2CB738eB5a805A522a96CE80': '/tokens/tree.png',
  '0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE': '/tokens/tybg.jpeg',
  '0x88E2dA7B5dE075d4Cf4414e2D8162b51491461F8': '/tokens/wtw.png',

  '0x54bae536787d37bAcc028F9d62dCf8435Cde7a6d': '/tokens/lp-tokens.png', // UniV3 BUILD/ETH 1%
  '0xd8C21Dd22F84D9B668aF87E445b74C4B79c74380': '/tokens/lp-tokens.png', // UniV3 PROXY/ETH 1%
  '0x904bF08bBfF4F65b8867Ded6D1A93F60A637A4E2': '/tokens/lp-tokens.png', // UniV3 PROXY/DEGEN 1%
  '0x376b6EA60dB5D1851c13522378234B2b9846f6C0': '/tokens/lp-tokens.png', // UniV3 WETH/JOBS 1%
  '0x064Cc7EBec6067745CE28FE065b45C6589620845': '/tokens/lp-tokens.png', // UniV3 WETH/REFI 1%
  '0x32abE75D06D455e8b5565D47fC3c21d0877AcDD4': '/tokens/lp-tokens.png', // Aerodrome WETH/REFI
  'NONE': '/tokens/unknown-tokens.png',
};

export const getStakingApp = (symbol: string) => {
  return stakingApps[symbol];
}

const stakingApps: StringMap = {
  // 'REFI': '',
  'JOBS': '0x9Db748Ef3d6c6d7DA2475c48d6d09a7D75251F81',
  'PROXY': '0xe117d1D5dFD48888e1fF7814147276Ae3aA9cd54',
  'BUILD': '0x4bA3f92f1d17c7a3be8749D7f1958C672502e6E5',
};
