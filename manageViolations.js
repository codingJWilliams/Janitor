var MongoClient = require('mongodb')
  .MongoClient;
var url = require("./token.json")
  .mongo;
var assert = require("assert")
var db = null;
var Discord = require("discord.js");
var client = null;
var modlog = null;
var whoaaaaaaa = require("./disallowed.json")
String.prototype.replaceAll = require("./helpers/replaceAll");
MongoClient.connect(url, {
  authSource: "admin"
}, function (err, _db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = _db
  global.db = _db
});
exports.setClient = (_client) => {
  client = _client;
  modlog = _client.guilds.get("300155035558346752")
    .channels.get("380284981773336576")
};
exports.getViolations = async (id) => db ? await db.collection("violations")
  .find({
    uid: id,
    archived: false
  })
  .toArray() : null;
exports.sendDm = async (auto, member, prev, content, indicated) => {
  var dm = await member.createDM();
  var punishmentMessage = "";
  if (prev == 0) {
    punishmentMessage = "Since this is your first chat violation, this is just a warning. If you recieve 2 more warnings your souls and tags will be reset, and you will be kicked from the server."
  } else if (prev == 1) {
    punishmentMessage = "This is your second chat violation. If you recieve another warning, your souls and tags will be reset, and you will be kicked from the server."
  } else {
    punishmentMessage = "As you have recieved 3 warnings, you were kicked from the server, and your souls reset."
  }
  if (auto) {
    dm.send(new Discord.RichEmbed()
      .setTitle("Your message was deemed to be against Nightborn rules")
      .setDescription("We do not allow racism of any kind.")
      .setColor(0xFF0000)
      .addField("Your punishment", punishmentMessage)
      .addField("Flagged content", indicated)
      .addField("Was this in error?", "Speak to one of the dons, or VoidCrafted."))
  } else {
    dm.send(new Discord.RichEmbed()
      .setTitle("You were deemed to be breaking Nightborn rules")
      .setDescription("We do not allow racism of any kind.")
      .setColor(0xFF0000)
      .addField("Your punishment", punishmentMessage)
      .setFooter("Manually added violation"))
  }
}
module.exports.manualAddViol = async (message) => {
  if (!message.member.roles.has("378906283727781888")) return;
  if (false && !message.mentions.length) {
    message.reply("Invalid usage. Could not detect a mention. If you only have the ID put \\<@id>");
    return;
  }
  if (true) {
    console.log("cmd")
    var person = message.mentions.members.first();
    console.log(person)
    var viols = await exports.getViolations(person.id);
    await exports.sendDm(false, person, viols.length, message.content)
    await exports.addViol(person, message.content);
    modlog.send(new Discord.RichEmbed()
      .setTitle("[Violation]")
      .setDescription(`Violation number ${viols.length + 1} by <@${person.id}>`)
      .addField("Manual Violation", "This was manually added by " + message.author.username)
      .setColor(0xFF0000))
    if (viols.length == 2) {
      exports.exile(person);
    }
  }
}
exports.indicate = (text) => {
  whoaaaaaaa.map(whoa => {
    text = text.toLowerCase()
      .replaceAll(whoa, "__" + whoa + "__")
  });
  return text;
}
exports.exile = async (member) => {
  exports.archiveAll(member);
  try {
    await member.kick("Recieved 3 violations")
  } catch (e) {
    modlog.send({
      embed: {
        title: "Couldn't kick a member",
        description: "Couldn't kick <@" + member.id + "> because of a permission error.",
        color: 0xFF0000
      }
    })
  }
}
exports.hasViolation = async (message) => {
  if (db) {
    var fails = whoaaaaaaa.some((banned) => {
      return message.content.toLowerCase()
        .indexOf(banned) !== -1;
    });
    if (fails) {
      var viols = await exports.getViolations(message.author.id);
      await exports.sendDm(true, message.member, viols.length, message.content, exports.indicate(message.content))
      await exports.addViol(message.member, message.content, true);
      modlog.send(new Discord.RichEmbed()
        .setTitle("Violation in #" + message.channel.name)
        .setDescription(`Violation number ${viols.length + 1} by <@${message.member.id}>`)
        .addField("Detected content", exports.indicate(message.content))
        .setColor(0xFF0000))
      if (viols.length == 2) {
        exports.exile(message.member);
      }
      await message.delete()
    }
  }
}
exports.archiveAll = async (member) => await db.collection("violations")
  .updateMany({
    uid: member.id,
    archived: false
  }, {
    $set: {
      archived: true
    }
  })
exports.addViol = async (member, content, auto) => {
  if (auto) {
    db.collection("violations")
      .insertOne({
        uid: member.id,
        archived: false,
        manual: false,
        messageContent: content,
        messageContentIndicated: exports.indicate(content)
      })
  } else {
    db.collection("violations")
      .insertOne({
        uid: member.id,
        archived: false,
        manual: true
      })
  }
}
