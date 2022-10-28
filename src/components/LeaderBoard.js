import React, { useState, useEffect, useLayoutEffect,useContext} from 'react'
import "../style/leaderbordcss.css"
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import UserContext from "../ContextProvider.js";



export default function LeaderBoard() {
  const {Theme} = useContext(UserContext)

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
    let data = result.data.reverse();
    for(let i =0;i<data.length;i++){
      data[i].rank =i;
    }
     setArray(data)
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
        let data = result.data.reverse();
    for(let i =0;i<data.length;i++){
      data[i].rank =i;
    }
     setArray(data)
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
    <>
    {
      Theme=="Light"?( <style>{`
      .page-item a{
  
        background: #ac69ff ;
        color: whitesmoke !important;
        border: none !important;
        font-size: 13px;
    
      }
      .page-item:first-child .page-link{
        border-top-left-radius: 0 !important;
      }
      .page-item:last-child .page-link {
        border-top-right-radius: 0 !important;
      }
    `}</style>):( <style>{`
    .page-item a{

      background: #59219d ;
      color: whitesmoke !important;
      border: none !important;
      font-size: 13px;
  
    }
    .page-item:first-child .page-link{
      border-top-left-radius: 0 !important;
    }
    .page-item:last-child .page-link {
      border-top-right-radius:0 !important;
    }
  `}</style>)
    }
   
    <div style={Theme=="Light"?{background:"aliceblue"}:{} } className='LeaderboardMain'>
      <div className='Leaderboardcontainer'>
        <input style={Theme=="Light"?{background:"aliceblue",color:'black',border:"1px solid black"}:{} }  placeholder='Search..'  onChange={e=>onchange(e.target.value)}  />
        <h2 style={Theme=="Light"?{background:"#ac69ff"}:{} }>
          All Traders
        </h2>
        <div className='table_div'>
          {
            isEmpty?(
<table style={Theme=="Light"?{background:"#ac69ff",color:'black'}:{} }>
          <thead style={Theme=="Light"?{background:"#c99eff", color:"black"}:{}} >
          <tr >
            <th style={Theme=="Light"?{color:"black"}:{}} className='leaderboard_head'>Rank</th>
            <th style={Theme=="Light"?{ color:"black"}:{}} className='leaderboard_head'>Address</th>
            <th style={Theme=="Light"?{ color:"black"}:{}} className='leaderboard_head'>Liquidation</th>
            <th style={Theme=="Light"?{ color:"black"}:{}} className='leaderboard_head'>Total Trades</th>
            <th style={Theme=="Light"?{color:"black"}:{}} className='leaderboard_head'>PnL</th>
          </tr>
          </thead>
          <tbody style={Theme=="Light"?{background:"aliceblue", color:"black"}:{}} >
            
          
            {
              isEmpty?(
                
                  array.slice(startrange, range).map((item, index) => {
                    return (
                      <tr style={Theme=="Light"?{background:"#c99eff", color:"aliceblue"}:{}}  key={index}>
                        <td style={Theme=="Light"?{background:"#c99eff", color:"aliceblue"}:{}} className='leaderboard_td' >{item.rank+1}</td>
                        <td style={Theme=="Light"?{background:"#c99eff", color:"aliceblue"}:{}} className='leaderboard_td'>{item.Address}</td>
                        <td style={Theme=="Light"?{background:"#c99eff", color:"aliceblue"}:{}} className='leaderboard_td'>{item.LiquidationCount== undefined?0:item.LiquidationCount}</td>
                        <td style={Theme=="Light"?{background:"#c99eff", color:"aliceblue"}:{}} className='leaderboard_td'>{item.CompletedPosition.length}</td>
                        <td  className='leaderboard_td' style={{color:`${item.Totalpnl<0?"#e01b3c":"#198754"}`,fontWeight:"bold"}}>${parseFloat(item.Totalpnl).toFixed(2)}</td>
                      </tr>
                    )
                  })
                
              ):(<tr><td style={{margin:"auto",display:"flex",justifyContent:"center",alignItem:"center",width:'100%'}}></td></tr>)
            }
          
          </tbody>
        </table>
            ):(
              <div style={{width:"100%",height:"250px",marginTop:'100px',display:"flex",justifyContent:"center",alignItem:"center"}}>
<ClipLoader color={Theme=="Light"?"black":"#ffff"} width={20} margin={0} />

                </div>
            )
          }
        

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
    </>
  )
}
