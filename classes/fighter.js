const Discord = require("discord.js");

class Fighter {
	constructor(Player) {
		this.id = Player.id;
		this.name = Player.name;
		this.health = Player.stats.maxHealth;
		this.stats = {
			atk: Player.stats.atk,
			def: Player.stats.def,
			spd: Player.stats.spd
		}
		this.equipment = Player.equipment;
	}
}

module.exports = Fighter;
