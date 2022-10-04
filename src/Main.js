import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Stake from './components/Stake'
import Trade from './components/Trade'
import Hamburger from 'hamburger-react'
import { connectWallet, getAccount, disconnectWallet } from "./utils/wallet";
import LeaderBoard from './components/LeaderBoard'
const Main = () => {
  const [tradeOrStake, setTradeOrStake] = useState('trade')
  const [coinSelect, setCoinSelect] = useState('tezos');
  const [account, setAccount] = useState(false);
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    (async () => {
      const accounts = await getAccount();
      setAccount(accounts);
    })();
  }, []);

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
    <div className='mainbox d-flex' >
      <link rel="stylesheet" href="/styles/main.css" />
      <div className="nav-tab d-flex w-100 ">
        <div className='Logo'><img style={{ width: "40px", height: "40px", marginRight: "10px" }} src="img/Logo.png" />Zenith</div>
       
        <div className='tradeNav d-flex '>
          <div className={`${tradeOrStake === 'trade' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('trade') }}>Trade</div>
          <div className={`${tradeOrStake === 'stake' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('stake') }}>Stake</div>
          <div className={`${tradeOrStake === 'leaderboard' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('leaderboard') }}>Leaderboard</div>
          <div className={`tabs`} ><img style={{width:"25px",height:"25px"}} src="img/discordnav.png" /> </div>
          <button className="ms-auto custom_btn" onClick={!account ? onConnectWallet : onDisconnectWallet} >{!account ? <span>Connect Wallet</span> : "Disconnect"}</button>
        </div>
        <Hamburger className="mobileviewcheck" size={20} toggled={isOpen} toggle={setOpen} />
      </div>

      <div className={`${isOpen?"menubar":"unactivemenu"}`}>
      <div className={`mobilemenu`}>
        <h3><img src='img/walletimg.png'/>3Mw1vp.....G6ikCDH4</h3>
        <div className="mobile_tabs" onClick={() => { setTradeOrStake('trade') }}>Trade</div>
        <hr/>
        <div className="mobile_tabs" onClick={() => { setTradeOrStake('stake') }}>Stake</div>

        <p>Show in explorer</p>
        <p>Copy address</p>
        <p>Disconnect</p>
      </div>
      </div>

      <Sidebar coinSelect={coinSelect} stake = {tradeOrStake} setCoinSelect={setCoinSelect} />
      <div className="main-section">

        {
          tradeOrStake === 'trade' ? <Trade coinSelect={coinSelect} setCoinSelect={setCoinSelect} /> : tradeOrStake =="stake"? <Stake />:(
            <LeaderBoard/>
          )
        }
      </div>
    </div>
  )
}

export default Main
