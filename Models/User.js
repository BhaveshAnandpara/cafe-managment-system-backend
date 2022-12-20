const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    userName : { type:String , required:true},
    email : { type:String , sparse:true , unique:true},
    userPassword : { type:String , required:true },
    accessToken : { type : String},
    cafes : [{type: mongoose.Schema.Types.ObjectId , ref:'Cafe'}],
    orders : [{type: mongoose.Schema.Types.ObjectId , ref:'Order'}],
})

    module.exports = mongoose.model("User", UserSchema); //will create a Schema Name User Which can be Accessed using 'new' keyword just like creating object