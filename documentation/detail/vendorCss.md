$().vendorCss() will get or set CSS properties on the DOM nodes with vendor specific prefixes.  It does not work on a hash set.

$.feat.cssPrefix is the css prefix for each browser.

This is a wrapper to $().css($.feat.cssPrefix+attribute,value);

See <a href="#_css">$().css</a> for more