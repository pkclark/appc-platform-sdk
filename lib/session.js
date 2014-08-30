exports = module.exports = Session;

var Auth = require('./auth'),
	request = require('request'),
	urllib = require('url'),
	AppC = require('./index');

function Session(body) {
	this.jar = request.jar();
}

/**
 * return true if session is valid
 */
Session.prototype.isValid = function() {
	return this.jar && this.user && this.id;
}

/**
 * invalidate the session
 */
Session.prototype.invalidate = function() {
	if (this.isValid()) {
		Auth.logout(this);
	}
}


//---------------------- private methods ---------------------------

/**
 * set session information
 */
Session.prototype._set = function(body){
	this.id = body['connect.sid'];
	this.user = {
		username: body.username,
		email: body.email,
		phone: body.phone,
		guid: body.guid,
		org_id: body.org_id
	};
	return this;
}

/**
 * invalidate session
 */
Session.prototype._invalidate = function() {
	delete this.id;
	delete this.jar;
	delete this.user;
	delete this.orgs;
}
