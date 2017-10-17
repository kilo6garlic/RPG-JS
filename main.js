const Discord = require("discord.js");
const self = new Discord.Client();
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./data/config.json","utf8"));
var token;
if (config.devMode && !config.forceMain) {
	token = config.tokens.dev;
} else {
	token = config.tokens.main;
}

const util = require("./ext/util.js");

const Game = require("./classes");
const system = new Game.System();

const arrays = {
	classes: ["warrior","mage","scout"],
	traits: ["tough","blessed","buff","hardened","athletic","wealthy"]
}

const embeds = {
	classes: function() {
		return new Discord.RichEmbed()
		.setTitle("Classes")
		.setDescription("Choose one of the following as your class!")
		.addField("Warrior","Bonus points on attack and defense, although slower.")
		.addField("Mage","Starts out with a few spells and a higher mana pool.")
		.addField("Scout","Higher speed and health pool.");
	},
	traits: function() {
		return new Discord.RichEmbed()
		.setTitle("Traits")
		.setDescription("Choose one of the following as your trait!")
		.addField("Tough","HP+",true)
		.addField("Blessed","Mana+",true)
		.addField("Buff","Atk+",true)
		.addField("Hardened","Def+",true)
		.addField("Athletic","Spd+",true)
		.addField("Wealthy","+500 Gold",true);
	},
	profMng: function() {
		return new Discord.RichEmbed()
		.setTitle("Profile Management")
		.setDescription("Say one of the below options to manage your profile.")
		.addField("Change name","Change your player profile's name (cost: 100.000 gold)")
		.addField("Change avatar","Change your player profile's avatar")
		.addField("Display profile","Display your player profile")
		.addField("Add friend","Add a friend to your player profile's friend list");
	}
}

self.login(token);

self.on("ready", () => {
	self.owner = self.fetchUser("211227683466641408");
	console.log("No errors have been encountered!");
	console.warn(`Logged into Discord as ${self.user.tag}\n`);
})

self.on("message", msg => {
	if (msg.author.bot) return;

	// If the user is **not** a registered player
	if (msg.channel.type == "dm" && !system.players.get(msg.author.id)) {
		system.players.set(msg.author.id,"To be set");
		msg.channel.send("I haven't seen you before! Would you like to register as a player?");
		let collector = msg.channel.createMessageCollector(m => m.author == msg.author, {time: 20000});

		collector.on("collect", m => {
			if (m.content.toLowerCase().startsWith("n")) {
				collector.stop();
				m.channel.send("Alright, hit me up if you change your mind!");
				system.players.delete(msg.author.id);
			} else if (m.content.toLowerCase().startsWith("y")) {
				collector.stop();
				m.channel.send("Alright, send me your choice of name, your preferred class and trait, each in a new line!");
				m.channel.send({embed: embeds.classes()});
				m.channel.send({embed: embeds.traits()});
				let collector2 = m.channel.createMessageCollector(m2 => m2.author == m.author, {time: 120000});
				collector2.on("collect", m2 => {
					let settings = m2.content.split("\n");
					if (settings[0].toLowerCase() == "cancel") {
						m2.channel.send("Registration aborted! Let me know if you change your mind!");
						return;
					}
					if (settings.length != 3) {
						m2.channel.send("Sorry, something went wrong, please use the following syntax:```\nName\nClass\nTrait```");
					}
					else if (arrays.classes.indexOf(settings[1].toLowerCase()) < 0 || arrays.traits.indexOf(settings[2].toLowerCase()) < 0) {
						m2.channel.send("Invalid class or trait name! Make sure you spelt them correctly!");
					} else {
						let newPlayer = system.newPlayer(m2.author,settings[0],settings[1].capFirstLetter(),settings[2].capFirstLetter());
						system.savePlayerData();
						m2.channel.send("Thank you for registering! This is your profile:",{embed: newPlayer.generateProfile(m2.author)});
					}
				});
				collector2.on("end",(collected, reason) => {
					if (reason == "time") {m.channel.send("Time out! You took too long, command cancelled!")}
				});
			}
		});
		collector.on("end", (collected, reason) => {
			if (reason == "time") {msg.channel.send("Alright, I guess you don't! Command cancelled, speak to me again if you change your mind!")}
		});

	// If the user is a registered player
	} else if (msg.channel.type == "dm" && system.players.get(msg.author.id)) {
		if (!msg.author.interacting) {
			msg.author.interacting = true;
			let player = system.players.get(msg.author.id);

			// Abort if I fucked up
			if (instanceof player != "Player") {
				msg.channel.send(`Error: "player" is not instance of Player! "player" is instance of ${instanceof player}!`);
				return;
			}

			msg.channel.send(`Hello, ${player.name}, what can I do for you today?`,{embed: embeds.profMng()});
			let collector = msg.channel.createMessageCollector(m => m.author == msg.author, {time: 45000});
			collector.on("collect", m => {
				switch(m.content.toLowerCase()) {
					case "cancel": {
						collector.stop();
						m.channel.send("Command cancelled, have a nice day!");
					}
					break;
					case "show profile": {
						collector.stop();
						m.channel.send("Here's your player profile:",{embed: player.generateProfile()});
					}
					break;
					case "change name": {
						collector.stop();
						if (player.gold < 100000) {
							m.channel.send(`You don't have enough gold to afford a name change!\n(If your name contains a simple typo, feel free to message ${self.owner.tag}, they will manually change it for you at no cost.)`);
						} else {
							m.channel.send("Please enter your new name or `cancel`!");
							let collector2 = m.channel.createMessageCollector(m2 => m2.author == m.author, {time: 60000});
							collector2.on("collect", m2 => {
								collector2.stop();
								if (m2.content.toLowerCase() == "cancel") {
									m2.channel.send("Command cancelled, have a nice day!");
								} else {
									player.changeName(m2.content);
									m2.channel.send(`Success! Your new name is now ${player.name}!`);
								}
							});
							collector2.on("end",(collected,reason) => {
								if (reason == "time") m.channel.send("Time up! Command cancelled!");
							});
						}
					}
					break;
					case "change avatar": {
						m.channel.send("Please send me the image you would like to use as your profile avatar!");
						let collector2 = m.channel.createMessageCollector(m2 => m2.author == m.author, {time: 60000});
						collector2.on("collect", m2 => {
							collector.stop();
							if (m2.content.toLowerCase() == "cancel") {
								m2.channel.send("Command cancelled, have a nice day!");
							} else if (m2.attachments.first() && m2.attachments.first().url.endsWith(".jpg" || ".png" || ".bmp" || ".gif")) {
								m2.channel.send("Found valid attachment! Processing...");
								util.checkURL(m2.attachments.first().url).then(() => {
									m2.channel.send("Avatar valid, saving it to your profile!");
									player.changeAvatar(m2.attachments.first().url);
									system.savePlayerData();
								}, error => {
									m2.channel.send(`Error processing your new avatar: ${error}`);
								});
							} else if (m.content.toLowerCase().endsWith(".jpg" || ".png" || ".bmp" || ".gif")) {
								m2.channel.send("No attachment found, assuming you've sent a link. Processing...");
								util.checkURL(m2.content).then(() => {
									m2.channel.send("Link valid, saving it to your profile!");
									player.changeAvatar(m2.content);
									system.savePlayerData();
								}, error => {
									m2.channel.send(`Error processing your link: ${error}`);
								});
							}
						});
						collector.on("stop", (collected, reason) => {
							if (reason == "time") m.channel.send("Time up! Command cancelled!");
						});
					}
					break;
					case "add friend": {
						m.channel.send("Please enter the Discord Tag or the Discord ID of the person you would like to add!");
						let collector2 = m.channel.createMessageCollector(m2 => m2.author == m.author, {time: 60000});
						collector2.on("collect", m2 => {
							collector.stop();
							if (m2.content.toLowerCase() == "cancel") {
								m2.channel.send("Command cancelled, have a nice day!");
								return;
							} else if (parseInt(m2.content).toString().length > 8) {
								m2.channel.send("Found an ID, looking up user...");
								let friendToAdd = system.players.get(m2.content);
								if (!friendToAdd) {
									self.fetchUser(m2.content).then(User => {
										m2.channel.send(`${User.tag} has not created a player profile yet, would you like me to invite them?`);

									}, )
								}
							}
						});
					}
					break;
				}
			});
		}
	}
});

process.on('unhandledRejection', err => console.error(`Uncaught Promise Error: \n${err.stack}`));
