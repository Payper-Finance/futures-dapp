import React, { useEffect, useState,useContext } from 'react'
import { ProgressBar, Button, Modal } from 'react-bootstrap';
import '../style/tradeModel.css'
import { Popover, Slider } from '@mui/material';
import UserContext from "../ContextProvider.js";
import { ScaleLoader } from 'react-spinners'
import { addMargin, closePosition, decreasePosition, openPosition, removeMargin } from '../utils/tezos';
import { add } from '@amcharts/amcharts5/.internal/core/util/Time';


export default function Position({positiondetail ,graph,gethistory,Vmm}) {
    
const { setCPosiitonUpdated,CPosiitonUpdated } = useContext(UserContext)
    const [isTxn, setIsTxn] = useState(false);
    const [Addshow, setAddShow] = useState(false);
    const [Closeshow, setCloseShow] = useState(false);
    const[increaseshow,setIncreaseshow] = useState(false);
    const[decreaseshow,setDecreaseshow] = useState(false);
    const[closePostion,setClosePosition] = useState(false)
    const [rangeValue, setRangeValue] = useState(1)
	const [baseXrange, setbaseXrange] = useState(0);
    const [baseValue, setBaseValue] = useState(0)
    const [AddorRemove,setAddorRemove] =useState(0)
    const [marginRatio,setmarginRatio] =useState(0)
    const [phbar, setPhbar] = useState(0)
	const [priceImpact,setPriceImpact] = useState(0)
    const [expectedClose,setExpectedClose] = useState(0)

    useEffect(()=>{
      
        
        setmarginRatio(((parseFloat(positiondetail.collateral_amount)/1000000) /(parseFloat(positiondetail.vUSD_amount)/1000000)).toFixed(3))
        setPhbar(marginRatio*100)
        calculateExpectedPrice()
    },[phbar,marginRatio,positiondetail,graph])

    const calculateExpectedPrice =() =>{
        if(positiondetail.position ==1){
            let pertoken = Vmm.token_amount/Vmm.vUSD_amount
            let VmmToken = Vmm.token_amount+positiondetail.position_value
            let x = Vmm.vUSD_amount-(Vmm.invariant/VmmToken)
            let actualprice = positiondetail.position_value/x
            let impactprice = ((actualprice-pertoken)*100)/pertoken
            setExpectedClose(graph.marketprice-(impactprice/100))

        }
    }
	const setOpenlongpriceImpact = () =>{
		let perUsd = Vmm.vUSD_amount/Vmm.token_amount
		let VmmUsd = Vmm.vUSD_amount+(baseXrange*1000000);
		let x = (Vmm.invariant/VmmUsd)-Vmm.token_amount
		let actualToken = (baseXrange*1000000)/x
		let priceimpact = ((actualToken-perUsd)*100)/perUsd
		setPriceImpact(priceimpact)
	}
	const setOpenshortpriceImpact = () =>{

		let pertoken = Vmm.token_amount/Vmm.vUSD_amount
		let Vmmtoken = Vmm.vUSD_amount-(baseXrange*1000000);
		let x = (Vmm.invariant/Vmmtoken)-Vmm.token_amount
		let actualToken = x/(baseXrange*1000000)
		let priceimpact = ((actualToken-pertoken)*100)/pertoken
		setPriceImpact(priceimpact)
	}

    const onChangeRange = (e) => {
        setRangeValue(e.target.value)
        setbaseXrange(rangeValue*baseValue)
        if(increaseshow){

			setOpenlongpriceImpact()
		}
		else{
			setOpenshortpriceImpact()
		}
    }

    const MarginOnChange =(e)=>{
        setAddorRemove(e)


    }
    const amountOnchange = (e) =>{
        setBaseValue(e)
        setbaseXrange(rangeValue*baseValue)
        if(increaseshow){

			setOpenlongpriceImpact()
		}
		else{
			setOpenshortpriceImpact()
		}
    }
    const IncreaseOrDecreaseFunc =async(baseValue,rangeValue,direction)=>{
        console.log(baseValue)
        console.log(rangeValue)
        console.log(direction)
        if(direction ==1){
        try{
            setIsTxn(true)
            await openPosition(baseValue, rangeValue, direction).then(res=>{
                console.log("reciept "+res)
                gethistory()
                setIsLong("")
            })
    
        }
        catch(err){
            console.log(err)
        setIsTxn(false)
        }
        }
        else{
            try{
                setIsTxn(true)
                await decreasePosition( rangeValue,baseValue).then(res=>{
                    console.log("reciept "+res)
                    gethistory()
                    setIsLong("")
                })
        
            }
            catch(err){
                console.log(err)
            setIsTxn(false)
            }

        }

    
    }

    return (
        <>
            <section className='tradePostion'>
                <div className='positon_Health'>
                    <h3>Position Health</h3>
                    {phbar > 30 ? <div><ProgressBar now={phbar} /></div> : (
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
                            <p>{marginRatio}</p>
                            <p>00.01 kUSD</p>
                        </div>
                    </div>
                    <Button className="tphAdd" onClick={() => setAddShow(true)} >+ADD</Button>
                    <Button className="tphDec" onClick={() => setCloseShow(true)}>-Reduce</Button>
                </div>
                <div className='positon_Status'>
                    <h3>Position Status</h3>
                    <div>
                        <div className='tpstatus'>
                            <p>Long position /short position</p>
                            <p>{(positiondetail.position_value/1000000).toFixed(2)} vUSD</p>
                            <Button onClick={()=>setClosePosition(true)}>Close Position</Button>
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
                                    <p>{(parseFloat(positiondetail.entry_price)/1000000).toFixed(3)} XTZ</p>
                                    <p>{graph.marketprice} XTZ</p>
                                    <p>{expectedClose.toFixed(2)}  XTZ</p>
                                    <p>
                                        {graph.marketprice - (positiondetail.entry_price/1000000).toFixed(3) >=0?(
                                            <span style={{color:"red"}}>-{(graph.marketprice - (positiondetail.entry_price/1000000).toFixed(3)).toFixed(3)} </span>
                                        ):(
                                            <span style={{color:"green"}}>+{(graph.marketprice - (positiondetail.entry_price/1000000).toFixed(3)).toFixed(3) +positiondetail.funding_amount} </span>
                                        )}
                                    </p>
                                    <p>{positiondetail.funding_amount}</p>
                                </div>
                            </div>
                            <Button className='tphAdd' style={{fontSize:"14px"}} onClick={()=>setIncreaseshow(true)}>+INCREASE</Button>
                            <Button className='tphDec' style={{fontSize:"14px"}} onClick={()=>setDecreaseshow(true)}>-DECREASE</Button>
                        </div>

                    </div>

                </div>
            </section>

            <Modal
                centered
                show={Addshow}
                onHide={setAddShow}
                backdrop="static"
                keyboard={false}

            >
                <Modal.Header style={{ border: "none" }} closeButton>
                    <Modal.Title style={{fontWeight:"bold"}} >Add Margin</Modal.Title>
                    <Button style={{ background: "none", border: "none" }}><img style={{ height: "25px" }} onClick={() =>{
                        setAddShow(false)
                        setIsTxn(false)}
                        } src='/img/icons8-close-30.png' /></Button>
                </Modal.Header>
                <Modal.Body>
                    <span style={{ position: "absolute", marginTop: "7px", marginLeft: "15px" }}><img style={{ height: "25px" }} src='/img/btc.svg' /></span>
                    <input value ={AddorRemove} onChange={(event)=>MarginOnChange(event.target.value)} style={{ width: "100%", height: "40px", borderRadius: "5px", margin: "2px 0px", background: "#30313d", border: "none", textAlign: "right", padding: "0 10px" }} placeholder='Amount' />
                    <p style={{ fontSize: "11px", color: "#96979c" }}> On balance 783.5413. <span style={{ color: "#ac69ff" }}> Spend the entire amount</span></p>

                    <div className='marginbodydiv' style={{ borderBottom: "0.5px solid #30313d", fontWeight: "bold" }}>
                        <p>Liquidation price</p>
                        <p>7.72</p>
                    </div>
                    <div className='marginbodydiv' style={{ marginTop: "10px" }}>
                        <p>Position margin</p>
                        <p>19.8 USDN</p>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }} >
                {isTxn ? (<span style={{ width: "100% !important", position: "relative", left: "-35%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span> ):(
                    <Button variant="secondary" onClick={async() => {
                        try{
                            setIsTxn(true)
                            await addMargin(AddorRemove)
                            gethistory()
                            setIsTxn(false)
                            
                        }
                        catch(err){
                            console.log(err)
                        }
                       
                    }}
                        style={{ minWidth: "98%", background: "#1ECC89" }}
                    >
                        ADD
                    </Button>
                )}
                </Modal.Footer>
            </Modal>



            <Modal
                centered
                show={Closeshow}
                onHide={() => setCloseShow(false)}
                backdrop="static"
                keyboard={false}

            >
                <Modal.Header style={{ border: "none" }} closeButton>
                    <Modal.Title style={{fontWeight:"bold"}} >Reduce Margin</Modal.Title>
                    <Button style={{ background: "none", border: "none" }}><img style={{ height: "25px" }} onClick={() =>{ setCloseShow(false)
                    
                    setIsTxn(false)} } src='/img/icons8-close-30.png' /></Button>

                </Modal.Header>
                <Modal.Body>

                    <span style={{ position: "absolute", marginTop: "7px", marginLeft: "15px" }}><img style={{ height: "25px" }} src='/img/btc.svg' /></span>
                    <input value ={AddorRemove} type="number" min="0" max="100000000" onChange={(event)=>MarginOnChange(event.target.value)} style={{ width: "100%", height: "40px", borderRadius: "5px", margin: "2px 0px", background: "#30313d", border: "none", textAlign: "right", padding: "0 10px" }} placeholder='Amount' />
                    <p style={{ fontSize: "11px", color: "#96979c" }}> On balance 783.5413. <span style={{ color: "#ac69ff" }}> Spend the entire amount</span></p>

                    <div className='marginbodydiv' style={{ borderBottom: "0.5px solid #30313d", fontWeight: "bold" }}>
                        <p>Liquidation price</p>
                        <p>7.72</p>
                    </div>
                    <div className='marginbodydiv' style={{ marginTop: "10px" }}>
                        <p>Position margin</p>
                        <p>19.8 USDN</p>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }} >
                {isTxn ? (<span style={{ width: "100% !important", position: "relative",left: "-35%" }}><ScaleLoader color='#E01B3C' width={7} margin={6} /> </span> ):(
                    <Button variant="secondary" onClick={async() => {
                        try{
                            setIsTxn(true)
                            await removeMargin(parseInt(AddorRemove))
                            gethistory()
                            setIsTxn(false)
                        }
                        catch(err){
                            console.log(err)
                        }
                    }}
                        style={{ minWidth: "98%", background: "#e01b3c" }}
                    >
                        Reduce
                    </Button>
                )}
                </Modal.Footer>
            </Modal>


{/* ----------------------------CLose Position Modal ------------------------------------------------------- */}

            <Modal
                centered
                show={closePostion}
                onHide={closePostion}
                backdrop="static"
                keyboard={false}

            >
                <Modal.Header style={{ border: "none" }} closeButton>
                    <Modal.Title style={{fontWeight:"bold"}} >Close Position</Modal.Title>
                    <Button style={{ background: "none", border: "none" }}><img style={{ height: "25px" }} onClick={() => {setClosePosition(false) 
                        setIsTxn(false)}} src='/img/icons8-close-30.png' /></Button>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ fontSize: "14px", color: "#96979c" }}>Are you sure you want to close the position?</p>

                    <div className='marginbodydiv' style={{ borderBottom: "0.5px solid #30313d", fontWeight: "bold" }}>
                        <p style={{flexBasis:"55%"}}>Expected CLose Price</p>
                        <p>{expectedClose.toFixed(2)}</p>
                    </div>
                    <div className='marginbodydiv' style={{ marginTop: "10px", fontWeight:"bold"}}>
                        <p>Your Profit</p>
                        <p>-19.8 USDN</p>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: "none",display:"flex",width:"100%",justifyContent:"center"}} >

                {isTxn ? (<span style={{ width: "100% !important", position: "relative", left: "0%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span> ):(
                    <>
                    <Button variant="secondary" 
                        onClick={
                            async () => {
                                try{
                                    setIsTxn(true);
                                    await closePosition().then(res =>{
                                        if(res=="success"){
                                            setCPosiitonUpdated(CPosiitonUpdated?true:false)
                                            setIsTxn(false);
                                            setClosePosition(false)
                                        }
                                    }).catch((err)=>{
                                        console.log(err)
                                        SnackbarUtils.error("Error Please Try Again")
                                        setIsTxn(false);
                                        setClosePosition(false)
                                    });
                                    
                                }
                                catch(err){
                                    setIsTxn(false);
                                }
                              
                            } 
                        }
                        style={{ minWidth: "46%", background: "#1ECC89",fontWeight:"bold" }}
                    >
                        Yes
                    </Button>
                    <Button variant="secondary" onClick={() => setClosePosition(false)}
                        style={{ minWidth: "46%", background: "#e01b3c",fontWeight:"bold" }}
                    >
                        No
                    </Button>
                    </>
                )
                }
                </Modal.Footer>
            </Modal>

        











            {/*----------------------------------- increase decrease  -------------------------------------- */}
            <Modal
            show={increaseshow}
                open={true}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Modal.Header style={{ border: "none" ,position:"relative",left:"10px"}} closeButton>
                    <Modal.Title style={{fontWeight:"bold"}} >Increase Position</Modal.Title>
                    <Button style={{ background: "none", border: "none" }}><img style={{ height: "25px" }} onClick={() => {setIncreaseshow(false)
                    setIsTxn(false)}} src='/img/icons8-close-30.png' /></Button>

                </Modal.Header>
                <Modal.Body style={{position:"relative",left:"10px"}}>
                    <div className='tradebox_amount'>
                        <span className='tradebox_inputicon'><img style={{ padding: "0 6px", marginTop: "-4px", height: "32px" }} src="img/kusd.png" alt="" />kUSD</span>
                        <input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" step="0.01" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" focused onChange={(event) => amountOnchange(event.target.value)} />
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
                        <tbody>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600" }}>You are buying in the long</p>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Positon size</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseXrange == 0 ? ((baseValue == null) ? 0 : (baseValue / graph.marketprice).toFixed(2)) : ((baseXrange / graph.marketprice).toFixed(4))} XTZ <img src="img/btc.svg" /></td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Entry price</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{graph.marketprice} kUSD <img style={{ width: "20px" }} src="img/kusd.png" /></td>
                        </tr>
                        </tbody>
                    </table>
                    <hr style={{ position: "relative", left: "-10px", width: "100%", top: "20px" }} />


                    <table className='tradebox_table1' style={{ width: "100%" }}>
                    <tbody>
                        <tr style={{ width: "100%", }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Amount</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue} vUSD</td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Commission</td>
                            <td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2 vUSD</td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{priceImpact.toFixed(2)}%</td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
                            <td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
                        </tr>
                        </tbody>
                    </table>
                     </Modal.Body>
                     <Modal.Footer style={{ border: "none" }} >
                     {isTxn ? (<span style={{ width: "100% !important", position: "relative",left: "-35%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span> ):(
                    <Button variant="secondary" 
                        style={{ minWidth: "98%", background: "#1ECC89",fontWeight:"bold" }} 
    onClick={()=>IncreaseOrDecreaseFunc(baseValue, rangeValue, 1)}
                        
                    >
                       INCREASE
                    </Button>
                    )}
                </Modal.Footer>
            </Modal>














            <Modal
            show={decreaseshow}
                open={true}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Modal.Header style={{ border: "none" ,position:"relative",left:"10px"}} closeButton>
                    <Modal.Title style={{fontWeight:"bold"}} >Decrease Position</Modal.Title>
                    <Button style={{ background: "none", border: "none" }}><img style={{ height: "25px" }} onClick={() => {setDecreaseshow(false)
                    setIsTxn(false)}} src='/img/icons8-close-30.png' /></Button>

                </Modal.Header>
                <Modal.Body style={{position:"relative",left:"10px"}}>
                    <div className='tradebox_amount'>
                        <span className='tradebox_inputicon'><img style={{ padding: "0 6px", marginTop: "-4px", height: "32px" }} src="img/kusd.png" alt="" />kUSD</span>
                        <input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" step="0.01" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" focused onChange={(event) => amountOnchange(event.target.value)} />
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
                        <tbody>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600" }}>You are buying in the long</p>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Positon size</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseXrange == 0 ? ((baseValue == null) ? 0 : (baseValue / graph.marketprice).toFixed(2)) : ((baseXrange / graph.marketprice).toFixed(4))} XTZ <img src="img/btc.svg" /></td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Entry price</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{graph.marketprice} vUSD <img style={{ width: "20px" }} src="img/kusd.png" /></td>
                        </tr>
                        </tbody>
                    </table>
                    <hr style={{ position: "relative", left: "-10px", width: "100%", top: "20px" }} />


                    <table className='tradebox_table1' style={{ width: "100%" }}>
                    <tbody>
                        <tr style={{ width: "100%", }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Amount</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue} vUSD</td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Commission</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2 vUSD</td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
                            <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{priceImpact.toFixed(2)}%</td>
                        </tr>
                        <tr style={{ width: "100%" }}>
                            <td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
                            <td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
                        </tr>
                        </tbody>

                    </table>
                     </Modal.Body>
                     <Modal.Footer style={{ border: "none" }} >
                     {isTxn ? (<span style={{ width: "100% !important", position: "relative",left: "0%" }}><ScaleLoader color='#E01B3C' width={7} margin={6} /> </span> ):(
                    <Button variant="secondary" 
                        style={{ minWidth: "98%", background: "#e01b3c",fontWeight:"bold" }}
                        onClick={()=>IncreaseOrDecreaseFunc(baseValue, rangeValue, 2)}
                    >
                       DECREASE
                    </Button>
                     )}
                </Modal.Footer>
            </Modal>



        </>
    )
}
// {isTxn ? <span style={{ width: "100% !important", position: "relative", left: "35%" }}><ScaleLoader color='#E01B3C' width={7} margin={6} /></span> :