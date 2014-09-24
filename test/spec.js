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

    describe('$localStorage', function() {

        var $window, $rootScope, $localStorage;

        function initStorage(initialValues) {

            $window = {
                localStorage: {
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

                }
            };

            module(function($provide) {
                $provide.value('$window', $window);
            });

            inject(function(_$rootScope_, _$localStorage_) {
                $rootScope = _$rootScope_;
                $localStorage = _$localStorage_;
            });

        }

        it('should contain a value for each ngStorage- key in window.localStorage', function() {
            initStorage({
                nonNgStorage: 'this should be ingored',
                'ngStorage-string': '"a string"',
                'ngStorage-number': '123',
                'ngStorage-bool': 'true',
                'ngStorage-object': '{"string":"a string", "number": 123, "bool": true}'
            });
            delete $localStorage.$default
            delete $localStorage.$reset
            expect($localStorage).to.deep.equal({
                string: 'a string',
                number: 123,
                bool: true,
                object: {string:'a string', number: 123, bool: true}
            });
        })

        it('should add a key to window.localStorage when a key is added to $localStorage', function(done) {
            initStorage({});
            $localStorage.newKey = 'some value';
            $rootScope.$digest();
            setTimeout(function() {
                expect($window.localStorage.data).to.deep.equal({'ngStorage-newKey': '"some value"'});
                done();
            }, 125);
        });

        it('should update the key in window.localStorage when the associated key in $localStorage is updated', function(done) {
            initStorage({'ngStorage-existing': '"update me"'});
            $localStorage.existing = 'updated';
            $rootScope.$digest();
            setTimeout(function() {
                expect($window.localStorage.data).to.deep.equal({'ngStorage-existing': '"updated"'});
                done();
            }, 125);
        });

        it('should delete the key from window.localStorage when the associated key in $localStorage is deleted', function(done) {
            initStorage({'ngStorage-existing': '"delete me"'});
            delete $localStorage.existing;
            $rootScope.$digest();
            setTimeout(function() {
                expect($window.localStorage.data).to.deep.equal({});
                done();
            }, 125);
        });

    });
});


