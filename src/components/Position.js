import React, { useEffect, useState, useContext } from 'react'
import { ProgressBar, Modal } from 'react-bootstrap';
import Button from '@mui/material/Button';
import Snackbar from './Snackbar'
import '../style/tradeModel.css'
import { Slider } from '@mui/material';
import UserContext from "../ContextProvider.js";
import { ScaleLoader } from 'react-spinners'
import { PRECISION } from '../utils/config';
import Box from '@mui/material/Box';
import { addMargin, closePosition, decreasePosition, openPosition, removeMargin } from '../utils/tezos';
import { parse } from 'qs';


export default function Position({ positiondetail, graph, gethistory, Vmm }) {

    const { setCPosiitonUpdated, CPosiitonUpdated, kusdTokenBalance } = useContext(UserContext)
    const [isTxn, setIsTxn] = useState(false);
    const [Addshow, setAddShow] = useState(false);
    const [Closeshow, setCloseShow] = useState(false);
    const [increaseshow, setIncreaseshow] = useState(false);
    const [decreaseshow, setDecreaseshow] = useState(false);
    const [closePostion, setClosePosition] = useState(false)
    const [rangeValue, setRangeValue] = useState(1)
    const [baseXrange, setbaseXrange] = useState(0);
    const [baseValue, setBaseValue] = useState(0)
    const [addmarginvalue, setaddmarginvalue] = useState(0)
    const [removemarginvalue, setremovemarginvalue] = useState(0)
    const [marginRatio, setmarginRatio] = useState(0)
    const [phbar, setPhbar] = useState(0)
    const [priceImpact, setPriceImpact] = useState(0)
    const [expectedClose, setExpectedClose] = useState(0)
    const [snackbarshow, setSnackbarshow] = useState(false)
    const [calculatedX, setCalculatedX] = useState(0);
    const [decreasePercentage, setdecreasePercentage] = useState(0);
    
    const [type, setType] = useState(
        {
            type: "",
            message: "",
            transaction: ""
        }
    )

    useEffect(() => {
        calculateExpectedPrice()

        let marratio = 0;
        if (positiondetail.position == 1) {
            marratio = (positiondetail.collateral_amount / PRECISION) + (calculatedX - positiondetail.vUSD_amount / PRECISION)

        }
        else {
            marratio = (positiondetail.collateral_amount / PRECISION) + (positiondetail.vUSD_amount / PRECISION - calculatedX)
        }
        var max_reduce = (parseFloat(marratio) / (parseFloat(positiondetail.vUSD_amount) / PRECISION))-0.3
        console.log(max_reduce*(parseFloat(positiondetail.vUSD_amount) / PRECISION))
        
        setmarginRatio(parseFloat(marratio) / (parseFloat(positiondetail.vUSD_amount) / PRECISION))
        setPhbar(marginRatio * 100)

    }, [phbar, marginRatio, positiondetail, graph])



    const calculateExpectedPrice = () => {
        if (positiondetail.position == 2) {
            let perUsd = Vmm.vUSD_amount / Vmm.token_amount
            let VmmToken = Vmm.token_amount - (positiondetail.position_value / PRECISION);
            let x = (Vmm.invariant / VmmToken) - Vmm.vUSD_amount
            setCalculatedX(x)
            let actualToken = x / (positiondetail.position_value / PRECISION)
            let priceimpact = ((actualToken - perUsd) * 100) / perUsd
            setExpectedClose(graph.marketprice - (priceimpact / 100))

        }
        if (positiondetail.position == 1) {
            let pertoken = Vmm.token_amount / Vmm.vUSD_amount
            let Vmmtoken = Vmm.token_amount + (positiondetail.position_value / PRECISION);
            let x = Vmm.vUSD_amount - (Vmm.invariant / Vmmtoken)
            setCalculatedX(x)
            let actualToken = (positiondetail.position_value / PRECISION) / x
            let priceimpact = ((actualToken - pertoken) * 100) / pertoken
            setExpectedClose(graph.marketprice - (priceimpact / 100))
        }
    }

    const setOpenlongpriceImpact = () => {

        let perUsd = Vmm.vUSD_amount / Vmm.token_amount
        let VmmUsd = Vmm.vUSD_amount + (baseXrange);
        let x = (Vmm.invariant / VmmUsd) - Vmm.token_amount
        let actualToken = (baseXrange) / Math.abs(x)
        let priceimpact = ((actualToken - perUsd) * 100) / perUsd
        setPriceImpact(priceimpact)
    }
    const setOpenshortpriceImpact = () => {
        let pertoken = Vmm.token_amount / Vmm.vUSD_amount
        let Vmmtoken = Vmm.vUSD_amount - (baseXrange);
        let x = (Vmm.invariant / Vmmtoken) - Vmm.token_amount
        let actualToken = Math.abs(x) / (baseXrange)
        let priceimpact = ((actualToken - pertoken) * 100) / pertoken
        setPriceImpact(priceimpact)
    }



    useEffect(() => {
        setbaseXrange(baseValue * rangeValue)
        if (increaseshow) {

            setOpenlongpriceImpact()
        }
        if (decreaseshow) {
            setOpenshortpriceImpact()
        }
    }, [baseValue, rangeValue, baseXrange])



    const IncreaseOrDecreaseFunc = async (baseValue, rangeValue, direction) => {

        try {
            setIsTxn(true)
            await openPosition(baseValue, rangeValue, direction).then(res => {
                console.log("response::: " + res)
                gethistory()
                setIncreaseshow(false)
                setCPosiitonUpdated(true)
                setIsTxn(false)
                if (res == undefined) {
                    setType(
                        {
                            type: "Failed",
                            message: "Transaction Aborted !",
                        }
                    )
                    setSnackbarshow(true)
                } else {
                    setType(
                        {
                            type: "success",
                            message: "Transaction Successful!",
                            transaction: res
                        }
                    )
                    setSnackbarshow(true)
                    setCPosiitonUpdated(true)
                }

            }).catch(err => {
                setType(
                    {
                        type: "Failed",
                        message: "Transaction Failed !",
                    }
                )
                setSnackbarshow(true)
            })

        }
        catch (err) {
            console.log(err)
            setIsTxn(false)

        }






    }
    const addBaseValue = async (value) => {
        var amount = (kusdTokenBalance / 100) * value
        setBaseValue(amount)
    }
    const decreasepositionvalue = async (value) => {
       var max = (parseFloat(positiondetail.position_value)/PRECISION)*parseFloat(graph.marketprice) 
       setBaseValue(Math.round(max*value/100))
       setdecreasePercentage(value)

    }
    

    return (
        <>
            <Snackbar show={snackbarshow} setshow={setSnackbarshow} type={type} />
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
                            {/* <p>Liquidation Price</p> */}
                        </div>
                        <div className='tpValues'>
                            <p>
                                {
                                    positiondetail.position == 1 ? (((positiondetail.collateral_amount / PRECISION) + (calculatedX - positiondetail.vUSD_amount / PRECISION)).toFixed(4)) : (
                                        ((positiondetail.collateral_amount / PRECISION) + (positiondetail.vUSD_amount / PRECISION - calculatedX)).toFixed(4)
                                    )
                                }
                                kUSD</p>
                            <p>{marginRatio}</p>
                            {/* <p>{((positiondetail.collateral_amount/1000000).toFixed(2)/100)*8.5} kUSD</p> */}
                        </div>
                    </div>
                    <Button className="tphAdd" onClick={() => setAddShow(true)} >+ ADD</Button>
                    <Button className="tphDec" onClick={() => setCloseShow(true)}>- Reduce</Button>
                </div>
                <div className='positon_Status'>
                    <h3>Position Status</h3>
                    <div>
                        <div className='tpstatus'>
                            <p >{positiondetail.position == 1 ? "Long position" : "Short Position"}  </p>
                            <p>{(positiondetail.position_value / PRECISION).toFixed(4)} XTZ</p>
                            <p style={{ fontWeight: "bold" }} className="tpstatus_mobileview">Unrealized PNL</p>
                            <p className="tpstatus_mobileview_item">
                                {

                                    positiondetail.position == 1 ? (
                                        (calculatedX - positiondetail.vUSD_amount / PRECISION) < 0 ? (
                                            <span style={{ color: "#E01B3C", fontWeight: "bold" }}>
                                                {(calculatedX - positiondetail.vUSD_amount / PRECISION).toFixed(4)} kUSD </span>
                                        ) : (
                                            <span style={{ color: "#1ECC89", fontWeight: "bold" }}> {(calculatedX - positiondetail.vUSD_amount / PRECISION).toFixed(4)} kUSD</span>
                                        )
                                    ) : (
                                        (positiondetail.vUSD_amount / PRECISION - calculatedX) < 0 ? (
                                            <span style={{ color: "#E01B3C", fontWeight: "bold" }}>
                                                {(positiondetail.vUSD_amount / PRECISION - calculatedX).toFixed(4)} kUSD </span>
                                        ) : (
                                            <span style={{ color: "#1ECC89", fontWeight: "bold" }}> {(positiondetail.vUSD_amount / PRECISION - calculatedX).toFixed(4)} kUSD</span>
                                        )
                                    )
                                }


                            </p>
                            <Button onClick={() => setClosePosition(true)}>Close Position</Button>
                        </div>
                        <div className='tps_figures_values' >
                            <div>
                                <div className='tpsfigure'>
                                    <p>Entry Price</p>
                                    <p>Market Price</p>
                                    <p>Expected Close Price</p>
                                    <p>Net Funding</p>
                                </div>
                                <div className='tpsValues'>
                                    <p>{(parseFloat(positiondetail.entry_price) / PRECISION).toFixed(4)} XTZ</p>
                                    <p>{graph.marketprice} XTZ</p>
                                    <p>{expectedClose.toFixed(4)}  XTZ</p>
                                    {
                                        positiondetail.funding_amount < 0 ? (
                                            <p style={{ color: "#E01B3C" }}>{(positiondetail.funding_amount / PRECISION).toFixed(4)}</p>

                                        ) : (
                                            <p style={{ color: "#1ECC89" }}>{(positiondetail.funding_amount / PRECISION).toFixed(4)}</p>


                                        )
                                    }
                                </div>
                            </div>
                            <Button className='tphAdd' style={{ fontSize: "14px" }} onClick={() => setIncreaseshow(true)}>+ INCREASE</Button>
                            <Button className='tphDec' style={{ fontSize: "14px" }} onClick={() => setDecreaseshow(true)}>- DECREASE</Button>
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
                    <Modal.Title style={{ fontWeight: "bold" }} >Add Margin</Modal.Title>
                    <Button style={{ background: "none", border: "none", position: "relative", left: '20px' }}><img style={{ height: "25px" }} onClick={() => {
                        setAddShow(false)
                        setIsTxn(false)
                    }
                    } src='/img/icons8-close-30.png' /></Button>
                </Modal.Header>
                <Modal.Body>
                    <span style={{ position: "absolute", marginTop: "7px", marginLeft: "15px" }}><img style={{ height: "25px" }} src='/img/kusd.png' /></span>
                    <input value={addmarginvalue} type="number" onChange={async(event) => setaddmarginvalue((parseFloat(event.target.value)<=kusdTokenBalance)?event.target.value:addmarginvalue)} style={{ width: "100%", height: "40px", borderRadius: "5px", margin: "2px 0px", background: "#30313d", border: "none", textAlign: "right", padding: "0 10px" }} placeholder='Amount' />
                        <Box sx={{ width: 300 }} style={{marginLeft:"6px"}}>
                            <Slider
                                defaultValue={0}
                                aria-label="Default"
                                valueLabelDisplay="auto"
                                value={addmarginvalue}
                                min={0}
                                max={kusdTokenBalance}
                            onChange={(event) => setaddmarginvalue(event.target.value)}
                            />
                        </Box>
                    {/* <div className='marginbodydiv' style={{ borderBottom: "0.5px solid #30313d", fontWeight: "bold" }}>
                        <p>Liquidation price</p>
                        <p>{((positiondetail.collateral_amount/1000000).toFixed(2)/100)*8.5} kUSD</p>
                    </div> */}
                    <div className='marginbodydiv' style={{ marginTop: "10px" }}>
                        <p>Position margin</p>
                        <p>{(parseFloat((positiondetail.collateral_amount / PRECISION).toFixed(4)) + parseFloat(addmarginvalue)).toFixed(3)} kUSD</p>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }} >
                    {isTxn ? (<span style={{ width: "100% !important", position: "relative", left: "-35%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span>) : (
                        <Button variant="secondary" onClick={async () => {
                            try {
                                setIsTxn(true)
                                await addMargin(addmarginvalue).then(res => {
                                    gethistory()
                                    setIsTxn(false)
                                    if (res == undefined) {
                                        setType(
                                            {
                                                type: "Failed",
                                                message: "Transaction Aborted !",
                                            }
                                        )
                                        setSnackbarshow(true)
                                    } else {
                                        setCPosiitonUpdated(true)
                                        setType(
                                            {
                                                type: "success",
                                                message: "Transaction Successful!,",
                                                transaction: res
                                            }
                                        )
                                        setSnackbarshow(true)
                                    }
                                }).catch(res => {
                                    setType(
                                        {
                                            type: "failed",
                                            message: "Transaction failed!",
                                            // transaction: res
                                        }
                                    )
                                    setSnackbarshow(true)
                                })

                            }
                            catch (err) {
                                console.log(err)
                                setIsTxn(false)
                                setType(
                                    {
                                        type: "failed",
                                        message: "Transaction failed!",
                                        // transaction: res
                                    }
                                )
                                setSnackbarshow(true)
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
                    <Modal.Title style={{ fontWeight: "bold" }} >Reduce Margin</Modal.Title>
                    <Button style={{ background: "none", border: "none", position: "relative", left: '20px' }}><img style={{ height: "25px" }} onClick={() => {
                        setCloseShow(false)

                        setIsTxn(false)
                    }} src='/img/icons8-close-30.png' /></Button>

                </Modal.Header>
                <Modal.Body>

                    <span style={{ position: "absolute", marginTop: "7px", marginLeft: "15px" }}><img style={{ height: "25px" }} src='/img/kusd.png' /></span>
                    <input value={removemarginvalue} type="number" min="0" max="100000000" onChange={(event) => setremovemarginvalue(event.target.value)} style={{ width: "100%", height: "40px", borderRadius: "5px", margin: "2px 0px", background: "#30313d", border: "none", textAlign: "right", padding: "0 10px" }} placeholder='Amount' />
                    <Box sx={{ width: 300 }} style={{marginLeft:"6px"}}>
                            <Slider
                                defaultValue={0}
                                aria-label="Default"
                                valueLabelDisplay="auto"
                                value={removemarginvalue}
                                min ={0}
                                max ={(marginRatio-0.3)*(parseFloat(positiondetail.vUSD_amount) / PRECISION)}
                            onChange={(event) => setremovemarginvalue(event.target.value)}
                            />
                        </Box>
                    {/* <div className='marginbodydiv' style={{ borderBottom: "0.5px solid #30313d", fontWeight: "bold" }}>
                        <p>Liquidation price</p>
                        <p>{((positiondetail.collateral_amount/1000000).toFixed(2)/100)*8.5} kUSD</p>
                    </div> */}
                    <div className='marginbodydiv' style={{ marginTop: "10px" }}>
                        <p>Position margin</p>
                        <p>{(parseFloat((positiondetail.collateral_amount / PRECISION).toFixed(4)) - parseFloat(removemarginvalue)).toFixed(4)} kUSD</p>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }} >
                    {isTxn ? (<span style={{ width: "100% !important", position: "relative", left: "-35%" }}><ScaleLoader color='#E01B3C' width={7} margin={6} /> </span>) : (
                        <Button variant="secondary" onClick={async () => {
                            try {
                                setIsTxn(true)
                                await removeMargin(parseInt(removemarginvalue)).then(res => {
                                    gethistory()
                                    setIsTxn(false)

                                    if (res == undefined) {
                                        setType(
                                            {
                                                type: "Failed",
                                                message: "Transaction Aborted !",
                                            }
                                        )
                                        setSnackbarshow(true)
                                    } else {
                                        setType(
                                            {
                                                type: "success",
                                                message: "Transaction Successful!,",
                                                transaction: res
                                            }
                                        )
                                        setSnackbarshow(true)
                                    }
                                }).catch(err => {
                                    setType(
                                        {
                                            type: "failed",
                                            message: "Transaction failed!",
                                            // transaction: res
                                        }
                                    )
                                    setSnackbarshow(true)
                                })
                            }
                            catch (err) {
                                console.log(err)
                                setIsTxn(false)
                                setType(
                                    {
                                        type: "failed",
                                        message: "Transaction failed!",
                                    }
                                )
                                setSnackbarshow(true)
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
                    <Modal.Title style={{ fontWeight: "bold" }} >Close Position</Modal.Title>
                    <Button style={{ background: "none", border: "none", position: "relative", left: '20px' }}><img style={{ height: "25px" }} onClick={() => {
                        setClosePosition(false)
                        setIsTxn(false)
                    }} src='/img/icons8-close-30.png' /></Button>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ fontSize: "14px", color: "#96979c" }}>Are you sure you want to close the position?</p>

                    <div className='marginbodydiv' style={{ borderBottom: "0.5px solid #30313d", fontWeight: "bold" }}>
                        <p style={{ flexBasis: "55%" }}>Expected Close Price</p>
                        <p>{expectedClose.toFixed(4)}</p>
                    </div>
                    <div className='marginbodydiv' style={{ marginTop: "10px", fontWeight: "bold" }}>
                        <p>Your Profit</p>
                        <p>
                            {

                                positiondetail.position == 1 ? (
                                    ((calculatedX - (positiondetail.vUSD_amount / PRECISION)) + (positiondetail.funding_amount / PRECISION)) < 0 ? (
                                        <span style={{ color: "#E01B3C", fontWeight: "bold" }}>
                                            {((calculatedX - (positiondetail.vUSD_amount / PRECISION)) + positiondetail.funding_amount / PRECISION).toFixed(4)} kUSD </span>
                                    ) : (
                                        <span style={{ color: "#1ECC89", fontWeight: "bold" }}> {((calculatedX - positiondetail.vUSD_amount / PRECISION) + positiondetail.funding_amount / PRECISION).toFixed(4)} kUSD</span>
                                    )
                                ) : (
                                    (((positiondetail.vUSD_amount / PRECISION) - calculatedX) + positiondetail.funding_amount / PRECISION) < 0 ? (
                                        <span style={{ color: "#E01B3C", fontWeight: "bold" }}>
                                            {(((positiondetail.vUSD_amount / PRECISION) - calculatedX) + positiondetail.funding_amount / PRECISION).toFixed(4)} kUSD </span>
                                    ) : (
                                        <span style={{ color: "#1ECC89", fontWeight: "bold" }}> {((positiondetail.vUSD_amount / PRECISION - calculatedX) + positiondetail.funding_amount / PRECISION).toFixed(4)} kUSD</span>
                                    )
                                )
                            }
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: "none", display: "flex", width: "100%", justifyContent: "center" }} >

                    {isTxn ? (<span style={{ width: "100% !important", position: "relative", left: "0%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span>) : (
                        <>
                            <Button variant="secondary"
                                onClick={
                                    async () => {
                                        try {
                                            setIsTxn(true);
                                            await closePosition().then(res => {
                                                if (res == "success") {
                                                    setIsTxn(false);
                                                    setClosePosition(false)
                                                    setCPosiitonUpdated(CPosiitonUpdated ? true : false)

                                                }
                                            }).catch((err) => {
                                                console.log(err)
                                                // SnackbarUtils.error("Error Please Try Again")
                                                setIsTxn(false);
                                                setClosePosition(false)
                                                setType(
                                                    {
                                                        type: "success",
                                                        message: "Transaction Successful!,",
                                                        // transaction: res
                                                    }
                                                )
                                                setSnackbarshow(true)
                                            });

                                        }
                                        catch (err) {
                                            setIsTxn(false);
                                        }

                                    }
                                }
                                style={{ minWidth: "42%", marginRight: "10px", background: "#1ECC89", fontWeight: "bold" }}
                            >
                                Yes
                            </Button>
                            <Button variant="secondary" onClick={() => setClosePosition(false)}
                                style={{ minWidth: "42%", background: "#e01b3c", fontWeight: "bold" }}
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
                <Modal.Header style={{ border: "none", position: "relative", left: "10px" }} closeButton>
                    <Modal.Title style={{ fontWeight: "bold" }} >Increase Position</Modal.Title>
                    <Button style={{ background: "none", border: "none", position: "relative", left: '10px' }}><img style={{ height: "25px" }} onClick={() => {
                        setIncreaseshow(false)
                        setIsTxn(false)
                    }} src='/img/icons8-close-30.png' /></Button>

                </Modal.Header>
                <Modal.Body style={{ position: "relative", left: "10px" }}>
                    <div className='tradebox_amount'>
                        <span className='tradebox_inputicon'><img style={{ padding: "0 6px", marginTop: "-4px", height: "32px" }} src="img/kusd.png" alt="" />kUSD</span>
                        <input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" step="0.01" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" onChange={(event) => setBaseValue(event.target.value, setOpenlongpriceImpact())} />
                        <div style={{ width: "100%", position: "relative", fontSize: "11px", height: "10px", fontWeight: "bold", margin: "2px 0", padding: "2px 0", color: "#a9a9a9" }}>
                            <div style={{ position: "absolute", right: "10px" }}>
                                <button type='button' className='amount_percent_btn' onClick={() => { addBaseValue(25) }} >25%</button>
                                <button type='button' className='amount_percent_btn' onClick={() => { addBaseValue(50) }} >50%</button>
                                <button type='button' className='amount_percent_btn' onClick={() => { addBaseValue(75) }} >75%</button>
                                <button type='button' className='amount_percent_btn' onClick={() => { addBaseValue(100) }} >100%</button>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: "10px" }} className='tradebox_leverage'>
                        <h6>Leverage</h6>
                        <Slider
                            aria-label="Temperature"
                            defaultValue={1}
                            className="tradebox_levslider"
                            value={rangeValue}
                            onChange={(event) => setRangeValue(event.target.value)}
                            color={'primary'}
                            sx={{ color: `grey` }}
                            step={1}
                            marks
                            min={1}
                            max={3}
                            style={{ width: '90%' }} /> <span style={{ position: "absolute", bottom: "6px", fontSize: "14px", right: "25px", fontWeight: "bold" }}>{rangeValue}x</span> <br />
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600", marginTop: "20px", marginLeft: "-8px" }}>You are buying in the long</p>
                    <table className='tradebox_table1' style={{ width: "100%" }}>
                        <tbody>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Position size</td>
                                <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseXrange == 0 ? ((baseValue == null) ? 0 : (baseValue / graph.marketprice).toFixed(4)) : ((baseXrange / graph.marketprice).toFixed(4))} XTZ <img src="img/tz.svg" /></td>
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
                                <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue} kUSD</td>
                            </tr>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Trading Fee</td>
                                <td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{(baseValue / 100) * 2} kUSD</td>
                            </tr>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
                                <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue == 0 ? 0 : priceImpact.toFixed(4)}%</td>
                            </tr>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
                                <td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
                            </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }} >
                    {isTxn ? (<span style={{ width: "100% !important", position: "relative", left: "-35%" }}><ScaleLoader color='#1ECC89' width={7} margin={6} /> </span>) : (
                        <Button variant="secondary"
                            style={{ minWidth: "98%", background: "#1ECC89", fontWeight: "bold" }}
                            onClick={() => IncreaseOrDecreaseFunc(baseValue, rangeValue, positiondetail.position)}

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
                <Modal.Header style={{ border: "none", position: "relative", left: "10px" }} closeButton>
                    <Modal.Title style={{ fontWeight: "bold" }} >Decrease Position</Modal.Title>
                    <Button style={{ background: "none", border: "none", position: "relative", left: '10px' }}><img style={{ height: "25px" }} onClick={() => {
                        setDecreaseshow(false)
                        setIsTxn(false)
                    }} src='/img/icons8-close-30.png' /></Button>

                </Modal.Header>
                <Modal.Body style={{ position: "relative", left: "10px" }}>
                    <div className='tradebox_amount'>
                        <span className='tradebox_inputicon'><img style={{ padding: "0 6px", marginTop: "-4px", height: "32px" }} src="img/kusd.png" alt="" />kUSD</span>
                        <input value={baseValue} style={{ fontFamily: "'Inter', sans-serif" }} type="number" min="0" max="100000000" step="0.01" className="tradebox" id="outlined-basic" placeholder="Amount" variant="outlined" onChange={(event) => setBaseValue(event.target.value )}/>
                        <div style={{ width: "100%", position: "relative", fontSize: "11px", height: "10px", fontWeight: "bold", margin: "2px 0", padding: "2px 0", color: "#a9a9a9" }}>
                            <div style={{ position: "absolute", right: "10px" }}>
                                <button type='button' className='amount_percent_btn' onClick={() => { decreasepositionvalue(25) }} >25%</button>
                                <button type='button' className='amount_percent_btn' onClick={() => { decreasepositionvalue(50) }} >50%</button>
                                <button type='button' className='amount_percent_btn' onClick={() => { decreasepositionvalue(75) }} >75%</button>
                                <button type='button' className='amount_percent_btn' onClick={() => { decreasepositionvalue(100) }} >100%</button>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: "10px" }} className='tradebox_leverage'>
                        <h6>Leverage</h6>
                        <Slider
                            aria-label="Temperature"
                            defaultValue={1}
                            className="tradebox_levslider"
                            value={rangeValue}
                            onChange={(event) => setRangeValue(decreasePercentage>74?1:decreasePercentage==50? (event.target.value==3?2:event.target.value):event.target.value)}
                            color={'primary'}
                            sx={{ color: `grey` }}
                            step={1}
                            marks
                            min={1}
                            max={3}
                            style={{ width: '90%' }} /> <span style={{ position: "absolute", bottom: "6px", fontSize: "14px", right: "25px", fontWeight: "bold" }}>{rangeValue}x</span> <br />
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: "600", marginTop: "20px", marginLeft: "-8px" }}>You are buying in the long</p>
                    <table className='tradebox_table1' style={{ width: "100%" }}>
                        <tbody>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", color: "#797979", fontWeight: "600" }}>Position size</td>
                                <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseXrange == 0 ? ((baseValue == null) ? 0 : (baseValue / graph.marketprice).toFixed(2)) : ((baseXrange / graph.marketprice).toFixed(4))} XTZ <img src="img/tz.svg" /></td>
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
                                <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue} kUSD</td>
                            </tr>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Trading Fee</td>
                                <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{(baseValue / 100) * 2} kUSD</td>
                            </tr>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "40%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Price impact</td>
                                <td style={{ width: "60%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>{baseValue == 0 ? 0 : priceImpact.toFixed(2)}%</td>
                            </tr>
                            <tr style={{ width: "100%" }}>
                                <td style={{ width: "70%", fontFamily: "'Inter', sans-serif", fontWeight: "600", color: "#C0C0C0" }}>Slippage tolerance</td>
                                <td style={{ width: "30%", textAlign: "end", fontFamily: "'Inter', sans-serif" }}>2%</td>
                            </tr>
                        </tbody>

                    </table>
                </Modal.Body>
                <Modal.Footer style={{ border: "none" }} >
                    {isTxn ? (<span style={{ width: "100% !important", position: "relative", left: "-35%" }}><ScaleLoader color='#E01B3C' width={7} margin={6} /> </span>) : (
                        <Button variant="secondary"
                            style={{ minWidth: "98%", background: "#e01b3c", fontWeight: "bold" }}
                            onClick={async () => {


                                try {
                                    setIsTxn(true)
                                    await decreasePosition(rangeValue, baseValue).then(res => {
                                        gethistory()
                                        setDecreaseshow(false)
                                        setCPosiitonUpdated(true)
                                        setIsTxn(false)
                                        if (res == undefined) {
                                            setType(
                                                {
                                                    type: "Failed",
                                                    message: "Transaction Aborted !",
                                                }
                                            )
                                            setSnackbarshow(true)
                                        } else {
                                            setType(
                                                {
                                                    type: "success",
                                                    message: "Transaction Successful!,",
                                                    transaction: res
                                                }
                                            )
                                            setSnackbarshow(true)
                                        }
                                    }).catch(err => {
                                        setIsTxn(false)

                                        setType(
                                            {
                                                type: "Failed",
                                                message: "Transaction Failed !",
                                            }
                                        )
                                        setSnackbarshow(true)
                                    })

                                }
                                catch (err) {
                                    console.log(err)
                                    setIsTxn(false)

                                }
                            }
                            }
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