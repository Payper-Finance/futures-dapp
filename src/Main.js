import React, { useState, useEffect, useContext } from 'react'
import Sidebar from './components/Sidebar'
import Stake from './components/Stake'
import Trade from './components/Trade'
import Hamburger from 'hamburger-react'
import { connectWallet, getAccount, disconnectWallet } from "./utils/wallet";
import { getBalance } from './utils/tezos'
import LeaderBoard from './components/LeaderBoard'
import Snackbar1 from './components/Snackbar'
import axios from 'axios'
import { PRECISION, vUSD_ADDRESS } from './utils/config'
import UserContext from './ContextProvider'
import { CONTRACT_ADDRESS } from "./utils/config"
import { ClipLoader } from 'react-spinners'
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';



const Main = () => {
  const { setCPosiitonUpdated, CPosiitonUpdated,setkusdTokenBalance,setTheme,Theme} = useContext(UserContext)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [Loading, setLoading] = useState(false)
  const [address, setAddress] = useState("")
  const [tradeOrStake, setTradeOrStake] = useState('trade')
  const [coinSelect, setCoinSelect] = useState('tezos');
  const [account, setAccount] = useState(false);
  const [isOpen, setOpen] = useState(false)
  const [show, setshow] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("")
  const [popoverOpen, setpopoverOpen] = useState(false)
  const [type, setType] = useState(


    {
      type: "",
      message: "",
      transaction: ""
    }
  )



  const gettokendata = async () => {
    const accounts = await getAccount();
    if (!accounts) {
      setTokenBalance('')
    }
    else {
      const getbalacnce = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/${vUSD_ADDRESS}/bigmaps/balances/keys/${accounts}`)
      if (getbalacnce.data == '') {
        return true
      }
      else {
        setTokenBalance((getbalacnce.data.value.balance / PRECISION).toFixed(2))
        setkusdTokenBalance((getbalacnce.data.value.balance / PRECISION).toFixed(2))
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
  }, [CPosiitonUpdated, address, account]);

  const getToken = async () => {
    setLoading(true)
    const accounts = await getAccount();
    if (!accounts) {
      setType(
        {
          type: "error",
          message: "Connect Your Wallet First"
        }
      )
      setshow(true)
      setLoading(false)
      return
    }

    await axios.post("https://zenith-api-l8hhy.ondigitalocean.app/getToken/", {
      address: account
    }).then((res) => {
      if (res.data == "Issued") {
        setType(
          {
            type: "success",
            message: "Transaction Done!, Now you can trade"
          }
        )
        gettokendata()
        setshow(true)
        setLoading(false)
        gettokendata()

      } else if (res.data == "Already Issued") {
        setType(
          {
            type: "error",
            message: "You already issued the tokens"
          }
        )
        setshow(true)
        setLoading(false)

      } else {
        setType(
          {
            type: "error",
            message: "An Error Occured. Please try again!"
          }
        )
        setshow(true)
        setLoading(false)

      }
    })
  }

  const sidebarmenu = (event) => {
    setTradeOrStake(event)
    setOpen(false)
  }
  const toggleTheme =()=>{
    if(Theme == "Dark"){
      setTheme("Light")
    }
    else{
      setTheme("Dark")
    }
    localStorage.setItem('theme', Theme=="Dark"?"Light":"Dark")

  }


  return (
    <>
    {
      Theme=="Light"?(
<style>{`
    .css-3bmhjh-MuiPaper-root-MuiPopover-paper{
      background-color:aliceblue !important ;
      margin-top: 43px;
      right: 40px !important;
      left: auto !important;
  }
  .css-1e6y48t-MuiButtonBase-root-MuiButton-root{
    color: black;
}
.popbtn{
  color:black !important;
}
    `}</style>
      ):(
<style>{`
    .css-3bmhjh-MuiPaper-root-MuiPopover-paper{
      background-color:#0E0F18 !important ;
      margin-top: 43px;
      right: 40px !important;
      left: auto !important;
  }
  .css-1e6y48t-MuiButtonBase-root-MuiButton-root{
    color: white;
}

    `}</style>
      )
    }
    
    <div className='mainbox d-flex' >
      <Snackbar1 show={show} setshow={setshow} type={type} />
      <link rel="stylesheet" href="/styles/main.css" />
      <div className="nav-tab d-flex w-100 ">
        <div style={Theme=="Light"?{background:"#AC69FF"}:{}} className='Logo'><img style={{ width: "40px", height: "40px", marginRight: "10px" }} src="img/Logo.png" />Zenith</div>

        <div style={Theme=="Light"?{background:"#AC69FF"}:{}} className='tradeNav d-flex '>
        <div className={`tabs`} ><a href='https://zenith.payperfi.com' target="_blank" rel="noopener noreferrer"><img style={{ width: "25px", height: "25px" }} src="img/home.png" /> </a></div>
          <div className={`${tradeOrStake === 'trade' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('trade') }}>Trade</div>
          <div className={`${tradeOrStake === 'stake' ? 'tabs-sel' : ''} tabs`} /*onClick={() => { setTradeOrStake('stake') }}*/>Stake <span className="comingsoon">coming soon</span></div>
          <div className={`${tradeOrStake === 'leaderboard' ? 'tabs-sel' : ''} tabs`} onClick={() => { setTradeOrStake('leaderboard') }}>Leaderboard</div>
          <div className={`tabs`} ><a href='https://docs.payperfi.com/' style={{ color: "white", textDecoration: "none" }} target="_blank" rel="noopener noreferrer"> Docs </a></div>
          
          
          <div className={`tabs`} ><a href='https://discord.gg/dgBRfYunrw' target="_blank" rel="noopener noreferrer"><img style={{ width: "25px", height: "25px" }} src="img/discordnav.png" /> </a></div>
          <div className='btncustmdiv'>
          <button style={{marginTop:"15px",borderRadius:"5px" ,marginRight:"10px",maxHeight:"30px",border:"none", background:`${Theme=="Light"?"aliceblue":"black"}`}} onClick={toggleTheme}><img style ={{height:"25px",borderRadius:"10px"}} src={`${Theme=="Light"?"img/nightmode.png":"img/lightmode.png"}`}/></button>
            <button style={{ right: "" }} className=" custom_btn" onClick={getToken} >
              {!Loading?<span>{tokenBalance == '' ? "Get Token" : `${tokenBalance} kUSD`}</span>:<ClipLoader
              color="#ffff"
              size={20}
            /> }
              
            </button>


        <div>
          {!account ? <button className=" custom_btn" onClick={ onConnectWallet } >
              {!account ? <span>Connect Wallet</span> : `${address.substring(0, 12)}..`}
            </button> : <button className="custom_btn"  onClick={()=> {setpopoverOpen(true)
           setAnchorEl(undefined) } }  >
              {!account ? <span>Connect Wallet</span> : `${address.substring(0, 12)}..`}
            </button>}
          
        
          
 <Popover
 open={popoverOpen}
 anchorEl={anchorEl}
 anchorOrigin={{
  vertical: 'top',
  horizontal: 'right',
}}
transformOrigin={{
  vertical: 'top',
  horizontal: 'left',
}}
onClose={()=>setpopoverOpen(false)}
onRequestClose={()=>setpopoverOpen(false)}

>
 <Typography sx={{ p: 0 }}><button className=" custom_btn popbtn" style={{border:"none",marginRight:"0"}} onClick={()=>{ onDisconnectWallet()
 setpopoverOpen(false)
}}
 >Disconnect</button></Typography>
 <Typography sx={{ p: 0 }}><button className=" custom_btn popbtn" style={{border:"none",marginRight:"0"}} onClick={() => navigator.clipboard
 .writeText(address)
 .then((res) => alert("Address Copied"))}>Copy Address</button></Typography>
</Popover>

        </div>
      

            

          </div>
        </div>
        <Hamburger className="mobileviewcheck" size={20} toggled={isOpen} toggle={setOpen} />
      </div>
      {
        !account ? (
          <button className="mobileviewconnect" onClick={onConnectWallet} >{!account ? <span>Connect Wallet</span> : "Disconnect"}</button>

        ) : (
          <button className=" mobileviewconnect" style={{minWidth:"105px"}} onClick={getToken} >{!Loading?<span>{tokenBalance == '' ? "Get Token" : `${tokenBalance} kUSD`}</span>:<ClipLoader
          color="#ffff"
          size={20}
        /> }
          </button>
        )
      }

      <div className={`${isOpen ? "menubar" : "unactivemenu"}`}>
        <div className={`mobilemenu`}>
          <h3 onClick={() => navigator.clipboard
            .writeText(address)
            .then((res) => alert("Address Copied"))} ><img src='img/walletimg.png' />{address == "" ? "Wallet" : address}</h3>
          <div className="mobile_tabs" onClick={() => { sidebarmenu('trade') }}>Trade</div>
          <hr />
          <div className="mobile_tabs" /*onClick={() => { setTradeOrStake('stake') }}*/ >Stake <span className='comingsoonmobileview'>coming soon </span></div>
          <hr />
          <div className="mobile_tabs" ><a href='https://payper-finance.gitbook.io/zenith-1/' style={{ color: "white", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Docs</a></div>
          <hr />

          <div className="mobile_tabs" onClick={() => { sidebarmenu('leaderboard') }}>Leaderboard</div>
          <hr />


          <p className=" mobile_tabs" onClick={!account ? onConnectWallet : onDisconnectWallet} >{!account ? <span>Connect Wallet</span> : "Disconnect"}</p>
          <p style={{marginTop:"15px",borderRadius:"5px" ,marginRight:"10px",maxHeight:"30px",border:"none"}} onClick={toggleTheme}>{Theme=="Light"?<>Nightmode</>:<>Lightmode</>}</p>

        </div>
      </div>
        
      <Sidebar coinSelect={coinSelect} stake={tradeOrStake} setCoinSelect={setCoinSelect} />
      <div className="main-section">

        {
          tradeOrStake === 'trade' ? <Trade coinSelect={coinSelect}  setCoinSelect={setCoinSelect} /> : tradeOrStake == "stake" ? <Stake /> : (
            <LeaderBoard />
          )
        }
      </div>

    </div>
    </>
  )
}

export default Main



