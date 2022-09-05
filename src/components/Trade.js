import React, { useState, useEffect } from 'react'
import TradeChart from './TradeChart'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Slider } from '@mui/material';
import { openLong, closeLong, openShort, closeShort } from '../utils/tezos'
import { getAccount } from '../utils/wallet';
import axios from 'axios';
import "../style/tradeModel.css"
import SnackbarUtils from '../utils/SnackbarUtils';
import { ScaleLoader } from 'react-spinners'
import {Table,ProgressBar } from 'react-bootstrap';

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
	const [currentPosition,setCurrentPosition] = useState(true)
	const [phbar, setPhbar] = useState(100)



	const getHistory = async () => {
		const address = await getAccount()
		if (address) {
			const history = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/KT1CkJSoxa8Wm9fD2RSkfnpsEZch55jKB3Nj/storage`)
			setLongPositions(history.data.longPositions)
			setShortPositions(history.data.shortPositions)
		}

	}
	useEffect(() => {
		const interval = setInterval(() => {
			getHistory();
		}, 4000);
		return () => clearInterval(interval);
	}, []);


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
				</div>
				
			</div>

			<div className="trade-graph-enclosure">
				<div className="graph-infos d-flex text-start">
					<div className="graph-info">
						<div className="info-title">Market Price</div>
						<div className="info-values text-success">$1.85</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Index Price</div>
						<div className="info-values">1.87 vUSD</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Long funding rate</div>
						<div className="info-values">-</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Short funding rate</div>
						<div className="info-values">-</div>
					</div>
					<div className="graph-info">
						<div className="info-title">Next funding</div>
						<div className="info-values">11:34 Hrs</div>
					</div>
				
				</div>
			</div>

			<div className="long-short-enclosure">
				<h5>By adding short position, you can earn 49.056% APR</h5>
				<div className="long-short-btns mt-4">
					<button className={` longbg mx-3 btn btn-outline-white ${longOrShort === 'long' ? 'bg-success' : 'btn-outline-success'} `} onClick={() => {
						setLongOrShort('long')
						setIsLong(true)
						handleOpen()
					}} >Long</button>
					<button className={`shortbg mx-3 btn btn-outline-white ${longOrShort === 'short' ? 'bg-danger' : 'btn-outline-danger'} `} onClick={() => {
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
						!currentPosition?"":(
							<section className='tradePostion'>
				<div className='positon_Health'>
					<h3>Position Health</h3>
					{phbar>30?<div><ProgressBar now={phbar} /></div>:(
					<div><ProgressBar className='phWeak' now={phbar} /></div>
					)}
					
					<div className='figure_values'>
						<div className='tpfigures'>
							<p>Margin</p>
							<p>Margin Ratio</p>
							<p>Liquidation Price</p>
						</div>
						<div className='tpValues'>
							<p>00.01 kUSD</p>
							<p>00.001</p>
							<p>00.01 kUSD</p>
						</div>
					</div>
					<Button className="tphAdd">+ADD</Button>
					<Button className="tphDec">-Reduce</Button>
				</div>
				<div className='positon_Status'>
					<h3>Position Status</h3>
					<div>
						<div className='tpstatus'>
							<p>Long position /short position</p>
							<p>00.000 BTC</p>
							<Button>Close Position</Button>
						</div>
						<div className='tps_figures_values' >
							<div>
								<div className='tpsfigure'>
									<p>Entry</p>
									<p>Market</p>
									<p>Expected Close Price</p>
									<p>Unrealized PNL</p>
									<p>Net Funding</p>
								</div>
								<div className='tpsValues'>
									<p>98.01 kUSD</p>
									<p>98.01 kUSD</p>
									<p>98.01 kUSD</p>
									<p>Unrealized PNL</p>
									<p>Net Funding</p>
								</div>
							</div>
							<Button className='tphAdd'>+INCREASE</Button>
							<Button className='tphDec'>-DECREASE</Button>
						</div>

					</div>

				</div>
			</section>



						)
					}
			



			<div className="history-enclosure text-white">


				<div style={{ display: "flex" }}>
					<Button onClick={() => setselectTable("position")} className={`${selectTable == 'position' ? 'activeButton' : ''} tradedetailsbtn text-start`}  >Position</Button>
					<Button onClick={() => setselectTable("history")} className={`${selectTable == 'history' ? 'activeButton' : ''} tradedetailsbtn text-start`}>Ordered History</Button>
				</div>


				{
					selectTable == "position" ? (
						<Table className='trading_details' borderless="false" responsive>
							<thead>
								<tr>
									<th >TIME</th>
									<th >DIRECTION</th>
									<th >COLLATERAL</th>
									<th>POSION SIZE</th>
									<th >REALIZE PNL</th>
									<th>ACTION</th>
								</tr>
							</thead>
							<tbody >

								<tr>
									<td>Table cell</td>
									<td>Table cell</td>
									<td>Table cell</td>
									<td>Table cell</td>
									<td>Table cell</td>
									<td><Button color="error" onClick={() => { closeShort('XTZ') }}>CLOSE</Button></td>
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
												<td><Button color="error" onClick={() => { closeShort('XTZ') }}>CLOSE</Button></td>
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
												<td><Button color="error" onClick={() => { closeShort('XTZ') }}>CLOSE</Button></td>
											</tr>
										)
									})}

							</tbody>
						</Table>


					) : (

						<Table className='trading_details' borderless="false" responsive>
							<thead>
								<tr>
									<th>TIME</th>
									<th>DIRECTION</th>
									<th>SYMBOL</th>
									<th>COLLATERAL</th>
									<th>POSION SIZE</th>
									<th>REALIZE PNL</th>
								</tr>
							</thead>
							<tbody >
								<tr>
									<td>Table cell</td>
									<td>Table cell</td>
									<td>Table cell</td>
									<td>Table cell</td>
									<td>Table cell</td>
									<td>Table cell</td>
								</tr>
								<tr>
									<td>Table cell</td>
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
												<td>Table cell</td>
												<td>Table cell</td>
												<td>Table cell</td>
												<td>Table cell</td>
												<td>Table cell</td>
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
												<td>Table cell</td>
											</tr>

										)
									})}
							</tbody>
						</Table>

					)
				}







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
						<input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" focused onChange={(event) => setBaseValue(parseInt(event.target.value))} />
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
						<input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" focused onChange={(event) => setBaseValue(parseInt(event.target.value))} />
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
