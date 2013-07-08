ngStorage
=========

An [AngularJS](https://github.com/angular/angular.js) module that makes Web Storage working in the *Angular Way*. Contains two services: `$localStorage` and `$sessionStorage`.

### Differences with Other Implementations

* **No Getter 'n' Setter Bullshit** - Right from AngularJS homepage: "Unlike other frameworks, there is no need to [...] wrap the model in accessors methods. Just plain old JavaScript here." Now you can enjoy the same benefit while achieving data persistence with Web Storage.

* **sessionStorage** - We got this often-overlooked buddy covered.

* **Cleanly-Authored Code** - Written in the *Angular Way*, well-structured with testability in mind.
 
* **No Cookie Fallback** - With Web Storage being [readily available](http://caniuse.com/namevalue-storage) in [all the browsers AngularJS officially supports](http://docs.angularjs.org/misc/faq#canidownloadthesourcebuildandhosttheangularjsenvironmentlocally), such fallback is largely redundant. 

Install
=======

```bash
bower install ngstorage
```

Usage
=====

#### Require ngStorage and Inject the Services

```javascript
angular.module('app', [
    'ngStorage'
]).controller('Ctrl', function(
    $scope,
    $localStorage,
    $sessionStorage
){});
```

#### Read and Write | [Demo](http://plnkr.co/edit/3vfRkvG7R9DgQxtWbGHz)

Pass `$localStorage` (or `$sessionStorage`) by reference to a hook under `$scope`:

```javascript
$scope.$storage = $localStorage;
```

And use it like you-already-know:

```html
<body ng-controller="Ctrl">
    <button ng-click="$storage.counter = $storage.counter + 1">{{$storage.counter}}</button>
</body>
```

Optionally, specify a default value in plain ol' JavaScript:

```javascript
$scope.$storage.counter = $localStorage.counter || 42;
```

With this setup, changes will be automatically sync'd between `$scope.$storage`, `$localStorage`, and localStorage.

#### Read and Write Alternative (Not Recommended) | [Demo](http://plnkr.co/edit/9ZmkzRkYzS3iZkG8J5IK)

If you're not fond of the presence of `$scope.$storage`, you can always use watchers:

```javascript
$scope.counter = $localStorage.counter || 42;

$scope.$watch('counter', function() {
    $localStorage.counter = $scope.counter;
});

$scope.$watch(function() {
    return angular.toJson($localStorage);
}, function() {
    $scope.counter = $localStorage.counter;
});
```

This, however, is not the way ngStorage is designed to be used with. As you can easily see by comparing the demos, this approach is clearly way more verbose, and may have potential performance implications as the values being watched quickly grow.

#### Delete | [Demo](http://plnkr.co/edit/o4w3VGqmp8opfrWzvsJy)

Plain ol' JavaScript again, what else could you better expect?

```javascript
// Both will work
delete $scope.$storage.counter;
delete $localStorage.counter;
```

This will delete the corresponding entry inside the Web Storage.

#### Delete Everything | [Demo](http://plnkr.co/edit/YiG28KTFdkeFXskolZqs)

Theoretically this can also be done in the plain ol' way but, we've got a convenient method just for you:

```javascript
$localStorage.$clear();
````

#### Permitted Values | [Demo](http://plnkr.co/edit/n0acYLdhk3AeZmPOGY9Z)

You can store anything except those [not supported by JSON](http://www.json.org/js.html):

* `Infinity`, `NaN` - Will be replaced with `null`.
* `undefined`, Function - Will be removed.

Todos
=====

* ngdoc Documentation
* Namespace Support
* Unit Tests
* Grunt Tasks

Any contribution will be appreciated.
