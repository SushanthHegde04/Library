const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    issueDate: { type: Date, default: Date.now },
    returnDate: { type: Date }
});

module.exports = mongoose.model('Transaction', transactionSchema);
