const fetch = require("node-fetch");
require("dotenv").config();
const Discord = require("discord.js");
const EventEmitter = require("events");

const client = new Discord.Client();

client.on("ready", () => {
   console.log("logged in as " + client.user.tag);
   const general = client.channels.cache.get("798792038518620161");
   client.user.setActivity("The Godfather", { type: "WATCHING" });
   general.send("Crawler Bot has joined the party");
});

client.on("message", checkCommand);

const commandList = ["poll", "hello", "help", "youtube", "unsplash", "wiki"];

function checkCommand(msg) {
   let message = msg.toString();

   if (message[0] === "!") {
      let messageWords = message.split(" ");
      let command = messageWords[0];
      command = command.slice(1, command.length);

      if (commandList.includes(command)) {
         switch (command) {
            case "poll":
               poll(message.slice(5, message.length), msg);
               break;
            case "hello":
               msg.channel.send(`hello, ${msg.author.username}`);
               break;
            case "help":
               msg.reply(commandList);
               break;
            case "youtube":
               youtube(message.slice(command.length + 1, message.length), msg);
               break;
            case "unsplash":
               unsplash(message.slice(command.length + 1, message.length), msg);
               break;
            case "wiki":
               wiki(message.slice(command.length + 1, message.length), msg);
               break;
            default:
               msg.reply("Yeah, shut the fuck up for a second Jesus Christ");
         }
      }
   }
}

function poll(statement, msg) {
   if (statement.length === 0) {
      msg.reply(
         "Use this template to create a poll: !poll question: <question>? <option1> | <option2>...."
      );
      return;
   }

   statement = statement.split("?");
   if (
      !statement[0].includes("question") &&
      !statement[0].includes("Question") &&
      !statement[0].includes("QUESTION")
   ) {
      msg.reply("Question required");
      return;
   }
   question = statement[0];
   options = statement[1].split("|");
   if (options.length < 2) {
      msg.reply(
         "Everyone knows you need just two to four options to start a poll"
      );
      return;
   }
   let optionEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
   const embed = new Discord.MessageEmbed();
   embed.setColor("#FF0000");
   embed.setTitle("Poll");
   embed.setDescription(
      `Participate in the poll created by ${msg.author.username}`
   );
   embed.addField("Question", question);
   embed.addField("Options", options);
   sendEmbed(embed);
   async function sendEmbed(embed) {
      try {
         let send = await msg.channel.send(embed);
         let reply = await send;
         for (emoji of optionEmojis) {
            reply.react(emoji);
         }
      } catch (error) {
         msg.channel.send("There was an error");
      }
   }
}

async function youtube(statement, msg) {
   try {
      statement = statement.trim();

      let searchUrl = process.env.SEARCH_YT_URL;

      let postBody = {
         q: statement,
         totalPages: 1,
      };

      let responseStream = await fetch(searchUrl, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(postBody),
      });
      let response = await responseStream.json();

      if (response.status === "error")
         throw new Error("There was an error, sorry...");

      msg.channel.send(response.data.links[0]);
   } catch (error) {
      msg.channel.send(error.message);
   }
}

async function unsplash(statement, msg) {
   try {
      statement = statement.trim();

      let searchUrl = process.env.SEARCH_DEFAULT_URL;

      let postBody = {
         q: statement + "unsplash",
         hostName: "unsplash",
         hostNameFilterType: "follow",
         totalPages: 1,
      };

      let responseStream = await fetch(searchUrl, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(postBody),
      });
      let response = await responseStream.json();

      if (response.status === "error")
         throw new Error("There was an error getting your image");

      let imgLink = response.data.imageLinks.find(link => link !== "");

      if (!imgLink) throw new Error("Try a more generic term");

      msg.channel.send(imgLink);
   } catch (error) {
      msg.channel.send(error.message);
   }
}

async function wiki(statement, msg) {
   try {
      statement = statement.trim();

      const listener = new EventEmitter();

      msg.channel
         .send("Wait for a second while I ask my buddy Wiki")
         .then(thisMessage => {
            listener.on("Snippet Received", () => {
               thisMessage.delete();
            });
         });

      let wikiRequest = await fetch(
         `https://wikisnippets.herokuapp.com/api/wikisnippet/${statement}`
      );

      let snippet = await wikiRequest.json();
      listener.emit("Snippet Received");

      let parsedSnippet =
         snippet.data.length > 1024
            ? snippet.data.substr(0, 1020) + "..."
            : snippet.data;

      let imageURL =
         snippet.image === ""
            ? "//thumbs.dreamstime.com/z/no-image-available-icon-photo-camera-flat-vector-illustration-132483097.jpg"
            : snippet.image;

      if (snippet.status === "error")
         return msg.channel.send("Try searching for a more accurate term");

      let wikiEmbed = new Discord.MessageEmbed({
         color: "#0000FF",
         title: statement.toUpperCase(),
         description: `A wiki snippet about ${statement}`,
         fields: [
            {
               name: "Snippet",
               value: parsedSnippet,
            },
         ],
         image: { url: "https:" + imageURL },
      });

      msg.channel.send(wikiEmbed);
   } catch (error) {
      msg.channel.send("There was an error");
   }
}

module.exports = { client };
