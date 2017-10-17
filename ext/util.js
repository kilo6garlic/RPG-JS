const Discord = require("discord.js");
const http = require("http");

Array.prototype.toCollection = function() {
    let collection = new Discord.Collection();
    this.forEach(entry => {
        if (typeof entry == "object" && entry.hasOwnProperty("id")) {
            collection.set(entry.id,entry);
        }
    });
    return collection;
}

exports.checkURL = function(url) {
    return new Promise((resolve, reject) => {
        http.get(url, response => {
            let { statusCode } = response;
            let error;
            if (statusCode !== 200) {
                let error = new Error(`HTTP Error: ${statusCode}`);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

Discord.Collection.prototype.toArray = function() {
    let array = [];
    this.forEach(entry => {
        array.push(entry.value);
    });
    return array;
}

String.prototype.capFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
