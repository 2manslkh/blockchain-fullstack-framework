import axios from "axios";

let url = process.env.NEXT_PUBLIC_API_URL;
console.log("🚀 | url", url);

export const saveGame = async (saveData, user, chain) => {
  let response = await axios.post(`${url}/api/v1/saveManager/${chain}/save`, {
    saveData: saveData,
    user: user,
  });
  console.log("🚀 | saveGame | response", response);
  return response.data.data;
};

export const loadGame = async (address, chain) => {
  let response = await axios.get(
    `${url}/api/v1/saveManager/${chain}/load?user=${address}`
  );
};
