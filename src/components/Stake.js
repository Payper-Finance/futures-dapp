import React, { useState } from 'react'
import { Button } from 'react-bootstrap'

const Stake = () => {

  const [stakingTabs, setStakingTabs] = useState('staking')


  return (
    <div className='stake p-5'>
      <link rel="stylesheet" href="/styles/stake.css" />
      <div className="heading-banner text-start p-5">
        <div className="heading-name p-4">
          <h2 className='fw-bolder'>Staking</h2>
          <h5>Total in staking 106852 ZNTH</h5>
        </div>
        <div className="heading-infos d-flex">
          <div className="heading-info">
            <div className="heading-info-title">Available to stake</div>
            <div className="heading-info-value">0 ZNTH</div>
          </div>
          <div className="heading-info">
            <div className="heading-info-title">Staked Balance</div>
            <div className="heading-info-value">0 ZNTH</div>
          </div>
          <div className="heading-info">
            <div className="heading-info-title">APY</div>
            <div className="heading-info-value">3.81%</div>
          </div>
          <div className="heading-info">
            <div className="heading-info-title">Total profit</div>
            <div className="heading-info-value">0 kUSD</div>
          </div>
        </div>
      </div>


      <div className="stake-main d-flex">
        <div className="staking me-auto p-4">
          <div className="d-flex staking-tabs my-3 mx-2">
            <div className={`staking-tab  ${stakingTabs === 'staking'?'staking-tabs-sel':''} `} onClick={()=>{setStakingTabs('staking')}} >Staking</div>
            <div className={`staking-tab  ${stakingTabs === 'unstaking'?'staking-tabs-sel':''} `} onClick={()=>{setStakingTabs('unstaking')}} >Unstaking</div>
            <div className={`staking-tab  ${stakingTabs === 'claiming'?'staking-tabs-sel':''} `} onClick={()=>{setStakingTabs('claiming')}} >Claiming</div>
          </div>


          {stakingTabs==='staking'?(<>
          <div className=" w-100 staking-content d-flex">
            <input type="text" className='x-auto px-3' placeholder='ZNTH' name="staking" id="staking-input" />
            <button className='staking-btn'>0.00</button>
          </div>
          {/* <p className="text-danger text-start">Insufficient XTZ balance</p> */}

          <div className="profits">
            <div className="profit d-flex">
              <div className="me-auto">Daily Profit</div>
              <div><span className="text-success">+0</span> kUSD</div>
            </div>
            <div className="profit d-flex">
              <div className="me-auto">Monthly Profit</div>
              <div><span className="text-success">+0</span> kUSD</div>
            </div>
            <div className="profit d-flex">
              <div className="me-auto">Yearly Profit</div>
              <div><span className="text-success">+0</span> kUSD</div>
            </div>
          </div>

          <button className="staking-button">Stake</button>
          </>):
          stakingTabs==='unstaking'?
          <>
            <div className=" w-100 staking-content d-flex mt-4">
              <input type="text" className='x-auto px-3' placeholder='ZNTH' name="staking" id="staking-input" />
              <button className='staking-btn'>Amount</button>
            </div>
            <p className="text-start">Staked 0 ZNTH.<span style={{fontSize:"12px",color:"rgba(98, 108, 182, 1)",marginLeft:"5px"}}>Spend the entire amount.</span> </p>
          <button className="staking-button">Unstake</button>
          </>:
          <>
            <div className=" w-100 staking-content d-flex mt-4">
              <input type="text" className='w-100 px-3' placeholder='You will recieve    0.00 kUSD' name="staking" id="staking-input" />
            </div>
          <button className="staking-button my-5">Claim</button>
          </>
          }

        </div>
        <div className='Balance'>
          <h4>Balance</h4>
          <input placeholder='0 ZNTH' type="text"/>
          <div className='availabel_stake_balance'>
          <p>Available to Stake</p>
          <p>0 ZNTH</p>
          </div>
          <Button>BUY ZNTH</Button>
        </div>
        
        <div className="benefits  text-start p-4">
          <h3 className="fw-bold">How do I benefit from staking?</h3>
          <p>Protocol takes a flat 1% fee on each trade. Half of this amount is redistributed among the XTZ token stackers. Stakers will receive vUSD continuously proportional to their portion of the total XTZ in staking. Rewards will accrue every 1 hour.</p>
        </div>
      </div>
    </div>
  )
}

export default Stake
