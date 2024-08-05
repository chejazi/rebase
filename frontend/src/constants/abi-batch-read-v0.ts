export const batchReadAddress = '0xC6cFD2b9891DEEa5B57eD9e01b82A2683a8be007';
export const batchReadABI = [
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "rebase",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "getTokenStakes",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];