const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const socket = require('socket.io')
const cors = require('cors');
const axios = require('axios')
const { TradeDataHour, TradeDataDay, TradeDataMinute } = require("./models/TradeData");
const PositionHistory = require('./models/PositionHistory')
const TokenIssue = require('./models/TokensAddress')
const { validateAddress } = require("@taquito/utils")
const signalR = require("@microsoft/signalr");
const { TezosToolkit } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

const PRECISION = 1000000000000000000;


dotenv.config();

const Tezos = new TezosToolkit("https://rpc.ghostnet.teztnets.xyz/");

Tezos.setProvider({
  signer: new InMemorySigner(process.env.PVT_KEY)
})
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => { console.log("connected to db") }).catch((err) => { console.log(err) });

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
const server = app.listen(8000, () => {
  console.log('Started in 8000 PORT')
})

const iO = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});




const senddata = async () => {
  var x = await TradeDataMinute.find().limit(1).sort({ $natural: -1 }).limit(1)
    .then((results) => {
      return results
    })
  return x;
}

iO.on('connection', (client) => {


  client.on("message", async (data) => {
    if (data == "history") {
      TradeDataMinute.find({}, function (err, result) {
        if (err) throw err;

        client.emit("data1", result);
      });
    }
    else if (data == "upDate") {
      var x = await senddata();
      client.emit("data2", x);
    }
  })
  TradeDataMinute.watch([{ $match: { operationType: { $in: ['insert'] } } }]).
    on('change', data => {
      console.log('Insert action triggered'); //getting triggered thrice
      client.emit("data4", data.fullDocument.Close);
    });
  TradeDataMinute.watch([{ $match: { operationType: { $in: ['update'] } } }]).
    on('change', data => {
      console.log('UpDate action triggered'); //getting triggered thrice
      client.emit("data4", data.updateDescription.updatedFields.Close);
    });
});
console.log('A user connected');





const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.ghostnet.tzkt.io/v1/ws")
    .build();
async function init() {
  await connection.start();
  await connection.invoke("SubscribeToOperations", {
    address: process.env.VMMCONTRACT,
    types: 'transaction'
  });
};
connection.onclose(init);


connection.on("operations", (msg) => {
  try{
    console.log(msg)
    if (msg.type == 1) {

      let data = msg.data;
      for (let i = 0; i < data.length; i++) {
        if (!!data[i].initiator && !!data[i].parameter.entrypoint) {
          var OpHash = data[i].hash;
          positionAction(OpHash);
          // LiquidationFunction()
        }
      }
      tradeaction();
  
    }
  }
  catch(err){
    console.log(err)
  }

});

init();




// POSITION DETAIL -------------------------------------------------------------------------------------------------------------------
const positionAction = async (opHash) => {
  let TransactionId = opHash
  console.log(TransactionId)

  try {
    let storage = await axios.get(`https://api.ghostnet.tzkt.io/v1/operations/transactions/${TransactionId}`).then(result => {
      return result.data
    })
    if (storage.length == 0) {
      return
    }

    let transaction;
    for (let i = 0; i < storage.length; i++) {
      if (storage[i].target.address == process.env.VMMCONTRACT) {
        transaction = storage[i]
        break
      }
    }

    let action = transaction.parameter.entrypoint
    let address;
    if(action=="liquidate"){
      address = transaction.parameter.value
      const liquidationResult = await PositionHistory.findOne({ Address: address })
      let liquidationcount
      if(liquidationResult.LiquidationCount == null){
        liquidationcount =1;
      }
      else{
        
        liquidationcount = parseInt(liquidationResult.LiquidationCount) + 1;
      }
      
    await PositionHistory.findOneAndUpdate({ Address: key }, {
      $set: {
        LiquidationCount: liquidationcount
      }
    })
    }
    else{
      address = transaction.sender.address

    }
    const result = await PositionHistory.findOne({ Address: address })

    if (result) {

      if (action == "closePosition" || action == "liquidate" ) {
        let totalrealize;
        let setcloseposition;
        let isliquidate = false
        if (action == "liquidate") {
          setcloseposition = await PositionHistory.findOne({ Address: transaction.parameter.value })
          isliquidate =true
        }
        else {

          setcloseposition = await PositionHistory.findOne({ Address: address })
        }

        let transferDetails = storage[1].parameter.value.value

        let positionsdetails = setcloseposition.LivePosition

        if (Object.keys(positionsdetails).length === 0) {
          return
        }

        console.log("transferdetails - " + transferDetails / PRECISION)
        console.log("postiiondetails - " + positionsdetails.position_amount)

        let calculatelivepnl = ((parseFloat(transferDetails / PRECISION) - parseFloat(positionsdetails.position_amount))).toFixed(3)


        var date = Date(transaction.timestamp);
        let lastData = {
          time: date.toLocaleString(),
          position: positionsdetails.position,
          entry_price: positionsdetails.entry_price,
          vUSD_amount: positionsdetails.vUSD_amount,
          position_value: positionsdetails.position_value,
          collateral_amount: positionsdetails.collateral_amount,
          realizedpnl: calculatelivepnl,
          liquidate:isliquidate
        }
        if (result.Totalpnl == undefined) {
          totalrealize = calculatelivepnl
        }
        else {
          totalrealize = parseFloat(result.Totalpnl) + parseFloat(calculatelivepnl)
        }
        console.log(totalrealize)
        await PositionHistory.findOneAndUpdate({ Address: address }, {
          $push: {
            CompletedPosition: lastData
          }
        })
        await PositionHistory.findOneAndUpdate({ Address: address }, {
          $set: {
            Totalpnl: totalrealize
          }
        })
        let data = {
          $set: {
            LivePosition: {}
          }
        }

        PositionHistory.findOneAndUpdate({ Address: address }, data, function (err, res) {
          if (err) throw err;
        })
      }
      else {
        console.log("test1")
        let data

        let setcloseposition = await PositionHistory.findOne({ Address: address })

        let positionsdetailsprev = setcloseposition.LivePosition

        let positionsdetails = transaction.storage.positions[address]

        var date = Date(transaction.timestamp);

        if (action == "decreasePosition") {

          data = {
            time: date.toLocaleString(),
            position: positionsdetails.position,
            entry_price: (positionsdetails.entry_price / PRECISION).toFixed(2),
            funding_amount: (positionsdetails.funding_amount / PRECISION).toFixed(2),
            vUSD_amount: (positionsdetails.vUSD_amount / PRECISION).toFixed(2),
            position_value: (positionsdetails.position_value / PRECISION).toFixed(2),
            collateral_amount: (positionsdetails.collateral_amount / PRECISION).toFixed(2),
            position_amount: positionsdetailsprev.position_amount
          }
        }

        else if (action == "increasePosition") {
          let position_amount
          if (Object.keys(positionsdetailsprev).length === 0) {
            prevPosition = 0
          }
          else {
            prevPosition = positionsdetailsprev.position_amount
          }
          position_amount = transaction.parameter.value.vUSD_amount - ((transaction.parameter.value.vUSD_amount / 100) * 2)

          data = {
            time: date.toLocaleString(),
            position: positionsdetails.position,
            entry_price: (positionsdetails.entry_price / PRECISION).toFixed(2),
            funding_amount: (positionsdetails.funding_amount / PRECISION).toFixed(2),
            vUSD_amount: (positionsdetails.vUSD_amount / PRECISION).toFixed(2),
            position_value: (positionsdetails.position_value / PRECISION).toFixed(2),
            collateral_amount: (positionsdetails.collateral_amount / PRECISION).toFixed(2),
            position_amount: (parseFloat(prevPosition) + (position_amount / PRECISION)).toFixed(2)
          }

        }
        else {
          let position_amount
          if (action == "addMargin") {
            position_amount = transaction.parameter.value
          }
          else {

            position_amount = -(transaction.parameter.value)
          }
          data = {
            time: date.toLocaleString(),
            position: positionsdetails.position,
            entry_price: (positionsdetails.entry_price / PRECISION).toFixed(2),
            funding_amount: (positionsdetails.funding_amount / PRECISION).toFixed(2),
            vUSD_amount: (positionsdetails.vUSD_amount / PRECISION).toFixed(2),
            position_value: (positionsdetails.position_value / PRECISION).toFixed(2),
            collateral_amount: (positionsdetails.collateral_amount / PRECISION).toFixed(2),
            position_amount: (parseFloat(positionsdetailsprev.position_amount) + (position_amount / PRECISION)).toFixed(3)
          }

        }

        await PositionHistory.findOneAndUpdate({ Address: address }, {
          $set: {
            LivePosition: data
          }
        })

      }
    }
    else {
      let positionsdetails = transaction.storage.positions[address]
      let position_amount = transaction.parameter.value.vUSD_amount - ((transaction.parameter.value.vUSD_amount / 100) * 2)
      var date = Date(transaction.timestamp);
      let data = {
        Address: address,
        CompletedPosition: [],
        LivePosition: {
          time: date.toLocaleString(),
          position: positionsdetails.position,
          entry_price: (positionsdetails.entry_price / PRECISION).toFixed(2),
          funding_amount: (positionsdetails.funding_amount / PRECISION).toFixed(2),
          vUSD_amount: (positionsdetails.vUSD_amount / PRECISION).toFixed(2),
          position_value: (positionsdetails.position_value / PRECISION).toFixed(2),
          collateral_amount: (positionsdetails.collateral_amount / PRECISION).toFixed(2),
          position_amount: (position_amount / PRECISION).toFixed(3)
        }
      }
      PositionHistory.create(data)
    }
  } catch (err) {
    console.log(err)
  }
}











// LEADERBOARD DATA -------------------------------------------------------------------------------------------------------------------

app.get('/leaderboard', async (req, res) => {
  try{
    const result = await PositionHistory.find({}).then(function (data) {
      return data
    }).catch(err => console.log(err))
    result.sort(function (a, b) {
      return parseFloat(a.Totalpnl) - parseFloat(b.Totalpnl);
    });

    res.send(result)
  }catch(err){
    console.log(err)
  }
})







// POSITION History-------------------------------------------------------------------------------------------------------------------


app.post('/positionshistory', async (req, res) => {
  let address = req.body.address;
  const result = await PositionHistory.findOne({ Address: address }).select("Address").lean();
  if (result) {
    let data = await PositionHistory.findOne({ Address: address }).then(res => {
      return res
    }).catch(err => {
      return false
    })
    res.send(data.CompletedPosition)
  }
  else {
    res.send(false)
  }
})







// POST ACTION -------------------------------------------------------------------------------------------------------------------


const tradeaction = async () => {
  let storage = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/${process.env.VMMCONTRACT}/storage/`).then(result => {
    return result.data
  })
  let marketpricedata = (storage.current_mark_price / PRECISION).toFixed(4)

  var previous_data_Minute = await TradeDataMinute.find().limit(1).sort({ $natural: -1 }).limit(1);
  var previous_data_Hour = await TradeDataHour.find().limit(1).sort({ $natural: -1 }).limit(1);
  var previous_data_Day = await TradeDataDay.find().limit(1).sort({ $natural: -1 }).limit(1);
  if (previous_data_Minute.length == 0) {
    let data = {
      Date: new Date(),
      Open: marketpricedata,
      Close: marketpricedata,
      High: marketpricedata,
      Low: marketpricedata
    }
    TradeDataMinute.create(data)
    TradeDataHour.create(data)
    TradeDataDay.create(data)
    console.log("1 document upDated 000.1");
    return
  }
  var newdate_Minute = new Date().getMinutes();
  var newdate_Hour = new Date().getHours();
  var newdate_Day = new Date().getDate();
  console.log(newdate_Hour)

  console.log(newdate_Day)

  if (previous_data_Minute[0].Date.getMinutes() - newdate_Minute >= 5) {
    let data = {
      Date: new Date(),
      Open: marketpricedata,
      Close: marketpricedata,
      High: marketpricedata,
      Low: marketpricedata
    }
    TradeDataMinute.create(data)
    console.log("1 document upDated 000.12");
  }

  if (previous_data_Hour[0].Date.getHours() - newdate_Hour >= 1) {
    let data = {
      Date: new Date(),
      Open: marketpricedata,
      Close: marketpricedata,
      High: marketpricedata,
      Low: marketpricedata
    }
    TradeDataHour.create(data)
    console.log("1 document upDated 000.123");
  }
  console.log(previous_data_Day[0])
  if (previous_data_Day[0].Date.getDate() - newdate_Day >= 1) {
    let data = {
      Date: new Date(),
      Open: marketpricedata,
      Close: marketpricedata,
      High: marketpricedata,
      Low: marketpricedata
    }
    TradeDataDay.create(data)
    console.log("1 document upDated");
    return
  }
  else {
    if (marketpricedata > previous_data_Minute[0].High) {
      var newvalues = { $set: { time: previous_data_Minute[0].Date, Open: previous_data_Minute[0].Open, Close: marketpricedata, High: marketpricedata, Low: previous_data_Minute[0].Low } };

      TradeDataMinute.findByIdAndUpdate({ _id: previous_data_Minute[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else if (marketpricedata < previous_data_Minute[0].Low) {

      var newvalues = { $set: { time: previous_data_Minute[0].Date, Open: previous_data_Minute[0].Open, Close: marketpricedata, High: previous_data_Minute[0].High, Low: marketpricedata } };
      TradeDataMinute.findByIdAndUpdate({ _id: previous_data_Minute[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else {

      var newvalues = { $set: { time: previous_data_Minute[0].Date, Open: previous_data_Minute[0].Open, Close: marketpricedata, High: previous_data_Minute[0].High, Low: previous_data_Minute[0].Low } };
      TradeDataMinute.findByIdAndUpdate({ _id: previous_data_Minute[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }




    if (marketpricedata > previous_data_Hour[0].High) {
      var newvalues = { $set: { time: previous_data_Hour[0].Date, Open: previous_data_Hour[0].Open, Close: marketpricedata, High: marketpricedata, Low: previous_data_Hour[0].Low } };

      TradeDataHour.findByIdAndUpdate({ _id: previous_data_Hour[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else if (marketpricedata < previous_data_Hour[0].Low) {

      var newvalues = { $set: { time: previous_data_Hour[0].Date, Open: previous_data_Hour[0].Open, Close: marketpricedata, High: previous_data_Hour[0].High, Low: marketpricedata } };
      TradeDataHour.findByIdAndUpdate({ _id: previous_data_Hour[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else {

      var newvalues = { $set: { time: previous_data_Hour[0].Date, Open: previous_data_Hour[0].Open, Close: marketpricedata, High: previous_data_Hour[0].High, Low: previous_data_Hour[0].Low } };
      TradeDataHour.findByIdAndUpdate({ _id: previous_data_Hour[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    

    if (marketpricedata > previous_data_Day[0].High) {
      var newvalues = { $set: { time: previous_data_Day[0].Date, Open: previous_data_Day[0].Open, Close: marketpricedata, High: marketpricedata, Low: previous_data_Day[0].Low } };

      TradeDataDay.findByIdAndUpdate({ _id: previous_data_Day[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else if (marketpricedata < previous_data_Day[0].Low) {

      var newvalues = { $set: { time: previous_data_Day[0].Date, Open: previous_data_Day[0].Open, Close: marketpricedata, High: previous_data_Day[0].High, Low: marketpricedata } };
      TradeDataDay.findByIdAndUpdate({ _id: previous_data_Day[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else {

      var newvalues = { $set: { time: previous_data_Day[0].Date, Open: previous_data_Day[0].Open, Close: marketpricedata, High: previous_data_Day[0].High, Low: previous_data_Day[0].Low } };
      TradeDataDay.findByIdAndUpdate({ _id: previous_data_Day[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }


  }

}


// SEND CANDLE DATA -------------------------------------------------------------------------------------------------------------------
const getData = async () => {

  const result = await TradeDataMinute.find({}).sort({ _id: -1 }).limit(100, function (data) {
    return data.reverse()
  }).catch(err => console.log(err))

  return result
}

app.get('/granularity/', async (req, res) => {
  console.log(req.query.candle)
  if (req.query.candle == "5minute") {
    const result = await getData();
    res.send(result.reverse())
  }
  else if (req.query.candle == "15minute") {
    var newdate_Minute = new Date().getMinutes();
    let x = 0
    if(newdate_Minute%15>=5 && newdate_Minute%15<10){
      x=2;
    }
    if(newdate_Minute%15>0 && newdate_Minute%15<5){
      x=1;
    }
    const result = await TradeDataMinute.find({}).sort({ _id: -1 }).limit(864+x, function (data) {
      return data
    }).catch(err => console.log(err))

    result.reverse()

    let newarr = []
    for (let i = 0; i < result.length; i = i + 3) {
      let Open = result[i].Open;
      let High = result[i].High;
      let Low = result[i].Low;
      let Close = result[i].Close;
      for (let j = i; j < i + 3; j++) {
        if (j + 1 > result.length) {
          break
        }
        if (High < result[j].High) {
          High = result[j].High
        }
        if (Low > result[j].Low) {
          Low = result[j].Low
        }
        Close = result[j].Close
      }
      let data = {
        Date: result[i].Date,
        Open: Open,
        High: High,
        Low: Low,
        Close: Close,
      }
      newarr.push(data)
    }
    res.send(newarr)
  }
  else if (req.query.candle == "hour") {
    const result = await TradeDataHour.find({}).then(function (data) {
      return data
    }).catch(err => console.log(err))
    res.send(result)
  }
  else if (req.query.candle == "day") {
    const result = await TradeDataDay.find({}).then(function (data) {
      return data
    }).catch(err => console.log(err))
    res.send(result)
  }
})



var nextTick = function () {
  return 300000 - (new Date().getTime() % 300000);
}, timerFunction = async () => {

  let storage = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/${process.env.VMMCONTRACT}/storage/`).then(result => {
    return result.data
  })
  let marketpricedata = (storage.current_mark_price / PRECISION).toFixed(3)
  var newdate_Minute = new Date().getMinutes();
  var newdate_Hour = new Date().getHours();
  var previous_data_Minute = await TradeDataMinute.find().limit(1).sort({ $natural: -1 }).limit(1);
  if ((previous_data_Minute.length == 0)) {
    let data = {
      Date: new Date(),
      Open: marketpricedata,
      Close: marketpricedata,
      High: marketpricedata,
      Low: marketpricedata
    }
    TradeDataMinute.create(data)
    TradeDataHour.create(data)
    TradeDataDay.create(data)
  }
  else {

    if (newdate_Minute % 5 == 0) {
      var newvalues = { Date: new Date(), Open: marketpricedata, Close: marketpricedata, High: marketpricedata, Low: marketpricedata };
      await TradeDataMinute.create(newvalues);
       
      if (newdate_Minute == 0) {
        var newvalues = { Date: new Date(), Open: marketpricedata, Close: marketpricedata, High: marketpricedata, Low: marketpricedata };
        TradeDataHour.create(newvalues);
      }
      if (newdate_Hour == 0 && newdate_Minute == 0) {
        var newvalues = { Date: new Date(), Open: marketpricedata, Close: marketpricedata, High: marketpricedata, Low: marketpricedata };
        TradeDataDay.create(newvalues);
      }
    }
  }
  setTimeout(timerFunction, nextTick());
};
var timeout = setTimeout(timerFunction, nextTick());


