var socket = io.connect(window.location.origin);
var currentuser;

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.getElementById("st").addEventListener("click", 
	function(){
		document.getElementById("detail").innerHTML= ""
		document.getElementById("statistics").innerHTML = "";
		document.getElementById("finalPrompt").innerHTML= ""
		if (currentuser == null) {
			currentuser = document.getElementById("username").value;
			currentuser = htmlEntities(currentuser);
			socket.emit("join", currentuser);
			document.getElementById("username").value = "";
		}
		else {
			alert("You have already entered username!");
		}
		document.getElementById("st").value="";
});

document.getElementById("qt").addEventListener("click", 
	function(){
		if (currentuser == null) {
			alert("You have not started any game yet!");
		}
		else {
			socket.emit("leave", currentuser);
		}
});

listenToPics("rPic");
listenToPics("pPic");
listenToPics("sPic");

function listenToPics(name) {
	document.getElementById(name).addEventListener("click", 
		function(){
			if (currentuser != null) {
				var choice = this.getAttribute("value");
				socket.emit("makeChoice", choice);
			}
	});
}
socket.on("userAccepted", function(data){
	if (currentuser == data.name) {
		document.getElementById("gameContainer").style.display = "block";
		document.getElementById("welcome").innerHTML="Welcome to the game " + currentuser + "! Please choose one from below:";
	}
});

socket.on("result", function(data){
	if (currentuser == data.name) {
		document.getElementById("detail").innerHTML="You chose " + data.choice +" | Computer chose " + data.response;
		document.getElementById("statistics").innerHTML="Total game played: " + data.total 
		+ " | Total game won: " + data.win + " | Statistics: " + data.win/data.total;
	}
});

socket.on("summary", function(data){
	if (currentuser == data.name) {
		document.getElementById("gameContainer").style.display = "none";
		document.getElementById("finalPrompt").innerHTML="User " + data.name + " won " + data.win 
		+ " times in " + data.total + " games, and the winning rate is " + data.win/data.total;
		currentuser = null;
	}
});