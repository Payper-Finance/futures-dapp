import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Stake from './components/Stake'
import Trade from './components/Trade'
import Hamburger from 'hamburger-react'
import { connectWallet, getAccount, disconnectWallet } from "./utils/wallet";
import { getBalance } from './utils/tezos'
import LeaderBoard from './components/LeaderBoard'
import Snackbar1 from './components/Snackbar'
import axios from 'axios'
import qs from 'qs'

const Main = () => {
  const [tradeOrStake, setTradeOrStake] = useState('trade')
  const [coinSelect, setCoinSelect] = useState('tezos');
  const [account, setAccount] = useState(false);
  const [isOpen, setOpen] = useState(false)
  const [show, setshow] = useState(false);
  const [type, setType] = useState(
    {
      type: "",
      message: "",
      transaction:""
    }
  )

  useEffect(() => {
    (async () => {
      const accounts = await getAccount();
      setAccount(accounts);
    })();
  }, []);

const getToken = async () => {
    var address = getAccount();
    var res = await getBalance();
    if (res) {
      await axios.post("http://localhost:8000/getToken/", qs.stringify({
        address: address,
      }),
        {
          header: {
            "Content-Type": "text/plain"
          }
        }
      ).then(res => {
        setType(
          {
            type: "success",
            message: "Transaction Done!, Now you can trade"
          }
        )
        setshow(true)
      }).catch(err => {
        setType(
          {
            type: "ERR",
            message: "Transaction ERROR!"
          }
        )
        setshow(true)
      })

  }
    else {
        setType(
          {
            type: "err",
            message: "You can only get the token once"
          }
          )
          setshow(true)

  }
}

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
    <Snackbar1 show={show} setshow={setshow} type={type} />
    <link rel="stylesheet" href="/styles/main.css" />
    <div className="nav-tab d-flex w-100 ">
      <div className='Logo'><img style={{ width: "40px", height: "40px", marginRight: "10px" }} src="img/Logo.png" />Zenith</div>

      <div className='tradeNav d-flex '>
        <div className={`${tradeOrStake === 'trade' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('trade') }}>Trade</div>
        <div className={`${tradeOrStake === 'stake' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('stake') }}>Stake <span className="comingsoon">coming soon</span></div>
        <div className={`${tradeOrStake === 'leaderboard' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('leaderboard') }}>Leaderboard</div>
        <div className={`tabs`} ><img style={{ width: "25px", height: "25px" }} src="img/discordnav.png" /> </div>
        <button style={{right:"220px"}} className="ms-auto custom_btn" onClick={getToken} >{!account ? <span>Get Token</span> : "Get Token"}</button>
        <button className="ms-auto custom_btn" onClick={!account ? onConnectWallet : onDisconnectWallet} >{!account ? <span>Connect Wallet</span> : "Disconnect"}</button>
      </div>
      <Hamburger className="mobileviewcheck" size={20} toggled={isOpen} toggle={setOpen} />
    </div>

    <div className={`${isOpen ? "menubar" : "unactivemenu"}`}>
      <div className={`mobilemenu`}>
        <h3><img src='img/walletimg.png' />3Mw1vp.....G6ikCDH4</h3>
        <div className="mobile_tabs" onClick={() => { setTradeOrStake('trade') }}>Trade</div>
        <hr />
        <div className="mobile_tabs" onClick={() => { setTradeOrStake('stake') }}>Stake</div>

        <p>Show in explorer</p>
        <p>Copy address</p>
        <p>Disconnect</p>
      </div>
    </div>

    <Sidebar coinSelect={coinSelect} stake={tradeOrStake} setCoinSelect={setCoinSelect} />
    <div className="main-section">

      {
        tradeOrStake === 'trade' ? <Trade coinSelect={coinSelect} setCoinSelect={setCoinSelect} /> : tradeOrStake == "stake" ? <Stake /> : (
          <LeaderBoard />
        )
      }
    </div>

  </div>
)
}

export default Main
