const mongoose = require("mongoose")

const CafeSchema = new mongoose.Schema({
    
    cafeName : { type:String , required:true},
    subtitle : { type:String},
    rating : { type : mongoose.Types.Decimal128 },
    address : { type:String , required:true },
    city : { type:String , required:true },
    profileImg : { type : String},
    owner : {type: mongoose.Schema.Types.ObjectId , ref:'Owner'},
    dishes : [{type: mongoose.Schema.Types.ObjectId , ref:'Dish'}],
    orders : [{type: mongoose.Schema.Types.ObjectId , ref:'Order'}]

})

module.exports = mongoose.model("Caffe", CafeSchema); //will create a Schema Name User Which can be Accessed using 'new' keyword just like creating object