"use strict";

// import the mongoose library
var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var mongoose = require("mongoose");
var sockets = [];


app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect("mongodb://localhost/amazeriffic");

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [String]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

server.listen(3000);

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
        res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log(req.body);
    var newEntry = {"description": req.body.description, "tags": req.body.tags};
    var newToDo = new ToDo(newEntry);
    newToDo.save(function (err, result) { //jshint ignore:line
        if (err !== null) {
            // the element did not get saved!
            console.log(err);
            res.send("ERROR");
        } else {
            // our client expects *all* of the todo items to be returned, so we"ll do
            // an additional request to maintain compatibility
            ToDo.find({}, function (err, result) {
                if (err !== null) {
                    // the element did not get saved!
                    res.send("ERROR");
                }
                res.json(result);
                sockets.forEach(function (socket) {
                    socket.emit("newData", result);
                });
            });
        }
    });
});


io.on("connection", function (socket) {
    sockets.push(socket);
});
