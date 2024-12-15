// require('dotenv').config({path: './env'})


import { dotenv } from "dotenv";
// import { express } from "express";
// const app = express();




import { connectDB } from "./db/index.js";

dotenv.config({path : './env'})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection error failed!!!!!",err)
})









// (asynch () => {
//     try {
//        await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",() => {
//         console.log("ERROR")
//         throw error
//        })
//        app.listen(process.env.PORT,()=>{
//         console.log(`app is listening on port ${
//             process.env.PORT
//         }`)
//        })
//     } catch (error) {
//         console.log("error: ", error)
//         throw error
        
//     }

// })()

