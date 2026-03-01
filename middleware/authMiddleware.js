import jwt from "jsonwebtoken";

const verifyJWT = async(req,res,next)=>{
  try{
  const token = req.cookies.token;
  if(!token){
    return res.status(401).json({
      message : "User is not authenticated",
      success : false
    })
  }
  const decode = await jwt.verify(token,process.env.SECRET_KEY);
  if(!decode){
    return res.status().json({
      message : "Token is verified",
      success : false
    })
  }
  req.user = decode;
  next(); 
  }
  catch(err){
    console.log(err);
  }

}
export default verifyJWT;
