import React, { useState, useEffect, useContext } from 'react'
import TradeChart from './TradeChart'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {  Slider } from '@mui/material';
import { openPosition} from '../utils/tezos'
import { getAccount } from '../utils/wallet';
import axios from 'axios';
import "../style/tradeModel.css"
import SnackbarUtils from '../utils/SnackbarUtils';
import { ScaleLoader } from 'react-spinners'
import Position from './Position';
import PositionTable from './PositionTable';
import Snackbar from './Snackbar'
import UserContext from "../ContextProvider.js";
import { PRECISION,CONTRACT_ADDRESS } from '../utils/config';


const style = {
	position: 'absolute',
	background: " #141724",
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	p: 4,
	'& > :not(style)': { m: 1, width: '25ch' },
};

const Trade = (props) => {
const { setCPosiitonUpdated,CPosiitonUpdated,setMarketPrice } = useContext(UserContext)
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const { coinSelect, setCoinSelect } = props
	const [rangeValue, setRangeValue] = useState(1)
	const [isPosition, setIsPosition] = useState("")
	const [baseValue, setBaseValue] = useState();
	const [baseXrange, setbaseXrange] = useState(0);
	const [liveposition, setliveposition] = useState({});
	const [isTxn, setIsTxn] = useState(false);
	const [currentPosition, setCurrentPosition] = useState(false)
	const [graphValues, setGraphValues] = useState({
		marketprice: 0,
		indexprice: 0,
		rate: 0,
		longfundingrate: 0,
		shortfundingrate: 0
	})
	const [show, setShow] = useState(false)
	const [Vmm, setVmm] = useState(0)
	const [priceImpact,setPriceImpact] = useState(0)
	const [snackbarshow,setSnackbarshow] = useState(false)
	const [type, setType] = useState(
		{
		  type: "",
		  message: "",
		  transaction:""
		}
	  )
	

	const getHistory = async () => {
		const address = await getAccount()
		
			const history = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/${CONTRACT_ADDRESS}/storage`)
			let date =  Date.parse(history.data.upcoming_funding_time)-Date.now()
			var minutes = Math.floor((date % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((date % (1000 * 60)) / 1000);
			
			if(seconds <0){
				minutes ="00";
				seconds ="00";
			}
			else{
				if(minutes<10){
					minutes = `0${minutes}`
				}
				if(seconds<10){
					seconds = `0${seconds}`
				}
			}
				
			let Vmmdata = {
				invariant : history.data.vmm.invariant/PRECISION,
				vUSD_amount : history.data.vmm.vUSD_amount/PRECISION,
				token_amount: history.data.vmm.token_amount/PRECISION
			}
			setVmm(Vmmdata)
			setMarketPrice((parseFloat(history.data.current_mark_price) / PRECISION).toFixed(4))
			setGraphValues({
				marketprice: (parseFloat(history.data.current_mark_price) / PRECISION).toFixed(4),
				indexprice: (parseFloat(history.data.current_index_price) / PRECISION).toFixed(4),
				fundingTime: `${minutes}:${seconds}`,
				rate: 0,
				longfundingrate: (history.data.long_funding_rate),
				shortfundingrate: (history.data.short_funding_rate)
			})
			var positions = history.data.positions;

			if (address in positions) {
				
					setCPosiitonUpdated(true)
				
				setCurrentPosition(true)
				setliveposition(positions[address])
			}
			else {
					setCPosiitonUpdated(false)
				setCurrentPosition(false)
				setliveposition({})
			}


	

	}




	useEffect(() => {
		if (graphValues.marketprice == 0) {
			getHistory()
		}
		setInterval(getHistory, 1000)
	}, []);

	useEffect(()=>{
		setbaseXrange(baseValue*rangeValue)
		if(isPosition=="long"){

			setOpenlongpriceImpact()
		}
		else{
			setOpenshortpriceImpact()
		}
	},[baseValue,rangeValue,baseXrange])




	const funOpenPosition = async (baseValue, rangeValue, direction) => {
		if(baseValue==0){
			setType(
				{
				  type: "failed",
				  message: "Amount should be greater than 0!",
				}
			  )
			  setSnackbarshow(true)
		}

		try {
			setIsTxn(true)
			await openPosition(baseValue, rangeValue, direction).then(res => {
				setIsPosition(false)
				setIsTxn(false)
				if(res==undefined){
                    setType(
                        {
                          type: "Failed",
                          message: "Transaction Aborted !",
                        }
                      )
                      setSnackbarshow(true)
                }else{
                    setType(
                        {
                          type: "success",
                          message: "Transaction Successful!",
                          transaction:res
                        }
                      )
                      setSnackbarshow(true)
					  setCPosiitonUpdated(true)
                }
			})

		}
		catch (err) {
			console.log(err)
			setIsPosition(false)
			setShow(false)
			setIsTxn(false)
			setType(
				{
				  type: "Failed",
				  message: "Transaction Failed !,",
				}
			  )
			  setSnackbarshow(true)

		}

	}


	

	const setOpenlongpriceImpact = () =>{

		let perUsd = Vmm.vUSD_amount/Vmm.token_amount
		let VmmUsd = Vmm.vUSD_amount+(baseXrange);
		let x = (Vmm.invariant/VmmUsd)-Vmm.token_amount
		let actualToken = (baseXrange)/Math.abs(x)
		let priceimpact = ((actualToken-perUsd)*100)/perUsd
		setPriceImpact(priceimpact)
	}
	const setOpenshortpriceImpact = () =>{
		let pertoken = Vmm.token_amount/Vmm.vUSD_amount
		let Vmmtoken = Vmm.vUSD_amount-(baseXrange);
		let x = (Vmm.invariant/Vmmtoken)-Vmm.token_amount
		let actualToken = Math.abs(x)/(baseXrange)
		let priceimpact = ((actualToken-pertoken)*100)/pertoken
		setPriceImpact(priceimpact)
	}




	return (
		<div>
			<Snackbar show={snackbarshow} setshow={setSnackbarshow} type={type} />
			<link rel="stylesheet" href="/styles/trade.css" />
			<div className="coin-name d-flex m-3">
				<div className="icon fs-2"><img style={{ width: "35px", height: "35px" }} src={`img/${coinSelect === 'tezos' ? 'tz' : coinSelect === 'btc' ? 'btc' : 'eth'}.svg`} alt="" /></div>
				<div className="coin-name d-flex flex-column ms-2">
					<h4 className='mb-0 text-start'>{coinSelect === 'tezos' ? 'XTZ-PREP' : coinSelect === 'btc' ? 'BTC-PREP' : 'ETH-PREP'}</h4>
					<h6 className='text-start'>{coinSelect === 'tezos' ? 'Tezos' : coinSelect === 'btc' ? 'Bitcoin' : 'Ethereum'}</h6>
				</div>

			</div>
			<div className="trade-graph-enclosure">
				<div className="graph-infos d-flex text-start">
					<div className="graph-info">
						<div className="info-title">Market Price</div>
						<div className="info-values " style={{ color: "#1ECC89" }}>{graphValues.marketprice} kUSD</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Index Price</div>
						<div className="info-values">{graphValues.indexprice} kUSD</div>
					</div>

					<div className="graph-info">
						<div className="info-title">Next funding</div>
						<div className="info-values"> {graphValues.fundingTime}</div>
					</div>
					<div className="graph-info">
						<div className="info-title"> Long funding rate</div>

						<div className="info-values " style={{ color:  `${graphValues.longfundingrate.direction =="POSITIVE" && graphValues.longfundingrate.value/PRECISION !=0 ?"#1ECC89":(graphValues.longfundingrate.direction =="NEGATIVE" && graphValues.longfundingrate.value/PRECISION !=0)?"#E01B3C":"white"}` }}> {(graphValues.longfundingrate.value/PRECISION).toFixed(3)}% </div>
					</div>
					<div className="graph-info">
						<div className="info-title"> Short funding rate</div>
						<div className="info-values" style={{ color: `${graphValues.shortfundingrate.direction =="POSITIVE" ?"#1ECC89": graphValues.shortfundingrate.direction =="NEGATIVE" && graphValues.longfundingrate.value/PRECISION !=0?"#E01B3C":"white"}` }}>{(graphValues.shortfundingrate.value/PRECISION).toFixed(3)}%</div>
					</div>
					{/* <div className="graph-info">
						<div className="info-title"> Expected long/short rate</div>
						<div className="info-values" style={{ color: "#E01B3C" }}>{graphValues.shortfundingrate}%</div>
					</div> */}
				</div>
			</div>

			<div className="long-short-enclosure">
				{
					!currentPosition ? (
						<>
						<h5>You can go Long or Short </h5>
						<div className="long-short-btns mt-4">
							<button className={`longbtn  mx-3 btn  `} style={{ color: "white", fontWeight: "bold", background: "#1ECC89" }} onClick={() => {
								setIsPosition("long")
								handleOpen()
							}} >Long</button>
							<button className={`shortbtn mx-3 btn `} style={{ color: "white", fontWeight: "bold", background: "#E01B3C" }} onClick={() => {
								setIsPosition("short")
								handleOpen()
								SnackbarUtils.info("Works");
							}} >Short</button>
						</div>
						</>
					) : (<h5>You have taken a position. Now you can change the margin </h5>)
				}

			</div>

			<div className='trade_chart'>
				<TradeChart />

			</div>

			{
				!currentPosition ? "" : (
					<Position positiondetail={liveposition} graph={graphValues} gethistory={getHistory} Vmm={Vmm} />
				)
			}








			<div className="history-enclosure text-white">


				<div style={{ display: "flex" }}>
					<h5 className={`tradedetailsbtn text-start`} style={{ color: "whitesmoke" }}>Position History</h5>
				</div>



				<PositionTable />

			</div>


			{isPosition == "long" && !currentPosition ? <Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style} className="tradebox_main" component="form" noValidate autoComplete="off">
					<Typography id="modal-modal-title" variant="h4" component="h2" style={{ position: "relative", left: '-10px', width: '100%', fontFamily: "'Inter', sans-serif", fontWeight: "800", fontSize: "25px" }}>
						Long
					</Typography>
					<div className='tradebox_amount'>
						<span className='tradebox_inputicon'><img style={{ padding: "0 6px", marginTop: "-4px", height: "32px" }} src="img/kusd.png" alt="" />kUSD</span>
						<input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" onChange={(event) => setBaseValue(event.target.value,setOpenlongpriceImpact())} />
					</div>

					<div className='tradebox_leverage'>
						<h6>Leverage</h6>
						<Slider
							aria-label="Temperature"
							defaultValue={1}
							className="tradebox_levslider"
							value={rangeValue}
							onChange={(event) =>setRangeValue(event.target.value)}
							color={'primary'}
							sx={{ color: `grey` }}
							step={1}
							marks
							min={1}
							max={3}
							style={{ width: '90%' }} /> <span style={{ position: "absolute", bottom: "6px", fontSize: "14px", right: "25px", fontWeight: "bold" }}>{rangeValue}x</span> <br />
					</div>
					<p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600",paddingTop: "20px",marginLeft:"-0px" }}>You are buying in the long</p>
					<table className='tradebox_table1' style={{ width: "100%" }}>
						<tbody>
							<tr style={{ width: "100%" }}>
								<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Position size</td>
								<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseXrange == 0 ? ((baseValue == null) ? 0 : (baseValue / graphValues.marketprice).toFixed(2)) : ((baseXrange / graphValues.marketprice).toFixed(4))} XTZ <img src="img/tz.svg" /></td>
							</tr>
							<tr style={{ width: "100%" }}>
								<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Entry price</td>
								<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{graphValues.marketprice} kUSD <img style={{ width: "20px" }} src="img/kusd.png" /></td>
							</tr>
						</tbody>
					</table>
					<hr style={{ position: "relative", left: "-10px", width: "100%", top: "20px" }} />


					<table className='tradebox_table1' style={{ width: "100%" }}>
						<tbody>
							<tr style={{ width: "100%", }}>
								<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Amount</td>
								<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue} kUSD</td>
							</tr>
							<tr style={{ width: "100%" }}>
								<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Trading fee</td>
								<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{(baseValue/100)*2} kUSD</td>
							</tr>
							<tr style={{ width: "100%" }}>
								<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
								<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue ==0?0:priceImpact.toFixed(2)}%</td>
							</tr>
							<tr style={{ width: "100%" }}>
								<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
								<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
							</tr>
						</tbody>
					</table>
					{isTxn ? <span style={{ width: "100% !important", position: "relative", left: "35%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span> : <Button className="tradebox_button" style={{ align: 'center', width: '100%', borderRadius: "8px", marginTop: "20px", fontWeight: "600", backgroundColor: "#1ECC89", fontFamily: "'Inter', sans-serif" }} variant="contained" color="success"
						onClick={() => funOpenPosition(baseValue, rangeValue, 1)}>Long</Button>}


				</Box>
			</Modal> : isPosition == "short" && !currentPosition ? <Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style} className="tradebox_main" component="form" noValidate autoComplete="off">
					<Typography id="modal-modal-title" variant="h4" component="h2" style={{ position: "relative", left: '-10px', width: '100%', fontFamily: "'Inter', sans-serif", fontWeight: "800", fontSize: "25px" }}>
						Short
					</Typography>
					<div className='tradebox_amount'>
						<span className='tradebox_inputicon'><img style={{ padding: "0 6px", marginTop: "-4px", height: "32px" }} src="img/kusd.png" alt="" />kUSD</span>
						<input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" step="0.01" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" focused onChange={(event) => setBaseValue(event.target.value,setOpenlongpriceImpact())} />
					</div>
					<div className='tradebox_leverage'>
						<h6>Leverage</h6>
						<Slider
							aria-label="Temperature"
							defaultValue={1}
							className="tradebox_levslider"
							value={rangeValue}
							onChange={(event) =>setRangeValue(event.target.value)}
							color={'primary'}
							sx={{ color: `grey` }}
							step={1}
							marks
							min={1}
							max={3}
							style={{ width: '90%' }} /> <span style={{ position: "absolute", bottom: "6px", fontSize: "14px", right: "25px", fontWeight: "bold" }}>{rangeValue}x</span> <br />
					</div>
					<p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600",paddingTop: "20px",marginLeft:"-0px" }}>You are buying in the long</p>
					<table className='tradebox_table1' style={{ width: "100%" }}>
						<tbody>

							<tr style={{ width: "100%" }}>
								<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Position size</td>
								<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseXrange == 0 ? ((baseValue == null) ? 0 : (baseValue / graphValues.marketprice).toFixed(2)) : ((baseXrange / graphValues.marketprice).toFixed(4))} XTZ <img src="img/tz.svg" /></td>
							</tr>
							<tr style={{ width: "100%" }}>
								<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Entry price</td>
								<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{graphValues.marketprice} kUSD <img style={{ width: "20px" }} src="img/kusd.png" /></td>
							</tr>
						</tbody>

					</table>
					<hr style={{ position: "relative", left: "-10px", width: "100%", top: "20px" }} />


					<table className='tradebox_table1' style={{ width: "100%" }}>
						<tr style={{ width: "100%", }}>
							<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Amount</td>
							<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue} kUSD</td>
						</tr>
						<tr style={{ width: "100%" }}>
								<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Trading fee</td>
								<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{(baseValue/100)*2} kUSD</td>
							</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
							<td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue ==0?0:priceImpact.toFixed(2)}%</td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
						</tr>
					</table>
					{isTxn ? <span style={{ width: "100% !important", position: "relative", left: "35%" }}><ScaleLoader color='#E01B3C' width={7} margin={6} /> </span> : <Button className="tradebox_button" style={{ align: 'center', width: '100%', borderRadius: "8px", marginTop: "20px", fontWeight: "600", backgroundColor: "#E01B3C", fontFamily: "'Inter', sans-serif" }} variant="contained" 
					onClick={() => funOpenPosition(baseValue, rangeValue, 2)}>SHORT</Button>}
				</Box>
			</Modal> : ""}
		</div>
	)
}

export default Trade
