const Discord = require("discord.js");
const client = new Discord.Client();
var manageViolations = require("./manageViolations");
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  manageViolations.setClient(client)
});
client.on('message', msg => {
  if (msg.content.startsWith("!addvio")) {
    console.log("Passed")
    manageViolations.manualAddViol(msg);
    return;
  }
  manageViolations.hasViolation(msg)
});
client.on("messageUpdate", (oldm, newm) => {
  manageViolations.hasViolation(newm)
})
client.login(require("./token.json").token);
