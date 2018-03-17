var express = require('express');
var router = express.Router();
var index =require("../models/index.js")
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/main',function(req,res,nxet){
	res.render('main');
})

router.get('/register',function(req,res,next){
	res.render('register');
});

module.exports = router;
