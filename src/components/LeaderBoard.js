import React, { useState, useEffect, useLayoutEffect } from 'react'
import "../style/leaderbordcss.css"
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import axios from 'axios'





export default function LeaderBoard() {

  const [searchaddress,setsearchAddress] = useState("")
  const [isEmpty,setIsEmpty] = useState(false)
  const [array,setArray] = useState([])
  const [size,setSize] = useState(0);
  // const arrsize =Math.trunc(array.length / 10 )+ 1;
  const [page,setpage] = useState(1)
  const [startrange, setStartRange] = useState(0)
  const [range, setRange] = useState()

  const getdata =async()=>{
    await axios.get("https://zenith-api-l8hhy.ondigitalocean.app/leaderboard/").then(result=>{
     setArray(result.data.reverse())
   })
   setSize(Math.trunc(array.length/ 10)+ 1);
   setRange(array.length>10?10:array.length)
   setIsEmpty(true)
 }

  useLayoutEffect(()=>{
    getdata()

  },[isEmpty])


  const onchange=(e)=>{
    var newvalue =searchaddress.concat(e)
    if(e==""){

      axios.get("https://zenith-api-l8hhy.ondigitalocean.app/leaderboard/").then(result=>{
        setArray(result.data.reverse())
      })
    }
    else{
  
      var newArray = array.filter(function (el)
      {
        return el.Address.includes(newvalue)
               
      })

        setArray(newArray)
      
    }
   

  }
  const prevvalues = () => {
    if (page != 1) {
      if(range == array.length){
        setpage(page-1);
        setStartRange(startrange-10) 
        setRange(startrange)
       
      }
      else{
        setpage(page-1);
        setStartRange(startrange-10) 
        setRange(range - 10);
      }

    }

  }
  const nextvalues = () => {
    if (page <= size) {
      setpage(page+1)
      if(array.length-range>10){
        setStartRange(range)
        setRange(range + 10);
      }
      else{
        setStartRange(range)
        setRange(array.length)
      }
    }
  }
  const startpage=()=>{
    setpage(1);
    setStartRange(0);
    setRange(array.length>10?10:array.length)
  }
  const Lastpage=()=>{
    setpage(size);
    setStartRange((size*10)-10);
    setRange(array.length)
    
  }
  return (
    <div className='LeaderboardMain'>
      <div className='Leaderboardcontainer'>
        <input  placeholder='Search..'  onChange={e=>onchange(e.target.value)}  />
        <h2>
          All Traders
        </h2>
        <div className='table_div'>
        <table>
          <thead>
          <tr>
            <th className='leaderboard_head'>Rank</th>
            <th className='leaderboard_head'>Address</th>
            <th className='leaderboard_head'>Liquidation</th>
            <th className='leaderboard_head'>Total Trades</th>
            <th className='leaderboard_head'>PnL</th>
          </tr>
          </thead>
          <tbody>
            {
              isEmpty?(
                
                  array.slice(startrange, range).map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className='leaderboard_td' >{index+1}</td>
                        <td className='leaderboard_td'>{item.Address}</td>
                        <td className='leaderboard_td'>{item.LiquidationCount== undefined?0:item.LiquidationCount}</td>
                        <td className='leaderboard_td'>{item.CompletedPosition.length}</td>
                        <td className='leaderboard_td' style={{color:`${item.Totalpnl<0?"#e01b3c":"#198754"}`,fontWeight:"bold"}}>${parseFloat(item.Totalpnl).toFixed(2)}</td>
                      </tr>
                    )
                  })
                
              ):(<tr></tr>)
            }
          
          </tbody>
        </table>

        </div>
        <Pagination>
          <Pagination.First onClick={startpage}/>
          <Pagination.Prev onClick={page==1?null:prevvalues }/>

          <Pagination.Item className='middlepagination' >{page} of {size}</Pagination.Item>

          <Pagination.Next onClick={page==size?null:nextvalues} />
          <Pagination.Last onClick={Lastpage} />
        </Pagination>



      </div>
    </div>
  )
}
