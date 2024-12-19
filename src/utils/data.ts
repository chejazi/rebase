import axios from 'axios';
import { getAddress } from 'viem'
import { StringMap, NumberMap, StringNumberMap, PassportSocial } from '../types';

const cache = {
  tokenPrices: {} as StringNumberMap,
  ttl: {} as NumberMap,
};

// interface DexScreenerPair {
//   quoteToken: {
//     symbol: string;
//     address: string;
//   }
//   baseToken: {
//     symbol: string;
//     address: string;
//   }
//   volume: {
//     h24: number;
//   }
//   priceUsd: number;
// }

const fetchPricesByAddress = async (addresses: string[]) => {
  const now = new Date().getTime();
  const addressesToFetch = addresses
    .map(a => getAddress(a))
    .filter(a => !cache.ttl[a] || cache.ttl[a] < now)
    .slice(0, 30);

  if (addressesToFetch.length > 0) {
    const response = await axios.get(
      'https://api.geckoterminal.com/api/v2/simple/networks/base/token_price/' + addresses.join(',')
    );
    const tokenPrices = response.data.data.attributes.token_prices;
    Object.keys(tokenPrices).forEach((t) => {
      const ft = getAddress(t);
      cache.ttl[ft] = now + (30 * 60 * 1000); // 30 minutes
      cache.tokenPrices[ft] = tokenPrices[t];
    });
  }
}

export const getTokenPrices = async (addresses: string[]) => {
  await fetchPricesByAddress(addresses);
  return cache.tokenPrices as any;
  // const response = await axios.get(`https://up.army/_/token-prices?addresses=${addresses.join()}`, {});
  // return (response.data.results as any);
};

export const getTokenPrice = (address: string) => {
  console.log('address', address, cache.tokenPrices);
  return cache.tokenPrices[address];
};

export const getTokenImage = (address: string) => {
  return tokenImages[address] || tokenImages[getAddress(address)] || getUnknownToken();
};

const tokenImages: StringMap = {
  '0x0Db510e79909666d6dEc7f5e49370838c16D950f': '/tokens/anon.png',
  '0x940181a94A35A4569E4529A3CDfB74e38FD98631': '/tokens/aero.webp',
  '0x3C281A39944a2319aA653D81Cfd93Ca10983D234': '/tokens/build.png',
  '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe': '/tokens/higher.webp',
  '0xBf4Db8b7A679F89Ef38125d5F84dd1446AF2ea3B': '/tokens/bleu.webp',
  '0x70737489DFDf1A29b7584d40500d3561bD4Fe196': '/tokens/bored.jpeg',
  '0x1d008f50FB828eF9DEbBBEAe1B71FfFe929bf317': '/tokens/clankfun.webp',
  '0x621E87AF48115122Cd96209F820fE0445C2ea90e': '/tokens/crash.webp',
  '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed': '/tokens/degen.webp',
  '0x4200000000000000000000000000000000000006': '/tokens/eth.webp',
  '0x8ad5b9007556749DE59E088c88801a3Aaa87134B': '/tokens/farther.png',
  '0xd21111c0e32df451eb61A23478B438e3d71064CB': '/tokens/jobs.png',
  '0x1215163D2c569433b9104cC92c5dB231e7FB62A1': '/tokens/launcher.png',
  '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d': '/tokens/miggles.webp',
  '0x20DD04c17AFD5c9a8b3f2cdacaa8Ee7907385BEF': '/tokens/native.webp',
  '0x9A6d24c02eC35ad970287eE8296D4D6552a31DbE': '/tokens/opn.webp',
  '0x01929F1aE2dc8Cac021E67987500389aE3536CeD': '/tokens/proxy.png',
  '0x7dbdBF103Bb03c6bdc584c0699AA1800566f0F84': '/tokens/refi.png',
  '0xb488fCB23333e7bAA28D1dFd7B69a5D3a8BfeB3a': '/tokens/terminal.png',
  '0x5B5dee44552546ECEA05EDeA01DCD7Be7aa6144A': '/tokens/tn100x.png',
  '0x6888c2409D48222E2CB738eB5a805A522a96CE80': '/tokens/tree.png',
  '0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE': '/tokens/tybg.jpeg',
  '0x1E6bA8BC42Bbd8C68Ca7E891bAc191F0e07B1d6F': '/tokens/vroom.png',
  '0x88E2dA7B5dE075d4Cf4414e2D8162b51491461F8': '/tokens/wtw.png',

  '0xb8d1df947D9Ca0f4fe741DA789E3ABEe73FD8747': '/tokens/lp-tokens.png', // UniV3 ANON/ETH 1%
  '0x54bae536787d37bAcc028F9d62dCf8435Cde7a6d': '/tokens/lp-tokens.png', // UniV3 BUILD/ETH 1%
  '0x216f731793a54deeB1E4Eb348541D03D5bED56Bf': '/tokens/lp-tokens.png', // UniV3 LAUNCHER/ETH 1%
  '0xd8C21Dd22F84D9B668aF87E445b74C4B79c74380': '/tokens/lp-tokens.png', // UniV3 PROXY/ETH 1%
  '0x904bF08bBfF4F65b8867Ded6D1A93F60A637A4E2': '/tokens/lp-tokens.png', // UniV3 PROXY/DEGEN 1%
  '0xBC590e52232f5278dC661109476D9cA1FcdFDA34': '/tokens/lp-tokens.png', // UniV3 RaTcHeT/WETH 1%
  '0x376b6EA60dB5D1851c13522378234B2b9846f6C0': '/tokens/lp-tokens.png', // UniV3 WETH/JOBS 1%
  '0x064Cc7EBec6067745CE28FE065b45C6589620845': '/tokens/lp-tokens.png', // UniV3 WETH/REFI 1%
  '0x32abE75D06D455e8b5565D47fC3c21d0877AcDD4': '/tokens/lp-tokens.png', // Aerodrome WETH/REFI
};

export const getUnknownToken = () => '/tokens/unknown-token.png';

export const getStakingApp = (symbol: string) => {
  return stakingApps[symbol];
}
export const getStakingApps = () => {
  return Object.keys(stakingApps).map(k => stakingApps[k]);
};

const stakingApps: StringMap = {
  // 'ANON': '0xb400A1698F7032693F8508586ceF41155ccc2b77',
  'ANON': '0xeB0E5B1aB4391936365671FF5Fa969161a1eB2B0',
  'REFI': '0x44F9DB2D109F0910BF32394FF346ee2cEA7d26BB',
  'JOBS': '0x9Db748Ef3d6c6d7DA2475c48d6d09a7D75251F81',
  'PROXY': '0xe117d1D5dFD48888e1fF7814147276Ae3aA9cd54',
  'BUILD': '0x4bA3f92f1d17c7a3be8749D7f1958C672502e6E5',
  'VROOM': '0xeb918bb84B23d9557f8887FBb6060FF78d1Bb6D3',
  'RaTcHeT': '0xE28395Dbbf3C16650321B0f87c29a3617E9C8070',
  'LAUNCHER': '0x7D69e72154CD2f0F370DC742E89131033B9b0686',
};

export async function address2FC(address: string) {
  const response = await axios.get(
    'https://4dclrhwmykkwtfebciminde34y0oyibh.lambda-url.us-east-1.on.aws/?address=' + address
    // 'https://u3cey55qwrm3ndc7ymvsajjwzq0wfvrx.lambda-url.us-east-1.on.aws/?addresses=' + addresses.join(',')
  );
  if (response && response.data && !response.data.code) {
    const user = response.data.passport.passport_socials.filter((s: PassportSocial) => s.source == 'farcaster')?.[0];
    if (user) {
      return user.profile_name;
    }
  }
}

