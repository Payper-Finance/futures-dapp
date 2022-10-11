import React, { useEffect, useState } from 'react'
import '../style/sidebar.css'
import {DropdownButton,Dropdown} from 'react-bootstrap'
import axios from 'axios'
import { PRECISION } from '../utils/config';

const Sidebar = (props) => {
    const {coinSelect, setCoinSelect,stake} = props
    const [markprice, setMarkPrice] = useState();
    useEffect(()=>{
      axios.get("https://api.ghostnet.tzkt.io/v1/contracts/KT1KtEXykBu7qXDFeBjBsk5Vq4oy4sfRZNNx/storage/"
      ).then(res =>{setMarkPrice(res.data.current_mark_price)})
    })
  return (
    <>
    <div style={{height:`${stake=='stake'?'100%':""}`}} className='sidebar '>
      <div className="coins">
        <div className={`${coinSelect === 'tezos'? 'sidebar-sel': '' } coin my-3 d-flex text-start`} onClick={()=>{setCoinSelect('tezos')}} >
            <div className='mx-2'><img src="/img/tz.svg" style={{width:'20px'}} alt="" /></div>
            <div>Tezos <br />XTZ</div>
            <div className='me-2 ms-auto text-end'>{(markprice/PRECISION).toFixed(2)} vUSD</div>
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
    
    <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-item-button">
      <img style={{marginRight:"10px" ,position:"relative", bottom:"3px",marginBottom:"5px",width:"30px"}} src="img/tz.svg" /><span style={{marginRight:"10px" ,position:"relative", bottom:"3px",marginBottom:"5px",fontSize:"18px",fontWeight:"bold"}}>{coinSelect.toUpperCase()}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="#/action-1">Tezos</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Bitcoin</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Ethereum</Dropdown.Item>
      </Dropdown.Menu>
      </Dropdown>
    </div>
  </> 
  )
}

export default Sidebar
