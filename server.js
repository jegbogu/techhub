require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const regSchema = require('./model/registerSchema')
const bcrypt = require('bcrypt')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);


 
// const mongoURI = 'mongodb://localhost/test'
 
 

const dbLink = `mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@cluster0.bqgwwea.mongodb.net/${process.env.DB}`
 
const connectDB = async ()=>{

    try {
        await mongoose.connect(dbLink,{
            useNewUrlParser: true,
            useUnifiedTopology: true,

           
        })
        console.log('mongoDB is connected Successfully')
        
    } catch (error) {
        // console.error('connection failed')
        console.log(error)
    }
   
}

connectDB()

const store = new MongoDBStore({
    uri:dbLink,
    collection: 'mySessions'
  });

//express-session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store:store
    
  }))



//tryout inserting into the database
//  const inputData = async () =>{
//     try {
        
//         const doc = new regSchema({
            
            
//                 email: 'jonhdoe@gmail.com',
//                 password: 'kilsfah%%'
            
            
//         })
//         await doc.save()
//         console.log('data inserted')

//     } catch (error) {
//         console.error('not inserted')
//     }
   
    
//  }

// inputData()




app.use(express.static(path.join(__dirname,'public')))

app.set('views',path.join(__dirname,'/views'))
app.set('view engine','ejs')

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get('/',(req,res)=>{
    res.render('index.ejs')
})

app.get('/register',(req,res)=>{
    res.render('register.ejs')
   
})

app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.get('/dashboard',(req,res)=>{
    res.redirect('/login')
})




//post
app.post('/register',async(req,res)=>{
    try {
        const{email, password,firstname,lastname,gender,age,address,phone,description} = req.body
        const hashedPassword = await bcrypt.hash(password,10)
        const doc = new regSchema({
            email,
            password:hashedPassword,
            firstname,
            lastname,
            gender,
            age,
            address,
            phone,
            description

        })
        await doc.save()
        console.log('data saved!')
        console.log(doc)
        res.redirect('/login')
    } catch (error) {
         throw error
    }
    
    
})

 
//login
app.post('/login',async (req,res)=>{
    try {
        const{email,password} = req.body
       const userID = await regSchema.findOne({email}) 
       const validUser = await bcrypt.compare(password,userID.password)

       
       if(validUser){
        req.session.isAuth = true
         
        const userEmail = userID.email
        const userFirstName = userID.firstname
        const userLastName = userID.lastname
        const userAge = userID.age
        const userAddress = userID.address
        const userDescription = userID.description
        const userPhone = userID.phone
        const userData = [userEmail,userFirstName,userLastName,userAge,userAddress,userDescription,userPhone]

        res.render('dashboard',{userData})
        console.log(validUser)
        console.log(userID)
        
       }else{
        res.redirect('login')
       }

    } catch (error) {
        throw error
    }
    
})
function isAuth(req,res,next){
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/login')
    }
}

 
app.get('/admin',isAuth, async (req,res)=>{
    try {
        const allData = await regSchema.find({})
   console.log(allData)
     res.render('admin.ejs',{allData})
        
    } catch (error) {
        console.log(error)
    }
   
})

 
 app.post('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err)throw err
        res.redirect('/login')
    })
 })
const PORT = 5000
app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`)
})