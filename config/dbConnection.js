import mongoose from "mongoose";

mongoose.set('strictQuery',false)
// strictQuery it is used when any extra perimter is send then it will not through an error it will ignore it when
// we use false or if something which is not present in the db and accessed then it will not through an error but it 
// will ignore it

const connectionToDB=async()=>{
    try{
        const {connection}=await mongoose.connect(
            process.env.MONGO_URL
        )
        if(connection){
            console.log(`Connected to mongo DB: ${connection.host}`);
        }
        
    }
    catch(e){
        console.log(e);
        process.exit(1);
    }
}

export default connectionToDB