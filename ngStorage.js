'use strict';

/**
 * @ngdoc overview
 * @name ngStorage
 */

angular.module('ngStorage', []).

/**
 * @ngdoc object
 * @name ngStorage.$localStorage
 * @requires $browser
 * @requires $window
 */

factory('$localStorage', _storageFactory('localStorage')).

/**
 * @ngdoc object
 * @name ngStorage.$sessionStorage
 * @requires $browser
 * @requires $window
 */

factory('$sessionStorage', _storageFactory('sessionStorage'));

function _storageFactory(storageType){
    return function(
        $browser,
        $window
    ){
        var webStorage = $window[storageType],
            storage = {},
            lastStorage;

        for (var i = 0, k; k = webStorage.key(i); i++) {
            storage[k] = angular.fromJson(webStorage.getItem(k));
        }

        lastStorage = angular.copy(storage);

        $browser.addPollFn(function() {
            if (!angular.equals(storage, lastStorage)) {
                angular.forEach(storage, function(v, k) {
                    webStorage.setItem(k, angular.toJson(v));
                });

                lastStorage = angular.copy(storage);
            }
        });

        return storage;
    };
}
