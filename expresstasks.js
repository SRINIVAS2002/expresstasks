const express = require('express')
const mysql2 = require('mysql2')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
//modules at once

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
//middlewares

let port = 5000
let secretKey = 'a' //considering atleast any one letter or digit in string

let connection = mysql2.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'expresstable'
})
connection.connect((err)=>{
    if(err){
        console.log('db error');
    }else{
        console.log('db connect');
    }
})
//database connection successful or not

app.get('/',(req,res)=>{
    res.send('this is root page')
})
//default get method checking

app.post('/reg', (req,res)=>{

    let {email , password , role } = req.body

    connection.query('select * from datatable where email = ?',[email],async (err,data)=>{
        if(err){
            res.status(400).send(err.message)
        }else{
            if(data.length > 0) {

                res.send('Email is already existing')
                
            }else{

                const salt = await bcrypt.genSalt(10) //10    abc -- bcd(1)-- cde -- efg  -- ---  klm

                let hash = await bcrypt.hash(password,salt)

                console.log(hash);

                connection.query('insert into datatable (email , password , role) values (?,?,?)',[email,hash,role], (err,data)=>{

                    if(err){
                        res.send({
                            msg : err,
                            status : 400
                        })
                    }else{
                        res.send({
                            msg:'Registered Successful',
                            result : data
                        })
                    }

                })


            }
        }
    })
})
//registration block of code

app.post('/login',(req,res)=>{

    let {email , password , role} = req.body

    connection.query('select * from datatable where email = ?',[email],async (err,data)=>{

        if(err){
            res.status(400).send(err.message)
        }else{
            if(data.length > 0){

                let pwdoriginal =  await bcrypt.compare(password,data[0].password)
            
                if(data[0].email === email &&  pwdoriginal && data[0].role === role){

                    let token = jsonwebtoken.sign({id : data[0].id},secretKey)

                    res.send({
                        msg:'Login Successful',
                        token : token
                    })

                }else{
                    res.status(400).send('Invalid Login')
                }


            }else{

                res.send('Need to Register')
            
            }
        }
        
    })

})
//login checking and password hashing

app.listen(port , ()=>{
    console.log("Server Started");
})
//connecting with server