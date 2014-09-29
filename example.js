var sdk = require('./'),
	path = require('path'),
	args = process.argv.slice(2);


if (args.length!==2) {
	console.error('Usage: node '+path.basename(module.filename)+' <username> <password>');
	process.exit(1);
}

sdk.Auth.login(args[0], args[1], function(err,session){
	if (err) {
		console.err('Error=',err);
		process.exit(1);
	}
	sdk.Cloud.createApp(session, "foo", function(err,app){
		if (err) {
			console.err('Error=',err);
			process.exit(1);
		}
		console.log('Application created: ',app);
	});
});
