const express = require("express")
const app = express();
const cors = require("cors")
const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient;
const URL = "mongodb://localhost:27017/zenclass";

let usersList = [];
app.use(express.json())

app.use(cors({
    origin: "*"
}))

app.get("/users",async function (req, res) {

    try {
        let connection=await mongoClient.connect(URL)
        let db=connection.db("zenclass")
        let users=await db.collection("users").find({}).toArray();
        await connection.close();
        res.json(users)   

    } catch (error) {
        console.log(error)  
    }
   
    // res.json(usersList) 
})

app.get("/user/:id",async function (req, res) {
  
    try {
        let connection=await mongoClient.connect(URL)
        let db=connection.db("zenclass")
        let objId=mongodb.ObjectId(req.params.id)
        let user=await db.collection("users").findOne({_id:objId});
        await connection.close();
       
        if(user){
            res.json(user) 
        }  
        else{
            res.status(401).json({message:"User Not Found"})
        }

    } catch (error) {
        res.status(500).json({message:"Message Went Wrong"})
    }

    // let user = usersList.find(obj => obj.id == req.params.id);
    // if (user) {
    //     res.json(user)
    // }
    // else {
    //     res.status(404).json({ Message: "User not found" })
    // }

})

app.post("/create-user", async function (req, res) {

    try {
        //connect to the Database
        let connection=await mongoClient.connect(URL)

        //select DB
        let db=connection.db("zenclass")

        //select collection
        //do any operation
        await db.collection("users").insertOne(req.body)

        //close the connection
        connection.close();

        res.json({message:"User Added"})         
    } catch (error) {
        console.log(error) 
    }
    // req.body.id=usersList.length + 1; 
        // usersList.push(req.body)
        // res.json({"mess":"user add"})
})

app.put("/user/:id",async function (req, res) {

    try {
        let connection=await mongoClient.connect(URL)
        let db=connection.db("zenclass")
        let objId=mongodb.ObjectId(req.params.id)
        await db.collection("users").findOneAndUpdate({ _id:objId },{$set:req.body})
        //await db.collection("users").updateMany({gender:"female" },{$set:{grade:"A"}}) - this line is saying for who is female that one add for "A" grade.

        await connection.close(); 
        res.json({message:"User updated "})   

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

app.delete("/user/:id",async function (req, res) {
    
    try {
        let connection=await mongoClient.connect(URL)
        let db=connection.db("zenclass")
        let objId=mongodb.ObjectId(req.params.id)
        await db.collection("users").deleteOne({ _id:objId })
        await connection.close();
        res.json({message:"User Delected"})   

    } catch (error) {
        console.log(error)  
    }
    
    // let index = usersList.findIndex(obj => obj.id == req.params.id);
    // usersList.splice(index, 1);
    // res.json({ "mess": "delect" })
})

app.listen( process.env.PORT || 3001)  //  pocess.env.PORT || this heroku process

