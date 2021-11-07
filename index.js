require("dotenv").config();
const Discord = require("discord.js");
const axios = require("axios");
const chalk = require("chalk");
const fs = require("fs");

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});

client.on("ready", async () => {
  console.log(chalk.bold.green(`Discord Bot ${client.user.tag} is online!`));
  client.user.setPresence({ activities: [{ name: "with fortnite apis" }] });
  client.commands = new Discord.Collection();
  client.handlers = new Discord.Collection();
  const jsondir = "slash-json";
  for (const fileName of fs.readdirSync(jsondir)) {
    const fileContent = require(`./${jsondir}/${fileName}`);
    client.commands.set(fileName.split(".")[0], fileContent);
    console.log(chalk.bold.green(`Loaded command ${fileName}`));
    if (await client.application.commands.cache.has(fileContent.name))
      return console.log(
        chalk.bold.red(`Command ${fileContent.name} already exists!`)
      );
    else client.application.commands.create(fileContent).catch(console.error);
  }
  const cmdDir = "handlers";
  for (const fileName of fs.readdirSync(cmdDir)) {
    const fileContent = require(`./${cmdDir}/${fileName}`);
    client.handlers.set(fileName.split(".")[0], fileContent);
    console.log(chalk.bold.green(`Loaded handler ${fileName}`));
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const cmd = await client.handlers.get(interaction.commandName);
    if (cmd) {
      await cmd.run(client, interaction);
      console.log(chalk.gray(`Executed command ${interaction.commandName} | ${interaction.guildId} | ${interaction.user.id}`));
    } else {
      interaction.reply({ content: "Command not found!" });
    }
  }
});

client.login(process.env.TOKEN);
