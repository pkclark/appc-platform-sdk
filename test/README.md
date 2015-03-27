###
Test Suite

Due to having to test emails for an auth code, selenium is used to automate the process.

To set up selenium run
 $ npm install -g selenium-standalone@2.43.1-2.9.0
to install  it globally.

Then, before the unit tests are run,
 $ start-selenium
should be run to set up the framework.

A config will need to be added too. This is the link to the preprod one.
https://wiki.appcelerator.org/display/cls/appc-platform-sdk+Config

Copy this to test/conf/development.js

To run the tests in preprod:
$ APPC_ENV=preproduction npm test
