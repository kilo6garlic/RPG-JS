const Discord = require("discord.js");
const Player = require("./player.js");
const fs = require("fs");

class System {
	constructor() {
		let tempPlayerStorage = JSON.parse(fs.readFileSync("./data/players.json","utf8")); // [Object Player, Object Player, Object Player, ...]
		let tempItemStorage = JSON.parse(fs.readFileSync("./data/items.json","utf8")); // [Object Item, Object Item, Object Item, ...]

		this.players = new Discord.Collection();
		this.items = new Discord.Collection();

		// When loading objects from JSON, make sure to reassign them to their proper classes or all their class methods will be undefined and break
		tempPlayerStorage.forEach(PlayerData => {
			let player = new Player({id: PlayerData.id}, PlayerData.name, PlayerData.class, PlayerData.trait, PlayerData.avatar, this);
			player.loadStats(PlayerData);
			this.players.set(player.id,player);
		})
		tempItemStorage.forEach(ItemData => {
			let item = new Item(ItemData.id, ItemData.name, ItemData.texture, ItemData.stats)
			this.items.set(item.id,item);
		})
	}

	// Methods

	/**
	 * Create a new player
	 * @param {Discord.User} user 
	 * @param {String} name 
	 * @param {String} playerClass 
	 * @param {String} trait 
	 */
	newPlayer(user, name, playerClass, trait) {
		let player = new Player(user, name, playerClass, trait);
		this.players.set(user.id,player);
		return player;
	}
	
	/**
	 * Save current itembase to JSON file
	 */
	saveItemData() {
		console.warn("Creating data to save...");
		let dataItems = [];
		this.items.forEach(Item => {
			dataItems.push(Item);
		});
		
		fs.writeFile("./data/items.json",JSON.stringify(dataItems,"",1),"utf8",(cb,err) => {
			if (err) {throw err}
			console.log("Item data saved!");
		});
	}

	/**
	 * Save current playerbase to JSON file
	 */
	savePlayerData() {
		console.warn("Creating data to save...");
		let dataPlayers = [];
		this.players.forEach(Player => {
			let tempPlayer = Player;
			tempPlayer.inventory = tempPlayer.inventory.toArray();
			tempPlayer.friends = tempPlayer.friends.toArray();
			dataPlayers.push(tempPlayer);
		});

		fs.writeFile("./data/players.json",JSON.stringify(dataPlayers,"",1),"utf8",(cb,err) => {
			if (err) {throw err}
			console.log("Player data saved!");
		});
	}
}

module.exports = System;
