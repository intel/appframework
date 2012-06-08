(function($) {
	var cache = {}, idx = 1, KEY = 'jqmDataId';
	var cache = {};

	$.getDataCache = function() {
		return cache;
	};
	
	var getExpando = function(el) {
		var expando = el[KEY];
	    // for those without expando, create one
	    if (!expando) {
	        expando = el[KEY] = idx++;
	    }
	    return expando;
	};
	
	var data = function(el, name, value) {
	    var expando = getExpando(el);
	    var map = cache[expando];

	    // get data
	    if (value === undefined) {
	        return map && map[name];
	    } else {
	        // for those without any data, create a pure map
	        if (!map) {
	            map = cache[expando] = {};
	        }
	        map[name] = value;
	        return value;
	    }
	}
	
	$.fn.data = function(name, value) {
		if (this.length != 1) {
			throw 'Cannot call data on more than one element';
		}
		return data(this[0], name, value);
	};

	var cleanData = function(elems) {
		var id, data;
		for (var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			id = elem[KEY];
			if (id && cache[id]) {
				delete cache[id];
			}
		}
	};
	
	$.fn.remove = function(selector) {
		var elems = $(this).filter(selector);
        if (elems == undefined)
            return this;
        for (var i = 0; i < elems.length; i++) {
        	cleanData(elems[i].getElementsByTagName("*"));
        	cleanData([elems[i]]);
            elems[i].parentNode.removeChild(elems[i]);
        }
        return this;
	};
	
	$.fn.html = function(html) {
		if (this.length === 0)
            return undefined;
        if (html === undefined)
            return this[0].innerHTML;
        for (var i = 0; i < this.length; i++) {
        	cleanData(this[i].getElementsByTagName("*"));
            this[i].innerHTML = html;
        }
        return this;
	};
	
	$.fn.empty = function() {
        for (var i = 0; i < this.length; i++) {
        	cleanData(this[i].getElementsByTagName("*"));
            this[i].innerHTML = '';
        }
        return this;
    }
	
})(jq);