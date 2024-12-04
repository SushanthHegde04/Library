const express=require('express');
const users=require('./MOCK_DATA.json')
const ejs=require('ejs')
const app=express();
const a=require("./database");
const path=require('path');
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.get('/api/users', (req, res) => {
   return res.render('homepage');
});
// app.get('/users',(req,res)=>
// {
//  const htnl=`  <ul>
//     ${users.map((users)=>`<li>${users.first_name}</li>`).join("")}
//    </ul>`
//    res.render('homepage')
// })
app.get("/api/users",async(req,res)=>{
    const userdata=await a.find({});
res.json(String(userdata));
})

app.get("/api/users/:id",(req,res)=>
{
const id=req.params.id;
const user=users.find(user=>user.id==id);
return res.json(user);
})
app.post("/users",(req,res)=>
{
    a.create({
        username:req.body.username,
        ph:req.body.ph,
    });
    res.send("Data inserted");
})

app.listen(5000,()=>
{
    console.log('Listening');
})









db.books.insertMany([
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      ISBN: "9780743273565",
      status: "available",
      Borrower: ""
    },
    {
      title: "1984",
      author: "George Orwell",
      ISBN: "9780451524935",
      status: "available",
      Borrower: ""
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      ISBN: "9780061120084",
      status: "available",
      Borrower: ""
    },
    {
      title: "Moby-Dick",
      author: "Herman Melville",
      ISBN: "9781503280786",
      status: "available",
      Borrower: ""
    },
    {
      title: "War and Peace",
      author: "Leo Tolstoy",
      ISBN: "9781400079988",
      status: "available",
      Borrower: ""
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      ISBN: "9780141199078",
      status: "available",
      Borrower: ""
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      ISBN: "9780316769488",
      status: "available",
      Borrower: ""
    },
    {
      title: "The Odyssey",
      author: "Homer",
      ISBN: "9780140268867",
      status: "available",
      Borrower: ""
    },
    {
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      ISBN: "9780486454115",
      status: "available",
      Borrower: ""
    },
    {
      title: "The Brothers Karamazov",
      author: "Fyodor Dostoevsky",
      ISBN: "9780374528379",
      status: "available",
      Borrower: ""
    }
  ])
  