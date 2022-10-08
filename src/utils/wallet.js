// TODO 2.a - Setup beacon wallet instance
import { BeaconWallet } from "@taquito/beacon-wallet";
import {NETWORK, RPC} from './config';



export const wallet = new BeaconWallet({
  name: "Zenith",
  preferredNetwork: NETWORK,
});

// TODO 2.b - Setup connectWallet function (on jakartanet)
export const connectWallet = async () => {
  await wallet.requestPermissions({ network: { type: NETWORK, rpcUrl: RPC } });
};

export const disconnectWallet = async () => {
    await wallet.clearActiveAccount();
  };

// TODO 2.c - Setup getAccount function

export const getAccount = async () => {
  const activeAccount = await wallet.client.getActiveAccount();
  if (activeAccount) {
    return activeAccount.address;
  } else {
    return "";
  }
};