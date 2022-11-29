const mongoose = require('mongoose')


const regSchema = new mongoose.Schema({
  email:{
    type: String,
    require: true,
    minLength:[6,'email characters must be greater six'],
    toLowerCase:true,
    trim: true
  },
  password:{
    type:String
  },
  firstname:{
    type:String
  },
  lastname:{
    type:String
  },
  gender:{
    type: String
  },
  age:{
    type: String,
  },
  address:{
    type: String
  },
  phone:{
    type: Number
  },
  description:{
    type: String
  }
  
})

module.exports = mongoose.model('User',regSchema)