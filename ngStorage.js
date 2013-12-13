'use strict';

(function() {

    /**
     * @ngdoc overview
     * @name ngStorage
     */

    angular.module('ngStorage', []).

    /**
     * @ngdoc object
     * @name ngStorage.$localStorage
     * @requires $rootScope
     * @requires $window
     */

    provider('$localStorage', _storageProvider('localStorage')).

    /**
     * @ngdoc object
     * @name ngStorage.$sessionStorage
     * @requires $rootScope
     * @requires $window
     */

    provider('$sessionStorage', _storageProvider('sessionStorage'));

    function _storageProvider(storageType) {
        var prefix = 'ngStorage-';
        return {
            setPrefix: function(value) {
                if (angular.isString(value)) {
                    prefix = value;
                }
            },
            $get: [
                '$rootScope',
                '$window',
                '$timeout',
                '$log',
                function(
                    $rootScope,
                    $window,
                    $timeout,
                    $log
                ){
                    // #9: Assign a placeholder object if Web Storage is unavailable to prevent breaking the entire AngularJS app
                    var webStorage = $window[storageType] || ($log.warn('This browser does not support Web Storage!'), {}),
                        $storage = {
                            $default: function(items) {
                                for (var k in items) {
                                    angular.isDefined($storage[k]) || ($storage[k] = items[k]);
                                }

                                return $storage;
                            },
                            $reset: function(items) {
                                for (var k in $storage) {
                                    '$' === k[0] || delete $storage[k];
                                }

                                return $storage.$default(items);
                            }
                        },
                        prefixLen = prefix.length,
                        _last$storage,
                        _debounce;

                    for (var i = 0, k; i < webStorage.length; i++) {
                        // #8, #10: `webStorage.key(i)` may be an empty string (or throw an exception in IE9 if `webStorage` is empty)
                        (k = webStorage.key(i)) && prefix === k.slice(0, prefixLen) && ($storage[k.slice(prefixLen)] = angular.fromJson(webStorage.getItem(k)));
                    }

                    _last$storage = angular.copy($storage);

                    $rootScope.$watch(function() {
                        _debounce || (_debounce = $timeout(function() {
                            _debounce = null;

                            if (!angular.equals($storage, _last$storage)) {
                                angular.forEach($storage, function(v, k) {
                                    angular.isDefined(v) && '$' !== k[0] && webStorage.setItem(prefix + k, angular.toJson(v));

                                    delete _last$storage[k];
                                });

                                for (var k in _last$storage) {
                                    webStorage.removeItem(prefix + k);
                                }

                                _last$storage = angular.copy($storage);
                            }
                        }, 100));
                    });

                    // #6: Use `$window.addEventListener` instead of `angular.element` to avoid the jQuery-specific `event.originalEvent`
                    'localStorage' === storageType && $window.addEventListener && $window.addEventListener('storage', function(event) {
                        if (prefix === event.key.slice(0, prefixLen)) {
                            event.newValue ? $storage[event.key.slice(prefixLen)] = angular.fromJson(event.newValue) : delete $storage[event.key.slice(prefixLen)];

                            _last$storage = angular.copy($storage);

                            $rootScope.$apply();
                        }
                    });

                    return $storage;
                }
            ]
        }
    }

})();
