//mongodb
var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
console.log(require('mongodb').Collection('111'));
module.exports = new Db(settings.db,new Server(settings.host,27017),{safe:true});