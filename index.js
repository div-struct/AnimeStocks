const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();


// URI FOR STORE DATABASES
const MONGO_URI1 = fs.readFileSync('URI1.txt', 'utf8').trim();
const MONGO_URI2 = fs.readFileSync('URI2.txt', 'utf8').trim();



// CONNECTION TO STORE DB
const db1 = mongoose.createConnection(MONGO_URI1,{useUnifiedTopology: true});
db1.on('open', () => console.log("Connected to DB1"));
db1.on('error', (err) => console.error('Error in DB1 connection: ', err));

// CONNECTION TO ADMIN ACCOUNT
const db2 = mongoose.createConnection(MONGO_URI2, {useUnifiedTopology: true});
db2.on('open', () => console.log("Connected to DB2"));
db2.on('error', (err) => console.log("Error in DB2 connection: ", err));



app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))


const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    pass: String
});

const itemSchema = new mongoose.Schema({
    name: String,
    link: String,
    genre: String,
    image: String,
    description: String,
    price: String
});

const mangaSchema = new mongoose.Schema({
    name: String,
    link: String,
    genre: String,
    image: String,
    description: String,
    price: String
});


// SCHEMA FOR ACC & ITEMS
let Admin;
let Item;
let Manga;

// CREATES THE MODEL TO THE DB
try {
    Admin = db2.model('Admin', adminSchema);
    Item = db1.model("Item", itemSchema);
    Manga = db1.model("Manga", mangaSchema);
} catch(error) {
    console.error(error);
}


app.post('/Login', async (req,res) => {
    var email = req.body.email;
    var pass = req.body.password;

    const admin = await Admin.findOne({email:email, pass:pass});
    if(admin){
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="/css/admin.css"/>
            <title>Admin</title>
        </head>
        <body>
            <section id="mainCon">
                <div id="box">
                    <form id="form2" action="/addon" method="post">
                        <label> Name
                            <input name="name" type="text" required/>
                        </label>
                        <label> Genre
                            <input name="genre" type="text" required/>
                        </label>
                        <label> Link
                            <input name="link" type="text" required/>
                        </label>
                        <label> Image
                            <input name="image" type="text" required/>
                        </label>
                        <label> Description
                            <input name="description" type="text" required/>
                        </label>
                        <label> Price
                            <input name="price" type="text" required/>
                        </label>
                        <button type="submit" value="submit">Add</button>
                    </form>
                </div>
            </section>
        </body>
        </html>`)
    }
    else {
        console.log('Login failed for email and pass:', email, pass);
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="/css/admin.css"/>
            <title>ADMINISTATOR</title>
        </head>
        <body>
            <section id="main">
                <div id="log">
                    <h1>LOG IN</h1>
                    <form action="/Login" method="post">
                        <input id="user" name="email" type="text" placeholder="Enter username" required />
                        <input id="pass" name="password" type="password" placeholder="Enter password" required/>
                        <button id="btn" type="submit" value="submit">Login</button>
                        <h2 id="err">Username or password is incorrect</h2>
                    </form>
                </div>
            </section>
        </body>
        </html>`);
    }
})



app.post('/addon', (req, res) => {
    var name = req.body.name;
    var genre = req.body.genre;
    var link = req.body.link;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;

    const item = new Item({name:name, genre:genre, link:link, image:image, description:description, price:price});
    item.save();
    return res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" type="text/css" href="/css/admin.css"/>
        <title>Admin</title>
    </head>
    <body>
        <section id="mainCon">
            <div id="box">
                <form id="form2" action="/addon" method="post">
                    <label> Name
                        <input name="name" type="text" required/>
                    </label>
                    <label> Genre
                        <input name="genre" type="text" required/>
                    </label>
                    <label> Link
                        <input name="link" type="text" required/>
                    </label>
                    <label> Image
                        <input name="image" type="text" required/>
                    </label>
                    <label> Description
                        <input name="description" type="text" required/>
                    </label>
                    <label> Price
                        <input name="price" type="text" required/>
                    </label>
                    <button type="submit" value="submit">Add</button>
                </form>
            </div>
        </section>
    </body>
    </html>`);
});







app.get("/Merch", async (req, res) => {
    try {
        const itemArr = await Item.find();

        itemArr.reverse();

        const itemsHTML = itemArr.map((item) => {
            return `
                <div id="itemCon" class="${item.genre}">
                    <a href="${item.link}" target="_blank">
                        <img src="${item.image}" alt="${item.name}">
                        <h1>${item.name}</h1>
                        <p>${item.description}</p>
                        <h2>${item.price}</h2>
                    </a>
                </div>
            `;
        }).join('\n');

        const hp1 = fs.readFileSync(__dirname + "/public/html/Merch.html", "utf8");
        const update = hp1.replace('<div id="compiler">', `<div id="compiler">\n${itemsHTML}\n`);

        res.send(update);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

app.get('/adomino', (req, res) => {
    return res.redirect("adomino.html");
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin":"*"
    })
    return res.redirect("Main.html");
}).listen(3000);


console.log("Listening to Port 3000");