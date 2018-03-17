const mysql=require('mysql');
const index=require('../models/index.js');

const db = mysql.createConnection ({
	host: 'bdm248126481.my3w.com',
	user: 'bdm248126481',
	password: 'ww123456',
	database: 'bdm248126481_db',
	insecureAuth:true
});
console.log("connect to data");

db.connect();
module.exports = db;