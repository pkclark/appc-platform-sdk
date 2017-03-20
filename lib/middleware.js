'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const urllib = require('url');

const Appc = require('.');

module.exports = Middleware;

// map convenience methods
Middleware.createUserFromSession = createUserFromSession;
Middleware.unauthorized = unauthorized;

/**
 * express middleware for validating a session
 */
function Middleware(options) {
	options = options || {};

	let cookiename = options.cookie || 'user',
		platformCookie = options.platformCookie || 'connect.sid',
		urlpattern = options.urlpattern,
		errorHandler = options.errorHandler,
		redirectTo = options.hasOwnProperty('redirect') ? options.redirect : Appc.baseurl,
		redirectUrlParam = options.redirectUrlParam || 'redirect',
		renderUnauthorized = options.renderUnauthorized,
		renderInvalidPlan = options.renderInvalidPlan || renderUnauthorized,
		successHandler = options.successHandler,
		planRequired = options.planRequired,
		planRequiredRedirect = options.planRequiredRedirect,
		sessionExpiry = options.sessionExpiry || 86400,
		required = options.required === undefined ? true : options.required;

	return function (req, resp, next) {
		if (!urlpattern || urlpattern.test(req.url)) {
			// see if we have a cookie
			let cookies = req.cookies || parseHeaderCookies(req.headers.cookie),
				session = req.session[cookiename],
				sid = cookies[platformCookie];

			if ((!sid || (!sid && !session)) && required) {
				return unauthorized(req, resp, errorHandler, redirectTo, redirectUrlParam, renderUnauthorized, 'unauthorized', new Error('not logged in'));
			}

			if (sid && session && session.sid && sid !== session.sid) {
				// this is a changed sid which means we have a login or logout again
				session = null;
			}

			if (sid && session && session.object && session.expiry) {
				if (session.expiry >= Date.now()) {
					// expired so let's do a validate
					return Appc.Auth.validateSession(sid, function (err, session_, resp_) {
						if (err || !session_) {
							return unauthorized(req, resp, errorHandler, redirectTo, redirectUrlParam, renderUnauthorized, 'unauthorized', err);
						}
						// copy over plan
						session_.plan = session.object.plan;
						req[cookiename] = session_;
						req.session[cookiename] = {
							object: session_,
							expiry: Date.now() + sessionExpiry,
							sid: sid
						};
						if (successHandler) {
							return successHandler(req, resp, next, session_, true);
						}
						next();
					});
				} else {
					// if we have a session, then set it on the request
					req[cookiename] = session.object;
					if (successHandler) {
						return successHandler(req, resp, next, session, false);
					}
				}
			} else if (sid) {
				// clear it out
				req.session[cookiename] = req[cookiename] = null;
				// we don't have a local session, but we seem to be logged in. validate
				// with the platform
				return Appc.Auth.createSessionFromID(sid, function (err, session) {
					if (err || !session) {
						return unauthorized(req, resp, errorHandler, redirectTo, redirectUrlParam, renderUnauthorized, 'unauthorized', err);
					}

					let user = createUserFromSession(session);
					if (planRequired) {
						if ((typeof planRequired === 'string' && planRequired !== user.plan) || (planRequired.source && !planRequired.test(user.plan))) {
							return unauthorized(req, resp, errorHandler, planRequiredRedirect, redirectUrlParam, renderInvalidPlan, 'unauthorized', new Error('insufficient privilieges based on your subscription'));
						}
					}

					req[cookiename] = user;
					req.session[cookiename] = {
						object: user,
						expiry: Date.now() + 86400,
						sid: sid
					};

					if (successHandler) {
						return successHandler(req, resp, next, user, false);
					}

					next();
				});
			}
		}

		return next();
	};
}

/**
 * for a given logged in session, return a smaller user object suitable for
 * adding the request object, session, etc.
 */
function createUserFromSession(session) {
	let current_org = session.orgs[session.user.org_id]
		? session.user.org
		: session.orgs[Object.keys(session.orgs)[0]];

	let user = {
		_id: session.user._id,
		user_id: session.user.user_id,
		guid: session.user.guid,
		openid: session.user.openid,
		firstname: session.user.firstname,
		lastname: session.user.lastname,
		username: session.user.email,
		email: session.user.email,
		is_staff: !!session.user.is_staff,
		org_id: current_org.org_id,
		plan: current_org.package
	};

	return user;
};

/**
 * handle unauthorized
 */
function unauthorized(req, resp, errorHandler, redirectTo, redirectUrlParam, renderUnauthorized, reason, error) {
	var media = accepts(req),
		url = redirectTo && redirectUrl(req, resp, redirectTo, redirectUrlParam);

	if (errorHandler) {
		// custom error handling
		return errorHandler(req, resp, reason, error, media, url);
	}

	if (media === 'json' || req.xhr) {
		// if accepts JSON, then let's return JSON
		resp.status(401).json({
			success: false,
			code: error && error.code || 401,
			message: reason,
			error: error && error.message,
			url: url
		});
	} else {
		if (redirectTo && media !== 'image' && media !== 'javascript') {
			// custom redirect if not an image or javascript media type
			return redirect(req, resp, redirectTo, redirectUrlParam);
		}
		// if we have a custom render, use it
		if (renderUnauthorized) {
			return resp.status(401).render(renderUnauthorized, {
				reason: reason,
				error: error,
				redirectUrl: url,
				media: media
			});
		}
		resp.status(401);
		if (media === 'html') {
			resp.send('Unauthorized');
		}
		resp.end();
	}
}

/**
 * return the accepts mimetype
 */
function accepts(req) {
	let header = req.headers && req.headers.accept;
	if (header) {
		let mime;
		header.split(',').forEach(function (type) {
			let parts = type.trim().split('/');
			if (parts.length > 1) {
				let subtype = parts.length > 1 && parts[1].replace(/;.*/, '');
				if (subtype === 'html' || subtype === 'json' || subtype === 'javascript') {
					mime = subtype;
				}
			}
			if (parts[0] === 'image') {
				mime = 'image';
			}
		});
		if (mime) {
			return mime;
		}
	}

	if (req.headers && req.headers['user-agent'] && ~req.headers['user-agent'].toLowerCase().indexOf('mozilla/')) {
		return 'html';
	}

	return 'unknown';
}

/**
 * returns true if this is SSL request
 */
function isSecure(req) {
	return req.secure || !!(req.headers && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'].indexOf('https') === 0);
}

/**
 * return a full relative url
 */
function makeRelativeUrl(req, relpath, secure) {
	var url = (secure ? 'https' : 'http') + '://' + req.get('host') + req.originalUrl;
	return urllib.resolve(url, relpath);
}

/**
 * get the redirect url
 */
function redirectUrl(req, resp, redirectTo, redirectUrlParam) {
	// we want to redirect to a specified url
	let secure = isSecure(req);
	if (!secure && ~redirectTo.indexOf('https://')) {
		// if secure, but our redirect url is not, we are not going to issue a redirect
		// since that would cause a redirect loop
		return redirectTo;
	}

	let fullUrl = encodeURIComponent(makeRelativeUrl(req, req.url, secure));
	if (~redirectTo.indexOf('?')) {
		return redirectTo + '&' + redirectUrlParam + '=' + fullUrl;
	}

	return redirectTo + '?' + redirectUrlParam + '=' + fullUrl;
}

/**
 * perform a redirect
 */
function redirect(req, resp, redirectTo, redirectUrlParam) {
	resp.redirect(redirectUrl(req, resp, redirectTo, redirectUrlParam));
}

/**
 * parse cookie headers into a cookie hash
 */
function parseHeaderCookies(cookie) {
	let hash = {};
	cookie && cookie.split(';').forEach(function (c) {
		var tok = c.trim().split('=');
		if (tok && tok.length > 1) {
			hash[tok[0]] = decodeURIComponent(tok[1]);
		}
	});
	return hash;
}
