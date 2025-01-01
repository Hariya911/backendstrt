import mongoose,{Schema} from "mongoose"

const playlistSchema = new Schema({

name:{
    type:String,
    required:true
},
discription:{
    type:String,
    required:true
},
videos:[{
    type:Schema.Types.ObjectId,

    ref:"video"
}],
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
}

},{
    timestmps:true
})

export const Playlist = mongoose.model("Playlist",playlistSchema)