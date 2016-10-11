var express = require('express');
var _ = require('underscore');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(passport) {
	router.get('/success', function(req, res) {
		// console.log(req.user);
		res.send({
			state: 'success',
			user: req.user ? _.pick(req.user, '_id', 'username', 'role') : null
		});
	});

	router.get('/failure', function(req, res) {
		
		res.status(400).send({
			state: 'failure',
			user: null,
			message: "Invalid username or password"
		});
	});

	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure'
	}));

	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure'
	}));


	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	return router;
};