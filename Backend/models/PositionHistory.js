const mongoose = require("mongoose");

const PositionHistory =new mongoose.Schema(
    {
        Address:{
            type:String,
        },
        CompletedPosition:{
            type:[Object],

        },
        LivePosition:{
            type:Object
        }

    }
)

module.exports
=mongoose.model("positionHistory", PositionHistory);