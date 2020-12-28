#!/usr/bin/env node

const socketIOClient = require("socket.io-client");
const ENDPOINT = "https://clichatserver.herokuapp.com/";
colors = require('colors')
const readline = require("readline");


var USERSString = "Room" + '#' + Math.floor(1000 + Math.random() * 9999); +','
var autoComplete = function completer(line) {
    const completions = USERSString.split(',');
    const hits = completions.filter((c) => c.startsWith(line));
    return [hits.length ? hits : completions, line];

}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: autoComplete
});
console.log("    ___________________________________________".rainbow);
console.log("   |                                           |".rainbow);
console.log("   |    (:..    Welcome To cliChat    ...:)    |");
console.log("   |___________________________________________|".rainbow);

console.log(" ")

rl.setPrompt('[' + 'me'.red + ']>');
rl.prompt();

 
    rl.question("Please Enter Room name you wish to Join or Create: ", function (roomname) {

        if (roomname.includes('#') && roomname.split('#')[1].length == 4) {
            var RoomStr = roomname.split('#')[0]
            var RoomNumber = roomname.split('#')[1]
            var ROOMNAME = `${RoomStr}`.blue + `${'#' + RoomNumber}`.grey

        } else {
            roomname = roomname.replace(/[^a-zA-Z ]/g, "").replace(/ /g, '') || 'Room'
            var RoomStr = roomname
            var RoomNumber = '#' + Math.floor(1000 + Math.random() * 9999);
            var ROOMNAME = `${RoomStr}`.blue + `${RoomNumber}`.grey
            roomname = roomname + RoomNumber
        }

        if (roomname.trim() == "") {
            // roomname="Room"+'#'+Math.floor(1000 + Math.random() * 99); 
        } else {
            // roomname=roomname.replace(/[^a-zA-Z ]/g, "").replace(/ /g,'')+'#'+Math.floor(1000 + Math.random() * 9999); 
        }

        rl.question("What is your NickName ? ", function (userName) {
            if (userName.trim() == "") {
                userName = "User_" + Math.random().toString(36).substr(2, 5)
            }

            const socket = socketIOClient(ENDPOINT, {
                query: {
                    userName: userName,
                    roomName: roomname
                },
            });

            console.log("***************************************************");
            console.log("* Hello " + `${userName}`.red + ' Welcome to ' + ROOMNAME);
            console.log("* 1.To send message to Channel type and hit enter");
            console.log("* 2.To send Private message type @<username> ");
            console.log("* 3.Use Tab Key to auto-complete usernames");
            console.log("***************************************************");

            socket.on(roomname, data => {



                var username = data.userName
                if (data.userName != userName && data.mode == "all") {
                    rl.setPrompt('[' + `${ROOMNAME}` + ']' + '[' + `${username}`.cyan + ']>');
                    rl.prompt();
                    console.log(data.message);
                }

                if (data.userName != userName && data.mode == userName) {
                    rl.setPrompt('[' + `${ROOMNAME}` + ']' + '[' + `${username}`.cyan + ']>');
                    rl.prompt();
                    var massege = data.message.replace('@' + userName, " ")
                    console.log('(Private)'.yellow + massege);

                }
                rl.setPrompt('[' + `${ROOMNAME}` + '][' + 'me'.red + ']>');
                rl.prompt();

            });

            socket.on(roomname + '_users', data => {
                rl.setPrompt('[' + `${ROOMNAME}` + ']>');
                rl.prompt();
                if (data.msg == "joined") {
                    USERSString = data.roomUsersList
                    console.log(data.userName + " Joined !!".green);
                } else {
                    console.log(data.userName + " Left !!".yellow);
                    USERSString = data.roomUsersList
                }

                rl.setPrompt('[' + 'me'.red + ']>');
                rl.prompt();

            });

            rl.prompt();

            rl.on('line', function (line) {
                var mode = "";
                var tragetuser = ""
                if (line.trim().charAt(0) == '@') {
                    mode = 1;
                    tragetuser = line.trim().split(' ')[0].substring(1)

                }

                switch (mode) {
                    case 1:

                        //console.log('Say what? I might have heard `' + line.trim() + '`');
                        rl.setPrompt('[' + roomname + '][' + 'me'.red + ']>');
                        rl.prompt();

                        var msgData = { roomname: roomname, userName: userName, message: line.trim().replace('@' + userName + ' ', " "), mode: tragetuser }
                        socket.emit('newChatMessage', msgData);
                        break;
                    default:
                        //console.log('Say what? I might have heard `' + line.trim() + '`');
                        rl.setPrompt('[' + roomname + '][' + 'me'.red + ']>');
                        rl.prompt();
                        var msgData = { roomname: roomname, userName: userName, message: line.trim(), mode: "all" }
                        socket.emit('newChatMessage', msgData);
                        break;
                }
                rl.prompt();
            }).on('close', function () {
                console.log('Have a great day!');
                process.exit(0);
            });


        });
    });


 


rl.on("close", function () {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});

