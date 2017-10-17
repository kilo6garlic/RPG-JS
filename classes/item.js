const Discord = require("discord.js");

class Item {
	constructor(id, name, texture = "./tex/default.png", stats) {
		this.id = id;
		this.name = name;
		this.texture = texture;
		/*
		Armour, weapons:
		stats = {
			atk: #
			def: #
			spd: #
		}

		Potions:
		stats = {
			heal: # (in percent)
			mana: # (in percent)
		}
		*/
		this.stats = stats;

	}
}

module.exports = Item;
