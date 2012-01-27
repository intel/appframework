/**
 * jq.web.social - A wrapper library for oAuth requests 
 * Copyright 2011 - AppMobi
 */

(function($){
	$['social'] = function(serviceName) {
		if (!this instanceof social) {
			return new social(serviceName);
		}
		this.serviceName = serviceName;
		var that = this;

		document.addEventListener("appMobi.oauth.busy", function(e) {
			if (e.id == that.serviceID)
				that.error(e, "oAuth is busy");
		}, false);
		document.addEventListener("appMobi.oauth.unavailable", function(e) {
			if (e.id == that.serviceID)
				that.error(e, "oAuth is unavailable");
		}, false);
		document.addEventListener("appMobi.oauth.protected.data", function(e) {
			if (e.id == that.serviceID)
				that.processRequest(e);
		}, false);
	};

	social.prototype = {
		callBacks : {},
		serviceName : null,
		serviceID : null,
		makeRequest : function(serviceUrl, serviceID, method, callback, body,headers) {
			if (!serviceUrl) {
				alert("Please provide a request url");
				return;
			}
			if (!serviceID)
				serviceID = "";
			this.serviceID = this.serviceName + "_" + serviceID;

			if (!method)
				method = "GET";
			if (!body)
				body = "";
			if (!headers)
				headers = "";
			if (callback) {
				this.callBacks[this.serviceID] = callback;
			}
			try {
				var params = new AppMobi.OAuth.ProtectedDataParameters();
				params.service = this.serviceName;
				params.url = serviceUrl;
				params.id = this.serviceID;
				params.method = method;
				params.body = body;
				params.headers = headers;

				var rqStr = "";
				for ( var j in params) {
					rqStr += j + " = " + params[j] + "\n";
				}
				AppMobi.oauth.getProtectedData(params);
			} catch (e) {
				alert("Error " + e.message);
			}
		},
		error : function(msg, errorMsg) {
			var rqStr = "";
			for ( var j in errorMsg) {
				rqStr += j + "  " + errorMsg[j] + "\n";
			}
			alert("Error with oAuth request " + this.serviceID + " " + rqStr
					+ "  " + errorMsg);
		},
		processRequest : function(evt) {
			try {
				if (this.callBacks[evt.id]) {
					this.callBacks[evt.id](evt);
				}
			} catch (e) {
				alert("error with cb " + e);
			}
		},
		deAuthorizeService : function(cb) {

			try {
				var that = this;
				if (cb) {
					that.tmpCB = cb;
					document.addEventListener("appMobi.oauth.unauthorize.service",
							this.deAuthorizeCB, false);
				}
				AppMobi.oauth.unauthorizeService(this.serviceName);

			} catch (ex) {
				alert("Error removing " + ex);
			}
		},
		deAuthorizeCB : function(evt) {
			if (evt.service == this.serviceName) {
				if (evt.success == false)
					alert(evt.error);
				else if (this.tmpCB) {
					this.tmpCB();
					delete this["tmpCB"];
				}
			}
			document.removeEventListener("appMobi.oauth.unauthorize.service",this.deAuthorizeCB);
		}
	};
	return social;
})(jq);
