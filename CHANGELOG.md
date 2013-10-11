### 0.2.1 / 2013.07.24
* Improve compatibility with existing Web Storage data using `ngStorage-` as the namespace. ([#1](https://github.com/gsklee/ngStorage/issues/1), [#3](https://github.com/gsklee/ngStorage/issues/3), [#4](https://github.com/gsklee/ngStorage/issues/4))

---

### 0.2.0 / 2013.07.19
* ***BREAKING CHANGE:*** `$clear()` has been replaced by `$reset()` and now accepts an optional parameter as the default content after reset.
* Add `$default()` to make default value binding easier.
* Improve compatibility with existing Web Storage data. ([#1](https://github.com/gsklee/ngStorage/issues/1))
* Data changes in `$localStorage` now propagate to different browser tabs.
* Properties being hooked onto the services with a `$` prefix are considered to belong to AngularJS inner workings and will no longer be written into Web Storage.

---

### 0.1.0 / 2013.07.07
* Initial release.
