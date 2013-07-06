'use strict';

function _storage($browser, x) {
    var storage = {},
        lastStorage;

    for (var i = 0, _k; _k = x.key(i); i++) {
        storage[_k] = angular.fromJson(x.getItem(_k));
    }

    lastStorage = angular.copy(storage);

    $browser.addPollFn(function() {
        if (!angular.equals(storage, lastStorage)) {
            angular.forEach(storage, function(_v, _k) {
                x.setItem(_k, angular.toJson(_v));
            });

            lastStorage = angular.copy(storage);
        }
    });

    return storage;
}

angular.module('ngStorage', []).

/**
 * @ngdoc object
 * @name ngStorage.$localStorage
 * @requires $browser
 * @requires $window
 */

factory('$localStorage', function(
    $browser,
    $window
){
    return _storage($browser, $window.localStorage);
}).

/**
 * @ngdoc object
 * @name ngStorage.$sessionStorage
 * @requires $browser
 * @requires $window
 */

factory('$sessionStorage', function(
    $browser,
    $window
){
    return _storage($browser, $window.sessionStorage);
});
