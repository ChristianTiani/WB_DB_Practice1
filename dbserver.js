const express = require("express")
const app = express()
const mysql = require("mysql")
const bcrypt = require("bcrypt")

app.use(express.json())
//middleware to read req.body.<params>

require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const db = mysql.createPool({
   connectionLimit: 100,
   host: DB_HOST,       //This is your localhost IP
   user: DB_USER,         // "newuser" created in Step 1(e)
   password: DB_PASSWORD,  // password for the new user
   database: DB_DATABASE,      // Database name
   port: DB_PORT             // port name, "3306" by default
})

db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB connected successful: " + connection.threadId)
})


//CREATE USER
app.post("/createUser", async (req,res) => {
    const user = req.body.name;
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    
    db.getConnection( async (err, connection) => {
     if (err) throw (err)
     const sqlSearch = "SELECT * FROM usertable WHERE user = ?"
     const search_query = mysql.format(sqlSearch,[user])
     const sqlInsert = "INSERT INTO usertable VALUES (0,?,?)"
     const insert_query = mysql.format(sqlInsert,[user, hashedPassword])
     // ? will be replaced by values
     // ?? will be replaced by string
     
     await connection.query (search_query, async (err, result) => {
         
      if (err) throw (err)
      console.log("------> Search Results")
      console.log(result.length)

      if (result.length != 0) {
       connection.release()
       console.log("------> User already exists")
       res.sendStatus(409) 
      } 
      else {
       await connection.query (insert_query, (err, result)=> {

       connection.release()

       if (err) throw (err)
       console.log ("--------> Created new User")
       console.log(result.insertId)
       res.sendStatus(201)
      })
     }
    }) //end of connection.query()
    }) //end of db.getConnection()
    }) //end of app.post()

const port = process.env.PORT
app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))