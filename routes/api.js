var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('underscore');

var User = mongoose.model('User');

router.use(function(req, res, next) {
	console.log('MiddleWare log');
	// console.log(req.session.passport.user);
	if (req.method === 'GET') {
		return next();
	};
	if (!req.isAuthenticated()) {
		return res.status(401).redirect('/#login');
	}
	return next();
});



// Public profile
var pubProfile = require('./api.user.js')(router, mongoose);

module.exports = router;