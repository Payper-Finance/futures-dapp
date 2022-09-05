import React, { useState, useEffect } from 'react'
import "../style/leaderbordcss.css"
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";


const array1 = [
  {id:1,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :906501.99},
  {id:2,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :790805.00},
  {id:3,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:4,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :243486.20},
  {id:5,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :-290741.09},
  {id:6,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :-290741.09},
  {id:7,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :243486.20},
  {id:8,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :243486.20},
  {id:9,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:10,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:11,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:12,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:13,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:14,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:15,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :-290741.09},
  {id:16,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:17,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:18,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:19,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :-290741.09},
  {id:20,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:21,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:22,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:23,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :594775.39},
  {id:24,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :906501.99},
  {id:25,address: "Wallet--Address", liquid:"liquidation", trades: "trades",pnl :906501.99},
  
]


export default function LeaderBoard() {
  // const [searchaddress,setsearchAddress] = useState("")
  const [array,setArray] = useState(array1)
  const [size,setSize] = useState(0);
  const arrsize =Math.trunc(array.length / 10 )+ 1;
  const [page,setpage] = useState(1)
  const [startrange, setStartRange] = useState(0)
  const [range, setRange] = useState(array.length>10?10:array.length)
  useEffect(() => {
    setSize(arrsize);
  }, [])
  const onchange=(e)=>{
    console.log(typeof(e))
    if(e==""){
      setArray(array1)
    }
    var newArray = array1.filter(function (el)
{
  return el.address.includes(e)
         
})
setArray(newArray)
console.log(newArray)

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
        <input placeholder='Search..'  onChange={e=>onchange(e.target.value)}  />
        <h2>
          All Traders
        </h2>
        <div className='table_div'>
        <table>
          <thead>
          <tr>
            <th>Rank</th>
            <th>Address</th>
            <th>Liquidation</th>
            <th>Total Trades</th>
            <th>PnL</th>
          </tr>
          </thead>
          <tbody>
          {
            array.slice(startrange, range).map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.address}</td>
                  <td>{item.liquid}</td>
                  <td>{item.trades}</td>
                  <td style={{color:`${item.pnl<0?"#e01b3c":"#198754"}`,fontWeight:"bold"}}>${item.pnl}</td>
                </tr>
              )
            })
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
