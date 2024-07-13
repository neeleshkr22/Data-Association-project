const express = require('express')
const app = express();
const userModel = require("./models/user.model.js");
const postModel = require("./models/post.model.js")
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

app.set("view engine", "ejs")
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render("index")
    
})

app.get('/login',(req,res)=>{
    res.render("login")  
})

app.get('/profile',isloggedIn,(req,res)=>{
    res.render("login")  
})

app.post('/register',async (req,res)=>{
    let {email, password, username,name,age} = req.body;

    let user = await userModel.findOne({email});
    if(user) return res.status(300).json({msg: "User already register"});

    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(password, salt, async (err,hash)=>{
            console.log(hash);
            await userModel.create({
                username,
                email,
                age,
                name,
                password: hash
            });
           let token =  jwt.sign({email: email, userid  : user._id}, "zord");
           res.cookie("token", token);
           res.send("registered");
        })
        console.log(salt);
    })

})

app.post('/login',async (req,res)=>{
    let {email, password} = req.body;

    let user = await userModel.findOne({email});
    if(!user) return res.status(300).json({msg: "Something went wro g"});

    bcrypt.compare(password, user.password, (err,result)=>{
        if(result){ 
            let token =  jwt.sign({email: email, userid  : user._id}, "zord");
            res.cookie("token", token);
            res.status(200).send("you can login")
        }else res.redirect("/login");
    })

})

app.get("/logout", (req,res)=>{
    res.cookie("token", "");
    res.redirect("/login")
})

function isloggedIn(req,res,next){
    if(req.cookies.token === "") res.send("you need to be loggin");
    else{
       let data =  jwt.verify(req.cookies.token, "zord");
        req.user = data;
        next();
    }
}

app.listen(5000,()=>{
    console.log("Server started at 3000");
})