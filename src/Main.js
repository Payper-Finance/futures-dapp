import React, { useState, useEffect,useContext } from 'react'
import Sidebar from './components/Sidebar'
import Stake from './components/Stake'
import Trade from './components/Trade'
import Hamburger from 'hamburger-react'
import { connectWallet, getAccount, disconnectWallet } from "./utils/wallet";
import { getBalance } from './utils/tezos'
import LeaderBoard from './components/LeaderBoard'
import Snackbar1 from './components/Snackbar'
import axios from 'axios'
import { PRECISION,vUSD_ADDRESS } from './utils/config'
import UserContext from './ContextProvider'
import {CONTRACT_ADDRESS} from "./utils/config"

const Main = () => {
const { setCPosiitonUpdated,CPosiitonUpdated } = useContext(UserContext)

  const [address,setAddress] = useState("")
  const [tradeOrStake, setTradeOrStake] = useState('trade')
  const [coinSelect, setCoinSelect] = useState('tezos');
  const [account, setAccount] = useState(false);
  const [isOpen, setOpen] = useState(false)
  const [show, setshow] = useState(false);
  const [tokenBalance,setTokenBalance] = useState("")
  const [type, setType] = useState(
    {
      type: "",
      message: "",
      transaction:""
    }
  )


  
  const gettokendata = async()=>{
    const accounts = await getAccount();
    if(!accounts){
      setTokenBalance('')
    }
    else{
      const getbalacnce = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/${vUSD_ADDRESS}/bigmaps/balances/keys/${accounts}`)
      if (getbalacnce.data == '') {
          return true
      }
      else {
          setTokenBalance((getbalacnce.data.value.balance/PRECISION).toFixed(2))
      }
    }

  }

  const onConnectWallet = async () => {
    await connectWallet();
    const accounts = await getAccount();
    setAccount(accounts);
    gettokendata()
  };
  
  const onDisconnectWallet = async () => {
    await disconnectWallet();
    setAccount(false);
    gettokendata()

  };

  useEffect(() => {
    (async () => {
      const accounts = await getAccount();
      setAccount(accounts);
      setAddress(accounts)
      await gettokendata();
    })();
  }, [CPosiitonUpdated,address,account]);

const getToken = async () => {
  const accounts = await getAccount();
  if(!accounts){
    setType(
      {
        type: "error",
        message: "Connect Your Wallet First"
      }
    )
    setshow(true)
    return
  }

    await axios.post("https://zenith-api-l8hhy.ondigitalocean.app/getToken/", {
      address: account
    }).then((res)=>{
      if (res.data == "Issued") {
        setType(
          {
            type: "success",
            message: "Transaction Done!, Now you can trade"
          }
        )
        gettokendata()
        setshow(true)
        
      } else if (res.data == "Already Issued") {
        setType(
          {
            type: "error",
            message: "You already issued the tokens"
          }
        )
        setshow(true)
      } else {
        setType(
          {
            type: "error",
            message: "An Error Occured. Please try again!"
          }
        )
        setshow(true)
      }
    })
  }

  const sidebarmenu =(event)=>{
    setTradeOrStake(event)
    setOpen(false)
  }


return (
  <div className='mainbox d-flex' >
    <Snackbar1 show={show} setshow={setshow} type={type} />
    <link rel="stylesheet" href="/styles/main.css" />
    <div className="nav-tab d-flex w-100 ">
      <div className='Logo'><img style={{ width: "40px", height: "40px", marginRight: "10px" }} src="img/Logo.png" />Zenith</div>

      <div className='tradeNav d-flex '>
        <div className={`${tradeOrStake === 'trade' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('trade') }}>Trade</div>
        <div className={`${tradeOrStake === 'stake' ? 'tabs-sel' : ''} tabs`} /*onClick={() => { setTradeOrStake('stake') }}*/>Stake <span className="comingsoon">coming soon</span></div>
        <div className={`${tradeOrStake === 'leaderboard' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('leaderboard') }}>Leaderboard</div>
        <div className={`tabs`} ><a href='https://discord.gg/dgBRfYunrw'  target="_blank" rel="noopener noreferrer"><img style={{ width: "25px", height: "25px" }} src="img/discordnav.png" /> </a></div>
        <div className='btncustmdiv'>
        <button style={{right:""}} className=" custom_btn" onClick={getToken} ><span>{tokenBalance==''?"Get Token":`${tokenBalance} kUSD`}</span></button>
        <button className=" custom_btn" onClick={!account ? onConnectWallet : onDisconnectWallet} >{!account ? <span>Connect Wallet</span> : `${address.substring(0, 12)}..`}</button>
        </div>
      </div>
      <Hamburger className="mobileviewcheck" size={20} toggled={isOpen} toggle={setOpen} />
    </div>
    {
      !account ?(
        <button className="mobileviewconnect" onClick={onConnectWallet} >{!account ? <span>Connect Wallet</span> : "Disconnect"}</button>

      ):(
        <button  className=" mobileviewconnect" onClick={getToken} ><span>{tokenBalance==''?"Get Token":`${tokenBalance} kUSD`}</span></button>
      )
    }

    <div className={`${isOpen ? "menubar" : "unactivemenu"}`}>
      <div className={`mobilemenu`}>
        <h3><img src='img/walletimg.png' />Wallet</h3>
        <div className="mobile_tabs" onClick={() => { sidebarmenu('trade') }}>Trade</div>
        <hr  />
        <div className="mobile_tabs" /*onClick={() => { setTradeOrStake('stake') }}*/ >Stake</div>
        <hr />

        <div className="mobile_tabs" onClick={() => { sidebarmenu('leaderboard') }}>Leaderboard</div>
        <hr />

        <p><a style={{textDecoration:"none",color:"white"}} href={`https://ghostnet.tzkt.io/${CONTRACT_ADDRESS}/operations/`} target="_blank" rel="noopener noreferrer">Show in explorer</a></p>
        <p onClick={()=>navigator.clipboard
                      .writeText(address)
                      .then((res) => alert("Address Copied"))}>Copy address</p>
        <p className=" mobile_tabs" onClick={!account ? onConnectWallet : onDisconnectWallet} >{!account ? <span>Connect Wallet</span> : "Disconnect"}</p>
        
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
