// TODO 1 - Setup Tezos toolkit
import { OpKind, TezosToolkit } from "@taquito/taquito";
import { wallet, getAccount } from "./wallet";
import { RPC } from './config'
import SnackbarUtils from './SnackbarUtils';
import axios from 'axios';
import qs from 'qs'
export const tezos = new TezosToolkit(RPC);



tezos.setWalletProvider(wallet);

export const getBalance = async () => {
    const address = await getAccount();
    const getbalacnce = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/KT19mcZ91i9Uq711ghZWgk2JAtrfm8s8vxU2/bigmaps/balances/keys/${address}`)
    if (getbalacnce.data == '') {
        return true
    }
    else {
        return false
    }
}



const multiple = 1000000
export const CONTRACT_ADDRESS = 'KT1MivLp4FjSMSJtMuQP6VPmsTrR2UFSoCNw';
export const vUSD_ADDRESS = 'KT19mcZ91i9Uq711ghZWgk2JAtrfm8s8vxU2';


export const openPosition = async (base_value, leverage_multiple, direction) => {

    try {
        const value = base_value * multiple
        SnackbarUtils.info("Transaction in Process");

        SnackbarUtils.info("Connecting Account");
        const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
        SnackbarUtils.info("Connecting Contracts");
        const vusd_contract = await tezos.wallet.at(vUSD_ADDRESS);
        SnackbarUtils.info("Transaction in Process");

        const op1 = vusd_contract.methods.approve("KT1MivLp4FjSMSJtMuQP6VPmsTrR2UFSoCNw", value).toTransferParams();
        op1.kind = OpKind.TRANSACTION;

        const op2 = vmm_contract.methods.increasePosition(direction, leverage_multiple, value).toTransferParams();
        op2.kind = OpKind.TRANSACTION;
        const batch = await tezos.wallet.batch([op1, op2]);
        SnackbarUtils.info('Sending Txn')
        const batchOp = await batch.send();
        SnackbarUtils.info("Waiting for confirmation")
        await batchOp.confirmation()
        const address = await getAccount();
        console.log(batchOp)

        // await axios.post("http://localhost:8000/positionaction/", qs.stringify({
        //     action: "open",
        //     address: address,
        //     batchOp: batchOp.opHash
        // }),
        //     {
        //         header: {
        //             "Content-Type": "application/json"
        //         }
        //     }
        // ).then(res => console.log("post position"))
        // await axios.post("http://localhost:8000/post/").then(res => console.log("post position")).catch(err => console.log(err))
        return batchOp.opHash
    } catch (err) {
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")
    }
}

export const closePosition = async (state_name) => {
    try {
        SnackbarUtils.info('Txn Started')
        const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
        SnackbarUtils.info('Contract Connected')
        const batch = await tezos.wallet.batch()
            .withContractCall(vmm_contract.methods.closePosition(state_name));
        SnackbarUtils.info('Sending Txn')
        const batchOp = await batch.send();
        SnackbarUtils.info("Waiting for confirmation")
        await batchOp.confirmation()
        console.log(batchOp)
        // const address = await getAccount();

        // await axios.post("http://localhost:8000/positionaction/", qs.stringify({
        //     action: "close",
        //     address: address,
        //     batchOp: batchOp.opHash
        // }),
        //     {
        //         header: {
        //             "Content-Type": "text/plain"
        //         }
        //     }
        // )
        return batchOp.opHash
    }
    catch (err) {
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")
    }


}


export const decreasePosition = async (leverage, amount) => {
    try {
        SnackbarUtils.info('Txn Started')
        const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
        SnackbarUtils.info('Contract Connected')
        const batch = await tezos.wallet.batch()
            .withContractCall(vmm_contract.methods.decreasePosition(leverage, amount * multiple));
        SnackbarUtils.info('Sending Txn')
        const batchOp = await batch.send();
        SnackbarUtils.info("Waiting for confirmation")
        await batchOp.confirmation()
        SnackbarUtils.success("Txn Success")
        const address = await getAccount();
        // console.log(batchOp.opHash)
        // await axios.post("http://localhost:8000/positionaction/", qs.stringify({
        //     action: "reduce",
        //     address: address,
        //     batchOp: batchOp.opHash
        // }),
        //     {
        //         header: {
        //             "Content-Type": "application/json"
        //         }
        //     }
        // )
        return batchOp.opHash
    }
    catch (err) {
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")

    }


}
export const removeMargin = async (amount) => {
    try {
       

        SnackbarUtils.info('Txn Started')
        const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
        SnackbarUtils.info('Contract Connected')
        const batch = await tezos.wallet.batch()
            .withContractCall(vmm_contract.methods.removeMargin(amount * multiple));
        SnackbarUtils.info('Sending Txn')
        const batchOp = await batch.send();
        SnackbarUtils.info("Waiting for confirmation")
        await batchOp.confirmation()
        SnackbarUtils.success("Txn Success")
        // const address = await getAccount();
        // await axios.post("http://localhost:8000/positionaction/", qs.stringify({
        //     action: "reduce",
        //     address: address,
        //     batchOp: batchOp.opHash
        // }),
        //     {
        //         header: {
        //             "Content-Type": "text/plain"
        //         }
        //     }
        // )
        return batchOp.opHash

    }
    catch (err) {
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")

    }

}
export const addMargin = async (value) => {
    try {
        SnackbarUtils.info('Txn Started')
        const vmm_contract = await tezos.wallet.at(CONTRACT_ADDRESS);
        SnackbarUtils.info('Contract Connected')
        const vusd_contract = await tezos.wallet.at(vUSD_ADDRESS);
        SnackbarUtils.info("Transaction in Process");
        const batch = await tezos.wallet.batch()
            .withContractCall(vusd_contract.methods.approve("KT1MivLp4FjSMSJtMuQP6VPmsTrR2UFSoCNw", value * multiple))
            .withContractCall(vmm_contract.methods.addMargin(value * multiple))

        SnackbarUtils.info('Sending Txn')
        const batchOp = await batch.send();
        SnackbarUtils.info("Waiting for confirmation")
        await batchOp.confirmation()
        SnackbarUtils.success("Txn Success")
        // const address = await getAccount();
        console.log(batchOp.opHash)
        // await axios.post("http://localhost:8000/positionaction/", qs.stringify({
        //     action: "addmargin",
        //     address: address,
        //     batchOp: batchOp.opHash
        // }),
        //     {
        //         header: {
        //             "Content-Type": "text/plain"
        //         }
        //     }
        // )
        return batchOp.opHash

    }
    catch (err) {
        console.log(err)
        SnackbarUtils.error("Error Please Try Again")
    }

}