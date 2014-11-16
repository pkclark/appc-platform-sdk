var sdk = require('./'),
	path = require('path'),
	args = process.argv.slice(2);


if (args.length!==2) {
	console.error('Usage: node '+path.basename(module.filename)+' <username> <password>');
	process.exit(1);
}

function Decycler() {
	var cache = [];
	return function(key, value) {
	    if (typeof value === 'object' && value !== null) {
	        if (cache.indexOf(value) !== -1) {
	            // Circular reference found, discard key
	            return;
	        }
	        // Store value in our collection
	        cache.push(value);
	    }
	    return value;
	};
}

function die() {
	console.error.apply(console.err,arguments);
	process.exit(1);
}

sdk.setDevelopment();

sdk.Auth.login(args[0], args[1], function(err,session){
	if (err) { die('Error=',err); }
	console.log(JSON.stringify(session,Decycler(),2));

	/*
	sdk.App.create(session, '/Users/jhaynie/tmp/foo/app/tiapp.xml', function(err,result){
		console.log(arguments);
	});*/

	/*try {
		sdk.Auth.createSessionFromID(session.id, function(err,session_){
			if (err) { die('Error=',err); }
			sdk.App.findAll(session_, function(err, apps){
				if (err) { die('Error=',err); }
				console.log(apps);
			});
		});
	}
	catch (E) {
		console.error(E.stack);
	}*/
});
