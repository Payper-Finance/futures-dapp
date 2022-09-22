// TODO 1 - Setup Tezos toolkit
import { TezosToolkit } from "@taquito/taquito";
import { wallet, getAccount} from "./wallet";
import {RPC} from './config'
import SnackbarUtils from './SnackbarUtils';

export const tezos = new TezosToolkit(RPC);

// TODO 3 - Specify wallet provider for Tezos instance
tezos.setWalletProvider(wallet);

export const getBalance = async () => {
    const address = await getAccount();
    const bal = await tezos.tz.getBalance(address).catch((error) => console.log(JSON.stringify(error)));
    return bal.toNumber()/1000000
    
}

export const CONTRACT_ADDRESS = 'KT1CkJSoxa8Wm9fD2RSkfnpsEZch55jKB3Nj';
export const vUSD_ADDRESS = 'KT19mcZ91i9Uq711ghZWgk2JAtrfm8s8vxU2';

export const openLong = async (base_value, leverage_multiple, state_name) => {
    SnackbarUtils.info("Transaction in Process");
    const multiple = 1000000
    SnackbarUtils.info("Connecting Account");
    const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
    SnackbarUtils.info("Connecting Contracts");
    const vusd_contract = await tezos.wallet.at(vUSD_ADDRESS);
    SnackbarUtils.info("Transaction in Process");
    const batch = await tezos.wallet.batch()
            .withContractCall(vusd_contract.methods.approve( "KT1CkJSoxa8Wm9fD2RSkfnpsEZch55jKB3Nj" , base_value * leverage_multiple * multiple))
            .withContractCall(vmm_contract.methods.openLong(base_value * multiple, leverage_multiple, state_name));
    SnackbarUtils.info('Sending Txn')
    const batchOp = await batch.send();
    SnackbarUtils.info("Waiting for confirmation")
    await batchOp.confirmation().then((op)=>{console.log(op.opHash)}).catch((err)=>{
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")
    
    });
    SnackbarUtils.success("Transaction Success").then()
    
}

export const closeLong = async (state_name) => {
    SnackbarUtils.info('Txn Started')
    const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
    SnackbarUtils.info('Contract Connected')
    const batch = await tezos.wallet.batch()
            .withContractCall(vmm_contract.methods.closeLong(state_name));
            SnackbarUtils.info('Sending Txn')
    const batchOp = await batch.send();
    SnackbarUtils.info("Waiting for confirmation")
    await batchOp.confirmation().then((op)=>{console.log(op.opHash)}).catch((err)=>{
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")});
    SnackbarUtils.success("Txn Success")
    
}

export const openShort = async (base_value, leverage_multiple, state_name) => {
    const multiple = 1000000
    SnackbarUtils.info('Txn Started')
    const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
    const vusd_contract = await tezos.wallet.at(vUSD_ADDRESS);
    SnackbarUtils.info('Contract Connected')
    const batch = await tezos.wallet.batch()
            .withContractCall(vusd_contract.methods.approve( "KT1CkJSoxa8Wm9fD2RSkfnpsEZch55jKB3Nj" , base_value * leverage_multiple * multiple))
            .withContractCall(vmm_contract.methods.openShort(base_value * multiple, leverage_multiple, state_name));
            SnackbarUtils.info('Sending Txn')
    const batchOp = await batch.send();
    SnackbarUtils.info("Waiting for confirmation")
    await batchOp.confirmation().then((op)=>{console.log(op.opHash)}).catch((err)=>{
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")});
    SnackbarUtils.success("Txn Success")
    
}

export const closeShort = async (state_name) => {
    SnackbarUtils.info('Txn Started')
    const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
    SnackbarUtils.info('Contract Connected')
    const batch = await tezos.wallet.batch()
            .withContractCall(vmm_contract.methods.closeShort(state_name));
    SnackbarUtils.info('Sending Txn')
    const batchOp = await batch.send();
    SnackbarUtils.info("Waiting for confirmation")
    await batchOp.confirmation().then((op)=>{console.log(op.opHash)}).catch((err)=>{
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")});
    SnackbarUtils.success("Txn Success")
    
}