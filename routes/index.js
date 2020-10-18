const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/";

/* GET home page. */
router.get("/", function(req, res, next) {
    res.status(200).send("Rest  API started");
});

router.post("/register", (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
        if (!err) {
            console.log("Database connected");
            var dbo = database.db("iConnect");
            let userData = req.body;
            delete userData.Cpassword;
            dbo.collection("users").insertOne(userData, (error, user) => {
                if (!error) {
                    let payload = { subject: user._id };
                    let token = jwt.sign(payload, "myKey753698");
                    res.status(200).send({ token });
                    database.close();
                } else {
                    res.send(error);
                }
            });
        } else {
            res.send(error);
        }
    });
});

router.post("/login", (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
        if (!err) {
            var dbo = database.db("iConnect");
            let userData = req.body;
            dbo
                .collection("users")
                .findOne({ email: userData.email }, (error, user) => {
                    if (!error) {
                        if (!user) {
                            res.status(401).send("Email is invalid");
                        } else if (user.password !== userData.password) {
                            res.status(401).send("Password is incorrect.");
                        } else {
                            let payload = { subject: user._id };
                            let token = jwt.sign(payload, "myKey753698");
                            res.status(200).send({ token });
                        }
                    } else throw error;
                });
        } else {
            res.status(401).send(error);
        }
    });
});
module.exports = router;