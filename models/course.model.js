import {model,Schema} from "mongoose"

const courseSchema = new Schema({
    title:{
        type:String,
        required:[true,'Title is required'],
        minLength:[1,'Title must be atleast 1 character'],
        maxLength:[40,'Title must contain atmost 40 character'],
        trim:true,
    },
    description:{
        type:String,
        required:[true,'Description is required'],
        minLength:[1,'Description must be atleast 1 character'],
        maxLength:[500,'Description must contain atmost 500 character'],
        trim:true,
    },
    category:{
        type:String,
        required:[true,'Category is required'],
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        }
    },
    lectures:[
        {
            title:String,
            description:String,
            lecture:{
                public_id:{
                    type:String,
                    required:true
                },
                secure_url:{
                    type:String,
                    required:true
                }
            }
        }
    ],
    fees:{
           type:Number,
           required:true

    },
    numberOfLecture:{
        type:Number,
        default:0,

    },
    createdBy:{
        type:String,
        required:true
    }
},{
    timestamps:true
})


const Course =model('Course',courseSchema)

export default Course