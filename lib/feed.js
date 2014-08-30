/**
 * make a request to AppC platform for fetching feeds
 */
var request = require('request'),
	urllib = require('url'),
	querystring = require('querystring'),
	AppC = require('./index');

function Feed() {
}

/**
 * find all the feeds for the logged in user
 *
 * opts can be:
 *
 * - org_id: The ID of the org that the messages were sent to
 * - app_guid: The guid of the app that the messages were sent to
 * - limit: A number of records to limit the result to
 * - since: A unix timestamp to get new messages from
 * - before: A unix timestamp to get old messages from before
 * 
 */
Feed.findAll = function(session, opts, callback) {
	if (typeof(opts)==='function') {
		callback = opts;
		opts = {};
	}
	var url = urllib.resolve(AppC.baseurl, '/api/v1/feed?'+querystring.stringify(opts));
	console.log(url);
	request.get(AppC.createRequestObject(session,url), AppC.createAPIResponseHandler(callback));
}

module.exports = Feed;
