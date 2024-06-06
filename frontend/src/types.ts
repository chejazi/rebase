export interface Trade {
  id: number;
  user: string;
  token: string;
  action: string;
  domain: string;
  tokens: number;
  supply: number;
  cost: string;
  fees: string;
  time: number;
  txid: string;
  name?: string;
  favicon?: string;
  description?: string;
}

export interface Site {
  domain: string;
  token: string;
  favicon: string;
  description: string;
  supply: number;
  holders: number;
  first_traded: number;
}

export interface Position {
  domain: string;
  tokens: number
}

export interface DropdownOption {
  value: string;
  label: string;
  symbol: string;
}

export interface DropdownOptionLabel {
  value: string;
  label: string;
  description: string;
}

export interface NumberMap {
  [key: string]: number;
}