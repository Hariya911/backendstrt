import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiRes } from "../utils/ApiRes.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import mongoose from "mongoose";


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

const generateAccessAndRefreshTokens = async(userId) => {
    try{
const user = await User.findById(userId)
     const accessToken =   user.generateAccessToken ()
     const refreshToken =  user.generateRefreshToken()

     user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false})

     return{accessToken,refreshToken}
    }
    catch(error){

        throw new ApiError(500,"something went wrong while generating access amd refresh tokens")
        t
    }
}


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

   const existedUser = await User.findOne({
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


const loginUser = asyncHandler(async(req,res)=>{

    //req body ->  data
    //username,email
    //find the user
    //password check
    //access and refresh token
    //send these tokens in form of cookies
    //respnse of login

const {email,username,password}= req.body
if(!username || !email) {
    throw new ApiError(400,"username or  password required")
}

User.findOne({
    $or : [{username},{email}]
})

if(!User){
    throw new ApiError(400,"user does not exist")
}

const isPasswordValid =  await User.isPasswordCorrect(password)
if(!isPasswordValid){
    throw new ApiError(400,"invalid user credentials")
}

const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(User._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


const options = {
    http:true,
    secure:true,

}
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiRes(200,
        {
            user:loggedInUser,accessToken
            ,refreshToken
        },
        "user logged in successfully"
    )
)
})

const logoutUser = asyncHandler(async (req,res) => {
    //clearing tokens 
User.findByIdAndUpdate(req.user._id,{
    $unset : {
        refreshToken:1,
    }
},{
    new:true
})



const options = {
    http:true,
    secure:true,

}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiRes(200,{},"User logged out"))


})


const refreshAccessToken = asyncHandler(async(req,res) =>
{
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken


   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorised request")
   }


  try {
     const decodedToken = verifyJWT(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
  
  const user = await User.findById(decodedToken?._id)
  
  if(!user){
      throw new ApiError(401,"invalid refresh token")
  }
  
  if(incomingRefreshToken!== user?.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
  }
  
  const options = {
      httpOnly : true,
      secure:true
  }
  
  const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshTokene,options)
  .json(
      new ApiRes(
          200,{accessToken,refreshToken: newRefreshToken},
          "access token refreshed successfully"
      )
  )
  
  } catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token")
    
  }





})

const changeCurrentPassword = asyncHandler(async(req,res) =>
    {
    const {oldPassword,newpassword,confirmPassword} = req.body
    
    if(!(confirmPassword===newPassword)){
        throw new ApiError(400,"new password should exactly match confirm password")
    }
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid old password")
    }
    
    user.password = newPassword
        await user.save({validateBeforeSave:false})
    
        return res
        .staus(200)
        .json(new ApiRes(200,{},"password changed successfully"))
    
    
    })
    
    
    const getCurrentUser = asyncHandler(async (req,res) =>
    {
    
        return res.
        staus(200).
        json(new ApiRes(200,req.user,"current user fetched successfully"))
    })


const updateAccountDetails = asyncHandler( async (req,res) =>
{
const{fullname,email} = req.body


if(!fullname || !email){
    throw new ApiError(400,"both email,password are required")

}
const user = await User.findByIdAndUpdate(
    req.user?._id,
{
$set:{
    fullname,
    email:email
}

},
{new:true})
.select("-password")

return res.status(200)
.json (new ApiRes(200,user,"Account details updated successfully"))

})


const updateUserAvatar = asyncHandler(async (req,res) => 
{
   const avatarLocalPath =  req.file?.path

   if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is missing")
   }

const avatar =  await uploadOnCloudinary(avatarLocalPath)

if(!avatar.url){
    throw new ApiError(400,"error while uploading on avatar")
}

await User.findByIdAndUpdate(req.user?._id,
    {
        $set :{
            avatar : avatar.url
        }
    },
    {new:true}
).select("-password")

return res.
status(200).
json(new ApiRes(200,"avatar updated successfully"))


})


const updateUserCoverImage = asyncHandler(async (req,res) => 
    {
       const CoverImageLocalPath =  req.file?.path
    
       if(!CoverImageLocalPath){
        throw new ApiError(400,"CoverImg file is missing")
       }
    
    const coverImage =  await uploadOnCloudinary(CoverImageLocalPath)
    
    if(!coverImage.url){
        throw new ApiError(400,"error while uploading on CoverImg")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set :{
                coverImage : coverImage.url
            }
        },
        {new:true}
    ).select("-password")
    

    return res.
    status(200).
    json(new ApiRes(200,"cover image updated successfully"))
    
    })


    const getUserChannelProfile = asyncHandler(async (req,res) =>
    {
        const {username} = req.params

        if(!username?.trim()){
            throw new ApiError(400,"username is missing")
        }

     const channel =  await User.aggregate([ 
        {
            $natch: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscriberz"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },{
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size : "subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else:false
                    }
                }
            }
        },
        {
            $project: {
                fullname:1,
                username:1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                email:1,
                coverImage:1
            }
        }
     ])


     if(!channel?.length){
        throw new ApiError(404,"channel doesnot exist")
     }

     return res
     .status(200)
     .json(new ApiRes(200,channel[0],"user channel fetched successfully"))



    })


    const getWatchHistory = asyncHandler(async (req,res) =>
    {
      const user = await  User.aggregate([
        {
            $natch:{
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                         $lookup : {
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                            fullname:1,
                                            username:1,
                                            avatar:1
                            
                                    }
                                }
                            ]
                         }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
      ])


      return res
      .status(200)
      .json(new ApiRes(200,user[0].watchHistory,
        "watch history fetched successfully"
      ))
    })













export {registerUser,loginUser,logoutUser,refreshAccessToken,
    getCurrentUser,changeCurrentPassword,updateAccountDetails,
    updateUserAvatar,updateUserCoverImage,getUserChannelProfile,
    getWatchHistory}
