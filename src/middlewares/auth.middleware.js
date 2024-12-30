import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebToken"
import { User } from "..models/user.model.js";



export const verifyJWT = asyncHandler(asyncHandler (req,
    _ ,next) =>
{
   try{
     req,cookie?.accessToken || req.header("Authorization")?.replace("Bearer","")
 
 
     if(!token){
         throw new ApiError (401,"Unauthorized request")
     }
 
 const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
 await User.findById(decodedToken?._id).select("-password -refreshToken")
 
 if(!user){
     //todo = frontend discussion
     throw new ApiError(401,"Invalid Access token")
 }
 req.user = user;
 next();
   } catch (error) {
    throw new ApiError(401,erro?.message || "Invalid Access token"
    )
    
   }


})