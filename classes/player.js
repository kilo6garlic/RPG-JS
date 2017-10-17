const Discord = require("discord.js");
const http = require("http");
require("../ext/util.js");

class Player {
	constructor(user, name, playerClass, trait, avatar = "", system) {
		this.id = user.id;
		this.name = name;
		this.avatar = avatar;
		this.class = playerClass; // Defines beginning stats
		this.trait = trait; // Defines stat bonuses
		this.gold = 100;
		this.experience = 0;
		this.level = 1;
		this.inventory = new Discord.Collection(); // Every entry => {id, amount}
		this.friends = new Discord.Collection();
		this.stats = {
			maxHealth: 10,
			maxMana: 10,
			atk: 5,
			def: 5,
			spd: 5
		}
		this.equipment = {
			weapon: null,
			helmet: null,
			armour: null,
			boots: null
		}
		this.system = system;
	}

	// Methods

	/**
	 * Sets the avatar for this player profile.
	 * @param {String} newAvatar 
	 */
	changeAvatar(newAvatar) {
		this.avatar = newAvatar;
	}


	/**
	 * Changes this player profile's name.
	 * @param {String} newName 
	 */
	changeName(newName) {
		this.name = newName;
	}

	checkAvatar() {
		if (!this.avatar) return false;
		http.get(this.avatar,response => {
			let { statusCode } = response;
			let error;
			if (statusCode !== 200) {
				return new Error(`Current avatar is not a valid URL!\nHTTP code: ${statusCode}`);
			}
		})
	}

	/**
	 * Equips an Item from the inventory.
	 * @param {String} slot 
	 * @param {String} item 
	 */
	equip(slot,item) {
		switch(slot) {
			case "weapon": {
				let curEquipment = this.equipment.weapon;
				if (curEquipment) {
					let inInventory = this.inventory.get(curEquipment);
					if (inInventory) {
						inInventory.amount++;
						this.inventory.set(inInventory.id,inInventory);
					} else {
						this.inventory.set(curEquipment,{id: curEquipment, amount: 1});
					}
				}
				this.equipment.weapon = item;
				break;
			}
			case "helmet": {
				let curEquipment = this.equipment.helmet;
				if (curEquipment) {
					let inInventory = this.inventory.get(curEquipment);
					if (inInventory) {
						inInventory.amount++;
						this.inventory.set(inInventory.id,inInventory);
					} else {
						this.inventory.set(curEquipment,{id: curEquipment, amount: 1});
					}
				}
				this.equipment.helmet = item;
				break;
			}
			case "armour": {
				let curEquipment = this.equipment.armour;
				if (curEquipment) {
					let inInventory = this.inventory.get(curEquipment);
					if (inInventory) {
						inInventory.amount++;
						this.inventory.set(inInventory.id,inInventory);
					} else {
						this.inventory.set(curEquipment,{id: curEquipment, amount: 1});
					}
				}
				this.equipment.armour = item;
				break;
			}
			case "boots": {
				let curEquipment = this.equipment.boots;
				if (curEquipment) {
					let inInventory = this.inventory.get(curEquipment);
					if (inInventory) {
						inInventory.amount++;
						this.inventory.set(inInventory.id,inInventory);
					} else {
						this.inventory.set(curEquipment,{id: curEquipment, amount: 1});
					}
				}
				this.equipment.boots = item;
				break;
			}
		}
	}
	
	/**
	 * Generates a profile embed for this player profile.
	 * @param {Discord.User} user 
	 * @returns {Discord.RichEmbed}
	 */
	generateProfile(user) {
		let profile = new Discord.RichEmbed();
		profile.setAuthor(this.name,this.avatar)
		.setTitle("Player Profile")
		.addField("Name",this.name,true)
		.addField("Class",this.class,true)
		.addField("Trait",this.trait,true)
		.addField("Gold",this.gold,true)
		.addField("Level",this.level,true)
		.addField("Experience",this.experience,true)
		.addField("Friends",this.friends.length,true)
		.addField("Max Health",this.stats.maxHealth,true)
		.addField("Max Mana",this.stats.maxMana,true)
		.addField("Attack",this.stats.atk,true)
		.addField("Defense",this.stats.def,true)
		.addField("Speed",this.stats.spd,true);
		if (this.avatar) {
			profile.setThumbnail(this.avatar);
		} else {
			profile.setThumbnail(user.displayAvatarURL);
		}
		return profile;
	}

	/**
	 * Increases the level of this player and adds stats including bonus.
	 * @param {String} bonusStat 
	 * @param {number} leftoverEXP 
	 */
	levelUp(bonusStat,leftoverEXP) {
		this.level++;
		this.experience = 0 + leftoverEXP;
		switch(bonusStat) {
			case "hp": this.stats.maxHealth += 5; break;
			case "atk": this.stats.atk += 2; break;
			case "def": this.stats.def += 2; break;
			case "spd": this.stats.spd += 2; break;
		}
	}

	/**
	 * Loads player stats from JSON file on launch.
	 * @param {Object} stats
	 */
	loadStats(stats) {
		this.id = stats.id;
		this.name = stats.name;
		this.avatar = stats.avatar;
		this.class = stats.class;
		this.trait = stats.trait;
		this.gold = stats.gold;
		this.experience = stats.experience;
		this.level = stats.level;
		this.inventory = stats.inventory.toCollection();
		this.friends = stats.friends.toCollection();
		this.stats = stats.stats; // lul
		this.equipment = stats.equipment;
	}
}

module.exports = Player;
