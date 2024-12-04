const express=require('express');
const Book=require('./model/books')
const Member=require('./model/members');
const Transaction=require('./model/transactions');
const app=express();

const mongoose=require('mongoose');
const { EventEmitterAsyncResource } = require('connect-mongo');
mongoose
  .connect('mongodb://localhost:27017/libraryDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); 



  app.get("/books/available", async (req, res) => {
    try {
        // Find books with 'status' equal to 'available'
        const data = await Book.find({ status: 'available' });

        // Return the result as JSON
        res.json({ data });
    } catch (error) {
        // Handle any errors
        console.error("Error fetching available books:", error);
        res.status(500).json({ message: "Server error" });
    }
});


app.get("/books/:id", async (req, res) => {
  try {
    // Get the ID from the request parameters
    const id = req.params.id;

    // Find the book by its ID using findById() method
    const bookdetails = await Book.findById(id);

    // If no book is found, return an error response
    if (!bookdetails) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Return the book details as JSON
    res.json(bookdetails);
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching book details:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/books/issue/:id", async (req, res) => {
  const bookId = req.params.id;
  const { mobile, borrower, dueDate } = req.body; // Extract mobile, borrower, and dueDate from request body

  try {
    // Find the book by its ID
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    // Check if the book is available
    if (book.status !== 'available') {
      return res.status(400).json({ message: 'Book is already borrowed' });
    }

    const mobileStr = String(mobile);  // Convert the mobile to string

    // Now query the Member collection with the mobile as a string
    const member = await Member.findOne({ mobile: mobileStr });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Log the member object to ensure it's correct
    console.log('Member found:', member);

    // Update the book's status and set the borrower (use member._id)
    book.status = 'borrowed';
    book.Borrower = member._id;  // Set Borrower as member's ObjectId
    await book.save();

    // Create a new transaction for the book issue
    const transaction = new Transaction({
      book: bookId,
      borrower: member._id,  // Set borrower as member's ObjectId
      returnDate: dueDate,    // Store the due date
    });
    await transaction.save();

    // Return the borrower details and due date in the response
    res.json({
      message: 'Book issued successfully',
      borrower: {
        mobile: member.mobile,
        email: member.email,
      },
      dueDate,
    });

  } catch (error) {
    console.error('Error issuing book:', error); // Log error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.post("/books/return/:id", async (req, res) => {
  const bookId = req.params.id; // Book ID from the URL
  const { mobile } = req.body; // Mobile number of the member returning the book

  try {
    // Find the book by its ID
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Check if the book is borrowed
    if (book.status !== 'borrowed') return res.status(400).json({ message: 'Book is not currently borrowed' });

    // Find the member based on the mobile number provided in the request
    const member = await Member.findOne({ mobile: mobile });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Find the transaction associated with this book and borrower (using member's ObjectId)
    const transaction = await Transaction.findOne({
      book: bookId,
      borrower: member._id // Use the member's ObjectId here
     // Ensure it's not already returned
    });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Update the book and transaction
    book.status = 'available'; // Set book status to 'available'
    book.Borrower = null; // Clear the borrower field
    transaction.returnDate = new Date(); // Set the current date as return date

    // Save the updates to the book and transaction
    await book.save();
    await transaction.save();

    // Respond with the borrower's mobile number and confirmation of the return
    res.json({
      message: 'Book returned successfully',
      borrower: {
        mobile: member.mobile,  // Send member's mobile number in the response
        email: member.email,    // Send member's email in the response
      },
      returnDate: transaction.returnDate, // Send the return date
    });

  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

  app.delete("/books/delete/:id",async(req,res)=>{
    const bookId = req.params.id; // Get the book ID from the URL

    try {
        // Find and delete the book by ID
        const deletedBook = await Book.findByIdAndDelete(bookId);

        // If the book doesn't exist, return an error
        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Return success message with deleted book details
        res.json({
            message: "Book deleted successfully",
            deletedBook,
        });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ message: "Server error" });
    }
  })




  app.post("/members/add", async (req, res) => {
      const { name, mobile, email } = req.body; // Extract name, mobile, and email from the request body
  
      try {
          // Validate input
          if (!name || !mobile || !email) {
              return res.status(400).json({ message: "All fields (name, mobile, email) are required" });
          }
  
          // Create a new member
          const newMember = new Member({
              name,
              mobile,
              email,
          });
  
          // Save the member to the database
          const savedMember = await newMember.save();
  
          // Send success response
          res.status(201).json({
              message: "Member added successfully",
              member: savedMember,
          });
      } catch (error) {
          console.error("Error adding member:", error);
          res.status(500).json({ message: "Server error" });
      }
  });
  


 
app.put("/members/update/:id", async (req, res) => {
  const { id } = req.params; // Get the Member ID from the URL
  const { name, mobile } = req.body; // Extract name and mobile from the request body

  try {
      // Validate input
      if (!name && !mobile) {
          return res.status(400).json({
              message: "At least one field (name or mobile) is required to update"
          });
      }

      // Create an update object dynamically
      const updates = {};
      if (name) updates.borrower = name; // Assuming 'borrower' field holds the name
      if (mobile) updates.mobile = mobile;

      // Find and update the member by ID
      const updatedMember = await Member.findByIdAndUpdate(
          id, // Member ID
          updates, // Fields to update
          { new: true } // Return the updated document
      );

      // Check if member exists
      if (!updatedMember) {
          return res.status(404).json({ message: "Member not found" });
      }

      // Send success response
      res.json({
          message: "Member updated successfully",
          member: updatedMember,
      });
  } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Server error" });
  }
});

app.delete("/members/delete/:id", async (req, res) => {
  const { id } = req.params; // Get the Member ID from the URL

  try {
      // Find and delete the member by ID
      const deletedMember = await Member.findByIdAndDelete(id);

      // Check if the member was found and deleted
      if (!deletedMember) {
          return res.status(404).json({ message: "Member not found" });
      }

      // Send success response
      res.json({
          message: "Member deleted successfully",
          member: deletedMember,
      });
  } catch (error) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: "Server error" });
  }
});



  app.listen(5000,()=>
  {
    console.log("Listening")
  })