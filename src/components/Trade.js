import React, { useState, useEffect } from 'react'
import TradeChart from './TradeChart'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Popover, Slider, Snackbar } from '@mui/material';
import { openLong, closeLong, openShort, closeShort } from '../utils/tezos'
import { getAccount } from '../utils/wallet';
import axios from 'axios';
import "../style/tradeModel.css"
import SnackbarUtils from '../utils/SnackbarUtils';
import { ScaleLoader } from 'react-spinners'
import { Table } from 'react-bootstrap';
import Position from './Position';
import Snackbar1 from './Snackbar';

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
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const [longOrShort, setLongOrShort] = useState('long')
	const { coinSelect, setCoinSelect } = props
	const [rangeValue, setRangeValue] = useState(1)
	const [isLong, setIsLong] = useState(false)
	const [baseValue, setBaseValue] = useState()
	const [longPositions, setLongPositions] = useState([]);
	const [shortPositions, setShortPositions] = useState([]);
	const [isTxn, setIsTxn] = useState(false);
	const [selectTable, setselectTable] = useState('position')
	const [currentPosition, setCurrentPosition] = useState(true)
	const [graphValues, setGraphValues] = useState({
		marketprice: 0,
		indexprice: 0,
		rate: 0,
		funding: "00:00",
		longfundingrate: 0,
		shortfundingrate: 0
	})
	const [show,setShow] = useState(false)





	// const getHistory = async () => {
	// 	const address = await getAccount()
	// 	if (address) {
	// 		const history = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/KT1CkJSoxa8Wm9fD2RSkfnpsEZch55jKB3Nj/storage`)
	// 		setLongPositions(history.data.longPositions)
	// 		setShortPositions(history.data.shortPositions)
	// 	}

	// }

	const gettradeenclosure = () => {
		const getvalues = {
			marketprice: 0,
			indexprice: 0,
			rate: 0,
			funding: "00:00 hrs",
			longfundingrate: 0,
			shortfundingrate: 0
		}
		setGraphValues(getvalues)
	}
	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		getHistory();
	// 	}, 4000);
	// 	return () => clearInterval(interval);
	// }, []);


	const onChangeRange = (e) => {
		setRangeValue(e.target.value)
	}



	return (
		<div>
			<link rel="stylesheet" href="/styles/trade.css" />
			<div className="coin-name d-flex m-3">
				<div className="icon fs-2"><img style={{ width: "35px", height: "35px" }} src={`img/${coinSelect === 'tezos' ? 'tz' : coinSelect === 'btc' ? 'btc' : 'eth'}.svg`} alt="" /></div>
				<div className="coin-name d-flex flex-column ms-2">
					<h4 className='mb-0 text-start'>{coinSelect === 'tezos' ? 'XTZ-PREP' : coinSelect === 'btc' ? 'BTC-PREP' : 'ETH-PREP'}</h4>
					<h6 className='text-start'>{coinSelect === 'tezos' ? 'Tezos' : coinSelect === 'btc' ? 'Bitcoin' : 'Ethereum'}</h6>
					<button onClick={()=>setShow(true)}>show</button>
				</div>

			</div>
			<Snackbar1 show ={show} setshow={setShow} />
			<div className="trade-graph-enclosure">
				<div className="graph-infos d-flex text-start">
					<div className="graph-info">
						<div className="info-title">Market Price</div>
						<div className="info-values text-success">${graphValues.marketprice}</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Index Price</div>
						<div className="info-values">{graphValues.indexprice} vUSD</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Long/short funding rate</div>
						<div className="info-values">{graphValues.rate}</div>
					</div>

					<div className="graph-info">
						<div className="info-title">Next funding</div>
						<div className="info-values">{graphValues.funding}Hrs</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Expected Long
							funding rate</div>
						<div className="info-values">{graphValues.longfundingrate}%</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Expected Short
							funding rate</div>
						<div className="info-values">{graphValues.shortfundingrate}%</div>
					</div>
				</div>
			</div>

			<div className="long-short-enclosure">
				<h5>By adding short position, you can earn 49.056% APR</h5>
				<div className="long-short-btns mt-4">
					<button className={`  mx-3 btn  `} style={{ color: "white", fontWeight: "bold", background: "#1ECC89" }} onClick={() => {
						setLongOrShort('long')
						setIsLong(true)
						handleOpen()
					}} >Long</button>
					<button className={` mx-3 btn `} style={{ color: "white", fontWeight: "bold", background: "#E01B3C" }} onClick={() => {
						setLongOrShort('short')
						setIsLong(false)
						handleOpen()
						SnackbarUtils.info("Works");
					}} >Short</button>
				</div>
			</div>
			<div className='trade_chart'>
				<TradeChart />

			</div>

			{
				!currentPosition ? "" : (
					<Position />
				)
			}








			<div className="history-enclosure text-white">


				<div style={{ display: "flex" }}>
					<h5 className={`tradedetailsbtn text-start`} style={{ color: "whitesmoke" }}>Position</h5>
					{/* <Button onClick={() => setselectTable("history")} className={`${selectTable == 'history' ? 'activeButton' : ''} tradedetailsbtn text-start`}>Ordered History</Button> */}
				</div>



				<Table className='trading_details' borderless="false" responsive>
					<thead>
						<tr>
							<th >TIME</th>
							<th >DIRECTION</th>
							<th >COLLATERAL</th>
							<th>POSION SIZE</th>
							<th >LIVE PNL</th>
						</tr>
					</thead>
					<tbody >

						<tr>
							<td>Table cell</td>
							<td>Table cell</td>
							<td>Table cell</td>
							<td>Table cell</td>
							<td>Table cell</td>
						</tr>
						{
							longPositions.map((element) => {
								return (
									<tr>
										<td>TIME</td>
										<td>XTZ</td>
										<td>{element.value.token_amount / 1000000} vUSD</td>
										<td>{element.value.vUSD_Amount / 1000000} vUSD</td>
										<td>Table cell</td>
									</tr>
								)
							})}
						{
							shortPositions.map((element) => {
								return (

									<tr>
										<td>Table cell</td>
										<td>Table cell</td>
										<td>Table cell</td>
										<td>Table cell</td>
										<td>Table cell</td>
									</tr>
								)
							})}

					</tbody>
				</Table>







			</div>

			{isLong ? <Modal
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
						<input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" focused onChange={(event) => setBaseValue(event.target.value)} />
					</div>

					<div className='tradebox_leverage'>
						<h6>Leverage</h6>
						<Slider
							aria-label="Temperature"
							defaultValue={1}
							className="tradebox_levslider"
							value={rangeValue}
							onChange={onChangeRange}
							color={'primary'}
							sx={{ color: `grey` }}
							step={1}
							marks
							min={1}
							max={5}
							style={{ width: '90%' }} /> <span style={{ position: "absolute", bottom: "6px", fontSize: "14px", right: "25px", fontWeight: "bold" }}>{rangeValue}x</span> <br />
					</div>
					<table className='tradebox_table1' style={{ width: "100%" }}>
						<p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600" }}>You are buying in the long</p>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Positon size</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 BTC <img src="img/btc.svg" /></td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Entry price</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 kUSD <img style={{ width: "20px" }} src="img/kusd.png" /></td>
						</tr>
					</table>
					<hr style={{ position: "relative", left: "-10px", width: "100%", top: "20px" }} />


					<table className='tradebox_table1' style={{ width: "100%" }}>
						<tr style={{ width: "100%", }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Amount</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 vUSD</td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Commission</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 vUSD</td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0%</td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
						</tr>
					</table>
					{isTxn ? <span style={{ width: "100% !important", position: "relative", left: "35%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span> : <Button className="tradebox_button" style={{ align: 'center', width: '100%', borderRadius: "8px", marginTop: "20px", fontWeight: "600", backgroundColor: "#1ECC89", fontFamily: "'Inter', sans-serif" }} variant="contained" color="success"
						onClick={async () => {
							setIsTxn(true);
							console.log(baseValue, rangeValue, 'XTZ');
							await openLong(baseValue, rangeValue, 'XTZ');
							setIsTxn(false)
						}}>Long</Button>}
				</Box>
			</Modal> : <Modal
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
						<input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" step="0.01" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" focused onChange={(event) => setBaseValue(event.target.value)} />
					</div>
					<div className='tradebox_leverage'>
						<h6>Leverage</h6>
						<Slider
							aria-label="Temperature"
							defaultValue={1}
							className="tradebox_levslider"
							value={rangeValue}
							onChange={onChangeRange}
							color={'primary'}
							sx={{ color: `grey` }}
							step={1}
							marks
							min={1}
							max={5}
							style={{ width: '90%' }} /> <span style={{ position: "absolute", bottom: "6px", fontSize: "14px", right: "25px", fontWeight: "bold" }}>{rangeValue}x</span> <br />
					</div>
					<table className='tradebox_table1' style={{ width: "100%" }}>
						<p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600" }}>You are buying in the long</p>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Positon size</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 BTC <img src="img/btc.svg" /></td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Entry price</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 kUSD <img style={{ width: "20px" }} src="img/kusd.png" /></td>
						</tr>
					</table>
					<hr style={{ position: "relative", left: "-10px", width: "100%", top: "20px" }} />


					<table className='tradebox_table1' style={{ width: "100%" }}>
						<tr style={{ width: "100%", }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Amount</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 vUSD</td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Commission</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0 vUSD</td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>0%</td>
						</tr>
						<tr style={{ width: "100%" }}>
							<td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
							<td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
						</tr>
					</table>
					{isTxn ? <span style={{ width: "100% !important", position: "relative", left: "35%" }}><ScaleLoader color='#E01B3C' width={7} margin={6} /> </span> : <Button className="tradebox_button" style={{ align: 'center', width: '100%', borderRadius: "8px", marginTop: "20px", fontWeight: "600", backgroundColor: "#E01B3C", fontFamily: "'Inter', sans-serif" }} variant="contained" color="success"
						onClick={async () => {
							setIsTxn(true);
							console.log(baseValue, rangeValue, 'XTZ');
							await openLong(baseValue, rangeValue, 'XTZ');
							setIsTxn(false)
						}}>SHORT</Button>}
				</Box>
			</Modal>}
		</div>
	)
}

export default Trade
