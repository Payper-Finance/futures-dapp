import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Stake from './components/Stake'
import Trade from './components/Trade'
import { connectWallet, getAccount, disconnectWallet } from "./utils/wallet";

const Main = () => {
    const [tradeOrStake, setTradeOrStake] = useState('trade')
    const [coinSelect, setCoinSelect] = useState('tezos');
    const [account, setAccount] = useState(false);
    useEffect(() => {
      (async () => {
      // TODO 5.b - Get the active account
      const accounts = await getAccount();
      setAccount(accounts);
      })();
    }, []);

    // TODO 4.a - Create onConnectWallet function
    const onConnectWallet = async () => {
      await connectWallet();
      const accounts = await getAccount();
      setAccount(accounts);
    };

    const onDisconnectWallet = async () => {
      await disconnectWallet();
      setAccount(false);
    };

  return (
    <div className='d-flex'>
        <link rel="stylesheet" href="/styles/main.css" />
      <Sidebar coinSelect = {coinSelect} setCoinSelect={setCoinSelect}/>
      <div className="main-section">
        <div className="nav-tab d-flex w-100 ">
            <div className={`${tradeOrStake === 'trade'?'tabs-sel':''} tabs`} onClick={()=>{setTradeOrStake('trade')}}>Trade</div>
            <div className={`${tradeOrStake === 'stake'?'tabs-sel':''} tabs`} onClick={()=>{setTradeOrStake('stake')}}>Stake</div>
            <button className="ms-auto custom_btn" onClick={!account ? onConnectWallet : onDisconnectWallet} >{!account ? <span>Connect Wallet</span> : "Disconnect"}</button>
            
        </div>
        {
            tradeOrStake === 'trade'? <Trade  coinSelect = {coinSelect} setCoinSelect={setCoinSelect} />: <Stake/>
        }
      </div>
    </div>
  )
}

export default Main
