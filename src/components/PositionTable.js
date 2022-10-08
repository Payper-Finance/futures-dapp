import React, { useEffect, useState,useContext } from 'react'
import { Table } from 'react-bootstrap';
import { getAccount } from '../utils/wallet';
import axios from 'axios'
import qs from "qs"
import UserContext from '../ContextProvider.js';
export default function PositionTable() {
const { CPosiitonUpdated } = useContext(UserContext)

    const [getData,setGetData] = useState([])
    const fetchdata =async()=>{
        const address = await getAccount()
        const positionhistory = await axios.post("http://localhost:8000/positionshistory/", qs.stringify({
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
        setInterval(fetchdata(),5000)
    },[CPosiitonUpdated])
  return (
    
    <Table className='trading_details' borderless="false" responsive>
    <thead>
        <tr>
            <th >TIME</th>
            <th >DIRECTION</th>
            <th >COLLATERAL</th>
            <th>POSITION SIZE</th>
            <th >REALIZE PNL</th>
        </tr>
    </thead>
    <tbody >
        
            
        
        {
            getData.length != 0 ? (
                getData.map((item, index) => {
                    
                    const date = new Date(item.time);
                    return(
                        <tr key={index}>
                        <td>{date.toLocaleString() } </td>
                        {item.position ==1?(<td style={{color:"#1ecc89"}}>Long</td>):(
                            <td style={{color:"#e01b3c"}}>Short</td>
                        )}
                        <td> {item.collateral_amount}</td>
                        <td>{item.vUSD_amount} </td>
                      {item.realizedpnl>0?(
                            <td style={{color:"#1ecc89"}}>{(parseFloat(item.realizedpnl)).toFixed(3)}</td>
                        ):(
                            <td style={{color:"#e01b3c"}}>{(parseFloat(item.realizedpnl)).toFixed(3)}</td>
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
