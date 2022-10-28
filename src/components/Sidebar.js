import React, { useEffect, useState,useContext } from 'react'
import '../style/sidebar.css'
import {DropdownButton,Dropdown} from 'react-bootstrap'
import axios from 'axios'
import { PRECISION,CONTRACT_ADDRESS} from '../utils/config';
import UserContext from "../ContextProvider.js";

const Sidebar = (props) => {
  const {maketPrice,Theme} = useContext(UserContext)
  const {coinSelect, setCoinSelect,stake} = props
    const lightstyle = {
      background:"#B77DFF",
      color:"aliceblue"
    }
    useEffect(()=>{

    },[maketPrice])
 
  return (
    <>
    <div style={Theme=="Light"?lightstyle:{}} className='sidebar '>
      <div className="coins">
        <div className={`${coinSelect === 'tezos'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} onClick={()=>{setCoinSelect('tezos')}} >
            <div className='mx-2'><img src="/img/tz.svg" style={{width:'20px'}} alt="" /></div>
            <div style={{minWidth:'80px'}}>Tezos <br />XTZ</div>
            <div  className='me-2 ms-auto text-end'>{maketPrice} kUSD</div>
        </div>
        <div disabled className={`${coinSelect === 'btc'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} /*onClick={()=>{setCoinSelect('btc')}}*/ >
            <div className='mx-2'><img src="img/btc.svg" style={{width:'20px'}} alt="" /></div>
            <div style={{minWidth:'80px'}}>Bitcoin <br />BTC</div>
            <div className='me-2 ms-auto text-end'>Coming soon</div>
        </div>
        <div disabled className={`${coinSelect === 'eth'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} /* onClick={()=>{setCoinSelect('eth')}}*/ >
            <div className='mx-2'><img src="img/eth.svg" style={{width:'20px'}} alt="" /></div>
            <div style={{minWidth:'80px'}}>Ethereum<br />ETH</div>
            <div className='me-2 ms-auto text-end'>Coming soon</div>
        </div>
      </div>
    </div>
    <div style={{display:`${stake =='stake'?"none":""}`}} className="Dropdown">
      <span style={{position:"absolute", zIndex:"1", right:"10%",marginTop:"6px"}}><img src ="img/Star 1.png" /> </span>
    
    <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-item-button">
      <img style={{marginRight:"10px" ,position:"relative", bottom:"3px",marginBottom:"5px",width:"30px"}} src="img/tz.svg" /><span style={{marginRight:"10px" ,position:"relative", bottom:"3px",marginBottom:"5px",fontSize:"18px",fontWeight:"bold"}}>{coinSelect.toUpperCase()}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item >Tezos</Dropdown.Item>
        <Dropdown.Item >Bitcoin <span className='comingsoondropdown'>coming soon </span> </Dropdown.Item>
        <Dropdown.Item >Ethereum <span className='comingsoondropdown'>coming soon </span></Dropdown.Item>
      </Dropdown.Menu>
      </Dropdown>
    </div>
  </> 
  )
}

export default Sidebar
