"use strict";

var uniqueId = (function () {
    var i = 0;
    return function () {
        return (i++).toString();
    };
})();

var contains = function (array, element) {
    return array.indexOf(element) !== -1;
};

module.exports = {
    uniqueId: uniqueId,
    contains: contains
};
