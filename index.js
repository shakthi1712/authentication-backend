import Express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from './userSchema.js'
const secret_key='key'
const app = Express();
const dburl = "mongodb+srv://shakthi2003:asv1712@shakthi.vwzhdff.mongodb.net/userDB?retryWrites=true&w=majority&appName=shakthi"
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        app.listen(4000, () => { console.log("connected") })
    })
    .catch((error) => {
        console.log("unable to connect")
    })
app.use(bodyParser.json());
const corsConfig={
    origin:"*",
    credentials:true,
    methods:["GET","POST"]
}
app.options("",cors(corsConfig));
app.use(cors(corsConfig));
app.get('/',(req,res)=>{
    res.send('hello')
})
app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ email, username, password: hashedPassword })
        await newUser.save()
        res.status(201).json({ message: 'User created success' })
    } catch (error) {
        res.status(500).json({ error: "Error in signin" })
    }
})
app.get('/register',async(req,res)=>{
    try{
        const users=await User.find();
        res.status(201).json(users)
    }catch(error){
        res.status(500).json({error:'unable to get users'})
    }
})

app.post('/login',async(req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await User.findOne({username})
        if(!user){
            return res.status(401).json({error:"Inavlid credentials"})
        }
        const isPasswordValid = await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            return res.status(401).json({error:'Invalid Credentials'})
        }
        const token = jwt.sign({userId:user._id},secret_key)
        res.json({ token });
        
    }  
    catch(error){
        res.status(500).json({error:'Error logging in'})
    }
})