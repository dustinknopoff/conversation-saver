// Import the discord.js module
const Discord = require("discord.js");
const process = require("process");
require("dotenv").config();
const fs = require("fs");
const http = require("http");

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
    let userCommand = message.content
      .toString()
      .substring(prefix.length)
      .split(" "); // Removes the prefix ('!') and splits the command away from the arguments

    switch (userCommand[0]) {
      case "save": //  Save Chat Logs for a Text Channel
        let writeMsg = [];
        let mostRecentMsg = userCommand[1];
        let oldestMsg = userCommand[2];
        await msgCollection(message, mostRecentMsg, oldestMsg, writeMsg);

        break;

      case "cshelp":
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
                name: "!save <NEWEST message ID> <OLDEST message ID>",
                value:
                  "Allows you to save the entire chat log between the two message IDs. To retrieve message IDs, hold (or click '...' menu) message and select 'Copy ID'.",
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

/**
 *
 * @param {Message} message
 * @param {number} mostRecentMsg
 * @param {number} oldestMsg
 * @param {string[]} writeMsg
 */
async function msgCollection(message, mostRecentMsg, oldestMsg, writeMsg) {
  let overflowToggle = true;
  let d = new Date();
  let fileName = message.channel.name + "-" + d.getTime().toString() + ".txt";
  //  Works Reverse Chronologically:  It Grabs Recent Messages First and Works Backwards.
  await message.channel.messages
    .fetch({ limit: 100, before: mostRecentMsg, after: oldestMsg })
    .then((messages) => {
      console.log("Got an array!");
      const arr = messages.array();
      arr.forEach((message, index) => {
        //  Funnels the last 100 Messages into an Array
        console.log(message.id);
        writeMsg.push(
          `${message.author.username.toString()}: ${message.content}`
        ); //  Writes the Message Author and Content to an Array

        //  Checks if a Text Channel has more than 100 Messages and Recursively Readies the Second Block of 100 Messages
        if (arr[arr.length - 1].id != oldestMsg && index == 99) {
          lastMsg = message.id;
          overflowToggle = false; //  Toggle to Make Sure All Messages are Collected in The Array Prior to being Written to a File.
          console.log("Recursing");
          msgCollection(message, lastMsg, oldestMsg, writeMsg);
        }
      });
      writeToFile(fileName, writeMsg, overflowToggle); //  Sends the Array to be Written to a File
    })
    .catch(console.error); //  Catches Promise Errors
  if (fs.existsSync(fileName))
    message.channel
      .send({
        files: [
          {
            attachment: fileName,
            name: fileName,
          },
        ],
      })
      .then(console.log)
      .catch(console.error);
}

// Writes the Collected Chat Logs to a File [log.txt]
/**
 *
 * @param {string} fileName
 * @param {string[]} writeMsg
 * @param {boolean} overflowToggle
 */
function writeToFile(fileName, writeMsg, overflowToggle) {
  console.log("Block Saved!");
  if (overflowToggle == true) {
    console.log(writeMsg[0], writeMsg.length, overflowToggle, fileName);
    for (i = writeMsg.length - 1; i >= 0; i--) {
      fs.appendFile(fileName, `${writeMsg[i]} \n`, (err) => {
        if (err) {
          console.log("Err");
          throw err;
        }
      });
    }
  }
}

// Bot Login
client.login(token);

http
  .createServer(function (request, response) {
    console.log("request starting for ");
    console.log(request);
  })
  .listen(process.env.PORT || 5000);
