import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  fullname : {
    type : String,
    required : true ,
    trim : true 
  },
  email : {
    type : String ,
    required : true ,
    trim : true ,
    unique : true ,
    lowercase: true, // Stores all emails in lowercase

    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/,
      'Email format is invalid. Please enter a valid email.'
    ] ,
  },
  profilePic : {
    type : String,
    default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToK4qEfbnd-RN82wdL2awn_PMviy_pelocqQ&s",
    required : true ,
  },
  isAdmin : {
    type : Boolean ,
    required : true ,
    default : false ,
  },
  password : {
    type : String ,
    required : true 
  }
},{
  timestamps : true 
})

const User = mongoose.model("User", userSchema ) ;

export default User ; 