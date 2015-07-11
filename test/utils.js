require("should");

var u = require("../src/lib/utils.js");

describe("The utils.contains function", function () {
    it("should return true if the first parameter, an array, contains the second parameter", function () {
        var array = ["element"];
        var element = "element";
        u.contains(array, element).should.equal(true);
    });
    it("should return false if the first parameter, an array, doesn't contain the second parameter", function () {
        var array = ["element"];
        var element = "different-element";
        u.contains(array, element).should.equal(false);
    });
});

describe("The utils.uniqueId function", function () {
    it("should return a different string each time it's called", function () {
        var ret1 = u.uniqueId();
        var ret2 = u.uniqueId();
        ret1.should.not.equal(ret2);
    });
});
