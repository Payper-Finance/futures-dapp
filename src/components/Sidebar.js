import React, { useState } from 'react'
import '../style/sidebar.css'
import {DropdownButton,Dropdown} from 'react-bootstrap'

const Sidebar = (props) => {
    const {coinSelect, setCoinSelect,stake} = props
  return (
    <>
    <div style={{height:`${stake=='stake'?'100%':""}`}} className='sidebar '>
      <div className="coins">
        <div className={`${coinSelect === 'tezos'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} onClick={()=>{setCoinSelect('tezos')}} >
            <div className='mx-2'><img src="/img/tz.svg" style={{width:'20px'}} alt="" /></div>
            <div>Tezos <br />XTZ</div>
            <div className='me-2 ms-auto text-end'>1.87 vUSD</div>
        </div>
        <div className={`${coinSelect === 'btc'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} onClick={()=>{setCoinSelect('btc')}} >
            <div className='mx-2'><img src="img/btc.svg" style={{width:'20px'}} alt="" /></div>
            <div>Bitcoin <br />BTC</div>
            <div className='me-2 ms-auto text-end'>24022.63 vUSD</div>
        </div>
        <div className={`${coinSelect === 'eth'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} onClick={()=>{setCoinSelect('eth')}} >
            <div className='mx-2'><img src="img/eth.svg" style={{width:'20px'}} alt="" /></div>
            <div>Ethereum<br />ETH</div>
            <div className='me-2 ms-auto text-end'>1900.88 vUSD</div>
        </div>
      </div>
    </div>
    <div style={{display:`${stake =='stake'?"none":""}`}} className="Dropdown">
      <span style={{position:"absolute", zIndex:"1", right:"10%",marginTop:"6px"}}><img src ="img/Star 1.png" /> </span>
    <DropdownButton id="dropdown-item-button" title={`${coinSelect}`}>
      <Dropdown.Item onClick={()=>setCoinSelect("btc")}>Bitcoin</Dropdown.Item>
      <Dropdown.Item onClick={()=>setCoinSelect("tezos")} >Tezos</Dropdown.Item>
      <Dropdown.Item onClick={()=>setCoinSelect("tezos")}>Ethereum</Dropdown.Item>
    </DropdownButton>
    </div>
  </> 
  )
}

export default Sidebar
