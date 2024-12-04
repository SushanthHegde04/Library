const mongoose=require('mongoose')
//mongoose.connect("mongodb://localhost:27017/civiloan")

const memberSchema=new mongoose.Schema({
   name:{ type: String, required: true },
   mobile:{ type: String, required: true },
email:{type:String,required:true}

  })
  module.exports = mongoose.model('members', memberSchema);
