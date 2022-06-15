import { ethers } from "ethers";

export const factoryAddress = "0xa645F946884F434E32923b6FE930a34092BCf4be";
export const tokens = [
  {
    address: "0x951AD67A75D520c11FD08F98Cb148cc2dD0f8b8A",
    name: "REST",
  },
  {
    address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    name: "WAVAX",
  },
];

export const provider = new ethers.providers.Web3Provider(window.ethereum);
