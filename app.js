const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const bcryptjs=require("bcryptjs")
const jsonwebtoken=require("jsonwebtoken")

const {blogmodel}=require("./models/blog")


const app=express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://Annmariyasabu:annmariya@cluster0.gs6ae.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0")


const generatehashedpassword = async(password)=>{
    const salt=await bcryptjs.genSalt(10)
    return bcryptjs.hash(password,salt)

}


app.post("/signup",async(req,res)=>{
    let input=req.body
    let hashedpassword =await generatehashedpassword(input.password)
    console.log(hashedpassword)
    input.password = hashedpassword
    let blog=new blogmodel(input)
    blog.save()
    res.json({"status":"success"})
})


app.post("/signIn",(req,res)=>{
    // res.json({"status":"success"}) 2 res couse error

    let input=req.body
    blogmodel.find({"email":req.body.email}).then(
        (response)=>{
            if(response.length>0){
                let dbpassword=response[0].password
            
            console.log(dbpassword)
             bcryptjs.compare(input.password,dbpassword,(error,ismatch)=>{
               if(ismatch){

                jsonwebtoken.sign({"email":input.email},"blog-app",{expiresIn:"1d" },
                    (error,token)=>{
                        if(error){
                            res.json({"status":"unable to create token"})
                        }else{
                             res.json({"status":"success","userid":response[0]._id,"token":token})
                            }
                        }
                    
                )
               }else{
                res.json({"status":"incorrect password","userid":response[0]._id,"token":token})
               }
             })
            }else{
                res.json({"status":"user not found"})
            }
        }
    ) .catch() 
    
})

app.listen(8081,()=>{
    console.log("sever start")
})