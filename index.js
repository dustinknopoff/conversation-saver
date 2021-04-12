// Import the discord.js module
const Discord = require("discord.js");
const process = require("process");
require("dotenv").config();
const fs = require("fs");

const client = new Discord.Client();

const token = process.env.BOT_TOKEN;
const prefix = process.env.PREFIX;

// Ready
client.on("ready", () => {
  console.log("I am ready!");
  client.user.setPresence({ game: { name: "with my code", type: 0 } });
});

// Create an event listener for messages
client.on("message", async (message) => {
  if (message.author.bot) return;

  if (message.content[0] == prefix && message.content[1]) {
    let userCommand = message.content.toString().substring(1).split(" "); // Removes the prefix ('!') and splits the command away from the arguments

    switch (userCommand[0]) {
      case "save": //  Save Chat Logs for a Text Channel
        let writeMsg = [];
        let mostRecentMsg = userCommand[1];
        let oldestMsg = userCommand[2];
        await msgCollection(message, mostRecentMsg, oldestMsg, writeMsg);

        break;

      case "chelp":
        message.channel.send({
          embed: {
            color: 3447003,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL,
            },
            title: "Conversation Saver",
            description:
              "Here's a quick summary of Conversation Saver's Commands.  \n",
            fields: [
              {
                name: "!save <newest message ID> <oldest message ID>",
                value: "Allows you to save the entire Text Channel Chat Log.",
              },
            ],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
            },
          },
        });

        break;

      default:
        message.channel.send(
          "I'm sorry, I didn't understand that command. Try !help."
        );
    }
  }
});

// =-=-=-=-=-=  Functions for User Commands  =-=-=-=-=-=-=

//  Collects All of a Text Channels Chat Logs
async function msgCollection(message, mostRecentMsg, oldestMsg, writeMsg) {
  let overflowToggle = true;

  //  Works Reverse Chronologically:  It Grabs Recent Messages First and Works Backwards.
  await message.channel.messages
    .fetch({ limit: 100, before: mostRecentMsg, after: oldestMsg })
    .then((messages) => {
      console.log("Got an array!");
      messages.array().forEach((message, index) => {
        //  Funnels the last 100 Messages into an Array
        writeMsg.push(
          `${message.author.username.toString()}: ${message.content}`
        ); //  Writes the Message Author and Content to an Array

        //  Checks if a Text Channel has more than 100 Messages and Recursively Readies the Second Block of 100 Messages
        if (index == 99) {
          lastMsg = message.id;
          overflowToggle = false; //  Toggle to Make Sure All Messages are Collected in The Array Prior to being Written to a File.
          msgCollection(message, lastMsg, writeMsg);
        }
      });
      const filename = writeToFile(message, writeMsg, overflowToggle); //  Sends the Array to be Written to a File
      message.channel
        .send({
          files: [
            {
              attachment: filename,
              name: filename,
            },
          ],
        })
        .then(console.log)
        .catch(console.error);
    })
    .catch(console.error); //  Catches Promise Errors
}

// Writes the Collected Chat Logs to a File [log.txt]
function writeToFile(message, writeMsg, overflowToggle) {
  let d = new Date();
  let fileName = message.channel.name + "-" + d.getTime().toString() + ".txt";
  console.log("Block Saved!");
  if (overflowToggle == true) {
    for (i = writeMsg.length - 1; i >= 0; i--) {
      fs.appendFile(fileName, `${writeMsg[i]} \n`, (err) => {
        if (err) throw err;
      });
    }
  }
  return fileName;
}

// Bot Login
client.login(token);
