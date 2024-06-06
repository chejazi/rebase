import axios from "axios";
// import { stringify } from 'qs';

export const getPrices = async () => {
  const response = await axios.get('https://up.army/_/prices', {});
  return (response.data.results as any);
};