
describe("shimTest", function () {
  
    beforeEach(function () {
        
        $(document.body).append("<div id=\"moo\"></div>");

    });

    it("should $.query  find the dom node", function () {
        var el=document.getElementById("moo");
        $("#moo").length.should.eql(1);
    });

    it("should fail on the $.query selector",function(){
        var foo=$.query("@#$<ASDFASDF>!#");
        foo.length.should.eql(0);
    })

    it("should $.create create dom nodes",function(){

        var tmp=$.create("div",{html:"foobar"});
        tmp.get(0).nodeName.toLowerCase().should.eql("div");
        tmp.get(0).innerHTML.should.eql("foobar");

        var tmp=$.create("<div>foobar</div>");
        tmp.get(0).nodeName.toLowerCase().should.eql("div");
        tmp.get(0).innerHTML.should.eql("foobar");

    });

    it("should be an object", function(){

        var obj={};
        expect($.isObject(obj)).to.be.true;
    });

    it("should be a jQuery Object", function(){

        var obj=$();
        expect($.is$(obj)).to.be.true;
    });

    it("should create a touchlist",function(){
        var tl=new $.feat.TouchList();
        tl.length.should.eql(0);
    });

    it("should  create a touch item",function(){

        var touch=new $.feat.Touch();
        expect(touch.identifier>=1000).to.be.true;

    });

    it("should have a touch list with one item",function(){
        var tl=new $.feat.TouchList();
        var touch=new $.feat.Touch();
        tl._add(touch);
        tl.length.should.eql(1);
        touch.should.eql(tl.item(0));
    });

    it("should get the computed style",function(){
        var ele=document.getElementById("moo");
        moo.style.width="30px";
        $("#moo").computedStyle("width").should.eql("30px");
    })
    it("should return the object if nothing is passed to   computed style",function(){
        var ele=document.getElementById("moo");
        moo.style.width="30px";
        expect($("#moo3").computedStyle()===undefined).to.be.true;
    });

    it("should have a length of 36 for $.uuid",function(){
        $.uuid().length.should.eql(36);
    })
});
