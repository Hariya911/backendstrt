import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiRes } from "../utils/ApiRes.js";

const registerUser = asyncHandler(async (req,res)=>{
//get user details from frontend
//validation that everything is filled
//check the set of info is unique via email
//check for images /avatar
//upload them to cloudinary,avatar
//create user object - to create entry in db\
//remove password and refresh tokens from response
//check for user creation
//return res


const {fullname,username,password,email} = req.body 
console.log("email:",email)

// if(fullName = ""){
//     throw new ApiError(400,"fullname is required")
// }

if(
    
        [fullname,email,password,username].some((field) => field?.trim() === "")
)
    {
        throw new ApiError(400,"all fields are required")
    }

   const existedUser =  User.findOne({
        $or : [{username},{email}]
    })
if(existedUser){
    throw new ApiError(409,"user with same email/username still exists")
}

const avatarLocalPath = req.files?.avatar[0]?.path
const coverImgLocalPath = req.files?.coverImage[0].path

if(!avatar){
    throw new ApiError(400,"avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImgLocalPath)

if(!avatar){
    throw new ApiError(400,"avatar file is required")
}

const user = await User.create({
    fullname,avatar:avatar.url,coverImage:coverImage.url || "",
    email,password,username:username.toLowerCase()

})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" 
)
 
if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user")

}


return res.status(201).json(
   new ApiResponse(200,createdUser,"user registered successfully")
)




}
)


export {registerUser}