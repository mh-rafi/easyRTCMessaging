var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
	role: String,
	first_name: String,
	last_name: String,
	age: Number,
	title: String,
	bio: String,
	email: String,
	website: String,
	location: String,
	username: String,
	password: String,
	created_at: {type: Date, default: Date.now()}
});

var msgSchema = Schema({
	_sender: {type: String, ref: 'User'},
	_receiver: {type: String, ref: 'User'},
	text: String,
	is_read: Boolean,
	created_at: { type: Date, default: Date.now() }
});


mongoose.model('User', userSchema);
mongoose.model('Message', msgSchema);