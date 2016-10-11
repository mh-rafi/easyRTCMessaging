var bCrypt = require('bcrypt-nodejs');

module.exports = function(router, mongoose) {
	var User = mongoose.model('User');

	router.use(function(req, res, next) {
		if (!req.isAuthenticated()) {
			return res.status(401).send({
				state: 'error',
				message: 'Authentication error'
			});
		};
		return next();
	});

	router.route('/user')
		.get(function(req, res) {
			User.find({}, function(err, users) {
				if (err) {
					return res.status(500).send({
						state: 'error',
						message: 'Server error!'
					});
				}
				if (!users) {

					return res.status(404).send({
						state: 'error',
						message: 'Could not find user!'
					});
				}

				res.json(users);
			})
		})
		.put(function(req, res) {
			if(req.user.username != req.body.username) {
				return res.status(400).send({
						state: 'error',
						message: 'User name can not be changed'
					});
			}

			User.findById(req.user.id, function(err, user) {
				if (err) {
					return res.status(500).send({
						state: 'error',
						message: 'Could not find user'
					});
				};
				if(req.body.password && req.body.password.length) {
					req.body.password = createHash(req.body.password);
				}
				user.update(req.body, function(err, user) {
					if (err) {
						return res.status(500).send({
							state: 'error',
							message: 'Can not update user'
						});
					};
					return res.json(user);
				});
			})
		});


	router.route('/user/:username')
		.get(function(req, res) {
			if (!req.params.hasOwnProperty('username')) {
				return res.send({
					state: 'error',
					message: 'No username provided!'
				});
			} else {
				User.findOne({
					username: req.params.username
				}, function(err, user) {
					if (err) {
						return res.send({
							state: 'error',
							message: 'Could not find user!'
						});
					};
					if (!user) {
						return res.status(404).send({
							state: 'error',
							message: 'Could not find user!'
						});
					}
					return res.json(user);
				});
			}
		});
		
}

var isValidPassword = function(user, passwordProvided) {
	return bCrypt.compareSync(passwordProvided, user.password);
};

var createHash = function(password) {
	var salt = bCrypt.genSaltSync(10);
	return bCrypt.hashSync(password, salt);
}