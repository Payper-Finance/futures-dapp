const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const socket = require('socket.io')
const cors = require('cors');
const axios = require('axios')
const TradeData = require("./models/TradeData");
const PositionHistory = require('./models/PositionHistory')
const TokenIssue = require('./models/TokensAddress')
const { validateAddress } = require("@taquito/utils")
const signalR = require('@aspnet/signalr');
const { TezosToolkit } = require("@taquito/taquito");
const { InMemorySigner } = require("@taquito/signer");

const PRECISION = 1000000000000000000;


dotenv.config();

const Tezos = new TezosToolkit("https://rpc.ghostnet.teztnets.xyz/");


mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => { console.log("connected to db") }).catch((err) => { console.log(err) });





app.use(cors({ origin: '*' }));

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
  var x = await TradeData.find().limit(1).sort({ $natural: -1 }).limit(1)
    .then((results) => {
      return results
    })
  return x;
}

iO.on('connection', (client) => {


  client.on("message", async (data) => {
    if (data == "history") {
      TradeData.find({}, function (err, result) {
        if (err) throw err;

        client.emit("data1", result);
      });
    }
    else if (data == "upDate") {
      var x = await senddata();
      client.emit("data2", x);
    }
  })
  TradeData.watch([{ $match: { operationType: { $in: ['insert'] } } }]).
    on('change', data => {
      console.log('Insert action triggered'); //getting triggered thrice
      client.emit("data3", data.fullDocument.Close);
    });
  TradeData.watch([{ $match: { operationType: { $in: ['update'] } } }]).
    on('change', data => {
      console.log('UpDate action triggered'); //getting triggered thrice
      client.emit("data4", data.updateDescription.updatedFields.Close);
    });
});
console.log('A user connected');




const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://api.ghostnet.tzkt.io/v1/events")
  .build();

async function init() {
  // open connection
  await connection.start();
  await connection.invoke("SubscribeToOperations", {
    address: 'KT1H84ek1UKTEz6ELSpQNS8s38b4kXrANHy3',
    types: 'transaction'
  });
};

connection.onclose(init);

connection.on("operations", async (msg) => {
  if (msg.type == 1) {
    console.log(msg.data[0].hash)
    var OpHash = msg.data[0].hash;
    await positionAction(OpHash);
    await tradeaction();
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
      if (storage[i].target.address == "KT1H84ek1UKTEz6ELSpQNS8s38b4kXrANHy3") {
        transaction = storage[i]
        break
      }
    }

    let address = transaction.sender.address
    let action = transaction.parameter.entrypoint
    const result = await PositionHistory.findOne({ Address: address })
    if (result) {


      if (action == "closePosition") {
        let totalrealize;
        let setcloseposition = await PositionHistory.findOne({ Address: address })
        let transferDetails = storage[1].parameter.value.value

        let positionsdetails = setcloseposition.LivePosition

        let calculatelivepnl = ((parseFloat(transferDetails / PRECISION) - parseFloat(positionsdetails.position_amount)) + parseFloat(positionsdetails.funding_amount/PRECISION)).toFixed(3)


        var date = Date(transaction.timestamp);
        let lastData = {
          time: date.toLocaleString(),
          position: positionsdetails.position,
          entry_price: positionsdetails.entry_price,
          vUSD_amount: positionsdetails.vUSD_amount,
          position_value: positionsdetails.position_value,
          collateral_amount: positionsdetails.collateral_amount,
          realizedpnl: calculatelivepnl
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
            console.log("true")
            prevPosition = 0
          }
          else{
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
            position_amount: (parseFloat(prevPosition) + (position_amount / PRECISION)).toFixed(3)
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
  const result = await PositionHistory.find({}).then(function (data) {
    return data
  }).catch(err => console.log(err))
  result.sort(function (a, b) {
    return parseFloat(a.Totalpnl) - parseFloat(b.Totalpnl);
  });
  res.send(result)
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
  let storage = await axios.get("https://api.ghostnet.tzkt.io/v1/contracts/KT1H84ek1UKTEz6ELSpQNS8s38b4kXrANHy3/storage/").then(result => {
    return result.data
  })
  console.log(storage.current_mark_price)
  let marketpricedata = (storage.current_mark_price / PRECISION).toFixed(3)

  var previous_data = await TradeData.find().limit(1).sort({ $natural: -1 }).limit(1);
  var newdate = new Date().getMinutes();

  if (previous_data[0].Date.getMinutes() - newdate >= 5) {
    let data = {
      Date: new Date(),
      Open: marketpricedata,
      Close: marketpricedata,
      High: marketpricedata,
      Low: marketpricedata
    }
    TradeData.create(data)
    console.log("1 document upDated");
  }
  else {
    if (marketpricedata > previous_data[0].High) {
      var newvalues = { $set: { time: new Date(), Open: previous_data[0].Open, Close: marketpricedata, High: marketpricedata, Low: previous_data[0].Low } };

      TradeData.findByIdAndUpdate({ _id: previous_data[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else if (marketpricedata < previous_data[0].Low) {

      var newvalues = { $set: { time: new Date(), Open: previous_data[0].Open, Close: marketpricedata, High: previous_data[0].High, Low: marketpricedata } };
      TradeData.findByIdAndUpdate({ _id: previous_data[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
    else {

      var newvalues = { $set: { time: new Date(), Open: previous_data[0].Open, Close: marketpricedata, High: previous_data[0].High, Low: previous_data[0].Low } };
      TradeData.findByIdAndUpdate({ _id: previous_data[0]._id }, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document upDated");
      })
    }
  }

}






const getData = async () => {
  const result = TradeData.find({}).then(function (data) {
    return data
  }).catch(err => console.log(err))
  return result
}





// SEND CANDLE DATA -------------------------------------------------------------------------------------------------------------------

app.post('/granularity', async (req, res) => {

  if (req.body.granularity == "5minute") {
    const result = await getData();
    res.send(result)
  }
  else if (req.body.granularity == "15minute") {
    const result = await getData();

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
  else if (req.body.granularity == "hour") {
    const result = await getData();
    let newarr = []
    for (let i = 0; i < result.length; i = i + 12) {
      let Open = result[i].Open;
      let High = result[i].High;
      let Low = result[i].Low;
      let Close = result[i].Close;
      for (let j = i; j < i + 12; j++) {
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
  else if (req.body.granularity == "day") {
    const result = await getData();

    let newarr = []
    for (let i = 0; i < result.length; i = i + 288) {
      let Open = result[i].Open;
      let High = result[i].High;
      let Low = result[i].Low;
      let Close = result[i].Close;
      for (let j = i; j < i + 288; j++) {
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
})






// SendTestToken-------------------------------------------------------------------------------------------------------------------

app.post("/getToken", async (req, res) => {
  try {
    const address = req.body.address;
    const valid = validateAddress(address)
    const result = await TokenIssue.findOne({ Address: address })
    Tezos.setProvider({
      signer: new InMemorySigner(process.env.PVT_KEY),
      });
    if (valid == 3) {
      if (!result) {
        await Tezos.contract
		.at("KT1D5xQy9x7YSgrzTzLJx9tEQ6qK9pSW2vfz") 
		.then(async(contract) => {
			contract.methods.mint(address, 1000*PRECISION).send().then(async()=>{
        await TokenIssue.create({Address: address, TokenIssue: 1000})
      });
		})
        res.send("Issued")
      } else {
        res.send("Already Issued")
      }
      
    }
    else {
      res.send("false")
    }
  }
  catch (err) {
    res.status(404).send(false)
  }

})









// Updation-------------------------------------------------------------------------------------------------------------------

var nextTick = function () {
  return 300000 - (new Date().getTime() % 300000);
}, timerFunction = async () => {
  let storage = await axios.get("https://api.ghostnet.tzkt.io/v1/contracts/KT1H84ek1UKTEz6ELSpQNS8s38b4kXrANHy3/storage/").then(result => {
    return result.data
  })
  let marketpricedata = (storage.current_mark_price / PRECISION).toFixed(3)


  if ((await TradeData.find({})).length == 0) {
    let data = {
      Date: new Date(),
      Open: marketpricedata,
      Close: marketpricedata,
      High: marketpricedata,
      Low: marketpricedata
    }
    TradeData.create(data)
  }
  else {

    var newdate = new Date().getMinutes();

    var newvalues = { Date: new Date(), Open: marketpricedata, Close: marketpricedata, High: marketpricedata, Low: marketpricedata };
    TradeData.create(newvalues);
    console.log(new Date())
  }
  setTimeout(timerFunction, nextTick());
};
var timeout = setTimeout(timerFunction, nextTick());



