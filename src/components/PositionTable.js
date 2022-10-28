import React, { useEffect, useState,useContext } from 'react'
import { Table } from 'react-bootstrap';
import { getAccount } from '../utils/wallet';
import axios from 'axios'
import qs from "qs"
import UserContext from '../ContextProvider.js';
export default function PositionTable() {
const { CPosiitonUpdated ,kusdTokenBalance,Theme} = useContext(UserContext)

    const [getData,setGetData] = useState([])
    const fetchdata =async()=>{
        const address = await getAccount()
        const positionhistory = await axios.post("https://zenith-api-l8hhy.ondigitalocean.app/positionshistory/", qs.stringify({
			address: address
		}),
			{
				header: {
					"Content-Type": "text/plain"
				}
			}
		).then(res => {
			return res.data
		})
        if(positionhistory){
            setGetData(positionhistory)
            positionhistory.reverse()
        }else{
            setGetData([])
        }
    }
    useEffect(()=>{
     fetchdata()
    },[CPosiitonUpdated,kusdTokenBalance])
  return (
    
    <Table className='trading_details' borderless="false" responsive>
    <thead>
        <tr>
            <th style={Theme=="Light"?{color:"aliceblue"}:{}} >TIME</th>
            <th style={Theme=="Light"?{color:"aliceblue"}:{}}>DIRECTION</th>
            <th style={Theme=="Light"?{color:"aliceblue"}:{}}>COLLATERAL</th>
            <th style={Theme=="Light"?{color:"aliceblue"}:{}}>POSITION SIZE</th>
            <th style={Theme=="Light"?{color:"aliceblue"}:{}}>REALIZE PNL</th>
        </tr>
    </thead>
    <tbody >
        
            
        
        {
            getData.length != 0 ? (
                getData.map((item, index) => {
                    
                    const date = new Date(item.time);
                    return(
                        <tr key={index}>
                        <td style={Theme=="Light"?{color:"aliceblue"}:{}}>{date.toLocaleString() } </td>
                        {item.position ==1?(<td style={{color:"#1eec89",fontWeight:"bold"}} >Long {item.liquidate == undefined ||!item.liquidate?"": <span style={{fontSize:"0.6rem" , color:"white",background:"#59219d",padding:"3px",borderRadius:"5px"}}>liquidated</span>}</td>):(
                            <td style={{color:"#e01b3c",fontWeight:"bold"}}>Short {item.liquidate == undefined ||!item.liquidate?"": <span style={{fontSize:"0.6rem" , color:"white",background:"#59219d",padding:"3px",borderRadius:"5px"}}>liquidated</span>}</td>
                        )}
                        <td style={Theme=="Light"?{color:"aliceblue"}:{}}> {item.collateral_amount}</td>
                        <td style={Theme=="Light"?{color:"aliceblue"}:{}}>{item.vUSD_amount} </td>
                      {item.realizedpnl>0?(
                            <td style={{color:"#1eec89",fontWeight:"bold"}}>{(parseFloat(item.realizedpnl)).toFixed(3)}</td>
                        ):(
                            <td style={{color:"#e01b3c",fontWeight:"bold"}}>{(parseFloat(item.realizedpnl)).toFixed(3)}</td>
                        )}

                    </tr>
                    )
                
                })
            ) : (<tr style ={{display:"flex",width:"100%", justifyContent:"center",alignItems:"center"}}><td><img style ={{height:"100px",width:"100px"}} src="img/nodata.png" /></td></tr>)


        }
    </tbody>
</Table>
  )
}
