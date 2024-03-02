
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

      var $parcel$global = globalThis;
    var $9c5688bb4ed5d6a8$exports = {};
/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/ (function(f) {
    var g;
    $9c5688bb4ed5d6a8$exports = f();
})(function() {
    var define, module1, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = undefined;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f;
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        var i = undefined;
        for(var o = 0; o < r.length; o++)s(r[o]);
        return s;
    })({
        1: [
            function(_dereq_, module1, exports) {
                (function(global1) {
                    "use strict";
                    var Mutation = global1.MutationObserver || global1.WebKitMutationObserver;
                    var scheduleDrain;
                    if (Mutation) {
                        var called = 0;
                        var observer = new Mutation(nextTick);
                        var element = global1.document.createTextNode("");
                        observer.observe(element, {
                            characterData: true
                        });
                        scheduleDrain = function() {
                            element.data = called = ++called % 2;
                        };
                    } else if (!global1.setImmediate && typeof global1.MessageChannel !== "undefined") {
                        var channel = new global1.MessageChannel();
                        channel.port1.onmessage = nextTick;
                        scheduleDrain = function() {
                            channel.port2.postMessage(0);
                        };
                    } else if ("document" in global1 && "onreadystatechange" in global1.document.createElement("script")) scheduleDrain = function() {
                        // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                        // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                        var scriptEl = global1.document.createElement("script");
                        scriptEl.onreadystatechange = function() {
                            nextTick();
                            scriptEl.onreadystatechange = null;
                            scriptEl.parentNode.removeChild(scriptEl);
                            scriptEl = null;
                        };
                        global1.document.documentElement.appendChild(scriptEl);
                    };
                    else scheduleDrain = function() {
                        setTimeout(nextTick, 0);
                    };
                    var draining;
                    var queue = [];
                    //named nextTick for less confusing stack traces
                    function nextTick() {
                        draining = true;
                        var i, oldQueue;
                        var len = queue.length;
                        while(len){
                            oldQueue = queue;
                            queue = [];
                            i = -1;
                            while(++i < len)oldQueue[i]();
                            len = queue.length;
                        }
                        draining = false;
                    }
                    module1.exports = immediate;
                    function immediate(task) {
                        if (queue.push(task) === 1 && !draining) scheduleDrain();
                    }
                }).call(this, typeof $parcel$global !== "undefined" ? $parcel$global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
            },
            {}
        ],
        2: [
            function(_dereq_, module1, exports) {
                "use strict";
                var immediate = _dereq_(1);
                /* istanbul ignore next */ function INTERNAL() {}
                var handlers = {};
                var REJECTED = [
                    "REJECTED"
                ];
                var FULFILLED = [
                    "FULFILLED"
                ];
                var PENDING = [
                    "PENDING"
                ];
                module1.exports = Promise1;
                function Promise1(resolver) {
                    if (typeof resolver !== "function") throw new TypeError("resolver must be a function");
                    this.state = PENDING;
                    this.queue = [];
                    this.outcome = void 0;
                    if (resolver !== INTERNAL) safelyResolveThenable(this, resolver);
                }
                Promise1.prototype["catch"] = function(onRejected) {
                    return this.then(null, onRejected);
                };
                Promise1.prototype.then = function(onFulfilled, onRejected) {
                    if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) return this;
                    var promise = new this.constructor(INTERNAL);
                    if (this.state !== PENDING) {
                        var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
                        unwrap(promise, resolver, this.outcome);
                    } else this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
                    return promise;
                };
                function QueueItem(promise, onFulfilled, onRejected) {
                    this.promise = promise;
                    if (typeof onFulfilled === "function") {
                        this.onFulfilled = onFulfilled;
                        this.callFulfilled = this.otherCallFulfilled;
                    }
                    if (typeof onRejected === "function") {
                        this.onRejected = onRejected;
                        this.callRejected = this.otherCallRejected;
                    }
                }
                QueueItem.prototype.callFulfilled = function(value) {
                    handlers.resolve(this.promise, value);
                };
                QueueItem.prototype.otherCallFulfilled = function(value) {
                    unwrap(this.promise, this.onFulfilled, value);
                };
                QueueItem.prototype.callRejected = function(value) {
                    handlers.reject(this.promise, value);
                };
                QueueItem.prototype.otherCallRejected = function(value) {
                    unwrap(this.promise, this.onRejected, value);
                };
                function unwrap(promise, func, value) {
                    immediate(function() {
                        var returnValue;
                        try {
                            returnValue = func(value);
                        } catch (e) {
                            return handlers.reject(promise, e);
                        }
                        if (returnValue === promise) handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
                        else handlers.resolve(promise, returnValue);
                    });
                }
                handlers.resolve = function(self1, value) {
                    var result = tryCatch(getThen, value);
                    if (result.status === "error") return handlers.reject(self1, result.value);
                    var thenable = result.value;
                    if (thenable) safelyResolveThenable(self1, thenable);
                    else {
                        self1.state = FULFILLED;
                        self1.outcome = value;
                        var i = -1;
                        var len = self1.queue.length;
                        while(++i < len)self1.queue[i].callFulfilled(value);
                    }
                    return self1;
                };
                handlers.reject = function(self1, error) {
                    self1.state = REJECTED;
                    self1.outcome = error;
                    var i = -1;
                    var len = self1.queue.length;
                    while(++i < len)self1.queue[i].callRejected(error);
                    return self1;
                };
                function getThen(obj) {
                    // Make sure we only access the accessor once as required by the spec
                    var then = obj && obj.then;
                    if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") return function appyThen() {
                        then.apply(obj, arguments);
                    };
                }
                function safelyResolveThenable(self1, thenable) {
                    // Either fulfill, reject or reject with error
                    var called = false;
                    function onError(value) {
                        if (called) return;
                        called = true;
                        handlers.reject(self1, value);
                    }
                    function onSuccess(value) {
                        if (called) return;
                        called = true;
                        handlers.resolve(self1, value);
                    }
                    function tryToUnwrap() {
                        thenable(onSuccess, onError);
                    }
                    var result = tryCatch(tryToUnwrap);
                    if (result.status === "error") onError(result.value);
                }
                function tryCatch(func, value) {
                    var out = {};
                    try {
                        out.value = func(value);
                        out.status = "success";
                    } catch (e) {
                        out.status = "error";
                        out.value = e;
                    }
                    return out;
                }
                Promise1.resolve = resolve;
                function resolve(value) {
                    if (value instanceof this) return value;
                    return handlers.resolve(new this(INTERNAL), value);
                }
                Promise1.reject = reject;
                function reject(reason) {
                    var promise = new this(INTERNAL);
                    return handlers.reject(promise, reason);
                }
                Promise1.all = all;
                function all(iterable) {
                    var self1 = this;
                    if (Object.prototype.toString.call(iterable) !== "[object Array]") return this.reject(new TypeError("must be an array"));
                    var len = iterable.length;
                    var called = false;
                    if (!len) return this.resolve([]);
                    var values = new Array(len);
                    var resolved = 0;
                    var i = -1;
                    var promise = new this(INTERNAL);
                    while(++i < len)allResolver(iterable[i], i);
                    return promise;
                    function allResolver(value, i) {
                        self1.resolve(value).then(resolveFromAll, function(error) {
                            if (!called) {
                                called = true;
                                handlers.reject(promise, error);
                            }
                        });
                        function resolveFromAll(outValue) {
                            values[i] = outValue;
                            if (++resolved === len && !called) {
                                called = true;
                                handlers.resolve(promise, values);
                            }
                        }
                    }
                }
                Promise1.race = race;
                function race(iterable) {
                    var self1 = this;
                    if (Object.prototype.toString.call(iterable) !== "[object Array]") return this.reject(new TypeError("must be an array"));
                    var len = iterable.length;
                    var called = false;
                    if (!len) return this.resolve([]);
                    var i = -1;
                    var promise = new this(INTERNAL);
                    while(++i < len)resolver(iterable[i]);
                    return promise;
                    function resolver(value) {
                        self1.resolve(value).then(function(response) {
                            if (!called) {
                                called = true;
                                handlers.resolve(promise, response);
                            }
                        }, function(error) {
                            if (!called) {
                                called = true;
                                handlers.reject(promise, error);
                            }
                        });
                    }
                }
            },
            {
                "1": 1
            }
        ],
        3: [
            function(_dereq_, module1, exports) {
                (function(global1) {
                    "use strict";
                    if (typeof global1.Promise !== "function") global1.Promise = _dereq_(2);
                }).call(this, typeof $parcel$global !== "undefined" ? $parcel$global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
            },
            {
                "2": 2
            }
        ],
        4: [
            function(_dereq_, module1, exports) {
                "use strict";
                var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
                    return typeof obj;
                } : function(obj) {
                    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
                };
                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
                }
                function getIDB() {
                    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */ try {
                        if (typeof indexedDB !== "undefined") return indexedDB;
                        if (typeof webkitIndexedDB !== "undefined") return webkitIndexedDB;
                        if (typeof mozIndexedDB !== "undefined") return mozIndexedDB;
                        if (typeof OIndexedDB !== "undefined") return OIndexedDB;
                        if (typeof msIndexedDB !== "undefined") return msIndexedDB;
                    } catch (e) {
                        return;
                    }
                }
                var idb = getIDB();
                function isIndexedDBValid() {
                    try {
                        // Initialize IndexedDB; fall back to vendor-prefixed versions
                        // if needed.
                        if (!idb || !idb.open) return false;
                        // We mimic PouchDB here;
                        //
                        // We test for openDatabase because IE Mobile identifies itself
                        // as Safari. Oh the lulz...
                        var isSafari = typeof openDatabase !== "undefined" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);
                        var hasFetch = typeof fetch === "function" && fetch.toString().indexOf("[native code") !== -1;
                        // Safari <10.1 does not meet our requirements for IDB support
                        // (see: https://github.com/pouchdb/pouchdb/issues/5572).
                        // Safari 10.1 shipped with fetch, we can use that to detect it.
                        // Note: this creates issues with `window.fetch` polyfills and
                        // overrides; see:
                        // https://github.com/localForage/localForage/issues/856
                        return (!isSafari || hasFetch) && typeof indexedDB !== "undefined" && // some outdated implementations of IDB that appear on Samsung
                        // and HTC Android devices <4.4 are missing IDBKeyRange
                        // See: https://github.com/mozilla/localForage/issues/128
                        // See: https://github.com/mozilla/localForage/issues/272
                        typeof IDBKeyRange !== "undefined";
                    } catch (e) {
                        return false;
                    }
                }
                // Abstracts constructing a Blob object, so it also works in older
                // browsers that don't support the native Blob constructor. (i.e.
                // old QtWebKit versions, at least).
                // Abstracts constructing a Blob object, so it also works in older
                // browsers that don't support the native Blob constructor. (i.e.
                // old QtWebKit versions, at least).
                function createBlob(parts, properties) {
                    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */ parts = parts || [];
                    properties = properties || {};
                    try {
                        return new Blob(parts, properties);
                    } catch (e) {
                        if (e.name !== "TypeError") throw e;
                        var Builder = typeof BlobBuilder !== "undefined" ? BlobBuilder : typeof MSBlobBuilder !== "undefined" ? MSBlobBuilder : typeof MozBlobBuilder !== "undefined" ? MozBlobBuilder : WebKitBlobBuilder;
                        var builder = new Builder();
                        for(var i = 0; i < parts.length; i += 1)builder.append(parts[i]);
                        return builder.getBlob(properties.type);
                    }
                }
                // This is CommonJS because lie is an external dependency, so Rollup
                // can just ignore it.
                if (typeof Promise === "undefined") // In the "nopromises" build this will just throw if you don't have
                // a global promise object, but it would throw anyway later.
                _dereq_(3);
                var Promise$1 = Promise;
                function executeCallback(promise, callback) {
                    if (callback) promise.then(function(result) {
                        callback(null, result);
                    }, function(error) {
                        callback(error);
                    });
                }
                function executeTwoCallbacks(promise, callback, errorCallback) {
                    if (typeof callback === "function") promise.then(callback);
                    if (typeof errorCallback === "function") promise["catch"](errorCallback);
                }
                function normalizeKey(key) {
                    // Cast the key to a string, as that's all we can set as a key.
                    if (typeof key !== "string") {
                        console.warn(key + " used as a key, but it is not a string.");
                        key = String(key);
                    }
                    return key;
                }
                function getCallback() {
                    if (arguments.length && typeof arguments[arguments.length - 1] === "function") return arguments[arguments.length - 1];
                }
                // Some code originally from async_storage.js in
                // [Gaia](https://github.com/mozilla-b2g/gaia).
                var DETECT_BLOB_SUPPORT_STORE = "local-forage-detect-blob-support";
                var supportsBlobs = void 0;
                var dbContexts = {};
                var toString = Object.prototype.toString;
                // Transaction Modes
                var READ_ONLY = "readonly";
                var READ_WRITE = "readwrite";
                // Transform a binary string to an array buffer, because otherwise
                // weird stuff happens when you try to work with the binary string directly.
                // It is known.
                // From http://stackoverflow.com/questions/14967647/ (continues on next line)
                // encode-decode-image-with-base64-breaks-image (2013-04-21)
                function _binStringToArrayBuffer(bin) {
                    var length = bin.length;
                    var buf = new ArrayBuffer(length);
                    var arr = new Uint8Array(buf);
                    for(var i = 0; i < length; i++)arr[i] = bin.charCodeAt(i);
                    return buf;
                }
                //
                // Blobs are not supported in all versions of IndexedDB, notably
                // Chrome <37 and Android <5. In those versions, storing a blob will throw.
                //
                // Various other blob bugs exist in Chrome v37-42 (inclusive).
                // Detecting them is expensive and confusing to users, and Chrome 37-42
                // is at very low usage worldwide, so we do a hacky userAgent check instead.
                //
                // content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
                // 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
                // FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
                //
                // Code borrowed from PouchDB. See:
                // https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
                //
                function _checkBlobSupportWithoutCaching(idb) {
                    return new Promise$1(function(resolve) {
                        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
                        var blob = createBlob([
                            ""
                        ]);
                        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, "key");
                        txn.onabort = function(e) {
                            // If the transaction aborts now its due to not being able to
                            // write to the database, likely due to the disk being full
                            e.preventDefault();
                            e.stopPropagation();
                            resolve(false);
                        };
                        txn.oncomplete = function() {
                            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
                            var matchedEdge = navigator.userAgent.match(/Edge\//);
                            // MS Edge pretends to be Chrome 42:
                            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
                            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
                        };
                    })["catch"](function() {
                        return false; // error, so assume unsupported
                    });
                }
                function _checkBlobSupport(idb) {
                    if (typeof supportsBlobs === "boolean") return Promise$1.resolve(supportsBlobs);
                    return _checkBlobSupportWithoutCaching(idb).then(function(value) {
                        supportsBlobs = value;
                        return supportsBlobs;
                    });
                }
                function _deferReadiness(dbInfo) {
                    var dbContext = dbContexts[dbInfo.name];
                    // Create a deferred object representing the current database operation.
                    var deferredOperation = {};
                    deferredOperation.promise = new Promise$1(function(resolve, reject) {
                        deferredOperation.resolve = resolve;
                        deferredOperation.reject = reject;
                    });
                    // Enqueue the deferred operation.
                    dbContext.deferredOperations.push(deferredOperation);
                    // Chain its promise to the database readiness.
                    if (!dbContext.dbReady) dbContext.dbReady = deferredOperation.promise;
                    else dbContext.dbReady = dbContext.dbReady.then(function() {
                        return deferredOperation.promise;
                    });
                }
                function _advanceReadiness(dbInfo) {
                    var dbContext = dbContexts[dbInfo.name];
                    // Dequeue a deferred operation.
                    var deferredOperation = dbContext.deferredOperations.pop();
                    // Resolve its promise (which is part of the database readiness
                    // chain of promises).
                    if (deferredOperation) {
                        deferredOperation.resolve();
                        return deferredOperation.promise;
                    }
                }
                function _rejectReadiness(dbInfo, err) {
                    var dbContext = dbContexts[dbInfo.name];
                    // Dequeue a deferred operation.
                    var deferredOperation = dbContext.deferredOperations.pop();
                    // Reject its promise (which is part of the database readiness
                    // chain of promises).
                    if (deferredOperation) {
                        deferredOperation.reject(err);
                        return deferredOperation.promise;
                    }
                }
                function _getConnection(dbInfo, upgradeNeeded) {
                    return new Promise$1(function(resolve, reject) {
                        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();
                        if (dbInfo.db) {
                            if (upgradeNeeded) {
                                _deferReadiness(dbInfo);
                                dbInfo.db.close();
                            } else return resolve(dbInfo.db);
                        }
                        var dbArgs = [
                            dbInfo.name
                        ];
                        if (upgradeNeeded) dbArgs.push(dbInfo.version);
                        var openreq = idb.open.apply(idb, dbArgs);
                        if (upgradeNeeded) openreq.onupgradeneeded = function(e) {
                            var db = openreq.result;
                            try {
                                db.createObjectStore(dbInfo.storeName);
                                if (e.oldVersion <= 1) // Added when support for blob shims was added
                                db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                            } catch (ex) {
                                if (ex.name === "ConstraintError") console.warn('The database "' + dbInfo.name + '"' + " has been upgraded from version " + e.oldVersion + " to version " + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                                else throw ex;
                            }
                        };
                        openreq.onerror = function(e) {
                            e.preventDefault();
                            reject(openreq.error);
                        };
                        openreq.onsuccess = function() {
                            var db = openreq.result;
                            db.onversionchange = function(e) {
                                // Triggered when the database is modified (e.g. adding an objectStore) or
                                // deleted (even when initiated by other sessions in different tabs).
                                // Closing the connection here prevents those operations from being blocked.
                                // If the database is accessed again later by this instance, the connection
                                // will be reopened or the database recreated as needed.
                                e.target.close();
                            };
                            resolve(db);
                            _advanceReadiness(dbInfo);
                        };
                    });
                }
                function _getOriginalConnection(dbInfo) {
                    return _getConnection(dbInfo, false);
                }
                function _getUpgradedConnection(dbInfo) {
                    return _getConnection(dbInfo, true);
                }
                function _isUpgradeNeeded(dbInfo, defaultVersion) {
                    if (!dbInfo.db) return true;
                    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
                    var isDowngrade = dbInfo.version < dbInfo.db.version;
                    var isUpgrade = dbInfo.version > dbInfo.db.version;
                    if (isDowngrade) {
                        // If the version is not the default one
                        // then warn for impossible downgrade.
                        if (dbInfo.version !== defaultVersion) console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + " to version " + dbInfo.version + ".");
                        // Align the versions to prevent errors.
                        dbInfo.version = dbInfo.db.version;
                    }
                    if (isUpgrade || isNewStore) {
                        // If the store is new then increment the version (if needed).
                        // This will trigger an "upgradeneeded" event which is required
                        // for creating a store.
                        if (isNewStore) {
                            var incVersion = dbInfo.db.version + 1;
                            if (incVersion > dbInfo.version) dbInfo.version = incVersion;
                        }
                        return true;
                    }
                    return false;
                }
                // encode a blob for indexeddb engines that don't support blobs
                function _encodeBlob(blob) {
                    return new Promise$1(function(resolve, reject) {
                        var reader = new FileReader();
                        reader.onerror = reject;
                        reader.onloadend = function(e) {
                            var base64 = btoa(e.target.result || "");
                            resolve({
                                __local_forage_encoded_blob: true,
                                data: base64,
                                type: blob.type
                            });
                        };
                        reader.readAsBinaryString(blob);
                    });
                }
                // decode an encoded blob
                function _decodeBlob(encodedBlob) {
                    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
                    return createBlob([
                        arrayBuff
                    ], {
                        type: encodedBlob.type
                    });
                }
                // is this one of our fancy encoded blobs?
                function _isEncodedBlob(value) {
                    return value && value.__local_forage_encoded_blob;
                }
                // Specialize the default `ready()` function by making it dependent
                // on the current database operations. Thus, the driver will be actually
                // ready when it's been initialized (default) *and* there are no pending
                // operations on the database (initiated by some other instances).
                function _fullyReady(callback) {
                    var self1 = this;
                    var promise = self1._initReady().then(function() {
                        var dbContext = dbContexts[self1._dbInfo.name];
                        if (dbContext && dbContext.dbReady) return dbContext.dbReady;
                    });
                    executeTwoCallbacks(promise, callback, callback);
                    return promise;
                }
                // Try to establish a new db connection to replace the
                // current one which is broken (i.e. experiencing
                // InvalidStateError while creating a transaction).
                function _tryReconnect(dbInfo) {
                    _deferReadiness(dbInfo);
                    var dbContext = dbContexts[dbInfo.name];
                    var forages = dbContext.forages;
                    for(var i = 0; i < forages.length; i++){
                        var forage = forages[i];
                        if (forage._dbInfo.db) {
                            forage._dbInfo.db.close();
                            forage._dbInfo.db = null;
                        }
                    }
                    dbInfo.db = null;
                    return _getOriginalConnection(dbInfo).then(function(db) {
                        dbInfo.db = db;
                        if (_isUpgradeNeeded(dbInfo)) // Reopen the database for upgrading.
                        return _getUpgradedConnection(dbInfo);
                        return db;
                    }).then(function(db) {
                        // store the latest db reference
                        // in case the db was upgraded
                        dbInfo.db = dbContext.db = db;
                        for(var i = 0; i < forages.length; i++)forages[i]._dbInfo.db = db;
                    })["catch"](function(err) {
                        _rejectReadiness(dbInfo, err);
                        throw err;
                    });
                }
                // FF doesn't like Promises (micro-tasks) and IDDB store operations,
                // so we have to do it with callbacks
                function createTransaction(dbInfo, mode, callback, retries) {
                    if (retries === undefined) retries = 1;
                    try {
                        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
                        callback(null, tx);
                    } catch (err) {
                        if (retries > 0 && (!dbInfo.db || err.name === "InvalidStateError" || err.name === "NotFoundError")) return Promise$1.resolve().then(function() {
                            if (!dbInfo.db || err.name === "NotFoundError" && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                                // increase the db version, to create the new ObjectStore
                                if (dbInfo.db) dbInfo.version = dbInfo.db.version + 1;
                                // Reopen the database for upgrading.
                                return _getUpgradedConnection(dbInfo);
                            }
                        }).then(function() {
                            return _tryReconnect(dbInfo).then(function() {
                                createTransaction(dbInfo, mode, callback, retries - 1);
                            });
                        })["catch"](callback);
                        callback(err);
                    }
                }
                function createDbContext() {
                    return {
                        // Running localForages sharing a database.
                        forages: [],
                        // Shared database.
                        db: null,
                        // Database readiness (promise).
                        dbReady: null,
                        // Deferred operations on the database.
                        deferredOperations: []
                    };
                }
                // Open the IndexedDB database (automatically creates one if one didn't
                // previously exist), using any options set in the config.
                function _initStorage(options) {
                    var self1 = this;
                    var dbInfo = {
                        db: null
                    };
                    if (options) for(var i in options)dbInfo[i] = options[i];
                    // Get the current context of the database;
                    var dbContext = dbContexts[dbInfo.name];
                    // ...or create a new context.
                    if (!dbContext) {
                        dbContext = createDbContext();
                        // Register the new context in the global container.
                        dbContexts[dbInfo.name] = dbContext;
                    }
                    // Register itself as a running localForage in the current context.
                    dbContext.forages.push(self1);
                    // Replace the default `ready()` function with the specialized one.
                    if (!self1._initReady) {
                        self1._initReady = self1.ready;
                        self1.ready = _fullyReady;
                    }
                    // Create an array of initialization states of the related localForages.
                    var initPromises = [];
                    function ignoreErrors() {
                        // Don't handle errors here,
                        // just makes sure related localForages aren't pending.
                        return Promise$1.resolve();
                    }
                    for(var j = 0; j < dbContext.forages.length; j++){
                        var forage = dbContext.forages[j];
                        if (forage !== self1) // Don't wait for itself...
                        initPromises.push(forage._initReady()["catch"](ignoreErrors));
                    }
                    // Take a snapshot of the related localForages.
                    var forages = dbContext.forages.slice(0);
                    // Initialize the connection process only when
                    // all the related localForages aren't pending.
                    return Promise$1.all(initPromises).then(function() {
                        dbInfo.db = dbContext.db;
                        // Get the connection or open a new one without upgrade.
                        return _getOriginalConnection(dbInfo);
                    }).then(function(db) {
                        dbInfo.db = db;
                        if (_isUpgradeNeeded(dbInfo, self1._defaultConfig.version)) // Reopen the database for upgrading.
                        return _getUpgradedConnection(dbInfo);
                        return db;
                    }).then(function(db) {
                        dbInfo.db = dbContext.db = db;
                        self1._dbInfo = dbInfo;
                        // Share the final connection amongst related localForages.
                        for(var k = 0; k < forages.length; k++){
                            var forage = forages[k];
                            if (forage !== self1) {
                                // Self is already up-to-date.
                                forage._dbInfo.db = dbInfo.db;
                                forage._dbInfo.version = dbInfo.version;
                            }
                        }
                    });
                }
                function getItem(key, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            createTransaction(self1._dbInfo, READ_ONLY, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    var req = store.get(key);
                                    req.onsuccess = function() {
                                        var value = req.result;
                                        if (value === undefined) value = null;
                                        if (_isEncodedBlob(value)) value = _decodeBlob(value);
                                        resolve(value);
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Iterate over all items stored in database.
                function iterate(iterator, callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            createTransaction(self1._dbInfo, READ_ONLY, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    var req = store.openCursor();
                                    var iterationNumber = 1;
                                    req.onsuccess = function() {
                                        var cursor = req.result;
                                        if (cursor) {
                                            var value = cursor.value;
                                            if (_isEncodedBlob(value)) value = _decodeBlob(value);
                                            var result = iterator(value, cursor.key, iterationNumber++);
                                            // when the iterator callback returns any
                                            // (non-`undefined`) value, then we stop
                                            // the iteration immediately
                                            if (result !== void 0) resolve(result);
                                            else cursor["continue"]();
                                        } else resolve();
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function setItem(key, value, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = new Promise$1(function(resolve, reject) {
                        var dbInfo;
                        self1.ready().then(function() {
                            dbInfo = self1._dbInfo;
                            if (toString.call(value) === "[object Blob]") return _checkBlobSupport(dbInfo.db).then(function(blobSupport) {
                                if (blobSupport) return value;
                                return _encodeBlob(value);
                            });
                            return value;
                        }).then(function(value) {
                            createTransaction(self1._dbInfo, READ_WRITE, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    // The reason we don't _save_ null is because IE 10 does
                                    // not support saving the `null` type in IndexedDB. How
                                    // ironic, given the bug below!
                                    // See: https://github.com/mozilla/localForage/issues/161
                                    if (value === null) value = undefined;
                                    var req = store.put(value, key);
                                    transaction.oncomplete = function() {
                                        // Cast to undefined so the value passed to
                                        // callback/promise is the same as what one would get out
                                        // of `getItem()` later. This leads to some weirdness
                                        // (setItem('foo', undefined) will return `null`), but
                                        // it's not my fault localStorage is our baseline and that
                                        // it's weird.
                                        if (value === undefined) value = null;
                                        resolve(value);
                                    };
                                    transaction.onabort = transaction.onerror = function() {
                                        var err = req.error ? req.error : req.transaction.error;
                                        reject(err);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function removeItem(key, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            createTransaction(self1._dbInfo, READ_WRITE, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    // We use a Grunt task to make this safe for IE and some
                                    // versions of Android (including those used by Cordova).
                                    // Normally IE won't like `.delete()` and will insist on
                                    // using `['delete']()`, but we have a build step that
                                    // fixes this for us now.
                                    var req = store["delete"](key);
                                    transaction.oncomplete = function() {
                                        resolve();
                                    };
                                    transaction.onerror = function() {
                                        reject(req.error);
                                    };
                                    // The request will be also be aborted if we've exceeded our storage
                                    // space.
                                    transaction.onabort = function() {
                                        var err = req.error ? req.error : req.transaction.error;
                                        reject(err);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function clear(callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            createTransaction(self1._dbInfo, READ_WRITE, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    var req = store.clear();
                                    transaction.oncomplete = function() {
                                        resolve();
                                    };
                                    transaction.onabort = transaction.onerror = function() {
                                        var err = req.error ? req.error : req.transaction.error;
                                        reject(err);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function length(callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            createTransaction(self1._dbInfo, READ_ONLY, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    var req = store.count();
                                    req.onsuccess = function() {
                                        resolve(req.result);
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function key(n, callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        if (n < 0) {
                            resolve(null);
                            return;
                        }
                        self1.ready().then(function() {
                            createTransaction(self1._dbInfo, READ_ONLY, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    var advanced = false;
                                    var req = store.openKeyCursor();
                                    req.onsuccess = function() {
                                        var cursor = req.result;
                                        if (!cursor) {
                                            // this means there weren't enough keys
                                            resolve(null);
                                            return;
                                        }
                                        if (n === 0) // We have the first key, return it if that's what they
                                        // wanted.
                                        resolve(cursor.key);
                                        else if (!advanced) {
                                            // Otherwise, ask the cursor to skip ahead n
                                            // records.
                                            advanced = true;
                                            cursor.advance(n);
                                        } else // When we get here, we've got the nth key.
                                        resolve(cursor.key);
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function keys(callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            createTransaction(self1._dbInfo, READ_ONLY, function(err, transaction) {
                                if (err) return reject(err);
                                try {
                                    var store = transaction.objectStore(self1._dbInfo.storeName);
                                    var req = store.openKeyCursor();
                                    var keys = [];
                                    req.onsuccess = function() {
                                        var cursor = req.result;
                                        if (!cursor) {
                                            resolve(keys);
                                            return;
                                        }
                                        keys.push(cursor.key);
                                        cursor["continue"]();
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function dropInstance(options, callback) {
                    callback = getCallback.apply(this, arguments);
                    var currentConfig = this.config();
                    options = typeof options !== "function" && options || {};
                    if (!options.name) {
                        options.name = options.name || currentConfig.name;
                        options.storeName = options.storeName || currentConfig.storeName;
                    }
                    var self1 = this;
                    var promise;
                    if (!options.name) promise = Promise$1.reject("Invalid arguments");
                    else {
                        var isCurrentDb = options.name === currentConfig.name && self1._dbInfo.db;
                        var dbPromise = isCurrentDb ? Promise$1.resolve(self1._dbInfo.db) : _getOriginalConnection(options).then(function(db) {
                            var dbContext = dbContexts[options.name];
                            var forages = dbContext.forages;
                            dbContext.db = db;
                            for(var i = 0; i < forages.length; i++)forages[i]._dbInfo.db = db;
                            return db;
                        });
                        if (!options.storeName) promise = dbPromise.then(function(db) {
                            _deferReadiness(options);
                            var dbContext = dbContexts[options.name];
                            var forages = dbContext.forages;
                            db.close();
                            for(var i = 0; i < forages.length; i++){
                                var forage = forages[i];
                                forage._dbInfo.db = null;
                            }
                            var dropDBPromise = new Promise$1(function(resolve, reject) {
                                var req = idb.deleteDatabase(options.name);
                                req.onerror = function() {
                                    var db = req.result;
                                    if (db) db.close();
                                    reject(req.error);
                                };
                                req.onblocked = function() {
                                    // Closing all open connections in onversionchange handler should prevent this situation, but if
                                    // we do get here, it just means the request remains pending - eventually it will succeed or error
                                    console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                                };
                                req.onsuccess = function() {
                                    var db = req.result;
                                    if (db) db.close();
                                    resolve(db);
                                };
                            });
                            return dropDBPromise.then(function(db) {
                                dbContext.db = db;
                                for(var i = 0; i < forages.length; i++){
                                    var _forage = forages[i];
                                    _advanceReadiness(_forage._dbInfo);
                                }
                            })["catch"](function(err) {
                                (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {});
                                throw err;
                            });
                        });
                        else promise = dbPromise.then(function(db) {
                            if (!db.objectStoreNames.contains(options.storeName)) return;
                            var newVersion = db.version + 1;
                            _deferReadiness(options);
                            var dbContext = dbContexts[options.name];
                            var forages = dbContext.forages;
                            db.close();
                            for(var i = 0; i < forages.length; i++){
                                var forage = forages[i];
                                forage._dbInfo.db = null;
                                forage._dbInfo.version = newVersion;
                            }
                            var dropObjectPromise = new Promise$1(function(resolve, reject) {
                                var req = idb.open(options.name, newVersion);
                                req.onerror = function(err) {
                                    var db = req.result;
                                    db.close();
                                    reject(err);
                                };
                                req.onupgradeneeded = function() {
                                    var db = req.result;
                                    db.deleteObjectStore(options.storeName);
                                };
                                req.onsuccess = function() {
                                    var db = req.result;
                                    db.close();
                                    resolve(db);
                                };
                            });
                            return dropObjectPromise.then(function(db) {
                                dbContext.db = db;
                                for(var j = 0; j < forages.length; j++){
                                    var _forage2 = forages[j];
                                    _forage2._dbInfo.db = db;
                                    _advanceReadiness(_forage2._dbInfo);
                                }
                            })["catch"](function(err) {
                                (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {});
                                throw err;
                            });
                        });
                    }
                    executeCallback(promise, callback);
                    return promise;
                }
                var asyncStorage = {
                    _driver: "asyncStorage",
                    _initStorage: _initStorage,
                    _support: isIndexedDBValid(),
                    iterate: iterate,
                    getItem: getItem,
                    setItem: setItem,
                    removeItem: removeItem,
                    clear: clear,
                    length: length,
                    key: key,
                    keys: keys,
                    dropInstance: dropInstance
                };
                function isWebSQLValid() {
                    return typeof openDatabase === "function";
                }
                // Sadly, the best way to save binary data in WebSQL/localStorage is serializing
                // it to Base64, so this is how we store it to prevent very strange errors with less
                // verbose ways of binary <-> string data storage.
                var BASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                var BLOB_TYPE_PREFIX = "~~local_forage_type~";
                var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
                var SERIALIZED_MARKER = "__lfsc__:";
                var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;
                // OMG the serializations!
                var TYPE_ARRAYBUFFER = "arbf";
                var TYPE_BLOB = "blob";
                var TYPE_INT8ARRAY = "si08";
                var TYPE_UINT8ARRAY = "ui08";
                var TYPE_UINT8CLAMPEDARRAY = "uic8";
                var TYPE_INT16ARRAY = "si16";
                var TYPE_INT32ARRAY = "si32";
                var TYPE_UINT16ARRAY = "ur16";
                var TYPE_UINT32ARRAY = "ui32";
                var TYPE_FLOAT32ARRAY = "fl32";
                var TYPE_FLOAT64ARRAY = "fl64";
                var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
                var toString$1 = Object.prototype.toString;
                function stringToBuffer(serializedString) {
                    // Fill the string into a ArrayBuffer.
                    var bufferLength = serializedString.length * 0.75;
                    var len = serializedString.length;
                    var i;
                    var p = 0;
                    var encoded1, encoded2, encoded3, encoded4;
                    if (serializedString[serializedString.length - 1] === "=") {
                        bufferLength--;
                        if (serializedString[serializedString.length - 2] === "=") bufferLength--;
                    }
                    var buffer = new ArrayBuffer(bufferLength);
                    var bytes = new Uint8Array(buffer);
                    for(i = 0; i < len; i += 4){
                        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
                        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
                        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
                        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);
                        /*jslint bitwise: true */ bytes[p++] = encoded1 << 2 | encoded2 >> 4;
                        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
                        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
                    }
                    return buffer;
                }
                // Converts a buffer to a string to store, serialized, in the backend
                // storage library.
                function bufferToString(buffer) {
                    // base64-arraybuffer
                    var bytes = new Uint8Array(buffer);
                    var base64String = "";
                    var i;
                    for(i = 0; i < bytes.length; i += 3){
                        /*jslint bitwise: true */ base64String += BASE_CHARS[bytes[i] >> 2];
                        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
                        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
                        base64String += BASE_CHARS[bytes[i + 2] & 63];
                    }
                    if (bytes.length % 3 === 2) base64String = base64String.substring(0, base64String.length - 1) + "=";
                    else if (bytes.length % 3 === 1) base64String = base64String.substring(0, base64String.length - 2) + "==";
                    return base64String;
                }
                // Serialize a value, afterwards executing a callback (which usually
                // instructs the `setItem()` callback/promise to be executed). This is how
                // we store binary data with localStorage.
                function serialize(value, callback) {
                    var valueType = "";
                    if (value) valueType = toString$1.call(value);
                    // Cannot use `value instanceof ArrayBuffer` or such here, as these
                    // checks fail when running the tests using casper.js...
                    //
                    // TODO: See why those tests fail and use a better solution.
                    if (value && (valueType === "[object ArrayBuffer]" || value.buffer && toString$1.call(value.buffer) === "[object ArrayBuffer]")) {
                        // Convert binary arrays to a string and prefix the string with
                        // a special marker.
                        var buffer;
                        var marker = SERIALIZED_MARKER;
                        if (value instanceof ArrayBuffer) {
                            buffer = value;
                            marker += TYPE_ARRAYBUFFER;
                        } else {
                            buffer = value.buffer;
                            if (valueType === "[object Int8Array]") marker += TYPE_INT8ARRAY;
                            else if (valueType === "[object Uint8Array]") marker += TYPE_UINT8ARRAY;
                            else if (valueType === "[object Uint8ClampedArray]") marker += TYPE_UINT8CLAMPEDARRAY;
                            else if (valueType === "[object Int16Array]") marker += TYPE_INT16ARRAY;
                            else if (valueType === "[object Uint16Array]") marker += TYPE_UINT16ARRAY;
                            else if (valueType === "[object Int32Array]") marker += TYPE_INT32ARRAY;
                            else if (valueType === "[object Uint32Array]") marker += TYPE_UINT32ARRAY;
                            else if (valueType === "[object Float32Array]") marker += TYPE_FLOAT32ARRAY;
                            else if (valueType === "[object Float64Array]") marker += TYPE_FLOAT64ARRAY;
                            else callback(new Error("Failed to get type for BinaryArray"));
                        }
                        callback(marker + bufferToString(buffer));
                    } else if (valueType === "[object Blob]") {
                        // Conver the blob to a binaryArray and then to a string.
                        var fileReader = new FileReader();
                        fileReader.onload = function() {
                            // Backwards-compatible prefix for the blob type.
                            var str = BLOB_TYPE_PREFIX + value.type + "~" + bufferToString(this.result);
                            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
                        };
                        fileReader.readAsArrayBuffer(value);
                    } else try {
                        callback(JSON.stringify(value));
                    } catch (e) {
                        console.error("Couldn't convert value into a JSON string: ", value);
                        callback(null, e);
                    }
                }
                // Deserialize data we've inserted into a value column/field. We place
                // special markers into our strings to mark them as encoded; this isn't
                // as nice as a meta field, but it's the only sane thing we can do whilst
                // keeping localStorage support intact.
                //
                // Oftentimes this will just deserialize JSON content, but if we have a
                // special marker (SERIALIZED_MARKER, defined above), we will extract
                // some kind of arraybuffer/binary data/typed array out of the string.
                function deserialize(value) {
                    // If we haven't marked this string as being specially serialized (i.e.
                    // something other than serialized JSON), we can just return it and be
                    // done with it.
                    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) return JSON.parse(value);
                    // The following code deals with deserializing some kind of Blob or
                    // TypedArray. First we separate out the type of data we're dealing
                    // with from the data itself.
                    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
                    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);
                    var blobType;
                    // Backwards-compatible blob type serialization strategy.
                    // DBs created with older versions of localForage will simply not have the blob type.
                    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
                        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
                        blobType = matcher[1];
                        serializedString = serializedString.substring(matcher[0].length);
                    }
                    var buffer = stringToBuffer(serializedString);
                    // Return the right type based on the code/type set during
                    // serialization.
                    switch(type){
                        case TYPE_ARRAYBUFFER:
                            return buffer;
                        case TYPE_BLOB:
                            return createBlob([
                                buffer
                            ], {
                                type: blobType
                            });
                        case TYPE_INT8ARRAY:
                            return new Int8Array(buffer);
                        case TYPE_UINT8ARRAY:
                            return new Uint8Array(buffer);
                        case TYPE_UINT8CLAMPEDARRAY:
                            return new Uint8ClampedArray(buffer);
                        case TYPE_INT16ARRAY:
                            return new Int16Array(buffer);
                        case TYPE_UINT16ARRAY:
                            return new Uint16Array(buffer);
                        case TYPE_INT32ARRAY:
                            return new Int32Array(buffer);
                        case TYPE_UINT32ARRAY:
                            return new Uint32Array(buffer);
                        case TYPE_FLOAT32ARRAY:
                            return new Float32Array(buffer);
                        case TYPE_FLOAT64ARRAY:
                            return new Float64Array(buffer);
                        default:
                            throw new Error("Unkown type: " + type);
                    }
                }
                var localforageSerializer = {
                    serialize: serialize,
                    deserialize: deserialize,
                    stringToBuffer: stringToBuffer,
                    bufferToString: bufferToString
                };
                /*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */ function createDbTable(t, dbInfo, callback, errorCallback) {
                    t.executeSql("CREATE TABLE IF NOT EXISTS " + dbInfo.storeName + " " + "(id INTEGER PRIMARY KEY, key unique, value)", [], callback, errorCallback);
                }
                // Open the WebSQL database (automatically creates one if one didn't
                // previously exist), using any options set in the config.
                function _initStorage$1(options) {
                    var self1 = this;
                    var dbInfo = {
                        db: null
                    };
                    if (options) for(var i in options)dbInfo[i] = typeof options[i] !== "string" ? options[i].toString() : options[i];
                    var dbInfoPromise = new Promise$1(function(resolve, reject) {
                        // Open the database; the openDatabase API will automatically
                        // create it for us if it doesn't exist.
                        try {
                            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
                        } catch (e) {
                            return reject(e);
                        }
                        // Create our key/value table if it doesn't exist.
                        dbInfo.db.transaction(function(t) {
                            createDbTable(t, dbInfo, function() {
                                self1._dbInfo = dbInfo;
                                resolve();
                            }, function(t, error) {
                                reject(error);
                            });
                        }, reject);
                    });
                    dbInfo.serializer = localforageSerializer;
                    return dbInfoPromise;
                }
                function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
                    t.executeSql(sqlStatement, args, callback, function(t, error) {
                        if (error.code === error.SYNTAX_ERR) t.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [
                            dbInfo.storeName
                        ], function(t, results) {
                            if (!results.rows.length) // if the table is missing (was deleted)
                            // re-create it table and retry
                            createDbTable(t, dbInfo, function() {
                                t.executeSql(sqlStatement, args, callback, errorCallback);
                            }, errorCallback);
                            else errorCallback(t, error);
                        }, errorCallback);
                        else errorCallback(t, error);
                    }, errorCallback);
                }
                function getItem$1(key, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            var dbInfo = self1._dbInfo;
                            dbInfo.db.transaction(function(t) {
                                tryExecuteSql(t, dbInfo, "SELECT * FROM " + dbInfo.storeName + " WHERE key = ? LIMIT 1", [
                                    key
                                ], function(t, results) {
                                    var result = results.rows.length ? results.rows.item(0).value : null;
                                    // Check to see if this is serialized content we need to
                                    // unpack.
                                    if (result) result = dbInfo.serializer.deserialize(result);
                                    resolve(result);
                                }, function(t, error) {
                                    reject(error);
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function iterate$1(iterator, callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            var dbInfo = self1._dbInfo;
                            dbInfo.db.transaction(function(t) {
                                tryExecuteSql(t, dbInfo, "SELECT * FROM " + dbInfo.storeName, [], function(t, results) {
                                    var rows = results.rows;
                                    var length = rows.length;
                                    for(var i = 0; i < length; i++){
                                        var item = rows.item(i);
                                        var result = item.value;
                                        // Check to see if this is serialized content
                                        // we need to unpack.
                                        if (result) result = dbInfo.serializer.deserialize(result);
                                        result = iterator(result, item.key, i + 1);
                                        // void(0) prevents problems with redefinition
                                        // of `undefined`.
                                        if (result !== void 0) {
                                            resolve(result);
                                            return;
                                        }
                                    }
                                    resolve();
                                }, function(t, error) {
                                    reject(error);
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function _setItem(key, value, callback, retriesLeft) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            // The localStorage API doesn't return undefined values in an
                            // "expected" way, so undefined is always cast to null in all
                            // drivers. See: https://github.com/mozilla/localForage/pull/42
                            if (value === undefined) value = null;
                            // Save the original value to pass to the callback.
                            var originalValue = value;
                            var dbInfo = self1._dbInfo;
                            dbInfo.serializer.serialize(value, function(value, error) {
                                if (error) reject(error);
                                else dbInfo.db.transaction(function(t) {
                                    tryExecuteSql(t, dbInfo, "INSERT OR REPLACE INTO " + dbInfo.storeName + " " + "(key, value) VALUES (?, ?)", [
                                        key,
                                        value
                                    ], function() {
                                        resolve(originalValue);
                                    }, function(t, error) {
                                        reject(error);
                                    });
                                }, function(sqlError) {
                                    // The transaction failed; check
                                    // to see if it's a quota error.
                                    if (sqlError.code === sqlError.QUOTA_ERR) {
                                        // We reject the callback outright for now, but
                                        // it's worth trying to re-run the transaction.
                                        // Even if the user accepts the prompt to use
                                        // more storage on Safari, this error will
                                        // be called.
                                        //
                                        // Try to re-run the transaction.
                                        if (retriesLeft > 0) {
                                            resolve(_setItem.apply(self1, [
                                                key,
                                                originalValue,
                                                callback,
                                                retriesLeft - 1
                                            ]));
                                            return;
                                        }
                                        reject(sqlError);
                                    }
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function setItem$1(key, value, callback) {
                    return _setItem.apply(this, [
                        key,
                        value,
                        callback,
                        1
                    ]);
                }
                function removeItem$1(key, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            var dbInfo = self1._dbInfo;
                            dbInfo.db.transaction(function(t) {
                                tryExecuteSql(t, dbInfo, "DELETE FROM " + dbInfo.storeName + " WHERE key = ?", [
                                    key
                                ], function() {
                                    resolve();
                                }, function(t, error) {
                                    reject(error);
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Deletes every item in the table.
                // TODO: Find out if this resets the AUTO_INCREMENT number.
                function clear$1(callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            var dbInfo = self1._dbInfo;
                            dbInfo.db.transaction(function(t) {
                                tryExecuteSql(t, dbInfo, "DELETE FROM " + dbInfo.storeName, [], function() {
                                    resolve();
                                }, function(t, error) {
                                    reject(error);
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Does a simple `COUNT(key)` to get the number of items stored in
                // localForage.
                function length$1(callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            var dbInfo = self1._dbInfo;
                            dbInfo.db.transaction(function(t) {
                                // Ahhh, SQL makes this one soooooo easy.
                                tryExecuteSql(t, dbInfo, "SELECT COUNT(key) as c FROM " + dbInfo.storeName, [], function(t, results) {
                                    var result = results.rows.item(0).c;
                                    resolve(result);
                                }, function(t, error) {
                                    reject(error);
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Return the key located at key index X; essentially gets the key from a
                // `WHERE id = ?`. This is the most efficient way I can think to implement
                // this rarely-used (in my experience) part of the API, but it can seem
                // inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
                // the ID of each key will change every time it's updated. Perhaps a stored
                // procedure for the `setItem()` SQL would solve this problem?
                // TODO: Don't change ID on `setItem()`.
                function key$1(n, callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            var dbInfo = self1._dbInfo;
                            dbInfo.db.transaction(function(t) {
                                tryExecuteSql(t, dbInfo, "SELECT key FROM " + dbInfo.storeName + " WHERE id = ? LIMIT 1", [
                                    n + 1
                                ], function(t, results) {
                                    var result = results.rows.length ? results.rows.item(0).key : null;
                                    resolve(result);
                                }, function(t, error) {
                                    reject(error);
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function keys$1(callback) {
                    var self1 = this;
                    var promise = new Promise$1(function(resolve, reject) {
                        self1.ready().then(function() {
                            var dbInfo = self1._dbInfo;
                            dbInfo.db.transaction(function(t) {
                                tryExecuteSql(t, dbInfo, "SELECT key FROM " + dbInfo.storeName, [], function(t, results) {
                                    var keys = [];
                                    for(var i = 0; i < results.rows.length; i++)keys.push(results.rows.item(i).key);
                                    resolve(keys);
                                }, function(t, error) {
                                    reject(error);
                                });
                            });
                        })["catch"](reject);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // https://www.w3.org/TR/webdatabase/#databases
                // > There is no way to enumerate or delete the databases available for an origin from this API.
                function getAllStoreNames(db) {
                    return new Promise$1(function(resolve, reject) {
                        db.transaction(function(t) {
                            t.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(t, results) {
                                var storeNames = [];
                                for(var i = 0; i < results.rows.length; i++)storeNames.push(results.rows.item(i).name);
                                resolve({
                                    db: db,
                                    storeNames: storeNames
                                });
                            }, function(t, error) {
                                reject(error);
                            });
                        }, function(sqlError) {
                            reject(sqlError);
                        });
                    });
                }
                function dropInstance$1(options, callback) {
                    callback = getCallback.apply(this, arguments);
                    var currentConfig = this.config();
                    options = typeof options !== "function" && options || {};
                    if (!options.name) {
                        options.name = options.name || currentConfig.name;
                        options.storeName = options.storeName || currentConfig.storeName;
                    }
                    var self1 = this;
                    var promise;
                    if (!options.name) promise = Promise$1.reject("Invalid arguments");
                    else promise = new Promise$1(function(resolve) {
                        var db;
                        if (options.name === currentConfig.name) // use the db reference of the current instance
                        db = self1._dbInfo.db;
                        else db = openDatabase(options.name, "", "", 0);
                        if (!options.storeName) // drop all database tables
                        resolve(getAllStoreNames(db));
                        else resolve({
                            db: db,
                            storeNames: [
                                options.storeName
                            ]
                        });
                    }).then(function(operationInfo) {
                        return new Promise$1(function(resolve, reject) {
                            operationInfo.db.transaction(function(t) {
                                function dropTable(storeName) {
                                    return new Promise$1(function(resolve, reject) {
                                        t.executeSql("DROP TABLE IF EXISTS " + storeName, [], function() {
                                            resolve();
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                }
                                var operations = [];
                                for(var i = 0, len = operationInfo.storeNames.length; i < len; i++)operations.push(dropTable(operationInfo.storeNames[i]));
                                Promise$1.all(operations).then(function() {
                                    resolve();
                                })["catch"](function(e) {
                                    reject(e);
                                });
                            }, function(sqlError) {
                                reject(sqlError);
                            });
                        });
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                var webSQLStorage = {
                    _driver: "webSQLStorage",
                    _initStorage: _initStorage$1,
                    _support: isWebSQLValid(),
                    iterate: iterate$1,
                    getItem: getItem$1,
                    setItem: setItem$1,
                    removeItem: removeItem$1,
                    clear: clear$1,
                    length: length$1,
                    key: key$1,
                    keys: keys$1,
                    dropInstance: dropInstance$1
                };
                function isLocalStorageValid() {
                    try {
                        return typeof localStorage !== "undefined" && "setItem" in localStorage && // in IE8 typeof localStorage.setItem === 'object'
                        !!localStorage.setItem;
                    } catch (e) {
                        return false;
                    }
                }
                function _getKeyPrefix(options, defaultConfig) {
                    var keyPrefix = options.name + "/";
                    if (options.storeName !== defaultConfig.storeName) keyPrefix += options.storeName + "/";
                    return keyPrefix;
                }
                // Check if localStorage throws when saving an item
                function checkIfLocalStorageThrows() {
                    var localStorageTestKey = "_localforage_support_test";
                    try {
                        localStorage.setItem(localStorageTestKey, true);
                        localStorage.removeItem(localStorageTestKey);
                        return false;
                    } catch (e) {
                        return true;
                    }
                }
                // Check if localStorage is usable and allows to save an item
                // This method checks if localStorage is usable in Safari Private Browsing
                // mode, or in any other case where the available quota for localStorage
                // is 0 and there wasn't any saved items yet.
                function _isLocalStorageUsable() {
                    return !checkIfLocalStorageThrows() || localStorage.length > 0;
                }
                // Config the localStorage backend, using options set in the config.
                function _initStorage$2(options) {
                    var self1 = this;
                    var dbInfo = {};
                    if (options) for(var i in options)dbInfo[i] = options[i];
                    dbInfo.keyPrefix = _getKeyPrefix(options, self1._defaultConfig);
                    if (!_isLocalStorageUsable()) return Promise$1.reject();
                    self1._dbInfo = dbInfo;
                    dbInfo.serializer = localforageSerializer;
                    return Promise$1.resolve();
                }
                // Remove all keys from the datastore, effectively destroying all data in
                // the app's key/value store!
                function clear$2(callback) {
                    var self1 = this;
                    var promise = self1.ready().then(function() {
                        var keyPrefix = self1._dbInfo.keyPrefix;
                        for(var i = localStorage.length - 1; i >= 0; i--){
                            var key = localStorage.key(i);
                            if (key.indexOf(keyPrefix) === 0) localStorage.removeItem(key);
                        }
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Retrieve an item from the store. Unlike the original async_storage
                // library in Gaia, we don't modify return values at all. If a key's value
                // is `undefined`, we pass that value to the callback function.
                function getItem$2(key, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = self1.ready().then(function() {
                        var dbInfo = self1._dbInfo;
                        var result = localStorage.getItem(dbInfo.keyPrefix + key);
                        // If a result was found, parse it from the serialized
                        // string into a JS object. If result isn't truthy, the key
                        // is likely undefined and we'll pass it straight to the
                        // callback.
                        if (result) result = dbInfo.serializer.deserialize(result);
                        return result;
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Iterate over all items in the store.
                function iterate$2(iterator, callback) {
                    var self1 = this;
                    var promise = self1.ready().then(function() {
                        var dbInfo = self1._dbInfo;
                        var keyPrefix = dbInfo.keyPrefix;
                        var keyPrefixLength = keyPrefix.length;
                        var length = localStorage.length;
                        // We use a dedicated iterator instead of the `i` variable below
                        // so other keys we fetch in localStorage aren't counted in
                        // the `iterationNumber` argument passed to the `iterate()`
                        // callback.
                        //
                        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
                        var iterationNumber = 1;
                        for(var i = 0; i < length; i++){
                            var key = localStorage.key(i);
                            if (key.indexOf(keyPrefix) !== 0) continue;
                            var value = localStorage.getItem(key);
                            // If a result was found, parse it from the serialized
                            // string into a JS object. If result isn't truthy, the
                            // key is likely undefined and we'll pass it straight
                            // to the iterator.
                            if (value) value = dbInfo.serializer.deserialize(value);
                            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);
                            if (value !== void 0) return value;
                        }
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Same as localStorage's key() method, except takes a callback.
                function key$2(n, callback) {
                    var self1 = this;
                    var promise = self1.ready().then(function() {
                        var dbInfo = self1._dbInfo;
                        var result;
                        try {
                            result = localStorage.key(n);
                        } catch (error) {
                            result = null;
                        }
                        // Remove the prefix from the key, if a key is found.
                        if (result) result = result.substring(dbInfo.keyPrefix.length);
                        return result;
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function keys$2(callback) {
                    var self1 = this;
                    var promise = self1.ready().then(function() {
                        var dbInfo = self1._dbInfo;
                        var length = localStorage.length;
                        var keys = [];
                        for(var i = 0; i < length; i++){
                            var itemKey = localStorage.key(i);
                            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) keys.push(itemKey.substring(dbInfo.keyPrefix.length));
                        }
                        return keys;
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Supply the number of keys in the datastore to the callback function.
                function length$2(callback) {
                    var self1 = this;
                    var promise = self1.keys().then(function(keys) {
                        return keys.length;
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Remove an item from the store, nice and simple.
                function removeItem$2(key, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = self1.ready().then(function() {
                        var dbInfo = self1._dbInfo;
                        localStorage.removeItem(dbInfo.keyPrefix + key);
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                // Set a key's value and run an optional callback once the value is set.
                // Unlike Gaia's implementation, the callback function is passed the value,
                // in case you want to operate on that value only after you're sure it
                // saved, or something like that.
                function setItem$2(key, value, callback) {
                    var self1 = this;
                    key = normalizeKey(key);
                    var promise = self1.ready().then(function() {
                        // Convert undefined values to null.
                        // https://github.com/mozilla/localForage/pull/42
                        if (value === undefined) value = null;
                        // Save the original value to pass to the callback.
                        var originalValue = value;
                        return new Promise$1(function(resolve, reject) {
                            var dbInfo = self1._dbInfo;
                            dbInfo.serializer.serialize(value, function(value, error) {
                                if (error) reject(error);
                                else try {
                                    localStorage.setItem(dbInfo.keyPrefix + key, value);
                                    resolve(originalValue);
                                } catch (e) {
                                    // localStorage capacity exceeded.
                                    // TODO: Make this a specific error/event.
                                    if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") reject(e);
                                    reject(e);
                                }
                            });
                        });
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                function dropInstance$2(options, callback) {
                    callback = getCallback.apply(this, arguments);
                    options = typeof options !== "function" && options || {};
                    if (!options.name) {
                        var currentConfig = this.config();
                        options.name = options.name || currentConfig.name;
                        options.storeName = options.storeName || currentConfig.storeName;
                    }
                    var self1 = this;
                    var promise;
                    if (!options.name) promise = Promise$1.reject("Invalid arguments");
                    else promise = new Promise$1(function(resolve) {
                        if (!options.storeName) resolve(options.name + "/");
                        else resolve(_getKeyPrefix(options, self1._defaultConfig));
                    }).then(function(keyPrefix) {
                        for(var i = localStorage.length - 1; i >= 0; i--){
                            var key = localStorage.key(i);
                            if (key.indexOf(keyPrefix) === 0) localStorage.removeItem(key);
                        }
                    });
                    executeCallback(promise, callback);
                    return promise;
                }
                var localStorageWrapper = {
                    _driver: "localStorageWrapper",
                    _initStorage: _initStorage$2,
                    _support: isLocalStorageValid(),
                    iterate: iterate$2,
                    getItem: getItem$2,
                    setItem: setItem$2,
                    removeItem: removeItem$2,
                    clear: clear$2,
                    length: length$2,
                    key: key$2,
                    keys: keys$2,
                    dropInstance: dropInstance$2
                };
                var sameValue = function sameValue(x, y) {
                    return x === y || typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y);
                };
                var includes = function includes(array, searchElement) {
                    var len = array.length;
                    var i = 0;
                    while(i < len){
                        if (sameValue(array[i], searchElement)) return true;
                        i++;
                    }
                    return false;
                };
                var isArray = Array.isArray || function(arg) {
                    return Object.prototype.toString.call(arg) === "[object Array]";
                };
                // Drivers are stored here when `defineDriver()` is called.
                // They are shared across all instances of localForage.
                var DefinedDrivers = {};
                var DriverSupport = {};
                var DefaultDrivers = {
                    INDEXEDDB: asyncStorage,
                    WEBSQL: webSQLStorage,
                    LOCALSTORAGE: localStorageWrapper
                };
                var DefaultDriverOrder = [
                    DefaultDrivers.INDEXEDDB._driver,
                    DefaultDrivers.WEBSQL._driver,
                    DefaultDrivers.LOCALSTORAGE._driver
                ];
                var OptionalDriverMethods = [
                    "dropInstance"
                ];
                var LibraryMethods = [
                    "clear",
                    "getItem",
                    "iterate",
                    "key",
                    "keys",
                    "length",
                    "removeItem",
                    "setItem"
                ].concat(OptionalDriverMethods);
                var DefaultConfig = {
                    description: "",
                    driver: DefaultDriverOrder.slice(),
                    name: "localforage",
                    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
                    // we can use without a prompt.
                    size: 4980736,
                    storeName: "keyvaluepairs",
                    version: 1.0
                };
                function callWhenReady(localForageInstance, libraryMethod) {
                    localForageInstance[libraryMethod] = function() {
                        var _args = arguments;
                        return localForageInstance.ready().then(function() {
                            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
                        });
                    };
                }
                function extend() {
                    for(var i = 1; i < arguments.length; i++){
                        var arg = arguments[i];
                        if (arg) {
                            for(var _key in arg)if (arg.hasOwnProperty(_key)) {
                                if (isArray(arg[_key])) arguments[0][_key] = arg[_key].slice();
                                else arguments[0][_key] = arg[_key];
                            }
                        }
                    }
                    return arguments[0];
                }
                var LocalForage = function() {
                    function LocalForage(options) {
                        _classCallCheck(this, LocalForage);
                        for(var driverTypeKey in DefaultDrivers)if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                            var driver = DefaultDrivers[driverTypeKey];
                            var driverName = driver._driver;
                            this[driverTypeKey] = driverName;
                            if (!DefinedDrivers[driverName]) // we don't need to wait for the promise,
                            // since the default drivers can be defined
                            // in a blocking manner
                            this.defineDriver(driver);
                        }
                        this._defaultConfig = extend({}, DefaultConfig);
                        this._config = extend({}, this._defaultConfig, options);
                        this._driverSet = null;
                        this._initDriver = null;
                        this._ready = false;
                        this._dbInfo = null;
                        this._wrapLibraryMethodsWithReady();
                        this.setDriver(this._config.driver)["catch"](function() {});
                    }
                    // Set any config values for localForage; can be called anytime before
                    // the first API call (e.g. `getItem`, `setItem`).
                    // We loop through options so we don't overwrite existing config
                    // values.
                    LocalForage.prototype.config = function config(options) {
                        // If the options argument is an object, we use it to set values.
                        // Otherwise, we return either a specified config value or all
                        // config values.
                        if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object") {
                            // If localforage is ready and fully initialized, we can't set
                            // any new configuration values. Instead, we return an error.
                            if (this._ready) return new Error("Can't call config() after localforage has been used.");
                            for(var i in options){
                                if (i === "storeName") options[i] = options[i].replace(/\W/g, "_");
                                if (i === "version" && typeof options[i] !== "number") return new Error("Database version must be a number.");
                                this._config[i] = options[i];
                            }
                            // after all config options are set and
                            // the driver option is used, try setting it
                            if ("driver" in options && options.driver) return this.setDriver(this._config.driver);
                            return true;
                        } else if (typeof options === "string") return this._config[options];
                        else return this._config;
                    };
                    // Used to define a custom driver, shared across all instances of
                    // localForage.
                    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
                        var promise = new Promise$1(function(resolve, reject) {
                            try {
                                var driverName = driverObject._driver;
                                var complianceError = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
                                // A driver name should be defined and not overlap with the
                                // library-defined, default drivers.
                                if (!driverObject._driver) {
                                    reject(complianceError);
                                    return;
                                }
                                var driverMethods = LibraryMethods.concat("_initStorage");
                                for(var i = 0, len = driverMethods.length; i < len; i++){
                                    var driverMethodName = driverMethods[i];
                                    // when the property is there,
                                    // it should be a method even when optional
                                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== "function") {
                                        reject(complianceError);
                                        return;
                                    }
                                }
                                var configureMissingMethods = function configureMissingMethods() {
                                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                                        return function() {
                                            var error = new Error("Method " + methodName + " is not implemented by the current driver");
                                            var promise = Promise$1.reject(error);
                                            executeCallback(promise, arguments[arguments.length - 1]);
                                            return promise;
                                        };
                                    };
                                    for(var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++){
                                        var optionalDriverMethod = OptionalDriverMethods[_i];
                                        if (!driverObject[optionalDriverMethod]) driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                                    }
                                };
                                configureMissingMethods();
                                var setDriverSupport = function setDriverSupport(support) {
                                    if (DefinedDrivers[driverName]) console.info("Redefining LocalForage driver: " + driverName);
                                    DefinedDrivers[driverName] = driverObject;
                                    DriverSupport[driverName] = support;
                                    // don't use a then, so that we can define
                                    // drivers that have simple _support methods
                                    // in a blocking manner
                                    resolve();
                                };
                                if ("_support" in driverObject) {
                                    if (driverObject._support && typeof driverObject._support === "function") driverObject._support().then(setDriverSupport, reject);
                                    else setDriverSupport(!!driverObject._support);
                                } else setDriverSupport(true);
                            } catch (e) {
                                reject(e);
                            }
                        });
                        executeTwoCallbacks(promise, callback, errorCallback);
                        return promise;
                    };
                    LocalForage.prototype.driver = function driver() {
                        return this._driver || null;
                    };
                    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
                        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error("Driver not found."));
                        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
                        return getDriverPromise;
                    };
                    LocalForage.prototype.getSerializer = function getSerializer(callback) {
                        var serializerPromise = Promise$1.resolve(localforageSerializer);
                        executeTwoCallbacks(serializerPromise, callback);
                        return serializerPromise;
                    };
                    LocalForage.prototype.ready = function ready(callback) {
                        var self1 = this;
                        var promise = self1._driverSet.then(function() {
                            if (self1._ready === null) self1._ready = self1._initDriver();
                            return self1._ready;
                        });
                        executeTwoCallbacks(promise, callback, callback);
                        return promise;
                    };
                    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
                        var self1 = this;
                        if (!isArray(drivers)) drivers = [
                            drivers
                        ];
                        var supportedDrivers = this._getSupportedDrivers(drivers);
                        function setDriverToConfig() {
                            self1._config.driver = self1.driver();
                        }
                        function extendSelfWithDriver(driver) {
                            self1._extend(driver);
                            setDriverToConfig();
                            self1._ready = self1._initStorage(self1._config);
                            return self1._ready;
                        }
                        function initDriver(supportedDrivers) {
                            return function() {
                                var currentDriverIndex = 0;
                                function driverPromiseLoop() {
                                    while(currentDriverIndex < supportedDrivers.length){
                                        var driverName = supportedDrivers[currentDriverIndex];
                                        currentDriverIndex++;
                                        self1._dbInfo = null;
                                        self1._ready = null;
                                        return self1.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                                    }
                                    setDriverToConfig();
                                    var error = new Error("No available storage method found.");
                                    self1._driverSet = Promise$1.reject(error);
                                    return self1._driverSet;
                                }
                                return driverPromiseLoop();
                            };
                        }
                        // There might be a driver initialization in progress
                        // so wait for it to finish in order to avoid a possible
                        // race condition to set _dbInfo
                        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function() {
                            return Promise$1.resolve();
                        }) : Promise$1.resolve();
                        this._driverSet = oldDriverSetDone.then(function() {
                            var driverName = supportedDrivers[0];
                            self1._dbInfo = null;
                            self1._ready = null;
                            return self1.getDriver(driverName).then(function(driver) {
                                self1._driver = driver._driver;
                                setDriverToConfig();
                                self1._wrapLibraryMethodsWithReady();
                                self1._initDriver = initDriver(supportedDrivers);
                            });
                        })["catch"](function() {
                            setDriverToConfig();
                            var error = new Error("No available storage method found.");
                            self1._driverSet = Promise$1.reject(error);
                            return self1._driverSet;
                        });
                        executeTwoCallbacks(this._driverSet, callback, errorCallback);
                        return this._driverSet;
                    };
                    LocalForage.prototype.supports = function supports(driverName) {
                        return !!DriverSupport[driverName];
                    };
                    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
                        extend(this, libraryMethodsAndProperties);
                    };
                    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
                        var supportedDrivers = [];
                        for(var i = 0, len = drivers.length; i < len; i++){
                            var driverName = drivers[i];
                            if (this.supports(driverName)) supportedDrivers.push(driverName);
                        }
                        return supportedDrivers;
                    };
                    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
                        // Add a stub for each driver API method that delays the call to the
                        // corresponding driver method until localForage is ready. These stubs
                        // will be replaced by the driver methods as soon as the driver is
                        // loaded, so there is no performance impact.
                        for(var i = 0, len = LibraryMethods.length; i < len; i++)callWhenReady(this, LibraryMethods[i]);
                    };
                    LocalForage.prototype.createInstance = function createInstance(options) {
                        return new LocalForage(options);
                    };
                    return LocalForage;
                }();
                // The actual localForage object that we expose as a module or via a
                // global. It's extended by pulling in one of our other libraries.
                var localforage_js = new LocalForage();
                module1.exports = localforage_js;
            },
            {
                "3": 3
            }
        ]
    }, {}, [
        4
    ])(4);
});


var $17844dfbc928513b$exports = {};
"use strict";
$17844dfbc928513b$exports = function(string, maxLength, fillString) {
    if (string == null || maxLength == null) return string;
    var result = String(string);
    var targetLen = typeof maxLength === "number" ? maxLength : parseInt(maxLength, 10);
    if (isNaN(targetLen) || !isFinite(targetLen)) return result;
    var length = result.length;
    if (length >= targetLen) return result;
    var filled = fillString == null ? "" : String(fillString);
    if (filled === "") filled = " ";
    var fillLen = targetLen - length;
    while(filled.length < fillLen)filled += filled;
    var truncated = filled.length > fillLen ? filled.substr(0, fillLen) : filled;
    return result + truncated;
};


var $30c05137717fb899$var$n = 9e15, $30c05137717fb899$var$e = function() {
    for(var t = [], n = -323; n <= 308; n++)t.push(Number("1e" + n));
    return function(n) {
        return t[n + 323];
    };
}(), $30c05137717fb899$var$r = function(t) {
    return t instanceof $30c05137717fb899$var$a ? t : new $30c05137717fb899$var$a(t);
}, $30c05137717fb899$var$i = function(t, n) {
    return (new $30c05137717fb899$var$a).fromMantissaExponent(t, n);
}, $30c05137717fb899$var$o = function(t, n) {
    return (new $30c05137717fb899$var$a).fromMantissaExponent_noNormalize(t, n);
};
function $30c05137717fb899$var$u(t, n, e, r) {
    var i = n.mul(e.pow(r));
    return $30c05137717fb899$var$a.floor(t.div(i).mul(e.sub(1)).add(1).log10() / e.log10());
}
function $30c05137717fb899$var$s(t, n, e, r) {
    return n.mul(e.pow(r)).mul($30c05137717fb899$var$a.sub(1, e.pow(t))).div($30c05137717fb899$var$a.sub(1, e));
}
var $30c05137717fb899$var$a = function() {
    function a(t) {
        this.mantissa = NaN, this.exponent = NaN, void 0 === t ? (this.m = 0, this.e = 0) : t instanceof a ? this.fromDecimal(t) : "number" == typeof t ? this.fromNumber(t) : this.fromString(t);
    }
    return Object.defineProperty(a.prototype, "m", {
        get: function() {
            return this.mantissa;
        },
        set: function(t) {
            this.mantissa = t;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(a.prototype, "e", {
        get: function() {
            return this.exponent;
        },
        set: function(t) {
            this.exponent = t;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(a.prototype, "s", {
        get: function() {
            return this.sign();
        },
        set: function(t) {
            if (0 === t) return this.e = 0, void (this.m = 0);
            this.sgn() !== t && (this.m = -this.m);
        },
        enumerable: !1,
        configurable: !0
    }), a.fromMantissaExponent = function(t, n) {
        return (new a).fromMantissaExponent(t, n);
    }, a.fromMantissaExponent_noNormalize = function(t, n) {
        return (new a).fromMantissaExponent_noNormalize(t, n);
    }, a.fromDecimal = function(t) {
        return (new a).fromDecimal(t);
    }, a.fromNumber = function(t) {
        return (new a).fromNumber(t);
    }, a.fromString = function(t) {
        return (new a).fromString(t);
    }, a.fromValue = function(t) {
        return (new a).fromValue(t);
    }, a.fromValue_noAlloc = function(t) {
        return t instanceof a ? t : new a(t);
    }, a.abs = function(t) {
        return $30c05137717fb899$var$r(t).abs();
    }, a.neg = function(t) {
        return $30c05137717fb899$var$r(t).neg();
    }, a.negate = function(t) {
        return $30c05137717fb899$var$r(t).neg();
    }, a.negated = function(t) {
        return $30c05137717fb899$var$r(t).neg();
    }, a.sign = function(t) {
        return $30c05137717fb899$var$r(t).sign();
    }, a.sgn = function(t) {
        return $30c05137717fb899$var$r(t).sign();
    }, a.round = function(t) {
        return $30c05137717fb899$var$r(t).round();
    }, a.floor = function(t) {
        return $30c05137717fb899$var$r(t).floor();
    }, a.ceil = function(t) {
        return $30c05137717fb899$var$r(t).ceil();
    }, a.trunc = function(t) {
        return $30c05137717fb899$var$r(t).trunc();
    }, a.add = function(t, n) {
        return $30c05137717fb899$var$r(t).add(n);
    }, a.plus = function(t, n) {
        return $30c05137717fb899$var$r(t).add(n);
    }, a.sub = function(t, n) {
        return $30c05137717fb899$var$r(t).sub(n);
    }, a.subtract = function(t, n) {
        return $30c05137717fb899$var$r(t).sub(n);
    }, a.minus = function(t, n) {
        return $30c05137717fb899$var$r(t).sub(n);
    }, a.mul = function(t, n) {
        return $30c05137717fb899$var$r(t).mul(n);
    }, a.multiply = function(t, n) {
        return $30c05137717fb899$var$r(t).mul(n);
    }, a.times = function(t, n) {
        return $30c05137717fb899$var$r(t).mul(n);
    }, a.div = function(t, n) {
        return $30c05137717fb899$var$r(t).div(n);
    }, a.divide = function(t, n) {
        return $30c05137717fb899$var$r(t).div(n);
    }, a.recip = function(t) {
        return $30c05137717fb899$var$r(t).recip();
    }, a.reciprocal = function(t) {
        return $30c05137717fb899$var$r(t).recip();
    }, a.reciprocate = function(t) {
        return $30c05137717fb899$var$r(t).reciprocate();
    }, a.cmp = function(t, n) {
        return $30c05137717fb899$var$r(t).cmp(n);
    }, a.compare = function(t, n) {
        return $30c05137717fb899$var$r(t).cmp(n);
    }, a.eq = function(t, n) {
        return $30c05137717fb899$var$r(t).eq(n);
    }, a.equals = function(t, n) {
        return $30c05137717fb899$var$r(t).eq(n);
    }, a.neq = function(t, n) {
        return $30c05137717fb899$var$r(t).neq(n);
    }, a.notEquals = function(t, n) {
        return $30c05137717fb899$var$r(t).notEquals(n);
    }, a.lt = function(t, n) {
        return $30c05137717fb899$var$r(t).lt(n);
    }, a.lte = function(t, n) {
        return $30c05137717fb899$var$r(t).lte(n);
    }, a.gt = function(t, n) {
        return $30c05137717fb899$var$r(t).gt(n);
    }, a.gte = function(t, n) {
        return $30c05137717fb899$var$r(t).gte(n);
    }, a.max = function(t, n) {
        return $30c05137717fb899$var$r(t).max(n);
    }, a.min = function(t, n) {
        return $30c05137717fb899$var$r(t).min(n);
    }, a.clamp = function(t, n, e) {
        return $30c05137717fb899$var$r(t).clamp(n, e);
    }, a.clampMin = function(t, n) {
        return $30c05137717fb899$var$r(t).clampMin(n);
    }, a.clampMax = function(t, n) {
        return $30c05137717fb899$var$r(t).clampMax(n);
    }, a.cmp_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).cmp_tolerance(n, e);
    }, a.compare_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).cmp_tolerance(n, e);
    }, a.eq_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).eq_tolerance(n, e);
    }, a.equals_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).eq_tolerance(n, e);
    }, a.neq_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).neq_tolerance(n, e);
    }, a.notEquals_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).notEquals_tolerance(n, e);
    }, a.lt_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).lt_tolerance(n, e);
    }, a.lte_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).lte_tolerance(n, e);
    }, a.gt_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).gt_tolerance(n, e);
    }, a.gte_tolerance = function(t, n, e) {
        return $30c05137717fb899$var$r(t).gte_tolerance(n, e);
    }, a.log10 = function(t) {
        return $30c05137717fb899$var$r(t).log10();
    }, a.absLog10 = function(t) {
        return $30c05137717fb899$var$r(t).absLog10();
    }, a.pLog10 = function(t) {
        return $30c05137717fb899$var$r(t).pLog10();
    }, a.log = function(t, n) {
        return $30c05137717fb899$var$r(t).log(n);
    }, a.log2 = function(t) {
        return $30c05137717fb899$var$r(t).log2();
    }, a.ln = function(t) {
        return $30c05137717fb899$var$r(t).ln();
    }, a.logarithm = function(t, n) {
        return $30c05137717fb899$var$r(t).logarithm(n);
    }, a.pow10 = function(t) {
        return Number.isInteger(t) ? $30c05137717fb899$var$o(1, t) : $30c05137717fb899$var$i(Math.pow(10, t % 1), Math.trunc(t));
    }, a.pow = function(t, n) {
        return "number" == typeof t && 10 === t && "number" == typeof n && Number.isInteger(n) ? $30c05137717fb899$var$o(1, n) : $30c05137717fb899$var$r(t).pow(n);
    }, a.exp = function(t) {
        return $30c05137717fb899$var$r(t).exp();
    }, a.sqr = function(t) {
        return $30c05137717fb899$var$r(t).sqr();
    }, a.sqrt = function(t) {
        return $30c05137717fb899$var$r(t).sqrt();
    }, a.cube = function(t) {
        return $30c05137717fb899$var$r(t).cube();
    }, a.cbrt = function(t) {
        return $30c05137717fb899$var$r(t).cbrt();
    }, a.dp = function(t) {
        return $30c05137717fb899$var$r(t).dp();
    }, a.decimalPlaces = function(t) {
        return $30c05137717fb899$var$r(t).dp();
    }, a.affordGeometricSeries = function(t, n, e, i) {
        return $30c05137717fb899$var$u($30c05137717fb899$var$r(t), $30c05137717fb899$var$r(n), $30c05137717fb899$var$r(e), i);
    }, a.sumGeometricSeries = function(t, n, e, i) {
        return $30c05137717fb899$var$s(t, $30c05137717fb899$var$r(n), $30c05137717fb899$var$r(e), i);
    }, a.affordArithmeticSeries = function(t, n, e, i) {
        return function(t, n, e, r) {
            var i = n.add(r.mul(e)).sub(e.div(2)), o = i.pow(2);
            return i.neg().add(o.add(e.mul(t).mul(2)).sqrt()).div(e).floor();
        }($30c05137717fb899$var$r(t), $30c05137717fb899$var$r(n), $30c05137717fb899$var$r(e), $30c05137717fb899$var$r(i));
    }, a.sumArithmeticSeries = function(t, n, e, i) {
        return function(t, n, e, r) {
            var i = n.add(r.mul(e));
            return t.div(2).mul(i.mul(2).plus(t.sub(1).mul(e)));
        }($30c05137717fb899$var$r(t), $30c05137717fb899$var$r(n), $30c05137717fb899$var$r(e), $30c05137717fb899$var$r(i));
    }, a.efficiencyOfPurchase = function(t, n, e) {
        return function(t, n, e) {
            return t.div(n).add(t.div(e));
        }($30c05137717fb899$var$r(t), $30c05137717fb899$var$r(n), $30c05137717fb899$var$r(e));
    }, a.randomDecimalForTesting = function(t) {
        if (20 * Math.random() < 1) return $30c05137717fb899$var$o(0, 0);
        var n = 10 * Math.random();
        10 * Math.random() < 1 && (n = Math.round(n)), n *= Math.sign(2 * Math.random() - 1);
        var e = Math.floor(Math.random() * t * 2) - t;
        return $30c05137717fb899$var$i(n, e);
    }, a.prototype.normalize = function() {
        if (this.m >= 1 && this.m < 10) return this;
        if (0 === this.m) return this.m = 0, this.e = 0, this;
        var t = Math.floor(Math.log10(Math.abs(this.m)));
        return this.m = -324 === t ? 10 * this.m / 1e-323 : this.m / $30c05137717fb899$var$e(t), this.e += t, this;
    }, a.prototype.fromMantissaExponent = function(t, n) {
        return isFinite(t) && isFinite(n) ? (this.m = t, this.e = n, this.normalize(), this) : (t = Number.NaN, n = Number.NaN, this);
    }, a.prototype.fromMantissaExponent_noNormalize = function(t, n) {
        return this.m = t, this.e = n, this;
    }, a.prototype.fromDecimal = function(t) {
        return this.m = t.m, this.e = t.e, this;
    }, a.prototype.fromNumber = function(t) {
        return isNaN(t) ? (this.m = Number.NaN, this.e = Number.NaN) : t === Number.POSITIVE_INFINITY ? (this.m = 1, this.e = $30c05137717fb899$var$n) : t === Number.NEGATIVE_INFINITY ? (this.m = -1, this.e = $30c05137717fb899$var$n) : 0 === t ? (this.m = 0, this.e = 0) : (this.e = Math.floor(Math.log10(Math.abs(t))), this.m = -324 === this.e ? 10 * t / 1e-323 : t / $30c05137717fb899$var$e(this.e), this.normalize()), this;
    }, a.prototype.fromString = function(t) {
        if (-1 !== t.indexOf("e")) {
            var n = t.split("e");
            this.m = parseFloat(n[0]), this.e = parseFloat(n[1]), this.normalize();
        } else if ("NaN" === t) this.m = Number.NaN, this.e = Number.NaN;
        else if (this.fromNumber(parseFloat(t)), isNaN(this.m)) throw Error("[DecimalError] Invalid argument: " + t);
        return this;
    }, a.prototype.fromValue = function(t) {
        return t instanceof a ? this.fromDecimal(t) : "number" == typeof t ? this.fromNumber(t) : "string" == typeof t ? this.fromString(t) : (this.m = 0, this.e = 0, this);
    }, a.prototype.toNumber = function() {
        if (!isFinite(this.e)) return Number.NaN;
        if (this.e > 308) return this.m > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
        if (this.e < -324) return 0;
        if (-324 === this.e) return this.m > 0 ? 5e-324 : -0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005;
        var t = this.m * $30c05137717fb899$var$e(this.e);
        if (!isFinite(t) || this.e < 0) return t;
        var n = Math.round(t);
        return Math.abs(n - t) < 1e-10 ? n : t;
    }, a.prototype.mantissaWithDecimalPlaces = function(t) {
        if (isNaN(this.m) || isNaN(this.e)) return Number.NaN;
        if (0 === this.m) return 0;
        var n = t + 1, e = Math.ceil(Math.log10(Math.abs(this.m))), r = Math.round(this.m * Math.pow(10, n - e)) * Math.pow(10, e - n);
        return parseFloat(r.toFixed(Math.max(n - e, 0)));
    }, a.prototype.toString = function() {
        return isNaN(this.m) || isNaN(this.e) ? "NaN" : this.e >= $30c05137717fb899$var$n ? this.m > 0 ? "Infinity" : "-Infinity" : this.e <= -$30c05137717fb899$var$n || 0 === this.m ? "0" : this.e < 21 && this.e > -7 ? this.toNumber().toString() : this.m + "e" + (this.e >= 0 ? "+" : "") + this.e;
    }, a.prototype.toExponential = function(e) {
        if (isNaN(this.m) || isNaN(this.e)) return "NaN";
        if (this.e >= $30c05137717fb899$var$n) return this.m > 0 ? "Infinity" : "-Infinity";
        if (this.e <= -$30c05137717fb899$var$n || 0 === this.m) return "0" + (e > 0 ? (0, (/*@__PURE__*/$parcel$interopDefault($17844dfbc928513b$exports)))(".", e + 1, "0") : "") + "e+0";
        if (this.e > -324 && this.e < 308) return this.toNumber().toExponential(e);
        isFinite(e) || (e = 17);
        var r = e + 1, i = Math.max(1, Math.ceil(Math.log10(Math.abs(this.m))));
        return (Math.round(this.m * Math.pow(10, r - i)) * Math.pow(10, i - r)).toFixed(Math.max(r - i, 0)) + "e" + (this.e >= 0 ? "+" : "") + this.e;
    }, a.prototype.toFixed = function(e) {
        return isNaN(this.m) || isNaN(this.e) ? "NaN" : this.e >= $30c05137717fb899$var$n ? this.m > 0 ? "Infinity" : "-Infinity" : this.e <= -$30c05137717fb899$var$n || 0 === this.m ? "0" + (e > 0 ? (0, (/*@__PURE__*/$parcel$interopDefault($17844dfbc928513b$exports)))(".", e + 1, "0") : "") : this.e >= 17 ? this.m.toString().replace(".", "").padEnd(this.e + 1, "0") + (e > 0 ? (0, (/*@__PURE__*/$parcel$interopDefault($17844dfbc928513b$exports)))(".", e + 1, "0") : "") : this.toNumber().toFixed(e);
    }, a.prototype.toPrecision = function(t) {
        return this.e <= -7 ? this.toExponential(t - 1) : t > this.e ? this.toFixed(t - this.e - 1) : this.toExponential(t - 1);
    }, a.prototype.valueOf = function() {
        return this.toString();
    }, a.prototype.toJSON = function() {
        return this.toString();
    }, a.prototype.toStringWithDecimalPlaces = function(t) {
        return this.toExponential(t);
    }, a.prototype.abs = function() {
        return $30c05137717fb899$var$o(Math.abs(this.m), this.e);
    }, a.prototype.neg = function() {
        return $30c05137717fb899$var$o(-this.m, this.e);
    }, a.prototype.negate = function() {
        return this.neg();
    }, a.prototype.negated = function() {
        return this.neg();
    }, a.prototype.sign = function() {
        return Math.sign(this.m);
    }, a.prototype.sgn = function() {
        return this.sign();
    }, a.prototype.round = function() {
        return this.e < -1 ? new a(0) : this.e < 17 ? new a(Math.round(this.toNumber())) : this;
    }, a.prototype.floor = function() {
        return this.e < -1 ? Math.sign(this.m) >= 0 ? new a(0) : new a(-1) : this.e < 17 ? new a(Math.floor(this.toNumber())) : this;
    }, a.prototype.ceil = function() {
        return this.e < -1 ? Math.sign(this.m) > 0 ? new a(1) : new a(0) : this.e < 17 ? new a(Math.ceil(this.toNumber())) : this;
    }, a.prototype.trunc = function() {
        return this.e < 0 ? new a(0) : this.e < 17 ? new a(Math.trunc(this.toNumber())) : this;
    }, a.prototype.add = function(t) {
        var n, o, u = $30c05137717fb899$var$r(t);
        if (0 === this.m) return u;
        if (0 === u.m) return this;
        if (this.e >= u.e ? (n = this, o = u) : (n = u, o = this), n.e - o.e > 17) return n;
        var s = Math.round(1e14 * n.m + 1e14 * o.m * $30c05137717fb899$var$e(o.e - n.e));
        return $30c05137717fb899$var$i(s, n.e - 14);
    }, a.prototype.plus = function(t) {
        return this.add(t);
    }, a.prototype.sub = function(t) {
        return this.add($30c05137717fb899$var$r(t).neg());
    }, a.prototype.subtract = function(t) {
        return this.sub(t);
    }, a.prototype.minus = function(t) {
        return this.sub(t);
    }, a.prototype.mul = function(t) {
        if ("number" == typeof t) return t < 1e307 && t > -10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 ? $30c05137717fb899$var$i(this.m * t, this.e) : $30c05137717fb899$var$i(1e-307 * this.m * t, this.e + 307);
        var n = "string" == typeof t ? new a(t) : t;
        return $30c05137717fb899$var$i(this.m * n.m, this.e + n.e);
    }, a.prototype.multiply = function(t) {
        return this.mul(t);
    }, a.prototype.times = function(t) {
        return this.mul(t);
    }, a.prototype.div = function(t) {
        return this.mul($30c05137717fb899$var$r(t).recip());
    }, a.prototype.divide = function(t) {
        return this.div(t);
    }, a.prototype.divideBy = function(t) {
        return this.div(t);
    }, a.prototype.dividedBy = function(t) {
        return this.div(t);
    }, a.prototype.recip = function() {
        return $30c05137717fb899$var$i(1 / this.m, -this.e);
    }, a.prototype.reciprocal = function() {
        return this.recip();
    }, a.prototype.reciprocate = function() {
        return this.recip();
    }, a.prototype.cmp = function(t) {
        var n = $30c05137717fb899$var$r(t);
        if (0 === this.m) {
            if (0 === n.m) return 0;
            if (n.m < 0) return 1;
            if (n.m > 0) return -1;
        }
        if (0 === n.m) {
            if (this.m < 0) return -1;
            if (this.m > 0) return 1;
        }
        if (this.m > 0) return n.m < 0 || this.e > n.e ? 1 : this.e < n.e ? -1 : this.m > n.m ? 1 : this.m < n.m ? -1 : 0;
        if (this.m < 0) return n.m > 0 || this.e > n.e ? -1 : this.e < n.e || this.m > n.m ? 1 : this.m < n.m ? -1 : 0;
        throw Error("Unreachable code");
    }, a.prototype.compare = function(t) {
        return this.cmp(t);
    }, a.prototype.eq = function(t) {
        var n = $30c05137717fb899$var$r(t);
        return this.e === n.e && this.m === n.m;
    }, a.prototype.equals = function(t) {
        return this.eq(t);
    }, a.prototype.neq = function(t) {
        return !this.eq(t);
    }, a.prototype.notEquals = function(t) {
        return this.neq(t);
    }, a.prototype.lt = function(t) {
        var n = $30c05137717fb899$var$r(t);
        return 0 === this.m ? n.m > 0 : 0 === n.m ? this.m <= 0 : this.e === n.e ? this.m < n.m : this.m > 0 ? n.m > 0 && this.e < n.e : n.m > 0 || this.e > n.e;
    }, a.prototype.lte = function(t) {
        return !this.gt(t);
    }, a.prototype.gt = function(t) {
        var n = $30c05137717fb899$var$r(t);
        return 0 === this.m ? n.m < 0 : 0 === n.m ? this.m > 0 : this.e === n.e ? this.m > n.m : this.m > 0 ? n.m < 0 || this.e > n.e : n.m < 0 && this.e < n.e;
    }, a.prototype.gte = function(t) {
        return !this.lt(t);
    }, a.prototype.max = function(t) {
        var n = $30c05137717fb899$var$r(t);
        return this.lt(n) ? n : this;
    }, a.prototype.min = function(t) {
        var n = $30c05137717fb899$var$r(t);
        return this.gt(n) ? n : this;
    }, a.prototype.clamp = function(t, n) {
        return this.max(t).min(n);
    }, a.prototype.clampMin = function(t) {
        return this.max(t);
    }, a.prototype.clampMax = function(t) {
        return this.min(t);
    }, a.prototype.cmp_tolerance = function(t, n) {
        var e = $30c05137717fb899$var$r(t);
        return this.eq_tolerance(e, n) ? 0 : this.cmp(e);
    }, a.prototype.compare_tolerance = function(t, n) {
        return this.cmp_tolerance(t, n);
    }, a.prototype.eq_tolerance = function(t, n) {
        var e = $30c05137717fb899$var$r(t);
        return a.lte(this.sub(e).abs(), a.max(this.abs(), e.abs()).mul(n));
    }, a.prototype.equals_tolerance = function(t, n) {
        return this.eq_tolerance(t, n);
    }, a.prototype.neq_tolerance = function(t, n) {
        return !this.eq_tolerance(t, n);
    }, a.prototype.notEquals_tolerance = function(t, n) {
        return this.neq_tolerance(t, n);
    }, a.prototype.lt_tolerance = function(t, n) {
        var e = $30c05137717fb899$var$r(t);
        return !this.eq_tolerance(e, n) && this.lt(e);
    }, a.prototype.lte_tolerance = function(t, n) {
        var e = $30c05137717fb899$var$r(t);
        return this.eq_tolerance(e, n) || this.lt(e);
    }, a.prototype.gt_tolerance = function(t, n) {
        var e = $30c05137717fb899$var$r(t);
        return !this.eq_tolerance(e, n) && this.gt(e);
    }, a.prototype.gte_tolerance = function(t, n) {
        var e = $30c05137717fb899$var$r(t);
        return this.eq_tolerance(e, n) || this.gt(e);
    }, a.prototype.log10 = function() {
        return this.e + Math.log10(this.m);
    }, a.prototype.absLog10 = function() {
        return this.e + Math.log10(Math.abs(this.m));
    }, a.prototype.pLog10 = function() {
        return this.m <= 0 || this.e < 0 ? 0 : this.log10();
    }, a.prototype.log = function(t) {
        return Math.LN10 / Math.log(t) * this.log10();
    }, a.prototype.log2 = function() {
        return 3.321928094887362 * this.log10();
    }, a.prototype.ln = function() {
        return 2.302585092994045 * this.log10();
    }, a.prototype.logarithm = function(t) {
        return this.log(t);
    }, a.prototype.pow = function(t) {
        var n, e = t instanceof a ? t.toNumber() : t, r = this.e * e;
        if (Number.isSafeInteger(r) && (n = Math.pow(this.m, e), isFinite(n) && 0 !== n)) return $30c05137717fb899$var$i(n, r);
        var o = Math.trunc(r), u = r - o;
        if (n = Math.pow(10, e * Math.log10(this.m) + u), isFinite(n) && 0 !== n) return $30c05137717fb899$var$i(n, o);
        var s = a.pow10(e * this.absLog10());
        return -1 === this.sign() ? 1 === Math.abs(e % 2) ? s.neg() : 0 === Math.abs(e % 2) ? s : new a(Number.NaN) : s;
    }, a.prototype.pow_base = function(t) {
        return $30c05137717fb899$var$r(t).pow(this);
    }, a.prototype.factorial = function() {
        var t = this.toNumber() + 1;
        return a.pow(t / Math.E * Math.sqrt(t * Math.sinh(1 / t) + 1 / (810 * Math.pow(t, 6))), t).mul(Math.sqrt(2 * Math.PI / t));
    }, a.prototype.exp = function() {
        var t = this.toNumber();
        return -706 < t && t < 709 ? a.fromNumber(Math.exp(t)) : a.pow(Math.E, t);
    }, a.prototype.sqr = function() {
        return $30c05137717fb899$var$i(Math.pow(this.m, 2), 2 * this.e);
    }, a.prototype.sqrt = function() {
        return this.m < 0 ? new a(Number.NaN) : this.e % 2 != 0 ? $30c05137717fb899$var$i(3.16227766016838 * Math.sqrt(this.m), Math.floor(this.e / 2)) : $30c05137717fb899$var$i(Math.sqrt(this.m), Math.floor(this.e / 2));
    }, a.prototype.cube = function() {
        return $30c05137717fb899$var$i(Math.pow(this.m, 3), 3 * this.e);
    }, a.prototype.cbrt = function() {
        var t = 1, n = this.m;
        n < 0 && (t = -1, n = -n);
        var e = t * Math.pow(n, 1 / 3), r = this.e % 3;
        return $30c05137717fb899$var$i(1 === r || -1 === r ? 2.154434690031883 * e : 0 !== r ? 4.641588833612778 * e : e, Math.floor(this.e / 3));
    }, a.prototype.sinh = function() {
        return this.exp().sub(this.negate().exp()).div(2);
    }, a.prototype.cosh = function() {
        return this.exp().add(this.negate().exp()).div(2);
    }, a.prototype.tanh = function() {
        return this.sinh().div(this.cosh());
    }, a.prototype.asinh = function() {
        return a.ln(this.add(this.sqr().add(1).sqrt()));
    }, a.prototype.acosh = function() {
        return a.ln(this.add(this.sqr().sub(1).sqrt()));
    }, a.prototype.atanh = function() {
        return this.abs().gte(1) ? Number.NaN : a.ln(this.add(1).div(new a(1).sub(this))) / 2;
    }, a.prototype.ascensionPenalty = function(t) {
        return 0 === t ? this : this.pow(Math.pow(10, -t));
    }, a.prototype.egg = function() {
        return this.add(9);
    }, a.prototype.lessThanOrEqualTo = function(t) {
        return this.cmp(t) < 1;
    }, a.prototype.lessThan = function(t) {
        return this.cmp(t) < 0;
    }, a.prototype.greaterThanOrEqualTo = function(t) {
        return this.cmp(t) > -1;
    }, a.prototype.greaterThan = function(t) {
        return this.cmp(t) > 0;
    }, a.prototype.decimalPlaces = function() {
        return this.dp();
    }, a.prototype.dp = function() {
        if (!isFinite(this.mantissa)) return NaN;
        if (this.exponent >= 17) return 0;
        for(var t = this.mantissa, n = -this.exponent, e = 1; Math.abs(Math.round(t * e) / e - t) > 1e-10;)e *= 10, n++;
        return n > 0 ? n : 0;
    }, Object.defineProperty(a, "MAX_VALUE", {
        get: function() {
            return $30c05137717fb899$var$h;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(a, "MIN_VALUE", {
        get: function() {
            return $30c05137717fb899$var$c;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(a, "NUMBER_MAX_VALUE", {
        get: function() {
            return $30c05137717fb899$var$p;
        },
        enumerable: !1,
        configurable: !0
    }), Object.defineProperty(a, "NUMBER_MIN_VALUE", {
        get: function() {
            return $30c05137717fb899$var$f;
        },
        enumerable: !1,
        configurable: !0
    }), a;
}(), $30c05137717fb899$var$h = $30c05137717fb899$var$o(1, $30c05137717fb899$var$n), $30c05137717fb899$var$c = $30c05137717fb899$var$o(1, -$30c05137717fb899$var$n), $30c05137717fb899$var$p = $30c05137717fb899$var$r(Number.MAX_VALUE), $30c05137717fb899$var$f = $30c05137717fb899$var$r(Number.MIN_VALUE);
var $30c05137717fb899$export$2e2bcd8739ae039 = $30c05137717fb899$var$a;


class $a348cea740e504f8$export$5bfce22a6398152d {
    constructor(game){
        this.game = game;
        console.log("Save Manager Constructor");
        console.log(this.game);
    }
    async save(game) {
        this.game = game;
        console.log("Saving game");
        console.log(this.game);
        const stateToSave = {};
        stateToSave["visibleLayer"] = this.game.visibleLayer;
        stateToSave["mainInterval"] = this.game.mainInterval;
        stateToSave["fixedInterval"] = this.game.fixedInterval;
        stateToSave["tooltipsEnabled"] = this.game.tooltipsEnabled;
        stateToSave["layers"] = {
            start: {
                unlocked: this.game.layers.start.unlocked,
                currency: this.game.layers.start.currency.toString(),
                highestCurrency: this.game.layers.start.highestCurrency.toString(),
                milestones: {
                    givePoints: {
                        level: this.game.layers.start.milestones.givePoints.level.toString(),
                        timesClicked: this.game.layers.start.milestones.givePoints.timesClicked.toString()
                    },
                    increasePointsPerClick: {
                        level: this.game.layers.start.milestones.increasePointsPerClick.level.toString(),
                        timesClicked: this.game.layers.start.milestones.increasePointsPerClick.timesClicked.toString()
                    },
                    upgradeIncreasePointsPerClick: {
                        level: this.game.layers.start.milestones.upgradeIncreasePointsPerClick.level.toString(),
                        timesClicked: this.game.layers.start.milestones.upgradeIncreasePointsPerClick.timesClicked.toString()
                    },
                    ultimatePointsPerClick: {
                        level: this.game.layers.start.milestones.ultimatePointsPerClick.level.toString(),
                        timesClicked: this.game.layers.start.milestones.ultimatePointsPerClick.timesClicked.toString()
                    },
                    autoPoints: {
                        level: this.game.layers.start.milestones.autoPoints.level.toString(),
                        buyable: this.game.layers.start.milestones.autoPoints.buyable
                    },
                    autoPointsDivisor: {
                        level: this.game.layers.start.milestones.autoPointsDivisor.level.toString(),
                        timesClicked: this.game.layers.start.milestones.autoPointsDivisor.timesClicked.toString()
                    },
                    betterAutoPoints: {
                        level: this.game.layers.start.milestones.betterAutoPoints.level.toString(),
                        timesClicked: this.game.layers.start.milestones.betterAutoPoints.timesClicked.toString()
                    },
                    criticalPoints: {
                        level: this.game.layers.start.milestones.criticalPoints.level.toString(),
                        timesClicked: this.game.layers.start.milestones.criticalPoints.timesClicked.toString()
                    },
                    criticalBonus: {
                        level: this.game.layers.start.milestones.criticalBonus.level.toString(),
                        timesClicked: this.game.layers.start.milestones.criticalBonus.timesClicked.toString()
                    },
                    overCritical: {
                        level: this.game.layers.start.milestones.overCritical.level.toString(),
                        timesClicked: this.game.layers.start.milestones.overCritical.timesClicked.toString()
                    }
                }
            },
            dice: {
                unlocked: this.game.layers.dice.unlocked,
                currency: this.game.layers.dice.currency.toString(),
                highestCurrency: this.game.layers.dice.highestCurrency.toString(),
                diceCount: this.game.layers.dice.diceCount,
                diceCountCap: this.game.layers.dice.diceCountCap,
                milestones: {
                    addDice: {
                        level: this.game.layers.dice.milestones.addDice.level.toString()
                    },
                    diceTimeout: {
                        level: this.game.layers.dice.milestones.diceTimeout.level.toString()
                    }
                }
            },
            coin: {
                unlocked: this.game.layers.coin.unlocked,
                milestones: {}
            }
        };
        // Actually save the state
        try {
            console.log("Saving game state", stateToSave);
            await (0, (/*@__PURE__*/$parcel$interopDefault($9c5688bb4ed5d6a8$exports))).setItem("gameState", stateToSave);
        } catch (err) {
            console.error("Save failed", err);
        }
    }
    async load(game) {
        this.game = game;
        try {
            const gameState = await (0, (/*@__PURE__*/$parcel$interopDefault($9c5688bb4ed5d6a8$exports))).getItem("gameState");
            console.log("STATE LOAD: ", gameState);
            if (gameState) {
                this.game.visibleLayer = gameState.visibleLayer;
                this.game.mainInterval = gameState.mainInterval;
                this.game.fixedInterval = gameState.fixedInterval;
                this.game.tooltipsEnabled = gameState.tooltipsEnabled;
                // Start Layer
                console.log(gameState.layers.start.currency, typeof gameState.layers.start.currency);
                this.game.layers.start.unlocked = gameState.layers.start.unlocked;
                this.game.layers.start.currency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.currency);
                this.game.layers.start.highestCurrency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.highestCurrency);
                this.game.layers.start.highestCurrency = this.game.layers.start.highestCurrency.add(0.1);
                this.game.layers.start.milestones.givePoints.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.givePoints.level);
                this.game.layers.start.milestones.givePoints.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.givePoints.timesClicked);
                this.game.layers.start.milestones.increasePointsPerClick.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.increasePointsPerClick.level);
                this.game.layers.start.milestones.increasePointsPerClick.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.increasePointsPerClick.timesClicked);
                this.game.layers.start.milestones.upgradeIncreasePointsPerClick.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.upgradeIncreasePointsPerClick.level);
                this.game.layers.start.milestones.upgradeIncreasePointsPerClick.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.upgradeIncreasePointsPerClick.timesClicked);
                this.game.layers.start.milestones.ultimatePointsPerClick.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.ultimatePointsPerClick.level);
                this.game.layers.start.milestones.ultimatePointsPerClick.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.ultimatePointsPerClick.timesClicked);
                this.game.layers.start.milestones.autoPoints.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.autoPoints.level);
                this.game.layers.start.autoPointsEnabled = !gameState.layers.start.milestones.autoPoints.buyable;
                this.game.layers.start.milestones.autoPoints.buyable = gameState.layers.start.milestones.autoPoints.buyable;
                this.game.layers.start.milestones.autoPointsDivisor.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.autoPointsDivisor.level);
                this.game.layers.start.milestones.autoPointsDivisor.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.autoPointsDivisor.timesClicked);
                this.game.layers.start.milestones.betterAutoPoints.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.betterAutoPoints.level);
                this.game.layers.start.milestones.betterAutoPoints.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.betterAutoPoints.timesClicked);
                this.game.layers.start.milestones.criticalPoints.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.criticalPoints.level);
                this.game.layers.start.milestones.criticalPoints.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.criticalPoints.timesClicked);
                this.game.layers.start.milestones.criticalBonus.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.criticalBonus.level);
                this.game.layers.start.milestones.criticalBonus.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.criticalBonus.timesClicked);
                this.game.layers.start.milestones.overCritical.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.overCritical.level);
                this.game.layers.start.milestones.overCritical.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.start.milestones.overCritical.timesClicked);
                // Dice Layer
                this.game.layers.dice.unlocked = gameState.layers.dice.unlocked;
                this.game.layers.dice.currency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.dice.currency);
                this.game.layers.dice.highestCurrency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.dice.highestCurrency);
                this.game.layers.dice.diceCount = gameState.layers.dice.diceCount;
                this.game.layers.dice.diceCountCap = gameState.layers.dice.diceCountCap;
                this.game.layers.dice.milestones.addDice.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.dice.milestones.addDice.level);
                this.game.layers.dice.milestones.diceTimeout.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(gameState.layers.dice.milestones.diceTimeout.level);
                // Coin Layer
                this.game.layers.coin.unlocked = gameState.layers.coin.unlocked;
                this.game.setupNav();
                for (const layer of Object.keys(this.game.layers))this.game.layers[layer].toggleVisibility(true);
                this.game.switchLayer(this.game.visibleLayer);
                this.game.setTooltipsState();
                // loop over each layer and update the milestones
                for (const layer of Object.keys(this.game.layers))this.game.layers[layer].checkMilestones();
                //  Update milestone costs based on loaded level
                for (const layer of Object.keys(this.game.layers))for (const key of Object.keys(this.game.layers[layer].milestones)){
                    const ms = this.game.layers[layer].milestones[key];
                    const msf = this.game.layers[layer].milestoneFunctions[key].cost;
                    ms.cost = msf(ms);
                }
                // update the text and tooltip on each milestone
                for (const layer of Object.keys(this.game.layers)){
                    for (const key of Object.keys(this.game.layers[layer].milestones))if (this.game.layers[layer].milestoneFunctions[key].update) this.game.layers[layer].milestoneFunctions[key].update();
                }
                // this.game.layers.start.buttons.givePoints.button
                this.game.updateUI();
                this.game.layers.start.updatePointsText();
                this.game.layers.dice.updateDotsText();
            } else {
                console.log("No saved game state to load");
                this.save(this.game); // Save initial state if nothing to load
            }
        } catch (err) {
            console.error("Load failed", err);
        }
    }
    async saveExists() {
        const value = await (0, (/*@__PURE__*/$parcel$interopDefault($9c5688bb4ed5d6a8$exports))).getItem("gameState");
        // Check not just for an object, but also ensure it's not null or undefined
        return value !== null && value !== undefined;
    }
}


class $e15866bea5b2da0a$export$353f5b6fc5456de1 {
    constructor(game, milestone){
        this.lines = [];
        this.game = game;
        this.milestone = milestone;
        this.button = document.createElement("button");
        this.tooltopVisable = true;
        this.button.setAttribute("tabindex", "-1");
        // add 4 divs to the this.lines array
        this.lines.push(document.createElement("h1"));
        for(let i = 0; i < 3; i++)this.lines.push(document.createElement("div"));
        this.init();
    }
    init() {
        this.updateText();
        this.updateTooltip();
        for (const line of this.lines)this.button.appendChild(line);
        if (this.milestone.name === "givePoints") this.lines[0].className = "givePoints";
        this.button.addEventListener("keydown", (event)=>{
            if (event.key === "Enter" || event.keyCode === 13) event.preventDefault();
        });
        this.button.addEventListener("click", (event)=>{
            this.milestone.activate();
            this.updateTooltip();
            this.updateText();
        });
        this.button.addEventListener("mouseenter", (event)=>{
            this.milestone.hovered = true;
            // Only proceed if not already displaying a graph
            if (!this.game.displayingGraph) {
                if (this.game.formulaGraphEnabled && this.milestone.graphEnabled) {
                    // Conditions met, now set displayingGraph to true to block further graph creations until mouseleave
                    this.game.displayingGraph = true;
                    this.game.formulaGraph.createGraph(this.milestone);
                // Move the mouseleave listener outside the condition to ensure it's always added
                }
                // Listener for mouseleave to reset the state
                this.button.addEventListener("mouseleave", (event)=>{
                    this.milestone.hovered = false;
                    // Ensure graph is not being displayed anymore
                    this.game.displayingGraph = false;
                    // Call to remove the graph
                    this.game.formulaGraph.removeGraph();
                }, {
                    once: true
                }); // Ensures this listener is cleaned up after execution
            }
        });
        // Tooltip
        this.button.addEventListener("mouseover", (event)=>{
            if (!this.tooltopVisable) return;
            const descriptionDiv = document.createElement("div");
            descriptionDiv.textContent = this.milestone.description;
            descriptionDiv.className = "dynamic-tooltip";
            document.body.appendChild(descriptionDiv); // Append to body to ensure it's not constrained by button's position
            const updateTooltipPosition = (mouseEvent)=>{
                descriptionDiv.style.left = `${mouseEvent.clientX + 100}px`;
                descriptionDiv.style.top = `${mouseEvent.clientY}px`;
            };
            // Initial position update
            updateTooltipPosition(event);
            // Update tooltip position on mouse move
            this.button.addEventListener("mousemove", updateTooltipPosition);
            // Clean up: remove tooltip and event listener when mouse leaves
            this.button.addEventListener("mouseleave", ()=>{
                descriptionDiv.remove();
                this.button.removeEventListener("mousemove", updateTooltipPosition);
            }, {
                once: true
            }); // Use { once: true } to automatically remove this event listener after it triggers once
        });
        return this;
    }
    toggleTooltip() {
        this.tooltopVisable = !this.tooltopVisable;
    }
    updateTooltip() {
        const tooltip = document.querySelector(".tooltip");
        if (tooltip) tooltip.textContent = this.milestone.description;
    }
    updateText() {
        this.lines[0].textContent = this.milestone.text;
    }
    // Optionally, create a static factory method to directly return the button element
    static createMilestoneButton(game, milestone) {
        const btn = new $e15866bea5b2da0a$export$353f5b6fc5456de1(game, milestone);
        return btn; // Return the Button instance
    }
}



// bind document.getElementById to $
const $33dc7b2aef0a6efa$var$$ = document.getElementById.bind(document);
class $33dc7b2aef0a6efa$export$936d0764594b6eb3 {
    constructor(game, name, cost, layerColor){
        this.unlocked = false;
        this.parentElement = $33dc7b2aef0a6efa$var$$("main");
        this.visible = false;
        this.Button = (0, $e15866bea5b2da0a$export$353f5b6fc5456de1);
        this.game = game;
        this.name = name;
        this.unlockCost = cost; // Cost to show the layer
        this.cost = cost; // Cost to buy (prob deprecate soon)
        this.layerColor = layerColor;
        this.currency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.highestCurrency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.currencyName = "Points";
        this.milestones = {};
        this.milestoneFunctions = {};
        // create a blank div that fills the entire parent, and add it to the parent which is main
        this.div = document.createElement("div");
        this.parentElement.appendChild(this.div);
        this.div.classList.add("layer", "hidden");
        this.div.setAttribute("id", this.name);
        this.buttons = {};
    }
    buyMilestone(m) {
        const tryUpg = ()=>{
            if (this.currency.gte(this.milestones[m].cost) && this.milestones[m].buyable) {
                this.removeCurrency(this.milestones[m].cost);
                this.milestones[m].levelUp();
            }
        };
        if (this.game.keyPressed === "Shift") for(let i = 0; i < 10; i++)tryUpg();
        else if (this.game.keyPressed === "z") {
            console.log("ctrl");
            for(let i = 0; i < 10000; i++)tryUpg();
        } else tryUpg();
        this.milestoneFunctions[m].update();
    }
    toggleVisibility(forceHide) {
        if (forceHide) {
            if (this.div.classList.contains("hidden")) {
                this.visible = false;
                return;
            } else {
                this.div.classList.add("hidden");
                this.visible = false;
                return;
            }
        } else if (this.visible) {
            this.div.classList.add("hidden");
            this.visible = false;
        } else {
            this.div.classList.remove("hidden");
            this.visible = true;
        }
    }
    checkMilestones() {
        for (const key of Object.keys(this.milestones)){
            const milestone = this.milestones[key];
            const unlockCost = milestone.unlockCost;
            // Set unlocked to true (this is saved in the save file)
            try {
                if (this.highestCurrency.gt(unlockCost)) milestone.unlocked = true;
            } catch (err) {
                console.error("Error in checkMilestones", err);
                console.log("Milestone: ", milestone, "\nUnlock Cost: ", unlockCost, "\nHighest Currency: ", this.highestCurrency, "\nLayer: ", this);
            }
        }
        for (const key of Object.keys(this.milestones)){
            const milestone = this.milestones[key];
            milestone.cost = this.milestoneFunctions[key].cost(milestone);
        }
        // Loop over the unlocked milestones and add them to the div if they are not already in it
        for (const key of Object.keys(this.milestones)){
            if (this.milestones[key].unlocked && this.buttons[key] !== undefined) try {
                if (!this.div.contains(this.buttons[key].button)) {
                    if (this.milestones[key].buttonContainer !== undefined) {
                        this.milestones[key].buttonContainer.appendChild(this.buttons[key].button);
                        this.milestoneFunctions[key].updateText();
                    } else {
                        this.div.appendChild(this.buttons[key].button);
                        this.milestoneFunctions[key].updateText();
                    }
                }
            } catch (err) {
                console.log(key, this.milestones[key], "\n", this.buttons, this.buttons[key]);
                console.error("Error in checkMilestones", err);
            }
        }
    }
    setup() {
        for (const key of Object.keys(this.milestones)){
            const milestone = this.milestones[key];
            const milestoneButton = this.Button.createMilestoneButton(this.game, milestone);
            milestoneButton.button.addEventListener("click", ()=>{
                milestone.timesClicked = milestone.timesClicked.add(1);
            });
            this.buttons[key] = milestoneButton;
        }
        this.checkMilestones();
    }
    // Do not modify, its done per layer and i cba to change it :D
    update() {}
}



class $40c2d722a0fd0277$export$70e287e52ce0fe9c {
    constructor(name, text, unlockCost, description, maxLevel, milestoneFunctions, buttonContainer){
        this.name = name;
        this.text = text;
        this.unlockCost = unlockCost;
        this.unlocked = false;
        this.description = description;
        this.activate = milestoneFunctions.activate;
        this.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.maxLevel = maxLevel;
        this.costFormula = milestoneFunctions.cost;
        this.cost = this.costFormula(this);
        this.buyable = true;
        this.graphEnabled = false;
        this.hovered = false;
        this.buttonContainer = buttonContainer;
        this.timesClicked = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
    }
    levelUp() {
        if (this.level.gte(this.maxLevel)) this.buyable = false;
        if (!this.buyable) return;
        this.level = this.level.add(1);
        this.cost = this.costFormula(this);
        if (this.level.gte(this.maxLevel)) this.buyable = false;
    }
}



function $93501a718a4426dd$var$mapRange(x, inMin, inMax, outMin, outMax) {
    return x.minus(inMin).times(outMax.minus(outMin)).div(inMax.minus(inMin)).plus(outMin);
}
class $93501a718a4426dd$export$568b89e600fc77eb extends (0, $33dc7b2aef0a6efa$export$936d0764594b6eb3) {
    constructor(game){
        super(game, "start", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0), "green");
        this.upgradeColumns = [];
        this.currencyName = "Points";
        this.currency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.pointsText = document.createElement("h2");
        this.pointsText.classList.add("start-points-text");
        this.pointsText.textContent = `Points: ${this.currency}`;
        this.div.appendChild(this.pointsText);
        this.lastPointsGiveText = document.createElement("h3");
        this.lastPointsGiveText.classList.add("start-last-points-give-text");
        this.lastPointsGiveText.textContent = `Manual P+ 0`;
        this.div.appendChild(this.lastPointsGiveText);
        this.lastAutoPointsGiveText = document.createElement("h3");
        this.lastAutoPointsGiveText.classList.add("start-last-auto-points-give-text");
        this.lastAutoPointsGiveText.textContent = `Auto P+ 0`;
        this.div.appendChild(this.lastAutoPointsGiveText);
        this.upgradeColumnsDiv = document.createElement("div");
        this.upgradeColumnsDiv.classList.add("start-upgrade-columns");
        this.div.appendChild(this.upgradeColumnsDiv);
        // Loop over 3 upgrade columns and add the upgrade-column class and append them to the upgradecolumnsdiv
        for(let i = 0; i < 3; i++){
            this.upgradeColumns.push(document.createElement("div"));
            this.upgradeColumns[i].classList.add("upgrade-column");
            this.upgradeColumnsDiv.appendChild(this.upgradeColumns[i]);
        }
        this.autoPointsEnabled = false;
        this.lastPointsGive = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.lastAutoPointsGive = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.lastClickTimestamp = 0;
        this.minTimePerClick = 3;
        this.milestoneFunctions = {
            givePoints: {
                activate: ()=>{
                    const currentTimestamp = Date.now();
                    if (currentTimestamp - this.lastClickTimestamp > this.minTimePerClick) {
                        this.lastClickTimestamp = currentTimestamp;
                        this.addCurrencyStack();
                    } else console.log("Slow your auto-clicker homie ;) (rate limit 3ms/activation)");
                    this.milestoneFunctions.givePoints.update();
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const cost = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1);
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.givePoints.updateText();
                },
                updateText: ()=>{
                    this.buttons.givePoints.lines[0].textContent = this.milestones.givePoints.text;
                }
            },
            // Increase Points Per Click
            increasePointsPerClick: {
                activate: ()=>{
                    this.buyMilestone("increasePointsPerClick");
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        let cost = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvl.times(lvl.sqrt()));
                        cost = cost.times(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne).log(10)).times(10);
                        cost = cost.add(lvlPlusOne.ln()).times(10).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.increasePointsPerClick.updateText();
                },
                updateText: ()=>{
                    this.buttons.increasePointsPerClick.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.increasePointsPerClick.cost)}`;
                    this.buttons.increasePointsPerClick.lines[2].textContent = `Level: ${this.milestones.increasePointsPerClick.level}/${this.milestones.increasePointsPerClick.maxLevel}`;
                    this.buttons.increasePointsPerClick.lines[3].textContent = `+${this.milestones.increasePointsPerClick.level.add(1)}`;
                }
            },
            // Upgrade Increase Points Per Click
            upgradeIncreasePointsPerClick: {
                activate: ()=>{
                    this.buyMilestone("upgradeIncreasePointsPerClick");
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const m = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100);
                        const b = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0.07);
                        const j = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100000);
                        const n = j.div(b.times(m).sinh());
                        const lvlPlusOne = lvl.add(1);
                        const cost = n.times(b.times(lvl).sinh()).times(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.ln()).times(10)).pow(1.3).plus(150).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.upgradeIncreasePointsPerClick.updateText();
                },
                updateText: ()=>{
                    this.buttons.upgradeIncreasePointsPerClick.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.upgradeIncreasePointsPerClick.cost)}`;
                    this.buttons.upgradeIncreasePointsPerClick.lines[2].textContent = `Level: ${this.milestones.upgradeIncreasePointsPerClick.level}/${this.milestones.upgradeIncreasePointsPerClick.maxLevel}`;
                    this.buttons.upgradeIncreasePointsPerClick.lines[3].textContent = `*${this.milestones.upgradeIncreasePointsPerClick.level.add(1)}`;
                }
            },
            // Ultimate Points Per Click
            ultimatePointsPerClick: {
                activate: ()=>{
                    this.buyMilestone("ultimatePointsPerClick");
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        const a = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(20000);
                        const b = lvlPlusOne.times(6).times(lvlPlusOne);
                        const c = b.pow(3.45);
                        return a.add(c).floor();
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.ultimatePointsPerClick.updateText();
                },
                updateText: ()=>{
                    this.buttons.ultimatePointsPerClick.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.ultimatePointsPerClick.cost)}`;
                    this.buttons.ultimatePointsPerClick.lines[2].textContent = `Level: ${this.milestones.ultimatePointsPerClick.level}/${this.milestones.ultimatePointsPerClick.maxLevel}`;
                    this.buttons.ultimatePointsPerClick.lines[3].textContent = `*${this.milestones.ultimatePointsPerClick.level.add(1)}`;
                }
            },
            // Auto Points
            autoPoints: {
                activate: ()=>{
                    this.buyMilestone("autoPoints");
                    if (this.milestones.autoPoints.level.gt(0)) this.autoPointsEnabled = true;
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const cost = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(15000);
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.autoPoints.updateText();
                },
                updateText: ()=>{
                    if (this.milestones.autoPoints.buyable) this.buttons.autoPoints.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.autoPoints.cost)}`;
                    else {
                        this.buttons.autoPoints.lines[1].textContent = "Enabled";
                        this.buttons.autoPoints.button.classList.add("not-buyable");
                    }
                }
            },
            // Auto Points Divisor
            autoPointsDivisor: {
                activate: ()=>{
                    this.buyMilestone("autoPointsDivisor");
                    if (this.milestones.autoPointsDivisor.level.lt(1)) this.milestones.autoPointsDivisor.level = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1);
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        const j = 10000;
                        const a = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1.5);
                        const b = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(2.8);
                        const c = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.times(a)).times(lvl.pow(b));
                        const d = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.ln()).times(j).add(j);
                        const cost = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(c.plus(d)).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.autoPointsDivisor.updateText();
                },
                updateText: ()=>{
                    this.buttons.autoPointsDivisor.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.autoPointsDivisor.cost)}`;
                    this.buttons.autoPointsDivisor.lines[2].textContent = `Level: ${this.milestones.autoPointsDivisor.level}/${this.milestones.autoPointsDivisor.maxLevel}`;
                    this.buttons.autoPointsDivisor.lines[3].textContent = `Divisor: ${new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100).sub(this.milestones.autoPointsDivisor.level)}%`;
                }
            },
            // Better Auto Points
            betterAutoPoints: {
                activate: ()=>{
                    this.buyMilestone("betterAutoPoints");
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        const j = 10000;
                        const a = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1.9);
                        const b = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(2.8);
                        const c = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.times(a)).times(lvl.pow(b));
                        const d = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.ln()).times(j).add(j);
                        const cost = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(c.plus(d)).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.betterAutoPoints.updateText();
                },
                updateText: ()=>{
                    this.buttons.betterAutoPoints.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.betterAutoPoints.cost)}`;
                    this.buttons.betterAutoPoints.lines[2].textContent = `Level: ${this.milestones.betterAutoPoints.level}/${this.milestones.betterAutoPoints.maxLevel}`;
                    this.buttons.betterAutoPoints.lines[3].textContent = `Divisor: ${this.milestones.betterAutoPoints.level}`;
                }
            },
            // Critical Points (Crit Chance)
            criticalPoints: {
                activate: ()=>{
                    this.buyMilestone("criticalPoints");
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        const a = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.pow(1.059).times(30000)).floor();
                        const b = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.ln() + 1).times(10);
                        const cost = a.times(b).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.criticalPoints.updateText();
                },
                updateText: ()=>{
                    this.buttons.criticalPoints.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.criticalPoints.cost)}`;
                    this.buttons.criticalPoints.lines[2].textContent = `Level: ${this.milestones.criticalPoints.level}/${this.milestones.criticalPoints.maxLevel}`;
                    this.buttons.criticalPoints.lines[3].textContent = `Crit Chance: ${this.milestones.criticalPoints.level}%`;
                }
            },
            // Crit Bonus (Crit reward bonus %)
            criticalBonus: {
                activate: ()=>{
                    this.buyMilestone("criticalBonus");
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        const a = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.pow(1.064).times(30000));
                        const b = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.ln() + 1).times(100);
                        const cost = a.times(b).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.criticalBonus.updateText();
                },
                updateText: ()=>{
                    this.buttons.criticalBonus.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.criticalBonus.cost)}`;
                    this.buttons.criticalBonus.lines[2].textContent = `Level: ${this.milestones.criticalBonus.level}/${this.milestones.criticalBonus.maxLevel}`;
                    this.buttons.criticalBonus.lines[3].textContent = `Crit Bonus: ${this.milestones.criticalBonus.level}*`;
                }
            },
            // Over Crit (Turn crits over 100% into BIGGGGER crits)
            overCritical: {
                activate: ()=>{
                    this.buyMilestone("overCritical");
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        const a = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.pow(1.064).times(30000));
                        const b = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.ln() + 1).times(100);
                        const cost = a.times(b).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.milestoneFunctions.overCritical.updateText();
                },
                updateText: ()=>{
                    this.buttons.overCritical.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.overCritical.cost)}`;
                    this.buttons.overCritical.lines[2].textContent = `Level: ${this.milestones.overCritical.level}/${this.milestones.overCritical.maxLevel}`;
                    this.buttons.overCritical.lines[3].textContent = `Over Crit: ${this.milestones.overCritical.level}`;
                }
            }
        };
        this.milestones = {
            givePoints: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("givePoints", "Gib Points", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0), "Give points when clicked", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(-1), this.milestoneFunctions.givePoints, this.div),
            increasePointsPerClick: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("increasePointsPerClick", "+PPC", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(10), "Increase points per click", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(10000), this.milestoneFunctions.increasePointsPerClick, this.upgradeColumns[0]),
            upgradeIncreasePointsPerClick: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("upgradeIncreasePointsPerClick", "++PPC", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100), "Increase the amount that the +PPC upgrade gives", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100), this.milestoneFunctions.upgradeIncreasePointsPerClick, this.upgradeColumns[0]),
            ultimatePointsPerClick: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("ultimatePointsPerClick", "+++Ultimate +++PPC", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(30000), "Makes +PPC and ++PPC bettererist", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(10), this.milestoneFunctions.ultimatePointsPerClick, this.upgradeColumns[0]),
            autoPoints: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("autoPoints", "Automates Points", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(7500), "Give points automatically", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1), this.milestoneFunctions.autoPoints, this.upgradeColumns[1]),
            autoPointsDivisor: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("autoPointsDivisor", "Auto Points Divisor", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(10000), "Lowers the auto-points divider", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(99), this.milestoneFunctions.autoPointsDivisor, this.upgradeColumns[1]),
            betterAutoPoints: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("betterAutoPoints", "Better Auto Points", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1e8), "Makes auto points BETTER than clicking!", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100), this.milestoneFunctions.betterAutoPoints, this.upgradeColumns[1]),
            criticalPoints: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("criticalPoints", "Critical Points", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(30000), "Increases critical point chance", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(200), this.milestoneFunctions.criticalPoints, this.upgradeColumns[2]),
            criticalBonus: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("criticalBonus", "Critical Bonus", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(50000), "Increases critical point bonus", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1000), this.milestoneFunctions.criticalBonus, this.upgradeColumns[2]),
            overCritical: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("overCritical", "Over Critical", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(250000), "Converts bonus crit chance into better crits! (Usless with sub 100% crit chance)", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(2500), this.milestoneFunctions.overCritical, this.upgradeColumns[2])
        };
        // Enable graphing feature per milestone.
        this.milestones.increasePointsPerClick.graphEnabled = true;
        this.milestones.upgradeIncreasePointsPerClick.graphEnabled = true;
        this.milestones.ultimatePointsPerClick.graphEnabled = true;
        this.milestones.autoPointsDivisor.graphEnabled = true;
        this.milestones.criticalPoints.graphEnabled = true;
        this.milestones.criticalBonus.graphEnabled = true;
        this.milestones.overCritical.graphEnabled = true;
        this.setup();
        this.toggleVisibility();
        //  Moves the give points button to after the points text but before the upgrades
        // The index will need to change if I add more text in the this.div
        if (this.div.firstChild) this.div.insertBefore(this.buttons.givePoints.button, this.div.children[3]);
        this.milestoneFunctions.givePoints.update();
    }
    addCurrencyStack(rtn) {
        let value = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1);
        if (this.milestones.increasePointsPerClick.level.gt(0)) value = value.times(this.milestones.increasePointsPerClick.level.add(1));
        if (this.milestones.upgradeIncreasePointsPerClick.level.gt(0)) value = value.times(this.milestones.upgradeIncreasePointsPerClick.level.add(1));
        if (this.milestones.ultimatePointsPerClick.level.gt(0)) value = value.times(this.milestones.ultimatePointsPerClick.level.add(1)).times(this.milestones.ultimatePointsPerClick.level.add(1));
        // Crit stuff
        if (this.milestones.criticalPoints.level.gt(0)) {
            const rawCritChance = this.milestones.criticalPoints.level;
            const critChance = $93501a718a4426dd$var$mapRange(rawCritChance, new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1), new (0, $30c05137717fb899$export$2e2bcd8739ae039)(200), new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1), new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100));
            let critBonus = this.milestones.criticalBonus.level.add(1);
            const overCrit = this.game.layers.start.milestones.overCritical.level;
            if (rawCritChance.gt(100)) {
                if (overCrit.gt(0)) critBonus = critBonus.times(overCrit);
            }
            const crit = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(Math.random() * 100);
            if (critChance.gte(crit)) value = value.add(value.times(critBonus));
        }
        if (rtn) return value;
        this.lastPointsGive = value;
        this.addCurrency(value);
    }
    addCurrency(amount) {
        this.currency = this.currency.add(amount);
        this.updatePointsText();
    }
    removeCurrency(amount) {
        this.currency = this.currency.sub(amount);
        this.updatePointsText();
    }
    updatePointsText() {
        this.pointsText.textContent = `Points: ${this.game.formatValue(this.currency)}`;
        this.lastPointsGiveText.textContent = `Manual P+ ${this.game.formatValue(this.lastPointsGive)}`;
        this.lastAutoPointsGiveText.textContent = `Auto P+ ${this.game.formatValue(this.lastAutoPointsGive)}`;
    }
    update() {
        if (this.currency.gt(this.highestCurrency)) this.highestCurrency = this.currency;
        if (this.autoPointsEnabled) {
            let value = this.addCurrencyStack(true);
            value = value.div(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100).sub(this.milestones.autoPointsDivisor.level));
            value = value.times(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(this.milestones.betterAutoPoints.level.add(1).ln() + 1).add(1));
            this.lastAutoPointsGive = value;
            this.addCurrency(value);
        }
    }
}





class $83a61abead0fd813$export$5442621d844215cb {
    constructor(game, diceLayer){
        this.game = game;
        this.diceLayer = diceLayer;
        this.diceValue = 1;
        this.diceMaxValue = 6;
        this.parentDiv = this.diceLayer.diceArrayContainer;
        this.container = document.createElement("div");
        this.diceText = document.createElement("div");
        this.diceText.classList.add("dice-text");
        this.div = document.createElement("div");
        this.div.classList.add("dice");
        this.container.appendChild(this.diceText);
        this.container.appendChild(this.div);
        this.parentDiv.appendChild(this.container);
        this.diceText.textContent = this.diceValue.toString();
        this.diceDots = [];
        for(let i = 0; i < 25; i++){
            const dot = document.createElement("div");
            dot.classList.add("dot", "not-dot");
            this.diceDots.push(dot);
            this.div.appendChild(dot);
        // dot.textContent = i.toString();
        }
        this.diceFace(this.diceValue);
    }
    hideDots(dotsToHide) {
        for(let i = 0; i < dotsToHide.length; i++)this.diceDots[dotsToHide[i]].classList.remove("not-dot");
    }
    startRoll() {
        this.div.classList.add("rotate");
    }
    completeRoll() {
        this.diceValue = Math.floor(Math.random() * this.diceMaxValue) + 1;
        this.diceFace(this.diceValue);
        this.div.classList.remove("rotate");
        return new (0, $30c05137717fb899$export$2e2bcd8739ae039)(this.diceValue);
    }
    diceFace(faceValue) {
        this.diceText.textContent = this.diceValue.toString();
        this.diceDots.forEach((dot)=>{
            dot.classList.add("not-dot");
        });
        switch(faceValue){
            case 1:
                this.hideDots([
                    12
                ]);
                break;
            case 2:
                this.hideDots([
                    6,
                    18
                ]);
                break;
            case 3:
                this.hideDots([
                    6,
                    8,
                    17
                ]);
                break;
            case 4:
                this.hideDots([
                    6,
                    8,
                    16,
                    18
                ]);
                break;
            case 5:
                this.hideDots([
                    6,
                    8,
                    16,
                    18,
                    12
                ]);
                break;
            case 6:
                this.hideDots([
                    6,
                    7,
                    8,
                    16,
                    17,
                    18
                ]);
                break;
            case 7:
                this.hideDots([
                    6,
                    7,
                    8,
                    16,
                    17,
                    18,
                    12
                ]);
                break;
            case 8:
                this.hideDots([
                    6,
                    7,
                    8,
                    11,
                    16,
                    13,
                    18,
                    17
                ]);
                break;
            case 9:
                this.hideDots([
                    6,
                    7,
                    8,
                    11,
                    16,
                    13,
                    18,
                    17,
                    12
                ]);
                break;
            case 10:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    7,
                    17
                ]);
                break;
            case 11:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    7,
                    12,
                    17
                ]);
                break;
            case 12:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    7,
                    17,
                    11,
                    13
                ]);
                break;
            case 13:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    7,
                    17,
                    11,
                    13,
                    12
                ]);
                break;
            case 14:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    10,
                    2,
                    14,
                    22,
                    11,
                    13
                ]);
                break;
            case 15:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    10,
                    2,
                    14,
                    22,
                    6,
                    12,
                    18
                ]);
                break;
            case 16:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    10,
                    2,
                    14,
                    22,
                    11,
                    13,
                    7,
                    17
                ]);
                break;
            case 17:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    10,
                    2,
                    14,
                    22,
                    6,
                    12,
                    18,
                    0,
                    24
                ]);
                break;
            case 18:
                this.hideDots([
                    0,
                    1,
                    2,
                    3,
                    4,
                    6,
                    7,
                    8,
                    20,
                    21,
                    22,
                    23,
                    24,
                    16,
                    17,
                    18,
                    10,
                    14
                ]);
                break;
            case 19:
                this.hideDots([
                    1,
                    5,
                    3,
                    9,
                    15,
                    21,
                    19,
                    23,
                    10,
                    2,
                    14,
                    22,
                    0,
                    24,
                    20,
                    4,
                    8,
                    16,
                    12,
                    8
                ]);
                break;
            case 20:
                this.hideDots([
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    7,
                    9,
                    20,
                    21,
                    22,
                    23,
                    24,
                    15,
                    17,
                    19,
                    10,
                    14,
                    11,
                    13
                ]);
                break;
            case 21:
                this.hideDots([
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    9,
                    20,
                    21,
                    22,
                    23,
                    24,
                    15,
                    19,
                    10,
                    14,
                    6,
                    8,
                    16,
                    18,
                    12
                ]);
                break;
            case 22:
                this.hideDots([
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    7,
                    9,
                    20,
                    21,
                    22,
                    23,
                    24,
                    15,
                    17,
                    19,
                    10,
                    14,
                    6,
                    8,
                    16,
                    18
                ]);
                break;
            case 23:
                this.hideDots([
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    7,
                    9,
                    20,
                    21,
                    22,
                    23,
                    24,
                    15,
                    17,
                    19,
                    10,
                    14,
                    6,
                    8,
                    16,
                    18,
                    12
                ]);
                break;
            case 24:
                this.hideDots([
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    7,
                    9,
                    20,
                    21,
                    22,
                    23,
                    24,
                    15,
                    17,
                    19,
                    10,
                    14,
                    6,
                    8,
                    16,
                    18,
                    11,
                    13
                ]);
                break;
            case 25:
                this.hideDots([
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    7,
                    9,
                    20,
                    21,
                    22,
                    23,
                    24,
                    15,
                    17,
                    19,
                    10,
                    14,
                    6,
                    8,
                    16,
                    18,
                    11,
                    13,
                    12
                ]);
                break;
        }
    }
}
class $83a61abead0fd813$export$8be8c2ff45d443a3 extends (0, $33dc7b2aef0a6efa$export$936d0764594b6eb3) {
    constructor(game){
        super(game, "dice", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1e15), "white");
        this.upgradeColumns = [];
        this.layerColor = "blue";
        this.currencyName = "Dots";
        this.currency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.highestCurrency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.dotsText = document.createElement("h2");
        this.dotsText.classList.add("dots-text");
        this.dotsText.textContent = `Dots: ${this.currency}`;
        this.div.appendChild(this.dotsText);
        this.diceArrayContainer = document.createElement("div");
        this.diceArrayContainer.classList.add("dice-container");
        this.div.appendChild(this.diceArrayContainer);
        this.diceArrayContainer.addEventListener("click", this.rollDice.bind(this));
        this.upgradeColumnsDiv = document.createElement("div");
        this.upgradeColumnsDiv.classList.add("dice-upgrade-columns");
        this.div.appendChild(this.upgradeColumnsDiv);
        for(let i = 0; i < 3; i++){
            this.upgradeColumns.push(document.createElement("div"));
            this.upgradeColumns[i].classList.add("upgrade-column");
            this.upgradeColumnsDiv.appendChild(this.upgradeColumns[i]);
        }
        this.diceCount = 1;
        this.rollTimeout = 1000;
        this.previousRollTimestamp = 0;
        this.canRoll = true;
        this.diceArray = [];
        this.rollArray = [];
        this.milestoneFunctions = {
            addDice: {
                activate: ()=>{
                    this.buyMilestone("addDice");
                    this.milestoneFunctions.addDice.update();
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const cost = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvl.add(1).times(25)).pow(lvl.add(1).pow(1.2)).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.diceCount = this.milestones.addDice.level.toNumber() + 1;
                    this.setupDice();
                    this.milestoneFunctions.addDice.updateText();
                },
                updateText: ()=>{
                    this.buttons.addDice.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.addDice.cost)} Dots`;
                    this.buttons.addDice.lines[2].textContent = `Level: ${this.milestones.addDice.level}/${this.milestones.addDice.maxLevel}`;
                }
            },
            diceTimeout: {
                activate: ()=>{
                    this.buyMilestone("diceTimeout");
                    this.milestoneFunctions.diceTimeout.update();
                },
                cost: (milestone, returnMax = false, forceLvl)=>{
                    function calcCost(lvl) {
                        const lvlPlusOne = lvl.add(1);
                        const a = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(25);
                        const b = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1.7);
                        const c = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.div(a).add(b)).sqrt();
                        const cost = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(lvlPlusOne.times(a.pow(c))).floor();
                        return cost;
                    }
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                update: ()=>{
                    this.rollTimeout = 1000 / (this.milestones.diceTimeout.level.toNumber() * 18);
                    this.milestoneFunctions.diceTimeout.updateText();
                },
                updateText: ()=>{
                    this.buttons.diceTimeout.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.diceTimeout.cost)} Dots`;
                    this.buttons.diceTimeout.lines[2].textContent = `Level: ${this.milestones.diceTimeout.level}/${this.milestones.diceTimeout.maxLevel}`;
                    this.buttons.diceTimeout.lines[3].textContent = `Timeout: ${this.rollTimeout}ms`;
                }
            }
        };
        this.milestones = {
            addDice: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("addDice", "+1 Dice", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0), "Adds a new dice!", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(5), this.milestoneFunctions.addDice, this.upgradeColumns[1]),
            diceTimeout: new (0, $40c2d722a0fd0277$export$70e287e52ce0fe9c)("diceTimeout", "Dice Cooldown", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(100), "Rolls dice faster!", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(50), this.milestoneFunctions.diceTimeout, this.upgradeColumns[2])
        };
        this.init();
        this.setup();
    }
    rollDice() {
        if (!this.canRoll) return;
        this.diceArrayContainer.classList.remove("can-roll");
        this.previousRollTimestamp = Date.now();
        this.canRoll = false;
        this.diceArray.forEach((dice)=>dice.startRoll());
    }
    processRolls() {
        // this function will allow us to process using different rule sets for rolls later
        // like doubles, triples, etc.
        this.rollArray.forEach((roll)=>this.addCurrency(roll));
        this.rollArray = [];
    }
    addCurrency(amount) {
        this.currency = this.currency.add(amount);
        this.updateDotsText();
    }
    removeCurrency(amount) {
        this.currency = this.currency.sub(amount);
        this.updateDotsText();
    }
    updateDotsText() {
        this.dotsText.textContent = `Dots: ${this.game.formatValue(this.currency)}`;
    }
    setupDice() {
        // if diceArray length is less than diceCount, add dice to fill the array
        while(this.diceArray.length < this.diceCount)this.diceArray.push(new $83a61abead0fd813$export$5442621d844215cb(this.game, this));
    }
    init() {
        this.setupDice();
        this.updateDotsText();
        this.update();
    }
    // TODO: This is currently ran every 1000ms (mainInterval) - This is not ideal as this will over write the
    // timeout on the dice roll, this needs to be moved to a new interval, should probably make a new one that
    // has its own interval time set to the diceTimeout upgrades value???
    update() {
        if (this.currency.gte(this.highestCurrency)) this.highestCurrency = this.currency;
        if (!this.canRoll && Date.now() >= this.previousRollTimestamp + this.rollTimeout) {
            this.diceArray.forEach((dice)=>{
                this.rollArray.push(dice.completeRoll());
            });
            this.diceArrayContainer.classList.add("can-roll");
            this.canRoll = true;
            this.processRolls();
        }
    }
}




class $fec1aad84a4e3499$export$19600bc7e7f23c95 extends (0, $33dc7b2aef0a6efa$export$936d0764594b6eb3) {
    constructor(game){
        super(game, "coin", new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1e64), "yellow");
    }
}



class $f9544c9499cf351f$export$a52303878d5ad02c {
    constructor(game){
        this.xMin = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.xMax = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.yMin = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.yMax = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.step = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1);
        this.game = game;
        this.container = document.createElement("div");
        this.container.id = "formulaGraph";
        this.container.classList.add("hidden");
        this.container.classList.add("formula-graph");
        this.container.style.top = "50vh";
        this.container.style.left = "0";
        this.xMax = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.yMax = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        document.getElementById("main").appendChild(this.container);
    }
    createGraph(milestone) {
        this.milestone = milestone;
        this.milestoneFunc = milestone.costFormula;
        this.xMin = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(0);
        this.xMax = this.milestone.maxLevel;
        this.yMin = this.milestoneFunc(this.milestone, false, new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1));
        this.yMax = this.milestoneFunc(this.milestone, true);
        this.step = this.xMax.div(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(32));
        console.log(this.xMin, this.xMax, this.yMin, this.yMax, this.step);
        console.log(this.xMax, this.yMax);
        this.drawGraph();
    }
    drawGraph() {
        console.log("Drawing graph");
        if (!this.game.formulaGraphEnabled || !this.milestoneFunc || !this.milestone) return;
        this.container.classList.remove("hidden");
        this.container.innerHTML = "";
        const canvas = document.createElement("canvas");
        canvas.width = this.container.offsetWidth;
        canvas.height = this.container.offsetHeight;
        this.container.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // set the container position to just above the mouse
        this.container.style.left = `${this.game.mouseX}px`;
        this.container.style.top = `${this.game.mouseY - this.container.offsetHeight}px`;
        const canvasPad = 5; // Padding around the canvas
        ctx.fillStyle = "#808080";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.moveTo(canvasPad, canvas.height - canvasPad);
        ctx.beginPath();
        // Move to the starting point with padding considered
        // xMax = maxLevel
        // yMax = maxCost
        for(let x = this.xMin; x.lte(this.xMax); x = x.add(this.step)){
            const y = this.milestoneFunc(this.milestone, false, x);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            // Borked
            const xCoord = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(canvasPad).add(x.div(this.xMax)).times(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(canvas.width).sub(2).times(canvasPad)).toNumber();
            const yCoord = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(canvas.height).sub(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(canvasPad)).sub(y.div(this.yMax).times(new (0, $30c05137717fb899$export$2e2bcd8739ae039)(canvas.height).sub(2).times(canvasPad)))).toNumber();
            ctx.lineTo(xCoord, yCoord);
        }
        // ctx.beginPath();
        // ctx.ellipse(canvasPad + (x / this.xMax) * (canvas.width - 2 * canvasPad), (canvas.height - canvasPad) - (y / this.yMax) * (canvas.height - 2 * canvasPad), 5, 5, 0, 0, 2 * Math.PI);
        // ctx.fillStyle = 'green';
        // ctx.fill();
        // ctx.closePath();
        // display some text at the top of the graph that contains the max value
        ctx.font = "12px Roboto";
        ctx.fillStyle = "black";
        ctx.fillText(this.yMax.toString(), canvas.width / 2, 40);
        ctx.stroke();
        ctx.closePath();
    }
    removeGraph() {
        this.container.classList.add("hidden");
        this.container.innerHTML = "";
    }
}



class $98b122bb987399aa$export$985739bfa5723e08 {
    constructor(){
        this.fixedInterval = 3000 // Used for more process intense operations that need to be done less frequently
        ;
        this.mouseX = 0;
        this.mouseY = 0;
        this.formulaGraphEnabled = false;
        console.log("Game Constructor");
        this.saveManager = new (0, $a348cea740e504f8$export$5bfce22a6398152d)(this);
        this.formulaGraph = new (0, $f9544c9499cf351f$export$a52303878d5ad02c)(this);
        this.displayingGraph = false;
        this.navBar = $98b122bb987399aa$var$$("navBar");
        this.utilityBar = $98b122bb987399aa$var$$("utilityBar");
        this.mainInterval = 1000;
        this.keyPressed = "";
        this.autoSaveEnabled = true;
        this.autosaveInterval = 30000;
        this.mouseX = 0;
        this.mouseY = 0;
        this.layers = {
            start: new (0, $93501a718a4426dd$export$568b89e600fc77eb)(this),
            dice: new (0, $83a61abead0fd813$export$8be8c2ff45d443a3)(this),
            coin: new (0, $fec1aad84a4e3499$export$19600bc7e7f23c95)(this)
        };
        this.textElements = {
            start: document.createElement("div"),
            dice: document.createElement("div")
        };
        for (const key of Object.keys(this.textElements)){
            this.textElements[key].classList.add("d-flex", "gap-2");
            this.textElements[key].setAttribute("id", key);
            $98b122bb987399aa$var$$("header-data").appendChild(this.textElements[key]);
        }
        this.layers.start.unlocked = true;
        this.visibleLayer = "start";
        this.tooltipsEnabled = true;
        this.utilityButton(this, "Save", this.save);
        this.utilityButton(this, "Load", this.load);
        this.utilityButton(this, "AutoSave", this.toggleAutoSave);
        this.utilityButton(this, "Toggle Tooltips", this.toggleTooltips);
        this.utilityButton(this, "Enable Graphs", this.enableGraphs);
        this.gameTimer = setInterval(this.update.bind(this), this.mainInterval);
        this.fixedTimer = setInterval(this.fixedIntervalUpdate.bind(this), this.fixedInterval);
        this.autosaveTimer = setInterval(this.autoSave.bind(this), this.autosaveInterval);
        this.setupNav();
        document.addEventListener("contextmenu", (event)=>{
            event.preventDefault();
            // Can make custom right click menu if I can be bothered.
            // simulate left click
            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            });
            event.target?.dispatchEvent(clickEvent);
        });
        document.addEventListener("keydown", (event)=>{
            this.keyPressed = event.key;
            switch(this.keyPressed){
                case "q":
                    this.layers.start.currency = this.layers.start.currency.times(10);
                    break;
                case "1":
                    this.switchLayer("start");
                    break;
                case "2":
                    this.switchLayer("dice");
                    break;
                case "3":
                    this.switchLayer("coin");
                    break;
                case "g":
                    this.formulaGraphEnabled = !this.formulaGraphEnabled;
                    break;
                case "m":
                    this.layers.start.currency = new (0, $30c05137717fb899$export$2e2bcd8739ae039)(1e16);
                    break;
            }
        });
        document.addEventListener("keyup", (event)=>{
            this.keyPressed = "";
        });
        document.addEventListener("mousemove", (event)=>{
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });
        this.tryLoad();
    }
    async tryLoad() {
        if (await this.saveManager.saveExists()) this.load();
        else {
            console.log("No saved game state to load");
            this.save(); // Save initial state if nothing to load
        }
    }
    utilityButton(game, txt, func) {
        const btn = document.createElement("button");
        btn.innerText = txt;
        btn.classList.add("btn", "btn-transparent", "btn-hover");
        btn.addEventListener("click", func.bind(game));
        this.utilityBar.appendChild(btn);
    }
    autoSave() {
        if (this.autoSaveEnabled) {
            if (this.layers.start.currency.eq(0)) return;
            console.log("AutoSaving");
            this.save();
            const autoSaveBtn = Array.from(this.utilityBar.children).filter((child)=>child.textContent === "AutoSave")[0];
            autoSaveBtn.classList.add("auto-save-on");
        } else {
            const autoSaveBtn = Array.from(this.utilityBar.children).filter((child)=>child.textContent === "AutoSave")[0];
            autoSaveBtn.classList.remove("auto-save-on");
        }
    }
    save() {
        this.saveManager.save(this);
    }
    load() {
        this.saveManager.load(this);
    }
    toggleAutoSave() {
        this.autoSaveEnabled = !this.autoSaveEnabled;
    }
    // Is called every mainInterval time (1000ms default)
    update() {
        for (const layer of Object.keys(this.layers))this.layers[layer].update();
        this.updateUI();
    }
    // Is called every fixedInterval time (3000ms) - This does not decrease with game speed/upgrades.
    fixedIntervalUpdate() {
        for (const layer of Object.keys(this.layers)){
            if (this.layers[layer].currency.gt(this.layers[layer].highestCurrency)) this.layers[layer].highestCurrency = this.layers[layer].currency;
            this.layers[layer].checkMilestones();
        }
        if (this.layers.start.highestCurrency.gt(this.layers.dice.unlockCost)) this.layers.dice.unlocked = true;
        this.setupNav();
    }
    toggleTooltips() {
        this.tooltipsEnabled = !this.tooltipsEnabled;
        this.setTooltipsState();
    }
    enableGraphs() {
        this.formulaGraphEnabled = !this.formulaGraphEnabled;
    }
    setTooltipsState() {
        for (const layer of Object.keys(this.layers))for (const key of Object.keys(this.layers[layer].buttons)){
            const btn = this.layers[layer].buttons[key];
            btn.toggleTooltip();
        // element.setAttribute('tooltipenabled', 'enabled');
        }
    }
    setupNav() {
        this.navBar.innerHTML = "";
        for (const layer of Object.keys(this.layers))if (this.layers[layer].unlocked && !this.navBar.querySelector(`#${layer}`)) {
            const layerButton = document.createElement("button");
            layerButton.setAttribute("id", layer);
            layerButton.innerText = this.layers[layer].name.toUpperCase();
            layerButton.addEventListener("click", ()=>this.switchLayer(layer));
            this.navBar.appendChild(layerButton);
        }
        for (const button of this.navBar.children)if (button.id === this.visibleLayer) button.classList.add("selected");
        else button.classList.remove("selected");
    }
    switchLayer(layerName) {
        if (this.layers[layerName].unlocked === false) return;
        console.log("Switching to layer", layerName);
        for (const layer of Object.keys(this.layers))this.layers[layer].toggleVisibility(true);
        this.layers[layerName].toggleVisibility();
        for (const button of this.navBar.children)if (button.id === layerName) {
            this.visibleLayer = layerName;
            button.classList.add("selected");
        } else button.classList.remove("selected");
    }
    formatValue(value, places = 2) {
        if (value.lt(1000)) return value.toFixed(places).toString();
        else return `${value.m.toFixed(places)}e${value.e}`;
    }
    updateUI() {
        this.textElements.start.innerText = this.formatValue(this.layers.start.currency) + " P";
        this.textElements.dice.innerText = this.formatValue(this.layers.dice.currency) + " D";
    }
}
let $98b122bb987399aa$var$game;
// bind document.getElementById to $
const $98b122bb987399aa$var$$ = document.getElementById.bind(document);
document.addEventListener("DOMContentLoaded", function() {
    $98b122bb987399aa$var$game = new $98b122bb987399aa$export$985739bfa5723e08();
    window.game = $98b122bb987399aa$var$game;
});


//# sourceMappingURL=index.af4b037d.js.map
