const express =require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const socket = require('socket.io')
const cors = require('cors');
const axios= require('axios')
const TradeData = require("./models/TradeData");
dotenv.config();


mongoose.connect(process.env.MONGO_URL,{useNewUrlParser: true,useUnifiedTopology: true})
.then((result)=>{console.log("connected to db")}).catch((err)=>{console.log(err)});

// const history = await axios.get(`https://api.ghostnet.tzkt.io/v1/contracts/KT1CkJSoxa8Wm9fD2RSkfnpsEZch55jKB3Nj/storage`)



app.use(cors({origin:'*'}));

app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
const server = app.listen(8000,()=>{
    console.log('Started in 8000 PORT')
})

const iO = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
});




const senddata =async()=>{
  var x = await TradeData.find().limit(1).sort({$natural:-1}).limit(1)
      .then((results)=>{
        return results
      })
    return x;
}

iO.on('connection', (client) => {
 
    
      client.on("message",async(data)=>{
        if(data =="history"){
          TradeData.find({}, function(err, result) {
            if (err) throw err;
      
            client.emit("data1", result); 
          });
        }
        else if(data == "upDate"){
          var x= await senddata();
          client.emit("data2", x); 
        }
      })
      TradeData.watch([{ $match: {operationType: {$in: ['insert']}}}]).
    on('change', data => {
        console.log('Insert action triggered'); //getting triggered thrice
        client.emit("data3", data.fullDocument.Close); 
    });
    TradeData.watch([{ $match: {operationType: {$in: ['update']}}}]).
    on('change', data => {
        console.log('UpDate action triggered'); //getting triggered thrice
        client.emit("data4", data.updateDescription.updatedFields.Close);
    });

 
  });

  console.log('A user connected');

app.post("/post",async(req,res)=>{
  console.log(req.body)
  let marketpricedata = req.body.marketprice;

 var previous_data = await TradeData.find().limit(1).sort({$natural:-1}).limit(1);
var newdate =  new Date().getMinutes();
console.log(previous_data)
 if(previous_data[0].Date.getMinutes()-newdate >= 5){
  let data = {
    Date:new Date(),
    Open :marketpricedata,
    Close:marketpricedata,
    High: marketpricedata,
    Low:marketpricedata
  }
    TradeData.create(data)
    
 }
  else{
    if(marketpricedata>previous_data[0].High){
      var newvalues = { $set: {time:new Date(),Open: previous_data[0].Open,  Close: marketpricedata,High:marketpricedata,Low:previous_data[0].Low } };
   
      TradeData.findByIdAndUpdate({_id:previous_data[0]._id}, newvalues,function(err, res) {
        if (err) throw err;
        console.log("1 document upDated");})
    }
    else if(marketpricedata<previous_data[0].Low){
      
      var newvalues = { $set: { time:new Date(),Open: previous_data[0].Open, Close: marketpricedata,High:previous_data[0].High,Low:marketpricedata } };
      TradeData.findByIdAndUpdate({_id:previous_data[0]._id}, newvalues,function(err, res) {
        if (err) throw err;
        console.log("1 document upDated");})
    }
    else{
      
      var newvalues = { $set: { time:new Date(),Open: previous_data[0].Open, Close: marketpricedata,High:previous_data[0].High,Low:previous_data[0].Low } };
      TradeData.findByIdAndUpdate({_id:previous_data[0]._id}, newvalues,function(err, res) {
        if (err) throw err;
        console.log("1 document upDated");})
    }
  }
  res.send("done")
})

const getData =async()=>{
  const result = TradeData.find({}).then(function (data) {
    return data
}).catch(err=> console.log(err))
return result
}


app.post('/granularity',async(req,res)=>{
  if(req.body.granularity =="5minute"){
    const result =  await getData();
    res.send(result)
  }
  else if(req.body.granularity =="15minute"){
    const result = await getData();
      
      let newarr =[]
      for(let i=0;i<result.length;i=i+3){
        let Open= result[i].Open;
        let High = result[i].High;
        let Low = result[i].Low;
        let Close = result[i].Close;
        for(let j=i;j<i+3;j++){
          if(j+1>result.length){
            break
          }
          if(High<result[j].High){
            High = result[j].High
          }
          if(Low>result[j].Low){
            Low = result[j].Low
          }
          Close = result[j].Close
        }
        let data = {
          Date:result[i].Date,
          Open: Open,
          High:High,
          Low:Low,
          Close:Close,
        }
        newarr.push(data)
      }
      
    res.send(newarr)
  }
  else if(req.body.granularity == "hour"){
    const result = await getData();
      let newarr =[]
      for(let i=0;i<result.length;i=i+12){
        let Open= result[i].Open;
        let High = result[i].High;
        let Low = result[i].Low;
        let Close = result[i].Close;
        for(let j=i;j<i+12;j++){
          if(j+1>result.length){
            break
          }
          if(High<result[j].High){
            High = result[j].High
          }
          if(Low>result[j].Low){
            Low = result[j].Low
          }
          Close = result[j].Close
        }
        let data = {
          Date:result[i].Date,
          Open: Open,
          High:High,
          Low:Low,
          Close:Close,
        }
        newarr.push(data)
      }
      
    
    res.send(newarr)
  }
  else if(req.body.granularity =="day"){
    const result = await getData();
      
      let newarr =[]
      for(let i=0;i<result.length;i=i+288){
        let Open= result[i].Open;
        let High = result[i].High;
        let Low = result[i].Low;
        let Close = result[i].Close;
        for(let j=i;j<i+288;j++){
          if(j+1>result.length){
            break
          }
          if(High<result[j].High){
            High = result[j].High
          }
          if(Low>result[j].Low){
            Low = result[j].Low
          }
          Close = result[j].Close
        }
        let data = {
          Date:result[i].Date,
          Open: Open,
          High:High,
          Low:Low,
          Close:Close,
        }
        newarr.push(data)
      }
    res.send(newarr)
  }
})



var nextTick = function() {
  return 300000 - (new Date().getTime() % 300000);
}, timerFunction = async()=> {
  var previous_data = await TradeData.find().limit(1).sort({$natural:-1}).limit(1);

  let marketpricedata = previous_data[0].Close;
  if((await TradeData.find({})).length==0){
   let data = {
     Date: new Date(),
     Open :marketpricedata,
     Close:marketpricedata,
     High: marketpricedata,
     Low:marketpricedata
   }
     TradeData.create(data)
  }
 else{

var newdate = new Date().getMinutes();
   // if(newdate - previous_data[0].Date.getMinutes() >= 1){

     var newvalues =  { Date:new Date(),Open:marketpricedata, Close: marketpricedata,High:marketpricedata,Low:marketpricedata };
     TradeData.create(newvalues);
     console.log(new Date())
   // }
 }
  setTimeout(timerFunction, nextTick());
};
var timeout = setTimeout(timerFunction, nextTick());



