/**
 * af.passwordBox - password box replacement for html5 mobile apps on android due to a bug with CSS3 translate3d
 * @copyright 2011 - Intel
 */
(function ($) {
    $["passwordBox"] = function () {

        return new passwordBox();
    };

    var passwordBox = function () {
            this.oldPasswords = {};
        };
    passwordBox.prototype = {
        showPasswordPlainText: false,
        getOldPasswords: function (elID) {
         //   if ($.os.android == false) return; -  iOS users seem to want this too, so we'll let everyone join the party
            var container = elID && document.getElementById(elID) ? document.getElementById(elID) : document;
            if (!container) {
                alert("Could not find container element for passwordBox " + elID);
                return;
            }
            var sels = container.getElementsByTagName("input");

            var that = this;
            for (var i = 0; i < sels.length; i++) {
                if (sels[i].type != "password") continue;

                if($.os.webkit){
                    sels[i].type = "text";
                    $(sels[i]).vendorCss("TextSecurity","disc");
                }
            }
        },

        changePasswordVisiblity: function (what, id) {
            what = parseInt(what,10);
            var theEl = document.getElementById(id);

            if (what == 1) { //show
                $(theEl).vendorCss("TextSecurity","none");
                
            } else {
                $(theEl).vendorCss("TextSecurity","disc");
            }
            if(!$.os.webkit) {
                if(what==1)
                    theEl.type="text";
                else
                    theEl.type="password";
            }
            theEl = null;
        }
    };
})(af);