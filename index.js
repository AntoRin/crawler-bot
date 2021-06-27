const { client } = require("./bot");
require("dotenv").config();

client.login(process.env.BOT_TOKEN);
