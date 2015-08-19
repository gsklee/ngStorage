'use strict';

/* global describe, beforeEach, it, module, inject, expect, chai */

describe('ngStorage', function() {
    var expect = chai.expect;

    beforeEach(module('ngStorage'));

    it('should contain a $localStorage service', inject(function(
        $localStorage
    ) {
        expect($localStorage).not.to.equal(null);
    }));

    it('should contain a $sessionStorage service', inject(function(
        $sessionStorage
    ) {
        expect($sessionStorage).not.to.equal(null);
    }));

    describeStorageBehaviorFor('localStorage');
    describeStorageBehaviorFor('sessionStorage');

    function describeStorageBehaviorFor(storageType) {

        describe('$' + storageType, function() {

            var $window, $rootScope, $storage, $storageProvider, $timeout;

            function initStorage(initialValues) {

                $window = {
                    eventHandlers: {},
                    addEventListener: function(event, handler) {
                        this.eventHandlers[event] = handler;
                    }
                };

                $window[storageType] = {
                    length: Object.keys(initialValues).length,
                    data: initialValues,
                    getItem: function(key) { return this.data[key]; },
                    setItem: function(key, value) {
                        this.data[key] = value;
                        this.length = Object.keys(this.data).length;
                    },
                    removeItem: function(key) {
                        delete this.data[key];
                        this.length = Object.keys(this.data).length;
                    },
                    key: function(i) { return Object.keys(this.data)[i]; }
                };

                module(['$provide', '$' + storageType + 'Provider', function($provide, _$storageProvider_) {
                    $provide.value('$window', $window);
                    $storageProvider = _$storageProvider_;
                }]);

                inject(['$rootScope', '$' + storageType, '$timeout',
                    function(_$rootScope_, _$storage_, _$timeout) {
                        $rootScope = _$rootScope_;
                        $storage = _$storage_;
                        $timeout = _$timeout;
                    }
                ]);

            }

            it('should, upon loading, contain a value for each ngStorage- key in window.' +
                storageType, function() {

                initStorage({
                    nonNgStorage: 'this should be ingored',
                    'ngStorage-string': '"a string"',
                    'ngStorage-number': '123',
                    'ngStorage-bool': 'true',
                    'ngStorage-object': '{"string":"a string", "number": 123, "bool": true}'
                });

                delete $storage.$default;
                delete $storage.$reset;
                delete $storage.$sync;
                delete $storage.$apply;

                expect($storage).to.deep.equal({
                    string: 'a string',
                    number: 123,
                    bool: true,
                    object: { string:'a string', number: 123, bool: true }
                });

            });

            it('should add a key to window.' + storageType + ' when a key is added to $storage',
                function(done) {

                initStorage({});
                $storage.newKey = 'some value';
                $rootScope.$digest();

                $timeout.flush();

                setTimeout(function() {
                    expect($window[storageType].data)
                        .to.deep.equal({'ngStorage-newKey': '"some value"'});
                    done();
                }, 125);

            });

            it('should update the associated key in window.' + storageType + ' when a key in $' +
                storageType + ' is updated', function(done) {

                initStorage({'ngStorage-existing': '"update me"'});
                $storage.existing = 'updated';
                $rootScope.$digest();

                $timeout.flush();

                setTimeout(function() {
                    expect($window[storageType].data)
                        .to.deep.equal({'ngStorage-existing': '"updated"'});
                    done();
                }, 125);

            });

            it('should delete the associated key from window.' + storageType + ' when a key in $' +
                storageType + ' is deleted', function(done) {

                initStorage({'ngStorage-existing': '"delete me"'});
                delete $storage.existing;
                $rootScope.$digest();

                $timeout.flush();

                setTimeout(function() {
                    expect($window[storageType].data).to.deep.equal({});
                    done();
                }, 125);

            });

            describe('when $reset is called with no arguments', function() {

                beforeEach(function(done) {

                    initStorage({
                        nonNgStorage: 'this should not be changed',
                        'ngStorage-delete': '"this should be deleted"'
                    });

                    $storage.$reset();
                    $rootScope.$digest();

                    $timeout.flush();

                    setTimeout(done, 125);
                });

                it('should delete all ngStorage- keys from window.' + storageType, function() {

                    expect($window[storageType].data).to.deep.equal({
                        nonNgStorage: 'this should not be changed'
                    });

                });

                it('should delete all keys from $' + storageType, function() {

                    delete $storage.$default;
                    delete $storage.$reset;
                    delete $storage.$sync;
                    delete $storage.$apply;

                    expect($storage).to.deep.equal({});

                });

            });

            describe('when $reset is called with an object', function() {

                beforeEach(function(done) {

                    initStorage({
                        nonNgStorage: 'this should not be changed',
                        'ngStorage-delete': '"this should be deleted"'
                    });

                    $storage.$reset({some: 'value'});
                    $rootScope.$digest();

                    $timeout.flush();

                    setTimeout(done, 125);
                });

                it('should reset the ngStorage- keys on window.' + storageType +
                    ' to match the object', function() {

                    expect($window[storageType].data).to.deep.equal({
                        nonNgStorage: 'this should not be changed',
                        'ngStorage-some': '"value"'
                    });

                });

                it('should reset $' + storageType + ' to match the object', function() {

                    delete $storage.$default;
                    delete $storage.$reset;
                    delete $storage.$sync;
                    delete $storage.$apply;

                    expect($storage).to.deep.equal({some: 'value'});

                });

            });

            describe('when $default is called', function() {

                beforeEach(function(done) {

                    initStorage({
                        nonNgStorage: 'this should not be changed',
                        'ngStorage-existing': '"this should not be replaced"'
                    });

                    $storage.$default({
                        existing: 'oops! replaced!',
                        'new': 'new value'
                    });

                    $rootScope.$digest();
                    $timeout.flush();

                    setTimeout(done, 125);
                });

                it('should should add any missing ngStorage- keys on window.' + storageType,
                    function() {

                    expect($window[storageType].data['ngStorage-new'])
                        .to.equal('"new value"');

                });

                it('should should add any missing values to $' + storageType, function() {

                    expect($storage['new']).to.equal('new value');

                });

                it('should should not modify any existing ngStorage- keys on window.' + storageType,
                    function() {

                    expect($window[storageType].data['ngStorage-existing'])
                        .to.equal('"this should not be replaced"');

                });

                it('should should not modify any existing values on $' + storageType, function() {

                    expect($storage['existing'])
                        .to.equal('this should not be replaced');

                });
            });


            describe('when an ngStorage- value in window.localStorage is updated', function() {

                beforeEach(function() {

                    initStorage({'ngStorage-existing': '"update me"'});

                    var updateEvent = {
                        key: 'ngStorage-existing',
                        newValue: '"updated"'
                    };
                    $window.eventHandlers.storage(updateEvent);
                });

                it('should reflect the update', function() {
                    expect($storage.existing).to.equal('updated');
                });
            });

            describe('when an ngStorage- value in window.localStorage is added', function() {

                beforeEach(function() {

                    initStorage({});

                    var updateEvent = {
                        key: 'ngStorage-value',
                        newValue: '"new"'
                    };
                    $window.eventHandlers.storage(updateEvent);
                });

                it('should reflect the addition', function() {
                    expect($storage.value).to.equal('new');
                });
            });

            describe('when an ngStorage- value in window.localStorage is deleted', function() {

                beforeEach(function() {

                    initStorage({'ngStorage-existing': '"delete me"'});

                    var updateEvent = {
                        key: 'ngStorage-existing',
                    };
                    $window.eventHandlers.storage(updateEvent);
                });

                it('should reflect the deletion', function() {
                    expect($storage.existing).to.be.undefined;
                });
            });

            describe('when the key prefix is changed', function() {

                beforeEach(function() {
                    initStorage({});
                    $storageProvider.setKeyPrefix('foo-');
                });

                it('should reflect the change', function(done) {
                    $storage.bar = 'baz';
                    $rootScope.$digest();

                    $timeout.flush();

                    setTimeout(function() {
                        expect($window[storageType].getItem('foo-bar')).to.not.be.undefined;
                        done();
                    }, 125);

                });

            });

        });
    }

});
