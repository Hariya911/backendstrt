import mongoose,{Schema} from "mongoose"
import {mongooseAggregtePaginate  } from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema ({

videoFile:{
    type:String,
    required:true,

},
thumbnail:{
    type:String,
    required:true
},
title:{
    type:String,
    required:true,

},
discription:{
    type:String,
    required:true,

},
duration:{
    type:Number,
    required:true,

},
views:{
    type:Number,
    default:0,
},
isPublished:{
    type:Boolean,
    default:true,
},
owner:{
    type:Schema.Types.ObjectIs,
    ref:"User"
}







},{timestamps:true})

videoSchema.plugin(mongooseAggregtePaginate )
export const Video = mongoose.model("video",videoSchema)