# 1.0.9 (11-19-2014)

- Keep logged into 360 session
- Fixed problem with user object not having an active org
- Better error handling
- Support local dev environment
- Support self-signed certificates by default in dev/test
- Pass deviceid on login so we can do device authorization

# 1.0.8 (11-17-2014)

- Better handling of Cloud responses

# 1.0.7 (11-17-2014)

- Added API for create cloud app and cloud user
- Only parse JSON response if the Content-Type header is JSON
- Better handling for non-JSON responses in Error callback

# 1.0.6 (11-16-2014)

- Resolved issue with cookie jar

# 1.0.5 (11-16-2014)

- Make sure we always set the right current org for a session

# 1.0.4 (11-16-2014)

- Added support for creating new application from tiapp.xml
- Added support for creating session from session id
- Added support for retrieving cloud environments
- Added support for both production and development logins
- User.find will now use current user if not user id passed

# 1.0.1 (09-29-2014)

- Added support for creating an ACS application

# 1.0.0 (08-31-2014)

- Initial release
