var	http = require('http'),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	path = require('path'),
	fs = require('fs'),
	io = require('socket.io');
var currentuser;
var gamePlayed;
var gameWon;
var rate;
var prob;

var app = http.createServer(function(req, resp){
        var filename = path.join(__dirname, "static", url.parse(req.url).pathname);
        (fs.exists || path.exists)(filename, function(exists){
                if (exists) {
                        fs.readFile(filename, function(err, data){
                                if (err) {
                                        // File exists but is not readable (permissions issue?)
                                        resp.writeHead(500, {
                                                "Content-Type": "text/plain"
                                        });
                                        resp.write("Internal server error: could not read file");
                                        resp.end();
                                        return;
                                }

                                // File exists and is readable
                                var mimetype = mime.lookup(filename);
                                resp.writeHead(200, {
                                        "Content-Type": mimetype
                                });
                                resp.write(data);
                                resp.end();
                                return;
                        });
                }else{
                        // File does not exist
                        resp.writeHead(404, {
                                "Content-Type": "text/plain"
                        });
                        resp.write("Requested file not found: "+filename);
                        resp.end();
                        return;
                }
        });
});
app.listen(3456);

io.listen(app).sockets.on("connection", function(socket){
	socket.on("join", function(data){
		console.log("Function join: User " + data + " joined");
		currentuser = data;
		gamePlayed = 0;
		gameWon = 0;
		rate = 0;
		prob = 0.4;
		console.log("gamePlayed and gameWon initialized to zero");
		socket.emit("userAccepted", {
				name: currentuser,
				total: gamePlayed,
				win: gameWon
		});
	});
	
	socket.on("leave", function(data){
		console.log("Function leave: user " + data + " left");
		socket.emit("summary", {
				name: currentuser,
				total: gamePlayed,
				win: gameWon
		});
		gamePlayed = 0;
		gameWon = 0;
		rate = 0;
		currentuser = null;
	});
	
	socket.on("makeChoice", function(data){
		var response;
		console.log("Function makeChoice: User chose " + data);
		response = winOrLose(data);
		console.log("computer response = " + response);
		console.log("gamePlayed = " + gamePlayed + " and gameWon = " + gameWon);
		socket.emit("result", {
				name: currentuser,
				total: gamePlayed,
				win: gameWon,
				choice: data,
				response: response
		});
	});
});

function winOrLose(choice) {
	if (rate != 0) {
		rate = gameWon / gamePlayed;
	}
	console.log("Function winOrLose: rate = " + rate);
	var response;
	if (rate > prob) {
		response = gameLogic(0, choice);
	}
	else if (rate < prob) {
		response = gameLogic(1, choice);
	}
	else {
		response = gameLogic((Math.random() < 0.5 ? 0 : 1), choice);
	}
	return response;
}

//decision = 0: user loses
//decision = 1: user wins
function gameLogic(decision, choice) {
	var response;
	if (decision == 0) {
		if (choice == "rock") {
			response = "scissors";
		}
		else if (choice == "paper") {
			response = "rock";
		}
		else if (choice == "scissors"){
			response = "paper";
		}
		gamePlayed = gamePlayed + 1;
		rate = gameWon / gamePlayed;
	}
	else if (decision == 1) {
		if (choice == "rock") {
			response = "paper";
		}
		else if (choice == "paper") {
			response = "scissors";
		}
		else if (choice == "scissors"){
			response = "rock";
		}
		gamePlayed = gamePlayed + 1;
		gameWon = gameWon + 1;
		rate = gameWon / gamePlayed;
	}
	else {
		alert("Numerical error");
	}
	return response;
}