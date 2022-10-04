import React, { useEffect, useState } from 'react'
import '../style/sidebar.css'
import {DropdownButton,Dropdown} from 'react-bootstrap'
import axios from 'axios'

const Sidebar = (props) => {
    const {coinSelect, setCoinSelect,stake} = props
    const [markprice, setMarkPrice] = useState();
    useEffect(()=>{
      axios.get("https://api.ghostnet.tzkt.io/v1/contracts/KT1WbA2H87o2RT9sTT4UaEgUAUgq6ZQhynbP/storage/"
      ).then(res =>{setMarkPrice(res.data.current_mark_price)})
    })
  return (
    <>
    <div style={{height:`${stake=='stake'?'100%':""}`}} className='sidebar '>
      <div className="coins">
        <div className={`${coinSelect === 'tezos'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} onClick={()=>{setCoinSelect('tezos')}} >
            <div className='mx-2'><img src="/img/tz.svg" style={{width:'20px'}} alt="" /></div>
            <div>Tezos <br />XTZ</div>
            <div className='me-2 ms-auto text-end'>{(markprice/1000000).toFixed(2)} vUSD</div>
        </div>
        <div disabled className={`${coinSelect === 'btc'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} /*onClick={()=>{setCoinSelect('btc')}}*/ >
            <div className='mx-2'><img src="img/btc.svg" style={{width:'20px'}} alt="" /></div>
            <div>Bitcoin <br />BTC</div>
            <div className='me-2 ms-auto text-end'>Coming soon</div>
        </div>
        <div disabled className={`${coinSelect === 'eth'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} /* onClick={()=>{setCoinSelect('eth')}}*/ >
            <div className='mx-2'><img src="img/eth.svg" style={{width:'20px'}} alt="" /></div>
            <div>Ethereum<br />ETH</div>
            <div className='me-2 ms-auto text-end'>Coming soon</div>
        </div>
      </div>
    </div>
    <div style={{display:`${stake =='stake'?"none":""}`}} className="Dropdown">
      <span style={{position:"absolute", zIndex:"1", right:"10%",marginTop:"6px"}}><img src ="img/Star 1.png" /> </span>
    <DropdownButton id="dropdown-item-button" title={`${coinSelect}`}>
      <Dropdown.Item onClick={()=>setCoinSelect("btc")}>Bitcoin</Dropdown.Item>
      <Dropdown.Item  disabled>Tezos</Dropdown.Item>
      <Dropdown.Item  disabled>Ethereum</Dropdown.Item>
    </DropdownButton>
    </div>
  </> 
  )
}

export default Sidebar
