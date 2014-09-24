'use strict';

describe('ngStorage', function () {
    var expect = chai.expect;

    beforeEach(module('ngStorage'));

    it('should contain a $localStorage service', inject(function(
        $localStorage
    ){
        expect($localStorage).not.to.equal(null);
    }));

    it('should contain a $sessionStorage service', inject(function(
        $sessionStorage
    ){
        expect($sessionStorage).not.to.equal(null);
    }));

    describeStorageBehaviorFor('localStorage');
    describeStorageBehaviorFor('sessionStorage');

    function describeStorageBehaviorFor(storageType) {

        describe('$' + storageType, function() {

            var $window, $rootScope, $storage;

            function initStorage(initialValues) {

                $window = {}
                $window[storageType] = {
                    length: Object.keys(initialValues).length,
                    data: initialValues,
                    getItem: function(key) { return this.data[key]; },
                    setItem: function(key, value) {
                        this.data[key] = value;
                        this.length = Object.keys(this.data).length
                    },
                    removeItem: function(key) {
                        delete this.data[key];
                        this.length = Object.keys(this.data).length
                    },
                    key: function(i) { return Object.keys(this.data)[i]; }
                };

                module(function($provide) {
                    $provide.value('$window', $window);
                });

                inject(['$rootScope', '$' + storageType,
                    function(_$rootScope_, _$storage_) {
                        $rootScope = _$rootScope_;
                        $storage = _$storage_;
                    }
                ]);

            }

            it('should contain a value for each ngStorage- key in window.' + storageType, function() {
                initStorage({
                    nonNgStorage: 'this should be ingored',
                    'ngStorage-string': '"a string"',
                    'ngStorage-number': '123',
                    'ngStorage-bool': 'true',
                    'ngStorage-object': '{"string":"a string", "number": 123, "bool": true}'
                });
                delete $storage.$default
                delete $storage.$reset
                expect($storage).to.deep.equal({
                    string: 'a string',
                    number: 123,
                    bool: true,
                    object: {string:'a string', number: 123, bool: true}
                });
            })

            it('should add a key to window.' + storageType + ' when a key is added to $storage', function(done) {
                initStorage({});
                $storage.newKey = 'some value';
                $rootScope.$digest();
                setTimeout(function() {
                    expect($window[storageType].data).to.deep.equal({'ngStorage-newKey': '"some value"'});
                    done();
                }, 125);
            });

            it('should update the key in window.' + storageType + ' when the associated key in $' + storageType + ' is updated', function(done) {
                initStorage({'ngStorage-existing': '"update me"'});
                $storage.existing = 'updated';
                $rootScope.$digest();
                setTimeout(function() {
                    expect($window[storageType].data).to.deep.equal({'ngStorage-existing': '"updated"'});
                    done();
                }, 125);
            });

            it('should delete the key from window.' + storageType + ' when the associated key in $' + storageType + ' is deleted', function(done) {
                initStorage({'ngStorage-existing': '"delete me"'});
                delete $storage.existing;
                $rootScope.$digest();
                setTimeout(function() {
                    expect($window[storageType].data).to.deep.equal({});
                    done();
                }, 125);
            });
        });
    }
});


