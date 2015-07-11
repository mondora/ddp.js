import {expect} from "chai";

import {contains, uniqueId} from "../src/utils";

describe("`utils` object", function () {

    describe("`contains` function", function () {

        it("returns true if the first parameter contains the second parameter", function () {
            var array = ["element"];
            var element = "element";
            expect(contains(array, element)).to.equal(true);
        });

        it("returns false if the first parameter doesn't contain the second parameter", function () {
            var array = ["element"];
            var element = "different-element";
            expect(contains(array, element)).to.equal(false);
        });

    });

    describe("`uniqueId` function", function () {

        it("should return a different string each time it's called", function () {
            var ret1 = uniqueId();
            var ret2 = uniqueId();
            expect(ret1).not.to.equal(ret2);
        });

    });

});
