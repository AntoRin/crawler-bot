const fetch = require("node-fetch");
require("dotenv").config();
const Discord = require("discord.js");
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
  console.log(msg.content);
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
          msg.reply("Badabidabidaboom");
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
    let send = await msg.channel.send(embed);
    let reply = await send;
    for (emoji of optionEmojis) {
      reply.react(emoji);
    }
  }
}

async function youtube(statement, msg) {
  statement = statement.trim();
  let url = `https://youtube.googleapis.com/youtube/v3/search?q=${statement}&maxResults=10&key=${process.env.TUBE_API}`;

  let endPoint = await fetch(url);
  let response = await endPoint.json();
  console.log(response);
  // console.log(response.items[0].id);

  if (response.items[0].id.kind !== "youtube#video") {
    msg.channel.send("Try searching for a video instead of a channel");
    return;
  }
  let videoId = response.items[0].id.videoId;
  let videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  msg.channel.send(videoUrl);
}

async function unsplash(statement, msg) {
  statement = statement.trim();
  let url = `https://api.unsplash.com/search/photos?&client_id=${process.env.UNSPLASH_API}&page=1&query=${statement}`;

  let result = await fetch(url);
  let data = await result.json();

  msg.channel.send(data.results[0].urls.regular);
}

async function wiki(statement, msg) {
  statement = statement.trim();
  let wikiRequest = await fetch(
    `https://wikisnippets.herokuapp.com/api/wikisnippet/${statement}`
  );

  let snippet = await wikiRequest.json();
  console.log(snippet);
  let parsedSnippet =
    snippet.data.length > 1024
      ? snippet.data.substr(0, 1020) + "..."
      : snippet.data;

  let imageURL =
    snippet.image === ""
      ? "//www.dreamstime.com/no-image-available-icon-photo-camera-flat-vector-illustration-image132483097"
      : snippet.image;

  if (snippet.status === "error")
    return msg.channel.send("Try searching for a more accurate term");

  let wikiEmbed = new Discord.MessageEmbed({
    color: "#0000FF",
    title: statement,
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
}

module.exports = { client };
