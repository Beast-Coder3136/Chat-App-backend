import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({})
export const connectDb = async()=>{
  try {
     await mongoose.connect(process.env.MONGO_URL) ;
     console.log("Database connected succesfully") ;
  } catch (error) {
    console.log("Error in connecting Database :" ,error.message)
  }
}

