import React, { useState } from 'react'
import '../style/sidebar.css'

const Sidebar = (props) => {
    const {coinSelect, setCoinSelect} = props
  return (
    <div className='sidebar '>
      <div className='Logo'><img style={{width:"50px",height:"50px",marginRight:"10px"}} src="img/Logo.png" />Zenith</div>
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
  )
}

export default Sidebar
