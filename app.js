const express = require("express");
const app = express();
const ejs = require("ejs");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 5000;
const mongoclient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs')
const url = "mongodb+srv://Pushkar:zA!2@7B5VHz-dev@polling.jj9te.mongodb.net/Polling_db?retryWrites=true&w=majority";
// const url = "mongodb://localhost/27017";

app.get("/", (req, res) => {
    res.render("../main_page.ejs");
});

app.get("/view_poll", (req, res) => {
    // res.send("shere");
    mongoclient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;

        var dbs = db.db("Polling_db");
        dbs.collection("questions").find({}).toArray((err, result) => {
            if (err) throw err;
            console.log("sucessfully shared");
            res.render("../view_poll.ejs", { questions: result });
        });
    })
})

app.post("/view_poll", (req, res) => {
    var { id, option } = req.body;
    option = option.toString();
    mongoclient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        var dbs = db.db("Polling_db");
        dbs.collection("questions").findOne({ "_id": ObjectId(id) }, (err, result) => {
            if (err) throw err;
            result["o" + option]++;
            var new_val = result;
            console.log(result);
            dbs.collection("questions").updateOne({ "_id": ObjectId(id) }, { $set: new_val }, (err, result) => {
                if (err) throw err;
                console.log("sucessfully updated");
                dbs.collection("questions").find({}).toArray((err, result) => {
                    if (err) throw err;
                    console.log("sucessfully shared");
                    res.render("../view_poll.ejs", { questions: result });
                });
            });
        });
    })
})

app.post("/make_poll", (req, res) => {

    var que = req.body;
    var new_que = {
        ...que,
        "o1": 0,
        "o2": 0,
        "o3": 0,
        "o4": 0,
    }
    mongoclient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;

        var dbs = db.db("Polling_db");
        dbs.collection("questions").insertOne(new_que, (err) => {
            if (err) throw err;
            console.log("sucessfully inserted");
            // res.render("../main_page.ejs");
            res.redirect("/view_poll");
        });
    })
});
app.get("/make_poll", (req, res) => {
    res.render("../make_poll.ejs");
})
app.delete("/view_poll/:id", (req, res) => {
    var id = req.params.id;

    mongoclient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;

        var dbs = db.db("Polling_db");
        dbs.collection("questions").deleteOne({ _id: ObjectId(id) }, (err) => {
            if (err) throw err;
            console.log("sucessfully deleted");
            // console.log("error ABCD");
            // res.redirect("/");
            dbs.collection("questions").find({}).toArray((err, result) => {
                if (err) throw err;
                console.log("sucessfully shared");
                res.render("../view_poll.ejs", { questions: result });
            });
        });
    })
})



app.listen(port, (err) => {
    if (err) throw err;
    console.log("sucessfully started");
})
