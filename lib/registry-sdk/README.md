# appc-registry-server SDK for Node.js

This is a node module which provides a JavaScript API for accessing appc-registry-server.

## Installation

You can install via npm or directly include the library in your node application.

Once installed, you can use the module by requiring it.

_NOTE: You must set the `baseurl` to the correct URL location of the server endpoint._

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
```

## Security

To enable, you must first login using the API `/api/login`.
After a successful login, you must call `API.session = result.session` where
result is the return value from the login API call.

Example code:
```javascript
var api = new API("/api/login");
API.baseurl = "http://localhost:8080";
api.body({"username":"foo@bar.com","password":"arrowrocks"});
api.send(function (err,resp,body){
	if (err) { throw err; }
	API.session = body.session;
	api = new API("/api/whoami");
	api.send(function (err,resp,body){
		if (err) { throw err; }
		console.log(body);
	});
});
```

## APIs

### /api/login

API for login

`POST /api/login`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
username | username | body | yes
password | password | body | yes
org_id | organization id | body | yes
ipaddress | the machine ip address | body | yes
fingerprint | the machine unique id | body | yes
fingerprint_description | the machine description | body | yes


#### API Result `session`

Name | Description | Type
:----| :---------- | :---
username | username | string
password | password | string
org_id | organization id | number
org_name | organization name | string
session | encrypted session token | string
ipaddress | the machine ip address | string
fingerprint | the machine unique id | string
fingerprint_description | the machine description | string
expiry | expiration timestamp in milliseconds | number


#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/login');
api.body({
	"username": "",
	"password": "",
	"org_id": "",
	"ipaddress": "",
	"fingerprint": "",
	"fingerprint_description": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/orgs

API for determing the logged in user organizations

`GET /api/orgs`


#### API Result `org`

Name | Description | Type
:----| :---------- | :---
org_id | the organization guid | number
name | the name of the organization | string
active | the active flag for the organization | boolean


#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/orgs');
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/org

API for switching a logged in user org

`PUT /api/org`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
id | the organization id | body | no


#### API Result `org`

Name | Description | Type
:----| :---------- | :---
org_id | the organization guid | number
name | the name of the organization | string
active | the active flag for the organization | boolean


#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/org');
api.body({
	"id": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/whoami

API for determing the logged in user

`GET /api/whoami`


#### API Result `session`

Name | Description | Type
:----| :---------- | :---
username | username | string
password | password | string
org_id | organization id | number
org_name | organization name | string
session | encrypted session token | string
ipaddress | the machine ip address | string
fingerprint | the machine unique id | string
fingerprint_description | the machine description | string
expiry | expiration timestamp in milliseconds | number


#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/whoami');
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/component

API for fetching all the components

`GET /api/component`


#### API Result `component`

Name | Description | Type
:----| :---------- | :---
created_date | date the component was published | date
file_id | foreign key to the file object | string
filesize | the component file size | number
parts_count | the component count in the case of split files | number
parts_index | the component index in the case of split files | number
parts_total | the component total size in the case of split files | number
parts_shasum | the component sha of the part in the case of split files | number
shasum | the component sha1 | string
name | the name of the component | string
description | the description of the component | string
version | the version of the component | string
version_sortable | the field that is used for sorting by version | number
type | the metadata type of the component | string
subtype | the component plugin subtype | string
owners | the owners of the component | array
orgs | the orgs of the component | array
users | the users of the component | array
access | the access type such as private, public, etc | string
author | the component author name | string
author_id | the component author user guid | string
author_username | the component author username | string
unpublished | set to true if the component has been unpublished | boolean
package_json | the contents of the package.json | string


#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/component');
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/plugin

API for listing plugins

`GET /api/plugin/:type/:subtype`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of component | path | no
subtype | the subtype of the plugin | path | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/plugin');
api.params({
	"type": "",
	"subtype": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/publish

API for publishing a component

`POST /api/publish`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
file | file to publish | body | no
package.json | contents of the package.json | body | no
parts_count | the component count in the case of split files | body | yes
parts_index | the component index in the case of split files | body | yes
parts_total | the component total in the case of split files | body | yes
parts_shasum | the component sha of the part in the case of split files | body | yes
shasum | the component sha1 | body | no
force | overwrite if already published with the same version | body | yes
subtype | the subtype of the component | body | yes



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/publish');
api.body({
	"file": "",
	"package.json": "",
	"parts_count": "",
	"parts_index": "",
	"parts_total": "",
	"parts_shasum": "",
	"shasum": "",
	"force": "",
	"subtype": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/search

API for searching for components

`GET /api/search/:term/:filter?`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
term | the search term | path | no
filter | the search term filter | path | yes



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/search');
api.params({
	"term": "",
	"filter": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/unpublish

API for unpublishing a published component

`POST /api/unpublish/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | type of the component | path | no
name | name of the component | path | no
version | version of the component | path | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/unpublish');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/access

API for getting component access level

`GET /api/access/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/access');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/access

API for setting component access level

`PUT /api/access/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no
access | the access of the component | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/access');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.body({
	"access": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/appc/install

API for listing the AppC packages

`GET /api/appc/install/:version?`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
version | the version of the package | path | yes



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/appc/install');
api.params({
	"version": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/appc/list

API for listing the AppC packages

`GET /api/appc/list`



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/appc/list');
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/install

API for getting a list of components locations to install

`GET /api/install`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
components | components to install | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/install');
api.body({
	"components": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/install

API for installing a specific component

`GET /api/install/:token`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
token | the one-time install token | path | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/install');
api.params({
	"token": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/org

API for adding an org for a component

`POST /api/org/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no
org_id | the org_id to add | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/org');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.body({
	"org_id": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/org

API for removing an org from a component

`DELETE /api/org/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no
org_id | the org_id to remove | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/org');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.body({
	"org_id": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/org

API for getting the orgs for a component

`GET /api/org/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/org');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/owner

API for adding an owner to a component

`POST /api/owner/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no
user | the user to add | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/owner');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.body({
	"user": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/owner

API for removing an owner of a component

`DELETE /api/owner/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no
user | the user to remove | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/owner');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.body({
	"user": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/owner

API for getting the owners of a component

`GET /api/owner/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/owner');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/user

API for adding a user to a component

`POST /api/user/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no
user | the user to add | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/user');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.body({
	"user": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/user

API for removing a user from a component

`DELETE /api/user/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no
user | the user to remove | body | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/user');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.body({
	"user": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


### /api/user

API for getting users of a component

`GET /api/user/:type/:name/:version`

#### API Parameters

Name | Description | Type | Optional
:----| :---------- | :--- | :-------
type | the type of the component | path | no
name | the name of the component | path | no
version | the version of the component | path | no



#### Usage Example

```javascript
var API = require('appc-registry-server-sdk');
API.baseurl = 'http://localhost:8080';
var api = new API('/api/user');
api.params({
	"type": "",
	"name": "",
	"version": ""
});
api.send(function (err,resp,json){
	console.log(json);
});
```


## Other SDK APIs

The following additional APIs are available:

### API.baseurl

Set the base url for the Arrow server.

#### Usage Example

```javascript
API.baseurl = 'http://localhost:8080';
```

### api.json

Set the JSON body.

#### Usage Example

```javascript
api.json({
	foo: true
});
```

### api.body

Set the body.  The body can include one or more files (provide a valid file path as the value) to automatically send `multipart/form-data`.

#### Usage Example

```javascript
api.body({
	file: '/path/to/myfile.json',
	name: 'this is a name'
});
```

### api.query

Set query parameters for the URL. These will automatically be appended correctly to the request URL.

#### Usage Example

```javascript
api.query({
	pretty_json: true
});
```

### api.params

Set URL parameters in the request URL.

#### Usage Example

```javascript
api.params({
	username: 'test'
});
```

### api.header

Add an HTTP request headers.

#### Usage Example

```javascript
api.header('X-Foo','Bar');
```

You can add multiple headers by chaining the methods:

```javascript
api.header('X-Foo','Bar')
	.header('X-Bar','Foo');
```

### API.debug

Turn on/off debug logging.

#### Usage Example

```javascript
API.debug = false;
```

You can set either by passing `debug` in API constructor as part of the config object (first parameter) or by setting the environment variable `DEBUG` to `arrow:sdk`.

#### Usage Example

```javascript
var api = new API({debug:true},'/api/login');
```

```bash
DEBUG=arrow:sdk node app
```


### Events

The following events can also be listened to:

- `error`: fired when an error occurs during an API request
- `response`: fired when an API response is received
- `timeout`: fired when an API request times out

#### Usage Example

```javascript
var api = new API('/api/login')
	.on('error',function (err){
		console.error("An error occurred.",err);
	})
	.on('timeout',function (err){
		console.error("A timeout occurred.",err);
	})
	.on('response',function (resp,json){
		console.log(json);
	})
	.send({
		username: 'foo',
		password: 'bar'
	});
```


## Notes

This SDK was generated using Arrow.  Copyright (c) 2015 Appcelerator, Inc.
Generated on Mon Feb 09 2015 10:25:07 GMT-0800 (PST) by jhaynie@appcelerator.com.
