(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('angular'));
  } else {
    // Browser globals (root is window), we don't register it.
    factory(root.angular);
  }
}(this , function (angular) {
    'use strict';

    var STORAGE_PREFIX = 'ngStorage-',
        prefixLength = STORAGE_PREFIX.length,
        noop = function() {},
        getStorageKey = function(key) {
            return key.slice(prefixLength);
        },
        decode = angular.fromJson,
        encode = angular.toJson,
        copy = angular.copy,
        isDefined = angular.isDefined;

    /**
     * @ngdoc overview
     * @name ngStorage
     */

    return angular.module('ngStorage', [])

    /**
     * @ngdoc object
     * @name ngStorage.$localStorage
     * @requires $rootScope
     * @requires $window
     */

    .factory('$localStorage', _storageFactory('localStorage'))

    /**
     * @ngdoc object
     * @name ngStorage.$sessionStorage
     * @requires $rootScope
     * @requires $window
     */

    .factory('$sessionStorage', _storageFactory('sessionStorage'));

    function _storageFactory(storageType) {
        return [
            '$rootScope',
            '$window',
            '$log',
            '$timeout',

            function(
                $rootScope,
                $window,
                $log,
                $timeout
            ){
                function isStorageSupported(storageType) {

                    // Some installations of IE, for an unknown reason, throw "SCRIPT5: Error: Access is denied"
                    // when accessing window.localStorage. This happens before you try to do anything with it. Catch
                    // that error and allow execution to continue.

                    // fix 'SecurityError: DOM Exception 18' exception in Desktop Safari, Mobile Safari
                    // when "Block cookies": "Always block" is turned on
                    var supported;
                    try {
                        supported = $window[storageType];
                    }
                    catch (err) {
                        supported = false;
                    }

                    // When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
                    // is available, but trying to call .setItem throws an exception below:
                    // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
                    if (supported && storageType === 'localStorage') {
                        var key = '__' + Math.round(Math.random() * 1e7);

                        try {
                            supported.setItem(key, key);
                            supported.removeItem(key);
                        }
                        catch (err) {
                            supported = false;
                        }
                    }

                    return supported;
                }

                // #9: Assign a placeholder object if Web Storage is unavailable to prevent breaking the entire AngularJS app
                var webStorage = isStorageSupported(storageType) || ($log.warn('This browser does not support Web Storage!'), {setItem: noop, getItem: noop, removeItem: noop, key: noop}),
                    $storage = {
                        $default: function(items) {
                            for (var k in items) {
                                isDefined($storage[k]) || ($storage[k] = items[k]);
                            }

                            $storage.$sync();
                            return $storage;
                        },
                        $reset: function(items) {
                            for (var k in $storage) {
                                '$' === k[0] || (delete $storage[k] && webStorage.removeItem(STORAGE_PREFIX + k));
                            }

                            return $storage.$default(items);
                        },
                        $sync: function () {
                            var i = webStorage.length,
                                $storageKey,
                                k;

                            while (i--) {
                                k = webStorage.key(i);
                                $storageKey = getStorageKey(k);
                                // #8, #10: `webStorage.key(i)` may be an empty string (or throw an exception in IE9 if `webStorage` is empty)
                                k && STORAGE_PREFIX + $storageKey === k && ($storage[$storageKey] = decode(webStorage.getItem(k)));
                            }
                        },
                        $apply: function () {
                            var temp$storage;

                            _debounce = null;

                            if (!angular.equals($storage, _last$storage)) {
                                temp$storage = copy(_last$storage);

                                angular.forEach($storage, function(v, k) {
                                    isDefined(v) && '$' !== k[0] && webStorage.setItem(STORAGE_PREFIX + k, encode(v));

                                    delete temp$storage[k];
                                });

                                for (var k in temp$storage) {
                                    webStorage.removeItem(STORAGE_PREFIX + k);
                                }

                                _last$storage = copy($storage);
                            }
                        }
                    },
                    _last$storage,
                    _debounce;

                $storage.$sync();

                _last$storage = copy($storage);

                $rootScope.$watch(function() {
                    _debounce || (_debounce = $timeout($storage.$apply, 100, false));
                });

                // #6: Use `$window.addEventListener` instead of `angular.element` to avoid the jQuery-specific `event.originalEvent`
                $window.addEventListener && $window.addEventListener('storage', function(event) {
                    var key = event.key,
                        newValue = event.newValue,
                        $storageKey = getStorageKey(key);

                    if (key === STORAGE_PREFIX + $storageKey) {
                        newValue ? $storage[$storageKey] = decode(newValue) : delete $storage[$storageKey];

                        _last$storage = copy($storage);

                        $rootScope.$apply();
                    }
                });

                $window.addEventListener('beforeunload', function(event) {
                    $storage.$apply();
                }, false);

                return $storage;
            }
        ];
    }

}));
