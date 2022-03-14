const express = require("express")
const app = express();
const cors = require("cors")
const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient;

const URL="mongodb+srv://admin:admin123@cluster0.hijj3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const URL = "mongodb://localhost:27017";
const bcrypt = require("bcryptjs")
const jwt=require("jsonwebtoken")  

const secret="Gdc3XkBkRy";
let usersList = [];
app.use(express.json())

app.use(cors({ 
    origin: "*"  
}))   

// authenticate
let authenticate=function(req,res,next){
    if(req.headers.authorization){
      try {
           let result=jwt.verify(req.headers.authorization,secret);
           next();
      
      } catch (error) {
        res.status(401).json({message:"Token Expired"})
      }
    }
    else{
        res.status(401).json({message:"Not Invalid"})
    }
}

//userList
app.get("/users", async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("zenclass")
        let users = await db.collection("users").find({}).toArray();
        await connection.close();
        res.json(users)

    } catch (error) {
        console.log(error)
    }

    // res.json(usersList) 
})

// edit page

app.get("/user/:id", async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("zenclass")
        let objId = mongodb.ObjectId(req.params.id)
        let user = await db.collection("users").findOne({ _id: objId });
        await connection.close();

        if (user) {
            res.json(user)
        }
        else {
            res.status(401).json({ message: "User Not Found" })
        }

    } catch (error) {
        res.status(500).json({ message: "Message Went Wrong" })
    }

    // let user = usersList.find(obj => obj.id == req.params.id);
    // if (user) {
    //     res.json(user)
    // }
    // else {
    //     res.status(404).json({ Message: "User not found" })
    // }

})

// user creat

app.post("/create-user", async function (req, res) {

    try {
        //connect to the Database
        let connection = await mongoClient.connect(URL)

        //select DB
        let db = connection.db("zenclass")

        //select collection
        //do any operation
        await db.collection("users").insertOne(req.body)

        //close the connection
        connection.close();

        res.json({ message: "User Added" })
    } catch (error) {
        console.log(error)
    }
    // req.body.id=usersList.length + 1; 
    // usersList.push(req.body)
    // res.json({"mess":"user add"})
})

// user edit 

app.put("/user/:id", async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("zenclass")
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("users").findOneAndUpdate({ _id: objId }, { $set: req.body })
        //await db.collection("users").updateMany({gender:"female" },{$set:{grade:"A"}}) - this line is saying for who is female that one add for "A" grade.

        await connection.close();
        res.json({ message: "User updated " })

    } catch (error) {
        console.log(error)
    }

    // //  find the index of the object
    // let index = usersList.findIndex(obj => obj.id == req.params.id);

    // // update the object with new data
    // Object.keys(req.body).forEach((obj) => {
    //     usersList[index][obj] = req.body[obj]
    // })

    // res.json({ "mess": "updated" })
})

//user delete

app.delete("/user/:id", async function (req, res) {

    try {
        let connection = await mongoClient.connect(URL)
        let db = connection.db("zenclass")
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("users").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "User Delected" })

    } catch (error) {
        console.log(error)
    }

    // let index = usersList.findIndex(obj => obj.id == req.params.id);
    // usersList.splice(index, 1);
    // res.json({ "mess": "delect" })
})

//User register process

app.post("/register", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("zenclass")

        //Encrypt the password in database
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;

        await db.collection("data").insertOne(req.body)
        connection.close();
        res.json({ message: "user creatrd" });
    } catch (error) {
        console.log(error)
    }
})

// login method start
app.post("/login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("zenclass") 

        let user = await db.collection("data").findOne({ email: req.body.email })
        if (user) { 
            let passwordResult = await bcrypt.compare(req.body.password,user.password)
            if (passwordResult) {
                
                //generate token
                let token=jwt.sign({userid :user._id},secret,{ expiresIn: '1h' });
                res.json({token})
            }
            else {  
                res.status(401).json({ message: "Email id or password Not match" })
            } 
        }
        else {
            res.status(401).json({ message: "Email id or password Not match" })
        } 
    } catch (error) {
        console.log(error)
    }
})
// login method end

app.get("/dashboard",authenticate,function (req, res) {
    res.json({ totalUsers: 30 })
})

app.listen(process.env.PORT || 3001)  //  pocess.env.PORT || this heroku processs 

