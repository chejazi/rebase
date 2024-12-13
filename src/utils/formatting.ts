export const prettyPrint = (num: string, units: number) => parseFloat(parseFloat(num).toFixed(units)).toLocaleString();

export const prettyPrintAddress = (address: string) => `${address.substr(0, 6)}...${address.substr(-4)}`;
