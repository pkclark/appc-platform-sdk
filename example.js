const path = require('path');
const args = process.argv.slice(2);

const Appc = require('.');

if (args.length !== 2) {
	console.error('Usage: node ' + path.basename(module.filename) + ' <username> <password>');
	process.exit(1);
}

function die() {
	console.error.apply(console, arguments);
	process.exit(1);
}

Appc.Env.setDevelopment();

Appc.Auth.login(args[0], args[1], function (err, session) {
	err && die('Error', err);

	console.log(JSON.stringify(session, null, 2));

	Appc.App.create(session, path.join(process.env.PWD, 'test', 'titestapp1', 'tiapp.xml'), console.log);

	try {
		Appc.Auth.createSessionFromID(session.id, function (err, session_) {
			err && die('Error', err);

			Appc.App.findAll(session_, function (err, apps) {
				err && die('Error', err);

				console.log(apps);
			});
		});
	} catch (e) {
		console.error(e.stack);
	}
});
