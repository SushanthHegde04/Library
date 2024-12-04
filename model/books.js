const mongoose=require('mongoose')
//mongoose.connect("mongodb://localhost:27017/civiloan")

const booksSchema=new mongoose.Schema({
  title:{ type: String, required: true },
  author:{ type: String, required: true },
  ISBN:{ type: String },
  status:{ type: String },
  Borrower:{ type: String }


  })
  module.exports = mongoose.model('books', booksSchema);
