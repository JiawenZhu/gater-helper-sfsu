// var twilio = require('twilio');
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
router.get('/login',function(req,res,next){
	res.render('login');
});
router.get('/soclet',function(req,res,next){
	res.render('soclet');
});

module.exports = router;
