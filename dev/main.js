(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("catsvsdogs", [], factory);
	else if(typeof exports === 'object')
		exports["catsvsdogs"] = factory();
	else
		root["catsvsdogs"] = factory();
})(this, function() {
return dojoWebpackJsonpcatsvsdogs(["main"],{

/***/ "./node_modules/@dojo/framework/core/Destroyable.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Promise__ = __webpack_require__("./node_modules/@dojo/framework/shim/Promise.mjs");

/**
 * No op function used to replace a Destroyable instance's `destroy` method, once the instance has been destroyed
 */
function noop() {
    return __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */].resolve(false);
}
/**
 * No op function used to replace a Destroyable instance's `own` method, once the instance has been destroyed
 */
function destroyed() {
    throw new Error('Call made to destroyed method');
}
class Destroyable {
    /**
     * @constructor
     */
    constructor() {
        this.handles = [];
    }
    /**
     * Register handles for the instance that will be destroyed when `this.destroy` is called
     *
     * @param {Handle} handle The handle to add for the instance
     * @returns {Handle} A wrapper Handle. When the wrapper Handle's `destroy` method is invoked, the original handle is
     *                   removed from the instance, and its `destroy` method is invoked.
     */
    own(handle) {
        const { handles: _handles } = this;
        _handles.push(handle);
        return {
            destroy() {
                _handles.splice(_handles.indexOf(handle));
                handle.destroy();
            }
        };
    }
    /**
     * Destroys all handlers registered for the instance
     *
     * @returns {Promise<any} A Promise that resolves once all handles have been destroyed
     */
    destroy() {
        return new __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]((resolve) => {
            this.handles.forEach((handle) => {
                handle && handle.destroy && handle.destroy();
            });
            this.destroy = noop;
            this.own = destroyed;
            resolve(true);
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Destroyable;

/* unused harmony default export */ var _unused_webpack_default_export = (Destroyable);


/***/ }),

/***/ "./node_modules/@dojo/framework/core/Evented.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isGlobMatch */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Destroyable__ = __webpack_require__("./node_modules/@dojo/framework/core/Destroyable.mjs");


/**
 * Map of computed regular expressions, keyed by string
 */
const regexMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
/**
 * Determines if the event type glob has been matched
 *
 * @returns boolean that indicates if the glob is matched
 */
function isGlobMatch(globString, targetString) {
    if (typeof targetString === 'string' && typeof globString === 'string' && globString.indexOf('*') !== -1) {
        let regex;
        if (regexMap.has(globString)) {
            regex = regexMap.get(globString);
        }
        else {
            regex = new RegExp(`^${globString.replace(/\*/g, '.*')}$`);
            regexMap.set(globString, regex);
        }
        return regex.test(targetString);
    }
    else {
        return globString === targetString;
    }
}
/**
 * Event Class
 */
class Evented extends __WEBPACK_IMPORTED_MODULE_1__Destroyable__["a" /* Destroyable */] {
    constructor() {
        super(...arguments);
        /**
         * map of listeners keyed by event type
         */
        this.listenersMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
    }
    emit(event) {
        this.listenersMap.forEach((methods, type) => {
            if (isGlobMatch(type, event.type)) {
                [...methods].forEach((method) => {
                    method.call(this, event);
                });
            }
        });
    }
    on(type, listener) {
        if (Array.isArray(listener)) {
            const handles = listener.map((listener) => this._addListener(type, listener));
            return {
                destroy() {
                    handles.forEach((handle) => handle.destroy());
                }
            };
        }
        return this._addListener(type, listener);
    }
    _addListener(type, listener) {
        const listeners = this.listenersMap.get(type) || [];
        listeners.push(listener);
        this.listenersMap.set(type, listeners);
        return {
            destroy: () => {
                const listeners = this.listenersMap.get(type) || [];
                listeners.splice(listeners.indexOf(listener), 1);
            }
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Evented;

/* unused harmony default export */ var _unused_webpack_default_export = (Evented);


/***/ }),

/***/ "./node_modules/@dojo/framework/core/util.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export deepAssign */
/* unused harmony export deepMixin */
/* unused harmony export mixin */
/* unused harmony export partial */
/* unused harmony export guaranteeMinimumTimeout */
/* unused harmony export debounce */
/* unused harmony export throttle */
/* harmony export (immutable) */ __webpack_exports__["a"] = uuid;
const slice = Array.prototype.slice;
const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Type guard that ensures that the value can be coerced to Object
 * to weed out host objects that do not derive from Object.
 * This function is used to check if we want to deep copy an object or not.
 * Note: In ES6 it is possible to modify an object's Symbol.toStringTag property, which will
 * change the value returned by `toString`. This is a rare edge case that is difficult to handle,
 * so it is not handled here.
 * @param  value The value to check
 * @return       If the value is coercible into an Object
 */
function shouldDeepCopyObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
function copyArray(array, inherited) {
    return array.map(function (item) {
        if (Array.isArray(item)) {
            return copyArray(item, inherited);
        }
        return !shouldDeepCopyObject(item)
            ? item
            : _mixin({
                deep: true,
                inherited: inherited,
                sources: [item],
                target: {}
            });
    });
}
function _mixin(kwArgs) {
    const deep = kwArgs.deep;
    const inherited = kwArgs.inherited;
    const target = kwArgs.target;
    const copied = kwArgs.copied || [];
    const copiedClone = [...copied];
    for (let i = 0; i < kwArgs.sources.length; i++) {
        const source = kwArgs.sources[i];
        if (source === null || source === undefined) {
            continue;
        }
        for (let key in source) {
            if (inherited || hasOwnProperty.call(source, key)) {
                let value = source[key];
                if (copiedClone.indexOf(value) !== -1) {
                    continue;
                }
                if (deep) {
                    if (Array.isArray(value)) {
                        value = copyArray(value, inherited);
                    }
                    else if (shouldDeepCopyObject(value)) {
                        const targetValue = target[key] || {};
                        copied.push(source);
                        value = _mixin({
                            deep: true,
                            inherited: inherited,
                            sources: [value],
                            target: targetValue,
                            copied
                        });
                    }
                }
                target[key] = value;
            }
        }
    }
    return target;
}
function deepAssign(target, ...sources) {
    return _mixin({
        deep: true,
        inherited: false,
        sources: sources,
        target: target
    });
}
function deepMixin(target, ...sources) {
    return _mixin({
        deep: true,
        inherited: true,
        sources: sources,
        target: target
    });
}
function mixin(target, ...sources) {
    return _mixin({
        deep: false,
        inherited: true,
        sources: sources,
        target: target
    });
}
/**
 * Returns a function which invokes the given function with the given arguments prepended to its argument list.
 * Like `Function.prototype.bind`, but does not alter execution context.
 *
 * @param targetFunction The function that needs to be bound
 * @param suppliedArgs An optional array of arguments to prepend to the `targetFunction` arguments list
 * @return The bound function
 */
function partial(targetFunction, ...suppliedArgs) {
    return function () {
        const args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
        return targetFunction.apply(this, args);
    };
}
function guaranteeMinimumTimeout(callback, delay) {
    const startTime = Date.now();
    let timerId;
    function timeoutHandler() {
        const delta = Date.now() - startTime;
        if (delay == null || delta >= delay) {
            callback();
        }
        else {
            timerId = setTimeout(timeoutHandler, delay - delta);
        }
    }
    timerId = setTimeout(timeoutHandler, delay);
    return {
        destroy: () => {
            if (timerId != null) {
                clearTimeout(timerId);
                timerId = null;
            }
        }
    };
}
function debounce(callback, delay) {
    let timer;
    return function () {
        timer && timer.destroy();
        let context = this;
        let args = arguments;
        timer = guaranteeMinimumTimeout(function () {
            callback.apply(context, args);
            args = context = timer = null;
        }, delay);
    };
}
function throttle(callback, delay) {
    let ran;
    return function () {
        if (ran) {
            return;
        }
        ran = true;
        callback.apply(this, arguments);
        guaranteeMinimumTimeout(function () {
            ran = null;
        }, delay);
    };
}
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


/***/ }),

/***/ "./node_modules/@dojo/framework/has/has.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(global, process) {/* harmony export (immutable) */ __webpack_exports__["load"] = load;
/* harmony export (immutable) */ __webpack_exports__["normalize"] = normalize;
/* harmony export (immutable) */ __webpack_exports__["exists"] = exists;
/* harmony export (immutable) */ __webpack_exports__["add"] = add;
/* harmony export (immutable) */ __webpack_exports__["default"] = has;
function isFeatureTestThenable(value) {
    return value && value.then;
}
/**
 * A cache of results of feature tests
 */
const testCache = {};
/* harmony export (immutable) */ __webpack_exports__["testCache"] = testCache;

/**
 * A cache of the un-resolved feature tests
 */
const testFunctions = {};
/* harmony export (immutable) */ __webpack_exports__["testFunctions"] = testFunctions;

/**
 * A cache of unresolved thenables (probably promises)
 * @type {{}}
 */
const testThenables = {};
/**
 * A reference to the global scope (`window` in a browser, `global` in NodeJS)
 */
const globalScope = (function () {
    /* istanbul ignore else */
    if (typeof window !== 'undefined') {
        // Browsers
        return window;
    }
    else if (typeof global !== 'undefined') {
        // Node
        return global;
    }
    else if (typeof self !== 'undefined') {
        // Web workers
        return self;
    }
    /* istanbul ignore next */
    return {};
})();
/* Grab the staticFeatures if there are available */
const { staticFeatures } = globalScope.DojoHasEnvironment || {};
/* Cleaning up the DojoHasEnviornment */
if ('DojoHasEnvironment' in globalScope) {
    delete globalScope.DojoHasEnvironment;
}
/**
 * Custom type guard to narrow the `staticFeatures` to either a map or a function that
 * returns a map.
 *
 * @param value The value to guard for
 */
function isStaticFeatureFunction(value) {
    return typeof value === 'function';
}
/**
 * The cache of asserted features that were available in the global scope when the
 * module loaded
 */
const staticCache = staticFeatures
    ? isStaticFeatureFunction(staticFeatures)
        ? staticFeatures.apply(globalScope)
        : staticFeatures
    : {}; /* Providing an empty cache, if none was in the environment

/**
* AMD plugin function.
*
* Conditional loads modules based on a has feature test value.
*
* @param resourceId Gives the resolved module id to load.
* @param require The loader require function with respect to the module that contained the plugin resource in its
*                dependency list.
* @param load Callback to loader that consumes result of plugin demand.
*/
function load(resourceId, require, load, config) {
    resourceId ? require([resourceId], load) : load();
}
/**
 * AMD plugin function.
 *
 * Resolves resourceId into a module id based on possibly-nested tenary expression that branches on has feature test
 * value(s).
 *
 * @param resourceId The id of the module
 * @param normalize Resolves a relative module id into an absolute module id
 */
function normalize(resourceId, normalize) {
    const tokens = resourceId.match(/[\?:]|[^:\?]*/g) || [];
    let i = 0;
    function get(skip) {
        const term = tokens[i++];
        if (term === ':') {
            // empty string module name, resolves to null
            return null;
        }
        else {
            // postfixed with a ? means it is a feature to branch on, the term is the name of the feature
            if (tokens[i++] === '?') {
                if (!skip && has(term)) {
                    // matched the feature, get the first value from the options
                    return get();
                }
                else {
                    // did not match, get the second value, passing over the first
                    get(true);
                    return get(skip);
                }
            }
            // a module
            return term;
        }
    }
    const id = get();
    return id && normalize(id);
}
/**
 * Check if a feature has already been registered
 *
 * @param feature the name of the feature
 */
function exists(feature) {
    const normalizedFeature = feature.toLowerCase();
    return Boolean(normalizedFeature in staticCache || normalizedFeature in testCache || testFunctions[normalizedFeature]);
}
/**
 * Register a new test for a named feature.
 *
 * @example
 * has.add('dom-addeventlistener', !!document.addEventListener);
 *
 * @example
 * has.add('touch-events', function () {
 *    return 'ontouchstart' in document
 * });
 *
 * @param feature the name of the feature
 * @param value the value reported of the feature, or a function that will be executed once on first test
 * @param overwrite if an existing value should be overwritten. Defaults to false.
 */
function add(feature, value, overwrite = false) {
    const normalizedFeature = feature.toLowerCase();
    if (exists(normalizedFeature) && !overwrite && !(normalizedFeature in staticCache)) {
        throw new TypeError(`Feature "${feature}" exists and overwrite not true.`);
    }
    if (typeof value === 'function') {
        testFunctions[normalizedFeature] = value;
    }
    else if (isFeatureTestThenable(value)) {
        testThenables[feature] = value.then((resolvedValue) => {
            testCache[feature] = resolvedValue;
            delete testThenables[feature];
        }, () => {
            delete testThenables[feature];
        });
    }
    else {
        testCache[normalizedFeature] = value;
        delete testFunctions[normalizedFeature];
    }
}
/**
 * Return the current value of a named feature.
 *
 * @param feature The name of the feature to test.
 */
function has(feature) {
    let result;
    const normalizedFeature = feature.toLowerCase();
    if (normalizedFeature in staticCache) {
        result = staticCache[normalizedFeature];
    }
    else if (testFunctions[normalizedFeature]) {
        result = testCache[normalizedFeature] = testFunctions[normalizedFeature].call(null);
        delete testFunctions[normalizedFeature];
    }
    else if (normalizedFeature in testCache) {
        result = testCache[normalizedFeature];
    }
    else if (feature in testThenables) {
        return false;
    }
    else {
        throw new TypeError(`Attempt to detect unregistered has feature "${feature}"`);
    }
    return result;
}
/*
 * Out of the box feature tests
 */
/* Environments */
/* Used as a value to provide a debug only code path */
add('debug', true);
/* flag for dojo debug, default to false */
add('dojo-debug', false);
/* Detects if the environment is "browser like" */
add('host-browser', typeof document !== 'undefined' && typeof location !== 'undefined');
/* Detects if the environment appears to be NodeJS */
add('host-node', function () {
    if (typeof process === 'object' && process.versions && process.versions.node) {
        return process.versions.node;
    }
});

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/global.js"), __webpack_require__("./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Map.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Map; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__object__ = __webpack_require__("./node_modules/@dojo/framework/shim/object.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");





let Map = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map;
if (false) {
    Map = (_a = class Map {
            constructor(iterable) {
                this._keys = [];
                this._values = [];
                this[Symbol.toStringTag] = 'Map';
                if (iterable) {
                    if (isArrayLike(iterable)) {
                        for (let i = 0; i < iterable.length; i++) {
                            const value = iterable[i];
                            this.set(value[0], value[1]);
                        }
                    }
                    else {
                        for (const value of iterable) {
                            this.set(value[0], value[1]);
                        }
                    }
                }
            }
            /**
             * An alternative to Array.prototype.indexOf using Object.is
             * to check for equality. See http://mzl.la/1zuKO2V
             */
            _indexOfKey(keys, key) {
                for (let i = 0, length = keys.length; i < length; i++) {
                    if (objectIs(keys[i], key)) {
                        return i;
                    }
                }
                return -1;
            }
            get size() {
                return this._keys.length;
            }
            clear() {
                this._keys.length = this._values.length = 0;
            }
            delete(key) {
                const index = this._indexOfKey(this._keys, key);
                if (index < 0) {
                    return false;
                }
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                return true;
            }
            entries() {
                const values = this._keys.map((key, i) => {
                    return [key, this._values[i]];
                });
                return new ShimIterator(values);
            }
            forEach(callback, context) {
                const keys = this._keys;
                const values = this._values;
                for (let i = 0, length = keys.length; i < length; i++) {
                    callback.call(context, values[i], keys[i], this);
                }
            }
            get(key) {
                const index = this._indexOfKey(this._keys, key);
                return index < 0 ? undefined : this._values[index];
            }
            has(key) {
                return this._indexOfKey(this._keys, key) > -1;
            }
            keys() {
                return new ShimIterator(this._keys);
            }
            set(key, value) {
                let index = this._indexOfKey(this._keys, key);
                index = index < 0 ? this._keys.length : index;
                this._keys[index] = key;
                this._values[index] = value;
                return this;
            }
            values() {
                return new ShimIterator(this._values);
            }
            [Symbol.iterator]() {
                return this.entries();
            }
        },
        _a[Symbol.species] = _a,
        _a);
}
/* harmony default export */ __webpack_exports__["b"] = (Map);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Promise.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ShimPromise */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_queue__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/queue.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");




let ShimPromise = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Promise;
const isThenable = function isThenable(value) {
    return value && typeof value.then === 'function';
};
/* unused harmony export isThenable */

if (false) {
    global.Promise = ShimPromise = (_a = class Promise {
            /**
             * Creates a new Promise.
             *
             * @constructor
             *
             * @param executor
             * The executor function is called immediately when the Promise is instantiated. It is responsible for
             * starting the asynchronous operation when it is invoked.
             *
             * The executor must call either the passed `resolve` function when the asynchronous operation has completed
             * successfully, or the `reject` function when the operation fails.
             */
            constructor(executor) {
                /**
                 * The current state of this promise.
                 */
                this.state = 1 /* Pending */;
                this[Symbol.toStringTag] = 'Promise';
                /**
                 * If true, the resolution of this promise is chained ("locked in") to another promise.
                 */
                let isChained = false;
                /**
                 * Whether or not this promise is in a resolved state.
                 */
                const isResolved = () => {
                    return this.state !== 1 /* Pending */ || isChained;
                };
                /**
                 * Callbacks that should be invoked once the asynchronous operation has completed.
                 */
                let callbacks = [];
                /**
                 * Initially pushes callbacks onto a queue for execution once this promise settles. After the promise settles,
                 * enqueues callbacks for execution on the next event loop turn.
                 */
                let whenFinished = function (callback) {
                    if (callbacks) {
                        callbacks.push(callback);
                    }
                };
                /**
                 * Settles this promise.
                 *
                 * @param newState The resolved state for this promise.
                 * @param {T|any} value The resolved value for this promise.
                 */
                const settle = (newState, value) => {
                    // A promise can only be settled once.
                    if (this.state !== 1 /* Pending */) {
                        return;
                    }
                    this.state = newState;
                    this.resolvedValue = value;
                    whenFinished = queueMicroTask;
                    // Only enqueue a callback runner if there are callbacks so that initially fulfilled Promises don't have to
                    // wait an extra turn.
                    if (callbacks && callbacks.length > 0) {
                        queueMicroTask(function () {
                            if (callbacks) {
                                let count = callbacks.length;
                                for (let i = 0; i < count; ++i) {
                                    callbacks[i].call(null);
                                }
                                callbacks = null;
                            }
                        });
                    }
                };
                /**
                 * Resolves this promise.
                 *
                 * @param newState The resolved state for this promise.
                 * @param {T|any} value The resolved value for this promise.
                 */
                const resolve = (newState, value) => {
                    if (isResolved()) {
                        return;
                    }
                    if (isThenable(value)) {
                        value.then(settle.bind(null, 0 /* Fulfilled */), settle.bind(null, 2 /* Rejected */));
                        isChained = true;
                    }
                    else {
                        settle(newState, value);
                    }
                };
                this.then = (onFulfilled, onRejected) => {
                    return new Promise((resolve, reject) => {
                        // whenFinished initially queues up callbacks for execution after the promise has settled. Once the
                        // promise has settled, whenFinished will schedule callbacks for execution on the next turn through the
                        // event loop.
                        whenFinished(() => {
                            const callback = this.state === 2 /* Rejected */ ? onRejected : onFulfilled;
                            if (typeof callback === 'function') {
                                try {
                                    resolve(callback(this.resolvedValue));
                                }
                                catch (error) {
                                    reject(error);
                                }
                            }
                            else if (this.state === 2 /* Rejected */) {
                                reject(this.resolvedValue);
                            }
                            else {
                                resolve(this.resolvedValue);
                            }
                        });
                    });
                };
                try {
                    executor(resolve.bind(null, 0 /* Fulfilled */), resolve.bind(null, 2 /* Rejected */));
                }
                catch (error) {
                    settle(2 /* Rejected */, error);
                }
            }
            static all(iterable) {
                return new this(function (resolve, reject) {
                    const values = [];
                    let complete = 0;
                    let total = 0;
                    let populating = true;
                    function fulfill(index, value) {
                        values[index] = value;
                        ++complete;
                        finish();
                    }
                    function finish() {
                        if (populating || complete < total) {
                            return;
                        }
                        resolve(values);
                    }
                    function processItem(index, item) {
                        ++total;
                        if (isThenable(item)) {
                            // If an item Promise rejects, this Promise is immediately rejected with the item
                            // Promise's rejection error.
                            item.then(fulfill.bind(null, index), reject);
                        }
                        else {
                            Promise.resolve(item).then(fulfill.bind(null, index));
                        }
                    }
                    let i = 0;
                    for (const value of iterable) {
                        processItem(i, value);
                        i++;
                    }
                    populating = false;
                    finish();
                });
            }
            static race(iterable) {
                return new this(function (resolve, reject) {
                    for (const item of iterable) {
                        if (item instanceof Promise) {
                            // If a Promise item rejects, this Promise is immediately rejected with the item
                            // Promise's rejection error.
                            item.then(resolve, reject);
                        }
                        else {
                            Promise.resolve(item).then(resolve);
                        }
                    }
                });
            }
            static reject(reason) {
                return new this(function (resolve, reject) {
                    reject(reason);
                });
            }
            static resolve(value) {
                return new this(function (resolve) {
                    resolve(value);
                });
            }
            catch(onRejected) {
                return this.then(undefined, onRejected);
            }
        },
        _a[Symbol.species] = ShimPromise,
        _a);
}
/* harmony default export */ __webpack_exports__["a"] = (ShimPromise);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Set.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Set */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");




let Set = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Set;
if (false) {
    Set = (_a = class Set {
            constructor(iterable) {
                this._setData = [];
                this[Symbol.toStringTag] = 'Set';
                if (iterable) {
                    if (isArrayLike(iterable)) {
                        for (let i = 0; i < iterable.length; i++) {
                            this.add(iterable[i]);
                        }
                    }
                    else {
                        for (const value of iterable) {
                            this.add(value);
                        }
                    }
                }
            }
            add(value) {
                if (this.has(value)) {
                    return this;
                }
                this._setData.push(value);
                return this;
            }
            clear() {
                this._setData.length = 0;
            }
            delete(value) {
                const idx = this._setData.indexOf(value);
                if (idx === -1) {
                    return false;
                }
                this._setData.splice(idx, 1);
                return true;
            }
            entries() {
                return new ShimIterator(this._setData.map((value) => [value, value]));
            }
            forEach(callbackfn, thisArg) {
                const iterator = this.values();
                let result = iterator.next();
                while (!result.done) {
                    callbackfn.call(thisArg, result.value, result.value, this);
                    result = iterator.next();
                }
            }
            has(value) {
                return this._setData.indexOf(value) > -1;
            }
            keys() {
                return new ShimIterator(this._setData);
            }
            get size() {
                return this._setData.length;
            }
            values() {
                return new ShimIterator(this._setData);
            }
            [Symbol.iterator]() {
                return new ShimIterator(this._setData);
            }
        },
        _a[Symbol.species] = _a,
        _a);
}
/* harmony default export */ __webpack_exports__["a"] = (Set);
var _a;


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Symbol.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Symbol */
/* unused harmony export isSymbol */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");



let Symbol = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Symbol;
if (false) {
    /**
     * Throws if the value is not a symbol, used internally within the Shim
     * @param  {any}    value The value to check
     * @return {symbol}       Returns the symbol or throws
     */
    const validateSymbol = function validateSymbol(value) {
        if (!isSymbol(value)) {
            throw new TypeError(value + ' is not a symbol');
        }
        return value;
    };
    const defineProperties = Object.defineProperties;
    const defineProperty = Object.defineProperty;
    const create = Object.create;
    const objPrototype = Object.prototype;
    const globalSymbols = {};
    const getSymbolName = (function () {
        const created = create(null);
        return function (desc) {
            let postfix = 0;
            let name;
            while (created[String(desc) + (postfix || '')]) {
                ++postfix;
            }
            desc += String(postfix || '');
            created[desc] = true;
            name = '@@' + desc;
            // FIXME: Temporary guard until the duplicate execution when testing can be
            // pinned down.
            if (!Object.getOwnPropertyDescriptor(objPrototype, name)) {
                defineProperty(objPrototype, name, {
                    set: function (value) {
                        defineProperty(this, name, getValueDescriptor(value));
                    }
                });
            }
            return name;
        };
    })();
    const InternalSymbol = function Symbol(description) {
        if (this instanceof InternalSymbol) {
            throw new TypeError('TypeError: Symbol is not a constructor');
        }
        return Symbol(description);
    };
    Symbol = global.Symbol = function Symbol(description) {
        if (this instanceof Symbol) {
            throw new TypeError('TypeError: Symbol is not a constructor');
        }
        const sym = Object.create(InternalSymbol.prototype);
        description = description === undefined ? '' : String(description);
        return defineProperties(sym, {
            __description__: getValueDescriptor(description),
            __name__: getValueDescriptor(getSymbolName(description))
        });
    };
    /* Decorate the Symbol function with the appropriate properties */
    defineProperty(Symbol, 'for', getValueDescriptor(function (key) {
        if (globalSymbols[key]) {
            return globalSymbols[key];
        }
        return (globalSymbols[key] = Symbol(String(key)));
    }));
    defineProperties(Symbol, {
        keyFor: getValueDescriptor(function (sym) {
            let key;
            validateSymbol(sym);
            for (key in globalSymbols) {
                if (globalSymbols[key] === sym) {
                    return key;
                }
            }
        }),
        hasInstance: getValueDescriptor(Symbol.for('hasInstance'), false, false),
        isConcatSpreadable: getValueDescriptor(Symbol.for('isConcatSpreadable'), false, false),
        iterator: getValueDescriptor(Symbol.for('iterator'), false, false),
        match: getValueDescriptor(Symbol.for('match'), false, false),
        observable: getValueDescriptor(Symbol.for('observable'), false, false),
        replace: getValueDescriptor(Symbol.for('replace'), false, false),
        search: getValueDescriptor(Symbol.for('search'), false, false),
        species: getValueDescriptor(Symbol.for('species'), false, false),
        split: getValueDescriptor(Symbol.for('split'), false, false),
        toPrimitive: getValueDescriptor(Symbol.for('toPrimitive'), false, false),
        toStringTag: getValueDescriptor(Symbol.for('toStringTag'), false, false),
        unscopables: getValueDescriptor(Symbol.for('unscopables'), false, false)
    });
    /* Decorate the InternalSymbol object */
    defineProperties(InternalSymbol.prototype, {
        constructor: getValueDescriptor(Symbol),
        toString: getValueDescriptor(function () {
            return this.__name__;
        }, false, false)
    });
    /* Decorate the Symbol.prototype */
    defineProperties(Symbol.prototype, {
        toString: getValueDescriptor(function () {
            return 'Symbol (' + validateSymbol(this).__description__ + ')';
        }),
        valueOf: getValueDescriptor(function () {
            return validateSymbol(this);
        })
    });
    defineProperty(Symbol.prototype, Symbol.toPrimitive, getValueDescriptor(function () {
        return validateSymbol(this);
    }));
    defineProperty(Symbol.prototype, Symbol.toStringTag, getValueDescriptor('Symbol', false, false, true));
    defineProperty(InternalSymbol.prototype, Symbol.toPrimitive, getValueDescriptor(Symbol.prototype[Symbol.toPrimitive], false, false, true));
    defineProperty(InternalSymbol.prototype, Symbol.toStringTag, getValueDescriptor(Symbol.prototype[Symbol.toStringTag], false, false, true));
}
/**
 * A custom guard function that determines if an object is a symbol or not
 * @param  {any}       value The value to check to see if it is a symbol or not
 * @return {is symbol}       Returns true if a symbol or not (and narrows the type guard)
 */
function isSymbol(value) {
    return (value && (typeof value === 'symbol' || value['@@toStringTag'] === 'Symbol')) || false;
}
/**
 * Fill any missing well known symbols if the native Symbol is missing them
 */
[
    'hasInstance',
    'isConcatSpreadable',
    'iterator',
    'species',
    'replace',
    'search',
    'split',
    'match',
    'toPrimitive',
    'toStringTag',
    'unscopables',
    'observable'
].forEach((wellKnown) => {
    if (!Symbol[wellKnown]) {
        Object.defineProperty(Symbol, wellKnown, Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["a" /* getValueDescriptor */])(Symbol.for(wellKnown), false, false));
    }
});
/* unused harmony default export */ var _unused_webpack_default_export = (Symbol);


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/WeakMap.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WeakMap; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");




let WeakMap = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].WeakMap;
if (false) {
    const DELETED = {};
    const getUID = function getUID() {
        return Math.floor(Math.random() * 100000000);
    };
    const generateName = (function () {
        let startId = Math.floor(Date.now() % 100000000);
        return function generateName() {
            return '__wm' + getUID() + (startId++ + '__');
        };
    })();
    WeakMap = class WeakMap {
        constructor(iterable) {
            this[Symbol.toStringTag] = 'WeakMap';
            this._name = generateName();
            this._frozenEntries = [];
            if (iterable) {
                if (isArrayLike(iterable)) {
                    for (let i = 0; i < iterable.length; i++) {
                        const item = iterable[i];
                        this.set(item[0], item[1]);
                    }
                }
                else {
                    for (const [key, value] of iterable) {
                        this.set(key, value);
                    }
                }
            }
        }
        _getFrozenEntryIndex(key) {
            for (let i = 0; i < this._frozenEntries.length; i++) {
                if (this._frozenEntries[i].key === key) {
                    return i;
                }
            }
            return -1;
        }
        delete(key) {
            if (key === undefined || key === null) {
                return false;
            }
            const entry = key[this._name];
            if (entry && entry.key === key && entry.value !== DELETED) {
                entry.value = DELETED;
                return true;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                this._frozenEntries.splice(frozenIndex, 1);
                return true;
            }
            return false;
        }
        get(key) {
            if (key === undefined || key === null) {
                return undefined;
            }
            const entry = key[this._name];
            if (entry && entry.key === key && entry.value !== DELETED) {
                return entry.value;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                return this._frozenEntries[frozenIndex].value;
            }
        }
        has(key) {
            if (key === undefined || key === null) {
                return false;
            }
            const entry = key[this._name];
            if (Boolean(entry && entry.key === key && entry.value !== DELETED)) {
                return true;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                return true;
            }
            return false;
        }
        set(key, value) {
            if (!key || (typeof key !== 'object' && typeof key !== 'function')) {
                throw new TypeError('Invalid value used as weak map key');
            }
            let entry = key[this._name];
            if (!entry || entry.key !== key) {
                entry = Object.create(null, {
                    key: { value: key }
                });
                if (Object.isFrozen(key)) {
                    this._frozenEntries.push(entry);
                }
                else {
                    Object.defineProperty(key, this._name, {
                        value: entry
                    });
                }
            }
            entry.value = value;
            return this;
        }
    };
}
/* harmony default export */ __webpack_exports__["b"] = (WeakMap);


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/array.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return from; });
/* unused harmony export of */
/* unused harmony export copyWithin */
/* unused harmony export fill */
/* unused harmony export find */
/* unused harmony export findIndex */
/* unused harmony export includes */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__number__ = __webpack_require__("./node_modules/@dojo/framework/shim/number.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");





let from;
/**
 * Creates a new array from the function parameters.
 *
 * @param arguments Any number of arguments for the array
 * @return An array from the given arguments
 */
let of;
/* ES6 Array instance methods */
/**
 * Copies data internally within an array or array-like object.
 *
 * @param target The target array-like object
 * @param offset The index to start copying values to; if negative, it counts backwards from length
 * @param start The first (inclusive) index to copy; if negative, it counts backwards from length
 * @param end The last (exclusive) index to copy; if negative, it counts backwards from length
 * @return The target
 */
let copyWithin;
/**
 * Fills elements of an array-like object with the specified value.
 *
 * @param target The target to fill
 * @param value The value to fill each element of the target with
 * @param start The first index to fill
 * @param end The (exclusive) index at which to stop filling
 * @return The filled target
 */
let fill;
/**
 * Finds and returns the first instance matching the callback or undefined if one is not found.
 *
 * @param target An array-like object
 * @param callback A function returning if the current value matches a criteria
 * @param thisArg The execution context for the find function
 * @return The first element matching the callback, or undefined if one does not exist
 */
let find;
/**
 * Performs a linear search and returns the first index whose value satisfies the passed callback,
 * or -1 if no values satisfy it.
 *
 * @param target An array-like object
 * @param callback A function returning true if the current value satisfies its criteria
 * @param thisArg The execution context for the find function
 * @return The first index whose value satisfies the passed callback, or -1 if no values satisfy it
 */
let findIndex;
/* ES7 Array instance methods */
/**
 * Determines whether an array includes a given value
 *
 * @param target the target array-like object
 * @param searchElement the item to search for
 * @param fromIndex the starting index to search from
 * @return `true` if the array includes the element, otherwise `false`
 */
let includes;
if (true) {
    from = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.from;
    of = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.of;
    copyWithin = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.copyWithin);
    fill = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.fill);
    find = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.find);
    findIndex = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.findIndex);
}
else {
    // It is only older versions of Safari/iOS that have a bad fill implementation and so aren't in the wild
    // To make things easier, if there is a bad fill implementation, the whole set of functions will be filled
    /**
     * Ensures a non-negative, non-infinite, safe integer.
     *
     * @param length The number to validate
     * @return A proper length
     */
    const toLength = function toLength(length) {
        if (isNaN(length)) {
            return 0;
        }
        length = Number(length);
        if (isFinite(length)) {
            length = Math.floor(length);
        }
        // Ensure a non-negative, real, safe integer
        return Math.min(Math.max(length, 0), MAX_SAFE_INTEGER);
    };
    /**
     * From ES6 7.1.4 ToInteger()
     *
     * @param value A value to convert
     * @return An integer
     */
    const toInteger = function toInteger(value) {
        value = Number(value);
        if (isNaN(value)) {
            return 0;
        }
        if (value === 0 || !isFinite(value)) {
            return value;
        }
        return (value > 0 ? 1 : -1) * Math.floor(Math.abs(value));
    };
    /**
     * Normalizes an offset against a given length, wrapping it if negative.
     *
     * @param value The original offset
     * @param length The total length to normalize against
     * @return If negative, provide a distance from the end (length); otherwise provide a distance from 0
     */
    const normalizeOffset = function normalizeOffset(value, length) {
        return value < 0 ? Math.max(length + value, 0) : Math.min(value, length);
    };
    from = function from(arrayLike, mapFunction, thisArg) {
        if (arrayLike == null) {
            throw new TypeError('from: requires an array-like object');
        }
        if (mapFunction && thisArg) {
            mapFunction = mapFunction.bind(thisArg);
        }
        /* tslint:disable-next-line:variable-name */
        const Constructor = this;
        const length = toLength(arrayLike.length);
        // Support extension
        const array = typeof Constructor === 'function' ? Object(new Constructor(length)) : new Array(length);
        if (!isArrayLike(arrayLike) && !isIterable(arrayLike)) {
            return array;
        }
        // if this is an array and the normalized length is 0, just return an empty array. this prevents a problem
        // with the iteration on IE when using a NaN array length.
        if (isArrayLike(arrayLike)) {
            if (length === 0) {
                return [];
            }
            for (let i = 0; i < arrayLike.length; i++) {
                array[i] = mapFunction ? mapFunction(arrayLike[i], i) : arrayLike[i];
            }
        }
        else {
            let i = 0;
            for (const value of arrayLike) {
                array[i] = mapFunction ? mapFunction(value, i) : value;
                i++;
            }
        }
        if (arrayLike.length !== undefined) {
            array.length = length;
        }
        return array;
    };
    of = function of(...items) {
        return Array.prototype.slice.call(items);
    };
    copyWithin = function copyWithin(target, offset, start, end) {
        if (target == null) {
            throw new TypeError('copyWithin: target must be an array-like object');
        }
        const length = toLength(target.length);
        offset = normalizeOffset(toInteger(offset), length);
        start = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end === undefined ? length : toInteger(end), length);
        let count = Math.min(end - start, length - offset);
        let direction = 1;
        if (offset > start && offset < start + count) {
            direction = -1;
            start += count - 1;
            offset += count - 1;
        }
        while (count > 0) {
            if (start in target) {
                target[offset] = target[start];
            }
            else {
                delete target[offset];
            }
            offset += direction;
            start += direction;
            count--;
        }
        return target;
    };
    fill = function fill(target, value, start, end) {
        const length = toLength(target.length);
        let i = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end === undefined ? length : toInteger(end), length);
        while (i < end) {
            target[i++] = value;
        }
        return target;
    };
    find = function find(target, callback, thisArg) {
        const index = findIndex(target, callback, thisArg);
        return index !== -1 ? target[index] : undefined;
    };
    findIndex = function findIndex(target, callback, thisArg) {
        const length = toLength(target.length);
        if (!callback) {
            throw new TypeError('find: second argument must be a function');
        }
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (let i = 0; i < length; i++) {
            if (callback(target[i], i, target)) {
                return i;
            }
        }
        return -1;
    };
}
if (true) {
    includes = Object(__WEBPACK_IMPORTED_MODULE_4__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Array.prototype.includes);
}
else {
    /**
     * Ensures a non-negative, non-infinite, safe integer.
     *
     * @param length The number to validate
     * @return A proper length
     */
    const toLength = function toLength(length) {
        length = Number(length);
        if (isNaN(length)) {
            return 0;
        }
        if (isFinite(length)) {
            length = Math.floor(length);
        }
        // Ensure a non-negative, real, safe integer
        return Math.min(Math.max(length, 0), MAX_SAFE_INTEGER);
    };
    includes = function includes(target, searchElement, fromIndex = 0) {
        let len = toLength(target.length);
        for (let i = fromIndex; i < len; ++i) {
            const currentElement = target[i];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
        }
        return false;
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/global.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {const globalObject = (function () {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
})();
/* harmony default export */ __webpack_exports__["a"] = (globalObject);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/iterator.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isIterable */
/* unused harmony export isArrayLike */
/* unused harmony export get */
/* unused harmony export forOf */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__string__ = __webpack_require__("./node_modules/@dojo/framework/shim/string.mjs");


const staticDone = { done: true, value: undefined };
/**
 * A class that _shims_ an iterator interface on array like objects.
 */
class ShimIterator {
    constructor(list) {
        this._nextIndex = -1;
        if (isIterable(list)) {
            this._nativeIterator = list[Symbol.iterator]();
        }
        else {
            this._list = list;
        }
    }
    /**
     * Return the next iteration result for the Iterator
     */
    next() {
        if (this._nativeIterator) {
            return this._nativeIterator.next();
        }
        if (!this._list) {
            return staticDone;
        }
        if (++this._nextIndex < this._list.length) {
            return {
                done: false,
                value: this._list[this._nextIndex]
            };
        }
        return staticDone;
    }
    [Symbol.iterator]() {
        return this;
    }
}
/* unused harmony export ShimIterator */

/**
 * A type guard for checking if something has an Iterable interface
 *
 * @param value The value to type guard against
 */
function isIterable(value) {
    return value && typeof value[Symbol.iterator] === 'function';
}
/**
 * A type guard for checking if something is ArrayLike
 *
 * @param value The value to type guard against
 */
function isArrayLike(value) {
    return value && typeof value.length === 'number';
}
/**
 * Returns the iterator for an object
 *
 * @param iterable The iterable object to return the iterator for
 */
function get(iterable) {
    if (isIterable(iterable)) {
        return iterable[Symbol.iterator]();
    }
    else if (isArrayLike(iterable)) {
        return new ShimIterator(iterable);
    }
}
/**
 * Shims the functionality of `for ... of` blocks
 *
 * @param iterable The object the provides an interator interface
 * @param callback The callback which will be called for each item of the iterable
 * @param thisArg Optional scope to pass the callback
 */
function forOf(iterable, callback, thisArg) {
    let broken = false;
    function doBreak() {
        broken = true;
    }
    /* We need to handle iteration of double byte strings properly */
    if (isArrayLike(iterable) && typeof iterable === 'string') {
        const l = iterable.length;
        for (let i = 0; i < l; ++i) {
            let char = iterable[i];
            if (i + 1 < l) {
                const code = char.charCodeAt(0);
                if (code >= __WEBPACK_IMPORTED_MODULE_1__string__["b" /* HIGH_SURROGATE_MIN */] && code <= __WEBPACK_IMPORTED_MODULE_1__string__["a" /* HIGH_SURROGATE_MAX */]) {
                    char += iterable[++i];
                }
            }
            callback.call(thisArg, char, iterable, doBreak);
            if (broken) {
                return;
            }
        }
    }
    else {
        const iterator = get(iterable);
        if (iterator) {
            let result = iterator.next();
            while (!result.done) {
                callback.call(thisArg, result.value, iterable, doBreak);
                if (broken) {
                    return;
                }
                result = iterator.next();
            }
        }
    }
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/number.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isNaN */
/* unused harmony export isFinite */
/* unused harmony export isInteger */
/* unused harmony export isSafeInteger */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");

/**
 * The smallest interval between two representable numbers.
 */
const EPSILON = 1;
/* unused harmony export EPSILON */

/**
 * The maximum safe integer in JavaScript
 */
const MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
/* unused harmony export MAX_SAFE_INTEGER */

/**
 * The minimum safe integer in JavaScript
 */
const MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER;
/* unused harmony export MIN_SAFE_INTEGER */

/**
 * Determines whether the passed value is NaN without coersion.
 *
 * @param value The value to test
 * @return true if the value is NaN, false if it is not
 */
function isNaN(value) {
    return typeof value === 'number' && __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].isNaN(value);
}
/**
 * Determines whether the passed value is a finite number without coersion.
 *
 * @param value The value to test
 * @return true if the value is finite, false if it is not
 */
function isFinite(value) {
    return typeof value === 'number' && __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].isFinite(value);
}
/**
 * Determines whether the passed value is an integer.
 *
 * @param value The value to test
 * @return true if the value is an integer, false if it is not
 */
function isInteger(value) {
    return isFinite(value) && Math.floor(value) === value;
}
/**
 * Determines whether the passed value is an integer that is 'safe,' meaning:
 *   1. it can be expressed as an IEEE-754 double precision number
 *   2. it has a one-to-one mapping to a mathematical integer, meaning its
 *      IEEE-754 representation cannot be the result of rounding any other
 *      integer to fit the IEEE-754 representation
 *
 * @param value The value to test
 * @return true if the value is an integer, false if it is not
 */
function isSafeInteger(value) {
    return isInteger(value) && Math.abs(value) <= MAX_SAFE_INTEGER;
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/object.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export assign */
/* unused harmony export getOwnPropertyDescriptor */
/* unused harmony export getOwnPropertyNames */
/* unused harmony export getOwnPropertySymbols */
/* unused harmony export is */
/* unused harmony export keys */
/* unused harmony export getOwnPropertyDescriptors */
/* unused harmony export entries */
/* unused harmony export values */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");



let assign;
/**
 * Gets the own property descriptor of the specified object.
 * An own property descriptor is one that is defined directly on the object and is not
 * inherited from the object's prototype.
 * @param o Object that contains the property.
 * @param p Name of the property.
 */
let getOwnPropertyDescriptor;
/**
 * Returns the names of the own properties of an object. The own properties of an object are those that are defined directly
 * on that object, and are not inherited from the object's prototype. The properties of an object include both fields (objects) and functions.
 * @param o Object that contains the own properties.
 */
let getOwnPropertyNames;
/**
 * Returns an array of all symbol properties found directly on object o.
 * @param o Object to retrieve the symbols from.
 */
let getOwnPropertySymbols;
/**
 * Returns true if the values are the same value, false otherwise.
 * @param value1 The first value.
 * @param value2 The second value.
 */
let is;
/**
 * Returns the names of the enumerable properties and methods of an object.
 * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
 */
let keys;
/* ES7 Object static methods */
let getOwnPropertyDescriptors;
let entries;
let values;
if (true) {
    const globalObject = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Object;
    assign = globalObject.assign;
    getOwnPropertyDescriptor = globalObject.getOwnPropertyDescriptor;
    getOwnPropertyNames = globalObject.getOwnPropertyNames;
    getOwnPropertySymbols = globalObject.getOwnPropertySymbols;
    is = globalObject.is;
    keys = globalObject.keys;
}
else {
    keys = function symbolAwareKeys(o) {
        return Object.keys(o).filter((key) => !Boolean(key.match(/^@@.+/)));
    };
    assign = function assign(target, ...sources) {
        if (target == null) {
            // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        sources.forEach((nextSource) => {
            if (nextSource) {
                // Skip over if undefined or null
                keys(nextSource).forEach((nextKey) => {
                    to[nextKey] = nextSource[nextKey];
                });
            }
        });
        return to;
    };
    getOwnPropertyDescriptor = function (o, prop) {
        if (isSymbol(prop)) {
            return Object.getOwnPropertyDescriptor(o, prop);
        }
        else {
            return Object.getOwnPropertyDescriptor(o, prop);
        }
    };
    getOwnPropertyNames = function getOwnPropertyNames(o) {
        return Object.getOwnPropertyNames(o).filter((key) => !Boolean(key.match(/^@@.+/)));
    };
    getOwnPropertySymbols = function getOwnPropertySymbols(o) {
        return Object.getOwnPropertyNames(o)
            .filter((key) => Boolean(key.match(/^@@.+/)))
            .map((key) => Symbol.for(key.substring(2)));
    };
    is = function is(value1, value2) {
        if (value1 === value2) {
            return value1 !== 0 || 1 / value1 === 1 / value2; // -0
        }
        return value1 !== value1 && value2 !== value2; // NaN
    };
}
if (true) {
    const globalObject = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Object;
    getOwnPropertyDescriptors = globalObject.getOwnPropertyDescriptors;
    entries = globalObject.entries;
    values = globalObject.values;
}
else {
    getOwnPropertyDescriptors = function getOwnPropertyDescriptors(o) {
        return getOwnPropertyNames(o).reduce((previous, key) => {
            previous[key] = getOwnPropertyDescriptor(o, key);
            return previous;
        }, {});
    };
    entries = function entries(o) {
        return keys(o).map((key) => [key, o[key]]);
    };
    values = function values(o) {
        return keys(o).map((key) => o[key]);
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/string.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export fromCodePoint */
/* unused harmony export raw */
/* unused harmony export codePointAt */
/* unused harmony export endsWith */
/* unused harmony export includes */
/* unused harmony export normalize */
/* unused harmony export repeat */
/* unused harmony export startsWith */
/* unused harmony export padEnd */
/* unused harmony export padStart */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");



/**
 * The minimum location of high surrogates
 */
const HIGH_SURROGATE_MIN = 0xd800;
/* harmony export (immutable) */ __webpack_exports__["b"] = HIGH_SURROGATE_MIN;

/**
 * The maximum location of high surrogates
 */
const HIGH_SURROGATE_MAX = 0xdbff;
/* harmony export (immutable) */ __webpack_exports__["a"] = HIGH_SURROGATE_MAX;

/**
 * The minimum location of low surrogates
 */
const LOW_SURROGATE_MIN = 0xdc00;
/* unused harmony export LOW_SURROGATE_MIN */

/**
 * The maximum location of low surrogates
 */
const LOW_SURROGATE_MAX = 0xdfff;
/* unused harmony export LOW_SURROGATE_MAX */

/* ES6 static methods */
/**
 * Return the String value whose elements are, in order, the elements in the List elements.
 * If length is 0, the empty string is returned.
 * @param codePoints The code points to generate the string
 */
let fromCodePoint;
/**
 * `raw` is intended for use as a tag function of a Tagged Template String. When called
 * as such the first argument will be a well formed template call site object and the rest
 * parameter will contain the substitution values.
 * @param template A well-formed template string call site representation.
 * @param substitutions A set of substitution values.
 */
let raw;
/* ES6 instance methods */
/**
 * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
 * value of the UTF-16 encoded code point starting at the string element at position pos in
 * the String resulting from converting this object to a String.
 * If there is no element at that position, the result is undefined.
 * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
 */
let codePointAt;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * endPosition – length(this). Otherwise returns false.
 */
let endsWith;
/**
 * Returns true if searchString appears as a substring of the result of converting this
 * object to a String, at one or more positions that are
 * greater than or equal to position; otherwise, returns false.
 * @param target The target string
 * @param searchString search string
 * @param position If position is undefined, 0 is assumed, so as to search all of the String.
 */
let includes;
/**
 * Returns the String value result of normalizing the string into the normalization form
 * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
 * @param target The target string
 * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
 * is "NFC"
 */
let normalize;
/**
 * Returns a String value that is made from count copies appended together. If count is 0,
 * T is the empty String is returned.
 * @param count number of copies to append
 */
let repeat;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * position. Otherwise returns false.
 */
let startsWith;
/* ES7 instance methods */
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the end (right) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padEnd;
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the start (left) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padStart;
if (true) {
    fromCodePoint = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.fromCodePoint;
    raw = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.raw;
    codePointAt = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.codePointAt);
    endsWith = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.endsWith);
    includes = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.includes);
    normalize = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.normalize);
    repeat = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.repeat);
    startsWith = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.startsWith);
}
else {
    /**
     * Validates that text is defined, and normalizes position (based on the given default if the input is NaN).
     * Used by startsWith, includes, and endsWith.
     *
     * @return Normalized position.
     */
    const normalizeSubstringArgs = function (name, text, search, position, isEnd = false) {
        if (text == null) {
            throw new TypeError('string.' + name + ' requires a valid string to search against.');
        }
        const length = text.length;
        position = position !== position ? (isEnd ? length : 0) : position;
        return [text, String(search), Math.min(Math.max(position, 0), length)];
    };
    fromCodePoint = function fromCodePoint(...codePoints) {
        // Adapted from https://github.com/mathiasbynens/String.fromCodePoint
        const length = arguments.length;
        if (!length) {
            return '';
        }
        const fromCharCode = String.fromCharCode;
        const MAX_SIZE = 0x4000;
        let codeUnits = [];
        let index = -1;
        let result = '';
        while (++index < length) {
            let codePoint = Number(arguments[index]);
            // Code points must be finite integers within the valid range
            let isValid = isFinite(codePoint) && Math.floor(codePoint) === codePoint && codePoint >= 0 && codePoint <= 0x10ffff;
            if (!isValid) {
                throw RangeError('string.fromCodePoint: Invalid code point ' + codePoint);
            }
            if (codePoint <= 0xffff) {
                // BMP code point
                codeUnits.push(codePoint);
            }
            else {
                // Astral code point; split in surrogate halves
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                codePoint -= 0x10000;
                let highSurrogate = (codePoint >> 10) + HIGH_SURROGATE_MIN;
                let lowSurrogate = (codePoint % 0x400) + LOW_SURROGATE_MIN;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += fromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result;
    };
    raw = function raw(callSite, ...substitutions) {
        let rawStrings = callSite.raw;
        let result = '';
        let numSubstitutions = substitutions.length;
        if (callSite == null || callSite.raw == null) {
            throw new TypeError('string.raw requires a valid callSite object with a raw value');
        }
        for (let i = 0, length = rawStrings.length; i < length; i++) {
            result += rawStrings[i] + (i < numSubstitutions && i < length - 1 ? substitutions[i] : '');
        }
        return result;
    };
    codePointAt = function codePointAt(text, position = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.codePointAt
        if (text == null) {
            throw new TypeError('string.codePointAt requries a valid string.');
        }
        const length = text.length;
        if (position !== position) {
            position = 0;
        }
        if (position < 0 || position >= length) {
            return undefined;
        }
        // Get the first code unit
        const first = text.charCodeAt(position);
        if (first >= HIGH_SURROGATE_MIN && first <= HIGH_SURROGATE_MAX && length > position + 1) {
            // Start of a surrogate pair (high surrogate and there is a next code unit); check for low surrogate
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            const second = text.charCodeAt(position + 1);
            if (second >= LOW_SURROGATE_MIN && second <= LOW_SURROGATE_MAX) {
                return (first - HIGH_SURROGATE_MIN) * 0x400 + second - LOW_SURROGATE_MIN + 0x10000;
            }
        }
        return first;
    };
    endsWith = function endsWith(text, search, endPosition) {
        if (search === '') {
            return true;
        }
        if (typeof endPosition === 'undefined') {
            endPosition = text.length;
        }
        else if (endPosition === null || isNaN(endPosition)) {
            return false;
        }
        [text, search, endPosition] = normalizeSubstringArgs('endsWith', text, search, endPosition, true);
        const start = endPosition - search.length;
        if (start < 0) {
            return false;
        }
        return text.slice(start, endPosition) === search;
    };
    includes = function includes(text, search, position = 0) {
        [text, search, position] = normalizeSubstringArgs('includes', text, search, position);
        return text.indexOf(search, position) !== -1;
    };
    repeat = function repeat(text, count = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.repeat
        if (text == null) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (count !== count) {
            count = 0;
        }
        if (count < 0 || count === Infinity) {
            throw new RangeError('string.repeat requires a non-negative finite count.');
        }
        let result = '';
        while (count) {
            if (count % 2) {
                result += text;
            }
            if (count > 1) {
                text += text;
            }
            count >>= 1;
        }
        return result;
    };
    startsWith = function startsWith(text, search, position = 0) {
        search = String(search);
        [text, search, position] = normalizeSubstringArgs('startsWith', text, search, position);
        const end = position + search.length;
        if (end > text.length) {
            return false;
        }
        return text.slice(position, end) === search;
    };
}
if (true) {
    padEnd = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.padEnd);
    padStart = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.padStart);
}
else {
    padEnd = function padEnd(text, maxLength, fillString = ' ') {
        if (text === null || text === undefined) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (maxLength === Infinity) {
            throw new RangeError('string.padEnd requires a non-negative finite count.');
        }
        if (maxLength === null || maxLength === undefined || maxLength < 0) {
            maxLength = 0;
        }
        let strText = String(text);
        const padding = maxLength - strText.length;
        if (padding > 0) {
            strText +=
                repeat(fillString, Math.floor(padding / fillString.length)) +
                    fillString.slice(0, padding % fillString.length);
        }
        return strText;
    };
    padStart = function padStart(text, maxLength, fillString = ' ') {
        if (text === null || text === undefined) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (maxLength === Infinity) {
            throw new RangeError('string.padStart requires a non-negative finite count.');
        }
        if (maxLength === null || maxLength === undefined || maxLength < 0) {
            maxLength = 0;
        }
        let strText = String(text);
        const padding = maxLength - strText.length;
        if (padding > 0) {
            strText =
                repeat(fillString, Math.floor(padding / fillString.length)) +
                    fillString.slice(0, padding % fillString.length) +
                    strText;
        }
        return strText;
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/has.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__has_has__ = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* unused harmony reexport namespace */


/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0__has_has__["default"]);

/* ECMAScript 6 and 7 Features */
/* Array */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-array', () => {
    return (['from', 'of'].every((key) => key in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array) &&
        ['findIndex', 'find', 'copyWithin'].every((key) => key in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype));
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-array-fill', () => {
    if ('fill' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype) {
        /* Some versions of Safari do not properly implement this */
        return [1].fill(9, Number.POSITIVE_INFINITY)[0] === 1;
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es7-array', () => 'includes' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype, true);
/* Map */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-map', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map === 'function') {
        /*
    IE11 and older versions of Safari are missing critical ES6 Map functionality
    We wrap this in a try/catch because sometimes the Map constructor exists, but does not
    take arguments (iOS 8.4)
     */
        try {
            const map = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map([[0, 1]]);
            return map.has(0) &&
                typeof map.keys === 'function' &&
                true &&
                typeof map.values === 'function' &&
                typeof map.entries === 'function';
        }
        catch (e) {
            /* istanbul ignore next: not testing on iOS at the moment */
            return false;
        }
    }
    return false;
}, true);
/* Math */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-math', () => {
    return [
        'clz32',
        'sign',
        'log10',
        'log2',
        'log1p',
        'expm1',
        'cosh',
        'sinh',
        'tanh',
        'acosh',
        'asinh',
        'atanh',
        'trunc',
        'fround',
        'cbrt',
        'hypot'
    ].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Math[name] === 'function');
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-math-imul', () => {
    if ('imul' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Math) {
        /* Some versions of Safari on ios do not properly implement this */
        return Math.imul(0xffffffff, 5) === -5;
    }
    return false;
}, true);
/* Object */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-object', () => {
    return true &&
        ['assign', 'is', 'getOwnPropertySymbols', 'setPrototypeOf'].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Object[name] === 'function');
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es2017-object', () => {
    return ['values', 'entries', 'getOwnPropertyDescriptors'].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Object[name] === 'function');
}, true);
/* Observable */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es-observable', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Observable !== 'undefined', true);
/* Promise */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-promise', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Promise !== 'undefined' && true, true);
/* Set */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-set', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Set === 'function') {
        /* IE11 and older versions of Safari are missing critical ES6 Set functionality */
        const set = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Set([1]);
        return set.has(1) && 'keys' in set && typeof set.keys === 'function' && true;
    }
    return false;
}, true);
/* String */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-string', () => {
    return ([
        /* static methods */
        'fromCodePoint'
    ].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String[key] === 'function') &&
        [
            /* instance methods */
            'codePointAt',
            'normalize',
            'repeat',
            'startsWith',
            'endsWith',
            'includes'
        ].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.prototype[key] === 'function'));
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-string-raw', () => {
    function getCallSite(callSite, ...substitutions) {
        const result = [...callSite];
        result.raw = callSite.raw;
        return result;
    }
    if ('raw' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String) {
        let b = 1;
        let callSite = getCallSite `a\n${b}`;
        callSite.raw = ['a\\n'];
        const supportsTrunc = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.raw(callSite, 42) === 'a\\n';
        return supportsTrunc;
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es2017-string', () => {
    return ['padStart', 'padEnd'].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.prototype[key] === 'function');
}, true);
/* Symbol */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-symbol', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Symbol !== 'undefined' && typeof Symbol() === 'symbol', true);
/* WeakMap */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-weakmap', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WeakMap !== 'undefined') {
        /* IE11 and older versions of Safari are missing critical ES6 Map functionality */
        const key1 = {};
        const key2 = {};
        const map = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WeakMap([[key1, 1]]);
        Object.freeze(key1);
        return map.get(key1) === 1 && map.set(key2, 2) === map && true;
    }
    return false;
}, true);
/* Miscellaneous features */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('microtasks', () => true || false || true, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('postmessage', () => {
    // If window is undefined, and we have postMessage, it probably means we're in a web worker. Web workers have
    // post message but it doesn't work how we expect it to, so it's best just to pretend it doesn't exist.
    return typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].window !== 'undefined' && typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].postMessage === 'function';
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('raf', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].requestAnimationFrame === 'function', true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('setimmediate', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].setImmediate !== 'undefined', true);
/* DOM Features */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('dom-mutationobserver', () => {
    if (true && Boolean(__WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].MutationObserver || __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WebKitMutationObserver)) {
        // IE11 has an unreliable MutationObserver implementation where setProperty() does not
        // generate a mutation event, observers can crash, and the queue does not drain
        // reliably. The following feature test was adapted from
        // https://gist.github.com/t10ko/4aceb8c71681fdb275e33efe5e576b14
        const example = document.createElement('div');
        /* tslint:disable-next-line:variable-name */
        const HostMutationObserver = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].MutationObserver || __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WebKitMutationObserver;
        const observer = new HostMutationObserver(function () { });
        observer.observe(example, { attributes: true });
        example.style.setProperty('display', 'block');
        return Boolean(observer.takeRecords().length);
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('dom-webanimation', () => true && __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Animation !== undefined && __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].KeyframeEffect !== undefined, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('abort-controller', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].AbortController !== 'undefined');
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('abort-signal', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].AbortSignal !== 'undefined');


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/queue.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export queueMicroTask */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");


function executeTask(item) {
    if (item && item.isActive && item.callback) {
        item.callback();
    }
}
function getQueueHandle(item, destructor) {
    return {
        destroy: function () {
            this.destroy = function () { };
            item.isActive = false;
            item.callback = null;
            if (destructor) {
                destructor();
            }
        }
    };
}
let checkMicroTaskQueue;
let microTasks;
/**
 * Schedules a callback to the macrotask queue.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
const queueTask = (function () {
    let destructor;
    let enqueue;
    // Since the IE implementation of `setImmediate` is not flawless, we will test for `postMessage` first.
    if (true) {
        const queue = [];
        __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].addEventListener('message', function (event) {
            // Confirm that the event was triggered by the current window and by this particular implementation.
            if (event.source === __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */] && event.data === 'dojo-queue-message') {
                event.stopPropagation();
                if (queue.length) {
                    executeTask(queue.shift());
                }
            }
        });
        enqueue = function (item) {
            queue.push(item);
            __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].postMessage('dojo-queue-message', '*');
        };
    }
    else if (false) {
        destructor = global.clearImmediate;
        enqueue = function (item) {
            return setImmediate(executeTask.bind(null, item));
        };
    }
    else {
        destructor = global.clearTimeout;
        enqueue = function (item) {
            return setTimeout(executeTask.bind(null, item), 0);
        };
    }
    function queueTask(callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        const id = enqueue(item);
        return getQueueHandle(item, destructor &&
            function () {
                destructor(id);
            });
    }
    // TODO: Use aspect.before when it is available.
    return true
        ? queueTask
        : function (callback) {
            checkMicroTaskQueue();
            return queueTask(callback);
        };
})();
/* unused harmony export queueTask */

// When no mechanism for registering microtasks is exposed by the environment, microtasks will
// be queued and then executed in a single macrotask before the other macrotasks are executed.
if (false) {
    let isMicroTaskQueued = false;
    microTasks = [];
    checkMicroTaskQueue = function () {
        if (!isMicroTaskQueued) {
            isMicroTaskQueued = true;
            queueTask(function () {
                isMicroTaskQueued = false;
                if (microTasks.length) {
                    let item;
                    while ((item = microTasks.shift())) {
                        executeTask(item);
                    }
                }
            });
        }
    };
}
/**
 * Schedules an animation task with `window.requestAnimationFrame` if it exists, or with `queueTask` otherwise.
 *
 * Since requestAnimationFrame's behavior does not match that expected from `queueTask`, it is not used there.
 * However, at times it makes more sense to delegate to requestAnimationFrame; hence the following method.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
const queueAnimationTask = (function () {
    if (false) {
        return queueTask;
    }
    function queueAnimationTask(callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        const rafId = requestAnimationFrame(executeTask.bind(null, item));
        return getQueueHandle(item, function () {
            cancelAnimationFrame(rafId);
        });
    }
    // TODO: Use aspect.before when it is available.
    return true
        ? queueAnimationTask
        : function (callback) {
            checkMicroTaskQueue();
            return queueAnimationTask(callback);
        };
})();
/* unused harmony export queueAnimationTask */

/**
 * Schedules a callback to the microtask queue.
 *
 * Any callbacks registered with `queueMicroTask` will be executed before the next macrotask. If no native
 * mechanism for scheduling macrotasks is exposed, then any callbacks will be fired before any macrotask
 * registered with `queueTask` or `queueAnimationTask`.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
let queueMicroTask = (function () {
    let enqueue;
    if (false) {
        enqueue = function (item) {
            global.process.nextTick(executeTask.bind(null, item));
        };
    }
    else if (true) {
        enqueue = function (item) {
            __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Promise.resolve(item).then(executeTask);
        };
    }
    else if (true) {
        /* tslint:disable-next-line:variable-name */
        const HostMutationObserver = global.MutationObserver || global.WebKitMutationObserver;
        const node = document.createElement('div');
        const queue = [];
        const observer = new HostMutationObserver(function () {
            while (queue.length > 0) {
                const item = queue.shift();
                if (item && item.isActive && item.callback) {
                    item.callback();
                }
            }
        });
        observer.observe(node, { attributes: true });
        enqueue = function (item) {
            queue.push(item);
            node.setAttribute('queueStatus', '1');
        };
    }
    else {
        enqueue = function (item) {
            checkMicroTaskQueue();
            microTasks.push(item);
        };
    }
    return function (callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        enqueue(item);
        return getQueueHandle(item);
    };
})();


/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/util.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getValueDescriptor;
/* harmony export (immutable) */ __webpack_exports__["b"] = wrapNative;
/**
 * Helper function to generate a value property descriptor
 *
 * @param value        The value the property descriptor should be set to
 * @param enumerable   If the property should be enumberable, defaults to false
 * @param writable     If the property should be writable, defaults to true
 * @param configurable If the property should be configurable, defaults to true
 * @return             The property descriptor object
 */
function getValueDescriptor(value, enumerable = false, writable = true, configurable = true) {
    return {
        value: value,
        enumerable: enumerable,
        writable: writable,
        configurable: configurable
    };
}
function wrapNative(nativeFunction) {
    return function (target, ...args) {
        return nativeFunction.apply(target, args);
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Injector.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");

class Injector extends __WEBPACK_IMPORTED_MODULE_0__core_Evented__["a" /* Evented */] {
    constructor(payload) {
        super();
        this._payload = payload;
    }
    setInvalidator(invalidator) {
        this._invalidator = invalidator;
    }
    get() {
        return this._payload;
    }
    set(payload) {
        this._payload = payload;
        if (this._invalidator) {
            this._invalidator();
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Injector;

/* unused harmony default export */ var _unused_webpack_default_export = (Injector);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/NodeHandler.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export NodeEventType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");


/**
 * Enum to identify the type of event.
 * Listening to 'Projector' will notify when projector is created or updated
 * Listening to 'Widget' will notify when widget root is created or updated
 */
var NodeEventType;
(function (NodeEventType) {
    NodeEventType["Projector"] = "Projector";
    NodeEventType["Widget"] = "Widget";
})(NodeEventType || (NodeEventType = {}));
class NodeHandler extends __WEBPACK_IMPORTED_MODULE_0__core_Evented__["a" /* Evented */] {
    constructor() {
        super(...arguments);
        this._nodeMap = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
    }
    get(key) {
        return this._nodeMap.get(key);
    }
    has(key) {
        return this._nodeMap.has(key);
    }
    add(element, key) {
        this._nodeMap.set(key, element);
        this.emit({ type: key });
    }
    addRoot() {
        this.emit({ type: NodeEventType.Widget });
    }
    addProjector() {
        this.emit({ type: NodeEventType.Projector });
    }
    clear() {
        this._nodeMap.clear();
    }
}
/* unused harmony export NodeHandler */

/* harmony default export */ __webpack_exports__["a"] = (NodeHandler);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Registry.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["d"] = isWidgetBaseConstructor;
/* unused harmony export isWidgetConstructorDefaultExport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Promise__ = __webpack_require__("./node_modules/@dojo/framework/shim/Promise.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");



/**
 * Widget base type
 */
const WIDGET_BASE_TYPE = '__widget_base_type';
/* harmony export (immutable) */ __webpack_exports__["b"] = WIDGET_BASE_TYPE;

/**
 * Checks is the item is a subclass of WidgetBase (or a WidgetBase)
 *
 * @param item the item to check
 * @returns true/false indicating if the item is a WidgetBaseConstructor
 */
function isWidgetBaseConstructor(item) {
    return Boolean(item && item._type === WIDGET_BASE_TYPE);
}
function isWidgetConstructorDefaultExport(item) {
    return Boolean(item &&
        item.hasOwnProperty('__esModule') &&
        item.hasOwnProperty('default') &&
        isWidgetBaseConstructor(item.default));
}
/**
 * The Registry implementation
 */
class Registry extends __WEBPACK_IMPORTED_MODULE_2__core_Evented__["a" /* Evented */] {
    /**
     * Emit loaded event for registry label
     */
    emitLoadedEvent(widgetLabel, item) {
        this.emit({
            type: widgetLabel,
            action: 'loaded',
            item
        });
    }
    define(label, item) {
        if (this._widgetRegistry === undefined) {
            this._widgetRegistry = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
        }
        if (this._widgetRegistry.has(label)) {
            throw new Error(`widget has already been registered for '${label.toString()}'`);
        }
        this._widgetRegistry.set(label, item);
        if (item instanceof __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]) {
            item.then((widgetCtor) => {
                this._widgetRegistry.set(label, widgetCtor);
                this.emitLoadedEvent(label, widgetCtor);
                return widgetCtor;
            }, (error) => {
                throw error;
            });
        }
        else if (isWidgetBaseConstructor(item)) {
            this.emitLoadedEvent(label, item);
        }
    }
    defineInjector(label, injectorFactory) {
        if (this._injectorRegistry === undefined) {
            this._injectorRegistry = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
        }
        if (this._injectorRegistry.has(label)) {
            throw new Error(`injector has already been registered for '${label.toString()}'`);
        }
        const invalidator = new __WEBPACK_IMPORTED_MODULE_2__core_Evented__["a" /* Evented */]();
        const injectorItem = {
            injector: injectorFactory(() => invalidator.emit({ type: 'invalidate' })),
            invalidator
        };
        this._injectorRegistry.set(label, injectorItem);
        this.emitLoadedEvent(label, injectorItem);
    }
    get(label) {
        if (!this._widgetRegistry || !this.has(label)) {
            return null;
        }
        const item = this._widgetRegistry.get(label);
        if (isWidgetBaseConstructor(item)) {
            return item;
        }
        if (item instanceof __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]) {
            return null;
        }
        const promise = item();
        this._widgetRegistry.set(label, promise);
        promise.then((widgetCtor) => {
            if (isWidgetConstructorDefaultExport(widgetCtor)) {
                widgetCtor = widgetCtor.default;
            }
            this._widgetRegistry.set(label, widgetCtor);
            this.emitLoadedEvent(label, widgetCtor);
            return widgetCtor;
        }, (error) => {
            throw error;
        });
        return null;
    }
    getInjector(label) {
        if (!this._injectorRegistry || !this.hasInjector(label)) {
            return null;
        }
        return this._injectorRegistry.get(label);
    }
    has(label) {
        return Boolean(this._widgetRegistry && this._widgetRegistry.has(label));
    }
    hasInjector(label) {
        return Boolean(this._injectorRegistry && this._injectorRegistry.has(label));
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Registry;

/* harmony default export */ __webpack_exports__["c"] = (Registry);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");



class RegistryHandler extends __WEBPACK_IMPORTED_MODULE_1__core_Evented__["a" /* Evented */] {
    constructor() {
        super();
        this._registry = new __WEBPACK_IMPORTED_MODULE_2__Registry__["a" /* Registry */]();
        this._registryWidgetLabelMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["a" /* Map */]();
        this._registryInjectorLabelMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["a" /* Map */]();
        this.own(this._registry);
        const destroy = () => {
            if (this.baseRegistry) {
                this._registryWidgetLabelMap.delete(this.baseRegistry);
                this._registryInjectorLabelMap.delete(this.baseRegistry);
                this.baseRegistry = undefined;
            }
        };
        this.own({ destroy });
    }
    set base(baseRegistry) {
        if (this.baseRegistry) {
            this._registryWidgetLabelMap.delete(this.baseRegistry);
            this._registryInjectorLabelMap.delete(this.baseRegistry);
        }
        this.baseRegistry = baseRegistry;
    }
    define(label, widget) {
        this._registry.define(label, widget);
    }
    defineInjector(label, injector) {
        this._registry.defineInjector(label, injector);
    }
    has(label) {
        return this._registry.has(label) || Boolean(this.baseRegistry && this.baseRegistry.has(label));
    }
    hasInjector(label) {
        return this._registry.hasInjector(label) || Boolean(this.baseRegistry && this.baseRegistry.hasInjector(label));
    }
    get(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'get', this._registryWidgetLabelMap);
    }
    getInjector(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'getInjector', this._registryInjectorLabelMap);
    }
    _get(label, globalPrecedence, getFunctionName, labelMap) {
        const registries = globalPrecedence ? [this.baseRegistry, this._registry] : [this._registry, this.baseRegistry];
        for (let i = 0; i < registries.length; i++) {
            const registry = registries[i];
            if (!registry) {
                continue;
            }
            const item = registry[getFunctionName](label);
            const registeredLabels = labelMap.get(registry) || [];
            if (item) {
                return item;
            }
            else if (registeredLabels.indexOf(label) === -1) {
                const handle = registry.on(label, (event) => {
                    if (event.action === 'loaded' &&
                        this[getFunctionName](label, globalPrecedence) === event.item) {
                        this.emit({ type: 'invalidate' });
                    }
                });
                this.own(handle);
                labelMap.set(registry, [...registeredLabels, label]);
            }
        }
        return null;
    }
}
/* unused harmony export RegistryHandler */

/* harmony default export */ __webpack_exports__["a"] = (RegistryHandler);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RegistryHandler__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__NodeHandler__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/NodeHandler.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");







let lazyWidgetId = 0;
const lazyWidgetIdMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
const decoratorMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
const widgetInstanceMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
/* harmony export (immutable) */ __webpack_exports__["d"] = widgetInstanceMap;

const boundAuto = __WEBPACK_IMPORTED_MODULE_3__diff__["a" /* auto */].bind(null);
const noBind = '__dojo_no_bind';
/* harmony export (immutable) */ __webpack_exports__["c"] = noBind;

function toTextVNode(data) {
    return {
        tag: '',
        properties: {},
        children: undefined,
        text: `${data}`,
        type: __WEBPACK_IMPORTED_MODULE_2__d__["a" /* VNODE */]
    };
}
function isLazyDefine(item) {
    return Boolean(item && item.label);
}
/**
 * Main widget base for all widgets to extend
 */
class WidgetBase {
    /**
     * @constructor
     */
    constructor() {
        /**
         * Indicates if it is the initial set properties cycle
         */
        this._initialProperties = true;
        /**
         * Array of property keys considered changed from the previous set properties
         */
        this._changedPropertyKeys = [];
        this._nodeHandler = new __WEBPACK_IMPORTED_MODULE_5__NodeHandler__["a" /* default */]();
        this._handles = [];
        this._children = [];
        this._decoratorCache = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
        this._properties = {};
        this._boundRenderFunc = this.render.bind(this);
        this._boundInvalidate = this.invalidate.bind(this);
        widgetInstanceMap.set(this, {
            dirty: true,
            onAttach: () => {
                this.onAttach();
            },
            onDetach: () => {
                this.onDetach();
                this.destroy();
            },
            nodeHandler: this._nodeHandler,
            rendering: false,
            inputProperties: {}
        });
        this.own({
            destroy: () => {
                widgetInstanceMap.delete(this);
                this._nodeHandler.clear();
                this._nodeHandler.destroy();
            }
        });
        this._runAfterConstructors();
    }
    meta(MetaType) {
        if (this._metaMap === undefined) {
            this._metaMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
        }
        let cached = this._metaMap.get(MetaType);
        if (!cached) {
            cached = new MetaType({
                invalidate: this._boundInvalidate,
                nodeHandler: this._nodeHandler,
                bind: this
            });
            this.own(cached);
            this._metaMap.set(MetaType, cached);
        }
        return cached;
    }
    onAttach() {
        // Do nothing by default.
    }
    onDetach() {
        // Do nothing by default.
    }
    get properties() {
        return this._properties;
    }
    get changedPropertyKeys() {
        return [...this._changedPropertyKeys];
    }
    __setProperties__(originalProperties, bind) {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.inputProperties = originalProperties;
        }
        const properties = this._runBeforeProperties(originalProperties);
        const registeredDiffPropertyNames = this.getDecorator('registeredDiffProperty');
        const changedPropertyKeys = [];
        const propertyNames = Object.keys(properties);
        if (this._initialProperties === false || registeredDiffPropertyNames.length !== 0) {
            const allProperties = [...propertyNames, ...Object.keys(this._properties)];
            const checkedProperties = [];
            const diffPropertyResults = {};
            let runReactions = false;
            for (let i = 0; i < allProperties.length; i++) {
                const propertyName = allProperties[i];
                if (checkedProperties.indexOf(propertyName) !== -1) {
                    continue;
                }
                checkedProperties.push(propertyName);
                const previousProperty = this._properties[propertyName];
                const newProperty = this._bindFunctionProperty(properties[propertyName], bind);
                if (registeredDiffPropertyNames.indexOf(propertyName) !== -1) {
                    runReactions = true;
                    const diffFunctions = this.getDecorator(`diffProperty:${propertyName}`);
                    for (let i = 0; i < diffFunctions.length; i++) {
                        const result = diffFunctions[i](previousProperty, newProperty);
                        if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                            changedPropertyKeys.push(propertyName);
                        }
                        if (propertyName in properties) {
                            diffPropertyResults[propertyName] = result.value;
                        }
                    }
                }
                else {
                    const result = boundAuto(previousProperty, newProperty);
                    if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                        changedPropertyKeys.push(propertyName);
                    }
                    if (propertyName in properties) {
                        diffPropertyResults[propertyName] = result.value;
                    }
                }
            }
            if (runReactions) {
                const reactionFunctions = this.getDecorator('diffReaction');
                const executedReactions = [];
                reactionFunctions.forEach(({ reaction, propertyName }) => {
                    const propertyChanged = changedPropertyKeys.indexOf(propertyName) !== -1;
                    const reactionRun = executedReactions.indexOf(reaction) !== -1;
                    if (propertyChanged && !reactionRun) {
                        reaction.call(this, this._properties, diffPropertyResults);
                        executedReactions.push(reaction);
                    }
                });
            }
            this._properties = diffPropertyResults;
            this._changedPropertyKeys = changedPropertyKeys;
        }
        else {
            this._initialProperties = false;
            for (let i = 0; i < propertyNames.length; i++) {
                const propertyName = propertyNames[i];
                if (typeof properties[propertyName] === 'function') {
                    properties[propertyName] = this._bindFunctionProperty(properties[propertyName], bind);
                }
                else {
                    changedPropertyKeys.push(propertyName);
                }
            }
            this._changedPropertyKeys = changedPropertyKeys;
            this._properties = Object.assign({}, properties);
        }
        if (this._changedPropertyKeys.length > 0) {
            this.invalidate();
        }
    }
    get children() {
        return this._children;
    }
    __setChildren__(children) {
        if (this._children.length > 0 || children.length > 0) {
            this._children = children;
            this.invalidate();
        }
    }
    _filterAndConvert(nodes) {
        const isArray = Array.isArray(nodes);
        const filteredNodes = Array.isArray(nodes) ? nodes : [nodes];
        const convertedNodes = [];
        for (let i = 0; i < filteredNodes.length; i++) {
            const node = filteredNodes[i];
            if (!node) {
                continue;
            }
            if (typeof node === 'string') {
                convertedNodes.push(toTextVNode(node));
                continue;
            }
            if (Object(__WEBPACK_IMPORTED_MODULE_2__d__["e" /* isVNode */])(node) && node.deferredPropertiesCallback) {
                const properties = node.deferredPropertiesCallback(false);
                node.originalProperties = node.properties;
                node.properties = Object.assign({}, properties, node.properties);
            }
            if (Object(__WEBPACK_IMPORTED_MODULE_2__d__["f" /* isWNode */])(node) && !Object(__WEBPACK_IMPORTED_MODULE_6__Registry__["d" /* isWidgetBaseConstructor */])(node.widgetConstructor)) {
                if (typeof node.widgetConstructor === 'function') {
                    let id = lazyWidgetIdMap.get(node.widgetConstructor);
                    if (!id) {
                        id = `__lazy_widget_${lazyWidgetId++}`;
                        lazyWidgetIdMap.set(node.widgetConstructor, id);
                        this.registry.define(id, node.widgetConstructor);
                    }
                    node.widgetConstructor = id;
                }
                else if (isLazyDefine(node.widgetConstructor)) {
                    const { label, registryItem } = node.widgetConstructor;
                    if (!this.registry.has(label)) {
                        this.registry.define(label, registryItem);
                    }
                    node.widgetConstructor = label;
                }
                node.widgetConstructor =
                    this.registry.get(node.widgetConstructor) || node.widgetConstructor;
            }
            if (!node.bind) {
                node.bind = this;
            }
            convertedNodes.push(node);
            if (node.children && node.children.length) {
                node.children = this._filterAndConvert(node.children);
            }
        }
        return isArray ? convertedNodes : convertedNodes[0];
    }
    __render__() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.dirty = false;
        }
        const render = this._runBeforeRenders();
        const dNode = this._filterAndConvert(this._runAfterRenders(render()));
        this._nodeHandler.clear();
        return dNode;
    }
    invalidate() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData && instanceData.invalidate) {
            instanceData.invalidate();
        }
    }
    render() {
        return Object(__WEBPACK_IMPORTED_MODULE_2__d__["g" /* v */])('div', {}, this.children);
    }
    /**
     * Function to add decorators to WidgetBase
     *
     * @param decoratorKey The key of the decorator
     * @param value The value of the decorator
     */
    addDecorator(decoratorKey, value) {
        value = Array.isArray(value) ? value : [value];
        if (this.hasOwnProperty('constructor')) {
            let decoratorList = decoratorMap.get(this.constructor);
            if (!decoratorList) {
                decoratorList = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
                decoratorMap.set(this.constructor, decoratorList);
            }
            let specificDecoratorList = decoratorList.get(decoratorKey);
            if (!specificDecoratorList) {
                specificDecoratorList = [];
                decoratorList.set(decoratorKey, specificDecoratorList);
            }
            specificDecoratorList.push(...value);
        }
        else {
            const decorators = this.getDecorator(decoratorKey);
            this._decoratorCache.set(decoratorKey, [...decorators, ...value]);
        }
    }
    /**
     * Function to build the list of decorators from the global decorator map.
     *
     * @param decoratorKey  The key of the decorator
     * @return An array of decorator values
     * @private
     */
    _buildDecoratorList(decoratorKey) {
        const allDecorators = [];
        let constructor = this.constructor;
        while (constructor) {
            const instanceMap = decoratorMap.get(constructor);
            if (instanceMap) {
                const decorators = instanceMap.get(decoratorKey);
                if (decorators) {
                    allDecorators.unshift(...decorators);
                }
            }
            constructor = Object.getPrototypeOf(constructor);
        }
        return allDecorators;
    }
    /**
     * Function to retrieve decorator values
     *
     * @param decoratorKey The key of the decorator
     * @returns An array of decorator values
     */
    getDecorator(decoratorKey) {
        let allDecorators = this._decoratorCache.get(decoratorKey);
        if (allDecorators !== undefined) {
            return allDecorators;
        }
        allDecorators = this._buildDecoratorList(decoratorKey);
        this._decoratorCache.set(decoratorKey, allDecorators);
        return allDecorators;
    }
    /**
     * Binds unbound property functions to the specified `bind` property
     *
     * @param properties properties to check for functions
     */
    _bindFunctionProperty(property, bind) {
        if (typeof property === 'function' && !property[noBind] && Object(__WEBPACK_IMPORTED_MODULE_6__Registry__["d" /* isWidgetBaseConstructor */])(property) === false) {
            if (this._bindFunctionPropertyMap === undefined) {
                this._bindFunctionPropertyMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
            }
            const bindInfo = this._bindFunctionPropertyMap.get(property) || {};
            let { boundFunc, scope } = bindInfo;
            if (boundFunc === undefined || scope !== bind) {
                boundFunc = property.bind(bind);
                this._bindFunctionPropertyMap.set(property, { boundFunc, scope: bind });
            }
            return boundFunc;
        }
        return property;
    }
    get registry() {
        if (this._registry === undefined) {
            this._registry = new __WEBPACK_IMPORTED_MODULE_4__RegistryHandler__["a" /* default */]();
            this.own(this._registry);
            this.own(this._registry.on('invalidate', this._boundInvalidate));
        }
        return this._registry;
    }
    _runBeforeProperties(properties) {
        const beforeProperties = this.getDecorator('beforeProperties');
        if (beforeProperties.length > 0) {
            return beforeProperties.reduce((properties, beforePropertiesFunction) => {
                return Object.assign({}, properties, beforePropertiesFunction.call(this, properties));
            }, Object.assign({}, properties));
        }
        return properties;
    }
    /**
     * Run all registered before renders and return the updated render method
     */
    _runBeforeRenders() {
        const beforeRenders = this.getDecorator('beforeRender');
        if (beforeRenders.length > 0) {
            return beforeRenders.reduce((render, beforeRenderFunction) => {
                const updatedRender = beforeRenderFunction.call(this, render, this._properties, this._children);
                if (!updatedRender) {
                    console.warn('Render function not returned from beforeRender, using previous render');
                    return render;
                }
                return updatedRender;
            }, this._boundRenderFunc);
        }
        return this._boundRenderFunc;
    }
    /**
     * Run all registered after renders and return the decorated DNodes
     *
     * @param dNode The DNodes to run through the after renders
     */
    _runAfterRenders(dNode) {
        const afterRenders = this.getDecorator('afterRender');
        if (afterRenders.length > 0) {
            dNode = afterRenders.reduce((dNode, afterRenderFunction) => {
                return afterRenderFunction.call(this, dNode);
            }, dNode);
        }
        if (this._metaMap !== undefined) {
            this._metaMap.forEach((meta) => {
                meta.afterRender();
            });
        }
        return dNode;
    }
    _runAfterConstructors() {
        const afterConstructors = this.getDecorator('afterConstructor');
        if (afterConstructors.length > 0) {
            afterConstructors.forEach((afterConstructor) => afterConstructor.call(this));
        }
    }
    own(handle) {
        this._handles.push(handle);
    }
    destroy() {
        while (this._handles.length > 0) {
            const handle = this._handles.pop();
            if (handle) {
                handle.destroy();
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WidgetBase;

/**
 * static identifier
 */
WidgetBase._type = __WEBPACK_IMPORTED_MODULE_6__Registry__["b" /* WIDGET_BASE_TYPE */];
/* harmony default export */ __webpack_exports__["b"] = (WidgetBase);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let browserSpecificTransitionEndEventName = '';
let browserSpecificAnimationEndEventName = '';
function determineBrowserStyleNames(element) {
    if ('WebkitTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'webkitTransitionEnd';
        browserSpecificAnimationEndEventName = 'webkitAnimationEnd';
    }
    else if ('transition' in element.style || 'MozTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'transitionend';
        browserSpecificAnimationEndEventName = 'animationend';
    }
    else {
        throw new Error('Your browser is not supported');
    }
}
function initialize(element) {
    if (browserSpecificAnimationEndEventName === '') {
        determineBrowserStyleNames(element);
    }
}
function runAndCleanUp(element, startAnimation, finishAnimation) {
    initialize(element);
    let finished = false;
    let transitionEnd = function () {
        if (!finished) {
            finished = true;
            element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
            element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
            finishAnimation();
        }
    };
    startAnimation();
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
}
function exit(node, properties, exitAnimation, removeNode) {
    const activeClass = properties.exitAnimationActive || `${exitAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(exitAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        removeNode();
    });
}
function enter(node, properties, enterAnimation) {
    const activeClass = properties.enterAnimationActive || `${enterAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(enterAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        node.classList.remove(enterAnimation);
        node.classList.remove(activeClass);
    });
}
/* harmony default export */ __webpack_exports__["a"] = ({
    enter,
    exit
});


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/d.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["f"] = isWNode;
/* harmony export (immutable) */ __webpack_exports__["e"] = isVNode;
/* harmony export (immutable) */ __webpack_exports__["d"] = isDomVNode;
/* unused harmony export isElementNode */
/* unused harmony export decorate */
/* harmony export (immutable) */ __webpack_exports__["h"] = w;
/* harmony export (immutable) */ __webpack_exports__["g"] = v;
/* harmony export (immutable) */ __webpack_exports__["c"] = dom;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");

/**
 * The identifier for a WNode type
 */
const WNODE = '__WNODE_TYPE';
/* harmony export (immutable) */ __webpack_exports__["b"] = WNODE;

/**
 * The identifier for a VNode type
 */
const VNODE = '__VNODE_TYPE';
/* harmony export (immutable) */ __webpack_exports__["a"] = VNODE;

/**
 * The identifier for a VNode type created using dom()
 */
const DOMVNODE = '__DOMVNODE_TYPE';
/* unused harmony export DOMVNODE */

/**
 * Helper function that returns true if the `DNode` is a `WNode` using the `type` property
 */
function isWNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === WNODE);
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` using the `type` property
 */
function isVNode(child) {
    return Boolean(child && typeof child !== 'string' && (child.type === VNODE || child.type === DOMVNODE));
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` created with `dom()` using the `type` property
 */
function isDomVNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === DOMVNODE);
}
function isElementNode(value) {
    return !!value.tagName;
}
function decorate(dNodes, optionsOrModifier, predicate) {
    let shallow = false;
    let modifier;
    if (typeof optionsOrModifier === 'function') {
        modifier = optionsOrModifier;
    }
    else {
        modifier = optionsOrModifier.modifier;
        predicate = optionsOrModifier.predicate;
        shallow = optionsOrModifier.shallow || false;
    }
    let nodes = Array.isArray(dNodes) ? [...dNodes] : [dNodes];
    function breaker() {
        nodes = [];
    }
    while (nodes.length) {
        const node = nodes.shift();
        if (node) {
            if (!shallow && (isWNode(node) || isVNode(node)) && node.children) {
                nodes = [...nodes, ...node.children];
            }
            if (!predicate || predicate(node)) {
                modifier(node, breaker);
            }
        }
    }
    return dNodes;
}
function w(widgetConstructorOrNode, properties, children) {
    if (isWNode(widgetConstructorOrNode)) {
        properties = Object.assign({}, widgetConstructorOrNode.properties, properties);
        children = children ? children : widgetConstructorOrNode.children;
        widgetConstructorOrNode = widgetConstructorOrNode.widgetConstructor;
    }
    return {
        children: children || [],
        widgetConstructor: widgetConstructorOrNode,
        properties,
        type: WNODE
    };
}
function v(tag, propertiesOrChildren = {}, children = undefined) {
    let properties = propertiesOrChildren;
    let deferredPropertiesCallback;
    if (Array.isArray(propertiesOrChildren)) {
        children = propertiesOrChildren;
        properties = {};
    }
    if (typeof properties === 'function') {
        deferredPropertiesCallback = properties;
        properties = {};
    }
    if (isVNode(tag)) {
        let { classes = [], styles = {} } = properties, newProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](properties, ["classes", "styles"]);
        let _a = tag.properties, { classes: nodeClasses = [], styles: nodeStyles = {} } = _a, nodeProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](_a, ["classes", "styles"]);
        nodeClasses = Array.isArray(nodeClasses) ? nodeClasses : [nodeClasses];
        classes = Array.isArray(classes) ? classes : [classes];
        styles = Object.assign({}, nodeStyles, styles);
        properties = Object.assign({}, nodeProperties, newProperties, { classes: [...nodeClasses, ...classes], styles });
        children = children ? children : tag.children;
        tag = tag.tag;
    }
    return {
        tag,
        deferredPropertiesCallback,
        originalProperties: {},
        children,
        properties,
        type: VNODE
    };
}
/**
 * Create a VNode for an existing DOM Node.
 */
function dom({ node, attrs = {}, props = {}, on = {}, diffType = 'none', onAttach }, children) {
    return {
        tag: isElementNode(node) ? node.tagName.toLowerCase() : '',
        properties: props,
        attributes: attrs,
        events: on,
        children,
        type: DOMVNODE,
        domNode: node,
        text: isElementNode(node) ? undefined : node.data,
        diffType,
        onAttach
    };
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = alwaysRender;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__beforeProperties__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");


function alwaysRender() {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        Object(__WEBPACK_IMPORTED_MODULE_1__beforeProperties__["a" /* beforeProperties */])(function () {
            this.invalidate();
        })(target);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (alwaysRender);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = beforeProperties;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");

function beforeProperties(method) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        target.addDecorator('beforeProperties', propertyKey ? target[propertyKey] : method);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (beforeProperties);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = customElement;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__registerCustomElement__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/registerCustomElement.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");


/**
 * This Decorator is provided properties that define the behavior of a custom element, and
 * registers that custom element.
 */
function customElement({ tag, properties = [], attributes = [], events = [], childType = __WEBPACK_IMPORTED_MODULE_0__registerCustomElement__["a" /* CustomElementChildType */].DOJO, registryFactory = () => new __WEBPACK_IMPORTED_MODULE_1__Registry__["c" /* default */]() }) {
    return function (target) {
        target.prototype.__customElementDescriptor = {
            tagName: tag,
            attributes,
            properties,
            events,
            childType,
            registryFactory
        };
    };
}
/* unused harmony default export */ var _unused_webpack_default_export = (customElement);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = diffProperty;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");


/**
 * Decorator that can be used to register a function as a specific property diff
 *
 * @param propertyName  The name of the property of which the diff function is applied
 * @param diffType      The diff type, default is DiffType.AUTO.
 * @param diffFunction  A diff function to run if diffType if DiffType.CUSTOM
 */
function diffProperty(propertyName, diffFunction = __WEBPACK_IMPORTED_MODULE_1__diff__["a" /* auto */], reactionFunction) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        target.addDecorator(`diffProperty:${propertyName}`, diffFunction.bind(null));
        target.addDecorator('registeredDiffProperty', propertyName);
        if (reactionFunction || propertyKey) {
            target.addDecorator('diffReaction', {
                propertyName,
                reaction: propertyKey ? target[propertyKey] : reactionFunction
            });
        }
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (diffProperty);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = handleDecorator;
/**
 * Generic decorator handler to take care of whether or not the decorator was called at the class level
 * or the method level.
 *
 * @param handler
 */
function handleDecorator(handler) {
    return function (target, propertyKey, descriptor) {
        if (typeof target === 'function') {
            handler(target.prototype, undefined);
        }
        else {
            handler(target, propertyKey);
        }
    };
}
/* unused harmony default export */ var _unused_webpack_default_export = (handleDecorator);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/inject.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = inject;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__beforeProperties__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");



/**
 * Map of instances against registered injectors.
 */
const registeredInjectorsMap = new __WEBPACK_IMPORTED_MODULE_0__shim_WeakMap__["b" /* default */]();
/**
 * Decorator retrieves an injector from an available registry using the name and
 * calls the `getProperties` function with the payload from the injector
 * and current properties with the the injected properties returned.
 *
 * @param InjectConfig the inject configuration
 */
function inject({ name, getProperties }) {
    return Object(__WEBPACK_IMPORTED_MODULE_1__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        Object(__WEBPACK_IMPORTED_MODULE_2__beforeProperties__["a" /* beforeProperties */])(function (properties) {
            const injectorItem = this.registry.getInjector(name);
            if (injectorItem) {
                const { injector, invalidator } = injectorItem;
                const registeredInjectors = registeredInjectorsMap.get(this) || [];
                if (registeredInjectors.length === 0) {
                    registeredInjectorsMap.set(this, registeredInjectors);
                }
                if (registeredInjectors.indexOf(injectorItem) === -1) {
                    this.own(invalidator.on('invalidate', () => {
                        this.invalidate();
                    }));
                    registeredInjectors.push(injectorItem);
                }
                return getProperties(injector(), properties);
            }
        })(target);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (inject);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/diff.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export always */
/* unused harmony export ignore */
/* unused harmony export reference */
/* harmony export (immutable) */ __webpack_exports__["b"] = shallow;
/* harmony export (immutable) */ __webpack_exports__["a"] = auto;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");

function isObjectOrArray(value) {
    return Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value);
}
function always(previousProperty, newProperty) {
    return {
        changed: true,
        value: newProperty
    };
}
function ignore(previousProperty, newProperty) {
    return {
        changed: false,
        value: newProperty
    };
}
function reference(previousProperty, newProperty) {
    return {
        changed: previousProperty !== newProperty,
        value: newProperty
    };
}
function shallow(previousProperty, newProperty) {
    let changed = false;
    const validOldProperty = previousProperty && isObjectOrArray(previousProperty);
    const validNewProperty = newProperty && isObjectOrArray(newProperty);
    if (!validOldProperty || !validNewProperty) {
        return {
            changed: true,
            value: newProperty
        };
    }
    const previousKeys = Object.keys(previousProperty);
    const newKeys = Object.keys(newProperty);
    if (previousKeys.length !== newKeys.length) {
        changed = true;
    }
    else {
        changed = newKeys.some((key) => {
            return newProperty[key] !== previousProperty[key];
        });
    }
    return {
        changed,
        value: newProperty
    };
}
function auto(previousProperty, newProperty) {
    let result;
    if (typeof newProperty === 'function') {
        if (newProperty._type === __WEBPACK_IMPORTED_MODULE_0__Registry__["b" /* WIDGET_BASE_TYPE */]) {
            result = reference(previousProperty, newProperty);
        }
        else {
            result = ignore(previousProperty, newProperty);
        }
    }
    else if (isObjectOrArray(newProperty)) {
        result = shallow(previousProperty, newProperty);
    }
    else {
        result = reference(previousProperty, newProperty);
    }
    return result;
}


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Base.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Destroyable__ = __webpack_require__("./node_modules/@dojo/framework/core/Destroyable.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Set__ = __webpack_require__("./node_modules/@dojo/framework/shim/Set.mjs");


class Base extends __WEBPACK_IMPORTED_MODULE_0__core_Destroyable__["a" /* Destroyable */] {
    constructor(properties) {
        super();
        this._requestedNodeKeys = new __WEBPACK_IMPORTED_MODULE_1__shim_Set__["a" /* default */]();
        this._invalidate = properties.invalidate;
        this.nodeHandler = properties.nodeHandler;
        if (properties.bind) {
            this._bind = properties.bind;
        }
    }
    has(key) {
        return this.nodeHandler.has(key);
    }
    getNode(key) {
        const stringKey = `${key}`;
        const node = this.nodeHandler.get(stringKey);
        if (!node && !this._requestedNodeKeys.has(stringKey)) {
            const handle = this.nodeHandler.on(stringKey, () => {
                handle.destroy();
                this._requestedNodeKeys.delete(stringKey);
                this.invalidate();
            });
            this.own(handle);
            this._requestedNodeKeys.add(stringKey);
        }
        return node;
    }
    invalidate() {
        this._invalidate();
    }
    afterRender() {
        // Do nothing by default.
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Base;

/* unused harmony default export */ var _unused_webpack_default_export = (Base);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Focus.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Base__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");


const defaultResults = {
    active: false,
    containsFocus: false
};
class Focus extends __WEBPACK_IMPORTED_MODULE_0__Base__["a" /* Base */] {
    constructor() {
        super(...arguments);
        this._onFocusChange = () => {
            this._activeElement = __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.activeElement;
            this.invalidate();
        };
    }
    get(key) {
        const node = this.getNode(key);
        if (!node) {
            return Object.assign({}, defaultResults);
        }
        if (!this._activeElement) {
            this._activeElement = __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.activeElement;
            this._createListener();
        }
        return {
            active: node === this._activeElement,
            containsFocus: !!this._activeElement && node.contains(this._activeElement)
        };
    }
    set(key) {
        const node = this.getNode(key);
        node && node.focus();
    }
    _createListener() {
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.addEventListener('focusin', this._onFocusChange);
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.addEventListener('focusout', this._onFocusChange);
        this.own({
            destroy: () => {
                this._removeListener();
            }
        });
    }
    _removeListener() {
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.removeEventListener('focusin', this._onFocusChange);
        __WEBPACK_IMPORTED_MODULE_1__shim_global__["a" /* default */].document.removeEventListener('focusout', this._onFocusChange);
    }
}
/* unused harmony export Focus */

/* harmony default export */ __webpack_exports__["a"] = (Focus);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Base__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");



class WebAnimations extends __WEBPACK_IMPORTED_MODULE_0__Base__["a" /* Base */] {
    constructor() {
        super(...arguments);
        this._animationMap = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
    }
    _createPlayer(node, properties) {
        const { effects, timing = {} } = properties;
        const fx = typeof effects === 'function' ? effects() : effects;
        const keyframeEffect = new __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].KeyframeEffect(node, fx, timing);
        return new __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].Animation(keyframeEffect, __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].document.timeline);
    }
    _updatePlayer(player, controls) {
        const { play, reverse, cancel, finish, onFinish, onCancel, playbackRate, startTime, currentTime } = controls;
        if (playbackRate !== undefined) {
            player.playbackRate = playbackRate;
        }
        if (reverse) {
            player.reverse();
        }
        if (cancel) {
            player.cancel();
        }
        if (finish) {
            player.finish();
        }
        if (startTime !== undefined) {
            player.startTime = startTime;
        }
        if (currentTime !== undefined) {
            player.currentTime = currentTime;
        }
        if (play) {
            player.play();
        }
        else {
            player.pause();
        }
        if (onFinish) {
            player.onfinish = onFinish.bind(this._bind);
        }
        if (onCancel) {
            player.oncancel = onCancel.bind(this._bind);
        }
    }
    animate(key, animateProperties) {
        const node = this.getNode(key);
        if (node) {
            if (!Array.isArray(animateProperties)) {
                animateProperties = [animateProperties];
            }
            animateProperties.forEach((properties) => {
                properties = typeof properties === 'function' ? properties() : properties;
                if (properties) {
                    const { id } = properties;
                    if (!this._animationMap.has(id)) {
                        this._animationMap.set(id, {
                            player: this._createPlayer(node, properties),
                            used: true
                        });
                    }
                    const animation = this._animationMap.get(id);
                    const { controls = {} } = properties;
                    if (animation) {
                        this._updatePlayer(animation.player, controls);
                        this._animationMap.set(id, {
                            player: animation.player,
                            used: true
                        });
                    }
                }
            });
        }
    }
    get(id) {
        const animation = this._animationMap.get(id);
        if (animation) {
            const { currentTime, playState, playbackRate, startTime } = animation.player;
            return {
                currentTime: currentTime || 0,
                playState,
                playbackRate,
                startTime: startTime || 0
            };
        }
    }
    afterRender() {
        this._animationMap.forEach((animation, key) => {
            if (!animation.used) {
                animation.player.cancel();
                this._animationMap.delete(key);
            }
            animation.used = false;
        });
    }
}
/* unused harmony export WebAnimations */

/* harmony default export */ __webpack_exports__["a"] = (WebAnimations);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = FocusMixin;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__decorators_diffProperty__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");


function diffFocus(previousProperty, newProperty) {
    const result = newProperty && newProperty();
    return {
        changed: result,
        value: newProperty
    };
}
function FocusMixin(Base) {
    class Focus extends Base {
        constructor() {
            super(...arguments);
            this._currentToken = 0;
            this._previousToken = 0;
            this.shouldFocus = () => {
                const result = this._currentToken !== this._previousToken;
                this._previousToken = this._currentToken;
                return result;
            };
        }
        isFocusedReaction() {
            this._currentToken++;
        }
        focus() {
            this._currentToken++;
            this.invalidate();
        }
    }
    __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_1__decorators_diffProperty__["a" /* diffProperty */])('focus', diffFocus)
    ], Focus.prototype, "isFocusedReaction", null);
    return Focus;
}
/* unused harmony default export */ var _unused_webpack_default_export = (FocusMixin);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["d"] = theme;
/* harmony export (immutable) */ __webpack_exports__["c"] = registerThemeInjector;
/* harmony export (immutable) */ __webpack_exports__["a"] = ThemedMixin;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Injector__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Injector.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__decorators_inject__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/inject.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__decorators_handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");






const THEME_KEY = ' _key';
const INJECTED_THEME_KEY = '__theme_injector';
/* unused harmony export INJECTED_THEME_KEY */

/**
 * Decorator for base css classes
 */
function theme(theme) {
    return Object(__WEBPACK_IMPORTED_MODULE_3__decorators_handleDecorator__["a" /* handleDecorator */])((target) => {
        target.addDecorator('baseThemeClasses', theme);
    });
}
/**
 * Creates a reverse lookup for the classes passed in via the `theme` function.
 *
 * @param classes The baseClasses object
 * @requires
 */
function createThemeClassesLookup(classes) {
    return classes.reduce((currentClassNames, baseClass) => {
        Object.keys(baseClass).forEach((key) => {
            currentClassNames[baseClass[key]] = key;
        });
        return currentClassNames;
    }, {});
}
/**
 * Convenience function that is given a theme and an optional registry, the theme
 * injector is defined against the registry, returning the theme.
 *
 * @param theme the theme to set
 * @param themeRegistry registry to define the theme injector against. Defaults
 * to the global registry
 *
 * @returns the theme injector used to set the theme
 */
function registerThemeInjector(theme, themeRegistry) {
    const themeInjector = new __WEBPACK_IMPORTED_MODULE_1__Injector__["a" /* Injector */](theme);
    themeRegistry.defineInjector(INJECTED_THEME_KEY, (invalidator) => {
        themeInjector.setInvalidator(invalidator);
        return () => themeInjector.get();
    });
    return themeInjector;
}
/**
 * Function that returns a class decorated with with Themed functionality
 */
function ThemedMixin(Base) {
    let Themed = class Themed extends Base {
        constructor() {
            super(...arguments);
            /**
             * Registered base theme keys
             */
            this._registeredBaseThemeKeys = [];
            /**
             * Indicates if classes meta data need to be calculated.
             */
            this._recalculateClasses = true;
            /**
             * Loaded theme
             */
            this._theme = {};
        }
        theme(classes) {
            if (this._recalculateClasses) {
                this._recalculateThemeClasses();
            }
            if (Array.isArray(classes)) {
                return classes.map((className) => this._getThemeClass(className));
            }
            return this._getThemeClass(classes);
        }
        /**
         * Function fired when `theme` or `extraClasses` are changed.
         */
        onPropertiesChanged() {
            this._recalculateClasses = true;
        }
        _getThemeClass(className) {
            if (className === undefined || className === null) {
                return className;
            }
            const extraClasses = this.properties.extraClasses || {};
            const themeClassName = this._baseThemeClassesReverseLookup[className];
            let resultClassNames = [];
            if (!themeClassName) {
                console.warn(`Class name: '${className}' not found in theme`);
                return null;
            }
            if (extraClasses[themeClassName]) {
                resultClassNames.push(extraClasses[themeClassName]);
            }
            if (this._theme[themeClassName]) {
                resultClassNames.push(this._theme[themeClassName]);
            }
            else {
                resultClassNames.push(this._registeredBaseTheme[themeClassName]);
            }
            return resultClassNames.join(' ');
        }
        _recalculateThemeClasses() {
            const { theme = {} } = this.properties;
            if (!this._registeredBaseTheme) {
                const baseThemes = this.getDecorator('baseThemeClasses');
                if (baseThemes.length === 0) {
                    console.warn('A base theme has not been provided to this widget. Please use the @theme decorator to add a theme.');
                }
                this._registeredBaseTheme = baseThemes.reduce((finalBaseTheme, baseTheme) => {
                    const _a = THEME_KEY, key = baseTheme[_a], classes = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](baseTheme, [typeof _a === "symbol" ? _a : _a + ""]);
                    this._registeredBaseThemeKeys.push(key);
                    return Object.assign({}, finalBaseTheme, classes);
                }, {});
                this._baseThemeClassesReverseLookup = createThemeClassesLookup(baseThemes);
            }
            this._theme = this._registeredBaseThemeKeys.reduce((baseTheme, themeKey) => {
                return Object.assign({}, baseTheme, theme[themeKey]);
            }, {});
            this._recalculateClasses = false;
        }
    };
    __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('theme', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */]),
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('extraClasses', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */])
    ], Themed.prototype, "onPropertiesChanged", null);
    Themed = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_2__decorators_inject__["a" /* inject */])({
            name: INJECTED_THEME_KEY,
            getProperties: (theme, properties) => {
                if (!properties.theme) {
                    return { theme };
                }
                return {};
            }
        })
    ], Themed);
    return Themed;
}
/* harmony default export */ __webpack_exports__["b"] = (ThemedMixin);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/registerCustomElement.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CustomElementChildType; });
/* unused harmony export DomToWidgetWrapper */
/* unused harmony export create */
/* unused harmony export register */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vdom__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/vdom.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shim_array__ = __webpack_require__("./node_modules/@dojo/framework/shim/array.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__decorators_alwaysRender__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs");








var CustomElementChildType;
(function (CustomElementChildType) {
    CustomElementChildType["DOJO"] = "DOJO";
    CustomElementChildType["NODE"] = "NODE";
    CustomElementChildType["TEXT"] = "TEXT";
})(CustomElementChildType || (CustomElementChildType = {}));
function DomToWidgetWrapper(domNode) {
    let DomToWidgetWrapper = class DomToWidgetWrapper extends __WEBPACK_IMPORTED_MODULE_1__WidgetBase__["a" /* WidgetBase */] {
        render() {
            const properties = Object.keys(this.properties).reduce((props, key) => {
                const value = this.properties[key];
                if (key.indexOf('on') === 0) {
                    key = `__${key}`;
                }
                props[key] = value;
                return props;
            }, {});
            return Object(__WEBPACK_IMPORTED_MODULE_4__d__["c" /* dom */])({ node: domNode, props: properties, diffType: 'dom' });
        }
        static get domNode() {
            return domNode;
        }
    };
    DomToWidgetWrapper = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_7__decorators_alwaysRender__["a" /* alwaysRender */])()
    ], DomToWidgetWrapper);
    return DomToWidgetWrapper;
}
function create(descriptor, WidgetConstructor) {
    const { attributes, childType, registryFactory } = descriptor;
    const attributeMap = {};
    attributes.forEach((propertyName) => {
        const attributeName = propertyName.toLowerCase();
        attributeMap[attributeName] = propertyName;
    });
    return class extends HTMLElement {
        constructor() {
            super(...arguments);
            this._properties = {};
            this._children = [];
            this._eventProperties = {};
            this._initialised = false;
        }
        connectedCallback() {
            if (this._initialised) {
                return;
            }
            const domProperties = {};
            const { attributes, properties, events } = descriptor;
            this._properties = Object.assign({}, this._properties, this._attributesToProperties(attributes));
            [...attributes, ...properties].forEach((propertyName) => {
                const value = this[propertyName];
                const filteredPropertyName = propertyName.replace(/^on/, '__');
                if (value !== undefined) {
                    this._properties[propertyName] = value;
                }
                if (filteredPropertyName !== propertyName) {
                    domProperties[filteredPropertyName] = {
                        get: () => this._getProperty(propertyName),
                        set: (value) => this._setProperty(propertyName, value)
                    };
                }
                domProperties[propertyName] = {
                    get: () => this._getProperty(propertyName),
                    set: (value) => this._setProperty(propertyName, value)
                };
            });
            events.forEach((propertyName) => {
                const eventName = propertyName.replace(/^on/, '').toLowerCase();
                const filteredPropertyName = propertyName.replace(/^on/, '__on');
                domProperties[filteredPropertyName] = {
                    get: () => this._getEventProperty(propertyName),
                    set: (value) => this._setEventProperty(propertyName, value)
                };
                this._eventProperties[propertyName] = undefined;
                this._properties[propertyName] = (...args) => {
                    const eventCallback = this._getEventProperty(propertyName);
                    if (typeof eventCallback === 'function') {
                        eventCallback(...args);
                    }
                    this.dispatchEvent(new CustomEvent(eventName, {
                        bubbles: false,
                        detail: args
                    }));
                };
            });
            Object.defineProperties(this, domProperties);
            const children = childType === CustomElementChildType.TEXT ? this.childNodes : this.children;
            Object(__WEBPACK_IMPORTED_MODULE_3__shim_array__["a" /* from */])(children).forEach((childNode) => {
                if (childType === CustomElementChildType.DOJO) {
                    childNode.addEventListener('dojo-ce-render', () => this._render());
                    childNode.addEventListener('dojo-ce-connected', () => this._render());
                    this._children.push(DomToWidgetWrapper(childNode));
                }
                else {
                    this._children.push(Object(__WEBPACK_IMPORTED_MODULE_4__d__["c" /* dom */])({ node: childNode, diffType: 'dom' }));
                }
            });
            this.addEventListener('dojo-ce-connected', (e) => this._childConnected(e));
            const widgetProperties = this._properties;
            const renderChildren = () => this.__children__();
            const Wrapper = class extends __WEBPACK_IMPORTED_MODULE_1__WidgetBase__["a" /* WidgetBase */] {
                render() {
                    return Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(WidgetConstructor, widgetProperties, renderChildren());
                }
            };
            const registry = registryFactory();
            const themeContext = Object(__WEBPACK_IMPORTED_MODULE_6__mixins_Themed__["c" /* registerThemeInjector */])(this._getTheme(), registry);
            __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].addEventListener('dojo-theme-set', () => themeContext.set(this._getTheme()));
            const r = Object(__WEBPACK_IMPORTED_MODULE_2__vdom__["b" /* renderer */])(() => Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(Wrapper, {}));
            this._renderer = r;
            r.mount({ domNode: this, merge: false, registry });
            this._initialised = true;
            this.dispatchEvent(new CustomEvent('dojo-ce-connected', {
                bubbles: true,
                detail: this
            }));
        }
        _getTheme() {
            if (__WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */] && __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce && __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce.theme) {
                return __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce.themes[__WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].dojoce.theme];
            }
        }
        _childConnected(e) {
            const node = e.detail;
            if (node.parentNode === this) {
                const exists = this._children.some((child) => child.domNode === node);
                if (!exists) {
                    node.addEventListener('dojo-ce-render', () => this._render());
                    this._children.push(DomToWidgetWrapper(node));
                    this._render();
                }
            }
        }
        _render() {
            if (this._renderer) {
                this._renderer.invalidate();
                this.dispatchEvent(new CustomEvent('dojo-ce-render', {
                    bubbles: false,
                    detail: this
                }));
            }
        }
        __properties__() {
            return Object.assign({}, this._properties, this._eventProperties);
        }
        __children__() {
            if (childType === CustomElementChildType.DOJO) {
                return this._children.filter((Child) => Child.domNode.isWidget).map((Child) => {
                    const { domNode } = Child;
                    return Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(Child, Object.assign({}, domNode.__properties__()), [...domNode.__children__()]);
                });
            }
            else {
                return this._children;
            }
        }
        attributeChangedCallback(name, oldValue, value) {
            const propertyName = attributeMap[name];
            this._setProperty(propertyName, value);
        }
        _setEventProperty(propertyName, value) {
            this._eventProperties[propertyName] = value;
        }
        _getEventProperty(propertyName) {
            return this._eventProperties[propertyName];
        }
        _setProperty(propertyName, value) {
            if (typeof value === 'function') {
                value[__WEBPACK_IMPORTED_MODULE_1__WidgetBase__["c" /* noBind */]] = true;
            }
            this._properties[propertyName] = value;
            this._render();
        }
        _getProperty(propertyName) {
            return this._properties[propertyName];
        }
        _attributesToProperties(attributes) {
            return attributes.reduce((properties, propertyName) => {
                const attributeName = propertyName.toLowerCase();
                const value = this.getAttribute(attributeName);
                if (value !== null) {
                    properties[propertyName] = value;
                }
                return properties;
            }, {});
        }
        static get observedAttributes() {
            return Object.keys(attributeMap);
        }
        get isWidget() {
            return true;
        }
    };
}
function register(WidgetConstructor) {
    const descriptor = WidgetConstructor.prototype && WidgetConstructor.prototype.__customElementDescriptor;
    if (!descriptor) {
        throw new Error('Cannot get descriptor for Custom Element, have you added the @customElement decorator to your Widget?');
    }
    __WEBPACK_IMPORTED_MODULE_5__shim_global__["a" /* default */].customElements.define(descriptor.tagName, create(descriptor, WidgetConstructor));
}
/* unused harmony default export */ var _unused_webpack_default_export = (register);


/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/vdom.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = renderer;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__has_has__ = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__animations_cssTransitions__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");







const EMPTY_ARRAY = [];
const nodeOperations = ['focus', 'blur', 'scrollIntoView', 'click'];
const NAMESPACE_W3 = 'http://www.w3.org/';
const NAMESPACE_SVG = NAMESPACE_W3 + '2000/svg';
const NAMESPACE_XLINK = NAMESPACE_W3 + '1999/xlink';
function isWNodeWrapper(child) {
    return child && Object(__WEBPACK_IMPORTED_MODULE_4__d__["f" /* isWNode */])(child.node);
}
function isVNodeWrapper(child) {
    return !!child && Object(__WEBPACK_IMPORTED_MODULE_4__d__["e" /* isVNode */])(child.node);
}
function isAttachApplication(value) {
    return !!value.type;
}
function updateAttributes(domNode, previousAttributes, attributes, namespace) {
    const attrNames = Object.keys(attributes);
    const attrCount = attrNames.length;
    for (let i = 0; i < attrCount; i++) {
        const attrName = attrNames[i];
        const attrValue = attributes[attrName];
        const previousAttrValue = previousAttributes[attrName];
        if (attrValue !== previousAttrValue) {
            updateAttribute(domNode, attrName, attrValue, namespace);
        }
    }
}
function buildPreviousProperties(domNode, current, next) {
    const { node: { diffType, properties, attributes } } = current;
    if (!diffType || diffType === 'vdom') {
        return {
            properties: current.node.properties,
            attributes: current.node.attributes,
            events: current.node.events
        };
    }
    else if (diffType === 'none') {
        return { properties: {}, attributes: current.node.attributes ? {} : undefined, events: current.node.events };
    }
    let newProperties = {
        properties: {}
    };
    if (attributes) {
        newProperties.attributes = {};
        newProperties.events = current.node.events;
        Object.keys(properties).forEach((propName) => {
            newProperties.properties[propName] = domNode[propName];
        });
        Object.keys(attributes).forEach((attrName) => {
            newProperties.attributes[attrName] = domNode.getAttribute(attrName);
        });
        return newProperties;
    }
    newProperties.properties = Object.keys(properties).reduce((props, property) => {
        props[property] = domNode.getAttribute(property) || domNode[property];
        return props;
    }, {});
    return newProperties;
}
function checkDistinguishable(wrappers, index, parentWNodeWrapper) {
    const wrapperToCheck = wrappers[index];
    if (isVNodeWrapper(wrapperToCheck) && !wrapperToCheck.node.tag) {
        return;
    }
    const { key } = wrapperToCheck.node.properties;
    let parentName = 'unknown';
    if (parentWNodeWrapper) {
        const { node: { widgetConstructor } } = parentWNodeWrapper;
        parentName = widgetConstructor.name || 'unknown';
    }
    if (key === undefined || key === null) {
        for (let i = 0; i < wrappers.length; i++) {
            if (i !== index) {
                const wrapper = wrappers[i];
                if (same(wrapper, wrapperToCheck)) {
                    let nodeIdentifier;
                    if (isWNodeWrapper(wrapper)) {
                        nodeIdentifier = wrapper.node.widgetConstructor.name || 'unknown';
                    }
                    else {
                        nodeIdentifier = wrapper.node.tag;
                    }
                    console.warn(`A widget (${parentName}) has had a child added or removed, but they were not able to uniquely identified. It is recommended to provide a unique 'key' property when using the same widget or element (${nodeIdentifier}) multiple times as siblings`);
                    break;
                }
            }
        }
    }
}
function same(dnode1, dnode2) {
    if (isVNodeWrapper(dnode1) && isVNodeWrapper(dnode2)) {
        if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isDomVNode */])(dnode1.node) && Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isDomVNode */])(dnode2.node)) {
            if (dnode1.node.domNode !== dnode2.node.domNode) {
                return false;
            }
        }
        if (dnode1.node.tag !== dnode2.node.tag) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    else if (isWNodeWrapper(dnode1) && isWNodeWrapper(dnode2)) {
        if (dnode1.instance === undefined && typeof dnode2.node.widgetConstructor === 'string') {
            return false;
        }
        if (dnode1.node.widgetConstructor !== dnode2.node.widgetConstructor) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    return false;
}
function findIndexOfChild(children, sameAs, start) {
    for (let i = start; i < children.length; i++) {
        if (same(children[i], sameAs)) {
            return i;
        }
    }
    return -1;
}
function createClassPropValue(classes = []) {
    classes = Array.isArray(classes) ? classes : [classes];
    return classes.join(' ').trim();
}
function updateAttribute(domNode, attrName, attrValue, namespace) {
    if (namespace === NAMESPACE_SVG && attrName === 'href' && attrValue) {
        domNode.setAttributeNS(NAMESPACE_XLINK, attrName, attrValue);
    }
    else if ((attrName === 'role' && attrValue === '') || attrValue === undefined) {
        domNode.removeAttribute(attrName);
    }
    else {
        domNode.setAttribute(attrName, attrValue);
    }
}
function runEnterAnimation(next, transitions) {
    const { domNode, node: { properties }, node: { properties: { enterAnimation } } } = next;
    if (enterAnimation) {
        if (typeof enterAnimation === 'function') {
            return enterAnimation(domNode, properties);
        }
        transitions.enter(domNode, properties, enterAnimation);
    }
}
function runExitAnimation(current, transitions) {
    const { domNode, node: { properties }, node: { properties: { exitAnimation } } } = current;
    const removeDomNode = () => {
        domNode && domNode.parentNode && domNode.parentNode.removeChild(domNode);
        current.domNode = undefined;
    };
    if (typeof exitAnimation === 'function') {
        return exitAnimation(domNode, removeDomNode, properties);
    }
    transitions.exit(domNode, properties, exitAnimation, removeDomNode);
}
function arrayFrom(arr) {
    return Array.prototype.slice.call(arr);
}
function wrapVNodes(nodes) {
    return class extends __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["a" /* WidgetBase */] {
        render() {
            return nodes;
        }
    };
}
function renderer(renderer) {
    let _mountOptions = {
        sync: false,
        merge: true,
        transition: __WEBPACK_IMPORTED_MODULE_3__animations_cssTransitions__["a" /* default */],
        domNode: __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.body,
        registry: null
    };
    let _invalidationQueue = [];
    let _processQueue = [];
    let _applicationQueue = [];
    let _eventMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _instanceToWrapperMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _parentWrapperMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _wrapperSiblingMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _renderScheduled;
    let _afterRenderCallbacks = [];
    let _deferredRenderCallbacks = [];
    let parentInvalidate;
    function nodeOperation(propName, propValue, previousValue, domNode) {
        let result = propValue && !previousValue;
        if (typeof propValue === 'function') {
            result = propValue();
        }
        if (result === true) {
            _afterRenderCallbacks.push(() => {
                domNode[propName]();
            });
        }
    }
    function updateEvent(domNode, eventName, currentValue, bind, previousValue) {
        if (previousValue) {
            const previousEvent = _eventMap.get(previousValue);
            domNode.removeEventListener(eventName, previousEvent);
        }
        let callback = currentValue.bind(bind);
        if (eventName === 'input') {
            callback = function (evt) {
                currentValue.call(this, evt);
                evt.target['oninput-value'] = evt.target.value;
            }.bind(bind);
        }
        domNode.addEventListener(eventName, callback);
        _eventMap.set(currentValue, callback);
    }
    function removeOrphanedEvents(domNode, previousProperties, properties, onlyEvents = false) {
        Object.keys(previousProperties).forEach((propName) => {
            const isEvent = propName.substr(0, 2) === 'on' || onlyEvents;
            const eventName = onlyEvents ? propName : propName.substr(2);
            if (isEvent && !properties[propName]) {
                const eventCallback = _eventMap.get(previousProperties[propName]);
                if (eventCallback) {
                    domNode.removeEventListener(eventName, eventCallback);
                }
            }
        });
    }
    function renderedToWrapper(rendered, parent, currentParent) {
        const wrappedRendered = [];
        const hasParentWNode = isWNodeWrapper(parent);
        const currentParentLength = isVNodeWrapper(currentParent) && (currentParent.childrenWrappers || []).length > 1;
        const requiresInsertBefore = ((parent.requiresInsertBefore || parent.hasPreviousSiblings !== false) && hasParentWNode) ||
            currentParentLength;
        let previousItem;
        for (let i = 0; i < rendered.length; i++) {
            const renderedItem = rendered[i];
            const wrapper = {
                node: renderedItem,
                depth: parent.depth + 1,
                requiresInsertBefore,
                hasParentWNode,
                namespace: parent.namespace
            };
            if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["e" /* isVNode */])(renderedItem) && renderedItem.properties.exitAnimation) {
                parent.hasAnimations = true;
                let nextParent = _parentWrapperMap.get(parent);
                while (nextParent) {
                    if (nextParent.hasAnimations) {
                        break;
                    }
                    nextParent.hasAnimations = true;
                    nextParent = _parentWrapperMap.get(nextParent);
                }
            }
            _parentWrapperMap.set(wrapper, parent);
            if (previousItem) {
                _wrapperSiblingMap.set(previousItem, wrapper);
            }
            wrappedRendered.push(wrapper);
            previousItem = wrapper;
        }
        return wrappedRendered;
    }
    function findParentWNodeWrapper(currentNode) {
        let parentWNodeWrapper;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentWNodeWrapper && parentWrapper) {
            if (!parentWNodeWrapper && isWNodeWrapper(parentWrapper)) {
                parentWNodeWrapper = parentWrapper;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentWNodeWrapper;
    }
    function findParentDomNode(currentNode) {
        let parentDomNode;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentDomNode && parentWrapper) {
            if (!parentDomNode && isVNodeWrapper(parentWrapper) && parentWrapper.domNode) {
                parentDomNode = parentWrapper.domNode;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentDomNode;
    }
    function runDeferredProperties(next) {
        if (next.node.deferredPropertiesCallback) {
            const properties = next.node.properties;
            next.node.properties = Object.assign({}, next.node.deferredPropertiesCallback(true), next.node.originalProperties);
            _afterRenderCallbacks.push(() => {
                processProperties(next, { properties });
            });
        }
    }
    function findInsertBefore(next) {
        let insertBefore = null;
        let searchNode = next;
        while (!insertBefore) {
            const nextSibling = _wrapperSiblingMap.get(searchNode);
            if (nextSibling) {
                if (isVNodeWrapper(nextSibling)) {
                    if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                        insertBefore = nextSibling.domNode;
                        break;
                    }
                    searchNode = nextSibling;
                    continue;
                }
                if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                    insertBefore = nextSibling.domNode;
                    break;
                }
                searchNode = nextSibling;
                continue;
            }
            searchNode = _parentWrapperMap.get(searchNode);
            if (!searchNode || isVNodeWrapper(searchNode)) {
                break;
            }
        }
        return insertBefore;
    }
    function setProperties(domNode, currentProperties = {}, nextWrapper, includesEventsAndAttributes = true) {
        const propNames = Object.keys(nextWrapper.node.properties);
        const propCount = propNames.length;
        if (propNames.indexOf('classes') === -1 && currentProperties.classes) {
            domNode.removeAttribute('class');
        }
        includesEventsAndAttributes && removeOrphanedEvents(domNode, currentProperties, nextWrapper.node.properties);
        for (let i = 0; i < propCount; i++) {
            const propName = propNames[i];
            let propValue = nextWrapper.node.properties[propName];
            const previousValue = currentProperties[propName];
            if (propName === 'classes') {
                const previousClassString = createClassPropValue(previousValue);
                let currentClassString = createClassPropValue(propValue);
                if (previousClassString !== currentClassString) {
                    if (currentClassString) {
                        if (nextWrapper.merged) {
                            const domClasses = (domNode.getAttribute('class') || '').split(' ');
                            for (let i = 0; i < domClasses.length; i++) {
                                if (currentClassString.indexOf(domClasses[i]) === -1) {
                                    currentClassString = `${domClasses[i]} ${currentClassString}`;
                                }
                            }
                        }
                        domNode.setAttribute('class', currentClassString);
                    }
                    else {
                        domNode.removeAttribute('class');
                    }
                }
            }
            else if (nodeOperations.indexOf(propName) !== -1) {
                nodeOperation(propName, propValue, previousValue, domNode);
            }
            else if (propName === 'styles') {
                const styleNames = Object.keys(propValue);
                const styleCount = styleNames.length;
                for (let j = 0; j < styleCount; j++) {
                    const styleName = styleNames[j];
                    const newStyleValue = propValue[styleName];
                    const oldStyleValue = previousValue && previousValue[styleName];
                    if (newStyleValue === oldStyleValue) {
                        continue;
                    }
                    domNode.style[styleName] = newStyleValue || '';
                }
            }
            else {
                if (!propValue && typeof previousValue === 'string') {
                    propValue = '';
                }
                if (propName === 'value') {
                    const domValue = domNode[propName];
                    if (domValue !== propValue &&
                        (domNode['oninput-value']
                            ? domValue === domNode['oninput-value']
                            : propValue !== previousValue)) {
                        domNode[propName] = propValue;
                        domNode['oninput-value'] = undefined;
                    }
                }
                else if (propName !== 'key' && propValue !== previousValue) {
                    const type = typeof propValue;
                    if (type === 'function' && propName.lastIndexOf('on', 0) === 0 && includesEventsAndAttributes) {
                        updateEvent(domNode, propName.substr(2), propValue, nextWrapper.node.bind, previousValue);
                    }
                    else if (type === 'string' && propName !== 'innerHTML' && includesEventsAndAttributes) {
                        updateAttribute(domNode, propName, propValue, nextWrapper.namespace);
                    }
                    else if (propName === 'scrollLeft' || propName === 'scrollTop') {
                        if (domNode[propName] !== propValue) {
                            domNode[propName] = propValue;
                        }
                    }
                    else {
                        domNode[propName] = propValue;
                    }
                }
            }
        }
    }
    function runDeferredRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _deferredRenderCallbacks;
        _deferredRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestAnimationFrame(run);
            }
        }
    }
    function runAfterRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _afterRenderCallbacks;
        _afterRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                if (__WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestIdleCallback) {
                    __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestIdleCallback(run);
                }
                else {
                    setTimeout(run);
                }
            }
        }
    }
    function processProperties(next, previousProperties) {
        if (next.node.attributes && next.node.events) {
            updateAttributes(next.domNode, previousProperties.attributes || {}, next.node.attributes, next.namespace);
            setProperties(next.domNode, previousProperties.properties, next, false);
            const events = next.node.events || {};
            if (previousProperties.events) {
                removeOrphanedEvents(next.domNode, previousProperties.events || {}, next.node.events, true);
            }
            previousProperties.events = previousProperties.events || {};
            Object.keys(events).forEach((event) => {
                updateEvent(next.domNode, event, events[event], next.node.bind, previousProperties.events[event]);
            });
        }
        else {
            setProperties(next.domNode, previousProperties.properties, next);
        }
    }
    function mount(mountOptions = {}) {
        _mountOptions = Object.assign({}, _mountOptions, mountOptions);
        const { domNode } = _mountOptions;
        let renderResult = renderer();
        if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["e" /* isVNode */])(renderResult)) {
            renderResult = Object(__WEBPACK_IMPORTED_MODULE_4__d__["h" /* w */])(wrapVNodes(renderResult), {});
        }
        const nextWrapper = {
            node: renderResult,
            depth: 1
        };
        _parentWrapperMap.set(nextWrapper, { depth: 0, domNode, node: Object(__WEBPACK_IMPORTED_MODULE_4__d__["g" /* v */])('fake') });
        _processQueue.push({
            current: [],
            next: [nextWrapper],
            meta: { mergeNodes: arrayFrom(domNode.childNodes) }
        });
        _runProcessQueue();
        _mountOptions.merge = false;
        _runDomInstructionQueue();
        _runCallbacks();
    }
    function invalidate() {
        parentInvalidate && parentInvalidate();
    }
    function _schedule() {
        const { sync } = _mountOptions;
        if (sync) {
            _runInvalidationQueue();
        }
        else if (!_renderScheduled) {
            _renderScheduled = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestAnimationFrame(() => {
                _runInvalidationQueue();
            });
        }
    }
    function _runInvalidationQueue() {
        _renderScheduled = undefined;
        const invalidationQueue = [..._invalidationQueue];
        const previouslyRendered = [];
        _invalidationQueue = [];
        invalidationQueue.sort((a, b) => b.depth - a.depth);
        let item;
        while ((item = invalidationQueue.pop())) {
            let { instance } = item;
            if (previouslyRendered.indexOf(instance) === -1 && _instanceToWrapperMap.has(instance)) {
                previouslyRendered.push(instance);
                const current = _instanceToWrapperMap.get(instance);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
                const parent = _parentWrapperMap.get(current);
                const sibling = _wrapperSiblingMap.get(current);
                const { constructor, children } = instance;
                const next = {
                    node: {
                        type: __WEBPACK_IMPORTED_MODULE_4__d__["b" /* WNODE */],
                        widgetConstructor: constructor,
                        properties: instanceData.inputProperties,
                        children: children,
                        bind: current.node.bind
                    },
                    instance,
                    depth: current.depth
                };
                parent && _parentWrapperMap.set(next, parent);
                sibling && _wrapperSiblingMap.set(next, sibling);
                const { item } = _updateWidget({ current, next });
                if (item) {
                    _processQueue.push(item);
                    instance && _instanceToWrapperMap.set(instance, next);
                    _runProcessQueue();
                }
            }
        }
        _runDomInstructionQueue();
        _runCallbacks();
    }
    function _runProcessQueue() {
        let item;
        while ((item = _processQueue.pop())) {
            if (isAttachApplication(item)) {
                _applicationQueue.push(item);
            }
            else {
                const { current, next, meta } = item;
                _process(current || EMPTY_ARRAY, next || EMPTY_ARRAY, meta);
            }
        }
    }
    function _runDomInstructionQueue() {
        _applicationQueue.reverse();
        let item;
        while ((item = _applicationQueue.pop())) {
            if (item.type === 'create') {
                const { parentDomNode, next, next: { domNode, merged, requiresInsertBefore, node: { properties } } } = item;
                processProperties(next, { properties: {} });
                runDeferredProperties(next);
                if (!merged) {
                    let insertBefore;
                    if (requiresInsertBefore) {
                        insertBefore = findInsertBefore(next);
                    }
                    parentDomNode.insertBefore(domNode, insertBefore);
                    if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isDomVNode */])(next.node) && next.node.onAttach) {
                        next.node.onAttach();
                    }
                }
                runEnterAnimation(next, _mountOptions.transition);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(next.node.bind);
                if (properties.key != null && instanceData) {
                    instanceData.nodeHandler.add(domNode, `${properties.key}`);
                }
                item.next.inserted = true;
            }
            else if (item.type === 'update') {
                const { next, next: { domNode, node }, current } = item;
                const parent = _parentWrapperMap.get(next);
                if (parent && isWNodeWrapper(parent) && parent.instance) {
                    const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(parent.instance);
                    instanceData && instanceData.nodeHandler.addRoot();
                }
                const previousProperties = buildPreviousProperties(domNode, current, next);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(next.node.bind);
                processProperties(next, previousProperties);
                runDeferredProperties(next);
                if (instanceData && node.properties.key != null) {
                    instanceData.nodeHandler.add(next.domNode, `${node.properties.key}`);
                }
            }
            else if (item.type === 'delete') {
                const { current } = item;
                if (current.node.properties.exitAnimation) {
                    runExitAnimation(current, _mountOptions.transition);
                }
                else {
                    current.domNode.parentNode.removeChild(current.domNode);
                    current.domNode = undefined;
                }
            }
            else if (item.type === 'attach') {
                const { instance, attached } = item;
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
                instanceData.nodeHandler.addRoot();
                attached && instanceData.onAttach();
            }
            else if (item.type === 'detach') {
                if (item.current.instance) {
                    const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(item.current.instance);
                    instanceData && instanceData.onDetach();
                }
                item.current.domNode = undefined;
                item.current.node.bind = undefined;
                item.current.instance = undefined;
            }
        }
    }
    function _runCallbacks() {
        runAfterRenderCallbacks();
        runDeferredRenderCallbacks();
    }
    function _processMergeNodes(next, mergeNodes) {
        const { merge } = _mountOptions;
        if (merge && mergeNodes.length) {
            if (isVNodeWrapper(next)) {
                let { node: { tag } } = next;
                for (let i = 0; i < mergeNodes.length; i++) {
                    const domElement = mergeNodes[i];
                    if (tag.toUpperCase() === (domElement.tagName || '')) {
                        mergeNodes.splice(i, 1);
                        next.domNode = domElement;
                        break;
                    }
                }
            }
            else {
                next.mergeNodes = mergeNodes;
            }
        }
    }
    function registerDistinguishableCallback(childNodes, index) {
        _afterRenderCallbacks.push(() => {
            const parentWNodeWrapper = findParentWNodeWrapper(childNodes[index]);
            checkDistinguishable(childNodes, index, parentWNodeWrapper);
        });
    }
    function _process(current, next, meta = {}) {
        let { mergeNodes = [], oldIndex = 0, newIndex = 0 } = meta;
        const currentLength = current.length;
        const nextLength = next.length;
        const hasPreviousSiblings = currentLength > 1 || (currentLength > 0 && currentLength < nextLength);
        const instructions = [];
        if (newIndex < nextLength) {
            let currentWrapper = oldIndex < currentLength ? current[oldIndex] : undefined;
            const nextWrapper = next[newIndex];
            nextWrapper.hasPreviousSiblings = hasPreviousSiblings;
            _processMergeNodes(nextWrapper, mergeNodes);
            if (currentWrapper && same(currentWrapper, nextWrapper)) {
                oldIndex++;
                newIndex++;
                if (isVNodeWrapper(currentWrapper) && isVNodeWrapper(nextWrapper)) {
                    nextWrapper.inserted = currentWrapper.inserted;
                }
                instructions.push({ current: currentWrapper, next: nextWrapper });
            }
            else if (!currentWrapper || findIndexOfChild(current, nextWrapper, oldIndex + 1) === -1) {
                true && current.length && registerDistinguishableCallback(next, newIndex);
                instructions.push({ current: undefined, next: nextWrapper });
                newIndex++;
            }
            else if (findIndexOfChild(next, currentWrapper, newIndex + 1) === -1) {
                true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                oldIndex++;
            }
            else {
                true && registerDistinguishableCallback(next, newIndex);
                true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                instructions.push({ current: undefined, next: nextWrapper });
                oldIndex++;
                newIndex++;
            }
        }
        if (newIndex < nextLength) {
            _processQueue.push({ current, next, meta: { mergeNodes, oldIndex, newIndex } });
        }
        if (currentLength > oldIndex && newIndex >= nextLength) {
            for (let i = oldIndex; i < currentLength; i++) {
                true && registerDistinguishableCallback(current, i);
                instructions.push({ current: current[i], next: undefined });
            }
        }
        for (let i = 0; i < instructions.length; i++) {
            const { item, dom, widget } = _processOne(instructions[i]);
            widget && _processQueue.push(widget);
            item && _processQueue.push(item);
            dom && _applicationQueue.push(dom);
        }
    }
    function _processOne({ current, next }) {
        if (current !== next) {
            if (!current && next) {
                if (isVNodeWrapper(next)) {
                    return _createDom({ next });
                }
                else {
                    return _createWidget({ next });
                }
            }
            else if (current && next) {
                if (isVNodeWrapper(current) && isVNodeWrapper(next)) {
                    return _updateDom({ current, next });
                }
                else if (isWNodeWrapper(current) && isWNodeWrapper(next)) {
                    return _updateWidget({ current, next });
                }
            }
            else if (current && !next) {
                if (isVNodeWrapper(current)) {
                    return _removeDom({ current });
                }
                else if (isWNodeWrapper(current)) {
                    return _removeWidget({ current });
                }
            }
        }
        return {};
    }
    function _createWidget({ next }) {
        let { node: { widgetConstructor } } = next;
        let { registry } = _mountOptions;
        if (!Object(__WEBPACK_IMPORTED_MODULE_5__Registry__["d" /* isWidgetBaseConstructor */])(widgetConstructor)) {
            return {};
        }
        const instance = new widgetConstructor();
        if (registry) {
            instance.registry.base = registry;
        }
        const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
        instanceData.invalidate = () => {
            instanceData.dirty = true;
            if (!instanceData.rendering && _instanceToWrapperMap.has(instance)) {
                _invalidationQueue.push({ instance, depth: next.depth });
                _schedule();
            }
        };
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        next.instance = instance;
        let rendered = instance.__render__();
        instanceData.rendering = false;
        if (rendered) {
            rendered = Array.isArray(rendered) ? rendered : [rendered];
            next.childrenWrappers = renderedToWrapper(rendered, next, null);
        }
        if (next.instance) {
            _instanceToWrapperMap.set(next.instance, next);
            if (!parentInvalidate) {
                parentInvalidate = next.instance.invalidate.bind(next.instance);
            }
        }
        return {
            item: { next: next.childrenWrappers, meta: { mergeNodes: next.mergeNodes } },
            widget: { type: 'attach', instance, attached: true }
        };
    }
    function _updateWidget({ current, next }) {
        current = (current.instance && _instanceToWrapperMap.get(current.instance)) || current;
        const { instance, domNode, hasAnimations } = current;
        if (!instance) {
            return [];
        }
        const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(instance);
        next.instance = instance;
        next.domNode = domNode;
        next.hasAnimations = hasAnimations;
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        _instanceToWrapperMap.set(next.instance, next);
        if (instanceData.dirty) {
            let rendered = instance.__render__();
            instanceData.rendering = false;
            if (rendered) {
                rendered = Array.isArray(rendered) ? rendered : [rendered];
                next.childrenWrappers = renderedToWrapper(rendered, next, current);
            }
            return {
                item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
                widget: { type: 'attach', instance, attached: false }
            };
        }
        instanceData.rendering = false;
        next.childrenWrappers = current.childrenWrappers;
        return {
            widget: { type: 'attach', instance, attached: false }
        };
    }
    function _removeWidget({ current }) {
        current = current.instance ? _instanceToWrapperMap.get(current.instance) : current;
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        _instanceToWrapperMap.delete(current.instance);
        return {
            item: { current: current.childrenWrappers, meta: {} },
            widget: { type: 'detach', current }
        };
    }
    function _createDom({ next }) {
        let mergeNodes = [];
        if (!next.domNode) {
            if (next.node.domNode) {
                next.domNode = next.node.domNode;
            }
            else {
                if (next.node.tag === 'svg') {
                    next.namespace = NAMESPACE_SVG;
                }
                if (next.node.tag) {
                    if (next.namespace) {
                        next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createElementNS(next.namespace, next.node.tag);
                    }
                    else {
                        next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createElement(next.node.tag);
                    }
                }
                else if (next.node.text != null) {
                    next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createTextNode(next.node.text);
                }
            }
        }
        else {
            next.merged = true;
        }
        if (next.domNode) {
            if (_mountOptions.merge) {
                mergeNodes = arrayFrom(next.domNode.childNodes);
            }
            if (next.node.children) {
                next.childrenWrappers = renderedToWrapper(next.node.children, next, null);
            }
        }
        const parentWNodeWrapper = findParentWNodeWrapper(next);
        if (parentWNodeWrapper && !parentWNodeWrapper.domNode) {
            parentWNodeWrapper.domNode = next.domNode;
        }
        const dom = {
            next: next,
            parentDomNode: findParentDomNode(next),
            type: 'create'
        };
        if (next.childrenWrappers) {
            return {
                item: { current: [], next: next.childrenWrappers, meta: { mergeNodes } },
                dom
            };
        }
        return { dom };
    }
    function _updateDom({ current, next }) {
        const parentDomNode = findParentDomNode(current);
        next.domNode = current.domNode;
        next.namespace = current.namespace;
        if (next.node.text && next.node.text !== current.node.text) {
            const updatedTextNode = parentDomNode.ownerDocument.createTextNode(next.node.text);
            parentDomNode.replaceChild(updatedTextNode, next.domNode);
            next.domNode = updatedTextNode;
        }
        else if (next.node.children) {
            const children = renderedToWrapper(next.node.children, next, current);
            next.childrenWrappers = children;
        }
        return {
            item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
            dom: { type: 'update', next, current }
        };
    }
    function _removeDom({ current }) {
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        current.node.bind = undefined;
        if (current.hasAnimations) {
            return {
                item: { current: current.childrenWrappers, meta: {} },
                dom: { type: 'delete', current }
            };
        }
        if (current.childrenWrappers) {
            _afterRenderCallbacks.push(() => {
                let wrappers = current.childrenWrappers || [];
                let wrapper;
                while ((wrapper = wrappers.pop())) {
                    if (wrapper.childrenWrappers) {
                        wrappers.push(...wrapper.childrenWrappers);
                        wrapper.childrenWrappers = undefined;
                    }
                    if (isWNodeWrapper(wrapper)) {
                        if (wrapper.instance) {
                            _instanceToWrapperMap.delete(wrapper.instance);
                            const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["d" /* widgetInstanceMap */].get(wrapper.instance);
                            instanceData && instanceData.onDetach();
                        }
                        wrapper.instance = undefined;
                    }
                    _wrapperSiblingMap.delete(wrapper);
                    _parentWrapperMap.delete(wrapper);
                    wrapper.domNode = undefined;
                    wrapper.node.bind = undefined;
                }
            });
        }
        return {
            dom: { type: 'delete', current }
        };
    }
    return {
        mount,
        invalidate
    };
}
/* harmony default export */ __webpack_exports__["a"] = (renderer);


/***/ }),

/***/ "./node_modules/@dojo/themes/dojo/index.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./node_modules/@dojo/webpack-contrib/build-time-render/hasBuildTimeRender.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable-next-line
var has = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
if (!has.exists('build-time-render')) {
    has.add('build-time-render', false, false);
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/base.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/base","_1AeWeApr":"base-m___1AeWeApr__X16v2","_1_qANqXi":"base-m___1_qANqXi__1vxZm","_3QddUiBU":"base-m___3QddUiBU__Io4f-"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/styles/base.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/common/styles/base.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"visuallyHidden":"_1AeWeApr","focusable":"_1_qANqXi","hidden":"_3QddUiBU"," _key":"@dojo/widgets/base"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/common/util.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Keys */
/* harmony export (immutable) */ __webpack_exports__["a"] = formatAriaProperties;
var Keys;
(function (Keys) {
    Keys[Keys["Down"] = 40] = "Down";
    Keys[Keys["End"] = 35] = "End";
    Keys[Keys["Enter"] = 13] = "Enter";
    Keys[Keys["Escape"] = 27] = "Escape";
    Keys[Keys["Home"] = 36] = "Home";
    Keys[Keys["Left"] = 37] = "Left";
    Keys[Keys["PageDown"] = 34] = "PageDown";
    Keys[Keys["PageUp"] = 33] = "PageUp";
    Keys[Keys["Right"] = 39] = "Right";
    Keys[Keys["Space"] = 32] = "Space";
    Keys[Keys["Tab"] = 9] = "Tab";
    Keys[Keys["Up"] = 38] = "Up";
})(Keys || (Keys = {}));
function formatAriaProperties(aria) {
    const formattedAria = Object.keys(aria).reduce((a, key) => {
        a[`aria-${key.toLowerCase()}`] = aria[key];
        return a;
    }, {});
    return formattedAria;
}


/***/ }),

/***/ "./node_modules/@dojo/widgets/label/index.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export LabelBase */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__common_util__ = __webpack_require__("./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/theme/label.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/common/styles/base.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__dojo_framework_widget_core_decorators_customElement__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");








const ThemedBase = Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]);
/* unused harmony export ThemedBase */

let LabelBase = class LabelBase extends ThemedBase {
    getRootClasses() {
        const { disabled, focused, invalid, readOnly, required, secondary } = this.properties;
        return [
            __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["root"],
            disabled ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["disabled"] : null,
            focused ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["focused"] : null,
            invalid === true ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["invalid"] : null,
            invalid === false ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["valid"] : null,
            readOnly ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["readonly"] : null,
            required ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["required"] : null,
            secondary ? __WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__["secondary"] : null
        ];
    }
    render() {
        const { aria = {}, forId, hidden } = this.properties;
        return Object(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_d__["g" /* v */])('label', Object.assign({}, Object(__WEBPACK_IMPORTED_MODULE_4__common_util__["a" /* formatAriaProperties */])(aria), { classes: [
                ...this.theme(this.getRootClasses()),
                hidden ? __WEBPACK_IMPORTED_MODULE_6__common_styles_base_m_css__["visuallyHidden"] : null
            ], for: forId }), this.children);
    }
};
LabelBase = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["d" /* theme */])(__WEBPACK_IMPORTED_MODULE_5__theme_label_m_css__),
    Object(__WEBPACK_IMPORTED_MODULE_7__dojo_framework_widget_core_decorators_customElement__["a" /* customElement */])({
        tag: 'dojo-label',
        properties: ['theme', 'aria', 'extraClasses', 'disabled', 'focused', 'readOnly', 'required', 'invalid', 'hidden', 'secondary'],
        attributes: [],
        events: []
    })
], LabelBase);

class Label extends LabelBase {
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Label;



/***/ }),

/***/ "./node_modules/@dojo/widgets/slider/index.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export SliderBase */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_mixins_Focus__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Focus.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__label_index__ = __webpack_require__("./node_modules/@dojo/widgets/label/index.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__dojo_framework_widget_core_meta_Focus__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/Focus.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__dojo_framework_core_util__ = __webpack_require__("./node_modules/@dojo/framework/core/util.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__common_util__ = __webpack_require__("./node_modules/@dojo/widgets/common/util.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/slider/styles/slider.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__ = __webpack_require__("./node_modules/@dojo/widgets/theme/slider.m.css.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__dojo_framework_widget_core_decorators_customElement__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/customElement.mjs");












const ThemedBase = Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(Object(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_mixins_Focus__["a" /* FocusMixin */])(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]));
/* unused harmony export ThemedBase */

function extractValue(event) {
    const value = event.target.value;
    return parseFloat(value);
}
let SliderBase = class SliderBase extends ThemedBase {
    constructor() {
        super(...arguments);
        // id used to associate input with output
        this._widgetId = Object(__WEBPACK_IMPORTED_MODULE_7__dojo_framework_core_util__["a" /* uuid */])();
    }
    _onBlur(event) {
        this.properties.onBlur && this.properties.onBlur(extractValue(event));
    }
    _onChange(event) {
        event.stopPropagation();
        this.properties.onChange && this.properties.onChange(extractValue(event));
    }
    _onClick(event) {
        event.stopPropagation();
        this.properties.onClick && this.properties.onClick(extractValue(event));
    }
    _onFocus(event) {
        this.properties.onFocus && this.properties.onFocus(extractValue(event));
    }
    _onInput(event) {
        event.stopPropagation();
        this.properties.onInput && this.properties.onInput(extractValue(event));
    }
    _onKeyDown(event) {
        event.stopPropagation();
        this.properties.onKeyDown && this.properties.onKeyDown(event.which, () => { event.preventDefault(); });
    }
    _onKeyPress(event) {
        event.stopPropagation();
        this.properties.onKeyPress && this.properties.onKeyPress(event.which, () => { event.preventDefault(); });
    }
    _onKeyUp(event) {
        event.stopPropagation();
        this.properties.onKeyUp && this.properties.onKeyUp(event.which, () => { event.preventDefault(); });
    }
    _onMouseDown(event) {
        event.stopPropagation();
        this.properties.onMouseDown && this.properties.onMouseDown();
    }
    _onMouseUp(event) {
        event.stopPropagation();
        this.properties.onMouseUp && this.properties.onMouseUp();
    }
    _onTouchStart(event) {
        event.stopPropagation();
        this.properties.onTouchStart && this.properties.onTouchStart();
    }
    _onTouchEnd(event) {
        event.stopPropagation();
        this.properties.onTouchEnd && this.properties.onTouchEnd();
    }
    _onTouchCancel(event) {
        event.stopPropagation();
        this.properties.onTouchCancel && this.properties.onTouchCancel();
    }
    getRootClasses() {
        const { disabled, invalid, readOnly, required, vertical = false } = this.properties;
        const focus = this.meta(__WEBPACK_IMPORTED_MODULE_6__dojo_framework_widget_core_meta_Focus__["a" /* default */]).get('root');
        return [
            __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["root"],
            disabled ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["disabled"] : null,
            focus.containsFocus ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["focused"] : null,
            invalid === true ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["invalid"] : null,
            invalid === false ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["valid"] : null,
            readOnly ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["readonly"] : null,
            required ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["required"] : null,
            vertical ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["vertical"] : null
        ];
    }
    renderControls(percentValue) {
        const { vertical = false, verticalHeight = '200px' } = this.properties;
        return Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('div', {
            classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["track"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["trackFixed"]],
            'aria-hidden': 'true',
            styles: vertical ? { width: verticalHeight } : {}
        }, [
            Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('span', {
                classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["fill"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["fillFixed"]],
                styles: { width: `${percentValue}%` }
            }),
            Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('span', {
                classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["thumb"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["thumbFixed"]],
                styles: { left: `${percentValue}%` }
            })
        ]);
    }
    renderOutput(value, percentValue) {
        const { output, outputIsTooltip = false, vertical = false } = this.properties;
        const outputNode = output ? output(value) : `${value}`;
        // output styles
        let outputStyles = {};
        if (outputIsTooltip) {
            outputStyles = vertical ? { top: `${100 - percentValue}%` } : { left: `${percentValue}%` };
        }
        return Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('output', {
            classes: this.theme([__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["output"], outputIsTooltip ? __WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["outputTooltip"] : null]),
            for: this._widgetId,
            styles: outputStyles,
            tabIndex: -1 /* needed so Edge doesn't select the element while tabbing through */
        }, [outputNode]);
    }
    render() {
        const { aria = {}, disabled, widgetId = this._widgetId, invalid, label, labelAfter, labelHidden, max = 100, min = 0, name, readOnly, required, showOutput = true, step = 1, vertical = false, verticalHeight = '200px', theme } = this.properties;
        const focus = this.meta(__WEBPACK_IMPORTED_MODULE_6__dojo_framework_widget_core_meta_Focus__["a" /* default */]).get('root');
        let { value = min } = this.properties;
        value = value > max ? max : value;
        value = value < min ? min : value;
        const percentValue = (value - min) / (max - min) * 100;
        const slider = Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('div', {
            classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["inputWrapper"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["inputWrapperFixed"]],
            styles: vertical ? { height: verticalHeight } : {}
        }, [
            Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('input', Object.assign({ key: 'input' }, Object(__WEBPACK_IMPORTED_MODULE_8__common_util__["a" /* formatAriaProperties */])(aria), { classes: [this.theme(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__["input"]), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["nativeInput"]], disabled, id: widgetId, focus: this.shouldFocus, 'aria-invalid': invalid === true ? 'true' : null, max: `${max}`, min: `${min}`, name,
                readOnly, 'aria-readonly': readOnly === true ? 'true' : null, required, step: `${step}`, styles: vertical ? { width: verticalHeight } : {}, type: 'range', value: `${value}`, onblur: this._onBlur, onchange: this._onChange, onclick: this._onClick, onfocus: this._onFocus, oninput: this._onInput, onkeydown: this._onKeyDown, onkeypress: this._onKeyPress, onkeyup: this._onKeyUp, onmousedown: this._onMouseDown, onmouseup: this._onMouseUp, ontouchstart: this._onTouchStart, ontouchend: this._onTouchEnd, ontouchcancel: this._onTouchCancel })),
            this.renderControls(percentValue),
            showOutput ? this.renderOutput(value, percentValue) : null
        ]);
        const children = [
            label ? Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_4__label_index__["a" /* default */], {
                theme,
                disabled,
                focused: focus.containsFocus,
                invalid,
                readOnly,
                required,
                hidden: labelHidden,
                forId: widgetId
            }, [label]) : null,
            slider
        ];
        return Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_d__["g" /* v */])('div', {
            key: 'root',
            classes: [...this.theme(this.getRootClasses()), __WEBPACK_IMPORTED_MODULE_9__styles_slider_m_css__["rootFixed"]]
        }, labelAfter ? children.reverse() : children);
    }
};
SliderBase = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_mixins_Themed__["d" /* theme */])(__WEBPACK_IMPORTED_MODULE_10__theme_slider_m_css__),
    Object(__WEBPACK_IMPORTED_MODULE_11__dojo_framework_widget_core_decorators_customElement__["a" /* customElement */])({
        tag: 'dojo-slider',
        properties: [
            'theme',
            'aria',
            'extraClasses',
            'disabled',
            'invalid',
            'required',
            'readOnly',
            'labelAfter',
            'labelHidden',
            'max',
            'min',
            'output',
            'outputIsTooltip',
            'showOutput',
            'step',
            'vertical',
            'value'
        ],
        attributes: ['widgetId', 'label', 'name', 'verticalHeight'],
        events: [
            'onBlur',
            'onChange',
            'onClick',
            'onFocus',
            'onInput',
            'onKeyDown',
            'onKeyPress',
            'onKeyUp',
            'onMouseDown',
            'onMouseUp',
            'onTouchCancel',
            'onTouchEnd',
            'onTouchStart'
        ]
    })
], SliderBase);

class Slider extends SliderBase {
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Slider;



/***/ }),

/***/ "./node_modules/@dojo/widgets/slider/styles/slider.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/slider","_2Il2tPLe":"slider-m___2Il2tPLe__2WJra","_1jutPfif":"slider-m___1jutPfif__2X68k","_1MyjV5_F":"slider-m___1MyjV5_F__2748x","_3pPQuSpx":"slider-m___3pPQuSpx__2QHEp","_2s0Axahi":"slider-m___2s0Axahi__b1Z2p","k3G_rSOO":"slider-m__k3G_rSOO__2_jBL"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/slider/styles/slider.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/slider/styles/slider.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"rootFixed":"_2Il2tPLe","inputWrapperFixed":"_1jutPfif","fillFixed":"_1MyjV5_F","trackFixed":"_3pPQuSpx","thumbFixed":"k3G_rSOO","nativeInput":"_2s0Axahi"," _key":"@dojo/widgets/slider"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/label.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/label","_2a_lwZi8":"label-m___2a_lwZi8__3Xy9q"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/label.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/theme/label.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"root":"_1Xn7GZjl","readonly":"_79gMw0vX","invalid":"_1HXQXand","valid":"_3TeO85nD","required":"_2a_lwZi8","disabled":"_3gv9ptxH","focused":"_2Qy2nYta","secondary":"_29UpR7Gd"," _key":"@dojo/widgets/label"};
}));;

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/slider.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/slider","TcETX5TS":"slider-m__TcETX5TS__388rQ","_31JV4nx0":"slider-m___31JV4nx0__1w_SY","_1c4XRwH0":"slider-m___1c4XRwH0__9yt2A","_3b4yxB7A":"slider-m___3b4yxB7A__35UK4","_3tZxVK0T":"slider-m___3tZxVK0T__C-HdP","_23uNmbH1":"slider-m___23uNmbH1__1m3xi","_18XXqTIh":"slider-m___18XXqTIh__3jYua","_2Dd1H-Q1":"slider-m___2Dd1H-Q1__2CAaf","_3puiWsuE":"slider-m___3puiWsuE__1Qj_e","_3jKYxXAd":"slider-m___3jKYxXAd__1Vmgt","_2XyZkg_I":"slider-m___2XyZkg_I__2eVD1","_3mu14dHS":"slider-m___3mu14dHS__QED2q","juyYC47L":"slider-m__juyYC47L__3zAyu"};

/***/ }),

/***/ "./node_modules/@dojo/widgets/theme/slider.m.css.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;__webpack_require__("./node_modules/@dojo/widgets/theme/slider.m.css");
(function (root, factory) {
if (true) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () { return (factory()); }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === 'object' && module.exports) {
	module.exports = factory();
}
}(this, function () {
	return {"root":"N46gqrk0","outputTooltip":"TcETX5TS","vertical":"_31JV4nx0","input":"_3b4yxB7A","track":"_1c4XRwH0","disabled":"_23uNmbH1","readonly":"_3tZxVK0T","required":"_18XXqTIh","invalid":"_2Dd1H-Q1","thumb":"_3puiWsuE","valid":"_3jKYxXAd","inputWrapper":"_2XyZkg_I","focused":"_3mu14dHS","fill":"juyYC47L","output":"_2EoIZn7U"," _key":"@dojo/widgets/slider"};
}));;

/***/ }),

/***/ "./node_modules/process/browser.js":
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export __extends */
/* unused harmony export __assign */
/* harmony export (immutable) */ __webpack_exports__["c"] = __rest;
/* harmony export (immutable) */ __webpack_exports__["b"] = __decorate;
/* unused harmony export __param */
/* unused harmony export __metadata */
/* harmony export (immutable) */ __webpack_exports__["a"] = __awaiter;
/* unused harmony export __generator */
/* unused harmony export __exportStar */
/* unused harmony export __values */
/* unused harmony export __read */
/* unused harmony export __spread */
/* unused harmony export __await */
/* unused harmony export __asyncGenerator */
/* unused harmony export __asyncDelegator */
/* unused harmony export __asyncValues */
/* unused harmony export __makeTemplateObject */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};


/***/ }),

/***/ "./node_modules/web-animations-js/web-animations-next-lite.min.js":
/***/ (function(module, exports) {

// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

!function(a,b){var c={},d={},e={};!function(a,b){function c(a){if("number"==typeof a)return a;var b={};for(var c in a)b[c]=a[c];return b}function d(){this._delay=0,this._endDelay=0,this._fill="none",this._iterationStart=0,this._iterations=1,this._duration=0,this._playbackRate=1,this._direction="normal",this._easing="linear",this._easingFunction=x}function e(){return a.isDeprecated("Invalid timing inputs","2016-03-02","TypeError exceptions will be thrown instead.",!0)}function f(b,c,e){var f=new d;return c&&(f.fill="both",f.duration="auto"),"number"!=typeof b||isNaN(b)?void 0!==b&&Object.getOwnPropertyNames(b).forEach(function(c){if("auto"!=b[c]){if(("number"==typeof f[c]||"duration"==c)&&("number"!=typeof b[c]||isNaN(b[c])))return;if("fill"==c&&-1==v.indexOf(b[c]))return;if("direction"==c&&-1==w.indexOf(b[c]))return;if("playbackRate"==c&&1!==b[c]&&a.isDeprecated("AnimationEffectTiming.playbackRate","2014-11-28","Use Animation.playbackRate instead."))return;f[c]=b[c]}}):f.duration=b,f}function g(a){return"number"==typeof a&&(a=isNaN(a)?{duration:0}:{duration:a}),a}function h(b,c){return b=a.numericTimingToObject(b),f(b,c)}function i(a,b,c,d){return a<0||a>1||c<0||c>1?x:function(e){function f(a,b,c){return 3*a*(1-c)*(1-c)*c+3*b*(1-c)*c*c+c*c*c}if(e<=0){var g=0;return a>0?g=b/a:!b&&c>0&&(g=d/c),g*e}if(e>=1){var h=0;return c<1?h=(d-1)/(c-1):1==c&&a<1&&(h=(b-1)/(a-1)),1+h*(e-1)}for(var i=0,j=1;i<j;){var k=(i+j)/2,l=f(a,c,k);if(Math.abs(e-l)<1e-5)return f(b,d,k);l<e?i=k:j=k}return f(b,d,k)}}function j(a,b){return function(c){if(c>=1)return 1;var d=1/a;return(c+=b*d)-c%d}}function k(a){C||(C=document.createElement("div").style),C.animationTimingFunction="",C.animationTimingFunction=a;var b=C.animationTimingFunction;if(""==b&&e())throw new TypeError(a+" is not a valid value for easing");return b}function l(a){if("linear"==a)return x;var b=E.exec(a);if(b)return i.apply(this,b.slice(1).map(Number));var c=F.exec(a);return c?j(Number(c[1]),{start:y,middle:z,end:A}[c[2]]):B[a]||x}function m(a){return Math.abs(n(a)/a.playbackRate)}function n(a){return 0===a.duration||0===a.iterations?0:a.duration*a.iterations}function o(a,b,c){if(null==b)return G;var d=c.delay+a+c.endDelay;return b<Math.min(c.delay,d)?H:b>=Math.min(c.delay+a,d)?I:J}function p(a,b,c,d,e){switch(d){case H:return"backwards"==b||"both"==b?0:null;case J:return c-e;case I:return"forwards"==b||"both"==b?a:null;case G:return null}}function q(a,b,c,d,e){var f=e;return 0===a?b!==H&&(f+=c):f+=d/a,f}function r(a,b,c,d,e,f){var g=a===1/0?b%1:a%1;return 0!==g||c!==I||0===d||0===e&&0!==f||(g=1),g}function s(a,b,c,d){return a===I&&b===1/0?1/0:1===c?Math.floor(d)-1:Math.floor(d)}function t(a,b,c){var d=a;if("normal"!==a&&"reverse"!==a){var e=b;"alternate-reverse"===a&&(e+=1),d="normal",e!==1/0&&e%2!=0&&(d="reverse")}return"normal"===d?c:1-c}function u(a,b,c){var d=o(a,b,c),e=p(a,c.fill,b,d,c.delay);if(null===e)return null;var f=q(c.duration,d,c.iterations,e,c.iterationStart),g=r(f,c.iterationStart,d,c.iterations,e,c.duration),h=s(d,c.iterations,g,f),i=t(c.direction,h,g);return c._easingFunction(i)}var v="backwards|forwards|both|none".split("|"),w="reverse|alternate|alternate-reverse".split("|"),x=function(a){return a};d.prototype={_setMember:function(b,c){this["_"+b]=c,this._effect&&(this._effect._timingInput[b]=c,this._effect._timing=a.normalizeTimingInput(this._effect._timingInput),this._effect.activeDuration=a.calculateActiveDuration(this._effect._timing),this._effect._animation&&this._effect._animation._rebuildUnderlyingAnimation())},get playbackRate(){return this._playbackRate},set delay(a){this._setMember("delay",a)},get delay(){return this._delay},set endDelay(a){this._setMember("endDelay",a)},get endDelay(){return this._endDelay},set fill(a){this._setMember("fill",a)},get fill(){return this._fill},set iterationStart(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterationStart must be a non-negative number, received: "+timing.iterationStart);this._setMember("iterationStart",a)},get iterationStart(){return this._iterationStart},set duration(a){if("auto"!=a&&(isNaN(a)||a<0)&&e())throw new TypeError("duration must be non-negative or auto, received: "+a);this._setMember("duration",a)},get duration(){return this._duration},set direction(a){this._setMember("direction",a)},get direction(){return this._direction},set easing(a){this._easingFunction=l(k(a)),this._setMember("easing",a)},get easing(){return this._easing},set iterations(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterations must be non-negative, received: "+a);this._setMember("iterations",a)},get iterations(){return this._iterations}};var y=1,z=.5,A=0,B={ease:i(.25,.1,.25,1),"ease-in":i(.42,0,1,1),"ease-out":i(0,0,.58,1),"ease-in-out":i(.42,0,.58,1),"step-start":j(1,y),"step-middle":j(1,z),"step-end":j(1,A)},C=null,D="\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*",E=new RegExp("cubic-bezier\\("+D+","+D+","+D+","+D+"\\)"),F=/steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/,G=0,H=1,I=2,J=3;a.cloneTimingInput=c,a.makeTiming=f,a.numericTimingToObject=g,a.normalizeTimingInput=h,a.calculateActiveDuration=m,a.calculateIterationProgress=u,a.calculatePhase=o,a.normalizeEasing=k,a.parseEasingFunction=l}(c),function(a,b){function c(a,b){return a in k?k[a][b]||b:b}function d(a){return"display"===a||0===a.lastIndexOf("animation",0)||0===a.lastIndexOf("transition",0)}function e(a,b,e){if(!d(a)){var f=h[a];if(f){i.style[a]=b;for(var g in f){var j=f[g],k=i.style[j];e[j]=c(j,k)}}else e[a]=c(a,b)}}function f(a){var b=[];for(var c in a)if(!(c in["easing","offset","composite"])){var d=a[c];Array.isArray(d)||(d=[d]);for(var e,f=d.length,g=0;g<f;g++)e={},e.offset="offset"in a?a.offset:1==f?1:g/(f-1),"easing"in a&&(e.easing=a.easing),"composite"in a&&(e.composite=a.composite),e[c]=d[g],b.push(e)}return b.sort(function(a,b){return a.offset-b.offset}),b}function g(b){function c(){var a=d.length;null==d[a-1].offset&&(d[a-1].offset=1),a>1&&null==d[0].offset&&(d[0].offset=0);for(var b=0,c=d[0].offset,e=1;e<a;e++){var f=d[e].offset;if(null!=f){for(var g=1;g<e-b;g++)d[b+g].offset=c+(f-c)*g/(e-b);b=e,c=f}}}if(null==b)return[];window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||(b=f(b));for(var d=b.map(function(b){var c={};for(var d in b){var f=b[d];if("offset"==d){if(null!=f){if(f=Number(f),!isFinite(f))throw new TypeError("Keyframe offsets must be numbers.");if(f<0||f>1)throw new TypeError("Keyframe offsets must be between 0 and 1.")}}else if("composite"==d){if("add"==f||"accumulate"==f)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"add compositing is not supported"};if("replace"!=f)throw new TypeError("Invalid composite mode "+f+".")}else f="easing"==d?a.normalizeEasing(f):""+f;e(d,f,c)}return void 0==c.offset&&(c.offset=null),void 0==c.easing&&(c.easing="linear"),c}),g=!0,h=-1/0,i=0;i<d.length;i++){var j=d[i].offset;if(null!=j){if(j<h)throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");h=j}else g=!1}return d=d.filter(function(a){return a.offset>=0&&a.offset<=1}),g||c(),d}var h={background:["backgroundImage","backgroundPosition","backgroundSize","backgroundRepeat","backgroundAttachment","backgroundOrigin","backgroundClip","backgroundColor"],border:["borderTopColor","borderTopStyle","borderTopWidth","borderRightColor","borderRightStyle","borderRightWidth","borderBottomColor","borderBottomStyle","borderBottomWidth","borderLeftColor","borderLeftStyle","borderLeftWidth"],borderBottom:["borderBottomWidth","borderBottomStyle","borderBottomColor"],borderColor:["borderTopColor","borderRightColor","borderBottomColor","borderLeftColor"],borderLeft:["borderLeftWidth","borderLeftStyle","borderLeftColor"],borderRadius:["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],borderRight:["borderRightWidth","borderRightStyle","borderRightColor"],borderTop:["borderTopWidth","borderTopStyle","borderTopColor"],borderWidth:["borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"],flex:["flexGrow","flexShrink","flexBasis"],font:["fontFamily","fontSize","fontStyle","fontVariant","fontWeight","lineHeight"],margin:["marginTop","marginRight","marginBottom","marginLeft"],outline:["outlineColor","outlineStyle","outlineWidth"],padding:["paddingTop","paddingRight","paddingBottom","paddingLeft"]},i=document.createElementNS("http://www.w3.org/1999/xhtml","div"),j={thin:"1px",medium:"3px",thick:"5px"},k={borderBottomWidth:j,borderLeftWidth:j,borderRightWidth:j,borderTopWidth:j,fontSize:{"xx-small":"60%","x-small":"75%",small:"89%",medium:"100%",large:"120%","x-large":"150%","xx-large":"200%"},fontWeight:{normal:"400",bold:"700"},outlineWidth:j,textShadow:{none:"0px 0px 0px transparent"},boxShadow:{none:"0px 0px 0px 0px transparent"}};a.convertToArrayForm=f,a.normalizeKeyframes=g}(c),function(a){var b={};a.isDeprecated=function(a,c,d,e){var f=e?"are":"is",g=new Date,h=new Date(c);return h.setMonth(h.getMonth()+3),!(g<h&&(a in b||console.warn("Web Animations: "+a+" "+f+" deprecated and will stop working on "+h.toDateString()+". "+d),b[a]=!0,1))},a.deprecated=function(b,c,d,e){var f=e?"are":"is";if(a.isDeprecated(b,c,d,e))throw new Error(b+" "+f+" no longer supported. "+d)}}(c),function(){if(document.documentElement.animate){var a=document.documentElement.animate([],0),b=!0;if(a&&(b=!1,"play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState".split("|").forEach(function(c){void 0===a[c]&&(b=!0)})),!b)return}!function(a,b,c){function d(a){for(var b={},c=0;c<a.length;c++)for(var d in a[c])if("offset"!=d&&"easing"!=d&&"composite"!=d){var e={offset:a[c].offset,easing:a[c].easing,value:a[c][d]};b[d]=b[d]||[],b[d].push(e)}for(var f in b){var g=b[f];if(0!=g[0].offset||1!=g[g.length-1].offset)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"Partial keyframes are not supported"}}return b}function e(c){var d=[];for(var e in c)for(var f=c[e],g=0;g<f.length-1;g++){var h=g,i=g+1,j=f[h].offset,k=f[i].offset,l=j,m=k;0==g&&(l=-1/0,0==k&&(i=h)),g==f.length-2&&(m=1/0,1==j&&(h=i)),d.push({applyFrom:l,applyTo:m,startOffset:f[h].offset,endOffset:f[i].offset,easingFunction:a.parseEasingFunction(f[h].easing),property:e,interpolation:b.propertyInterpolation(e,f[h].value,f[i].value)})}return d.sort(function(a,b){return a.startOffset-b.startOffset}),d}b.convertEffectInput=function(c){var f=a.normalizeKeyframes(c),g=d(f),h=e(g);return function(a,c){if(null!=c)h.filter(function(a){return c>=a.applyFrom&&c<a.applyTo}).forEach(function(d){var e=c-d.startOffset,f=d.endOffset-d.startOffset,g=0==f?0:d.easingFunction(e/f);b.apply(a,d.property,d.interpolation(g))});else for(var d in g)"offset"!=d&&"easing"!=d&&"composite"!=d&&b.clear(a,d)}}}(c,d),function(a,b,c){function d(a){return a.replace(/-(.)/g,function(a,b){return b.toUpperCase()})}function e(a,b,c){h[c]=h[c]||[],h[c].push([a,b])}function f(a,b,c){for(var f=0;f<c.length;f++){e(a,b,d(c[f]))}}function g(c,e,f){var g=c;/-/.test(c)&&!a.isDeprecated("Hyphenated property names","2016-03-22","Use camelCase instead.",!0)&&(g=d(c)),"initial"!=e&&"initial"!=f||("initial"==e&&(e=i[g]),"initial"==f&&(f=i[g]));for(var j=e==f?[]:h[g],k=0;j&&k<j.length;k++){var l=j[k][0](e),m=j[k][0](f);if(void 0!==l&&void 0!==m){var n=j[k][1](l,m);if(n){var o=b.Interpolation.apply(null,n);return function(a){return 0==a?e:1==a?f:o(a)}}}}return b.Interpolation(!1,!0,function(a){return a?f:e})}var h={};b.addPropertiesHandler=f;var i={backgroundColor:"transparent",backgroundPosition:"0% 0%",borderBottomColor:"currentColor",borderBottomLeftRadius:"0px",borderBottomRightRadius:"0px",borderBottomWidth:"3px",borderLeftColor:"currentColor",borderLeftWidth:"3px",borderRightColor:"currentColor",borderRightWidth:"3px",borderSpacing:"2px",borderTopColor:"currentColor",borderTopLeftRadius:"0px",borderTopRightRadius:"0px",borderTopWidth:"3px",bottom:"auto",clip:"rect(0px, 0px, 0px, 0px)",color:"black",fontSize:"100%",fontWeight:"400",height:"auto",left:"auto",letterSpacing:"normal",lineHeight:"120%",marginBottom:"0px",marginLeft:"0px",marginRight:"0px",marginTop:"0px",maxHeight:"none",maxWidth:"none",minHeight:"0px",minWidth:"0px",opacity:"1.0",outlineColor:"invert",outlineOffset:"0px",outlineWidth:"3px",paddingBottom:"0px",paddingLeft:"0px",paddingRight:"0px",paddingTop:"0px",right:"auto",strokeDasharray:"none",strokeDashoffset:"0px",textIndent:"0px",textShadow:"0px 0px 0px transparent",top:"auto",transform:"",verticalAlign:"0px",visibility:"visible",width:"auto",wordSpacing:"normal",zIndex:"auto"};b.propertyInterpolation=g}(c,d),function(a,b,c){function d(b){var c=a.calculateActiveDuration(b),d=function(d){return a.calculateIterationProgress(c,d,b)};return d._totalDuration=b.delay+c+b.endDelay,d}b.KeyframeEffect=function(c,e,f,g){var h,i=d(a.normalizeTimingInput(f)),j=b.convertEffectInput(e),k=function(){j(c,h)};return k._update=function(a){return null!==(h=i(a))},k._clear=function(){j(c,null)},k._hasSameTarget=function(a){return c===a},k._target=c,k._totalDuration=i._totalDuration,k._id=g,k}}(c,d),function(a,b){a.apply=function(b,c,d){b.style[a.propertyName(c)]=d},a.clear=function(b,c){b.style[a.propertyName(c)]=""}}(d),function(a){window.Element.prototype.animate=function(b,c){var d="";return c&&c.id&&(d=c.id),a.timeline._play(a.KeyframeEffect(this,b,c,d))}}(d),function(a,b){function c(a,b,d){if("number"==typeof a&&"number"==typeof b)return a*(1-d)+b*d;if("boolean"==typeof a&&"boolean"==typeof b)return d<.5?a:b;if(a.length==b.length){for(var e=[],f=0;f<a.length;f++)e.push(c(a[f],b[f],d));return e}throw"Mismatched interpolation arguments "+a+":"+b}a.Interpolation=function(a,b,d){return function(e){return d(c(a,b,e))}}}(d),function(a,b,c){a.sequenceNumber=0;var d=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="finish",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()};b.Animation=function(b){this.id="",b&&b._id&&(this.id=b._id),this._sequenceNumber=a.sequenceNumber++,this._currentTime=0,this._startTime=null,this._paused=!1,this._playbackRate=1,this._inTimeline=!0,this._finishedFlag=!0,this.onfinish=null,this._finishHandlers=[],this._effect=b,this._inEffect=this._effect._update(0),this._idle=!0,this._currentTimePending=!1},b.Animation.prototype={_ensureAlive:function(){this.playbackRate<0&&0===this.currentTime?this._inEffect=this._effect._update(-1):this._inEffect=this._effect._update(this.currentTime),this._inTimeline||!this._inEffect&&this._finishedFlag||(this._inTimeline=!0,b.timeline._animations.push(this))},_tickCurrentTime:function(a,b){a!=this._currentTime&&(this._currentTime=a,this._isFinished&&!b&&(this._currentTime=this._playbackRate>0?this._totalDuration:0),this._ensureAlive())},get currentTime(){return this._idle||this._currentTimePending?null:this._currentTime},set currentTime(a){a=+a,isNaN(a)||(b.restart(),this._paused||null==this._startTime||(this._startTime=this._timeline.currentTime-a/this._playbackRate),this._currentTimePending=!1,this._currentTime!=a&&(this._idle&&(this._idle=!1,this._paused=!0),this._tickCurrentTime(a,!0),b.applyDirtiedAnimation(this)))},get startTime(){return this._startTime},set startTime(a){a=+a,isNaN(a)||this._paused||this._idle||(this._startTime=a,this._tickCurrentTime((this._timeline.currentTime-this._startTime)*this.playbackRate),b.applyDirtiedAnimation(this))},get playbackRate(){return this._playbackRate},set playbackRate(a){if(a!=this._playbackRate){var c=this.currentTime;this._playbackRate=a,this._startTime=null,"paused"!=this.playState&&"idle"!=this.playState&&(this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)),null!=c&&(this.currentTime=c)}},get _isFinished(){return!this._idle&&(this._playbackRate>0&&this._currentTime>=this._totalDuration||this._playbackRate<0&&this._currentTime<=0)},get _totalDuration(){return this._effect._totalDuration},get playState(){return this._idle?"idle":null==this._startTime&&!this._paused&&0!=this.playbackRate||this._currentTimePending?"pending":this._paused?"paused":this._isFinished?"finished":"running"},_rewind:function(){if(this._playbackRate>=0)this._currentTime=0;else{if(!(this._totalDuration<1/0))throw new DOMException("Unable to rewind negative playback rate animation with infinite duration","InvalidStateError");this._currentTime=this._totalDuration}},play:function(){this._paused=!1,(this._isFinished||this._idle)&&(this._rewind(),this._startTime=null),this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)},pause:function(){this._isFinished||this._paused||this._idle?this._idle&&(this._rewind(),this._idle=!1):this._currentTimePending=!0,this._startTime=null,this._paused=!0},finish:function(){this._idle||(this.currentTime=this._playbackRate>0?this._totalDuration:0,this._startTime=this._totalDuration-this.currentTime,this._currentTimePending=!1,b.applyDirtiedAnimation(this))},cancel:function(){this._inEffect&&(this._inEffect=!1,this._idle=!0,this._paused=!1,this._isFinished=!0,this._finishedFlag=!0,this._currentTime=0,this._startTime=null,this._effect._update(null),b.applyDirtiedAnimation(this))},reverse:function(){this.playbackRate*=-1,this.play()},addEventListener:function(a,b){"function"==typeof b&&"finish"==a&&this._finishHandlers.push(b)},removeEventListener:function(a,b){if("finish"==a){var c=this._finishHandlers.indexOf(b);c>=0&&this._finishHandlers.splice(c,1)}},_fireEvents:function(a){if(this._isFinished){if(!this._finishedFlag){var b=new d(this,this._currentTime,a),c=this._finishHandlers.concat(this.onfinish?[this.onfinish]:[]);setTimeout(function(){c.forEach(function(a){a.call(b.target,b)})},0),this._finishedFlag=!0}}else this._finishedFlag=!1},_tick:function(a,b){this._idle||this._paused||(null==this._startTime?b&&(this.startTime=a-this._currentTime/this.playbackRate):this._isFinished||this._tickCurrentTime((a-this._startTime)*this.playbackRate)),b&&(this._currentTimePending=!1,this._fireEvents(a))},get _needsTick(){return this.playState in{pending:1,running:1}||!this._finishedFlag},_targetAnimations:function(){var a=this._effect._target;return a._activeAnimations||(a._activeAnimations=[]),a._activeAnimations},_markTarget:function(){var a=this._targetAnimations();-1===a.indexOf(this)&&a.push(this)},_unmarkTarget:function(){var a=this._targetAnimations(),b=a.indexOf(this);-1!==b&&a.splice(b,1)}}}(c,d),function(a,b,c){function d(a){var b=j;j=[],a<q.currentTime&&(a=q.currentTime),q._animations.sort(e),q._animations=h(a,!0,q._animations)[0],b.forEach(function(b){b[1](a)}),g(),l=void 0}function e(a,b){return a._sequenceNumber-b._sequenceNumber}function f(){this._animations=[],this.currentTime=window.performance&&performance.now?performance.now():0}function g(){o.forEach(function(a){a()}),o.length=0}function h(a,c,d){p=!0,n=!1,b.timeline.currentTime=a,m=!1;var e=[],f=[],g=[],h=[];return d.forEach(function(b){b._tick(a,c),b._inEffect?(f.push(b._effect),b._markTarget()):(e.push(b._effect),b._unmarkTarget()),b._needsTick&&(m=!0);var d=b._inEffect||b._needsTick;b._inTimeline=d,d?g.push(b):h.push(b)}),o.push.apply(o,e),o.push.apply(o,f),m&&requestAnimationFrame(function(){}),p=!1,[g,h]}var i=window.requestAnimationFrame,j=[],k=0;window.requestAnimationFrame=function(a){var b=k++;return 0==j.length&&i(d),j.push([b,a]),b},window.cancelAnimationFrame=function(a){j.forEach(function(b){b[0]==a&&(b[1]=function(){})})},f.prototype={_play:function(c){c._timing=a.normalizeTimingInput(c.timing);var d=new b.Animation(c);return d._idle=!1,d._timeline=this,this._animations.push(d),b.restart(),b.applyDirtiedAnimation(d),d}};var l=void 0,m=!1,n=!1;b.restart=function(){return m||(m=!0,requestAnimationFrame(function(){}),n=!0),n},b.applyDirtiedAnimation=function(a){if(!p){a._markTarget();var c=a._targetAnimations();c.sort(e),h(b.timeline.currentTime,!1,c.slice())[1].forEach(function(a){var b=q._animations.indexOf(a);-1!==b&&q._animations.splice(b,1)}),g()}};var o=[],p=!1,q=new f;b.timeline=q}(c,d),function(a){function b(a,b){var c=a.exec(b);if(c)return c=a.ignoreCase?c[0].toLowerCase():c[0],[c,b.substr(c.length)]}function c(a,b){b=b.replace(/^\s*/,"");var c=a(b);if(c)return[c[0],c[1].replace(/^\s*/,"")]}function d(a,d,e){a=c.bind(null,a);for(var f=[];;){var g=a(e);if(!g)return[f,e];if(f.push(g[0]),e=g[1],!(g=b(d,e))||""==g[1])return[f,e];e=g[1]}}function e(a,b){for(var c=0,d=0;d<b.length&&(!/\s|,/.test(b[d])||0!=c);d++)if("("==b[d])c++;else if(")"==b[d]&&(c--,0==c&&d++,c<=0))break;var e=a(b.substr(0,d));return void 0==e?void 0:[e,b.substr(d)]}function f(a,b){for(var c=a,d=b;c&&d;)c>d?c%=d:d%=c;return c=a*b/(c+d)}function g(a){return function(b){var c=a(b);return c&&(c[0]=void 0),c}}function h(a,b){return function(c){return a(c)||[b,c]}}function i(b,c){for(var d=[],e=0;e<b.length;e++){var f=a.consumeTrimmed(b[e],c);if(!f||""==f[0])return;void 0!==f[0]&&d.push(f[0]),c=f[1]}if(""==c)return d}function j(a,b,c,d,e){for(var g=[],h=[],i=[],j=f(d.length,e.length),k=0;k<j;k++){var l=b(d[k%d.length],e[k%e.length]);if(!l)return;g.push(l[0]),h.push(l[1]),i.push(l[2])}return[g,h,function(b){var d=b.map(function(a,b){return i[b](a)}).join(c);return a?a(d):d}]}function k(a,b,c){for(var d=[],e=[],f=[],g=0,h=0;h<c.length;h++)if("function"==typeof c[h]){var i=c[h](a[g],b[g++]);d.push(i[0]),e.push(i[1]),f.push(i[2])}else!function(a){d.push(!1),e.push(!1),f.push(function(){return c[a]})}(h);return[d,e,function(a){for(var b="",c=0;c<a.length;c++)b+=f[c](a[c]);return b}]}a.consumeToken=b,a.consumeTrimmed=c,a.consumeRepeated=d,a.consumeParenthesised=e,a.ignore=g,a.optional=h,a.consumeList=i,a.mergeNestedRepeated=j.bind(null,null),a.mergeWrappedNestedRepeated=j,a.mergeList=k}(d),function(a){function b(b){function c(b){var c=a.consumeToken(/^inset/i,b);if(c)return d.inset=!0,c;var c=a.consumeLengthOrPercent(b);if(c)return d.lengths.push(c[0]),c;var c=a.consumeColor(b);return c?(d.color=c[0],c):void 0}var d={inset:!1,lengths:[],color:null},e=a.consumeRepeated(c,/^/,b);if(e&&e[0].length)return[d,e[1]]}function c(c){var d=a.consumeRepeated(b,/^,/,c);if(d&&""==d[1])return d[0]}function d(b,c){for(;b.lengths.length<Math.max(b.lengths.length,c.lengths.length);)b.lengths.push({px:0});for(;c.lengths.length<Math.max(b.lengths.length,c.lengths.length);)c.lengths.push({px:0});if(b.inset==c.inset&&!!b.color==!!c.color){for(var d,e=[],f=[[],0],g=[[],0],h=0;h<b.lengths.length;h++){var i=a.mergeDimensions(b.lengths[h],c.lengths[h],2==h);f[0].push(i[0]),g[0].push(i[1]),e.push(i[2])}if(b.color&&c.color){var j=a.mergeColors(b.color,c.color);f[1]=j[0],g[1]=j[1],d=j[2]}return[f,g,function(a){for(var c=b.inset?"inset ":" ",f=0;f<e.length;f++)c+=e[f](a[0][f])+" ";return d&&(c+=d(a[1])),c}]}}function e(b,c,d,e){function f(a){return{inset:a,color:[0,0,0,0],lengths:[{px:0},{px:0},{px:0},{px:0}]}}for(var g=[],h=[],i=0;i<d.length||i<e.length;i++){var j=d[i]||f(e[i].inset),k=e[i]||f(d[i].inset);g.push(j),h.push(k)}return a.mergeNestedRepeated(b,c,g,h)}var f=e.bind(null,d,", ");a.addPropertiesHandler(c,f,["box-shadow","text-shadow"])}(d),function(a,b){function c(a){return a.toFixed(3).replace(/0+$/,"").replace(/\.$/,"")}function d(a,b,c){return Math.min(b,Math.max(a,c))}function e(a){if(/^\s*[-+]?(\d*\.)?\d+\s*$/.test(a))return Number(a)}function f(a,b){return[a,b,c]}function g(a,b){if(0!=a)return i(0,1/0)(a,b)}function h(a,b){return[a,b,function(a){return Math.round(d(1,1/0,a))}]}function i(a,b){return function(e,f){return[e,f,function(e){return c(d(a,b,e))}]}}function j(a){var b=a.trim().split(/\s*[\s,]\s*/);if(0!==b.length){for(var c=[],d=0;d<b.length;d++){var f=e(b[d]);if(void 0===f)return;c.push(f)}return c}}function k(a,b){if(a.length==b.length)return[a,b,function(a){return a.map(c).join(" ")}]}function l(a,b){return[a,b,Math.round]}a.clamp=d,a.addPropertiesHandler(j,k,["stroke-dasharray"]),a.addPropertiesHandler(e,i(0,1/0),["border-image-width","line-height"]),a.addPropertiesHandler(e,i(0,1),["opacity","shape-image-threshold"]),a.addPropertiesHandler(e,g,["flex-grow","flex-shrink"]),a.addPropertiesHandler(e,h,["orphans","widows"]),a.addPropertiesHandler(e,l,["z-index"]),a.parseNumber=e,a.parseNumberList=j,a.mergeNumbers=f,a.numberToString=c}(d),function(a,b){function c(a,b){if("visible"==a||"visible"==b)return[0,1,function(c){return c<=0?a:c>=1?b:"visible"}]}a.addPropertiesHandler(String,c,["visibility"])}(d),function(a,b){function c(a){a=a.trim(),f.fillStyle="#000",f.fillStyle=a;var b=f.fillStyle;if(f.fillStyle="#fff",f.fillStyle=a,b==f.fillStyle){f.fillRect(0,0,1,1);var c=f.getImageData(0,0,1,1).data;f.clearRect(0,0,1,1);var d=c[3]/255;return[c[0]*d,c[1]*d,c[2]*d,d]}}function d(b,c){return[b,c,function(b){function c(a){return Math.max(0,Math.min(255,a))}if(b[3])for(var d=0;d<3;d++)b[d]=Math.round(c(b[d]/b[3]));return b[3]=a.numberToString(a.clamp(0,1,b[3])),"rgba("+b.join(",")+")"}]}var e=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");e.width=e.height=1;var f=e.getContext("2d");a.addPropertiesHandler(c,d,["background-color","border-bottom-color","border-left-color","border-right-color","border-top-color","color","fill","flood-color","lighting-color","outline-color","stop-color","stroke","text-decoration-color"]),a.consumeColor=a.consumeParenthesised.bind(null,c),a.mergeColors=d}(d),function(a,b){function c(a){function b(){var b=h.exec(a);g=b?b[0]:void 0}function c(){var a=Number(g);return b(),a}function d(){if("("!==g)return c();b();var a=f();return")"!==g?NaN:(b(),a)}function e(){for(var a=d();"*"===g||"/"===g;){var c=g;b();var e=d();"*"===c?a*=e:a/=e}return a}function f(){for(var a=e();"+"===g||"-"===g;){var c=g;b();var d=e();"+"===c?a+=d:a-=d}return a}var g,h=/([\+\-\w\.]+|[\(\)\*\/])/g;return b(),f()}function d(a,b){if("0"==(b=b.trim().toLowerCase())&&"px".search(a)>=0)return{px:0};if(/^[^(]*$|^calc/.test(b)){b=b.replace(/calc\(/g,"(");var d={};b=b.replace(a,function(a){return d[a]=null,"U"+a});for(var e="U("+a.source+")",f=b.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g,"N").replace(new RegExp("N"+e,"g"),"D").replace(/\s[+-]\s/g,"O").replace(/\s/g,""),g=[/N\*(D)/g,/(N|D)[*\/]N/g,/(N|D)O\1/g,/\((N|D)\)/g],h=0;h<g.length;)g[h].test(f)?(f=f.replace(g[h],"$1"),h=0):h++;if("D"==f){for(var i in d){var j=c(b.replace(new RegExp("U"+i,"g"),"").replace(new RegExp(e,"g"),"*0"));if(!isFinite(j))return;d[i]=j}return d}}}function e(a,b){return f(a,b,!0)}function f(b,c,d){var e,f=[];for(e in b)f.push(e);for(e in c)f.indexOf(e)<0&&f.push(e);return b=f.map(function(a){return b[a]||0}),c=f.map(function(a){return c[a]||0}),[b,c,function(b){var c=b.map(function(c,e){return 1==b.length&&d&&(c=Math.max(c,0)),a.numberToString(c)+f[e]}).join(" + ");return b.length>1?"calc("+c+")":c}]}var g="px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc",h=d.bind(null,new RegExp(g,"g")),i=d.bind(null,new RegExp(g+"|%","g")),j=d.bind(null,/deg|rad|grad|turn/g);a.parseLength=h,a.parseLengthOrPercent=i,a.consumeLengthOrPercent=a.consumeParenthesised.bind(null,i),a.parseAngle=j,a.mergeDimensions=f;var k=a.consumeParenthesised.bind(null,h),l=a.consumeRepeated.bind(void 0,k,/^/),m=a.consumeRepeated.bind(void 0,l,/^,/);a.consumeSizePairList=m;var n=function(a){var b=m(a);if(b&&""==b[1])return b[0]},o=a.mergeNestedRepeated.bind(void 0,e," "),p=a.mergeNestedRepeated.bind(void 0,o,",");a.mergeNonNegativeSizePair=o,a.addPropertiesHandler(n,p,["background-size"]),a.addPropertiesHandler(i,e,["border-bottom-width","border-image-width","border-left-width","border-right-width","border-top-width","flex-basis","font-size","height","line-height","max-height","max-width","outline-width","width"]),a.addPropertiesHandler(i,f,["border-bottom-left-radius","border-bottom-right-radius","border-top-left-radius","border-top-right-radius","bottom","left","letter-spacing","margin-bottom","margin-left","margin-right","margin-top","min-height","min-width","outline-offset","padding-bottom","padding-left","padding-right","padding-top","perspective","right","shape-margin","stroke-dashoffset","text-indent","top","vertical-align","word-spacing"])}(d),function(a,b){function c(b){return a.consumeLengthOrPercent(b)||a.consumeToken(/^auto/,b)}function d(b){var d=a.consumeList([a.ignore(a.consumeToken.bind(null,/^rect/)),a.ignore(a.consumeToken.bind(null,/^\(/)),a.consumeRepeated.bind(null,c,/^,/),a.ignore(a.consumeToken.bind(null,/^\)/))],b);if(d&&4==d[0].length)return d[0]}function e(b,c){return"auto"==b||"auto"==c?[!0,!1,function(d){var e=d?b:c;if("auto"==e)return"auto";var f=a.mergeDimensions(e,e);return f[2](f[0])}]:a.mergeDimensions(b,c)}function f(a){return"rect("+a+")"}var g=a.mergeWrappedNestedRepeated.bind(null,f,e,", ");a.parseBox=d,a.mergeBoxes=g,a.addPropertiesHandler(d,g,["clip"])}(d),function(a,b){function c(a){return function(b){var c=0;return a.map(function(a){return a===k?b[c++]:a})}}function d(a){return a}function e(b){if("none"==(b=b.toLowerCase().trim()))return[];for(var c,d=/\s*(\w+)\(([^)]*)\)/g,e=[],f=0;c=d.exec(b);){if(c.index!=f)return;f=c.index+c[0].length;var g=c[1],h=n[g];if(!h)return;var i=c[2].split(","),j=h[0];if(j.length<i.length)return;for(var k=[],o=0;o<j.length;o++){var p,q=i[o],r=j[o];if(void 0===(p=q?{A:function(b){return"0"==b.trim()?m:a.parseAngle(b)},N:a.parseNumber,T:a.parseLengthOrPercent,L:a.parseLength}[r.toUpperCase()](q):{a:m,n:k[0],t:l}[r]))return;k.push(p)}if(e.push({t:g,d:k}),d.lastIndex==b.length)return e}}function f(a){return a.toFixed(6).replace(".000000","")}function g(b,c){if(b.decompositionPair!==c){b.decompositionPair=c;var d=a.makeMatrixDecomposition(b)}if(c.decompositionPair!==b){c.decompositionPair=b;var e=a.makeMatrixDecomposition(c)}return null==d[0]||null==e[0]?[[!1],[!0],function(a){return a?c[0].d:b[0].d}]:(d[0].push(0),e[0].push(1),[d,e,function(b){var c=a.quat(d[0][3],e[0][3],b[5]);return a.composeMatrix(b[0],b[1],b[2],c,b[4]).map(f).join(",")}])}function h(a){return a.replace(/[xy]/,"")}function i(a){return a.replace(/(x|y|z|3d)?$/,"3d")}function j(b,c){var d=a.makeMatrixDecomposition&&!0,e=!1;if(!b.length||!c.length){b.length||(e=!0,b=c,c=[]);for(var f=0;f<b.length;f++){var j=b[f].t,k=b[f].d,l="scale"==j.substr(0,5)?1:0;c.push({t:j,d:k.map(function(a){if("number"==typeof a)return l;var b={};for(var c in a)b[c]=l;return b})})}}var m=function(a,b){return"perspective"==a&&"perspective"==b||("matrix"==a||"matrix3d"==a)&&("matrix"==b||"matrix3d"==b)},o=[],p=[],q=[];if(b.length!=c.length){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]]}else for(var f=0;f<b.length;f++){var j,s=b[f].t,t=c[f].t,u=b[f].d,v=c[f].d,w=n[s],x=n[t];if(m(s,t)){if(!d)return;var r=g([b[f]],[c[f]]);o.push(r[0]),p.push(r[1]),q.push(["matrix",[r[2]]])}else{if(s==t)j=s;else if(w[2]&&x[2]&&h(s)==h(t))j=h(s),u=w[2](u),v=x[2](v);else{if(!w[1]||!x[1]||i(s)!=i(t)){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]];break}j=i(s),u=w[1](u),v=x[1](v)}for(var y=[],z=[],A=[],B=0;B<u.length;B++){var C="number"==typeof u[B]?a.mergeNumbers:a.mergeDimensions,r=C(u[B],v[B]);y[B]=r[0],z[B]=r[1],A.push(r[2])}o.push(y),p.push(z),q.push([j,A])}}if(e){var D=o;o=p,p=D}return[o,p,function(a){return a.map(function(a,b){var c=a.map(function(a,c){return q[b][1][c](a)}).join(",");return"matrix"==q[b][0]&&16==c.split(",").length&&(q[b][0]="matrix3d"),q[b][0]+"("+c+")"}).join(" ")}]}var k=null,l={px:0},m={deg:0},n={matrix:["NNNNNN",[k,k,0,0,k,k,0,0,0,0,1,0,k,k,0,1],d],matrix3d:["NNNNNNNNNNNNNNNN",d],rotate:["A"],rotatex:["A"],rotatey:["A"],rotatez:["A"],rotate3d:["NNNA"],perspective:["L"],scale:["Nn",c([k,k,1]),d],scalex:["N",c([k,1,1]),c([k,1])],scaley:["N",c([1,k,1]),c([1,k])],scalez:["N",c([1,1,k])],scale3d:["NNN",d],skew:["Aa",null,d],skewx:["A",null,c([k,m])],skewy:["A",null,c([m,k])],translate:["Tt",c([k,k,l]),d],translatex:["T",c([k,l,l]),c([k,l])],translatey:["T",c([l,k,l]),c([l,k])],translatez:["L",c([l,l,k])],translate3d:["TTL",d]};a.addPropertiesHandler(e,j,["transform"]),a.transformToSvgMatrix=function(b){var c=a.transformListToMatrix(e(b));return"matrix("+f(c[0])+" "+f(c[1])+" "+f(c[4])+" "+f(c[5])+" "+f(c[12])+" "+f(c[13])+")"}}(d),function(a,b){function c(a,b){b.concat([a]).forEach(function(b){b in document.documentElement.style&&(d[a]=b),e[b]=a})}var d={},e={};c("transform",["webkitTransform","msTransform"]),c("transformOrigin",["webkitTransformOrigin"]),c("perspective",["webkitPerspective"]),c("perspectiveOrigin",["webkitPerspectiveOrigin"]),a.propertyName=function(a){return d[a]||a},a.unprefixedPropertyName=function(a){return e[a]||a}}(d)}(),function(){if(void 0===document.createElement("div").animate([]).oncancel){var a;if(window.performance&&performance.now)var a=function(){return performance.now()};else var a=function(){return Date.now()};var b=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="cancel",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()},c=window.Element.prototype.animate;window.Element.prototype.animate=function(d,e){var f=c.call(this,d,e);f._cancelHandlers=[],f.oncancel=null;var g=f.cancel;f.cancel=function(){g.call(this);var c=new b(this,null,a()),d=this._cancelHandlers.concat(this.oncancel?[this.oncancel]:[]);setTimeout(function(){d.forEach(function(a){a.call(c.target,c)})},0)};var h=f.addEventListener;f.addEventListener=function(a,b){"function"==typeof b&&"cancel"==a?this._cancelHandlers.push(b):h.call(this,a,b)};var i=f.removeEventListener;return f.removeEventListener=function(a,b){if("cancel"==a){var c=this._cancelHandlers.indexOf(b);c>=0&&this._cancelHandlers.splice(c,1)}else i.call(this,a,b)},f}}}(),function(a){var b=document.documentElement,c=null,d=!1;try{var e=getComputedStyle(b).getPropertyValue("opacity"),f="0"==e?"1":"0";c=b.animate({opacity:[f,f]},{duration:1}),c.currentTime=0,d=getComputedStyle(b).getPropertyValue("opacity")==f}catch(a){}finally{c&&c.cancel()}if(!d){var g=window.Element.prototype.animate;window.Element.prototype.animate=function(b,c){return window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||null===b||(b=a.convertToArrayForm(b)),g.call(this,b,c)}}}(c),function(a,b,c){function d(a){var c=b.timeline;c.currentTime=a,c._discardAnimations(),0==c._animations.length?f=!1:requestAnimationFrame(d)}var e=window.requestAnimationFrame;window.requestAnimationFrame=function(a){return e(function(c){b.timeline._updateAnimationsPromises(),a(c),b.timeline._updateAnimationsPromises()})},b.AnimationTimeline=function(){this._animations=[],this.currentTime=void 0},b.AnimationTimeline.prototype={getAnimations:function(){return this._discardAnimations(),this._animations.slice()},_updateAnimationsPromises:function(){b.animationsWithPromises=b.animationsWithPromises.filter(function(a){return a._updatePromises()})},_discardAnimations:function(){this._updateAnimationsPromises(),this._animations=this._animations.filter(function(a){return"finished"!=a.playState&&"idle"!=a.playState})},_play:function(a){var c=new b.Animation(a,this);return this._animations.push(c),b.restartWebAnimationsNextTick(),c._updatePromises(),c._animation.play(),c._updatePromises(),c},play:function(a){return a&&a.remove(),this._play(a)}};var f=!1;b.restartWebAnimationsNextTick=function(){f||(f=!0,requestAnimationFrame(d))};var g=new b.AnimationTimeline;b.timeline=g;try{Object.defineProperty(window.document,"timeline",{configurable:!0,get:function(){return g}})}catch(a){}try{window.document.timeline=g}catch(a){}}(0,e),function(a,b,c){b.animationsWithPromises=[],b.Animation=function(b,c){if(this.id="",b&&b._id&&(this.id=b._id),this.effect=b,b&&(b._animation=this),!c)throw new Error("Animation with null timeline is not supported");this._timeline=c,this._sequenceNumber=a.sequenceNumber++,this._holdTime=0,this._paused=!1,this._isGroup=!1,this._animation=null,this._childAnimations=[],this._callback=null,this._oldPlayState="idle",this._rebuildUnderlyingAnimation(),this._animation.cancel(),this._updatePromises()},b.Animation.prototype={_updatePromises:function(){var a=this._oldPlayState,b=this.playState;return this._readyPromise&&b!==a&&("idle"==b?(this._rejectReadyPromise(),this._readyPromise=void 0):"pending"==a?this._resolveReadyPromise():"pending"==b&&(this._readyPromise=void 0)),this._finishedPromise&&b!==a&&("idle"==b?(this._rejectFinishedPromise(),this._finishedPromise=void 0):"finished"==b?this._resolveFinishedPromise():"finished"==a&&(this._finishedPromise=void 0)),this._oldPlayState=this.playState,this._readyPromise||this._finishedPromise},_rebuildUnderlyingAnimation:function(){this._updatePromises();var a,c,d,e,f=!!this._animation;f&&(a=this.playbackRate,c=this._paused,d=this.startTime,e=this.currentTime,this._animation.cancel(),this._animation._wrapper=null,this._animation=null),(!this.effect||this.effect instanceof window.KeyframeEffect)&&(this._animation=b.newUnderlyingAnimationForKeyframeEffect(this.effect),b.bindAnimationForKeyframeEffect(this)),(this.effect instanceof window.SequenceEffect||this.effect instanceof window.GroupEffect)&&(this._animation=b.newUnderlyingAnimationForGroup(this.effect),b.bindAnimationForGroup(this)),this.effect&&this.effect._onsample&&b.bindAnimationForCustomEffect(this),f&&(1!=a&&(this.playbackRate=a),null!==d?this.startTime=d:null!==e?this.currentTime=e:null!==this._holdTime&&(this.currentTime=this._holdTime),c&&this.pause()),this._updatePromises()},_updateChildren:function(){if(this.effect&&"idle"!=this.playState){var a=this.effect._timing.delay;this._childAnimations.forEach(function(c){this._arrangeChildren(c,a),this.effect instanceof window.SequenceEffect&&(a+=b.groupChildDuration(c.effect))}.bind(this))}},_setExternalAnimation:function(a){if(this.effect&&this._isGroup)for(var b=0;b<this.effect.children.length;b++)this.effect.children[b]._animation=a,this._childAnimations[b]._setExternalAnimation(a)},_constructChildAnimations:function(){if(this.effect&&this._isGroup){var a=this.effect._timing.delay;this._removeChildAnimations(),this.effect.children.forEach(function(c){var d=b.timeline._play(c);this._childAnimations.push(d),d.playbackRate=this.playbackRate,this._paused&&d.pause(),c._animation=this.effect._animation,this._arrangeChildren(d,a),this.effect instanceof window.SequenceEffect&&(a+=b.groupChildDuration(c))}.bind(this))}},_arrangeChildren:function(a,b){null===this.startTime?a.currentTime=this.currentTime-b/this.playbackRate:a.startTime!==this.startTime+b/this.playbackRate&&(a.startTime=this.startTime+b/this.playbackRate)},get timeline(){return this._timeline},get playState(){return this._animation?this._animation.playState:"idle"},get finished(){return window.Promise?(this._finishedPromise||(-1==b.animationsWithPromises.indexOf(this)&&b.animationsWithPromises.push(this),this._finishedPromise=new Promise(function(a,b){this._resolveFinishedPromise=function(){a(this)},this._rejectFinishedPromise=function(){b({type:DOMException.ABORT_ERR,name:"AbortError"})}}.bind(this)),"finished"==this.playState&&this._resolveFinishedPromise()),this._finishedPromise):(console.warn("Animation Promises require JavaScript Promise constructor"),null)},get ready(){return window.Promise?(this._readyPromise||(-1==b.animationsWithPromises.indexOf(this)&&b.animationsWithPromises.push(this),this._readyPromise=new Promise(function(a,b){this._resolveReadyPromise=function(){a(this)},this._rejectReadyPromise=function(){b({type:DOMException.ABORT_ERR,name:"AbortError"})}}.bind(this)),"pending"!==this.playState&&this._resolveReadyPromise()),this._readyPromise):(console.warn("Animation Promises require JavaScript Promise constructor"),null)},get onfinish(){return this._animation.onfinish},set onfinish(a){this._animation.onfinish="function"==typeof a?function(b){b.target=this,a.call(this,b)}.bind(this):a},get oncancel(){return this._animation.oncancel},set oncancel(a){this._animation.oncancel="function"==typeof a?function(b){b.target=this,a.call(this,b)}.bind(this):a},get currentTime(){this._updatePromises();var a=this._animation.currentTime;return this._updatePromises(),a},set currentTime(a){this._updatePromises(),this._animation.currentTime=isFinite(a)?a:Math.sign(a)*Number.MAX_VALUE,this._register(),this._forEachChild(function(b,c){b.currentTime=a-c}),this._updatePromises()},get startTime(){return this._animation.startTime},set startTime(a){this._updatePromises(),this._animation.startTime=isFinite(a)?a:Math.sign(a)*Number.MAX_VALUE,this._register(),this._forEachChild(function(b,c){b.startTime=a+c}),this._updatePromises()},get playbackRate(){return this._animation.playbackRate},set playbackRate(a){this._updatePromises();var b=this.currentTime;this._animation.playbackRate=a,this._forEachChild(function(b){b.playbackRate=a}),null!==b&&(this.currentTime=b),this._updatePromises()},play:function(){this._updatePromises(),this._paused=!1,this._animation.play(),-1==this._timeline._animations.indexOf(this)&&this._timeline._animations.push(this),this._register(),b.awaitStartTime(this),this._forEachChild(function(a){var b=a.currentTime;a.play(),a.currentTime=b}),this._updatePromises()},pause:function(){this._updatePromises(),this.currentTime&&(this._holdTime=this.currentTime),this._animation.pause(),this._register(),this._forEachChild(function(a){a.pause()}),this._paused=!0,this._updatePromises()},finish:function(){this._updatePromises(),this._animation.finish(),this._register(),this._updatePromises()},cancel:function(){this._updatePromises(),this._animation.cancel(),this._register(),this._removeChildAnimations(),this._updatePromises()},reverse:function(){this._updatePromises();var a=this.currentTime;this._animation.reverse(),this._forEachChild(function(a){a.reverse()}),null!==a&&(this.currentTime=a),this._updatePromises()},addEventListener:function(a,b){var c=b;"function"==typeof b&&(c=function(a){a.target=this,b.call(this,a)}.bind(this),b._wrapper=c),this._animation.addEventListener(a,c)},removeEventListener:function(a,b){this._animation.removeEventListener(a,b&&b._wrapper||b)},_removeChildAnimations:function(){for(;this._childAnimations.length;)this._childAnimations.pop().cancel()},_forEachChild:function(b){var c=0;if(this.effect.children&&this._childAnimations.length<this.effect.children.length&&this._constructChildAnimations(),this._childAnimations.forEach(function(a){b.call(this,a,c),this.effect instanceof window.SequenceEffect&&(c+=a.effect.activeDuration)}.bind(this)),"pending"!=this.playState){var d=this.effect._timing,e=this.currentTime;null!==e&&(e=a.calculateIterationProgress(a.calculateActiveDuration(d),e,d)),(null==e||isNaN(e))&&this._removeChildAnimations()}}},window.Animation=b.Animation}(c,e),function(a,b,c){function d(b){this._frames=a.normalizeKeyframes(b)}function e(){for(var a=!1;i.length;)i.shift()._updateChildren(),a=!0;return a}var f=function(a){if(a._animation=void 0,a instanceof window.SequenceEffect||a instanceof window.GroupEffect)for(var b=0;b<a.children.length;b++)f(a.children[b])};b.removeMulti=function(a){for(var b=[],c=0;c<a.length;c++){var d=a[c];d._parent?(-1==b.indexOf(d._parent)&&b.push(d._parent),d._parent.children.splice(d._parent.children.indexOf(d),1),d._parent=null,f(d)):d._animation&&d._animation.effect==d&&(d._animation.cancel(),d._animation.effect=new KeyframeEffect(null,[]),d._animation._callback&&(d._animation._callback._animation=null),d._animation._rebuildUnderlyingAnimation(),f(d))}for(c=0;c<b.length;c++)b[c]._rebuild()},b.KeyframeEffect=function(b,c,e,f){return this.target=b,this._parent=null,e=a.numericTimingToObject(e),this._timingInput=a.cloneTimingInput(e),this._timing=a.normalizeTimingInput(e),this.timing=a.makeTiming(e,!1,this),this.timing._effect=this,"function"==typeof c?(a.deprecated("Custom KeyframeEffect","2015-06-22","Use KeyframeEffect.onsample instead."),this._normalizedKeyframes=c):this._normalizedKeyframes=new d(c),this._keyframes=c,this.activeDuration=a.calculateActiveDuration(this._timing),this._id=f,this},b.KeyframeEffect.prototype={getFrames:function(){return"function"==typeof this._normalizedKeyframes?this._normalizedKeyframes:this._normalizedKeyframes._frames},set onsample(a){if("function"==typeof this.getFrames())throw new Error("Setting onsample on custom effect KeyframeEffect is not supported.");this._onsample=a,this._animation&&this._animation._rebuildUnderlyingAnimation()},get parent(){return this._parent},clone:function(){if("function"==typeof this.getFrames())throw new Error("Cloning custom effects is not supported.");var b=new KeyframeEffect(this.target,[],a.cloneTimingInput(this._timingInput),this._id);return b._normalizedKeyframes=this._normalizedKeyframes,b._keyframes=this._keyframes,b},remove:function(){b.removeMulti([this])}};var g=Element.prototype.animate;Element.prototype.animate=function(a,c){var d="";return c&&c.id&&(d=c.id),b.timeline._play(new b.KeyframeEffect(this,a,c,d))};var h=document.createElementNS("http://www.w3.org/1999/xhtml","div");b.newUnderlyingAnimationForKeyframeEffect=function(a){if(a){var b=a.target||h,c=a._keyframes;"function"==typeof c&&(c=[]);var d=a._timingInput;d.id=a._id}else var b=h,c=[],d=0;return g.apply(b,[c,d])},b.bindAnimationForKeyframeEffect=function(a){a.effect&&"function"==typeof a.effect._normalizedKeyframes&&b.bindAnimationForCustomEffect(a)};var i=[];b.awaitStartTime=function(a){null===a.startTime&&a._isGroup&&(0==i.length&&requestAnimationFrame(e),i.push(a))};var j=window.getComputedStyle;Object.defineProperty(window,"getComputedStyle",{configurable:!0,enumerable:!0,value:function(){b.timeline._updateAnimationsPromises();var a=j.apply(this,arguments);return e()&&(a=j.apply(this,arguments)),b.timeline._updateAnimationsPromises(),a}}),window.KeyframeEffect=b.KeyframeEffect,window.Element.prototype.getAnimations=function(){return document.timeline.getAnimations().filter(function(a){return null!==a.effect&&a.effect.target==this}.bind(this))}}(c,e),function(a,b,c){function d(a){a._registered||(a._registered=!0,g.push(a),h||(h=!0,requestAnimationFrame(e)))}function e(a){var b=g;g=[],b.sort(function(a,b){return a._sequenceNumber-b._sequenceNumber}),b=b.filter(function(a){a();var b=a._animation?a._animation.playState:"idle";return"running"!=b&&"pending"!=b&&(a._registered=!1),a._registered}),g.push.apply(g,b),g.length?(h=!0,requestAnimationFrame(e)):h=!1}var f=(document.createElementNS("http://www.w3.org/1999/xhtml","div"),0);b.bindAnimationForCustomEffect=function(b){var c,e=b.effect.target,g="function"==typeof b.effect.getFrames();c=g?b.effect.getFrames():b.effect._onsample;var h=b.effect.timing,i=null;h=a.normalizeTimingInput(h);var j=function(){var d=j._animation?j._animation.currentTime:null;null!==d&&(d=a.calculateIterationProgress(a.calculateActiveDuration(h),d,h),isNaN(d)&&(d=null)),d!==i&&(g?c(d,e,b.effect):c(d,b.effect,b.effect._animation)),i=d};j._animation=b,j._registered=!1,j._sequenceNumber=f++,b._callback=j,d(j)};var g=[],h=!1;b.Animation.prototype._register=function(){this._callback&&d(this._callback)}}(c,e),function(a,b,c){function d(a){return a._timing.delay+a.activeDuration+a._timing.endDelay}function e(b,c,d){this._id=d,this._parent=null,this.children=b||[],this._reparent(this.children),c=a.numericTimingToObject(c),this._timingInput=a.cloneTimingInput(c),this._timing=a.normalizeTimingInput(c,!0),this.timing=a.makeTiming(c,!0,this),this.timing._effect=this,"auto"===this._timing.duration&&(this._timing.duration=this.activeDuration)}window.SequenceEffect=function(){e.apply(this,arguments)},window.GroupEffect=function(){e.apply(this,arguments)},e.prototype={_isAncestor:function(a){for(var b=this;null!==b;){if(b==a)return!0;b=b._parent}return!1},_rebuild:function(){for(var a=this;a;)"auto"===a.timing.duration&&(a._timing.duration=a.activeDuration),a=a._parent;this._animation&&this._animation._rebuildUnderlyingAnimation()},_reparent:function(a){b.removeMulti(a);for(var c=0;c<a.length;c++)a[c]._parent=this},_putChild:function(a,b){for(var c=b?"Cannot append an ancestor or self":"Cannot prepend an ancestor or self",d=0;d<a.length;d++)if(this._isAncestor(a[d]))throw{type:DOMException.HIERARCHY_REQUEST_ERR,name:"HierarchyRequestError",message:c};for(var d=0;d<a.length;d++)b?this.children.push(a[d]):this.children.unshift(a[d]);this._reparent(a),this._rebuild()},append:function(){this._putChild(arguments,!0)},prepend:function(){this._putChild(arguments,!1)},get parent(){return this._parent},get firstChild(){return this.children.length?this.children[0]:null},get lastChild(){return this.children.length?this.children[this.children.length-1]:null},clone:function(){for(var b=a.cloneTimingInput(this._timingInput),c=[],d=0;d<this.children.length;d++)c.push(this.children[d].clone());return this instanceof GroupEffect?new GroupEffect(c,b):new SequenceEffect(c,b)},remove:function(){b.removeMulti([this])}},window.SequenceEffect.prototype=Object.create(e.prototype),Object.defineProperty(window.SequenceEffect.prototype,"activeDuration",{get:function(){var a=0;return this.children.forEach(function(b){a+=d(b)}),Math.max(a,0)}}),window.GroupEffect.prototype=Object.create(e.prototype),Object.defineProperty(window.GroupEffect.prototype,"activeDuration",{get:function(){var a=0;return this.children.forEach(function(b){a=Math.max(a,d(b))}),a}}),b.newUnderlyingAnimationForGroup=function(c){var d,e=null,f=function(b){var c=d._wrapper;if(c&&"pending"!=c.playState&&c.effect)return null==b?void c._removeChildAnimations():0==b&&c.playbackRate<0&&(e||(e=a.normalizeTimingInput(c.effect.timing)),b=a.calculateIterationProgress(a.calculateActiveDuration(e),-1,e),isNaN(b)||null==b)?(c._forEachChild(function(a){a.currentTime=-1}),void c._removeChildAnimations()):void 0},g=new KeyframeEffect(null,[],c._timing,c._id);return g.onsample=f,d=b.timeline._play(g)},b.bindAnimationForGroup=function(a){a._animation._wrapper=a,a._isGroup=!0,b.awaitStartTime(a),a._constructChildAnimations(),a._setExternalAnimation(a)},b.groupChildDuration=d}(c,e),b.true=a}({},function(){return this}());
//# sourceMappingURL=web-animations-next-lite.min.js.map

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/main.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min__ = __webpack_require__("./node_modules/web-animations-js/web-animations-next-lite.min.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_vdom__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/vdom.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_themes_dojo_index_css__ = __webpack_require__("./node_modules/@dojo/themes/dojo/index.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_themes_dojo_index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__dojo_themes_dojo_index_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__widgets_App__ = __webpack_require__("./src/widgets/App.ts");





const r = Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_vdom__["a" /* default */])(() => Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_4__widgets_App__["a" /* default */], {}));
r.mount();


/***/ }),

/***/ "./src/widgets/App.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Cat__ = __webpack_require__("./src/widgets/Cat.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Dog__ = __webpack_require__("./src/widgets/Dog.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__ = __webpack_require__("./src/widgets/styles/app.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__CoreAudio__ = __webpack_require__("./src/widgets/CoreAudio.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__dojo_widgets_slider__ = __webpack_require__("./node_modules/@dojo/widgets/slider/index.mjs");







class App extends __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_WidgetBase__["b" /* default */] {
    constructor() {
        super(...arguments);
        this.coreAudio = new __WEBPACK_IMPORTED_MODULE_5__CoreAudio__["a" /* CoreAudio */]();
        this.choice = '';
        this.excitedValue = 1;
        this.playing = false;
    }
    _onChoiceClick(choice) {
        this.choice = choice;
        this.invalidate();
    }
    _onSpeakClick() {
        this.playing = true;
        this.coreAudio.play(this.choice, this.excitedValue, () => {
            this.playing = false;
            this.invalidate();
        });
        this.invalidate();
    }
    _excitedChange(value) {
        this.excitedValue = value;
        this.invalidate();
    }
    render() {
        const { excitedValue, choice, playing } = this;
        return Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('header', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["header"] }, [
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('button', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["button"], onclick: () => {
                        this._onChoiceClick('cat');
                    } }, ['Cats']),
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('p', {}, ['vs']),
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('button', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["button"], onclick: () => {
                        this._onChoiceClick('dog');
                    } }, ['Dogs'])
            ]),
            this.choice ? Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["controls"] }, [
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_6__dojo_widgets_slider__["a" /* default */], {
                    extraClasses: { root: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["slider"] },
                    label: `How Excited is the ${choice}`,
                    value: excitedValue,
                    min: 0.1,
                    max: 3,
                    step: 0.1,
                    onChange: this._excitedChange
                }),
                Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["g" /* v */])('button', {
                    classes: __WEBPACK_IMPORTED_MODULE_4__styles_app_m_css__["button"],
                    onclick: this._onSpeakClick,
                    disabled: playing
                }, ['Speak'])
            ]) : undefined,
            this.choice === 'cat' ? Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_2__Cat__["a" /* Cat */], { animationSpeed: excitedValue }) : undefined,
            this.choice === 'dog' ? Object(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_d__["h" /* w */])(__WEBPACK_IMPORTED_MODULE_3__Dog__["a" /* Dog */], { animationSpeed: excitedValue }) : undefined
        ]);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = App;



/***/ }),

/***/ "./src/widgets/Cat.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__ = __webpack_require__("./src/widgets/styles/cat.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_meta_WebAnimation__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");





const head = __webpack_require__("./src/widgets/assets/cat-head.png");
const body = __webpack_require__("./src/widgets/assets/cat-body.png");
const tail = __webpack_require__("./src/widgets/assets/cat-tail.png");
class Cat extends Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_mixins_Themed__["b" /* default */])(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]) {
    _getHeadAnimation(animationSpeed) {
        return {
            id: 'cat-head',
            effects: [
                { marginBottom: '0px' },
                { marginBottom: '5px' },
                { marginBottom: '0px' }
            ],
            timing: {
                duration: 800,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    _getTailAnimation(animationSpeed) {
        return {
            id: 'cat-tail',
            effects: [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(-10deg)' },
                { transform: 'rotate(0deg)' }
            ],
            timing: {
                duration: 1000,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    render() {
        const { animationSpeed } = this.properties;
        this.meta(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('cat-head', this._getHeadAnimation(animationSpeed));
        this.meta(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('cat-tail', this._getTailAnimation(animationSpeed));
        return Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'cat-head', src: head, classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["head"] }),
            Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'cat-body', src: body, classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["body"] }),
            Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'cat-tail', src: tail, classes: __WEBPACK_IMPORTED_MODULE_1__styles_cat_m_css__["tail"] })
        ]);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Cat;



/***/ }),

/***/ "./src/widgets/CoreAudio.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");

const AudioContext = window.AudioContext || window.webkitAudioContext; // safari :\
class CoreAudio {
    constructor() {
        this.audioMap = new Map();
    }
    play(sound, speed, onStop) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            if (!this.context) {
                this.context = new AudioContext();
            }
            // Chrome and Safari are both awful
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            const source = this.context.createBufferSource();
            source.buffer = yield this.loadCached(sound);
            source.connect(this.context.destination);
            source.playbackRate.value = speed;
            source.loop = true;
            source.start(this.context.currentTime);
            setTimeout(() => {
                source.stop();
                onStop();
            }, 5000);
            console.log(sound);
        });
    }
    loadCached(sound) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            if (this.audioMap.has(sound)) {
                return this.audioMap.get(sound);
            }
            const buffer = yield this.loadAudio(sound);
            this.audioMap.set(sound, buffer);
            return buffer;
        });
    }
    loadAudio(sound) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            const result = yield fetch(`assets/sounds/${sound}.mp3`);
            const audioData = yield result.arrayBuffer();
            if (this.context.decodeAudioData.length === 1) {
                return yield this.context.decodeAudioData(audioData);
            }
            else {
                return yield new Promise((resolve, reject) => {
                    this.context.decodeAudioData(audioData, resolve, reject);
                });
            }
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CoreAudio;



/***/ }),

/***/ "./src/widgets/Dog.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Dog; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__ = __webpack_require__("./src/widgets/styles/dog.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs");






const head = __webpack_require__("./src/widgets/assets/dog-head.png");
const body = __webpack_require__("./src/widgets/assets/dog-body.png");
const tail = __webpack_require__("./src/widgets/assets/dog-tail.png");
let Dog = class Dog extends Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]) {
    _getHeadAnimation(animationSpeed) {
        return {
            id: 'dog-head',
            effects: [
                { marginBottom: '0px' },
                { marginBottom: '5px' },
                { marginBottom: '0px' }
            ],
            timing: {
                duration: 800,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    _getTailAnimation(animationSpeed) {
        return {
            id: 'dog-tail',
            effects: [
                { transform: 'rotate(10deg)' },
                { transform: 'rotate(-10deg)' },
                { transform: 'rotate(10deg)' }
            ],
            timing: {
                duration: 1000,
                iterations: Infinity
            },
            controls: {
                play: true,
                playbackRate: animationSpeed
            }
        };
    }
    render() {
        const { animationSpeed } = this.properties;
        this.meta(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('dog-head', this._getHeadAnimation(animationSpeed));
        this.meta(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate('dog-tail', this._getTailAnimation(animationSpeed));
        return Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'dog-head', src: head, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["head"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'dog-body', src: body, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["body"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["g" /* v */])('img', { key: 'dog-tail', src: tail, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__["tail"] })
        ]);
    }
};
Dog = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["d" /* theme */])(__WEBPACK_IMPORTED_MODULE_3__styles_dog_m_css__)
], Dog);



/***/ }),

/***/ "./src/widgets/assets/cat-body.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-body.4mNxJ_Nx.png";

/***/ }),

/***/ "./src/widgets/assets/cat-head.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-head.1LN0FxJJ.png";

/***/ }),

/***/ "./src/widgets/assets/cat-tail.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-tail.2gwMshNt.png";

/***/ }),

/***/ "./src/widgets/assets/dog-body.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-body.1iM2hRU8.png";

/***/ }),

/***/ "./src/widgets/assets/dog-head.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-head.35KrvViJ.png";

/***/ }),

/***/ "./src/widgets/assets/dog-tail.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-tail.1v6Adw00.png";

/***/ }),

/***/ "./src/widgets/styles/app.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/app","root":"app-m__root__2lj42","button":"app-m__button__1hmKn","header":"app-m__header__3_gtv","controls":"app-m__controls__2hkAr","slider":"app-m__slider__oogtW"};

/***/ }),

/***/ "./src/widgets/styles/cat.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/cat","root":"cat-m__root__2IOrd","head":"cat-m__head__1iCbR","body":"cat-m__body__VBY2Y","tail":"cat-m__tail__16R-e"};

/***/ }),

/***/ "./src/widgets/styles/dog.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/dog","root":"dog-m__root__1zqdj","head":"dog-m__head__h5Y7i","body":"dog-m__body__1Pbg-","tail":"dog-m__tail__1K71t"};

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__("./node_modules/@dojo/webpack-contrib/build-time-render/hasBuildTimeRender.js");
__webpack_require__("./src/main.css");
module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy9EZXN0cm95YWJsZS50cyIsIndlYnBhY2s6Ly8vRXZlbnRlZC50cyIsIndlYnBhY2s6Ly8vdXRpbC50cyIsIndlYnBhY2s6Ly8vaGFzLnRzIiwid2VicGFjazovLy9NYXAudHMiLCJ3ZWJwYWNrOi8vL1Byb21pc2UudHMiLCJ3ZWJwYWNrOi8vL1NldC50cyIsIndlYnBhY2s6Ly8vU3ltYm9sLnRzIiwid2VicGFjazovLy9XZWFrTWFwLnRzIiwid2VicGFjazovLy9hcnJheS50cyIsIndlYnBhY2s6Ly8vZ2xvYmFsLnRzIiwid2VicGFjazovLy9pdGVyYXRvci50cyIsIndlYnBhY2s6Ly8vbnVtYmVyLnRzIiwid2VicGFjazovLy9vYmplY3QudHMiLCJ3ZWJwYWNrOi8vL3N0cmluZy50cyIsIndlYnBhY2s6Ly8vcXVldWUudHMiLCJ3ZWJwYWNrOi8vL0luamVjdG9yLnRzIiwid2VicGFjazovLy9Ob2RlSGFuZGxlci50cyIsIndlYnBhY2s6Ly8vUmVnaXN0cnkudHMiLCJ3ZWJwYWNrOi8vL1JlZ2lzdHJ5SGFuZGxlci50cyIsIndlYnBhY2s6Ly8vV2lkZ2V0QmFzZS50cyIsIndlYnBhY2s6Ly8vY3NzVHJhbnNpdGlvbnMudHMiLCJ3ZWJwYWNrOi8vL2QudHMiLCJ3ZWJwYWNrOi8vL2Fsd2F5c1JlbmRlci50cyIsIndlYnBhY2s6Ly8vYmVmb3JlUHJvcGVydGllcy50cyIsIndlYnBhY2s6Ly8vY3VzdG9tRWxlbWVudC50cyIsIndlYnBhY2s6Ly8vZGlmZlByb3BlcnR5LnRzIiwid2VicGFjazovLy9oYW5kbGVEZWNvcmF0b3IudHMiLCJ3ZWJwYWNrOi8vL2luamVjdC50cyIsIndlYnBhY2s6Ly8vZGlmZi50cyIsIndlYnBhY2s6Ly8vQmFzZS50cyIsIndlYnBhY2s6Ly8vRm9jdXMudHMiLCJ3ZWJwYWNrOi8vL1dlYkFuaW1hdGlvbi50cyIsIndlYnBhY2s6Ly8vVGhlbWVkLnRzIiwid2VicGFjazovLy9yZWdpc3RlckN1c3RvbUVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vL3Zkb20udHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3RoZW1lcy9kb2pvL2luZGV4LmNzcz83NzQxIiwid2VicGFjazovLy9oYXNCdWlsZFRpbWVSZW5kZXIudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzPzU1NmYiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzLmpzIiwid2VicGFjazovLy8uLi8uLi8uLi9zcmMvY29tbW9uL3V0aWwudHMiLCJ3ZWJwYWNrOi8vLy4uLy4uLy4uL3NyYy9sYWJlbC9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi4vLi4vLi4vc3JjL3NsaWRlci9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy9zbGlkZXIvc3R5bGVzL3NsaWRlci5tLmNzcz8wMTJkIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3NsaWRlci9zdHlsZXMvc2xpZGVyLm0uY3NzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3RoZW1lL2xhYmVsLm0uY3NzP2FkMTMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvbGFiZWwubS5jc3MuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzPzY0YjUiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvd2ViLWFuaW1hdGlvbnMtanMvd2ViLWFuaW1hdGlvbnMtbmV4dC1saXRlLm1pbi5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8uL3NyYy9tYWluLmNzcz8zOGRiIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL0FwcC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9DYXQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvQ29yZUF1ZGlvLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL0RvZy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWJvZHkucG5nIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtaGVhZC5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC10YWlsLnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctaGVhZC5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvYXNzZXRzL2RvZy10YWlsLnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9zdHlsZXMvYXBwLm0uY3NzPzM0MjAiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvc3R5bGVzL2NhdC5tLmNzcz9jMTg3Iiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL3N0eWxlcy9kb2cubS5jc3M/NDY5NyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7O0FDVkE7QUFBc0M7QUFhdEM7O0dBRUc7QUFDSDtJQUNDLE1BQU0sQ0FBQyw4REFBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRUQ7O0dBRUc7QUFDSDtJQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBRU07SUFNTjs7T0FFRztJQUNIO1FBQ0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEdBQUcsQ0FBQyxNQUFjO1FBQ2pCLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDO1lBQ04sT0FBTztnQkFDTixRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xCLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPO1FBQ04sTUFBTSxDQUFDLElBQUksOERBQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBQUE7QUFBQTtBQUVjLHFGQUFXLEVBQUM7Ozs7Ozs7OztBQzNFM0I7QUFBQTtBQUFBO0FBQThCO0FBQ3NCO0FBRXBEOzs7QUFHQSxNQUFNLFNBQVEsRUFBRyxJQUFJLDBEQUFHLEVBQWtCO0FBYzFDOzs7OztBQUtNLHFCQUFzQixVQUEyQixFQUFFLFlBQTZCO0lBQ3JGLEdBQUcsQ0FBQyxPQUFPLGFBQVksSUFBSyxTQUFRLEdBQUksT0FBTyxXQUFVLElBQUssU0FBUSxHQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFDLElBQUssQ0FBQyxDQUFDLEVBQUU7UUFDekcsSUFBSSxLQUFhO1FBQ2pCLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLE1BQUssRUFBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRTtRQUNsQztRQUFFLEtBQUs7WUFDTixNQUFLLEVBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQzFELFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztRQUNoQztRQUNBLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDaEM7SUFBRSxLQUFLO1FBQ04sT0FBTyxXQUFVLElBQUssWUFBWTtJQUNuQztBQUNEO0FBeUJBOzs7QUFHTSxjQUlKLFFBQVEsa0VBQVc7SUFKckI7O1FBU0M7OztRQUdVLGtCQUFZLEVBQThDLElBQUksMERBQUcsRUFBRTtJQThEOUU7SUFyREMsSUFBSSxDQUFDLEtBQVU7UUFDZCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRTtZQUMzQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQVcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRTtvQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO2dCQUN6QixDQUFDLENBQUM7WUFDSDtRQUNELENBQUMsQ0FBQztJQUNIO0lBc0JBLEVBQUUsQ0FBQyxJQUFTLEVBQUUsUUFBMEM7UUFDdkQsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDNUIsTUFBTSxRQUFPLEVBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzdFLE9BQU87Z0JBQ04sT0FBTztvQkFDTixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM5QzthQUNBO1FBQ0Y7UUFDQSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztJQUN6QztJQUVRLFlBQVksQ0FBQyxJQUFpQixFQUFFLFFBQStCO1FBQ3RFLE1BQU0sVUFBUyxFQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksRUFBQyxHQUFJLEVBQUU7UUFDbkQsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQztRQUN0QyxPQUFPO1lBQ04sT0FBTyxFQUFFLEdBQUcsR0FBRTtnQkFDYixNQUFNLFVBQVMsRUFBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsR0FBSSxFQUFFO2dCQUNuRCxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pEO1NBQ0E7SUFDRjs7OztBQUdjLGlGQUFPLEVBQUM7Ozs7Ozs7OztBQzVJdkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO0FBQ3BDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0FBRXZEOzs7Ozs7Ozs7R0FTRztBQUNILDhCQUE4QixLQUFVO0lBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssaUJBQWlCLENBQUM7QUFDcEUsQ0FBQztBQUVELG1CQUFzQixLQUFVLEVBQUUsU0FBa0I7SUFDbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBUyxJQUFPO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBUSxDQUFDO1FBQzFDLENBQUM7UUFFRCxNQUFNLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7WUFDakMsQ0FBQyxDQUFDLElBQUk7WUFDTixDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUNQLElBQUksRUFBRSxJQUFJO2dCQUNWLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixPQUFPLEVBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ3pCLE1BQU0sRUFBSyxFQUFFO2FBQ1osQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBVUQsZ0JBQTRDLE1BQXVCO0lBQ2xFLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDekIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNuQyxNQUFNLE1BQU0sR0FBUSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0lBQ25DLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUVoQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDaEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdDLFFBQVEsQ0FBQztRQUNWLENBQUM7UUFDRCxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELElBQUksS0FBSyxHQUFRLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFN0IsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLFFBQVEsQ0FBQztnQkFDVixDQUFDO2dCQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ1YsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNyQyxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLE1BQU0sV0FBVyxHQUFRLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3BCLEtBQUssR0FBRyxNQUFNLENBQUM7NEJBQ2QsSUFBSSxFQUFFLElBQUk7NEJBQ1YsU0FBUyxFQUFFLFNBQVM7NEJBQ3BCLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQzs0QkFDaEIsTUFBTSxFQUFFLFdBQVc7NEJBQ25CLE1BQU07eUJBQ04sQ0FBQyxDQUFDO29CQUNKLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVELE1BQU0sQ0FBUSxNQUFNLENBQUM7QUFDdEIsQ0FBQztBQTBDTSxvQkFBb0IsTUFBVyxFQUFFLEdBQUcsT0FBYztJQUN4RCxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2IsSUFBSSxFQUFFLElBQUk7UUFDVixTQUFTLEVBQUUsS0FBSztRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixNQUFNLEVBQUUsTUFBTTtLQUNkLENBQUMsQ0FBQztBQUNKLENBQUM7QUEwQ00sbUJBQW1CLE1BQVcsRUFBRSxHQUFHLE9BQWM7SUFDdkQsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNiLElBQUksRUFBRSxJQUFJO1FBQ1YsU0FBUyxFQUFFLElBQUk7UUFDZixPQUFPLEVBQUUsT0FBTztRQUNoQixNQUFNLEVBQUUsTUFBTTtLQUNkLENBQUMsQ0FBQztBQUNKLENBQUM7QUF3Q00sZUFBZSxNQUFXLEVBQUUsR0FBRyxPQUFjO0lBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDYixJQUFJLEVBQUUsS0FBSztRQUNYLFNBQVMsRUFBRSxJQUFJO1FBQ2YsT0FBTyxFQUFFLE9BQU87UUFDaEIsTUFBTSxFQUFFLE1BQU07S0FDZCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNJLGlCQUFpQixjQUF1QyxFQUFFLEdBQUcsWUFBbUI7SUFDdEYsTUFBTSxDQUFDO1FBQ04sTUFBTSxJQUFJLEdBQVUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUVqRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQUVNLGlDQUFpQyxRQUFrQyxFQUFFLEtBQWM7SUFDekYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzdCLElBQUksT0FBWSxDQUFDO0lBRWpCO1FBQ0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUNyQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLFFBQVEsRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsT0FBTyxHQUFHLFVBQVUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUM7SUFDRixDQUFDO0lBQ0QsT0FBTyxHQUFHLFVBQVUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUMsTUFBTSxDQUFDO1FBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUNiLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDaEIsQ0FBQztRQUNGLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQztBQUVNLGtCQUFpRSxRQUFXLEVBQUUsS0FBYTtJQUNqRyxJQUFJLEtBQW9CLENBQUM7SUFFekIsTUFBTSxDQUFJO1FBQ1QsS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV6QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxJQUFJLEdBQXNCLFNBQVMsQ0FBQztRQUV4QyxLQUFLLEdBQUcsdUJBQXVCLENBQUM7WUFDL0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUIsSUFBSSxHQUFHLE9BQU8sR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQy9CLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNYLENBQUMsQ0FBQztBQUNILENBQUM7QUFFTSxrQkFBaUUsUUFBVyxFQUFFLEtBQWE7SUFDakcsSUFBSSxHQUFtQixDQUFDO0lBRXhCLE1BQU0sQ0FBSTtRQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDVCxNQUFNLENBQUM7UUFDUixDQUFDO1FBRUQsR0FBRyxHQUFHLElBQUksQ0FBQztRQUVYLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLHVCQUF1QixDQUFDO1lBQ3ZCLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDWixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDWCxDQUFDLENBQUM7QUFDSCxDQUFDO0FBRU07SUFDTixNQUFNLENBQUMsc0NBQXNDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFTLENBQUM7UUFDeEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUNqQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7QUN6U0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsK0JBQStCLEtBQVU7SUFDeEMsT0FBTyxNQUFLLEdBQUksS0FBSyxDQUFDLElBQUk7QUFDM0I7QUFFQTs7O0FBR08sTUFBTSxVQUFTLEVBQTZDLEVBQUUsQ0FBQztBQUFBO0FBQUE7QUFFdEU7OztBQUdPLE1BQU0sY0FBYSxFQUF1QyxFQUFFLENBQUM7QUFBQTtBQUFBO0FBRXBFOzs7O0FBSUEsTUFBTSxjQUFhLEVBQStDLEVBQUU7QUF3QnBFOzs7QUFHQSxNQUFNLFlBQVcsRUFBRyxDQUFDO0lBQ3BCO0lBQ0EsR0FBRyxDQUFDLE9BQU8sT0FBTSxJQUFLLFdBQVcsRUFBRTtRQUNsQztRQUNBLE9BQU8sTUFBTTtJQUNkO0lBQUUsS0FBSyxHQUFHLENBQUMsT0FBTyxPQUFNLElBQUssV0FBVyxFQUFFO1FBQ3pDO1FBQ0EsT0FBTyxNQUFNO0lBQ2Q7SUFBRSxLQUFLLEdBQUcsQ0FBQyxPQUFPLEtBQUksSUFBSyxXQUFXLEVBQUU7UUFDdkM7UUFDQSxPQUFPLElBQUk7SUFDWjtJQUNBO0lBQ0EsT0FBTyxFQUFFO0FBQ1YsQ0FBQyxDQUFDLEVBQUU7QUFFSjtBQUNBLE1BQU0sRUFBRSxlQUFjLEVBQUUsRUFBdUIsV0FBVyxDQUFDLG1CQUFrQixHQUFJLEVBQUU7QUFFbkY7QUFDQSxHQUFHLENBQUMscUJBQW9CLEdBQUksV0FBVyxFQUFFO0lBQ3hDLE9BQU8sV0FBVyxDQUFDLGtCQUFrQjtBQUN0QztBQUVBOzs7Ozs7QUFNQSxpQ0FBaUMsS0FBVTtJQUMxQyxPQUFPLE9BQU8sTUFBSyxJQUFLLFVBQVU7QUFDbkM7QUFFQTs7OztBQUlBLE1BQU0sWUFBVyxFQUFzQjtJQUN0QyxFQUFFLHVCQUF1QixDQUFDLGNBQWM7UUFDdkMsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLFdBQVc7UUFDbEMsRUFBRTtJQUNILEVBQUUsRUFBRSxFQUFFOzs7Ozs7Ozs7Ozs7QUFZRCxjQUFlLFVBQWtCLEVBQUUsT0FBZ0IsRUFBRSxJQUEyQixFQUFFLE1BQWU7SUFDdEcsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRTtBQUNsRDtBQUVBOzs7Ozs7Ozs7QUFTTSxtQkFBb0IsVUFBa0IsRUFBRSxTQUF1QztJQUNwRixNQUFNLE9BQU0sRUFBcUIsVUFBVSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBQyxHQUFJLEVBQUU7SUFDekUsSUFBSSxFQUFDLEVBQUcsQ0FBQztJQUVULGFBQWEsSUFBYztRQUMxQixNQUFNLEtBQUksRUFBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDeEIsR0FBRyxDQUFDLEtBQUksSUFBSyxHQUFHLEVBQUU7WUFDakI7WUFDQSxPQUFPLElBQUk7UUFDWjtRQUFFLEtBQUs7WUFDTjtZQUNBLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUMsSUFBSyxHQUFHLEVBQUU7Z0JBQ3hCLEdBQUcsQ0FBQyxDQUFDLEtBQUksR0FBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3ZCO29CQUNBLE9BQU8sR0FBRyxFQUFFO2dCQUNiO2dCQUFFLEtBQUs7b0JBQ047b0JBQ0EsR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDVCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCO1lBQ0Q7WUFDQTtZQUNBLE9BQU8sSUFBSTtRQUNaO0lBQ0Q7SUFFQSxNQUFNLEdBQUUsRUFBRyxHQUFHLEVBQUU7SUFFaEIsT0FBTyxHQUFFLEdBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQztBQUMzQjtBQUVBOzs7OztBQUtNLGdCQUFpQixPQUFlO0lBQ3JDLE1BQU0sa0JBQWlCLEVBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRTtJQUUvQyxPQUFPLE9BQU8sQ0FDYixrQkFBaUIsR0FBSSxZQUFXLEdBQUksa0JBQWlCLEdBQUksVUFBUyxHQUFJLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUN0RztBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7OztBQWVNLGFBQ0wsT0FBZSxFQUNmLEtBQTRELEVBQzVELFlBQXFCLEtBQUs7SUFFMUIsTUFBTSxrQkFBaUIsRUFBRyxPQUFPLENBQUMsV0FBVyxFQUFFO0lBRS9DLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUMsR0FBSSxDQUFDLFVBQVMsR0FBSSxDQUFDLENBQUMsa0JBQWlCLEdBQUksV0FBVyxDQUFDLEVBQUU7UUFDbkYsTUFBTSxJQUFJLFNBQVMsQ0FBQyxZQUFZLE9BQU8sa0NBQWtDLENBQUM7SUFDM0U7SUFFQSxHQUFHLENBQUMsT0FBTyxNQUFLLElBQUssVUFBVSxFQUFFO1FBQ2hDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBQyxFQUFHLEtBQUs7SUFDekM7SUFBRSxLQUFLLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN4QyxhQUFhLENBQUMsT0FBTyxFQUFDLEVBQUcsS0FBSyxDQUFDLElBQUksQ0FDbEMsQ0FBQyxhQUFnQyxFQUFFLEdBQUU7WUFDcEMsU0FBUyxDQUFDLE9BQU8sRUFBQyxFQUFHLGFBQWE7WUFDbEMsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUMsRUFDRCxHQUFHLEdBQUU7WUFDSixPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDOUIsQ0FBQyxDQUNEO0lBQ0Y7SUFBRSxLQUFLO1FBQ04sU0FBUyxDQUFDLGlCQUFpQixFQUFDLEVBQUcsS0FBSztRQUNwQyxPQUFPLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQztJQUN4QztBQUNEO0FBRUE7Ozs7O0FBS2MsYUFBYyxPQUFlO0lBQzFDLElBQUksTUFBeUI7SUFFN0IsTUFBTSxrQkFBaUIsRUFBRyxPQUFPLENBQUMsV0FBVyxFQUFFO0lBRS9DLEdBQUcsQ0FBQyxrQkFBaUIsR0FBSSxXQUFXLEVBQUU7UUFDckMsT0FBTSxFQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztJQUN4QztJQUFFLEtBQUssR0FBRyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQzVDLE9BQU0sRUFBRyxTQUFTLENBQUMsaUJBQWlCLEVBQUMsRUFBRyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ25GLE9BQU8sYUFBYSxDQUFDLGlCQUFpQixDQUFDO0lBQ3hDO0lBQUUsS0FBSyxHQUFHLENBQUMsa0JBQWlCLEdBQUksU0FBUyxFQUFFO1FBQzFDLE9BQU0sRUFBRyxTQUFTLENBQUMsaUJBQWlCLENBQUM7SUFDdEM7SUFBRSxLQUFLLEdBQUcsQ0FBQyxRQUFPLEdBQUksYUFBYSxFQUFFO1FBQ3BDLE9BQU8sS0FBSztJQUNiO0lBQUUsS0FBSztRQUNOLE1BQU0sSUFBSSxTQUFTLENBQUMsK0NBQStDLE9BQU8sR0FBRyxDQUFDO0lBQy9FO0lBRUEsT0FBTyxNQUFNO0FBQ2Q7QUFFQTs7O0FBSUE7QUFFQTtBQUNBLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBRWxCO0FBQ0EsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUM7QUFFeEI7QUFDQSxHQUFHLENBQUMsY0FBYyxFQUFFLE9BQU8sU0FBUSxJQUFLLFlBQVcsR0FBSSxPQUFPLFNBQVEsSUFBSyxXQUFXLENBQUM7QUFFdkY7QUFDQSxHQUFHLENBQUMsV0FBVyxFQUFFO0lBQ2hCLEdBQUcsQ0FBQyxPQUFPLFFBQU8sSUFBSyxTQUFRLEdBQUksT0FBTyxDQUFDLFNBQVEsR0FBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtRQUM3RSxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSTtJQUM3QjtBQUNELENBQUMsQ0FBQzs7Ozs7Ozs7OztBQ3BRRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBbUY7QUFDckQ7QUFDWTtBQUNWO0FBQ2Q7QUF3SFgsSUFBSSxJQUFHLEVBQW1CLHdEQUFNLENBQUMsR0FBRztBQUUzQyxHQUFHLENBQUMsS0FBZSxFQUFFO0lBQ3BCLElBQUcsUUFBRztZQW1CTCxZQUFZLFFBQStDO2dCQWxCeEMsV0FBSyxFQUFRLEVBQUU7Z0JBQ2YsYUFBTyxFQUFRLEVBQUU7Z0JBaUdwQyxLQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUMsRUFBVSxLQUFLO2dCQS9FbEMsR0FBRyxDQUFDLFFBQVEsRUFBRTtvQkFDYixHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUMxQixJQUFJLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUN6QyxNQUFNLE1BQUssRUFBRyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzdCO29CQUNEO29CQUFFLEtBQUs7d0JBQ04sSUFBSSxDQUFDLE1BQU0sTUFBSyxHQUFJLFFBQVEsRUFBRTs0QkFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM3QjtvQkFDRDtnQkFDRDtZQUNEO1lBNUJBOzs7O1lBSVUsV0FBVyxDQUFDLElBQVMsRUFBRSxHQUFNO2dCQUN0QyxJQUFJLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxFQUFFLE9BQU0sRUFBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsRUFBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3RELEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO3dCQUMzQixPQUFPLENBQUM7b0JBQ1Q7Z0JBQ0Q7Z0JBQ0EsT0FBTyxDQUFDLENBQUM7WUFDVjtZQW1CQSxJQUFJLElBQUk7Z0JBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU07WUFDekI7WUFFQSxLQUFLO2dCQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTSxFQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTSxFQUFHLENBQUM7WUFDNUM7WUFFQSxNQUFNLENBQUMsR0FBTTtnQkFDWixNQUFNLE1BQUssRUFBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO2dCQUMvQyxHQUFHLENBQUMsTUFBSyxFQUFHLENBQUMsRUFBRTtvQkFDZCxPQUFPLEtBQUs7Z0JBQ2I7Z0JBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDN0IsT0FBTyxJQUFJO1lBQ1o7WUFFQSxPQUFPO2dCQUNOLE1BQU0sT0FBTSxFQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUM1QixDQUFDLEdBQU0sRUFBRSxDQUFTLEVBQVUsR0FBRTtvQkFDN0IsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQ0Q7Z0JBRUQsT0FBTyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDaEM7WUFFQSxPQUFPLENBQUMsUUFBMkQsRUFBRSxPQUFZO2dCQUNoRixNQUFNLEtBQUksRUFBRyxJQUFJLENBQUMsS0FBSztnQkFDdkIsTUFBTSxPQUFNLEVBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsT0FBTSxFQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQyxFQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7Z0JBQ2pEO1lBQ0Q7WUFFQSxHQUFHLENBQUMsR0FBTTtnQkFDVCxNQUFNLE1BQUssRUFBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO2dCQUMvQyxPQUFPLE1BQUssRUFBRyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ25EO1lBRUEsR0FBRyxDQUFDLEdBQU07Z0JBQ1QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLEVBQUcsQ0FBQyxDQUFDO1lBQzlDO1lBRUEsSUFBSTtnQkFDSCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDcEM7WUFFQSxHQUFHLENBQUMsR0FBTSxFQUFFLEtBQVE7Z0JBQ25CLElBQUksTUFBSyxFQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7Z0JBQzdDLE1BQUssRUFBRyxNQUFLLEVBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUs7Z0JBQzdDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEVBQUcsR0FBRztnQkFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsRUFBRyxLQUFLO2dCQUMzQixPQUFPLElBQUk7WUFDWjtZQUVBLE1BQU07Z0JBQ0wsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3RDO1lBRUEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdEI7U0FHQTtRQW5GTyxHQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUMsRUFBRyxFQUFJO1dBbUY5QjtBQUNGO0FBRWUsNERBQUcsRUFBQzs7Ozs7Ozs7OztBQ3JPbkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUE4QjtBQUNtQjtBQUUvQjtBQUNjO0FBZXpCLElBQUksWUFBVyxFQUFtQix3REFBTSxDQUFDLE9BQU87QUFFaEQsTUFBTSxXQUFVLEVBQUcsb0JBQXVCLEtBQVU7SUFDMUQsT0FBTyxNQUFLLEdBQUksT0FBTyxLQUFLLENBQUMsS0FBSSxJQUFLLFVBQVU7QUFDakQsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUVGLEdBQUcsQ0FBQyxLQUFtQixFQUFFO0lBT3hCLE1BQU0sQ0FBQyxRQUFPLEVBQUcsWUFBVyxRQUFHO1lBeUU5Qjs7Ozs7Ozs7Ozs7O1lBWUEsWUFBWSxRQUFxQjtnQkFzSGpDOzs7Z0JBR1EsV0FBSztnQkFjYixLQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUMsRUFBYyxTQUFTO2dCQXRJMUM7OztnQkFHQSxJQUFJLFVBQVMsRUFBRyxLQUFLO2dCQUVyQjs7O2dCQUdBLE1BQU0sV0FBVSxFQUFHLEdBQVksR0FBRTtvQkFDaEMsT0FBTyxJQUFJLENBQUMsTUFBSyxvQkFBa0IsR0FBSSxTQUFTO2dCQUNqRCxDQUFDO2dCQUVEOzs7Z0JBR0EsSUFBSSxVQUFTLEVBQStCLEVBQUU7Z0JBRTlDOzs7O2dCQUlBLElBQUksYUFBWSxFQUFHLFVBQVMsUUFBb0I7b0JBQy9DLEdBQUcsQ0FBQyxTQUFTLEVBQUU7d0JBQ2QsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ3pCO2dCQUNELENBQUM7Z0JBRUQ7Ozs7OztnQkFNQSxNQUFNLE9BQU0sRUFBRyxDQUFDLFFBQWUsRUFBRSxLQUFVLEVBQVEsR0FBRTtvQkFDcEQ7b0JBQ0EsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFLLG1CQUFrQixFQUFFO3dCQUNqQyxNQUFNO29CQUNQO29CQUVBLElBQUksQ0FBQyxNQUFLLEVBQUcsUUFBUTtvQkFDckIsSUFBSSxDQUFDLGNBQWEsRUFBRyxLQUFLO29CQUMxQixhQUFZLEVBQUcsY0FBYztvQkFFN0I7b0JBQ0E7b0JBQ0EsR0FBRyxDQUFDLFVBQVMsR0FBSSxTQUFTLENBQUMsT0FBTSxFQUFHLENBQUMsRUFBRTt3QkFDdEMsY0FBYyxDQUFDOzRCQUNkLEdBQUcsQ0FBQyxTQUFTLEVBQUU7Z0NBQ2QsSUFBSSxNQUFLLEVBQUcsU0FBUyxDQUFDLE1BQU07Z0NBQzVCLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsRUFBQyxFQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtvQ0FDL0IsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0NBQ3hCO2dDQUNBLFVBQVMsRUFBRyxJQUFJOzRCQUNqQjt3QkFDRCxDQUFDLENBQUM7b0JBQ0g7Z0JBQ0QsQ0FBQztnQkFFRDs7Ozs7O2dCQU1BLE1BQU0sUUFBTyxFQUFHLENBQUMsUUFBZSxFQUFFLEtBQVUsRUFBUSxHQUFFO29CQUNyRCxHQUFHLENBQUMsVUFBVSxFQUFFLEVBQUU7d0JBQ2pCLE1BQU07b0JBQ1A7b0JBRUEsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQWtCLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFpQixDQUFDO3dCQUNqRixVQUFTLEVBQUcsSUFBSTtvQkFDakI7b0JBQUUsS0FBSzt3QkFDTixNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztvQkFDeEI7Z0JBQ0QsQ0FBQztnQkFFRCxJQUFJLENBQUMsS0FBSSxFQUFHLENBQ1gsV0FBaUYsRUFDakYsVUFBbUYsRUFDcEQsR0FBRTtvQkFDakMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRTt3QkFDdEM7d0JBQ0E7d0JBQ0E7d0JBQ0EsWUFBWSxDQUFDLEdBQUcsR0FBRTs0QkFDakIsTUFBTSxTQUFRLEVBQ2IsSUFBSSxDQUFDLE1BQUsscUJBQW9CLEVBQUUsV0FBVyxFQUFFLFdBQVc7NEJBRXpELEdBQUcsQ0FBQyxPQUFPLFNBQVEsSUFBSyxVQUFVLEVBQUU7Z0NBQ25DLElBQUk7b0NBQ0gsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0NBQ3RDO2dDQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUU7b0NBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQztnQ0FDZDs0QkFDRDs0QkFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBSyxvQkFBbUIsRUFBRTtnQ0FDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7NEJBQzNCOzRCQUFFLEtBQUs7Z0NBQ04sT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7NEJBQzVCO3dCQUNELENBQUMsQ0FBQztvQkFDSCxDQUFDLENBQUM7Z0JBQ0gsQ0FBQztnQkFFRCxJQUFJO29CQUNILFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQWtCLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFpQixDQUFDO2dCQUNsRjtnQkFBRSxNQUFNLENBQUMsS0FBSyxFQUFFO29CQUNmLE1BQU0sbUJBQWlCLEtBQUssQ0FBQztnQkFDOUI7WUFDRDtZQWxNQSxPQUFPLEdBQUcsQ0FBQyxRQUF1RTtnQkFDakYsT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNO29CQUN2QyxNQUFNLE9BQU0sRUFBVSxFQUFFO29CQUN4QixJQUFJLFNBQVEsRUFBRyxDQUFDO29CQUNoQixJQUFJLE1BQUssRUFBRyxDQUFDO29CQUNiLElBQUksV0FBVSxFQUFHLElBQUk7b0JBRXJCLGlCQUFpQixLQUFhLEVBQUUsS0FBVTt3QkFDekMsTUFBTSxDQUFDLEtBQUssRUFBQyxFQUFHLEtBQUs7d0JBQ3JCLEVBQUUsUUFBUTt3QkFDVixNQUFNLEVBQUU7b0JBQ1Q7b0JBRUE7d0JBQ0MsR0FBRyxDQUFDLFdBQVUsR0FBSSxTQUFRLEVBQUcsS0FBSyxFQUFFOzRCQUNuQyxNQUFNO3dCQUNQO3dCQUNBLE9BQU8sQ0FBQyxNQUFNLENBQUM7b0JBQ2hCO29CQUVBLHFCQUFxQixLQUFhLEVBQUUsSUFBUzt3QkFDNUMsRUFBRSxLQUFLO3dCQUNQLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ3JCOzRCQUNBOzRCQUNBLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDO3dCQUM3Qzt3QkFBRSxLQUFLOzRCQUNOLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUN0RDtvQkFDRDtvQkFFQSxJQUFJLEVBQUMsRUFBRyxDQUFDO29CQUNULElBQUksQ0FBQyxNQUFNLE1BQUssR0FBSSxRQUFRLEVBQUU7d0JBQzdCLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO3dCQUNyQixDQUFDLEVBQUU7b0JBQ0o7b0JBQ0EsV0FBVSxFQUFHLEtBQUs7b0JBRWxCLE1BQU0sRUFBRTtnQkFDVCxDQUFDLENBQUM7WUFDSDtZQUVBLE9BQU8sSUFBSSxDQUFJLFFBQStEO2dCQUM3RSxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVMsT0FBOEIsRUFBRSxNQUFNO29CQUM5RCxJQUFJLENBQUMsTUFBTSxLQUFJLEdBQUksUUFBUSxFQUFFO3dCQUM1QixHQUFHLENBQUMsS0FBSSxXQUFZLE9BQU8sRUFBRTs0QkFDNUI7NEJBQ0E7NEJBQ0EsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO3dCQUMzQjt3QkFBRSxLQUFLOzRCQUNOLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzt3QkFDcEM7b0JBQ0Q7Z0JBQ0QsQ0FBQyxDQUFDO1lBQ0g7WUFFQSxPQUFPLE1BQU0sQ0FBQyxNQUFZO2dCQUN6QixPQUFPLElBQUksSUFBSSxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU07b0JBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2YsQ0FBQyxDQUFDO1lBQ0g7WUFJQSxPQUFPLE9BQU8sQ0FBSSxLQUFXO2dCQUM1QixPQUFPLElBQUksSUFBSSxDQUFDLFVBQVMsT0FBTztvQkFDL0IsT0FBTyxDQUFJLEtBQUssQ0FBQztnQkFDbEIsQ0FBQyxDQUFDO1lBQ0g7WUFnSUEsS0FBSyxDQUNKLFVBQWlGO2dCQUVqRixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztZQUN4QztTQW9CQTtRQXRKTyxHQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUMsRUFBdUIsV0FBa0M7V0FzSmhGO0FBQ0Y7QUFFZSxvRUFBVyxFQUFDOzs7Ozs7Ozs7O0FDalEzQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQThCO0FBQ3FEO0FBQ25EO0FBQ2Q7QUFtR1gsSUFBSSxJQUFHLEVBQW1CLHdEQUFNLENBQUMsR0FBRztBQUUzQyxHQUFHLENBQUMsS0FBZSxFQUFFO0lBQ3BCLElBQUcsUUFBRztZQUtMLFlBQVksUUFBcUM7Z0JBSmhDLGNBQVEsRUFBUSxFQUFFO2dCQXdFbkMsS0FBQyxNQUFNLENBQUMsV0FBVyxFQUFDLEVBQVUsS0FBSztnQkFuRWxDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7b0JBQ2IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDMUIsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs0QkFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RCO29CQUNEO29CQUFFLEtBQUs7d0JBQ04sSUFBSSxDQUFDLE1BQU0sTUFBSyxHQUFJLFFBQVEsRUFBRTs0QkFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7d0JBQ2hCO29CQUNEO2dCQUNEO1lBQ0Q7WUFFQSxHQUFHLENBQUMsS0FBUTtnQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDcEIsT0FBTyxJQUFJO2dCQUNaO2dCQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDekIsT0FBTyxJQUFJO1lBQ1o7WUFFQSxLQUFLO2dCQUNKLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTSxFQUFHLENBQUM7WUFDekI7WUFFQSxNQUFNLENBQUMsS0FBUTtnQkFDZCxNQUFNLElBQUcsRUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ3hDLEdBQUcsQ0FBQyxJQUFHLElBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ2YsT0FBTyxLQUFLO2dCQUNiO2dCQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sSUFBSTtZQUNaO1lBRUEsT0FBTztnQkFDTixPQUFPLElBQUksWUFBWSxDQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM5RjtZQUVBLE9BQU8sQ0FBQyxVQUFxRCxFQUFFLE9BQWE7Z0JBQzNFLE1BQU0sU0FBUSxFQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLElBQUksT0FBTSxFQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO29CQUNwQixVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO29CQUMxRCxPQUFNLEVBQUcsUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDekI7WUFDRDtZQUVBLEdBQUcsQ0FBQyxLQUFRO2dCQUNYLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLEVBQUcsQ0FBQyxDQUFDO1lBQ3pDO1lBRUEsSUFBSTtnQkFDSCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDdkM7WUFFQSxJQUFJLElBQUk7Z0JBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07WUFDNUI7WUFFQSxNQUFNO2dCQUNMLE9BQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN2QztZQUVBLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDaEIsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3ZDO1NBR0E7UUF2RU8sR0FBQyxNQUFNLENBQUMsT0FBTyxFQUFDLEVBQUcsRUFBSTtXQXVFOUI7QUFDRjtBQUVlLDREQUFHLEVBQUM7Ozs7Ozs7Ozs7QUN0TG5CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBZ0M7QUFDRjtBQUNzQjtBQVE3QyxJQUFJLE9BQU0sRUFBc0Isd0RBQU0sQ0FBQyxNQUFNO0FBRXBELEdBQUcsQ0FBQyxLQUFrQixFQUFFO0lBQ3ZCOzs7OztJQUtBLE1BQU0sZUFBYyxFQUFHLHdCQUF3QixLQUFVO1FBQ3hELEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQixNQUFNLElBQUksU0FBUyxDQUFDLE1BQUssRUFBRyxrQkFBa0IsQ0FBQztRQUNoRDtRQUNBLE9BQU8sS0FBSztJQUNiLENBQUM7SUFFRCxNQUFNLGlCQUFnQixFQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7SUFDaEQsTUFBTSxlQUFjLEVBSVQsTUFBTSxDQUFDLGNBQXFCO0lBQ3ZDLE1BQU0sT0FBTSxFQUFHLE1BQU0sQ0FBQyxNQUFNO0lBRTVCLE1BQU0sYUFBWSxFQUFHLE1BQU0sQ0FBQyxTQUFTO0lBRXJDLE1BQU0sY0FBYSxFQUE4QixFQUFFO0lBRW5ELE1BQU0sY0FBYSxFQUFHLENBQUM7UUFDdEIsTUFBTSxRQUFPLEVBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUM1QixPQUFPLFVBQVMsSUFBcUI7WUFDcEMsSUFBSSxRQUFPLEVBQUcsQ0FBQztZQUNmLElBQUksSUFBWTtZQUNoQixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxRQUFPLEdBQUksRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDL0MsRUFBRSxPQUFPO1lBQ1Y7WUFDQSxLQUFJLEdBQUksTUFBTSxDQUFDLFFBQU8sR0FBSSxFQUFFLENBQUM7WUFDN0IsT0FBTyxDQUFDLElBQUksRUFBQyxFQUFHLElBQUk7WUFDcEIsS0FBSSxFQUFHLEtBQUksRUFBRyxJQUFJO1lBRWxCO1lBQ0E7WUFDQSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN6RCxjQUFjLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRTtvQkFDbEMsR0FBRyxFQUFFLFVBQXVCLEtBQVU7d0JBQ3JDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN0RDtpQkFDQSxDQUFDO1lBQ0g7WUFFQSxPQUFPLElBQUk7UUFDWixDQUFDO0lBQ0YsQ0FBQyxDQUFDLEVBQUU7SUFFSixNQUFNLGVBQWMsRUFBRyxnQkFBMkIsV0FBNkI7UUFDOUUsR0FBRyxDQUFDLEtBQUksV0FBWSxjQUFjLEVBQUU7WUFDbkMsTUFBTSxJQUFJLFNBQVMsQ0FBQyx3Q0FBd0MsQ0FBQztRQUM5RDtRQUNBLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUMzQixDQUFDO0lBRUQsT0FBTSxFQUFHLE1BQU0sQ0FBQyxPQUFNLEVBQUcsZ0JBQThCLFdBQTZCO1FBQ25GLEdBQUcsQ0FBQyxLQUFJLFdBQVksTUFBTSxFQUFFO1lBQzNCLE1BQU0sSUFBSSxTQUFTLENBQUMsd0NBQXdDLENBQUM7UUFDOUQ7UUFDQSxNQUFNLElBQUcsRUFBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUM7UUFDbkQsWUFBVyxFQUFHLFlBQVcsSUFBSyxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDbEUsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7WUFDNUIsZUFBZSxFQUFFLGtCQUFrQixDQUFDLFdBQVcsQ0FBQztZQUNoRCxRQUFRLEVBQUUsa0JBQWtCLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztTQUN2RCxDQUFDO0lBQ0gsQ0FBc0I7SUFFdEI7SUFDQSxjQUFjLENBQ2IsTUFBTSxFQUNOLEtBQUssRUFDTCxrQkFBa0IsQ0FBQyxVQUFTLEdBQVc7UUFDdEMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN2QixPQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUM7UUFDMUI7UUFDQSxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBQyxFQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUMsQ0FDRjtJQUNELGdCQUFnQixDQUFDLE1BQU0sRUFBRTtRQUN4QixNQUFNLEVBQUUsa0JBQWtCLENBQUMsVUFBUyxHQUFXO1lBQzlDLElBQUksR0FBVztZQUNmLGNBQWMsQ0FBQyxHQUFHLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUcsR0FBSSxhQUFhLEVBQUU7Z0JBQzFCLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFDLElBQUssR0FBRyxFQUFFO29CQUMvQixPQUFPLEdBQUc7Z0JBQ1g7WUFDRDtRQUNELENBQUMsQ0FBQztRQUNGLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDeEUsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDdEYsUUFBUSxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNsRSxLQUFLLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzVELFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDdEUsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNoRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQzlELE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDaEUsS0FBSyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUM1RCxXQUFXLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3hFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDeEUsV0FBVyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUs7S0FDdkUsQ0FBQztJQUVGO0lBQ0EsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtRQUMxQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLFFBQVEsRUFBRSxrQkFBa0IsQ0FDM0I7WUFDQyxPQUFPLElBQUksQ0FBQyxRQUFRO1FBQ3JCLENBQUMsRUFDRCxLQUFLLEVBQ0wsS0FBSztLQUVOLENBQUM7SUFFRjtJQUNBLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7UUFDbEMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO1lBQzVCLE9BQU8sV0FBVSxFQUFJLGNBQWMsQ0FBQyxJQUFJLENBQVMsQ0FBQyxnQkFBZSxFQUFHLEdBQUc7UUFDeEUsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxFQUFFLGtCQUFrQixDQUFDO1lBQzNCLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQztRQUM1QixDQUFDO0tBQ0QsQ0FBQztJQUVGLGNBQWMsQ0FDYixNQUFNLENBQUMsU0FBUyxFQUNoQixNQUFNLENBQUMsV0FBVyxFQUNsQixrQkFBa0IsQ0FBQztRQUNsQixPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUM7SUFDNUIsQ0FBQyxDQUFDLENBQ0Y7SUFDRCxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXRHLGNBQWMsQ0FDYixjQUFjLENBQUMsU0FBUyxFQUN4QixNQUFNLENBQUMsV0FBVyxFQUNsQixrQkFBa0IsQ0FBRSxNQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUNyRjtJQUNELGNBQWMsQ0FDYixjQUFjLENBQUMsU0FBUyxFQUN4QixNQUFNLENBQUMsV0FBVyxFQUNsQixrQkFBa0IsQ0FBRSxNQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUNyRjtBQUNGO0FBRUE7Ozs7O0FBS00sa0JBQW1CLEtBQVU7SUFDbEMsT0FBTyxDQUFDLE1BQUssR0FBSSxDQUFDLE9BQU8sTUFBSyxJQUFLLFNBQVEsR0FBSSxLQUFLLENBQUMsZUFBZSxFQUFDLElBQUssUUFBUSxDQUFDLEVBQUMsR0FBSSxLQUFLO0FBQzlGO0FBRUE7OztBQUdBO0lBQ0MsYUFBYTtJQUNiLG9CQUFvQjtJQUNwQixVQUFVO0lBQ1YsU0FBUztJQUNULFNBQVM7SUFDVCxRQUFRO0lBQ1IsT0FBTztJQUNQLE9BQU87SUFDUCxhQUFhO0lBQ2IsYUFBYTtJQUNiLGFBQWE7SUFDYjtDQUNBLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEdBQUU7SUFDdkIsR0FBRyxDQUFDLENBQUUsTUFBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxpRkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRztBQUNELENBQUMsQ0FBQztBQUVhLGdGQUFNLEVBQUM7Ozs7Ozs7OztBQy9MdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUE4QjtBQUNxQjtBQUNuQjtBQUNkO0FBb0VYLElBQUksUUFBTyxFQUF1Qix3REFBTSxDQUFDLE9BQU87QUFPdkQsR0FBRyxDQUFDLEtBQW1CLEVBQUU7SUFDeEIsTUFBTSxRQUFPLEVBQVEsRUFBRTtJQUV2QixNQUFNLE9BQU0sRUFBRztRQUNkLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLEVBQUcsU0FBUyxDQUFDO0lBQzdDLENBQUM7SUFFRCxNQUFNLGFBQVksRUFBRyxDQUFDO1FBQ3JCLElBQUksUUFBTyxFQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRSxFQUFHLFNBQVMsQ0FBQztRQUVoRCxPQUFPO1lBQ04sT0FBTyxPQUFNLEVBQUcsTUFBTSxHQUFFLEVBQUcsQ0FBQyxPQUFPLEdBQUUsRUFBRyxJQUFJLENBQUM7UUFDOUMsQ0FBQztJQUNGLENBQUMsQ0FBQyxFQUFFO0lBRUosUUFBTyxFQUFHO1FBSVQsWUFBWSxRQUErQztZQXlHM0QsS0FBQyxNQUFNLENBQUMsV0FBVyxFQUFDLEVBQWMsU0FBUztZQXhHMUMsSUFBSSxDQUFDLE1BQUssRUFBRyxZQUFZLEVBQUU7WUFFM0IsSUFBSSxDQUFDLGVBQWMsRUFBRyxFQUFFO1lBRXhCLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDMUIsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDekMsTUFBTSxLQUFJLEVBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQjtnQkFDRDtnQkFBRSxLQUFLO29CQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxHQUFJLFFBQVEsRUFBRTt3QkFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDO29CQUNyQjtnQkFDRDtZQUNEO1FBQ0Q7UUFFUSxvQkFBb0IsQ0FBQyxHQUFRO1lBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsRUFBQyxFQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLElBQUssR0FBRyxFQUFFO29CQUN2QyxPQUFPLENBQUM7Z0JBQ1Q7WUFDRDtZQUVBLE9BQU8sQ0FBQyxDQUFDO1FBQ1Y7UUFFQSxNQUFNLENBQUMsR0FBUTtZQUNkLEdBQUcsQ0FBQyxJQUFHLElBQUssVUFBUyxHQUFJLElBQUcsSUFBSyxJQUFJLEVBQUU7Z0JBQ3RDLE9BQU8sS0FBSztZQUNiO1lBRUEsTUFBTSxNQUFLLEVBQWdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxNQUFLLEdBQUksS0FBSyxDQUFDLElBQUcsSUFBSyxJQUFHLEdBQUksS0FBSyxDQUFDLE1BQUssSUFBSyxPQUFPLEVBQUU7Z0JBQzFELEtBQUssQ0FBQyxNQUFLLEVBQUcsT0FBTztnQkFDckIsT0FBTyxJQUFJO1lBQ1o7WUFFQSxNQUFNLFlBQVcsRUFBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDO1lBQ2xELEdBQUcsQ0FBQyxZQUFXLEdBQUksQ0FBQyxFQUFFO2dCQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLElBQUk7WUFDWjtZQUVBLE9BQU8sS0FBSztRQUNiO1FBRUEsR0FBRyxDQUFDLEdBQVE7WUFDWCxHQUFHLENBQUMsSUFBRyxJQUFLLFVBQVMsR0FBSSxJQUFHLElBQUssSUFBSSxFQUFFO2dCQUN0QyxPQUFPLFNBQVM7WUFDakI7WUFFQSxNQUFNLE1BQUssRUFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDMUMsR0FBRyxDQUFDLE1BQUssR0FBSSxLQUFLLENBQUMsSUFBRyxJQUFLLElBQUcsR0FBSSxLQUFLLENBQUMsTUFBSyxJQUFLLE9BQU8sRUFBRTtnQkFDMUQsT0FBTyxLQUFLLENBQUMsS0FBSztZQUNuQjtZQUVBLE1BQU0sWUFBVyxFQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7WUFDbEQsR0FBRyxDQUFDLFlBQVcsR0FBSSxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLO1lBQzlDO1FBQ0Q7UUFFQSxHQUFHLENBQUMsR0FBUTtZQUNYLEdBQUcsQ0FBQyxJQUFHLElBQUssVUFBUyxHQUFJLElBQUcsSUFBSyxJQUFJLEVBQUU7Z0JBQ3RDLE9BQU8sS0FBSztZQUNiO1lBRUEsTUFBTSxNQUFLLEVBQWdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBSyxHQUFJLEtBQUssQ0FBQyxJQUFHLElBQUssSUFBRyxHQUFJLEtBQUssQ0FBQyxNQUFLLElBQUssT0FBTyxDQUFDLEVBQUU7Z0JBQ25FLE9BQU8sSUFBSTtZQUNaO1lBRUEsTUFBTSxZQUFXLEVBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQztZQUNsRCxHQUFHLENBQUMsWUFBVyxHQUFJLENBQUMsRUFBRTtnQkFDckIsT0FBTyxJQUFJO1lBQ1o7WUFFQSxPQUFPLEtBQUs7UUFDYjtRQUVBLEdBQUcsQ0FBQyxHQUFRLEVBQUUsS0FBVztZQUN4QixHQUFHLENBQUMsQ0FBQyxJQUFHLEdBQUksQ0FBQyxPQUFPLElBQUcsSUFBSyxTQUFRLEdBQUksT0FBTyxJQUFHLElBQUssVUFBVSxDQUFDLEVBQUU7Z0JBQ25FLE1BQU0sSUFBSSxTQUFTLENBQUMsb0NBQW9DLENBQUM7WUFDMUQ7WUFDQSxJQUFJLE1BQUssRUFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEMsR0FBRyxDQUFDLENBQUMsTUFBSyxHQUFJLEtBQUssQ0FBQyxJQUFHLElBQUssR0FBRyxFQUFFO2dCQUNoQyxNQUFLLEVBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7b0JBQzNCLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFHO2lCQUNqQixDQUFDO2dCQUVGLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ2hDO2dCQUFFLEtBQUs7b0JBQ04sTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDdEMsS0FBSyxFQUFFO3FCQUNQLENBQUM7Z0JBQ0g7WUFDRDtZQUNBLEtBQUssQ0FBQyxNQUFLLEVBQUcsS0FBSztZQUNuQixPQUFPLElBQUk7UUFDWjtLQUdBO0FBQ0Y7QUFFZSxnRUFBTyxFQUFDOzs7Ozs7Ozs7QUM5TXZCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUE4QjtBQUNpQztBQUNuQjtBQUNaO0FBQ1k7QUFrRHJDLElBQUksSUFBVTtBQUVyQjs7Ozs7O0FBTU8sSUFBSSxFQUFrQztBQUU3QztBQUVBOzs7Ozs7Ozs7QUFTTyxJQUFJLFVBQWtHO0FBRTdHOzs7Ozs7Ozs7QUFTTyxJQUFJLElBQXVGO0FBRWxHOzs7Ozs7OztBQVFPLElBQUksSUFBeUY7QUFFcEc7Ozs7Ozs7OztBQVNPLElBQUksU0FBdUY7QUFFbEc7QUFFQTs7Ozs7Ozs7QUFRTyxJQUFJLFFBQW9GO0FBRS9GLEdBQUcsQ0FBQyxJQUF5QyxFQUFFO0lBQzlDLEtBQUksRUFBRyx3REFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJO0lBQ3hCLEdBQUUsRUFBRyx3REFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQ3BCLFdBQVUsRUFBRyx5RUFBVSxDQUFDLHdEQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7SUFDMUQsS0FBSSxFQUFHLHlFQUFVLENBQUMsd0RBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztJQUM5QyxLQUFJLEVBQUcseUVBQVUsQ0FBQyx3REFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQzlDLFVBQVMsRUFBRyx5RUFBVSxDQUFDLHdEQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDekQ7QUFBRSxLQUFLO0lBQ047SUFDQTtJQUVBOzs7Ozs7SUFNQSxNQUFNLFNBQVEsRUFBRyxrQkFBa0IsTUFBYztRQUNoRCxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2xCLE9BQU8sQ0FBQztRQUNUO1FBRUEsT0FBTSxFQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdkIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyQixPQUFNLEVBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDNUI7UUFDQTtRQUNBLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7Ozs7OztJQU1BLE1BQU0sVUFBUyxFQUFHLG1CQUFtQixLQUFVO1FBQzlDLE1BQUssRUFBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakIsT0FBTyxDQUFDO1FBQ1Q7UUFDQSxHQUFHLENBQUMsTUFBSyxJQUFLLEVBQUMsR0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNwQyxPQUFPLEtBQUs7UUFDYjtRQUVBLE9BQU8sQ0FBQyxNQUFLLEVBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBQyxFQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7Ozs7Ozs7SUFPQSxNQUFNLGdCQUFlLEVBQUcseUJBQXlCLEtBQWEsRUFBRSxNQUFjO1FBQzdFLE9BQU8sTUFBSyxFQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU0sRUFBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ3pFLENBQUM7SUFFRCxLQUFJLEVBQUcsY0FFTixTQUF5QyxFQUN6QyxXQUFtQyxFQUNuQyxPQUFhO1FBRWIsR0FBRyxDQUFDLFVBQVMsR0FBSSxJQUFJLEVBQUU7WUFDdEIsTUFBTSxJQUFJLFNBQVMsQ0FBQyxxQ0FBcUMsQ0FBQztRQUMzRDtRQUVBLEdBQUcsQ0FBQyxZQUFXLEdBQUksT0FBTyxFQUFFO1lBQzNCLFlBQVcsRUFBRyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QztRQUVBO1FBQ0EsTUFBTSxZQUFXLEVBQUcsSUFBSTtRQUN4QixNQUFNLE9BQU0sRUFBVyxRQUFRLENBQUUsU0FBaUIsQ0FBQyxNQUFNLENBQUM7UUFFMUQ7UUFDQSxNQUFNLE1BQUssRUFDVixPQUFPLFlBQVcsSUFBSyxXQUFXLEVBQVMsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO1FBRS9GLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUMsR0FBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN0RCxPQUFPLEtBQUs7UUFDYjtRQUVBO1FBQ0E7UUFDQSxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNCLEdBQUcsQ0FBQyxPQUFNLElBQUssQ0FBQyxFQUFFO2dCQUNqQixPQUFPLEVBQUU7WUFDVjtZQUVBLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsRUFBQyxFQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsRUFBRyxZQUFZLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3JFO1FBQ0Q7UUFBRSxLQUFLO1lBQ04sSUFBSSxFQUFDLEVBQUcsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLE1BQUssR0FBSSxTQUFTLEVBQUU7Z0JBQzlCLEtBQUssQ0FBQyxDQUFDLEVBQUMsRUFBRyxZQUFZLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLO2dCQUN0RCxDQUFDLEVBQUU7WUFDSjtRQUNEO1FBRUEsR0FBRyxDQUFFLFNBQWlCLENBQUMsT0FBTSxJQUFLLFNBQVMsRUFBRTtZQUM1QyxLQUFLLENBQUMsT0FBTSxFQUFHLE1BQU07UUFDdEI7UUFFQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBRUQsR0FBRSxFQUFHLFlBQWUsR0FBRyxLQUFVO1FBQ2hDLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN6QyxDQUFDO0lBRUQsV0FBVSxFQUFHLG9CQUNaLE1BQW9CLEVBQ3BCLE1BQWMsRUFDZCxLQUFhLEVBQ2IsR0FBWTtRQUVaLEdBQUcsQ0FBQyxPQUFNLEdBQUksSUFBSSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxTQUFTLENBQUMsaURBQWlELENBQUM7UUFDdkU7UUFFQSxNQUFNLE9BQU0sRUFBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN0QyxPQUFNLEVBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDbkQsTUFBSyxFQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDO1FBQ2pELElBQUcsRUFBRyxlQUFlLENBQUMsSUFBRyxJQUFLLFVBQVUsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUMxRSxJQUFJLE1BQUssRUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUcsRUFBRyxLQUFLLEVBQUUsT0FBTSxFQUFHLE1BQU0sQ0FBQztRQUVsRCxJQUFJLFVBQVMsRUFBRyxDQUFDO1FBQ2pCLEdBQUcsQ0FBQyxPQUFNLEVBQUcsTUFBSyxHQUFJLE9BQU0sRUFBRyxNQUFLLEVBQUcsS0FBSyxFQUFFO1lBQzdDLFVBQVMsRUFBRyxDQUFDLENBQUM7WUFDZCxNQUFLLEdBQUksTUFBSyxFQUFHLENBQUM7WUFDbEIsT0FBTSxHQUFJLE1BQUssRUFBRyxDQUFDO1FBQ3BCO1FBRUEsT0FBTyxNQUFLLEVBQUcsQ0FBQyxFQUFFO1lBQ2pCLEdBQUcsQ0FBQyxNQUFLLEdBQUksTUFBTSxFQUFFO2dCQUNuQixNQUErQixDQUFDLE1BQU0sRUFBQyxFQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDekQ7WUFBRSxLQUFLO2dCQUNOLE9BQVEsTUFBK0IsQ0FBQyxNQUFNLENBQUM7WUFDaEQ7WUFFQSxPQUFNLEdBQUksU0FBUztZQUNuQixNQUFLLEdBQUksU0FBUztZQUNsQixLQUFLLEVBQUU7UUFDUjtRQUVBLE9BQU8sTUFBTTtJQUNkLENBQUM7SUFFRCxLQUFJLEVBQUcsY0FBaUIsTUFBb0IsRUFBRSxLQUFVLEVBQUUsS0FBYyxFQUFFLEdBQVk7UUFDckYsTUFBTSxPQUFNLEVBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdEMsSUFBSSxFQUFDLEVBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLENBQUM7UUFDakQsSUFBRyxFQUFHLGVBQWUsQ0FBQyxJQUFHLElBQUssVUFBVSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDO1FBRTFFLE9BQU8sRUFBQyxFQUFHLEdBQUcsRUFBRTtZQUNkLE1BQStCLENBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRyxLQUFLO1FBQzlDO1FBRUEsT0FBTyxNQUFNO0lBQ2QsQ0FBQztJQUVELEtBQUksRUFBRyxjQUFpQixNQUFvQixFQUFFLFFBQXlCLEVBQUUsT0FBWTtRQUNwRixNQUFNLE1BQUssRUFBRyxTQUFTLENBQUksTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUM7UUFDckQsT0FBTyxNQUFLLElBQUssQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLFNBQVM7SUFDaEQsQ0FBQztJQUVELFVBQVMsRUFBRyxtQkFBc0IsTUFBb0IsRUFBRSxRQUF5QixFQUFFLE9BQVk7UUFDOUYsTUFBTSxPQUFNLEVBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFFdEMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ2QsTUFBTSxJQUFJLFNBQVMsQ0FBQywwQ0FBMEMsQ0FBQztRQUNoRTtRQUVBLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDWixTQUFRLEVBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDbEM7UUFFQSxJQUFJLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLENBQUM7WUFDVDtRQUNEO1FBRUEsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDO0FBQ0Y7QUFFQSxHQUFHLEtBQWlCLEVBQUU7SUFDckIsU0FBUSxFQUFHLHlFQUFVLENBQUMsd0RBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUN2RDtBQUFFLEtBQUs7SUFDTjs7Ozs7O0lBTUEsTUFBTSxTQUFRLEVBQUcsa0JBQWtCLE1BQWM7UUFDaEQsT0FBTSxFQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNsQixPQUFPLENBQUM7UUFDVDtRQUNBLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDckIsT0FBTSxFQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQzVCO1FBQ0E7UUFDQSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUM7SUFDdkQsQ0FBQztJQUVELFNBQVEsRUFBRyxrQkFBcUIsTUFBb0IsRUFBRSxhQUFnQixFQUFFLFlBQW9CLENBQUM7UUFDNUYsSUFBSSxJQUFHLEVBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFFakMsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLFNBQVMsRUFBRSxFQUFDLEVBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ3JDLE1BQU0sZUFBYyxFQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEMsR0FBRyxDQUNGLGNBQWEsSUFBSyxlQUFjO2dCQUNoQyxDQUFDLGNBQWEsSUFBSyxjQUFhLEdBQUksZUFBYyxJQUFLLGNBQWMsQ0FDdEUsRUFBRTtnQkFDRCxPQUFPLElBQUk7WUFDWjtRQUNEO1FBRUEsT0FBTyxLQUFLO0lBQ2IsQ0FBQztBQUNGOzs7Ozs7Ozs7QUMzVkEsb0RBQU0sWUFBWSxHQUFRLENBQUM7SUFDMUIsc0RBQXNEO0lBQ3RELDhCQUE4QjtJQUM5QixzREFBc0Q7SUFDdEQsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDZixDQUFDO0FBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUVVLHFFQUFZLEVBQUM7Ozs7Ozs7Ozs7QUNmNUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQWtCO0FBQ2dEO0FBdUJsRSxNQUFNLFVBQVUsR0FBd0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUV6RTs7R0FFRztBQUNJO0lBS04sWUFBWSxJQUFnQztRQUhwQyxlQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFJdkIsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNuQixDQUFDO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDbkIsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDO2dCQUNOLElBQUksRUFBRSxLQUFLO2dCQUNYLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7YUFDbEMsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ25CLENBQUM7SUFFRCxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRDtBQUFBO0FBQUE7QUFFRDs7OztHQUlHO0FBQ0ksb0JBQW9CLEtBQVU7SUFDcEMsTUFBTSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssVUFBVSxDQUFDO0FBQzlELENBQUM7QUFFRDs7OztHQUlHO0FBQ0kscUJBQXFCLEtBQVU7SUFDckMsTUFBTSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDO0FBQ2xELENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksYUFBZ0IsUUFBb0M7SUFDMUQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztBQUNGLENBQUM7QUFhRDs7Ozs7O0dBTUc7QUFDSSxlQUNOLFFBQTZDLEVBQzdDLFFBQTBCLEVBQzFCLE9BQWE7SUFFYixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFFbkI7UUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ2YsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzRCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDNUIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksbUVBQWtCLElBQUksSUFBSSxJQUFJLG1FQUFrQixDQUFDLENBQUMsQ0FBQztvQkFDOUQsSUFBSSxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixDQUFDO1lBQ0YsQ0FBQztZQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWixNQUFNLENBQUM7WUFDUixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNQLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRTdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN4RCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNaLE1BQU0sQ0FBQztnQkFDUixDQUFDO2dCQUNELE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDMUIsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0FBQ0YsQ0FBQzs7Ozs7Ozs7O0FDNUpEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBOEI7QUFFOUI7O0dBRUc7QUFDSSxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFBQTtBQUFBO0FBRXpCOztHQUVHO0FBQ0ksTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFBQTtBQUFBO0FBRXBEOztHQUVHO0FBQ0ksTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGdCQUFnQixDQUFDO0FBQUE7QUFBQTtBQUVsRDs7Ozs7R0FLRztBQUNJLGVBQWUsS0FBVTtJQUMvQixNQUFNLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLHdEQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRDs7Ozs7R0FLRztBQUNJLGtCQUFrQixLQUFVO0lBQ2xDLE1BQU0sQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksd0RBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0ksbUJBQW1CLEtBQVU7SUFDbkMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQztBQUN2RCxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0ksdUJBQXVCLEtBQVU7SUFDdkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLGdCQUFnQixDQUFDO0FBQ2hFLENBQUM7Ozs7Ozs7OztBQzNERDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBOEI7QUFDRTtBQUNJO0FBd0U3QixJQUFJLE1BQW9CO0FBRS9COzs7Ozs7O0FBT08sSUFBSSx3QkFBd0c7QUFFbkg7Ozs7O0FBS08sSUFBSSxtQkFBeUM7QUFFcEQ7Ozs7QUFJTyxJQUFJLHFCQUEyQztBQUV0RDs7Ozs7QUFLTyxJQUFJLEVBQXlDO0FBRXBEOzs7O0FBSU8sSUFBSSxJQUE2QjtBQUV4QztBQUVPLElBQUkseUJBQTBEO0FBRTlELElBQUksT0FBdUI7QUFFM0IsSUFBSSxNQUFvQjtBQUUvQixHQUFHLEtBQWtCLEVBQUU7SUFDdEIsTUFBTSxhQUFZLEVBQUcsd0RBQU0sQ0FBQyxNQUFNO0lBQ2xDLE9BQU0sRUFBRyxZQUFZLENBQUMsTUFBTTtJQUM1Qix5QkFBd0IsRUFBRyxZQUFZLENBQUMsd0JBQXdCO0lBQ2hFLG9CQUFtQixFQUFHLFlBQVksQ0FBQyxtQkFBbUI7SUFDdEQsc0JBQXFCLEVBQUcsWUFBWSxDQUFDLHFCQUFxQjtJQUMxRCxHQUFFLEVBQUcsWUFBWSxDQUFDLEVBQUU7SUFDcEIsS0FBSSxFQUFHLFlBQVksQ0FBQyxJQUFJO0FBQ3pCO0FBQUUsS0FBSztJQUNOLEtBQUksRUFBRyx5QkFBeUIsQ0FBUztRQUN4QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxPQUFNLEVBQUcsZ0JBQWdCLE1BQVcsRUFBRSxHQUFHLE9BQWM7UUFDdEQsR0FBRyxDQUFDLE9BQU0sR0FBSSxJQUFJLEVBQUU7WUFDbkI7WUFDQSxNQUFNLElBQUksU0FBUyxDQUFDLDRDQUE0QyxDQUFDO1FBQ2xFO1FBRUEsTUFBTSxHQUFFLEVBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN6QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUU7WUFDOUIsR0FBRyxDQUFDLFVBQVUsRUFBRTtnQkFDZjtnQkFDQSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUU7b0JBQ3BDLEVBQUUsQ0FBQyxPQUFPLEVBQUMsRUFBRyxVQUFVLENBQUMsT0FBTyxDQUFDO2dCQUNsQyxDQUFDLENBQUM7WUFDSDtRQUNELENBQUMsQ0FBQztRQUVGLE9BQU8sRUFBRTtJQUNWLENBQUM7SUFFRCx5QkFBd0IsRUFBRyxVQUErQixDQUFJLEVBQUUsSUFBTztRQUN0RSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25CLE9BQU8sTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7UUFDaEQ7UUFBRSxLQUFLO1lBQ04sT0FBTyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztRQUNoRDtJQUNELENBQUM7SUFFRCxvQkFBbUIsRUFBRyw2QkFBNkIsQ0FBTTtRQUN4RCxPQUFPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELHNCQUFxQixFQUFHLCtCQUErQixDQUFNO1FBQzVELE9BQU8sTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDakMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0MsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELEdBQUUsRUFBRyxZQUFZLE1BQVcsRUFBRSxNQUFXO1FBQ3hDLEdBQUcsQ0FBQyxPQUFNLElBQUssTUFBTSxFQUFFO1lBQ3RCLE9BQU8sT0FBTSxJQUFLLEVBQUMsR0FBSSxFQUFDLEVBQUcsT0FBTSxJQUFLLEVBQUMsRUFBRyxNQUFNLEVBQUU7UUFDbkQ7UUFDQSxPQUFPLE9BQU0sSUFBSyxPQUFNLEdBQUksT0FBTSxJQUFLLE1BQU0sRUFBRTtJQUNoRCxDQUFDO0FBQ0Y7QUFFQSxHQUFHLEtBQXFCLEVBQUU7SUFDekIsTUFBTSxhQUFZLEVBQUcsd0RBQU0sQ0FBQyxNQUFNO0lBQ2xDLDBCQUF5QixFQUFHLFlBQVksQ0FBQyx5QkFBeUI7SUFDbEUsUUFBTyxFQUFHLFlBQVksQ0FBQyxPQUFPO0lBQzlCLE9BQU0sRUFBRyxZQUFZLENBQUMsTUFBTTtBQUM3QjtBQUFFLEtBQUs7SUFDTiwwQkFBeUIsRUFBRyxtQ0FBbUMsQ0FBTTtRQUNwRSxPQUFPLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDbkMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUU7WUFDakIsUUFBUSxDQUFDLEdBQUcsRUFBQyxFQUFHLHdCQUF3QixDQUFDLENBQUMsRUFBRSxHQUFHLENBQUU7WUFDakQsT0FBTyxRQUFRO1FBQ2hCLENBQUMsRUFDRCxFQUEyQyxDQUMzQztJQUNGLENBQUM7SUFFRCxRQUFPLEVBQUcsaUJBQWlCLENBQU07UUFDaEMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFrQixDQUFDO0lBQzVELENBQUM7SUFFRCxPQUFNLEVBQUcsZ0JBQWdCLENBQU07UUFDOUIsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7QUFDRjs7Ozs7Ozs7O0FDeE1BO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQThCO0FBQ0U7QUFDWTtBQXNCNUM7OztBQUdPLE1BQU0sbUJBQWtCLEVBQUcsTUFBTSxDQUFDO0FBQUE7QUFBQTtBQUV6Qzs7O0FBR08sTUFBTSxtQkFBa0IsRUFBRyxNQUFNLENBQUM7QUFBQTtBQUFBO0FBRXpDOzs7QUFHTyxNQUFNLGtCQUFpQixFQUFHLE1BQU0sQ0FBQztBQUFBO0FBQUE7QUFFeEM7OztBQUdPLE1BQU0sa0JBQWlCLEVBQUcsTUFBTSxDQUFDO0FBQUE7QUFBQTtBQUV4QztBQUVBOzs7OztBQUtPLElBQUksYUFBa0Q7QUFFN0Q7Ozs7Ozs7QUFPTyxJQUFJLEdBQXdFO0FBRW5GO0FBRUE7Ozs7Ozs7QUFPTyxJQUFJLFdBQWlFO0FBRTVFOzs7OztBQUtPLElBQUksUUFBaUY7QUFFNUY7Ozs7Ozs7O0FBUU8sSUFBSSxRQUE4RTtBQUV6Rjs7Ozs7OztBQU9PLElBQUksU0FBMEI7QUFFckM7Ozs7O0FBS08sSUFBSSxNQUFrRDtBQUU3RDs7Ozs7QUFLTyxJQUFJLFVBQWdGO0FBRTNGO0FBRUE7Ozs7Ozs7Ozs7OztBQVlPLElBQUksTUFBMEU7QUFFckY7Ozs7Ozs7Ozs7OztBQVlPLElBQUksUUFBNEU7QUFFdkYsR0FBRyxDQUFDLElBQTBDLEVBQUU7SUFDL0MsY0FBYSxFQUFHLHdEQUFNLENBQUMsTUFBTSxDQUFDLGFBQWE7SUFDM0MsSUFBRyxFQUFHLHdEQUFNLENBQUMsTUFBTSxDQUFDLEdBQUc7SUFFdkIsWUFBVyxFQUFHLHlFQUFVLENBQUMsd0RBQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUM3RCxTQUFRLEVBQUcseUVBQVUsQ0FBQyx3REFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO0lBQ3ZELFNBQVEsRUFBRyx5RUFBVSxDQUFDLHdEQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDdkQsVUFBUyxFQUFHLHlFQUFVLENBQUMsd0RBQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztJQUN6RCxPQUFNLEVBQUcseUVBQVUsQ0FBQyx3REFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQ25ELFdBQVUsRUFBRyx5RUFBVSxDQUFDLHdEQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFDNUQ7QUFBRSxLQUFLO0lBQ047Ozs7OztJQU1BLE1BQU0sdUJBQXNCLEVBQUcsVUFDOUIsSUFBWSxFQUNaLElBQVksRUFDWixNQUFjLEVBQ2QsUUFBZ0IsRUFDaEIsUUFBaUIsS0FBSztRQUV0QixHQUFHLENBQUMsS0FBSSxHQUFJLElBQUksRUFBRTtZQUNqQixNQUFNLElBQUksU0FBUyxDQUFDLFVBQVMsRUFBRyxLQUFJLEVBQUcsNkNBQTZDLENBQUM7UUFDdEY7UUFFQSxNQUFNLE9BQU0sRUFBRyxJQUFJLENBQUMsTUFBTTtRQUMxQixTQUFRLEVBQUcsU0FBUSxJQUFLLFNBQVMsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsUUFBUTtRQUNsRSxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxjQUFhLEVBQUcsdUJBQXVCLEdBQUcsVUFBb0I7UUFDN0Q7UUFDQSxNQUFNLE9BQU0sRUFBRyxTQUFTLENBQUMsTUFBTTtRQUMvQixHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDWixPQUFPLEVBQUU7UUFDVjtRQUVBLE1BQU0sYUFBWSxFQUFHLE1BQU0sQ0FBQyxZQUFZO1FBQ3hDLE1BQU0sU0FBUSxFQUFHLE1BQU07UUFDdkIsSUFBSSxVQUFTLEVBQWEsRUFBRTtRQUM1QixJQUFJLE1BQUssRUFBRyxDQUFDLENBQUM7UUFDZCxJQUFJLE9BQU0sRUFBRyxFQUFFO1FBRWYsT0FBTyxFQUFFLE1BQUssRUFBRyxNQUFNLEVBQUU7WUFDeEIsSUFBSSxVQUFTLEVBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QztZQUNBLElBQUksUUFBTyxFQUNWLFFBQVEsQ0FBQyxTQUFTLEVBQUMsR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBQyxJQUFLLFVBQVMsR0FBSSxVQUFTLEdBQUksRUFBQyxHQUFJLFVBQVMsR0FBSSxRQUFRO1lBQ3RHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDYixNQUFNLFVBQVUsQ0FBQyw0Q0FBMkMsRUFBRyxTQUFTLENBQUM7WUFDMUU7WUFFQSxHQUFHLENBQUMsVUFBUyxHQUFJLE1BQU0sRUFBRTtnQkFDeEI7Z0JBQ0EsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDMUI7WUFBRSxLQUFLO2dCQUNOO2dCQUNBO2dCQUNBLFVBQVMsR0FBSSxPQUFPO2dCQUNwQixJQUFJLGNBQWEsRUFBRyxDQUFDLFVBQVMsR0FBSSxFQUFFLEVBQUMsRUFBRyxrQkFBa0I7Z0JBQzFELElBQUksYUFBWSxFQUFHLENBQUMsVUFBUyxFQUFHLEtBQUssRUFBQyxFQUFHLGlCQUFpQjtnQkFDMUQsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDO1lBQzVDO1lBRUEsR0FBRyxDQUFDLE1BQUssRUFBRyxFQUFDLElBQUssT0FBTSxHQUFJLFNBQVMsQ0FBQyxPQUFNLEVBQUcsUUFBUSxFQUFFO2dCQUN4RCxPQUFNLEdBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO2dCQUM3QyxTQUFTLENBQUMsT0FBTSxFQUFHLENBQUM7WUFDckI7UUFDRDtRQUNBLE9BQU8sTUFBTTtJQUNkLENBQUM7SUFFRCxJQUFHLEVBQUcsYUFBYSxRQUE4QixFQUFFLEdBQUcsYUFBb0I7UUFDekUsSUFBSSxXQUFVLEVBQUcsUUFBUSxDQUFDLEdBQUc7UUFDN0IsSUFBSSxPQUFNLEVBQUcsRUFBRTtRQUNmLElBQUksaUJBQWdCLEVBQUcsYUFBYSxDQUFDLE1BQU07UUFFM0MsR0FBRyxDQUFDLFNBQVEsR0FBSSxLQUFJLEdBQUksUUFBUSxDQUFDLElBQUcsR0FBSSxJQUFJLEVBQUU7WUFDN0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyw4REFBOEQsQ0FBQztRQUNwRjtRQUVBLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsT0FBTSxFQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxFQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1RCxPQUFNLEdBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxFQUFHLENBQUMsRUFBQyxFQUFHLGlCQUFnQixHQUFJLEVBQUMsRUFBRyxPQUFNLEVBQUcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDM0Y7UUFFQSxPQUFPLE1BQU07SUFDZCxDQUFDO0lBRUQsWUFBVyxFQUFHLHFCQUFxQixJQUFZLEVBQUUsV0FBbUIsQ0FBQztRQUNwRTtRQUNBLEdBQUcsQ0FBQyxLQUFJLEdBQUksSUFBSSxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxTQUFTLENBQUMsNkNBQTZDLENBQUM7UUFDbkU7UUFDQSxNQUFNLE9BQU0sRUFBRyxJQUFJLENBQUMsTUFBTTtRQUUxQixHQUFHLENBQUMsU0FBUSxJQUFLLFFBQVEsRUFBRTtZQUMxQixTQUFRLEVBQUcsQ0FBQztRQUNiO1FBQ0EsR0FBRyxDQUFDLFNBQVEsRUFBRyxFQUFDLEdBQUksU0FBUSxHQUFJLE1BQU0sRUFBRTtZQUN2QyxPQUFPLFNBQVM7UUFDakI7UUFFQTtRQUNBLE1BQU0sTUFBSyxFQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxNQUFLLEdBQUksbUJBQWtCLEdBQUksTUFBSyxHQUFJLG1CQUFrQixHQUFJLE9BQU0sRUFBRyxTQUFRLEVBQUcsQ0FBQyxFQUFFO1lBQ3hGO1lBQ0E7WUFDQSxNQUFNLE9BQU0sRUFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVEsRUFBRyxDQUFDLENBQUM7WUFDNUMsR0FBRyxDQUFDLE9BQU0sR0FBSSxrQkFBaUIsR0FBSSxPQUFNLEdBQUksaUJBQWlCLEVBQUU7Z0JBQy9ELE9BQU8sQ0FBQyxNQUFLLEVBQUcsa0JBQWtCLEVBQUMsRUFBRyxNQUFLLEVBQUcsT0FBTSxFQUFHLGtCQUFpQixFQUFHLE9BQU87WUFDbkY7UUFDRDtRQUNBLE9BQU8sS0FBSztJQUNiLENBQUM7SUFFRCxTQUFRLEVBQUcsa0JBQWtCLElBQVksRUFBRSxNQUFjLEVBQUUsV0FBb0I7UUFDOUUsR0FBRyxDQUFDLE9BQU0sSUFBSyxFQUFFLEVBQUU7WUFDbEIsT0FBTyxJQUFJO1FBQ1o7UUFFQSxHQUFHLENBQUMsT0FBTyxZQUFXLElBQUssV0FBVyxFQUFFO1lBQ3ZDLFlBQVcsRUFBRyxJQUFJLENBQUMsTUFBTTtRQUMxQjtRQUFFLEtBQUssR0FBRyxDQUFDLFlBQVcsSUFBSyxLQUFJLEdBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3RELE9BQU8sS0FBSztRQUNiO1FBRUEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxFQUFHLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUM7UUFFakcsTUFBTSxNQUFLLEVBQUcsWUFBVyxFQUFHLE1BQU0sQ0FBQyxNQUFNO1FBQ3pDLEdBQUcsQ0FBQyxNQUFLLEVBQUcsQ0FBQyxFQUFFO1lBQ2QsT0FBTyxLQUFLO1FBQ2I7UUFFQSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBQyxJQUFLLE1BQU07SUFDakQsQ0FBQztJQUVELFNBQVEsRUFBRyxrQkFBa0IsSUFBWSxFQUFFLE1BQWMsRUFBRSxXQUFtQixDQUFDO1FBQzlFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsRUFBRyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUM7UUFDckYsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsSUFBSyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELE9BQU0sRUFBRyxnQkFBZ0IsSUFBWSxFQUFFLFFBQWdCLENBQUM7UUFDdkQ7UUFDQSxHQUFHLENBQUMsS0FBSSxHQUFJLElBQUksRUFBRTtZQUNqQixNQUFNLElBQUksU0FBUyxDQUFDLHdDQUF3QyxDQUFDO1FBQzlEO1FBQ0EsR0FBRyxDQUFDLE1BQUssSUFBSyxLQUFLLEVBQUU7WUFDcEIsTUFBSyxFQUFHLENBQUM7UUFDVjtRQUNBLEdBQUcsQ0FBQyxNQUFLLEVBQUcsRUFBQyxHQUFJLE1BQUssSUFBSyxRQUFRLEVBQUU7WUFDcEMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxxREFBcUQsQ0FBQztRQUM1RTtRQUVBLElBQUksT0FBTSxFQUFHLEVBQUU7UUFDZixPQUFPLEtBQUssRUFBRTtZQUNiLEdBQUcsQ0FBQyxNQUFLLEVBQUcsQ0FBQyxFQUFFO2dCQUNkLE9BQU0sR0FBSSxJQUFJO1lBQ2Y7WUFDQSxHQUFHLENBQUMsTUFBSyxFQUFHLENBQUMsRUFBRTtnQkFDZCxLQUFJLEdBQUksSUFBSTtZQUNiO1lBQ0EsTUFBSyxJQUFLLENBQUM7UUFDWjtRQUNBLE9BQU8sTUFBTTtJQUNkLENBQUM7SUFFRCxXQUFVLEVBQUcsb0JBQW9CLElBQVksRUFBRSxNQUFjLEVBQUUsV0FBbUIsQ0FBQztRQUNsRixPQUFNLEVBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLEVBQUcsc0JBQXNCLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDO1FBRXZGLE1BQU0sSUFBRyxFQUFHLFNBQVEsRUFBRyxNQUFNLENBQUMsTUFBTTtRQUNwQyxHQUFHLENBQUMsSUFBRyxFQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDdEIsT0FBTyxLQUFLO1FBQ2I7UUFFQSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBQyxJQUFLLE1BQU07SUFDNUMsQ0FBQztBQUNGO0FBRUEsR0FBRyxLQUFxQixFQUFFO0lBQ3pCLE9BQU0sRUFBRyx5RUFBVSxDQUFDLHdEQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDbkQsU0FBUSxFQUFHLHlFQUFVLENBQUMsd0RBQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUN4RDtBQUFFLEtBQUs7SUFDTixPQUFNLEVBQUcsZ0JBQWdCLElBQVksRUFBRSxTQUFpQixFQUFFLGFBQXFCLEdBQUc7UUFDakYsR0FBRyxDQUFDLEtBQUksSUFBSyxLQUFJLEdBQUksS0FBSSxJQUFLLFNBQVMsRUFBRTtZQUN4QyxNQUFNLElBQUksU0FBUyxDQUFDLHdDQUF3QyxDQUFDO1FBQzlEO1FBRUEsR0FBRyxDQUFDLFVBQVMsSUFBSyxRQUFRLEVBQUU7WUFDM0IsTUFBTSxJQUFJLFVBQVUsQ0FBQyxxREFBcUQsQ0FBQztRQUM1RTtRQUVBLEdBQUcsQ0FBQyxVQUFTLElBQUssS0FBSSxHQUFJLFVBQVMsSUFBSyxVQUFTLEdBQUksVUFBUyxFQUFHLENBQUMsRUFBRTtZQUNuRSxVQUFTLEVBQUcsQ0FBQztRQUNkO1FBRUEsSUFBSSxRQUFPLEVBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxQixNQUFNLFFBQU8sRUFBRyxVQUFTLEVBQUcsT0FBTyxDQUFDLE1BQU07UUFFMUMsR0FBRyxDQUFDLFFBQU8sRUFBRyxDQUFDLEVBQUU7WUFDaEIsUUFBTztnQkFDTixNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBTyxFQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBQztvQkFDM0QsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBTyxFQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDbEQ7UUFFQSxPQUFPLE9BQU87SUFDZixDQUFDO0lBRUQsU0FBUSxFQUFHLGtCQUFrQixJQUFZLEVBQUUsU0FBaUIsRUFBRSxhQUFxQixHQUFHO1FBQ3JGLEdBQUcsQ0FBQyxLQUFJLElBQUssS0FBSSxHQUFJLEtBQUksSUFBSyxTQUFTLEVBQUU7WUFDeEMsTUFBTSxJQUFJLFNBQVMsQ0FBQyx3Q0FBd0MsQ0FBQztRQUM5RDtRQUVBLEdBQUcsQ0FBQyxVQUFTLElBQUssUUFBUSxFQUFFO1lBQzNCLE1BQU0sSUFBSSxVQUFVLENBQUMsdURBQXVELENBQUM7UUFDOUU7UUFFQSxHQUFHLENBQUMsVUFBUyxJQUFLLEtBQUksR0FBSSxVQUFTLElBQUssVUFBUyxHQUFJLFVBQVMsRUFBRyxDQUFDLEVBQUU7WUFDbkUsVUFBUyxFQUFHLENBQUM7UUFDZDtRQUVBLElBQUksUUFBTyxFQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDMUIsTUFBTSxRQUFPLEVBQUcsVUFBUyxFQUFHLE9BQU8sQ0FBQyxNQUFNO1FBRTFDLEdBQUcsQ0FBQyxRQUFPLEVBQUcsQ0FBQyxFQUFFO1lBQ2hCLFFBQU87Z0JBQ04sTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQU8sRUFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUM7b0JBQzNELFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFFBQU8sRUFBRyxVQUFVLENBQUMsTUFBTSxFQUFDO29CQUNoRCxPQUFPO1FBQ1Q7UUFFQSxPQUFPLE9BQU87SUFDZixDQUFDO0FBQ0Y7Ozs7Ozs7OztBWDVYQTtBQUFBO0FBQUE7QUFBeUM7QUFDVjtBQUUvQiwwRUFBZSxpREFBRyxFQUFDO0FBQ1c7QUFFOUI7QUFFQTtBQUNBLHFEQUFHLENBQ0YsV0FBVyxFQUNYLEdBQUcsR0FBRTtJQUNKLE9BQU8sQ0FDTixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFHLEdBQUksd0RBQU0sQ0FBQyxLQUFLLEVBQUM7UUFDbEQsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUcsR0FBSSx3REFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FDakY7QUFDRixDQUFDLEVBQ0QsSUFBSSxDQUNKO0FBRUQscURBQUcsQ0FDRixnQkFBZ0IsRUFDaEIsR0FBRyxHQUFFO0lBQ0osR0FBRyxDQUFDLE9BQU0sR0FBSSx3REFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7UUFDckM7UUFDQSxPQUFRLENBQUMsQ0FBQyxDQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSyxDQUFDO0lBQy9EO0lBQ0EsT0FBTyxLQUFLO0FBQ2IsQ0FBQyxFQUNELElBQUksQ0FDSjtBQUVELHFEQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxXQUFVLEdBQUksd0RBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQztBQUVsRTtBQUNBLHFEQUFHLENBQ0YsU0FBUyxFQUNULEdBQUcsR0FBRTtJQUNKLEdBQUcsQ0FBQyxPQUFPLHdEQUFNLENBQUMsSUFBRyxJQUFLLFVBQVUsRUFBRTtRQUNyQzs7Ozs7UUFLQSxJQUFJO1lBQ0gsTUFBTSxJQUFHLEVBQUcsSUFBSSx3REFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7bUJBR25DLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO2dCQUNWLE9BQU8sR0FBRyxDQUFDLEtBQUksSUFBSyxXQUFVO3FCQUNiO2dCQUNqQixPQUFPLEdBQUcsQ0FBQyxPQUFNLElBQUssV0FBVTtnQkFDaEMsT0FBTyxHQUFHLENBQUMsUUFBTyxJQUFLO1FBRXpCO1FBQUUsTUFBTSxDQUFDLENBQUMsRUFBRTtZQUNYO1lBQ0EsT0FBTyxLQUFLO1FBQ2I7SUFDRDtJQUNBLE9BQU8sS0FBSztBQUNiLENBQUMsRUFDRCxJQUFJLENBQ0o7QUFFRDtBQUNBLHFEQUFHLENBQ0YsVUFBVSxFQUNWLEdBQUcsR0FBRTtJQUNKLE9BQU87UUFDTixPQUFPO1FBQ1AsTUFBTTtRQUNOLE9BQU87UUFDUCxNQUFNO1FBQ04sT0FBTztRQUNQLE9BQU87UUFDUCxNQUFNO1FBQ04sTUFBTTtRQUNOLE1BQU07UUFDTixPQUFPO1FBQ1AsT0FBTztRQUNQLE9BQU87UUFDUCxPQUFPO1FBQ1AsUUFBUTtRQUNSLE1BQU07UUFDTjtLQUNBLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsT0FBTyx3REFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsSUFBSyxVQUFVLENBQUM7QUFDM0QsQ0FBQyxFQUNELElBQUksQ0FDSjtBQUVELHFEQUFHLENBQ0YsZUFBZSxFQUNmLEdBQUcsR0FBRTtJQUNKLEdBQUcsQ0FBQyxPQUFNLEdBQUksd0RBQU0sQ0FBQyxJQUFJLEVBQUU7UUFDMUI7UUFDQSxPQUFRLElBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBQyxJQUFLLENBQUMsQ0FBQztJQUNoRDtJQUNBLE9BQU8sS0FBSztBQUNiLENBQUMsRUFDRCxJQUFJLENBQ0o7QUFFRDtBQUNBLHFEQUFHLENBQ0YsWUFBWSxFQUNaLEdBQUcsR0FBRTtnQkFFYztRQUNqQixDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQ2hFLENBQUMsSUFBSSxFQUFFLEdBQUcsT0FBTyx3REFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUMsSUFBSyxVQUFVO0FBR3RELENBQUMsRUFDRCxJQUFJLENBQ0o7QUFFRCxxREFBRyxDQUNGLGVBQWUsRUFDZixHQUFHLEdBQUU7SUFDSixPQUFPLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDLEtBQUssQ0FDOUQsQ0FBQyxJQUFJLEVBQUUsR0FBRyxPQUFPLHdEQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBQyxJQUFLLFVBQVUsQ0FDbkQ7QUFDRixDQUFDLEVBQ0QsSUFBSSxDQUNKO0FBRUQ7QUFDQSxxREFBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLEdBQUcsT0FBTyx3REFBTSxDQUFDLFdBQVUsSUFBSyxXQUFXLEVBQUUsSUFBSSxDQUFDO0FBRTFFO0FBQ0EscURBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxHQUFHLE9BQU8sd0RBQU0sQ0FBQyxRQUFPLElBQUssWUFBVyxPQUFxQixFQUFFLElBQUksQ0FBQztBQUUxRjtBQUNBLHFEQUFHLENBQ0YsU0FBUyxFQUNULEdBQUcsR0FBRTtJQUNKLEdBQUcsQ0FBQyxPQUFPLHdEQUFNLENBQUMsSUFBRyxJQUFLLFVBQVUsRUFBRTtRQUNyQztRQUNBLE1BQU0sSUFBRyxFQUFHLElBQUksd0RBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztlQUN4QixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxHQUFJLE9BQU0sR0FBSSxJQUFHLEdBQUksT0FBTyxHQUFHLENBQUMsS0FBSSxJQUFLLFdBQVU7SUFDckU7SUFDQSxPQUFPLEtBQUs7QUFDYixDQUFDLEVBQ0QsSUFBSSxDQUNKO0FBRUQ7QUFDQSxxREFBRyxDQUNGLFlBQVksRUFDWixHQUFHLEdBQUU7SUFDSixPQUFPLENBQ047UUFDQztRQUNBO0tBQ0EsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLHdEQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBQyxJQUFLLFVBQVUsRUFBQztRQUMxRDtZQUNDO1lBQ0EsYUFBYTtZQUNiLFdBQVc7WUFDWCxRQUFRO1lBQ1IsWUFBWTtZQUNaLFVBQVU7WUFDVjtTQUNBLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyx3REFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFDLElBQUssVUFBVSxDQUFDLENBQ3BFO0FBQ0YsQ0FBQyxFQUNELElBQUksQ0FDSjtBQUVELHFEQUFHLENBQ0YsZ0JBQWdCLEVBQ2hCLEdBQUcsR0FBRTtJQUNKLHFCQUFxQixRQUE4QixFQUFFLEdBQUcsYUFBb0I7UUFDM0UsTUFBTSxPQUFNLEVBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUMzQixNQUFjLENBQUMsSUFBRyxFQUFHLFFBQVEsQ0FBQyxHQUFHO1FBQ2xDLE9BQU8sTUFBTTtJQUNkO0lBRUEsR0FBRyxDQUFDLE1BQUssR0FBSSx3REFBTSxDQUFDLE1BQU0sRUFBRTtRQUMzQixJQUFJLEVBQUMsRUFBRyxDQUFDO1FBQ1QsSUFBSSxTQUFRLEVBQUcsWUFBVyxNQUFNLENBQUMsRUFBRTtRQUVsQyxRQUFnQixDQUFDLElBQUcsRUFBRyxDQUFDLE1BQU0sQ0FBQztRQUNoQyxNQUFNLGNBQWEsRUFBRyx3REFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBQyxJQUFLLE1BQU07UUFFaEUsT0FBTyxhQUFhO0lBQ3JCO0lBRUEsT0FBTyxLQUFLO0FBQ2IsQ0FBQyxFQUNELElBQUksQ0FDSjtBQUVELHFEQUFHLENBQ0YsZUFBZSxFQUNmLEdBQUcsR0FBRTtJQUNKLE9BQU8sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyx3REFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFDLElBQUssVUFBVSxDQUFDO0FBQ2pHLENBQUMsRUFDRCxJQUFJLENBQ0o7QUFFRDtBQUNBLHFEQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsR0FBRyxPQUFPLHdEQUFNLENBQUMsT0FBTSxJQUFLLFlBQVcsR0FBSSxPQUFPLE1BQU0sR0FBRSxJQUFLLFFBQVEsRUFBRSxJQUFJLENBQUM7QUFFbkc7QUFDQSxxREFBRyxDQUNGLGFBQWEsRUFDYixHQUFHLEdBQUU7SUFDSixHQUFHLENBQUMsT0FBTyx3REFBTSxDQUFDLFFBQU8sSUFBSyxXQUFXLEVBQUU7UUFDMUM7UUFDQSxNQUFNLEtBQUksRUFBRyxFQUFFO1FBQ2YsTUFBTSxLQUFJLEVBQUcsRUFBRTtRQUNmLE1BQU0sSUFBRyxFQUFHLElBQUksd0RBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2VBQ1osR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsSUFBSyxFQUFDLEdBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFDLElBQUssSUFBRztJQUN2RDtJQUNBLE9BQU8sS0FBSztBQUNiLENBQUMsRUFDRCxJQUFJLENBQ0o7QUFFRDtBQUNBLHFEQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsUUFBcUIsU0FBb0IsT0FBK0IsRUFBRSxJQUFJLENBQUM7QUFDcEcscURBQUcsQ0FDRixhQUFhLEVBQ2IsR0FBRyxHQUFFO0lBQ0o7SUFDQTtJQUNBLE9BQU8sT0FBTyx3REFBTSxDQUFDLE9BQU0sSUFBSyxZQUFXLEdBQUksT0FBTyx3REFBTSxDQUFDLFlBQVcsSUFBSyxVQUFVO0FBQ3hGLENBQUMsRUFDRCxJQUFJLENBQ0o7QUFDRCxxREFBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUcsT0FBTyx3REFBTSxDQUFDLHNCQUFxQixJQUFLLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFDMUUscURBQUcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxHQUFHLE9BQU8sd0RBQU0sQ0FBQyxhQUFZLElBQUssV0FBVyxFQUFFLElBQUksQ0FBQztBQUUzRTtBQUVBLHFEQUFHLENBQ0Ysc0JBQXNCLEVBQ3RCLEdBQUcsR0FBRTtJQUNKLEdBQUcsTUFBb0IsR0FBSSxPQUFPLENBQUMsd0RBQU0sQ0FBQyxpQkFBZ0IsR0FBSSx3REFBTSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7UUFDN0Y7UUFDQTtRQUNBO1FBQ0E7UUFDQSxNQUFNLFFBQU8sRUFBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztRQUM3QztRQUNBLE1BQU0scUJBQW9CLEVBQUcsd0RBQU0sQ0FBQyxpQkFBZ0IsR0FBSSx3REFBTSxDQUFDLHNCQUFzQjtRQUNyRixNQUFNLFNBQVEsRUFBRyxJQUFJLG9CQUFvQixDQUFDLGNBQVksQ0FBQyxDQUFDO1FBQ3hELFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUksQ0FBRSxDQUFDO1FBRS9DLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFFN0MsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUM5QztJQUNBLE9BQU8sS0FBSztBQUNiLENBQUMsRUFDRCxJQUFJLENBQ0o7QUFFRCxxREFBRyxDQUNGLGtCQUFrQixFQUNsQixHQUFHLFFBQXNCLEdBQUksd0RBQU0sQ0FBQyxVQUFTLElBQUssVUFBUyxHQUFJLHdEQUFNLENBQUMsZUFBYyxJQUFLLFNBQVMsRUFDbEcsSUFBSSxDQUNKO0FBRUQscURBQUcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEdBQUcsT0FBTyx3REFBTSxDQUFDLGdCQUFlLElBQUssV0FBVyxDQUFDO0FBRTVFLHFEQUFHLENBQUMsY0FBYyxFQUFFLEdBQUcsR0FBRyxPQUFPLHdEQUFNLENBQUMsWUFBVyxJQUFLLFdBQVcsQ0FBQzs7Ozs7Ozs7O0FZNVFwRTtBQUFBO0FBQUE7QUFBK0I7QUFDUDtBQUd4QixxQkFBcUIsSUFBMkI7SUFDL0MsR0FBRyxDQUFDLEtBQUksR0FBSSxJQUFJLENBQUMsU0FBUSxHQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDM0MsSUFBSSxDQUFDLFFBQVEsRUFBRTtJQUNoQjtBQUNEO0FBRUEsd0JBQXdCLElBQWUsRUFBRSxVQUFvQztJQUM1RSxPQUFPO1FBQ04sT0FBTyxFQUFFO1lBQ1IsSUFBSSxDQUFDLFFBQU8sRUFBRyxjQUFZLENBQUM7WUFDNUIsSUFBSSxDQUFDLFNBQVEsRUFBRyxLQUFLO1lBQ3JCLElBQUksQ0FBQyxTQUFRLEVBQUcsSUFBSTtZQUVwQixHQUFHLENBQUMsVUFBVSxFQUFFO2dCQUNmLFVBQVUsRUFBRTtZQUNiO1FBQ0Q7S0FDQTtBQUNGO0FBWUEsSUFBSSxtQkFBK0I7QUFDbkMsSUFBSSxVQUF1QjtBQUUzQjs7Ozs7O0FBTU8sTUFBTSxVQUFTLEVBQUcsQ0FBQztJQUN6QixJQUFJLFVBQW1DO0lBQ3ZDLElBQUksT0FBa0M7SUFFdEM7SUFDQSxHQUFHLEtBQW1CLEVBQUU7UUFDdkIsTUFBTSxNQUFLLEVBQWdCLEVBQUU7UUFFN0Isd0RBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBUyxLQUF1QjtZQUNsRTtZQUNBLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTSxJQUFLLHlEQUFNLEdBQUksS0FBSyxDQUFDLEtBQUksSUFBSyxvQkFBb0IsRUFBRTtnQkFDbkUsS0FBSyxDQUFDLGVBQWUsRUFBRTtnQkFFdkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7b0JBQ2pCLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzNCO1lBQ0Q7UUFDRCxDQUFDLENBQUM7UUFFRixRQUFPLEVBQUcsVUFBUyxJQUFlO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2hCLHdEQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQztRQUM5QyxDQUFDO0lBQ0Y7SUFBRSxLQUFLLEdBQUcsTUFBb0IsRUFBRTtRQUMvQixXQUFVLEVBQUcsTUFBTSxDQUFDLGNBQWM7UUFDbEMsUUFBTyxFQUFHLFVBQVMsSUFBZTtZQUNqQyxPQUFPLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0Y7SUFBRSxLQUFLO1FBQ04sV0FBVSxFQUFHLE1BQU0sQ0FBQyxZQUFZO1FBQ2hDLFFBQU8sRUFBRyxVQUFTLElBQWU7WUFDakMsT0FBTyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELENBQUM7SUFDRjtJQUVBLG1CQUFtQixRQUFpQztRQUNuRCxNQUFNLEtBQUksRUFBYztZQUN2QixRQUFRLEVBQUUsSUFBSTtZQUNkLFFBQVEsRUFBRTtTQUNWO1FBQ0QsTUFBTSxHQUFFLEVBQVEsT0FBTyxDQUFDLElBQUksQ0FBQztRQUU3QixPQUFPLGNBQWMsQ0FDcEIsSUFBSSxFQUNKLFdBQVU7WUFDVDtnQkFDQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUNGO0lBQ0Y7SUFFQTs7UUFFQyxFQUFFO1FBQ0YsRUFBRSxVQUFTLFFBQWlDO1lBQzFDLG1CQUFtQixFQUFFO1lBQ3JCLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUMxQjtBQUNKLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFBQTtBQUFBO0FBRUw7QUFDQTtBQUNBLEdBQUcsQ0FBQyxLQUFrQixFQUFFO0lBQ3ZCLElBQUksa0JBQWlCLEVBQUcsS0FBSztJQUU3QixXQUFVLEVBQUcsRUFBRTtJQUNmLG9CQUFtQixFQUFHO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixFQUFFO1lBQ3ZCLGtCQUFpQixFQUFHLElBQUk7WUFDeEIsU0FBUyxDQUFDO2dCQUNULGtCQUFpQixFQUFHLEtBQUs7Z0JBRXpCLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO29CQUN0QixJQUFJLElBQTJCO29CQUMvQixPQUFPLENBQUMsS0FBSSxFQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFO3dCQUNuQyxXQUFXLENBQUMsSUFBSSxDQUFDO29CQUNsQjtnQkFDRDtZQUNELENBQUMsQ0FBQztRQUNIO0lBQ0QsQ0FBQztBQUNGO0FBRUE7Ozs7Ozs7OztBQVNPLE1BQU0sbUJBQWtCLEVBQUcsQ0FBQztJQUNsQyxHQUFHLENBQUMsS0FBVyxFQUFFO1FBQ2hCLE9BQU8sU0FBUztJQUNqQjtJQUVBLDRCQUE0QixRQUFpQztRQUM1RCxNQUFNLEtBQUksRUFBYztZQUN2QixRQUFRLEVBQUUsSUFBSTtZQUNkLFFBQVEsRUFBRTtTQUNWO1FBQ0QsTUFBTSxNQUFLLEVBQVcscUJBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFekUsT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFO1lBQzNCLG9CQUFvQixDQUFDLEtBQUssQ0FBQztRQUM1QixDQUFDLENBQUM7SUFDSDtJQUVBOztRQUVDLEVBQUU7UUFDRixFQUFFLFVBQVMsUUFBaUM7WUFDMUMsbUJBQW1CLEVBQUU7WUFDckIsT0FBTyxrQkFBa0IsQ0FBQyxRQUFRLENBQUM7UUFDbkM7QUFDSixDQUFDLENBQUMsRUFBRSxDQUFDO0FBQUE7QUFBQTtBQUVMOzs7Ozs7Ozs7O0FBVU8sSUFBSSxlQUFjLEVBQUcsQ0FBQztJQUM1QixJQUFJLE9BQWtDO0lBRXRDLEdBQUcsTUFBaUIsRUFBRTtRQUNyQixRQUFPLEVBQUcsVUFBUyxJQUFlO1lBQ2pDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RELENBQUM7SUFDRjtJQUFFLEtBQUssR0FBRyxLQUFtQixFQUFFO1FBQzlCLFFBQU8sRUFBRyxVQUFTLElBQWU7WUFDakMsd0RBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDL0MsQ0FBQztJQUNGO0lBQUUsS0FBSyxHQUFHLEtBQTRCLEVBQUU7UUFDdkM7UUFDQSxNQUFNLHFCQUFvQixFQUFHLE1BQU0sQ0FBQyxpQkFBZ0IsR0FBSSxNQUFNLENBQUMsc0JBQXNCO1FBQ3JGLE1BQU0sS0FBSSxFQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sTUFBSyxFQUFnQixFQUFFO1FBQzdCLE1BQU0sU0FBUSxFQUFHLElBQUksb0JBQW9CLENBQUM7WUFDekMsT0FBTyxLQUFLLENBQUMsT0FBTSxFQUFHLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxLQUFJLEVBQUcsS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFDMUIsR0FBRyxDQUFDLEtBQUksR0FBSSxJQUFJLENBQUMsU0FBUSxHQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQzNDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2hCO1lBQ0Q7UUFDRCxDQUFDLENBQUM7UUFFRixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFJLENBQUUsQ0FBQztRQUU1QyxRQUFPLEVBQUcsVUFBUyxJQUFlO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQztRQUN0QyxDQUFDO0lBQ0Y7SUFBRSxLQUFLO1FBQ04sUUFBTyxFQUFHLFVBQVMsSUFBZTtZQUNqQyxtQkFBbUIsRUFBRTtZQUNyQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixDQUFDO0lBQ0Y7SUFFQSxPQUFPLFVBQVMsUUFBaUM7UUFDaEQsTUFBTSxLQUFJLEVBQWM7WUFDdkIsUUFBUSxFQUFFLElBQUk7WUFDZCxRQUFRLEVBQUU7U0FDVjtRQUVELE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFFYixPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUM7SUFDNUIsQ0FBQztBQUNGLENBQUMsQ0FBQyxFQUFFOzs7Ozs7Ozs7QWIzTko7QUFBQTtBQUFBOzs7Ozs7OztHQVFHO0FBQ0ksNEJBQ04sS0FBUSxFQUNSLGFBQXNCLEtBQUssRUFDM0IsV0FBb0IsSUFBSSxFQUN4QixlQUF3QixJQUFJO0lBRTVCLE1BQU0sQ0FBQztRQUNOLEtBQUssRUFBRSxLQUFLO1FBQ1osVUFBVSxFQUFFLFVBQVU7UUFDdEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsWUFBWSxFQUFFLFlBQVk7S0FDMUIsQ0FBQztBQUNILENBQUM7QUFtQk0sb0JBQW9CLGNBQXVDO0lBQ2pFLE1BQU0sQ0FBQyxVQUFTLE1BQVcsRUFBRSxHQUFHLElBQVc7UUFDMUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQztBQUNILENBQUM7Ozs7Ozs7OztBYzVDRDtBQUF1RDtBQU1oRCxjQUF3QixTQUFRLDhEQUF5QjtJQUkvRCxZQUFZLE9BQVU7UUFDckIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQXVCO1FBQzVDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxHQUFHO1FBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVNLEdBQUcsQ0FBQyxPQUFVO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQixDQUFDO0lBQ0YsQ0FBQztDQUNEO0FBQUE7QUFBQTtBQUVjLGtGQUFRLEVBQUM7Ozs7Ozs7OztBQy9CeEI7QUFBQTtBQUFBO0FBQXVEO0FBQ3pCO0FBRzlCOzs7OztBQUtBLElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUN4Qix3Q0FBdUI7SUFDdkIsa0NBQWlCO0FBQ2xCLENBQUMsRUFIVyxjQUFhLElBQWIsY0FBYTtBQVVuQixrQkFBbUIsUUFBUSwrREFBNEI7SUFBN0Q7O1FBQ1MsY0FBUSxFQUFHLElBQUksMERBQUcsRUFBbUI7SUEwQjlDO0lBeEJRLEdBQUcsQ0FBQyxHQUFXO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQzlCO0lBRU8sR0FBRyxDQUFDLEdBQVc7UUFDckIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDOUI7SUFFTyxHQUFHLENBQUMsT0FBZ0IsRUFBRSxHQUFXO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFHLENBQUUsQ0FBQztJQUN6QjtJQUVPLE9BQU87UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxPQUFNLENBQUUsQ0FBQztJQUMxQztJQUVPLFlBQVk7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsVUFBUyxDQUFFLENBQUM7SUFDN0M7SUFFTyxLQUFLO1FBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7SUFDdEI7Ozs7QUFHYyxvRUFBVyxFQUFDOzs7Ozs7Ozs7QUNoRDNCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBc0M7QUFDUjtBQUN5QjtBQW1CdkQ7OztBQUdPLE1BQU0saUJBQWdCLEVBQUcsb0JBQW9CLENBQUM7QUFBQTtBQUFBO0FBMkRyRDs7Ozs7O0FBTU0saUNBQWlFLElBQVM7SUFDL0UsT0FBTyxPQUFPLENBQUMsS0FBSSxHQUFJLElBQUksQ0FBQyxNQUFLLElBQUssZ0JBQWdCLENBQUM7QUFDeEQ7QUFFTSwwQ0FBOEMsSUFBUztJQUM1RCxPQUFPLE9BQU8sQ0FDYixLQUFJO1FBQ0gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUM7UUFDakMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUM7UUFDOUIsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUN0QztBQUNGO0FBRUE7OztBQUdNLGVBQWdCLFFBQVEsK0RBQStDO0lBUTVFOzs7SUFHUSxlQUFlLENBQUMsV0FBMEIsRUFBRSxJQUEwQztRQUM3RixJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ1QsSUFBSSxFQUFFLFdBQVc7WUFDakIsTUFBTSxFQUFFLFFBQVE7WUFDaEI7U0FDQSxDQUFDO0lBQ0g7SUFFTyxNQUFNLENBQUMsS0FBb0IsRUFBRSxJQUFrQjtRQUNyRCxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFlLElBQUssU0FBUyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxnQkFBZSxFQUFHLElBQUksMERBQUcsRUFBRTtRQUNqQztRQUVBLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztRQUNoRjtRQUVBLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7UUFFckMsR0FBRyxDQUFDLEtBQUksV0FBWSw4REFBTyxFQUFFO1lBQzVCLElBQUksQ0FBQyxJQUFJLENBQ1IsQ0FBQyxVQUFVLEVBQUUsR0FBRTtnQkFDZCxJQUFJLENBQUMsZUFBZ0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDO2dCQUN2QyxPQUFPLFVBQVU7WUFDbEIsQ0FBQyxFQUNELENBQUMsS0FBSyxFQUFFLEdBQUU7Z0JBQ1QsTUFBTSxLQUFLO1lBQ1osQ0FBQyxDQUNEO1FBQ0Y7UUFBRSxLQUFLLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7UUFDbEM7SUFDRDtJQUVPLGNBQWMsQ0FBQyxLQUFvQixFQUFFLGVBQWdDO1FBQzNFLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWlCLElBQUssU0FBUyxFQUFFO1lBQ3pDLElBQUksQ0FBQyxrQkFBaUIsRUFBRyxJQUFJLDBEQUFHLEVBQUU7UUFDbkM7UUFFQSxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztRQUNsRjtRQUVBLE1BQU0sWUFBVyxFQUFHLElBQUksOERBQU8sRUFBRTtRQUVqQyxNQUFNLGFBQVksRUFBaUI7WUFDbEMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxhQUFZLENBQUUsQ0FBQyxDQUFDO1lBQ3pFO1NBQ0E7UUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUM7UUFDL0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDO0lBQzFDO0lBRU8sR0FBRyxDQUFzRCxLQUFvQjtRQUNuRixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWUsR0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUMsT0FBTyxJQUFJO1FBQ1o7UUFFQSxNQUFNLEtBQUksRUFBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFFNUMsR0FBRyxDQUFDLHVCQUF1QixDQUFJLElBQUksQ0FBQyxFQUFFO1lBQ3JDLE9BQU8sSUFBSTtRQUNaO1FBRUEsR0FBRyxDQUFDLEtBQUksV0FBWSw4REFBTyxFQUFFO1lBQzVCLE9BQU8sSUFBSTtRQUNaO1FBRUEsTUFBTSxRQUFPLEVBQW1DLElBQUssRUFBRTtRQUN2RCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO1FBRXhDLE9BQU8sQ0FBQyxJQUFJLENBQ1gsQ0FBQyxVQUFVLEVBQUUsR0FBRTtZQUNkLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBSSxVQUFVLENBQUMsRUFBRTtnQkFDcEQsV0FBVSxFQUFHLFVBQVUsQ0FBQyxPQUFPO1lBQ2hDO1lBRUEsSUFBSSxDQUFDLGVBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUM7WUFDNUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDO1lBQ3ZDLE9BQU8sVUFBVTtRQUNsQixDQUFDLEVBQ0QsQ0FBQyxLQUFLLEVBQUUsR0FBRTtZQUNULE1BQU0sS0FBSztRQUNaLENBQUMsQ0FDRDtRQUVELE9BQU8sSUFBSTtJQUNaO0lBRU8sV0FBVyxDQUFJLEtBQW9CO1FBQ3pDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBaUIsR0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDeEQsT0FBTyxJQUFJO1FBQ1o7UUFFQSxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFO0lBQzFDO0lBRU8sR0FBRyxDQUFDLEtBQW9CO1FBQzlCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZSxHQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hFO0lBRU8sV0FBVyxDQUFDLEtBQW9CO1FBQ3RDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBaUIsR0FBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVFOzs7O0FBR2MsaUVBQVEsRUFBQzs7Ozs7Ozs7O0FDaE94QjtBQUFBO0FBQUE7QUFBa0M7QUFDcUI7QUFFa0I7QUFNbkUsc0JBQXVCLFFBQVEsK0RBQWdDO0lBTXBFO1FBQ0MsS0FBSyxFQUFFO1FBTkEsZUFBUyxFQUFHLElBQUksMkRBQVEsRUFBRTtRQUMxQiw2QkFBdUIsRUFBbUMsSUFBSSxzREFBRyxFQUFFO1FBQ25FLCtCQUF5QixFQUFtQyxJQUFJLHNEQUFHLEVBQUU7UUFLNUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3hCLE1BQU0sUUFBTyxFQUFHLEdBQUcsR0FBRTtZQUNwQixHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDdEIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUN0RCxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxhQUFZLEVBQUcsU0FBUztZQUM5QjtRQUNELENBQUM7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBTyxDQUFFLENBQUM7SUFDdEI7SUFFQSxJQUFXLElBQUksQ0FBQyxZQUFzQjtRQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN0QixJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDdEQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ3pEO1FBQ0EsSUFBSSxDQUFDLGFBQVksRUFBRyxZQUFZO0lBQ2pDO0lBRU8sTUFBTSxDQUFDLEtBQW9CLEVBQUUsTUFBb0I7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQztJQUNyQztJQUVPLGNBQWMsQ0FBQyxLQUFvQixFQUFFLFFBQXlCO1FBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7SUFDL0M7SUFFTyxHQUFHLENBQUMsS0FBb0I7UUFDOUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsR0FBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQVksR0FBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRjtJQUVPLFdBQVcsQ0FBQyxLQUFvQjtRQUN0QyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBQyxHQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBWSxHQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9HO0lBRU8sR0FBRyxDQUNULEtBQW9CLEVBQ3BCLG1CQUE0QixLQUFLO1FBRWpDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztJQUMvRTtJQUVPLFdBQVcsQ0FBSSxLQUFvQixFQUFFLG1CQUE0QixLQUFLO1FBQzVFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQztJQUN6RjtJQUVRLElBQUksQ0FDWCxLQUFvQixFQUNwQixnQkFBeUIsRUFDekIsZUFBc0MsRUFDdEMsUUFBd0M7UUFFeEMsTUFBTSxXQUFVLEVBQUcsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUMvRyxJQUFJLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNDLE1BQU0sU0FBUSxFQUFRLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbkMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFO2dCQUNkLFFBQVE7WUFDVDtZQUNBLE1BQU0sS0FBSSxFQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDN0MsTUFBTSxpQkFBZ0IsRUFBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBQyxHQUFJLEVBQUU7WUFDckQsR0FBRyxDQUFDLElBQUksRUFBRTtnQkFDVCxPQUFPLElBQUk7WUFDWjtZQUFFLEtBQUssR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsSUFBSyxDQUFDLENBQUMsRUFBRTtnQkFDbEQsTUFBTSxPQUFNLEVBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUEwQixFQUFFLEdBQUU7b0JBQ2hFLEdBQUcsQ0FDRixLQUFLLENBQUMsT0FBTSxJQUFLLFNBQVE7d0JBQ3hCLElBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUMsSUFBSyxLQUFLLENBQUMsSUFDbkUsRUFBRTt3QkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQVksQ0FBRSxDQUFDO29CQUNsQztnQkFDRCxDQUFDLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hCLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRDtRQUNEO1FBQ0EsT0FBTyxJQUFJO0lBQ1o7Ozs7QUFHYyx3RUFBZSxFQUFDOzs7Ozs7Ozs7QUNoRy9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQThCO0FBQ1E7QUFDVztBQUNuQjtBQWtCa0I7QUFDUjtBQUMrQjtBQW9CdkUsSUFBSSxhQUFZLEVBQUcsQ0FBQztBQUNwQixNQUFNLGdCQUFlLEVBQUcsSUFBSSw4REFBTyxFQUFzQjtBQUN6RCxNQUFNLGFBQVksRUFBRyxJQUFJLDBEQUFHLEVBQWdDO0FBQ3JELE1BQU0sa0JBQWlCLEVBQUcsSUFBSSw4REFBTyxFQUd6QyxDQUFDO0FBQUE7QUFBQTtBQUNKLE1BQU0sVUFBUyxFQUFHLG1EQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUUxQixNQUFNLE9BQU0sRUFBRyxnQkFBZ0IsQ0FBQztBQUFBO0FBQUE7QUFFdkMscUJBQXFCLElBQVM7SUFDN0IsT0FBTztRQUNOLEdBQUcsRUFBRSxFQUFFO1FBQ1AsVUFBVSxFQUFFLEVBQUU7UUFDZCxRQUFRLEVBQUUsU0FBUztRQUNuQixJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUU7UUFDZixJQUFJLEVBQUU7S0FDTjtBQUNGO0FBRUEsc0JBQXNCLElBQVM7SUFDOUIsT0FBTyxPQUFPLENBQUMsS0FBSSxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkM7QUFFQTs7O0FBR007SUFnREw7OztJQUdBO1FBeENBOzs7UUFHUSx3QkFBa0IsRUFBRyxJQUFJO1FBT2pDOzs7UUFHUSwwQkFBb0IsRUFBYSxFQUFFO1FBb0JuQyxrQkFBWSxFQUFnQixJQUFJLDZEQUFXLEVBQUU7UUFFN0MsY0FBUSxFQUFhLEVBQUU7UUFNOUIsSUFBSSxDQUFDLFVBQVMsRUFBRyxFQUFFO1FBQ25CLElBQUksQ0FBQyxnQkFBZSxFQUFHLElBQUksMERBQUcsRUFBaUI7UUFDL0MsSUFBSSxDQUFDLFlBQVcsRUFBTSxFQUFFO1FBQ3hCLElBQUksQ0FBQyxpQkFBZ0IsRUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDOUMsSUFBSSxDQUFDLGlCQUFnQixFQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUVsRCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQzNCLEtBQUssRUFBRSxJQUFJO1lBQ1gsUUFBUSxFQUFFLEdBQVMsR0FBRTtnQkFDcEIsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNoQixDQUFDO1lBQ0QsUUFBUSxFQUFFLEdBQVMsR0FBRTtnQkFDcEIsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2YsQ0FBQztZQUNELFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWTtZQUM5QixTQUFTLEVBQUUsS0FBSztZQUNoQixlQUFlLEVBQUU7U0FDakIsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUixPQUFPLEVBQUUsR0FBRyxHQUFFO2dCQUNiLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFO2dCQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRTtZQUM1QjtTQUNBLENBQUM7UUFFRixJQUFJLENBQUMscUJBQXFCLEVBQUU7SUFDN0I7SUFFVSxJQUFJLENBQTJCLFFBQWtDO1FBQzFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUSxJQUFLLFNBQVMsRUFBRTtZQUNoQyxJQUFJLENBQUMsU0FBUSxFQUFHLElBQUksMERBQUcsRUFBOEM7UUFDdEU7UUFDQSxJQUFJLE9BQU0sRUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDeEMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ1osT0FBTSxFQUFHLElBQUksUUFBUSxDQUFDO2dCQUNyQixVQUFVLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtnQkFDakMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUM5QixJQUFJLEVBQUU7YUFDTixDQUFDO1lBQ0YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztRQUNwQztRQUVBLE9BQU8sTUFBVztJQUNuQjtJQUVVLFFBQVE7UUFDakI7SUFDRDtJQUVVLFFBQVE7UUFDakI7SUFDRDtJQUVBLElBQVcsVUFBVTtRQUNwQixPQUFPLElBQUksQ0FBQyxXQUFXO0lBQ3hCO0lBRUEsSUFBVyxtQkFBbUI7UUFDN0IsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO0lBQ3RDO0lBRU8saUJBQWlCLENBQUMsa0JBQXNDLEVBQUUsSUFBMEI7UUFDMUYsTUFBTSxhQUFZLEVBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNoRCxHQUFHLENBQUMsWUFBWSxFQUFFO1lBQ2pCLFlBQVksQ0FBQyxnQkFBZSxFQUFHLGtCQUFrQjtRQUNsRDtRQUNBLE1BQU0sV0FBVSxFQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQztRQUNoRSxNQUFNLDRCQUEyQixFQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUM7UUFDL0UsTUFBTSxvQkFBbUIsRUFBYSxFQUFFO1FBQ3hDLE1BQU0sY0FBYSxFQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRTdDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQWtCLElBQUssTUFBSyxHQUFJLDJCQUEyQixDQUFDLE9BQU0sSUFBSyxDQUFDLEVBQUU7WUFDbEYsTUFBTSxjQUFhLEVBQUcsQ0FBQyxHQUFHLGFBQWEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sa0JBQWlCLEVBQXdCLEVBQUU7WUFDakQsTUFBTSxvQkFBbUIsRUFBUSxFQUFFO1lBQ25DLElBQUksYUFBWSxFQUFHLEtBQUs7WUFFeEIsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsTUFBTSxhQUFZLEVBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDckMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUMsSUFBSyxDQUFDLENBQUMsRUFBRTtvQkFDbkQsUUFBUTtnQkFDVDtnQkFDQSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUNwQyxNQUFNLGlCQUFnQixFQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDO2dCQUN2RCxNQUFNLFlBQVcsRUFBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksQ0FBQztnQkFDOUUsR0FBRyxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUMsSUFBSyxDQUFDLENBQUMsRUFBRTtvQkFDN0QsYUFBWSxFQUFHLElBQUk7b0JBQ25CLE1BQU0sY0FBYSxFQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLFlBQVksRUFBRSxDQUFDO29CQUN2RSxJQUFJLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM5QyxNQUFNLE9BQU0sRUFBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDO3dCQUM5RCxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQU8sR0FBSSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFDLElBQUssQ0FBQyxDQUFDLEVBQUU7NEJBQ3ZFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7d0JBQ3ZDO3dCQUNBLEdBQUcsQ0FBQyxhQUFZLEdBQUksVUFBVSxFQUFFOzRCQUMvQixtQkFBbUIsQ0FBQyxZQUFZLEVBQUMsRUFBRyxNQUFNLENBQUMsS0FBSzt3QkFDakQ7b0JBQ0Q7Z0JBQ0Q7Z0JBQUUsS0FBSztvQkFDTixNQUFNLE9BQU0sRUFBRyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDO29CQUN2RCxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQU8sR0FBSSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFDLElBQUssQ0FBQyxDQUFDLEVBQUU7d0JBQ3ZFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7b0JBQ3ZDO29CQUNBLEdBQUcsQ0FBQyxhQUFZLEdBQUksVUFBVSxFQUFFO3dCQUMvQixtQkFBbUIsQ0FBQyxZQUFZLEVBQUMsRUFBRyxNQUFNLENBQUMsS0FBSztvQkFDakQ7Z0JBQ0Q7WUFDRDtZQUVBLEdBQUcsQ0FBQyxZQUFZLEVBQUU7Z0JBQ2pCLE1BQU0sa0JBQWlCLEVBQTZCLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDO2dCQUNyRixNQUFNLGtCQUFpQixFQUFlLEVBQUU7Z0JBQ3hDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLGFBQVksQ0FBRSxFQUFFLEdBQUU7b0JBQ3hELE1BQU0sZ0JBQWUsRUFBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFDLElBQUssQ0FBQyxDQUFDO29CQUN4RSxNQUFNLFlBQVcsRUFBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFDLElBQUssQ0FBQyxDQUFDO29CQUM5RCxHQUFHLENBQUMsZ0JBQWUsR0FBSSxDQUFDLFdBQVcsRUFBRTt3QkFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQzt3QkFDMUQsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDakM7Z0JBQ0QsQ0FBQyxDQUFDO1lBQ0g7WUFDQSxJQUFJLENBQUMsWUFBVyxFQUFHLG1CQUFtQjtZQUN0QyxJQUFJLENBQUMscUJBQW9CLEVBQUcsbUJBQW1CO1FBQ2hEO1FBQUUsS0FBSztZQUNOLElBQUksQ0FBQyxtQkFBa0IsRUFBRyxLQUFLO1lBQy9CLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsRUFBQyxFQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLE1BQU0sYUFBWSxFQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLEdBQUcsQ0FBQyxPQUFPLFVBQVUsQ0FBQyxZQUFZLEVBQUMsSUFBSyxVQUFVLEVBQUU7b0JBQ25ELFVBQVUsQ0FBQyxZQUFZLEVBQUMsRUFBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksQ0FBQztnQkFDdEY7Z0JBQUUsS0FBSztvQkFDTixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUN2QztZQUNEO1lBQ0EsSUFBSSxDQUFDLHFCQUFvQixFQUFHLG1CQUFtQjtZQUMvQyxJQUFJLENBQUMsWUFBVyxvQkFBUSxVQUFVLENBQUU7UUFDckM7UUFFQSxHQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU0sRUFBRyxDQUFDLEVBQUU7WUFDekMsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNsQjtJQUNEO0lBRUEsSUFBVyxRQUFRO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVM7SUFDdEI7SUFFTyxlQUFlLENBQUMsUUFBc0I7UUFDNUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTSxFQUFHLEVBQUMsR0FBSSxRQUFRLENBQUMsT0FBTSxFQUFHLENBQUMsRUFBRTtZQUNyRCxJQUFJLENBQUMsVUFBUyxFQUFHLFFBQVE7WUFDekIsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNsQjtJQUNEO0lBS1EsaUJBQWlCLENBQUMsS0FBc0I7UUFDL0MsTUFBTSxRQUFPLEVBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDcEMsTUFBTSxjQUFhLEVBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDNUQsTUFBTSxlQUFjLEVBQXNCLEVBQUU7UUFDNUMsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QyxNQUFNLEtBQUksRUFBRyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDVixRQUFRO1lBQ1Q7WUFDQSxHQUFHLENBQUMsT0FBTyxLQUFJLElBQUssUUFBUSxFQUFFO2dCQUM3QixjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsUUFBUTtZQUNUO1lBQ0EsR0FBRyxDQUFDLDJEQUFPLENBQUMsSUFBSSxFQUFDLEdBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNyRCxNQUFNLFdBQVUsRUFBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO2dCQUN6RCxJQUFJLENBQUMsbUJBQWtCLEVBQUcsSUFBSSxDQUFDLFVBQVU7Z0JBQ3pDLElBQUksQ0FBQyxXQUFVLG9CQUFRLFVBQVUsRUFBSyxJQUFJLENBQUMsVUFBVSxDQUFFO1lBQ3hEO1lBQ0EsR0FBRyxDQUFDLDJEQUFPLENBQUMsSUFBSSxFQUFDLEdBQUksQ0FBQyxrRkFBdUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDdEUsR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLGtCQUFpQixJQUFLLFVBQVUsRUFBRTtvQkFDakQsSUFBSSxHQUFFLEVBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7b0JBQ3BELEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRTt3QkFDUixHQUFFLEVBQUcsaUJBQWlCLFlBQVksRUFBRSxFQUFFO3dCQUN0QyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUM7d0JBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUM7b0JBQ2pEO29CQUNBLElBQUksQ0FBQyxrQkFBaUIsRUFBRyxFQUFFO2dCQUM1QjtnQkFBRSxLQUFLLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7b0JBQ2hELE1BQU0sRUFBRSxLQUFLLEVBQUUsYUFBWSxFQUFFLEVBQUcsSUFBSSxDQUFDLGlCQUFpQjtvQkFDdEQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUM7b0JBQzFDO29CQUNBLElBQUksQ0FBQyxrQkFBaUIsRUFBRyxLQUFLO2dCQUMvQjtnQkFFQSxJQUFJLENBQUMsa0JBQWlCO29CQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBYSxJQUFJLENBQUMsaUJBQWlCLEVBQUMsR0FBSSxJQUFJLENBQUMsaUJBQWlCO1lBQ2pGO1lBQ0EsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDZixJQUFJLENBQUMsS0FBSSxFQUFHLElBQUk7WUFDakI7WUFDQSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVEsR0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDMUMsSUFBSSxDQUFDLFNBQVEsRUFBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN0RDtRQUNEO1FBQ0EsT0FBTyxRQUFRLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDcEQ7SUFFTyxVQUFVO1FBQ2hCLE1BQU0sYUFBWSxFQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDaEQsR0FBRyxDQUFDLFlBQVksRUFBRTtZQUNqQixZQUFZLENBQUMsTUFBSyxFQUFHLEtBQUs7UUFDM0I7UUFDQSxNQUFNLE9BQU0sRUFBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7UUFDdkMsTUFBTSxNQUFLLEVBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFO1FBQ3pCLE9BQU8sS0FBSztJQUNiO0lBRU8sVUFBVTtRQUNoQixNQUFNLGFBQVksRUFBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ2hELEdBQUcsQ0FBQyxhQUFZLEdBQUksWUFBWSxDQUFDLFVBQVUsRUFBRTtZQUM1QyxZQUFZLENBQUMsVUFBVSxFQUFFO1FBQzFCO0lBQ0Q7SUFFVSxNQUFNO1FBQ2YsT0FBTyxxREFBQyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUNuQztJQUVBOzs7Ozs7SUFNVSxZQUFZLENBQUMsWUFBb0IsRUFBRSxLQUFVO1FBQ3RELE1BQUssRUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztRQUM5QyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN2QyxJQUFJLGNBQWEsRUFBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDdEQsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFO2dCQUNuQixjQUFhLEVBQUcsSUFBSSwwREFBRyxFQUFpQjtnQkFDeEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQztZQUNsRDtZQUVBLElBQUksc0JBQXFCLEVBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDM0QsR0FBRyxDQUFDLENBQUMscUJBQXFCLEVBQUU7Z0JBQzNCLHNCQUFxQixFQUFHLEVBQUU7Z0JBQzFCLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLHFCQUFxQixDQUFDO1lBQ3ZEO1lBQ0EscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3JDO1FBQUUsS0FBSztZQUNOLE1BQU0sV0FBVSxFQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO1lBQ2xELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDbEU7SUFDRDtJQUVBOzs7Ozs7O0lBT1EsbUJBQW1CLENBQUMsWUFBb0I7UUFDL0MsTUFBTSxjQUFhLEVBQUcsRUFBRTtRQUV4QixJQUFJLFlBQVcsRUFBRyxJQUFJLENBQUMsV0FBVztRQUVsQyxPQUFPLFdBQVcsRUFBRTtZQUNuQixNQUFNLFlBQVcsRUFBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUNqRCxHQUFHLENBQUMsV0FBVyxFQUFFO2dCQUNoQixNQUFNLFdBQVUsRUFBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztnQkFFaEQsR0FBRyxDQUFDLFVBQVUsRUFBRTtvQkFDZixhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDO2dCQUNyQztZQUNEO1lBRUEsWUFBVyxFQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO1FBQ2pEO1FBRUEsT0FBTyxhQUFhO0lBQ3JCO0lBRUE7Ozs7OztJQU1VLFlBQVksQ0FBQyxZQUFvQjtRQUMxQyxJQUFJLGNBQWEsRUFBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7UUFFMUQsR0FBRyxDQUFDLGNBQWEsSUFBSyxTQUFTLEVBQUU7WUFDaEMsT0FBTyxhQUFhO1FBQ3JCO1FBRUEsY0FBYSxFQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUM7UUFFdEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQztRQUNyRCxPQUFPLGFBQWE7SUFDckI7SUFFQTs7Ozs7SUFLUSxxQkFBcUIsQ0FBQyxRQUFhLEVBQUUsSUFBUztRQUNyRCxHQUFHLENBQUMsT0FBTyxTQUFRLElBQUssV0FBVSxHQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxHQUFJLGtGQUF1QixDQUFDLFFBQVEsRUFBQyxJQUFLLEtBQUssRUFBRTtZQUN2RyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF3QixJQUFLLFNBQVMsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLHlCQUF3QixFQUFHLElBQUksOERBQU8sRUFHeEM7WUFDSjtZQUNBLE1BQU0sU0FBUSxFQUErQixJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBQyxHQUFJLEVBQUU7WUFDOUYsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFLLEVBQUUsRUFBRyxRQUFRO1lBRW5DLEdBQUcsQ0FBQyxVQUFTLElBQUssVUFBUyxHQUFJLE1BQUssSUFBSyxJQUFJLEVBQUU7Z0JBQzlDLFVBQVMsRUFBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBNEI7Z0JBQzFELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFJLENBQUUsQ0FBQztZQUN4RTtZQUNBLE9BQU8sU0FBUztRQUNqQjtRQUNBLE9BQU8sUUFBUTtJQUNoQjtJQUVBLElBQVcsUUFBUTtRQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVMsSUFBSyxTQUFTLEVBQUU7WUFDakMsSUFBSSxDQUFDLFVBQVMsRUFBRyxJQUFJLGlFQUFlLEVBQUU7WUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFO1FBQ0EsT0FBTyxJQUFJLENBQUMsU0FBUztJQUN0QjtJQUVRLG9CQUFvQixDQUFDLFVBQWU7UUFDM0MsTUFBTSxpQkFBZ0IsRUFBdUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQztRQUNsRixHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTSxFQUFHLENBQUMsRUFBRTtZQUNoQyxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FDN0IsQ0FBQyxVQUFVLEVBQUUsd0JBQXdCLEVBQUUsR0FBRTtnQkFDeEMsT0FBTSxrQkFBTSxVQUFVLEVBQUssd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7WUFDM0UsQ0FBQyxvQkFDSSxVQUFVLEVBQ2Y7UUFDRjtRQUNBLE9BQU8sVUFBVTtJQUNsQjtJQUVBOzs7SUFHUSxpQkFBaUI7UUFDeEIsTUFBTSxjQUFhLEVBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUM7UUFFdkQsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFNLEVBQUcsQ0FBQyxFQUFFO1lBQzdCLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQWMsRUFBRSxvQkFBa0MsRUFBRSxHQUFFO2dCQUNsRixNQUFNLGNBQWEsRUFBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQy9GLEdBQUcsQ0FBQyxDQUFDLGFBQWEsRUFBRTtvQkFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyx1RUFBdUUsQ0FBQztvQkFDckYsT0FBTyxNQUFNO2dCQUNkO2dCQUNBLE9BQU8sYUFBYTtZQUNyQixDQUFDLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzFCO1FBQ0EsT0FBTyxJQUFJLENBQUMsZ0JBQWdCO0lBQzdCO0lBRUE7Ozs7O0lBS1EsZ0JBQWdCLENBQUMsS0FBc0I7UUFDOUMsTUFBTSxhQUFZLEVBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUM7UUFFckQsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFNLEVBQUcsQ0FBQyxFQUFFO1lBQzVCLE1BQUssRUFBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBc0IsRUFBRSxtQkFBZ0MsRUFBRSxHQUFFO2dCQUN4RixPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO1lBQzdDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDVjtRQUVBLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUSxJQUFLLFNBQVMsRUFBRTtZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFFO2dCQUM5QixJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ25CLENBQUMsQ0FBQztRQUNIO1FBRUEsT0FBTyxLQUFLO0lBQ2I7SUFFUSxxQkFBcUI7UUFDNUIsTUFBTSxrQkFBaUIsRUFBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDO1FBRS9ELEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFNLEVBQUcsQ0FBQyxFQUFFO1lBQ2pDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdFO0lBQ0Q7SUFFVSxHQUFHLENBQUMsTUFBYztRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDM0I7SUFFVSxPQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFNLEVBQUcsQ0FBQyxFQUFFO1lBQ2hDLE1BQU0sT0FBTSxFQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2xDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNqQjtRQUNEO0lBQ0Q7Ozs7QUEvY0E7OztBQUdPLGlCQUFLLEVBQUcsbUVBQWdCO0FBK2NqQixtRUFBVSxFQUFDOzs7Ozs7Ozs7QUN4aEIxQixJQUFJLHFDQUFxQyxHQUFHLEVBQUUsQ0FBQztBQUMvQyxJQUFJLG9DQUFvQyxHQUFHLEVBQUUsQ0FBQztBQUU5QyxvQ0FBb0MsT0FBb0I7SUFDdkQsRUFBRSxDQUFDLENBQUMsa0JBQWtCLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDekMscUNBQXFDLEdBQUcscUJBQXFCLENBQUM7UUFDOUQsb0NBQW9DLEdBQUcsb0JBQW9CLENBQUM7SUFDN0QsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxlQUFlLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUUscUNBQXFDLEdBQUcsZUFBZSxDQUFDO1FBQ3hELG9DQUFvQyxHQUFHLGNBQWMsQ0FBQztJQUN2RCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDUCxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFDbEQsQ0FBQztBQUNGLENBQUM7QUFFRCxvQkFBb0IsT0FBb0I7SUFDdkMsRUFBRSxDQUFDLENBQUMsb0NBQW9DLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqRCwwQkFBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQyxDQUFDO0FBQ0YsQ0FBQztBQUVELHVCQUF1QixPQUFvQixFQUFFLGNBQTBCLEVBQUUsZUFBMkI7SUFDbkcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXBCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztJQUVyQixJQUFJLGFBQWEsR0FBRztRQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDZixRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxxQ0FBcUMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUNsRixPQUFPLENBQUMsbUJBQW1CLENBQUMsb0NBQW9DLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFakYsZUFBZSxFQUFFLENBQUM7UUFDbkIsQ0FBQztJQUNGLENBQUMsQ0FBQztJQUVGLGNBQWMsRUFBRSxDQUFDO0lBRWpCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxvQ0FBb0MsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5RSxPQUFPLENBQUMsZ0JBQWdCLENBQUMscUNBQXFDLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDaEYsQ0FBQztBQUVELGNBQWMsSUFBaUIsRUFBRSxVQUEyQixFQUFFLGFBQXFCLEVBQUUsVUFBc0I7SUFDMUcsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixJQUFJLEdBQUcsYUFBYSxTQUFTLENBQUM7SUFFaEYsYUFBYSxDQUNaLElBQUksRUFDSixHQUFHLEVBQUU7UUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVsQyxxQkFBcUIsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsRUFDRCxHQUFHLEVBQUU7UUFDSixVQUFVLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FDRCxDQUFDO0FBQ0gsQ0FBQztBQUVELGVBQWUsSUFBaUIsRUFBRSxVQUEyQixFQUFFLGNBQXNCO0lBQ3BGLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsSUFBSSxHQUFHLGNBQWMsU0FBUyxDQUFDO0lBRWxGLGFBQWEsQ0FDWixJQUFJLEVBQ0osR0FBRyxFQUFFO1FBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFbkMscUJBQXFCLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLEVBQ0QsR0FBRyxFQUFFO1FBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUNELENBQUM7QUFDSCxDQUFDO0FBRWM7SUFDZCxLQUFLO0lBQ0wsSUFBSTtDQUNKLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuRUY7O0dBRUc7QUFDSSxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUM7QUFBQTtBQUFBO0FBRXBDOztHQUVHO0FBQ0ksTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDO0FBQUE7QUFBQTtBQUVwQzs7R0FFRztBQUNJLE1BQU0sUUFBUSxHQUFHLGlCQUFpQixDQUFDO0FBQUE7QUFBQTtBQUUxQzs7R0FFRztBQUNJLGlCQUNOLEtBQXFCO0lBRXJCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDs7R0FFRztBQUNJLGlCQUFpQixLQUFZO0lBQ25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztBQUN6RyxDQUFDO0FBRUQ7O0dBRUc7QUFDSSxvQkFBb0IsS0FBWTtJQUN0QyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRU0sdUJBQXVCLEtBQVU7SUFDdkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ3hCLENBQUM7QUFrRE0sa0JBQ04sTUFBdUIsRUFDdkIsaUJBQTJELEVBQzNELFNBQTRCO0lBRTVCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNwQixJQUFJLFFBQVEsQ0FBQztJQUNiLEVBQUUsQ0FBQyxDQUFDLE9BQU8saUJBQWlCLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM3QyxRQUFRLEdBQUcsaUJBQWlCLENBQUM7SUFDOUIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1AsUUFBUSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztRQUN0QyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDO1FBQ3hDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDO0lBQzlDLENBQUM7SUFFRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0Q7UUFDQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1YsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDZixDQUFDO0FBZU0sV0FDTix1QkFBa0csRUFDbEcsVUFBMkIsRUFDM0IsUUFBd0I7SUFFeEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLFVBQVUscUJBQVMsdUJBQXVCLENBQUMsVUFBa0IsRUFBTSxVQUFrQixDQUFFLENBQUM7UUFDeEYsUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUM7UUFDbEUsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUMsaUJBQWlCLENBQUM7SUFDckUsQ0FBQztJQUVELE1BQU0sQ0FBQztRQUNOLFFBQVEsRUFBRSxRQUFRLElBQUksRUFBRTtRQUN4QixpQkFBaUIsRUFBRSx1QkFBdUI7UUFDMUMsVUFBVTtRQUNWLElBQUksRUFBRSxLQUFLO0tBQ1gsQ0FBQztBQUNILENBQUM7QUFVTSxXQUNOLEdBQW1CLEVBQ25CLHVCQUE4RSxFQUFFLEVBQ2hGLFdBQWdDLFNBQVM7SUFFekMsSUFBSSxVQUFVLEdBQWdELG9CQUFvQixDQUFDO0lBQ25GLElBQUksMEJBQTBCLENBQUM7SUFFL0IsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxRQUFRLEdBQUcsb0JBQW9CLENBQUM7UUFDaEMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsT0FBTyxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN0QywwQkFBMEIsR0FBRyxVQUFVLENBQUM7UUFDeEMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFJLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRSxLQUF1QixVQUFVLEVBQS9CLHdHQUErQixDQUFDO1FBQ2pFLElBQUksbUJBQTBGLEVBQTFGLEVBQUUsT0FBTyxFQUFFLFdBQVcsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQXNDLEVBQXBDLGlHQUFvQyxDQUFDO1FBQy9GLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkUsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2RCxNQUFNLHFCQUFRLFVBQVUsRUFBSyxNQUFNLENBQUUsQ0FBQztRQUN0QyxVQUFVLHFCQUFRLGNBQWMsRUFBSyxhQUFhLElBQUUsT0FBTyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxNQUFNLEdBQUUsQ0FBQztRQUNwRyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDOUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTSxDQUFDO1FBQ04sR0FBRztRQUNILDBCQUEwQjtRQUMxQixrQkFBa0IsRUFBRSxFQUFFO1FBQ3RCLFFBQVE7UUFDUixVQUFVO1FBQ1YsSUFBSSxFQUFFLEtBQUs7S0FDWCxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0ksYUFDTixFQUFFLElBQUksRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEdBQUcsTUFBTSxFQUFFLFFBQVEsRUFBYyxFQUNsRixRQUFrQjtJQUVsQixNQUFNLENBQUM7UUFDTixHQUFHLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQzFELFVBQVUsRUFBRSxLQUFLO1FBQ2pCLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLE1BQU0sRUFBRSxFQUFFO1FBQ1YsUUFBUTtRQUNSLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLElBQUk7UUFDYixJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJO1FBQ2pELFFBQVE7UUFDUixRQUFRO0tBQ1IsQ0FBQztBQUNILENBQUM7Ozs7Ozs7OztBQzdPRDtBQUFBO0FBQUE7QUFBb0Q7QUFDRTtBQUUvQztJQUNOLE1BQU0sQ0FBQyxpRkFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFO1FBQzlDLG1GQUFnQixDQUFDO1lBQ2hCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNaLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVjLHNGQUFZLEVBQUM7Ozs7Ozs7OztBQ1o1QjtBQUFBO0FBQW9EO0FBUzdDLDBCQUEwQixNQUF5QjtJQUN6RCxNQUFNLENBQUMsaUZBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRTtRQUM5QyxNQUFNLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyRixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFYywwRkFBZ0IsRUFBQzs7Ozs7Ozs7O0FDZGhDO0FBQUE7QUFBQTtBQUFrRTtBQUMvQjtBQWlDbkM7OztHQUdHO0FBQ0ksdUJBQW9FLEVBQzFFLEdBQUcsRUFDSCxVQUFVLEdBQUcsRUFBRSxFQUNmLFVBQVUsR0FBRyxFQUFFLEVBQ2YsTUFBTSxHQUFHLEVBQUUsRUFDWCxTQUFTLEdBQUcsc0ZBQXNCLENBQUMsSUFBSSxFQUN2QyxlQUFlLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSwwREFBUSxFQUFFLEVBQ2Q7SUFDeEIsTUFBTSxDQUFDLFVBQXFDLE1BQVM7UUFDcEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsR0FBRztZQUM1QyxPQUFPLEVBQUUsR0FBRztZQUNaLFVBQVU7WUFDVixVQUFVO1lBQ1YsTUFBTTtZQUNOLFNBQVM7WUFDVCxlQUFlO1NBQ2YsQ0FBQztJQUNILENBQUMsQ0FBQztBQUNILENBQUM7QUFFYyx1RkFBYSxFQUFDOzs7Ozs7Ozs7QUMzRDdCO0FBQUE7QUFBQTtBQUFvRDtBQUVuQjtBQUVqQzs7Ozs7O0dBTUc7QUFDSSxzQkFDTixZQUFvQixFQUNwQixlQUFxQyxtREFBSSxFQUN6QyxnQkFBMkI7SUFFM0IsTUFBTSxDQUFDLGlGQUFlLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUU7UUFDOUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsWUFBWSxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxZQUFZLENBQUMsd0JBQXdCLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDNUQsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRTtnQkFDbkMsWUFBWTtnQkFDWixRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQjthQUM5RCxDQUFDLENBQUM7UUFDSixDQUFDO0lBQ0YsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBRWMsc0ZBQVksRUFBQzs7Ozs7Ozs7O0FDMUI1QjtBQUFBOzs7OztHQUtHO0FBQ0kseUJBQXlCLE9BQXlCO0lBQ3hELE1BQU0sQ0FBQyxVQUFTLE1BQVcsRUFBRSxXQUFvQixFQUFFLFVBQStCO1FBQ2pGLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsT0FBTyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5QixDQUFDO0lBQ0YsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQUVjLHlGQUFlLEVBQUM7Ozs7Ozs7OztBQ2xCL0I7QUFBQTtBQUFBO0FBQUE7QUFBeUM7QUFFVztBQUNFO0FBR3REOztHQUVHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBd0MsSUFBSSw4REFBTyxFQUFFLENBQUM7QUEwQmxGOzs7Ozs7R0FNRztBQUNJLGdCQUFnQixFQUFFLElBQUksRUFBRSxhQUFhLEVBQWdCO0lBQzNELE1BQU0sQ0FBQyxpRkFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFO1FBQzlDLG1GQUFnQixDQUFDLFVBQStDLFVBQWU7WUFDOUUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckQsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDbEIsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsR0FBRyxZQUFZLENBQUM7Z0JBQy9DLE1BQU0sbUJBQW1CLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkUsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0RCxJQUFJLENBQUMsR0FBRyxDQUNQLFdBQVcsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTt3QkFDakMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNuQixDQUFDLENBQUMsQ0FDRixDQUFDO29CQUNGLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztnQkFDRCxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNaLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVjLGdGQUFNLEVBQUM7Ozs7Ozs7OztBQ2pFdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQThDO0FBRTlDLHlCQUF5QixLQUFVO0lBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssaUJBQWlCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1RixDQUFDO0FBRU0sZ0JBQWdCLGdCQUFxQixFQUFFLFdBQWdCO0lBQzdELE1BQU0sQ0FBQztRQUNOLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLFdBQVc7S0FDbEIsQ0FBQztBQUNILENBQUM7QUFFTSxnQkFBZ0IsZ0JBQXFCLEVBQUUsV0FBZ0I7SUFDN0QsTUFBTSxDQUFDO1FBQ04sT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsV0FBVztLQUNsQixDQUFDO0FBQ0gsQ0FBQztBQUVNLG1CQUFtQixnQkFBcUIsRUFBRSxXQUFnQjtJQUNoRSxNQUFNLENBQUM7UUFDTixPQUFPLEVBQUUsZ0JBQWdCLEtBQUssV0FBVztRQUN6QyxLQUFLLEVBQUUsV0FBVztLQUNsQixDQUFDO0FBQ0gsQ0FBQztBQUVNLGlCQUFpQixnQkFBcUIsRUFBRSxXQUFnQjtJQUM5RCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFFcEIsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsSUFBSSxlQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMvRSxNQUFNLGdCQUFnQixHQUFHLFdBQVcsSUFBSSxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFckUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUM7WUFDTixPQUFPLEVBQUUsSUFBSTtZQUNiLEtBQUssRUFBRSxXQUFXO1NBQ2xCLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFekMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM1QyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNQLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRCxNQUFNLENBQUM7UUFDTixPQUFPO1FBQ1AsS0FBSyxFQUFFLFdBQVc7S0FDbEIsQ0FBQztBQUNILENBQUM7QUFFTSxjQUFjLGdCQUFxQixFQUFFLFdBQWdCO0lBQzNELElBQUksTUFBTSxDQUFDO0lBQ1gsRUFBRSxDQUFDLENBQUMsT0FBTyxXQUFXLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN2QyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxLQUFLLG1FQUFnQixDQUFDLENBQUMsQ0FBQztZQUM1QyxNQUFNLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE1BQU0sR0FBRyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNGLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxNQUFNLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNQLE1BQU0sR0FBRyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDZixDQUFDOzs7Ozs7Ozs7QUN2RUQ7QUFBQTtBQUFxRDtBQUNwQjtBQUczQixXQUFZLFFBQVEsdUVBQVc7SUFRcEMsWUFBWSxVQUFnQztRQUMzQyxLQUFLLEVBQUU7UUFMQSx3QkFBa0IsRUFBRyxJQUFJLDBEQUFHLEVBQW1CO1FBT3RELElBQUksQ0FBQyxZQUFXLEVBQUcsVUFBVSxDQUFDLFVBQVU7UUFDeEMsSUFBSSxDQUFDLFlBQVcsRUFBRyxVQUFVLENBQUMsV0FBVztRQUN6QyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtZQUNwQixJQUFJLENBQUMsTUFBSyxFQUFHLFVBQVUsQ0FBQyxJQUFJO1FBQzdCO0lBQ0Q7SUFFTyxHQUFHLENBQUMsR0FBb0I7UUFDOUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDakM7SUFFVSxPQUFPLENBQUMsR0FBb0I7UUFDckMsTUFBTSxVQUFTLEVBQUcsR0FBRyxHQUFHLEVBQUU7UUFDMUIsTUFBTSxLQUFJLEVBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBRTVDLEdBQUcsQ0FBQyxDQUFDLEtBQUksR0FBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDckQsTUFBTSxPQUFNLEVBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsR0FBRTtnQkFDbEQsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEIsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDdkM7UUFFQSxPQUFPLElBQUk7SUFDWjtJQUVVLFVBQVU7UUFDbkIsSUFBSSxDQUFDLFdBQVcsRUFBRTtJQUNuQjtJQUVPLFdBQVc7UUFDakI7SUFDRDs7OztBQUdjLDhFQUFJLEVBQUM7Ozs7Ozs7OztBQ3JEcEI7QUFBQTtBQUE4QjtBQUNTO0FBT3ZDLE1BQU0sY0FBYyxHQUFHO0lBQ3RCLE1BQU0sRUFBRSxLQUFLO0lBQ2IsYUFBYSxFQUFFLEtBQUs7Q0FDcEIsQ0FBQztBQUVLLFdBQVksU0FBUSxtREFBSTtJQUEvQjs7UUEwQlMsbUJBQWMsR0FBRyxHQUFHLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyw2REFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7WUFDcEQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQztJQWdCSCxDQUFDO0lBMUNPLEdBQUcsQ0FBQyxHQUFvQjtRQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRS9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNYLE1BQU0sbUJBQU0sY0FBYyxFQUFHO1FBQzlCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsNkRBQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO1lBQ3BELElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRUQsTUFBTSxDQUFDO1lBQ04sTUFBTSxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsY0FBYztZQUNwQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1NBQzFFLENBQUM7SUFDSCxDQUFDO0lBRU0sR0FBRyxDQUFDLEdBQW9CO1FBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxJQUFLLElBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQU9PLGVBQWU7UUFDdEIsNkRBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNqRSw2REFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUixPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUNiLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN4QixDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVPLGVBQWU7UUFDdEIsNkRBQU0sQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRSw2REFBTSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7Q0FDRDtBQUFBO0FBQUE7QUFFYyw4REFBSyxFQUFDOzs7Ozs7Ozs7QUM1RHJCO0FBQUE7QUFBQTtBQUE4QjtBQUNHO0FBQ007QUFrRWpDLG9CQUFxQixRQUFRLG9EQUFJO0lBQXZDOztRQUNTLG1CQUFhLEVBQUcsSUFBSSwwREFBRyxFQUEyQjtJQXNIM0Q7SUFwSFMsYUFBYSxDQUFDLElBQWlCLEVBQUUsVUFBK0I7UUFDdkUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFNLEVBQUcsR0FBRSxFQUFFLEVBQUcsVUFBVTtRQUUzQyxNQUFNLEdBQUUsRUFBRyxPQUFPLFFBQU8sSUFBSyxXQUFXLEVBQUUsT0FBTyxHQUFHLEVBQUUsT0FBTztRQUU5RCxNQUFNLGVBQWMsRUFBRyxJQUFJLDZEQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDO1FBRWxFLE9BQU8sSUFBSSw2REFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsNkRBQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQ3RFO0lBRVEsYUFBYSxDQUFDLE1BQVcsRUFBRSxRQUEyQjtRQUM3RCxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFXLEVBQUUsRUFBRyxRQUFRO1FBRTVHLEdBQUcsQ0FBQyxhQUFZLElBQUssU0FBUyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxhQUFZLEVBQUcsWUFBWTtRQUNuQztRQUVBLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2pCO1FBRUEsR0FBRyxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDaEI7UUFFQSxHQUFHLENBQUMsTUFBTSxFQUFFO1lBQ1gsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNoQjtRQUVBLEdBQUcsQ0FBQyxVQUFTLElBQUssU0FBUyxFQUFFO1lBQzVCLE1BQU0sQ0FBQyxVQUFTLEVBQUcsU0FBUztRQUM3QjtRQUVBLEdBQUcsQ0FBQyxZQUFXLElBQUssU0FBUyxFQUFFO1lBQzlCLE1BQU0sQ0FBQyxZQUFXLEVBQUcsV0FBVztRQUNqQztRQUVBLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDVCxNQUFNLENBQUMsSUFBSSxFQUFFO1FBQ2Q7UUFBRSxLQUFLO1lBQ04sTUFBTSxDQUFDLEtBQUssRUFBRTtRQUNmO1FBRUEsR0FBRyxDQUFDLFFBQVEsRUFBRTtZQUNiLE1BQU0sQ0FBQyxTQUFRLEVBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzVDO1FBRUEsR0FBRyxDQUFDLFFBQVEsRUFBRTtZQUNiLE1BQU0sQ0FBQyxTQUFRLEVBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzVDO0lBQ0Q7SUFFQSxPQUFPLENBQ04sR0FBVyxFQUNYLGlCQUd3RDtRQUV4RCxNQUFNLEtBQUksRUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBZ0I7UUFFN0MsR0FBRyxDQUFDLElBQUksRUFBRTtZQUNULEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDdEMsa0JBQWlCLEVBQUcsQ0FBQyxpQkFBaUIsQ0FBQztZQUN4QztZQUNBLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxHQUFFO2dCQUN4QyxXQUFVLEVBQUcsT0FBTyxXQUFVLElBQUssV0FBVyxFQUFFLFVBQVUsR0FBRyxFQUFFLFVBQVU7Z0JBRXpFLEdBQUcsQ0FBQyxVQUFVLEVBQUU7b0JBQ2YsTUFBTSxFQUFFLEdBQUUsRUFBRSxFQUFHLFVBQVU7b0JBQ3pCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQUNoQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUU7NEJBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7NEJBQzVDLElBQUksRUFBRTt5QkFDTixDQUFDO29CQUNIO29CQUVBLE1BQU0sVUFBUyxFQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDNUMsTUFBTSxFQUFFLFNBQVEsRUFBRyxHQUFFLEVBQUUsRUFBRyxVQUFVO29CQUVwQyxHQUFHLENBQUMsU0FBUyxFQUFFO3dCQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7d0JBRTlDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTs0QkFDMUIsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNOzRCQUN4QixJQUFJLEVBQUU7eUJBQ04sQ0FBQztvQkFDSDtnQkFDRDtZQUNELENBQUMsQ0FBQztRQUNIO0lBQ0Q7SUFFQSxHQUFHLENBQUMsRUFBVTtRQUNiLE1BQU0sVUFBUyxFQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1QyxHQUFHLENBQUMsU0FBUyxFQUFFO1lBQ2QsTUFBTSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFVBQVMsRUFBRSxFQUFHLFNBQVMsQ0FBQyxNQUFNO1lBRTVFLE9BQU87Z0JBQ04sV0FBVyxFQUFFLFlBQVcsR0FBSSxDQUFDO2dCQUM3QixTQUFTO2dCQUNULFlBQVk7Z0JBQ1osU0FBUyxFQUFFLFVBQVMsR0FBSTthQUN4QjtRQUNGO0lBQ0Q7SUFFQSxXQUFXO1FBQ1YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUU7WUFDN0MsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDcEIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUMvQjtZQUNBLFNBQVMsQ0FBQyxLQUFJLEVBQUcsS0FBSztRQUN2QixDQUFDLENBQUM7SUFDSDs7OztBQUdjLHNFQUFhLEVBQUM7Ozs7Ozs7Ozs7Ozs7QUQzTCtCO0FBWTVELG1CQUFtQixnQkFBMEIsRUFBRSxXQUFxQjtJQUNuRSxNQUFNLE1BQU0sR0FBRyxXQUFXLElBQUksV0FBVyxFQUFFLENBQUM7SUFDNUMsTUFBTSxDQUFDO1FBQ04sT0FBTyxFQUFFLE1BQU07UUFDZixLQUFLLEVBQUUsV0FBVztLQUNsQixDQUFDO0FBQ0gsQ0FBQztBQUVNLG9CQUF3RSxJQUFPO0lBQ3JGLFdBQXFCLFNBQVEsSUFBSTtRQUFqQzs7WUFHUyxrQkFBYSxHQUFHLENBQUMsQ0FBQztZQUVsQixtQkFBYyxHQUFHLENBQUMsQ0FBQztZQU9wQixnQkFBVyxHQUFHLEdBQUcsRUFBRTtnQkFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDZixDQUFDLENBQUM7UUFNSCxDQUFDO1FBZFUsaUJBQWlCO1lBQzFCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBUU0sS0FBSztZQUNYLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBZEE7UUFEQyxzRkFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUM7a0RBR2hDO0lBYUYsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNkLENBQUM7QUFFYyxvRkFBVSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FFL0NlO0FBQ087QUFFa0I7QUFDTjtBQUN4QjtBQXdCcEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDO0FBRW5CLE1BQU0sa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFBQTtBQUFBO0FBV3JEOztHQUVHO0FBQ0ksZUFBZSxLQUFTO0lBQzlCLE1BQU0sQ0FBQyw0RkFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDakMsTUFBTSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILGtDQUFrQyxPQUFxQjtJQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDcEIsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFO1lBQzlDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztJQUMxQixDQUFDLEVBQ1csRUFBRSxDQUNkLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0ksK0JBQStCLEtBQVUsRUFBRSxhQUF1QjtJQUN4RSxNQUFNLGFBQWEsR0FBRyxJQUFJLDJEQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFO1FBQ2hFLGFBQWEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDdEIsQ0FBQztBQUVEOztHQUVHO0FBRUkscUJBQ04sSUFBTztJQVdQLElBQWUsTUFBTSxHQUFyQixZQUFzQixTQUFRLElBQUk7UUFUbEM7O1lBaUJDOztlQUVHO1lBQ0ssNkJBQXdCLEdBQWEsRUFBRSxDQUFDO1lBT2hEOztlQUVHO1lBQ0ssd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1lBRW5DOztlQUVHO1lBQ0ssV0FBTSxHQUFlLEVBQUUsQ0FBQztRQXVFakMsQ0FBQztRQW5FTyxLQUFLLENBQUMsT0FBa0Q7WUFDOUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDakMsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQ7O1dBRUc7UUFHTyxtQkFBbUI7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBRU8sY0FBYyxDQUFDLFNBQTZCO1lBQ25ELEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxJQUFLLEVBQVUsQ0FBQztZQUNqRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsOEJBQStCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkUsSUFBSSxnQkFBZ0IsR0FBYSxFQUFFLENBQUM7WUFDcEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixTQUFTLHNCQUFzQixDQUFDLENBQUM7Z0JBQzlELE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3JELENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ1AsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBcUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFDRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyx3QkFBd0I7WUFDL0IsTUFBTSxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUN6RCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQ1gsb0dBQW9HLENBQ3BHLENBQUM7Z0JBQ0gsQ0FBQztnQkFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsRUFBRTtvQkFDM0UsTUFBUSxjQUFXLEVBQVgsbUJBQWdCLEVBQUUsbUhBQXdCLENBQUM7b0JBQ25ELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3hDLE1BQU0sbUJBQU0sY0FBYyxFQUFLLE9BQU8sRUFBRztnQkFDMUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNQLElBQUksQ0FBQyw4QkFBOEIsR0FBRyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1RSxDQUFDO1lBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUMxRSxNQUFNLG1CQUFNLFNBQVMsRUFBSyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUc7WUFDN0MsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRVAsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUNsQyxDQUFDO0tBQ0Q7SUFwREE7UUFGQyxzRkFBWSxDQUFDLE9BQU8sRUFBRSxzREFBTyxDQUFDO1FBQzlCLHNGQUFZLENBQUMsY0FBYyxFQUFFLHNEQUFPLENBQUM7cURBR3JDO0lBL0NhLE1BQU07UUFUcEIsMEVBQU0sQ0FBQztZQUNQLElBQUksRUFBRSxrQkFBa0I7WUFDeEIsYUFBYSxFQUFFLENBQUMsS0FBWSxFQUFFLFVBQTRCLEVBQW9CLEVBQUU7Z0JBQy9FLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUNsQixDQUFDO2dCQUNELE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDWCxDQUFDO1NBQ0QsQ0FBQztPQUNhLE1BQU0sQ0FpR3BCO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFFYyxvRUFBVyxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaE51QjtBQUNoQjtBQUNHO0FBQ1I7QUFDTztBQUNvQjtBQUNDO0FBRXpELElBQVksc0JBSVg7QUFKRCxXQUFZLHNCQUFzQjtJQUNqQyx1Q0FBYTtJQUNiLHVDQUFhO0lBQ2IsdUNBQWE7QUFDZCxDQUFDLEVBSlcsc0JBQXNCLEtBQXRCLHNCQUFzQixRQUlqQztBQUVNLDRCQUE0QixPQUFvQjtJQUV0RCxJQUFNLGtCQUFrQixHQUF4Qix3QkFBeUIsU0FBUSwrREFBZTtRQUNyQyxNQUFNO1lBQ2YsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUNyRCxDQUFDLEtBQUssRUFBRSxHQUFXLEVBQUUsRUFBRTtnQkFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixHQUFHLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQztnQkFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2QsQ0FBQyxFQUNELEVBQVMsQ0FDVCxDQUFDO1lBQ0YsTUFBTSxDQUFDLHVEQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELE1BQU0sS0FBSyxPQUFPO1lBQ2pCLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDaEIsQ0FBQztLQUNEO0lBbkJLLGtCQUFrQjtRQUR2QixzRkFBWSxFQUFFO09BQ1Qsa0JBQWtCLENBbUJ2QjtJQUVELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUMzQixDQUFDO0FBRU0sZ0JBQWdCLFVBQWUsRUFBRSxpQkFBc0I7SUFDN0QsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLEdBQUcsVUFBVSxDQUFDO0lBQzlELE1BQU0sWUFBWSxHQUFRLEVBQUUsQ0FBQztJQUU3QixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBb0IsRUFBRSxFQUFFO1FBQzNDLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqRCxZQUFZLENBQUMsYUFBYSxDQUFDLEdBQUcsWUFBWSxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEtBQU0sU0FBUSxXQUFXO1FBQXpCOztZQUVFLGdCQUFXLEdBQVEsRUFBRSxDQUFDO1lBQ3RCLGNBQVMsR0FBVSxFQUFFLENBQUM7WUFDdEIscUJBQWdCLEdBQVEsRUFBRSxDQUFDO1lBQzNCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBdUw5QixDQUFDO1FBckxPLGlCQUFpQjtZQUN2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsTUFBTSxDQUFDO1lBQ1IsQ0FBQztZQUVELE1BQU0sYUFBYSxHQUFRLEVBQUUsQ0FBQztZQUM5QixNQUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUM7WUFFdEQsSUFBSSxDQUFDLFdBQVcscUJBQVEsSUFBSSxDQUFDLFdBQVcsRUFBSyxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUUsQ0FBQztZQUV4RixDQUFDLEdBQUcsVUFBVSxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBb0IsRUFBRSxFQUFFO2dCQUMvRCxNQUFNLEtBQUssR0FBSSxJQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9ELEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO29CQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDeEMsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxvQkFBb0IsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsR0FBRzt3QkFDckMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO3dCQUMxQyxHQUFHLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztxQkFDM0QsQ0FBQztnQkFDSCxDQUFDO2dCQUVELGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRztvQkFDN0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO29CQUMxQyxHQUFHLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztpQkFDM0QsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQW9CLEVBQUUsRUFBRTtnQkFDdkMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2hFLE1BQU0sb0JBQW9CLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRWpFLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHO29CQUNyQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQztvQkFDL0MsR0FBRyxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztpQkFDaEUsQ0FBQztnQkFFRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtvQkFDbkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMzRCxFQUFFLENBQUMsQ0FBQyxPQUFPLGFBQWEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN6QyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDeEIsQ0FBQztvQkFDRCxJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLFdBQVcsQ0FBQyxTQUFTLEVBQUU7d0JBQzFCLE9BQU8sRUFBRSxLQUFLO3dCQUNkLE1BQU0sRUFBRSxJQUFJO3FCQUNaLENBQUMsQ0FDRixDQUFDO2dCQUNILENBQUMsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztZQUU3QyxNQUFNLFFBQVEsR0FBRyxTQUFTLEtBQUssc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBRTdGLGlFQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBZSxFQUFFLEVBQUU7Z0JBQzFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMvQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQ25FLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBd0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsdURBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUF3QixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWhGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxNQUFNLGNBQWMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDakQsTUFBTSxPQUFPLEdBQUcsS0FBTSxTQUFRLCtEQUFVO2dCQUN2QyxNQUFNO29CQUNMLE1BQU0sQ0FBQyxxREFBQyxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7YUFDRCxDQUFDO1lBQ0YsTUFBTSxRQUFRLEdBQUcsZUFBZSxFQUFFLENBQUM7WUFDbkMsTUFBTSxZQUFZLEdBQUcscUZBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZFLDZEQUFNLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sQ0FBQyxHQUFHLCtEQUFRLENBQUMsR0FBRyxFQUFFLENBQUMscURBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFbkQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FDakIsSUFBSSxXQUFXLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3BDLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE1BQU0sRUFBRSxJQUFJO2FBQ1osQ0FBQyxDQUNGLENBQUM7UUFDSCxDQUFDO1FBRU8sU0FBUztZQUNoQixFQUFFLENBQUMsQ0FBQyw2REFBTSxJQUFJLDZEQUFNLENBQUMsTUFBTSxJQUFJLDZEQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sQ0FBQyw2REFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsNkRBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNGLENBQUM7UUFFTyxlQUFlLENBQUMsQ0FBTTtZQUM3QixNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUM7Z0JBQ3RFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDYixJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQzlELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzlDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDaEIsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRU8sT0FBTztZQUNkLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsYUFBYSxDQUNqQixJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDakMsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsTUFBTSxFQUFFLElBQUk7aUJBQ1osQ0FBQyxDQUNGLENBQUM7WUFDSCxDQUFDO1FBQ0YsQ0FBQztRQUVNLGNBQWM7WUFDcEIsTUFBTSxtQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFLLElBQUksQ0FBQyxnQkFBZ0IsRUFBRztRQUMxRCxDQUFDO1FBRU0sWUFBWTtZQUNsQixFQUFFLENBQUMsQ0FBQyxTQUFTLEtBQUssc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO29CQUNsRixNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDO29CQUMxQixNQUFNLENBQUMscURBQUMsQ0FBQyxLQUFLLG9CQUFPLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0UsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDdkIsQ0FBQztRQUNGLENBQUM7UUFFTSx3QkFBd0IsQ0FBQyxJQUFZLEVBQUUsUUFBdUIsRUFBRSxLQUFvQjtZQUMxRixNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVPLGlCQUFpQixDQUFDLFlBQW9CLEVBQUUsS0FBVTtZQUN6RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzdDLENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxZQUFvQjtZQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFTyxZQUFZLENBQUMsWUFBb0IsRUFBRSxLQUFVO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssQ0FBQywyREFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLENBQUM7WUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVPLFlBQVksQ0FBQyxZQUFvQjtZQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU8sdUJBQXVCLENBQUMsVUFBb0I7WUFDbkQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFlLEVBQUUsWUFBb0IsRUFBRSxFQUFFO2dCQUNsRSxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2pELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQy9DLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNwQixVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUNsQyxDQUFDO2dCQUNELE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDbkIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ1IsQ0FBQztRQUVELE1BQU0sS0FBSyxrQkFBa0I7WUFDNUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQVcsUUFBUTtZQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztLQUNELENBQUM7QUFDSCxDQUFDO0FBRU0sa0JBQWtCLGlCQUFzQjtJQUM5QyxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDO0lBRXhHLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLElBQUksS0FBSyxDQUNkLHVHQUF1RyxDQUN2RyxDQUFDO0lBQ0gsQ0FBQztJQUVELDZEQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBQ3pGLENBQUM7QUFFYyxrRkFBUSxFQUFDOzs7Ozs7Ozs7QUM1UHhCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBb0M7QUFDUDtBQUNhO0FBVW1CO0FBQ0c7QUFDRDtBQUNGO0FBMkk3RCxNQUFNLFlBQVcsRUFBbUIsRUFBRTtBQUN0QyxNQUFNLGVBQWMsRUFBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDO0FBQ25FLE1BQU0sYUFBWSxFQUFHLG9CQUFvQjtBQUN6QyxNQUFNLGNBQWEsRUFBRyxhQUFZLEVBQUcsVUFBVTtBQUMvQyxNQUFNLGdCQUFlLEVBQUcsYUFBWSxFQUFHLFlBQVk7QUFFbkQsd0JBQXdCLEtBQW1CO0lBQzFDLE9BQU8sTUFBSyxHQUFJLDJEQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNwQztBQUVBLHdCQUF3QixLQUEyQjtJQUNsRCxPQUFPLENBQUMsQ0FBQyxNQUFLLEdBQUksMkRBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3RDO0FBRUEsNkJBQTZCLEtBQVU7SUFDdEMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUk7QUFDcEI7QUFFQSwwQkFDQyxPQUFnQixFQUNoQixrQkFBMkQsRUFDM0QsVUFBbUQsRUFDbkQsU0FBa0I7SUFFbEIsTUFBTSxVQUFTLEVBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekMsTUFBTSxVQUFTLEVBQUcsU0FBUyxDQUFDLE1BQU07SUFDbEMsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25DLE1BQU0sU0FBUSxFQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsTUFBTSxVQUFTLEVBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUN0QyxNQUFNLGtCQUFpQixFQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztRQUN0RCxHQUFHLENBQUMsVUFBUyxJQUFLLGlCQUFpQixFQUFFO1lBQ3BDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDekQ7SUFDRDtBQUNEO0FBRUEsaUNBQWlDLE9BQVksRUFBRSxPQUFxQixFQUFFLElBQWtCO0lBQ3ZGLE1BQU0sRUFDTCxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVUsRUFBRSxFQUMxQyxFQUFHLE9BQU87SUFDWCxHQUFHLENBQUMsQ0FBQyxTQUFRLEdBQUksU0FBUSxJQUFLLE1BQU0sRUFBRTtRQUNyQyxPQUFPO1lBQ04sVUFBVSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUNuQyxVQUFVLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQ25DLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQ3JCO0lBQ0Y7SUFBRSxLQUFLLEdBQUcsQ0FBQyxTQUFRLElBQUssTUFBTSxFQUFFO1FBQy9CLE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU0sQ0FBRTtJQUM3RztJQUNBLElBQUksY0FBYSxFQUFRO1FBQ3hCLFVBQVUsRUFBRTtLQUNaO0lBQ0QsR0FBRyxDQUFDLFVBQVUsRUFBRTtRQUNmLGFBQWEsQ0FBQyxXQUFVLEVBQUcsRUFBRTtRQUM3QixhQUFhLENBQUMsT0FBTSxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTTtRQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFFO1lBQzVDLGFBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFDLEVBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUN2RCxDQUFDLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFFO1lBQzVDLGFBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFDLEVBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7UUFDcEUsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxhQUFhO0lBQ3JCO0lBQ0EsYUFBYSxDQUFDLFdBQVUsRUFBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FDeEQsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUU7UUFDbkIsS0FBSyxDQUFDLFFBQVEsRUFBQyxFQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFDLEdBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNyRSxPQUFPLEtBQUs7SUFDYixDQUFDLEVBQ0QsRUFBUyxDQUNUO0lBQ0QsT0FBTyxhQUFhO0FBQ3JCO0FBRUEsOEJBQThCLFFBQXdCLEVBQUUsS0FBYSxFQUFFLGtCQUFpQztJQUN2RyxNQUFNLGVBQWMsRUFBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQ3RDLEdBQUcsQ0FBQyxjQUFjLENBQUMsY0FBYyxFQUFDLEdBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUMvRCxNQUFNO0lBQ1A7SUFDQSxNQUFNLEVBQUUsSUFBRyxFQUFFLEVBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVO0lBQzlDLElBQUksV0FBVSxFQUFHLFNBQVM7SUFDMUIsR0FBRyxDQUFDLGtCQUFrQixFQUFFO1FBQ3ZCLE1BQU0sRUFDTCxJQUFJLEVBQUUsRUFBRSxrQkFBaUIsRUFBRSxFQUMzQixFQUFHLGtCQUFrQjtRQUN0QixXQUFVLEVBQUksaUJBQXlCLENBQUMsS0FBSSxHQUFJLFNBQVM7SUFDMUQ7SUFFQSxHQUFHLENBQUMsSUFBRyxJQUFLLFVBQVMsR0FBSSxJQUFHLElBQUssSUFBSSxFQUFFO1FBQ3RDLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsRUFBQyxFQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekMsR0FBRyxDQUFDLEVBQUMsSUFBSyxLQUFLLEVBQUU7Z0JBQ2hCLE1BQU0sUUFBTyxFQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxFQUFFO29CQUNsQyxJQUFJLGNBQXNCO29CQUMxQixHQUFHLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM1QixlQUFjLEVBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBeUIsQ0FBQyxLQUFJLEdBQUksU0FBUztvQkFDM0U7b0JBQUUsS0FBSzt3QkFDTixlQUFjLEVBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHO29CQUNsQztvQkFFQSxPQUFPLENBQUMsSUFBSSxDQUNYLGFBQWEsVUFBVSxrTEFBa0wsY0FBYyw4QkFBOEIsQ0FDclA7b0JBQ0QsS0FBSztnQkFDTjtZQUNEO1FBQ0Q7SUFDRDtBQUNEO0FBRUEsY0FBYyxNQUFvQixFQUFFLE1BQW9CO0lBQ3ZELEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFDLEdBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3JELEdBQUcsQ0FBQyw4REFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUMsR0FBSSw4REFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2RCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFPLElBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hELE9BQU8sS0FBSztZQUNiO1FBQ0Q7UUFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFHLElBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDeEMsT0FBTyxLQUFLO1FBQ2I7UUFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBRyxJQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUM5RCxPQUFPLEtBQUs7UUFDYjtRQUNBLE9BQU8sSUFBSTtJQUNaO0lBQUUsS0FBSyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBQyxHQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUM1RCxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVEsSUFBSyxVQUFTLEdBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFpQixJQUFLLFFBQVEsRUFBRTtZQUN2RixPQUFPLEtBQUs7UUFDYjtRQUNBLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFpQixJQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDcEUsT0FBTyxLQUFLO1FBQ2I7UUFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBRyxJQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUM5RCxPQUFPLEtBQUs7UUFDYjtRQUNBLE9BQU8sSUFBSTtJQUNaO0lBQ0EsT0FBTyxLQUFLO0FBQ2I7QUFFQSwwQkFBMEIsUUFBd0IsRUFBRSxNQUFvQixFQUFFLEtBQWE7SUFDdEYsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLEtBQUssRUFBRSxFQUFDLEVBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUM5QixPQUFPLENBQUM7UUFDVDtJQUNEO0lBQ0EsT0FBTyxDQUFDLENBQUM7QUFDVjtBQUVBLDhCQUE4QixVQUE2QixFQUFFO0lBQzVELFFBQU8sRUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUN0RCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQ2hDO0FBRUEseUJBQXlCLE9BQWdCLEVBQUUsUUFBZ0IsRUFBRSxTQUE2QixFQUFFLFNBQWtCO0lBQzdHLEdBQUcsQ0FBQyxVQUFTLElBQUssY0FBYSxHQUFJLFNBQVEsSUFBSyxPQUFNLEdBQUksU0FBUyxFQUFFO1FBQ3BFLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUM7SUFDN0Q7SUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFNBQVEsSUFBSyxPQUFNLEdBQUksVUFBUyxJQUFLLEVBQUUsRUFBQyxHQUFJLFVBQVMsSUFBSyxTQUFTLEVBQUU7UUFDaEYsT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUM7SUFDbEM7SUFBRSxLQUFLO1FBQ04sT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDO0lBQzFDO0FBQ0Q7QUFFQSwyQkFBMkIsSUFBa0IsRUFBRSxXQUErQjtJQUM3RSxNQUFNLEVBQ0wsT0FBTyxFQUNQLElBQUksRUFBRSxFQUFFLFdBQVUsQ0FBRSxFQUNwQixJQUFJLEVBQUUsRUFDTCxVQUFVLEVBQUUsRUFBRSxlQUFjLEVBQUUsRUFDOUIsRUFDRCxFQUFHLElBQUk7SUFDUixHQUFHLENBQUMsY0FBYyxFQUFFO1FBQ25CLEdBQUcsQ0FBQyxPQUFPLGVBQWMsSUFBSyxVQUFVLEVBQUU7WUFDekMsT0FBTyxjQUFjLENBQUMsT0FBa0IsRUFBRSxVQUFVLENBQUM7UUFDdEQ7UUFDQSxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQWtCLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQztJQUNsRTtBQUNEO0FBRUEsMEJBQTBCLE9BQXFCLEVBQUUsV0FBK0I7SUFDL0UsTUFBTSxFQUNMLE9BQU8sRUFDUCxJQUFJLEVBQUUsRUFBRSxXQUFVLENBQUUsRUFDcEIsSUFBSSxFQUFFLEVBQ0wsVUFBVSxFQUFFLEVBQUUsY0FBYSxFQUFFLEVBQzdCLEVBQ0QsRUFBRyxPQUFPO0lBQ1gsTUFBTSxjQUFhLEVBQUcsR0FBRyxHQUFFO1FBQzFCLFFBQU8sR0FBSSxPQUFPLENBQUMsV0FBVSxHQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUN4RSxPQUFPLENBQUMsUUFBTyxFQUFHLFNBQVM7SUFDNUIsQ0FBQztJQUNELEdBQUcsQ0FBQyxPQUFPLGNBQWEsSUFBSyxVQUFVLEVBQUU7UUFDeEMsT0FBTyxhQUFhLENBQUMsT0FBa0IsRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDO0lBQ3BFO0lBQ0EsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFrQixFQUFFLFVBQVUsRUFBRSxhQUF1QixFQUFFLGFBQWEsQ0FBQztBQUN6RjtBQUVBLG1CQUFtQixHQUFRO0lBQzFCLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUN2QztBQUVBLG9CQUFvQixLQUFZO0lBQy9CLE9BQU8sTUFBTSxRQUFRLGdFQUFVO1FBQ3BCLE1BQU07WUFDZixPQUFPLEtBQUs7UUFDYjtLQUNBO0FBQ0Y7QUFFTSxrQkFBbUIsUUFBNkI7SUFDckQsSUFBSSxjQUFhLEVBQWlCO1FBQ2pDLElBQUksRUFBRSxLQUFLO1FBQ1gsS0FBSyxFQUFFLElBQUk7UUFDWCxVQUFVLEVBQUUsMkVBQWtCO1FBQzlCLE9BQU8sRUFBRSw2REFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJO1FBQzdCLFFBQVEsRUFBRTtLQUNWO0lBQ0QsSUFBSSxtQkFBa0IsRUFBNEIsRUFBRTtJQUNwRCxJQUFJLGNBQWEsRUFBNEQsRUFBRTtJQUMvRSxJQUFJLGtCQUFpQixFQUE2QixFQUFFO0lBQ3BELElBQUksVUFBUyxFQUFHLElBQUksOERBQU8sRUFBMkI7SUFDdEQsSUFBSSxzQkFBcUIsRUFBRyxJQUFJLDhEQUFPLEVBQTRCO0lBQ25FLElBQUksa0JBQWlCLEVBQUcsSUFBSSw4REFBTyxFQUE4QjtJQUNqRSxJQUFJLG1CQUFrQixFQUFHLElBQUksOERBQU8sRUFBOEI7SUFDbEUsSUFBSSxnQkFBb0M7SUFDeEMsSUFBSSxzQkFBcUIsRUFBZSxFQUFFO0lBQzFDLElBQUkseUJBQXdCLEVBQWUsRUFBRTtJQUM3QyxJQUFJLGdCQUE0QjtJQUVoQyx1QkFDQyxRQUFnQixFQUNoQixTQUFvQyxFQUNwQyxhQUFzQixFQUN0QixPQUErQztRQUUvQyxJQUFJLE9BQU0sRUFBRyxVQUFTLEdBQUksQ0FBQyxhQUFhO1FBQ3hDLEdBQUcsQ0FBQyxPQUFPLFVBQVMsSUFBSyxVQUFVLEVBQUU7WUFDcEMsT0FBTSxFQUFHLFNBQVMsRUFBRTtRQUNyQjtRQUNBLEdBQUcsQ0FBQyxPQUFNLElBQUssSUFBSSxFQUFFO1lBQ3BCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUU7Z0JBQy9CLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNwQixDQUFDLENBQUM7UUFDSDtJQUNEO0lBRUEscUJBQ0MsT0FBYSxFQUNiLFNBQWlCLEVBQ2pCLFlBQXNCLEVBQ3RCLElBQVMsRUFDVCxhQUF3QjtRQUV4QixHQUFHLENBQUMsYUFBYSxFQUFFO1lBQ2xCLE1BQU0sY0FBYSxFQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1lBQ2xELE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDO1FBQ3REO1FBRUEsSUFBSSxTQUFRLEVBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFFdEMsR0FBRyxDQUFDLFVBQVMsSUFBSyxPQUFPLEVBQUU7WUFDMUIsU0FBUSxFQUFHLFVBQW9CLEdBQVU7Z0JBQ3hDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLE1BQWMsQ0FBQyxlQUFlLEVBQUMsRUFBSSxHQUFHLENBQUMsTUFBMkIsQ0FBQyxLQUFLO1lBQzlFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2I7UUFFQSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQztRQUM3QyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7SUFDdEM7SUFFQSw4QkFDQyxPQUFnQixFQUNoQixrQkFBbUMsRUFDbkMsVUFBMkIsRUFDM0IsYUFBc0IsS0FBSztRQUUzQixNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUU7WUFDcEQsTUFBTSxRQUFPLEVBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLElBQUssS0FBSSxHQUFJLFVBQVU7WUFDNUQsTUFBTSxVQUFTLEVBQUcsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1RCxHQUFHLENBQUMsUUFBTyxHQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNyQyxNQUFNLGNBQWEsRUFBRyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNqRSxHQUFHLENBQUMsYUFBYSxFQUFFO29CQUNsQixPQUFPLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQztnQkFDdEQ7WUFDRDtRQUNELENBQUMsQ0FBQztJQUNIO0lBRUEsMkJBQ0MsUUFBaUIsRUFDakIsTUFBb0IsRUFDcEIsYUFBa0M7UUFFbEMsTUFBTSxnQkFBZSxFQUFtQixFQUFFO1FBQzFDLE1BQU0sZUFBYyxFQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7UUFDN0MsTUFBTSxvQkFBbUIsRUFBRyxjQUFjLENBQUMsYUFBYSxFQUFDLEdBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWdCLEdBQUksRUFBRSxDQUFDLENBQUMsT0FBTSxFQUFHLENBQUM7UUFDOUcsTUFBTSxxQkFBb0IsRUFDekIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBb0IsR0FBSSxNQUFNLENBQUMsb0JBQW1CLElBQUssS0FBSyxFQUFDLEdBQUksY0FBYyxFQUFDO1lBQ3pGLG1CQUFtQjtRQUNwQixJQUFJLFlBQXNDO1FBQzFDLElBQUksQ0FBQyxJQUFJLEVBQUMsRUFBRyxDQUFDLEVBQUUsRUFBQyxFQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekMsTUFBTSxhQUFZLEVBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNLFFBQU8sRUFBRztnQkFDZixJQUFJLEVBQUUsWUFBWTtnQkFDbEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFLLEVBQUcsQ0FBQztnQkFDdkIsb0JBQW9CO2dCQUNwQixjQUFjO2dCQUNkLFNBQVMsRUFBRSxNQUFNLENBQUM7YUFDRjtZQUNqQixHQUFHLENBQUMsMkRBQU8sQ0FBQyxZQUFZLEVBQUMsR0FBSSxZQUFZLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRTtnQkFDbkUsTUFBTSxDQUFDLGNBQWEsRUFBRyxJQUFJO2dCQUMzQixJQUFJLFdBQVUsRUFBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUM5QyxPQUFPLFVBQVUsRUFBRTtvQkFDbEIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUU7d0JBQzdCLEtBQUs7b0JBQ047b0JBQ0EsVUFBVSxDQUFDLGNBQWEsRUFBRyxJQUFJO29CQUMvQixXQUFVLEVBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztnQkFDL0M7WUFDRDtZQUNBLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO1lBQ3RDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7Z0JBQ2pCLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO1lBQzlDO1lBQ0EsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDN0IsYUFBWSxFQUFHLE9BQU87UUFDdkI7UUFDQSxPQUFPLGVBQWU7SUFDdkI7SUFFQSxnQ0FBZ0MsV0FBeUI7UUFDeEQsSUFBSSxrQkFBNEM7UUFDaEQsSUFBSSxjQUFhLEVBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztRQUV0RCxPQUFPLENBQUMsbUJBQWtCLEdBQUksYUFBYSxFQUFFO1lBQzVDLEdBQUcsQ0FBQyxDQUFDLG1CQUFrQixHQUFJLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDekQsbUJBQWtCLEVBQUcsYUFBYTtZQUNuQztZQUNBLGNBQWEsRUFBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1FBQ3JEO1FBQ0EsT0FBTyxrQkFBa0I7SUFDMUI7SUFFQSwyQkFBMkIsV0FBeUI7UUFDbkQsSUFBSSxhQUErQjtRQUNuQyxJQUFJLGNBQWEsRUFBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBRXRELE9BQU8sQ0FBQyxjQUFhLEdBQUksYUFBYSxFQUFFO1lBQ3ZDLEdBQUcsQ0FBQyxDQUFDLGNBQWEsR0FBSSxjQUFjLENBQUMsYUFBYSxFQUFDLEdBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtnQkFDN0UsY0FBYSxFQUFHLGFBQWEsQ0FBQyxPQUFPO1lBQ3RDO1lBQ0EsY0FBYSxFQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7UUFDckQ7UUFDQSxPQUFPLGFBQWE7SUFDckI7SUFFQSwrQkFBK0IsSUFBa0I7UUFDaEQsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUU7WUFDekMsTUFBTSxXQUFVLEVBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVO1lBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVSxvQkFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxFQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUU7WUFDekcscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRTtnQkFDL0IsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUUsV0FBVSxDQUFFLENBQUM7WUFDeEMsQ0FBQyxDQUFDO1FBQ0g7SUFDRDtJQUVBLDBCQUEwQixJQUFrQjtRQUMzQyxJQUFJLGFBQVksRUFBZ0IsSUFBSTtRQUNwQyxJQUFJLFdBQVUsRUFBNkIsSUFBSTtRQUMvQyxPQUFPLENBQUMsWUFBWSxFQUFFO1lBQ3JCLE1BQU0sWUFBVyxFQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDdEQsR0FBRyxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDaEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFPLEdBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7d0JBQzFELGFBQVksRUFBRyxXQUFXLENBQUMsT0FBTzt3QkFDbEMsS0FBSztvQkFDTjtvQkFDQSxXQUFVLEVBQUcsV0FBVztvQkFDeEIsUUFBUTtnQkFDVDtnQkFDQSxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQU8sR0FBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtvQkFDMUQsYUFBWSxFQUFHLFdBQVcsQ0FBQyxPQUFPO29CQUNsQyxLQUFLO2dCQUNOO2dCQUNBLFdBQVUsRUFBRyxXQUFXO2dCQUN4QixRQUFRO1lBQ1Q7WUFDQSxXQUFVLEVBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUM5QyxHQUFHLENBQUMsQ0FBQyxXQUFVLEdBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUM5QyxLQUFLO1lBQ047UUFDRDtRQUNBLE9BQU8sWUFBWTtJQUNwQjtJQUVBLHVCQUNDLE9BQW9CLEVBQ3BCLG9CQUFxQyxFQUFFLEVBQ3ZDLFdBQXlCLEVBQ3pCLDRCQUEyQixFQUFHLElBQUk7UUFFbEMsTUFBTSxVQUFTLEVBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMxRCxNQUFNLFVBQVMsRUFBRyxTQUFTLENBQUMsTUFBTTtRQUNsQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUMsSUFBSyxDQUFDLEVBQUMsR0FBSSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7WUFDckUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUM7UUFDakM7UUFFQSw0QkFBMkIsR0FBSSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFNUcsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25DLE1BQU0sU0FBUSxFQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxVQUFTLEVBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQ3JELE1BQU0sY0FBYSxFQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztZQUNqRCxHQUFHLENBQUMsU0FBUSxJQUFLLFNBQVMsRUFBRTtnQkFDM0IsTUFBTSxvQkFBbUIsRUFBRyxvQkFBb0IsQ0FBQyxhQUFhLENBQUM7Z0JBQy9ELElBQUksbUJBQWtCLEVBQUcsb0JBQW9CLENBQUMsU0FBUyxDQUFDO2dCQUN4RCxHQUFHLENBQUMsb0JBQW1CLElBQUssa0JBQWtCLEVBQUU7b0JBQy9DLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRTt3QkFDdkIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7NEJBQ3ZCLE1BQU0sV0FBVSxFQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUMsR0FBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDOzRCQUNuRSxJQUFJLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dDQUMzQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFLLENBQUMsQ0FBQyxFQUFFO29DQUNyRCxtQkFBa0IsRUFBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxrQkFBa0IsRUFBRTtnQ0FDOUQ7NEJBQ0Q7d0JBQ0Q7d0JBQ0EsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUM7b0JBQ2xEO29CQUFFLEtBQUs7d0JBQ04sT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUM7b0JBQ2pDO2dCQUNEO1lBQ0Q7WUFBRSxLQUFLLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBQyxJQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNuRCxhQUFhLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDO1lBQzNEO1lBQUUsS0FBSyxHQUFHLENBQUMsU0FBUSxJQUFLLFFBQVEsRUFBRTtnQkFDakMsTUFBTSxXQUFVLEVBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3pDLE1BQU0sV0FBVSxFQUFHLFVBQVUsQ0FBQyxNQUFNO2dCQUNwQyxJQUFJLENBQUMsSUFBSSxFQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3BDLE1BQU0sVUFBUyxFQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQy9CLE1BQU0sY0FBYSxFQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7b0JBQzFDLE1BQU0sY0FBYSxFQUFHLGNBQWEsR0FBSSxhQUFhLENBQUMsU0FBUyxDQUFDO29CQUMvRCxHQUFHLENBQUMsY0FBYSxJQUFLLGFBQWEsRUFBRTt3QkFDcEMsUUFBUTtvQkFDVDtvQkFDQyxPQUFPLENBQUMsS0FBYSxDQUFDLFNBQVMsRUFBQyxFQUFHLGNBQWEsR0FBSSxFQUFFO2dCQUN4RDtZQUNEO1lBQUUsS0FBSztnQkFDTixHQUFHLENBQUMsQ0FBQyxVQUFTLEdBQUksT0FBTyxjQUFhLElBQUssUUFBUSxFQUFFO29CQUNwRCxVQUFTLEVBQUcsRUFBRTtnQkFDZjtnQkFDQSxHQUFHLENBQUMsU0FBUSxJQUFLLE9BQU8sRUFBRTtvQkFDekIsTUFBTSxTQUFRLEVBQUksT0FBZSxDQUFDLFFBQVEsQ0FBQztvQkFDM0MsR0FBRyxDQUNGLFNBQVEsSUFBSyxVQUFTO3dCQUN0QixDQUFFLE9BQWUsQ0FBQyxlQUFlOzRCQUNoQyxFQUFFLFNBQVEsSUFBTSxPQUFlLENBQUMsZUFBZTs0QkFDL0MsRUFBRSxVQUFTLElBQUssYUFBYSxDQUMvQixFQUFFO3dCQUNBLE9BQWUsQ0FBQyxRQUFRLEVBQUMsRUFBRyxTQUFTO3dCQUNyQyxPQUFlLENBQUMsZUFBZSxFQUFDLEVBQUcsU0FBUztvQkFDOUM7Z0JBQ0Q7Z0JBQUUsS0FBSyxHQUFHLENBQUMsU0FBUSxJQUFLLE1BQUssR0FBSSxVQUFTLElBQUssYUFBYSxFQUFFO29CQUM3RCxNQUFNLEtBQUksRUFBRyxPQUFPLFNBQVM7b0JBQzdCLEdBQUcsQ0FBQyxLQUFJLElBQUssV0FBVSxHQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxJQUFLLEVBQUMsR0FBSSwyQkFBMkIsRUFBRTt3QkFDOUYsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUM7b0JBQzFGO29CQUFFLEtBQUssR0FBRyxDQUFDLEtBQUksSUFBSyxTQUFRLEdBQUksU0FBUSxJQUFLLFlBQVcsR0FBSSwyQkFBMkIsRUFBRTt3QkFDeEYsZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUM7b0JBQ3JFO29CQUFFLEtBQUssR0FBRyxDQUFDLFNBQVEsSUFBSyxhQUFZLEdBQUksU0FBUSxJQUFLLFdBQVcsRUFBRTt3QkFDakUsR0FBRyxDQUFFLE9BQWUsQ0FBQyxRQUFRLEVBQUMsSUFBSyxTQUFTLEVBQUU7NEJBQzVDLE9BQWUsQ0FBQyxRQUFRLEVBQUMsRUFBRyxTQUFTO3dCQUN2QztvQkFDRDtvQkFBRSxLQUFLO3dCQUNMLE9BQWUsQ0FBQyxRQUFRLEVBQUMsRUFBRyxTQUFTO29CQUN2QztnQkFDRDtZQUNEO1FBQ0Q7SUFDRDtJQUVBO1FBQ0MsTUFBTSxFQUFFLEtBQUksRUFBRSxFQUFHLGFBQWE7UUFDOUIsTUFBTSxVQUFTLEVBQUcsd0JBQXdCO1FBQzFDLHlCQUF3QixFQUFHLEVBQUU7UUFDN0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDckIsTUFBTSxJQUFHLEVBQUcsR0FBRyxHQUFFO2dCQUNoQixJQUFJLFFBQThCO2dCQUNsQyxPQUFPLENBQUMsU0FBUSxFQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFO29CQUN0QyxRQUFRLEVBQUU7Z0JBQ1g7WUFDRCxDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksRUFBRTtnQkFDVCxHQUFHLEVBQUU7WUFDTjtZQUFFLEtBQUs7Z0JBQ04sNkRBQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUM7WUFDbEM7UUFDRDtJQUNEO0lBRUE7UUFDQyxNQUFNLEVBQUUsS0FBSSxFQUFFLEVBQUcsYUFBYTtRQUM5QixNQUFNLFVBQVMsRUFBRyxxQkFBcUI7UUFDdkMsc0JBQXFCLEVBQUcsRUFBRTtRQUMxQixHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNyQixNQUFNLElBQUcsRUFBRyxHQUFHLEdBQUU7Z0JBQ2hCLElBQUksUUFBOEI7Z0JBQ2xDLE9BQU8sQ0FBQyxTQUFRLEVBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUU7b0JBQ3RDLFFBQVEsRUFBRTtnQkFDWDtZQUNELENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxFQUFFO2dCQUNULEdBQUcsRUFBRTtZQUNOO1lBQUUsS0FBSztnQkFDTixHQUFHLENBQUMsNkRBQU0sQ0FBQyxtQkFBbUIsRUFBRTtvQkFDL0IsNkRBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUM7Z0JBQ2hDO2dCQUFFLEtBQUs7b0JBQ04sVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDaEI7WUFDRDtRQUNEO0lBQ0Q7SUFFQSwyQkFBMkIsSUFBa0IsRUFBRSxrQkFBc0M7UUFDcEYsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzdDLGdCQUFnQixDQUNmLElBQUksQ0FBQyxPQUFzQixFQUMzQixrQkFBa0IsQ0FBQyxXQUFVLEdBQUksRUFBRSxFQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FDZDtZQUNELGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBc0IsRUFBRSxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQztZQUN0RixNQUFNLE9BQU0sRUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU0sR0FBSSxFQUFFO1lBQ3JDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLG9CQUFvQixDQUNuQixJQUFJLENBQUMsT0FBc0IsRUFDM0Isa0JBQWtCLENBQUMsT0FBTSxHQUFJLEVBQUUsRUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQ2hCLElBQUksQ0FDSjtZQUNGO1lBQ0Esa0JBQWtCLENBQUMsT0FBTSxFQUFHLGtCQUFrQixDQUFDLE9BQU0sR0FBSSxFQUFFO1lBQzNELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUU7Z0JBQ3JDLFdBQVcsQ0FDVixJQUFJLENBQUMsT0FBc0IsRUFDM0IsS0FBSyxFQUNMLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFDZCxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQ2hDO1lBQ0YsQ0FBQyxDQUFDO1FBQ0g7UUFBRSxLQUFLO1lBQ04sYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFzQixFQUFFLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUM7UUFDaEY7SUFDRDtJQUVBLGVBQWUsZUFBc0MsRUFBRTtRQUN0RCxjQUFhLG9CQUFRLGFBQWEsRUFBSyxZQUFZLENBQUU7UUFDckQsTUFBTSxFQUFFLFFBQU8sRUFBRSxFQUFHLGFBQWE7UUFDakMsSUFBSSxhQUFZLEVBQUcsUUFBUSxFQUFFO1FBQzdCLEdBQUcsQ0FBQywyREFBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzFCLGFBQVksRUFBRyxxREFBQyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDL0M7UUFDQSxNQUFNLFlBQVcsRUFBRztZQUNuQixJQUFJLEVBQUUsWUFBWTtZQUNsQixLQUFLLEVBQUU7U0FDUDtRQUNELGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUscURBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBRSxDQUFDO1FBQzFFLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDbEIsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDbkIsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFDO1NBQ2pELENBQUM7UUFDRixnQkFBZ0IsRUFBRTtRQUNsQixhQUFhLENBQUMsTUFBSyxFQUFHLEtBQUs7UUFDM0IsdUJBQXVCLEVBQUU7UUFDekIsYUFBYSxFQUFFO0lBQ2hCO0lBRUE7UUFDQyxpQkFBZ0IsR0FBSSxnQkFBZ0IsRUFBRTtJQUN2QztJQUVBO1FBQ0MsTUFBTSxFQUFFLEtBQUksRUFBRSxFQUFHLGFBQWE7UUFDOUIsR0FBRyxDQUFDLElBQUksRUFBRTtZQUNULHFCQUFxQixFQUFFO1FBQ3hCO1FBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtZQUM3QixpQkFBZ0IsRUFBRyw2REFBTSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsR0FBRTtnQkFDcEQscUJBQXFCLEVBQUU7WUFDeEIsQ0FBQyxDQUFDO1FBQ0g7SUFDRDtJQUVBO1FBQ0MsaUJBQWdCLEVBQUcsU0FBUztRQUM1QixNQUFNLGtCQUFpQixFQUFHLENBQUMsR0FBRyxrQkFBa0IsQ0FBQztRQUNqRCxNQUFNLG1CQUFrQixFQUFHLEVBQUU7UUFDN0IsbUJBQWtCLEVBQUcsRUFBRTtRQUN2QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQUssRUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ25ELElBQUksSUFBdUM7UUFDM0MsT0FBTyxDQUFDLEtBQUksRUFBRyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO1lBQ3hDLElBQUksRUFBRSxTQUFRLEVBQUUsRUFBRyxJQUFJO1lBQ3ZCLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFDLElBQUssQ0FBQyxFQUFDLEdBQUkscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVMsQ0FBQyxFQUFFO2dCQUN4RixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxNQUFNLFFBQU8sRUFBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFO2dCQUNwRCxNQUFNLGFBQVksRUFBRyxzRUFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFO2dCQUNyRCxNQUFNLE9BQU0sRUFBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO2dCQUM3QyxNQUFNLFFBQU8sRUFBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO2dCQUMvQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVEsRUFBRSxFQUFHLFFBQVE7Z0JBQzFDLE1BQU0sS0FBSSxFQUFHO29CQUNaLElBQUksRUFBRTt3QkFDTCxJQUFJLEVBQUUsaURBQUs7d0JBQ1gsaUJBQWlCLEVBQUUsV0FBb0M7d0JBQ3ZELFVBQVUsRUFBRSxZQUFZLENBQUMsZUFBZTt3QkFDeEMsUUFBUSxFQUFFLFFBQVE7d0JBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDO3FCQUNuQjtvQkFDRCxRQUFRO29CQUNSLEtBQUssRUFBRSxPQUFPLENBQUM7aUJBQ2Y7Z0JBRUQsT0FBTSxHQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO2dCQUM3QyxRQUFPLEdBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7Z0JBQ2hELE1BQU0sRUFBRSxLQUFJLEVBQUUsRUFBRyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSSxDQUFFLENBQUM7Z0JBQ2pELEdBQUcsQ0FBQyxJQUFJLEVBQUU7b0JBQ1QsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLFNBQVEsR0FBSSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztvQkFDckQsZ0JBQWdCLEVBQUU7Z0JBQ25CO1lBQ0Q7UUFDRDtRQUNBLHVCQUF1QixFQUFFO1FBQ3pCLGFBQWEsRUFBRTtJQUNoQjtJQUVBO1FBQ0MsSUFBSSxJQUFxRTtRQUN6RSxPQUFPLENBQUMsS0FBSSxFQUFHLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO1lBQ3BDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM3QjtZQUFFLEtBQUs7Z0JBQ04sTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSSxFQUFFLEVBQUcsSUFBSTtnQkFDcEMsUUFBUSxDQUFDLFFBQU8sR0FBSSxXQUFXLEVBQUUsS0FBSSxHQUFJLFdBQVcsRUFBRSxJQUFJLENBQUM7WUFDNUQ7UUFDRDtJQUNEO0lBRUE7UUFDQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7UUFDM0IsSUFBSSxJQUF3QztRQUM1QyxPQUFPLENBQUMsS0FBSSxFQUFHLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUU7WUFDeEMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFJLElBQUssUUFBUSxFQUFFO2dCQUMzQixNQUFNLEVBQ0wsYUFBYSxFQUNiLElBQUksRUFDSixJQUFJLEVBQUUsRUFDTCxPQUFPLEVBQ1AsTUFBTSxFQUNOLG9CQUFvQixFQUNwQixJQUFJLEVBQUUsRUFBRSxXQUFVLEVBQUUsRUFDcEIsRUFDRCxFQUFHLElBQUk7Z0JBRVIsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUUsQ0FBRSxDQUFDO2dCQUMzQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUM7Z0JBQzNCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRTtvQkFDWixJQUFJLFlBQWlCO29CQUNyQixHQUFHLENBQUMsb0JBQW9CLEVBQUU7d0JBQ3pCLGFBQVksRUFBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3RDO29CQUNBLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBUSxFQUFFLFlBQVksQ0FBQztvQkFDbEQsR0FBRyxDQUFDLDhEQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO3dCQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDckI7Z0JBQ0Q7Z0JBQ0EsaUJBQWlCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxVQUFVLENBQUM7Z0JBQ2pELE1BQU0sYUFBWSxFQUFHLHNFQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQWtCLENBQUM7Z0JBQ3hFLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBRyxHQUFJLEtBQUksR0FBSSxZQUFZLEVBQUU7b0JBQzNDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQXNCLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQzFFO2dCQUNBLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUSxFQUFHLElBQUk7WUFDMUI7WUFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSSxJQUFLLFFBQVEsRUFBRTtnQkFDbEMsTUFBTSxFQUNMLElBQUksRUFDSixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSSxDQUFFLEVBQ3ZCLFFBQU8sRUFDUCxFQUFHLElBQUk7Z0JBQ1IsTUFBTSxPQUFNLEVBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDMUMsR0FBRyxDQUFDLE9BQU0sR0FBSSxjQUFjLENBQUMsTUFBTSxFQUFDLEdBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtvQkFDeEQsTUFBTSxhQUFZLEVBQUcsc0VBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7b0JBQzNELGFBQVksR0FBSSxZQUFZLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRTtnQkFDbkQ7Z0JBRUEsTUFBTSxtQkFBa0IsRUFBRyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztnQkFDMUUsTUFBTSxhQUFZLEVBQUcsc0VBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBa0IsQ0FBQztnQkFFeEUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDO2dCQUMzQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUM7Z0JBRTNCLEdBQUcsQ0FBQyxhQUFZLEdBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFHLEdBQUksSUFBSSxFQUFFO29CQUNoRCxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBc0IsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3BGO1lBQ0Q7WUFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSSxJQUFLLFFBQVEsRUFBRTtnQkFDbEMsTUFBTSxFQUFFLFFBQU8sRUFBRSxFQUFHLElBQUk7Z0JBQ3hCLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUU7b0JBQzFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDO2dCQUNwRDtnQkFBRSxLQUFLO29CQUNOLE9BQU8sQ0FBQyxPQUFRLENBQUMsVUFBVyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBUSxDQUFDO29CQUMxRCxPQUFPLENBQUMsUUFBTyxFQUFHLFNBQVM7Z0JBQzVCO1lBQ0Q7WUFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSSxJQUFLLFFBQVEsRUFBRTtnQkFDbEMsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFRLEVBQUUsRUFBRyxJQUFJO2dCQUNuQyxNQUFNLGFBQVksRUFBRyxzRUFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFO2dCQUNyRCxZQUFZLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRTtnQkFDbEMsU0FBUSxHQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUU7WUFDcEM7WUFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSSxJQUFLLFFBQVEsRUFBRTtnQkFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO29CQUMxQixNQUFNLGFBQVksRUFBRyxzRUFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7b0JBQ2pFLGFBQVksR0FBSSxZQUFZLENBQUMsUUFBUSxFQUFFO2dCQUN4QztnQkFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQU8sRUFBRyxTQUFTO2dCQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFJLEVBQUcsU0FBUztnQkFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFRLEVBQUcsU0FBUztZQUNsQztRQUNEO0lBQ0Q7SUFFQTtRQUNDLHVCQUF1QixFQUFFO1FBQ3pCLDBCQUEwQixFQUFFO0lBQzdCO0lBRUEsNEJBQTRCLElBQWtCLEVBQUUsVUFBa0I7UUFDakUsTUFBTSxFQUFFLE1BQUssRUFBRSxFQUFHLGFBQWE7UUFDL0IsR0FBRyxDQUFDLE1BQUssR0FBSSxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQy9CLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksRUFDSCxJQUFJLEVBQUUsRUFBRSxJQUFHLEVBQUUsRUFDYixFQUFHLElBQUk7Z0JBQ1IsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDM0MsTUFBTSxXQUFVLEVBQUcsVUFBVSxDQUFDLENBQUMsQ0FBWTtvQkFDM0MsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUUsSUFBSyxDQUFDLFVBQVUsQ0FBQyxRQUFPLEdBQUksRUFBRSxDQUFDLEVBQUU7d0JBQ3JELFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDdkIsSUFBSSxDQUFDLFFBQU8sRUFBRyxVQUFVO3dCQUN6QixLQUFLO29CQUNOO2dCQUNEO1lBQ0Q7WUFBRSxLQUFLO2dCQUNOLElBQUksQ0FBQyxXQUFVLEVBQUcsVUFBVTtZQUM3QjtRQUNEO0lBQ0Q7SUFFQSx5Q0FBeUMsVUFBMEIsRUFBRSxLQUFhO1FBQ2pGLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUU7WUFDL0IsTUFBTSxtQkFBa0IsRUFBRyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEUsb0JBQW9CLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsQ0FBQztRQUM1RCxDQUFDLENBQUM7SUFDSDtJQUVBLGtCQUFrQixPQUF1QixFQUFFLElBQW9CLEVBQUUsT0FBb0IsRUFBRTtRQUN0RixJQUFJLEVBQUUsV0FBVSxFQUFHLEVBQUUsRUFBRSxTQUFRLEVBQUcsQ0FBQyxFQUFFLFNBQVEsRUFBRyxFQUFDLEVBQUUsRUFBRyxJQUFJO1FBQzFELE1BQU0sY0FBYSxFQUFHLE9BQU8sQ0FBQyxNQUFNO1FBQ3BDLE1BQU0sV0FBVSxFQUFHLElBQUksQ0FBQyxNQUFNO1FBQzlCLE1BQU0sb0JBQW1CLEVBQUcsY0FBYSxFQUFHLEVBQUMsR0FBSSxDQUFDLGNBQWEsRUFBRyxFQUFDLEdBQUksY0FBYSxFQUFHLFVBQVUsQ0FBQztRQUNsRyxNQUFNLGFBQVksRUFBa0IsRUFBRTtRQUN0QyxHQUFHLENBQUMsU0FBUSxFQUFHLFVBQVUsRUFBRTtZQUMxQixJQUFJLGVBQWMsRUFBRyxTQUFRLEVBQUcsY0FBYyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxTQUFTO1lBQzdFLE1BQU0sWUFBVyxFQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDbEMsV0FBVyxDQUFDLG9CQUFtQixFQUFHLG1CQUFtQjtZQUVyRCxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO1lBRTNDLEdBQUcsQ0FBQyxlQUFjLEdBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsRUFBRTtnQkFDeEQsUUFBUSxFQUFFO2dCQUNWLFFBQVEsRUFBRTtnQkFDVixHQUFHLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBQyxHQUFJLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDbEUsV0FBVyxDQUFDLFNBQVEsRUFBRyxjQUFjLENBQUMsUUFBUTtnQkFDL0M7Z0JBQ0EsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFlBQVcsQ0FBRSxDQUFDO1lBQ2xFO1lBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxlQUFjLEdBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFRLEVBQUcsQ0FBQyxFQUFDLElBQUssQ0FBQyxDQUFDLEVBQUU7cUJBQ3pFLEdBQUksT0FBTyxDQUFDLE9BQU0sR0FBSSwrQkFBK0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO2dCQUN0RixZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsWUFBVyxDQUFFLENBQUM7Z0JBQzVELFFBQVEsRUFBRTtZQUNYO1lBQUUsS0FBSyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxTQUFRLEVBQUcsQ0FBQyxFQUFDLElBQUssQ0FBQyxDQUFDLEVBQUU7cUJBQ3RELEdBQUksK0JBQStCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztnQkFDdkUsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFVBQVMsQ0FBRSxDQUFDO2dCQUMvRCxRQUFRLEVBQUU7WUFDWDtZQUFFLEtBQUs7cUJBQ1csR0FBSSwrQkFBK0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO3FCQUNuRCxHQUFJLCtCQUErQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7Z0JBQ3ZFLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFTLENBQUUsQ0FBQztnQkFDL0QsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFlBQVcsQ0FBRSxDQUFDO2dCQUM1RCxRQUFRLEVBQUU7Z0JBQ1YsUUFBUSxFQUFFO1lBQ1g7UUFDRDtRQUVBLEdBQUcsQ0FBQyxTQUFRLEVBQUcsVUFBVSxFQUFFO1lBQzFCLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUSxFQUFFLENBQUUsQ0FBQztRQUNoRjtRQUVBLEdBQUcsQ0FBQyxjQUFhLEVBQUcsU0FBUSxHQUFJLFNBQVEsR0FBSSxVQUFVLEVBQUU7WUFDdkQsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLFFBQVEsRUFBRSxFQUFDLEVBQUcsYUFBYSxFQUFFLENBQUMsRUFBRSxFQUFFO3FCQUM3QixHQUFJLCtCQUErQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFTLENBQUUsQ0FBQztZQUM1RDtRQUNEO1FBRUEsSUFBSSxDQUFDLElBQUksRUFBQyxFQUFHLENBQUMsRUFBRSxFQUFDLEVBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFNLEVBQUUsRUFBRyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE9BQU0sR0FBSSxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQyxLQUFJLEdBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDaEMsSUFBRyxHQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbkM7SUFDRDtJQUVBLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxLQUFJLENBQWU7UUFDbEQsR0FBRyxDQUFDLFFBQU8sSUFBSyxJQUFJLEVBQUU7WUFDckIsR0FBRyxDQUFDLENBQUMsUUFBTyxHQUFJLElBQUksRUFBRTtnQkFDckIsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDekIsT0FBTyxVQUFVLENBQUMsRUFBRSxLQUFJLENBQUUsQ0FBQztnQkFDNUI7Z0JBQUUsS0FBSztvQkFDTixPQUFPLGFBQWEsQ0FBQyxFQUFFLEtBQUksQ0FBRSxDQUFDO2dCQUMvQjtZQUNEO1lBQUUsS0FBSyxHQUFHLENBQUMsUUFBTyxHQUFJLElBQUksRUFBRTtnQkFDM0IsR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUMsR0FBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3BELE9BQU8sVUFBVSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUksQ0FBRSxDQUFDO2dCQUNyQztnQkFBRSxLQUFLLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFDLEdBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMzRCxPQUFPLGFBQWEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFJLENBQUUsQ0FBQztnQkFDeEM7WUFDRDtZQUFFLEtBQUssR0FBRyxDQUFDLFFBQU8sR0FBSSxDQUFDLElBQUksRUFBRTtnQkFDNUIsR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDNUIsT0FBTyxVQUFVLENBQUMsRUFBRSxRQUFPLENBQUUsQ0FBQztnQkFDL0I7Z0JBQUUsS0FBSyxHQUFHLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNuQyxPQUFPLGFBQWEsQ0FBQyxFQUFFLFFBQU8sQ0FBRSxDQUFDO2dCQUNsQztZQUNEO1FBQ0Q7UUFDQSxPQUFPLEVBQUU7SUFDVjtJQUVBLHVCQUF1QixFQUFFLEtBQUksQ0FBMkI7UUFDdkQsSUFBSSxFQUNILElBQUksRUFBRSxFQUFFLGtCQUFpQixFQUFFLEVBQzNCLEVBQUcsSUFBSTtRQUNSLElBQUksRUFBRSxTQUFRLEVBQUUsRUFBRyxhQUFhO1FBQ2hDLEdBQUcsQ0FBQyxDQUFDLGtGQUF1QixDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDaEQsT0FBTyxFQUFFO1FBQ1Y7UUFDQSxNQUFNLFNBQVEsRUFBRyxJQUFJLGlCQUFpQixFQUFnQjtRQUN0RCxHQUFHLENBQUMsUUFBUSxFQUFFO1lBQ2IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFJLEVBQUcsUUFBUTtRQUNsQztRQUNBLE1BQU0sYUFBWSxFQUFHLHNFQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUU7UUFDckQsWUFBWSxDQUFDLFdBQVUsRUFBRyxHQUFHLEdBQUU7WUFDOUIsWUFBWSxDQUFDLE1BQUssRUFBRyxJQUFJO1lBQ3pCLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFTLEdBQUkscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNuRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFLLENBQUUsQ0FBQztnQkFDeEQsU0FBUyxFQUFFO1lBQ1o7UUFDRCxDQUFDO1FBQ0QsWUFBWSxDQUFDLFVBQVMsRUFBRyxJQUFJO1FBQzdCLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNoRSxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzVDLElBQUksQ0FBQyxTQUFRLEVBQUcsUUFBUTtRQUN4QixJQUFJLFNBQVEsRUFBRyxRQUFRLENBQUMsVUFBVSxFQUFFO1FBQ3BDLFlBQVksQ0FBQyxVQUFTLEVBQUcsS0FBSztRQUM5QixHQUFHLENBQUMsUUFBUSxFQUFFO1lBQ2IsU0FBUSxFQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzFELElBQUksQ0FBQyxpQkFBZ0IsRUFBRyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztRQUNoRTtRQUNBLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztZQUM5QyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDdEIsaUJBQWdCLEVBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDaEU7UUFDRDtRQUNBLE9BQU87WUFDTixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVSxFQUFFLENBQUU7WUFDNUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUk7U0FDbEQ7SUFDRjtJQUVBLHVCQUF1QixFQUFFLE9BQU8sRUFBRSxLQUFJLENBQTJCO1FBQ2hFLFFBQU8sRUFBRyxDQUFDLE9BQU8sQ0FBQyxTQUFRLEdBQUkscUJBQXFCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxHQUFJLE9BQU87UUFDdEYsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsY0FBYSxFQUFFLEVBQUcsT0FBTztRQUNwRCxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUU7WUFDZCxPQUFPLEVBQW1CO1FBQzNCO1FBQ0EsTUFBTSxhQUFZLEVBQUcsc0VBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRTtRQUNyRCxJQUFJLENBQUMsU0FBUSxFQUFHLFFBQVE7UUFDeEIsSUFBSSxDQUFDLFFBQU8sRUFBRyxPQUFPO1FBQ3RCLElBQUksQ0FBQyxjQUFhLEVBQUcsYUFBYTtRQUNsQyxZQUFZLENBQUMsVUFBUyxFQUFHLElBQUk7UUFDN0IsUUFBUyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2pFLFFBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDN0MscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFTLEVBQUUsSUFBSSxDQUFDO1FBQy9DLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFO1lBQ3ZCLElBQUksU0FBUSxFQUFHLFFBQVMsQ0FBQyxVQUFVLEVBQUU7WUFDckMsWUFBWSxDQUFDLFVBQVMsRUFBRyxLQUFLO1lBQzlCLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2IsU0FBUSxFQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQUMxRCxJQUFJLENBQUMsaUJBQWdCLEVBQUcsaUJBQWlCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7WUFDbkU7WUFDQSxPQUFPO2dCQUNOLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsR0FBRSxDQUFFO2dCQUNsRixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBSzthQUNuRDtRQUNGO1FBQ0EsWUFBWSxDQUFDLFVBQVMsRUFBRyxLQUFLO1FBQzlCLElBQUksQ0FBQyxpQkFBZ0IsRUFBRyxPQUFPLENBQUMsZ0JBQWdCO1FBQ2hELE9BQU87WUFDTixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBSztTQUNuRDtJQUNGO0lBRUEsdUJBQXVCLEVBQUUsUUFBTyxDQUEyQjtRQUMxRCxRQUFPLEVBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRyxFQUFFLE9BQU87UUFDbkYsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNsQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUyxDQUFDO1FBRS9DLE9BQU87WUFDTixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxHQUFFLENBQUU7WUFDckQsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFPO1NBQ2pDO0lBQ0Y7SUFFQSxvQkFBb0IsRUFBRSxLQUFJLENBQXdCO1FBQ2pELElBQUksV0FBVSxFQUFXLEVBQUU7UUFDM0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNsQixHQUFHLENBQUUsSUFBSSxDQUFDLElBQVksQ0FBQyxPQUFPLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxRQUFPLEVBQUksSUFBSSxDQUFDLElBQVksQ0FBQyxPQUFPO1lBQzFDO1lBQUUsS0FBSztnQkFDTixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFHLElBQUssS0FBSyxFQUFFO29CQUM1QixJQUFJLENBQUMsVUFBUyxFQUFHLGFBQWE7Z0JBQy9CO2dCQUNBLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDbEIsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7d0JBQ25CLElBQUksQ0FBQyxRQUFPLEVBQUcsNkRBQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7b0JBQzlFO29CQUFFLEtBQUs7d0JBQ04sSUFBSSxDQUFDLFFBQU8sRUFBRyw2REFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7b0JBQzVEO2dCQUNEO2dCQUFFLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSSxHQUFJLElBQUksRUFBRTtvQkFDbEMsSUFBSSxDQUFDLFFBQU8sRUFBRyw2REFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzlEO1lBQ0Q7UUFDRDtRQUFFLEtBQUs7WUFDTixJQUFJLENBQUMsT0FBTSxFQUFHLElBQUk7UUFDbkI7UUFDQSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNqQixHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRTtnQkFDeEIsV0FBVSxFQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUNoRDtZQUNBLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGlCQUFnQixFQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7WUFDMUU7UUFDRDtRQUNBLE1BQU0sbUJBQWtCLEVBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDO1FBQ3ZELEdBQUcsQ0FBQyxtQkFBa0IsR0FBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRTtZQUN0RCxrQkFBa0IsQ0FBQyxRQUFPLEVBQUcsSUFBSSxDQUFDLE9BQU87UUFDMUM7UUFDQSxNQUFNLElBQUcsRUFBMkI7WUFDbkMsSUFBSSxFQUFFLElBQUs7WUFDWCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFFO1lBQ3ZDLElBQUksRUFBRTtTQUNOO1FBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUMxQixPQUFPO2dCQUNOLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxXQUFVLEVBQUUsQ0FBRTtnQkFDeEU7YUFDQTtRQUNGO1FBQ0EsT0FBTyxFQUFFLElBQUcsQ0FBRTtJQUNmO0lBRUEsb0JBQW9CLEVBQUUsT0FBTyxFQUFFLEtBQUksQ0FBd0I7UUFDMUQsTUFBTSxjQUFhLEVBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDO1FBQ2hELElBQUksQ0FBQyxRQUFPLEVBQUcsT0FBTyxDQUFDLE9BQU87UUFDOUIsSUFBSSxDQUFDLFVBQVMsRUFBRyxPQUFPLENBQUMsU0FBUztRQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFJLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFJLElBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDM0QsTUFBTSxnQkFBZSxFQUFHLGFBQWMsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDO1lBQ3BGLGFBQWMsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxPQUFRLENBQUM7WUFDM0QsSUFBSSxDQUFDLFFBQU8sRUFBRyxlQUFlO1FBQy9CO1FBQUUsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDOUIsTUFBTSxTQUFRLEVBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztZQUNyRSxJQUFJLENBQUMsaUJBQWdCLEVBQUcsUUFBUTtRQUNqQztRQUNBLE9BQU87WUFDTixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLEdBQUUsQ0FBRTtZQUNsRixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFPO1NBQ3BDO0lBQ0Y7SUFFQSxvQkFBb0IsRUFBRSxRQUFPLENBQXdCO1FBQ3BELGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDbEMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUksRUFBRyxTQUFTO1FBQzdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQzFCLE9BQU87Z0JBQ04sSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsR0FBRSxDQUFFO2dCQUNyRCxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQU87YUFDOUI7UUFDRjtRQUVBLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7WUFDN0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRTtnQkFDL0IsSUFBSSxTQUFRLEVBQUcsT0FBTyxDQUFDLGlCQUFnQixHQUFJLEVBQUU7Z0JBQzdDLElBQUksT0FBaUM7Z0JBQ3JDLE9BQU8sQ0FBQyxRQUFPLEVBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUU7b0JBQ2xDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7d0JBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7d0JBQzFDLE9BQU8sQ0FBQyxpQkFBZ0IsRUFBRyxTQUFTO29CQUNyQztvQkFDQSxHQUFHLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM1QixHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTs0QkFDckIscUJBQXFCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7NEJBQzlDLE1BQU0sYUFBWSxFQUFHLHNFQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDOzRCQUM1RCxhQUFZLEdBQUksWUFBWSxDQUFDLFFBQVEsRUFBRTt3QkFDeEM7d0JBQ0EsT0FBTyxDQUFDLFNBQVEsRUFBRyxTQUFTO29CQUM3QjtvQkFDQSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO29CQUNsQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO29CQUNqQyxPQUFPLENBQUMsUUFBTyxFQUFHLFNBQVM7b0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSSxFQUFHLFNBQVM7Z0JBQzlCO1lBQ0QsQ0FBQyxDQUFDO1FBQ0g7UUFFQSxPQUFPO1lBQ04sR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFPO1NBQzlCO0lBQ0Y7SUFFQSxPQUFPO1FBQ04sS0FBSztRQUNMO0tBQ0E7QUFDRjtBQUVlLGlFQUFRLEVBQUM7Ozs7Ozs7O0FDMXFDeEIseUM7Ozs7Ozs7OztBQ0FBO0FBQ0EsSUFBSSxJQUFHLEVBQUcsbUJBQU8sQ0FBQyw0Q0FBeUIsQ0FBQztBQUU1QyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEVBQUU7SUFDckMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0FBQzNDOzs7Ozs7OztBQ0xBO0FBQ0Esa0JBQWtCLGdKOzs7Ozs7O0FDRGxCLG1GQUFPLENBQUMsdURBQXNGO0FBQzlGO0FBQ0EsSUFBSSxJQUEwQztBQUM5QyxDQUFDLGlDQUFPLEVBQUUsa0NBQUUsYUFBYSxvQkFBb0IsRUFBRTtBQUFBLG9HQUFDO0FBQ2hELENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNELFNBQVM7QUFDVCxDQUFDLEk7Ozs7Ozs7O0FDUEQ7QUFBQTtBQUFBLElBQVksSUFhWDtBQWJELFdBQVksSUFBSTtJQUNmLGdDQUFTO0lBQ1QsOEJBQVE7SUFDUixrQ0FBVTtJQUNWLG9DQUFXO0lBQ1gsZ0NBQVM7SUFDVCxnQ0FBUztJQUNULHdDQUFhO0lBQ2Isb0NBQVc7SUFDWCxrQ0FBVTtJQUNWLGtDQUFVO0lBQ1YsNkJBQU87SUFDUCw0QkFBTztBQUNSLENBQUMsRUFiVyxJQUFJLEtBQUosSUFBSSxRQWFmO0FBRU0sOEJBQThCLElBQXdCO0lBQzVELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBcUIsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUNyRixDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ1AsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUN0QixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2Qm1FO0FBRTZCO0FBQy9DO0FBRUk7QUFDVjtBQUNXO0FBQzhCO0FBMkI5RSxNQUFNLFVBQVUsR0FBRyxzR0FBVyxDQUFDLDBGQUFVLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFTbEQsSUFBYSxTQUFTLEdBQXRCLGVBQW9FLFNBQVEsVUFBYTtJQUM5RSxjQUFjO1FBQ3ZCLE1BQU0sRUFDTCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDcEIsTUFBTSxDQUFDO1lBQ04sd0RBQVE7WUFDUixRQUFRLENBQUMsQ0FBQyxDQUFDLDREQUFZLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDOUIsT0FBTyxDQUFDLENBQUMsQ0FBQywyREFBVyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzVCLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLDJEQUFXLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDckMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMseURBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNwQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDREQUFZLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDOUIsUUFBUSxDQUFDLENBQUMsQ0FBQyw0REFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzlCLFNBQVMsQ0FBQyxDQUFDLENBQUMsNkRBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUNoQyxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU07UUFDTCxNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUVyRCxNQUFNLENBQUMsZ0ZBQUMsQ0FBQyxPQUFPLG9CQUNaLGtGQUFvQixDQUFDLElBQUksQ0FBQyxJQUM3QixPQUFPLEVBQUU7Z0JBQ1IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDcEMsTUFBTSxDQUFDLENBQUMsQ0FBQyx5RUFBc0IsQ0FBQyxDQUFDLENBQUMsSUFBSTthQUN0QyxFQUNELEdBQUcsRUFBRSxLQUFLLEtBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25CLENBQUM7Q0FDRDtBQWxDWSxTQUFTO0lBUHJCLGdHQUFLLENBQUMsZ0RBQUcsQ0FBQztJQUNWLG1IQUFhLENBQWtCO1FBQy9CLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLFVBQVUsRUFBRSxDQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBRTtRQUNoSSxVQUFVLEVBQUUsRUFBRTtRQUNkLE1BQU0sRUFBRSxFQUFFO0tBQ1YsQ0FBQztHQUNXLFNBQVMsQ0FrQ3JCO0FBbENxQjtBQW9DUCxXQUFZLFNBQVEsU0FBMEI7Q0FBRztBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoRkk7QUFDNkI7QUFDVjtBQUNwRDtBQUNrQjtBQUVNO0FBQ1Y7QUFFSztBQUNKO0FBQ0w7QUFDd0M7QUE2QjlFLE1BQU0sVUFBVSxHQUFHLHNHQUFXLENBQUMsb0dBQVUsQ0FBQywwRkFBVSxDQUFDLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFFOUQsc0JBQXNCLEtBQVk7SUFDakMsTUFBTSxLQUFLLEdBQUksS0FBSyxDQUFDLE1BQTJCLENBQUMsS0FBSyxDQUFDO0lBQ3ZELE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQXlDRCxJQUFhLFVBQVUsR0FBdkIsZ0JBQXVFLFNBQVEsVUFBbUI7SUF2Q2xHOztRQXdDQyx5Q0FBeUM7UUFDakMsY0FBUyxHQUFHLCtFQUFJLEVBQUUsQ0FBQztJQWtONUIsQ0FBQztJQWhOUSxPQUFPLENBQUUsS0FBaUI7UUFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNPLFNBQVMsQ0FBRSxLQUFZO1FBQzlCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBQ08sUUFBUSxDQUFFLEtBQWlCO1FBQ2xDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBQ08sUUFBUSxDQUFFLEtBQWlCO1FBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFDTyxRQUFRLENBQUUsS0FBWTtRQUM3QixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUNPLFVBQVUsQ0FBRSxLQUFvQjtRQUN2QyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RyxDQUFDO0lBQ08sV0FBVyxDQUFFLEtBQW9CO1FBQ3hDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFHLENBQUM7SUFDTyxRQUFRLENBQUUsS0FBb0I7UUFDckMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUNPLFlBQVksQ0FBRSxLQUFpQjtRQUN0QyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM5RCxDQUFDO0lBQ08sVUFBVSxDQUFFLEtBQWlCO1FBQ3BDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFDTyxhQUFhLENBQUUsS0FBaUI7UUFDdkMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDaEUsQ0FBQztJQUNPLFdBQVcsQ0FBRSxLQUFpQjtRQUNyQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM1RCxDQUFDO0lBQ08sY0FBYyxDQUFFLEtBQWlCO1FBQ3hDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ2xFLENBQUM7SUFFUyxjQUFjO1FBQ3ZCLE1BQU0sRUFDTCxRQUFRLEVBQ1IsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxHQUFHLEtBQUssRUFDaEIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsdUZBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxNQUFNLENBQUM7WUFDTiwwREFBUTtZQUNSLFFBQVEsQ0FBQyxDQUFDLENBQUMsOERBQVksQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUM5QixLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyw2REFBVyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ3hDLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLDZEQUFXLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDckMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsMkRBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNwQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDhEQUFZLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDOUIsUUFBUSxDQUFDLENBQUMsQ0FBQyw4REFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzlCLFFBQVEsQ0FBQyxDQUFDLENBQUMsOERBQVksQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUM5QixDQUFDO0lBQ0gsQ0FBQztJQUVTLGNBQWMsQ0FBQyxZQUFvQjtRQUM1QyxNQUFNLEVBQ0wsUUFBUSxHQUFHLEtBQUssRUFDaEIsY0FBYyxHQUFHLE9BQU8sRUFDeEIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRXBCLE1BQU0sQ0FBQyxnRkFBQyxDQUFDLEtBQUssRUFBRTtZQUNmLE9BQU8sRUFBRSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsMkRBQVMsQ0FBQyxFQUFFLGdFQUFtQixDQUFFO1lBQ3ZELGFBQWEsRUFBRSxNQUFNO1lBQ3JCLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ2pELEVBQUU7WUFDRixnRkFBQyxDQUFDLE1BQU0sRUFBRTtnQkFDVCxPQUFPLEVBQUUsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLDBEQUFRLENBQUMsRUFBRSwrREFBa0IsQ0FBRTtnQkFDckQsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLEVBQUU7YUFDckMsQ0FBQztZQUNGLGdGQUFDLENBQUMsTUFBTSxFQUFFO2dCQUNULE9BQU8sRUFBRSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsMkRBQVMsQ0FBQyxFQUFFLGdFQUFtQixDQUFFO2dCQUN2RCxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxZQUFZLEdBQUcsRUFBRTthQUNwQyxDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVTLFlBQVksQ0FBQyxLQUFhLEVBQUUsWUFBb0I7UUFDekQsTUFBTSxFQUNMLE1BQU0sRUFDTixlQUFlLEdBQUcsS0FBSyxFQUN2QixRQUFRLEdBQUcsS0FBSyxFQUNoQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFcEIsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFFdkQsZ0JBQWdCO1FBQ2hCLElBQUksWUFBWSxHQUFvQyxFQUFFLENBQUM7UUFDdkQsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNyQixZQUFZLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxZQUFZLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDNUYsQ0FBQztRQUVELE1BQU0sQ0FBQyxnRkFBQyxDQUFDLFFBQVEsRUFBRTtZQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLDREQUFVLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxtRUFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0UsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ25CLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxxRUFBcUU7U0FDbEYsRUFBRSxDQUFFLFVBQVUsQ0FBRSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVELE1BQU07UUFDTCxNQUFNLEVBQ0wsSUFBSSxHQUFHLEVBQUUsRUFDVCxRQUFRLEVBQ1IsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQ3pCLE9BQU8sRUFDUCxLQUFLLEVBQ0wsVUFBVSxFQUNWLFdBQVcsRUFDWCxHQUFHLEdBQUcsR0FBRyxFQUNULEdBQUcsR0FBRyxDQUFDLEVBQ1AsSUFBSSxFQUNKLFFBQVEsRUFDUixRQUFRLEVBQ1IsVUFBVSxHQUFHLElBQUksRUFDakIsSUFBSSxHQUFHLENBQUMsRUFDUixRQUFRLEdBQUcsS0FBSyxFQUNoQixjQUFjLEdBQUcsT0FBTyxFQUN4QixLQUFLLEVBQ0wsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsdUZBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUzQyxJQUFJLEVBQ0gsS0FBSyxHQUFHLEdBQUcsRUFDWCxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFcEIsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2xDLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVsQyxNQUFNLFlBQVksR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFFdkQsTUFBTSxNQUFNLEdBQUcsZ0ZBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDdkIsT0FBTyxFQUFFLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxrRUFBZ0IsQ0FBQyxFQUFFLHVFQUEwQixDQUFFO1lBQ3JFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ2xELEVBQUU7WUFDRixnRkFBQyxDQUFDLE9BQU8sa0JBQ1IsR0FBRyxFQUFFLE9BQU8sSUFDVCxrRkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFDN0IsT0FBTyxFQUFFLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQywyREFBUyxDQUFDLEVBQUUsaUVBQW9CLENBQUUsRUFDeEQsUUFBUSxFQUNSLEVBQUUsRUFBRSxRQUFRLEVBQ1osS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQ3ZCLGNBQWMsRUFBRSxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFDaEQsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQ2IsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQ2IsSUFBSTtnQkFDSixRQUFRLEVBQ1IsZUFBZSxFQUFFLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUNsRCxRQUFRLEVBQ1IsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLEVBQ2YsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFDakQsSUFBSSxFQUFFLE9BQU8sRUFDYixLQUFLLEVBQUUsR0FBRyxLQUFLLEVBQUUsRUFDakIsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQ3BCLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFDdEIsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQ3RCLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUN0QixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFDMUIsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUN0QixXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFDOUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQzFCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxFQUNoQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFDNUIsYUFBYSxFQUFFLElBQUksQ0FBQyxjQUFjLElBQ2pDO1lBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7WUFDakMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUMxRCxDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsR0FBRztZQUNoQixLQUFLLENBQUMsQ0FBQyxDQUFDLGdGQUFDLENBQUMsNkRBQUssRUFBRTtnQkFDaEIsS0FBSztnQkFDTCxRQUFRO2dCQUNSLE9BQU8sRUFBRSxLQUFLLENBQUMsYUFBYTtnQkFDNUIsT0FBTztnQkFDUCxRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLEtBQUssRUFBRSxRQUFRO2FBQ2YsRUFBRSxDQUFFLEtBQUssQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDcEIsTUFBTTtTQUNOLENBQUM7UUFFRixNQUFNLENBQUMsZ0ZBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZixHQUFHLEVBQUUsTUFBTTtZQUNYLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSwrREFBa0IsQ0FBQztTQUNuRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxDQUFDO0NBQ0Q7QUFwTlksVUFBVTtJQXZDdEIsZ0dBQUssQ0FBQyxrREFBRyxDQUFDO0lBQ1Ysb0hBQWEsQ0FBbUI7UUFDaEMsR0FBRyxFQUFFLGFBQWE7UUFDbEIsVUFBVSxFQUFFO1lBQ1gsT0FBTztZQUNQLE1BQU07WUFDTixjQUFjO1lBQ2QsVUFBVTtZQUNWLFNBQVM7WUFDVCxVQUFVO1lBQ1YsVUFBVTtZQUNWLFlBQVk7WUFDWixhQUFhO1lBQ2IsS0FBSztZQUNMLEtBQUs7WUFDTCxRQUFRO1lBQ1IsaUJBQWlCO1lBQ2pCLFlBQVk7WUFDWixNQUFNO1lBQ04sVUFBVTtZQUNWLE9BQU87U0FDUDtRQUNELFVBQVUsRUFBRSxDQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixDQUFFO1FBQzdELE1BQU0sRUFBRTtZQUNQLFFBQVE7WUFDUixVQUFVO1lBQ1YsU0FBUztZQUNULFNBQVM7WUFDVCxTQUFTO1lBQ1QsV0FBVztZQUNYLFlBQVk7WUFDWixTQUFTO1lBQ1QsYUFBYTtZQUNiLFdBQVc7WUFDWCxlQUFlO1lBQ2YsWUFBWTtZQUNaLGNBQWM7U0FDZDtLQUNELENBQUM7R0FDVyxVQUFVLENBb050QjtBQXBOc0I7QUFzTlIsWUFBYSxTQUFRLFVBQTRCO0NBQUc7QUFBQTtBQUFBOzs7Ozs7OztBQzdTbkU7QUFDQSxrQkFBa0IsaVI7Ozs7Ozs7QUNEbEIsbUZBQU8sQ0FBQyx5REFBd0Y7QUFDaEc7QUFDQSxJQUFJLElBQTBDO0FBQzlDLENBQUMsaUNBQU8sRUFBRSxrQ0FBRSxhQUFhLG9CQUFvQixFQUFFO0FBQUEsb0dBQUM7QUFDaEQsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsU0FBUztBQUNULENBQUMsSTs7Ozs7OztBQ1REO0FBQ0Esa0JBQWtCLG9FOzs7Ozs7O0FDRGxCLG1GQUFPLENBQUMsZ0RBQStFO0FBQ3ZGO0FBQ0EsSUFBSSxJQUEwQztBQUM5QyxDQUFDLGlDQUFPLEVBQUUsa0NBQUUsYUFBYSxvQkFBb0IsRUFBRTtBQUFBLG9HQUFDO0FBQ2hELENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNELFNBQVM7QUFDVCxDQUFDLEk7Ozs7Ozs7QUNURDtBQUNBLGtCQUFrQiw4aUI7Ozs7Ozs7QUNEbEIsbUZBQU8sQ0FBQyxpREFBZ0Y7QUFDeEY7QUFDQSxJQUFJLElBQTBDO0FBQzlDLENBQUMsaUNBQU8sRUFBRSxrQ0FBRSxhQUFhLG9CQUFvQixFQUFFO0FBQUEsb0dBQUM7QUFDaEQsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsU0FBUztBQUNULENBQUMsSTs7Ozs7OztBQ1REO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFVBQVU7Ozs7Ozs7OztBQ3ZMdEM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQSwrREFBK0Q7QUFDL0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQU0sZ0JBQWdCLHNDQUFzQyxpQkFBaUIsRUFBRTtBQUMvRSxxQkFBcUIsdURBQXVEOztBQUVyRTtBQUNQO0FBQ0EsbUJBQW1CLHNCQUFzQjtBQUN6QztBQUNBOztBQUVPO0FBQ1AsNENBQTRDLE9BQU87QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTRELGNBQWM7QUFDMUU7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBLDRDQUE0QyxRQUFRO0FBQ3BEO0FBQ0E7O0FBRU87QUFDUCxtQ0FBbUMsb0NBQW9DO0FBQ3ZFOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQO0FBQ0EsbUNBQW1DLE1BQU0sNkJBQTZCLEVBQUUsWUFBWSxXQUFXLEVBQUU7QUFDakcsa0NBQWtDLE1BQU0saUNBQWlDLEVBQUUsWUFBWSxXQUFXLEVBQUU7QUFDcEcsK0JBQStCLGlFQUFpRSx1QkFBdUIsRUFBRSw0QkFBNEI7QUFDcko7QUFDQSxLQUFLO0FBQ0w7O0FBRU87QUFDUCxhQUFhLDZCQUE2QiwwQkFBMEIsYUFBYSxFQUFFLHFCQUFxQjtBQUN4RyxnQkFBZ0IscURBQXFELG9FQUFvRSxhQUFhLEVBQUU7QUFDeEosc0JBQXNCLHNCQUFzQixxQkFBcUIsR0FBRztBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkMsa0NBQWtDLFNBQVM7QUFDM0Msa0NBQWtDLFdBQVcsVUFBVTtBQUN2RCx5Q0FBeUMsY0FBYztBQUN2RDtBQUNBLDZHQUE2RyxPQUFPLFVBQVU7QUFDOUgsZ0ZBQWdGLGlCQUFpQixPQUFPO0FBQ3hHLHdEQUF3RCxnQkFBZ0IsUUFBUSxPQUFPO0FBQ3ZGLDhDQUE4QyxnQkFBZ0IsZ0JBQWdCLE9BQU87QUFDckY7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBLFNBQVMsWUFBWSxhQUFhLE9BQU8sRUFBRSxVQUFVLFdBQVc7QUFDaEUsbUNBQW1DLFNBQVM7QUFDNUM7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNLGdCQUFnQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixzQkFBc0I7QUFDdkM7QUFDQTtBQUNBOztBQUVPO0FBQ1AsNEJBQTRCLHNCQUFzQjtBQUNsRDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBLGlCQUFpQixzRkFBc0YsYUFBYSxFQUFFO0FBQ3RILHNCQUFzQixnQ0FBZ0MscUNBQXFDLDBDQUEwQyxFQUFFLEVBQUUsR0FBRztBQUM1SSwyQkFBMkIsTUFBTSxlQUFlLEVBQUUsWUFBWSxvQkFBb0IsRUFBRTtBQUNwRixzQkFBc0Isb0dBQW9HO0FBQzFILDZCQUE2Qix1QkFBdUI7QUFDcEQsNEJBQTRCLHdCQUF3QjtBQUNwRCwyQkFBMkIseURBQXlEO0FBQ3BGOztBQUVPO0FBQ1A7QUFDQSxpQkFBaUIsNENBQTRDLFNBQVMsRUFBRSxxREFBcUQsYUFBYSxFQUFFO0FBQzVJLHlCQUF5QixnQ0FBZ0Msb0JBQW9CLGdEQUFnRCxnQkFBZ0IsR0FBRztBQUNoSjs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1AsZ0NBQWdDLHVDQUF1QyxhQUFhLEVBQUUsRUFBRSxPQUFPLGtCQUFrQjtBQUNqSDtBQUNBOzs7Ozs7OztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxlQUFlLFFBQVEsS0FBSyxNQUFNLGVBQWUsY0FBYywrQkFBK0IsU0FBUyx5QkFBeUIsU0FBUyxhQUFhLHVNQUF1TSxhQUFhLDhHQUE4RyxrQkFBa0IsWUFBWSx1SUFBdUksaUJBQWlCLHVGQUF1Rix5Q0FBeUMsOENBQThDLCtJQUErSSxXQUFXLGlCQUFpQixjQUFjLHVDQUF1QyxXQUFXLEVBQUUsV0FBVyxJQUFJLGdCQUFnQiwyQ0FBMkMsb0JBQW9CLHdDQUF3QyxrQkFBa0IsNkNBQTZDLFNBQVMsUUFBUSxzQ0FBc0MsU0FBUyxRQUFRLDhEQUE4RCxnQkFBZ0IsSUFBSSxFQUFFLHlCQUF5QixzQ0FBc0MsWUFBWSxpQkFBaUIsZ0JBQWdCLG1CQUFtQixpQkFBaUIsVUFBVSxvQkFBb0IsY0FBYyxvR0FBb0csZ0NBQWdDLHdFQUF3RSxTQUFTLGNBQWMsd0JBQXdCLGdCQUFnQixpREFBaUQsZ0JBQWdCLHlCQUF5Qix1QkFBdUIsZ0JBQWdCLGNBQWMscUNBQXFDLGNBQWMsa0VBQWtFLGtCQUFrQixvQkFBb0IsMkJBQTJCLDREQUE0RCxzQkFBc0IsVUFBVSw4Q0FBOEMsa0JBQWtCLDZDQUE2QyxvQkFBb0Isc0JBQXNCLFFBQVEsb0NBQW9DLHdCQUF3QixzQkFBc0Isa0RBQWtELG9CQUFvQiw4REFBOEQsa0JBQWtCLFFBQVEsZ0NBQWdDLFFBQVEsMEVBQTBFLHlCQUF5QixrQkFBa0IseUNBQXlDLHdCQUF3Qix1SkFBdUosNEJBQTRCLGlIQUFpSCxVQUFVLGFBQWEseUJBQXlCLCtSQUErUixvQkFBb0IsMEJBQTBCLGNBQWMsMkJBQTJCLGFBQWEsbUJBQW1CLGlCQUFpQiw4QkFBOEIsZ0JBQWdCLHNCQUFzQixhQUFhLDBCQUEwQixZQUFZLGtCQUFrQix1QkFBdUIsOEhBQThILG9DQUFvQyxzQkFBc0IsNEJBQTRCLGlCQUFpQiw4R0FBOEcsOEJBQThCLGdCQUFnQixzQkFBc0Isa0JBQWtCLCtCQUErQixpQkFBaUIsdUJBQXVCLGVBQWUseURBQXlELGNBQWMsb0JBQW9CLG1CQUFtQiw2RkFBNkYsZ0NBQWdDLGtCQUFrQiwwQkFBMEIsb0JBQW9CLDRKQUE0SiwyS0FBMkssaU5BQWlOLGtCQUFrQixnQkFBZ0IsMkJBQTJCLGNBQWMseUZBQXlGLGtCQUFrQixVQUFVLFdBQVcsTUFBTSxhQUFhLGdCQUFnQix3QkFBd0IsYUFBYSxrQkFBa0IsY0FBYyxTQUFTLDBEQUEwRCxXQUFXLDBCQUEwQix5QkFBeUIsSUFBSSxRQUFRLGdKQUFnSiw0QkFBNEIseUJBQXlCLElBQUksY0FBYyxhQUFhLGVBQWUsK0VBQStFLDhCQUE4QixJQUFJLEtBQUssa0JBQWtCLFlBQVksWUFBWSxNQUFNLGtDQUFrQyxVQUFVLG9CQUFvQix1SEFBdUgsNEJBQTRCLFNBQVMsZ0JBQWdCLFdBQVcsZ0JBQWdCLFlBQVkscUZBQXFGLDhFQUE4RSx3QkFBd0IsbUNBQW1DLHlHQUF5RyxxRUFBcUUsNkNBQTZDLFNBQVMsaUZBQWlGLGtCQUFrQixXQUFXLEtBQUssa0JBQWtCLFlBQVksbUdBQW1HLElBQUksVUFBVSw4QkFBOEIsZ0NBQWdDLFdBQVcsT0FBTyx1dkNBQXV2QyxxRUFBcUUsb0NBQW9DLElBQUksb0ZBQW9GLDJHQUEyRyxhQUFhLHdCQUF3Qiw0QkFBNEIsK0JBQStCLFlBQVkscUNBQXFDLDhDQUE4QyxnQkFBZ0IsU0FBUyxpQ0FBaUMsNENBQTRDLHVLQUF1SyxnQ0FBZ0MsbUJBQW1CLGdGQUFnRixlQUFlLHFDQUFxQyxrREFBa0QsMkhBQTJILHNCQUFzQixhQUFhLGlCQUFpQixjQUFjLFlBQVksS0FBSyxXQUFXLG1FQUFtRSxPQUFPLHFEQUFxRCwyQkFBMkIsZ0JBQWdCLFdBQVcsaURBQWlELDRHQUE0RyxTQUFTLGNBQWMsU0FBUyxrQ0FBa0MsYUFBYSxLQUFLLGtEQUFrRCxzRUFBc0UsZ01BQWdNLEVBQUUsNEJBQTRCLG1DQUFtQyxJQUFJLGlDQUFpQyw0Q0FBNEMscUJBQXFCLGdDQUFnQyxtQ0FBbUMsc0JBQXNCLGlGQUFpRix5Q0FBeUMsRUFBRSw2RUFBNkUsc0JBQXNCLGNBQWMsdUNBQXVDLHVCQUF1QixFQUFFLGtCQUFrQiwrQkFBK0Isa0JBQWtCLFlBQVksV0FBVyxLQUFLLGdCQUFnQixrQkFBa0IsUUFBUSx5TEFBeUwsMkJBQTJCLGNBQWMsS0FBSyw4QkFBOEIsMkJBQTJCLG1CQUFtQixNQUFNLG9DQUFvQyxtQkFBbUIsNkJBQTZCLHlDQUF5QyxhQUFhLEVBQUUsU0FBUyx5QkFBeUIsT0FBTyxtakNBQW1qQywwQkFBMEIsc0JBQXNCLGNBQWMsaURBQWlELDRDQUE0QywrQ0FBK0MsbUNBQW1DLDRFQUE0RSxRQUFRLDZCQUE2Qix1QkFBdUIscUJBQXFCLFVBQVUsOEJBQThCLGFBQWEsMERBQTBELG9CQUFvQix3QkFBd0IsNkJBQTZCLHVCQUF1QiwrQkFBK0IsZ0JBQWdCLCtDQUErQyxTQUFTLHlFQUF5RSxrQkFBa0Isa0JBQWtCLDZEQUE2RCw0REFBNEQsdUJBQXVCLGlCQUFpQixXQUFXLDJCQUEyQixTQUFTLG1EQUFtRCxnQ0FBZ0MsbUJBQW1CLHFCQUFxQixvQkFBb0IsbUJBQW1CLHNCQUFzQixvTkFBb04sd0JBQXdCLGdWQUFnVix3QkFBd0Isd0JBQXdCLHVQQUF1UCxnQ0FBZ0MscUpBQXFKLG1CQUFtQixtRUFBbUUsb0JBQW9CLDhSQUE4UixpQkFBaUIsdUJBQXVCLGtCQUFrQixpTEFBaUwsb0JBQW9CLDBCQUEwQixxQkFBcUIsMEJBQTBCLHVCQUF1QixtTkFBbU4sbUJBQW1CLDhIQUE4SCxzQkFBc0IsbUNBQW1DLGlCQUFpQixvTEFBb0wsb0JBQW9CLDZDQUE2QyxLQUFLLHFKQUFxSix1Q0FBdUMsaUJBQWlCLDRLQUE0SyxrQkFBa0IsdUpBQXVKLG1CQUFtQix5TEFBeUwsbUJBQW1CLDhNQUE4TSxvQkFBb0Isa0NBQWtDLGdDQUFnQyxnRUFBZ0UsbUNBQW1DLGdCQUFnQixzQ0FBc0Msd0NBQXdDLHlCQUF5QixxQkFBcUIsd0JBQXdCLHNHQUFzRyxzQkFBc0Isc0JBQXNCLG1CQUFtQixFQUFFLDJCQUEyQiwyQkFBMkIscUJBQXFCLGdQQUFnUCxrQkFBa0IseUJBQXlCLG9CQUFvQixzQkFBc0IsOEJBQThCLDJCQUEyQix5RUFBeUUsd0JBQXdCLCtCQUErQixtQ0FBbUMsMEJBQTBCLGlEQUFpRCx3QkFBd0Isc0JBQXNCLGNBQWMsUUFBUSwySEFBMkgsUUFBUSxlQUFlLGdCQUFnQiwyQ0FBMkMsYUFBYSw2RkFBNkYsYUFBYSxzQkFBc0IsSUFBSSxhQUFhLGtCQUFrQix3Q0FBd0Msd0JBQXdCLDZCQUE2Qix3SEFBd0gsZ0NBQWdDLHNDQUFzQywyRUFBMkUsYUFBYSw0Q0FBNEMseUNBQXlDLFVBQVUseUNBQXlDLHlDQUF5QyxzQkFBc0IsMkJBQTJCLEVBQUUsRUFBRSxjQUFjLGtCQUFrQiwyQ0FBMkMseUJBQXlCLHVHQUF1Ryx1QkFBdUIscUJBQXFCLGtEQUFrRCxVQUFVLHFDQUFxQyxPQUFPLGdCQUFnQiw0QkFBNEIsd0VBQXdFLCtCQUErQixrQ0FBa0MsUUFBUSxzQkFBc0IsYUFBYSxrQkFBa0IsZ0JBQWdCLGdCQUFnQiwwRUFBMEUsZ0JBQWdCLHVCQUF1QixXQUFXLDBDQUEwQyxrQkFBa0IsaUJBQWlCLGNBQWMsRUFBRSxXQUFXLGtCQUFrQix5REFBeUQsUUFBUSxnQkFBZ0IsZ0JBQWdCLHVDQUF1QyxxQkFBcUIsOENBQThDLHVCQUF1Qix3Q0FBd0MsZ0JBQWdCLGdCQUFnQixLQUFLLGVBQWUsbUJBQW1CLGNBQWMsbUJBQW1CLFdBQVcsMkJBQTJCLGdCQUFnQixtQkFBbUIsb0JBQW9CLGdCQUFnQixpQkFBaUIsV0FBVyxLQUFLLCtCQUErQix1QkFBdUIsbUNBQW1DLGtCQUFrQixzQkFBc0Isa0RBQWtELElBQUksS0FBSyxxQ0FBcUMsYUFBYSx1Q0FBdUMsdUJBQXVCLDBCQUEwQixlQUFlLFVBQVUsZ0JBQWdCLEVBQUUsa0JBQWtCLCtCQUErQixXQUFXLGdDQUFnQyx3QkFBd0IsdUNBQXVDLGlCQUFpQix3Q0FBd0MsWUFBWSxFQUFFLElBQUksdUJBQXVCLGlCQUFpQixXQUFXLGtCQUFrQixTQUFTLEVBQUUsOE1BQThNLGdCQUFnQixjQUFjLGNBQWMsa0NBQWtDLHlCQUF5QixrQ0FBa0MsbUNBQW1DLHdCQUF3QixpQ0FBaUMsT0FBTywrQkFBK0IsOEJBQThCLGlDQUFpQyxjQUFjLGtDQUFrQywyQkFBMkIsZ0JBQWdCLEtBQUssNkRBQTZELGlCQUFpQixLQUFLLEVBQUUsS0FBSyw2REFBNkQsaUJBQWlCLEtBQUssRUFBRSwyQ0FBMkMscUNBQXFDLG1CQUFtQixLQUFLLHdEQUF3RCw2Q0FBNkMscUJBQXFCLHFDQUFxQywyQkFBMkIsdUJBQXVCLG1DQUFtQyxXQUFXLHlCQUF5Qix5QkFBeUIsR0FBRyxvQkFBb0IsY0FBYyxPQUFPLGtDQUFrQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEdBQUcsc0JBQXNCLHVCQUF1QixLQUFLLGdEQUFnRCxvQkFBb0Isc0NBQXNDLDBCQUEwQix5REFBeUQsa0JBQWtCLGNBQWMsd0RBQXdELGtCQUFrQixpQ0FBaUMsY0FBYyx1REFBdUQsZ0JBQWdCLGNBQWMsZ0JBQWdCLDZCQUE2QixnQkFBZ0IsdUJBQXVCLDhCQUE4QixFQUFFLGdCQUFnQixxQkFBcUIsdUJBQXVCLG1CQUFtQixHQUFHLGNBQWMsb0NBQW9DLGlCQUFpQixpQkFBaUIsV0FBVyxLQUFLLGNBQWMscUJBQXFCLFVBQVUsVUFBVSxnQkFBZ0IsNkNBQTZDLDBCQUEwQixFQUFFLGdCQUFnQix1QkFBdUIsaWFBQWlhLGtCQUFrQixnQkFBZ0IscURBQXFELCtCQUErQixFQUFFLGdEQUFnRCxrQkFBa0IsY0FBYyw0Q0FBNEMsa0JBQWtCLG9EQUFvRCxvQkFBb0IsbUNBQW1DLHFCQUFxQixlQUFlLGdDQUFnQyxnQkFBZ0IsdUJBQXVCLGNBQWMsbUNBQW1DLG9CQUFvQixJQUFJLGtDQUFrQyx3RUFBd0UsRUFBRSx3RUFBd0UsbUJBQW1CLHlCQUF5QixrVEFBa1Qsa0JBQWtCLGNBQWMsYUFBYSxnQkFBZ0IsZ0JBQWdCLGFBQWEsZ0JBQWdCLGFBQWEsYUFBYSxzQkFBc0IsSUFBSSxVQUFVLDBCQUEwQixhQUFhLGNBQWMsaUJBQWlCLEVBQUUsUUFBUSxJQUFJLFVBQVUsa0JBQWtCLFNBQVMsYUFBYSxjQUFjLGlCQUFpQixFQUFFLFFBQVEsSUFBSSxVQUFVLGtCQUFrQixTQUFTLG9DQUFvQyxlQUFlLGdCQUFnQiw2REFBNkQsTUFBTSw0QkFBNEIsMkJBQTJCLFNBQVMsMEJBQTBCLHVCQUF1QixFQUFFLHdOQUF3TixXQUFXLCtDQUErQyxXQUFXLGdCQUFnQiw2RUFBNkUsdUJBQXVCLE9BQU8sV0FBVyxnQkFBZ0IsaUJBQWlCLGtCQUFrQixXQUFXLHFCQUFxQixxQ0FBcUMsMkJBQTJCLGVBQWUsc0JBQXNCLGVBQWUsbUJBQW1CLDBCQUEwQixrRUFBa0UsY0FBYyxrQ0FBa0MsRUFBRSxrS0FBa0sseUlBQXlJLHlIQUF5SCx3QkFBd0Isa0JBQWtCLFdBQVcsMkJBQTJCLHVGQUF1Riw2dUJBQTZ1QixrQkFBa0IsY0FBYyw4REFBOEQsY0FBYyw2TEFBNkwsaUNBQWlDLGdCQUFnQiw4Q0FBOEMsWUFBWSwwQkFBMEIsNkJBQTZCLGtCQUFrQix5QkFBeUIsY0FBYyxvQkFBb0IsdURBQXVELGlFQUFpRSxrQkFBa0IsY0FBYyxtQkFBbUIsUUFBUSx5QkFBeUIsc0JBQXNCLEdBQUcsY0FBYyxTQUFTLGNBQWMsK0NBQStDLDRDQUE0QyxZQUFZLEVBQUUscUJBQXFCLHNCQUFzQixrQkFBa0IsYUFBYSw2QkFBNkIsNEJBQTRCLGlCQUFpQixXQUFXLEtBQUssb0JBQW9CLGtCQUFrQixjQUFjLHNDQUFzQywwREFBMEQsc0JBQXNCLGVBQWUsWUFBWSxVQUFVLFdBQVcsUUFBUSxrQ0FBa0MsY0FBYywwQ0FBMEMsZ0JBQWdCLDRCQUE0QixzQkFBc0IsbUNBQW1DLDRCQUE0QixzQkFBc0IsbUNBQW1DLHFEQUFxRCx1QkFBdUIsOENBQThDLG1DQUFtQywrREFBK0QsR0FBRyxjQUFjLDRCQUE0QixjQUFjLHNDQUFzQyxnQkFBZ0IseUNBQXlDLHlCQUF5QiwwQkFBMEIsWUFBWSxXQUFXLEtBQUssbURBQW1ELFFBQVEsd0JBQXdCLCtCQUErQixTQUFTLHNCQUFzQixTQUFTLEVBQUUsR0FBRyxvQkFBb0IscUdBQXFHLGdCQUFnQix1QkFBdUIsYUFBYSxhQUFhLHdDQUF3QyxpQkFBaUIsV0FBVyxLQUFLLHdEQUF3RCxXQUFXLGFBQWEsdUJBQXVCLG9EQUFvRCxLQUFLLFlBQVksMERBQTBELEtBQUssNkJBQTZCLGFBQWEsYUFBYSx3Q0FBd0MsTUFBTSwyQkFBMkIsMkJBQTJCLFdBQVcsS0FBSyw0RUFBNEUsaUNBQWlDLG1DQUFtQyxNQUFNLFFBQVEsUUFBUSx1QkFBdUIsMkJBQTJCLDBCQUEwQixxQkFBcUIsWUFBWSx5RkFBeUYsWUFBWSxFQUFFLGNBQWMsS0FBSyxJQUFJLE1BQU0sSUFBSSx5aEJBQXloQiw2RUFBNkUsb0NBQW9DLDJGQUEyRixrQkFBa0IsZ0JBQWdCLGtDQUFrQyxxREFBcUQsRUFBRSxRQUFRLE1BQU0scU5BQXFOLGVBQWUsc0NBQXNDLGdCQUFnQixJQUFJLGNBQWMsZ0VBQWdFLE1BQU0sd0RBQXdELDBCQUEwQixzQkFBc0IsbUJBQW1CLHNCQUFzQixtTkFBbU4sb0NBQW9DLCtDQUErQyx1QkFBdUIscUNBQXFDLGVBQWUsb0JBQW9CLGFBQWEsMkZBQTJGLHNCQUFzQixzQkFBc0IsbUJBQW1CLEVBQUUsS0FBSyx5QkFBeUIsaUNBQWlDLGlGQUFpRiw0QkFBNEIsMkNBQTJDLGdCQUFnQixzQ0FBc0MsdUNBQXVDLHNCQUFzQixLQUFLLGVBQWUsMkNBQTJDLElBQUksdUVBQXVFLGFBQWEsY0FBYyxFQUFFLFdBQVcsdUVBQXVFLFVBQVUsUUFBUSxjQUFjLE9BQU8sdUNBQXVDLCtDQUErQyw4S0FBOEssb0JBQW9CLGNBQWMsaUJBQWlCLDZGQUE2RixtQ0FBbUMseUNBQXlDLHFCQUFxQixtRkFBbUYsRUFBRSxnQ0FBZ0MsNENBQTRDLGdDQUFnQyx5QkFBeUIsMERBQTBELHNDQUFzQyxxRUFBcUUsMkJBQTJCLEVBQUUsK0JBQStCLHNGQUFzRixtREFBbUQsRUFBRSxtQkFBbUIsOEJBQThCLCtIQUErSCxrQkFBa0IscUNBQXFDLFNBQVMsMENBQTBDLG9DQUFvQyw4QkFBOEIsYUFBYSxJQUFJLGtEQUFrRCwrQkFBK0IsVUFBVSxFQUFFLFVBQVUsSUFBSSwyQkFBMkIsV0FBVyxzQkFBc0Isc0RBQXNELGlKQUFpSiwwUkFBMFIsd0JBQXdCLDJCQUEyQiwwQ0FBMEMsc2NBQXNjLHdDQUF3Qyx1QkFBdUIsZ0NBQWdDLCt2QkFBK3ZCLDRCQUE0Qix3Q0FBd0MsZ0NBQWdDLDBDQUEwQyw2R0FBNkcsY0FBYyxtQ0FBbUMsMENBQTBDLDhCQUE4QiwyRkFBMkYsc0NBQXNDLCtCQUErQixnQ0FBZ0MsdUVBQXVFLDBCQUEwQixpT0FBaU8sY0FBYyxnQ0FBZ0MsNEtBQTRLLGdCQUFnQixzQkFBc0IsaUJBQWlCLHdEQUF3RCxnQkFBZ0IsK0tBQStLLHdDQUF3QyxRQUFRLHdDQUF3QyxHQUFHLDhDQUE4QyxHQUFHLGlMQUFpTCxhQUFhLHlLQUF5SyxxQ0FBcUMsUUFBUSxxQ0FBcUMsR0FBRyw4Q0FBOEMsR0FBRywyS0FBMkssZ0JBQWdCLGdDQUFnQyxpQkFBaUIsMERBQTBELDZCQUE2QixjQUFjLGdCQUFnQixnQ0FBZ0MsaUJBQWlCLDBEQUEwRCw2QkFBNkIsY0FBYyxtQkFBbUIsdUJBQXVCLGtDQUFrQyxnQ0FBZ0Msb0JBQW9CLGlKQUFpSixrQkFBa0IseUJBQXlCLGlCQUFpQixpQ0FBaUMsa0JBQWtCLCtJQUErSSxnQkFBZ0IseUJBQXlCLG9CQUFvQixvQ0FBb0MscUJBQXFCLHVCQUF1Qix1QkFBdUIsOERBQThELGlCQUFpQix3REFBd0QsaUJBQWlCLHlOQUF5TixvQkFBb0IseUJBQXlCLHlCQUF5QixrQkFBa0IsbUpBQW1KLFVBQVUseUNBQXlDLG1CQUFtQix3RkFBd0YsbUJBQW1CLHNIQUFzSCxvQkFBb0IsdUJBQXVCLHVCQUF1Qix5REFBeUQsWUFBWSx3REFBd0QsZ0NBQWdDLFFBQVEscUNBQXFDLDZCQUE2QixnRUFBZ0UsbUNBQW1DLHdEQUF3RCxtQ0FBbUMsS0FBSyw2QkFBNkIsc0NBQXNDLDJCQUEyQixRQUFRLDhKQUE4Siw0RkFBNEYsd0NBQXdDLDZDQUE2QyxrSUFBa0ksOEJBQThCLHNCQUFzQixjQUFjLHFDQUFxQyxhQUFhLGFBQWEsU0FBUyxrQ0FBa0MsU0FBUyxrQkFBa0IsdUdBQXVHLG9CQUFvQixzQkFBc0IsMEJBQTBCLGlCQUFpQixXQUFXLEtBQUssV0FBVyxzV0FBc1csUUFBUSxXQUFXLG9CQUFvQixvQ0FBb0MsOGRBQThkLDZCQUE2QixxQkFBcUIsK0dBQStHLGlCQUFpQiw2SEFBNkgsZ0ZBQWdGLGNBQWMsb0JBQW9CLGtCQUFrQixtR0FBbUcsd0ZBQXdGLHVGQUF1RixtQkFBbUIsd0JBQXdCLGdDQUFnQyx3Q0FBd0MsU0FBUyw2RUFBNkUscUVBQXFFLHNEQUFzRCxNQUFNLGlDQUFpQyw2QkFBNkIscUJBQXFCLFdBQVcsc0JBQXNCLHdCQUF3Qiw4Q0FBOEMsK0ZBQStGLFNBQVMsNkJBQTZCLG1GQUFtRiw4QkFBOEIsaURBQWlELCtDQUErQyx1Q0FBdUMsOEJBQThCLGtGQUFrRiwyRkFBMkYsNERBQTRELDhDQUE4QyxjQUFjLHNCQUFzQixjQUFjLCtFQUErRSxjQUFjLFFBQVEsMEJBQTBCLDJDQUEyQyx5QkFBeUIsSUFBSSxpREFBaUQsbUVBQW1FLGtFQUFrRSx5RUFBeUUsMkNBQTJDLGtFQUFrRSw0Q0FBNEMsNkJBQTZCLDRCQUE0QixpQkFBaUIsaURBQWlELGtLQUFrSywwRUFBMEUsY0FBYywyQ0FBMkMsbUNBQW1DLHNCQUFzQixjQUFjLDJEQUEyRCxrQkFBa0IsdVVBQXVVLGlDQUFpQyx3QkFBd0IsK0JBQStCLHdCQUF3QixjQUFjLHdCQUF3QixlQUFlLFNBQVMsRUFBRSxpQkFBaUIsWUFBWSxTQUFTLHFCQUFxQixlQUFlLEVBQUUsK0VBQStFLCtEQUErRCx1QkFBdUIsaUJBQWlCLFlBQVksV0FBVyxzQkFBc0IseUJBQXlCLHlGQUF5RixXQUFXLG9DQUFvQyxnRkFBZ0YsWUFBWSxXQUFXLDJEQUEyRCxrQ0FBa0MsbUJBQW1CLDZCQUE2QixvQkFBb0IsNkJBQTZCLGNBQWMsb0JBQW9CLGtCQUFrQixrREFBa0QsaUJBQWlCLHVFQUF1RSxrQkFBa0IseURBQXlELHVCQUF1QixxQ0FBcUMsZ0ZBQWdGLG1CQUFtQix1QkFBdUIsb0lBQW9JLGVBQWUsUUFBUSx5Q0FBeUMsUUFBUSxpQkFBaUIsK0hBQStILGVBQWUsUUFBUSx5Q0FBeUMsbUJBQW1CLEtBQUssK0NBQStDLDJCQUEyQixpQkFBaUIsZ1JBQWdSLGlCQUFpQiwwQ0FBMEMsK0NBQStDLDBDQUEwQyxxQ0FBcUMsbUhBQW1ILHdCQUF3QixlQUFlLEdBQUcsWUFBWSxZQUFZO0FBQ2h4aEQsd0Q7Ozs7Ozs7QUNmQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7Ozs7QUNwQkEseUM7Ozs7Ozs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUF3RDtBQUNBO0FBQ047QUFDYjtBQUVMO0FBRWhDLE1BQU0sQ0FBQyxHQUFHLHlGQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsZ0ZBQUMsQ0FBQyw2REFBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDOzs7Ozs7Ozs7QUNSVjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQXFEO0FBQ1c7QUFFcEM7QUFDQTtBQUNjO0FBQ0Y7QUFDRTtBQUUzQixNQUFNLEdBQUksU0FBUSx1RkFBVTtJQUEzQzs7UUFDUyxjQUFTLEdBQUcsSUFBSSw2REFBUyxFQUFFLENBQUM7UUFDNUIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixpQkFBWSxHQUFHLENBQUMsQ0FBQztRQUNqQixZQUFPLEdBQUcsS0FBSyxDQUFDO0lBdUR6QixDQUFDO0lBckRRLGNBQWMsQ0FBQyxNQUFjO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRU8sYUFBYTtRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1lBQ3hELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRU8sY0FBYyxDQUFDLEtBQWE7UUFDbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFUyxNQUFNO1FBRWYsTUFBTSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRS9DLE9BQU8sZ0ZBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsdURBQVEsRUFBRSxFQUFFO1lBQ3RDLGdGQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLHlEQUFVLEVBQUUsRUFBRTtnQkFDcEMsZ0ZBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUseURBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFO3dCQUNoRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixDQUFDLEVBQUMsRUFBRSxDQUFFLE1BQU0sQ0FBRSxDQUFDO2dCQUNmLGdGQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixnRkFBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSx5REFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7d0JBQ2hELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzVCLENBQUMsRUFBQyxFQUFFLENBQUUsTUFBTSxDQUFFLENBQUM7YUFDZixDQUFDO1lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0ZBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsMkRBQVksRUFBRSxFQUFFO2dCQUNqRCxnRkFBQyxDQUFDLHFFQUFNLEVBQUU7b0JBQ1QsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLHlEQUFVLEVBQUU7b0JBQ2xDLEtBQUssRUFBRSxzQkFBc0IsTUFBTSxFQUFFO29CQUNyQyxLQUFLLEVBQUUsWUFBWTtvQkFDbkIsR0FBRyxFQUFFLEdBQUc7b0JBQ1IsR0FBRyxFQUFFLENBQUM7b0JBQ04sSUFBSSxFQUFFLEdBQUc7b0JBQ1QsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjO2lCQUM3QixDQUFDO2dCQUNGLGdGQUFDLENBQUMsUUFBUSxFQUFFO29CQUNYLE9BQU8sRUFBRSx5REFBVTtvQkFDbkIsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhO29CQUMzQixRQUFRLEVBQUUsT0FBTztpQkFDakIsRUFBRSxDQUFFLE9BQU8sQ0FBRSxDQUFDO2FBQ2YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ2QsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdGQUFDLENBQUMsaURBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzVFLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxnRkFBQyxDQUFDLGlEQUFHLEVBQUUsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztTQUM1RSxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFBQTtBQUFBOzs7Ozs7Ozs7QUNwRUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQW9FO0FBQzFCO0FBQ1E7QUFDdUI7QUFDTDtBQUVwRSxNQUFNLElBQUksR0FBRyxtQkFBTyxDQUFDLG1DQUF1QixDQUFDLENBQUM7QUFDOUMsTUFBTSxJQUFJLEdBQUcsbUJBQU8sQ0FBQyxtQ0FBdUIsQ0FBQyxDQUFDO0FBQzlDLE1BQU0sSUFBSSxHQUFHLG1CQUFPLENBQUMsbUNBQXVCLENBQUMsQ0FBQztBQU12QyxNQUFNLEdBQUksU0FBUSxrR0FBVyxDQUFDLDBGQUFVLENBQWdCO0lBRXRELGlCQUFpQixDQUFDLGNBQXNCO1FBQy9DLE9BQU87WUFDTixFQUFFLEVBQUUsVUFBVTtZQUNkLE9BQU8sRUFBRTtnQkFDUixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7Z0JBQ3ZCLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtnQkFDdkIsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO2FBQ2hCO1lBQ1IsTUFBTSxFQUFFO2dCQUNQLFFBQVEsRUFBRSxHQUFHO2dCQUNiLFVBQVUsRUFBRSxRQUFRO2FBQ3BCO1lBQ0QsUUFBUSxFQUFFO2dCQUNULElBQUksRUFBRSxJQUFJO2dCQUNWLFlBQVksRUFBRSxjQUFjO2FBQzVCO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxjQUFzQjtRQUMvQyxPQUFPO1lBQ04sRUFBRSxFQUFFLFVBQVU7WUFDZCxPQUFPLEVBQUU7Z0JBQ1IsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFO2dCQUM3QixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRTtnQkFDL0IsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFO2FBQzdCO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFVBQVUsRUFBRSxRQUFRO2FBQ3BCO1lBQ0QsUUFBUSxFQUFFO2dCQUNULElBQUksRUFBRSxJQUFJO2dCQUNWLFlBQVksRUFBRSxjQUFjO2FBQzVCO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFUyxNQUFNO1FBQ2YsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFM0MsSUFBSSxDQUFDLElBQUksQ0FBQyw4RkFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMsSUFBSSxDQUFDLDhGQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBRXBGLE9BQU8sZ0ZBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsdURBQVEsRUFBRSxFQUFFO1lBQ3RDLGdGQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSx1REFBUSxFQUFFLENBQUM7WUFDM0QsZ0ZBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLHVEQUFRLEVBQUUsQ0FBQztZQUMzRCxnRkFBQyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsdURBQVEsRUFBRSxDQUFDO1NBQzNELENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQUFBO0FBQUE7Ozs7Ozs7Ozs7O0FDbEVELE1BQU0sYUFBWSxFQUFVLE1BQU8sQ0FBQyxhQUFZLEdBQVcsTUFBTyxDQUFDLGtCQUFrQixFQUFFO0FBRWpGLE1BQU8sVUFBUztJQUF0QjtRQUdTLGNBQVEsRUFBRyxJQUFJLEdBQUcsRUFBdUI7SUFpRGxEO0lBL0NPLElBQUksQ0FBQyxLQUFhLEVBQUUsS0FBYSxFQUFFLE1BQWtCOztZQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsSUFBSSxDQUFDLFFBQU8sRUFBRyxJQUFJLFlBQVksRUFBRTs7WUFHbEM7WUFDQSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBSyxJQUFLLFdBQVcsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7O1lBR3RCLE1BQU0sT0FBTSxFQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUU7WUFDaEQsTUFBTSxDQUFDLE9BQU0sRUFBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDeEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFLLEVBQUcsS0FBSztZQUNqQyxNQUFNLENBQUMsS0FBSSxFQUFHLElBQUk7WUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUV0QyxVQUFVLENBQUMsR0FBRyxHQUFFO2dCQUNmLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQ2IsTUFBTSxFQUFFO1lBQ1QsQ0FBQyxFQUFFLElBQUksQ0FBQztZQUVSLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7O0lBRWEsVUFBVSxDQUFDLEtBQWE7O1lBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFOztZQUdqQyxNQUFNLE9BQU0sRUFBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7WUFDaEMsT0FBTyxNQUFNO1FBQ2QsQ0FBQzs7SUFFYSxTQUFTLENBQUMsS0FBYTs7WUFDcEMsTUFBTSxPQUFNLEVBQUcsTUFBTSxLQUFLLENBQUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDO1lBQ3hELE1BQU0sVUFBUyxFQUFHLE1BQU0sTUFBTSxDQUFDLFdBQVcsRUFBRTtZQUM1QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU0sSUFBSyxDQUFDLEVBQUU7Z0JBQzlDLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7O2lCQUVoRDtnQkFDSixPQUFPLE1BQU0sSUFBSSxPQUFPLENBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUU7b0JBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO2dCQUN6RCxDQUFDLENBQUM7O1FBRUosQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JENkU7QUFDWDtBQUMxQjtBQUNRO0FBQ3VCO0FBRXpFLE1BQU0sSUFBSSxHQUFHLG1CQUFPLENBQUMsbUNBQXVCLENBQUMsQ0FBQztBQUM5QyxNQUFNLElBQUksR0FBRyxtQkFBTyxDQUFDLG1DQUF1QixDQUFDLENBQUM7QUFDOUMsTUFBTSxJQUFJLEdBQUcsbUJBQU8sQ0FBQyxtQ0FBdUIsQ0FBQyxDQUFDO0FBTzlDLElBQWEsR0FBRyxHQUFoQixNQUFhLEdBQUksU0FBUSxzR0FBVyxDQUFDLDBGQUFVLENBQWdCO0lBRXRELGlCQUFpQixDQUFDLGNBQXNCO1FBQy9DLE9BQU87WUFDTixFQUFFLEVBQUUsVUFBVTtZQUNkLE9BQU8sRUFBRTtnQkFDUixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7Z0JBQ3ZCLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtnQkFDdkIsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO2FBQ2hCO1lBQ1IsTUFBTSxFQUFFO2dCQUNQLFFBQVEsRUFBRSxHQUFHO2dCQUNiLFVBQVUsRUFBRSxRQUFRO2FBQ3BCO1lBQ0QsUUFBUSxFQUFFO2dCQUNULElBQUksRUFBRSxJQUFJO2dCQUNWLFlBQVksRUFBRSxjQUFjO2FBQzVCO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxjQUFzQjtRQUMvQyxPQUFPO1lBQ04sRUFBRSxFQUFFLFVBQVU7WUFDZCxPQUFPLEVBQUU7Z0JBQ1IsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFO2dCQUM5QixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRTtnQkFDL0IsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFO2FBQzlCO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFVBQVUsRUFBRSxRQUFRO2FBQ3BCO1lBQ0QsUUFBUSxFQUFFO2dCQUNULElBQUksRUFBRSxJQUFJO2dCQUNWLFlBQVksRUFBRSxjQUFjO2FBQzVCO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFUyxNQUFNO1FBQ2YsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFM0MsSUFBSSxDQUFDLElBQUksQ0FBQyw4RkFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMsSUFBSSxDQUFDLDhGQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBRXBGLE9BQU8sZ0ZBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsdURBQVEsRUFBRSxFQUFFO1lBQ3RDLGdGQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSx1REFBUSxFQUFFLENBQUM7WUFDM0QsZ0ZBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLHVEQUFRLEVBQUUsQ0FBQztZQUMzRCxnRkFBQyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsdURBQVEsRUFBRSxDQUFDO1NBQzNELENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQXBEWSxHQUFHO0lBRGYsZ0dBQUssQ0FBQywrQ0FBRyxDQUFDO0dBQ0UsR0FBRyxDQW9EZjtBQXBEZTs7Ozs7Ozs7QUNmaEIsaUJBQWlCLHFCQUF1QiwyQjs7Ozs7OztBQ0F4QyxpQkFBaUIscUJBQXVCLDJCOzs7Ozs7O0FDQXhDLGlCQUFpQixxQkFBdUIsMkI7Ozs7Ozs7QUNBeEMsaUJBQWlCLHFCQUF1QiwyQjs7Ozs7OztBQ0F4QyxpQkFBaUIscUJBQXVCLDJCOzs7Ozs7O0FDQXhDLGlCQUFpQixxQkFBdUIsMkI7Ozs7Ozs7QUNBeEM7QUFDQSxrQkFBa0IsMEw7Ozs7Ozs7QUNEbEI7QUFDQSxrQkFBa0IsMEk7Ozs7Ozs7QUNEbEI7QUFDQSxrQkFBa0IsMEkiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwiY2F0c3ZzZG9nc1wiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJjYXRzdnNkb2dzXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImNhdHN2c2RvZ3NcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vc2hpbS9Qcm9taXNlJztcblxuLyoqXG4gKiBVc2VkIHRocm91Z2ggdGhlIHRvb2xraXQgYXMgYSBjb25zaXN0ZW50IEFQSSB0byBtYW5hZ2UgaG93IGNhbGxlcnMgY2FuIFwiY2xlYW51cFwiXG4gKiB3aGVuIGRvaW5nIGEgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFuZGxlIHtcblx0LyoqXG5cdCAqIFBlcmZvcm0gdGhlIGRlc3RydWN0aW9uL2NsZWFudXAgbG9naWMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgSGFuZGxlXG5cdCAqL1xuXHRkZXN0cm95KCk6IHZvaWQ7XG59XG5cbi8qKlxuICogTm8gb3AgZnVuY3Rpb24gdXNlZCB0byByZXBsYWNlIGEgRGVzdHJveWFibGUgaW5zdGFuY2UncyBgZGVzdHJveWAgbWV0aG9kLCBvbmNlIHRoZSBpbnN0YW5jZSBoYXMgYmVlbiBkZXN0cm95ZWRcbiAqL1xuZnVuY3Rpb24gbm9vcCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG59XG5cbi8qKlxuICogTm8gb3AgZnVuY3Rpb24gdXNlZCB0byByZXBsYWNlIGEgRGVzdHJveWFibGUgaW5zdGFuY2UncyBgb3duYCBtZXRob2QsIG9uY2UgdGhlIGluc3RhbmNlIGhhcyBiZWVuIGRlc3Ryb3llZFxuICovXG5mdW5jdGlvbiBkZXN0cm95ZWQoKTogbmV2ZXIge1xuXHR0aHJvdyBuZXcgRXJyb3IoJ0NhbGwgbWFkZSB0byBkZXN0cm95ZWQgbWV0aG9kJyk7XG59XG5cbmV4cG9ydCBjbGFzcyBEZXN0cm95YWJsZSB7XG5cdC8qKlxuXHQgKiBUaGUgaW5zdGFuY2UncyBoYW5kbGVzXG5cdCAqL1xuXHRwcml2YXRlIGhhbmRsZXM6IEhhbmRsZVtdO1xuXG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuaGFuZGxlcyA9IFtdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXMgZm9yIHRoZSBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgZGVzdHJveWVkIHdoZW4gYHRoaXMuZGVzdHJveWAgaXMgY2FsbGVkXG5cdCAqXG5cdCAqIEBwYXJhbSB7SGFuZGxlfSBoYW5kbGUgVGhlIGhhbmRsZSB0byBhZGQgZm9yIHRoZSBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyB7SGFuZGxlfSBBIHdyYXBwZXIgSGFuZGxlLiBXaGVuIHRoZSB3cmFwcGVyIEhhbmRsZSdzIGBkZXN0cm95YCBtZXRob2QgaXMgaW52b2tlZCwgdGhlIG9yaWdpbmFsIGhhbmRsZSBpc1xuXHQgKiAgICAgICAgICAgICAgICAgICByZW1vdmVkIGZyb20gdGhlIGluc3RhbmNlLCBhbmQgaXRzIGBkZXN0cm95YCBtZXRob2QgaXMgaW52b2tlZC5cblx0ICovXG5cdG93bihoYW5kbGU6IEhhbmRsZSk6IEhhbmRsZSB7XG5cdFx0Y29uc3QgeyBoYW5kbGVzOiBfaGFuZGxlcyB9ID0gdGhpcztcblx0XHRfaGFuZGxlcy5wdXNoKGhhbmRsZSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRlc3Ryb3koKSB7XG5cdFx0XHRcdF9oYW5kbGVzLnNwbGljZShfaGFuZGxlcy5pbmRleE9mKGhhbmRsZSkpO1xuXHRcdFx0XHRoYW5kbGUuZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveXMgYWxsIGhhbmRsZXJzIHJlZ2lzdGVyZWQgZm9yIHRoZSBpbnN0YW5jZVxuXHQgKlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnl9IEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uY2UgYWxsIGhhbmRsZXMgaGF2ZSBiZWVuIGRlc3Ryb3llZFxuXHQgKi9cblx0ZGVzdHJveSgpOiBQcm9taXNlPGFueT4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGhpcy5oYW5kbGVzLmZvckVhY2goKGhhbmRsZSkgPT4ge1xuXHRcdFx0XHRoYW5kbGUgJiYgaGFuZGxlLmRlc3Ryb3kgJiYgaGFuZGxlLmRlc3Ryb3koKTtcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5kZXN0cm95ID0gbm9vcDtcblx0XHRcdHRoaXMub3duID0gZGVzdHJveWVkO1xuXHRcdFx0cmVzb2x2ZSh0cnVlKTtcblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBEZXN0cm95YWJsZTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBEZXN0cm95YWJsZS50cyIsImltcG9ydCBNYXAgZnJvbSAnLi4vc2hpbS9NYXAnO1xuaW1wb3J0IHsgRGVzdHJveWFibGUsIEhhbmRsZSB9IGZyb20gJy4vRGVzdHJveWFibGUnO1xuXG4vKipcbiAqIE1hcCBvZiBjb21wdXRlZCByZWd1bGFyIGV4cHJlc3Npb25zLCBrZXllZCBieSBzdHJpbmdcbiAqL1xuY29uc3QgcmVnZXhNYXAgPSBuZXcgTWFwPHN0cmluZywgUmVnRXhwPigpO1xuXG5leHBvcnQgdHlwZSBFdmVudFR5cGUgPSBzdHJpbmcgfCBzeW1ib2w7XG5cbi8qKlxuICogVGhlIGJhc2UgZXZlbnQgb2JqZWN0LCB3aGljaCBwcm92aWRlcyBhIGB0eXBlYCBwcm9wZXJ0eVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50T2JqZWN0PFQgPSBFdmVudFR5cGU+IHtcblx0LyoqXG5cdCAqIFRoZSB0eXBlIG9mIHRoZSBldmVudFxuXHQgKi9cblx0cmVhZG9ubHkgdHlwZTogVDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBldmVudCB0eXBlIGdsb2IgaGFzIGJlZW4gbWF0Y2hlZFxuICpcbiAqIEByZXR1cm5zIGJvb2xlYW4gdGhhdCBpbmRpY2F0ZXMgaWYgdGhlIGdsb2IgaXMgbWF0Y2hlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNHbG9iTWF0Y2goZ2xvYlN0cmluZzogc3RyaW5nIHwgc3ltYm9sLCB0YXJnZXRTdHJpbmc6IHN0cmluZyB8IHN5bWJvbCk6IGJvb2xlYW4ge1xuXHRpZiAodHlwZW9mIHRhcmdldFN0cmluZyA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGdsb2JTdHJpbmcgPT09ICdzdHJpbmcnICYmIGdsb2JTdHJpbmcuaW5kZXhPZignKicpICE9PSAtMSkge1xuXHRcdGxldCByZWdleDogUmVnRXhwO1xuXHRcdGlmIChyZWdleE1hcC5oYXMoZ2xvYlN0cmluZykpIHtcblx0XHRcdHJlZ2V4ID0gcmVnZXhNYXAuZ2V0KGdsb2JTdHJpbmcpITtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVnZXggPSBuZXcgUmVnRXhwKGBeJHtnbG9iU3RyaW5nLnJlcGxhY2UoL1xcKi9nLCAnLionKX0kYCk7XG5cdFx0XHRyZWdleE1hcC5zZXQoZ2xvYlN0cmluZywgcmVnZXgpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVnZXgudGVzdCh0YXJnZXRTdHJpbmcpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBnbG9iU3RyaW5nID09PSB0YXJnZXRTdHJpbmc7XG5cdH1cbn1cblxuZXhwb3J0IHR5cGUgRXZlbnRlZENhbGxiYWNrPFQgPSBFdmVudFR5cGUsIEUgZXh0ZW5kcyBFdmVudE9iamVjdDxUPiA9IEV2ZW50T2JqZWN0PFQ+PiA9IHtcblx0LyoqXG5cdCAqIEEgY2FsbGJhY2sgdGhhdCB0YWtlcyBhbiBgZXZlbnRgIGFyZ3VtZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgb2JqZWN0XG5cdCAqL1xuXG5cdChldmVudDogRSk6IGJvb2xlYW4gfCB2b2lkO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDdXN0b21FdmVudFR5cGVzPFQgZXh0ZW5kcyBFdmVudE9iamVjdDxhbnk+ID0gRXZlbnRPYmplY3Q8YW55Pj4ge1xuXHRbaW5kZXg6IHN0cmluZ106IFQ7XG59XG5cbi8qKlxuICogQSB0eXBlIHdoaWNoIGlzIGVpdGhlciBhIHRhcmdldGVkIGV2ZW50IGxpc3RlbmVyIG9yIGFuIGFycmF5IG9mIGxpc3RlbmVyc1xuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgb2YgdGFyZ2V0IGZvciB0aGUgZXZlbnRzXG4gKiBAdGVtcGxhdGUgRSBUaGUgZXZlbnQgdHlwZSBmb3IgdGhlIGV2ZW50c1xuICovXG5leHBvcnQgdHlwZSBFdmVudGVkQ2FsbGJhY2tPckFycmF5PFQgPSBFdmVudFR5cGUsIEUgZXh0ZW5kcyBFdmVudE9iamVjdDxUPiA9IEV2ZW50T2JqZWN0PFQ+PiA9XG5cdHwgRXZlbnRlZENhbGxiYWNrPFQsIEU+XG5cdHwgRXZlbnRlZENhbGxiYWNrPFQsIEU+W107XG5cbi8qKlxuICogRXZlbnQgQ2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50ZWQ8XG5cdE0gZXh0ZW5kcyBDdXN0b21FdmVudFR5cGVzID0ge30sXG5cdFQgPSBFdmVudFR5cGUsXG5cdE8gZXh0ZW5kcyBFdmVudE9iamVjdDxUPiA9IEV2ZW50T2JqZWN0PFQ+XG4+IGV4dGVuZHMgRGVzdHJveWFibGUge1xuXHQvLyBUaGUgZm9sbG93aW5nIG1lbWJlciBpcyBwdXJlbHkgc28gVHlwZVNjcmlwdCByZW1lbWJlcnMgdGhlIHR5cGUgb2YgYE1gIHdoZW4gZXh0ZW5kaW5nIHNvXG5cdC8vIHRoYXQgdGhlIHV0aWxpdGllcyBpbiBgb24udHNgIHdpbGwgd29yayBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzIwMzQ4XG5cdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxuXHRwcm90ZWN0ZWQgX190eXBlTWFwX18/OiBNO1xuXHQvKipcblx0ICogbWFwIG9mIGxpc3RlbmVycyBrZXllZCBieSBldmVudCB0eXBlXG5cdCAqL1xuXHRwcm90ZWN0ZWQgbGlzdGVuZXJzTWFwOiBNYXA8VCB8IGtleW9mIE0sIEV2ZW50ZWRDYWxsYmFjazxULCBPPltdPiA9IG5ldyBNYXAoKTtcblxuXHQvKipcblx0ICogRW1pdHMgdGhlIGV2ZW50IG9iamVjdCBmb3IgdGhlIHNwZWNpZmllZCB0eXBlXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCB0aGUgZXZlbnQgdG8gZW1pdFxuXHQgKi9cblx0ZW1pdDxLIGV4dGVuZHMga2V5b2YgTT4oZXZlbnQ6IE1bS10pOiB2b2lkO1xuXHRlbWl0KGV2ZW50OiBPKTogdm9pZDtcblx0ZW1pdChldmVudDogYW55KTogdm9pZCB7XG5cdFx0dGhpcy5saXN0ZW5lcnNNYXAuZm9yRWFjaCgobWV0aG9kcywgdHlwZSkgPT4ge1xuXHRcdFx0aWYgKGlzR2xvYk1hdGNoKHR5cGUgYXMgYW55LCBldmVudC50eXBlKSkge1xuXHRcdFx0XHRbLi4ubWV0aG9kc10uZm9yRWFjaCgobWV0aG9kKSA9PiB7XG5cdFx0XHRcdFx0bWV0aG9kLmNhbGwodGhpcywgZXZlbnQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYXRjaCBhbGwgaGFuZGxlciBmb3IgdmFyaW91cyBjYWxsIHNpZ25hdHVyZXMuIFRoZSBzaWduYXR1cmVzIGFyZSBkZWZpbmVkIGluXG5cdCAqIGBCYXNlRXZlbnRlZEV2ZW50c2AuICBZb3UgY2FuIGFkZCB5b3VyIG93biBldmVudCB0eXBlIC0+IGhhbmRsZXIgdHlwZXMgYnkgZXh0ZW5kaW5nXG5cdCAqIGBCYXNlRXZlbnRlZEV2ZW50c2AuICBTZWUgZXhhbXBsZSBmb3IgZGV0YWlscy5cblx0ICpcblx0ICogQHBhcmFtIGFyZ3Ncblx0ICpcblx0ICogQGV4YW1wbGVcblx0ICpcblx0ICogaW50ZXJmYWNlIFdpZGdldEJhc2VFdmVudHMgZXh0ZW5kcyBCYXNlRXZlbnRlZEV2ZW50cyB7XG5cdCAqICAgICAodHlwZTogJ3Byb3BlcnRpZXM6Y2hhbmdlZCcsIGhhbmRsZXI6IFByb3BlcnRpZXNDaGFuZ2VkSGFuZGxlcik6IEhhbmRsZTtcblx0ICogfVxuXHQgKiBjbGFzcyBXaWRnZXRCYXNlIGV4dGVuZHMgRXZlbnRlZCB7XG5cdCAqICAgIG9uOiBXaWRnZXRCYXNlRXZlbnRzO1xuXHQgKiB9XG5cdCAqXG5cdCAqIEByZXR1cm4ge2FueX1cblx0ICovXG5cdG9uPEsgZXh0ZW5kcyBrZXlvZiBNPih0eXBlOiBLLCBsaXN0ZW5lcjogRXZlbnRlZENhbGxiYWNrT3JBcnJheTxLLCBNW0tdPik6IEhhbmRsZTtcblx0b24odHlwZTogVCwgbGlzdGVuZXI6IEV2ZW50ZWRDYWxsYmFja09yQXJyYXk8VCwgTz4pOiBIYW5kbGU7XG5cdG9uKHR5cGU6IGFueSwgbGlzdGVuZXI6IEV2ZW50ZWRDYWxsYmFja09yQXJyYXk8YW55LCBhbnk+KTogSGFuZGxlIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShsaXN0ZW5lcikpIHtcblx0XHRcdGNvbnN0IGhhbmRsZXMgPSBsaXN0ZW5lci5tYXAoKGxpc3RlbmVyKSA9PiB0aGlzLl9hZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZGVzdHJveSgpIHtcblx0XHRcdFx0XHRoYW5kbGVzLmZvckVhY2goKGhhbmRsZSkgPT4gaGFuZGxlLmRlc3Ryb3koKSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9hZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG5cdH1cblxuXHRwcml2YXRlIF9hZGRMaXN0ZW5lcih0eXBlOiBUIHwga2V5b2YgTSwgbGlzdGVuZXI6IEV2ZW50ZWRDYWxsYmFjazxULCBPPikge1xuXHRcdGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzTWFwLmdldCh0eXBlKSB8fCBbXTtcblx0XHRsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cdFx0dGhpcy5saXN0ZW5lcnNNYXAuc2V0KHR5cGUsIGxpc3RlbmVycyk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRlc3Ryb3k6ICgpID0+IHtcblx0XHRcdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNNYXAuZ2V0KHR5cGUpIHx8IFtdO1xuXHRcdFx0XHRsaXN0ZW5lcnMuc3BsaWNlKGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSwgMSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBFdmVudGVkO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIEV2ZW50ZWQudHMiLCIvKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBnZW5lcmF0ZSBhIHZhbHVlIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICAgIFRoZSB2YWx1ZSB0aGUgcHJvcGVydHkgZGVzY3JpcHRvciBzaG91bGQgYmUgc2V0IHRvXG4gKiBAcGFyYW0gZW51bWVyYWJsZSAgIElmIHRoZSBwcm9wZXJ0eSBzaG91bGQgYmUgZW51bWJlcmFibGUsIGRlZmF1bHRzIHRvIGZhbHNlXG4gKiBAcGFyYW0gd3JpdGFibGUgICAgIElmIHRoZSBwcm9wZXJ0eSBzaG91bGQgYmUgd3JpdGFibGUsIGRlZmF1bHRzIHRvIHRydWVcbiAqIEBwYXJhbSBjb25maWd1cmFibGUgSWYgdGhlIHByb3BlcnR5IHNob3VsZCBiZSBjb25maWd1cmFibGUsIGRlZmF1bHRzIHRvIHRydWVcbiAqIEByZXR1cm4gICAgICAgICAgICAgVGhlIHByb3BlcnR5IGRlc2NyaXB0b3Igb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWYWx1ZURlc2NyaXB0b3I8VD4oXG5cdHZhbHVlOiBULFxuXHRlbnVtZXJhYmxlOiBib29sZWFuID0gZmFsc2UsXG5cdHdyaXRhYmxlOiBib29sZWFuID0gdHJ1ZSxcblx0Y29uZmlndXJhYmxlOiBib29sZWFuID0gdHJ1ZVxuKTogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8VD4ge1xuXHRyZXR1cm4ge1xuXHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRlbnVtZXJhYmxlOiBlbnVtZXJhYmxlLFxuXHRcdHdyaXRhYmxlOiB3cml0YWJsZSxcblx0XHRjb25maWd1cmFibGU6IGNvbmZpZ3VyYWJsZVxuXHR9O1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHdoaWNoIHdyYXBzIGEgZnVuY3Rpb24gd2hlcmUgdGhlIGZpcnN0IGFyZ3VtZW50IGJlY29tZXMgdGhlIHNjb3BlXG4gKiBvZiB0aGUgY2FsbFxuICpcbiAqIEBwYXJhbSBuYXRpdmVGdW5jdGlvbiBUaGUgc291cmNlIGZ1bmN0aW9uIHRvIGJlIHdyYXBwZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBOYXRpdmU8VCwgVSwgUj4obmF0aXZlRnVuY3Rpb246IChhcmcxOiBVKSA9PiBSKTogKHRhcmdldDogVCwgYXJnMTogVSkgPT4gUjtcbmV4cG9ydCBmdW5jdGlvbiB3cmFwTmF0aXZlPFQsIFUsIFYsIFI+KG5hdGl2ZUZ1bmN0aW9uOiAoYXJnMTogVSwgYXJnMjogVikgPT4gUik6ICh0YXJnZXQ6IFQsIGFyZzE6IFUsIGFyZzI6IFYpID0+IFI7XG5leHBvcnQgZnVuY3Rpb24gd3JhcE5hdGl2ZTxULCBVLCBWLCBXLCBSPihcblx0bmF0aXZlRnVuY3Rpb246IChhcmcxOiBVLCBhcmcyOiBWLCBhcmczOiBXKSA9PiBSXG4pOiAodGFyZ2V0OiBULCBhcmcxOiBVLCBhcmcyOiBWLCBhcmczOiBXKSA9PiBSO1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBOYXRpdmU8VCwgVSwgViwgVywgWCwgUj4oXG5cdG5hdGl2ZUZ1bmN0aW9uOiAoYXJnMTogVSwgYXJnMjogViwgYXJnMzogVykgPT4gUlxuKTogKHRhcmdldDogVCwgYXJnMTogVSwgYXJnMjogViwgYXJnMzogVykgPT4gUjtcbmV4cG9ydCBmdW5jdGlvbiB3cmFwTmF0aXZlPFQsIFUsIFYsIFcsIFgsIFksIFI+KFxuXHRuYXRpdmVGdW5jdGlvbjogKGFyZzE6IFUsIGFyZzI6IFYsIGFyZzM6IFcsIGFyZzQ6IFkpID0+IFJcbik6ICh0YXJnZXQ6IFQsIGFyZzE6IFUsIGFyZzI6IFYsIGFyZzM6IFcsIGFyZzQ6IFkpID0+IFI7XG5leHBvcnQgZnVuY3Rpb24gd3JhcE5hdGl2ZShuYXRpdmVGdW5jdGlvbjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiAodGFyZ2V0OiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkge1xuXHRyZXR1cm4gZnVuY3Rpb24odGFyZ2V0OiBhbnksIC4uLmFyZ3M6IGFueVtdKTogYW55IHtcblx0XHRyZXR1cm4gbmF0aXZlRnVuY3Rpb24uYXBwbHkodGFyZ2V0LCBhcmdzKTtcblx0fTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB1dGlsLnRzIiwiaW1wb3J0IGhhcywgeyBhZGQgfSBmcm9tICcuLi8uLi9oYXMvaGFzJztcbmltcG9ydCBnbG9iYWwgZnJvbSAnLi4vZ2xvYmFsJztcblxuZXhwb3J0IGRlZmF1bHQgaGFzO1xuZXhwb3J0ICogZnJvbSAnLi4vLi4vaGFzL2hhcyc7XG5cbi8qIEVDTUFTY3JpcHQgNiBhbmQgNyBGZWF0dXJlcyAqL1xuXG4vKiBBcnJheSAqL1xuYWRkKFxuXHQnZXM2LWFycmF5Jyxcblx0KCkgPT4ge1xuXHRcdHJldHVybiAoXG5cdFx0XHRbJ2Zyb20nLCAnb2YnXS5ldmVyeSgoa2V5KSA9PiBrZXkgaW4gZ2xvYmFsLkFycmF5KSAmJlxuXHRcdFx0WydmaW5kSW5kZXgnLCAnZmluZCcsICdjb3B5V2l0aGluJ10uZXZlcnkoKGtleSkgPT4ga2V5IGluIGdsb2JhbC5BcnJheS5wcm90b3R5cGUpXG5cdFx0KTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuYWRkKFxuXHQnZXM2LWFycmF5LWZpbGwnLFxuXHQoKSA9PiB7XG5cdFx0aWYgKCdmaWxsJyBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlKSB7XG5cdFx0XHQvKiBTb21lIHZlcnNpb25zIG9mIFNhZmFyaSBkbyBub3QgcHJvcGVybHkgaW1wbGVtZW50IHRoaXMgKi9cblx0XHRcdHJldHVybiAoWzFdIGFzIGFueSkuZmlsbCg5LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpWzBdID09PSAxO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHRydWVcbik7XG5cbmFkZCgnZXM3LWFycmF5JywgKCkgPT4gJ2luY2x1ZGVzJyBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlLCB0cnVlKTtcblxuLyogTWFwICovXG5hZGQoXG5cdCdlczYtbWFwJyxcblx0KCkgPT4ge1xuXHRcdGlmICh0eXBlb2YgZ2xvYmFsLk1hcCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Lypcblx0XHRJRTExIGFuZCBvbGRlciB2ZXJzaW9ucyBvZiBTYWZhcmkgYXJlIG1pc3NpbmcgY3JpdGljYWwgRVM2IE1hcCBmdW5jdGlvbmFsaXR5XG5cdFx0V2Ugd3JhcCB0aGlzIGluIGEgdHJ5L2NhdGNoIGJlY2F1c2Ugc29tZXRpbWVzIHRoZSBNYXAgY29uc3RydWN0b3IgZXhpc3RzLCBidXQgZG9lcyBub3Rcblx0XHR0YWtlIGFyZ3VtZW50cyAoaU9TIDguNClcblx0XHQgKi9cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IG1hcCA9IG5ldyBnbG9iYWwuTWFwKFtbMCwgMV1dKTtcblxuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdG1hcC5oYXMoMCkgJiZcblx0XHRcdFx0XHR0eXBlb2YgbWFwLmtleXMgPT09ICdmdW5jdGlvbicgJiZcblx0XHRcdFx0XHRoYXMoJ2VzNi1zeW1ib2wnKSAmJlxuXHRcdFx0XHRcdHR5cGVvZiBtYXAudmFsdWVzID09PSAnZnVuY3Rpb24nICYmXG5cdFx0XHRcdFx0dHlwZW9mIG1hcC5lbnRyaWVzID09PSAnZnVuY3Rpb24nXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiBub3QgdGVzdGluZyBvbiBpT1MgYXQgdGhlIG1vbWVudCAqL1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuLyogTWF0aCAqL1xuYWRkKFxuXHQnZXM2LW1hdGgnLFxuXHQoKSA9PiB7XG5cdFx0cmV0dXJuIFtcblx0XHRcdCdjbHozMicsXG5cdFx0XHQnc2lnbicsXG5cdFx0XHQnbG9nMTAnLFxuXHRcdFx0J2xvZzInLFxuXHRcdFx0J2xvZzFwJyxcblx0XHRcdCdleHBtMScsXG5cdFx0XHQnY29zaCcsXG5cdFx0XHQnc2luaCcsXG5cdFx0XHQndGFuaCcsXG5cdFx0XHQnYWNvc2gnLFxuXHRcdFx0J2FzaW5oJyxcblx0XHRcdCdhdGFuaCcsXG5cdFx0XHQndHJ1bmMnLFxuXHRcdFx0J2Zyb3VuZCcsXG5cdFx0XHQnY2JydCcsXG5cdFx0XHQnaHlwb3QnXG5cdFx0XS5ldmVyeSgobmFtZSkgPT4gdHlwZW9mIGdsb2JhbC5NYXRoW25hbWVdID09PSAnZnVuY3Rpb24nKTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuYWRkKFxuXHQnZXM2LW1hdGgtaW11bCcsXG5cdCgpID0+IHtcblx0XHRpZiAoJ2ltdWwnIGluIGdsb2JhbC5NYXRoKSB7XG5cdFx0XHQvKiBTb21lIHZlcnNpb25zIG9mIFNhZmFyaSBvbiBpb3MgZG8gbm90IHByb3Blcmx5IGltcGxlbWVudCB0aGlzICovXG5cdFx0XHRyZXR1cm4gKE1hdGggYXMgYW55KS5pbXVsKDB4ZmZmZmZmZmYsIDUpID09PSAtNTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHR0cnVlXG4pO1xuXG4vKiBPYmplY3QgKi9cbmFkZChcblx0J2VzNi1vYmplY3QnLFxuXHQoKSA9PiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGhhcygnZXM2LXN5bWJvbCcpICYmXG5cdFx0XHRbJ2Fzc2lnbicsICdpcycsICdnZXRPd25Qcm9wZXJ0eVN5bWJvbHMnLCAnc2V0UHJvdG90eXBlT2YnXS5ldmVyeShcblx0XHRcdFx0KG5hbWUpID0+IHR5cGVvZiBnbG9iYWwuT2JqZWN0W25hbWVdID09PSAnZnVuY3Rpb24nXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuYWRkKFxuXHQnZXMyMDE3LW9iamVjdCcsXG5cdCgpID0+IHtcblx0XHRyZXR1cm4gWyd2YWx1ZXMnLCAnZW50cmllcycsICdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzJ10uZXZlcnkoXG5cdFx0XHQobmFtZSkgPT4gdHlwZW9mIGdsb2JhbC5PYmplY3RbbmFtZV0gPT09ICdmdW5jdGlvbidcblx0XHQpO1xuXHR9LFxuXHR0cnVlXG4pO1xuXG4vKiBPYnNlcnZhYmxlICovXG5hZGQoJ2VzLW9ic2VydmFibGUnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLk9ic2VydmFibGUgIT09ICd1bmRlZmluZWQnLCB0cnVlKTtcblxuLyogUHJvbWlzZSAqL1xuYWRkKCdlczYtcHJvbWlzZScsICgpID0+IHR5cGVvZiBnbG9iYWwuUHJvbWlzZSAhPT0gJ3VuZGVmaW5lZCcgJiYgaGFzKCdlczYtc3ltYm9sJyksIHRydWUpO1xuXG4vKiBTZXQgKi9cbmFkZChcblx0J2VzNi1zZXQnLFxuXHQoKSA9PiB7XG5cdFx0aWYgKHR5cGVvZiBnbG9iYWwuU2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHQvKiBJRTExIGFuZCBvbGRlciB2ZXJzaW9ucyBvZiBTYWZhcmkgYXJlIG1pc3NpbmcgY3JpdGljYWwgRVM2IFNldCBmdW5jdGlvbmFsaXR5ICovXG5cdFx0XHRjb25zdCBzZXQgPSBuZXcgZ2xvYmFsLlNldChbMV0pO1xuXHRcdFx0cmV0dXJuIHNldC5oYXMoMSkgJiYgJ2tleXMnIGluIHNldCAmJiB0eXBlb2Ygc2V0LmtleXMgPT09ICdmdW5jdGlvbicgJiYgaGFzKCdlczYtc3ltYm9sJyk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuLyogU3RyaW5nICovXG5hZGQoXG5cdCdlczYtc3RyaW5nJyxcblx0KCkgPT4ge1xuXHRcdHJldHVybiAoXG5cdFx0XHRbXG5cdFx0XHRcdC8qIHN0YXRpYyBtZXRob2RzICovXG5cdFx0XHRcdCdmcm9tQ29kZVBvaW50J1xuXHRcdFx0XS5ldmVyeSgoa2V5KSA9PiB0eXBlb2YgZ2xvYmFsLlN0cmluZ1trZXldID09PSAnZnVuY3Rpb24nKSAmJlxuXHRcdFx0W1xuXHRcdFx0XHQvKiBpbnN0YW5jZSBtZXRob2RzICovXG5cdFx0XHRcdCdjb2RlUG9pbnRBdCcsXG5cdFx0XHRcdCdub3JtYWxpemUnLFxuXHRcdFx0XHQncmVwZWF0Jyxcblx0XHRcdFx0J3N0YXJ0c1dpdGgnLFxuXHRcdFx0XHQnZW5kc1dpdGgnLFxuXHRcdFx0XHQnaW5jbHVkZXMnXG5cdFx0XHRdLmV2ZXJ5KChrZXkpID0+IHR5cGVvZiBnbG9iYWwuU3RyaW5nLnByb3RvdHlwZVtrZXldID09PSAnZnVuY3Rpb24nKVxuXHRcdCk7XG5cdH0sXG5cdHRydWVcbik7XG5cbmFkZChcblx0J2VzNi1zdHJpbmctcmF3Jyxcblx0KCkgPT4ge1xuXHRcdGZ1bmN0aW9uIGdldENhbGxTaXRlKGNhbGxTaXRlOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4uc3Vic3RpdHV0aW9uczogYW55W10pIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IFsuLi5jYWxsU2l0ZV07XG5cdFx0XHQocmVzdWx0IGFzIGFueSkucmF3ID0gY2FsbFNpdGUucmF3O1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRpZiAoJ3JhdycgaW4gZ2xvYmFsLlN0cmluZykge1xuXHRcdFx0bGV0IGIgPSAxO1xuXHRcdFx0bGV0IGNhbGxTaXRlID0gZ2V0Q2FsbFNpdGVgYVxcbiR7Yn1gO1xuXG5cdFx0XHQoY2FsbFNpdGUgYXMgYW55KS5yYXcgPSBbJ2FcXFxcbiddO1xuXHRcdFx0Y29uc3Qgc3VwcG9ydHNUcnVuYyA9IGdsb2JhbC5TdHJpbmcucmF3KGNhbGxTaXRlLCA0MikgPT09ICdhXFxcXG4nO1xuXG5cdFx0XHRyZXR1cm4gc3VwcG9ydHNUcnVuYztcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHRydWVcbik7XG5cbmFkZChcblx0J2VzMjAxNy1zdHJpbmcnLFxuXHQoKSA9PiB7XG5cdFx0cmV0dXJuIFsncGFkU3RhcnQnLCAncGFkRW5kJ10uZXZlcnkoKGtleSkgPT4gdHlwZW9mIGdsb2JhbC5TdHJpbmcucHJvdG90eXBlW2tleV0gPT09ICdmdW5jdGlvbicpO1xuXHR9LFxuXHR0cnVlXG4pO1xuXG4vKiBTeW1ib2wgKi9cbmFkZCgnZXM2LXN5bWJvbCcsICgpID0+IHR5cGVvZiBnbG9iYWwuU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgU3ltYm9sKCkgPT09ICdzeW1ib2wnLCB0cnVlKTtcblxuLyogV2Vha01hcCAqL1xuYWRkKFxuXHQnZXM2LXdlYWttYXAnLFxuXHQoKSA9PiB7XG5cdFx0aWYgKHR5cGVvZiBnbG9iYWwuV2Vha01hcCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8qIElFMTEgYW5kIG9sZGVyIHZlcnNpb25zIG9mIFNhZmFyaSBhcmUgbWlzc2luZyBjcml0aWNhbCBFUzYgTWFwIGZ1bmN0aW9uYWxpdHkgKi9cblx0XHRcdGNvbnN0IGtleTEgPSB7fTtcblx0XHRcdGNvbnN0IGtleTIgPSB7fTtcblx0XHRcdGNvbnN0IG1hcCA9IG5ldyBnbG9iYWwuV2Vha01hcChbW2tleTEsIDFdXSk7XG5cdFx0XHRPYmplY3QuZnJlZXplKGtleTEpO1xuXHRcdFx0cmV0dXJuIG1hcC5nZXQoa2V5MSkgPT09IDEgJiYgbWFwLnNldChrZXkyLCAyKSA9PT0gbWFwICYmIGhhcygnZXM2LXN5bWJvbCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHRydWVcbik7XG5cbi8qIE1pc2NlbGxhbmVvdXMgZmVhdHVyZXMgKi9cbmFkZCgnbWljcm90YXNrcycsICgpID0+IGhhcygnZXM2LXByb21pc2UnKSB8fCBoYXMoJ2hvc3Qtbm9kZScpIHx8IGhhcygnZG9tLW11dGF0aW9ub2JzZXJ2ZXInKSwgdHJ1ZSk7XG5hZGQoXG5cdCdwb3N0bWVzc2FnZScsXG5cdCgpID0+IHtcblx0XHQvLyBJZiB3aW5kb3cgaXMgdW5kZWZpbmVkLCBhbmQgd2UgaGF2ZSBwb3N0TWVzc2FnZSwgaXQgcHJvYmFibHkgbWVhbnMgd2UncmUgaW4gYSB3ZWIgd29ya2VyLiBXZWIgd29ya2VycyBoYXZlXG5cdFx0Ly8gcG9zdCBtZXNzYWdlIGJ1dCBpdCBkb2Vzbid0IHdvcmsgaG93IHdlIGV4cGVjdCBpdCB0bywgc28gaXQncyBiZXN0IGp1c3QgdG8gcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuXHRcdHJldHVybiB0eXBlb2YgZ2xvYmFsLndpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGdsb2JhbC5wb3N0TWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJztcblx0fSxcblx0dHJ1ZVxuKTtcbmFkZCgncmFmJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicsIHRydWUpO1xuYWRkKCdzZXRpbW1lZGlhdGUnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLnNldEltbWVkaWF0ZSAhPT0gJ3VuZGVmaW5lZCcsIHRydWUpO1xuXG4vKiBET00gRmVhdHVyZXMgKi9cblxuYWRkKFxuXHQnZG9tLW11dGF0aW9ub2JzZXJ2ZXInLFxuXHQoKSA9PiB7XG5cdFx0aWYgKGhhcygnaG9zdC1icm93c2VyJykgJiYgQm9vbGVhbihnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcikpIHtcblx0XHRcdC8vIElFMTEgaGFzIGFuIHVucmVsaWFibGUgTXV0YXRpb25PYnNlcnZlciBpbXBsZW1lbnRhdGlvbiB3aGVyZSBzZXRQcm9wZXJ0eSgpIGRvZXMgbm90XG5cdFx0XHQvLyBnZW5lcmF0ZSBhIG11dGF0aW9uIGV2ZW50LCBvYnNlcnZlcnMgY2FuIGNyYXNoLCBhbmQgdGhlIHF1ZXVlIGRvZXMgbm90IGRyYWluXG5cdFx0XHQvLyByZWxpYWJseS4gVGhlIGZvbGxvd2luZyBmZWF0dXJlIHRlc3Qgd2FzIGFkYXB0ZWQgZnJvbVxuXHRcdFx0Ly8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdDEwa28vNGFjZWI4YzcxNjgxZmRiMjc1ZTMzZWZlNWU1NzZiMTRcblx0XHRcdGNvbnN0IGV4YW1wbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YXJpYWJsZS1uYW1lICovXG5cdFx0XHRjb25zdCBIb3N0TXV0YXRpb25PYnNlcnZlciA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuXHRcdFx0Y29uc3Qgb2JzZXJ2ZXIgPSBuZXcgSG9zdE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oKSB7fSk7XG5cdFx0XHRvYnNlcnZlci5vYnNlcnZlKGV4YW1wbGUsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuXHRcdFx0ZXhhbXBsZS5zdHlsZS5zZXRQcm9wZXJ0eSgnZGlzcGxheScsICdibG9jaycpO1xuXG5cdFx0XHRyZXR1cm4gQm9vbGVhbihvYnNlcnZlci50YWtlUmVjb3JkcygpLmxlbmd0aCk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0dHJ1ZVxuKTtcblxuYWRkKFxuXHQnZG9tLXdlYmFuaW1hdGlvbicsXG5cdCgpID0+IGhhcygnaG9zdC1icm93c2VyJykgJiYgZ2xvYmFsLkFuaW1hdGlvbiAhPT0gdW5kZWZpbmVkICYmIGdsb2JhbC5LZXlmcmFtZUVmZmVjdCAhPT0gdW5kZWZpbmVkLFxuXHR0cnVlXG4pO1xuXG5hZGQoJ2Fib3J0LWNvbnRyb2xsZXInLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLkFib3J0Q29udHJvbGxlciAhPT0gJ3VuZGVmaW5lZCcpO1xuXG5hZGQoJ2Fib3J0LXNpZ25hbCcsICgpID0+IHR5cGVvZiBnbG9iYWwuQWJvcnRTaWduYWwgIT09ICd1bmRlZmluZWQnKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBoYXMudHMiLCJpbXBvcnQgeyBpc0FycmF5TGlrZSwgSXRlcmFibGUsIEl0ZXJhYmxlSXRlcmF0b3IsIFNoaW1JdGVyYXRvciB9IGZyb20gJy4vaXRlcmF0b3InO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgeyBpcyBhcyBvYmplY3RJcyB9IGZyb20gJy4vb2JqZWN0JztcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XG5pbXBvcnQgJy4vU3ltYm9sJztcblxuZXhwb3J0IGludGVyZmFjZSBNYXA8SywgVj4ge1xuXHQvKipcblx0ICogRGVsZXRlcyBhbGwga2V5cyBhbmQgdGhlaXIgYXNzb2NpYXRlZCB2YWx1ZXMuXG5cdCAqL1xuXHRjbGVhcigpOiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBEZWxldGVzIGEgZ2l2ZW4ga2V5IGFuZCBpdHMgYXNzb2NpYXRlZCB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGRlbGV0ZVxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGtleSBleGlzdHMsIGZhbHNlIGlmIGl0IGRvZXMgbm90XG5cdCAqL1xuXHRkZWxldGUoa2V5OiBLKTogYm9vbGVhbjtcblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBpdGVyYXRvciB0aGF0IHlpZWxkcyBlYWNoIGtleS92YWx1ZSBwYWlyIGFzIGFuIGFycmF5LlxuXHQgKlxuXHQgKiBAcmV0dXJuIEFuIGl0ZXJhdG9yIGZvciBlYWNoIGtleS92YWx1ZSBwYWlyIGluIHRoZSBpbnN0YW5jZS5cblx0ICovXG5cdGVudHJpZXMoKTogSXRlcmFibGVJdGVyYXRvcjxbSywgVl0+O1xuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBhIGdpdmVuIGZ1bmN0aW9uIGZvciBlYWNoIG1hcCBlbnRyeS4gVGhlIGZ1bmN0aW9uXG5cdCAqIGlzIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6IHRoZSBlbGVtZW50IHZhbHVlLCB0aGVcblx0ICogZWxlbWVudCBrZXksIGFuZCB0aGUgYXNzb2NpYXRlZCBNYXAgaW5zdGFuY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBjYWxsYmFja2ZuIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIG1hcCBlbnRyeSxcblx0ICogQHBhcmFtIHRoaXNBcmcgVGhlIHZhbHVlIHRvIHVzZSBmb3IgYHRoaXNgIGZvciBlYWNoIGV4ZWN1dGlvbiBvZiB0aGUgY2FsYmFja1xuXHQgKi9cblx0Zm9yRWFjaChjYWxsYmFja2ZuOiAodmFsdWU6IFYsIGtleTogSywgbWFwOiBNYXA8SywgVj4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpOiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBnaXZlbiBrZXkuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byBsb29rIHVwXG5cdCAqIEByZXR1cm4gVGhlIHZhbHVlIGlmIG9uZSBleGlzdHMgb3IgdW5kZWZpbmVkXG5cdCAqL1xuXHRnZXQoa2V5OiBLKTogViB8IHVuZGVmaW5lZDtcblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBpdGVyYXRvciB0aGF0IHlpZWxkcyBlYWNoIGtleSBpbiB0aGUgbWFwLlxuXHQgKlxuXHQgKiBAcmV0dXJuIEFuIGl0ZXJhdG9yIGNvbnRhaW5pbmcgdGhlIGluc3RhbmNlJ3Mga2V5cy5cblx0ICovXG5cdGtleXMoKTogSXRlcmFibGVJdGVyYXRvcjxLPjtcblxuXHQvKipcblx0ICogQ2hlY2tzIGZvciB0aGUgcHJlc2VuY2Ugb2YgYSBnaXZlbiBrZXkuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byBjaGVjayBmb3Jcblx0ICogQHJldHVybiB0cnVlIGlmIHRoZSBrZXkgZXhpc3RzLCBmYWxzZSBpZiBpdCBkb2VzIG5vdFxuXHQgKi9cblx0aGFzKGtleTogSyk6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGRlZmluZSBhIHZhbHVlIHRvXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduXG5cdCAqIEByZXR1cm4gVGhlIE1hcCBpbnN0YW5jZVxuXHQgKi9cblx0c2V0KGtleTogSywgdmFsdWU6IFYpOiB0aGlzO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Yga2V5IC8gdmFsdWUgcGFpcnMgaW4gdGhlIE1hcC5cblx0ICovXG5cdHJlYWRvbmx5IHNpemU6IG51bWJlcjtcblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBpdGVyYXRvciB0aGF0IHlpZWxkcyBlYWNoIHZhbHVlIGluIHRoZSBtYXAuXG5cdCAqXG5cdCAqIEByZXR1cm4gQW4gaXRlcmF0b3IgY29udGFpbmluZyB0aGUgaW5zdGFuY2UncyB2YWx1ZXMuXG5cdCAqL1xuXHR2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxWPjtcblxuXHQvKiogUmV0dXJucyBhbiBpdGVyYWJsZSBvZiBlbnRyaWVzIGluIHRoZSBtYXAuICovXG5cdFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPjtcblxuXHRyZWFkb25seSBbU3ltYm9sLnRvU3RyaW5nVGFnXTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1hcENvbnN0cnVjdG9yIHtcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgTWFwXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblx0bmV3ICgpOiBNYXA8YW55LCBhbnk+O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IE1hcFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGl0ZXJhdG9yXG5cdCAqIEFycmF5IG9yIGl0ZXJhdG9yIGNvbnRhaW5pbmcgdHdvLWl0ZW0gdHVwbGVzIHVzZWQgdG8gaW5pdGlhbGx5IHBvcHVsYXRlIHRoZSBtYXAuXG5cdCAqIFRoZSBmaXJzdCBpdGVtIGluIGVhY2ggdHVwbGUgY29ycmVzcG9uZHMgdG8gdGhlIGtleSBvZiB0aGUgbWFwIGVudHJ5LlxuXHQgKiBUaGUgc2Vjb25kIGl0ZW0gY29ycmVzcG9uZHMgdG8gdGhlIHZhbHVlIG9mIHRoZSBtYXAgZW50cnkuXG5cdCAqL1xuXHRuZXcgPEssIFY+KGl0ZXJhdG9yPzogW0ssIFZdW10pOiBNYXA8SywgVj47XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgTWFwXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0gaXRlcmF0b3Jcblx0ICogQXJyYXkgb3IgaXRlcmF0b3IgY29udGFpbmluZyB0d28taXRlbSB0dXBsZXMgdXNlZCB0byBpbml0aWFsbHkgcG9wdWxhdGUgdGhlIG1hcC5cblx0ICogVGhlIGZpcnN0IGl0ZW0gaW4gZWFjaCB0dXBsZSBjb3JyZXNwb25kcyB0byB0aGUga2V5IG9mIHRoZSBtYXAgZW50cnkuXG5cdCAqIFRoZSBzZWNvbmQgaXRlbSBjb3JyZXNwb25kcyB0byB0aGUgdmFsdWUgb2YgdGhlIG1hcCBlbnRyeS5cblx0ICovXG5cdG5ldyA8SywgVj4oaXRlcmF0b3I6IEl0ZXJhYmxlPFtLLCBWXT4pOiBNYXA8SywgVj47XG5cblx0cmVhZG9ubHkgcHJvdG90eXBlOiBNYXA8YW55LCBhbnk+O1xuXG5cdHJlYWRvbmx5IFtTeW1ib2wuc3BlY2llc106IE1hcENvbnN0cnVjdG9yO1xufVxuXG5leHBvcnQgbGV0IE1hcDogTWFwQ29uc3RydWN0b3IgPSBnbG9iYWwuTWFwO1xuXG5pZiAoIWhhcygnZXM2LW1hcCcpKSB7XG5cdE1hcCA9IGNsYXNzIE1hcDxLLCBWPiB7XG5cdFx0cHJvdGVjdGVkIHJlYWRvbmx5IF9rZXlzOiBLW10gPSBbXTtcblx0XHRwcm90ZWN0ZWQgcmVhZG9ubHkgX3ZhbHVlczogVltdID0gW107XG5cblx0XHQvKipcblx0XHQgKiBBbiBhbHRlcm5hdGl2ZSB0byBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiB1c2luZyBPYmplY3QuaXNcblx0XHQgKiB0byBjaGVjayBmb3IgZXF1YWxpdHkuIFNlZSBodHRwOi8vbXpsLmxhLzF6dUtPMlZcblx0XHQgKi9cblx0XHRwcm90ZWN0ZWQgX2luZGV4T2ZLZXkoa2V5czogS1tdLCBrZXk6IEspOiBudW1iZXIge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKG9iamVjdElzKGtleXNbaV0sIGtleSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBbU3ltYm9sLnNwZWNpZXNdID0gTWFwO1xuXG5cdFx0Y29uc3RydWN0b3IoaXRlcmFibGU/OiBBcnJheUxpa2U8W0ssIFZdPiB8IEl0ZXJhYmxlPFtLLCBWXT4pIHtcblx0XHRcdGlmIChpdGVyYWJsZSkge1xuXHRcdFx0XHRpZiAoaXNBcnJheUxpa2UoaXRlcmFibGUpKSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBpdGVyYWJsZVtpXTtcblx0XHRcdFx0XHRcdHRoaXMuc2V0KHZhbHVlWzBdLCB2YWx1ZVsxXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgdmFsdWUgb2YgaXRlcmFibGUpIHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0KHZhbHVlWzBdLCB2YWx1ZVsxXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Z2V0IHNpemUoKTogbnVtYmVyIHtcblx0XHRcdHJldHVybiB0aGlzLl9rZXlzLmxlbmd0aDtcblx0XHR9XG5cblx0XHRjbGVhcigpOiB2b2lkIHtcblx0XHRcdHRoaXMuX2tleXMubGVuZ3RoID0gdGhpcy5fdmFsdWVzLmxlbmd0aCA9IDA7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlKGtleTogSyk6IGJvb2xlYW4ge1xuXHRcdFx0Y29uc3QgaW5kZXggPSB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSk7XG5cdFx0XHRpZiAoaW5kZXggPCAwKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2tleXMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdHRoaXMuX3ZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0ZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT4ge1xuXHRcdFx0Y29uc3QgdmFsdWVzID0gdGhpcy5fa2V5cy5tYXAoXG5cdFx0XHRcdChrZXk6IEssIGk6IG51bWJlcik6IFtLLCBWXSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIFtrZXksIHRoaXMuX3ZhbHVlc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHZhbHVlcyk7XG5cdFx0fVxuXG5cdFx0Zm9yRWFjaChjYWxsYmFjazogKHZhbHVlOiBWLCBrZXk6IEssIG1hcEluc3RhbmNlOiBNYXA8SywgVj4pID0+IGFueSwgY29udGV4dD86IHt9KSB7XG5cdFx0XHRjb25zdCBrZXlzID0gdGhpcy5fa2V5cztcblx0XHRcdGNvbnN0IHZhbHVlcyA9IHRoaXMuX3ZhbHVlcztcblx0XHRcdGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdmFsdWVzW2ldLCBrZXlzW2ldLCB0aGlzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRnZXQoa2V5OiBLKTogViB8IHVuZGVmaW5lZCB7XG5cdFx0XHRjb25zdCBpbmRleCA9IHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KTtcblx0XHRcdHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiB0aGlzLl92YWx1ZXNbaW5kZXhdO1xuXHRcdH1cblxuXHRcdGhhcyhrZXk6IEspOiBib29sZWFuIHtcblx0XHRcdHJldHVybiB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSkgPiAtMTtcblx0XHR9XG5cblx0XHRrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Sz4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fa2V5cyk7XG5cdFx0fVxuXG5cdFx0c2V0KGtleTogSywgdmFsdWU6IFYpOiBNYXA8SywgVj4ge1xuXHRcdFx0bGV0IGluZGV4ID0gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpO1xuXHRcdFx0aW5kZXggPSBpbmRleCA8IDAgPyB0aGlzLl9rZXlzLmxlbmd0aCA6IGluZGV4O1xuXHRcdFx0dGhpcy5fa2V5c1tpbmRleF0gPSBrZXk7XG5cdFx0XHR0aGlzLl92YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHR2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxWPiB7XG5cdFx0XHRyZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih0aGlzLl92YWx1ZXMpO1xuXHRcdH1cblxuXHRcdFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lbnRyaWVzKCk7XG5cdFx0fVxuXG5cdFx0W1N5bWJvbC50b1N0cmluZ1RhZ106ICdNYXAnID0gJ01hcCc7XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hcDtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBNYXAudHMiLCJpbXBvcnQgeyBUaGVuYWJsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCB7IHF1ZXVlTWljcm9UYXNrIH0gZnJvbSAnLi9zdXBwb3J0L3F1ZXVlJztcbmltcG9ydCB7IEl0ZXJhYmxlIH0gZnJvbSAnLi9pdGVyYXRvcic7XG5pbXBvcnQgJy4vU3ltYm9sJztcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XG5cbi8qKlxuICogRXhlY3V0b3IgaXMgdGhlIGludGVyZmFjZSBmb3IgZnVuY3Rpb25zIHVzZWQgdG8gaW5pdGlhbGl6ZSBhIFByb21pc2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0b3I8VD4ge1xuXHQvKipcblx0ICogVGhlIGV4ZWN1dG9yIGZvciB0aGUgcHJvbWlzZVxuXHQgKlxuXHQgKiBAcGFyYW0gcmVzb2x2ZSBUaGUgcmVzb2x2ZXIgY2FsbGJhY2sgb2YgdGhlIHByb21pc2Vcblx0ICogQHBhcmFtIHJlamVjdCBUaGUgcmVqZWN0b3IgY2FsbGJhY2sgb2YgdGhlIHByb21pc2Vcblx0ICovXG5cdChyZXNvbHZlOiAodmFsdWU/OiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBsZXQgU2hpbVByb21pc2U6IHR5cGVvZiBQcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XG5cbmV4cG9ydCBjb25zdCBpc1RoZW5hYmxlID0gZnVuY3Rpb24gaXNUaGVuYWJsZTxUPih2YWx1ZTogYW55KTogdmFsdWUgaXMgUHJvbWlzZUxpa2U8VD4ge1xuXHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59O1xuXG5pZiAoIWhhcygnZXM2LXByb21pc2UnKSkge1xuXHRjb25zdCBlbnVtIFN0YXRlIHtcblx0XHRGdWxmaWxsZWQsXG5cdFx0UGVuZGluZyxcblx0XHRSZWplY3RlZFxuXHR9XG5cblx0Z2xvYmFsLlByb21pc2UgPSBTaGltUHJvbWlzZSA9IGNsYXNzIFByb21pc2U8VD4gaW1wbGVtZW50cyBUaGVuYWJsZTxUPiB7XG5cdFx0c3RhdGljIGFsbChpdGVyYWJsZTogSXRlcmFibGU8YW55IHwgUHJvbWlzZUxpa2U8YW55Pj4gfCAoYW55IHwgUHJvbWlzZUxpa2U8YW55PilbXSk6IFByb21pc2U8YW55PiB7XG5cdFx0XHRyZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlczogYW55W10gPSBbXTtcblx0XHRcdFx0bGV0IGNvbXBsZXRlID0gMDtcblx0XHRcdFx0bGV0IHRvdGFsID0gMDtcblx0XHRcdFx0bGV0IHBvcHVsYXRpbmcgPSB0cnVlO1xuXG5cdFx0XHRcdGZ1bmN0aW9uIGZ1bGZpbGwoaW5kZXg6IG51bWJlciwgdmFsdWU6IGFueSk6IHZvaWQge1xuXHRcdFx0XHRcdHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcblx0XHRcdFx0XHQrK2NvbXBsZXRlO1xuXHRcdFx0XHRcdGZpbmlzaCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnVuY3Rpb24gZmluaXNoKCk6IHZvaWQge1xuXHRcdFx0XHRcdGlmIChwb3B1bGF0aW5nIHx8IGNvbXBsZXRlIDwgdG90YWwpIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVzb2x2ZSh2YWx1ZXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnVuY3Rpb24gcHJvY2Vzc0l0ZW0oaW5kZXg6IG51bWJlciwgaXRlbTogYW55KTogdm9pZCB7XG5cdFx0XHRcdFx0Kyt0b3RhbDtcblx0XHRcdFx0XHRpZiAoaXNUaGVuYWJsZShpdGVtKSkge1xuXHRcdFx0XHRcdFx0Ly8gSWYgYW4gaXRlbSBQcm9taXNlIHJlamVjdHMsIHRoaXMgUHJvbWlzZSBpcyBpbW1lZGlhdGVseSByZWplY3RlZCB3aXRoIHRoZSBpdGVtXG5cdFx0XHRcdFx0XHQvLyBQcm9taXNlJ3MgcmVqZWN0aW9uIGVycm9yLlxuXHRcdFx0XHRcdFx0aXRlbS50aGVuKGZ1bGZpbGwuYmluZChudWxsLCBpbmRleCksIHJlamVjdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZShpdGVtKS50aGVuKGZ1bGZpbGwuYmluZChudWxsLCBpbmRleCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBpID0gMDtcblx0XHRcdFx0Zm9yIChjb25zdCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xuXHRcdFx0XHRcdHByb2Nlc3NJdGVtKGksIHZhbHVlKTtcblx0XHRcdFx0XHRpKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0cG9wdWxhdGluZyA9IGZhbHNlO1xuXG5cdFx0XHRcdGZpbmlzaCgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0c3RhdGljIHJhY2U8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQgfCBQcm9taXNlTGlrZTxUPj4gfCAoVCB8IFByb21pc2VMaWtlPFQ+KVtdKTogUHJvbWlzZTxUW10+IHtcblx0XHRcdHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbihyZXNvbHZlOiAodmFsdWU/OiBhbnkpID0+IHZvaWQsIHJlamVjdCkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlcmFibGUpIHtcblx0XHRcdFx0XHRpZiAoaXRlbSBpbnN0YW5jZW9mIFByb21pc2UpIHtcblx0XHRcdFx0XHRcdC8vIElmIGEgUHJvbWlzZSBpdGVtIHJlamVjdHMsIHRoaXMgUHJvbWlzZSBpcyBpbW1lZGlhdGVseSByZWplY3RlZCB3aXRoIHRoZSBpdGVtXG5cdFx0XHRcdFx0XHQvLyBQcm9taXNlJ3MgcmVqZWN0aW9uIGVycm9yLlxuXHRcdFx0XHRcdFx0aXRlbS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZShpdGVtKS50aGVuKHJlc29sdmUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0c3RhdGljIHJlamVjdChyZWFzb24/OiBhbnkpOiBQcm9taXNlPG5ldmVyPiB7XG5cdFx0XHRyZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRcdHJlamVjdChyZWFzb24pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0c3RhdGljIHJlc29sdmUoKTogUHJvbWlzZTx2b2lkPjtcblx0XHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KTogUHJvbWlzZTxUPjtcblx0XHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZT86IGFueSk6IFByb21pc2U8VD4ge1xuXHRcdFx0cmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uKHJlc29sdmUpIHtcblx0XHRcdFx0cmVzb2x2ZSg8VD52YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRzdGF0aWMgW1N5bWJvbC5zcGVjaWVzXTogUHJvbWlzZUNvbnN0cnVjdG9yID0gU2hpbVByb21pc2UgYXMgUHJvbWlzZUNvbnN0cnVjdG9yO1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlcyBhIG5ldyBQcm9taXNlLlxuXHRcdCAqXG5cdFx0ICogQGNvbnN0cnVjdG9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXhlY3V0b3Jcblx0XHQgKiBUaGUgZXhlY3V0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIGltbWVkaWF0ZWx5IHdoZW4gdGhlIFByb21pc2UgaXMgaW5zdGFudGlhdGVkLiBJdCBpcyByZXNwb25zaWJsZSBmb3Jcblx0XHQgKiBzdGFydGluZyB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiB3aGVuIGl0IGlzIGludm9rZWQuXG5cdFx0ICpcblx0XHQgKiBUaGUgZXhlY3V0b3IgbXVzdCBjYWxsIGVpdGhlciB0aGUgcGFzc2VkIGByZXNvbHZlYCBmdW5jdGlvbiB3aGVuIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWRcblx0XHQgKiBzdWNjZXNzZnVsbHksIG9yIHRoZSBgcmVqZWN0YCBmdW5jdGlvbiB3aGVuIHRoZSBvcGVyYXRpb24gZmFpbHMuXG5cdFx0ICovXG5cdFx0Y29uc3RydWN0b3IoZXhlY3V0b3I6IEV4ZWN1dG9yPFQ+KSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIElmIHRydWUsIHRoZSByZXNvbHV0aW9uIG9mIHRoaXMgcHJvbWlzZSBpcyBjaGFpbmVkIChcImxvY2tlZCBpblwiKSB0byBhbm90aGVyIHByb21pc2UuXG5cdFx0XHQgKi9cblx0XHRcdGxldCBpc0NoYWluZWQgPSBmYWxzZTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaGV0aGVyIG9yIG5vdCB0aGlzIHByb21pc2UgaXMgaW4gYSByZXNvbHZlZCBzdGF0ZS5cblx0XHRcdCAqL1xuXHRcdFx0Y29uc3QgaXNSZXNvbHZlZCA9ICgpOiBib29sZWFuID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUgIT09IFN0YXRlLlBlbmRpbmcgfHwgaXNDaGFpbmVkO1xuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDYWxsYmFja3MgdGhhdCBzaG91bGQgYmUgaW52b2tlZCBvbmNlIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWQuXG5cdFx0XHQgKi9cblx0XHRcdGxldCBjYWxsYmFja3M6IG51bGwgfCAoQXJyYXk8KCkgPT4gdm9pZD4pID0gW107XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSW5pdGlhbGx5IHB1c2hlcyBjYWxsYmFja3Mgb250byBhIHF1ZXVlIGZvciBleGVjdXRpb24gb25jZSB0aGlzIHByb21pc2Ugc2V0dGxlcy4gQWZ0ZXIgdGhlIHByb21pc2Ugc2V0dGxlcyxcblx0XHRcdCAqIGVucXVldWVzIGNhbGxiYWNrcyBmb3IgZXhlY3V0aW9uIG9uIHRoZSBuZXh0IGV2ZW50IGxvb3AgdHVybi5cblx0XHRcdCAqL1xuXHRcdFx0bGV0IHdoZW5GaW5pc2hlZCA9IGZ1bmN0aW9uKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XG5cdFx0XHRcdGlmIChjYWxsYmFja3MpIHtcblx0XHRcdFx0XHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2V0dGxlcyB0aGlzIHByb21pc2UuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1N0YXRlIFRoZSByZXNvbHZlZCBzdGF0ZSBmb3IgdGhpcyBwcm9taXNlLlxuXHRcdFx0ICogQHBhcmFtIHtUfGFueX0gdmFsdWUgVGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGlzIHByb21pc2UuXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IHNldHRsZSA9IChuZXdTdGF0ZTogU3RhdGUsIHZhbHVlOiBhbnkpOiB2b2lkID0+IHtcblx0XHRcdFx0Ly8gQSBwcm9taXNlIGNhbiBvbmx5IGJlIHNldHRsZWQgb25jZS5cblx0XHRcdFx0aWYgKHRoaXMuc3RhdGUgIT09IFN0YXRlLlBlbmRpbmcpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnN0YXRlID0gbmV3U3RhdGU7XG5cdFx0XHRcdHRoaXMucmVzb2x2ZWRWYWx1ZSA9IHZhbHVlO1xuXHRcdFx0XHR3aGVuRmluaXNoZWQgPSBxdWV1ZU1pY3JvVGFzaztcblxuXHRcdFx0XHQvLyBPbmx5IGVucXVldWUgYSBjYWxsYmFjayBydW5uZXIgaWYgdGhlcmUgYXJlIGNhbGxiYWNrcyBzbyB0aGF0IGluaXRpYWxseSBmdWxmaWxsZWQgUHJvbWlzZXMgZG9uJ3QgaGF2ZSB0b1xuXHRcdFx0XHQvLyB3YWl0IGFuIGV4dHJhIHR1cm4uXG5cdFx0XHRcdGlmIChjYWxsYmFja3MgJiYgY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRxdWV1ZU1pY3JvVGFzayhmdW5jdGlvbigpOiB2b2lkIHtcblx0XHRcdFx0XHRcdGlmIChjYWxsYmFja3MpIHtcblx0XHRcdFx0XHRcdFx0bGV0IGNvdW50ID0gY2FsbGJhY2tzLmxlbmd0aDtcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgKytpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FsbGJhY2tzW2ldLmNhbGwobnVsbCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2tzID0gbnVsbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNvbHZlcyB0aGlzIHByb21pc2UuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1N0YXRlIFRoZSByZXNvbHZlZCBzdGF0ZSBmb3IgdGhpcyBwcm9taXNlLlxuXHRcdFx0ICogQHBhcmFtIHtUfGFueX0gdmFsdWUgVGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGlzIHByb21pc2UuXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IHJlc29sdmUgPSAobmV3U3RhdGU6IFN0YXRlLCB2YWx1ZTogYW55KTogdm9pZCA9PiB7XG5cdFx0XHRcdGlmIChpc1Jlc29sdmVkKCkpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaXNUaGVuYWJsZSh2YWx1ZSkpIHtcblx0XHRcdFx0XHR2YWx1ZS50aGVuKHNldHRsZS5iaW5kKG51bGwsIFN0YXRlLkZ1bGZpbGxlZCksIHNldHRsZS5iaW5kKG51bGwsIFN0YXRlLlJlamVjdGVkKSk7XG5cdFx0XHRcdFx0aXNDaGFpbmVkID0gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzZXR0bGUobmV3U3RhdGUsIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy50aGVuID0gPFRSZXN1bHQxID0gVCwgVFJlc3VsdDIgPSBuZXZlcj4oXG5cdFx0XHRcdG9uRnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4pIHwgdW5kZWZpbmVkIHwgbnVsbCxcblx0XHRcdFx0b25SZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGxcblx0XHRcdCk6IFByb21pc2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4gPT4ge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHRcdC8vIHdoZW5GaW5pc2hlZCBpbml0aWFsbHkgcXVldWVzIHVwIGNhbGxiYWNrcyBmb3IgZXhlY3V0aW9uIGFmdGVyIHRoZSBwcm9taXNlIGhhcyBzZXR0bGVkLiBPbmNlIHRoZVxuXHRcdFx0XHRcdC8vIHByb21pc2UgaGFzIHNldHRsZWQsIHdoZW5GaW5pc2hlZCB3aWxsIHNjaGVkdWxlIGNhbGxiYWNrcyBmb3IgZXhlY3V0aW9uIG9uIHRoZSBuZXh0IHR1cm4gdGhyb3VnaCB0aGVcblx0XHRcdFx0XHQvLyBldmVudCBsb29wLlxuXHRcdFx0XHRcdHdoZW5GaW5pc2hlZCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBjYWxsYmFjazogKCh2YWx1ZT86IGFueSkgPT4gYW55KSB8IHVuZGVmaW5lZCB8IG51bGwgPVxuXHRcdFx0XHRcdFx0XHR0aGlzLnN0YXRlID09PSBTdGF0ZS5SZWplY3RlZCA/IG9uUmVqZWN0ZWQgOiBvbkZ1bGZpbGxlZDtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoY2FsbGJhY2sodGhpcy5yZXNvbHZlZFZhbHVlKSk7XG5cdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5SZWplY3RlZCkge1xuXHRcdFx0XHRcdFx0XHRyZWplY3QodGhpcy5yZXNvbHZlZFZhbHVlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUodGhpcy5yZXNvbHZlZFZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRleGVjdXRvcihyZXNvbHZlLmJpbmQobnVsbCwgU3RhdGUuRnVsZmlsbGVkKSwgcmVzb2x2ZS5iaW5kKG51bGwsIFN0YXRlLlJlamVjdGVkKSk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRzZXR0bGUoU3RhdGUuUmVqZWN0ZWQsIGVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjYXRjaDxUUmVzdWx0ID0gbmV2ZXI+KFxuXHRcdFx0b25SZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQgfCBQcm9taXNlTGlrZTxUUmVzdWx0PikgfCB1bmRlZmluZWQgfCBudWxsXG5cdFx0KTogUHJvbWlzZTxUIHwgVFJlc3VsdD4ge1xuXHRcdFx0cmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBjdXJyZW50IHN0YXRlIG9mIHRoaXMgcHJvbWlzZS5cblx0XHQgKi9cblx0XHRwcml2YXRlIHN0YXRlID0gU3RhdGUuUGVuZGluZztcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhpcyBwcm9taXNlLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUge1R8YW55fVxuXHRcdCAqL1xuXHRcdHByaXZhdGUgcmVzb2x2ZWRWYWx1ZTogYW55O1xuXG5cdFx0dGhlbjogPFRSZXN1bHQxID0gVCwgVFJlc3VsdDIgPSBuZXZlcj4oXG5cdFx0XHRvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsXG5cdFx0XHRvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4pIHwgdW5kZWZpbmVkIHwgbnVsbFxuXHRcdCkgPT4gUHJvbWlzZTxUUmVzdWx0MSB8IFRSZXN1bHQyPjtcblxuXHRcdFtTeW1ib2wudG9TdHJpbmdUYWddOiAnUHJvbWlzZScgPSAnUHJvbWlzZSc7XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNoaW1Qcm9taXNlO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIFByb21pc2UudHMiLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCB7IGlzQXJyYXlMaWtlLCBJdGVyYWJsZSwgSXRlcmFibGVJdGVyYXRvciwgU2hpbUl0ZXJhdG9yIH0gZnJvbSAnLi9pdGVyYXRvcic7XG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xuaW1wb3J0ICcuL1N5bWJvbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0PFQ+IHtcblx0LyoqXG5cdCAqIEFkZHMgYSBgdmFsdWVgIHRvIHRoZSBgU2V0YFxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGFkZCB0byB0aGUgc2V0XG5cdCAqIEByZXR1cm5zIFRoZSBpbnN0YW5jZSBvZiB0aGUgYFNldGBcblx0ICovXG5cdGFkZCh2YWx1ZTogVCk6IHRoaXM7XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIHRoZSB2YWx1ZXMgZnJvbSB0aGUgYFNldGAuXG5cdCAqL1xuXHRjbGVhcigpOiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgYHZhbHVlYCBmcm9tIHRoZSBzZXRcblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBiZSByZW1vdmVkXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgd2FzIHJlbW92ZWRcblx0ICovXG5cdGRlbGV0ZSh2YWx1ZTogVCk6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB5aWVsZHMgZWFjaCBlbnRyeS5cblx0ICpcblx0ICogQHJldHVybiBBbiBpdGVyYXRvciBmb3IgZWFjaCBrZXkvdmFsdWUgcGFpciBpbiB0aGUgaW5zdGFuY2UuXG5cdCAqL1xuXHRlbnRyaWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W1QsIFRdPjtcblxuXHQvKipcblx0ICogRXhlY3V0ZXMgYSBnaXZlbiBmdW5jdGlvbiBmb3IgZWFjaCBzZXQgZW50cnkuIFRoZSBmdW5jdGlvblxuXHQgKiBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiB0aGUgZWxlbWVudCB2YWx1ZSwgdGhlXG5cdCAqIGVsZW1lbnQga2V5LCBhbmQgdGhlIGFzc29jaWF0ZWQgYFNldGAgaW5zdGFuY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBjYWxsYmFja2ZuIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIG1hcCBlbnRyeSxcblx0ICogQHBhcmFtIHRoaXNBcmcgVGhlIHZhbHVlIHRvIHVzZSBmb3IgYHRoaXNgIGZvciBlYWNoIGV4ZWN1dGlvbiBvZiB0aGUgY2FsYmFja1xuXHQgKi9cblx0Zm9yRWFjaChjYWxsYmFja2ZuOiAodmFsdWU6IFQsIHZhbHVlMjogVCwgc2V0OiBTZXQ8VD4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpOiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBJZGVudGlmaWVzIGlmIGEgdmFsdWUgaXMgcGFydCBvZiB0aGUgc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgaXMgcGFydCBvZiB0aGUgc2V0IG90aGVyd2lzZSBgZmFsc2VgXG5cdCAqL1xuXHRoYXModmFsdWU6IFQpOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBEZXNwaXRlIGl0cyBuYW1lLCByZXR1cm5zIGFuIGl0ZXJhYmxlIG9mIHRoZSB2YWx1ZXMgaW4gdGhlIHNldCxcblx0ICovXG5cdGtleXMoKTogSXRlcmFibGVJdGVyYXRvcjxUPjtcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHZhbHVlcyBpbiB0aGUgYFNldGAuXG5cdCAqL1xuXHRyZWFkb25seSBzaXplOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gaXRlcmFibGUgb2YgdmFsdWVzIGluIHRoZSBzZXQuXG5cdCAqL1xuXHR2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxUPjtcblxuXHQvKiogSXRlcmF0ZXMgb3ZlciB2YWx1ZXMgaW4gdGhlIHNldC4gKi9cblx0W1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmFibGVJdGVyYXRvcjxUPjtcblxuXHRyZWFkb25seSBbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ1NldCc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2V0Q29uc3RydWN0b3Ige1xuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBTZXRcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRuZXcgKCk6IFNldDxhbnk+O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFNldFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGl0ZXJhdG9yIFRoZSBpdGVyYWJsZSBzdHJ1Y3R1cmUgdG8gaW5pdGlhbGl6ZSB0aGUgc2V0IHdpdGhcblx0ICovXG5cdG5ldyA8VD4oaXRlcmF0b3I/OiBUW10pOiBTZXQ8VD47XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgU2V0XG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0gaXRlcmF0b3IgVGhlIGl0ZXJhYmxlIHN0cnVjdHVyZSB0byBpbml0aWFsaXplIHRoZSBzZXQgd2l0aFxuXHQgKi9cblx0bmV3IDxUPihpdGVyYXRvcjogSXRlcmFibGU8VD4pOiBTZXQ8VD47XG5cblx0cmVhZG9ubHkgcHJvdG90eXBlOiBTZXQ8YW55Pjtcbn1cblxuZXhwb3J0IGxldCBTZXQ6IFNldENvbnN0cnVjdG9yID0gZ2xvYmFsLlNldDtcblxuaWYgKCFoYXMoJ2VzNi1zZXQnKSkge1xuXHRTZXQgPSBjbGFzcyBTZXQ8VD4ge1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgX3NldERhdGE6IFRbXSA9IFtdO1xuXG5cdFx0c3RhdGljIFtTeW1ib2wuc3BlY2llc10gPSBTZXQ7XG5cblx0XHRjb25zdHJ1Y3RvcihpdGVyYWJsZT86IEFycmF5TGlrZTxUPiB8IEl0ZXJhYmxlPFQ+KSB7XG5cdFx0XHRpZiAoaXRlcmFibGUpIHtcblx0XHRcdFx0aWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSkge1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHRoaXMuYWRkKGl0ZXJhYmxlW2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5hZGQodmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGFkZCh2YWx1ZTogVCk6IHRoaXMge1xuXHRcdFx0aWYgKHRoaXMuaGFzKHZhbHVlKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblx0XHRcdHRoaXMuX3NldERhdGEucHVzaCh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjbGVhcigpOiB2b2lkIHtcblx0XHRcdHRoaXMuX3NldERhdGEubGVuZ3RoID0gMDtcblx0XHR9XG5cblx0XHRkZWxldGUodmFsdWU6IFQpOiBib29sZWFuIHtcblx0XHRcdGNvbnN0IGlkeCA9IHRoaXMuX3NldERhdGEuaW5kZXhPZih2YWx1ZSk7XG5cdFx0XHRpZiAoaWR4ID09PSAtMSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9zZXREYXRhLnNwbGljZShpZHgsIDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0ZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtULCBUXT4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3I8W2FueSwgYW55XT4odGhpcy5fc2V0RGF0YS5tYXA8W2FueSwgYW55XT4oKHZhbHVlKSA9PiBbdmFsdWUsIHZhbHVlXSkpO1xuXHRcdH1cblxuXHRcdGZvckVhY2goY2FsbGJhY2tmbjogKHZhbHVlOiBULCBpbmRleDogVCwgc2V0OiBTZXQ8VD4pID0+IHZvaWQsIHRoaXNBcmc/OiBhbnkpOiB2b2lkIHtcblx0XHRcdGNvbnN0IGl0ZXJhdG9yID0gdGhpcy52YWx1ZXMoKTtcblx0XHRcdGxldCByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG5cdFx0XHR3aGlsZSAoIXJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdGNhbGxiYWNrZm4uY2FsbCh0aGlzQXJnLCByZXN1bHQudmFsdWUsIHJlc3VsdC52YWx1ZSwgdGhpcyk7XG5cdFx0XHRcdHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYXModmFsdWU6IFQpOiBib29sZWFuIHtcblx0XHRcdHJldHVybiB0aGlzLl9zZXREYXRhLmluZGV4T2YodmFsdWUpID4gLTE7XG5cdFx0fVxuXG5cdFx0a2V5cygpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcblx0XHRcdHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX3NldERhdGEpO1xuXHRcdH1cblxuXHRcdGdldCBzaXplKCk6IG51bWJlciB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fc2V0RGF0YS5sZW5ndGg7XG5cdFx0fVxuXG5cdFx0dmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fc2V0RGF0YSk7XG5cdFx0fVxuXG5cdFx0W1N5bWJvbC5pdGVyYXRvcl0oKTogSXRlcmFibGVJdGVyYXRvcjxUPiB7XG5cdFx0XHRyZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih0aGlzLl9zZXREYXRhKTtcblx0XHR9XG5cblx0XHRbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ1NldCcgPSAnU2V0Jztcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgU2V0O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIFNldC50cyIsImltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCB7IGdldFZhbHVlRGVzY3JpcHRvciB9IGZyb20gJy4vc3VwcG9ydC91dGlsJztcblxuZGVjbGFyZSBnbG9iYWwge1xuXHRpbnRlcmZhY2UgU3ltYm9sQ29uc3RydWN0b3Ige1xuXHRcdG9ic2VydmFibGU6IHN5bWJvbDtcblx0fVxufVxuXG5leHBvcnQgbGV0IFN5bWJvbDogU3ltYm9sQ29uc3RydWN0b3IgPSBnbG9iYWwuU3ltYm9sO1xuXG5pZiAoIWhhcygnZXM2LXN5bWJvbCcpKSB7XG5cdC8qKlxuXHQgKiBUaHJvd3MgaWYgdGhlIHZhbHVlIGlzIG5vdCBhIHN5bWJvbCwgdXNlZCBpbnRlcm5hbGx5IHdpdGhpbiB0aGUgU2hpbVxuXHQgKiBAcGFyYW0gIHthbnl9ICAgIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVja1xuXHQgKiBAcmV0dXJuIHtzeW1ib2x9ICAgICAgIFJldHVybnMgdGhlIHN5bWJvbCBvciB0aHJvd3Ncblx0ICovXG5cdGNvbnN0IHZhbGlkYXRlU3ltYm9sID0gZnVuY3Rpb24gdmFsaWRhdGVTeW1ib2wodmFsdWU6IGFueSk6IHN5bWJvbCB7XG5cdFx0aWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IodmFsdWUgKyAnIGlzIG5vdCBhIHN5bWJvbCcpO1xuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH07XG5cblx0Y29uc3QgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xuXHRjb25zdCBkZWZpbmVQcm9wZXJ0eTogKFxuXHRcdG86IGFueSxcblx0XHRwOiBzdHJpbmcgfCBzeW1ib2wsXG5cdFx0YXR0cmlidXRlczogUHJvcGVydHlEZXNjcmlwdG9yICYgVGhpc1R5cGU8YW55PlxuXHQpID0+IGFueSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBhcyBhbnk7XG5cdGNvbnN0IGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cblx0Y29uc3Qgb2JqUHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcblxuXHRjb25zdCBnbG9iYWxTeW1ib2xzOiB7IFtrZXk6IHN0cmluZ106IHN5bWJvbCB9ID0ge307XG5cblx0Y29uc3QgZ2V0U3ltYm9sTmFtZSA9IChmdW5jdGlvbigpIHtcblx0XHRjb25zdCBjcmVhdGVkID0gY3JlYXRlKG51bGwpO1xuXHRcdHJldHVybiBmdW5jdGlvbihkZXNjOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcge1xuXHRcdFx0bGV0IHBvc3RmaXggPSAwO1xuXHRcdFx0bGV0IG5hbWU6IHN0cmluZztcblx0XHRcdHdoaWxlIChjcmVhdGVkW1N0cmluZyhkZXNjKSArIChwb3N0Zml4IHx8ICcnKV0pIHtcblx0XHRcdFx0Kytwb3N0Zml4O1xuXHRcdFx0fVxuXHRcdFx0ZGVzYyArPSBTdHJpbmcocG9zdGZpeCB8fCAnJyk7XG5cdFx0XHRjcmVhdGVkW2Rlc2NdID0gdHJ1ZTtcblx0XHRcdG5hbWUgPSAnQEAnICsgZGVzYztcblxuXHRcdFx0Ly8gRklYTUU6IFRlbXBvcmFyeSBndWFyZCB1bnRpbCB0aGUgZHVwbGljYXRlIGV4ZWN1dGlvbiB3aGVuIHRlc3RpbmcgY2FuIGJlXG5cdFx0XHQvLyBwaW5uZWQgZG93bi5cblx0XHRcdGlmICghT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmpQcm90b3R5cGUsIG5hbWUpKSB7XG5cdFx0XHRcdGRlZmluZVByb3BlcnR5KG9ialByb3RvdHlwZSwgbmFtZSwge1xuXHRcdFx0XHRcdHNldDogZnVuY3Rpb24odGhpczogU3ltYm9sLCB2YWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCBnZXRWYWx1ZURlc2NyaXB0b3IodmFsdWUpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbmFtZTtcblx0XHR9O1xuXHR9KSgpO1xuXG5cdGNvbnN0IEludGVybmFsU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKHRoaXM6IGFueSwgZGVzY3JpcHRpb24/OiBzdHJpbmcgfCBudW1iZXIpOiBzeW1ib2wge1xuXHRcdGlmICh0aGlzIGluc3RhbmNlb2YgSW50ZXJuYWxTeW1ib2wpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1R5cGVFcnJvcjogU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXHRcdHJldHVybiBTeW1ib2woZGVzY3JpcHRpb24pO1xuXHR9O1xuXG5cdFN5bWJvbCA9IGdsb2JhbC5TeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2wodGhpczogU3ltYm9sLCBkZXNjcmlwdGlvbj86IHN0cmluZyB8IG51bWJlcik6IHN5bWJvbCB7XG5cdFx0aWYgKHRoaXMgaW5zdGFuY2VvZiBTeW1ib2wpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1R5cGVFcnJvcjogU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG5cdFx0fVxuXHRcdGNvbnN0IHN5bSA9IE9iamVjdC5jcmVhdGUoSW50ZXJuYWxTeW1ib2wucHJvdG90eXBlKTtcblx0XHRkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyhkZXNjcmlwdGlvbik7XG5cdFx0cmV0dXJuIGRlZmluZVByb3BlcnRpZXMoc3ltLCB7XG5cdFx0XHRfX2Rlc2NyaXB0aW9uX186IGdldFZhbHVlRGVzY3JpcHRvcihkZXNjcmlwdGlvbiksXG5cdFx0XHRfX25hbWVfXzogZ2V0VmFsdWVEZXNjcmlwdG9yKGdldFN5bWJvbE5hbWUoZGVzY3JpcHRpb24pKVxuXHRcdH0pO1xuXHR9IGFzIFN5bWJvbENvbnN0cnVjdG9yO1xuXG5cdC8qIERlY29yYXRlIHRoZSBTeW1ib2wgZnVuY3Rpb24gd2l0aCB0aGUgYXBwcm9wcmlhdGUgcHJvcGVydGllcyAqL1xuXHRkZWZpbmVQcm9wZXJ0eShcblx0XHRTeW1ib2wsXG5cdFx0J2ZvcicsXG5cdFx0Z2V0VmFsdWVEZXNjcmlwdG9yKGZ1bmN0aW9uKGtleTogc3RyaW5nKTogc3ltYm9sIHtcblx0XHRcdGlmIChnbG9iYWxTeW1ib2xzW2tleV0pIHtcblx0XHRcdFx0cmV0dXJuIGdsb2JhbFN5bWJvbHNba2V5XTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAoZ2xvYmFsU3ltYm9sc1trZXldID0gU3ltYm9sKFN0cmluZyhrZXkpKSk7XG5cdFx0fSlcblx0KTtcblx0ZGVmaW5lUHJvcGVydGllcyhTeW1ib2wsIHtcblx0XHRrZXlGb3I6IGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbihzeW06IHN5bWJvbCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0XHRsZXQga2V5OiBzdHJpbmc7XG5cdFx0XHR2YWxpZGF0ZVN5bWJvbChzeW0pO1xuXHRcdFx0Zm9yIChrZXkgaW4gZ2xvYmFsU3ltYm9scykge1xuXHRcdFx0XHRpZiAoZ2xvYmFsU3ltYm9sc1trZXldID09PSBzeW0pIHtcblx0XHRcdFx0XHRyZXR1cm4ga2V5O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSksXG5cdFx0aGFzSW5zdGFuY2U6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdoYXNJbnN0YW5jZScpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdGlzQ29uY2F0U3ByZWFkYWJsZTogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ2lzQ29uY2F0U3ByZWFkYWJsZScpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdGl0ZXJhdG9yOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignaXRlcmF0b3InKSwgZmFsc2UsIGZhbHNlKSxcblx0XHRtYXRjaDogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ21hdGNoJyksIGZhbHNlLCBmYWxzZSksXG5cdFx0b2JzZXJ2YWJsZTogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ29ic2VydmFibGUnKSwgZmFsc2UsIGZhbHNlKSxcblx0XHRyZXBsYWNlOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcigncmVwbGFjZScpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdHNlYXJjaDogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3NlYXJjaCcpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdHNwZWNpZXM6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdzcGVjaWVzJyksIGZhbHNlLCBmYWxzZSksXG5cdFx0c3BsaXQ6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdzcGxpdCcpLCBmYWxzZSwgZmFsc2UpLFxuXHRcdHRvUHJpbWl0aXZlOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcigndG9QcmltaXRpdmUnKSwgZmFsc2UsIGZhbHNlKSxcblx0XHR0b1N0cmluZ1RhZzogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3RvU3RyaW5nVGFnJyksIGZhbHNlLCBmYWxzZSksXG5cdFx0dW5zY29wYWJsZXM6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCd1bnNjb3BhYmxlcycpLCBmYWxzZSwgZmFsc2UpXG5cdH0pO1xuXG5cdC8qIERlY29yYXRlIHRoZSBJbnRlcm5hbFN5bWJvbCBvYmplY3QgKi9cblx0ZGVmaW5lUHJvcGVydGllcyhJbnRlcm5hbFN5bWJvbC5wcm90b3R5cGUsIHtcblx0XHRjb25zdHJ1Y3RvcjogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbCksXG5cdFx0dG9TdHJpbmc6IGdldFZhbHVlRGVzY3JpcHRvcihcblx0XHRcdGZ1bmN0aW9uKHRoaXM6IHsgX19uYW1lX186IHN0cmluZyB9KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fbmFtZV9fO1xuXHRcdFx0fSxcblx0XHRcdGZhbHNlLFxuXHRcdFx0ZmFsc2Vcblx0XHQpXG5cdH0pO1xuXG5cdC8qIERlY29yYXRlIHRoZSBTeW1ib2wucHJvdG90eXBlICovXG5cdGRlZmluZVByb3BlcnRpZXMoU3ltYm9sLnByb3RvdHlwZSwge1xuXHRcdHRvU3RyaW5nOiBnZXRWYWx1ZURlc2NyaXB0b3IoZnVuY3Rpb24odGhpczogU3ltYm9sKSB7XG5cdFx0XHRyZXR1cm4gJ1N5bWJvbCAoJyArICh2YWxpZGF0ZVN5bWJvbCh0aGlzKSBhcyBhbnkpLl9fZGVzY3JpcHRpb25fXyArICcpJztcblx0XHR9KSxcblx0XHR2YWx1ZU9mOiBnZXRWYWx1ZURlc2NyaXB0b3IoZnVuY3Rpb24odGhpczogU3ltYm9sKSB7XG5cdFx0XHRyZXR1cm4gdmFsaWRhdGVTeW1ib2wodGhpcyk7XG5cdFx0fSlcblx0fSk7XG5cblx0ZGVmaW5lUHJvcGVydHkoXG5cdFx0U3ltYm9sLnByb3RvdHlwZSxcblx0XHRTeW1ib2wudG9QcmltaXRpdmUsXG5cdFx0Z2V0VmFsdWVEZXNjcmlwdG9yKGZ1bmN0aW9uKHRoaXM6IFN5bWJvbCkge1xuXHRcdFx0cmV0dXJuIHZhbGlkYXRlU3ltYm9sKHRoaXMpO1xuXHRcdH0pXG5cdCk7XG5cdGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsIFN5bWJvbC50b1N0cmluZ1RhZywgZ2V0VmFsdWVEZXNjcmlwdG9yKCdTeW1ib2wnLCBmYWxzZSwgZmFsc2UsIHRydWUpKTtcblxuXHRkZWZpbmVQcm9wZXJ0eShcblx0XHRJbnRlcm5hbFN5bWJvbC5wcm90b3R5cGUsXG5cdFx0U3ltYm9sLnRvUHJpbWl0aXZlLFxuXHRcdGdldFZhbHVlRGVzY3JpcHRvcigoU3ltYm9sIGFzIGFueSkucHJvdG90eXBlW1N5bWJvbC50b1ByaW1pdGl2ZV0sIGZhbHNlLCBmYWxzZSwgdHJ1ZSlcblx0KTtcblx0ZGVmaW5lUHJvcGVydHkoXG5cdFx0SW50ZXJuYWxTeW1ib2wucHJvdG90eXBlLFxuXHRcdFN5bWJvbC50b1N0cmluZ1RhZyxcblx0XHRnZXRWYWx1ZURlc2NyaXB0b3IoKFN5bWJvbCBhcyBhbnkpLnByb3RvdHlwZVtTeW1ib2wudG9TdHJpbmdUYWddLCBmYWxzZSwgZmFsc2UsIHRydWUpXG5cdCk7XG59XG5cbi8qKlxuICogQSBjdXN0b20gZ3VhcmQgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGlmIGFuIG9iamVjdCBpcyBhIHN5bWJvbCBvciBub3RcbiAqIEBwYXJhbSAge2FueX0gICAgICAgdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIHN5bWJvbCBvciBub3RcbiAqIEByZXR1cm4ge2lzIHN5bWJvbH0gICAgICAgUmV0dXJucyB0cnVlIGlmIGEgc3ltYm9sIG9yIG5vdCAoYW5kIG5hcnJvd3MgdGhlIHR5cGUgZ3VhcmQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZTogYW55KTogdmFsdWUgaXMgc3ltYm9sIHtcblx0cmV0dXJuICh2YWx1ZSAmJiAodHlwZW9mIHZhbHVlID09PSAnc3ltYm9sJyB8fCB2YWx1ZVsnQEB0b1N0cmluZ1RhZyddID09PSAnU3ltYm9sJykpIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIEZpbGwgYW55IG1pc3Npbmcgd2VsbCBrbm93biBzeW1ib2xzIGlmIHRoZSBuYXRpdmUgU3ltYm9sIGlzIG1pc3NpbmcgdGhlbVxuICovXG5bXG5cdCdoYXNJbnN0YW5jZScsXG5cdCdpc0NvbmNhdFNwcmVhZGFibGUnLFxuXHQnaXRlcmF0b3InLFxuXHQnc3BlY2llcycsXG5cdCdyZXBsYWNlJyxcblx0J3NlYXJjaCcsXG5cdCdzcGxpdCcsXG5cdCdtYXRjaCcsXG5cdCd0b1ByaW1pdGl2ZScsXG5cdCd0b1N0cmluZ1RhZycsXG5cdCd1bnNjb3BhYmxlcycsXG5cdCdvYnNlcnZhYmxlJ1xuXS5mb3JFYWNoKCh3ZWxsS25vd24pID0+IHtcblx0aWYgKCEoU3ltYm9sIGFzIGFueSlbd2VsbEtub3duXSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTeW1ib2wsIHdlbGxLbm93biwgZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3Iod2VsbEtub3duKSwgZmFsc2UsIGZhbHNlKSk7XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTeW1ib2w7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gU3ltYm9sLnRzIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgeyBpc0FycmF5TGlrZSwgSXRlcmFibGUgfSBmcm9tICcuL2l0ZXJhdG9yJztcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XG5pbXBvcnQgJy4vU3ltYm9sJztcblxuZXhwb3J0IGludGVyZmFjZSBXZWFrTWFwPEsgZXh0ZW5kcyBvYmplY3QsIFY+IHtcblx0LyoqXG5cdCAqIFJlbW92ZSBhIGBrZXlgIGZyb20gdGhlIG1hcFxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gcmVtb3ZlXG5cdCAqIEByZXR1cm4gYHRydWVgIGlmIHRoZSB2YWx1ZSB3YXMgcmVtb3ZlZCwgb3RoZXJ3aXNlIGBmYWxzZWBcblx0ICovXG5cdGRlbGV0ZShrZXk6IEspOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgdmFsdWUsIGJhc2VkIG9uIHRoZSBzdXBwbGllZCBga2V5YFxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gcmV0cmlldmUgdGhlIGB2YWx1ZWAgZm9yXG5cdCAqIEByZXR1cm4gdGhlIGB2YWx1ZWAgYmFzZWQgb24gdGhlIGBrZXlgIGlmIGZvdW5kLCBvdGhlcndpc2UgYGZhbHNlYFxuXHQgKi9cblx0Z2V0KGtleTogSyk6IFYgfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIERldGVybWluZXMgaWYgYSBga2V5YCBpcyBwcmVzZW50IGluIHRoZSBtYXBcblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUgYGtleWAgdG8gY2hlY2tcblx0ICogQHJldHVybiBgdHJ1ZWAgaWYgdGhlIGtleSBpcyBwYXJ0IG9mIHRoZSBtYXAsIG90aGVyd2lzZSBgZmFsc2VgLlxuXHQgKi9cblx0aGFzKGtleTogSyk6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNldCBhIGB2YWx1ZWAgZm9yIGEgcGFydGljdWxhciBga2V5YC5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUgYGtleWAgdG8gc2V0IHRoZSBgdmFsdWVgIGZvclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIGB2YWx1ZWAgdG8gc2V0XG5cdCAqIEByZXR1cm4gdGhlIGluc3RhbmNlc1xuXHQgKi9cblx0c2V0KGtleTogSywgdmFsdWU6IFYpOiB0aGlzO1xuXG5cdHJlYWRvbmx5IFtTeW1ib2wudG9TdHJpbmdUYWddOiAnV2Vha01hcCc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2Vha01hcENvbnN0cnVjdG9yIHtcblx0LyoqXG5cdCAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIGBXZWFrTWFwYFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdG5ldyAoKTogV2Vha01hcDxvYmplY3QsIGFueT47XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIGBXZWFrTWFwYFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGl0ZXJhYmxlIEFuIGl0ZXJhYmxlIHRoYXQgY29udGFpbnMgeWllbGRzIHVwIGtleS92YWx1ZSBwYWlyIGVudHJpZXNcblx0ICovXG5cdG5ldyA8SyBleHRlbmRzIG9iamVjdCwgVj4oaXRlcmFibGU/OiBbSywgVl1bXSk6IFdlYWtNYXA8SywgVj47XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhIGBXZWFrTWFwYFxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGl0ZXJhYmxlIEFuIGl0ZXJhYmxlIHRoYXQgY29udGFpbnMgeWllbGRzIHVwIGtleS92YWx1ZSBwYWlyIGVudHJpZXNcblx0ICovXG5cdG5ldyA8SyBleHRlbmRzIG9iamVjdCwgVj4oaXRlcmFibGU6IEl0ZXJhYmxlPFtLLCBWXT4pOiBXZWFrTWFwPEssIFY+O1xuXG5cdHJlYWRvbmx5IHByb3RvdHlwZTogV2Vha01hcDxvYmplY3QsIGFueT47XG59XG5cbmV4cG9ydCBsZXQgV2Vha01hcDogV2Vha01hcENvbnN0cnVjdG9yID0gZ2xvYmFsLldlYWtNYXA7XG5cbmludGVyZmFjZSBFbnRyeTxLLCBWPiB7XG5cdGtleTogSztcblx0dmFsdWU6IFY7XG59XG5cbmlmICghaGFzKCdlczYtd2Vha21hcCcpKSB7XG5cdGNvbnN0IERFTEVURUQ6IGFueSA9IHt9O1xuXG5cdGNvbnN0IGdldFVJRCA9IGZ1bmN0aW9uIGdldFVJRCgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDApO1xuXHR9O1xuXG5cdGNvbnN0IGdlbmVyYXRlTmFtZSA9IChmdW5jdGlvbigpIHtcblx0XHRsZXQgc3RhcnRJZCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAlIDEwMDAwMDAwMCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gZ2VuZXJhdGVOYW1lKCk6IHN0cmluZyB7XG5cdFx0XHRyZXR1cm4gJ19fd20nICsgZ2V0VUlEKCkgKyAoc3RhcnRJZCsrICsgJ19fJyk7XG5cdFx0fTtcblx0fSkoKTtcblxuXHRXZWFrTWFwID0gY2xhc3MgV2Vha01hcDxLLCBWPiB7XG5cdFx0cHJpdmF0ZSByZWFkb25seSBfbmFtZTogc3RyaW5nO1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgX2Zyb3plbkVudHJpZXM6IEVudHJ5PEssIFY+W107XG5cblx0XHRjb25zdHJ1Y3RvcihpdGVyYWJsZT86IEFycmF5TGlrZTxbSywgVl0+IHwgSXRlcmFibGU8W0ssIFZdPikge1xuXHRcdFx0dGhpcy5fbmFtZSA9IGdlbmVyYXRlTmFtZSgpO1xuXG5cdFx0XHR0aGlzLl9mcm96ZW5FbnRyaWVzID0gW107XG5cblx0XHRcdGlmIChpdGVyYWJsZSkge1xuXHRcdFx0XHRpZiAoaXNBcnJheUxpa2UoaXRlcmFibGUpKSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Y29uc3QgaXRlbSA9IGl0ZXJhYmxlW2ldO1xuXHRcdFx0XHRcdFx0dGhpcy5zZXQoaXRlbVswXSwgaXRlbVsxXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGl0ZXJhYmxlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnNldChrZXksIHZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRwcml2YXRlIF9nZXRGcm96ZW5FbnRyeUluZGV4KGtleTogYW55KTogbnVtYmVyIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZnJvemVuRW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAodGhpcy5fZnJvemVuRW50cmllc1tpXS5rZXkgPT09IGtleSkge1xuXHRcdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cblx0XHRkZWxldGUoa2V5OiBhbnkpOiBib29sZWFuIHtcblx0XHRcdGlmIChrZXkgPT09IHVuZGVmaW5lZCB8fCBrZXkgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBlbnRyeTogRW50cnk8SywgVj4gPSBrZXlbdGhpcy5fbmFtZV07XG5cdFx0XHRpZiAoZW50cnkgJiYgZW50cnkua2V5ID09PSBrZXkgJiYgZW50cnkudmFsdWUgIT09IERFTEVURUQpIHtcblx0XHRcdFx0ZW50cnkudmFsdWUgPSBERUxFVEVEO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZnJvemVuSW5kZXggPSB0aGlzLl9nZXRGcm96ZW5FbnRyeUluZGV4KGtleSk7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggPj0gMCkge1xuXHRcdFx0XHR0aGlzLl9mcm96ZW5FbnRyaWVzLnNwbGljZShmcm96ZW5JbmRleCwgMSk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Z2V0KGtleTogYW55KTogViB8IHVuZGVmaW5lZCB7XG5cdFx0XHRpZiAoa2V5ID09PSB1bmRlZmluZWQgfHwga2V5ID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGVudHJ5OiBFbnRyeTxLLCBWPiA9IGtleVt0aGlzLl9uYW1lXTtcblx0XHRcdGlmIChlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCkge1xuXHRcdFx0XHRyZXR1cm4gZW50cnkudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGZyb3plbkluZGV4ID0gdGhpcy5fZ2V0RnJvemVuRW50cnlJbmRleChrZXkpO1xuXHRcdFx0aWYgKGZyb3plbkluZGV4ID49IDApIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2Zyb3plbkVudHJpZXNbZnJvemVuSW5kZXhdLnZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhcyhrZXk6IGFueSk6IGJvb2xlYW4ge1xuXHRcdFx0aWYgKGtleSA9PT0gdW5kZWZpbmVkIHx8IGtleSA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGVudHJ5OiBFbnRyeTxLLCBWPiA9IGtleVt0aGlzLl9uYW1lXTtcblx0XHRcdGlmIChCb29sZWFuKGVudHJ5ICYmIGVudHJ5LmtleSA9PT0ga2V5ICYmIGVudHJ5LnZhbHVlICE9PSBERUxFVEVEKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZnJvemVuSW5kZXggPSB0aGlzLl9nZXRGcm96ZW5FbnRyeUluZGV4KGtleSk7XG5cdFx0XHRpZiAoZnJvemVuSW5kZXggPj0gMCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHNldChrZXk6IGFueSwgdmFsdWU/OiBhbnkpOiB0aGlzIHtcblx0XHRcdGlmICgha2V5IHx8ICh0eXBlb2Yga2V5ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Yga2V5ICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHZhbHVlIHVzZWQgYXMgd2VhayBtYXAga2V5Jyk7XG5cdFx0XHR9XG5cdFx0XHRsZXQgZW50cnk6IEVudHJ5PEssIFY+ID0ga2V5W3RoaXMuX25hbWVdO1xuXHRcdFx0aWYgKCFlbnRyeSB8fCBlbnRyeS5rZXkgIT09IGtleSkge1xuXHRcdFx0XHRlbnRyeSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuXHRcdFx0XHRcdGtleTogeyB2YWx1ZToga2V5IH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKE9iamVjdC5pc0Zyb3plbihrZXkpKSB7XG5cdFx0XHRcdFx0dGhpcy5fZnJvemVuRW50cmllcy5wdXNoKGVudHJ5KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoa2V5LCB0aGlzLl9uYW1lLCB7XG5cdFx0XHRcdFx0XHR2YWx1ZTogZW50cnlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZW50cnkudmFsdWUgPSB2YWx1ZTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdFtTeW1ib2wudG9TdHJpbmdUYWddOiAnV2Vha01hcCcgPSAnV2Vha01hcCc7XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYWtNYXA7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gV2Vha01hcC50cyIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuaW1wb3J0IHsgaXNBcnJheUxpa2UsIGlzSXRlcmFibGUsIEl0ZXJhYmxlIH0gZnJvbSAnLi9pdGVyYXRvcic7XG5pbXBvcnQgeyBNQVhfU0FGRV9JTlRFR0VSIH0gZnJvbSAnLi9udW1iZXInO1xuaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcbmltcG9ydCB7IHdyYXBOYXRpdmUgfSBmcm9tICcuL3N1cHBvcnQvdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFwQ2FsbGJhY2s8VCwgVT4ge1xuXHQvKipcblx0ICogQSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIG1hcHBpbmdcblx0ICpcblx0ICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgbWFwcGVkXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgY3VycmVudCBpbmRleCBvZiB0aGUgZWxlbWVudFxuXHQgKi9cblx0KGVsZW1lbnQ6IFQsIGluZGV4OiBudW1iZXIpOiBVO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbmRDYWxsYmFjazxUPiB7XG5cdC8qKlxuXHQgKiBBIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gdXNpbmcgZmluZFxuXHQgKlxuXHQgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IGlzIGN1cnJlbnR5IGJlaW5nIGFuYWx5c2VkXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgY3VycmVudCBpbmRleCBvZiB0aGUgZWxlbWVudCB0aGF0IGlzIGJlaW5nIGFuYWx5c2VkXG5cdCAqIEBwYXJhbSBhcnJheSBUaGUgc291cmNlIGFycmF5XG5cdCAqL1xuXHQoZWxlbWVudDogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IEFycmF5TGlrZTxUPik6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBXcml0YWJsZUFycmF5TGlrZTxUPiB7XG5cdHJlYWRvbmx5IGxlbmd0aDogbnVtYmVyO1xuXHRbbjogbnVtYmVyXTogVDtcbn1cblxuLyogRVM2IEFycmF5IHN0YXRpYyBtZXRob2RzICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgRnJvbSB7XG5cdC8qKlxuXHQgKiBUaGUgQXJyYXkuZnJvbSgpIG1ldGhvZCBjcmVhdGVzIGEgbmV3IEFycmF5IGluc3RhbmNlIGZyb20gYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBzb3VyY2UgQW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QgdG8gY29udmVydCB0byBhbiBhcnJheVxuXHQgKiBAcGFyYW0gbWFwRnVuY3Rpb24gQSBtYXAgZnVuY3Rpb24gdG8gY2FsbCBvbiBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5XG5cdCAqIEBwYXJhbSB0aGlzQXJnIFRoZSBleGVjdXRpb24gY29udGV4dCBmb3IgdGhlIG1hcCBmdW5jdGlvblxuXHQgKiBAcmV0dXJuIFRoZSBuZXcgQXJyYXlcblx0ICovXG5cdDxULCBVPihzb3VyY2U6IEFycmF5TGlrZTxUPiB8IEl0ZXJhYmxlPFQ+LCBtYXBGdW5jdGlvbjogTWFwQ2FsbGJhY2s8VCwgVT4sIHRoaXNBcmc/OiBhbnkpOiBBcnJheTxVPjtcblxuXHQvKipcblx0ICogVGhlIEFycmF5LmZyb20oKSBtZXRob2QgY3JlYXRlcyBhIG5ldyBBcnJheSBpbnN0YW5jZSBmcm9tIGFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc291cmNlIEFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0IHRvIGNvbnZlcnQgdG8gYW4gYXJyYXlcblx0ICogQHJldHVybiBUaGUgbmV3IEFycmF5XG5cdCAqL1xuXHQ8VD4oc291cmNlOiBBcnJheUxpa2U8VD4gfCBJdGVyYWJsZTxUPik6IEFycmF5PFQ+O1xufVxuXG5leHBvcnQgbGV0IGZyb206IEZyb207XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBhcnJheSBmcm9tIHRoZSBmdW5jdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSBhcmd1bWVudHMgQW55IG51bWJlciBvZiBhcmd1bWVudHMgZm9yIHRoZSBhcnJheVxuICogQHJldHVybiBBbiBhcnJheSBmcm9tIHRoZSBnaXZlbiBhcmd1bWVudHNcbiAqL1xuZXhwb3J0IGxldCBvZjogPFQ+KC4uLml0ZW1zOiBUW10pID0+IEFycmF5PFQ+O1xuXG4vKiBFUzYgQXJyYXkgaW5zdGFuY2UgbWV0aG9kcyAqL1xuXG4vKipcbiAqIENvcGllcyBkYXRhIGludGVybmFsbHkgd2l0aGluIGFuIGFycmF5IG9yIGFycmF5LWxpa2Ugb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBhcnJheS1saWtlIG9iamVjdFxuICogQHBhcmFtIG9mZnNldCBUaGUgaW5kZXggdG8gc3RhcnQgY29weWluZyB2YWx1ZXMgdG87IGlmIG5lZ2F0aXZlLCBpdCBjb3VudHMgYmFja3dhcmRzIGZyb20gbGVuZ3RoXG4gKiBAcGFyYW0gc3RhcnQgVGhlIGZpcnN0IChpbmNsdXNpdmUpIGluZGV4IHRvIGNvcHk7IGlmIG5lZ2F0aXZlLCBpdCBjb3VudHMgYmFja3dhcmRzIGZyb20gbGVuZ3RoXG4gKiBAcGFyYW0gZW5kIFRoZSBsYXN0IChleGNsdXNpdmUpIGluZGV4IHRvIGNvcHk7IGlmIG5lZ2F0aXZlLCBpdCBjb3VudHMgYmFja3dhcmRzIGZyb20gbGVuZ3RoXG4gKiBAcmV0dXJuIFRoZSB0YXJnZXRcbiAqL1xuZXhwb3J0IGxldCBjb3B5V2l0aGluOiA8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIG9mZnNldDogbnVtYmVyLCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpID0+IEFycmF5TGlrZTxUPjtcblxuLyoqXG4gKiBGaWxscyBlbGVtZW50cyBvZiBhbiBhcnJheS1saWtlIG9iamVjdCB3aXRoIHRoZSBzcGVjaWZpZWQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHRvIGZpbGxcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZmlsbCBlYWNoIGVsZW1lbnQgb2YgdGhlIHRhcmdldCB3aXRoXG4gKiBAcGFyYW0gc3RhcnQgVGhlIGZpcnN0IGluZGV4IHRvIGZpbGxcbiAqIEBwYXJhbSBlbmQgVGhlIChleGNsdXNpdmUpIGluZGV4IGF0IHdoaWNoIHRvIHN0b3AgZmlsbGluZ1xuICogQHJldHVybiBUaGUgZmlsbGVkIHRhcmdldFxuICovXG5leHBvcnQgbGV0IGZpbGw6IDxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgdmFsdWU6IFQsIHN0YXJ0PzogbnVtYmVyLCBlbmQ/OiBudW1iZXIpID0+IEFycmF5TGlrZTxUPjtcblxuLyoqXG4gKiBGaW5kcyBhbmQgcmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2UgbWF0Y2hpbmcgdGhlIGNhbGxiYWNrIG9yIHVuZGVmaW5lZCBpZiBvbmUgaXMgbm90IGZvdW5kLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgQW4gYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBjYWxsYmFjayBBIGZ1bmN0aW9uIHJldHVybmluZyBpZiB0aGUgY3VycmVudCB2YWx1ZSBtYXRjaGVzIGEgY3JpdGVyaWFcbiAqIEBwYXJhbSB0aGlzQXJnIFRoZSBleGVjdXRpb24gY29udGV4dCBmb3IgdGhlIGZpbmQgZnVuY3Rpb25cbiAqIEByZXR1cm4gVGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGNhbGxiYWNrLCBvciB1bmRlZmluZWQgaWYgb25lIGRvZXMgbm90IGV4aXN0XG4gKi9cbmV4cG9ydCBsZXQgZmluZDogPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCBjYWxsYmFjazogRmluZENhbGxiYWNrPFQ+LCB0aGlzQXJnPzoge30pID0+IFQgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgc2VhcmNoIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBpbmRleCB3aG9zZSB2YWx1ZSBzYXRpc2ZpZXMgdGhlIHBhc3NlZCBjYWxsYmFjayxcbiAqIG9yIC0xIGlmIG5vIHZhbHVlcyBzYXRpc2Z5IGl0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgQW4gYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBjYWxsYmFjayBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIGlmIHRoZSBjdXJyZW50IHZhbHVlIHNhdGlzZmllcyBpdHMgY3JpdGVyaWFcbiAqIEBwYXJhbSB0aGlzQXJnIFRoZSBleGVjdXRpb24gY29udGV4dCBmb3IgdGhlIGZpbmQgZnVuY3Rpb25cbiAqIEByZXR1cm4gVGhlIGZpcnN0IGluZGV4IHdob3NlIHZhbHVlIHNhdGlzZmllcyB0aGUgcGFzc2VkIGNhbGxiYWNrLCBvciAtMSBpZiBubyB2YWx1ZXMgc2F0aXNmeSBpdFxuICovXG5leHBvcnQgbGV0IGZpbmRJbmRleDogPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCBjYWxsYmFjazogRmluZENhbGxiYWNrPFQ+LCB0aGlzQXJnPzoge30pID0+IG51bWJlcjtcblxuLyogRVM3IEFycmF5IGluc3RhbmNlIG1ldGhvZHMgKi9cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gYXJyYXkgaW5jbHVkZXMgYSBnaXZlbiB2YWx1ZVxuICpcbiAqIEBwYXJhbSB0YXJnZXQgdGhlIHRhcmdldCBhcnJheS1saWtlIG9iamVjdFxuICogQHBhcmFtIHNlYXJjaEVsZW1lbnQgdGhlIGl0ZW0gdG8gc2VhcmNoIGZvclxuICogQHBhcmFtIGZyb21JbmRleCB0aGUgc3RhcnRpbmcgaW5kZXggdG8gc2VhcmNoIGZyb21cbiAqIEByZXR1cm4gYHRydWVgIGlmIHRoZSBhcnJheSBpbmNsdWRlcyB0aGUgZWxlbWVudCwgb3RoZXJ3aXNlIGBmYWxzZWBcbiAqL1xuZXhwb3J0IGxldCBpbmNsdWRlczogPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCBzZWFyY2hFbGVtZW50OiBULCBmcm9tSW5kZXg/OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbmlmIChoYXMoJ2VzNi1hcnJheScpICYmIGhhcygnZXM2LWFycmF5LWZpbGwnKSkge1xuXHRmcm9tID0gZ2xvYmFsLkFycmF5LmZyb207XG5cdG9mID0gZ2xvYmFsLkFycmF5Lm9mO1xuXHRjb3B5V2l0aGluID0gd3JhcE5hdGl2ZShnbG9iYWwuQXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4pO1xuXHRmaWxsID0gd3JhcE5hdGl2ZShnbG9iYWwuQXJyYXkucHJvdG90eXBlLmZpbGwpO1xuXHRmaW5kID0gd3JhcE5hdGl2ZShnbG9iYWwuQXJyYXkucHJvdG90eXBlLmZpbmQpO1xuXHRmaW5kSW5kZXggPSB3cmFwTmF0aXZlKGdsb2JhbC5BcnJheS5wcm90b3R5cGUuZmluZEluZGV4KTtcbn0gZWxzZSB7XG5cdC8vIEl0IGlzIG9ubHkgb2xkZXIgdmVyc2lvbnMgb2YgU2FmYXJpL2lPUyB0aGF0IGhhdmUgYSBiYWQgZmlsbCBpbXBsZW1lbnRhdGlvbiBhbmQgc28gYXJlbid0IGluIHRoZSB3aWxkXG5cdC8vIFRvIG1ha2UgdGhpbmdzIGVhc2llciwgaWYgdGhlcmUgaXMgYSBiYWQgZmlsbCBpbXBsZW1lbnRhdGlvbiwgdGhlIHdob2xlIHNldCBvZiBmdW5jdGlvbnMgd2lsbCBiZSBmaWxsZWRcblxuXHQvKipcblx0ICogRW5zdXJlcyBhIG5vbi1uZWdhdGl2ZSwgbm9uLWluZmluaXRlLCBzYWZlIGludGVnZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBsZW5ndGggVGhlIG51bWJlciB0byB2YWxpZGF0ZVxuXHQgKiBAcmV0dXJuIEEgcHJvcGVyIGxlbmd0aFxuXHQgKi9cblx0Y29uc3QgdG9MZW5ndGggPSBmdW5jdGlvbiB0b0xlbmd0aChsZW5ndGg6IG51bWJlcik6IG51bWJlciB7XG5cdFx0aWYgKGlzTmFOKGxlbmd0aCkpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblxuXHRcdGxlbmd0aCA9IE51bWJlcihsZW5ndGgpO1xuXHRcdGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG5cdFx0XHRsZW5ndGggPSBNYXRoLmZsb29yKGxlbmd0aCk7XG5cdFx0fVxuXHRcdC8vIEVuc3VyZSBhIG5vbi1uZWdhdGl2ZSwgcmVhbCwgc2FmZSBpbnRlZ2VyXG5cdFx0cmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbmd0aCwgMCksIE1BWF9TQUZFX0lOVEVHRVIpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBGcm9tIEVTNiA3LjEuNCBUb0ludGVnZXIoKVxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgQSB2YWx1ZSB0byBjb252ZXJ0XG5cdCAqIEByZXR1cm4gQW4gaW50ZWdlclxuXHQgKi9cblx0Y29uc3QgdG9JbnRlZ2VyID0gZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlOiBhbnkpOiBudW1iZXIge1xuXHRcdHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblx0XHRpZiAoaXNOYU4odmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9XG5cdFx0aWYgKHZhbHVlID09PSAwIHx8ICFpc0Zpbml0ZSh2YWx1ZSkpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKHZhbHVlID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKHZhbHVlKSk7XG5cdH07XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZXMgYW4gb2Zmc2V0IGFnYWluc3QgYSBnaXZlbiBsZW5ndGgsIHdyYXBwaW5nIGl0IGlmIG5lZ2F0aXZlLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIG9yaWdpbmFsIG9mZnNldFxuXHQgKiBAcGFyYW0gbGVuZ3RoIFRoZSB0b3RhbCBsZW5ndGggdG8gbm9ybWFsaXplIGFnYWluc3Rcblx0ICogQHJldHVybiBJZiBuZWdhdGl2ZSwgcHJvdmlkZSBhIGRpc3RhbmNlIGZyb20gdGhlIGVuZCAobGVuZ3RoKTsgb3RoZXJ3aXNlIHByb3ZpZGUgYSBkaXN0YW5jZSBmcm9tIDBcblx0ICovXG5cdGNvbnN0IG5vcm1hbGl6ZU9mZnNldCA9IGZ1bmN0aW9uIG5vcm1hbGl6ZU9mZnNldCh2YWx1ZTogbnVtYmVyLCBsZW5ndGg6IG51bWJlcik6IG51bWJlciB7XG5cdFx0cmV0dXJuIHZhbHVlIDwgMCA/IE1hdGgubWF4KGxlbmd0aCArIHZhbHVlLCAwKSA6IE1hdGgubWluKHZhbHVlLCBsZW5ndGgpO1xuXHR9O1xuXG5cdGZyb20gPSBmdW5jdGlvbiBmcm9tKFxuXHRcdHRoaXM6IEFycmF5Q29uc3RydWN0b3IsXG5cdFx0YXJyYXlMaWtlOiBJdGVyYWJsZTxhbnk+IHwgQXJyYXlMaWtlPGFueT4sXG5cdFx0bWFwRnVuY3Rpb24/OiBNYXBDYWxsYmFjazxhbnksIGFueT4sXG5cdFx0dGhpc0FyZz86IGFueVxuXHQpOiBBcnJheTxhbnk+IHtcblx0XHRpZiAoYXJyYXlMaWtlID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2Zyb206IHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0Jyk7XG5cdFx0fVxuXG5cdFx0aWYgKG1hcEZ1bmN0aW9uICYmIHRoaXNBcmcpIHtcblx0XHRcdG1hcEZ1bmN0aW9uID0gbWFwRnVuY3Rpb24uYmluZCh0aGlzQXJnKTtcblx0XHR9XG5cblx0XHQvKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFyaWFibGUtbmFtZSAqL1xuXHRcdGNvbnN0IENvbnN0cnVjdG9yID0gdGhpcztcblx0XHRjb25zdCBsZW5ndGg6IG51bWJlciA9IHRvTGVuZ3RoKChhcnJheUxpa2UgYXMgYW55KS5sZW5ndGgpO1xuXG5cdFx0Ly8gU3VwcG9ydCBleHRlbnNpb25cblx0XHRjb25zdCBhcnJheTogYW55W10gPVxuXHRcdFx0dHlwZW9mIENvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nID8gPGFueVtdPk9iamVjdChuZXcgQ29uc3RydWN0b3IobGVuZ3RoKSkgOiBuZXcgQXJyYXkobGVuZ3RoKTtcblxuXHRcdGlmICghaXNBcnJheUxpa2UoYXJyYXlMaWtlKSAmJiAhaXNJdGVyYWJsZShhcnJheUxpa2UpKSB7XG5cdFx0XHRyZXR1cm4gYXJyYXk7XG5cdFx0fVxuXG5cdFx0Ly8gaWYgdGhpcyBpcyBhbiBhcnJheSBhbmQgdGhlIG5vcm1hbGl6ZWQgbGVuZ3RoIGlzIDAsIGp1c3QgcmV0dXJuIGFuIGVtcHR5IGFycmF5LiB0aGlzIHByZXZlbnRzIGEgcHJvYmxlbVxuXHRcdC8vIHdpdGggdGhlIGl0ZXJhdGlvbiBvbiBJRSB3aGVuIHVzaW5nIGEgTmFOIGFycmF5IGxlbmd0aC5cblx0XHRpZiAoaXNBcnJheUxpa2UoYXJyYXlMaWtlKSkge1xuXHRcdFx0aWYgKGxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gW107XG5cdFx0XHR9XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlMaWtlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGFycmF5W2ldID0gbWFwRnVuY3Rpb24gPyBtYXBGdW5jdGlvbihhcnJheUxpa2VbaV0sIGkpIDogYXJyYXlMaWtlW2ldO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgaSA9IDA7XG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlIG9mIGFycmF5TGlrZSkge1xuXHRcdFx0XHRhcnJheVtpXSA9IG1hcEZ1bmN0aW9uID8gbWFwRnVuY3Rpb24odmFsdWUsIGkpIDogdmFsdWU7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoKGFycmF5TGlrZSBhcyBhbnkpLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRhcnJheS5sZW5ndGggPSBsZW5ndGg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFycmF5O1xuXHR9O1xuXG5cdG9mID0gZnVuY3Rpb24gb2Y8VD4oLi4uaXRlbXM6IFRbXSk6IEFycmF5PFQ+IHtcblx0XHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoaXRlbXMpO1xuXHR9O1xuXG5cdGNvcHlXaXRoaW4gPSBmdW5jdGlvbiBjb3B5V2l0aGluPFQ+KFxuXHRcdHRhcmdldDogQXJyYXlMaWtlPFQ+LFxuXHRcdG9mZnNldDogbnVtYmVyLFxuXHRcdHN0YXJ0OiBudW1iZXIsXG5cdFx0ZW5kPzogbnVtYmVyXG5cdCk6IEFycmF5TGlrZTxUPiB7XG5cdFx0aWYgKHRhcmdldCA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdjb3B5V2l0aGluOiB0YXJnZXQgbXVzdCBiZSBhbiBhcnJheS1saWtlIG9iamVjdCcpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGxlbmd0aCA9IHRvTGVuZ3RoKHRhcmdldC5sZW5ndGgpO1xuXHRcdG9mZnNldCA9IG5vcm1hbGl6ZU9mZnNldCh0b0ludGVnZXIob2Zmc2V0KSwgbGVuZ3RoKTtcblx0XHRzdGFydCA9IG5vcm1hbGl6ZU9mZnNldCh0b0ludGVnZXIoc3RhcnQpLCBsZW5ndGgpO1xuXHRcdGVuZCA9IG5vcm1hbGl6ZU9mZnNldChlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IHRvSW50ZWdlcihlbmQpLCBsZW5ndGgpO1xuXHRcdGxldCBjb3VudCA9IE1hdGgubWluKGVuZCAtIHN0YXJ0LCBsZW5ndGggLSBvZmZzZXQpO1xuXG5cdFx0bGV0IGRpcmVjdGlvbiA9IDE7XG5cdFx0aWYgKG9mZnNldCA+IHN0YXJ0ICYmIG9mZnNldCA8IHN0YXJ0ICsgY291bnQpIHtcblx0XHRcdGRpcmVjdGlvbiA9IC0xO1xuXHRcdFx0c3RhcnQgKz0gY291bnQgLSAxO1xuXHRcdFx0b2Zmc2V0ICs9IGNvdW50IC0gMTtcblx0XHR9XG5cblx0XHR3aGlsZSAoY291bnQgPiAwKSB7XG5cdFx0XHRpZiAoc3RhcnQgaW4gdGFyZ2V0KSB7XG5cdFx0XHRcdCh0YXJnZXQgYXMgV3JpdGFibGVBcnJheUxpa2U8VD4pW29mZnNldF0gPSB0YXJnZXRbc3RhcnRdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGVsZXRlICh0YXJnZXQgYXMgV3JpdGFibGVBcnJheUxpa2U8VD4pW29mZnNldF07XG5cdFx0XHR9XG5cblx0XHRcdG9mZnNldCArPSBkaXJlY3Rpb247XG5cdFx0XHRzdGFydCArPSBkaXJlY3Rpb247XG5cdFx0XHRjb3VudC0tO1xuXHRcdH1cblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cdH07XG5cblx0ZmlsbCA9IGZ1bmN0aW9uIGZpbGw8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIHZhbHVlOiBhbnksIHN0YXJ0PzogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBBcnJheUxpa2U8VD4ge1xuXHRcdGNvbnN0IGxlbmd0aCA9IHRvTGVuZ3RoKHRhcmdldC5sZW5ndGgpO1xuXHRcdGxldCBpID0gbm9ybWFsaXplT2Zmc2V0KHRvSW50ZWdlcihzdGFydCksIGxlbmd0aCk7XG5cdFx0ZW5kID0gbm9ybWFsaXplT2Zmc2V0KGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogdG9JbnRlZ2VyKGVuZCksIGxlbmd0aCk7XG5cblx0XHR3aGlsZSAoaSA8IGVuZCkge1xuXHRcdFx0KHRhcmdldCBhcyBXcml0YWJsZUFycmF5TGlrZTxUPilbaSsrXSA9IHZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cdH07XG5cblx0ZmluZCA9IGZ1bmN0aW9uIGZpbmQ8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIGNhbGxiYWNrOiBGaW5kQ2FsbGJhY2s8VD4sIHRoaXNBcmc/OiB7fSk6IFQgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IGluZGV4ID0gZmluZEluZGV4PFQ+KHRhcmdldCwgY2FsbGJhY2ssIHRoaXNBcmcpO1xuXHRcdHJldHVybiBpbmRleCAhPT0gLTEgPyB0YXJnZXRbaW5kZXhdIDogdW5kZWZpbmVkO1xuXHR9O1xuXG5cdGZpbmRJbmRleCA9IGZ1bmN0aW9uIGZpbmRJbmRleDxUPih0YXJnZXQ6IEFycmF5TGlrZTxUPiwgY2FsbGJhY2s6IEZpbmRDYWxsYmFjazxUPiwgdGhpc0FyZz86IHt9KTogbnVtYmVyIHtcblx0XHRjb25zdCBsZW5ndGggPSB0b0xlbmd0aCh0YXJnZXQubGVuZ3RoKTtcblxuXHRcdGlmICghY2FsbGJhY2spIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2ZpbmQ6IHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblx0XHR9XG5cblx0XHRpZiAodGhpc0FyZykge1xuXHRcdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXNBcmcpO1xuXHRcdH1cblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChjYWxsYmFjayh0YXJnZXRbaV0sIGksIHRhcmdldCkpIHtcblx0XHRcdFx0cmV0dXJuIGk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIC0xO1xuXHR9O1xufVxuXG5pZiAoaGFzKCdlczctYXJyYXknKSkge1xuXHRpbmNsdWRlcyA9IHdyYXBOYXRpdmUoZ2xvYmFsLkFycmF5LnByb3RvdHlwZS5pbmNsdWRlcyk7XG59IGVsc2Uge1xuXHQvKipcblx0ICogRW5zdXJlcyBhIG5vbi1uZWdhdGl2ZSwgbm9uLWluZmluaXRlLCBzYWZlIGludGVnZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBsZW5ndGggVGhlIG51bWJlciB0byB2YWxpZGF0ZVxuXHQgKiBAcmV0dXJuIEEgcHJvcGVyIGxlbmd0aFxuXHQgKi9cblx0Y29uc3QgdG9MZW5ndGggPSBmdW5jdGlvbiB0b0xlbmd0aChsZW5ndGg6IG51bWJlcik6IG51bWJlciB7XG5cdFx0bGVuZ3RoID0gTnVtYmVyKGxlbmd0aCk7XG5cdFx0aWYgKGlzTmFOKGxlbmd0aCkpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblx0XHRpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuXHRcdFx0bGVuZ3RoID0gTWF0aC5mbG9vcihsZW5ndGgpO1xuXHRcdH1cblx0XHQvLyBFbnN1cmUgYSBub24tbmVnYXRpdmUsIHJlYWwsIHNhZmUgaW50ZWdlclxuXHRcdHJldHVybiBNYXRoLm1pbihNYXRoLm1heChsZW5ndGgsIDApLCBNQVhfU0FGRV9JTlRFR0VSKTtcblx0fTtcblxuXHRpbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCBzZWFyY2hFbGVtZW50OiBULCBmcm9tSW5kZXg6IG51bWJlciA9IDApOiBib29sZWFuIHtcblx0XHRsZXQgbGVuID0gdG9MZW5ndGgodGFyZ2V0Lmxlbmd0aCk7XG5cblx0XHRmb3IgKGxldCBpID0gZnJvbUluZGV4OyBpIDwgbGVuOyArK2kpIHtcblx0XHRcdGNvbnN0IGN1cnJlbnRFbGVtZW50ID0gdGFyZ2V0W2ldO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRzZWFyY2hFbGVtZW50ID09PSBjdXJyZW50RWxlbWVudCB8fFxuXHRcdFx0XHQoc2VhcmNoRWxlbWVudCAhPT0gc2VhcmNoRWxlbWVudCAmJiBjdXJyZW50RWxlbWVudCAhPT0gY3VycmVudEVsZW1lbnQpXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGFycmF5LnRzIiwiY29uc3QgZ2xvYmFsT2JqZWN0OiBhbnkgPSAoZnVuY3Rpb24oKTogYW55IHtcblx0Ly8gdGhlIG9ubHkgcmVsaWFibGUgbWVhbnMgdG8gZ2V0IHRoZSBnbG9iYWwgb2JqZWN0IGlzXG5cdC8vIGBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpYFxuXHQvLyBIb3dldmVyLCB0aGlzIGNhdXNlcyBDU1AgdmlvbGF0aW9ucyBpbiBDaHJvbWUgYXBwcy5cblx0aWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiBzZWxmO1xuXHR9XG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiB3aW5kb3c7XG5cdH1cblx0aWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0cmV0dXJuIGdsb2JhbDtcblx0fVxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgZ2xvYmFsT2JqZWN0O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGdsb2JhbC50cyIsImltcG9ydCAnLi9TeW1ib2wnO1xuaW1wb3J0IHsgSElHSF9TVVJST0dBVEVfTUFYLCBISUdIX1NVUlJPR0FURV9NSU4gfSBmcm9tICcuL3N0cmluZyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmF0b3JSZXN1bHQ8VD4ge1xuXHRyZWFkb25seSBkb25lOiBib29sZWFuO1xuXHRyZWFkb25seSB2YWx1ZTogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYXRvcjxUPiB7XG5cdG5leHQodmFsdWU/OiBhbnkpOiBJdGVyYXRvclJlc3VsdDxUPjtcblxuXHRyZXR1cm4/KHZhbHVlPzogYW55KTogSXRlcmF0b3JSZXN1bHQ8VD47XG5cblx0dGhyb3c/KGU/OiBhbnkpOiBJdGVyYXRvclJlc3VsdDxUPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZTxUPiB7XG5cdFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhdG9yPFQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhYmxlSXRlcmF0b3I8VD4gZXh0ZW5kcyBJdGVyYXRvcjxUPiB7XG5cdFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD47XG59XG5cbmNvbnN0IHN0YXRpY0RvbmU6IEl0ZXJhdG9yUmVzdWx0PGFueT4gPSB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgX3NoaW1zXyBhbiBpdGVyYXRvciBpbnRlcmZhY2Ugb24gYXJyYXkgbGlrZSBvYmplY3RzLlxuICovXG5leHBvcnQgY2xhc3MgU2hpbUl0ZXJhdG9yPFQ+IHtcblx0cHJpdmF0ZSBfbGlzdDogQXJyYXlMaWtlPFQ+IHwgdW5kZWZpbmVkO1xuXHRwcml2YXRlIF9uZXh0SW5kZXggPSAtMTtcblx0cHJpdmF0ZSBfbmF0aXZlSXRlcmF0b3I6IEl0ZXJhdG9yPFQ+IHwgdW5kZWZpbmVkO1xuXG5cdGNvbnN0cnVjdG9yKGxpc3Q6IEFycmF5TGlrZTxUPiB8IEl0ZXJhYmxlPFQ+KSB7XG5cdFx0aWYgKGlzSXRlcmFibGUobGlzdCkpIHtcblx0XHRcdHRoaXMuX25hdGl2ZUl0ZXJhdG9yID0gbGlzdFtTeW1ib2wuaXRlcmF0b3JdKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2xpc3QgPSBsaXN0O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIG5leHQgaXRlcmF0aW9uIHJlc3VsdCBmb3IgdGhlIEl0ZXJhdG9yXG5cdCAqL1xuXHRuZXh0KCk6IEl0ZXJhdG9yUmVzdWx0PFQ+IHtcblx0XHRpZiAodGhpcy5fbmF0aXZlSXRlcmF0b3IpIHtcblx0XHRcdHJldHVybiB0aGlzLl9uYXRpdmVJdGVyYXRvci5uZXh0KCk7XG5cdFx0fVxuXHRcdGlmICghdGhpcy5fbGlzdCkge1xuXHRcdFx0cmV0dXJuIHN0YXRpY0RvbmU7XG5cdFx0fVxuXHRcdGlmICgrK3RoaXMuX25leHRJbmRleCA8IHRoaXMuX2xpc3QubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRkb25lOiBmYWxzZSxcblx0XHRcdFx0dmFsdWU6IHRoaXMuX2xpc3RbdGhpcy5fbmV4dEluZGV4XVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHN0YXRpY0RvbmU7XG5cdH1cblxuXHRbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3IgY2hlY2tpbmcgaWYgc29tZXRoaW5nIGhhcyBhbiBJdGVyYWJsZSBpbnRlcmZhY2VcbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHR5cGUgZ3VhcmQgYWdhaW5zdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJdGVyYWJsZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgSXRlcmFibGU8YW55PiB7XG5cdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWVbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIGNoZWNraW5nIGlmIHNvbWV0aGluZyBpcyBBcnJheUxpa2VcbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHR5cGUgZ3VhcmQgYWdhaW5zdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWU6IGFueSk6IHZhbHVlIGlzIEFycmF5TGlrZTxhbnk+IHtcblx0cmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGl0ZXJhdG9yIGZvciBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gaXRlcmFibGUgVGhlIGl0ZXJhYmxlIG9iamVjdCB0byByZXR1cm4gdGhlIGl0ZXJhdG9yIGZvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0PFQ+KGl0ZXJhYmxlOiBJdGVyYWJsZTxUPiB8IEFycmF5TGlrZTxUPik6IEl0ZXJhdG9yPFQ+IHwgdW5kZWZpbmVkIHtcblx0aWYgKGlzSXRlcmFibGUoaXRlcmFibGUpKSB7XG5cdFx0cmV0dXJuIGl0ZXJhYmxlW1N5bWJvbC5pdGVyYXRvcl0oKTtcblx0fSBlbHNlIGlmIChpc0FycmF5TGlrZShpdGVyYWJsZSkpIHtcblx0XHRyZXR1cm4gbmV3IFNoaW1JdGVyYXRvcihpdGVyYWJsZSk7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb3JPZkNhbGxiYWNrPFQ+IHtcblx0LyoqXG5cdCAqIEEgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgZm9yT2YoKSBpdGVyYXRpb25cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBjdXJyZW50IHZhbHVlXG5cdCAqIEBwYXJhbSBvYmplY3QgVGhlIG9iamVjdCBiZWluZyBpdGVyYXRlZCBvdmVyXG5cdCAqIEBwYXJhbSBkb0JyZWFrIEEgZnVuY3Rpb24sIGlmIGNhbGxlZCwgd2lsbCBzdG9wIHRoZSBpdGVyYXRpb25cblx0ICovXG5cdCh2YWx1ZTogVCwgb2JqZWN0OiBJdGVyYWJsZTxUPiB8IEFycmF5TGlrZTxUPiB8IHN0cmluZywgZG9CcmVhazogKCkgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKlxuICogU2hpbXMgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgYGZvciAuLi4gb2ZgIGJsb2Nrc1xuICpcbiAqIEBwYXJhbSBpdGVyYWJsZSBUaGUgb2JqZWN0IHRoZSBwcm92aWRlcyBhbiBpbnRlcmF0b3IgaW50ZXJmYWNlXG4gKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGZvciBlYWNoIGl0ZW0gb2YgdGhlIGl0ZXJhYmxlXG4gKiBAcGFyYW0gdGhpc0FyZyBPcHRpb25hbCBzY29wZSB0byBwYXNzIHRoZSBjYWxsYmFja1xuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yT2Y8VD4oXG5cdGl0ZXJhYmxlOiBJdGVyYWJsZTxUPiB8IEFycmF5TGlrZTxUPiB8IHN0cmluZyxcblx0Y2FsbGJhY2s6IEZvck9mQ2FsbGJhY2s8VD4sXG5cdHRoaXNBcmc/OiBhbnlcbik6IHZvaWQge1xuXHRsZXQgYnJva2VuID0gZmFsc2U7XG5cblx0ZnVuY3Rpb24gZG9CcmVhaygpIHtcblx0XHRicm9rZW4gPSB0cnVlO1xuXHR9XG5cblx0LyogV2UgbmVlZCB0byBoYW5kbGUgaXRlcmF0aW9uIG9mIGRvdWJsZSBieXRlIHN0cmluZ3MgcHJvcGVybHkgKi9cblx0aWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSAmJiB0eXBlb2YgaXRlcmFibGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0Y29uc3QgbCA9IGl0ZXJhYmxlLmxlbmd0aDtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGw7ICsraSkge1xuXHRcdFx0bGV0IGNoYXIgPSBpdGVyYWJsZVtpXTtcblx0XHRcdGlmIChpICsgMSA8IGwpIHtcblx0XHRcdFx0Y29uc3QgY29kZSA9IGNoYXIuY2hhckNvZGVBdCgwKTtcblx0XHRcdFx0aWYgKGNvZGUgPj0gSElHSF9TVVJST0dBVEVfTUlOICYmIGNvZGUgPD0gSElHSF9TVVJST0dBVEVfTUFYKSB7XG5cdFx0XHRcdFx0Y2hhciArPSBpdGVyYWJsZVsrK2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGNoYXIsIGl0ZXJhYmxlLCBkb0JyZWFrKTtcblx0XHRcdGlmIChicm9rZW4pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBpdGVyYXRvciA9IGdldChpdGVyYWJsZSk7XG5cdFx0aWYgKGl0ZXJhdG9yKSB7XG5cdFx0XHRsZXQgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuXG5cdFx0XHR3aGlsZSAoIXJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdGNhbGxiYWNrLmNhbGwodGhpc0FyZywgcmVzdWx0LnZhbHVlLCBpdGVyYWJsZSwgZG9CcmVhayk7XG5cdFx0XHRcdGlmIChicm9rZW4pIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGl0ZXJhdG9yLnRzIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5cbi8qKlxuICogVGhlIHNtYWxsZXN0IGludGVydmFsIGJldHdlZW4gdHdvIHJlcHJlc2VudGFibGUgbnVtYmVycy5cbiAqL1xuZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAxO1xuXG4vKipcbiAqIFRoZSBtYXhpbXVtIHNhZmUgaW50ZWdlciBpbiBKYXZhU2NyaXB0XG4gKi9cbmV4cG9ydCBjb25zdCBNQVhfU0FGRV9JTlRFR0VSID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcblxuLyoqXG4gKiBUaGUgbWluaW11bSBzYWZlIGludGVnZXIgaW4gSmF2YVNjcmlwdFxuICovXG5leHBvcnQgY29uc3QgTUlOX1NBRkVfSU5URUdFUiA9IC1NQVhfU0FGRV9JTlRFR0VSO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGFzc2VkIHZhbHVlIGlzIE5hTiB3aXRob3V0IGNvZXJzaW9uLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBOYU4sIGZhbHNlIGlmIGl0IGlzIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOYU4odmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBnbG9iYWwuaXNOYU4odmFsdWUpO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGFzc2VkIHZhbHVlIGlzIGEgZmluaXRlIG51bWJlciB3aXRob3V0IGNvZXJzaW9uLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBmaW5pdGUsIGZhbHNlIGlmIGl0IGlzIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGaW5pdGUodmFsdWU6IGFueSk6IHZhbHVlIGlzIG51bWJlciB7XG5cdHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGdsb2JhbC5pc0Zpbml0ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXNzZWQgdmFsdWUgaXMgYW4gaW50ZWdlci5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYW4gaW50ZWdlciwgZmFsc2UgaWYgaXQgaXMgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0ludGVnZXIodmFsdWU6IGFueSk6IHZhbHVlIGlzIG51bWJlciB7XG5cdHJldHVybiBpc0Zpbml0ZSh2YWx1ZSkgJiYgTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGFzc2VkIHZhbHVlIGlzIGFuIGludGVnZXIgdGhhdCBpcyAnc2FmZSwnIG1lYW5pbmc6XG4gKiAgIDEuIGl0IGNhbiBiZSBleHByZXNzZWQgYXMgYW4gSUVFRS03NTQgZG91YmxlIHByZWNpc2lvbiBudW1iZXJcbiAqICAgMi4gaXQgaGFzIGEgb25lLXRvLW9uZSBtYXBwaW5nIHRvIGEgbWF0aGVtYXRpY2FsIGludGVnZXIsIG1lYW5pbmcgaXRzXG4gKiAgICAgIElFRUUtNzU0IHJlcHJlc2VudGF0aW9uIGNhbm5vdCBiZSB0aGUgcmVzdWx0IG9mIHJvdW5kaW5nIGFueSBvdGhlclxuICogICAgICBpbnRlZ2VyIHRvIGZpdCB0aGUgSUVFRS03NTQgcmVwcmVzZW50YXRpb25cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYW4gaW50ZWdlciwgZmFsc2UgaWYgaXQgaXMgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NhZmVJbnRlZ2VyKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBudW1iZXIge1xuXHRyZXR1cm4gaXNJbnRlZ2VyKHZhbHVlKSAmJiBNYXRoLmFicyh2YWx1ZSkgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBudW1iZXIudHMiLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XG5pbXBvcnQgeyBpc1N5bWJvbCB9IGZyb20gJy4vU3ltYm9sJztcblxuZXhwb3J0IGludGVyZmFjZSBPYmplY3RBc3NpZ24ge1xuXHQvKipcblx0ICogQ29weSB0aGUgdmFsdWVzIG9mIGFsbCBvZiB0aGUgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyBmcm9tIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvIGFcblx0ICogdGFyZ2V0IG9iamVjdC4gUmV0dXJucyB0aGUgdGFyZ2V0IG9iamVjdC5cblx0ICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCB0byBjb3B5IHRvLlxuXHQgKiBAcGFyYW0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IGZyb20gd2hpY2ggdG8gY29weSBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0PFQsIFU+KHRhcmdldDogVCwgc291cmNlOiBVKTogVCAmIFU7XG5cblx0LyoqXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBvZiBhbGwgb2YgdGhlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgZnJvbSBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byBhXG5cdCAqIHRhcmdldCBvYmplY3QuIFJldHVybnMgdGhlIHRhcmdldCBvYmplY3QuXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QgdG8gY29weSB0by5cblx0ICogQHBhcmFtIHNvdXJjZTEgVGhlIGZpcnN0IHNvdXJjZSBvYmplY3QgZnJvbSB3aGljaCB0byBjb3B5IHByb3BlcnRpZXMuXG5cdCAqIEBwYXJhbSBzb3VyY2UyIFRoZSBzZWNvbmQgc291cmNlIG9iamVjdCBmcm9tIHdoaWNoIHRvIGNvcHkgcHJvcGVydGllcy5cblx0ICovXG5cdDxULCBVLCBWPih0YXJnZXQ6IFQsIHNvdXJjZTE6IFUsIHNvdXJjZTI6IFYpOiBUICYgVSAmIFY7XG5cblx0LyoqXG5cdCAqIENvcHkgdGhlIHZhbHVlcyBvZiBhbGwgb2YgdGhlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgZnJvbSBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byBhXG5cdCAqIHRhcmdldCBvYmplY3QuIFJldHVybnMgdGhlIHRhcmdldCBvYmplY3QuXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QgdG8gY29weSB0by5cblx0ICogQHBhcmFtIHNvdXJjZTEgVGhlIGZpcnN0IHNvdXJjZSBvYmplY3QgZnJvbSB3aGljaCB0byBjb3B5IHByb3BlcnRpZXMuXG5cdCAqIEBwYXJhbSBzb3VyY2UyIFRoZSBzZWNvbmQgc291cmNlIG9iamVjdCBmcm9tIHdoaWNoIHRvIGNvcHkgcHJvcGVydGllcy5cblx0ICogQHBhcmFtIHNvdXJjZTMgVGhlIHRoaXJkIHNvdXJjZSBvYmplY3QgZnJvbSB3aGljaCB0byBjb3B5IHByb3BlcnRpZXMuXG5cdCAqL1xuXHQ8VCwgVSwgViwgVz4odGFyZ2V0OiBULCBzb3VyY2UxOiBVLCBzb3VyY2UyOiBWLCBzb3VyY2UzOiBXKTogVCAmIFUgJiBWICYgVztcblxuXHQvKipcblx0ICogQ29weSB0aGUgdmFsdWVzIG9mIGFsbCBvZiB0aGUgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyBmcm9tIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvIGFcblx0ICogdGFyZ2V0IG9iamVjdC4gUmV0dXJucyB0aGUgdGFyZ2V0IG9iamVjdC5cblx0ICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCB0byBjb3B5IHRvLlxuXHQgKiBAcGFyYW0gc291cmNlcyBPbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyBmcm9tIHdoaWNoIHRvIGNvcHkgcHJvcGVydGllc1xuXHQgKi9cblx0KHRhcmdldDogb2JqZWN0LCAuLi5zb3VyY2VzOiBhbnlbXSk6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPYmplY3RFbnRlcmllcyB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGtleS92YWx1ZXMgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3Rcblx0ICogQHBhcmFtIG8gT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuIFRoaXMgY2FuIGJlIGFuIG9iamVjdCB0aGF0IHlvdSBjcmVhdGVkIG9yIGFuIGV4aXN0aW5nIERvY3VtZW50IE9iamVjdCBNb2RlbCAoRE9NKSBvYmplY3QuXG5cdCAqL1xuXHQ8VCBleHRlbmRzIHsgW2tleTogc3RyaW5nXTogYW55IH0sIEsgZXh0ZW5kcyBrZXlvZiBUPihvOiBUKTogW2tleW9mIFQsIFRbS11dW107XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2Yga2V5L3ZhbHVlcyBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdFxuXHQgKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgcHJvcGVydGllcyBhbmQgbWV0aG9kcy4gVGhpcyBjYW4gYmUgYW4gb2JqZWN0IHRoYXQgeW91IGNyZWF0ZWQgb3IgYW4gZXhpc3RpbmcgRG9jdW1lbnQgT2JqZWN0IE1vZGVsIChET00pIG9iamVjdC5cblx0ICovXG5cdChvOiBvYmplY3QpOiBbc3RyaW5nLCBhbnldW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0R2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyB7XG5cdDxUPihvOiBUKTogeyBbSyBpbiBrZXlvZiBUXTogUHJvcGVydHlEZXNjcmlwdG9yIH07XG5cdChvOiBhbnkpOiB7IFtrZXk6IHN0cmluZ106IFByb3BlcnR5RGVzY3JpcHRvciB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdFZhbHVlcyB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHZhbHVlcyBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdFxuXHQgKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgcHJvcGVydGllcyBhbmQgbWV0aG9kcy4gVGhpcyBjYW4gYmUgYW4gb2JqZWN0IHRoYXQgeW91IGNyZWF0ZWQgb3IgYW4gZXhpc3RpbmcgRG9jdW1lbnQgT2JqZWN0IE1vZGVsIChET00pIG9iamVjdC5cblx0ICovXG5cdDxUPihvOiB7IFtzOiBzdHJpbmddOiBUIH0pOiBUW107XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgdmFsdWVzIG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0XG5cdCAqIEBwYXJhbSBvIE9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzLiBUaGlzIGNhbiBiZSBhbiBvYmplY3QgdGhhdCB5b3UgY3JlYXRlZCBvciBhbiBleGlzdGluZyBEb2N1bWVudCBPYmplY3QgTW9kZWwgKERPTSkgb2JqZWN0LlxuXHQgKi9cblx0KG86IG9iamVjdCk6IGFueVtdO1xufVxuXG5leHBvcnQgbGV0IGFzc2lnbjogT2JqZWN0QXNzaWduO1xuXG4vKipcbiAqIEdldHMgdGhlIG93biBwcm9wZXJ0eSBkZXNjcmlwdG9yIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICogQW4gb3duIHByb3BlcnR5IGRlc2NyaXB0b3IgaXMgb25lIHRoYXQgaXMgZGVmaW5lZCBkaXJlY3RseSBvbiB0aGUgb2JqZWN0IGFuZCBpcyBub3RcbiAqIGluaGVyaXRlZCBmcm9tIHRoZSBvYmplY3QncyBwcm90b3R5cGUuXG4gKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgcHJvcGVydHkuXG4gKiBAcGFyYW0gcCBOYW1lIG9mIHRoZSBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGxldCBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IDxULCBLIGV4dGVuZHMga2V5b2YgVD4obzogVCwgcHJvcGVydHlLZXk6IEspID0+IFByb3BlcnR5RGVzY3JpcHRvciB8IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBuYW1lcyBvZiB0aGUgb3duIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0LiBUaGUgb3duIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0IGFyZSB0aG9zZSB0aGF0IGFyZSBkZWZpbmVkIGRpcmVjdGx5XG4gKiBvbiB0aGF0IG9iamVjdCwgYW5kIGFyZSBub3QgaW5oZXJpdGVkIGZyb20gdGhlIG9iamVjdCdzIHByb3RvdHlwZS4gVGhlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0IGluY2x1ZGUgYm90aCBmaWVsZHMgKG9iamVjdHMpIGFuZCBmdW5jdGlvbnMuXG4gKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgb3duIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBsZXQgZ2V0T3duUHJvcGVydHlOYW1lczogKG86IGFueSkgPT4gc3RyaW5nW107XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgc3ltYm9sIHByb3BlcnRpZXMgZm91bmQgZGlyZWN0bHkgb24gb2JqZWN0IG8uXG4gKiBAcGFyYW0gbyBPYmplY3QgdG8gcmV0cmlldmUgdGhlIHN5bWJvbHMgZnJvbS5cbiAqL1xuZXhwb3J0IGxldCBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6IChvOiBhbnkpID0+IHN5bWJvbFtdO1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWVzIGFyZSB0aGUgc2FtZSB2YWx1ZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICogQHBhcmFtIHZhbHVlMSBUaGUgZmlyc3QgdmFsdWUuXG4gKiBAcGFyYW0gdmFsdWUyIFRoZSBzZWNvbmQgdmFsdWUuXG4gKi9cbmV4cG9ydCBsZXQgaXM6ICh2YWx1ZTE6IGFueSwgdmFsdWUyOiBhbnkpID0+IGJvb2xlYW47XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBhbmQgbWV0aG9kcyBvZiBhbiBvYmplY3QuXG4gKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgcHJvcGVydGllcyBhbmQgbWV0aG9kcy4gVGhpcyBjYW4gYmUgYW4gb2JqZWN0IHRoYXQgeW91IGNyZWF0ZWQgb3IgYW4gZXhpc3RpbmcgRG9jdW1lbnQgT2JqZWN0IE1vZGVsIChET00pIG9iamVjdC5cbiAqL1xuZXhwb3J0IGxldCBrZXlzOiAobzogb2JqZWN0KSA9PiBzdHJpbmdbXTtcblxuLyogRVM3IE9iamVjdCBzdGF0aWMgbWV0aG9kcyAqL1xuXG5leHBvcnQgbGV0IGdldE93blByb3BlcnR5RGVzY3JpcHRvcnM6IE9iamVjdEdldE93blByb3BlcnR5RGVzY3JpcHRvcnM7XG5cbmV4cG9ydCBsZXQgZW50cmllczogT2JqZWN0RW50ZXJpZXM7XG5cbmV4cG9ydCBsZXQgdmFsdWVzOiBPYmplY3RWYWx1ZXM7XG5cbmlmIChoYXMoJ2VzNi1vYmplY3QnKSkge1xuXHRjb25zdCBnbG9iYWxPYmplY3QgPSBnbG9iYWwuT2JqZWN0O1xuXHRhc3NpZ24gPSBnbG9iYWxPYmplY3QuYXNzaWduO1xuXHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBnbG9iYWxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXHRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZ2xvYmFsT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG5cdGdldE93blByb3BlcnR5U3ltYm9scyA9IGdsb2JhbE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cdGlzID0gZ2xvYmFsT2JqZWN0LmlzO1xuXHRrZXlzID0gZ2xvYmFsT2JqZWN0LmtleXM7XG59IGVsc2Uge1xuXHRrZXlzID0gZnVuY3Rpb24gc3ltYm9sQXdhcmVLZXlzKG86IG9iamVjdCk6IHN0cmluZ1tdIHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXMobykuZmlsdGVyKChrZXkpID0+ICFCb29sZWFuKGtleS5tYXRjaCgvXkBALisvKSkpO1xuXHR9O1xuXG5cdGFzc2lnbiA9IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQ6IGFueSwgLi4uc291cmNlczogYW55W10pIHtcblx0XHRpZiAodGFyZ2V0ID09IG51bGwpIHtcblx0XHRcdC8vIFR5cGVFcnJvciBpZiB1bmRlZmluZWQgb3IgbnVsbFxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0Jyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgdG8gPSBPYmplY3QodGFyZ2V0KTtcblx0XHRzb3VyY2VzLmZvckVhY2goKG5leHRTb3VyY2UpID0+IHtcblx0XHRcdGlmIChuZXh0U291cmNlKSB7XG5cdFx0XHRcdC8vIFNraXAgb3ZlciBpZiB1bmRlZmluZWQgb3IgbnVsbFxuXHRcdFx0XHRrZXlzKG5leHRTb3VyY2UpLmZvckVhY2goKG5leHRLZXkpID0+IHtcblx0XHRcdFx0XHR0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRvO1xuXHR9O1xuXG5cdGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPihvOiBULCBwcm9wOiBLKTogUHJvcGVydHlEZXNjcmlwdG9yIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoaXNTeW1ib2wocHJvcCkpIHtcblx0XHRcdHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8sIHByb3ApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvLCBwcm9wKTtcblx0XHR9XG5cdH07XG5cblx0Z2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMobzogYW55KTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvKS5maWx0ZXIoKGtleSkgPT4gIUJvb2xlYW4oa2V5Lm1hdGNoKC9eQEAuKy8pKSk7XG5cdH07XG5cblx0Z2V0T3duUHJvcGVydHlTeW1ib2xzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKG86IGFueSk6IHN5bWJvbFtdIHtcblx0XHRyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobylcblx0XHRcdC5maWx0ZXIoKGtleSkgPT4gQm9vbGVhbihrZXkubWF0Y2goL15AQC4rLykpKVxuXHRcdFx0Lm1hcCgoa2V5KSA9PiBTeW1ib2wuZm9yKGtleS5zdWJzdHJpbmcoMikpKTtcblx0fTtcblxuXHRpcyA9IGZ1bmN0aW9uIGlzKHZhbHVlMTogYW55LCB2YWx1ZTI6IGFueSk6IGJvb2xlYW4ge1xuXHRcdGlmICh2YWx1ZTEgPT09IHZhbHVlMikge1xuXHRcdFx0cmV0dXJuIHZhbHVlMSAhPT0gMCB8fCAxIC8gdmFsdWUxID09PSAxIC8gdmFsdWUyOyAvLyAtMFxuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWUxICE9PSB2YWx1ZTEgJiYgdmFsdWUyICE9PSB2YWx1ZTI7IC8vIE5hTlxuXHR9O1xufVxuXG5pZiAoaGFzKCdlczIwMTctb2JqZWN0JykpIHtcblx0Y29uc3QgZ2xvYmFsT2JqZWN0ID0gZ2xvYmFsLk9iamVjdDtcblx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA9IGdsb2JhbE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzO1xuXHRlbnRyaWVzID0gZ2xvYmFsT2JqZWN0LmVudHJpZXM7XG5cdHZhbHVlcyA9IGdsb2JhbE9iamVjdC52YWx1ZXM7XG59IGVsc2Uge1xuXHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvOiBhbnkpIHtcblx0XHRyZXR1cm4gZ2V0T3duUHJvcGVydHlOYW1lcyhvKS5yZWR1Y2UoXG5cdFx0XHQocHJldmlvdXMsIGtleSkgPT4ge1xuXHRcdFx0XHRwcmV2aW91c1trZXldID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8sIGtleSkhO1xuXHRcdFx0XHRyZXR1cm4gcHJldmlvdXM7XG5cdFx0XHR9LFxuXHRcdFx0e30gYXMgeyBba2V5OiBzdHJpbmddOiBQcm9wZXJ0eURlc2NyaXB0b3IgfVxuXHRcdCk7XG5cdH07XG5cblx0ZW50cmllcyA9IGZ1bmN0aW9uIGVudHJpZXMobzogYW55KTogW3N0cmluZywgYW55XVtdIHtcblx0XHRyZXR1cm4ga2V5cyhvKS5tYXAoKGtleSkgPT4gW2tleSwgb1trZXldXSBhcyBbc3RyaW5nLCBhbnldKTtcblx0fTtcblxuXHR2YWx1ZXMgPSBmdW5jdGlvbiB2YWx1ZXMobzogYW55KTogYW55W10ge1xuXHRcdHJldHVybiBrZXlzKG8pLm1hcCgoa2V5KSA9PiBvW2tleV0pO1xuXHR9O1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIG9iamVjdC50cyIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xuaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcbmltcG9ydCB7IHdyYXBOYXRpdmUgfSBmcm9tICcuL3N1cHBvcnQvdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RyaW5nTm9ybWFsaXplIHtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIFN0cmluZyB2YWx1ZSByZXN1bHQgb2Ygbm9ybWFsaXppbmcgdGhlIHN0cmluZyBpbnRvIHRoZSBub3JtYWxpemF0aW9uIGZvcm1cblx0ICogbmFtZWQgYnkgZm9ybSBhcyBzcGVjaWZpZWQgaW4gVW5pY29kZSBTdGFuZGFyZCBBbm5leCAjMTUsIFVuaWNvZGUgTm9ybWFsaXphdGlvbiBGb3Jtcy5cblx0ICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHN0cmluZ1xuXHQgKiBAcGFyYW0gZm9ybSBBcHBsaWNhYmxlIHZhbHVlczogXCJORkNcIiwgXCJORkRcIiwgXCJORktDXCIsIG9yIFwiTkZLRFwiLCBJZiBub3Qgc3BlY2lmaWVkIGRlZmF1bHRcblx0ICogaXMgXCJORkNcIlxuXHQgKi9cblx0KHRhcmdldDogc3RyaW5nLCBmb3JtOiAnTkZDJyB8ICdORkQnIHwgJ05GS0MnIHwgJ05GS0QnKTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBTdHJpbmcgdmFsdWUgcmVzdWx0IG9mIG5vcm1hbGl6aW5nIHRoZSBzdHJpbmcgaW50byB0aGUgbm9ybWFsaXphdGlvbiBmb3JtXG5cdCAqIG5hbWVkIGJ5IGZvcm0gYXMgc3BlY2lmaWVkIGluIFVuaWNvZGUgU3RhbmRhcmQgQW5uZXggIzE1LCBVbmljb2RlIE5vcm1hbGl6YXRpb24gRm9ybXMuXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcblx0ICogQHBhcmFtIGZvcm0gQXBwbGljYWJsZSB2YWx1ZXM6IFwiTkZDXCIsIFwiTkZEXCIsIFwiTkZLQ1wiLCBvciBcIk5GS0RcIiwgSWYgbm90IHNwZWNpZmllZCBkZWZhdWx0XG5cdCAqIGlzIFwiTkZDXCJcblx0ICovXG5cdCh0YXJnZXQ6IHN0cmluZywgZm9ybT86IHN0cmluZyk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaGUgbWluaW11bSBsb2NhdGlvbiBvZiBoaWdoIHN1cnJvZ2F0ZXNcbiAqL1xuZXhwb3J0IGNvbnN0IEhJR0hfU1VSUk9HQVRFX01JTiA9IDB4ZDgwMDtcblxuLyoqXG4gKiBUaGUgbWF4aW11bSBsb2NhdGlvbiBvZiBoaWdoIHN1cnJvZ2F0ZXNcbiAqL1xuZXhwb3J0IGNvbnN0IEhJR0hfU1VSUk9HQVRFX01BWCA9IDB4ZGJmZjtcblxuLyoqXG4gKiBUaGUgbWluaW11bSBsb2NhdGlvbiBvZiBsb3cgc3Vycm9nYXRlc1xuICovXG5leHBvcnQgY29uc3QgTE9XX1NVUlJPR0FURV9NSU4gPSAweGRjMDA7XG5cbi8qKlxuICogVGhlIG1heGltdW0gbG9jYXRpb24gb2YgbG93IHN1cnJvZ2F0ZXNcbiAqL1xuZXhwb3J0IGNvbnN0IExPV19TVVJST0dBVEVfTUFYID0gMHhkZmZmO1xuXG4vKiBFUzYgc3RhdGljIG1ldGhvZHMgKi9cblxuLyoqXG4gKiBSZXR1cm4gdGhlIFN0cmluZyB2YWx1ZSB3aG9zZSBlbGVtZW50cyBhcmUsIGluIG9yZGVyLCB0aGUgZWxlbWVudHMgaW4gdGhlIExpc3QgZWxlbWVudHMuXG4gKiBJZiBsZW5ndGggaXMgMCwgdGhlIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZC5cbiAqIEBwYXJhbSBjb2RlUG9pbnRzIFRoZSBjb2RlIHBvaW50cyB0byBnZW5lcmF0ZSB0aGUgc3RyaW5nXG4gKi9cbmV4cG9ydCBsZXQgZnJvbUNvZGVQb2ludDogKC4uLmNvZGVQb2ludHM6IG51bWJlcltdKSA9PiBzdHJpbmc7XG5cbi8qKlxuICogYHJhd2AgaXMgaW50ZW5kZWQgZm9yIHVzZSBhcyBhIHRhZyBmdW5jdGlvbiBvZiBhIFRhZ2dlZCBUZW1wbGF0ZSBTdHJpbmcuIFdoZW4gY2FsbGVkXG4gKiBhcyBzdWNoIHRoZSBmaXJzdCBhcmd1bWVudCB3aWxsIGJlIGEgd2VsbCBmb3JtZWQgdGVtcGxhdGUgY2FsbCBzaXRlIG9iamVjdCBhbmQgdGhlIHJlc3RcbiAqIHBhcmFtZXRlciB3aWxsIGNvbnRhaW4gdGhlIHN1YnN0aXR1dGlvbiB2YWx1ZXMuXG4gKiBAcGFyYW0gdGVtcGxhdGUgQSB3ZWxsLWZvcm1lZCB0ZW1wbGF0ZSBzdHJpbmcgY2FsbCBzaXRlIHJlcHJlc2VudGF0aW9uLlxuICogQHBhcmFtIHN1YnN0aXR1dGlvbnMgQSBzZXQgb2Ygc3Vic3RpdHV0aW9uIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGxldCByYXc6ICh0ZW1wbGF0ZTogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnN1YnN0aXR1dGlvbnM6IGFueVtdKSA9PiBzdHJpbmc7XG5cbi8qIEVTNiBpbnN0YW5jZSBtZXRob2RzICovXG5cbi8qKlxuICogUmV0dXJucyBhIG5vbm5lZ2F0aXZlIGludGVnZXIgTnVtYmVyIGxlc3MgdGhhbiAxMTE0MTEyICgweDExMDAwMCkgdGhhdCBpcyB0aGUgY29kZSBwb2ludFxuICogdmFsdWUgb2YgdGhlIFVURi0xNiBlbmNvZGVkIGNvZGUgcG9pbnQgc3RhcnRpbmcgYXQgdGhlIHN0cmluZyBlbGVtZW50IGF0IHBvc2l0aW9uIHBvcyBpblxuICogdGhlIFN0cmluZyByZXN1bHRpbmcgZnJvbSBjb252ZXJ0aW5nIHRoaXMgb2JqZWN0IHRvIGEgU3RyaW5nLlxuICogSWYgdGhlcmUgaXMgbm8gZWxlbWVudCBhdCB0aGF0IHBvc2l0aW9uLCB0aGUgcmVzdWx0IGlzIHVuZGVmaW5lZC5cbiAqIElmIGEgdmFsaWQgVVRGLTE2IHN1cnJvZ2F0ZSBwYWlyIGRvZXMgbm90IGJlZ2luIGF0IHBvcywgdGhlIHJlc3VsdCBpcyB0aGUgY29kZSB1bml0IGF0IHBvcy5cbiAqL1xuZXhwb3J0IGxldCBjb2RlUG9pbnRBdDogKHRhcmdldDogc3RyaW5nLCBwb3M/OiBudW1iZXIpID0+IG51bWJlciB8IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNlcXVlbmNlIG9mIGVsZW1lbnRzIG9mIHNlYXJjaFN0cmluZyBjb252ZXJ0ZWQgdG8gYSBTdHJpbmcgaXMgdGhlXG4gKiBzYW1lIGFzIHRoZSBjb3JyZXNwb25kaW5nIGVsZW1lbnRzIG9mIHRoaXMgb2JqZWN0IChjb252ZXJ0ZWQgdG8gYSBTdHJpbmcpIHN0YXJ0aW5nIGF0XG4gKiBlbmRQb3NpdGlvbiDigJMgbGVuZ3RoKHRoaXMpLiBPdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cbiAqL1xuZXhwb3J0IGxldCBlbmRzV2l0aDogKHRhcmdldDogc3RyaW5nLCBzZWFyY2hTdHJpbmc6IHN0cmluZywgZW5kUG9zaXRpb24/OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHNlYXJjaFN0cmluZyBhcHBlYXJzIGFzIGEgc3Vic3RyaW5nIG9mIHRoZSByZXN1bHQgb2YgY29udmVydGluZyB0aGlzXG4gKiBvYmplY3QgdG8gYSBTdHJpbmcsIGF0IG9uZSBvciBtb3JlIHBvc2l0aW9ucyB0aGF0IGFyZVxuICogZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHBvc2l0aW9uOyBvdGhlcndpc2UsIHJldHVybnMgZmFsc2UuXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc3RyaW5nXG4gKiBAcGFyYW0gc2VhcmNoU3RyaW5nIHNlYXJjaCBzdHJpbmdcbiAqIEBwYXJhbSBwb3NpdGlvbiBJZiBwb3NpdGlvbiBpcyB1bmRlZmluZWQsIDAgaXMgYXNzdW1lZCwgc28gYXMgdG8gc2VhcmNoIGFsbCBvZiB0aGUgU3RyaW5nLlxuICovXG5leHBvcnQgbGV0IGluY2x1ZGVzOiAodGFyZ2V0OiBzdHJpbmcsIHNlYXJjaFN0cmluZzogc3RyaW5nLCBwb3NpdGlvbj86IG51bWJlcikgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBTdHJpbmcgdmFsdWUgcmVzdWx0IG9mIG5vcm1hbGl6aW5nIHRoZSBzdHJpbmcgaW50byB0aGUgbm9ybWFsaXphdGlvbiBmb3JtXG4gKiBuYW1lZCBieSBmb3JtIGFzIHNwZWNpZmllZCBpbiBVbmljb2RlIFN0YW5kYXJkIEFubmV4ICMxNSwgVW5pY29kZSBOb3JtYWxpemF0aW9uIEZvcm1zLlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHN0cmluZ1xuICogQHBhcmFtIGZvcm0gQXBwbGljYWJsZSB2YWx1ZXM6IFwiTkZDXCIsIFwiTkZEXCIsIFwiTkZLQ1wiLCBvciBcIk5GS0RcIiwgSWYgbm90IHNwZWNpZmllZCBkZWZhdWx0XG4gKiBpcyBcIk5GQ1wiXG4gKi9cbmV4cG9ydCBsZXQgbm9ybWFsaXplOiBTdHJpbmdOb3JtYWxpemU7XG5cbi8qKlxuICogUmV0dXJucyBhIFN0cmluZyB2YWx1ZSB0aGF0IGlzIG1hZGUgZnJvbSBjb3VudCBjb3BpZXMgYXBwZW5kZWQgdG9nZXRoZXIuIElmIGNvdW50IGlzIDAsXG4gKiBUIGlzIHRoZSBlbXB0eSBTdHJpbmcgaXMgcmV0dXJuZWQuXG4gKiBAcGFyYW0gY291bnQgbnVtYmVyIG9mIGNvcGllcyB0byBhcHBlbmRcbiAqL1xuZXhwb3J0IGxldCByZXBlYXQ6ICh0YXJnZXQ6IHN0cmluZywgY291bnQ/OiBudW1iZXIpID0+IHN0cmluZztcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNlcXVlbmNlIG9mIGVsZW1lbnRzIG9mIHNlYXJjaFN0cmluZyBjb252ZXJ0ZWQgdG8gYSBTdHJpbmcgaXMgdGhlXG4gKiBzYW1lIGFzIHRoZSBjb3JyZXNwb25kaW5nIGVsZW1lbnRzIG9mIHRoaXMgb2JqZWN0IChjb252ZXJ0ZWQgdG8gYSBTdHJpbmcpIHN0YXJ0aW5nIGF0XG4gKiBwb3NpdGlvbi4gT3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBsZXQgc3RhcnRzV2l0aDogKHRhcmdldDogc3RyaW5nLCBzZWFyY2hTdHJpbmc6IHN0cmluZywgcG9zaXRpb24/OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbi8qIEVTNyBpbnN0YW5jZSBtZXRob2RzICovXG5cbi8qKlxuICogUGFkcyB0aGUgY3VycmVudCBzdHJpbmcgd2l0aCBhIGdpdmVuIHN0cmluZyAocG9zc2libHkgcmVwZWF0ZWQpIHNvIHRoYXQgdGhlIHJlc3VsdGluZyBzdHJpbmcgcmVhY2hlcyBhIGdpdmVuIGxlbmd0aC5cbiAqIFRoZSBwYWRkaW5nIGlzIGFwcGxpZWQgZnJvbSB0aGUgZW5kIChyaWdodCkgb2YgdGhlIGN1cnJlbnQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcbiAqIEBwYXJhbSBtYXhMZW5ndGggVGhlIGxlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHN0cmluZyBvbmNlIHRoZSBjdXJyZW50IHN0cmluZyBoYXMgYmVlbiBwYWRkZWQuXG4gKiAgICAgICAgSWYgdGhpcyBwYXJhbWV0ZXIgaXMgc21hbGxlciB0aGFuIHRoZSBjdXJyZW50IHN0cmluZydzIGxlbmd0aCwgdGhlIGN1cnJlbnQgc3RyaW5nIHdpbGwgYmUgcmV0dXJuZWQgYXMgaXQgaXMuXG4gKlxuICogQHBhcmFtIGZpbGxTdHJpbmcgVGhlIHN0cmluZyB0byBwYWQgdGhlIGN1cnJlbnQgc3RyaW5nIHdpdGguXG4gKiAgICAgICAgSWYgdGhpcyBzdHJpbmcgaXMgdG9vIGxvbmcsIGl0IHdpbGwgYmUgdHJ1bmNhdGVkIGFuZCB0aGUgbGVmdC1tb3N0IHBhcnQgd2lsbCBiZSBhcHBsaWVkLlxuICogICAgICAgIFRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGlzIHBhcmFtZXRlciBpcyBcIiBcIiAoVSswMDIwKS5cbiAqL1xuZXhwb3J0IGxldCBwYWRFbmQ6ICh0YXJnZXQ6IHN0cmluZywgbWF4TGVuZ3RoOiBudW1iZXIsIGZpbGxTdHJpbmc/OiBzdHJpbmcpID0+IHN0cmluZztcblxuLyoqXG4gKiBQYWRzIHRoZSBjdXJyZW50IHN0cmluZyB3aXRoIGEgZ2l2ZW4gc3RyaW5nIChwb3NzaWJseSByZXBlYXRlZCkgc28gdGhhdCB0aGUgcmVzdWx0aW5nIHN0cmluZyByZWFjaGVzIGEgZ2l2ZW4gbGVuZ3RoLlxuICogVGhlIHBhZGRpbmcgaXMgYXBwbGllZCBmcm9tIHRoZSBzdGFydCAobGVmdCkgb2YgdGhlIGN1cnJlbnQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcbiAqIEBwYXJhbSBtYXhMZW5ndGggVGhlIGxlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHN0cmluZyBvbmNlIHRoZSBjdXJyZW50IHN0cmluZyBoYXMgYmVlbiBwYWRkZWQuXG4gKiAgICAgICAgSWYgdGhpcyBwYXJhbWV0ZXIgaXMgc21hbGxlciB0aGFuIHRoZSBjdXJyZW50IHN0cmluZydzIGxlbmd0aCwgdGhlIGN1cnJlbnQgc3RyaW5nIHdpbGwgYmUgcmV0dXJuZWQgYXMgaXQgaXMuXG4gKlxuICogQHBhcmFtIGZpbGxTdHJpbmcgVGhlIHN0cmluZyB0byBwYWQgdGhlIGN1cnJlbnQgc3RyaW5nIHdpdGguXG4gKiAgICAgICAgSWYgdGhpcyBzdHJpbmcgaXMgdG9vIGxvbmcsIGl0IHdpbGwgYmUgdHJ1bmNhdGVkIGFuZCB0aGUgbGVmdC1tb3N0IHBhcnQgd2lsbCBiZSBhcHBsaWVkLlxuICogICAgICAgIFRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGlzIHBhcmFtZXRlciBpcyBcIiBcIiAoVSswMDIwKS5cbiAqL1xuZXhwb3J0IGxldCBwYWRTdGFydDogKHRhcmdldDogc3RyaW5nLCBtYXhMZW5ndGg6IG51bWJlciwgZmlsbFN0cmluZz86IHN0cmluZykgPT4gc3RyaW5nO1xuXG5pZiAoaGFzKCdlczYtc3RyaW5nJykgJiYgaGFzKCdlczYtc3RyaW5nLXJhdycpKSB7XG5cdGZyb21Db2RlUG9pbnQgPSBnbG9iYWwuU3RyaW5nLmZyb21Db2RlUG9pbnQ7XG5cdHJhdyA9IGdsb2JhbC5TdHJpbmcucmF3O1xuXG5cdGNvZGVQb2ludEF0ID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5jb2RlUG9pbnRBdCk7XG5cdGVuZHNXaXRoID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aCk7XG5cdGluY2x1ZGVzID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyk7XG5cdG5vcm1hbGl6ZSA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUubm9ybWFsaXplKTtcblx0cmVwZWF0ID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5yZXBlYXQpO1xuXHRzdGFydHNXaXRoID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKTtcbn0gZWxzZSB7XG5cdC8qKlxuXHQgKiBWYWxpZGF0ZXMgdGhhdCB0ZXh0IGlzIGRlZmluZWQsIGFuZCBub3JtYWxpemVzIHBvc2l0aW9uIChiYXNlZCBvbiB0aGUgZ2l2ZW4gZGVmYXVsdCBpZiB0aGUgaW5wdXQgaXMgTmFOKS5cblx0ICogVXNlZCBieSBzdGFydHNXaXRoLCBpbmNsdWRlcywgYW5kIGVuZHNXaXRoLlxuXHQgKlxuXHQgKiBAcmV0dXJuIE5vcm1hbGl6ZWQgcG9zaXRpb24uXG5cdCAqL1xuXHRjb25zdCBub3JtYWxpemVTdWJzdHJpbmdBcmdzID0gZnVuY3Rpb24oXG5cdFx0bmFtZTogc3RyaW5nLFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRzZWFyY2g6IHN0cmluZyxcblx0XHRwb3NpdGlvbjogbnVtYmVyLFxuXHRcdGlzRW5kOiBib29sZWFuID0gZmFsc2Vcblx0KTogW3N0cmluZywgc3RyaW5nLCBudW1iZXJdIHtcblx0XHRpZiAodGV4dCA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcuJyArIG5hbWUgKyAnIHJlcXVpcmVzIGEgdmFsaWQgc3RyaW5nIHRvIHNlYXJjaCBhZ2FpbnN0LicpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGxlbmd0aCA9IHRleHQubGVuZ3RoO1xuXHRcdHBvc2l0aW9uID0gcG9zaXRpb24gIT09IHBvc2l0aW9uID8gKGlzRW5kID8gbGVuZ3RoIDogMCkgOiBwb3NpdGlvbjtcblx0XHRyZXR1cm4gW3RleHQsIFN0cmluZyhzZWFyY2gpLCBNYXRoLm1pbihNYXRoLm1heChwb3NpdGlvbiwgMCksIGxlbmd0aCldO1xuXHR9O1xuXG5cdGZyb21Db2RlUG9pbnQgPSBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHM6IG51bWJlcltdKTogc3RyaW5nIHtcblx0XHQvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLmZyb21Db2RlUG9pbnRcblx0XHRjb25zdCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuXHRcdGlmICghbGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblx0XHRjb25zdCBNQVhfU0laRSA9IDB4NDAwMDtcblx0XHRsZXQgY29kZVVuaXRzOiBudW1iZXJbXSA9IFtdO1xuXHRcdGxldCBpbmRleCA9IC0xO1xuXHRcdGxldCByZXN1bHQgPSAnJztcblxuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0XHRsZXQgY29kZVBvaW50ID0gTnVtYmVyKGFyZ3VtZW50c1tpbmRleF0pO1xuXG5cdFx0XHQvLyBDb2RlIHBvaW50cyBtdXN0IGJlIGZpbml0ZSBpbnRlZ2VycyB3aXRoaW4gdGhlIHZhbGlkIHJhbmdlXG5cdFx0XHRsZXQgaXNWYWxpZCA9XG5cdFx0XHRcdGlzRmluaXRlKGNvZGVQb2ludCkgJiYgTWF0aC5mbG9vcihjb2RlUG9pbnQpID09PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50ID49IDAgJiYgY29kZVBvaW50IDw9IDB4MTBmZmZmO1xuXHRcdFx0aWYgKCFpc1ZhbGlkKSB7XG5cdFx0XHRcdHRocm93IFJhbmdlRXJyb3IoJ3N0cmluZy5mcm9tQ29kZVBvaW50OiBJbnZhbGlkIGNvZGUgcG9pbnQgJyArIGNvZGVQb2ludCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb2RlUG9pbnQgPD0gMHhmZmZmKSB7XG5cdFx0XHRcdC8vIEJNUCBjb2RlIHBvaW50XG5cdFx0XHRcdGNvZGVVbml0cy5wdXNoKGNvZGVQb2ludCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBBc3RyYWwgY29kZSBwb2ludDsgc3BsaXQgaW4gc3Vycm9nYXRlIGhhbHZlc1xuXHRcdFx0XHQvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcblx0XHRcdFx0Y29kZVBvaW50IC09IDB4MTAwMDA7XG5cdFx0XHRcdGxldCBoaWdoU3Vycm9nYXRlID0gKGNvZGVQb2ludCA+PiAxMCkgKyBISUdIX1NVUlJPR0FURV9NSU47XG5cdFx0XHRcdGxldCBsb3dTdXJyb2dhdGUgPSAoY29kZVBvaW50ICUgMHg0MDApICsgTE9XX1NVUlJPR0FURV9NSU47XG5cdFx0XHRcdGNvZGVVbml0cy5wdXNoKGhpZ2hTdXJyb2dhdGUsIGxvd1N1cnJvZ2F0ZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpbmRleCArIDEgPT09IGxlbmd0aCB8fCBjb2RlVW5pdHMubGVuZ3RoID4gTUFYX1NJWkUpIHtcblx0XHRcdFx0cmVzdWx0ICs9IGZyb21DaGFyQ29kZS5hcHBseShudWxsLCBjb2RlVW5pdHMpO1xuXHRcdFx0XHRjb2RlVW5pdHMubGVuZ3RoID0gMDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHRyYXcgPSBmdW5jdGlvbiByYXcoY2FsbFNpdGU6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5zdWJzdGl0dXRpb25zOiBhbnlbXSk6IHN0cmluZyB7XG5cdFx0bGV0IHJhd1N0cmluZ3MgPSBjYWxsU2l0ZS5yYXc7XG5cdFx0bGV0IHJlc3VsdCA9ICcnO1xuXHRcdGxldCBudW1TdWJzdGl0dXRpb25zID0gc3Vic3RpdHV0aW9ucy5sZW5ndGg7XG5cblx0XHRpZiAoY2FsbFNpdGUgPT0gbnVsbCB8fCBjYWxsU2l0ZS5yYXcgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLnJhdyByZXF1aXJlcyBhIHZhbGlkIGNhbGxTaXRlIG9iamVjdCB3aXRoIGEgcmF3IHZhbHVlJyk7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJhd1N0cmluZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdHJlc3VsdCArPSByYXdTdHJpbmdzW2ldICsgKGkgPCBudW1TdWJzdGl0dXRpb25zICYmIGkgPCBsZW5ndGggLSAxID8gc3Vic3RpdHV0aW9uc1tpXSA6ICcnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXG5cdGNvZGVQb2ludEF0ID0gZnVuY3Rpb24gY29kZVBvaW50QXQodGV4dDogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyID0gMCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG5cdFx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXRcblx0XHRpZiAodGV4dCA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcuY29kZVBvaW50QXQgcmVxdXJpZXMgYSB2YWxpZCBzdHJpbmcuJyk7XG5cdFx0fVxuXHRcdGNvbnN0IGxlbmd0aCA9IHRleHQubGVuZ3RoO1xuXG5cdFx0aWYgKHBvc2l0aW9uICE9PSBwb3NpdGlvbikge1xuXHRcdFx0cG9zaXRpb24gPSAwO1xuXHRcdH1cblx0XHRpZiAocG9zaXRpb24gPCAwIHx8IHBvc2l0aW9uID49IGxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIGZpcnN0IGNvZGUgdW5pdFxuXHRcdGNvbnN0IGZpcnN0ID0gdGV4dC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcblx0XHRpZiAoZmlyc3QgPj0gSElHSF9TVVJST0dBVEVfTUlOICYmIGZpcnN0IDw9IEhJR0hfU1VSUk9HQVRFX01BWCAmJiBsZW5ndGggPiBwb3NpdGlvbiArIDEpIHtcblx0XHRcdC8vIFN0YXJ0IG9mIGEgc3Vycm9nYXRlIHBhaXIgKGhpZ2ggc3Vycm9nYXRlIGFuZCB0aGVyZSBpcyBhIG5leHQgY29kZSB1bml0KTsgY2hlY2sgZm9yIGxvdyBzdXJyb2dhdGVcblx0XHRcdC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHRcdFx0Y29uc3Qgc2Vjb25kID0gdGV4dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSk7XG5cdFx0XHRpZiAoc2Vjb25kID49IExPV19TVVJST0dBVEVfTUlOICYmIHNlY29uZCA8PSBMT1dfU1VSUk9HQVRFX01BWCkge1xuXHRcdFx0XHRyZXR1cm4gKGZpcnN0IC0gSElHSF9TVVJST0dBVEVfTUlOKSAqIDB4NDAwICsgc2Vjb25kIC0gTE9XX1NVUlJPR0FURV9NSU4gKyAweDEwMDAwO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmlyc3Q7XG5cdH07XG5cblx0ZW5kc1dpdGggPSBmdW5jdGlvbiBlbmRzV2l0aCh0ZXh0OiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nLCBlbmRQb3NpdGlvbj86IG51bWJlcik6IGJvb2xlYW4ge1xuXHRcdGlmIChzZWFyY2ggPT09ICcnKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGVuZFBvc2l0aW9uID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0ZW5kUG9zaXRpb24gPSB0ZXh0Lmxlbmd0aDtcblx0XHR9IGVsc2UgaWYgKGVuZFBvc2l0aW9uID09PSBudWxsIHx8IGlzTmFOKGVuZFBvc2l0aW9uKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdFt0ZXh0LCBzZWFyY2gsIGVuZFBvc2l0aW9uXSA9IG5vcm1hbGl6ZVN1YnN0cmluZ0FyZ3MoJ2VuZHNXaXRoJywgdGV4dCwgc2VhcmNoLCBlbmRQb3NpdGlvbiwgdHJ1ZSk7XG5cblx0XHRjb25zdCBzdGFydCA9IGVuZFBvc2l0aW9uIC0gc2VhcmNoLmxlbmd0aDtcblx0XHRpZiAoc3RhcnQgPCAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRleHQuc2xpY2Uoc3RhcnQsIGVuZFBvc2l0aW9uKSA9PT0gc2VhcmNoO1xuXHR9O1xuXG5cdGluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXModGV4dDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgcG9zaXRpb246IG51bWJlciA9IDApOiBib29sZWFuIHtcblx0XHRbdGV4dCwgc2VhcmNoLCBwb3NpdGlvbl0gPSBub3JtYWxpemVTdWJzdHJpbmdBcmdzKCdpbmNsdWRlcycsIHRleHQsIHNlYXJjaCwgcG9zaXRpb24pO1xuXHRcdHJldHVybiB0ZXh0LmluZGV4T2Yoc2VhcmNoLCBwb3NpdGlvbikgIT09IC0xO1xuXHR9O1xuXG5cdHJlcGVhdCA9IGZ1bmN0aW9uIHJlcGVhdCh0ZXh0OiBzdHJpbmcsIGNvdW50OiBudW1iZXIgPSAwKTogc3RyaW5nIHtcblx0XHQvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5yZXBlYXRcblx0XHRpZiAodGV4dCA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcucmVwZWF0IHJlcXVpcmVzIGEgdmFsaWQgc3RyaW5nLicpO1xuXHRcdH1cblx0XHRpZiAoY291bnQgIT09IGNvdW50KSB7XG5cdFx0XHRjb3VudCA9IDA7XG5cdFx0fVxuXHRcdGlmIChjb3VudCA8IDAgfHwgY291bnQgPT09IEluZmluaXR5KSB7XG5cdFx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3RyaW5nLnJlcGVhdCByZXF1aXJlcyBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgY291bnQuJyk7XG5cdFx0fVxuXG5cdFx0bGV0IHJlc3VsdCA9ICcnO1xuXHRcdHdoaWxlIChjb3VudCkge1xuXHRcdFx0aWYgKGNvdW50ICUgMikge1xuXHRcdFx0XHRyZXN1bHQgKz0gdGV4dDtcblx0XHRcdH1cblx0XHRcdGlmIChjb3VudCA+IDEpIHtcblx0XHRcdFx0dGV4dCArPSB0ZXh0O1xuXHRcdFx0fVxuXHRcdFx0Y291bnQgPj49IDE7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cblx0c3RhcnRzV2l0aCA9IGZ1bmN0aW9uIHN0YXJ0c1dpdGgodGV4dDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgcG9zaXRpb246IG51bWJlciA9IDApOiBib29sZWFuIHtcblx0XHRzZWFyY2ggPSBTdHJpbmcoc2VhcmNoKTtcblx0XHRbdGV4dCwgc2VhcmNoLCBwb3NpdGlvbl0gPSBub3JtYWxpemVTdWJzdHJpbmdBcmdzKCdzdGFydHNXaXRoJywgdGV4dCwgc2VhcmNoLCBwb3NpdGlvbik7XG5cblx0XHRjb25zdCBlbmQgPSBwb3NpdGlvbiArIHNlYXJjaC5sZW5ndGg7XG5cdFx0aWYgKGVuZCA+IHRleHQubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRleHQuc2xpY2UocG9zaXRpb24sIGVuZCkgPT09IHNlYXJjaDtcblx0fTtcbn1cblxuaWYgKGhhcygnZXMyMDE3LXN0cmluZycpKSB7XG5cdHBhZEVuZCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUucGFkRW5kKTtcblx0cGFkU3RhcnQgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLnBhZFN0YXJ0KTtcbn0gZWxzZSB7XG5cdHBhZEVuZCA9IGZ1bmN0aW9uIHBhZEVuZCh0ZXh0OiBzdHJpbmcsIG1heExlbmd0aDogbnVtYmVyLCBmaWxsU3RyaW5nOiBzdHJpbmcgPSAnICcpOiBzdHJpbmcge1xuXHRcdGlmICh0ZXh0ID09PSBudWxsIHx8IHRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLnJlcGVhdCByZXF1aXJlcyBhIHZhbGlkIHN0cmluZy4nKTtcblx0XHR9XG5cblx0XHRpZiAobWF4TGVuZ3RoID09PSBJbmZpbml0eSkge1xuXHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3N0cmluZy5wYWRFbmQgcmVxdWlyZXMgYSBub24tbmVnYXRpdmUgZmluaXRlIGNvdW50LicpO1xuXHRcdH1cblxuXHRcdGlmIChtYXhMZW5ndGggPT09IG51bGwgfHwgbWF4TGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbWF4TGVuZ3RoIDwgMCkge1xuXHRcdFx0bWF4TGVuZ3RoID0gMDtcblx0XHR9XG5cblx0XHRsZXQgc3RyVGV4dCA9IFN0cmluZyh0ZXh0KTtcblx0XHRjb25zdCBwYWRkaW5nID0gbWF4TGVuZ3RoIC0gc3RyVGV4dC5sZW5ndGg7XG5cblx0XHRpZiAocGFkZGluZyA+IDApIHtcblx0XHRcdHN0clRleHQgKz1cblx0XHRcdFx0cmVwZWF0KGZpbGxTdHJpbmcsIE1hdGguZmxvb3IocGFkZGluZyAvIGZpbGxTdHJpbmcubGVuZ3RoKSkgK1xuXHRcdFx0XHRmaWxsU3RyaW5nLnNsaWNlKDAsIHBhZGRpbmcgJSBmaWxsU3RyaW5nLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0clRleHQ7XG5cdH07XG5cblx0cGFkU3RhcnQgPSBmdW5jdGlvbiBwYWRTdGFydCh0ZXh0OiBzdHJpbmcsIG1heExlbmd0aDogbnVtYmVyLCBmaWxsU3RyaW5nOiBzdHJpbmcgPSAnICcpOiBzdHJpbmcge1xuXHRcdGlmICh0ZXh0ID09PSBudWxsIHx8IHRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLnJlcGVhdCByZXF1aXJlcyBhIHZhbGlkIHN0cmluZy4nKTtcblx0XHR9XG5cblx0XHRpZiAobWF4TGVuZ3RoID09PSBJbmZpbml0eSkge1xuXHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3N0cmluZy5wYWRTdGFydCByZXF1aXJlcyBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgY291bnQuJyk7XG5cdFx0fVxuXG5cdFx0aWYgKG1heExlbmd0aCA9PT0gbnVsbCB8fCBtYXhMZW5ndGggPT09IHVuZGVmaW5lZCB8fCBtYXhMZW5ndGggPCAwKSB7XG5cdFx0XHRtYXhMZW5ndGggPSAwO1xuXHRcdH1cblxuXHRcdGxldCBzdHJUZXh0ID0gU3RyaW5nKHRleHQpO1xuXHRcdGNvbnN0IHBhZGRpbmcgPSBtYXhMZW5ndGggLSBzdHJUZXh0Lmxlbmd0aDtcblxuXHRcdGlmIChwYWRkaW5nID4gMCkge1xuXHRcdFx0c3RyVGV4dCA9XG5cdFx0XHRcdHJlcGVhdChmaWxsU3RyaW5nLCBNYXRoLmZsb29yKHBhZGRpbmcgLyBmaWxsU3RyaW5nLmxlbmd0aCkpICtcblx0XHRcdFx0ZmlsbFN0cmluZy5zbGljZSgwLCBwYWRkaW5nICUgZmlsbFN0cmluZy5sZW5ndGgpICtcblx0XHRcdFx0c3RyVGV4dDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3RyVGV4dDtcblx0fTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBzdHJpbmcudHMiLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4uL2dsb2JhbCc7XG5pbXBvcnQgaGFzIGZyb20gJy4vaGFzJztcbmltcG9ydCB7IEhhbmRsZSB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG5mdW5jdGlvbiBleGVjdXRlVGFzayhpdGVtOiBRdWV1ZUl0ZW0gfCB1bmRlZmluZWQpOiB2b2lkIHtcblx0aWYgKGl0ZW0gJiYgaXRlbS5pc0FjdGl2ZSAmJiBpdGVtLmNhbGxiYWNrKSB7XG5cdFx0aXRlbS5jYWxsYmFjaygpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldFF1ZXVlSGFuZGxlKGl0ZW06IFF1ZXVlSXRlbSwgZGVzdHJ1Y3Rvcj86ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0cmV0dXJuIHtcblx0XHRkZXN0cm95OiBmdW5jdGlvbih0aGlzOiBIYW5kbGUpIHtcblx0XHRcdHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCkge307XG5cdFx0XHRpdGVtLmlzQWN0aXZlID0gZmFsc2U7XG5cdFx0XHRpdGVtLmNhbGxiYWNrID0gbnVsbDtcblxuXHRcdFx0aWYgKGRlc3RydWN0b3IpIHtcblx0XHRcdFx0ZGVzdHJ1Y3RvcigpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn1cblxuaW50ZXJmYWNlIFBvc3RNZXNzYWdlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG5cdHNvdXJjZTogYW55O1xuXHRkYXRhOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVtIHtcblx0aXNBY3RpdmU6IGJvb2xlYW47XG5cdGNhbGxiYWNrOiBudWxsIHwgKCguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTtcbn1cblxubGV0IGNoZWNrTWljcm9UYXNrUXVldWU6ICgpID0+IHZvaWQ7XG5sZXQgbWljcm9UYXNrczogUXVldWVJdGVtW107XG5cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gdGhlIG1hY3JvdGFzayBxdWV1ZS5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGZ1bmN0aW9uIHRvIGJlIHF1ZXVlZCBhbmQgbGF0ZXIgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBhIGBkZXN0cm95YCBtZXRob2QgdGhhdCwgd2hlbiBjYWxsZWQsIHByZXZlbnRzIHRoZSByZWdpc3RlcmVkIGNhbGxiYWNrIGZyb20gZXhlY3V0aW5nLlxuICovXG5leHBvcnQgY29uc3QgcXVldWVUYXNrID0gKGZ1bmN0aW9uKCkge1xuXHRsZXQgZGVzdHJ1Y3RvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG5cdGxldCBlbnF1ZXVlOiAoaXRlbTogUXVldWVJdGVtKSA9PiB2b2lkO1xuXG5cdC8vIFNpbmNlIHRoZSBJRSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0SW1tZWRpYXRlYCBpcyBub3QgZmxhd2xlc3MsIHdlIHdpbGwgdGVzdCBmb3IgYHBvc3RNZXNzYWdlYCBmaXJzdC5cblx0aWYgKGhhcygncG9zdG1lc3NhZ2UnKSkge1xuXHRcdGNvbnN0IHF1ZXVlOiBRdWV1ZUl0ZW1bXSA9IFtdO1xuXG5cdFx0Z2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldmVudDogUG9zdE1lc3NhZ2VFdmVudCk6IHZvaWQge1xuXHRcdFx0Ly8gQ29uZmlybSB0aGF0IHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IHRoZSBjdXJyZW50IHdpbmRvdyBhbmQgYnkgdGhpcyBwYXJ0aWN1bGFyIGltcGxlbWVudGF0aW9uLlxuXHRcdFx0aWYgKGV2ZW50LnNvdXJjZSA9PT0gZ2xvYmFsICYmIGV2ZW50LmRhdGEgPT09ICdkb2pvLXF1ZXVlLW1lc3NhZ2UnKSB7XG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0XHRcdGlmIChxdWV1ZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRleGVjdXRlVGFzayhxdWV1ZS5zaGlmdCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0cXVldWUucHVzaChpdGVtKTtcblx0XHRcdGdsb2JhbC5wb3N0TWVzc2FnZSgnZG9qby1xdWV1ZS1tZXNzYWdlJywgJyonKTtcblx0XHR9O1xuXHR9IGVsc2UgaWYgKGhhcygnc2V0aW1tZWRpYXRlJykpIHtcblx0XHRkZXN0cnVjdG9yID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlO1xuXHRcdGVucXVldWUgPSBmdW5jdGlvbihpdGVtOiBRdWV1ZUl0ZW0pOiBhbnkge1xuXHRcdFx0cmV0dXJuIHNldEltbWVkaWF0ZShleGVjdXRlVGFzay5iaW5kKG51bGwsIGl0ZW0pKTtcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGRlc3RydWN0b3IgPSBnbG9iYWwuY2xlYXJUaW1lb3V0O1xuXHRcdGVucXVldWUgPSBmdW5jdGlvbihpdGVtOiBRdWV1ZUl0ZW0pOiBhbnkge1xuXHRcdFx0cmV0dXJuIHNldFRpbWVvdXQoZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSwgMCk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIHF1ZXVlVGFzayhjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdGNvbnN0IGl0ZW06IFF1ZXVlSXRlbSA9IHtcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fTtcblx0XHRjb25zdCBpZDogYW55ID0gZW5xdWV1ZShpdGVtKTtcblxuXHRcdHJldHVybiBnZXRRdWV1ZUhhbmRsZShcblx0XHRcdGl0ZW0sXG5cdFx0XHRkZXN0cnVjdG9yICYmXG5cdFx0XHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRlc3RydWN0b3IoaWQpO1xuXHRcdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8vIFRPRE86IFVzZSBhc3BlY3QuYmVmb3JlIHdoZW4gaXQgaXMgYXZhaWxhYmxlLlxuXHRyZXR1cm4gaGFzKCdtaWNyb3Rhc2tzJylcblx0XHQ/IHF1ZXVlVGFza1xuXHRcdDogZnVuY3Rpb24oY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRcdFx0Y2hlY2tNaWNyb1Rhc2tRdWV1ZSgpO1xuXHRcdFx0XHRyZXR1cm4gcXVldWVUYXNrKGNhbGxiYWNrKTtcblx0XHQgIH07XG59KSgpO1xuXG4vLyBXaGVuIG5vIG1lY2hhbmlzbSBmb3IgcmVnaXN0ZXJpbmcgbWljcm90YXNrcyBpcyBleHBvc2VkIGJ5IHRoZSBlbnZpcm9ubWVudCwgbWljcm90YXNrcyB3aWxsXG4vLyBiZSBxdWV1ZWQgYW5kIHRoZW4gZXhlY3V0ZWQgaW4gYSBzaW5nbGUgbWFjcm90YXNrIGJlZm9yZSB0aGUgb3RoZXIgbWFjcm90YXNrcyBhcmUgZXhlY3V0ZWQuXG5pZiAoIWhhcygnbWljcm90YXNrcycpKSB7XG5cdGxldCBpc01pY3JvVGFza1F1ZXVlZCA9IGZhbHNlO1xuXG5cdG1pY3JvVGFza3MgPSBbXTtcblx0Y2hlY2tNaWNyb1Rhc2tRdWV1ZSA9IGZ1bmN0aW9uKCk6IHZvaWQge1xuXHRcdGlmICghaXNNaWNyb1Rhc2tRdWV1ZWQpIHtcblx0XHRcdGlzTWljcm9UYXNrUXVldWVkID0gdHJ1ZTtcblx0XHRcdHF1ZXVlVGFzayhmdW5jdGlvbigpIHtcblx0XHRcdFx0aXNNaWNyb1Rhc2tRdWV1ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAobWljcm9UYXNrcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRsZXQgaXRlbTogUXVldWVJdGVtIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdHdoaWxlICgoaXRlbSA9IG1pY3JvVGFza3Muc2hpZnQoKSkpIHtcblx0XHRcdFx0XHRcdGV4ZWN1dGVUYXNrKGl0ZW0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIFNjaGVkdWxlcyBhbiBhbmltYXRpb24gdGFzayB3aXRoIGB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBpZiBpdCBleGlzdHMsIG9yIHdpdGggYHF1ZXVlVGFza2Agb3RoZXJ3aXNlLlxuICpcbiAqIFNpbmNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSdzIGJlaGF2aW9yIGRvZXMgbm90IG1hdGNoIHRoYXQgZXhwZWN0ZWQgZnJvbSBgcXVldWVUYXNrYCwgaXQgaXMgbm90IHVzZWQgdGhlcmUuXG4gKiBIb3dldmVyLCBhdCB0aW1lcyBpdCBtYWtlcyBtb3JlIHNlbnNlIHRvIGRlbGVnYXRlIHRvIHJlcXVlc3RBbmltYXRpb25GcmFtZTsgaGVuY2UgdGhlIGZvbGxvd2luZyBtZXRob2QuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIHRoZSBmdW5jdGlvbiB0byBiZSBxdWV1ZWQgYW5kIGxhdGVyIGV4ZWN1dGVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYSBgZGVzdHJveWAgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBwcmV2ZW50cyB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjayBmcm9tIGV4ZWN1dGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IHF1ZXVlQW5pbWF0aW9uVGFzayA9IChmdW5jdGlvbigpIHtcblx0aWYgKCFoYXMoJ3JhZicpKSB7XG5cdFx0cmV0dXJuIHF1ZXVlVGFzaztcblx0fVxuXG5cdGZ1bmN0aW9uIHF1ZXVlQW5pbWF0aW9uVGFzayhjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdGNvbnN0IGl0ZW06IFF1ZXVlSXRlbSA9IHtcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fTtcblx0XHRjb25zdCByYWZJZDogbnVtYmVyID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGV4ZWN1dGVUYXNrLmJpbmQobnVsbCwgaXRlbSkpO1xuXG5cdFx0cmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmSWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gVE9ETzogVXNlIGFzcGVjdC5iZWZvcmUgd2hlbiBpdCBpcyBhdmFpbGFibGUuXG5cdHJldHVybiBoYXMoJ21pY3JvdGFza3MnKVxuXHRcdD8gcXVldWVBbmltYXRpb25UYXNrXG5cdFx0OiBmdW5jdGlvbihjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdFx0XHRjaGVja01pY3JvVGFza1F1ZXVlKCk7XG5cdFx0XHRcdHJldHVybiBxdWV1ZUFuaW1hdGlvblRhc2soY2FsbGJhY2spO1xuXHRcdCAgfTtcbn0pKCk7XG5cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gdGhlIG1pY3JvdGFzayBxdWV1ZS5cbiAqXG4gKiBBbnkgY2FsbGJhY2tzIHJlZ2lzdGVyZWQgd2l0aCBgcXVldWVNaWNyb1Rhc2tgIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIHRoZSBuZXh0IG1hY3JvdGFzay4gSWYgbm8gbmF0aXZlXG4gKiBtZWNoYW5pc20gZm9yIHNjaGVkdWxpbmcgbWFjcm90YXNrcyBpcyBleHBvc2VkLCB0aGVuIGFueSBjYWxsYmFja3Mgd2lsbCBiZSBmaXJlZCBiZWZvcmUgYW55IG1hY3JvdGFza1xuICogcmVnaXN0ZXJlZCB3aXRoIGBxdWV1ZVRhc2tgIG9yIGBxdWV1ZUFuaW1hdGlvblRhc2tgLlxuICpcbiAqIEBwYXJhbSBjYWxsYmFjayB0aGUgZnVuY3Rpb24gdG8gYmUgcXVldWVkIGFuZCBsYXRlciBleGVjdXRlZC5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGEgYGRlc3Ryb3lgIG1ldGhvZCB0aGF0LCB3aGVuIGNhbGxlZCwgcHJldmVudHMgdGhlIHJlZ2lzdGVyZWQgY2FsbGJhY2sgZnJvbSBleGVjdXRpbmcuXG4gKi9cbmV4cG9ydCBsZXQgcXVldWVNaWNyb1Rhc2sgPSAoZnVuY3Rpb24oKSB7XG5cdGxldCBlbnF1ZXVlOiAoaXRlbTogUXVldWVJdGVtKSA9PiB2b2lkO1xuXG5cdGlmIChoYXMoJ2hvc3Qtbm9kZScpKSB7XG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0Z2xvYmFsLnByb2Nlc3MubmV4dFRpY2soZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSk7XG5cdFx0fTtcblx0fSBlbHNlIGlmIChoYXMoJ2VzNi1wcm9taXNlJykpIHtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24oaXRlbTogUXVldWVJdGVtKTogdm9pZCB7XG5cdFx0XHRnbG9iYWwuUHJvbWlzZS5yZXNvbHZlKGl0ZW0pLnRoZW4oZXhlY3V0ZVRhc2spO1xuXHRcdH07XG5cdH0gZWxzZSBpZiAoaGFzKCdkb20tbXV0YXRpb25vYnNlcnZlcicpKSB7XG5cdFx0LyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhcmlhYmxlLW5hbWUgKi9cblx0XHRjb25zdCBIb3N0TXV0YXRpb25PYnNlcnZlciA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuXHRcdGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRjb25zdCBxdWV1ZTogUXVldWVJdGVtW10gPSBbXTtcblx0XHRjb25zdCBvYnNlcnZlciA9IG5ldyBIb3N0TXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbigpOiB2b2lkIHtcblx0XHRcdHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnN0IGl0ZW0gPSBxdWV1ZS5zaGlmdCgpO1xuXHRcdFx0XHRpZiAoaXRlbSAmJiBpdGVtLmlzQWN0aXZlICYmIGl0ZW0uY2FsbGJhY2spIHtcblx0XHRcdFx0XHRpdGVtLmNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0cXVldWUucHVzaChpdGVtKTtcblx0XHRcdG5vZGUuc2V0QXR0cmlidXRlKCdxdWV1ZVN0YXR1cycsICcxJyk7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24oaXRlbTogUXVldWVJdGVtKTogdm9pZCB7XG5cdFx0XHRjaGVja01pY3JvVGFza1F1ZXVlKCk7XG5cdFx0XHRtaWNyb1Rhc2tzLnB1c2goaXRlbSk7XG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbihjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdGNvbnN0IGl0ZW06IFF1ZXVlSXRlbSA9IHtcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fTtcblxuXHRcdGVucXVldWUoaXRlbSk7XG5cblx0XHRyZXR1cm4gZ2V0UXVldWVIYW5kbGUoaXRlbSk7XG5cdH07XG59KSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHF1ZXVlLnRzIiwiaW1wb3J0IHsgRXZlbnRlZCwgRXZlbnRPYmplY3QgfSBmcm9tICcuLi9jb3JlL0V2ZW50ZWQnO1xuXG5leHBvcnQgdHlwZSBJbmplY3RvckV2ZW50TWFwID0ge1xuXHRpbnZhbGlkYXRlOiBFdmVudE9iamVjdDwnaW52YWxpZGF0ZSc+O1xufTtcblxuZXhwb3J0IGNsYXNzIEluamVjdG9yPFQgPSBhbnk+IGV4dGVuZHMgRXZlbnRlZDxJbmplY3RvckV2ZW50TWFwPiB7XG5cdHByaXZhdGUgX3BheWxvYWQ6IFQ7XG5cdHByaXZhdGUgX2ludmFsaWRhdG9yOiB1bmRlZmluZWQgfCAoKCkgPT4gdm9pZCk7XG5cblx0Y29uc3RydWN0b3IocGF5bG9hZDogVCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5fcGF5bG9hZCA9IHBheWxvYWQ7XG5cdH1cblxuXHRwdWJsaWMgc2V0SW52YWxpZGF0b3IoaW52YWxpZGF0b3I6ICgpID0+IHZvaWQpIHtcblx0XHR0aGlzLl9pbnZhbGlkYXRvciA9IGludmFsaWRhdG9yO1xuXHR9XG5cblx0cHVibGljIGdldCgpOiBUIHtcblx0XHRyZXR1cm4gdGhpcy5fcGF5bG9hZDtcblx0fVxuXG5cdHB1YmxpYyBzZXQocGF5bG9hZDogVCk6IHZvaWQge1xuXHRcdHRoaXMuX3BheWxvYWQgPSBwYXlsb2FkO1xuXHRcdGlmICh0aGlzLl9pbnZhbGlkYXRvcikge1xuXHRcdFx0dGhpcy5faW52YWxpZGF0b3IoKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW5qZWN0b3I7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gSW5qZWN0b3IudHMiLCJpbXBvcnQgeyBFdmVudGVkLCBFdmVudE9iamVjdCB9IGZyb20gJy4uL2NvcmUvRXZlbnRlZCc7XG5pbXBvcnQgTWFwIGZyb20gJy4uL3NoaW0vTWFwJztcbmltcG9ydCB7IE5vZGVIYW5kbGVySW50ZXJmYWNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBFbnVtIHRvIGlkZW50aWZ5IHRoZSB0eXBlIG9mIGV2ZW50LlxuICogTGlzdGVuaW5nIHRvICdQcm9qZWN0b3InIHdpbGwgbm90aWZ5IHdoZW4gcHJvamVjdG9yIGlzIGNyZWF0ZWQgb3IgdXBkYXRlZFxuICogTGlzdGVuaW5nIHRvICdXaWRnZXQnIHdpbGwgbm90aWZ5IHdoZW4gd2lkZ2V0IHJvb3QgaXMgY3JlYXRlZCBvciB1cGRhdGVkXG4gKi9cbmV4cG9ydCBlbnVtIE5vZGVFdmVudFR5cGUge1xuXHRQcm9qZWN0b3IgPSAnUHJvamVjdG9yJyxcblx0V2lkZ2V0ID0gJ1dpZGdldCdcbn1cblxuZXhwb3J0IHR5cGUgTm9kZUhhbmRsZXJFdmVudE1hcCA9IHtcblx0UHJvamVjdG9yOiBFdmVudE9iamVjdDxOb2RlRXZlbnRUeXBlLlByb2plY3Rvcj47XG5cdFdpZGdldDogRXZlbnRPYmplY3Q8Tm9kZUV2ZW50VHlwZS5XaWRnZXQ+O1xufTtcblxuZXhwb3J0IGNsYXNzIE5vZGVIYW5kbGVyIGV4dGVuZHMgRXZlbnRlZDxOb2RlSGFuZGxlckV2ZW50TWFwPiBpbXBsZW1lbnRzIE5vZGVIYW5kbGVySW50ZXJmYWNlIHtcblx0cHJpdmF0ZSBfbm9kZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBFbGVtZW50PigpO1xuXG5cdHB1YmxpYyBnZXQoa2V5OiBzdHJpbmcpOiBFbGVtZW50IHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fbm9kZU1hcC5nZXQoa2V5KTtcblx0fVxuXG5cdHB1YmxpYyBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fbm9kZU1hcC5oYXMoa2V5KTtcblx0fVxuXG5cdHB1YmxpYyBhZGQoZWxlbWVudDogRWxlbWVudCwga2V5OiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLl9ub2RlTWFwLnNldChrZXksIGVsZW1lbnQpO1xuXHRcdHRoaXMuZW1pdCh7IHR5cGU6IGtleSB9KTtcblx0fVxuXG5cdHB1YmxpYyBhZGRSb290KCk6IHZvaWQge1xuXHRcdHRoaXMuZW1pdCh7IHR5cGU6IE5vZGVFdmVudFR5cGUuV2lkZ2V0IH0pO1xuXHR9XG5cblx0cHVibGljIGFkZFByb2plY3RvcigpOiB2b2lkIHtcblx0XHR0aGlzLmVtaXQoeyB0eXBlOiBOb2RlRXZlbnRUeXBlLlByb2plY3RvciB9KTtcblx0fVxuXG5cdHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcblx0XHR0aGlzLl9ub2RlTWFwLmNsZWFyKCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTm9kZUhhbmRsZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gTm9kZUhhbmRsZXIudHMiLCJpbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9zaGltL1Byb21pc2UnO1xuaW1wb3J0IE1hcCBmcm9tICcuLi9zaGltL01hcCc7XG5pbXBvcnQgeyBFdmVudGVkLCBFdmVudE9iamVjdCB9IGZyb20gJy4uL2NvcmUvRXZlbnRlZCc7XG5pbXBvcnQge1xuXHRDb25zdHJ1Y3Rvcixcblx0SW5qZWN0b3JGYWN0b3J5LFxuXHRJbmplY3Rvckl0ZW0sXG5cdFJlZ2lzdHJ5TGFiZWwsXG5cdFdpZGdldEJhc2VDb25zdHJ1Y3Rvcixcblx0V2lkZ2V0QmFzZUludGVyZmFjZSxcblx0RVNNRGVmYXVsdFdpZGdldEJhc2UsXG5cdFdpZGdldEJhc2VDb25zdHJ1Y3RvckZ1bmN0aW9uLFxuXHRFU01EZWZhdWx0V2lkZ2V0QmFzZUZ1bmN0aW9uXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCB0eXBlIFJlZ2lzdHJ5SXRlbSA9XG5cdHwgV2lkZ2V0QmFzZUNvbnN0cnVjdG9yXG5cdHwgUHJvbWlzZTxXaWRnZXRCYXNlQ29uc3RydWN0b3I+XG5cdHwgV2lkZ2V0QmFzZUNvbnN0cnVjdG9yRnVuY3Rpb25cblx0fCBFU01EZWZhdWx0V2lkZ2V0QmFzZUZ1bmN0aW9uO1xuXG4vKipcbiAqIFdpZGdldCBiYXNlIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IFdJREdFVF9CQVNFX1RZUEUgPSAnX193aWRnZXRfYmFzZV90eXBlJztcblxuZXhwb3J0IGludGVyZmFjZSBSZWdpc3RyeUV2ZW50T2JqZWN0IGV4dGVuZHMgRXZlbnRPYmplY3Q8UmVnaXN0cnlMYWJlbD4ge1xuXHRhY3Rpb246IHN0cmluZztcblx0aXRlbTogV2lkZ2V0QmFzZUNvbnN0cnVjdG9yIHwgSW5qZWN0b3JJdGVtO1xufVxuLyoqXG4gKiBXaWRnZXQgUmVnaXN0cnkgSW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVnaXN0cnlJbnRlcmZhY2Uge1xuXHQvKipcblx0ICogRGVmaW5lIGEgV2lkZ2V0UmVnaXN0cnlJdGVtIGFnYWluc3QgYSBsYWJlbFxuXHQgKlxuXHQgKiBAcGFyYW0gbGFiZWwgVGhlIGxhYmVsIG9mIHRoZSB3aWRnZXQgdG8gcmVnaXN0ZXJcblx0ICogQHBhcmFtIHJlZ2lzdHJ5SXRlbSBUaGUgcmVnaXN0cnkgaXRlbSB0byBkZWZpbmVcblx0ICovXG5cdGRlZmluZShsYWJlbDogUmVnaXN0cnlMYWJlbCwgcmVnaXN0cnlJdGVtOiBSZWdpc3RyeUl0ZW0pOiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYSBSZWdpc3RyeUl0ZW0gZm9yIHRoZSBnaXZlbiBsYWJlbCwgbnVsbCBpZiBhbiBlbnRyeSBkb2Vzbid0IGV4aXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB3aWRnZXRMYWJlbCBUaGUgbGFiZWwgb2YgdGhlIHdpZGdldCB0byByZXR1cm5cblx0ICogQHJldHVybnMgVGhlIFJlZ2lzdHJ5SXRlbSBmb3IgdGhlIHdpZGdldExhYmVsLCBgbnVsbGAgaWYgbm8gZW50cnkgZXhpc3RzXG5cdCAqL1xuXHRnZXQ8VCBleHRlbmRzIFdpZGdldEJhc2VJbnRlcmZhY2UgPSBXaWRnZXRCYXNlSW50ZXJmYWNlPihsYWJlbDogUmVnaXN0cnlMYWJlbCk6IENvbnN0cnVjdG9yPFQ+IHwgbnVsbDtcblxuXHQvKipcblx0ICogUmV0dXJucyBhIGJvb2xlYW4gaWYgYW4gZW50cnkgZm9yIHRoZSBsYWJlbCBleGlzdHNcblx0ICpcblx0ICogQHBhcmFtIHdpZGdldExhYmVsIFRoZSBsYWJlbCB0byBzZWFyY2ggZm9yXG5cdCAqIEByZXR1cm5zIGJvb2xlYW4gaW5kaWNhdGluZyBpZiBhIHdpZGdldCByZWdpc3RyeSBpdGVtIGV4aXN0c1xuXHQgKi9cblx0aGFzKGxhYmVsOiBSZWdpc3RyeUxhYmVsKTogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRGVmaW5lIGFuIEluamVjdG9yIGFnYWluc3QgYSBsYWJlbFxuXHQgKlxuXHQgKiBAcGFyYW0gbGFiZWwgVGhlIGxhYmVsIG9mIHRoZSBpbmplY3RvciB0byByZWdpc3RlclxuXHQgKiBAcGFyYW0gcmVnaXN0cnlJdGVtIFRoZSBpbmplY3RvciBmYWN0b3J5XG5cdCAqL1xuXHRkZWZpbmVJbmplY3RvcihsYWJlbDogUmVnaXN0cnlMYWJlbCwgaW5qZWN0b3JGYWN0b3J5OiBJbmplY3RvckZhY3RvcnkpOiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYW4gSW5qZWN0b3IgcmVnaXN0cnkgaXRlbSBmb3IgdGhlIGdpdmVuIGxhYmVsLCBudWxsIGlmIGFuIGVudHJ5IGRvZXNuJ3QgZXhpc3Rcblx0ICpcblx0ICogQHBhcmFtIGxhYmVsIFRoZSBsYWJlbCBvZiB0aGUgaW5qZWN0b3IgdG8gcmV0dXJuXG5cdCAqIEByZXR1cm5zIFRoZSBSZWdpc3RyeUl0ZW0gZm9yIHRoZSB3aWRnZXRMYWJlbCwgYG51bGxgIGlmIG5vIGVudHJ5IGV4aXN0c1xuXHQgKi9cblx0Z2V0SW5qZWN0b3I8VD4obGFiZWw6IFJlZ2lzdHJ5TGFiZWwpOiBJbmplY3Rvckl0ZW08VD4gfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgYm9vbGVhbiBpZiBhbiBpbmplY3RvciBmb3IgdGhlIGxhYmVsIGV4aXN0c1xuXHQgKlxuXHQgKiBAcGFyYW0gd2lkZ2V0TGFiZWwgVGhlIGxhYmVsIHRvIHNlYXJjaCBmb3Jcblx0ICogQHJldHVybnMgYm9vbGVhbiBpbmRpY2F0aW5nIGlmIGEgaW5qZWN0b3IgcmVnaXN0cnkgaXRlbSBleGlzdHNcblx0ICovXG5cdGhhc0luamVjdG9yKGxhYmVsOiBSZWdpc3RyeUxhYmVsKTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaXMgdGhlIGl0ZW0gaXMgYSBzdWJjbGFzcyBvZiBXaWRnZXRCYXNlIChvciBhIFdpZGdldEJhc2UpXG4gKlxuICogQHBhcmFtIGl0ZW0gdGhlIGl0ZW0gdG8gY2hlY2tcbiAqIEByZXR1cm5zIHRydWUvZmFsc2UgaW5kaWNhdGluZyBpZiB0aGUgaXRlbSBpcyBhIFdpZGdldEJhc2VDb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNXaWRnZXRCYXNlQ29uc3RydWN0b3I8VCBleHRlbmRzIFdpZGdldEJhc2VJbnRlcmZhY2U+KGl0ZW06IGFueSk6IGl0ZW0gaXMgQ29uc3RydWN0b3I8VD4ge1xuXHRyZXR1cm4gQm9vbGVhbihpdGVtICYmIGl0ZW0uX3R5cGUgPT09IFdJREdFVF9CQVNFX1RZUEUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNXaWRnZXRDb25zdHJ1Y3RvckRlZmF1bHRFeHBvcnQ8VD4oaXRlbTogYW55KTogaXRlbSBpcyBFU01EZWZhdWx0V2lkZ2V0QmFzZTxUPiB7XG5cdHJldHVybiBCb29sZWFuKFxuXHRcdGl0ZW0gJiZcblx0XHRcdGl0ZW0uaGFzT3duUHJvcGVydHkoJ19fZXNNb2R1bGUnKSAmJlxuXHRcdFx0aXRlbS5oYXNPd25Qcm9wZXJ0eSgnZGVmYXVsdCcpICYmXG5cdFx0XHRpc1dpZGdldEJhc2VDb25zdHJ1Y3RvcihpdGVtLmRlZmF1bHQpXG5cdCk7XG59XG5cbi8qKlxuICogVGhlIFJlZ2lzdHJ5IGltcGxlbWVudGF0aW9uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWdpc3RyeSBleHRlbmRzIEV2ZW50ZWQ8e30sIFJlZ2lzdHJ5TGFiZWwsIFJlZ2lzdHJ5RXZlbnRPYmplY3Q+IGltcGxlbWVudHMgUmVnaXN0cnlJbnRlcmZhY2Uge1xuXHQvKipcblx0ICogaW50ZXJuYWwgbWFwIG9mIGxhYmVscyBhbmQgUmVnaXN0cnlJdGVtXG5cdCAqL1xuXHRwcml2YXRlIF93aWRnZXRSZWdpc3RyeTogTWFwPFJlZ2lzdHJ5TGFiZWwsIFJlZ2lzdHJ5SXRlbT4gfCB1bmRlZmluZWQ7XG5cblx0cHJpdmF0ZSBfaW5qZWN0b3JSZWdpc3RyeTogTWFwPFJlZ2lzdHJ5TGFiZWwsIEluamVjdG9ySXRlbT4gfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIEVtaXQgbG9hZGVkIGV2ZW50IGZvciByZWdpc3RyeSBsYWJlbFxuXHQgKi9cblx0cHJpdmF0ZSBlbWl0TG9hZGVkRXZlbnQod2lkZ2V0TGFiZWw6IFJlZ2lzdHJ5TGFiZWwsIGl0ZW06IFdpZGdldEJhc2VDb25zdHJ1Y3RvciB8IEluamVjdG9ySXRlbSk6IHZvaWQge1xuXHRcdHRoaXMuZW1pdCh7XG5cdFx0XHR0eXBlOiB3aWRnZXRMYWJlbCxcblx0XHRcdGFjdGlvbjogJ2xvYWRlZCcsXG5cdFx0XHRpdGVtXG5cdFx0fSk7XG5cdH1cblxuXHRwdWJsaWMgZGVmaW5lKGxhYmVsOiBSZWdpc3RyeUxhYmVsLCBpdGVtOiBSZWdpc3RyeUl0ZW0pOiB2b2lkIHtcblx0XHRpZiAodGhpcy5fd2lkZ2V0UmVnaXN0cnkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fd2lkZ2V0UmVnaXN0cnkgPSBuZXcgTWFwKCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX3dpZGdldFJlZ2lzdHJ5LmhhcyhsYWJlbCkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgd2lkZ2V0IGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCBmb3IgJyR7bGFiZWwudG9TdHJpbmcoKX0nYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fd2lkZ2V0UmVnaXN0cnkuc2V0KGxhYmVsLCBpdGVtKTtcblxuXHRcdGlmIChpdGVtIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuXHRcdFx0aXRlbS50aGVuKFxuXHRcdFx0XHQod2lkZ2V0Q3RvcikgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX3dpZGdldFJlZ2lzdHJ5IS5zZXQobGFiZWwsIHdpZGdldEN0b3IpO1xuXHRcdFx0XHRcdHRoaXMuZW1pdExvYWRlZEV2ZW50KGxhYmVsLCB3aWRnZXRDdG9yKTtcblx0XHRcdFx0XHRyZXR1cm4gd2lkZ2V0Q3Rvcjtcblx0XHRcdFx0fSxcblx0XHRcdFx0KGVycm9yKSA9PiB7XG5cdFx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChpc1dpZGdldEJhc2VDb25zdHJ1Y3RvcihpdGVtKSkge1xuXHRcdFx0dGhpcy5lbWl0TG9hZGVkRXZlbnQobGFiZWwsIGl0ZW0pO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBkZWZpbmVJbmplY3RvcihsYWJlbDogUmVnaXN0cnlMYWJlbCwgaW5qZWN0b3JGYWN0b3J5OiBJbmplY3RvckZhY3RvcnkpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5faW5qZWN0b3JSZWdpc3RyeSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl9pbmplY3RvclJlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9pbmplY3RvclJlZ2lzdHJ5LmhhcyhsYWJlbCkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgaW5qZWN0b3IgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkIGZvciAnJHtsYWJlbC50b1N0cmluZygpfSdgKTtcblx0XHR9XG5cblx0XHRjb25zdCBpbnZhbGlkYXRvciA9IG5ldyBFdmVudGVkKCk7XG5cblx0XHRjb25zdCBpbmplY3Rvckl0ZW06IEluamVjdG9ySXRlbSA9IHtcblx0XHRcdGluamVjdG9yOiBpbmplY3RvckZhY3RvcnkoKCkgPT4gaW52YWxpZGF0b3IuZW1pdCh7IHR5cGU6ICdpbnZhbGlkYXRlJyB9KSksXG5cdFx0XHRpbnZhbGlkYXRvclxuXHRcdH07XG5cblx0XHR0aGlzLl9pbmplY3RvclJlZ2lzdHJ5LnNldChsYWJlbCwgaW5qZWN0b3JJdGVtKTtcblx0XHR0aGlzLmVtaXRMb2FkZWRFdmVudChsYWJlbCwgaW5qZWN0b3JJdGVtKTtcblx0fVxuXG5cdHB1YmxpYyBnZXQ8VCBleHRlbmRzIFdpZGdldEJhc2VJbnRlcmZhY2UgPSBXaWRnZXRCYXNlSW50ZXJmYWNlPihsYWJlbDogUmVnaXN0cnlMYWJlbCk6IENvbnN0cnVjdG9yPFQ+IHwgbnVsbCB7XG5cdFx0aWYgKCF0aGlzLl93aWRnZXRSZWdpc3RyeSB8fCAhdGhpcy5oYXMobGFiZWwpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRjb25zdCBpdGVtID0gdGhpcy5fd2lkZ2V0UmVnaXN0cnkuZ2V0KGxhYmVsKTtcblxuXHRcdGlmIChpc1dpZGdldEJhc2VDb25zdHJ1Y3RvcjxUPihpdGVtKSkge1xuXHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0fVxuXG5cdFx0aWYgKGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlID0gKDxXaWRnZXRCYXNlQ29uc3RydWN0b3JGdW5jdGlvbj5pdGVtKSgpO1xuXHRcdHRoaXMuX3dpZGdldFJlZ2lzdHJ5LnNldChsYWJlbCwgcHJvbWlzZSk7XG5cblx0XHRwcm9taXNlLnRoZW4oXG5cdFx0XHQod2lkZ2V0Q3RvcikgPT4ge1xuXHRcdFx0XHRpZiAoaXNXaWRnZXRDb25zdHJ1Y3RvckRlZmF1bHRFeHBvcnQ8VD4od2lkZ2V0Q3RvcikpIHtcblx0XHRcdFx0XHR3aWRnZXRDdG9yID0gd2lkZ2V0Q3Rvci5kZWZhdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5fd2lkZ2V0UmVnaXN0cnkhLnNldChsYWJlbCwgd2lkZ2V0Q3Rvcik7XG5cdFx0XHRcdHRoaXMuZW1pdExvYWRlZEV2ZW50KGxhYmVsLCB3aWRnZXRDdG9yKTtcblx0XHRcdFx0cmV0dXJuIHdpZGdldEN0b3I7XG5cdFx0XHR9LFxuXHRcdFx0KGVycm9yKSA9PiB7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHB1YmxpYyBnZXRJbmplY3RvcjxUPihsYWJlbDogUmVnaXN0cnlMYWJlbCk6IEluamVjdG9ySXRlbTxUPiB8IG51bGwge1xuXHRcdGlmICghdGhpcy5faW5qZWN0b3JSZWdpc3RyeSB8fCAhdGhpcy5oYXNJbmplY3RvcihsYWJlbCkpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9pbmplY3RvclJlZ2lzdHJ5LmdldChsYWJlbCkhO1xuXHR9XG5cblx0cHVibGljIGhhcyhsYWJlbDogUmVnaXN0cnlMYWJlbCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBCb29sZWFuKHRoaXMuX3dpZGdldFJlZ2lzdHJ5ICYmIHRoaXMuX3dpZGdldFJlZ2lzdHJ5LmhhcyhsYWJlbCkpO1xuXHR9XG5cblx0cHVibGljIGhhc0luamVjdG9yKGxhYmVsOiBSZWdpc3RyeUxhYmVsKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIEJvb2xlYW4odGhpcy5faW5qZWN0b3JSZWdpc3RyeSAmJiB0aGlzLl9pbmplY3RvclJlZ2lzdHJ5LmhhcyhsYWJlbCkpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlZ2lzdHJ5O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIFJlZ2lzdHJ5LnRzIiwiaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi4vc2hpbS9NYXAnO1xuaW1wb3J0IHsgRXZlbnRlZCwgRXZlbnRPYmplY3QgfSBmcm9tICcuLi9jb3JlL0V2ZW50ZWQnO1xuaW1wb3J0IHsgQ29uc3RydWN0b3IsIEluamVjdG9yRmFjdG9yeSwgSW5qZWN0b3JJdGVtLCBSZWdpc3RyeUxhYmVsLCBXaWRnZXRCYXNlSW50ZXJmYWNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFJlZ2lzdHJ5LCBSZWdpc3RyeUV2ZW50T2JqZWN0LCBSZWdpc3RyeUl0ZW0gfSBmcm9tICcuL1JlZ2lzdHJ5JztcblxuZXhwb3J0IHR5cGUgUmVnaXN0cnlIYW5kbGVyRXZlbnRNYXAgPSB7XG5cdGludmFsaWRhdGU6IEV2ZW50T2JqZWN0PCdpbnZhbGlkYXRlJz47XG59O1xuXG5leHBvcnQgY2xhc3MgUmVnaXN0cnlIYW5kbGVyIGV4dGVuZHMgRXZlbnRlZDxSZWdpc3RyeUhhbmRsZXJFdmVudE1hcD4ge1xuXHRwcml2YXRlIF9yZWdpc3RyeSA9IG5ldyBSZWdpc3RyeSgpO1xuXHRwcml2YXRlIF9yZWdpc3RyeVdpZGdldExhYmVsTWFwOiBNYXA8UmVnaXN0cnksIFJlZ2lzdHJ5TGFiZWxbXT4gPSBuZXcgTWFwKCk7XG5cdHByaXZhdGUgX3JlZ2lzdHJ5SW5qZWN0b3JMYWJlbE1hcDogTWFwPFJlZ2lzdHJ5LCBSZWdpc3RyeUxhYmVsW10+ID0gbmV3IE1hcCgpO1xuXHRwcm90ZWN0ZWQgYmFzZVJlZ2lzdHJ5PzogUmVnaXN0cnk7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLm93bih0aGlzLl9yZWdpc3RyeSk7XG5cdFx0Y29uc3QgZGVzdHJveSA9ICgpID0+IHtcblx0XHRcdGlmICh0aGlzLmJhc2VSZWdpc3RyeSkge1xuXHRcdFx0XHR0aGlzLl9yZWdpc3RyeVdpZGdldExhYmVsTWFwLmRlbGV0ZSh0aGlzLmJhc2VSZWdpc3RyeSk7XG5cdFx0XHRcdHRoaXMuX3JlZ2lzdHJ5SW5qZWN0b3JMYWJlbE1hcC5kZWxldGUodGhpcy5iYXNlUmVnaXN0cnkpO1xuXHRcdFx0XHR0aGlzLmJhc2VSZWdpc3RyeSA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMub3duKHsgZGVzdHJveSB9KTtcblx0fVxuXG5cdHB1YmxpYyBzZXQgYmFzZShiYXNlUmVnaXN0cnk6IFJlZ2lzdHJ5KSB7XG5cdFx0aWYgKHRoaXMuYmFzZVJlZ2lzdHJ5KSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RyeVdpZGdldExhYmVsTWFwLmRlbGV0ZSh0aGlzLmJhc2VSZWdpc3RyeSk7XG5cdFx0XHR0aGlzLl9yZWdpc3RyeUluamVjdG9yTGFiZWxNYXAuZGVsZXRlKHRoaXMuYmFzZVJlZ2lzdHJ5KTtcblx0XHR9XG5cdFx0dGhpcy5iYXNlUmVnaXN0cnkgPSBiYXNlUmVnaXN0cnk7XG5cdH1cblxuXHRwdWJsaWMgZGVmaW5lKGxhYmVsOiBSZWdpc3RyeUxhYmVsLCB3aWRnZXQ6IFJlZ2lzdHJ5SXRlbSk6IHZvaWQge1xuXHRcdHRoaXMuX3JlZ2lzdHJ5LmRlZmluZShsYWJlbCwgd2lkZ2V0KTtcblx0fVxuXG5cdHB1YmxpYyBkZWZpbmVJbmplY3RvcihsYWJlbDogUmVnaXN0cnlMYWJlbCwgaW5qZWN0b3I6IEluamVjdG9yRmFjdG9yeSk6IHZvaWQge1xuXHRcdHRoaXMuX3JlZ2lzdHJ5LmRlZmluZUluamVjdG9yKGxhYmVsLCBpbmplY3Rvcik7XG5cdH1cblxuXHRwdWJsaWMgaGFzKGxhYmVsOiBSZWdpc3RyeUxhYmVsKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3JlZ2lzdHJ5LmhhcyhsYWJlbCkgfHwgQm9vbGVhbih0aGlzLmJhc2VSZWdpc3RyeSAmJiB0aGlzLmJhc2VSZWdpc3RyeS5oYXMobGFiZWwpKTtcblx0fVxuXG5cdHB1YmxpYyBoYXNJbmplY3RvcihsYWJlbDogUmVnaXN0cnlMYWJlbCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RyeS5oYXNJbmplY3RvcihsYWJlbCkgfHwgQm9vbGVhbih0aGlzLmJhc2VSZWdpc3RyeSAmJiB0aGlzLmJhc2VSZWdpc3RyeS5oYXNJbmplY3RvcihsYWJlbCkpO1xuXHR9XG5cblx0cHVibGljIGdldDxUIGV4dGVuZHMgV2lkZ2V0QmFzZUludGVyZmFjZSA9IFdpZGdldEJhc2VJbnRlcmZhY2U+KFxuXHRcdGxhYmVsOiBSZWdpc3RyeUxhYmVsLFxuXHRcdGdsb2JhbFByZWNlZGVuY2U6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBDb25zdHJ1Y3RvcjxUPiB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLl9nZXQobGFiZWwsIGdsb2JhbFByZWNlZGVuY2UsICdnZXQnLCB0aGlzLl9yZWdpc3RyeVdpZGdldExhYmVsTWFwKTtcblx0fVxuXG5cdHB1YmxpYyBnZXRJbmplY3RvcjxUPihsYWJlbDogUmVnaXN0cnlMYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZTogYm9vbGVhbiA9IGZhbHNlKTogSW5qZWN0b3JJdGVtPFQ+IHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldChsYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZSwgJ2dldEluamVjdG9yJywgdGhpcy5fcmVnaXN0cnlJbmplY3RvckxhYmVsTWFwKTtcblx0fVxuXG5cdHByaXZhdGUgX2dldChcblx0XHRsYWJlbDogUmVnaXN0cnlMYWJlbCxcblx0XHRnbG9iYWxQcmVjZWRlbmNlOiBib29sZWFuLFxuXHRcdGdldEZ1bmN0aW9uTmFtZTogJ2dldEluamVjdG9yJyB8ICdnZXQnLFxuXHRcdGxhYmVsTWFwOiBNYXA8UmVnaXN0cnksIFJlZ2lzdHJ5TGFiZWxbXT5cblx0KTogYW55IHtcblx0XHRjb25zdCByZWdpc3RyaWVzID0gZ2xvYmFsUHJlY2VkZW5jZSA/IFt0aGlzLmJhc2VSZWdpc3RyeSwgdGhpcy5fcmVnaXN0cnldIDogW3RoaXMuX3JlZ2lzdHJ5LCB0aGlzLmJhc2VSZWdpc3RyeV07XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCByZWdpc3RyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCByZWdpc3RyeTogYW55ID0gcmVnaXN0cmllc1tpXTtcblx0XHRcdGlmICghcmVnaXN0cnkpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBpdGVtID0gcmVnaXN0cnlbZ2V0RnVuY3Rpb25OYW1lXShsYWJlbCk7XG5cdFx0XHRjb25zdCByZWdpc3RlcmVkTGFiZWxzID0gbGFiZWxNYXAuZ2V0KHJlZ2lzdHJ5KSB8fCBbXTtcblx0XHRcdGlmIChpdGVtKSB7XG5cdFx0XHRcdHJldHVybiBpdGVtO1xuXHRcdFx0fSBlbHNlIGlmIChyZWdpc3RlcmVkTGFiZWxzLmluZGV4T2YobGFiZWwpID09PSAtMSkge1xuXHRcdFx0XHRjb25zdCBoYW5kbGUgPSByZWdpc3RyeS5vbihsYWJlbCwgKGV2ZW50OiBSZWdpc3RyeUV2ZW50T2JqZWN0KSA9PiB7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0ZXZlbnQuYWN0aW9uID09PSAnbG9hZGVkJyAmJlxuXHRcdFx0XHRcdFx0KHRoaXMgYXMgYW55KVtnZXRGdW5jdGlvbk5hbWVdKGxhYmVsLCBnbG9iYWxQcmVjZWRlbmNlKSA9PT0gZXZlbnQuaXRlbVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KHsgdHlwZTogJ2ludmFsaWRhdGUnIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRoaXMub3duKGhhbmRsZSk7XG5cdFx0XHRcdGxhYmVsTWFwLnNldChyZWdpc3RyeSwgWy4uLnJlZ2lzdGVyZWRMYWJlbHMsIGxhYmVsXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlZ2lzdHJ5SGFuZGxlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBSZWdpc3RyeUhhbmRsZXIudHMiLCJpbXBvcnQgTWFwIGZyb20gJy4uL3NoaW0vTWFwJztcbmltcG9ydCBXZWFrTWFwIGZyb20gJy4uL3NoaW0vV2Vha01hcCc7XG5pbXBvcnQgeyB2LCBWTk9ERSwgaXNWTm9kZSwgaXNXTm9kZSB9IGZyb20gJy4vZCc7XG5pbXBvcnQgeyBhdXRvIH0gZnJvbSAnLi9kaWZmJztcbmltcG9ydCB7XG5cdEFmdGVyUmVuZGVyLFxuXHRCZWZvcmVQcm9wZXJ0aWVzLFxuXHRCZWZvcmVSZW5kZXIsXG5cdERpZmZQcm9wZXJ0eVJlYWN0aW9uLFxuXHRETm9kZSxcblx0RGVmYXVsdFdpZGdldEJhc2VJbnRlcmZhY2UsXG5cdExhenlXaWRnZXQsXG5cdFJlbmRlcixcblx0V2lkZ2V0TWV0YUJhc2UsXG5cdFdpZGdldE1ldGFDb25zdHJ1Y3Rvcixcblx0V2lkZ2V0QmFzZUludGVyZmFjZSxcblx0V2lkZ2V0UHJvcGVydGllcyxcblx0V05vZGUsXG5cdFZOb2RlLFxuXHRMYXp5RGVmaW5lXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgUmVnaXN0cnlIYW5kbGVyIGZyb20gJy4vUmVnaXN0cnlIYW5kbGVyJztcbmltcG9ydCBOb2RlSGFuZGxlciBmcm9tICcuL05vZGVIYW5kbGVyJztcbmltcG9ydCB7IGlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yLCBXSURHRVRfQkFTRV9UWVBFIH0gZnJvbSAnLi9SZWdpc3RyeSc7XG5pbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuLi9jb3JlL0Rlc3Ryb3lhYmxlJztcblxuaW50ZXJmYWNlIFJlYWN0aW9uRnVuY3Rpb25Db25maWcge1xuXHRwcm9wZXJ0eU5hbWU6IHN0cmluZztcblx0cmVhY3Rpb246IERpZmZQcm9wZXJ0eVJlYWN0aW9uO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdpZGdldERhdGEge1xuXHRvbkRldGFjaDogKCkgPT4gdm9pZDtcblx0b25BdHRhY2g6ICgpID0+IHZvaWQ7XG5cdGRpcnR5OiBib29sZWFuO1xuXHRub2RlSGFuZGxlcjogTm9kZUhhbmRsZXI7XG5cdGludmFsaWRhdGU/OiBGdW5jdGlvbjtcblx0cmVuZGVyaW5nOiBib29sZWFuO1xuXHRpbnB1dFByb3BlcnRpZXM6IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgQm91bmRGdW5jdGlvbkRhdGEgPSB7IGJvdW5kRnVuYzogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7IHNjb3BlOiBhbnkgfTtcblxubGV0IGxhenlXaWRnZXRJZCA9IDA7XG5jb25zdCBsYXp5V2lkZ2V0SWRNYXAgPSBuZXcgV2Vha01hcDxMYXp5V2lkZ2V0LCBzdHJpbmc+KCk7XG5jb25zdCBkZWNvcmF0b3JNYXAgPSBuZXcgTWFwPEZ1bmN0aW9uLCBNYXA8c3RyaW5nLCBhbnlbXT4+KCk7XG5leHBvcnQgY29uc3Qgd2lkZ2V0SW5zdGFuY2VNYXAgPSBuZXcgV2Vha01hcDxcblx0V2lkZ2V0QmFzZTxXaWRnZXRQcm9wZXJ0aWVzLCBETm9kZTxEZWZhdWx0V2lkZ2V0QmFzZUludGVyZmFjZT4+LFxuXHRXaWRnZXREYXRhXG4+KCk7XG5jb25zdCBib3VuZEF1dG8gPSBhdXRvLmJpbmQobnVsbCk7XG5cbmV4cG9ydCBjb25zdCBub0JpbmQgPSAnX19kb2pvX25vX2JpbmQnO1xuXG5mdW5jdGlvbiB0b1RleHRWTm9kZShkYXRhOiBhbnkpOiBWTm9kZSB7XG5cdHJldHVybiB7XG5cdFx0dGFnOiAnJyxcblx0XHRwcm9wZXJ0aWVzOiB7fSxcblx0XHRjaGlsZHJlbjogdW5kZWZpbmVkLFxuXHRcdHRleHQ6IGAke2RhdGF9YCxcblx0XHR0eXBlOiBWTk9ERVxuXHR9O1xufVxuXG5mdW5jdGlvbiBpc0xhenlEZWZpbmUoaXRlbTogYW55KTogaXRlbSBpcyBMYXp5RGVmaW5lIHtcblx0cmV0dXJuIEJvb2xlYW4oaXRlbSAmJiBpdGVtLmxhYmVsKTtcbn1cblxuLyoqXG4gKiBNYWluIHdpZGdldCBiYXNlIGZvciBhbGwgd2lkZ2V0cyB0byBleHRlbmRcbiAqL1xuZXhwb3J0IGNsYXNzIFdpZGdldEJhc2U8UCA9IFdpZGdldFByb3BlcnRpZXMsIEMgZXh0ZW5kcyBETm9kZSA9IEROb2RlPiBpbXBsZW1lbnRzIFdpZGdldEJhc2VJbnRlcmZhY2U8UCwgQz4ge1xuXHQvKipcblx0ICogc3RhdGljIGlkZW50aWZpZXJcblx0ICovXG5cdHN0YXRpYyBfdHlwZSA9IFdJREdFVF9CQVNFX1RZUEU7XG5cblx0LyoqXG5cdCAqIGNoaWxkcmVuIGFycmF5XG5cdCAqL1xuXHRwcml2YXRlIF9jaGlsZHJlbjogKEMgfCBudWxsKVtdO1xuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgaWYgaXQgaXMgdGhlIGluaXRpYWwgc2V0IHByb3BlcnRpZXMgY3ljbGVcblx0ICovXG5cdHByaXZhdGUgX2luaXRpYWxQcm9wZXJ0aWVzID0gdHJ1ZTtcblxuXHQvKipcblx0ICogaW50ZXJuYWwgd2lkZ2V0IHByb3BlcnRpZXNcblx0ICovXG5cdHByaXZhdGUgX3Byb3BlcnRpZXM6IFAgJiBXaWRnZXRQcm9wZXJ0aWVzICYgeyBbaW5kZXg6IHN0cmluZ106IGFueSB9O1xuXG5cdC8qKlxuXHQgKiBBcnJheSBvZiBwcm9wZXJ0eSBrZXlzIGNvbnNpZGVyZWQgY2hhbmdlZCBmcm9tIHRoZSBwcmV2aW91cyBzZXQgcHJvcGVydGllc1xuXHQgKi9cblx0cHJpdmF0ZSBfY2hhbmdlZFByb3BlcnR5S2V5czogc3RyaW5nW10gPSBbXTtcblxuXHQvKipcblx0ICogbWFwIG9mIGRlY29yYXRvcnMgdGhhdCBhcmUgYXBwbGllZCB0byB0aGlzIHdpZGdldFxuXHQgKi9cblx0cHJpdmF0ZSBfZGVjb3JhdG9yQ2FjaGU6IE1hcDxzdHJpbmcsIGFueVtdPjtcblxuXHRwcml2YXRlIF9yZWdpc3RyeTogUmVnaXN0cnlIYW5kbGVyIHwgdW5kZWZpbmVkO1xuXG5cdC8qKlxuXHQgKiBNYXAgb2YgZnVuY3Rpb25zIHByb3BlcnRpZXMgZm9yIHRoZSBib3VuZCBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBfYmluZEZ1bmN0aW9uUHJvcGVydHlNYXA6IFdlYWtNYXA8KC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIEJvdW5kRnVuY3Rpb25EYXRhPiB8IHVuZGVmaW5lZDtcblxuXHRwcml2YXRlIF9tZXRhTWFwOiBNYXA8V2lkZ2V0TWV0YUNvbnN0cnVjdG9yPGFueT4sIFdpZGdldE1ldGFCYXNlPiB8IHVuZGVmaW5lZDtcblxuXHRwcml2YXRlIF9ib3VuZFJlbmRlckZ1bmM6IFJlbmRlcjtcblxuXHRwcml2YXRlIF9ib3VuZEludmFsaWRhdGU6ICgpID0+IHZvaWQ7XG5cblx0cHJpdmF0ZSBfbm9kZUhhbmRsZXI6IE5vZGVIYW5kbGVyID0gbmV3IE5vZGVIYW5kbGVyKCk7XG5cblx0cHJpdmF0ZSBfaGFuZGxlczogSGFuZGxlW10gPSBbXTtcblxuXHQvKipcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLl9jaGlsZHJlbiA9IFtdO1xuXHRcdHRoaXMuX2RlY29yYXRvckNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIGFueVtdPigpO1xuXHRcdHRoaXMuX3Byb3BlcnRpZXMgPSA8UD57fTtcblx0XHR0aGlzLl9ib3VuZFJlbmRlckZ1bmMgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuX2JvdW5kSW52YWxpZGF0ZSA9IHRoaXMuaW52YWxpZGF0ZS5iaW5kKHRoaXMpO1xuXG5cdFx0d2lkZ2V0SW5zdGFuY2VNYXAuc2V0KHRoaXMsIHtcblx0XHRcdGRpcnR5OiB0cnVlLFxuXHRcdFx0b25BdHRhY2g6ICgpOiB2b2lkID0+IHtcblx0XHRcdFx0dGhpcy5vbkF0dGFjaCgpO1xuXHRcdFx0fSxcblx0XHRcdG9uRGV0YWNoOiAoKTogdm9pZCA9PiB7XG5cdFx0XHRcdHRoaXMub25EZXRhY2goKTtcblx0XHRcdFx0dGhpcy5kZXN0cm95KCk7XG5cdFx0XHR9LFxuXHRcdFx0bm9kZUhhbmRsZXI6IHRoaXMuX25vZGVIYW5kbGVyLFxuXHRcdFx0cmVuZGVyaW5nOiBmYWxzZSxcblx0XHRcdGlucHV0UHJvcGVydGllczoge31cblx0XHR9KTtcblxuXHRcdHRoaXMub3duKHtcblx0XHRcdGRlc3Ryb3k6ICgpID0+IHtcblx0XHRcdFx0d2lkZ2V0SW5zdGFuY2VNYXAuZGVsZXRlKHRoaXMpO1xuXHRcdFx0XHR0aGlzLl9ub2RlSGFuZGxlci5jbGVhcigpO1xuXHRcdFx0XHR0aGlzLl9ub2RlSGFuZGxlci5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLl9ydW5BZnRlckNvbnN0cnVjdG9ycygpO1xuXHR9XG5cblx0cHJvdGVjdGVkIG1ldGE8VCBleHRlbmRzIFdpZGdldE1ldGFCYXNlPihNZXRhVHlwZTogV2lkZ2V0TWV0YUNvbnN0cnVjdG9yPFQ+KTogVCB7XG5cdFx0aWYgKHRoaXMuX21ldGFNYXAgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fbWV0YU1hcCA9IG5ldyBNYXA8V2lkZ2V0TWV0YUNvbnN0cnVjdG9yPGFueT4sIFdpZGdldE1ldGFCYXNlPigpO1xuXHRcdH1cblx0XHRsZXQgY2FjaGVkID0gdGhpcy5fbWV0YU1hcC5nZXQoTWV0YVR5cGUpO1xuXHRcdGlmICghY2FjaGVkKSB7XG5cdFx0XHRjYWNoZWQgPSBuZXcgTWV0YVR5cGUoe1xuXHRcdFx0XHRpbnZhbGlkYXRlOiB0aGlzLl9ib3VuZEludmFsaWRhdGUsXG5cdFx0XHRcdG5vZGVIYW5kbGVyOiB0aGlzLl9ub2RlSGFuZGxlcixcblx0XHRcdFx0YmluZDogdGhpc1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLm93bihjYWNoZWQpO1xuXHRcdFx0dGhpcy5fbWV0YU1hcC5zZXQoTWV0YVR5cGUsIGNhY2hlZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhY2hlZCBhcyBUO1xuXHR9XG5cblx0cHJvdGVjdGVkIG9uQXR0YWNoKCk6IHZvaWQge1xuXHRcdC8vIERvIG5vdGhpbmcgYnkgZGVmYXVsdC5cblx0fVxuXG5cdHByb3RlY3RlZCBvbkRldGFjaCgpOiB2b2lkIHtcblx0XHQvLyBEbyBub3RoaW5nIGJ5IGRlZmF1bHQuXG5cdH1cblxuXHRwdWJsaWMgZ2V0IHByb3BlcnRpZXMoKTogUmVhZG9ubHk8UD4gJiBSZWFkb25seTxXaWRnZXRQcm9wZXJ0aWVzPiB7XG5cdFx0cmV0dXJuIHRoaXMuX3Byb3BlcnRpZXM7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGNoYW5nZWRQcm9wZXJ0eUtleXMoKTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBbLi4udGhpcy5fY2hhbmdlZFByb3BlcnR5S2V5c107XG5cdH1cblxuXHRwdWJsaWMgX19zZXRQcm9wZXJ0aWVzX18ob3JpZ2luYWxQcm9wZXJ0aWVzOiB0aGlzWydwcm9wZXJ0aWVzJ10sIGJpbmQ/OiBXaWRnZXRCYXNlSW50ZXJmYWNlKTogdm9pZCB7XG5cdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHRoaXMpO1xuXHRcdGlmIChpbnN0YW5jZURhdGEpIHtcblx0XHRcdGluc3RhbmNlRGF0YS5pbnB1dFByb3BlcnRpZXMgPSBvcmlnaW5hbFByb3BlcnRpZXM7XG5cdFx0fVxuXHRcdGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9ydW5CZWZvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsUHJvcGVydGllcyk7XG5cdFx0Y29uc3QgcmVnaXN0ZXJlZERpZmZQcm9wZXJ0eU5hbWVzID0gdGhpcy5nZXREZWNvcmF0b3IoJ3JlZ2lzdGVyZWREaWZmUHJvcGVydHknKTtcblx0XHRjb25zdCBjaGFuZ2VkUHJvcGVydHlLZXlzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZXMgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKTtcblxuXHRcdGlmICh0aGlzLl9pbml0aWFsUHJvcGVydGllcyA9PT0gZmFsc2UgfHwgcmVnaXN0ZXJlZERpZmZQcm9wZXJ0eU5hbWVzLmxlbmd0aCAhPT0gMCkge1xuXHRcdFx0Y29uc3QgYWxsUHJvcGVydGllcyA9IFsuLi5wcm9wZXJ0eU5hbWVzLCAuLi5PYmplY3Qua2V5cyh0aGlzLl9wcm9wZXJ0aWVzKV07XG5cdFx0XHRjb25zdCBjaGVja2VkUHJvcGVydGllczogKHN0cmluZyB8IG51bWJlcilbXSA9IFtdO1xuXHRcdFx0Y29uc3QgZGlmZlByb3BlcnR5UmVzdWx0czogYW55ID0ge307XG5cdFx0XHRsZXQgcnVuUmVhY3Rpb25zID0gZmFsc2U7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYWxsUHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBhbGxQcm9wZXJ0aWVzW2ldO1xuXHRcdFx0XHRpZiAoY2hlY2tlZFByb3BlcnRpZXMuaW5kZXhPZihwcm9wZXJ0eU5hbWUpICE9PSAtMSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNoZWNrZWRQcm9wZXJ0aWVzLnB1c2gocHJvcGVydHlOYW1lKTtcblx0XHRcdFx0Y29uc3QgcHJldmlvdXNQcm9wZXJ0eSA9IHRoaXMuX3Byb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0XHRcdFx0Y29uc3QgbmV3UHJvcGVydHkgPSB0aGlzLl9iaW5kRnVuY3Rpb25Qcm9wZXJ0eShwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0sIGJpbmQpO1xuXHRcdFx0XHRpZiAocmVnaXN0ZXJlZERpZmZQcm9wZXJ0eU5hbWVzLmluZGV4T2YocHJvcGVydHlOYW1lKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRydW5SZWFjdGlvbnMgPSB0cnVlO1xuXHRcdFx0XHRcdGNvbnN0IGRpZmZGdW5jdGlvbnMgPSB0aGlzLmdldERlY29yYXRvcihgZGlmZlByb3BlcnR5OiR7cHJvcGVydHlOYW1lfWApO1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZGlmZkZ1bmN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gZGlmZkZ1bmN0aW9uc1tpXShwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0LmNoYW5nZWQgJiYgY2hhbmdlZFByb3BlcnR5S2V5cy5pbmRleE9mKHByb3BlcnR5TmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdGNoYW5nZWRQcm9wZXJ0eUtleXMucHVzaChwcm9wZXJ0eU5hbWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKHByb3BlcnR5TmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRcdGRpZmZQcm9wZXJ0eVJlc3VsdHNbcHJvcGVydHlOYW1lXSA9IHJlc3VsdC52YWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYm91bmRBdXRvKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAocmVzdWx0LmNoYW5nZWQgJiYgY2hhbmdlZFByb3BlcnR5S2V5cy5pbmRleE9mKHByb3BlcnR5TmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRjaGFuZ2VkUHJvcGVydHlLZXlzLnB1c2gocHJvcGVydHlOYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHByb3BlcnR5TmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRkaWZmUHJvcGVydHlSZXN1bHRzW3Byb3BlcnR5TmFtZV0gPSByZXN1bHQudmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChydW5SZWFjdGlvbnMpIHtcblx0XHRcdFx0Y29uc3QgcmVhY3Rpb25GdW5jdGlvbnM6IFJlYWN0aW9uRnVuY3Rpb25Db25maWdbXSA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdkaWZmUmVhY3Rpb24nKTtcblx0XHRcdFx0Y29uc3QgZXhlY3V0ZWRSZWFjdGlvbnM6IEZ1bmN0aW9uW10gPSBbXTtcblx0XHRcdFx0cmVhY3Rpb25GdW5jdGlvbnMuZm9yRWFjaCgoeyByZWFjdGlvbiwgcHJvcGVydHlOYW1lIH0pID0+IHtcblx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eUNoYW5nZWQgPSBjaGFuZ2VkUHJvcGVydHlLZXlzLmluZGV4T2YocHJvcGVydHlOYW1lKSAhPT0gLTE7XG5cdFx0XHRcdFx0Y29uc3QgcmVhY3Rpb25SdW4gPSBleGVjdXRlZFJlYWN0aW9ucy5pbmRleE9mKHJlYWN0aW9uKSAhPT0gLTE7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnR5Q2hhbmdlZCAmJiAhcmVhY3Rpb25SdW4pIHtcblx0XHRcdFx0XHRcdHJlYWN0aW9uLmNhbGwodGhpcywgdGhpcy5fcHJvcGVydGllcywgZGlmZlByb3BlcnR5UmVzdWx0cyk7XG5cdFx0XHRcdFx0XHRleGVjdXRlZFJlYWN0aW9ucy5wdXNoKHJlYWN0aW9uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fcHJvcGVydGllcyA9IGRpZmZQcm9wZXJ0eVJlc3VsdHM7XG5cdFx0XHR0aGlzLl9jaGFuZ2VkUHJvcGVydHlLZXlzID0gY2hhbmdlZFByb3BlcnR5S2V5cztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faW5pdGlhbFByb3BlcnRpZXMgPSBmYWxzZTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydHlOYW1lcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWVzW2ldO1xuXHRcdFx0XHRpZiAodHlwZW9mIHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5KHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSwgYmluZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y2hhbmdlZFByb3BlcnR5S2V5cy5wdXNoKHByb3BlcnR5TmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuX2NoYW5nZWRQcm9wZXJ0eUtleXMgPSBjaGFuZ2VkUHJvcGVydHlLZXlzO1xuXHRcdFx0dGhpcy5fcHJvcGVydGllcyA9IHsgLi4ucHJvcGVydGllcyB9O1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9jaGFuZ2VkUHJvcGVydHlLZXlzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBnZXQgY2hpbGRyZW4oKTogKEMgfCBudWxsKVtdIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hpbGRyZW47XG5cdH1cblxuXHRwdWJsaWMgX19zZXRDaGlsZHJlbl9fKGNoaWxkcmVuOiAoQyB8IG51bGwpW10pOiB2b2lkIHtcblx0XHRpZiAodGhpcy5fY2hpbGRyZW4ubGVuZ3RoID4gMCB8fCBjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLl9jaGlsZHJlbiA9IGNoaWxkcmVuO1xuXHRcdFx0dGhpcy5pbnZhbGlkYXRlKCk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBfZmlsdGVyQW5kQ29udmVydChub2RlczogRE5vZGVbXSk6IChXTm9kZSB8IFZOb2RlKVtdO1xuXHRwcml2YXRlIF9maWx0ZXJBbmRDb252ZXJ0KG5vZGVzOiBETm9kZSk6IFdOb2RlIHwgVk5vZGU7XG5cdHByaXZhdGUgX2ZpbHRlckFuZENvbnZlcnQobm9kZXM6IEROb2RlIHwgRE5vZGVbXSk6IChXTm9kZSB8IFZOb2RlKSB8IChXTm9kZSB8IFZOb2RlKVtdO1xuXHRwcml2YXRlIF9maWx0ZXJBbmRDb252ZXJ0KG5vZGVzOiBETm9kZSB8IEROb2RlW10pOiAoV05vZGUgfCBWTm9kZSkgfCAoV05vZGUgfCBWTm9kZSlbXSB7XG5cdFx0Y29uc3QgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkobm9kZXMpO1xuXHRcdGNvbnN0IGZpbHRlcmVkTm9kZXMgPSBBcnJheS5pc0FycmF5KG5vZGVzKSA/IG5vZGVzIDogW25vZGVzXTtcblx0XHRjb25zdCBjb252ZXJ0ZWROb2RlczogKFdOb2RlIHwgVk5vZGUpW10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlcmVkTm9kZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IG5vZGUgPSBmaWx0ZXJlZE5vZGVzW2ldO1xuXHRcdFx0aWYgKCFub2RlKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBub2RlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRjb252ZXJ0ZWROb2Rlcy5wdXNoKHRvVGV4dFZOb2RlKG5vZGUpKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNWTm9kZShub2RlKSAmJiBub2RlLmRlZmVycmVkUHJvcGVydGllc0NhbGxiYWNrKSB7XG5cdFx0XHRcdGNvbnN0IHByb3BlcnRpZXMgPSBub2RlLmRlZmVycmVkUHJvcGVydGllc0NhbGxiYWNrKGZhbHNlKTtcblx0XHRcdFx0bm9kZS5vcmlnaW5hbFByb3BlcnRpZXMgPSBub2RlLnByb3BlcnRpZXM7XG5cdFx0XHRcdG5vZGUucHJvcGVydGllcyA9IHsgLi4ucHJvcGVydGllcywgLi4ubm9kZS5wcm9wZXJ0aWVzIH07XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNXTm9kZShub2RlKSAmJiAhaXNXaWRnZXRCYXNlQ29uc3RydWN0b3Iobm9kZS53aWRnZXRDb25zdHJ1Y3RvcikpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBub2RlLndpZGdldENvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0bGV0IGlkID0gbGF6eVdpZGdldElkTWFwLmdldChub2RlLndpZGdldENvbnN0cnVjdG9yKTtcblx0XHRcdFx0XHRpZiAoIWlkKSB7XG5cdFx0XHRcdFx0XHRpZCA9IGBfX2xhenlfd2lkZ2V0XyR7bGF6eVdpZGdldElkKyt9YDtcblx0XHRcdFx0XHRcdGxhenlXaWRnZXRJZE1hcC5zZXQobm9kZS53aWRnZXRDb25zdHJ1Y3RvciwgaWQpO1xuXHRcdFx0XHRcdFx0dGhpcy5yZWdpc3RyeS5kZWZpbmUoaWQsIG5vZGUud2lkZ2V0Q29uc3RydWN0b3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRub2RlLndpZGdldENvbnN0cnVjdG9yID0gaWQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNMYXp5RGVmaW5lKG5vZGUud2lkZ2V0Q29uc3RydWN0b3IpKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBsYWJlbCwgcmVnaXN0cnlJdGVtIH0gPSBub2RlLndpZGdldENvbnN0cnVjdG9yO1xuXHRcdFx0XHRcdGlmICghdGhpcy5yZWdpc3RyeS5oYXMobGFiZWwpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlZ2lzdHJ5LmRlZmluZShsYWJlbCwgcmVnaXN0cnlJdGVtKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bm9kZS53aWRnZXRDb25zdHJ1Y3RvciA9IGxhYmVsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bm9kZS53aWRnZXRDb25zdHJ1Y3RvciA9XG5cdFx0XHRcdFx0dGhpcy5yZWdpc3RyeS5nZXQ8V2lkZ2V0QmFzZT4obm9kZS53aWRnZXRDb25zdHJ1Y3RvcikgfHwgbm9kZS53aWRnZXRDb25zdHJ1Y3Rvcjtcblx0XHRcdH1cblx0XHRcdGlmICghbm9kZS5iaW5kKSB7XG5cdFx0XHRcdG5vZGUuYmluZCA9IHRoaXM7XG5cdFx0XHR9XG5cdFx0XHRjb252ZXJ0ZWROb2Rlcy5wdXNoKG5vZGUpO1xuXHRcdFx0aWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdFx0bm9kZS5jaGlsZHJlbiA9IHRoaXMuX2ZpbHRlckFuZENvbnZlcnQobm9kZS5jaGlsZHJlbik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpc0FycmF5ID8gY29udmVydGVkTm9kZXMgOiBjb252ZXJ0ZWROb2Rlc1swXTtcblx0fVxuXG5cdHB1YmxpYyBfX3JlbmRlcl9fKCk6IChXTm9kZSB8IFZOb2RlKSB8IChXTm9kZSB8IFZOb2RlKVtdIHtcblx0XHRjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQodGhpcyk7XG5cdFx0aWYgKGluc3RhbmNlRGF0YSkge1xuXHRcdFx0aW5zdGFuY2VEYXRhLmRpcnR5ID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNvbnN0IHJlbmRlciA9IHRoaXMuX3J1bkJlZm9yZVJlbmRlcnMoKTtcblx0XHRjb25zdCBkTm9kZSA9IHRoaXMuX2ZpbHRlckFuZENvbnZlcnQodGhpcy5fcnVuQWZ0ZXJSZW5kZXJzKHJlbmRlcigpKSk7XG5cdFx0dGhpcy5fbm9kZUhhbmRsZXIuY2xlYXIoKTtcblx0XHRyZXR1cm4gZE5vZGU7XG5cdH1cblxuXHRwdWJsaWMgaW52YWxpZGF0ZSgpOiB2b2lkIHtcblx0XHRjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQodGhpcyk7XG5cdFx0aWYgKGluc3RhbmNlRGF0YSAmJiBpbnN0YW5jZURhdGEuaW52YWxpZGF0ZSkge1xuXHRcdFx0aW5zdGFuY2VEYXRhLmludmFsaWRhdGUoKTtcblx0XHR9XG5cdH1cblxuXHRwcm90ZWN0ZWQgcmVuZGVyKCk6IEROb2RlIHwgRE5vZGVbXSB7XG5cdFx0cmV0dXJuIHYoJ2RpdicsIHt9LCB0aGlzLmNoaWxkcmVuKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBhZGQgZGVjb3JhdG9ycyB0byBXaWRnZXRCYXNlXG5cdCAqXG5cdCAqIEBwYXJhbSBkZWNvcmF0b3JLZXkgVGhlIGtleSBvZiB0aGUgZGVjb3JhdG9yXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGRlY29yYXRvclxuXHQgKi9cblx0cHJvdGVjdGVkIGFkZERlY29yYXRvcihkZWNvcmF0b3JLZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuXHRcdHZhbHVlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV07XG5cdFx0aWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykpIHtcblx0XHRcdGxldCBkZWNvcmF0b3JMaXN0ID0gZGVjb3JhdG9yTWFwLmdldCh0aGlzLmNvbnN0cnVjdG9yKTtcblx0XHRcdGlmICghZGVjb3JhdG9yTGlzdCkge1xuXHRcdFx0XHRkZWNvcmF0b3JMaXN0ID0gbmV3IE1hcDxzdHJpbmcsIGFueVtdPigpO1xuXHRcdFx0XHRkZWNvcmF0b3JNYXAuc2V0KHRoaXMuY29uc3RydWN0b3IsIGRlY29yYXRvckxpc3QpO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgc3BlY2lmaWNEZWNvcmF0b3JMaXN0ID0gZGVjb3JhdG9yTGlzdC5nZXQoZGVjb3JhdG9yS2V5KTtcblx0XHRcdGlmICghc3BlY2lmaWNEZWNvcmF0b3JMaXN0KSB7XG5cdFx0XHRcdHNwZWNpZmljRGVjb3JhdG9yTGlzdCA9IFtdO1xuXHRcdFx0XHRkZWNvcmF0b3JMaXN0LnNldChkZWNvcmF0b3JLZXksIHNwZWNpZmljRGVjb3JhdG9yTGlzdCk7XG5cdFx0XHR9XG5cdFx0XHRzcGVjaWZpY0RlY29yYXRvckxpc3QucHVzaCguLi52YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGRlY29yYXRvcnMgPSB0aGlzLmdldERlY29yYXRvcihkZWNvcmF0b3JLZXkpO1xuXHRcdFx0dGhpcy5fZGVjb3JhdG9yQ2FjaGUuc2V0KGRlY29yYXRvcktleSwgWy4uLmRlY29yYXRvcnMsIC4uLnZhbHVlXSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIGJ1aWxkIHRoZSBsaXN0IG9mIGRlY29yYXRvcnMgZnJvbSB0aGUgZ2xvYmFsIGRlY29yYXRvciBtYXAuXG5cdCAqXG5cdCAqIEBwYXJhbSBkZWNvcmF0b3JLZXkgIFRoZSBrZXkgb2YgdGhlIGRlY29yYXRvclxuXHQgKiBAcmV0dXJuIEFuIGFycmF5IG9mIGRlY29yYXRvciB2YWx1ZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX2J1aWxkRGVjb3JhdG9yTGlzdChkZWNvcmF0b3JLZXk6IHN0cmluZyk6IGFueVtdIHtcblx0XHRjb25zdCBhbGxEZWNvcmF0b3JzID0gW107XG5cblx0XHRsZXQgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuXG5cdFx0d2hpbGUgKGNvbnN0cnVjdG9yKSB7XG5cdFx0XHRjb25zdCBpbnN0YW5jZU1hcCA9IGRlY29yYXRvck1hcC5nZXQoY29uc3RydWN0b3IpO1xuXHRcdFx0aWYgKGluc3RhbmNlTWFwKSB7XG5cdFx0XHRcdGNvbnN0IGRlY29yYXRvcnMgPSBpbnN0YW5jZU1hcC5nZXQoZGVjb3JhdG9yS2V5KTtcblxuXHRcdFx0XHRpZiAoZGVjb3JhdG9ycykge1xuXHRcdFx0XHRcdGFsbERlY29yYXRvcnMudW5zaGlmdCguLi5kZWNvcmF0b3JzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdHJ1Y3RvciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjb25zdHJ1Y3Rvcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFsbERlY29yYXRvcnM7XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gcmV0cmlldmUgZGVjb3JhdG9yIHZhbHVlc1xuXHQgKlxuXHQgKiBAcGFyYW0gZGVjb3JhdG9yS2V5IFRoZSBrZXkgb2YgdGhlIGRlY29yYXRvclxuXHQgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBkZWNvcmF0b3IgdmFsdWVzXG5cdCAqL1xuXHRwcm90ZWN0ZWQgZ2V0RGVjb3JhdG9yKGRlY29yYXRvcktleTogc3RyaW5nKTogYW55W10ge1xuXHRcdGxldCBhbGxEZWNvcmF0b3JzID0gdGhpcy5fZGVjb3JhdG9yQ2FjaGUuZ2V0KGRlY29yYXRvcktleSk7XG5cblx0XHRpZiAoYWxsRGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gYWxsRGVjb3JhdG9ycztcblx0XHR9XG5cblx0XHRhbGxEZWNvcmF0b3JzID0gdGhpcy5fYnVpbGREZWNvcmF0b3JMaXN0KGRlY29yYXRvcktleSk7XG5cblx0XHR0aGlzLl9kZWNvcmF0b3JDYWNoZS5zZXQoZGVjb3JhdG9yS2V5LCBhbGxEZWNvcmF0b3JzKTtcblx0XHRyZXR1cm4gYWxsRGVjb3JhdG9ycztcblx0fVxuXG5cdC8qKlxuXHQgKiBCaW5kcyB1bmJvdW5kIHByb3BlcnR5IGZ1bmN0aW9ucyB0byB0aGUgc3BlY2lmaWVkIGBiaW5kYCBwcm9wZXJ0eVxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydGllcyBwcm9wZXJ0aWVzIHRvIGNoZWNrIGZvciBmdW5jdGlvbnNcblx0ICovXG5cdHByaXZhdGUgX2JpbmRGdW5jdGlvblByb3BlcnR5KHByb3BlcnR5OiBhbnksIGJpbmQ6IGFueSk6IGFueSB7XG5cdFx0aWYgKHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyAmJiAhcHJvcGVydHlbbm9CaW5kXSAmJiBpc1dpZGdldEJhc2VDb25zdHJ1Y3Rvcihwcm9wZXJ0eSkgPT09IGZhbHNlKSB7XG5cdFx0XHRpZiAodGhpcy5fYmluZEZ1bmN0aW9uUHJvcGVydHlNYXAgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR0aGlzLl9iaW5kRnVuY3Rpb25Qcm9wZXJ0eU1hcCA9IG5ldyBXZWFrTWFwPFxuXHRcdFx0XHRcdCguLi5hcmdzOiBhbnlbXSkgPT4gYW55LFxuXHRcdFx0XHRcdHsgYm91bmRGdW5jOiAoLi4uYXJnczogYW55W10pID0+IGFueTsgc2NvcGU6IGFueSB9XG5cdFx0XHRcdD4oKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGJpbmRJbmZvOiBQYXJ0aWFsPEJvdW5kRnVuY3Rpb25EYXRhPiA9IHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwLmdldChwcm9wZXJ0eSkgfHwge307XG5cdFx0XHRsZXQgeyBib3VuZEZ1bmMsIHNjb3BlIH0gPSBiaW5kSW5mbztcblxuXHRcdFx0aWYgKGJvdW5kRnVuYyA9PT0gdW5kZWZpbmVkIHx8IHNjb3BlICE9PSBiaW5kKSB7XG5cdFx0XHRcdGJvdW5kRnVuYyA9IHByb3BlcnR5LmJpbmQoYmluZCkgYXMgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG5cdFx0XHRcdHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwLnNldChwcm9wZXJ0eSwgeyBib3VuZEZ1bmMsIHNjb3BlOiBiaW5kIH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJvdW5kRnVuYztcblx0XHR9XG5cdFx0cmV0dXJuIHByb3BlcnR5O1xuXHR9XG5cblx0cHVibGljIGdldCByZWdpc3RyeSgpOiBSZWdpc3RyeUhhbmRsZXIge1xuXHRcdGlmICh0aGlzLl9yZWdpc3RyeSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl9yZWdpc3RyeSA9IG5ldyBSZWdpc3RyeUhhbmRsZXIoKTtcblx0XHRcdHRoaXMub3duKHRoaXMuX3JlZ2lzdHJ5KTtcblx0XHRcdHRoaXMub3duKHRoaXMuX3JlZ2lzdHJ5Lm9uKCdpbnZhbGlkYXRlJywgdGhpcy5fYm91bmRJbnZhbGlkYXRlKSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RyeTtcblx0fVxuXG5cdHByaXZhdGUgX3J1bkJlZm9yZVByb3BlcnRpZXMocHJvcGVydGllczogYW55KSB7XG5cdFx0Y29uc3QgYmVmb3JlUHJvcGVydGllczogQmVmb3JlUHJvcGVydGllc1tdID0gdGhpcy5nZXREZWNvcmF0b3IoJ2JlZm9yZVByb3BlcnRpZXMnKTtcblx0XHRpZiAoYmVmb3JlUHJvcGVydGllcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXR1cm4gYmVmb3JlUHJvcGVydGllcy5yZWR1Y2UoXG5cdFx0XHRcdChwcm9wZXJ0aWVzLCBiZWZvcmVQcm9wZXJ0aWVzRnVuY3Rpb24pID0+IHtcblx0XHRcdFx0XHRyZXR1cm4geyAuLi5wcm9wZXJ0aWVzLCAuLi5iZWZvcmVQcm9wZXJ0aWVzRnVuY3Rpb24uY2FsbCh0aGlzLCBwcm9wZXJ0aWVzKSB9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR7IC4uLnByb3BlcnRpZXMgfVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVuIGFsbCByZWdpc3RlcmVkIGJlZm9yZSByZW5kZXJzIGFuZCByZXR1cm4gdGhlIHVwZGF0ZWQgcmVuZGVyIG1ldGhvZFxuXHQgKi9cblx0cHJpdmF0ZSBfcnVuQmVmb3JlUmVuZGVycygpOiBSZW5kZXIge1xuXHRcdGNvbnN0IGJlZm9yZVJlbmRlcnMgPSB0aGlzLmdldERlY29yYXRvcignYmVmb3JlUmVuZGVyJyk7XG5cblx0XHRpZiAoYmVmb3JlUmVuZGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXR1cm4gYmVmb3JlUmVuZGVycy5yZWR1Y2UoKHJlbmRlcjogUmVuZGVyLCBiZWZvcmVSZW5kZXJGdW5jdGlvbjogQmVmb3JlUmVuZGVyKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHVwZGF0ZWRSZW5kZXIgPSBiZWZvcmVSZW5kZXJGdW5jdGlvbi5jYWxsKHRoaXMsIHJlbmRlciwgdGhpcy5fcHJvcGVydGllcywgdGhpcy5fY2hpbGRyZW4pO1xuXHRcdFx0XHRpZiAoIXVwZGF0ZWRSZW5kZXIpIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oJ1JlbmRlciBmdW5jdGlvbiBub3QgcmV0dXJuZWQgZnJvbSBiZWZvcmVSZW5kZXIsIHVzaW5nIHByZXZpb3VzIHJlbmRlcicpO1xuXHRcdFx0XHRcdHJldHVybiByZW5kZXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHVwZGF0ZWRSZW5kZXI7XG5cdFx0XHR9LCB0aGlzLl9ib3VuZFJlbmRlckZ1bmMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fYm91bmRSZW5kZXJGdW5jO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1biBhbGwgcmVnaXN0ZXJlZCBhZnRlciByZW5kZXJzIGFuZCByZXR1cm4gdGhlIGRlY29yYXRlZCBETm9kZXNcblx0ICpcblx0ICogQHBhcmFtIGROb2RlIFRoZSBETm9kZXMgdG8gcnVuIHRocm91Z2ggdGhlIGFmdGVyIHJlbmRlcnNcblx0ICovXG5cdHByaXZhdGUgX3J1bkFmdGVyUmVuZGVycyhkTm9kZTogRE5vZGUgfCBETm9kZVtdKTogRE5vZGUgfCBETm9kZVtdIHtcblx0XHRjb25zdCBhZnRlclJlbmRlcnMgPSB0aGlzLmdldERlY29yYXRvcignYWZ0ZXJSZW5kZXInKTtcblxuXHRcdGlmIChhZnRlclJlbmRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0ZE5vZGUgPSBhZnRlclJlbmRlcnMucmVkdWNlKChkTm9kZTogRE5vZGUgfCBETm9kZVtdLCBhZnRlclJlbmRlckZ1bmN0aW9uOiBBZnRlclJlbmRlcikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYWZ0ZXJSZW5kZXJGdW5jdGlvbi5jYWxsKHRoaXMsIGROb2RlKTtcblx0XHRcdH0sIGROb2RlKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fbWV0YU1hcCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl9tZXRhTWFwLmZvckVhY2goKG1ldGEpID0+IHtcblx0XHRcdFx0bWV0YS5hZnRlclJlbmRlcigpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGROb2RlO1xuXHR9XG5cblx0cHJpdmF0ZSBfcnVuQWZ0ZXJDb25zdHJ1Y3RvcnMoKTogdm9pZCB7XG5cdFx0Y29uc3QgYWZ0ZXJDb25zdHJ1Y3RvcnMgPSB0aGlzLmdldERlY29yYXRvcignYWZ0ZXJDb25zdHJ1Y3RvcicpO1xuXG5cdFx0aWYgKGFmdGVyQ29uc3RydWN0b3JzLmxlbmd0aCA+IDApIHtcblx0XHRcdGFmdGVyQ29uc3RydWN0b3JzLmZvckVhY2goKGFmdGVyQ29uc3RydWN0b3IpID0+IGFmdGVyQ29uc3RydWN0b3IuY2FsbCh0aGlzKSk7XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIG93bihoYW5kbGU6IEhhbmRsZSk6IHZvaWQge1xuXHRcdHRoaXMuX2hhbmRsZXMucHVzaChoYW5kbGUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGRlc3Ryb3koKSB7XG5cdFx0d2hpbGUgKHRoaXMuX2hhbmRsZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3QgaGFuZGxlID0gdGhpcy5faGFuZGxlcy5wb3AoKTtcblx0XHRcdGlmIChoYW5kbGUpIHtcblx0XHRcdFx0aGFuZGxlLmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2lkZ2V0QmFzZTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBXaWRnZXRCYXNlLnRzIiwiaW1wb3J0IHsgVk5vZGVQcm9wZXJ0aWVzIH0gZnJvbSAnLi8uLi9pbnRlcmZhY2VzJztcblxubGV0IGJyb3dzZXJTcGVjaWZpY1RyYW5zaXRpb25FbmRFdmVudE5hbWUgPSAnJztcbmxldCBicm93c2VyU3BlY2lmaWNBbmltYXRpb25FbmRFdmVudE5hbWUgPSAnJztcblxuZnVuY3Rpb24gZGV0ZXJtaW5lQnJvd3NlclN0eWxlTmFtZXMoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcblx0aWYgKCdXZWJraXRUcmFuc2l0aW9uJyBpbiBlbGVtZW50LnN0eWxlKSB7XG5cdFx0YnJvd3NlclNwZWNpZmljVHJhbnNpdGlvbkVuZEV2ZW50TmFtZSA9ICd3ZWJraXRUcmFuc2l0aW9uRW5kJztcblx0XHRicm93c2VyU3BlY2lmaWNBbmltYXRpb25FbmRFdmVudE5hbWUgPSAnd2Via2l0QW5pbWF0aW9uRW5kJztcblx0fSBlbHNlIGlmICgndHJhbnNpdGlvbicgaW4gZWxlbWVudC5zdHlsZSB8fCAnTW96VHJhbnNpdGlvbicgaW4gZWxlbWVudC5zdHlsZSkge1xuXHRcdGJyb3dzZXJTcGVjaWZpY1RyYW5zaXRpb25FbmRFdmVudE5hbWUgPSAndHJhbnNpdGlvbmVuZCc7XG5cdFx0YnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lID0gJ2FuaW1hdGlvbmVuZCc7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdZb3VyIGJyb3dzZXIgaXMgbm90IHN1cHBvcnRlZCcpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxpemUoZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcblx0aWYgKGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSA9PT0gJycpIHtcblx0XHRkZXRlcm1pbmVCcm93c2VyU3R5bGVOYW1lcyhlbGVtZW50KTtcblx0fVxufVxuXG5mdW5jdGlvbiBydW5BbmRDbGVhblVwKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzdGFydEFuaW1hdGlvbjogKCkgPT4gdm9pZCwgZmluaXNoQW5pbWF0aW9uOiAoKSA9PiB2b2lkKSB7XG5cdGluaXRpYWxpemUoZWxlbWVudCk7XG5cblx0bGV0IGZpbmlzaGVkID0gZmFsc2U7XG5cblx0bGV0IHRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIWZpbmlzaGVkKSB7XG5cdFx0XHRmaW5pc2hlZCA9IHRydWU7XG5cdFx0XHRlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoYnJvd3NlclNwZWNpZmljVHJhbnNpdGlvbkVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZCk7XG5cdFx0XHRlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoYnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lLCB0cmFuc2l0aW9uRW5kKTtcblxuXHRcdFx0ZmluaXNoQW5pbWF0aW9uKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHN0YXJ0QW5pbWF0aW9uKCk7XG5cblx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZCk7XG5cdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyU3BlY2lmaWNUcmFuc2l0aW9uRW5kRXZlbnROYW1lLCB0cmFuc2l0aW9uRW5kKTtcbn1cblxuZnVuY3Rpb24gZXhpdChub2RlOiBIVE1MRWxlbWVudCwgcHJvcGVydGllczogVk5vZGVQcm9wZXJ0aWVzLCBleGl0QW5pbWF0aW9uOiBzdHJpbmcsIHJlbW92ZU5vZGU6ICgpID0+IHZvaWQpIHtcblx0Y29uc3QgYWN0aXZlQ2xhc3MgPSBwcm9wZXJ0aWVzLmV4aXRBbmltYXRpb25BY3RpdmUgfHwgYCR7ZXhpdEFuaW1hdGlvbn0tYWN0aXZlYDtcblxuXHRydW5BbmRDbGVhblVwKFxuXHRcdG5vZGUsXG5cdFx0KCkgPT4ge1xuXHRcdFx0bm9kZS5jbGFzc0xpc3QuYWRkKGV4aXRBbmltYXRpb24pO1xuXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdG5vZGUuY2xhc3NMaXN0LmFkZChhY3RpdmVDbGFzcyk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdCgpID0+IHtcblx0XHRcdHJlbW92ZU5vZGUoKTtcblx0XHR9XG5cdCk7XG59XG5cbmZ1bmN0aW9uIGVudGVyKG5vZGU6IEhUTUxFbGVtZW50LCBwcm9wZXJ0aWVzOiBWTm9kZVByb3BlcnRpZXMsIGVudGVyQW5pbWF0aW9uOiBzdHJpbmcpIHtcblx0Y29uc3QgYWN0aXZlQ2xhc3MgPSBwcm9wZXJ0aWVzLmVudGVyQW5pbWF0aW9uQWN0aXZlIHx8IGAke2VudGVyQW5pbWF0aW9ufS1hY3RpdmVgO1xuXG5cdHJ1bkFuZENsZWFuVXAoXG5cdFx0bm9kZSxcblx0XHQoKSA9PiB7XG5cdFx0XHRub2RlLmNsYXNzTGlzdC5hZGQoZW50ZXJBbmltYXRpb24pO1xuXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdG5vZGUuY2xhc3NMaXN0LmFkZChhY3RpdmVDbGFzcyk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdCgpID0+IHtcblx0XHRcdG5vZGUuY2xhc3NMaXN0LnJlbW92ZShlbnRlckFuaW1hdGlvbik7XG5cdFx0XHRub2RlLmNsYXNzTGlzdC5yZW1vdmUoYWN0aXZlQ2xhc3MpO1xuXHRcdH1cblx0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRlbnRlcixcblx0ZXhpdFxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBjc3NUcmFuc2l0aW9ucy50cyIsImltcG9ydCB7XG5cdENvbnN0cnVjdG9yLFxuXHREZWZhdWx0V2lkZ2V0QmFzZUludGVyZmFjZSxcblx0RGVmZXJyZWRWaXJ0dWFsUHJvcGVydGllcyxcblx0RE5vZGUsXG5cdFZOb2RlLFxuXHRSZWdpc3RyeUxhYmVsLFxuXHRWTm9kZVByb3BlcnRpZXMsXG5cdFdpZGdldEJhc2VJbnRlcmZhY2UsXG5cdFdOb2RlLFxuXHREb21PcHRpb25zLFxuXHRSZW5kZXJSZXN1bHQsXG5cdERvbVZOb2RlLFxuXHRMYXp5V2lkZ2V0LFxuXHRMYXp5RGVmaW5lXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogVGhlIGlkZW50aWZpZXIgZm9yIGEgV05vZGUgdHlwZVxuICovXG5leHBvcnQgY29uc3QgV05PREUgPSAnX19XTk9ERV9UWVBFJztcblxuLyoqXG4gKiBUaGUgaWRlbnRpZmllciBmb3IgYSBWTm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCBWTk9ERSA9ICdfX1ZOT0RFX1RZUEUnO1xuXG4vKipcbiAqIFRoZSBpZGVudGlmaWVyIGZvciBhIFZOb2RlIHR5cGUgY3JlYXRlZCB1c2luZyBkb20oKVxuICovXG5leHBvcnQgY29uc3QgRE9NVk5PREUgPSAnX19ET01WTk9ERV9UWVBFJztcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgdGhlIGBETm9kZWAgaXMgYSBgV05vZGVgIHVzaW5nIHRoZSBgdHlwZWAgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzV05vZGU8VyBleHRlbmRzIFdpZGdldEJhc2VJbnRlcmZhY2UgPSBEZWZhdWx0V2lkZ2V0QmFzZUludGVyZmFjZT4oXG5cdGNoaWxkOiBETm9kZTxXPiB8IGFueVxuKTogY2hpbGQgaXMgV05vZGU8Vz4ge1xuXHRyZXR1cm4gQm9vbGVhbihjaGlsZCAmJiB0eXBlb2YgY2hpbGQgIT09ICdzdHJpbmcnICYmIGNoaWxkLnR5cGUgPT09IFdOT0RFKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgdGhlIGBETm9kZWAgaXMgYSBgVk5vZGVgIHVzaW5nIHRoZSBgdHlwZWAgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVk5vZGUoY2hpbGQ6IEROb2RlKTogY2hpbGQgaXMgVk5vZGUge1xuXHRyZXR1cm4gQm9vbGVhbihjaGlsZCAmJiB0eXBlb2YgY2hpbGQgIT09ICdzdHJpbmcnICYmIChjaGlsZC50eXBlID09PSBWTk9ERSB8fCBjaGlsZC50eXBlID09PSBET01WTk9ERSkpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBpZiB0aGUgYEROb2RlYCBpcyBhIGBWTm9kZWAgY3JlYXRlZCB3aXRoIGBkb20oKWAgdXNpbmcgdGhlIGB0eXBlYCBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEb21WTm9kZShjaGlsZDogRE5vZGUpOiBjaGlsZCBpcyBEb21WTm9kZSB7XG5cdHJldHVybiBCb29sZWFuKGNoaWxkICYmIHR5cGVvZiBjaGlsZCAhPT0gJ3N0cmluZycgJiYgY2hpbGQudHlwZSA9PT0gRE9NVk5PREUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFbGVtZW50Tm9kZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRWxlbWVudCB7XG5cdHJldHVybiAhIXZhbHVlLnRhZ05hbWU7XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUgZGVjb3JhdGUgbW9kaWZpZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNb2RpZmllcjxUIGV4dGVuZHMgRE5vZGU+IHtcblx0KGROb2RlOiBULCBicmVha2VyOiAoKSA9PiB2b2lkKTogdm9pZDtcbn1cblxuLyoqXG4gKiBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uIGZvciBkZWNvcmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByZWRpY2F0ZTxUIGV4dGVuZHMgRE5vZGU+IHtcblx0KGROb2RlOiBETm9kZSk6IGROb2RlIGlzIFQ7XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWNvcmF0ZU9wdGlvbnM8VCBleHRlbmRzIEROb2RlPiB7XG5cdG1vZGlmaWVyOiBNb2RpZmllcjxUPjtcblx0cHJlZGljYXRlPzogUHJlZGljYXRlPFQ+O1xuXHRzaGFsbG93PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBHZW5lcmljIGRlY29yYXRlIGZ1bmN0aW9uIGZvciBETm9kZXMuIFRoZSBub2RlcyBhcmUgbW9kaWZpZWQgaW4gcGxhY2UgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHByZWRpY2F0ZVxuICogYW5kIG1vZGlmaWVyIGZ1bmN0aW9ucy5cbiAqXG4gKiBUaGUgY2hpbGRyZW4gb2YgZWFjaCBub2RlIGFyZSBmbGF0dGVuZWQgYW5kIGFkZGVkIHRvIHRoZSBhcnJheSBmb3IgZGVjb3JhdGlvbi5cbiAqXG4gKiBJZiBubyBwcmVkaWNhdGUgaXMgc3VwcGxpZWQgdGhlbiB0aGUgbW9kaWZpZXIgd2lsbCBiZSBleGVjdXRlZCBvbiBhbGwgbm9kZXMuIEEgYGJyZWFrZXJgIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byB0aGVcbiAqIG1vZGlmaWVyIHdoaWNoIHdpbGwgZHJhaW4gdGhlIG5vZGVzIGFycmF5IGFuZCBleGl0IHRoZSBkZWNvcmF0aW9uLlxuICpcbiAqIFdoZW4gdGhlIGBzaGFsbG93YCBvcHRpb25zIGlzIHNldCB0byBgdHJ1ZWAgdGhlIG9ubHkgdGhlIHRvcCBub2RlIG9yIG5vZGVzIHdpbGwgYmUgZGVjb3JhdGVkIChvbmx5IHN1cHBvcnRlZCB1c2luZ1xuICogYERlY29yYXRlT3B0aW9uc2ApLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGU8VCBleHRlbmRzIEROb2RlPihkTm9kZXM6IEROb2RlLCBvcHRpb25zOiBEZWNvcmF0ZU9wdGlvbnM8VD4pOiBETm9kZTtcbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZTxUIGV4dGVuZHMgRE5vZGU+KGROb2RlczogRE5vZGVbXSwgb3B0aW9uczogRGVjb3JhdGVPcHRpb25zPFQ+KTogRE5vZGVbXTtcbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZTxUIGV4dGVuZHMgRE5vZGU+KGROb2RlczogRE5vZGUgfCBETm9kZVtdLCBvcHRpb25zOiBEZWNvcmF0ZU9wdGlvbnM8VD4pOiBETm9kZSB8IEROb2RlW107XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGU8VCBleHRlbmRzIEROb2RlPihkTm9kZXM6IEROb2RlLCBtb2RpZmllcjogTW9kaWZpZXI8VD4sIHByZWRpY2F0ZTogUHJlZGljYXRlPFQ+KTogRE5vZGU7XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGU8VCBleHRlbmRzIEROb2RlPihkTm9kZXM6IEROb2RlW10sIG1vZGlmaWVyOiBNb2RpZmllcjxUPiwgcHJlZGljYXRlOiBQcmVkaWNhdGU8VD4pOiBETm9kZVtdO1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlPFQgZXh0ZW5kcyBETm9kZT4oXG5cdGROb2RlczogUmVuZGVyUmVzdWx0LFxuXHRtb2RpZmllcjogTW9kaWZpZXI8VD4sXG5cdHByZWRpY2F0ZTogUHJlZGljYXRlPFQ+XG4pOiBSZW5kZXJSZXN1bHQ7XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGUoZE5vZGVzOiBETm9kZSwgbW9kaWZpZXI6IE1vZGlmaWVyPEROb2RlPik6IEROb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlKGROb2RlczogRE5vZGVbXSwgbW9kaWZpZXI6IE1vZGlmaWVyPEROb2RlPik6IEROb2RlW107XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGUoZE5vZGVzOiBSZW5kZXJSZXN1bHQsIG1vZGlmaWVyOiBNb2RpZmllcjxETm9kZT4pOiBSZW5kZXJSZXN1bHQ7XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGUoXG5cdGROb2RlczogRE5vZGUgfCBETm9kZVtdLFxuXHRvcHRpb25zT3JNb2RpZmllcjogTW9kaWZpZXI8RE5vZGU+IHwgRGVjb3JhdGVPcHRpb25zPEROb2RlPixcblx0cHJlZGljYXRlPzogUHJlZGljYXRlPEROb2RlPlxuKTogRE5vZGUgfCBETm9kZVtdIHtcblx0bGV0IHNoYWxsb3cgPSBmYWxzZTtcblx0bGV0IG1vZGlmaWVyO1xuXHRpZiAodHlwZW9mIG9wdGlvbnNPck1vZGlmaWVyID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0bW9kaWZpZXIgPSBvcHRpb25zT3JNb2RpZmllcjtcblx0fSBlbHNlIHtcblx0XHRtb2RpZmllciA9IG9wdGlvbnNPck1vZGlmaWVyLm1vZGlmaWVyO1xuXHRcdHByZWRpY2F0ZSA9IG9wdGlvbnNPck1vZGlmaWVyLnByZWRpY2F0ZTtcblx0XHRzaGFsbG93ID0gb3B0aW9uc09yTW9kaWZpZXIuc2hhbGxvdyB8fCBmYWxzZTtcblx0fVxuXG5cdGxldCBub2RlcyA9IEFycmF5LmlzQXJyYXkoZE5vZGVzKSA/IFsuLi5kTm9kZXNdIDogW2ROb2Rlc107XG5cdGZ1bmN0aW9uIGJyZWFrZXIoKSB7XG5cdFx0bm9kZXMgPSBbXTtcblx0fVxuXHR3aGlsZSAobm9kZXMubGVuZ3RoKSB7XG5cdFx0Y29uc3Qgbm9kZSA9IG5vZGVzLnNoaWZ0KCk7XG5cdFx0aWYgKG5vZGUpIHtcblx0XHRcdGlmICghc2hhbGxvdyAmJiAoaXNXTm9kZShub2RlKSB8fCBpc1ZOb2RlKG5vZGUpKSAmJiBub2RlLmNoaWxkcmVuKSB7XG5cdFx0XHRcdG5vZGVzID0gWy4uLm5vZGVzLCAuLi5ub2RlLmNoaWxkcmVuXTtcblx0XHRcdH1cblx0XHRcdGlmICghcHJlZGljYXRlIHx8IHByZWRpY2F0ZShub2RlKSkge1xuXHRcdFx0XHRtb2RpZmllcihub2RlLCBicmVha2VyKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGROb2Rlcztcbn1cblxuLyoqXG4gKiBXcmFwcGVyIGZ1bmN0aW9uIGZvciBjYWxscyB0byBjcmVhdGUgYSB3aWRnZXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3PFcgZXh0ZW5kcyBXaWRnZXRCYXNlSW50ZXJmYWNlPihcblx0bm9kZTogV05vZGU8Vz4sXG5cdHByb3BlcnRpZXM6IFBhcnRpYWw8V1sncHJvcGVydGllcyddPixcblx0Y2hpbGRyZW4/OiBXWydjaGlsZHJlbiddXG4pOiBXTm9kZTxXPjtcbmV4cG9ydCBmdW5jdGlvbiB3PFcgZXh0ZW5kcyBXaWRnZXRCYXNlSW50ZXJmYWNlPihcblx0d2lkZ2V0Q29uc3RydWN0b3I6IENvbnN0cnVjdG9yPFc+IHwgUmVnaXN0cnlMYWJlbCB8IExhenlXaWRnZXQ8Vz4gfCBMYXp5RGVmaW5lPFc+LFxuXHRwcm9wZXJ0aWVzOiBXWydwcm9wZXJ0aWVzJ10sXG5cdGNoaWxkcmVuPzogV1snY2hpbGRyZW4nXVxuKTogV05vZGU8Vz47XG5leHBvcnQgZnVuY3Rpb24gdzxXIGV4dGVuZHMgV2lkZ2V0QmFzZUludGVyZmFjZT4oXG5cdHdpZGdldENvbnN0cnVjdG9yT3JOb2RlOiBDb25zdHJ1Y3RvcjxXPiB8IFJlZ2lzdHJ5TGFiZWwgfCBXTm9kZTxXPiB8IExhenlXaWRnZXQ8Vz4gfCBMYXp5RGVmaW5lPFc+LFxuXHRwcm9wZXJ0aWVzOiBXWydwcm9wZXJ0aWVzJ10sXG5cdGNoaWxkcmVuPzogV1snY2hpbGRyZW4nXVxuKTogV05vZGU8Vz4ge1xuXHRpZiAoaXNXTm9kZSh3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZSkpIHtcblx0XHRwcm9wZXJ0aWVzID0geyAuLi4od2lkZ2V0Q29uc3RydWN0b3JPck5vZGUucHJvcGVydGllcyBhcyBhbnkpLCAuLi4ocHJvcGVydGllcyBhcyBhbnkpIH07XG5cdFx0Y2hpbGRyZW4gPSBjaGlsZHJlbiA/IGNoaWxkcmVuIDogd2lkZ2V0Q29uc3RydWN0b3JPck5vZGUuY2hpbGRyZW47XG5cdFx0d2lkZ2V0Q29uc3RydWN0b3JPck5vZGUgPSB3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZS53aWRnZXRDb25zdHJ1Y3Rvcjtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y2hpbGRyZW46IGNoaWxkcmVuIHx8IFtdLFxuXHRcdHdpZGdldENvbnN0cnVjdG9yOiB3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZSxcblx0XHRwcm9wZXJ0aWVzLFxuXHRcdHR5cGU6IFdOT0RFXG5cdH07XG59XG5cbi8qKlxuICogV3JhcHBlciBmdW5jdGlvbiBmb3IgY2FsbHMgdG8gY3JlYXRlIFZOb2Rlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHYobm9kZTogVk5vZGUsIHByb3BlcnRpZXM6IFZOb2RlUHJvcGVydGllcywgY2hpbGRyZW46IHVuZGVmaW5lZCB8IEROb2RlW10pOiBWTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiB2KG5vZGU6IFZOb2RlLCBwcm9wZXJ0aWVzOiBWTm9kZVByb3BlcnRpZXMpOiBWTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiB2KHRhZzogc3RyaW5nLCBjaGlsZHJlbjogdW5kZWZpbmVkIHwgRE5vZGVbXSk6IFZOb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIHYodGFnOiBzdHJpbmcsIHByb3BlcnRpZXM6IERlZmVycmVkVmlydHVhbFByb3BlcnRpZXMgfCBWTm9kZVByb3BlcnRpZXMsIGNoaWxkcmVuPzogRE5vZGVbXSk6IFZOb2RlO1xuZXhwb3J0IGZ1bmN0aW9uIHYodGFnOiBzdHJpbmcpOiBWTm9kZTtcbmV4cG9ydCBmdW5jdGlvbiB2KFxuXHR0YWc6IHN0cmluZyB8IFZOb2RlLFxuXHRwcm9wZXJ0aWVzT3JDaGlsZHJlbjogVk5vZGVQcm9wZXJ0aWVzIHwgRGVmZXJyZWRWaXJ0dWFsUHJvcGVydGllcyB8IEROb2RlW10gPSB7fSxcblx0Y2hpbGRyZW46IHVuZGVmaW5lZCB8IEROb2RlW10gPSB1bmRlZmluZWRcbik6IFZOb2RlIHtcblx0bGV0IHByb3BlcnRpZXM6IFZOb2RlUHJvcGVydGllcyB8IERlZmVycmVkVmlydHVhbFByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzT3JDaGlsZHJlbjtcblx0bGV0IGRlZmVycmVkUHJvcGVydGllc0NhbGxiYWNrO1xuXG5cdGlmIChBcnJheS5pc0FycmF5KHByb3BlcnRpZXNPckNoaWxkcmVuKSkge1xuXHRcdGNoaWxkcmVuID0gcHJvcGVydGllc09yQ2hpbGRyZW47XG5cdFx0cHJvcGVydGllcyA9IHt9O1xuXHR9XG5cblx0aWYgKHR5cGVvZiBwcm9wZXJ0aWVzID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0ZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2sgPSBwcm9wZXJ0aWVzO1xuXHRcdHByb3BlcnRpZXMgPSB7fTtcblx0fVxuXG5cdGlmIChpc1ZOb2RlKHRhZykpIHtcblx0XHRsZXQgeyBjbGFzc2VzID0gW10sIHN0eWxlcyA9IHt9LCAuLi5uZXdQcm9wZXJ0aWVzIH0gPSBwcm9wZXJ0aWVzO1xuXHRcdGxldCB7IGNsYXNzZXM6IG5vZGVDbGFzc2VzID0gW10sIHN0eWxlczogbm9kZVN0eWxlcyA9IHt9LCAuLi5ub2RlUHJvcGVydGllcyB9ID0gdGFnLnByb3BlcnRpZXM7XG5cdFx0bm9kZUNsYXNzZXMgPSBBcnJheS5pc0FycmF5KG5vZGVDbGFzc2VzKSA/IG5vZGVDbGFzc2VzIDogW25vZGVDbGFzc2VzXTtcblx0XHRjbGFzc2VzID0gQXJyYXkuaXNBcnJheShjbGFzc2VzKSA/IGNsYXNzZXMgOiBbY2xhc3Nlc107XG5cdFx0c3R5bGVzID0geyAuLi5ub2RlU3R5bGVzLCAuLi5zdHlsZXMgfTtcblx0XHRwcm9wZXJ0aWVzID0geyAuLi5ub2RlUHJvcGVydGllcywgLi4ubmV3UHJvcGVydGllcywgY2xhc3NlczogWy4uLm5vZGVDbGFzc2VzLCAuLi5jbGFzc2VzXSwgc3R5bGVzIH07XG5cdFx0Y2hpbGRyZW4gPSBjaGlsZHJlbiA/IGNoaWxkcmVuIDogdGFnLmNoaWxkcmVuO1xuXHRcdHRhZyA9IHRhZy50YWc7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHRhZyxcblx0XHRkZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjayxcblx0XHRvcmlnaW5hbFByb3BlcnRpZXM6IHt9LFxuXHRcdGNoaWxkcmVuLFxuXHRcdHByb3BlcnRpZXMsXG5cdFx0dHlwZTogVk5PREVcblx0fTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBWTm9kZSBmb3IgYW4gZXhpc3RpbmcgRE9NIE5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb20oXG5cdHsgbm9kZSwgYXR0cnMgPSB7fSwgcHJvcHMgPSB7fSwgb24gPSB7fSwgZGlmZlR5cGUgPSAnbm9uZScsIG9uQXR0YWNoIH06IERvbU9wdGlvbnMsXG5cdGNoaWxkcmVuPzogRE5vZGVbXVxuKTogRG9tVk5vZGUge1xuXHRyZXR1cm4ge1xuXHRcdHRhZzogaXNFbGVtZW50Tm9kZShub2RlKSA/IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpIDogJycsXG5cdFx0cHJvcGVydGllczogcHJvcHMsXG5cdFx0YXR0cmlidXRlczogYXR0cnMsXG5cdFx0ZXZlbnRzOiBvbixcblx0XHRjaGlsZHJlbixcblx0XHR0eXBlOiBET01WTk9ERSxcblx0XHRkb21Ob2RlOiBub2RlLFxuXHRcdHRleHQ6IGlzRWxlbWVudE5vZGUobm9kZSkgPyB1bmRlZmluZWQgOiBub2RlLmRhdGEsXG5cdFx0ZGlmZlR5cGUsXG5cdFx0b25BdHRhY2hcblx0fTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBkLnRzIiwiaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJy4vLi4vV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBiZWZvcmVQcm9wZXJ0aWVzIH0gZnJvbSAnLi9iZWZvcmVQcm9wZXJ0aWVzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFsd2F5c1JlbmRlcigpIHtcblx0cmV0dXJuIGhhbmRsZURlY29yYXRvcigodGFyZ2V0LCBwcm9wZXJ0eUtleSkgPT4ge1xuXHRcdGJlZm9yZVByb3BlcnRpZXMoZnVuY3Rpb24odGhpczogV2lkZ2V0QmFzZSkge1xuXHRcdFx0dGhpcy5pbnZhbGlkYXRlKCk7XG5cdFx0fSkodGFyZ2V0KTtcblx0fSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFsd2F5c1JlbmRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBhbHdheXNSZW5kZXIudHMiLCJpbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBCZWZvcmVQcm9wZXJ0aWVzIH0gZnJvbSAnLi8uLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBEZWNvcmF0b3IgdGhhdCBhZGRzIHRoZSBmdW5jdGlvbiBwYXNzZWQgb2YgdGFyZ2V0IG1ldGhvZCB0byBiZSBydW5cbiAqIGluIHRoZSBgYmVmb3JlUHJvcGVydGllc2AgbGlmZWN5Y2xlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlUHJvcGVydGllcyhtZXRob2Q6IEJlZm9yZVByb3BlcnRpZXMpOiAodGFyZ2V0OiBhbnkpID0+IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlUHJvcGVydGllcygpOiAodGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcpID0+IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlUHJvcGVydGllcyhtZXRob2Q/OiBCZWZvcmVQcm9wZXJ0aWVzKSB7XG5cdHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcblx0XHR0YXJnZXQuYWRkRGVjb3JhdG9yKCdiZWZvcmVQcm9wZXJ0aWVzJywgcHJvcGVydHlLZXkgPyB0YXJnZXRbcHJvcGVydHlLZXldIDogbWV0aG9kKTtcblx0fSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJlZm9yZVByb3BlcnRpZXM7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gYmVmb3JlUHJvcGVydGllcy50cyIsImltcG9ydCB7IENvbnN0cnVjdG9yLCBXaWRnZXRQcm9wZXJ0aWVzIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDdXN0b21FbGVtZW50Q2hpbGRUeXBlIH0gZnJvbSAnLi4vcmVnaXN0ZXJDdXN0b21FbGVtZW50JztcbmltcG9ydCBSZWdpc3RyeSBmcm9tICcuLi9SZWdpc3RyeSc7XG5cbmV4cG9ydCB0eXBlIEN1c3RvbUVsZW1lbnRQcm9wZXJ0eU5hbWVzPFAgZXh0ZW5kcyBvYmplY3Q+ID0gKChrZXlvZiBQKSB8IChrZXlvZiBXaWRnZXRQcm9wZXJ0aWVzKSlbXTtcblxuLyoqXG4gKiBEZWZpbmVzIHRoZSBjdXN0b20gZWxlbWVudCBjb25maWd1cmF0aW9uIHVzZWQgYnkgdGhlIGN1c3RvbUVsZW1lbnQgZGVjb3JhdG9yXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3VzdG9tRWxlbWVudENvbmZpZzxQIGV4dGVuZHMgb2JqZWN0ID0geyBbaW5kZXg6IHN0cmluZ106IGFueSB9PiB7XG5cdC8qKlxuXHQgKiBUaGUgdGFnIG9mIHRoZSBjdXN0b20gZWxlbWVudFxuXHQgKi9cblx0dGFnOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIExpc3Qgb2Ygd2lkZ2V0IHByb3BlcnRpZXMgdG8gZXhwb3NlIGFzIHByb3BlcnRpZXMgb24gdGhlIGN1c3RvbSBlbGVtZW50XG5cdCAqL1xuXHRwcm9wZXJ0aWVzPzogQ3VzdG9tRWxlbWVudFByb3BlcnR5TmFtZXM8UD47XG5cblx0LyoqXG5cdCAqIExpc3Qgb2YgYXR0cmlidXRlcyBvbiB0aGUgY3VzdG9tIGVsZW1lbnQgdG8gbWFwIHRvIHdpZGdldCBwcm9wZXJ0aWVzXG5cdCAqL1xuXHRhdHRyaWJ1dGVzPzogQ3VzdG9tRWxlbWVudFByb3BlcnR5TmFtZXM8UD47XG5cblx0LyoqXG5cdCAqIExpc3Qgb2YgZXZlbnRzIHRvIGV4cG9zZVxuXHQgKi9cblx0ZXZlbnRzPzogQ3VzdG9tRWxlbWVudFByb3BlcnR5TmFtZXM8UD47XG5cblx0Y2hpbGRUeXBlPzogQ3VzdG9tRWxlbWVudENoaWxkVHlwZTtcblxuXHRyZWdpc3RyeUZhY3Rvcnk/OiAoKSA9PiBSZWdpc3RyeTtcbn1cblxuLyoqXG4gKiBUaGlzIERlY29yYXRvciBpcyBwcm92aWRlZCBwcm9wZXJ0aWVzIHRoYXQgZGVmaW5lIHRoZSBiZWhhdmlvciBvZiBhIGN1c3RvbSBlbGVtZW50LCBhbmRcbiAqIHJlZ2lzdGVycyB0aGF0IGN1c3RvbSBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tRWxlbWVudDxQIGV4dGVuZHMgb2JqZWN0ID0geyBbaW5kZXg6IHN0cmluZ106IGFueSB9Pih7XG5cdHRhZyxcblx0cHJvcGVydGllcyA9IFtdLFxuXHRhdHRyaWJ1dGVzID0gW10sXG5cdGV2ZW50cyA9IFtdLFxuXHRjaGlsZFR5cGUgPSBDdXN0b21FbGVtZW50Q2hpbGRUeXBlLkRPSk8sXG5cdHJlZ2lzdHJ5RmFjdG9yeSA9ICgpID0+IG5ldyBSZWdpc3RyeSgpXG59OiBDdXN0b21FbGVtZW50Q29uZmlnPFA+KSB7XG5cdHJldHVybiBmdW5jdGlvbjxUIGV4dGVuZHMgQ29uc3RydWN0b3I8YW55Pj4odGFyZ2V0OiBUKSB7XG5cdFx0dGFyZ2V0LnByb3RvdHlwZS5fX2N1c3RvbUVsZW1lbnREZXNjcmlwdG9yID0ge1xuXHRcdFx0dGFnTmFtZTogdGFnLFxuXHRcdFx0YXR0cmlidXRlcyxcblx0XHRcdHByb3BlcnRpZXMsXG5cdFx0XHRldmVudHMsXG5cdFx0XHRjaGlsZFR5cGUsXG5cdFx0XHRyZWdpc3RyeUZhY3Rvcnlcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjdXN0b21FbGVtZW50O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGN1c3RvbUVsZW1lbnQudHMiLCJpbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBEaWZmUHJvcGVydHlGdW5jdGlvbiB9IGZyb20gJy4vLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhdXRvIH0gZnJvbSAnLi8uLi9kaWZmJztcblxuLyoqXG4gKiBEZWNvcmF0b3IgdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciBhIGZ1bmN0aW9uIGFzIGEgc3BlY2lmaWMgcHJvcGVydHkgZGlmZlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBvZiB3aGljaCB0aGUgZGlmZiBmdW5jdGlvbiBpcyBhcHBsaWVkXG4gKiBAcGFyYW0gZGlmZlR5cGUgICAgICBUaGUgZGlmZiB0eXBlLCBkZWZhdWx0IGlzIERpZmZUeXBlLkFVVE8uXG4gKiBAcGFyYW0gZGlmZkZ1bmN0aW9uICBBIGRpZmYgZnVuY3Rpb24gdG8gcnVuIGlmIGRpZmZUeXBlIGlmIERpZmZUeXBlLkNVU1RPTVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZlByb3BlcnR5KFxuXHRwcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0ZGlmZkZ1bmN0aW9uOiBEaWZmUHJvcGVydHlGdW5jdGlvbiA9IGF1dG8sXG5cdHJlYWN0aW9uRnVuY3Rpb24/OiBGdW5jdGlvblxuKSB7XG5cdHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcblx0XHR0YXJnZXQuYWRkRGVjb3JhdG9yKGBkaWZmUHJvcGVydHk6JHtwcm9wZXJ0eU5hbWV9YCwgZGlmZkZ1bmN0aW9uLmJpbmQobnVsbCkpO1xuXHRcdHRhcmdldC5hZGREZWNvcmF0b3IoJ3JlZ2lzdGVyZWREaWZmUHJvcGVydHknLCBwcm9wZXJ0eU5hbWUpO1xuXHRcdGlmIChyZWFjdGlvbkZ1bmN0aW9uIHx8IHByb3BlcnR5S2V5KSB7XG5cdFx0XHR0YXJnZXQuYWRkRGVjb3JhdG9yKCdkaWZmUmVhY3Rpb24nLCB7XG5cdFx0XHRcdHByb3BlcnR5TmFtZSxcblx0XHRcdFx0cmVhY3Rpb246IHByb3BlcnR5S2V5ID8gdGFyZ2V0W3Byb3BlcnR5S2V5XSA6IHJlYWN0aW9uRnVuY3Rpb25cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpZmZQcm9wZXJ0eTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBkaWZmUHJvcGVydHkudHMiLCJleHBvcnQgdHlwZSBEZWNvcmF0b3JIYW5kbGVyID0gKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleT86IHN0cmluZykgPT4gdm9pZDtcblxuLyoqXG4gKiBHZW5lcmljIGRlY29yYXRvciBoYW5kbGVyIHRvIHRha2UgY2FyZSBvZiB3aGV0aGVyIG9yIG5vdCB0aGUgZGVjb3JhdG9yIHdhcyBjYWxsZWQgYXQgdGhlIGNsYXNzIGxldmVsXG4gKiBvciB0aGUgbWV0aG9kIGxldmVsLlxuICpcbiAqIEBwYXJhbSBoYW5kbGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVEZWNvcmF0b3IoaGFuZGxlcjogRGVjb3JhdG9ySGFuZGxlcikge1xuXHRyZXR1cm4gZnVuY3Rpb24odGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5Pzogc3RyaW5nLCBkZXNjcmlwdG9yPzogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG5cdFx0aWYgKHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGhhbmRsZXIodGFyZ2V0LnByb3RvdHlwZSwgdW5kZWZpbmVkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aGFuZGxlcih0YXJnZXQsIHByb3BlcnR5S2V5KTtcblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGhhbmRsZURlY29yYXRvcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBoYW5kbGVEZWNvcmF0b3IudHMiLCJpbXBvcnQgV2Vha01hcCBmcm9tICcuLi8uLi9zaGltL1dlYWtNYXAnO1xuaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJy4vLi4vV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBiZWZvcmVQcm9wZXJ0aWVzIH0gZnJvbSAnLi9iZWZvcmVQcm9wZXJ0aWVzJztcbmltcG9ydCB7IEluamVjdG9ySXRlbSwgUmVnaXN0cnlMYWJlbCB9IGZyb20gJy4vLi4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogTWFwIG9mIGluc3RhbmNlcyBhZ2FpbnN0IHJlZ2lzdGVyZWQgaW5qZWN0b3JzLlxuICovXG5jb25zdCByZWdpc3RlcmVkSW5qZWN0b3JzTWFwOiBXZWFrTWFwPFdpZGdldEJhc2UsIEluamVjdG9ySXRlbVtdPiA9IG5ldyBXZWFrTWFwKCk7XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgY29udHJhY3QgcmVxdWlyZXMgZm9yIHRoZSBnZXQgcHJvcGVydGllcyBmdW5jdGlvblxuICogdXNlZCB0byBtYXAgdGhlIGluamVjdGVkIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2V0UHJvcGVydGllczxUID0gYW55PiB7XG5cdChwYXlsb2FkOiBhbnksIHByb3BlcnRpZXM6IFQpOiBUO1xufVxuXG4vKipcbiAqIERlZmluZXMgdGhlIGluamVjdCBjb25maWd1cmF0aW9uIHJlcXVpcmVkIGZvciB1c2Ugb2YgdGhlIGBpbmplY3RgIGRlY29yYXRvclxuICovXG5leHBvcnQgaW50ZXJmYWNlIEluamVjdENvbmZpZyB7XG5cdC8qKlxuXHQgKiBUaGUgbGFiZWwgb2YgdGhlIHJlZ2lzdHJ5IGluamVjdG9yXG5cdCAqL1xuXHRuYW1lOiBSZWdpc3RyeUxhYmVsO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgcHJvcGVydHVlcyB0byBpbmplY3QgdXNpbmcgdGhlIHBhc3NlZCBwcm9wZXJ0aWVzXG5cdCAqIGFuZCB0aGUgaW5qZWN0ZWQgcGF5bG9hZC5cblx0ICovXG5cdGdldFByb3BlcnRpZXM6IEdldFByb3BlcnRpZXM7XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIHJldHJpZXZlcyBhbiBpbmplY3RvciBmcm9tIGFuIGF2YWlsYWJsZSByZWdpc3RyeSB1c2luZyB0aGUgbmFtZSBhbmRcbiAqIGNhbGxzIHRoZSBgZ2V0UHJvcGVydGllc2AgZnVuY3Rpb24gd2l0aCB0aGUgcGF5bG9hZCBmcm9tIHRoZSBpbmplY3RvclxuICogYW5kIGN1cnJlbnQgcHJvcGVydGllcyB3aXRoIHRoZSB0aGUgaW5qZWN0ZWQgcHJvcGVydGllcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0gSW5qZWN0Q29uZmlnIHRoZSBpbmplY3QgY29uZmlndXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0KHsgbmFtZSwgZ2V0UHJvcGVydGllcyB9OiBJbmplY3RDb25maWcpIHtcblx0cmV0dXJuIGhhbmRsZURlY29yYXRvcigodGFyZ2V0LCBwcm9wZXJ0eUtleSkgPT4ge1xuXHRcdGJlZm9yZVByb3BlcnRpZXMoZnVuY3Rpb24odGhpczogV2lkZ2V0QmFzZSAmIHsgb3duOiBGdW5jdGlvbiB9LCBwcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRcdGNvbnN0IGluamVjdG9ySXRlbSA9IHRoaXMucmVnaXN0cnkuZ2V0SW5qZWN0b3IobmFtZSk7XG5cdFx0XHRpZiAoaW5qZWN0b3JJdGVtKSB7XG5cdFx0XHRcdGNvbnN0IHsgaW5qZWN0b3IsIGludmFsaWRhdG9yIH0gPSBpbmplY3Rvckl0ZW07XG5cdFx0XHRcdGNvbnN0IHJlZ2lzdGVyZWRJbmplY3RvcnMgPSByZWdpc3RlcmVkSW5qZWN0b3JzTWFwLmdldCh0aGlzKSB8fCBbXTtcblx0XHRcdFx0aWYgKHJlZ2lzdGVyZWRJbmplY3RvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0cmVnaXN0ZXJlZEluamVjdG9yc01hcC5zZXQodGhpcywgcmVnaXN0ZXJlZEluamVjdG9ycyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlZ2lzdGVyZWRJbmplY3RvcnMuaW5kZXhPZihpbmplY3Rvckl0ZW0pID09PSAtMSkge1xuXHRcdFx0XHRcdHRoaXMub3duKFxuXHRcdFx0XHRcdFx0aW52YWxpZGF0b3Iub24oJ2ludmFsaWRhdGUnLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJlZ2lzdGVyZWRJbmplY3RvcnMucHVzaChpbmplY3Rvckl0ZW0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBnZXRQcm9wZXJ0aWVzKGluamVjdG9yKCksIHByb3BlcnRpZXMpO1xuXHRcdFx0fVxuXHRcdH0pKHRhcmdldCk7XG5cdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpbmplY3Q7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gaW5qZWN0LnRzIiwiaW1wb3J0IHsgUHJvcGVydHlDaGFuZ2VSZWNvcmQgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgV0lER0VUX0JBU0VfVFlQRSB9IGZyb20gJy4vUmVnaXN0cnknO1xuXG5mdW5jdGlvbiBpc09iamVjdE9yQXJyYXkodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbHdheXMocHJldmlvdXNQcm9wZXJ0eTogYW55LCBuZXdQcm9wZXJ0eTogYW55KTogUHJvcGVydHlDaGFuZ2VSZWNvcmQge1xuXHRyZXR1cm4ge1xuXHRcdGNoYW5nZWQ6IHRydWUsXG5cdFx0dmFsdWU6IG5ld1Byb3BlcnR5XG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZ25vcmUocHJldmlvdXNQcm9wZXJ0eTogYW55LCBuZXdQcm9wZXJ0eTogYW55KTogUHJvcGVydHlDaGFuZ2VSZWNvcmQge1xuXHRyZXR1cm4ge1xuXHRcdGNoYW5nZWQ6IGZhbHNlLFxuXHRcdHZhbHVlOiBuZXdQcm9wZXJ0eVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmZXJlbmNlKHByZXZpb3VzUHJvcGVydHk6IGFueSwgbmV3UHJvcGVydHk6IGFueSk6IFByb3BlcnR5Q2hhbmdlUmVjb3JkIHtcblx0cmV0dXJuIHtcblx0XHRjaGFuZ2VkOiBwcmV2aW91c1Byb3BlcnR5ICE9PSBuZXdQcm9wZXJ0eSxcblx0XHR2YWx1ZTogbmV3UHJvcGVydHlcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3cocHJldmlvdXNQcm9wZXJ0eTogYW55LCBuZXdQcm9wZXJ0eTogYW55KTogUHJvcGVydHlDaGFuZ2VSZWNvcmQge1xuXHRsZXQgY2hhbmdlZCA9IGZhbHNlO1xuXG5cdGNvbnN0IHZhbGlkT2xkUHJvcGVydHkgPSBwcmV2aW91c1Byb3BlcnR5ICYmIGlzT2JqZWN0T3JBcnJheShwcmV2aW91c1Byb3BlcnR5KTtcblx0Y29uc3QgdmFsaWROZXdQcm9wZXJ0eSA9IG5ld1Byb3BlcnR5ICYmIGlzT2JqZWN0T3JBcnJheShuZXdQcm9wZXJ0eSk7XG5cblx0aWYgKCF2YWxpZE9sZFByb3BlcnR5IHx8ICF2YWxpZE5ld1Byb3BlcnR5KSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNoYW5nZWQ6IHRydWUsXG5cdFx0XHR2YWx1ZTogbmV3UHJvcGVydHlcblx0XHR9O1xuXHR9XG5cblx0Y29uc3QgcHJldmlvdXNLZXlzID0gT2JqZWN0LmtleXMocHJldmlvdXNQcm9wZXJ0eSk7XG5cdGNvbnN0IG5ld0tleXMgPSBPYmplY3Qua2V5cyhuZXdQcm9wZXJ0eSk7XG5cblx0aWYgKHByZXZpb3VzS2V5cy5sZW5ndGggIT09IG5ld0tleXMubGVuZ3RoKSB7XG5cdFx0Y2hhbmdlZCA9IHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0Y2hhbmdlZCA9IG5ld0tleXMuc29tZSgoa2V5KSA9PiB7XG5cdFx0XHRyZXR1cm4gbmV3UHJvcGVydHlba2V5XSAhPT0gcHJldmlvdXNQcm9wZXJ0eVtrZXldO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0Y2hhbmdlZCxcblx0XHR2YWx1ZTogbmV3UHJvcGVydHlcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1dG8ocHJldmlvdXNQcm9wZXJ0eTogYW55LCBuZXdQcm9wZXJ0eTogYW55KTogUHJvcGVydHlDaGFuZ2VSZWNvcmQge1xuXHRsZXQgcmVzdWx0O1xuXHRpZiAodHlwZW9mIG5ld1Byb3BlcnR5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aWYgKG5ld1Byb3BlcnR5Ll90eXBlID09PSBXSURHRVRfQkFTRV9UWVBFKSB7XG5cdFx0XHRyZXN1bHQgPSByZWZlcmVuY2UocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQgPSBpZ25vcmUocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpO1xuXHRcdH1cblx0fSBlbHNlIGlmIChpc09iamVjdE9yQXJyYXkobmV3UHJvcGVydHkpKSB7XG5cdFx0cmVzdWx0ID0gc2hhbGxvdyhwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG5cdH0gZWxzZSB7XG5cdFx0cmVzdWx0ID0gcmVmZXJlbmNlKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGRpZmYudHMiLCJpbXBvcnQgeyBEZXN0cm95YWJsZSB9IGZyb20gJy4uLy4uL2NvcmUvRGVzdHJveWFibGUnO1xuaW1wb3J0IFNldCBmcm9tICcuLi8uLi9zaGltL1NldCc7XG5pbXBvcnQgeyBXaWRnZXRNZXRhQmFzZSwgV2lkZ2V0TWV0YVByb3BlcnRpZXMsIE5vZGVIYW5kbGVySW50ZXJmYWNlLCBXaWRnZXRCYXNlSW50ZXJmYWNlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBjbGFzcyBCYXNlIGV4dGVuZHMgRGVzdHJveWFibGUgaW1wbGVtZW50cyBXaWRnZXRNZXRhQmFzZSB7XG5cdHByaXZhdGUgX2ludmFsaWRhdGU6ICgpID0+IHZvaWQ7XG5cdHByb3RlY3RlZCBub2RlSGFuZGxlcjogTm9kZUhhbmRsZXJJbnRlcmZhY2U7XG5cblx0cHJpdmF0ZSBfcmVxdWVzdGVkTm9kZUtleXMgPSBuZXcgU2V0PHN0cmluZyB8IG51bWJlcj4oKTtcblxuXHRwcm90ZWN0ZWQgX2JpbmQ6IFdpZGdldEJhc2VJbnRlcmZhY2UgfCB1bmRlZmluZWQ7XG5cblx0Y29uc3RydWN0b3IocHJvcGVydGllczogV2lkZ2V0TWV0YVByb3BlcnRpZXMpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5faW52YWxpZGF0ZSA9IHByb3BlcnRpZXMuaW52YWxpZGF0ZTtcblx0XHR0aGlzLm5vZGVIYW5kbGVyID0gcHJvcGVydGllcy5ub2RlSGFuZGxlcjtcblx0XHRpZiAocHJvcGVydGllcy5iaW5kKSB7XG5cdFx0XHR0aGlzLl9iaW5kID0gcHJvcGVydGllcy5iaW5kO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBoYXMoa2V5OiBzdHJpbmcgfCBudW1iZXIpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5ub2RlSGFuZGxlci5oYXMoa2V5KTtcblx0fVxuXG5cdHByb3RlY3RlZCBnZXROb2RlKGtleTogc3RyaW5nIHwgbnVtYmVyKTogRWxlbWVudCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3Qgc3RyaW5nS2V5ID0gYCR7a2V5fWA7XG5cdFx0Y29uc3Qgbm9kZSA9IHRoaXMubm9kZUhhbmRsZXIuZ2V0KHN0cmluZ0tleSk7XG5cblx0XHRpZiAoIW5vZGUgJiYgIXRoaXMuX3JlcXVlc3RlZE5vZGVLZXlzLmhhcyhzdHJpbmdLZXkpKSB7XG5cdFx0XHRjb25zdCBoYW5kbGUgPSB0aGlzLm5vZGVIYW5kbGVyLm9uKHN0cmluZ0tleSwgKCkgPT4ge1xuXHRcdFx0XHRoYW5kbGUuZGVzdHJveSgpO1xuXHRcdFx0XHR0aGlzLl9yZXF1ZXN0ZWROb2RlS2V5cy5kZWxldGUoc3RyaW5nS2V5KTtcblx0XHRcdFx0dGhpcy5pbnZhbGlkYXRlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5vd24oaGFuZGxlKTtcblx0XHRcdHRoaXMuX3JlcXVlc3RlZE5vZGVLZXlzLmFkZChzdHJpbmdLZXkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBub2RlO1xuXHR9XG5cblx0cHJvdGVjdGVkIGludmFsaWRhdGUoKTogdm9pZCB7XG5cdFx0dGhpcy5faW52YWxpZGF0ZSgpO1xuXHR9XG5cblx0cHVibGljIGFmdGVyUmVuZGVyKCk6IHZvaWQge1xuXHRcdC8vIERvIG5vdGhpbmcgYnkgZGVmYXVsdC5cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIEJhc2UudHMiLCJpbXBvcnQgeyBDb25zdHJ1Y3RvciB9IGZyb20gJy4vLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnLi8uLi9XaWRnZXRCYXNlJztcbmltcG9ydCB7IGRpZmZQcm9wZXJ0eSB9IGZyb20gJy4vLi4vZGVjb3JhdG9ycy9kaWZmUHJvcGVydHknO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZvY3VzUHJvcGVydGllcyB7XG5cdGZvY3VzPzogKCgpID0+IGJvb2xlYW4pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZvY3VzTWl4aW4ge1xuXHRmb2N1czogKCkgPT4gdm9pZDtcblx0c2hvdWxkRm9jdXM6ICgpID0+IGJvb2xlYW47XG5cdHByb3BlcnRpZXM6IEZvY3VzUHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gZGlmZkZvY3VzKHByZXZpb3VzUHJvcGVydHk6IEZ1bmN0aW9uLCBuZXdQcm9wZXJ0eTogRnVuY3Rpb24pIHtcblx0Y29uc3QgcmVzdWx0ID0gbmV3UHJvcGVydHkgJiYgbmV3UHJvcGVydHkoKTtcblx0cmV0dXJuIHtcblx0XHRjaGFuZ2VkOiByZXN1bHQsXG5cdFx0dmFsdWU6IG5ld1Byb3BlcnR5XG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGb2N1c01peGluPFQgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxXaWRnZXRCYXNlPEZvY3VzUHJvcGVydGllcz4+PihCYXNlOiBUKTogVCAmIENvbnN0cnVjdG9yPEZvY3VzTWl4aW4+IHtcblx0YWJzdHJhY3QgY2xhc3MgRm9jdXMgZXh0ZW5kcyBCYXNlIHtcblx0XHRwdWJsaWMgYWJzdHJhY3QgcHJvcGVydGllczogRm9jdXNQcm9wZXJ0aWVzO1xuXG5cdFx0cHJpdmF0ZSBfY3VycmVudFRva2VuID0gMDtcblxuXHRcdHByaXZhdGUgX3ByZXZpb3VzVG9rZW4gPSAwO1xuXG5cdFx0QGRpZmZQcm9wZXJ0eSgnZm9jdXMnLCBkaWZmRm9jdXMpXG5cdFx0cHJvdGVjdGVkIGlzRm9jdXNlZFJlYWN0aW9uKCkge1xuXHRcdFx0dGhpcy5fY3VycmVudFRva2VuKys7XG5cdFx0fVxuXG5cdFx0cHVibGljIHNob3VsZEZvY3VzID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gdGhpcy5fY3VycmVudFRva2VuICE9PSB0aGlzLl9wcmV2aW91c1Rva2VuO1xuXHRcdFx0dGhpcy5fcHJldmlvdXNUb2tlbiA9IHRoaXMuX2N1cnJlbnRUb2tlbjtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fTtcblxuXHRcdHB1YmxpYyBmb2N1cygpIHtcblx0XHRcdHRoaXMuX2N1cnJlbnRUb2tlbisrO1xuXHRcdFx0dGhpcy5pbnZhbGlkYXRlKCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBGb2N1cztcbn1cblxuZXhwb3J0IGRlZmF1bHQgRm9jdXNNaXhpbjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBGb2N1cy50cyIsImltcG9ydCB7IEJhc2UgfSBmcm9tICcuL0Jhc2UnO1xuaW1wb3J0IE1hcCBmcm9tICcuLi8uLi9zaGltL01hcCc7XG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4uLy4uL3NoaW0vZ2xvYmFsJztcblxuLyoqXG4gKiBBbmltYXRpb24gY29udHJvbHMgYXJlIHVzZWQgdG8gY29udHJvbCB0aGUgd2ViIGFuaW1hdGlvbiB0aGF0IGhhcyBiZWVuIGFwcGxpZWRcbiAqIHRvIGEgdmRvbSBub2RlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkNvbnRyb2xzIHtcblx0cGxheT86IGJvb2xlYW47XG5cdG9uRmluaXNoPzogKCkgPT4gdm9pZDtcblx0b25DYW5jZWw/OiAoKSA9PiB2b2lkO1xuXHRyZXZlcnNlPzogYm9vbGVhbjtcblx0Y2FuY2VsPzogYm9vbGVhbjtcblx0ZmluaXNoPzogYm9vbGVhbjtcblx0cGxheWJhY2tSYXRlPzogbnVtYmVyO1xuXHRzdGFydFRpbWU/OiBudW1iZXI7XG5cdGN1cnJlbnRUaW1lPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEFuaW1hdGlvbiB0aW1pbmcgcHJvcGVydGllcyBwYXNzZWQgdG8gYSBuZXcgS2V5ZnJhbWVFZmZlY3QuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVGltaW5nUHJvcGVydGllcyB7XG5cdGR1cmF0aW9uPzogbnVtYmVyO1xuXHRkZWxheT86IG51bWJlcjtcblx0ZGlyZWN0aW9uPzogJ25vcm1hbCcgfCAncmV2ZXJzZScgfCAnYWx0ZXJuYXRlJyB8ICdhbHRlcm5hdGUtcmV2ZXJzZSc7XG5cdGVhc2luZz86IHN0cmluZztcblx0ZW5kRGVsYXk/OiBudW1iZXI7XG5cdGZpbGw/OiAnbm9uZScgfCAnZm9yd2FyZHMnIHwgJ2JhY2t3YXJkcycgfCAnYm90aCcgfCAnYXV0byc7XG5cdGl0ZXJhdGlvbnM/OiBudW1iZXI7XG5cdGl0ZXJhdGlvblN0YXJ0PzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbktleUZyYW1lIHtcblx0ZWFzaW5nPzogc3RyaW5nIHwgc3RyaW5nW107XG5cdG9mZnNldD86IG51bWJlciB8IEFycmF5PG51bWJlciB8IG51bGw+IHwgbnVsbDtcblx0b3BhY2l0eT86IG51bWJlciB8IG51bWJlcltdO1xuXHR0cmFuc2Zvcm0/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBBbmltYXRpb24gcHJvcGVydGl1ZXMgdGhhdCBjYW4gYmUgcGFzc2VkIGFzIHZkb20gcHJvcGVydHkgYGFuaW1hdGVgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUHJvcGVydGllcyB7XG5cdGlkOiBzdHJpbmc7XG5cdGVmZmVjdHM6ICgoKSA9PiBBbmltYXRpb25LZXlGcmFtZSB8IEFuaW1hdGlvbktleUZyYW1lW10pIHwgQW5pbWF0aW9uS2V5RnJhbWUgfCBBbmltYXRpb25LZXlGcmFtZVtdO1xuXHRjb250cm9scz86IEFuaW1hdGlvbkNvbnRyb2xzO1xuXHR0aW1pbmc/OiBBbmltYXRpb25UaW1pbmdQcm9wZXJ0aWVzO1xufVxuXG5leHBvcnQgdHlwZSBBbmltYXRpb25Qcm9wZXJ0aWVzRnVuY3Rpb24gPSAoKSA9PiBBbmltYXRpb25Qcm9wZXJ0aWVzO1xuXG4vKipcbiAqIEluZm8gcmV0dXJuZWQgYnkgdGhlIGBnZXRgIGZ1bmN0aW9uIG9uIFdlYkFuaW1hdGlvbiBtZXRhXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uSW5mbyB7XG5cdGN1cnJlbnRUaW1lOiBudW1iZXI7XG5cdHBsYXlTdGF0ZTogJ2lkbGUnIHwgJ3BlbmRpbmcnIHwgJ3J1bm5pbmcnIHwgJ3BhdXNlZCcgfCAnZmluaXNoZWQnO1xuXHRwbGF5YmFja1JhdGU6IG51bWJlcjtcblx0c3RhcnRUaW1lOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUGxheWVyIHtcblx0cGxheWVyOiBhbnk7XG5cdHVzZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJBbmltYXRpb25zIGV4dGVuZHMgQmFzZSB7XG5cdHByaXZhdGUgX2FuaW1hdGlvbk1hcCA9IG5ldyBNYXA8c3RyaW5nLCBBbmltYXRpb25QbGF5ZXI+KCk7XG5cblx0cHJpdmF0ZSBfY3JlYXRlUGxheWVyKG5vZGU6IEhUTUxFbGVtZW50LCBwcm9wZXJ0aWVzOiBBbmltYXRpb25Qcm9wZXJ0aWVzKTogYW55IHtcblx0XHRjb25zdCB7IGVmZmVjdHMsIHRpbWluZyA9IHt9IH0gPSBwcm9wZXJ0aWVzO1xuXG5cdFx0Y29uc3QgZnggPSB0eXBlb2YgZWZmZWN0cyA9PT0gJ2Z1bmN0aW9uJyA/IGVmZmVjdHMoKSA6IGVmZmVjdHM7XG5cblx0XHRjb25zdCBrZXlmcmFtZUVmZmVjdCA9IG5ldyBnbG9iYWwuS2V5ZnJhbWVFZmZlY3Qobm9kZSwgZngsIHRpbWluZyk7XG5cblx0XHRyZXR1cm4gbmV3IGdsb2JhbC5BbmltYXRpb24oa2V5ZnJhbWVFZmZlY3QsIGdsb2JhbC5kb2N1bWVudC50aW1lbGluZSk7XG5cdH1cblxuXHRwcml2YXRlIF91cGRhdGVQbGF5ZXIocGxheWVyOiBhbnksIGNvbnRyb2xzOiBBbmltYXRpb25Db250cm9scykge1xuXHRcdGNvbnN0IHsgcGxheSwgcmV2ZXJzZSwgY2FuY2VsLCBmaW5pc2gsIG9uRmluaXNoLCBvbkNhbmNlbCwgcGxheWJhY2tSYXRlLCBzdGFydFRpbWUsIGN1cnJlbnRUaW1lIH0gPSBjb250cm9scztcblxuXHRcdGlmIChwbGF5YmFja1JhdGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGxheWVyLnBsYXliYWNrUmF0ZSA9IHBsYXliYWNrUmF0ZTtcblx0XHR9XG5cblx0XHRpZiAocmV2ZXJzZSkge1xuXHRcdFx0cGxheWVyLnJldmVyc2UoKTtcblx0XHR9XG5cblx0XHRpZiAoY2FuY2VsKSB7XG5cdFx0XHRwbGF5ZXIuY2FuY2VsKCk7XG5cdFx0fVxuXG5cdFx0aWYgKGZpbmlzaCkge1xuXHRcdFx0cGxheWVyLmZpbmlzaCgpO1xuXHRcdH1cblxuXHRcdGlmIChzdGFydFRpbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGxheWVyLnN0YXJ0VGltZSA9IHN0YXJ0VGltZTtcblx0XHR9XG5cblx0XHRpZiAoY3VycmVudFRpbWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGxheWVyLmN1cnJlbnRUaW1lID0gY3VycmVudFRpbWU7XG5cdFx0fVxuXG5cdFx0aWYgKHBsYXkpIHtcblx0XHRcdHBsYXllci5wbGF5KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBsYXllci5wYXVzZSgpO1xuXHRcdH1cblxuXHRcdGlmIChvbkZpbmlzaCkge1xuXHRcdFx0cGxheWVyLm9uZmluaXNoID0gb25GaW5pc2guYmluZCh0aGlzLl9iaW5kKTtcblx0XHR9XG5cblx0XHRpZiAob25DYW5jZWwpIHtcblx0XHRcdHBsYXllci5vbmNhbmNlbCA9IG9uQ2FuY2VsLmJpbmQodGhpcy5fYmluZCk7XG5cdFx0fVxuXHR9XG5cblx0YW5pbWF0ZShcblx0XHRrZXk6IHN0cmluZyxcblx0XHRhbmltYXRlUHJvcGVydGllczpcblx0XHRcdHwgQW5pbWF0aW9uUHJvcGVydGllc1xuXHRcdFx0fCBBbmltYXRpb25Qcm9wZXJ0aWVzRnVuY3Rpb25cblx0XHRcdHwgKEFuaW1hdGlvblByb3BlcnRpZXMgfCBBbmltYXRpb25Qcm9wZXJ0aWVzRnVuY3Rpb24pW11cblx0KSB7XG5cdFx0Y29uc3Qgbm9kZSA9IHRoaXMuZ2V0Tm9kZShrZXkpIGFzIEhUTUxFbGVtZW50O1xuXG5cdFx0aWYgKG5vZGUpIHtcblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShhbmltYXRlUHJvcGVydGllcykpIHtcblx0XHRcdFx0YW5pbWF0ZVByb3BlcnRpZXMgPSBbYW5pbWF0ZVByb3BlcnRpZXNdO1xuXHRcdFx0fVxuXHRcdFx0YW5pbWF0ZVByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydGllcykgPT4ge1xuXHRcdFx0XHRwcm9wZXJ0aWVzID0gdHlwZW9mIHByb3BlcnRpZXMgPT09ICdmdW5jdGlvbicgPyBwcm9wZXJ0aWVzKCkgOiBwcm9wZXJ0aWVzO1xuXG5cdFx0XHRcdGlmIChwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBpZCB9ID0gcHJvcGVydGllcztcblx0XHRcdFx0XHRpZiAoIXRoaXMuX2FuaW1hdGlvbk1hcC5oYXMoaWQpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9hbmltYXRpb25NYXAuc2V0KGlkLCB7XG5cdFx0XHRcdFx0XHRcdHBsYXllcjogdGhpcy5fY3JlYXRlUGxheWVyKG5vZGUsIHByb3BlcnRpZXMpLFxuXHRcdFx0XHRcdFx0XHR1c2VkOiB0cnVlXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBhbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25NYXAuZ2V0KGlkKTtcblx0XHRcdFx0XHRjb25zdCB7IGNvbnRyb2xzID0ge30gfSA9IHByb3BlcnRpZXM7XG5cblx0XHRcdFx0XHRpZiAoYW5pbWF0aW9uKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVQbGF5ZXIoYW5pbWF0aW9uLnBsYXllciwgY29udHJvbHMpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLl9hbmltYXRpb25NYXAuc2V0KGlkLCB7XG5cdFx0XHRcdFx0XHRcdHBsYXllcjogYW5pbWF0aW9uLnBsYXllcixcblx0XHRcdFx0XHRcdFx0dXNlZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRnZXQoaWQ6IHN0cmluZyk6IFJlYWRvbmx5PEFuaW1hdGlvbkluZm8+IHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBhbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25NYXAuZ2V0KGlkKTtcblx0XHRpZiAoYW5pbWF0aW9uKSB7XG5cdFx0XHRjb25zdCB7IGN1cnJlbnRUaW1lLCBwbGF5U3RhdGUsIHBsYXliYWNrUmF0ZSwgc3RhcnRUaW1lIH0gPSBhbmltYXRpb24ucGxheWVyO1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRjdXJyZW50VGltZTogY3VycmVudFRpbWUgfHwgMCxcblx0XHRcdFx0cGxheVN0YXRlLFxuXHRcdFx0XHRwbGF5YmFja1JhdGUsXG5cdFx0XHRcdHN0YXJ0VGltZTogc3RhcnRUaW1lIHx8IDBcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0YWZ0ZXJSZW5kZXIoKSB7XG5cdFx0dGhpcy5fYW5pbWF0aW9uTWFwLmZvckVhY2goKGFuaW1hdGlvbiwga2V5KSA9PiB7XG5cdFx0XHRpZiAoIWFuaW1hdGlvbi51c2VkKSB7XG5cdFx0XHRcdGFuaW1hdGlvbi5wbGF5ZXIuY2FuY2VsKCk7XG5cdFx0XHRcdHRoaXMuX2FuaW1hdGlvbk1hcC5kZWxldGUoa2V5KTtcblx0XHRcdH1cblx0XHRcdGFuaW1hdGlvbi51c2VkID0gZmFsc2U7XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2ViQW5pbWF0aW9ucztcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBXZWJBbmltYXRpb24udHMiLCJpbXBvcnQgeyBDb25zdHJ1Y3RvciwgV2lkZ2V0UHJvcGVydGllcywgU3VwcG9ydGVkQ2xhc3NOYW1lIH0gZnJvbSAnLi8uLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFJlZ2lzdHJ5IH0gZnJvbSAnLi8uLi9SZWdpc3RyeSc7XG5pbXBvcnQgeyBJbmplY3RvciB9IGZyb20gJy4vLi4vSW5qZWN0b3InO1xuaW1wb3J0IHsgaW5qZWN0IH0gZnJvbSAnLi8uLi9kZWNvcmF0b3JzL2luamVjdCc7XG5pbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnLi8uLi9XaWRnZXRCYXNlJztcbmltcG9ydCB7IGhhbmRsZURlY29yYXRvciB9IGZyb20gJy4vLi4vZGVjb3JhdG9ycy9oYW5kbGVEZWNvcmF0b3InO1xuaW1wb3J0IHsgZGlmZlByb3BlcnR5IH0gZnJvbSAnLi8uLi9kZWNvcmF0b3JzL2RpZmZQcm9wZXJ0eSc7XG5pbXBvcnQgeyBzaGFsbG93IH0gZnJvbSAnLi8uLi9kaWZmJztcblxuLyoqXG4gKiBBIGxvb2t1cCBvYmplY3QgZm9yIGF2YWlsYWJsZSBjbGFzcyBuYW1lc1xuICovXG5leHBvcnQgdHlwZSBDbGFzc05hbWVzID0ge1xuXHRba2V5OiBzdHJpbmddOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgbG9va3VwIG9iamVjdCBmb3IgYXZhaWxhYmxlIHdpZGdldCBjbGFzc2VzIG5hbWVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGhlbWUge1xuXHRba2V5OiBzdHJpbmddOiBvYmplY3Q7XG59XG5cbi8qKlxuICogUHJvcGVydGllcyByZXF1aXJlZCBmb3IgdGhlIFRoZW1lZCBtaXhpblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lZFByb3BlcnRpZXM8VCA9IENsYXNzTmFtZXM+IGV4dGVuZHMgV2lkZ2V0UHJvcGVydGllcyB7XG5cdHRoZW1lPzogVGhlbWU7XG5cdGV4dHJhQ2xhc3Nlcz86IHsgW1AgaW4ga2V5b2YgVF0/OiBzdHJpbmcgfTtcbn1cblxuY29uc3QgVEhFTUVfS0VZID0gJyBfa2V5JztcblxuZXhwb3J0IGNvbnN0IElOSkVDVEVEX1RIRU1FX0tFWSA9ICdfX3RoZW1lX2luamVjdG9yJztcblxuLyoqXG4gKiBJbnRlcmZhY2UgZm9yIHRoZSBUaGVtZWRNaXhpblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lZE1peGluPFQgPSBDbGFzc05hbWVzPiB7XG5cdHRoZW1lKGNsYXNzZXM6IFN1cHBvcnRlZENsYXNzTmFtZSk6IFN1cHBvcnRlZENsYXNzTmFtZTtcblx0dGhlbWUoY2xhc3NlczogU3VwcG9ydGVkQ2xhc3NOYW1lW10pOiBTdXBwb3J0ZWRDbGFzc05hbWVbXTtcblx0cHJvcGVydGllczogVGhlbWVkUHJvcGVydGllczxUPjtcbn1cblxuLyoqXG4gKiBEZWNvcmF0b3IgZm9yIGJhc2UgY3NzIGNsYXNzZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRoZW1lKHRoZW1lOiB7fSkge1xuXHRyZXR1cm4gaGFuZGxlRGVjb3JhdG9yKCh0YXJnZXQpID0+IHtcblx0XHR0YXJnZXQuYWRkRGVjb3JhdG9yKCdiYXNlVGhlbWVDbGFzc2VzJywgdGhlbWUpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcmV2ZXJzZSBsb29rdXAgZm9yIHRoZSBjbGFzc2VzIHBhc3NlZCBpbiB2aWEgdGhlIGB0aGVtZWAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGNsYXNzZXMgVGhlIGJhc2VDbGFzc2VzIG9iamVjdFxuICogQHJlcXVpcmVzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRoZW1lQ2xhc3Nlc0xvb2t1cChjbGFzc2VzOiBDbGFzc05hbWVzW10pOiBDbGFzc05hbWVzIHtcblx0cmV0dXJuIGNsYXNzZXMucmVkdWNlKFxuXHRcdChjdXJyZW50Q2xhc3NOYW1lcywgYmFzZUNsYXNzKSA9PiB7XG5cdFx0XHRPYmplY3Qua2V5cyhiYXNlQ2xhc3MpLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRDbGFzc05hbWVzW2Jhc2VDbGFzc1trZXldXSA9IGtleTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGN1cnJlbnRDbGFzc05hbWVzO1xuXHRcdH0sXG5cdFx0PENsYXNzTmFtZXM+e31cblx0KTtcbn1cblxuLyoqXG4gKiBDb252ZW5pZW5jZSBmdW5jdGlvbiB0aGF0IGlzIGdpdmVuIGEgdGhlbWUgYW5kIGFuIG9wdGlvbmFsIHJlZ2lzdHJ5LCB0aGUgdGhlbWVcbiAqIGluamVjdG9yIGlzIGRlZmluZWQgYWdhaW5zdCB0aGUgcmVnaXN0cnksIHJldHVybmluZyB0aGUgdGhlbWUuXG4gKlxuICogQHBhcmFtIHRoZW1lIHRoZSB0aGVtZSB0byBzZXRcbiAqIEBwYXJhbSB0aGVtZVJlZ2lzdHJ5IHJlZ2lzdHJ5IHRvIGRlZmluZSB0aGUgdGhlbWUgaW5qZWN0b3IgYWdhaW5zdC4gRGVmYXVsdHNcbiAqIHRvIHRoZSBnbG9iYWwgcmVnaXN0cnlcbiAqXG4gKiBAcmV0dXJucyB0aGUgdGhlbWUgaW5qZWN0b3IgdXNlZCB0byBzZXQgdGhlIHRoZW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclRoZW1lSW5qZWN0b3IodGhlbWU6IGFueSwgdGhlbWVSZWdpc3RyeTogUmVnaXN0cnkpOiBJbmplY3RvciB7XG5cdGNvbnN0IHRoZW1lSW5qZWN0b3IgPSBuZXcgSW5qZWN0b3IodGhlbWUpO1xuXHR0aGVtZVJlZ2lzdHJ5LmRlZmluZUluamVjdG9yKElOSkVDVEVEX1RIRU1FX0tFWSwgKGludmFsaWRhdG9yKSA9PiB7XG5cdFx0dGhlbWVJbmplY3Rvci5zZXRJbnZhbGlkYXRvcihpbnZhbGlkYXRvcik7XG5cdFx0cmV0dXJuICgpID0+IHRoZW1lSW5qZWN0b3IuZ2V0KCk7XG5cdH0pO1xuXHRyZXR1cm4gdGhlbWVJbmplY3Rvcjtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgYSBjbGFzcyBkZWNvcmF0ZWQgd2l0aCB3aXRoIFRoZW1lZCBmdW5jdGlvbmFsaXR5XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIFRoZW1lZE1peGluPEUsIFQgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxXaWRnZXRCYXNlPFRoZW1lZFByb3BlcnRpZXM8RT4+Pj4oXG5cdEJhc2U6IFRcbik6IENvbnN0cnVjdG9yPFRoZW1lZE1peGluPEU+PiAmIFQge1xuXHRAaW5qZWN0KHtcblx0XHRuYW1lOiBJTkpFQ1RFRF9USEVNRV9LRVksXG5cdFx0Z2V0UHJvcGVydGllczogKHRoZW1lOiBUaGVtZSwgcHJvcGVydGllczogVGhlbWVkUHJvcGVydGllcyk6IFRoZW1lZFByb3BlcnRpZXMgPT4ge1xuXHRcdFx0aWYgKCFwcm9wZXJ0aWVzLnRoZW1lKSB7XG5cdFx0XHRcdHJldHVybiB7IHRoZW1lIH07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fVxuXHR9KVxuXHRhYnN0cmFjdCBjbGFzcyBUaGVtZWQgZXh0ZW5kcyBCYXNlIHtcblx0XHRwdWJsaWMgYWJzdHJhY3QgcHJvcGVydGllczogVGhlbWVkUHJvcGVydGllczxFPjtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBUaGVtZWQgYmFzZUNsYXNzZXNcblx0XHQgKi9cblx0XHRwcml2YXRlIF9yZWdpc3RlcmVkQmFzZVRoZW1lOiBDbGFzc05hbWVzIHwgdW5kZWZpbmVkO1xuXG5cdFx0LyoqXG5cdFx0ICogUmVnaXN0ZXJlZCBiYXNlIHRoZW1lIGtleXNcblx0XHQgKi9cblx0XHRwcml2YXRlIF9yZWdpc3RlcmVkQmFzZVRoZW1lS2V5czogc3RyaW5nW10gPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIFJldmVyc2UgbG9va3VwIG9mIHRoZSB0aGVtZSBjbGFzc2VzXG5cdFx0ICovXG5cdFx0cHJpdmF0ZSBfYmFzZVRoZW1lQ2xhc3Nlc1JldmVyc2VMb29rdXA6IENsYXNzTmFtZXMgfCB1bmRlZmluZWQ7XG5cblx0XHQvKipcblx0XHQgKiBJbmRpY2F0ZXMgaWYgY2xhc3NlcyBtZXRhIGRhdGEgbmVlZCB0byBiZSBjYWxjdWxhdGVkLlxuXHRcdCAqL1xuXHRcdHByaXZhdGUgX3JlY2FsY3VsYXRlQ2xhc3NlcyA9IHRydWU7XG5cblx0XHQvKipcblx0XHQgKiBMb2FkZWQgdGhlbWVcblx0XHQgKi9cblx0XHRwcml2YXRlIF90aGVtZTogQ2xhc3NOYW1lcyA9IHt9O1xuXG5cdFx0cHVibGljIHRoZW1lKGNsYXNzZXM6IFN1cHBvcnRlZENsYXNzTmFtZSk6IFN1cHBvcnRlZENsYXNzTmFtZTtcblx0XHRwdWJsaWMgdGhlbWUoY2xhc3NlczogU3VwcG9ydGVkQ2xhc3NOYW1lW10pOiBTdXBwb3J0ZWRDbGFzc05hbWVbXTtcblx0XHRwdWJsaWMgdGhlbWUoY2xhc3NlczogU3VwcG9ydGVkQ2xhc3NOYW1lIHwgU3VwcG9ydGVkQ2xhc3NOYW1lW10pOiBTdXBwb3J0ZWRDbGFzc05hbWUgfCBTdXBwb3J0ZWRDbGFzc05hbWVbXSB7XG5cdFx0XHRpZiAodGhpcy5fcmVjYWxjdWxhdGVDbGFzc2VzKSB7XG5cdFx0XHRcdHRoaXMuX3JlY2FsY3VsYXRlVGhlbWVDbGFzc2VzKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjbGFzc2VzKSkge1xuXHRcdFx0XHRyZXR1cm4gY2xhc3Nlcy5tYXAoKGNsYXNzTmFtZSkgPT4gdGhpcy5fZ2V0VGhlbWVDbGFzcyhjbGFzc05hbWUpKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLl9nZXRUaGVtZUNsYXNzKGNsYXNzZXMpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZpcmVkIHdoZW4gYHRoZW1lYCBvciBgZXh0cmFDbGFzc2VzYCBhcmUgY2hhbmdlZC5cblx0XHQgKi9cblx0XHRAZGlmZlByb3BlcnR5KCd0aGVtZScsIHNoYWxsb3cpXG5cdFx0QGRpZmZQcm9wZXJ0eSgnZXh0cmFDbGFzc2VzJywgc2hhbGxvdylcblx0XHRwcm90ZWN0ZWQgb25Qcm9wZXJ0aWVzQ2hhbmdlZCgpIHtcblx0XHRcdHRoaXMuX3JlY2FsY3VsYXRlQ2xhc3NlcyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfZ2V0VGhlbWVDbGFzcyhjbGFzc05hbWU6IFN1cHBvcnRlZENsYXNzTmFtZSk6IFN1cHBvcnRlZENsYXNzTmFtZSB7XG5cdFx0XHRpZiAoY2xhc3NOYW1lID09PSB1bmRlZmluZWQgfHwgY2xhc3NOYW1lID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBjbGFzc05hbWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGV4dHJhQ2xhc3NlcyA9IHRoaXMucHJvcGVydGllcy5leHRyYUNsYXNzZXMgfHwgKHt9IGFzIGFueSk7XG5cdFx0XHRjb25zdCB0aGVtZUNsYXNzTmFtZSA9IHRoaXMuX2Jhc2VUaGVtZUNsYXNzZXNSZXZlcnNlTG9va3VwIVtjbGFzc05hbWVdO1xuXHRcdFx0bGV0IHJlc3VsdENsYXNzTmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRpZiAoIXRoZW1lQ2xhc3NOYW1lKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgQ2xhc3MgbmFtZTogJyR7Y2xhc3NOYW1lfScgbm90IGZvdW5kIGluIHRoZW1lYCk7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZXh0cmFDbGFzc2VzW3RoZW1lQ2xhc3NOYW1lXSkge1xuXHRcdFx0XHRyZXN1bHRDbGFzc05hbWVzLnB1c2goZXh0cmFDbGFzc2VzW3RoZW1lQ2xhc3NOYW1lXSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLl90aGVtZVt0aGVtZUNsYXNzTmFtZV0pIHtcblx0XHRcdFx0cmVzdWx0Q2xhc3NOYW1lcy5wdXNoKHRoaXMuX3RoZW1lW3RoZW1lQ2xhc3NOYW1lXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHRDbGFzc05hbWVzLnB1c2godGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZSFbdGhlbWVDbGFzc05hbWVdKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHRDbGFzc05hbWVzLmpvaW4oJyAnKTtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9yZWNhbGN1bGF0ZVRoZW1lQ2xhc3NlcygpIHtcblx0XHRcdGNvbnN0IHsgdGhlbWUgPSB7fSB9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuXHRcdFx0aWYgKCF0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lKSB7XG5cdFx0XHRcdGNvbnN0IGJhc2VUaGVtZXMgPSB0aGlzLmdldERlY29yYXRvcignYmFzZVRoZW1lQ2xhc3NlcycpO1xuXHRcdFx0XHRpZiAoYmFzZVRoZW1lcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdFx0XHQnQSBiYXNlIHRoZW1lIGhhcyBub3QgYmVlbiBwcm92aWRlZCB0byB0aGlzIHdpZGdldC4gUGxlYXNlIHVzZSB0aGUgQHRoZW1lIGRlY29yYXRvciB0byBhZGQgYSB0aGVtZS4nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lID0gYmFzZVRoZW1lcy5yZWR1Y2UoKGZpbmFsQmFzZVRoZW1lLCBiYXNlVGhlbWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCB7IFtUSEVNRV9LRVldOiBrZXksIC4uLmNsYXNzZXMgfSA9IGJhc2VUaGVtZTtcblx0XHRcdFx0XHR0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lS2V5cy5wdXNoKGtleSk7XG5cdFx0XHRcdFx0cmV0dXJuIHsgLi4uZmluYWxCYXNlVGhlbWUsIC4uLmNsYXNzZXMgfTtcblx0XHRcdFx0fSwge30pO1xuXHRcdFx0XHR0aGlzLl9iYXNlVGhlbWVDbGFzc2VzUmV2ZXJzZUxvb2t1cCA9IGNyZWF0ZVRoZW1lQ2xhc3Nlc0xvb2t1cChiYXNlVGhlbWVzKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fdGhlbWUgPSB0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lS2V5cy5yZWR1Y2UoKGJhc2VUaGVtZSwgdGhlbWVLZXkpID0+IHtcblx0XHRcdFx0cmV0dXJuIHsgLi4uYmFzZVRoZW1lLCAuLi50aGVtZVt0aGVtZUtleV0gfTtcblx0XHRcdH0sIHt9KTtcblxuXHRcdFx0dGhpcy5fcmVjYWxjdWxhdGVDbGFzc2VzID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIFRoZW1lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGhlbWVkTWl4aW47XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gVGhlbWVkLnRzIiwiaW1wb3J0IHsgV2lkZ2V0QmFzZSwgbm9CaW5kIH0gZnJvbSAnLi9XaWRnZXRCYXNlJztcbmltcG9ydCB7IHJlbmRlcmVyIH0gZnJvbSAnLi92ZG9tJztcbmltcG9ydCB7IGZyb20gfSBmcm9tICcuLi9zaGltL2FycmF5JztcbmltcG9ydCB7IHcsIGRvbSB9IGZyb20gJy4vZCc7XG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4uL3NoaW0vZ2xvYmFsJztcbmltcG9ydCB7IHJlZ2lzdGVyVGhlbWVJbmplY3RvciB9IGZyb20gJy4vbWl4aW5zL1RoZW1lZCc7XG5pbXBvcnQgeyBhbHdheXNSZW5kZXIgfSBmcm9tICcuL2RlY29yYXRvcnMvYWx3YXlzUmVuZGVyJztcblxuZXhwb3J0IGVudW0gQ3VzdG9tRWxlbWVudENoaWxkVHlwZSB7XG5cdERPSk8gPSAnRE9KTycsXG5cdE5PREUgPSAnTk9ERScsXG5cdFRFWFQgPSAnVEVYVCdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERvbVRvV2lkZ2V0V3JhcHBlcihkb21Ob2RlOiBIVE1MRWxlbWVudCk6IGFueSB7XG5cdEBhbHdheXNSZW5kZXIoKVxuXHRjbGFzcyBEb21Ub1dpZGdldFdyYXBwZXIgZXh0ZW5kcyBXaWRnZXRCYXNlPGFueT4ge1xuXHRcdHByb3RlY3RlZCByZW5kZXIoKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmtleXModGhpcy5wcm9wZXJ0aWVzKS5yZWR1Y2UoXG5cdFx0XHRcdChwcm9wcywga2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IHRoaXMucHJvcGVydGllc1trZXldO1xuXHRcdFx0XHRcdGlmIChrZXkuaW5kZXhPZignb24nKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0a2V5ID0gYF9fJHtrZXl9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cHJvcHNba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybiBwcm9wcztcblx0XHRcdFx0fSxcblx0XHRcdFx0e30gYXMgYW55XG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIGRvbSh7IG5vZGU6IGRvbU5vZGUsIHByb3BzOiBwcm9wZXJ0aWVzLCBkaWZmVHlwZTogJ2RvbScgfSk7XG5cdFx0fVxuXG5cdFx0c3RhdGljIGdldCBkb21Ob2RlKCkge1xuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIERvbVRvV2lkZ2V0V3JhcHBlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZShkZXNjcmlwdG9yOiBhbnksIFdpZGdldENvbnN0cnVjdG9yOiBhbnkpOiBhbnkge1xuXHRjb25zdCB7IGF0dHJpYnV0ZXMsIGNoaWxkVHlwZSwgcmVnaXN0cnlGYWN0b3J5IH0gPSBkZXNjcmlwdG9yO1xuXHRjb25zdCBhdHRyaWJ1dGVNYXA6IGFueSA9IHt9O1xuXG5cdGF0dHJpYnV0ZXMuZm9yRWFjaCgocHJvcGVydHlOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRjb25zdCBhdHRyaWJ1dGVOYW1lID0gcHJvcGVydHlOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0YXR0cmlidXRlTWFwW2F0dHJpYnV0ZU5hbWVdID0gcHJvcGVydHlOYW1lO1xuXHR9KTtcblxuXHRyZXR1cm4gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cdFx0cHJpdmF0ZSBfcmVuZGVyZXI6IGFueTtcblx0XHRwcml2YXRlIF9wcm9wZXJ0aWVzOiBhbnkgPSB7fTtcblx0XHRwcml2YXRlIF9jaGlsZHJlbjogYW55W10gPSBbXTtcblx0XHRwcml2YXRlIF9ldmVudFByb3BlcnRpZXM6IGFueSA9IHt9O1xuXHRcdHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG5cblx0XHRwdWJsaWMgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG5cdFx0XHRpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBkb21Qcm9wZXJ0aWVzOiBhbnkgPSB7fTtcblx0XHRcdGNvbnN0IHsgYXR0cmlidXRlcywgcHJvcGVydGllcywgZXZlbnRzIH0gPSBkZXNjcmlwdG9yO1xuXG5cdFx0XHR0aGlzLl9wcm9wZXJ0aWVzID0geyAuLi50aGlzLl9wcm9wZXJ0aWVzLCAuLi50aGlzLl9hdHRyaWJ1dGVzVG9Qcm9wZXJ0aWVzKGF0dHJpYnV0ZXMpIH07XG5cblx0XHRcdFsuLi5hdHRyaWJ1dGVzLCAuLi5wcm9wZXJ0aWVzXS5mb3JFYWNoKChwcm9wZXJ0eU5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9ICh0aGlzIGFzIGFueSlbcHJvcGVydHlOYW1lXTtcblx0XHRcdFx0Y29uc3QgZmlsdGVyZWRQcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWUucmVwbGFjZSgvXm9uLywgJ19fJyk7XG5cdFx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhpcy5fcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZmlsdGVyZWRQcm9wZXJ0eU5hbWUgIT09IHByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdGRvbVByb3BlcnRpZXNbZmlsdGVyZWRQcm9wZXJ0eU5hbWVdID0ge1xuXHRcdFx0XHRcdFx0Z2V0OiAoKSA9PiB0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpLFxuXHRcdFx0XHRcdFx0c2V0OiAodmFsdWU6IGFueSkgPT4gdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHlOYW1lLCB2YWx1ZSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZG9tUHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0ge1xuXHRcdFx0XHRcdGdldDogKCkgPT4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHlOYW1lKSxcblx0XHRcdFx0XHRzZXQ6ICh2YWx1ZTogYW55KSA9PiB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUsIHZhbHVlKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cblx0XHRcdGV2ZW50cy5mb3JFYWNoKChwcm9wZXJ0eU5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRjb25zdCBldmVudE5hbWUgPSBwcm9wZXJ0eU5hbWUucmVwbGFjZSgvXm9uLywgJycpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdGNvbnN0IGZpbHRlcmVkUHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lLnJlcGxhY2UoL15vbi8sICdfX29uJyk7XG5cblx0XHRcdFx0ZG9tUHJvcGVydGllc1tmaWx0ZXJlZFByb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRcdFx0Z2V0OiAoKSA9PiB0aGlzLl9nZXRFdmVudFByb3BlcnR5KHByb3BlcnR5TmFtZSksXG5cdFx0XHRcdFx0c2V0OiAodmFsdWU6IGFueSkgPT4gdGhpcy5fc2V0RXZlbnRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUsIHZhbHVlKVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoaXMuX2V2ZW50UHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR0aGlzLl9wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSAoLi4uYXJnczogYW55W10pID0+IHtcblx0XHRcdFx0XHRjb25zdCBldmVudENhbGxiYWNrID0gdGhpcy5fZ2V0RXZlbnRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpO1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZXZlbnRDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0ZXZlbnRDYWxsYmFjayguLi5hcmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KFxuXHRcdFx0XHRcdFx0bmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwge1xuXHRcdFx0XHRcdFx0XHRidWJibGVzOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0ZGV0YWlsOiBhcmdzXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblxuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywgZG9tUHJvcGVydGllcyk7XG5cblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gY2hpbGRUeXBlID09PSBDdXN0b21FbGVtZW50Q2hpbGRUeXBlLlRFWFQgPyB0aGlzLmNoaWxkTm9kZXMgOiB0aGlzLmNoaWxkcmVuO1xuXG5cdFx0XHRmcm9tKGNoaWxkcmVuKS5mb3JFYWNoKChjaGlsZE5vZGU6IE5vZGUpID0+IHtcblx0XHRcdFx0aWYgKGNoaWxkVHlwZSA9PT0gQ3VzdG9tRWxlbWVudENoaWxkVHlwZS5ET0pPKSB7XG5cdFx0XHRcdFx0Y2hpbGROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2Rvam8tY2UtcmVuZGVyJywgKCkgPT4gdGhpcy5fcmVuZGVyKCkpO1xuXHRcdFx0XHRcdGNoaWxkTm9kZS5hZGRFdmVudExpc3RlbmVyKCdkb2pvLWNlLWNvbm5lY3RlZCcsICgpID0+IHRoaXMuX3JlbmRlcigpKTtcblx0XHRcdFx0XHR0aGlzLl9jaGlsZHJlbi5wdXNoKERvbVRvV2lkZ2V0V3JhcHBlcihjaGlsZE5vZGUgYXMgSFRNTEVsZW1lbnQpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9jaGlsZHJlbi5wdXNoKGRvbSh7IG5vZGU6IGNoaWxkTm9kZSBhcyBIVE1MRWxlbWVudCwgZGlmZlR5cGU6ICdkb20nIH0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignZG9qby1jZS1jb25uZWN0ZWQnLCAoZTogYW55KSA9PiB0aGlzLl9jaGlsZENvbm5lY3RlZChlKSk7XG5cblx0XHRcdGNvbnN0IHdpZGdldFByb3BlcnRpZXMgPSB0aGlzLl9wcm9wZXJ0aWVzO1xuXHRcdFx0Y29uc3QgcmVuZGVyQ2hpbGRyZW4gPSAoKSA9PiB0aGlzLl9fY2hpbGRyZW5fXygpO1xuXHRcdFx0Y29uc3QgV3JhcHBlciA9IGNsYXNzIGV4dGVuZHMgV2lkZ2V0QmFzZSB7XG5cdFx0XHRcdHJlbmRlcigpIHtcblx0XHRcdFx0XHRyZXR1cm4gdyhXaWRnZXRDb25zdHJ1Y3Rvciwgd2lkZ2V0UHJvcGVydGllcywgcmVuZGVyQ2hpbGRyZW4oKSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRjb25zdCByZWdpc3RyeSA9IHJlZ2lzdHJ5RmFjdG9yeSgpO1xuXHRcdFx0Y29uc3QgdGhlbWVDb250ZXh0ID0gcmVnaXN0ZXJUaGVtZUluamVjdG9yKHRoaXMuX2dldFRoZW1lKCksIHJlZ2lzdHJ5KTtcblx0XHRcdGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdkb2pvLXRoZW1lLXNldCcsICgpID0+IHRoZW1lQ29udGV4dC5zZXQodGhpcy5fZ2V0VGhlbWUoKSkpO1xuXHRcdFx0Y29uc3QgciA9IHJlbmRlcmVyKCgpID0+IHcoV3JhcHBlciwge30pKTtcblx0XHRcdHRoaXMuX3JlbmRlcmVyID0gcjtcblx0XHRcdHIubW91bnQoeyBkb21Ob2RlOiB0aGlzLCBtZXJnZTogZmFsc2UsIHJlZ2lzdHJ5IH0pO1xuXG5cdFx0XHR0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoXG5cdFx0XHRcdG5ldyBDdXN0b21FdmVudCgnZG9qby1jZS1jb25uZWN0ZWQnLCB7XG5cdFx0XHRcdFx0YnViYmxlczogdHJ1ZSxcblx0XHRcdFx0XHRkZXRhaWw6IHRoaXNcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfZ2V0VGhlbWUoKSB7XG5cdFx0XHRpZiAoZ2xvYmFsICYmIGdsb2JhbC5kb2pvY2UgJiYgZ2xvYmFsLmRvam9jZS50aGVtZSkge1xuXHRcdFx0XHRyZXR1cm4gZ2xvYmFsLmRvam9jZS50aGVtZXNbZ2xvYmFsLmRvam9jZS50aGVtZV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfY2hpbGRDb25uZWN0ZWQoZTogYW55KSB7XG5cdFx0XHRjb25zdCBub2RlID0gZS5kZXRhaWw7XG5cdFx0XHRpZiAobm9kZS5wYXJlbnROb2RlID09PSB0aGlzKSB7XG5cdFx0XHRcdGNvbnN0IGV4aXN0cyA9IHRoaXMuX2NoaWxkcmVuLnNvbWUoKGNoaWxkKSA9PiBjaGlsZC5kb21Ob2RlID09PSBub2RlKTtcblx0XHRcdFx0aWYgKCFleGlzdHMpIHtcblx0XHRcdFx0XHRub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2Rvam8tY2UtcmVuZGVyJywgKCkgPT4gdGhpcy5fcmVuZGVyKCkpO1xuXHRcdFx0XHRcdHRoaXMuX2NoaWxkcmVuLnB1c2goRG9tVG9XaWRnZXRXcmFwcGVyKG5vZGUpKTtcblx0XHRcdFx0XHR0aGlzLl9yZW5kZXIoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHByaXZhdGUgX3JlbmRlcigpIHtcblx0XHRcdGlmICh0aGlzLl9yZW5kZXJlcikge1xuXHRcdFx0XHR0aGlzLl9yZW5kZXJlci5pbnZhbGlkYXRlKCk7XG5cdFx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChcblx0XHRcdFx0XHRuZXcgQ3VzdG9tRXZlbnQoJ2Rvam8tY2UtcmVuZGVyJywge1xuXHRcdFx0XHRcdFx0YnViYmxlczogZmFsc2UsXG5cdFx0XHRcdFx0XHRkZXRhaWw6IHRoaXNcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHB1YmxpYyBfX3Byb3BlcnRpZXNfXygpIHtcblx0XHRcdHJldHVybiB7IC4uLnRoaXMuX3Byb3BlcnRpZXMsIC4uLnRoaXMuX2V2ZW50UHJvcGVydGllcyB9O1xuXHRcdH1cblxuXHRcdHB1YmxpYyBfX2NoaWxkcmVuX18oKSB7XG5cdFx0XHRpZiAoY2hpbGRUeXBlID09PSBDdXN0b21FbGVtZW50Q2hpbGRUeXBlLkRPSk8pIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2NoaWxkcmVuLmZpbHRlcigoQ2hpbGQpID0+IENoaWxkLmRvbU5vZGUuaXNXaWRnZXQpLm1hcCgoQ2hpbGQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgZG9tTm9kZSB9ID0gQ2hpbGQ7XG5cdFx0XHRcdFx0cmV0dXJuIHcoQ2hpbGQsIHsgLi4uZG9tTm9kZS5fX3Byb3BlcnRpZXNfXygpIH0sIFsuLi5kb21Ob2RlLl9fY2hpbGRyZW5fXygpXSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2NoaWxkcmVuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHB1YmxpYyBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sobmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nIHwgbnVsbCwgdmFsdWU6IHN0cmluZyB8IG51bGwpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IGF0dHJpYnV0ZU1hcFtuYW1lXTtcblx0XHRcdHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5TmFtZSwgdmFsdWUpO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3NldEV2ZW50UHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcblx0XHRcdHRoaXMuX2V2ZW50UHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBfZ2V0RXZlbnRQcm9wZXJ0eShwcm9wZXJ0eU5hbWU6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2V2ZW50UHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuXHRcdH1cblxuXHRcdHByaXZhdGUgX3NldFByb3BlcnR5KHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHZhbHVlW25vQmluZF0gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdFx0XHR0aGlzLl9yZW5kZXIoKTtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWU6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3Byb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0XHR9XG5cblx0XHRwcml2YXRlIF9hdHRyaWJ1dGVzVG9Qcm9wZXJ0aWVzKGF0dHJpYnV0ZXM6IHN0cmluZ1tdKSB7XG5cdFx0XHRyZXR1cm4gYXR0cmlidXRlcy5yZWR1Y2UoKHByb3BlcnRpZXM6IGFueSwgcHJvcGVydHlOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0Y29uc3QgYXR0cmlidXRlTmFtZSA9IHByb3BlcnR5TmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXHRcdFx0XHRpZiAodmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcHJvcGVydGllcztcblx0XHRcdH0sIHt9KTtcblx0XHR9XG5cblx0XHRzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcblx0XHRcdHJldHVybiBPYmplY3Qua2V5cyhhdHRyaWJ1dGVNYXApO1xuXHRcdH1cblxuXHRcdHB1YmxpYyBnZXQgaXNXaWRnZXQoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcihXaWRnZXRDb25zdHJ1Y3RvcjogYW55KTogdm9pZCB7XG5cdGNvbnN0IGRlc2NyaXB0b3IgPSBXaWRnZXRDb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgV2lkZ2V0Q29uc3RydWN0b3IucHJvdG90eXBlLl9fY3VzdG9tRWxlbWVudERlc2NyaXB0b3I7XG5cblx0aWYgKCFkZXNjcmlwdG9yKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0J0Nhbm5vdCBnZXQgZGVzY3JpcHRvciBmb3IgQ3VzdG9tIEVsZW1lbnQsIGhhdmUgeW91IGFkZGVkIHRoZSBAY3VzdG9tRWxlbWVudCBkZWNvcmF0b3IgdG8geW91ciBXaWRnZXQ/J1xuXHRcdCk7XG5cdH1cblxuXHRnbG9iYWwuY3VzdG9tRWxlbWVudHMuZGVmaW5lKGRlc2NyaXB0b3IudGFnTmFtZSwgY3JlYXRlKGRlc2NyaXB0b3IsIFdpZGdldENvbnN0cnVjdG9yKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlZ2lzdGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHJlZ2lzdGVyQ3VzdG9tRWxlbWVudC50cyIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi4vc2hpbS9nbG9iYWwnO1xuaW1wb3J0IGhhcyBmcm9tICcuLi9oYXMvaGFzJztcbmltcG9ydCB7IFdlYWtNYXAgfSBmcm9tICcuLi9zaGltL1dlYWtNYXAnO1xuaW1wb3J0IHtcblx0V05vZGUsXG5cdFZOb2RlLFxuXHRETm9kZSxcblx0Vk5vZGVQcm9wZXJ0aWVzLFxuXHRXaWRnZXRCYXNlQ29uc3RydWN0b3IsXG5cdFRyYW5zaXRpb25TdHJhdGVneSxcblx0RG9tVk5vZGVcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB0cmFuc2l0aW9uU3RyYXRlZ3kgZnJvbSAnLi9hbmltYXRpb25zL2Nzc1RyYW5zaXRpb25zJztcbmltcG9ydCB7IGlzVk5vZGUsIGlzV05vZGUsIFdOT0RFLCB2LCBpc0RvbVZOb2RlLCB3IH0gZnJvbSAnLi9kJztcbmltcG9ydCB7IFJlZ2lzdHJ5LCBpc1dpZGdldEJhc2VDb25zdHJ1Y3RvciB9IGZyb20gJy4vUmVnaXN0cnknO1xuaW1wb3J0IHsgV2lkZ2V0QmFzZSwgd2lkZ2V0SW5zdGFuY2VNYXAgfSBmcm9tICcuL1dpZGdldEJhc2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VOb2RlV3JhcHBlciB7XG5cdG5vZGU6IFdOb2RlIHwgVk5vZGU7XG5cdGRvbU5vZGU/OiBOb2RlO1xuXHRjaGlsZHJlbldyYXBwZXJzPzogRE5vZGVXcmFwcGVyW107XG5cdGRlcHRoOiBudW1iZXI7XG5cdHJlcXVpcmVzSW5zZXJ0QmVmb3JlPzogYm9vbGVhbjtcblx0aGFzUHJldmlvdXNTaWJsaW5ncz86IGJvb2xlYW47XG5cdGhhc1BhcmVudFdOb2RlPzogYm9vbGVhbjtcblx0bmFtZXNwYWNlPzogc3RyaW5nO1xuXHRoYXNBbmltYXRpb25zPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXTm9kZVdyYXBwZXIgZXh0ZW5kcyBCYXNlTm9kZVdyYXBwZXIge1xuXHRub2RlOiBXTm9kZTtcblx0aW5zdGFuY2U/OiBXaWRnZXRCYXNlO1xuXHRtZXJnZU5vZGVzPzogTm9kZVtdO1xuXHRub2RlSGFuZGxlckNhbGxlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVk5vZGVXcmFwcGVyIGV4dGVuZHMgQmFzZU5vZGVXcmFwcGVyIHtcblx0bm9kZTogVk5vZGUgfCBEb21WTm9kZTtcblx0bWVyZ2VkPzogYm9vbGVhbjtcblx0ZGVjb3JhdGVkRGVmZXJyZWRQcm9wZXJ0aWVzPzogVk5vZGVQcm9wZXJ0aWVzO1xuXHRpbnNlcnRlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIEROb2RlV3JhcHBlciA9IFZOb2RlV3JhcHBlciB8IFdOb2RlV3JhcHBlcjtcblxuZXhwb3J0IGludGVyZmFjZSBNb3VudE9wdGlvbnMge1xuXHRzeW5jOiBib29sZWFuO1xuXHRtZXJnZTogYm9vbGVhbjtcblx0dHJhbnNpdGlvbjogVHJhbnNpdGlvblN0cmF0ZWd5O1xuXHRkb21Ob2RlOiBIVE1MRWxlbWVudDtcblx0cmVnaXN0cnk6IFJlZ2lzdHJ5IHwgbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJlciB7XG5cdGludmFsaWRhdGUoKTogdm9pZDtcblx0bW91bnQobW91bnRPcHRpb25zPzogUGFydGlhbDxNb3VudE9wdGlvbnM+KTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIFByb2Nlc3NJdGVtIHtcblx0Y3VycmVudD86IChXTm9kZVdyYXBwZXIgfCBWTm9kZVdyYXBwZXIpW107XG5cdG5leHQ/OiAoV05vZGVXcmFwcGVyIHwgVk5vZGVXcmFwcGVyKVtdO1xuXHRtZXRhOiBQcm9jZXNzTWV0YTtcbn1cblxuaW50ZXJmYWNlIFByb2Nlc3NSZXN1bHQge1xuXHRpdGVtPzogUHJvY2Vzc0l0ZW07XG5cdHdpZGdldD86IEF0dGFjaEFwcGxpY2F0aW9uIHwgRGV0YWNoQXBwbGljYXRpb247XG5cdGRvbT86IEFwcGxpY2F0aW9uSW5zdHJ1Y3Rpb247XG59XG5cbmludGVyZmFjZSBQcm9jZXNzTWV0YSB7XG5cdG1lcmdlTm9kZXM/OiBOb2RlW107XG5cdG9sZEluZGV4PzogbnVtYmVyO1xuXHRuZXdJbmRleD86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIEludmFsaWRhdGlvblF1ZXVlSXRlbSB7XG5cdGluc3RhbmNlOiBXaWRnZXRCYXNlO1xuXHRkZXB0aDogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgSW5zdHJ1Y3Rpb24ge1xuXHRjdXJyZW50OiB1bmRlZmluZWQgfCBETm9kZVdyYXBwZXI7XG5cdG5leHQ6IHVuZGVmaW5lZCB8IEROb2RlV3JhcHBlcjtcbn1cblxuaW50ZXJmYWNlIENyZWF0ZVdpZGdldEluc3RydWN0aW9uIHtcblx0bmV4dDogV05vZGVXcmFwcGVyO1xufVxuXG5pbnRlcmZhY2UgVXBkYXRlV2lkZ2V0SW5zdHJ1Y3Rpb24ge1xuXHRjdXJyZW50OiBXTm9kZVdyYXBwZXI7XG5cdG5leHQ6IFdOb2RlV3JhcHBlcjtcbn1cblxuaW50ZXJmYWNlIFJlbW92ZVdpZGdldEluc3RydWN0aW9uIHtcblx0Y3VycmVudDogV05vZGVXcmFwcGVyO1xufVxuXG5pbnRlcmZhY2UgQ3JlYXRlRG9tSW5zdHJ1Y3Rpb24ge1xuXHRuZXh0OiBWTm9kZVdyYXBwZXI7XG59XG5cbmludGVyZmFjZSBVcGRhdGVEb21JbnN0cnVjdGlvbiB7XG5cdGN1cnJlbnQ6IFZOb2RlV3JhcHBlcjtcblx0bmV4dDogVk5vZGVXcmFwcGVyO1xufVxuXG5pbnRlcmZhY2UgUmVtb3ZlRG9tSW5zdHJ1Y3Rpb24ge1xuXHRjdXJyZW50OiBWTm9kZVdyYXBwZXI7XG59XG5cbmludGVyZmFjZSBBdHRhY2hBcHBsaWNhdGlvbiB7XG5cdHR5cGU6ICdhdHRhY2gnO1xuXHRpbnN0YW5jZTogV2lkZ2V0QmFzZTtcblx0YXR0YWNoZWQ6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBEZXRhY2hBcHBsaWNhdGlvbiB7XG5cdHR5cGU6ICdkZXRhY2gnO1xuXHRjdXJyZW50OiBXTm9kZVdyYXBwZXI7XG59XG5cbmludGVyZmFjZSBDcmVhdGVEb21BcHBsaWNhdGlvbiB7XG5cdHR5cGU6ICdjcmVhdGUnO1xuXHRjdXJyZW50PzogVk5vZGVXcmFwcGVyO1xuXHRuZXh0OiBWTm9kZVdyYXBwZXI7XG5cdHBhcmVudERvbU5vZGU6IE5vZGU7XG59XG5cbmludGVyZmFjZSBEZWxldGVEb21BcHBsaWNhdGlvbiB7XG5cdHR5cGU6ICdkZWxldGUnO1xuXHRjdXJyZW50OiBWTm9kZVdyYXBwZXI7XG59XG5cbmludGVyZmFjZSBVcGRhdGVEb21BcHBsaWNhdGlvbiB7XG5cdHR5cGU6ICd1cGRhdGUnO1xuXHRjdXJyZW50OiBWTm9kZVdyYXBwZXI7XG5cdG5leHQ6IFZOb2RlV3JhcHBlcjtcbn1cblxuaW50ZXJmYWNlIFByZXZpb3VzUHJvcGVydGllcyB7XG5cdHByb3BlcnRpZXM6IGFueTtcblx0YXR0cmlidXRlcz86IGFueTtcblx0ZXZlbnRzPzogYW55O1xufVxuXG50eXBlIEFwcGxpY2F0aW9uSW5zdHJ1Y3Rpb24gPVxuXHR8IENyZWF0ZURvbUFwcGxpY2F0aW9uXG5cdHwgVXBkYXRlRG9tQXBwbGljYXRpb25cblx0fCBEZWxldGVEb21BcHBsaWNhdGlvblxuXHR8IEF0dGFjaEFwcGxpY2F0aW9uXG5cdHwgRGV0YWNoQXBwbGljYXRpb247XG5cbmNvbnN0IEVNUFRZX0FSUkFZOiBETm9kZVdyYXBwZXJbXSA9IFtdO1xuY29uc3Qgbm9kZU9wZXJhdGlvbnMgPSBbJ2ZvY3VzJywgJ2JsdXInLCAnc2Nyb2xsSW50b1ZpZXcnLCAnY2xpY2snXTtcbmNvbnN0IE5BTUVTUEFDRV9XMyA9ICdodHRwOi8vd3d3LnczLm9yZy8nO1xuY29uc3QgTkFNRVNQQUNFX1NWRyA9IE5BTUVTUEFDRV9XMyArICcyMDAwL3N2Zyc7XG5jb25zdCBOQU1FU1BBQ0VfWExJTksgPSBOQU1FU1BBQ0VfVzMgKyAnMTk5OS94bGluayc7XG5cbmZ1bmN0aW9uIGlzV05vZGVXcmFwcGVyKGNoaWxkOiBETm9kZVdyYXBwZXIpOiBjaGlsZCBpcyBXTm9kZVdyYXBwZXIge1xuXHRyZXR1cm4gY2hpbGQgJiYgaXNXTm9kZShjaGlsZC5ub2RlKTtcbn1cblxuZnVuY3Rpb24gaXNWTm9kZVdyYXBwZXIoY2hpbGQ/OiBETm9kZVdyYXBwZXIgfCBudWxsKTogY2hpbGQgaXMgVk5vZGVXcmFwcGVyIHtcblx0cmV0dXJuICEhY2hpbGQgJiYgaXNWTm9kZShjaGlsZC5ub2RlKTtcbn1cblxuZnVuY3Rpb24gaXNBdHRhY2hBcHBsaWNhdGlvbih2YWx1ZTogYW55KTogdmFsdWUgaXMgQXR0YWNoQXBwbGljYXRpb24gfCBEZXRhY2hBcHBsaWNhdGlvbiB7XG5cdHJldHVybiAhIXZhbHVlLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZXMoXG5cdGRvbU5vZGU6IEVsZW1lbnQsXG5cdHByZXZpb3VzQXR0cmlidXRlczogeyBbaW5kZXg6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZCB9LFxuXHRhdHRyaWJ1dGVzOiB7IFtpbmRleDogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkIH0sXG5cdG5hbWVzcGFjZT86IHN0cmluZ1xuKSB7XG5cdGNvbnN0IGF0dHJOYW1lcyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpO1xuXHRjb25zdCBhdHRyQ291bnQgPSBhdHRyTmFtZXMubGVuZ3RoO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJDb3VudDsgaSsrKSB7XG5cdFx0Y29uc3QgYXR0ck5hbWUgPSBhdHRyTmFtZXNbaV07XG5cdFx0Y29uc3QgYXR0clZhbHVlID0gYXR0cmlidXRlc1thdHRyTmFtZV07XG5cdFx0Y29uc3QgcHJldmlvdXNBdHRyVmFsdWUgPSBwcmV2aW91c0F0dHJpYnV0ZXNbYXR0ck5hbWVdO1xuXHRcdGlmIChhdHRyVmFsdWUgIT09IHByZXZpb3VzQXR0clZhbHVlKSB7XG5cdFx0XHR1cGRhdGVBdHRyaWJ1dGUoZG9tTm9kZSwgYXR0ck5hbWUsIGF0dHJWYWx1ZSwgbmFtZXNwYWNlKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYnVpbGRQcmV2aW91c1Byb3BlcnRpZXMoZG9tTm9kZTogYW55LCBjdXJyZW50OiBWTm9kZVdyYXBwZXIsIG5leHQ6IFZOb2RlV3JhcHBlcikge1xuXHRjb25zdCB7XG5cdFx0bm9kZTogeyBkaWZmVHlwZSwgcHJvcGVydGllcywgYXR0cmlidXRlcyB9XG5cdH0gPSBjdXJyZW50O1xuXHRpZiAoIWRpZmZUeXBlIHx8IGRpZmZUeXBlID09PSAndmRvbScpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cHJvcGVydGllczogY3VycmVudC5ub2RlLnByb3BlcnRpZXMsXG5cdFx0XHRhdHRyaWJ1dGVzOiBjdXJyZW50Lm5vZGUuYXR0cmlidXRlcyxcblx0XHRcdGV2ZW50czogY3VycmVudC5ub2RlLmV2ZW50c1xuXHRcdH07XG5cdH0gZWxzZSBpZiAoZGlmZlR5cGUgPT09ICdub25lJykge1xuXHRcdHJldHVybiB7IHByb3BlcnRpZXM6IHt9LCBhdHRyaWJ1dGVzOiBjdXJyZW50Lm5vZGUuYXR0cmlidXRlcyA/IHt9IDogdW5kZWZpbmVkLCBldmVudHM6IGN1cnJlbnQubm9kZS5ldmVudHMgfTtcblx0fVxuXHRsZXQgbmV3UHJvcGVydGllczogYW55ID0ge1xuXHRcdHByb3BlcnRpZXM6IHt9XG5cdH07XG5cdGlmIChhdHRyaWJ1dGVzKSB7XG5cdFx0bmV3UHJvcGVydGllcy5hdHRyaWJ1dGVzID0ge307XG5cdFx0bmV3UHJvcGVydGllcy5ldmVudHMgPSBjdXJyZW50Lm5vZGUuZXZlbnRzO1xuXHRcdE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG5cdFx0XHRuZXdQcm9wZXJ0aWVzLnByb3BlcnRpZXNbcHJvcE5hbWVdID0gZG9tTm9kZVtwcm9wTmFtZV07XG5cdFx0fSk7XG5cdFx0T2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoYXR0ck5hbWUpID0+IHtcblx0XHRcdG5ld1Byb3BlcnRpZXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSBkb21Ob2RlLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG5ld1Byb3BlcnRpZXM7XG5cdH1cblx0bmV3UHJvcGVydGllcy5wcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMocHJvcGVydGllcykucmVkdWNlKFxuXHRcdChwcm9wcywgcHJvcGVydHkpID0+IHtcblx0XHRcdHByb3BzW3Byb3BlcnR5XSA9IGRvbU5vZGUuZ2V0QXR0cmlidXRlKHByb3BlcnR5KSB8fCBkb21Ob2RlW3Byb3BlcnR5XTtcblx0XHRcdHJldHVybiBwcm9wcztcblx0XHR9LFxuXHRcdHt9IGFzIGFueVxuXHQpO1xuXHRyZXR1cm4gbmV3UHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gY2hlY2tEaXN0aW5ndWlzaGFibGUod3JhcHBlcnM6IEROb2RlV3JhcHBlcltdLCBpbmRleDogbnVtYmVyLCBwYXJlbnRXTm9kZVdyYXBwZXI/OiBXTm9kZVdyYXBwZXIpIHtcblx0Y29uc3Qgd3JhcHBlclRvQ2hlY2sgPSB3cmFwcGVyc1tpbmRleF07XG5cdGlmIChpc1ZOb2RlV3JhcHBlcih3cmFwcGVyVG9DaGVjaykgJiYgIXdyYXBwZXJUb0NoZWNrLm5vZGUudGFnKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IHsga2V5IH0gPSB3cmFwcGVyVG9DaGVjay5ub2RlLnByb3BlcnRpZXM7XG5cdGxldCBwYXJlbnROYW1lID0gJ3Vua25vd24nO1xuXHRpZiAocGFyZW50V05vZGVXcmFwcGVyKSB7XG5cdFx0Y29uc3Qge1xuXHRcdFx0bm9kZTogeyB3aWRnZXRDb25zdHJ1Y3RvciB9XG5cdFx0fSA9IHBhcmVudFdOb2RlV3JhcHBlcjtcblx0XHRwYXJlbnROYW1lID0gKHdpZGdldENvbnN0cnVjdG9yIGFzIGFueSkubmFtZSB8fCAndW5rbm93bic7XG5cdH1cblxuXHRpZiAoa2V5ID09PSB1bmRlZmluZWQgfHwga2V5ID09PSBudWxsKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB3cmFwcGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGkgIT09IGluZGV4KSB7XG5cdFx0XHRcdGNvbnN0IHdyYXBwZXIgPSB3cmFwcGVyc1tpXTtcblx0XHRcdFx0aWYgKHNhbWUod3JhcHBlciwgd3JhcHBlclRvQ2hlY2spKSB7XG5cdFx0XHRcdFx0bGV0IG5vZGVJZGVudGlmaWVyOiBzdHJpbmc7XG5cdFx0XHRcdFx0aWYgKGlzV05vZGVXcmFwcGVyKHdyYXBwZXIpKSB7XG5cdFx0XHRcdFx0XHRub2RlSWRlbnRpZmllciA9ICh3cmFwcGVyLm5vZGUud2lkZ2V0Q29uc3RydWN0b3IgYXMgYW55KS5uYW1lIHx8ICd1bmtub3duJztcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bm9kZUlkZW50aWZpZXIgPSB3cmFwcGVyLm5vZGUudGFnO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0XHRcdGBBIHdpZGdldCAoJHtwYXJlbnROYW1lfSkgaGFzIGhhZCBhIGNoaWxkIGFkZGVkIG9yIHJlbW92ZWQsIGJ1dCB0aGV5IHdlcmUgbm90IGFibGUgdG8gdW5pcXVlbHkgaWRlbnRpZmllZC4gSXQgaXMgcmVjb21tZW5kZWQgdG8gcHJvdmlkZSBhIHVuaXF1ZSAna2V5JyBwcm9wZXJ0eSB3aGVuIHVzaW5nIHRoZSBzYW1lIHdpZGdldCBvciBlbGVtZW50ICgke25vZGVJZGVudGlmaWVyfSkgbXVsdGlwbGUgdGltZXMgYXMgc2libGluZ3NgXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBzYW1lKGRub2RlMTogRE5vZGVXcmFwcGVyLCBkbm9kZTI6IEROb2RlV3JhcHBlcik6IGJvb2xlYW4ge1xuXHRpZiAoaXNWTm9kZVdyYXBwZXIoZG5vZGUxKSAmJiBpc1ZOb2RlV3JhcHBlcihkbm9kZTIpKSB7XG5cdFx0aWYgKGlzRG9tVk5vZGUoZG5vZGUxLm5vZGUpICYmIGlzRG9tVk5vZGUoZG5vZGUyLm5vZGUpKSB7XG5cdFx0XHRpZiAoZG5vZGUxLm5vZGUuZG9tTm9kZSAhPT0gZG5vZGUyLm5vZGUuZG9tTm9kZSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChkbm9kZTEubm9kZS50YWcgIT09IGRub2RlMi5ub2RlLnRhZykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoZG5vZGUxLm5vZGUucHJvcGVydGllcy5rZXkgIT09IGRub2RlMi5ub2RlLnByb3BlcnRpZXMua2V5KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2UgaWYgKGlzV05vZGVXcmFwcGVyKGRub2RlMSkgJiYgaXNXTm9kZVdyYXBwZXIoZG5vZGUyKSkge1xuXHRcdGlmIChkbm9kZTEuaW5zdGFuY2UgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZG5vZGUyLm5vZGUud2lkZ2V0Q29uc3RydWN0b3IgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChkbm9kZTEubm9kZS53aWRnZXRDb25zdHJ1Y3RvciAhPT0gZG5vZGUyLm5vZGUud2lkZ2V0Q29uc3RydWN0b3IpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGRub2RlMS5ub2RlLnByb3BlcnRpZXMua2V5ICE9PSBkbm9kZTIubm9kZS5wcm9wZXJ0aWVzLmtleSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGZpbmRJbmRleE9mQ2hpbGQoY2hpbGRyZW46IEROb2RlV3JhcHBlcltdLCBzYW1lQXM6IEROb2RlV3JhcHBlciwgc3RhcnQ6IG51bWJlcikge1xuXHRmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChzYW1lKGNoaWxkcmVuW2ldLCBzYW1lQXMpKSB7XG5cdFx0XHRyZXR1cm4gaTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDbGFzc1Byb3BWYWx1ZShjbGFzc2VzOiBzdHJpbmcgfCBzdHJpbmdbXSA9IFtdKSB7XG5cdGNsYXNzZXMgPSBBcnJheS5pc0FycmF5KGNsYXNzZXMpID8gY2xhc3NlcyA6IFtjbGFzc2VzXTtcblx0cmV0dXJuIGNsYXNzZXMuam9pbignICcpLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlKGRvbU5vZGU6IEVsZW1lbnQsIGF0dHJOYW1lOiBzdHJpbmcsIGF0dHJWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBuYW1lc3BhY2U/OiBzdHJpbmcpIHtcblx0aWYgKG5hbWVzcGFjZSA9PT0gTkFNRVNQQUNFX1NWRyAmJiBhdHRyTmFtZSA9PT0gJ2hyZWYnICYmIGF0dHJWYWx1ZSkge1xuXHRcdGRvbU5vZGUuc2V0QXR0cmlidXRlTlMoTkFNRVNQQUNFX1hMSU5LLCBhdHRyTmFtZSwgYXR0clZhbHVlKTtcblx0fSBlbHNlIGlmICgoYXR0ck5hbWUgPT09ICdyb2xlJyAmJiBhdHRyVmFsdWUgPT09ICcnKSB8fCBhdHRyVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdGRvbU5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcblx0fSBlbHNlIHtcblx0XHRkb21Ob2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKTtcblx0fVxufVxuXG5mdW5jdGlvbiBydW5FbnRlckFuaW1hdGlvbihuZXh0OiBWTm9kZVdyYXBwZXIsIHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uU3RyYXRlZ3kpIHtcblx0Y29uc3Qge1xuXHRcdGRvbU5vZGUsXG5cdFx0bm9kZTogeyBwcm9wZXJ0aWVzIH0sXG5cdFx0bm9kZToge1xuXHRcdFx0cHJvcGVydGllczogeyBlbnRlckFuaW1hdGlvbiB9XG5cdFx0fVxuXHR9ID0gbmV4dDtcblx0aWYgKGVudGVyQW5pbWF0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiBlbnRlckFuaW1hdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuIGVudGVyQW5pbWF0aW9uKGRvbU5vZGUgYXMgRWxlbWVudCwgcHJvcGVydGllcyk7XG5cdFx0fVxuXHRcdHRyYW5zaXRpb25zLmVudGVyKGRvbU5vZGUgYXMgRWxlbWVudCwgcHJvcGVydGllcywgZW50ZXJBbmltYXRpb24pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJ1bkV4aXRBbmltYXRpb24oY3VycmVudDogVk5vZGVXcmFwcGVyLCB0cmFuc2l0aW9uczogVHJhbnNpdGlvblN0cmF0ZWd5KSB7XG5cdGNvbnN0IHtcblx0XHRkb21Ob2RlLFxuXHRcdG5vZGU6IHsgcHJvcGVydGllcyB9LFxuXHRcdG5vZGU6IHtcblx0XHRcdHByb3BlcnRpZXM6IHsgZXhpdEFuaW1hdGlvbiB9XG5cdFx0fVxuXHR9ID0gY3VycmVudDtcblx0Y29uc3QgcmVtb3ZlRG9tTm9kZSA9ICgpID0+IHtcblx0XHRkb21Ob2RlICYmIGRvbU5vZGUucGFyZW50Tm9kZSAmJiBkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSk7XG5cdFx0Y3VycmVudC5kb21Ob2RlID0gdW5kZWZpbmVkO1xuXHR9O1xuXHRpZiAodHlwZW9mIGV4aXRBbmltYXRpb24gPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gZXhpdEFuaW1hdGlvbihkb21Ob2RlIGFzIEVsZW1lbnQsIHJlbW92ZURvbU5vZGUsIHByb3BlcnRpZXMpO1xuXHR9XG5cdHRyYW5zaXRpb25zLmV4aXQoZG9tTm9kZSBhcyBFbGVtZW50LCBwcm9wZXJ0aWVzLCBleGl0QW5pbWF0aW9uIGFzIHN0cmluZywgcmVtb3ZlRG9tTm9kZSk7XG59XG5cbmZ1bmN0aW9uIGFycmF5RnJvbShhcnI6IGFueSkge1xuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcbn1cblxuZnVuY3Rpb24gd3JhcFZOb2Rlcyhub2RlczogVk5vZGUpIHtcblx0cmV0dXJuIGNsYXNzIGV4dGVuZHMgV2lkZ2V0QmFzZSB7XG5cdFx0cHJvdGVjdGVkIHJlbmRlcigpIHtcblx0XHRcdHJldHVybiBub2Rlcztcblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJlcihyZW5kZXJlcjogKCkgPT4gV05vZGUgfCBWTm9kZSk6IFJlbmRlcmVyIHtcblx0bGV0IF9tb3VudE9wdGlvbnM6IE1vdW50T3B0aW9ucyA9IHtcblx0XHRzeW5jOiBmYWxzZSxcblx0XHRtZXJnZTogdHJ1ZSxcblx0XHR0cmFuc2l0aW9uOiB0cmFuc2l0aW9uU3RyYXRlZ3ksXG5cdFx0ZG9tTm9kZTogZ2xvYmFsLmRvY3VtZW50LmJvZHksXG5cdFx0cmVnaXN0cnk6IG51bGxcblx0fTtcblx0bGV0IF9pbnZhbGlkYXRpb25RdWV1ZTogSW52YWxpZGF0aW9uUXVldWVJdGVtW10gPSBbXTtcblx0bGV0IF9wcm9jZXNzUXVldWU6IChQcm9jZXNzSXRlbSB8IERldGFjaEFwcGxpY2F0aW9uIHwgQXR0YWNoQXBwbGljYXRpb24pW10gPSBbXTtcblx0bGV0IF9hcHBsaWNhdGlvblF1ZXVlOiBBcHBsaWNhdGlvbkluc3RydWN0aW9uW10gPSBbXTtcblx0bGV0IF9ldmVudE1hcCA9IG5ldyBXZWFrTWFwPEZ1bmN0aW9uLCBFdmVudExpc3RlbmVyPigpO1xuXHRsZXQgX2luc3RhbmNlVG9XcmFwcGVyTWFwID0gbmV3IFdlYWtNYXA8V2lkZ2V0QmFzZSwgV05vZGVXcmFwcGVyPigpO1xuXHRsZXQgX3BhcmVudFdyYXBwZXJNYXAgPSBuZXcgV2Vha01hcDxETm9kZVdyYXBwZXIsIEROb2RlV3JhcHBlcj4oKTtcblx0bGV0IF93cmFwcGVyU2libGluZ01hcCA9IG5ldyBXZWFrTWFwPEROb2RlV3JhcHBlciwgRE5vZGVXcmFwcGVyPigpO1xuXHRsZXQgX3JlbmRlclNjaGVkdWxlZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXHRsZXQgX2FmdGVyUmVuZGVyQ2FsbGJhY2tzOiBGdW5jdGlvbltdID0gW107XG5cdGxldCBfZGVmZXJyZWRSZW5kZXJDYWxsYmFja3M6IEZ1bmN0aW9uW10gPSBbXTtcblx0bGV0IHBhcmVudEludmFsaWRhdGU6ICgpID0+IHZvaWQ7XG5cblx0ZnVuY3Rpb24gbm9kZU9wZXJhdGlvbihcblx0XHRwcm9wTmFtZTogc3RyaW5nLFxuXHRcdHByb3BWYWx1ZTogKCgpID0+IGJvb2xlYW4pIHwgYm9vbGVhbixcblx0XHRwcmV2aW91c1ZhbHVlOiBib29sZWFuLFxuXHRcdGRvbU5vZGU6IEhUTUxFbGVtZW50ICYgeyBbaW5kZXg6IHN0cmluZ106IGFueSB9XG5cdCk6IHZvaWQge1xuXHRcdGxldCByZXN1bHQgPSBwcm9wVmFsdWUgJiYgIXByZXZpb3VzVmFsdWU7XG5cdFx0aWYgKHR5cGVvZiBwcm9wVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHJlc3VsdCA9IHByb3BWYWx1ZSgpO1xuXHRcdH1cblx0XHRpZiAocmVzdWx0ID09PSB0cnVlKSB7XG5cdFx0XHRfYWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaCgoKSA9PiB7XG5cdFx0XHRcdGRvbU5vZGVbcHJvcE5hbWVdKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiB1cGRhdGVFdmVudChcblx0XHRkb21Ob2RlOiBOb2RlLFxuXHRcdGV2ZW50TmFtZTogc3RyaW5nLFxuXHRcdGN1cnJlbnRWYWx1ZTogRnVuY3Rpb24sXG5cdFx0YmluZDogYW55LFxuXHRcdHByZXZpb3VzVmFsdWU/OiBGdW5jdGlvblxuXHQpIHtcblx0XHRpZiAocHJldmlvdXNWYWx1ZSkge1xuXHRcdFx0Y29uc3QgcHJldmlvdXNFdmVudCA9IF9ldmVudE1hcC5nZXQocHJldmlvdXNWYWx1ZSk7XG5cdFx0XHRkb21Ob2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBwcmV2aW91c0V2ZW50KTtcblx0XHR9XG5cblx0XHRsZXQgY2FsbGJhY2sgPSBjdXJyZW50VmFsdWUuYmluZChiaW5kKTtcblxuXHRcdGlmIChldmVudE5hbWUgPT09ICdpbnB1dCcpIHtcblx0XHRcdGNhbGxiYWNrID0gZnVuY3Rpb24odGhpczogYW55LCBldnQ6IEV2ZW50KSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZS5jYWxsKHRoaXMsIGV2dCk7XG5cdFx0XHRcdChldnQudGFyZ2V0IGFzIGFueSlbJ29uaW5wdXQtdmFsdWUnXSA9IChldnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlO1xuXHRcdFx0fS5iaW5kKGJpbmQpO1xuXHRcdH1cblxuXHRcdGRvbU5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcblx0XHRfZXZlbnRNYXAuc2V0KGN1cnJlbnRWYWx1ZSwgY2FsbGJhY2spO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmVtb3ZlT3JwaGFuZWRFdmVudHMoXG5cdFx0ZG9tTm9kZTogRWxlbWVudCxcblx0XHRwcmV2aW91c1Byb3BlcnRpZXM6IFZOb2RlUHJvcGVydGllcyxcblx0XHRwcm9wZXJ0aWVzOiBWTm9kZVByb3BlcnRpZXMsXG5cdFx0b25seUV2ZW50czogYm9vbGVhbiA9IGZhbHNlXG5cdCkge1xuXHRcdE9iamVjdC5rZXlzKHByZXZpb3VzUHJvcGVydGllcykuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcblx0XHRcdGNvbnN0IGlzRXZlbnQgPSBwcm9wTmFtZS5zdWJzdHIoMCwgMikgPT09ICdvbicgfHwgb25seUV2ZW50cztcblx0XHRcdGNvbnN0IGV2ZW50TmFtZSA9IG9ubHlFdmVudHMgPyBwcm9wTmFtZSA6IHByb3BOYW1lLnN1YnN0cigyKTtcblx0XHRcdGlmIChpc0V2ZW50ICYmICFwcm9wZXJ0aWVzW3Byb3BOYW1lXSkge1xuXHRcdFx0XHRjb25zdCBldmVudENhbGxiYWNrID0gX2V2ZW50TWFwLmdldChwcmV2aW91c1Byb3BlcnRpZXNbcHJvcE5hbWVdKTtcblx0XHRcdFx0aWYgKGV2ZW50Q2FsbGJhY2spIHtcblx0XHRcdFx0XHRkb21Ob2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldmVudENhbGxiYWNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmVuZGVyZWRUb1dyYXBwZXIoXG5cdFx0cmVuZGVyZWQ6IEROb2RlW10sXG5cdFx0cGFyZW50OiBETm9kZVdyYXBwZXIsXG5cdFx0Y3VycmVudFBhcmVudDogRE5vZGVXcmFwcGVyIHwgbnVsbFxuXHQpOiBETm9kZVdyYXBwZXJbXSB7XG5cdFx0Y29uc3Qgd3JhcHBlZFJlbmRlcmVkOiBETm9kZVdyYXBwZXJbXSA9IFtdO1xuXHRcdGNvbnN0IGhhc1BhcmVudFdOb2RlID0gaXNXTm9kZVdyYXBwZXIocGFyZW50KTtcblx0XHRjb25zdCBjdXJyZW50UGFyZW50TGVuZ3RoID0gaXNWTm9kZVdyYXBwZXIoY3VycmVudFBhcmVudCkgJiYgKGN1cnJlbnRQYXJlbnQuY2hpbGRyZW5XcmFwcGVycyB8fCBbXSkubGVuZ3RoID4gMTtcblx0XHRjb25zdCByZXF1aXJlc0luc2VydEJlZm9yZSA9XG5cdFx0XHQoKHBhcmVudC5yZXF1aXJlc0luc2VydEJlZm9yZSB8fCBwYXJlbnQuaGFzUHJldmlvdXNTaWJsaW5ncyAhPT0gZmFsc2UpICYmIGhhc1BhcmVudFdOb2RlKSB8fFxuXHRcdFx0Y3VycmVudFBhcmVudExlbmd0aDtcblx0XHRsZXQgcHJldmlvdXNJdGVtOiBETm9kZVdyYXBwZXIgfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCByZW5kZXJlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgcmVuZGVyZWRJdGVtID0gcmVuZGVyZWRbaV07XG5cdFx0XHRjb25zdCB3cmFwcGVyID0ge1xuXHRcdFx0XHRub2RlOiByZW5kZXJlZEl0ZW0sXG5cdFx0XHRcdGRlcHRoOiBwYXJlbnQuZGVwdGggKyAxLFxuXHRcdFx0XHRyZXF1aXJlc0luc2VydEJlZm9yZSxcblx0XHRcdFx0aGFzUGFyZW50V05vZGUsXG5cdFx0XHRcdG5hbWVzcGFjZTogcGFyZW50Lm5hbWVzcGFjZVxuXHRcdFx0fSBhcyBETm9kZVdyYXBwZXI7XG5cdFx0XHRpZiAoaXNWTm9kZShyZW5kZXJlZEl0ZW0pICYmIHJlbmRlcmVkSXRlbS5wcm9wZXJ0aWVzLmV4aXRBbmltYXRpb24pIHtcblx0XHRcdFx0cGFyZW50Lmhhc0FuaW1hdGlvbnMgPSB0cnVlO1xuXHRcdFx0XHRsZXQgbmV4dFBhcmVudCA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChwYXJlbnQpO1xuXHRcdFx0XHR3aGlsZSAobmV4dFBhcmVudCkge1xuXHRcdFx0XHRcdGlmIChuZXh0UGFyZW50Lmhhc0FuaW1hdGlvbnMpIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRuZXh0UGFyZW50Lmhhc0FuaW1hdGlvbnMgPSB0cnVlO1xuXHRcdFx0XHRcdG5leHRQYXJlbnQgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQobmV4dFBhcmVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdF9wYXJlbnRXcmFwcGVyTWFwLnNldCh3cmFwcGVyLCBwYXJlbnQpO1xuXHRcdFx0aWYgKHByZXZpb3VzSXRlbSkge1xuXHRcdFx0XHRfd3JhcHBlclNpYmxpbmdNYXAuc2V0KHByZXZpb3VzSXRlbSwgd3JhcHBlcik7XG5cdFx0XHR9XG5cdFx0XHR3cmFwcGVkUmVuZGVyZWQucHVzaCh3cmFwcGVyKTtcblx0XHRcdHByZXZpb3VzSXRlbSA9IHdyYXBwZXI7XG5cdFx0fVxuXHRcdHJldHVybiB3cmFwcGVkUmVuZGVyZWQ7XG5cdH1cblxuXHRmdW5jdGlvbiBmaW5kUGFyZW50V05vZGVXcmFwcGVyKGN1cnJlbnROb2RlOiBETm9kZVdyYXBwZXIpOiBXTm9kZVdyYXBwZXIgfCB1bmRlZmluZWQge1xuXHRcdGxldCBwYXJlbnRXTm9kZVdyYXBwZXI6IFdOb2RlV3JhcHBlciB8IHVuZGVmaW5lZDtcblx0XHRsZXQgcGFyZW50V3JhcHBlciA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChjdXJyZW50Tm9kZSk7XG5cblx0XHR3aGlsZSAoIXBhcmVudFdOb2RlV3JhcHBlciAmJiBwYXJlbnRXcmFwcGVyKSB7XG5cdFx0XHRpZiAoIXBhcmVudFdOb2RlV3JhcHBlciAmJiBpc1dOb2RlV3JhcHBlcihwYXJlbnRXcmFwcGVyKSkge1xuXHRcdFx0XHRwYXJlbnRXTm9kZVdyYXBwZXIgPSBwYXJlbnRXcmFwcGVyO1xuXHRcdFx0fVxuXHRcdFx0cGFyZW50V3JhcHBlciA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChwYXJlbnRXcmFwcGVyKTtcblx0XHR9XG5cdFx0cmV0dXJuIHBhcmVudFdOb2RlV3JhcHBlcjtcblx0fVxuXG5cdGZ1bmN0aW9uIGZpbmRQYXJlbnREb21Ob2RlKGN1cnJlbnROb2RlOiBETm9kZVdyYXBwZXIpOiBOb2RlIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgcGFyZW50RG9tTm9kZTogTm9kZSB8IHVuZGVmaW5lZDtcblx0XHRsZXQgcGFyZW50V3JhcHBlciA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChjdXJyZW50Tm9kZSk7XG5cblx0XHR3aGlsZSAoIXBhcmVudERvbU5vZGUgJiYgcGFyZW50V3JhcHBlcikge1xuXHRcdFx0aWYgKCFwYXJlbnREb21Ob2RlICYmIGlzVk5vZGVXcmFwcGVyKHBhcmVudFdyYXBwZXIpICYmIHBhcmVudFdyYXBwZXIuZG9tTm9kZSkge1xuXHRcdFx0XHRwYXJlbnREb21Ob2RlID0gcGFyZW50V3JhcHBlci5kb21Ob2RlO1xuXHRcdFx0fVxuXHRcdFx0cGFyZW50V3JhcHBlciA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChwYXJlbnRXcmFwcGVyKTtcblx0XHR9XG5cdFx0cmV0dXJuIHBhcmVudERvbU5vZGU7XG5cdH1cblxuXHRmdW5jdGlvbiBydW5EZWZlcnJlZFByb3BlcnRpZXMobmV4dDogVk5vZGVXcmFwcGVyKSB7XG5cdFx0aWYgKG5leHQubm9kZS5kZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjaykge1xuXHRcdFx0Y29uc3QgcHJvcGVydGllcyA9IG5leHQubm9kZS5wcm9wZXJ0aWVzO1xuXHRcdFx0bmV4dC5ub2RlLnByb3BlcnRpZXMgPSB7IC4uLm5leHQubm9kZS5kZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjayh0cnVlKSwgLi4ubmV4dC5ub2RlLm9yaWdpbmFsUHJvcGVydGllcyB9O1xuXHRcdFx0X2FmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xuXHRcdFx0XHRwcm9jZXNzUHJvcGVydGllcyhuZXh0LCB7IHByb3BlcnRpZXMgfSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBmaW5kSW5zZXJ0QmVmb3JlKG5leHQ6IEROb2RlV3JhcHBlcikge1xuXHRcdGxldCBpbnNlcnRCZWZvcmU6IE5vZGUgfCBudWxsID0gbnVsbDtcblx0XHRsZXQgc2VhcmNoTm9kZTogRE5vZGVXcmFwcGVyIHwgdW5kZWZpbmVkID0gbmV4dDtcblx0XHR3aGlsZSAoIWluc2VydEJlZm9yZSkge1xuXHRcdFx0Y29uc3QgbmV4dFNpYmxpbmcgPSBfd3JhcHBlclNpYmxpbmdNYXAuZ2V0KHNlYXJjaE5vZGUpO1xuXHRcdFx0aWYgKG5leHRTaWJsaW5nKSB7XG5cdFx0XHRcdGlmIChpc1ZOb2RlV3JhcHBlcihuZXh0U2libGluZykpIHtcblx0XHRcdFx0XHRpZiAobmV4dFNpYmxpbmcuZG9tTm9kZSAmJiBuZXh0U2libGluZy5kb21Ob2RlLnBhcmVudE5vZGUpIHtcblx0XHRcdFx0XHRcdGluc2VydEJlZm9yZSA9IG5leHRTaWJsaW5nLmRvbU5vZGU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c2VhcmNoTm9kZSA9IG5leHRTaWJsaW5nO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChuZXh0U2libGluZy5kb21Ob2RlICYmIG5leHRTaWJsaW5nLmRvbU5vZGUucGFyZW50Tm9kZSkge1xuXHRcdFx0XHRcdGluc2VydEJlZm9yZSA9IG5leHRTaWJsaW5nLmRvbU5vZGU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0c2VhcmNoTm9kZSA9IG5leHRTaWJsaW5nO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHNlYXJjaE5vZGUgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQoc2VhcmNoTm9kZSk7XG5cdFx0XHRpZiAoIXNlYXJjaE5vZGUgfHwgaXNWTm9kZVdyYXBwZXIoc2VhcmNoTm9kZSkpIHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpbnNlcnRCZWZvcmU7XG5cdH1cblxuXHRmdW5jdGlvbiBzZXRQcm9wZXJ0aWVzKFxuXHRcdGRvbU5vZGU6IEhUTUxFbGVtZW50LFxuXHRcdGN1cnJlbnRQcm9wZXJ0aWVzOiBWTm9kZVByb3BlcnRpZXMgPSB7fSxcblx0XHRuZXh0V3JhcHBlcjogVk5vZGVXcmFwcGVyLFxuXHRcdGluY2x1ZGVzRXZlbnRzQW5kQXR0cmlidXRlcyA9IHRydWVcblx0KTogdm9pZCB7XG5cdFx0Y29uc3QgcHJvcE5hbWVzID0gT2JqZWN0LmtleXMobmV4dFdyYXBwZXIubm9kZS5wcm9wZXJ0aWVzKTtcblx0XHRjb25zdCBwcm9wQ291bnQgPSBwcm9wTmFtZXMubGVuZ3RoO1xuXHRcdGlmIChwcm9wTmFtZXMuaW5kZXhPZignY2xhc3NlcycpID09PSAtMSAmJiBjdXJyZW50UHJvcGVydGllcy5jbGFzc2VzKSB7XG5cdFx0XHRkb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcblx0XHR9XG5cblx0XHRpbmNsdWRlc0V2ZW50c0FuZEF0dHJpYnV0ZXMgJiYgcmVtb3ZlT3JwaGFuZWRFdmVudHMoZG9tTm9kZSwgY3VycmVudFByb3BlcnRpZXMsIG5leHRXcmFwcGVyLm5vZGUucHJvcGVydGllcyk7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHByb3BDb3VudDsgaSsrKSB7XG5cdFx0XHRjb25zdCBwcm9wTmFtZSA9IHByb3BOYW1lc1tpXTtcblx0XHRcdGxldCBwcm9wVmFsdWUgPSBuZXh0V3JhcHBlci5ub2RlLnByb3BlcnRpZXNbcHJvcE5hbWVdO1xuXHRcdFx0Y29uc3QgcHJldmlvdXNWYWx1ZSA9IGN1cnJlbnRQcm9wZXJ0aWVzW3Byb3BOYW1lXTtcblx0XHRcdGlmIChwcm9wTmFtZSA9PT0gJ2NsYXNzZXMnKSB7XG5cdFx0XHRcdGNvbnN0IHByZXZpb3VzQ2xhc3NTdHJpbmcgPSBjcmVhdGVDbGFzc1Byb3BWYWx1ZShwcmV2aW91c1ZhbHVlKTtcblx0XHRcdFx0bGV0IGN1cnJlbnRDbGFzc1N0cmluZyA9IGNyZWF0ZUNsYXNzUHJvcFZhbHVlKHByb3BWYWx1ZSk7XG5cdFx0XHRcdGlmIChwcmV2aW91c0NsYXNzU3RyaW5nICE9PSBjdXJyZW50Q2xhc3NTdHJpbmcpIHtcblx0XHRcdFx0XHRpZiAoY3VycmVudENsYXNzU3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRpZiAobmV4dFdyYXBwZXIubWVyZ2VkKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGRvbUNsYXNzZXMgPSAoZG9tTm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJycpLnNwbGl0KCcgJyk7XG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZG9tQ2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChjdXJyZW50Q2xhc3NTdHJpbmcuaW5kZXhPZihkb21DbGFzc2VzW2ldKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRDbGFzc1N0cmluZyA9IGAke2RvbUNsYXNzZXNbaV19ICR7Y3VycmVudENsYXNzU3RyaW5nfWA7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkb21Ob2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjdXJyZW50Q2xhc3NTdHJpbmcpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRkb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAobm9kZU9wZXJhdGlvbnMuaW5kZXhPZihwcm9wTmFtZSkgIT09IC0xKSB7XG5cdFx0XHRcdG5vZGVPcGVyYXRpb24ocHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXNWYWx1ZSwgZG9tTm9kZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHByb3BOYW1lID09PSAnc3R5bGVzJykge1xuXHRcdFx0XHRjb25zdCBzdHlsZU5hbWVzID0gT2JqZWN0LmtleXMocHJvcFZhbHVlKTtcblx0XHRcdFx0Y29uc3Qgc3R5bGVDb3VudCA9IHN0eWxlTmFtZXMubGVuZ3RoO1xuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHN0eWxlQ291bnQ7IGorKykge1xuXHRcdFx0XHRcdGNvbnN0IHN0eWxlTmFtZSA9IHN0eWxlTmFtZXNbal07XG5cdFx0XHRcdFx0Y29uc3QgbmV3U3R5bGVWYWx1ZSA9IHByb3BWYWx1ZVtzdHlsZU5hbWVdO1xuXHRcdFx0XHRcdGNvbnN0IG9sZFN0eWxlVmFsdWUgPSBwcmV2aW91c1ZhbHVlICYmIHByZXZpb3VzVmFsdWVbc3R5bGVOYW1lXTtcblx0XHRcdFx0XHRpZiAobmV3U3R5bGVWYWx1ZSA9PT0gb2xkU3R5bGVWYWx1ZSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdChkb21Ob2RlLnN0eWxlIGFzIGFueSlbc3R5bGVOYW1lXSA9IG5ld1N0eWxlVmFsdWUgfHwgJyc7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghcHJvcFZhbHVlICYmIHR5cGVvZiBwcmV2aW91c1ZhbHVlID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdHByb3BWYWx1ZSA9ICcnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChwcm9wTmFtZSA9PT0gJ3ZhbHVlJykge1xuXHRcdFx0XHRcdGNvbnN0IGRvbVZhbHVlID0gKGRvbU5vZGUgYXMgYW55KVtwcm9wTmFtZV07XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0ZG9tVmFsdWUgIT09IHByb3BWYWx1ZSAmJlxuXHRcdFx0XHRcdFx0KChkb21Ob2RlIGFzIGFueSlbJ29uaW5wdXQtdmFsdWUnXVxuXHRcdFx0XHRcdFx0XHQ/IGRvbVZhbHVlID09PSAoZG9tTm9kZSBhcyBhbnkpWydvbmlucHV0LXZhbHVlJ11cblx0XHRcdFx0XHRcdFx0OiBwcm9wVmFsdWUgIT09IHByZXZpb3VzVmFsdWUpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHQoZG9tTm9kZSBhcyBhbnkpW3Byb3BOYW1lXSA9IHByb3BWYWx1ZTtcblx0XHRcdFx0XHRcdChkb21Ob2RlIGFzIGFueSlbJ29uaW5wdXQtdmFsdWUnXSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocHJvcE5hbWUgIT09ICdrZXknICYmIHByb3BWYWx1ZSAhPT0gcHJldmlvdXNWYWx1ZSkge1xuXHRcdFx0XHRcdGNvbnN0IHR5cGUgPSB0eXBlb2YgcHJvcFZhbHVlO1xuXHRcdFx0XHRcdGlmICh0eXBlID09PSAnZnVuY3Rpb24nICYmIHByb3BOYW1lLmxhc3RJbmRleE9mKCdvbicsIDApID09PSAwICYmIGluY2x1ZGVzRXZlbnRzQW5kQXR0cmlidXRlcykge1xuXHRcdFx0XHRcdFx0dXBkYXRlRXZlbnQoZG9tTm9kZSwgcHJvcE5hbWUuc3Vic3RyKDIpLCBwcm9wVmFsdWUsIG5leHRXcmFwcGVyLm5vZGUuYmluZCwgcHJldmlvdXNWYWx1ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBwcm9wTmFtZSAhPT0gJ2lubmVySFRNTCcgJiYgaW5jbHVkZXNFdmVudHNBbmRBdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGVBdHRyaWJ1dGUoZG9tTm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgbmV4dFdyYXBwZXIubmFtZXNwYWNlKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHByb3BOYW1lID09PSAnc2Nyb2xsTGVmdCcgfHwgcHJvcE5hbWUgPT09ICdzY3JvbGxUb3AnKSB7XG5cdFx0XHRcdFx0XHRpZiAoKGRvbU5vZGUgYXMgYW55KVtwcm9wTmFtZV0gIT09IHByb3BWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHQoZG9tTm9kZSBhcyBhbnkpW3Byb3BOYW1lXSA9IHByb3BWYWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0KGRvbU5vZGUgYXMgYW55KVtwcm9wTmFtZV0gPSBwcm9wVmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcnVuRGVmZXJyZWRSZW5kZXJDYWxsYmFja3MoKSB7XG5cdFx0Y29uc3QgeyBzeW5jIH0gPSBfbW91bnRPcHRpb25zO1xuXHRcdGNvbnN0IGNhbGxiYWNrcyA9IF9kZWZlcnJlZFJlbmRlckNhbGxiYWNrcztcblx0XHRfZGVmZXJyZWRSZW5kZXJDYWxsYmFja3MgPSBbXTtcblx0XHRpZiAoY2FsbGJhY2tzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgcnVuID0gKCkgPT4ge1xuXHRcdFx0XHRsZXQgY2FsbGJhY2s6IEZ1bmN0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHR3aGlsZSAoKGNhbGxiYWNrID0gY2FsbGJhY2tzLnNoaWZ0KCkpKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChzeW5jKSB7XG5cdFx0XHRcdHJ1bigpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Z2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZShydW4pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJ1bkFmdGVyUmVuZGVyQ2FsbGJhY2tzKCkge1xuXHRcdGNvbnN0IHsgc3luYyB9ID0gX21vdW50T3B0aW9ucztcblx0XHRjb25zdCBjYWxsYmFja3MgPSBfYWZ0ZXJSZW5kZXJDYWxsYmFja3M7XG5cdFx0X2FmdGVyUmVuZGVyQ2FsbGJhY2tzID0gW107XG5cdFx0aWYgKGNhbGxiYWNrcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHJ1biA9ICgpID0+IHtcblx0XHRcdFx0bGV0IGNhbGxiYWNrOiBGdW5jdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdFx0d2hpbGUgKChjYWxsYmFjayA9IGNhbGxiYWNrcy5zaGlmdCgpKSkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRpZiAoc3luYykge1xuXHRcdFx0XHRydW4oKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChnbG9iYWwucmVxdWVzdElkbGVDYWxsYmFjaykge1xuXHRcdFx0XHRcdGdsb2JhbC5yZXF1ZXN0SWRsZUNhbGxiYWNrKHJ1bik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChydW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcHJvY2Vzc1Byb3BlcnRpZXMobmV4dDogVk5vZGVXcmFwcGVyLCBwcmV2aW91c1Byb3BlcnRpZXM6IFByZXZpb3VzUHJvcGVydGllcykge1xuXHRcdGlmIChuZXh0Lm5vZGUuYXR0cmlidXRlcyAmJiBuZXh0Lm5vZGUuZXZlbnRzKSB7XG5cdFx0XHR1cGRhdGVBdHRyaWJ1dGVzKFxuXHRcdFx0XHRuZXh0LmRvbU5vZGUgYXMgSFRNTEVsZW1lbnQsXG5cdFx0XHRcdHByZXZpb3VzUHJvcGVydGllcy5hdHRyaWJ1dGVzIHx8IHt9LFxuXHRcdFx0XHRuZXh0Lm5vZGUuYXR0cmlidXRlcyxcblx0XHRcdFx0bmV4dC5uYW1lc3BhY2Vcblx0XHRcdCk7XG5cdFx0XHRzZXRQcm9wZXJ0aWVzKG5leHQuZG9tTm9kZSBhcyBIVE1MRWxlbWVudCwgcHJldmlvdXNQcm9wZXJ0aWVzLnByb3BlcnRpZXMsIG5leHQsIGZhbHNlKTtcblx0XHRcdGNvbnN0IGV2ZW50cyA9IG5leHQubm9kZS5ldmVudHMgfHwge307XG5cdFx0XHRpZiAocHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50cykge1xuXHRcdFx0XHRyZW1vdmVPcnBoYW5lZEV2ZW50cyhcblx0XHRcdFx0XHRuZXh0LmRvbU5vZGUgYXMgSFRNTEVsZW1lbnQsXG5cdFx0XHRcdFx0cHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50cyB8fCB7fSxcblx0XHRcdFx0XHRuZXh0Lm5vZGUuZXZlbnRzLFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdHByZXZpb3VzUHJvcGVydGllcy5ldmVudHMgPSBwcmV2aW91c1Byb3BlcnRpZXMuZXZlbnRzIHx8IHt9O1xuXHRcdFx0T2JqZWN0LmtleXMoZXZlbnRzKS5mb3JFYWNoKChldmVudCkgPT4ge1xuXHRcdFx0XHR1cGRhdGVFdmVudChcblx0XHRcdFx0XHRuZXh0LmRvbU5vZGUgYXMgSFRNTEVsZW1lbnQsXG5cdFx0XHRcdFx0ZXZlbnQsXG5cdFx0XHRcdFx0ZXZlbnRzW2V2ZW50XSxcblx0XHRcdFx0XHRuZXh0Lm5vZGUuYmluZCxcblx0XHRcdFx0XHRwcmV2aW91c1Byb3BlcnRpZXMuZXZlbnRzW2V2ZW50XVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNldFByb3BlcnRpZXMobmV4dC5kb21Ob2RlIGFzIEhUTUxFbGVtZW50LCBwcmV2aW91c1Byb3BlcnRpZXMucHJvcGVydGllcywgbmV4dCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbW91bnQobW91bnRPcHRpb25zOiBQYXJ0aWFsPE1vdW50T3B0aW9ucz4gPSB7fSkge1xuXHRcdF9tb3VudE9wdGlvbnMgPSB7IC4uLl9tb3VudE9wdGlvbnMsIC4uLm1vdW50T3B0aW9ucyB9O1xuXHRcdGNvbnN0IHsgZG9tTm9kZSB9ID0gX21vdW50T3B0aW9ucztcblx0XHRsZXQgcmVuZGVyUmVzdWx0ID0gcmVuZGVyZXIoKTtcblx0XHRpZiAoaXNWTm9kZShyZW5kZXJSZXN1bHQpKSB7XG5cdFx0XHRyZW5kZXJSZXN1bHQgPSB3KHdyYXBWTm9kZXMocmVuZGVyUmVzdWx0KSwge30pO1xuXHRcdH1cblx0XHRjb25zdCBuZXh0V3JhcHBlciA9IHtcblx0XHRcdG5vZGU6IHJlbmRlclJlc3VsdCxcblx0XHRcdGRlcHRoOiAxXG5cdFx0fTtcblx0XHRfcGFyZW50V3JhcHBlck1hcC5zZXQobmV4dFdyYXBwZXIsIHsgZGVwdGg6IDAsIGRvbU5vZGUsIG5vZGU6IHYoJ2Zha2UnKSB9KTtcblx0XHRfcHJvY2Vzc1F1ZXVlLnB1c2goe1xuXHRcdFx0Y3VycmVudDogW10sXG5cdFx0XHRuZXh0OiBbbmV4dFdyYXBwZXJdLFxuXHRcdFx0bWV0YTogeyBtZXJnZU5vZGVzOiBhcnJheUZyb20oZG9tTm9kZS5jaGlsZE5vZGVzKSB9XG5cdFx0fSk7XG5cdFx0X3J1blByb2Nlc3NRdWV1ZSgpO1xuXHRcdF9tb3VudE9wdGlvbnMubWVyZ2UgPSBmYWxzZTtcblx0XHRfcnVuRG9tSW5zdHJ1Y3Rpb25RdWV1ZSgpO1xuXHRcdF9ydW5DYWxsYmFja3MoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGludmFsaWRhdGUoKSB7XG5cdFx0cGFyZW50SW52YWxpZGF0ZSAmJiBwYXJlbnRJbnZhbGlkYXRlKCk7XG5cdH1cblxuXHRmdW5jdGlvbiBfc2NoZWR1bGUoKTogdm9pZCB7XG5cdFx0Y29uc3QgeyBzeW5jIH0gPSBfbW91bnRPcHRpb25zO1xuXHRcdGlmIChzeW5jKSB7XG5cdFx0XHRfcnVuSW52YWxpZGF0aW9uUXVldWUoKTtcblx0XHR9IGVsc2UgaWYgKCFfcmVuZGVyU2NoZWR1bGVkKSB7XG5cdFx0XHRfcmVuZGVyU2NoZWR1bGVkID0gZ2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRcdF9ydW5JbnZhbGlkYXRpb25RdWV1ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gX3J1bkludmFsaWRhdGlvblF1ZXVlKCkge1xuXHRcdF9yZW5kZXJTY2hlZHVsZWQgPSB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgaW52YWxpZGF0aW9uUXVldWUgPSBbLi4uX2ludmFsaWRhdGlvblF1ZXVlXTtcblx0XHRjb25zdCBwcmV2aW91c2x5UmVuZGVyZWQgPSBbXTtcblx0XHRfaW52YWxpZGF0aW9uUXVldWUgPSBbXTtcblx0XHRpbnZhbGlkYXRpb25RdWV1ZS5zb3J0KChhLCBiKSA9PiBiLmRlcHRoIC0gYS5kZXB0aCk7XG5cdFx0bGV0IGl0ZW06IEludmFsaWRhdGlvblF1ZXVlSXRlbSB8IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAoKGl0ZW0gPSBpbnZhbGlkYXRpb25RdWV1ZS5wb3AoKSkpIHtcblx0XHRcdGxldCB7IGluc3RhbmNlIH0gPSBpdGVtO1xuXHRcdFx0aWYgKHByZXZpb3VzbHlSZW5kZXJlZC5pbmRleE9mKGluc3RhbmNlKSA9PT0gLTEgJiYgX2luc3RhbmNlVG9XcmFwcGVyTWFwLmhhcyhpbnN0YW5jZSEpKSB7XG5cdFx0XHRcdHByZXZpb3VzbHlSZW5kZXJlZC5wdXNoKGluc3RhbmNlKTtcblx0XHRcdFx0Y29uc3QgY3VycmVudCA9IF9pbnN0YW5jZVRvV3JhcHBlck1hcC5nZXQoaW5zdGFuY2UpITtcblx0XHRcdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KGluc3RhbmNlKSE7XG5cdFx0XHRcdGNvbnN0IHBhcmVudCA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChjdXJyZW50KTtcblx0XHRcdFx0Y29uc3Qgc2libGluZyA9IF93cmFwcGVyU2libGluZ01hcC5nZXQoY3VycmVudCk7XG5cdFx0XHRcdGNvbnN0IHsgY29uc3RydWN0b3IsIGNoaWxkcmVuIH0gPSBpbnN0YW5jZTtcblx0XHRcdFx0Y29uc3QgbmV4dCA9IHtcblx0XHRcdFx0XHRub2RlOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBXTk9ERSxcblx0XHRcdFx0XHRcdHdpZGdldENvbnN0cnVjdG9yOiBjb25zdHJ1Y3RvciBhcyBXaWRnZXRCYXNlQ29uc3RydWN0b3IsXG5cdFx0XHRcdFx0XHRwcm9wZXJ0aWVzOiBpbnN0YW5jZURhdGEuaW5wdXRQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdFx0Y2hpbGRyZW46IGNoaWxkcmVuLFxuXHRcdFx0XHRcdFx0YmluZDogY3VycmVudC5ub2RlLmJpbmRcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGluc3RhbmNlLFxuXHRcdFx0XHRcdGRlcHRoOiBjdXJyZW50LmRlcHRoXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cGFyZW50ICYmIF9wYXJlbnRXcmFwcGVyTWFwLnNldChuZXh0LCBwYXJlbnQpO1xuXHRcdFx0XHRzaWJsaW5nICYmIF93cmFwcGVyU2libGluZ01hcC5zZXQobmV4dCwgc2libGluZyk7XG5cdFx0XHRcdGNvbnN0IHsgaXRlbSB9ID0gX3VwZGF0ZVdpZGdldCh7IGN1cnJlbnQsIG5leHQgfSk7XG5cdFx0XHRcdGlmIChpdGVtKSB7XG5cdFx0XHRcdFx0X3Byb2Nlc3NRdWV1ZS5wdXNoKGl0ZW0pO1xuXHRcdFx0XHRcdGluc3RhbmNlICYmIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5zZXQoaW5zdGFuY2UsIG5leHQpO1xuXHRcdFx0XHRcdF9ydW5Qcm9jZXNzUXVldWUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRfcnVuRG9tSW5zdHJ1Y3Rpb25RdWV1ZSgpO1xuXHRcdF9ydW5DYWxsYmFja3MoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9ydW5Qcm9jZXNzUXVldWUoKSB7XG5cdFx0bGV0IGl0ZW06IERldGFjaEFwcGxpY2F0aW9uIHwgQXR0YWNoQXBwbGljYXRpb24gfCBQcm9jZXNzSXRlbSB8IHVuZGVmaW5lZDtcblx0XHR3aGlsZSAoKGl0ZW0gPSBfcHJvY2Vzc1F1ZXVlLnBvcCgpKSkge1xuXHRcdFx0aWYgKGlzQXR0YWNoQXBwbGljYXRpb24oaXRlbSkpIHtcblx0XHRcdFx0X2FwcGxpY2F0aW9uUXVldWUucHVzaChpdGVtKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHsgY3VycmVudCwgbmV4dCwgbWV0YSB9ID0gaXRlbTtcblx0XHRcdFx0X3Byb2Nlc3MoY3VycmVudCB8fCBFTVBUWV9BUlJBWSwgbmV4dCB8fCBFTVBUWV9BUlJBWSwgbWV0YSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gX3J1bkRvbUluc3RydWN0aW9uUXVldWUoKTogdm9pZCB7XG5cdFx0X2FwcGxpY2F0aW9uUXVldWUucmV2ZXJzZSgpO1xuXHRcdGxldCBpdGVtOiBBcHBsaWNhdGlvbkluc3RydWN0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdHdoaWxlICgoaXRlbSA9IF9hcHBsaWNhdGlvblF1ZXVlLnBvcCgpKSkge1xuXHRcdFx0aWYgKGl0ZW0udHlwZSA9PT0gJ2NyZWF0ZScpIHtcblx0XHRcdFx0Y29uc3Qge1xuXHRcdFx0XHRcdHBhcmVudERvbU5vZGUsXG5cdFx0XHRcdFx0bmV4dCxcblx0XHRcdFx0XHRuZXh0OiB7XG5cdFx0XHRcdFx0XHRkb21Ob2RlLFxuXHRcdFx0XHRcdFx0bWVyZ2VkLFxuXHRcdFx0XHRcdFx0cmVxdWlyZXNJbnNlcnRCZWZvcmUsXG5cdFx0XHRcdFx0XHRub2RlOiB7IHByb3BlcnRpZXMgfVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSA9IGl0ZW07XG5cblx0XHRcdFx0cHJvY2Vzc1Byb3BlcnRpZXMobmV4dCwgeyBwcm9wZXJ0aWVzOiB7fSB9KTtcblx0XHRcdFx0cnVuRGVmZXJyZWRQcm9wZXJ0aWVzKG5leHQpO1xuXHRcdFx0XHRpZiAoIW1lcmdlZCkge1xuXHRcdFx0XHRcdGxldCBpbnNlcnRCZWZvcmU6IGFueTtcblx0XHRcdFx0XHRpZiAocmVxdWlyZXNJbnNlcnRCZWZvcmUpIHtcblx0XHRcdFx0XHRcdGluc2VydEJlZm9yZSA9IGZpbmRJbnNlcnRCZWZvcmUobmV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHBhcmVudERvbU5vZGUuaW5zZXJ0QmVmb3JlKGRvbU5vZGUhLCBpbnNlcnRCZWZvcmUpO1xuXHRcdFx0XHRcdGlmIChpc0RvbVZOb2RlKG5leHQubm9kZSkgJiYgbmV4dC5ub2RlLm9uQXR0YWNoKSB7XG5cdFx0XHRcdFx0XHRuZXh0Lm5vZGUub25BdHRhY2goKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cnVuRW50ZXJBbmltYXRpb24obmV4dCwgX21vdW50T3B0aW9ucy50cmFuc2l0aW9uKTtcblx0XHRcdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KG5leHQubm9kZS5iaW5kIGFzIFdpZGdldEJhc2UpO1xuXHRcdFx0XHRpZiAocHJvcGVydGllcy5rZXkgIT0gbnVsbCAmJiBpbnN0YW5jZURhdGEpIHtcblx0XHRcdFx0XHRpbnN0YW5jZURhdGEubm9kZUhhbmRsZXIuYWRkKGRvbU5vZGUgYXMgSFRNTEVsZW1lbnQsIGAke3Byb3BlcnRpZXMua2V5fWApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGl0ZW0ubmV4dC5pbnNlcnRlZCA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ3VwZGF0ZScpIHtcblx0XHRcdFx0Y29uc3Qge1xuXHRcdFx0XHRcdG5leHQsXG5cdFx0XHRcdFx0bmV4dDogeyBkb21Ob2RlLCBub2RlIH0sXG5cdFx0XHRcdFx0Y3VycmVudFxuXHRcdFx0XHR9ID0gaXRlbTtcblx0XHRcdFx0Y29uc3QgcGFyZW50ID0gX3BhcmVudFdyYXBwZXJNYXAuZ2V0KG5leHQpO1xuXHRcdFx0XHRpZiAocGFyZW50ICYmIGlzV05vZGVXcmFwcGVyKHBhcmVudCkgJiYgcGFyZW50Lmluc3RhbmNlKSB7XG5cdFx0XHRcdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHBhcmVudC5pbnN0YW5jZSk7XG5cdFx0XHRcdFx0aW5zdGFuY2VEYXRhICYmIGluc3RhbmNlRGF0YS5ub2RlSGFuZGxlci5hZGRSb290KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBwcmV2aW91c1Byb3BlcnRpZXMgPSBidWlsZFByZXZpb3VzUHJvcGVydGllcyhkb21Ob2RlLCBjdXJyZW50LCBuZXh0KTtcblx0XHRcdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KG5leHQubm9kZS5iaW5kIGFzIFdpZGdldEJhc2UpO1xuXG5cdFx0XHRcdHByb2Nlc3NQcm9wZXJ0aWVzKG5leHQsIHByZXZpb3VzUHJvcGVydGllcyk7XG5cdFx0XHRcdHJ1bkRlZmVycmVkUHJvcGVydGllcyhuZXh0KTtcblxuXHRcdFx0XHRpZiAoaW5zdGFuY2VEYXRhICYmIG5vZGUucHJvcGVydGllcy5rZXkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGluc3RhbmNlRGF0YS5ub2RlSGFuZGxlci5hZGQobmV4dC5kb21Ob2RlIGFzIEhUTUxFbGVtZW50LCBgJHtub2RlLnByb3BlcnRpZXMua2V5fWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ2RlbGV0ZScpIHtcblx0XHRcdFx0Y29uc3QgeyBjdXJyZW50IH0gPSBpdGVtO1xuXHRcdFx0XHRpZiAoY3VycmVudC5ub2RlLnByb3BlcnRpZXMuZXhpdEFuaW1hdGlvbikge1xuXHRcdFx0XHRcdHJ1bkV4aXRBbmltYXRpb24oY3VycmVudCwgX21vdW50T3B0aW9ucy50cmFuc2l0aW9uKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjdXJyZW50LmRvbU5vZGUhLnBhcmVudE5vZGUhLnJlbW92ZUNoaWxkKGN1cnJlbnQuZG9tTm9kZSEpO1xuXHRcdFx0XHRcdGN1cnJlbnQuZG9tTm9kZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdhdHRhY2gnKSB7XG5cdFx0XHRcdGNvbnN0IHsgaW5zdGFuY2UsIGF0dGFjaGVkIH0gPSBpdGVtO1xuXHRcdFx0XHRjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaW5zdGFuY2UpITtcblx0XHRcdFx0aW5zdGFuY2VEYXRhLm5vZGVIYW5kbGVyLmFkZFJvb3QoKTtcblx0XHRcdFx0YXR0YWNoZWQgJiYgaW5zdGFuY2VEYXRhLm9uQXR0YWNoKCk7XG5cdFx0XHR9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ2RldGFjaCcpIHtcblx0XHRcdFx0aWYgKGl0ZW0uY3VycmVudC5pbnN0YW5jZSkge1xuXHRcdFx0XHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChpdGVtLmN1cnJlbnQuaW5zdGFuY2UpO1xuXHRcdFx0XHRcdGluc3RhbmNlRGF0YSAmJiBpbnN0YW5jZURhdGEub25EZXRhY2goKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpdGVtLmN1cnJlbnQuZG9tTm9kZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0aXRlbS5jdXJyZW50Lm5vZGUuYmluZCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0aXRlbS5jdXJyZW50Lmluc3RhbmNlID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIF9ydW5DYWxsYmFja3MoKSB7XG5cdFx0cnVuQWZ0ZXJSZW5kZXJDYWxsYmFja3MoKTtcblx0XHRydW5EZWZlcnJlZFJlbmRlckNhbGxiYWNrcygpO1xuXHR9XG5cblx0ZnVuY3Rpb24gX3Byb2Nlc3NNZXJnZU5vZGVzKG5leHQ6IEROb2RlV3JhcHBlciwgbWVyZ2VOb2RlczogTm9kZVtdKSB7XG5cdFx0Y29uc3QgeyBtZXJnZSB9ID0gX21vdW50T3B0aW9ucztcblx0XHRpZiAobWVyZ2UgJiYgbWVyZ2VOb2Rlcy5sZW5ndGgpIHtcblx0XHRcdGlmIChpc1ZOb2RlV3JhcHBlcihuZXh0KSkge1xuXHRcdFx0XHRsZXQge1xuXHRcdFx0XHRcdG5vZGU6IHsgdGFnIH1cblx0XHRcdFx0fSA9IG5leHQ7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbWVyZ2VOb2Rlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNvbnN0IGRvbUVsZW1lbnQgPSBtZXJnZU5vZGVzW2ldIGFzIEVsZW1lbnQ7XG5cdFx0XHRcdFx0aWYgKHRhZy50b1VwcGVyQ2FzZSgpID09PSAoZG9tRWxlbWVudC50YWdOYW1lIHx8ICcnKSkge1xuXHRcdFx0XHRcdFx0bWVyZ2VOb2Rlcy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRuZXh0LmRvbU5vZGUgPSBkb21FbGVtZW50O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuZXh0Lm1lcmdlTm9kZXMgPSBtZXJnZU5vZGVzO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY2hpbGROb2RlczogRE5vZGVXcmFwcGVyW10sIGluZGV4OiBudW1iZXIpIHtcblx0XHRfYWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaCgoKSA9PiB7XG5cdFx0XHRjb25zdCBwYXJlbnRXTm9kZVdyYXBwZXIgPSBmaW5kUGFyZW50V05vZGVXcmFwcGVyKGNoaWxkTm9kZXNbaW5kZXhdKTtcblx0XHRcdGNoZWNrRGlzdGluZ3Vpc2hhYmxlKGNoaWxkTm9kZXMsIGluZGV4LCBwYXJlbnRXTm9kZVdyYXBwZXIpO1xuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gX3Byb2Nlc3MoY3VycmVudDogRE5vZGVXcmFwcGVyW10sIG5leHQ6IEROb2RlV3JhcHBlcltdLCBtZXRhOiBQcm9jZXNzTWV0YSA9IHt9KTogdm9pZCB7XG5cdFx0bGV0IHsgbWVyZ2VOb2RlcyA9IFtdLCBvbGRJbmRleCA9IDAsIG5ld0luZGV4ID0gMCB9ID0gbWV0YTtcblx0XHRjb25zdCBjdXJyZW50TGVuZ3RoID0gY3VycmVudC5sZW5ndGg7XG5cdFx0Y29uc3QgbmV4dExlbmd0aCA9IG5leHQubGVuZ3RoO1xuXHRcdGNvbnN0IGhhc1ByZXZpb3VzU2libGluZ3MgPSBjdXJyZW50TGVuZ3RoID4gMSB8fCAoY3VycmVudExlbmd0aCA+IDAgJiYgY3VycmVudExlbmd0aCA8IG5leHRMZW5ndGgpO1xuXHRcdGNvbnN0IGluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuXHRcdGlmIChuZXdJbmRleCA8IG5leHRMZW5ndGgpIHtcblx0XHRcdGxldCBjdXJyZW50V3JhcHBlciA9IG9sZEluZGV4IDwgY3VycmVudExlbmd0aCA/IGN1cnJlbnRbb2xkSW5kZXhdIDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgbmV4dFdyYXBwZXIgPSBuZXh0W25ld0luZGV4XTtcblx0XHRcdG5leHRXcmFwcGVyLmhhc1ByZXZpb3VzU2libGluZ3MgPSBoYXNQcmV2aW91c1NpYmxpbmdzO1xuXG5cdFx0XHRfcHJvY2Vzc01lcmdlTm9kZXMobmV4dFdyYXBwZXIsIG1lcmdlTm9kZXMpO1xuXG5cdFx0XHRpZiAoY3VycmVudFdyYXBwZXIgJiYgc2FtZShjdXJyZW50V3JhcHBlciwgbmV4dFdyYXBwZXIpKSB7XG5cdFx0XHRcdG9sZEluZGV4Kys7XG5cdFx0XHRcdG5ld0luZGV4Kys7XG5cdFx0XHRcdGlmIChpc1ZOb2RlV3JhcHBlcihjdXJyZW50V3JhcHBlcikgJiYgaXNWTm9kZVdyYXBwZXIobmV4dFdyYXBwZXIpKSB7XG5cdFx0XHRcdFx0bmV4dFdyYXBwZXIuaW5zZXJ0ZWQgPSBjdXJyZW50V3JhcHBlci5pbnNlcnRlZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpbnN0cnVjdGlvbnMucHVzaCh7IGN1cnJlbnQ6IGN1cnJlbnRXcmFwcGVyLCBuZXh0OiBuZXh0V3JhcHBlciB9KTtcblx0XHRcdH0gZWxzZSBpZiAoIWN1cnJlbnRXcmFwcGVyIHx8IGZpbmRJbmRleE9mQ2hpbGQoY3VycmVudCwgbmV4dFdyYXBwZXIsIG9sZEluZGV4ICsgMSkgPT09IC0xKSB7XG5cdFx0XHRcdGhhcygnZG9qby1kZWJ1ZycpICYmIGN1cnJlbnQubGVuZ3RoICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2sobmV4dCwgbmV3SW5kZXgpO1xuXHRcdFx0XHRpbnN0cnVjdGlvbnMucHVzaCh7IGN1cnJlbnQ6IHVuZGVmaW5lZCwgbmV4dDogbmV4dFdyYXBwZXIgfSk7XG5cdFx0XHRcdG5ld0luZGV4Kys7XG5cdFx0XHR9IGVsc2UgaWYgKGZpbmRJbmRleE9mQ2hpbGQobmV4dCwgY3VycmVudFdyYXBwZXIsIG5ld0luZGV4ICsgMSkgPT09IC0xKSB7XG5cdFx0XHRcdGhhcygnZG9qby1kZWJ1ZycpICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY3VycmVudCwgb2xkSW5kZXgpO1xuXHRcdFx0XHRpbnN0cnVjdGlvbnMucHVzaCh7IGN1cnJlbnQ6IGN1cnJlbnRXcmFwcGVyLCBuZXh0OiB1bmRlZmluZWQgfSk7XG5cdFx0XHRcdG9sZEluZGV4Kys7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRoYXMoJ2Rvam8tZGVidWcnKSAmJiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKG5leHQsIG5ld0luZGV4KTtcblx0XHRcdFx0aGFzKCdkb2pvLWRlYnVnJykgJiYgcmVnaXN0ZXJEaXN0aW5ndWlzaGFibGVDYWxsYmFjayhjdXJyZW50LCBvbGRJbmRleCk7XG5cdFx0XHRcdGluc3RydWN0aW9ucy5wdXNoKHsgY3VycmVudDogY3VycmVudFdyYXBwZXIsIG5leHQ6IHVuZGVmaW5lZCB9KTtcblx0XHRcdFx0aW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiB1bmRlZmluZWQsIG5leHQ6IG5leHRXcmFwcGVyIH0pO1xuXHRcdFx0XHRvbGRJbmRleCsrO1xuXHRcdFx0XHRuZXdJbmRleCsrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChuZXdJbmRleCA8IG5leHRMZW5ndGgpIHtcblx0XHRcdF9wcm9jZXNzUXVldWUucHVzaCh7IGN1cnJlbnQsIG5leHQsIG1ldGE6IHsgbWVyZ2VOb2Rlcywgb2xkSW5kZXgsIG5ld0luZGV4IH0gfSk7XG5cdFx0fVxuXG5cdFx0aWYgKGN1cnJlbnRMZW5ndGggPiBvbGRJbmRleCAmJiBuZXdJbmRleCA+PSBuZXh0TGVuZ3RoKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gb2xkSW5kZXg7IGkgPCBjdXJyZW50TGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aGFzKCdkb2pvLWRlYnVnJykgJiYgcmVnaXN0ZXJEaXN0aW5ndWlzaGFibGVDYWxsYmFjayhjdXJyZW50LCBpKTtcblx0XHRcdFx0aW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiBjdXJyZW50W2ldLCBuZXh0OiB1bmRlZmluZWQgfSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0cnVjdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHsgaXRlbSwgZG9tLCB3aWRnZXQgfSA9IF9wcm9jZXNzT25lKGluc3RydWN0aW9uc1tpXSk7XG5cdFx0XHR3aWRnZXQgJiYgX3Byb2Nlc3NRdWV1ZS5wdXNoKHdpZGdldCk7XG5cdFx0XHRpdGVtICYmIF9wcm9jZXNzUXVldWUucHVzaChpdGVtKTtcblx0XHRcdGRvbSAmJiBfYXBwbGljYXRpb25RdWV1ZS5wdXNoKGRvbSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gX3Byb2Nlc3NPbmUoeyBjdXJyZW50LCBuZXh0IH06IEluc3RydWN0aW9uKTogUHJvY2Vzc1Jlc3VsdCB7XG5cdFx0aWYgKGN1cnJlbnQgIT09IG5leHQpIHtcblx0XHRcdGlmICghY3VycmVudCAmJiBuZXh0KSB7XG5cdFx0XHRcdGlmIChpc1ZOb2RlV3JhcHBlcihuZXh0KSkge1xuXHRcdFx0XHRcdHJldHVybiBfY3JlYXRlRG9tKHsgbmV4dCB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gX2NyZWF0ZVdpZGdldCh7IG5leHQgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoY3VycmVudCAmJiBuZXh0KSB7XG5cdFx0XHRcdGlmIChpc1ZOb2RlV3JhcHBlcihjdXJyZW50KSAmJiBpc1ZOb2RlV3JhcHBlcihuZXh0KSkge1xuXHRcdFx0XHRcdHJldHVybiBfdXBkYXRlRG9tKHsgY3VycmVudCwgbmV4dCB9KTtcblx0XHRcdFx0fSBlbHNlIGlmIChpc1dOb2RlV3JhcHBlcihjdXJyZW50KSAmJiBpc1dOb2RlV3JhcHBlcihuZXh0KSkge1xuXHRcdFx0XHRcdHJldHVybiBfdXBkYXRlV2lkZ2V0KHsgY3VycmVudCwgbmV4dCB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChjdXJyZW50ICYmICFuZXh0KSB7XG5cdFx0XHRcdGlmIChpc1ZOb2RlV3JhcHBlcihjdXJyZW50KSkge1xuXHRcdFx0XHRcdHJldHVybiBfcmVtb3ZlRG9tKHsgY3VycmVudCB9KTtcblx0XHRcdFx0fSBlbHNlIGlmIChpc1dOb2RlV3JhcHBlcihjdXJyZW50KSkge1xuXHRcdFx0XHRcdHJldHVybiBfcmVtb3ZlV2lkZ2V0KHsgY3VycmVudCB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHRmdW5jdGlvbiBfY3JlYXRlV2lkZ2V0KHsgbmV4dCB9OiBDcmVhdGVXaWRnZXRJbnN0cnVjdGlvbik6IFByb2Nlc3NSZXN1bHQge1xuXHRcdGxldCB7XG5cdFx0XHRub2RlOiB7IHdpZGdldENvbnN0cnVjdG9yIH1cblx0XHR9ID0gbmV4dDtcblx0XHRsZXQgeyByZWdpc3RyeSB9ID0gX21vdW50T3B0aW9ucztcblx0XHRpZiAoIWlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yKHdpZGdldENvbnN0cnVjdG9yKSkge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblx0XHRjb25zdCBpbnN0YW5jZSA9IG5ldyB3aWRnZXRDb25zdHJ1Y3RvcigpIGFzIFdpZGdldEJhc2U7XG5cdFx0aWYgKHJlZ2lzdHJ5KSB7XG5cdFx0XHRpbnN0YW5jZS5yZWdpc3RyeS5iYXNlID0gcmVnaXN0cnk7XG5cdFx0fVxuXHRcdGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChpbnN0YW5jZSkhO1xuXHRcdGluc3RhbmNlRGF0YS5pbnZhbGlkYXRlID0gKCkgPT4ge1xuXHRcdFx0aW5zdGFuY2VEYXRhLmRpcnR5ID0gdHJ1ZTtcblx0XHRcdGlmICghaW5zdGFuY2VEYXRhLnJlbmRlcmluZyAmJiBfaW5zdGFuY2VUb1dyYXBwZXJNYXAuaGFzKGluc3RhbmNlKSkge1xuXHRcdFx0XHRfaW52YWxpZGF0aW9uUXVldWUucHVzaCh7IGluc3RhbmNlLCBkZXB0aDogbmV4dC5kZXB0aCB9KTtcblx0XHRcdFx0X3NjaGVkdWxlKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpbnN0YW5jZURhdGEucmVuZGVyaW5nID0gdHJ1ZTtcblx0XHRpbnN0YW5jZS5fX3NldFByb3BlcnRpZXNfXyhuZXh0Lm5vZGUucHJvcGVydGllcywgbmV4dC5ub2RlLmJpbmQpO1xuXHRcdGluc3RhbmNlLl9fc2V0Q2hpbGRyZW5fXyhuZXh0Lm5vZGUuY2hpbGRyZW4pO1xuXHRcdG5leHQuaW5zdGFuY2UgPSBpbnN0YW5jZTtcblx0XHRsZXQgcmVuZGVyZWQgPSBpbnN0YW5jZS5fX3JlbmRlcl9fKCk7XG5cdFx0aW5zdGFuY2VEYXRhLnJlbmRlcmluZyA9IGZhbHNlO1xuXHRcdGlmIChyZW5kZXJlZCkge1xuXHRcdFx0cmVuZGVyZWQgPSBBcnJheS5pc0FycmF5KHJlbmRlcmVkKSA/IHJlbmRlcmVkIDogW3JlbmRlcmVkXTtcblx0XHRcdG5leHQuY2hpbGRyZW5XcmFwcGVycyA9IHJlbmRlcmVkVG9XcmFwcGVyKHJlbmRlcmVkLCBuZXh0LCBudWxsKTtcblx0XHR9XG5cdFx0aWYgKG5leHQuaW5zdGFuY2UpIHtcblx0XHRcdF9pbnN0YW5jZVRvV3JhcHBlck1hcC5zZXQobmV4dC5pbnN0YW5jZSwgbmV4dCk7XG5cdFx0XHRpZiAoIXBhcmVudEludmFsaWRhdGUpIHtcblx0XHRcdFx0cGFyZW50SW52YWxpZGF0ZSA9IG5leHQuaW5zdGFuY2UuaW52YWxpZGF0ZS5iaW5kKG5leHQuaW5zdGFuY2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0aXRlbTogeyBuZXh0OiBuZXh0LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHsgbWVyZ2VOb2RlczogbmV4dC5tZXJnZU5vZGVzIH0gfSxcblx0XHRcdHdpZGdldDogeyB0eXBlOiAnYXR0YWNoJywgaW5zdGFuY2UsIGF0dGFjaGVkOiB0cnVlIH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gX3VwZGF0ZVdpZGdldCh7IGN1cnJlbnQsIG5leHQgfTogVXBkYXRlV2lkZ2V0SW5zdHJ1Y3Rpb24pOiBQcm9jZXNzUmVzdWx0IHtcblx0XHRjdXJyZW50ID0gKGN1cnJlbnQuaW5zdGFuY2UgJiYgX2luc3RhbmNlVG9XcmFwcGVyTWFwLmdldChjdXJyZW50Lmluc3RhbmNlKSkgfHwgY3VycmVudDtcblx0XHRjb25zdCB7IGluc3RhbmNlLCBkb21Ob2RlLCBoYXNBbmltYXRpb25zIH0gPSBjdXJyZW50O1xuXHRcdGlmICghaW5zdGFuY2UpIHtcblx0XHRcdHJldHVybiBbXSBhcyBQcm9jZXNzUmVzdWx0O1xuXHRcdH1cblx0XHRjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaW5zdGFuY2UpITtcblx0XHRuZXh0Lmluc3RhbmNlID0gaW5zdGFuY2U7XG5cdFx0bmV4dC5kb21Ob2RlID0gZG9tTm9kZTtcblx0XHRuZXh0Lmhhc0FuaW1hdGlvbnMgPSBoYXNBbmltYXRpb25zO1xuXHRcdGluc3RhbmNlRGF0YS5yZW5kZXJpbmcgPSB0cnVlO1xuXHRcdGluc3RhbmNlIS5fX3NldFByb3BlcnRpZXNfXyhuZXh0Lm5vZGUucHJvcGVydGllcywgbmV4dC5ub2RlLmJpbmQpO1xuXHRcdGluc3RhbmNlIS5fX3NldENoaWxkcmVuX18obmV4dC5ub2RlLmNoaWxkcmVuKTtcblx0XHRfaW5zdGFuY2VUb1dyYXBwZXJNYXAuc2V0KG5leHQuaW5zdGFuY2UhLCBuZXh0KTtcblx0XHRpZiAoaW5zdGFuY2VEYXRhLmRpcnR5KSB7XG5cdFx0XHRsZXQgcmVuZGVyZWQgPSBpbnN0YW5jZSEuX19yZW5kZXJfXygpO1xuXHRcdFx0aW5zdGFuY2VEYXRhLnJlbmRlcmluZyA9IGZhbHNlO1xuXHRcdFx0aWYgKHJlbmRlcmVkKSB7XG5cdFx0XHRcdHJlbmRlcmVkID0gQXJyYXkuaXNBcnJheShyZW5kZXJlZCkgPyByZW5kZXJlZCA6IFtyZW5kZXJlZF07XG5cdFx0XHRcdG5leHQuY2hpbGRyZW5XcmFwcGVycyA9IHJlbmRlcmVkVG9XcmFwcGVyKHJlbmRlcmVkLCBuZXh0LCBjdXJyZW50KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGl0ZW06IHsgY3VycmVudDogY3VycmVudC5jaGlsZHJlbldyYXBwZXJzLCBuZXh0OiBuZXh0LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHt9IH0sXG5cdFx0XHRcdHdpZGdldDogeyB0eXBlOiAnYXR0YWNoJywgaW5zdGFuY2UsIGF0dGFjaGVkOiBmYWxzZSB9XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRpbnN0YW5jZURhdGEucmVuZGVyaW5nID0gZmFsc2U7XG5cdFx0bmV4dC5jaGlsZHJlbldyYXBwZXJzID0gY3VycmVudC5jaGlsZHJlbldyYXBwZXJzO1xuXHRcdHJldHVybiB7XG5cdFx0XHR3aWRnZXQ6IHsgdHlwZTogJ2F0dGFjaCcsIGluc3RhbmNlLCBhdHRhY2hlZDogZmFsc2UgfVxuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBfcmVtb3ZlV2lkZ2V0KHsgY3VycmVudCB9OiBSZW1vdmVXaWRnZXRJbnN0cnVjdGlvbik6IFByb2Nlc3NSZXN1bHQge1xuXHRcdGN1cnJlbnQgPSBjdXJyZW50Lmluc3RhbmNlID8gX2luc3RhbmNlVG9XcmFwcGVyTWFwLmdldChjdXJyZW50Lmluc3RhbmNlKSEgOiBjdXJyZW50O1xuXHRcdF93cmFwcGVyU2libGluZ01hcC5kZWxldGUoY3VycmVudCk7XG5cdFx0X3BhcmVudFdyYXBwZXJNYXAuZGVsZXRlKGN1cnJlbnQpO1xuXHRcdF9pbnN0YW5jZVRvV3JhcHBlck1hcC5kZWxldGUoY3VycmVudC5pbnN0YW5jZSEpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGl0ZW06IHsgY3VycmVudDogY3VycmVudC5jaGlsZHJlbldyYXBwZXJzLCBtZXRhOiB7fSB9LFxuXHRcdFx0d2lkZ2V0OiB7IHR5cGU6ICdkZXRhY2gnLCBjdXJyZW50IH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gX2NyZWF0ZURvbSh7IG5leHQgfTogQ3JlYXRlRG9tSW5zdHJ1Y3Rpb24pOiBQcm9jZXNzUmVzdWx0IHtcblx0XHRsZXQgbWVyZ2VOb2RlczogTm9kZVtdID0gW107XG5cdFx0aWYgKCFuZXh0LmRvbU5vZGUpIHtcblx0XHRcdGlmICgobmV4dC5ub2RlIGFzIGFueSkuZG9tTm9kZSkge1xuXHRcdFx0XHRuZXh0LmRvbU5vZGUgPSAobmV4dC5ub2RlIGFzIGFueSkuZG9tTm9kZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChuZXh0Lm5vZGUudGFnID09PSAnc3ZnJykge1xuXHRcdFx0XHRcdG5leHQubmFtZXNwYWNlID0gTkFNRVNQQUNFX1NWRztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobmV4dC5ub2RlLnRhZykge1xuXHRcdFx0XHRcdGlmIChuZXh0Lm5hbWVzcGFjZSkge1xuXHRcdFx0XHRcdFx0bmV4dC5kb21Ob2RlID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuZXh0Lm5hbWVzcGFjZSwgbmV4dC5ub2RlLnRhZyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5leHQuZG9tTm9kZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KG5leHQubm9kZS50YWcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChuZXh0Lm5vZGUudGV4dCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bmV4dC5kb21Ob2RlID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5leHQubm9kZS50ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXh0Lm1lcmdlZCA9IHRydWU7XG5cdFx0fVxuXHRcdGlmIChuZXh0LmRvbU5vZGUpIHtcblx0XHRcdGlmIChfbW91bnRPcHRpb25zLm1lcmdlKSB7XG5cdFx0XHRcdG1lcmdlTm9kZXMgPSBhcnJheUZyb20obmV4dC5kb21Ob2RlLmNoaWxkTm9kZXMpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG5leHQubm9kZS5jaGlsZHJlbikge1xuXHRcdFx0XHRuZXh0LmNoaWxkcmVuV3JhcHBlcnMgPSByZW5kZXJlZFRvV3JhcHBlcihuZXh0Lm5vZGUuY2hpbGRyZW4sIG5leHQsIG51bGwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBwYXJlbnRXTm9kZVdyYXBwZXIgPSBmaW5kUGFyZW50V05vZGVXcmFwcGVyKG5leHQpO1xuXHRcdGlmIChwYXJlbnRXTm9kZVdyYXBwZXIgJiYgIXBhcmVudFdOb2RlV3JhcHBlci5kb21Ob2RlKSB7XG5cdFx0XHRwYXJlbnRXTm9kZVdyYXBwZXIuZG9tTm9kZSA9IG5leHQuZG9tTm9kZTtcblx0XHR9XG5cdFx0Y29uc3QgZG9tOiBBcHBsaWNhdGlvbkluc3RydWN0aW9uID0ge1xuXHRcdFx0bmV4dDogbmV4dCEsXG5cdFx0XHRwYXJlbnREb21Ob2RlOiBmaW5kUGFyZW50RG9tTm9kZShuZXh0KSEsXG5cdFx0XHR0eXBlOiAnY3JlYXRlJ1xuXHRcdH07XG5cdFx0aWYgKG5leHQuY2hpbGRyZW5XcmFwcGVycykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aXRlbTogeyBjdXJyZW50OiBbXSwgbmV4dDogbmV4dC5jaGlsZHJlbldyYXBwZXJzLCBtZXRhOiB7IG1lcmdlTm9kZXMgfSB9LFxuXHRcdFx0XHRkb21cblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB7IGRvbSB9O1xuXHR9XG5cblx0ZnVuY3Rpb24gX3VwZGF0ZURvbSh7IGN1cnJlbnQsIG5leHQgfTogVXBkYXRlRG9tSW5zdHJ1Y3Rpb24pOiBQcm9jZXNzUmVzdWx0IHtcblx0XHRjb25zdCBwYXJlbnREb21Ob2RlID0gZmluZFBhcmVudERvbU5vZGUoY3VycmVudCk7XG5cdFx0bmV4dC5kb21Ob2RlID0gY3VycmVudC5kb21Ob2RlO1xuXHRcdG5leHQubmFtZXNwYWNlID0gY3VycmVudC5uYW1lc3BhY2U7XG5cdFx0aWYgKG5leHQubm9kZS50ZXh0ICYmIG5leHQubm9kZS50ZXh0ICE9PSBjdXJyZW50Lm5vZGUudGV4dCkge1xuXHRcdFx0Y29uc3QgdXBkYXRlZFRleHROb2RlID0gcGFyZW50RG9tTm9kZSEub3duZXJEb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuZXh0Lm5vZGUudGV4dCEpO1xuXHRcdFx0cGFyZW50RG9tTm9kZSEucmVwbGFjZUNoaWxkKHVwZGF0ZWRUZXh0Tm9kZSwgbmV4dC5kb21Ob2RlISk7XG5cdFx0XHRuZXh0LmRvbU5vZGUgPSB1cGRhdGVkVGV4dE5vZGU7XG5cdFx0fSBlbHNlIGlmIChuZXh0Lm5vZGUuY2hpbGRyZW4pIHtcblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gcmVuZGVyZWRUb1dyYXBwZXIobmV4dC5ub2RlLmNoaWxkcmVuLCBuZXh0LCBjdXJyZW50KTtcblx0XHRcdG5leHQuY2hpbGRyZW5XcmFwcGVycyA9IGNoaWxkcmVuO1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0aXRlbTogeyBjdXJyZW50OiBjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMsIG5leHQ6IG5leHQuY2hpbGRyZW5XcmFwcGVycywgbWV0YToge30gfSxcblx0XHRcdGRvbTogeyB0eXBlOiAndXBkYXRlJywgbmV4dCwgY3VycmVudCB9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9yZW1vdmVEb20oeyBjdXJyZW50IH06IFJlbW92ZURvbUluc3RydWN0aW9uKTogUHJvY2Vzc1Jlc3VsdCB7XG5cdFx0X3dyYXBwZXJTaWJsaW5nTWFwLmRlbGV0ZShjdXJyZW50KTtcblx0XHRfcGFyZW50V3JhcHBlck1hcC5kZWxldGUoY3VycmVudCk7XG5cdFx0Y3VycmVudC5ub2RlLmJpbmQgPSB1bmRlZmluZWQ7XG5cdFx0aWYgKGN1cnJlbnQuaGFzQW5pbWF0aW9ucykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aXRlbTogeyBjdXJyZW50OiBjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHt9IH0sXG5cdFx0XHRcdGRvbTogeyB0eXBlOiAnZGVsZXRlJywgY3VycmVudCB9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMpIHtcblx0XHRcdF9hZnRlclJlbmRlckNhbGxiYWNrcy5wdXNoKCgpID0+IHtcblx0XHRcdFx0bGV0IHdyYXBwZXJzID0gY3VycmVudC5jaGlsZHJlbldyYXBwZXJzIHx8IFtdO1xuXHRcdFx0XHRsZXQgd3JhcHBlcjogRE5vZGVXcmFwcGVyIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHR3aGlsZSAoKHdyYXBwZXIgPSB3cmFwcGVycy5wb3AoKSkpIHtcblx0XHRcdFx0XHRpZiAod3JhcHBlci5jaGlsZHJlbldyYXBwZXJzKSB7XG5cdFx0XHRcdFx0XHR3cmFwcGVycy5wdXNoKC4uLndyYXBwZXIuY2hpbGRyZW5XcmFwcGVycyk7XG5cdFx0XHRcdFx0XHR3cmFwcGVyLmNoaWxkcmVuV3JhcHBlcnMgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpc1dOb2RlV3JhcHBlcih3cmFwcGVyKSkge1xuXHRcdFx0XHRcdFx0aWYgKHdyYXBwZXIuaW5zdGFuY2UpIHtcblx0XHRcdFx0XHRcdFx0X2luc3RhbmNlVG9XcmFwcGVyTWFwLmRlbGV0ZSh3cmFwcGVyLmluc3RhbmNlKTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHdyYXBwZXIuaW5zdGFuY2UpO1xuXHRcdFx0XHRcdFx0XHRpbnN0YW5jZURhdGEgJiYgaW5zdGFuY2VEYXRhLm9uRGV0YWNoKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR3cmFwcGVyLmluc3RhbmNlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRfd3JhcHBlclNpYmxpbmdNYXAuZGVsZXRlKHdyYXBwZXIpO1xuXHRcdFx0XHRcdF9wYXJlbnRXcmFwcGVyTWFwLmRlbGV0ZSh3cmFwcGVyKTtcblx0XHRcdFx0XHR3cmFwcGVyLmRvbU5vZGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0d3JhcHBlci5ub2RlLmJpbmQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRkb206IHsgdHlwZTogJ2RlbGV0ZScsIGN1cnJlbnQgfVxuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG1vdW50LFxuXHRcdGludmFsaWRhdGVcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gdmRvbS50cyIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguY3NzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby90aGVtZXMvZG9qby9pbmRleC5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG52YXIgaGFzID0gcmVxdWlyZSgnQGRvam8vZnJhbWV3b3JrL2hhcy9oYXMnKTtcblxuaWYgKCFoYXMuZXhpc3RzKCdidWlsZC10aW1lLXJlbmRlcicpKSB7XG5cdGhhcy5hZGQoJ2J1aWxkLXRpbWUtcmVuZGVyJywgZmFsc2UsIGZhbHNlKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyBoYXNCdWlsZFRpbWVSZW5kZXIudHMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9iYXNlXCIsXCJfMUFlV2VBcHJcIjpcImJhc2UtbV9fXzFBZVdlQXByX19YMTZ2MlwiLFwiXzFfcUFOcVhpXCI6XCJiYXNlLW1fX18xX3FBTnFYaV9fMXZ4Wm1cIixcIl8zUWRkVWlCVVwiOlwiYmFzZS1tX19fM1FkZFVpQlVfX0lvNGYtXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL2NvbW1vbi9zdHlsZXMvYmFzZS5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJyZXF1aXJlKCdDOi9Vc2Vycy9hL3NyYy9jYXRzdnNkb2dzL2NsaWVudC9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy9jb21tb24vc3R5bGVzL2Jhc2UubS5jc3MnKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIChmYWN0b3J5KCkpOyB9KTtcbn0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG59XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcInZpc3VhbGx5SGlkZGVuXCI6XCJfMUFlV2VBcHJcIixcImZvY3VzYWJsZVwiOlwiXzFfcUFOcVhpXCIsXCJoaWRkZW5cIjpcIl8zUWRkVWlCVVwiLFwiIF9rZXlcIjpcIkBkb2pvL3dpZGdldHMvYmFzZVwifTtcbn0pKTs7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy9jb21tb24vc3R5bGVzL2Jhc2UubS5jc3MuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IEFyaWFQcm9wZXJ0eU9iamVjdCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBlbnVtIEtleXMge1xuXHREb3duID0gNDAsXG5cdEVuZCA9IDM1LFxuXHRFbnRlciA9IDEzLFxuXHRFc2NhcGUgPSAyNyxcblx0SG9tZSA9IDM2LFxuXHRMZWZ0ID0gMzcsXG5cdFBhZ2VEb3duID0gMzQsXG5cdFBhZ2VVcCA9IDMzLFxuXHRSaWdodCA9IDM5LFxuXHRTcGFjZSA9IDMyLFxuXHRUYWIgPSA5LFxuXHRVcCA9IDM4XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRBcmlhUHJvcGVydGllcyhhcmlhOiBBcmlhUHJvcGVydHlPYmplY3QpOiBBcmlhUHJvcGVydHlPYmplY3Qge1xuXHRjb25zdCBmb3JtYXR0ZWRBcmlhID0gT2JqZWN0LmtleXMoYXJpYSkucmVkdWNlKChhOiBBcmlhUHJvcGVydHlPYmplY3QsIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0YVtgYXJpYS0ke2tleS50b0xvd2VyQ2FzZSgpfWBdID0gYXJpYVtrZXldO1xuXHRcdHJldHVybiBhO1xuXHR9LCB7fSk7XG5cdHJldHVybiBmb3JtYXR0ZWRBcmlhO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uLy4uLy4uL3NyYy9jb21tb24vdXRpbC50cyIsImltcG9ydCB7IFdpZGdldEJhc2UgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyBETm9kZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRoZW1lZE1peGluLCBUaGVtZWRQcm9wZXJ0aWVzLCB0aGVtZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkJztcbmltcG9ydCB7IHYgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XG5pbXBvcnQgeyBDdXN0b21BcmlhUHJvcGVydGllcyB9IGZyb20gJy4uL2NvbW1vbi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGZvcm1hdEFyaWFQcm9wZXJ0aWVzIH0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuaW1wb3J0ICogYXMgY3NzIGZyb20gJy4uL3RoZW1lL2xhYmVsLm0uY3NzJztcbmltcG9ydCAqIGFzIGJhc2VDc3MgZnJvbSAnLi4vY29tbW9uL3N0eWxlcy9iYXNlLm0uY3NzJztcbmltcG9ydCB7IGN1c3RvbUVsZW1lbnQgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9jdXN0b21FbGVtZW50JztcblxuLyoqXG4gKiBAdHlwZSBMYWJlbFByb3BlcnRpZXNcbiAqXG4gKiBQcm9wZXJ0aWVzIHRoYXQgY2FuIGJlIHNldCBvbiBhIExhYmVsIGNvbXBvbmVudFxuICpcbiAqIEBwcm9wZXJ0eSBmb3JJZCAgICAgSUQgdG8gZXhwbGljaXRseSBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggYW4gaW5wdXQgZWxlbWVudFxuICogQHByb3BlcnR5IGRpc2FibGVkXG4gKiBAcHJvcGVydHkgZm9jdXNlZFxuICogQHByb3BlcnR5IHJlYWRPbmx5XG4gKiBAcHJvcGVydHkgcmVxdWlyZWRcbiAqIEBwcm9wZXJ0eSBpbnZhbGlkXG4gKiBAcHJvcGVydHkgaGlkZGVuXG4gKiBAcHJvcGVydHkgc2Vjb25kYXJ5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGFiZWxQcm9wZXJ0aWVzIGV4dGVuZHMgVGhlbWVkUHJvcGVydGllcywgQ3VzdG9tQXJpYVByb3BlcnRpZXMge1xuXHRmb3JJZD86IHN0cmluZztcblx0ZGlzYWJsZWQ/OiBib29sZWFuO1xuXHRmb2N1c2VkPzogYm9vbGVhbjtcblx0cmVhZE9ubHk/OiBib29sZWFuO1xuXHRyZXF1aXJlZD86IGJvb2xlYW47XG5cdGludmFsaWQ/OiBib29sZWFuO1xuXHRoaWRkZW4/OiBib29sZWFuO1xuXHRzZWNvbmRhcnk/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgVGhlbWVkQmFzZSA9IFRoZW1lZE1peGluKFdpZGdldEJhc2UpO1xuXG5AdGhlbWUoY3NzKVxuQGN1c3RvbUVsZW1lbnQ8TGFiZWxQcm9wZXJ0aWVzPih7XG5cdHRhZzogJ2Rvam8tbGFiZWwnLFxuXHRwcm9wZXJ0aWVzOiBbICd0aGVtZScsICdhcmlhJywgJ2V4dHJhQ2xhc3NlcycsICdkaXNhYmxlZCcsICdmb2N1c2VkJywgJ3JlYWRPbmx5JywgJ3JlcXVpcmVkJywgJ2ludmFsaWQnLCAnaGlkZGVuJywgJ3NlY29uZGFyeScgXSxcblx0YXR0cmlidXRlczogW10sXG5cdGV2ZW50czogW11cbn0pXG5leHBvcnQgY2xhc3MgTGFiZWxCYXNlPFAgZXh0ZW5kcyBMYWJlbFByb3BlcnRpZXMgPSBMYWJlbFByb3BlcnRpZXM+IGV4dGVuZHMgVGhlbWVkQmFzZTxQPiB7XG5cdHByb3RlY3RlZCBnZXRSb290Q2xhc3NlcygpOiAoc3RyaW5nIHwgbnVsbClbXSB7XG5cdFx0Y29uc3Qge1xuXHRcdFx0ZGlzYWJsZWQsXG5cdFx0XHRmb2N1c2VkLFxuXHRcdFx0aW52YWxpZCxcblx0XHRcdHJlYWRPbmx5LFxuXHRcdFx0cmVxdWlyZWQsXG5cdFx0XHRzZWNvbmRhcnlcblx0XHR9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuXHRcdHJldHVybiBbXG5cdFx0XHRjc3Mucm9vdCxcblx0XHRcdGRpc2FibGVkID8gY3NzLmRpc2FibGVkIDogbnVsbCxcblx0XHRcdGZvY3VzZWQgPyBjc3MuZm9jdXNlZCA6IG51bGwsXG5cdFx0XHRpbnZhbGlkID09PSB0cnVlID8gY3NzLmludmFsaWQgOiBudWxsLFxuXHRcdFx0aW52YWxpZCA9PT0gZmFsc2UgPyBjc3MudmFsaWQgOiBudWxsLFxuXHRcdFx0cmVhZE9ubHkgPyBjc3MucmVhZG9ubHkgOiBudWxsLFxuXHRcdFx0cmVxdWlyZWQgPyBjc3MucmVxdWlyZWQgOiBudWxsLFxuXHRcdFx0c2Vjb25kYXJ5ID8gY3NzLnNlY29uZGFyeSA6IG51bGxcblx0XHRdO1xuXHR9XG5cblx0cmVuZGVyKCk6IEROb2RlIHtcblx0XHRjb25zdCB7IGFyaWEgPSB7fSwgZm9ySWQsIGhpZGRlbiB9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuXG5cdFx0cmV0dXJuIHYoJ2xhYmVsJywge1xuXHRcdFx0Li4uZm9ybWF0QXJpYVByb3BlcnRpZXMoYXJpYSksXG5cdFx0XHRjbGFzc2VzOiBbXG5cdFx0XHRcdC4uLnRoaXMudGhlbWUodGhpcy5nZXRSb290Q2xhc3NlcygpKSxcblx0XHRcdFx0aGlkZGVuID8gYmFzZUNzcy52aXN1YWxseUhpZGRlbiA6IG51bGxcblx0XHRcdF0sXG5cdFx0XHRmb3I6IGZvcklkXG5cdFx0fSwgdGhpcy5jaGlsZHJlbik7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGFiZWwgZXh0ZW5kcyBMYWJlbEJhc2U8TGFiZWxQcm9wZXJ0aWVzPiB7fVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uLy4uLy4uL3NyYy9sYWJlbC9pbmRleC50cyIsImltcG9ydCB7IFdpZGdldEJhc2UgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyBUaGVtZWRNaXhpbiwgVGhlbWVkUHJvcGVydGllcywgdGhlbWUgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWl4aW5zL1RoZW1lZCc7XG5pbXBvcnQgeyBGb2N1c01peGluLCBGb2N1c1Byb3BlcnRpZXMgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWl4aW5zL0ZvY3VzJztcbmltcG9ydCBMYWJlbCBmcm9tICcuLi9sYWJlbC9pbmRleCc7XG5pbXBvcnQgeyB2LCB3IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2QnO1xuaW1wb3J0IHsgRE5vZGUgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvaW50ZXJmYWNlcyc7XG5pbXBvcnQgRm9jdXMgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvRm9jdXMnO1xuaW1wb3J0IHsgdXVpZCB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay9jb3JlL3V0aWwnO1xuaW1wb3J0IHsgQ3VzdG9tQXJpYVByb3BlcnRpZXMsIExhYmVsZWRQcm9wZXJ0aWVzLCBJbnB1dEV2ZW50UHJvcGVydGllcywgSW5wdXRQcm9wZXJ0aWVzLCBQb2ludGVyRXZlbnRQcm9wZXJ0aWVzLCBLZXlFdmVudFByb3BlcnRpZXMgfSBmcm9tICcuLi9jb21tb24vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBmb3JtYXRBcmlhUHJvcGVydGllcyB9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcbmltcG9ydCAqIGFzIGZpeGVkQ3NzIGZyb20gJy4vc3R5bGVzL3NsaWRlci5tLmNzcyc7XG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi4vdGhlbWUvc2xpZGVyLm0uY3NzJztcbmltcG9ydCB7IGN1c3RvbUVsZW1lbnQgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9jdXN0b21FbGVtZW50JztcblxuLyoqXG4gKiBAdHlwZSBTbGlkZXJQcm9wZXJ0aWVzXG4gKlxuICogUHJvcGVydGllcyB0aGF0IGNhbiBiZSBzZXQgb24gYSBTbGlkZXIgY29tcG9uZW50XG4gKlxuICogQHByb3BlcnR5IG1heCAgICAgICAgICAgICAgIFRoZSBtYXhpbXVtIHZhbHVlIGZvciB0aGUgc2xpZGVyXG4gKiBAcHJvcGVydHkgbWluICAgICAgICAgICAgICAgVGhlIG1pbmltdW0gdmFsdWUgZm9yIHRoZSBzbGlkZXJcbiAqIEBwcm9wZXJ0eSBvdXRwdXQgICAgICAgICAgICBBbiBvcHRpb25hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdHJpbmcgb3IgRE5vZGUgZm9yIGN1c3RvbSBvdXRwdXQgZm9ybWF0XG4gKiBAcHJvcGVydHkgc2hvd091dHB1dCAgICAgICAgVG9nZ2xlcyB2aXNpYmlsaXR5IG9mIHNsaWRlciBvdXRwdXRcbiAqIEBwcm9wZXJ0eSBzdGVwICAgICAgICAgICAgICBTaXplIG9mIHRoZSBzbGlkZXIgaW5jcmVtZW50XG4gKiBAcHJvcGVydHkgdmVydGljYWwgICAgICAgICAgT3JpZW50cyB0aGUgc2xpZGVyIHZlcnRpY2FsbHksIGZhbHNlIGJ5IGRlZmF1bHQuXG4gKiBAcHJvcGVydHkgdmVydGljYWxIZWlnaHQgICAgTGVuZ3RoIG9mIHRoZSB2ZXJ0aWNhbCBzbGlkZXIgKG9ubHkgdXNlZCBpZiB2ZXJ0aWNhbCBpcyB0cnVlKVxuICogQHByb3BlcnR5IHZhbHVlICAgICAgICAgICBUaGUgY3VycmVudCB2YWx1ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNsaWRlclByb3BlcnRpZXMgZXh0ZW5kcyBUaGVtZWRQcm9wZXJ0aWVzLCBMYWJlbGVkUHJvcGVydGllcywgSW5wdXRQcm9wZXJ0aWVzLCBGb2N1c1Byb3BlcnRpZXMsIElucHV0RXZlbnRQcm9wZXJ0aWVzLCBQb2ludGVyRXZlbnRQcm9wZXJ0aWVzLCBLZXlFdmVudFByb3BlcnRpZXMsIEN1c3RvbUFyaWFQcm9wZXJ0aWVzIHtcblx0bWF4PzogbnVtYmVyO1xuXHRtaW4/OiBudW1iZXI7XG5cdG91dHB1dD8odmFsdWU6IG51bWJlcik6IEROb2RlO1xuXHRvdXRwdXRJc1Rvb2x0aXA/OiBib29sZWFuO1xuXHRzaG93T3V0cHV0PzogYm9vbGVhbjtcblx0c3RlcD86IG51bWJlcjtcblx0dmVydGljYWw/OiBib29sZWFuO1xuXHR2ZXJ0aWNhbEhlaWdodD86IHN0cmluZztcblx0dmFsdWU/OiBudW1iZXI7XG5cdG9uQ2xpY2s/KHZhbHVlOiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgVGhlbWVkQmFzZSA9IFRoZW1lZE1peGluKEZvY3VzTWl4aW4oV2lkZ2V0QmFzZSkpO1xuXG5mdW5jdGlvbiBleHRyYWN0VmFsdWUoZXZlbnQ6IEV2ZW50KTogbnVtYmVyIHtcblx0Y29uc3QgdmFsdWUgPSAoZXZlbnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlO1xuXHRyZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7XG59XG5cbkB0aGVtZShjc3MpXG5AY3VzdG9tRWxlbWVudDxTbGlkZXJQcm9wZXJ0aWVzPih7XG5cdHRhZzogJ2Rvam8tc2xpZGVyJyxcblx0cHJvcGVydGllczogW1xuXHRcdCd0aGVtZScsXG5cdFx0J2FyaWEnLFxuXHRcdCdleHRyYUNsYXNzZXMnLFxuXHRcdCdkaXNhYmxlZCcsXG5cdFx0J2ludmFsaWQnLFxuXHRcdCdyZXF1aXJlZCcsXG5cdFx0J3JlYWRPbmx5Jyxcblx0XHQnbGFiZWxBZnRlcicsXG5cdFx0J2xhYmVsSGlkZGVuJyxcblx0XHQnbWF4Jyxcblx0XHQnbWluJyxcblx0XHQnb3V0cHV0Jyxcblx0XHQnb3V0cHV0SXNUb29sdGlwJyxcblx0XHQnc2hvd091dHB1dCcsXG5cdFx0J3N0ZXAnLFxuXHRcdCd2ZXJ0aWNhbCcsXG5cdFx0J3ZhbHVlJ1xuXHRdLFxuXHRhdHRyaWJ1dGVzOiBbICd3aWRnZXRJZCcsICdsYWJlbCcsICduYW1lJywgJ3ZlcnRpY2FsSGVpZ2h0JyBdLFxuXHRldmVudHM6IFtcblx0XHQnb25CbHVyJyxcblx0XHQnb25DaGFuZ2UnLFxuXHRcdCdvbkNsaWNrJyxcblx0XHQnb25Gb2N1cycsXG5cdFx0J29uSW5wdXQnLFxuXHRcdCdvbktleURvd24nLFxuXHRcdCdvbktleVByZXNzJyxcblx0XHQnb25LZXlVcCcsXG5cdFx0J29uTW91c2VEb3duJyxcblx0XHQnb25Nb3VzZVVwJyxcblx0XHQnb25Ub3VjaENhbmNlbCcsXG5cdFx0J29uVG91Y2hFbmQnLFxuXHRcdCdvblRvdWNoU3RhcnQnXG5cdF1cbn0pXG5leHBvcnQgY2xhc3MgU2xpZGVyQmFzZTxQIGV4dGVuZHMgU2xpZGVyUHJvcGVydGllcyA9IFNsaWRlclByb3BlcnRpZXM+IGV4dGVuZHMgVGhlbWVkQmFzZTxQLCBudWxsPiB7XG5cdC8vIGlkIHVzZWQgdG8gYXNzb2NpYXRlIGlucHV0IHdpdGggb3V0cHV0XG5cdHByaXZhdGUgX3dpZGdldElkID0gdXVpZCgpO1xuXG5cdHByaXZhdGUgX29uQmx1ciAoZXZlbnQ6IEZvY3VzRXZlbnQpIHtcblx0XHR0aGlzLnByb3BlcnRpZXMub25CbHVyICYmIHRoaXMucHJvcGVydGllcy5vbkJsdXIoZXh0cmFjdFZhbHVlKGV2ZW50KSk7XG5cdH1cblx0cHJpdmF0ZSBfb25DaGFuZ2UgKGV2ZW50OiBFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vbkNoYW5nZSAmJiB0aGlzLnByb3BlcnRpZXMub25DaGFuZ2UoZXh0cmFjdFZhbHVlKGV2ZW50KSk7XG5cdH1cblx0cHJpdmF0ZSBfb25DbGljayAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25DbGljayAmJiB0aGlzLnByb3BlcnRpZXMub25DbGljayhleHRyYWN0VmFsdWUoZXZlbnQpKTtcblx0fVxuXHRwcml2YXRlIF9vbkZvY3VzIChldmVudDogRm9jdXNFdmVudCkge1xuXHRcdHRoaXMucHJvcGVydGllcy5vbkZvY3VzICYmIHRoaXMucHJvcGVydGllcy5vbkZvY3VzKGV4dHJhY3RWYWx1ZShldmVudCkpO1xuXHR9XG5cdHByaXZhdGUgX29uSW5wdXQgKGV2ZW50OiBFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vbklucHV0ICYmIHRoaXMucHJvcGVydGllcy5vbklucHV0KGV4dHJhY3RWYWx1ZShldmVudCkpO1xuXHR9XG5cdHByaXZhdGUgX29uS2V5RG93biAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25LZXlEb3duICYmIHRoaXMucHJvcGVydGllcy5vbktleURvd24oZXZlbnQud2hpY2gsICgpID0+IHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSk7XG5cdH1cblx0cHJpdmF0ZSBfb25LZXlQcmVzcyAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR0aGlzLnByb3BlcnRpZXMub25LZXlQcmVzcyAmJiB0aGlzLnByb3BlcnRpZXMub25LZXlQcmVzcyhldmVudC53aGljaCwgKCkgPT4geyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9KTtcblx0fVxuXHRwcml2YXRlIF9vbktleVVwIChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vbktleVVwICYmIHRoaXMucHJvcGVydGllcy5vbktleVVwKGV2ZW50LndoaWNoLCAoKSA9PiB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0pO1xuXHR9XG5cdHByaXZhdGUgX29uTW91c2VEb3duIChldmVudDogTW91c2VFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vbk1vdXNlRG93biAmJiB0aGlzLnByb3BlcnRpZXMub25Nb3VzZURvd24oKTtcblx0fVxuXHRwcml2YXRlIF9vbk1vdXNlVXAgKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0dGhpcy5wcm9wZXJ0aWVzLm9uTW91c2VVcCAmJiB0aGlzLnByb3BlcnRpZXMub25Nb3VzZVVwKCk7XG5cdH1cblx0cHJpdmF0ZSBfb25Ub3VjaFN0YXJ0IChldmVudDogVG91Y2hFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vblRvdWNoU3RhcnQgJiYgdGhpcy5wcm9wZXJ0aWVzLm9uVG91Y2hTdGFydCgpO1xuXHR9XG5cdHByaXZhdGUgX29uVG91Y2hFbmQgKGV2ZW50OiBUb3VjaEV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0dGhpcy5wcm9wZXJ0aWVzLm9uVG91Y2hFbmQgJiYgdGhpcy5wcm9wZXJ0aWVzLm9uVG91Y2hFbmQoKTtcblx0fVxuXHRwcml2YXRlIF9vblRvdWNoQ2FuY2VsIChldmVudDogVG91Y2hFdmVudCkge1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdHRoaXMucHJvcGVydGllcy5vblRvdWNoQ2FuY2VsICYmIHRoaXMucHJvcGVydGllcy5vblRvdWNoQ2FuY2VsKCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0Um9vdENsYXNzZXMoKTogKHN0cmluZyB8IG51bGwpW10ge1xuXHRcdGNvbnN0IHtcblx0XHRcdGRpc2FibGVkLFxuXHRcdFx0aW52YWxpZCxcblx0XHRcdHJlYWRPbmx5LFxuXHRcdFx0cmVxdWlyZWQsXG5cdFx0XHR2ZXJ0aWNhbCA9IGZhbHNlXG5cdFx0fSA9IHRoaXMucHJvcGVydGllcztcblx0XHRjb25zdCBmb2N1cyA9IHRoaXMubWV0YShGb2N1cykuZ2V0KCdyb290Jyk7XG5cblx0XHRyZXR1cm4gW1xuXHRcdFx0Y3NzLnJvb3QsXG5cdFx0XHRkaXNhYmxlZCA/IGNzcy5kaXNhYmxlZCA6IG51bGwsXG5cdFx0XHRmb2N1cy5jb250YWluc0ZvY3VzID8gY3NzLmZvY3VzZWQgOiBudWxsLFxuXHRcdFx0aW52YWxpZCA9PT0gdHJ1ZSA/IGNzcy5pbnZhbGlkIDogbnVsbCxcblx0XHRcdGludmFsaWQgPT09IGZhbHNlID8gY3NzLnZhbGlkIDogbnVsbCxcblx0XHRcdHJlYWRPbmx5ID8gY3NzLnJlYWRvbmx5IDogbnVsbCxcblx0XHRcdHJlcXVpcmVkID8gY3NzLnJlcXVpcmVkIDogbnVsbCxcblx0XHRcdHZlcnRpY2FsID8gY3NzLnZlcnRpY2FsIDogbnVsbFxuXHRcdF07XG5cdH1cblxuXHRwcm90ZWN0ZWQgcmVuZGVyQ29udHJvbHMocGVyY2VudFZhbHVlOiBudW1iZXIpOiBETm9kZSB7XG5cdFx0Y29uc3Qge1xuXHRcdFx0dmVydGljYWwgPSBmYWxzZSxcblx0XHRcdHZlcnRpY2FsSGVpZ2h0ID0gJzIwMHB4J1xuXHRcdH0gPSB0aGlzLnByb3BlcnRpZXM7XG5cblx0XHRyZXR1cm4gdignZGl2Jywge1xuXHRcdFx0Y2xhc3NlczogWyB0aGlzLnRoZW1lKGNzcy50cmFjayksIGZpeGVkQ3NzLnRyYWNrRml4ZWQgXSxcblx0XHRcdCdhcmlhLWhpZGRlbic6ICd0cnVlJyxcblx0XHRcdHN0eWxlczogdmVydGljYWwgPyB7IHdpZHRoOiB2ZXJ0aWNhbEhlaWdodCB9IDoge31cblx0XHR9LCBbXG5cdFx0XHR2KCdzcGFuJywge1xuXHRcdFx0XHRjbGFzc2VzOiBbIHRoaXMudGhlbWUoY3NzLmZpbGwpLCBmaXhlZENzcy5maWxsRml4ZWQgXSxcblx0XHRcdFx0c3R5bGVzOiB7IHdpZHRoOiBgJHtwZXJjZW50VmFsdWV9JWAgfVxuXHRcdFx0fSksXG5cdFx0XHR2KCdzcGFuJywge1xuXHRcdFx0XHRjbGFzc2VzOiBbIHRoaXMudGhlbWUoY3NzLnRodW1iKSwgZml4ZWRDc3MudGh1bWJGaXhlZCBdLFxuXHRcdFx0XHRzdHlsZXM6IHsgbGVmdDogYCR7cGVyY2VudFZhbHVlfSVgIH1cblx0XHRcdH0pXG5cdFx0XSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgcmVuZGVyT3V0cHV0KHZhbHVlOiBudW1iZXIsIHBlcmNlbnRWYWx1ZTogbnVtYmVyKTogRE5vZGUge1xuXHRcdGNvbnN0IHtcblx0XHRcdG91dHB1dCxcblx0XHRcdG91dHB1dElzVG9vbHRpcCA9IGZhbHNlLFxuXHRcdFx0dmVydGljYWwgPSBmYWxzZVxuXHRcdH0gPSB0aGlzLnByb3BlcnRpZXM7XG5cblx0XHRjb25zdCBvdXRwdXROb2RlID0gb3V0cHV0ID8gb3V0cHV0KHZhbHVlKSA6IGAke3ZhbHVlfWA7XG5cblx0XHQvLyBvdXRwdXQgc3R5bGVzXG5cdFx0bGV0IG91dHB1dFN0eWxlczogeyBsZWZ0Pzogc3RyaW5nOyB0b3A/OiBzdHJpbmcgfSA9IHt9O1xuXHRcdGlmIChvdXRwdXRJc1Rvb2x0aXApIHtcblx0XHRcdG91dHB1dFN0eWxlcyA9IHZlcnRpY2FsID8geyB0b3A6IGAkezEwMCAtIHBlcmNlbnRWYWx1ZX0lYCB9IDogeyBsZWZ0OiBgJHtwZXJjZW50VmFsdWV9JWAgfTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdignb3V0cHV0Jywge1xuXHRcdFx0Y2xhc3NlczogdGhpcy50aGVtZShbY3NzLm91dHB1dCwgb3V0cHV0SXNUb29sdGlwID8gY3NzLm91dHB1dFRvb2x0aXAgOiBudWxsXSksXG5cdFx0XHRmb3I6IHRoaXMuX3dpZGdldElkLFxuXHRcdFx0c3R5bGVzOiBvdXRwdXRTdHlsZXMsXG5cdFx0XHR0YWJJbmRleDogLTEgLyogbmVlZGVkIHNvIEVkZ2UgZG9lc24ndCBzZWxlY3QgdGhlIGVsZW1lbnQgd2hpbGUgdGFiYmluZyB0aHJvdWdoICovXG5cdFx0fSwgWyBvdXRwdXROb2RlIF0pO1xuXHR9XG5cblx0cmVuZGVyKCk6IEROb2RlIHtcblx0XHRjb25zdCB7XG5cdFx0XHRhcmlhID0ge30sXG5cdFx0XHRkaXNhYmxlZCxcblx0XHRcdHdpZGdldElkID0gdGhpcy5fd2lkZ2V0SWQsXG5cdFx0XHRpbnZhbGlkLFxuXHRcdFx0bGFiZWwsXG5cdFx0XHRsYWJlbEFmdGVyLFxuXHRcdFx0bGFiZWxIaWRkZW4sXG5cdFx0XHRtYXggPSAxMDAsXG5cdFx0XHRtaW4gPSAwLFxuXHRcdFx0bmFtZSxcblx0XHRcdHJlYWRPbmx5LFxuXHRcdFx0cmVxdWlyZWQsXG5cdFx0XHRzaG93T3V0cHV0ID0gdHJ1ZSxcblx0XHRcdHN0ZXAgPSAxLFxuXHRcdFx0dmVydGljYWwgPSBmYWxzZSxcblx0XHRcdHZlcnRpY2FsSGVpZ2h0ID0gJzIwMHB4Jyxcblx0XHRcdHRoZW1lXG5cdFx0fSA9IHRoaXMucHJvcGVydGllcztcblx0XHRjb25zdCBmb2N1cyA9IHRoaXMubWV0YShGb2N1cykuZ2V0KCdyb290Jyk7XG5cblx0XHRsZXQge1xuXHRcdFx0dmFsdWUgPSBtaW5cblx0XHR9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuXG5cdFx0dmFsdWUgPSB2YWx1ZSA+IG1heCA/IG1heCA6IHZhbHVlO1xuXHRcdHZhbHVlID0gdmFsdWUgPCBtaW4gPyBtaW4gOiB2YWx1ZTtcblxuXHRcdGNvbnN0IHBlcmNlbnRWYWx1ZSA9ICh2YWx1ZSAtIG1pbikgLyAobWF4IC0gbWluKSAqIDEwMDtcblxuXHRcdGNvbnN0IHNsaWRlciA9IHYoJ2RpdicsIHtcblx0XHRcdGNsYXNzZXM6IFsgdGhpcy50aGVtZShjc3MuaW5wdXRXcmFwcGVyKSwgZml4ZWRDc3MuaW5wdXRXcmFwcGVyRml4ZWQgXSxcblx0XHRcdHN0eWxlczogdmVydGljYWwgPyB7IGhlaWdodDogdmVydGljYWxIZWlnaHQgfSA6IHt9XG5cdFx0fSwgW1xuXHRcdFx0dignaW5wdXQnLCB7XG5cdFx0XHRcdGtleTogJ2lucHV0Jyxcblx0XHRcdFx0Li4uZm9ybWF0QXJpYVByb3BlcnRpZXMoYXJpYSksXG5cdFx0XHRcdGNsYXNzZXM6IFsgdGhpcy50aGVtZShjc3MuaW5wdXQpLCBmaXhlZENzcy5uYXRpdmVJbnB1dCBdLFxuXHRcdFx0XHRkaXNhYmxlZCxcblx0XHRcdFx0aWQ6IHdpZGdldElkLFxuXHRcdFx0XHRmb2N1czogdGhpcy5zaG91bGRGb2N1cyxcblx0XHRcdFx0J2FyaWEtaW52YWxpZCc6IGludmFsaWQgPT09IHRydWUgPyAndHJ1ZScgOiBudWxsLFxuXHRcdFx0XHRtYXg6IGAke21heH1gLFxuXHRcdFx0XHRtaW46IGAke21pbn1gLFxuXHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRyZWFkT25seSxcblx0XHRcdFx0J2FyaWEtcmVhZG9ubHknOiByZWFkT25seSA9PT0gdHJ1ZSA/ICd0cnVlJyA6IG51bGwsXG5cdFx0XHRcdHJlcXVpcmVkLFxuXHRcdFx0XHRzdGVwOiBgJHtzdGVwfWAsXG5cdFx0XHRcdHN0eWxlczogdmVydGljYWwgPyB7IHdpZHRoOiB2ZXJ0aWNhbEhlaWdodCB9IDoge30sXG5cdFx0XHRcdHR5cGU6ICdyYW5nZScsXG5cdFx0XHRcdHZhbHVlOiBgJHt2YWx1ZX1gLFxuXHRcdFx0XHRvbmJsdXI6IHRoaXMuX29uQmx1cixcblx0XHRcdFx0b25jaGFuZ2U6IHRoaXMuX29uQ2hhbmdlLFxuXHRcdFx0XHRvbmNsaWNrOiB0aGlzLl9vbkNsaWNrLFxuXHRcdFx0XHRvbmZvY3VzOiB0aGlzLl9vbkZvY3VzLFxuXHRcdFx0XHRvbmlucHV0OiB0aGlzLl9vbklucHV0LFxuXHRcdFx0XHRvbmtleWRvd246IHRoaXMuX29uS2V5RG93bixcblx0XHRcdFx0b25rZXlwcmVzczogdGhpcy5fb25LZXlQcmVzcyxcblx0XHRcdFx0b25rZXl1cDogdGhpcy5fb25LZXlVcCxcblx0XHRcdFx0b25tb3VzZWRvd246IHRoaXMuX29uTW91c2VEb3duLFxuXHRcdFx0XHRvbm1vdXNldXA6IHRoaXMuX29uTW91c2VVcCxcblx0XHRcdFx0b250b3VjaHN0YXJ0OiB0aGlzLl9vblRvdWNoU3RhcnQsXG5cdFx0XHRcdG9udG91Y2hlbmQ6IHRoaXMuX29uVG91Y2hFbmQsXG5cdFx0XHRcdG9udG91Y2hjYW5jZWw6IHRoaXMuX29uVG91Y2hDYW5jZWxcblx0XHRcdH0pLFxuXHRcdFx0dGhpcy5yZW5kZXJDb250cm9scyhwZXJjZW50VmFsdWUpLFxuXHRcdFx0c2hvd091dHB1dCA/IHRoaXMucmVuZGVyT3V0cHV0KHZhbHVlLCBwZXJjZW50VmFsdWUpIDogbnVsbFxuXHRcdF0pO1xuXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSBbXG5cdFx0XHRsYWJlbCA/IHcoTGFiZWwsIHtcblx0XHRcdFx0dGhlbWUsXG5cdFx0XHRcdGRpc2FibGVkLFxuXHRcdFx0XHRmb2N1c2VkOiBmb2N1cy5jb250YWluc0ZvY3VzLFxuXHRcdFx0XHRpbnZhbGlkLFxuXHRcdFx0XHRyZWFkT25seSxcblx0XHRcdFx0cmVxdWlyZWQsXG5cdFx0XHRcdGhpZGRlbjogbGFiZWxIaWRkZW4sXG5cdFx0XHRcdGZvcklkOiB3aWRnZXRJZFxuXHRcdFx0fSwgWyBsYWJlbCBdKSA6IG51bGwsXG5cdFx0XHRzbGlkZXJcblx0XHRdO1xuXG5cdFx0cmV0dXJuIHYoJ2RpdicsIHtcblx0XHRcdGtleTogJ3Jvb3QnLFxuXHRcdFx0Y2xhc3NlczogWy4uLnRoaXMudGhlbWUodGhpcy5nZXRSb290Q2xhc3NlcygpKSwgZml4ZWRDc3Mucm9vdEZpeGVkXVxuXHRcdH0sIGxhYmVsQWZ0ZXIgPyBjaGlsZHJlbi5yZXZlcnNlKCkgOiBjaGlsZHJlbik7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2xpZGVyIGV4dGVuZHMgU2xpZGVyQmFzZTxTbGlkZXJQcm9wZXJ0aWVzPiB7fVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4uLy4uLy4uL3NyYy9zbGlkZXIvaW5kZXgudHMiLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9zbGlkZXJcIixcIl8ySWwydFBMZVwiOlwic2xpZGVyLW1fX18ySWwydFBMZV9fMldKcmFcIixcIl8xanV0UGZpZlwiOlwic2xpZGVyLW1fX18xanV0UGZpZl9fMlg2OGtcIixcIl8xTXlqVjVfRlwiOlwic2xpZGVyLW1fX18xTXlqVjVfRl9fMjc0OHhcIixcIl8zcFBRdVNweFwiOlwic2xpZGVyLW1fX18zcFBRdVNweF9fMlFIRXBcIixcIl8yczBBeGFoaVwiOlwic2xpZGVyLW1fX18yczBBeGFoaV9fYjFaMnBcIixcImszR19yU09PXCI6XCJzbGlkZXItbV9fazNHX3JTT09fXzJfakJMXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvc2xpZGVyL3N0eWxlcy9zbGlkZXIubS5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvc2xpZGVyL3N0eWxlcy9zbGlkZXIubS5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwicmVxdWlyZSgnQzovVXNlcnMvYS9zcmMvY2F0c3ZzZG9ncy9jbGllbnQvbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvc2xpZGVyL3N0eWxlcy9zbGlkZXIubS5jc3MnKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIChmYWN0b3J5KCkpOyB9KTtcbn0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG59XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcInJvb3RGaXhlZFwiOlwiXzJJbDJ0UExlXCIsXCJpbnB1dFdyYXBwZXJGaXhlZFwiOlwiXzFqdXRQZmlmXCIsXCJmaWxsRml4ZWRcIjpcIl8xTXlqVjVfRlwiLFwidHJhY2tGaXhlZFwiOlwiXzNwUFF1U3B4XCIsXCJ0aHVtYkZpeGVkXCI6XCJrM0dfclNPT1wiLFwibmF0aXZlSW5wdXRcIjpcIl8yczBBeGFoaVwiLFwiIF9rZXlcIjpcIkBkb2pvL3dpZGdldHMvc2xpZGVyXCJ9O1xufSkpOztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3NsaWRlci9zdHlsZXMvc2xpZGVyLm0uY3NzLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3NsaWRlci9zdHlsZXMvc2xpZGVyLm0uY3NzLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL2xhYmVsXCIsXCJfMmFfbHdaaThcIjpcImxhYmVsLW1fX18yYV9sd1ppOF9fM1h5OXFcIn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9sYWJlbC5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9sYWJlbC5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJyZXF1aXJlKCdDOi9Vc2Vycy9hL3NyYy9jYXRzdnNkb2dzL2NsaWVudC9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9sYWJlbC5tLmNzcycpO1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdGRlZmluZShbXSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gKGZhY3RvcnkoKSk7IH0pO1xufSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbn1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4ge1wicm9vdFwiOlwiXzFYbjdHWmpsXCIsXCJyZWFkb25seVwiOlwiXzc5Z013MHZYXCIsXCJpbnZhbGlkXCI6XCJfMUhYUVhhbmRcIixcInZhbGlkXCI6XCJfM1RlTzg1bkRcIixcInJlcXVpcmVkXCI6XCJfMmFfbHdaaThcIixcImRpc2FibGVkXCI6XCJfM2d2OXB0eEhcIixcImZvY3VzZWRcIjpcIl8yUXkybll0YVwiLFwic2Vjb25kYXJ5XCI6XCJfMjlVcFI3R2RcIixcIiBfa2V5XCI6XCJAZG9qby93aWRnZXRzL2xhYmVsXCJ9O1xufSkpOztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3RoZW1lL2xhYmVsLm0uY3NzLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3RoZW1lL2xhYmVsLm0uY3NzLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL3NsaWRlclwiLFwiVGNFVFg1VFNcIjpcInNsaWRlci1tX19UY0VUWDVUU19fMzg4clFcIixcIl8zMUpWNG54MFwiOlwic2xpZGVyLW1fX18zMUpWNG54MF9fMXdfU1lcIixcIl8xYzRYUndIMFwiOlwic2xpZGVyLW1fX18xYzRYUndIMF9fOXl0MkFcIixcIl8zYjR5eEI3QVwiOlwic2xpZGVyLW1fX18zYjR5eEI3QV9fMzVVSzRcIixcIl8zdFp4VkswVFwiOlwic2xpZGVyLW1fX18zdFp4VkswVF9fQy1IZFBcIixcIl8yM3VObWJIMVwiOlwic2xpZGVyLW1fX18yM3VObWJIMV9fMW0zeGlcIixcIl8xOFhYcVRJaFwiOlwic2xpZGVyLW1fX18xOFhYcVRJaF9fM2pZdWFcIixcIl8yRGQxSC1RMVwiOlwic2xpZGVyLW1fX18yRGQxSC1RMV9fMkNBYWZcIixcIl8zcHVpV3N1RVwiOlwic2xpZGVyLW1fX18zcHVpV3N1RV9fMVFqX2VcIixcIl8zaktZeFhBZFwiOlwic2xpZGVyLW1fX18zaktZeFhBZF9fMVZtZ3RcIixcIl8yWHlaa2dfSVwiOlwic2xpZGVyLW1fX18yWHlaa2dfSV9fMmVWRDFcIixcIl8zbXUxNGRIU1wiOlwic2xpZGVyLW1fX18zbXUxNGRIU19fUUVEMnFcIixcImp1eVlDNDdMXCI6XCJzbGlkZXItbV9fanV5WUM0N0xfXzN6QXl1XCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93aWRnZXRzL3RoZW1lL3NsaWRlci5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJyZXF1aXJlKCdDOi9Vc2Vycy9hL3NyYy9jYXRzdnNkb2dzL2NsaWVudC9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9zbGlkZXIubS5jc3MnKTtcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIChmYWN0b3J5KCkpOyB9KTtcbn0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG59XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcInJvb3RcIjpcIk40NmdxcmswXCIsXCJvdXRwdXRUb29sdGlwXCI6XCJUY0VUWDVUU1wiLFwidmVydGljYWxcIjpcIl8zMUpWNG54MFwiLFwiaW5wdXRcIjpcIl8zYjR5eEI3QVwiLFwidHJhY2tcIjpcIl8xYzRYUndIMFwiLFwiZGlzYWJsZWRcIjpcIl8yM3VObWJIMVwiLFwicmVhZG9ubHlcIjpcIl8zdFp4VkswVFwiLFwicmVxdWlyZWRcIjpcIl8xOFhYcVRJaFwiLFwiaW52YWxpZFwiOlwiXzJEZDFILVExXCIsXCJ0aHVtYlwiOlwiXzNwdWlXc3VFXCIsXCJ2YWxpZFwiOlwiXzNqS1l4WEFkXCIsXCJpbnB1dFdyYXBwZXJcIjpcIl8yWHlaa2dfSVwiLFwiZm9jdXNlZFwiOlwiXzNtdTE0ZEhTXCIsXCJmaWxsXCI6XCJqdXlZQzQ3TFwiLFwib3V0cHV0XCI6XCJfMkVvSVpuN1VcIixcIiBfa2V5XCI6XCJAZG9qby93aWRnZXRzL3NsaWRlclwifTtcbn0pKTs7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2lkZ2V0cy90aGVtZS9zbGlkZXIubS5jc3MuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dpZGdldHMvdGhlbWUvc2xpZGVyLm0uY3NzLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxyXG50aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZVxyXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuVEhJUyBDT0RFIElTIFBST1ZJREVEIE9OIEFOICpBUyBJUyogQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWVxyXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbk1FUkNIQU5UQUJMSVRZIE9SIE5PTi1JTkZSSU5HRU1FTlQuXHJcblxyXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcclxuYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMClcclxuICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShyZXN1bHQudmFsdWUpOyB9KS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IHlbb3BbMF0gJiAyID8gXCJyZXR1cm5cIiA6IG9wWzBdID8gXCJ0aHJvd1wiIDogXCJuZXh0XCJdKSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFswLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyAgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaWYgKG9bbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH07IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl07XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gQ29weXJpZ2h0IDIwMTQgR29vZ2xlIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gICAgIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gICAgIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4hZnVuY3Rpb24oYSxiKXt2YXIgYz17fSxkPXt9LGU9e307IWZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtpZihcIm51bWJlclwiPT10eXBlb2YgYSlyZXR1cm4gYTt2YXIgYj17fTtmb3IodmFyIGMgaW4gYSliW2NdPWFbY107cmV0dXJuIGJ9ZnVuY3Rpb24gZCgpe3RoaXMuX2RlbGF5PTAsdGhpcy5fZW5kRGVsYXk9MCx0aGlzLl9maWxsPVwibm9uZVwiLHRoaXMuX2l0ZXJhdGlvblN0YXJ0PTAsdGhpcy5faXRlcmF0aW9ucz0xLHRoaXMuX2R1cmF0aW9uPTAsdGhpcy5fcGxheWJhY2tSYXRlPTEsdGhpcy5fZGlyZWN0aW9uPVwibm9ybWFsXCIsdGhpcy5fZWFzaW5nPVwibGluZWFyXCIsdGhpcy5fZWFzaW5nRnVuY3Rpb249eH1mdW5jdGlvbiBlKCl7cmV0dXJuIGEuaXNEZXByZWNhdGVkKFwiSW52YWxpZCB0aW1pbmcgaW5wdXRzXCIsXCIyMDE2LTAzLTAyXCIsXCJUeXBlRXJyb3IgZXhjZXB0aW9ucyB3aWxsIGJlIHRocm93biBpbnN0ZWFkLlwiLCEwKX1mdW5jdGlvbiBmKGIsYyxlKXt2YXIgZj1uZXcgZDtyZXR1cm4gYyYmKGYuZmlsbD1cImJvdGhcIixmLmR1cmF0aW9uPVwiYXV0b1wiKSxcIm51bWJlclwiIT10eXBlb2YgYnx8aXNOYU4oYik/dm9pZCAwIT09YiYmT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYikuZm9yRWFjaChmdW5jdGlvbihjKXtpZihcImF1dG9cIiE9YltjXSl7aWYoKFwibnVtYmVyXCI9PXR5cGVvZiBmW2NdfHxcImR1cmF0aW9uXCI9PWMpJiYoXCJudW1iZXJcIiE9dHlwZW9mIGJbY118fGlzTmFOKGJbY10pKSlyZXR1cm47aWYoXCJmaWxsXCI9PWMmJi0xPT12LmluZGV4T2YoYltjXSkpcmV0dXJuO2lmKFwiZGlyZWN0aW9uXCI9PWMmJi0xPT13LmluZGV4T2YoYltjXSkpcmV0dXJuO2lmKFwicGxheWJhY2tSYXRlXCI9PWMmJjEhPT1iW2NdJiZhLmlzRGVwcmVjYXRlZChcIkFuaW1hdGlvbkVmZmVjdFRpbWluZy5wbGF5YmFja1JhdGVcIixcIjIwMTQtMTEtMjhcIixcIlVzZSBBbmltYXRpb24ucGxheWJhY2tSYXRlIGluc3RlYWQuXCIpKXJldHVybjtmW2NdPWJbY119fSk6Zi5kdXJhdGlvbj1iLGZ9ZnVuY3Rpb24gZyhhKXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgYSYmKGE9aXNOYU4oYSk/e2R1cmF0aW9uOjB9OntkdXJhdGlvbjphfSksYX1mdW5jdGlvbiBoKGIsYyl7cmV0dXJuIGI9YS5udW1lcmljVGltaW5nVG9PYmplY3QoYiksZihiLGMpfWZ1bmN0aW9uIGkoYSxiLGMsZCl7cmV0dXJuIGE8MHx8YT4xfHxjPDB8fGM+MT94OmZ1bmN0aW9uKGUpe2Z1bmN0aW9uIGYoYSxiLGMpe3JldHVybiAzKmEqKDEtYykqKDEtYykqYyszKmIqKDEtYykqYypjK2MqYypjfWlmKGU8PTApe3ZhciBnPTA7cmV0dXJuIGE+MD9nPWIvYTohYiYmYz4wJiYoZz1kL2MpLGcqZX1pZihlPj0xKXt2YXIgaD0wO3JldHVybiBjPDE/aD0oZC0xKS8oYy0xKToxPT1jJiZhPDEmJihoPShiLTEpLyhhLTEpKSwxK2gqKGUtMSl9Zm9yKHZhciBpPTAsaj0xO2k8ajspe3ZhciBrPShpK2opLzIsbD1mKGEsYyxrKTtpZihNYXRoLmFicyhlLWwpPDFlLTUpcmV0dXJuIGYoYixkLGspO2w8ZT9pPWs6aj1rfXJldHVybiBmKGIsZCxrKX19ZnVuY3Rpb24gaihhLGIpe3JldHVybiBmdW5jdGlvbihjKXtpZihjPj0xKXJldHVybiAxO3ZhciBkPTEvYTtyZXR1cm4oYys9YipkKS1jJWR9fWZ1bmN0aW9uIGsoYSl7Q3x8KEM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKS5zdHlsZSksQy5hbmltYXRpb25UaW1pbmdGdW5jdGlvbj1cIlwiLEMuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb249YTt2YXIgYj1DLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uO2lmKFwiXCI9PWImJmUoKSl0aHJvdyBuZXcgVHlwZUVycm9yKGErXCIgaXMgbm90IGEgdmFsaWQgdmFsdWUgZm9yIGVhc2luZ1wiKTtyZXR1cm4gYn1mdW5jdGlvbiBsKGEpe2lmKFwibGluZWFyXCI9PWEpcmV0dXJuIHg7dmFyIGI9RS5leGVjKGEpO2lmKGIpcmV0dXJuIGkuYXBwbHkodGhpcyxiLnNsaWNlKDEpLm1hcChOdW1iZXIpKTt2YXIgYz1GLmV4ZWMoYSk7cmV0dXJuIGM/aihOdW1iZXIoY1sxXSkse3N0YXJ0OnksbWlkZGxlOnosZW5kOkF9W2NbMl1dKTpCW2FdfHx4fWZ1bmN0aW9uIG0oYSl7cmV0dXJuIE1hdGguYWJzKG4oYSkvYS5wbGF5YmFja1JhdGUpfWZ1bmN0aW9uIG4oYSl7cmV0dXJuIDA9PT1hLmR1cmF0aW9ufHwwPT09YS5pdGVyYXRpb25zPzA6YS5kdXJhdGlvbiphLml0ZXJhdGlvbnN9ZnVuY3Rpb24gbyhhLGIsYyl7aWYobnVsbD09YilyZXR1cm4gRzt2YXIgZD1jLmRlbGF5K2ErYy5lbmREZWxheTtyZXR1cm4gYjxNYXRoLm1pbihjLmRlbGF5LGQpP0g6Yj49TWF0aC5taW4oYy5kZWxheSthLGQpP0k6Sn1mdW5jdGlvbiBwKGEsYixjLGQsZSl7c3dpdGNoKGQpe2Nhc2UgSDpyZXR1cm5cImJhY2t3YXJkc1wiPT1ifHxcImJvdGhcIj09Yj8wOm51bGw7Y2FzZSBKOnJldHVybiBjLWU7Y2FzZSBJOnJldHVyblwiZm9yd2FyZHNcIj09Ynx8XCJib3RoXCI9PWI/YTpudWxsO2Nhc2UgRzpyZXR1cm4gbnVsbH19ZnVuY3Rpb24gcShhLGIsYyxkLGUpe3ZhciBmPWU7cmV0dXJuIDA9PT1hP2IhPT1IJiYoZis9Yyk6Zis9ZC9hLGZ9ZnVuY3Rpb24gcihhLGIsYyxkLGUsZil7dmFyIGc9YT09PTEvMD9iJTE6YSUxO3JldHVybiAwIT09Z3x8YyE9PUl8fDA9PT1kfHwwPT09ZSYmMCE9PWZ8fChnPTEpLGd9ZnVuY3Rpb24gcyhhLGIsYyxkKXtyZXR1cm4gYT09PUkmJmI9PT0xLzA/MS8wOjE9PT1jP01hdGguZmxvb3IoZCktMTpNYXRoLmZsb29yKGQpfWZ1bmN0aW9uIHQoYSxiLGMpe3ZhciBkPWE7aWYoXCJub3JtYWxcIiE9PWEmJlwicmV2ZXJzZVwiIT09YSl7dmFyIGU9YjtcImFsdGVybmF0ZS1yZXZlcnNlXCI9PT1hJiYoZSs9MSksZD1cIm5vcm1hbFwiLGUhPT0xLzAmJmUlMiE9MCYmKGQ9XCJyZXZlcnNlXCIpfXJldHVyblwibm9ybWFsXCI9PT1kP2M6MS1jfWZ1bmN0aW9uIHUoYSxiLGMpe3ZhciBkPW8oYSxiLGMpLGU9cChhLGMuZmlsbCxiLGQsYy5kZWxheSk7aWYobnVsbD09PWUpcmV0dXJuIG51bGw7dmFyIGY9cShjLmR1cmF0aW9uLGQsYy5pdGVyYXRpb25zLGUsYy5pdGVyYXRpb25TdGFydCksZz1yKGYsYy5pdGVyYXRpb25TdGFydCxkLGMuaXRlcmF0aW9ucyxlLGMuZHVyYXRpb24pLGg9cyhkLGMuaXRlcmF0aW9ucyxnLGYpLGk9dChjLmRpcmVjdGlvbixoLGcpO3JldHVybiBjLl9lYXNpbmdGdW5jdGlvbihpKX12YXIgdj1cImJhY2t3YXJkc3xmb3J3YXJkc3xib3RofG5vbmVcIi5zcGxpdChcInxcIiksdz1cInJldmVyc2V8YWx0ZXJuYXRlfGFsdGVybmF0ZS1yZXZlcnNlXCIuc3BsaXQoXCJ8XCIpLHg9ZnVuY3Rpb24oYSl7cmV0dXJuIGF9O2QucHJvdG90eXBlPXtfc2V0TWVtYmVyOmZ1bmN0aW9uKGIsYyl7dGhpc1tcIl9cIitiXT1jLHRoaXMuX2VmZmVjdCYmKHRoaXMuX2VmZmVjdC5fdGltaW5nSW5wdXRbYl09Yyx0aGlzLl9lZmZlY3QuX3RpbWluZz1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KHRoaXMuX2VmZmVjdC5fdGltaW5nSW5wdXQpLHRoaXMuX2VmZmVjdC5hY3RpdmVEdXJhdGlvbj1hLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uKHRoaXMuX2VmZmVjdC5fdGltaW5nKSx0aGlzLl9lZmZlY3QuX2FuaW1hdGlvbiYmdGhpcy5fZWZmZWN0Ll9hbmltYXRpb24uX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uKCkpfSxnZXQgcGxheWJhY2tSYXRlKCl7cmV0dXJuIHRoaXMuX3BsYXliYWNrUmF0ZX0sc2V0IGRlbGF5KGEpe3RoaXMuX3NldE1lbWJlcihcImRlbGF5XCIsYSl9LGdldCBkZWxheSgpe3JldHVybiB0aGlzLl9kZWxheX0sc2V0IGVuZERlbGF5KGEpe3RoaXMuX3NldE1lbWJlcihcImVuZERlbGF5XCIsYSl9LGdldCBlbmREZWxheSgpe3JldHVybiB0aGlzLl9lbmREZWxheX0sc2V0IGZpbGwoYSl7dGhpcy5fc2V0TWVtYmVyKFwiZmlsbFwiLGEpfSxnZXQgZmlsbCgpe3JldHVybiB0aGlzLl9maWxsfSxzZXQgaXRlcmF0aW9uU3RhcnQoYSl7aWYoKGlzTmFOKGEpfHxhPDApJiZlKCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIml0ZXJhdGlvblN0YXJ0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLCByZWNlaXZlZDogXCIrdGltaW5nLml0ZXJhdGlvblN0YXJ0KTt0aGlzLl9zZXRNZW1iZXIoXCJpdGVyYXRpb25TdGFydFwiLGEpfSxnZXQgaXRlcmF0aW9uU3RhcnQoKXtyZXR1cm4gdGhpcy5faXRlcmF0aW9uU3RhcnR9LHNldCBkdXJhdGlvbihhKXtpZihcImF1dG9cIiE9YSYmKGlzTmFOKGEpfHxhPDApJiZlKCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcImR1cmF0aW9uIG11c3QgYmUgbm9uLW5lZ2F0aXZlIG9yIGF1dG8sIHJlY2VpdmVkOiBcIithKTt0aGlzLl9zZXRNZW1iZXIoXCJkdXJhdGlvblwiLGEpfSxnZXQgZHVyYXRpb24oKXtyZXR1cm4gdGhpcy5fZHVyYXRpb259LHNldCBkaXJlY3Rpb24oYSl7dGhpcy5fc2V0TWVtYmVyKFwiZGlyZWN0aW9uXCIsYSl9LGdldCBkaXJlY3Rpb24oKXtyZXR1cm4gdGhpcy5fZGlyZWN0aW9ufSxzZXQgZWFzaW5nKGEpe3RoaXMuX2Vhc2luZ0Z1bmN0aW9uPWwoayhhKSksdGhpcy5fc2V0TWVtYmVyKFwiZWFzaW5nXCIsYSl9LGdldCBlYXNpbmcoKXtyZXR1cm4gdGhpcy5fZWFzaW5nfSxzZXQgaXRlcmF0aW9ucyhhKXtpZigoaXNOYU4oYSl8fGE8MCkmJmUoKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiaXRlcmF0aW9ucyBtdXN0IGJlIG5vbi1uZWdhdGl2ZSwgcmVjZWl2ZWQ6IFwiK2EpO3RoaXMuX3NldE1lbWJlcihcIml0ZXJhdGlvbnNcIixhKX0sZ2V0IGl0ZXJhdGlvbnMoKXtyZXR1cm4gdGhpcy5faXRlcmF0aW9uc319O3ZhciB5PTEsej0uNSxBPTAsQj17ZWFzZTppKC4yNSwuMSwuMjUsMSksXCJlYXNlLWluXCI6aSguNDIsMCwxLDEpLFwiZWFzZS1vdXRcIjppKDAsMCwuNTgsMSksXCJlYXNlLWluLW91dFwiOmkoLjQyLDAsLjU4LDEpLFwic3RlcC1zdGFydFwiOmooMSx5KSxcInN0ZXAtbWlkZGxlXCI6aigxLHopLFwic3RlcC1lbmRcIjpqKDEsQSl9LEM9bnVsbCxEPVwiXFxcXHMqKC0/XFxcXGQrXFxcXC4/XFxcXGQqfC0/XFxcXC5cXFxcZCspXFxcXHMqXCIsRT1uZXcgUmVnRXhwKFwiY3ViaWMtYmV6aWVyXFxcXChcIitEK1wiLFwiK0QrXCIsXCIrRCtcIixcIitEK1wiXFxcXClcIiksRj0vc3RlcHNcXChcXHMqKFxcZCspXFxzKixcXHMqKHN0YXJ0fG1pZGRsZXxlbmQpXFxzKlxcKS8sRz0wLEg9MSxJPTIsSj0zO2EuY2xvbmVUaW1pbmdJbnB1dD1jLGEubWFrZVRpbWluZz1mLGEubnVtZXJpY1RpbWluZ1RvT2JqZWN0PWcsYS5ub3JtYWxpemVUaW1pbmdJbnB1dD1oLGEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb249bSxhLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzPXUsYS5jYWxjdWxhdGVQaGFzZT1vLGEubm9ybWFsaXplRWFzaW5nPWssYS5wYXJzZUVhc2luZ0Z1bmN0aW9uPWx9KGMpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIpe3JldHVybiBhIGluIGs/a1thXVtiXXx8YjpifWZ1bmN0aW9uIGQoYSl7cmV0dXJuXCJkaXNwbGF5XCI9PT1hfHwwPT09YS5sYXN0SW5kZXhPZihcImFuaW1hdGlvblwiLDApfHwwPT09YS5sYXN0SW5kZXhPZihcInRyYW5zaXRpb25cIiwwKX1mdW5jdGlvbiBlKGEsYixlKXtpZighZChhKSl7dmFyIGY9aFthXTtpZihmKXtpLnN0eWxlW2FdPWI7Zm9yKHZhciBnIGluIGYpe3ZhciBqPWZbZ10saz1pLnN0eWxlW2pdO2Vbal09YyhqLGspfX1lbHNlIGVbYV09YyhhLGIpfX1mdW5jdGlvbiBmKGEpe3ZhciBiPVtdO2Zvcih2YXIgYyBpbiBhKWlmKCEoYyBpbltcImVhc2luZ1wiLFwib2Zmc2V0XCIsXCJjb21wb3NpdGVcIl0pKXt2YXIgZD1hW2NdO0FycmF5LmlzQXJyYXkoZCl8fChkPVtkXSk7Zm9yKHZhciBlLGY9ZC5sZW5ndGgsZz0wO2c8ZjtnKyspZT17fSxlLm9mZnNldD1cIm9mZnNldFwiaW4gYT9hLm9mZnNldDoxPT1mPzE6Zy8oZi0xKSxcImVhc2luZ1wiaW4gYSYmKGUuZWFzaW5nPWEuZWFzaW5nKSxcImNvbXBvc2l0ZVwiaW4gYSYmKGUuY29tcG9zaXRlPWEuY29tcG9zaXRlKSxlW2NdPWRbZ10sYi5wdXNoKGUpfXJldHVybiBiLnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS5vZmZzZXQtYi5vZmZzZXR9KSxifWZ1bmN0aW9uIGcoYil7ZnVuY3Rpb24gYygpe3ZhciBhPWQubGVuZ3RoO251bGw9PWRbYS0xXS5vZmZzZXQmJihkW2EtMV0ub2Zmc2V0PTEpLGE+MSYmbnVsbD09ZFswXS5vZmZzZXQmJihkWzBdLm9mZnNldD0wKTtmb3IodmFyIGI9MCxjPWRbMF0ub2Zmc2V0LGU9MTtlPGE7ZSsrKXt2YXIgZj1kW2VdLm9mZnNldDtpZihudWxsIT1mKXtmb3IodmFyIGc9MTtnPGUtYjtnKyspZFtiK2ddLm9mZnNldD1jKyhmLWMpKmcvKGUtYik7Yj1lLGM9Zn19fWlmKG51bGw9PWIpcmV0dXJuW107d2luZG93LlN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yJiZBcnJheS5wcm90b3R5cGUuZnJvbSYmYltTeW1ib2wuaXRlcmF0b3JdJiYoYj1BcnJheS5mcm9tKGIpKSxBcnJheS5pc0FycmF5KGIpfHwoYj1mKGIpKTtmb3IodmFyIGQ9Yi5tYXAoZnVuY3Rpb24oYil7dmFyIGM9e307Zm9yKHZhciBkIGluIGIpe3ZhciBmPWJbZF07aWYoXCJvZmZzZXRcIj09ZCl7aWYobnVsbCE9Zil7aWYoZj1OdW1iZXIoZiksIWlzRmluaXRlKGYpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJLZXlmcmFtZSBvZmZzZXRzIG11c3QgYmUgbnVtYmVycy5cIik7aWYoZjwwfHxmPjEpdGhyb3cgbmV3IFR5cGVFcnJvcihcIktleWZyYW1lIG9mZnNldHMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEuXCIpfX1lbHNlIGlmKFwiY29tcG9zaXRlXCI9PWQpe2lmKFwiYWRkXCI9PWZ8fFwiYWNjdW11bGF0ZVwiPT1mKXRocm93e3R5cGU6RE9NRXhjZXB0aW9uLk5PVF9TVVBQT1JURURfRVJSLG5hbWU6XCJOb3RTdXBwb3J0ZWRFcnJvclwiLG1lc3NhZ2U6XCJhZGQgY29tcG9zaXRpbmcgaXMgbm90IHN1cHBvcnRlZFwifTtpZihcInJlcGxhY2VcIiE9Zil0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjb21wb3NpdGUgbW9kZSBcIitmK1wiLlwiKX1lbHNlIGY9XCJlYXNpbmdcIj09ZD9hLm5vcm1hbGl6ZUVhc2luZyhmKTpcIlwiK2Y7ZShkLGYsYyl9cmV0dXJuIHZvaWQgMD09Yy5vZmZzZXQmJihjLm9mZnNldD1udWxsKSx2b2lkIDA9PWMuZWFzaW5nJiYoYy5lYXNpbmc9XCJsaW5lYXJcIiksY30pLGc9ITAsaD0tMS8wLGk9MDtpPGQubGVuZ3RoO2krKyl7dmFyIGo9ZFtpXS5vZmZzZXQ7aWYobnVsbCE9ail7aWYoajxoKXRocm93IG5ldyBUeXBlRXJyb3IoXCJLZXlmcmFtZXMgYXJlIG5vdCBsb29zZWx5IHNvcnRlZCBieSBvZmZzZXQuIFNvcnQgb3Igc3BlY2lmeSBvZmZzZXRzLlwiKTtoPWp9ZWxzZSBnPSExfXJldHVybiBkPWQuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBhLm9mZnNldD49MCYmYS5vZmZzZXQ8PTF9KSxnfHxjKCksZH12YXIgaD17YmFja2dyb3VuZDpbXCJiYWNrZ3JvdW5kSW1hZ2VcIixcImJhY2tncm91bmRQb3NpdGlvblwiLFwiYmFja2dyb3VuZFNpemVcIixcImJhY2tncm91bmRSZXBlYXRcIixcImJhY2tncm91bmRBdHRhY2htZW50XCIsXCJiYWNrZ3JvdW5kT3JpZ2luXCIsXCJiYWNrZ3JvdW5kQ2xpcFwiLFwiYmFja2dyb3VuZENvbG9yXCJdLGJvcmRlcjpbXCJib3JkZXJUb3BDb2xvclwiLFwiYm9yZGVyVG9wU3R5bGVcIixcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJSaWdodENvbG9yXCIsXCJib3JkZXJSaWdodFN0eWxlXCIsXCJib3JkZXJSaWdodFdpZHRoXCIsXCJib3JkZXJCb3R0b21Db2xvclwiLFwiYm9yZGVyQm90dG9tU3R5bGVcIixcImJvcmRlckJvdHRvbVdpZHRoXCIsXCJib3JkZXJMZWZ0Q29sb3JcIixcImJvcmRlckxlZnRTdHlsZVwiLFwiYm9yZGVyTGVmdFdpZHRoXCJdLGJvcmRlckJvdHRvbTpbXCJib3JkZXJCb3R0b21XaWR0aFwiLFwiYm9yZGVyQm90dG9tU3R5bGVcIixcImJvcmRlckJvdHRvbUNvbG9yXCJdLGJvcmRlckNvbG9yOltcImJvcmRlclRvcENvbG9yXCIsXCJib3JkZXJSaWdodENvbG9yXCIsXCJib3JkZXJCb3R0b21Db2xvclwiLFwiYm9yZGVyTGVmdENvbG9yXCJdLGJvcmRlckxlZnQ6W1wiYm9yZGVyTGVmdFdpZHRoXCIsXCJib3JkZXJMZWZ0U3R5bGVcIixcImJvcmRlckxlZnRDb2xvclwiXSxib3JkZXJSYWRpdXM6W1wiYm9yZGVyVG9wTGVmdFJhZGl1c1wiLFwiYm9yZGVyVG9wUmlnaHRSYWRpdXNcIixcImJvcmRlckJvdHRvbVJpZ2h0UmFkaXVzXCIsXCJib3JkZXJCb3R0b21MZWZ0UmFkaXVzXCJdLGJvcmRlclJpZ2h0OltcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlclJpZ2h0U3R5bGVcIixcImJvcmRlclJpZ2h0Q29sb3JcIl0sYm9yZGVyVG9wOltcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJUb3BTdHlsZVwiLFwiYm9yZGVyVG9wQ29sb3JcIl0sYm9yZGVyV2lkdGg6W1wiYm9yZGVyVG9wV2lkdGhcIixcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlckJvdHRvbVdpZHRoXCIsXCJib3JkZXJMZWZ0V2lkdGhcIl0sZmxleDpbXCJmbGV4R3Jvd1wiLFwiZmxleFNocmlua1wiLFwiZmxleEJhc2lzXCJdLGZvbnQ6W1wiZm9udEZhbWlseVwiLFwiZm9udFNpemVcIixcImZvbnRTdHlsZVwiLFwiZm9udFZhcmlhbnRcIixcImZvbnRXZWlnaHRcIixcImxpbmVIZWlnaHRcIl0sbWFyZ2luOltcIm1hcmdpblRvcFwiLFwibWFyZ2luUmlnaHRcIixcIm1hcmdpbkJvdHRvbVwiLFwibWFyZ2luTGVmdFwiXSxvdXRsaW5lOltcIm91dGxpbmVDb2xvclwiLFwib3V0bGluZVN0eWxlXCIsXCJvdXRsaW5lV2lkdGhcIl0scGFkZGluZzpbXCJwYWRkaW5nVG9wXCIsXCJwYWRkaW5nUmlnaHRcIixcInBhZGRpbmdCb3R0b21cIixcInBhZGRpbmdMZWZ0XCJdfSxpPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImRpdlwiKSxqPXt0aGluOlwiMXB4XCIsbWVkaXVtOlwiM3B4XCIsdGhpY2s6XCI1cHhcIn0saz17Ym9yZGVyQm90dG9tV2lkdGg6aixib3JkZXJMZWZ0V2lkdGg6aixib3JkZXJSaWdodFdpZHRoOmosYm9yZGVyVG9wV2lkdGg6aixmb250U2l6ZTp7XCJ4eC1zbWFsbFwiOlwiNjAlXCIsXCJ4LXNtYWxsXCI6XCI3NSVcIixzbWFsbDpcIjg5JVwiLG1lZGl1bTpcIjEwMCVcIixsYXJnZTpcIjEyMCVcIixcIngtbGFyZ2VcIjpcIjE1MCVcIixcInh4LWxhcmdlXCI6XCIyMDAlXCJ9LGZvbnRXZWlnaHQ6e25vcm1hbDpcIjQwMFwiLGJvbGQ6XCI3MDBcIn0sb3V0bGluZVdpZHRoOmosdGV4dFNoYWRvdzp7bm9uZTpcIjBweCAwcHggMHB4IHRyYW5zcGFyZW50XCJ9LGJveFNoYWRvdzp7bm9uZTpcIjBweCAwcHggMHB4IDBweCB0cmFuc3BhcmVudFwifX07YS5jb252ZXJ0VG9BcnJheUZvcm09ZixhLm5vcm1hbGl6ZUtleWZyYW1lcz1nfShjKSxmdW5jdGlvbihhKXt2YXIgYj17fTthLmlzRGVwcmVjYXRlZD1mdW5jdGlvbihhLGMsZCxlKXt2YXIgZj1lP1wiYXJlXCI6XCJpc1wiLGc9bmV3IERhdGUsaD1uZXcgRGF0ZShjKTtyZXR1cm4gaC5zZXRNb250aChoLmdldE1vbnRoKCkrMyksIShnPGgmJihhIGluIGJ8fGNvbnNvbGUud2FybihcIldlYiBBbmltYXRpb25zOiBcIithK1wiIFwiK2YrXCIgZGVwcmVjYXRlZCBhbmQgd2lsbCBzdG9wIHdvcmtpbmcgb24gXCIraC50b0RhdGVTdHJpbmcoKStcIi4gXCIrZCksYlthXT0hMCwxKSl9LGEuZGVwcmVjYXRlZD1mdW5jdGlvbihiLGMsZCxlKXt2YXIgZj1lP1wiYXJlXCI6XCJpc1wiO2lmKGEuaXNEZXByZWNhdGVkKGIsYyxkLGUpKXRocm93IG5ldyBFcnJvcihiK1wiIFwiK2YrXCIgbm8gbG9uZ2VyIHN1cHBvcnRlZC4gXCIrZCl9fShjKSxmdW5jdGlvbigpe2lmKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hbmltYXRlKXt2YXIgYT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYW5pbWF0ZShbXSwwKSxiPSEwO2lmKGEmJihiPSExLFwicGxheXxjdXJyZW50VGltZXxwYXVzZXxyZXZlcnNlfHBsYXliYWNrUmF0ZXxjYW5jZWx8ZmluaXNofHN0YXJ0VGltZXxwbGF5U3RhdGVcIi5zcGxpdChcInxcIikuZm9yRWFjaChmdW5jdGlvbihjKXt2b2lkIDA9PT1hW2NdJiYoYj0hMCl9KSksIWIpcmV0dXJufSFmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXtmb3IodmFyIGI9e30sYz0wO2M8YS5sZW5ndGg7YysrKWZvcih2YXIgZCBpbiBhW2NdKWlmKFwib2Zmc2V0XCIhPWQmJlwiZWFzaW5nXCIhPWQmJlwiY29tcG9zaXRlXCIhPWQpe3ZhciBlPXtvZmZzZXQ6YVtjXS5vZmZzZXQsZWFzaW5nOmFbY10uZWFzaW5nLHZhbHVlOmFbY11bZF19O2JbZF09YltkXXx8W10sYltkXS5wdXNoKGUpfWZvcih2YXIgZiBpbiBiKXt2YXIgZz1iW2ZdO2lmKDAhPWdbMF0ub2Zmc2V0fHwxIT1nW2cubGVuZ3RoLTFdLm9mZnNldCl0aHJvd3t0eXBlOkRPTUV4Y2VwdGlvbi5OT1RfU1VQUE9SVEVEX0VSUixuYW1lOlwiTm90U3VwcG9ydGVkRXJyb3JcIixtZXNzYWdlOlwiUGFydGlhbCBrZXlmcmFtZXMgYXJlIG5vdCBzdXBwb3J0ZWRcIn19cmV0dXJuIGJ9ZnVuY3Rpb24gZShjKXt2YXIgZD1bXTtmb3IodmFyIGUgaW4gYylmb3IodmFyIGY9Y1tlXSxnPTA7ZzxmLmxlbmd0aC0xO2crKyl7dmFyIGg9ZyxpPWcrMSxqPWZbaF0ub2Zmc2V0LGs9ZltpXS5vZmZzZXQsbD1qLG09azswPT1nJiYobD0tMS8wLDA9PWsmJihpPWgpKSxnPT1mLmxlbmd0aC0yJiYobT0xLzAsMT09aiYmKGg9aSkpLGQucHVzaCh7YXBwbHlGcm9tOmwsYXBwbHlUbzptLHN0YXJ0T2Zmc2V0OmZbaF0ub2Zmc2V0LGVuZE9mZnNldDpmW2ldLm9mZnNldCxlYXNpbmdGdW5jdGlvbjphLnBhcnNlRWFzaW5nRnVuY3Rpb24oZltoXS5lYXNpbmcpLHByb3BlcnR5OmUsaW50ZXJwb2xhdGlvbjpiLnByb3BlcnR5SW50ZXJwb2xhdGlvbihlLGZbaF0udmFsdWUsZltpXS52YWx1ZSl9KX1yZXR1cm4gZC5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGEuc3RhcnRPZmZzZXQtYi5zdGFydE9mZnNldH0pLGR9Yi5jb252ZXJ0RWZmZWN0SW5wdXQ9ZnVuY3Rpb24oYyl7dmFyIGY9YS5ub3JtYWxpemVLZXlmcmFtZXMoYyksZz1kKGYpLGg9ZShnKTtyZXR1cm4gZnVuY3Rpb24oYSxjKXtpZihudWxsIT1jKWguZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBjPj1hLmFwcGx5RnJvbSYmYzxhLmFwcGx5VG99KS5mb3JFYWNoKGZ1bmN0aW9uKGQpe3ZhciBlPWMtZC5zdGFydE9mZnNldCxmPWQuZW5kT2Zmc2V0LWQuc3RhcnRPZmZzZXQsZz0wPT1mPzA6ZC5lYXNpbmdGdW5jdGlvbihlL2YpO2IuYXBwbHkoYSxkLnByb3BlcnR5LGQuaW50ZXJwb2xhdGlvbihnKSl9KTtlbHNlIGZvcih2YXIgZCBpbiBnKVwib2Zmc2V0XCIhPWQmJlwiZWFzaW5nXCIhPWQmJlwiY29tcG9zaXRlXCIhPWQmJmIuY2xlYXIoYSxkKX19fShjLGQpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe3JldHVybiBhLnJlcGxhY2UoLy0oLikvZyxmdW5jdGlvbihhLGIpe3JldHVybiBiLnRvVXBwZXJDYXNlKCl9KX1mdW5jdGlvbiBlKGEsYixjKXtoW2NdPWhbY118fFtdLGhbY10ucHVzaChbYSxiXSl9ZnVuY3Rpb24gZihhLGIsYyl7Zm9yKHZhciBmPTA7ZjxjLmxlbmd0aDtmKyspe2UoYSxiLGQoY1tmXSkpfX1mdW5jdGlvbiBnKGMsZSxmKXt2YXIgZz1jOy8tLy50ZXN0KGMpJiYhYS5pc0RlcHJlY2F0ZWQoXCJIeXBoZW5hdGVkIHByb3BlcnR5IG5hbWVzXCIsXCIyMDE2LTAzLTIyXCIsXCJVc2UgY2FtZWxDYXNlIGluc3RlYWQuXCIsITApJiYoZz1kKGMpKSxcImluaXRpYWxcIiE9ZSYmXCJpbml0aWFsXCIhPWZ8fChcImluaXRpYWxcIj09ZSYmKGU9aVtnXSksXCJpbml0aWFsXCI9PWYmJihmPWlbZ10pKTtmb3IodmFyIGo9ZT09Zj9bXTpoW2ddLGs9MDtqJiZrPGoubGVuZ3RoO2srKyl7dmFyIGw9altrXVswXShlKSxtPWpba11bMF0oZik7aWYodm9pZCAwIT09bCYmdm9pZCAwIT09bSl7dmFyIG49altrXVsxXShsLG0pO2lmKG4pe3ZhciBvPWIuSW50ZXJwb2xhdGlvbi5hcHBseShudWxsLG4pO3JldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gMD09YT9lOjE9PWE/ZjpvKGEpfX19fXJldHVybiBiLkludGVycG9sYXRpb24oITEsITAsZnVuY3Rpb24oYSl7cmV0dXJuIGE/ZjplfSl9dmFyIGg9e307Yi5hZGRQcm9wZXJ0aWVzSGFuZGxlcj1mO3ZhciBpPXtiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiLGJhY2tncm91bmRQb3NpdGlvbjpcIjAlIDAlXCIsYm9yZGVyQm90dG9tQ29sb3I6XCJjdXJyZW50Q29sb3JcIixib3JkZXJCb3R0b21MZWZ0UmFkaXVzOlwiMHB4XCIsYm9yZGVyQm90dG9tUmlnaHRSYWRpdXM6XCIwcHhcIixib3JkZXJCb3R0b21XaWR0aDpcIjNweFwiLGJvcmRlckxlZnRDb2xvcjpcImN1cnJlbnRDb2xvclwiLGJvcmRlckxlZnRXaWR0aDpcIjNweFwiLGJvcmRlclJpZ2h0Q29sb3I6XCJjdXJyZW50Q29sb3JcIixib3JkZXJSaWdodFdpZHRoOlwiM3B4XCIsYm9yZGVyU3BhY2luZzpcIjJweFwiLGJvcmRlclRvcENvbG9yOlwiY3VycmVudENvbG9yXCIsYm9yZGVyVG9wTGVmdFJhZGl1czpcIjBweFwiLGJvcmRlclRvcFJpZ2h0UmFkaXVzOlwiMHB4XCIsYm9yZGVyVG9wV2lkdGg6XCIzcHhcIixib3R0b206XCJhdXRvXCIsY2xpcDpcInJlY3QoMHB4LCAwcHgsIDBweCwgMHB4KVwiLGNvbG9yOlwiYmxhY2tcIixmb250U2l6ZTpcIjEwMCVcIixmb250V2VpZ2h0OlwiNDAwXCIsaGVpZ2h0OlwiYXV0b1wiLGxlZnQ6XCJhdXRvXCIsbGV0dGVyU3BhY2luZzpcIm5vcm1hbFwiLGxpbmVIZWlnaHQ6XCIxMjAlXCIsbWFyZ2luQm90dG9tOlwiMHB4XCIsbWFyZ2luTGVmdDpcIjBweFwiLG1hcmdpblJpZ2h0OlwiMHB4XCIsbWFyZ2luVG9wOlwiMHB4XCIsbWF4SGVpZ2h0Olwibm9uZVwiLG1heFdpZHRoOlwibm9uZVwiLG1pbkhlaWdodDpcIjBweFwiLG1pbldpZHRoOlwiMHB4XCIsb3BhY2l0eTpcIjEuMFwiLG91dGxpbmVDb2xvcjpcImludmVydFwiLG91dGxpbmVPZmZzZXQ6XCIwcHhcIixvdXRsaW5lV2lkdGg6XCIzcHhcIixwYWRkaW5nQm90dG9tOlwiMHB4XCIscGFkZGluZ0xlZnQ6XCIwcHhcIixwYWRkaW5nUmlnaHQ6XCIwcHhcIixwYWRkaW5nVG9wOlwiMHB4XCIscmlnaHQ6XCJhdXRvXCIsc3Ryb2tlRGFzaGFycmF5Olwibm9uZVwiLHN0cm9rZURhc2hvZmZzZXQ6XCIwcHhcIix0ZXh0SW5kZW50OlwiMHB4XCIsdGV4dFNoYWRvdzpcIjBweCAwcHggMHB4IHRyYW5zcGFyZW50XCIsdG9wOlwiYXV0b1wiLHRyYW5zZm9ybTpcIlwiLHZlcnRpY2FsQWxpZ246XCIwcHhcIix2aXNpYmlsaXR5OlwidmlzaWJsZVwiLHdpZHRoOlwiYXV0b1wiLHdvcmRTcGFjaW5nOlwibm9ybWFsXCIsekluZGV4OlwiYXV0b1wifTtiLnByb3BlcnR5SW50ZXJwb2xhdGlvbj1nfShjLGQpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGIpe3ZhciBjPWEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24oYiksZD1mdW5jdGlvbihkKXtyZXR1cm4gYS5jYWxjdWxhdGVJdGVyYXRpb25Qcm9ncmVzcyhjLGQsYil9O3JldHVybiBkLl90b3RhbER1cmF0aW9uPWIuZGVsYXkrYytiLmVuZERlbGF5LGR9Yi5LZXlmcmFtZUVmZmVjdD1mdW5jdGlvbihjLGUsZixnKXt2YXIgaCxpPWQoYS5ub3JtYWxpemVUaW1pbmdJbnB1dChmKSksaj1iLmNvbnZlcnRFZmZlY3RJbnB1dChlKSxrPWZ1bmN0aW9uKCl7aihjLGgpfTtyZXR1cm4gay5fdXBkYXRlPWZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT09KGg9aShhKSl9LGsuX2NsZWFyPWZ1bmN0aW9uKCl7aihjLG51bGwpfSxrLl9oYXNTYW1lVGFyZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiBjPT09YX0say5fdGFyZ2V0PWMsay5fdG90YWxEdXJhdGlvbj1pLl90b3RhbER1cmF0aW9uLGsuX2lkPWcsa319KGMsZCksZnVuY3Rpb24oYSxiKXthLmFwcGx5PWZ1bmN0aW9uKGIsYyxkKXtiLnN0eWxlW2EucHJvcGVydHlOYW1lKGMpXT1kfSxhLmNsZWFyPWZ1bmN0aW9uKGIsYyl7Yi5zdHlsZVthLnByb3BlcnR5TmFtZShjKV09XCJcIn19KGQpLGZ1bmN0aW9uKGEpe3dpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9XCJcIjtyZXR1cm4gYyYmYy5pZCYmKGQ9Yy5pZCksYS50aW1lbGluZS5fcGxheShhLktleWZyYW1lRWZmZWN0KHRoaXMsYixjLGQpKX19KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIsZCl7aWYoXCJudW1iZXJcIj09dHlwZW9mIGEmJlwibnVtYmVyXCI9PXR5cGVvZiBiKXJldHVybiBhKigxLWQpK2IqZDtpZihcImJvb2xlYW5cIj09dHlwZW9mIGEmJlwiYm9vbGVhblwiPT10eXBlb2YgYilyZXR1cm4gZDwuNT9hOmI7aWYoYS5sZW5ndGg9PWIubGVuZ3RoKXtmb3IodmFyIGU9W10sZj0wO2Y8YS5sZW5ndGg7ZisrKWUucHVzaChjKGFbZl0sYltmXSxkKSk7cmV0dXJuIGV9dGhyb3dcIk1pc21hdGNoZWQgaW50ZXJwb2xhdGlvbiBhcmd1bWVudHMgXCIrYStcIjpcIitifWEuSW50ZXJwb2xhdGlvbj1mdW5jdGlvbihhLGIsZCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBkKGMoYSxiLGUpKX19fShkKSxmdW5jdGlvbihhLGIsYyl7YS5zZXF1ZW5jZU51bWJlcj0wO3ZhciBkPWZ1bmN0aW9uKGEsYixjKXt0aGlzLnRhcmdldD1hLHRoaXMuY3VycmVudFRpbWU9Yix0aGlzLnRpbWVsaW5lVGltZT1jLHRoaXMudHlwZT1cImZpbmlzaFwiLHRoaXMuYnViYmxlcz0hMSx0aGlzLmNhbmNlbGFibGU9ITEsdGhpcy5jdXJyZW50VGFyZ2V0PWEsdGhpcy5kZWZhdWx0UHJldmVudGVkPSExLHRoaXMuZXZlbnRQaGFzZT1FdmVudC5BVF9UQVJHRVQsdGhpcy50aW1lU3RhbXA9RGF0ZS5ub3coKX07Yi5BbmltYXRpb249ZnVuY3Rpb24oYil7dGhpcy5pZD1cIlwiLGImJmIuX2lkJiYodGhpcy5pZD1iLl9pZCksdGhpcy5fc2VxdWVuY2VOdW1iZXI9YS5zZXF1ZW5jZU51bWJlcisrLHRoaXMuX2N1cnJlbnRUaW1lPTAsdGhpcy5fc3RhcnRUaW1lPW51bGwsdGhpcy5fcGF1c2VkPSExLHRoaXMuX3BsYXliYWNrUmF0ZT0xLHRoaXMuX2luVGltZWxpbmU9ITAsdGhpcy5fZmluaXNoZWRGbGFnPSEwLHRoaXMub25maW5pc2g9bnVsbCx0aGlzLl9maW5pc2hIYW5kbGVycz1bXSx0aGlzLl9lZmZlY3Q9Yix0aGlzLl9pbkVmZmVjdD10aGlzLl9lZmZlY3QuX3VwZGF0ZSgwKSx0aGlzLl9pZGxlPSEwLHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMX0sYi5BbmltYXRpb24ucHJvdG90eXBlPXtfZW5zdXJlQWxpdmU6ZnVuY3Rpb24oKXt0aGlzLnBsYXliYWNrUmF0ZTwwJiYwPT09dGhpcy5jdXJyZW50VGltZT90aGlzLl9pbkVmZmVjdD10aGlzLl9lZmZlY3QuX3VwZGF0ZSgtMSk6dGhpcy5faW5FZmZlY3Q9dGhpcy5fZWZmZWN0Ll91cGRhdGUodGhpcy5jdXJyZW50VGltZSksdGhpcy5faW5UaW1lbGluZXx8IXRoaXMuX2luRWZmZWN0JiZ0aGlzLl9maW5pc2hlZEZsYWd8fCh0aGlzLl9pblRpbWVsaW5lPSEwLGIudGltZWxpbmUuX2FuaW1hdGlvbnMucHVzaCh0aGlzKSl9LF90aWNrQ3VycmVudFRpbWU6ZnVuY3Rpb24oYSxiKXthIT10aGlzLl9jdXJyZW50VGltZSYmKHRoaXMuX2N1cnJlbnRUaW1lPWEsdGhpcy5faXNGaW5pc2hlZCYmIWImJih0aGlzLl9jdXJyZW50VGltZT10aGlzLl9wbGF5YmFja1JhdGU+MD90aGlzLl90b3RhbER1cmF0aW9uOjApLHRoaXMuX2Vuc3VyZUFsaXZlKCkpfSxnZXQgY3VycmVudFRpbWUoKXtyZXR1cm4gdGhpcy5faWRsZXx8dGhpcy5fY3VycmVudFRpbWVQZW5kaW5nP251bGw6dGhpcy5fY3VycmVudFRpbWV9LHNldCBjdXJyZW50VGltZShhKXthPSthLGlzTmFOKGEpfHwoYi5yZXN0YXJ0KCksdGhpcy5fcGF1c2VkfHxudWxsPT10aGlzLl9zdGFydFRpbWV8fCh0aGlzLl9zdGFydFRpbWU9dGhpcy5fdGltZWxpbmUuY3VycmVudFRpbWUtYS90aGlzLl9wbGF5YmFja1JhdGUpLHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMSx0aGlzLl9jdXJyZW50VGltZSE9YSYmKHRoaXMuX2lkbGUmJih0aGlzLl9pZGxlPSExLHRoaXMuX3BhdXNlZD0hMCksdGhpcy5fdGlja0N1cnJlbnRUaW1lKGEsITApLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKSl9LGdldCBzdGFydFRpbWUoKXtyZXR1cm4gdGhpcy5fc3RhcnRUaW1lfSxzZXQgc3RhcnRUaW1lKGEpe2E9K2EsaXNOYU4oYSl8fHRoaXMuX3BhdXNlZHx8dGhpcy5faWRsZXx8KHRoaXMuX3N0YXJ0VGltZT1hLHRoaXMuX3RpY2tDdXJyZW50VGltZSgodGhpcy5fdGltZWxpbmUuY3VycmVudFRpbWUtdGhpcy5fc3RhcnRUaW1lKSp0aGlzLnBsYXliYWNrUmF0ZSksYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcykpfSxnZXQgcGxheWJhY2tSYXRlKCl7cmV0dXJuIHRoaXMuX3BsYXliYWNrUmF0ZX0sc2V0IHBsYXliYWNrUmF0ZShhKXtpZihhIT10aGlzLl9wbGF5YmFja1JhdGUpe3ZhciBjPXRoaXMuY3VycmVudFRpbWU7dGhpcy5fcGxheWJhY2tSYXRlPWEsdGhpcy5fc3RhcnRUaW1lPW51bGwsXCJwYXVzZWRcIiE9dGhpcy5wbGF5U3RhdGUmJlwiaWRsZVwiIT10aGlzLnBsYXlTdGF0ZSYmKHRoaXMuX2ZpbmlzaGVkRmxhZz0hMSx0aGlzLl9pZGxlPSExLHRoaXMuX2Vuc3VyZUFsaXZlKCksYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcykpLG51bGwhPWMmJih0aGlzLmN1cnJlbnRUaW1lPWMpfX0sZ2V0IF9pc0ZpbmlzaGVkKCl7cmV0dXJuIXRoaXMuX2lkbGUmJih0aGlzLl9wbGF5YmFja1JhdGU+MCYmdGhpcy5fY3VycmVudFRpbWU+PXRoaXMuX3RvdGFsRHVyYXRpb258fHRoaXMuX3BsYXliYWNrUmF0ZTwwJiZ0aGlzLl9jdXJyZW50VGltZTw9MCl9LGdldCBfdG90YWxEdXJhdGlvbigpe3JldHVybiB0aGlzLl9lZmZlY3QuX3RvdGFsRHVyYXRpb259LGdldCBwbGF5U3RhdGUoKXtyZXR1cm4gdGhpcy5faWRsZT9cImlkbGVcIjpudWxsPT10aGlzLl9zdGFydFRpbWUmJiF0aGlzLl9wYXVzZWQmJjAhPXRoaXMucGxheWJhY2tSYXRlfHx0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc/XCJwZW5kaW5nXCI6dGhpcy5fcGF1c2VkP1wicGF1c2VkXCI6dGhpcy5faXNGaW5pc2hlZD9cImZpbmlzaGVkXCI6XCJydW5uaW5nXCJ9LF9yZXdpbmQ6ZnVuY3Rpb24oKXtpZih0aGlzLl9wbGF5YmFja1JhdGU+PTApdGhpcy5fY3VycmVudFRpbWU9MDtlbHNle2lmKCEodGhpcy5fdG90YWxEdXJhdGlvbjwxLzApKXRocm93IG5ldyBET01FeGNlcHRpb24oXCJVbmFibGUgdG8gcmV3aW5kIG5lZ2F0aXZlIHBsYXliYWNrIHJhdGUgYW5pbWF0aW9uIHdpdGggaW5maW5pdGUgZHVyYXRpb25cIixcIkludmFsaWRTdGF0ZUVycm9yXCIpO3RoaXMuX2N1cnJlbnRUaW1lPXRoaXMuX3RvdGFsRHVyYXRpb259fSxwbGF5OmZ1bmN0aW9uKCl7dGhpcy5fcGF1c2VkPSExLCh0aGlzLl9pc0ZpbmlzaGVkfHx0aGlzLl9pZGxlKSYmKHRoaXMuX3Jld2luZCgpLHRoaXMuX3N0YXJ0VGltZT1udWxsKSx0aGlzLl9maW5pc2hlZEZsYWc9ITEsdGhpcy5faWRsZT0hMSx0aGlzLl9lbnN1cmVBbGl2ZSgpLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpfSxwYXVzZTpmdW5jdGlvbigpe3RoaXMuX2lzRmluaXNoZWR8fHRoaXMuX3BhdXNlZHx8dGhpcy5faWRsZT90aGlzLl9pZGxlJiYodGhpcy5fcmV3aW5kKCksdGhpcy5faWRsZT0hMSk6dGhpcy5fY3VycmVudFRpbWVQZW5kaW5nPSEwLHRoaXMuX3N0YXJ0VGltZT1udWxsLHRoaXMuX3BhdXNlZD0hMH0sZmluaXNoOmZ1bmN0aW9uKCl7dGhpcy5faWRsZXx8KHRoaXMuY3VycmVudFRpbWU9dGhpcy5fcGxheWJhY2tSYXRlPjA/dGhpcy5fdG90YWxEdXJhdGlvbjowLHRoaXMuX3N0YXJ0VGltZT10aGlzLl90b3RhbER1cmF0aW9uLXRoaXMuY3VycmVudFRpbWUsdGhpcy5fY3VycmVudFRpbWVQZW5kaW5nPSExLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKX0sY2FuY2VsOmZ1bmN0aW9uKCl7dGhpcy5faW5FZmZlY3QmJih0aGlzLl9pbkVmZmVjdD0hMSx0aGlzLl9pZGxlPSEwLHRoaXMuX3BhdXNlZD0hMSx0aGlzLl9pc0ZpbmlzaGVkPSEwLHRoaXMuX2ZpbmlzaGVkRmxhZz0hMCx0aGlzLl9jdXJyZW50VGltZT0wLHRoaXMuX3N0YXJ0VGltZT1udWxsLHRoaXMuX2VmZmVjdC5fdXBkYXRlKG51bGwpLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKX0scmV2ZXJzZTpmdW5jdGlvbigpe3RoaXMucGxheWJhY2tSYXRlKj0tMSx0aGlzLnBsYXkoKX0sYWRkRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGImJlwiZmluaXNoXCI9PWEmJnRoaXMuX2ZpbmlzaEhhbmRsZXJzLnB1c2goYil9LHJlbW92ZUV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24oYSxiKXtpZihcImZpbmlzaFwiPT1hKXt2YXIgYz10aGlzLl9maW5pc2hIYW5kbGVycy5pbmRleE9mKGIpO2M+PTAmJnRoaXMuX2ZpbmlzaEhhbmRsZXJzLnNwbGljZShjLDEpfX0sX2ZpcmVFdmVudHM6ZnVuY3Rpb24oYSl7aWYodGhpcy5faXNGaW5pc2hlZCl7aWYoIXRoaXMuX2ZpbmlzaGVkRmxhZyl7dmFyIGI9bmV3IGQodGhpcyx0aGlzLl9jdXJyZW50VGltZSxhKSxjPXRoaXMuX2ZpbmlzaEhhbmRsZXJzLmNvbmNhdCh0aGlzLm9uZmluaXNoP1t0aGlzLm9uZmluaXNoXTpbXSk7c2V0VGltZW91dChmdW5jdGlvbigpe2MuZm9yRWFjaChmdW5jdGlvbihhKXthLmNhbGwoYi50YXJnZXQsYil9KX0sMCksdGhpcy5fZmluaXNoZWRGbGFnPSEwfX1lbHNlIHRoaXMuX2ZpbmlzaGVkRmxhZz0hMX0sX3RpY2s6ZnVuY3Rpb24oYSxiKXt0aGlzLl9pZGxlfHx0aGlzLl9wYXVzZWR8fChudWxsPT10aGlzLl9zdGFydFRpbWU/YiYmKHRoaXMuc3RhcnRUaW1lPWEtdGhpcy5fY3VycmVudFRpbWUvdGhpcy5wbGF5YmFja1JhdGUpOnRoaXMuX2lzRmluaXNoZWR8fHRoaXMuX3RpY2tDdXJyZW50VGltZSgoYS10aGlzLl9zdGFydFRpbWUpKnRoaXMucGxheWJhY2tSYXRlKSksYiYmKHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMSx0aGlzLl9maXJlRXZlbnRzKGEpKX0sZ2V0IF9uZWVkc1RpY2soKXtyZXR1cm4gdGhpcy5wbGF5U3RhdGUgaW57cGVuZGluZzoxLHJ1bm5pbmc6MX18fCF0aGlzLl9maW5pc2hlZEZsYWd9LF90YXJnZXRBbmltYXRpb25zOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fZWZmZWN0Ll90YXJnZXQ7cmV0dXJuIGEuX2FjdGl2ZUFuaW1hdGlvbnN8fChhLl9hY3RpdmVBbmltYXRpb25zPVtdKSxhLl9hY3RpdmVBbmltYXRpb25zfSxfbWFya1RhcmdldDpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX3RhcmdldEFuaW1hdGlvbnMoKTstMT09PWEuaW5kZXhPZih0aGlzKSYmYS5wdXNoKHRoaXMpfSxfdW5tYXJrVGFyZ2V0OmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fdGFyZ2V0QW5pbWF0aW9ucygpLGI9YS5pbmRleE9mKHRoaXMpOy0xIT09YiYmYS5zcGxpY2UoYiwxKX19fShjLGQpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe3ZhciBiPWo7aj1bXSxhPHEuY3VycmVudFRpbWUmJihhPXEuY3VycmVudFRpbWUpLHEuX2FuaW1hdGlvbnMuc29ydChlKSxxLl9hbmltYXRpb25zPWgoYSwhMCxxLl9hbmltYXRpb25zKVswXSxiLmZvckVhY2goZnVuY3Rpb24oYil7YlsxXShhKX0pLGcoKSxsPXZvaWQgMH1mdW5jdGlvbiBlKGEsYil7cmV0dXJuIGEuX3NlcXVlbmNlTnVtYmVyLWIuX3NlcXVlbmNlTnVtYmVyfWZ1bmN0aW9uIGYoKXt0aGlzLl9hbmltYXRpb25zPVtdLHRoaXMuY3VycmVudFRpbWU9d2luZG93LnBlcmZvcm1hbmNlJiZwZXJmb3JtYW5jZS5ub3c/cGVyZm9ybWFuY2Uubm93KCk6MH1mdW5jdGlvbiBnKCl7by5mb3JFYWNoKGZ1bmN0aW9uKGEpe2EoKX0pLG8ubGVuZ3RoPTB9ZnVuY3Rpb24gaChhLGMsZCl7cD0hMCxuPSExLGIudGltZWxpbmUuY3VycmVudFRpbWU9YSxtPSExO3ZhciBlPVtdLGY9W10sZz1bXSxoPVtdO3JldHVybiBkLmZvckVhY2goZnVuY3Rpb24oYil7Yi5fdGljayhhLGMpLGIuX2luRWZmZWN0PyhmLnB1c2goYi5fZWZmZWN0KSxiLl9tYXJrVGFyZ2V0KCkpOihlLnB1c2goYi5fZWZmZWN0KSxiLl91bm1hcmtUYXJnZXQoKSksYi5fbmVlZHNUaWNrJiYobT0hMCk7dmFyIGQ9Yi5faW5FZmZlY3R8fGIuX25lZWRzVGljaztiLl9pblRpbWVsaW5lPWQsZD9nLnB1c2goYik6aC5wdXNoKGIpfSksby5wdXNoLmFwcGx5KG8sZSksby5wdXNoLmFwcGx5KG8sZiksbSYmcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7fSkscD0hMSxbZyxoXX12YXIgaT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLGo9W10saz0wO3dpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oYSl7dmFyIGI9aysrO3JldHVybiAwPT1qLmxlbmd0aCYmaShkKSxqLnB1c2goW2IsYV0pLGJ9LHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZT1mdW5jdGlvbihhKXtqLmZvckVhY2goZnVuY3Rpb24oYil7YlswXT09YSYmKGJbMV09ZnVuY3Rpb24oKXt9KX0pfSxmLnByb3RvdHlwZT17X3BsYXk6ZnVuY3Rpb24oYyl7Yy5fdGltaW5nPWEubm9ybWFsaXplVGltaW5nSW5wdXQoYy50aW1pbmcpO3ZhciBkPW5ldyBiLkFuaW1hdGlvbihjKTtyZXR1cm4gZC5faWRsZT0hMSxkLl90aW1lbGluZT10aGlzLHRoaXMuX2FuaW1hdGlvbnMucHVzaChkKSxiLnJlc3RhcnQoKSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbihkKSxkfX07dmFyIGw9dm9pZCAwLG09ITEsbj0hMTtiLnJlc3RhcnQ9ZnVuY3Rpb24oKXtyZXR1cm4gbXx8KG09ITAscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7fSksbj0hMCksbn0sYi5hcHBseURpcnRpZWRBbmltYXRpb249ZnVuY3Rpb24oYSl7aWYoIXApe2EuX21hcmtUYXJnZXQoKTt2YXIgYz1hLl90YXJnZXRBbmltYXRpb25zKCk7Yy5zb3J0KGUpLGgoYi50aW1lbGluZS5jdXJyZW50VGltZSwhMSxjLnNsaWNlKCkpWzFdLmZvckVhY2goZnVuY3Rpb24oYSl7dmFyIGI9cS5fYW5pbWF0aW9ucy5pbmRleE9mKGEpOy0xIT09YiYmcS5fYW5pbWF0aW9ucy5zcGxpY2UoYiwxKX0pLGcoKX19O3ZhciBvPVtdLHA9ITEscT1uZXcgZjtiLnRpbWVsaW5lPXF9KGMsZCksZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIpe3ZhciBjPWEuZXhlYyhiKTtpZihjKXJldHVybiBjPWEuaWdub3JlQ2FzZT9jWzBdLnRvTG93ZXJDYXNlKCk6Y1swXSxbYyxiLnN1YnN0cihjLmxlbmd0aCldfWZ1bmN0aW9uIGMoYSxiKXtiPWIucmVwbGFjZSgvXlxccyovLFwiXCIpO3ZhciBjPWEoYik7aWYoYylyZXR1cm5bY1swXSxjWzFdLnJlcGxhY2UoL15cXHMqLyxcIlwiKV19ZnVuY3Rpb24gZChhLGQsZSl7YT1jLmJpbmQobnVsbCxhKTtmb3IodmFyIGY9W107Oyl7dmFyIGc9YShlKTtpZighZylyZXR1cm5bZixlXTtpZihmLnB1c2goZ1swXSksZT1nWzFdLCEoZz1iKGQsZSkpfHxcIlwiPT1nWzFdKXJldHVybltmLGVdO2U9Z1sxXX19ZnVuY3Rpb24gZShhLGIpe2Zvcih2YXIgYz0wLGQ9MDtkPGIubGVuZ3RoJiYoIS9cXHN8LC8udGVzdChiW2RdKXx8MCE9Yyk7ZCsrKWlmKFwiKFwiPT1iW2RdKWMrKztlbHNlIGlmKFwiKVwiPT1iW2RdJiYoYy0tLDA9PWMmJmQrKyxjPD0wKSlicmVhazt2YXIgZT1hKGIuc3Vic3RyKDAsZCkpO3JldHVybiB2b2lkIDA9PWU/dm9pZCAwOltlLGIuc3Vic3RyKGQpXX1mdW5jdGlvbiBmKGEsYil7Zm9yKHZhciBjPWEsZD1iO2MmJmQ7KWM+ZD9jJT1kOmQlPWM7cmV0dXJuIGM9YSpiLyhjK2QpfWZ1bmN0aW9uIGcoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3ZhciBjPWEoYik7cmV0dXJuIGMmJihjWzBdPXZvaWQgMCksY319ZnVuY3Rpb24gaChhLGIpe3JldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gYShjKXx8W2IsY119fWZ1bmN0aW9uIGkoYixjKXtmb3IodmFyIGQ9W10sZT0wO2U8Yi5sZW5ndGg7ZSsrKXt2YXIgZj1hLmNvbnN1bWVUcmltbWVkKGJbZV0sYyk7aWYoIWZ8fFwiXCI9PWZbMF0pcmV0dXJuO3ZvaWQgMCE9PWZbMF0mJmQucHVzaChmWzBdKSxjPWZbMV19aWYoXCJcIj09YylyZXR1cm4gZH1mdW5jdGlvbiBqKGEsYixjLGQsZSl7Zm9yKHZhciBnPVtdLGg9W10saT1bXSxqPWYoZC5sZW5ndGgsZS5sZW5ndGgpLGs9MDtrPGo7aysrKXt2YXIgbD1iKGRbayVkLmxlbmd0aF0sZVtrJWUubGVuZ3RoXSk7aWYoIWwpcmV0dXJuO2cucHVzaChsWzBdKSxoLnB1c2gobFsxXSksaS5wdXNoKGxbMl0pfXJldHVybltnLGgsZnVuY3Rpb24oYil7dmFyIGQ9Yi5tYXAoZnVuY3Rpb24oYSxiKXtyZXR1cm4gaVtiXShhKX0pLmpvaW4oYyk7cmV0dXJuIGE/YShkKTpkfV19ZnVuY3Rpb24gayhhLGIsYyl7Zm9yKHZhciBkPVtdLGU9W10sZj1bXSxnPTAsaD0wO2g8Yy5sZW5ndGg7aCsrKWlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGNbaF0pe3ZhciBpPWNbaF0oYVtnXSxiW2crK10pO2QucHVzaChpWzBdKSxlLnB1c2goaVsxXSksZi5wdXNoKGlbMl0pfWVsc2UhZnVuY3Rpb24oYSl7ZC5wdXNoKCExKSxlLnB1c2goITEpLGYucHVzaChmdW5jdGlvbigpe3JldHVybiBjW2FdfSl9KGgpO3JldHVybltkLGUsZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVwiXCIsYz0wO2M8YS5sZW5ndGg7YysrKWIrPWZbY10oYVtjXSk7cmV0dXJuIGJ9XX1hLmNvbnN1bWVUb2tlbj1iLGEuY29uc3VtZVRyaW1tZWQ9YyxhLmNvbnN1bWVSZXBlYXRlZD1kLGEuY29uc3VtZVBhcmVudGhlc2lzZWQ9ZSxhLmlnbm9yZT1nLGEub3B0aW9uYWw9aCxhLmNvbnN1bWVMaXN0PWksYS5tZXJnZU5lc3RlZFJlcGVhdGVkPWouYmluZChudWxsLG51bGwpLGEubWVyZ2VXcmFwcGVkTmVzdGVkUmVwZWF0ZWQ9aixhLm1lcmdlTGlzdD1rfShkKSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIpe2Z1bmN0aW9uIGMoYil7dmFyIGM9YS5jb25zdW1lVG9rZW4oL15pbnNldC9pLGIpO2lmKGMpcmV0dXJuIGQuaW5zZXQ9ITAsYzt2YXIgYz1hLmNvbnN1bWVMZW5ndGhPclBlcmNlbnQoYik7aWYoYylyZXR1cm4gZC5sZW5ndGhzLnB1c2goY1swXSksYzt2YXIgYz1hLmNvbnN1bWVDb2xvcihiKTtyZXR1cm4gYz8oZC5jb2xvcj1jWzBdLGMpOnZvaWQgMH12YXIgZD17aW5zZXQ6ITEsbGVuZ3RoczpbXSxjb2xvcjpudWxsfSxlPWEuY29uc3VtZVJlcGVhdGVkKGMsL14vLGIpO2lmKGUmJmVbMF0ubGVuZ3RoKXJldHVybltkLGVbMV1dfWZ1bmN0aW9uIGMoYyl7dmFyIGQ9YS5jb25zdW1lUmVwZWF0ZWQoYiwvXiwvLGMpO2lmKGQmJlwiXCI9PWRbMV0pcmV0dXJuIGRbMF19ZnVuY3Rpb24gZChiLGMpe2Zvcig7Yi5sZW5ndGhzLmxlbmd0aDxNYXRoLm1heChiLmxlbmd0aHMubGVuZ3RoLGMubGVuZ3Rocy5sZW5ndGgpOyliLmxlbmd0aHMucHVzaCh7cHg6MH0pO2Zvcig7Yy5sZW5ndGhzLmxlbmd0aDxNYXRoLm1heChiLmxlbmd0aHMubGVuZ3RoLGMubGVuZ3Rocy5sZW5ndGgpOyljLmxlbmd0aHMucHVzaCh7cHg6MH0pO2lmKGIuaW5zZXQ9PWMuaW5zZXQmJiEhYi5jb2xvcj09ISFjLmNvbG9yKXtmb3IodmFyIGQsZT1bXSxmPVtbXSwwXSxnPVtbXSwwXSxoPTA7aDxiLmxlbmd0aHMubGVuZ3RoO2grKyl7dmFyIGk9YS5tZXJnZURpbWVuc2lvbnMoYi5sZW5ndGhzW2hdLGMubGVuZ3Roc1toXSwyPT1oKTtmWzBdLnB1c2goaVswXSksZ1swXS5wdXNoKGlbMV0pLGUucHVzaChpWzJdKX1pZihiLmNvbG9yJiZjLmNvbG9yKXt2YXIgaj1hLm1lcmdlQ29sb3JzKGIuY29sb3IsYy5jb2xvcik7ZlsxXT1qWzBdLGdbMV09alsxXSxkPWpbMl19cmV0dXJuW2YsZyxmdW5jdGlvbihhKXtmb3IodmFyIGM9Yi5pbnNldD9cImluc2V0IFwiOlwiIFwiLGY9MDtmPGUubGVuZ3RoO2YrKyljKz1lW2ZdKGFbMF1bZl0pK1wiIFwiO3JldHVybiBkJiYoYys9ZChhWzFdKSksY31dfX1mdW5jdGlvbiBlKGIsYyxkLGUpe2Z1bmN0aW9uIGYoYSl7cmV0dXJue2luc2V0OmEsY29sb3I6WzAsMCwwLDBdLGxlbmd0aHM6W3tweDowfSx7cHg6MH0se3B4OjB9LHtweDowfV19fWZvcih2YXIgZz1bXSxoPVtdLGk9MDtpPGQubGVuZ3RofHxpPGUubGVuZ3RoO2krKyl7dmFyIGo9ZFtpXXx8ZihlW2ldLmluc2V0KSxrPWVbaV18fGYoZFtpXS5pbnNldCk7Zy5wdXNoKGopLGgucHVzaChrKX1yZXR1cm4gYS5tZXJnZU5lc3RlZFJlcGVhdGVkKGIsYyxnLGgpfXZhciBmPWUuYmluZChudWxsLGQsXCIsIFwiKTthLmFkZFByb3BlcnRpZXNIYW5kbGVyKGMsZixbXCJib3gtc2hhZG93XCIsXCJ0ZXh0LXNoYWRvd1wiXSl9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gYS50b0ZpeGVkKDMpLnJlcGxhY2UoLzArJC8sXCJcIikucmVwbGFjZSgvXFwuJC8sXCJcIil9ZnVuY3Rpb24gZChhLGIsYyl7cmV0dXJuIE1hdGgubWluKGIsTWF0aC5tYXgoYSxjKSl9ZnVuY3Rpb24gZShhKXtpZigvXlxccypbLStdPyhcXGQqXFwuKT9cXGQrXFxzKiQvLnRlc3QoYSkpcmV0dXJuIE51bWJlcihhKX1mdW5jdGlvbiBmKGEsYil7cmV0dXJuW2EsYixjXX1mdW5jdGlvbiBnKGEsYil7aWYoMCE9YSlyZXR1cm4gaSgwLDEvMCkoYSxiKX1mdW5jdGlvbiBoKGEsYil7cmV0dXJuW2EsYixmdW5jdGlvbihhKXtyZXR1cm4gTWF0aC5yb3VuZChkKDEsMS8wLGEpKX1dfWZ1bmN0aW9uIGkoYSxiKXtyZXR1cm4gZnVuY3Rpb24oZSxmKXtyZXR1cm5bZSxmLGZ1bmN0aW9uKGUpe3JldHVybiBjKGQoYSxiLGUpKX1dfX1mdW5jdGlvbiBqKGEpe3ZhciBiPWEudHJpbSgpLnNwbGl0KC9cXHMqW1xccyxdXFxzKi8pO2lmKDAhPT1iLmxlbmd0aCl7Zm9yKHZhciBjPVtdLGQ9MDtkPGIubGVuZ3RoO2QrKyl7dmFyIGY9ZShiW2RdKTtpZih2b2lkIDA9PT1mKXJldHVybjtjLnB1c2goZil9cmV0dXJuIGN9fWZ1bmN0aW9uIGsoYSxiKXtpZihhLmxlbmd0aD09Yi5sZW5ndGgpcmV0dXJuW2EsYixmdW5jdGlvbihhKXtyZXR1cm4gYS5tYXAoYykuam9pbihcIiBcIil9XX1mdW5jdGlvbiBsKGEsYil7cmV0dXJuW2EsYixNYXRoLnJvdW5kXX1hLmNsYW1wPWQsYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihqLGssW1wic3Ryb2tlLWRhc2hhcnJheVwiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihlLGkoMCwxLzApLFtcImJvcmRlci1pbWFnZS13aWR0aFwiLFwibGluZS1oZWlnaHRcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxpKDAsMSksW1wib3BhY2l0eVwiLFwic2hhcGUtaW1hZ2UtdGhyZXNob2xkXCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsZyxbXCJmbGV4LWdyb3dcIixcImZsZXgtc2hyaW5rXCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsaCxbXCJvcnBoYW5zXCIsXCJ3aWRvd3NcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxsLFtcInotaW5kZXhcIl0pLGEucGFyc2VOdW1iZXI9ZSxhLnBhcnNlTnVtYmVyTGlzdD1qLGEubWVyZ2VOdW1iZXJzPWYsYS5udW1iZXJUb1N0cmluZz1jfShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXtpZihcInZpc2libGVcIj09YXx8XCJ2aXNpYmxlXCI9PWIpcmV0dXJuWzAsMSxmdW5jdGlvbihjKXtyZXR1cm4gYzw9MD9hOmM+PTE/YjpcInZpc2libGVcIn1dfWEuYWRkUHJvcGVydGllc0hhbmRsZXIoU3RyaW5nLGMsW1widmlzaWJpbGl0eVwiXSl9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXthPWEudHJpbSgpLGYuZmlsbFN0eWxlPVwiIzAwMFwiLGYuZmlsbFN0eWxlPWE7dmFyIGI9Zi5maWxsU3R5bGU7aWYoZi5maWxsU3R5bGU9XCIjZmZmXCIsZi5maWxsU3R5bGU9YSxiPT1mLmZpbGxTdHlsZSl7Zi5maWxsUmVjdCgwLDAsMSwxKTt2YXIgYz1mLmdldEltYWdlRGF0YSgwLDAsMSwxKS5kYXRhO2YuY2xlYXJSZWN0KDAsMCwxLDEpO3ZhciBkPWNbM10vMjU1O3JldHVybltjWzBdKmQsY1sxXSpkLGNbMl0qZCxkXX19ZnVuY3Rpb24gZChiLGMpe3JldHVybltiLGMsZnVuY3Rpb24oYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gTWF0aC5tYXgoMCxNYXRoLm1pbigyNTUsYSkpfWlmKGJbM10pZm9yKHZhciBkPTA7ZDwzO2QrKyliW2RdPU1hdGgucm91bmQoYyhiW2RdL2JbM10pKTtyZXR1cm4gYlszXT1hLm51bWJlclRvU3RyaW5nKGEuY2xhbXAoMCwxLGJbM10pKSxcInJnYmEoXCIrYi5qb2luKFwiLFwiKStcIilcIn1dfXZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImNhbnZhc1wiKTtlLndpZHRoPWUuaGVpZ2h0PTE7dmFyIGY9ZS5nZXRDb250ZXh0KFwiMmRcIik7YS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihjLGQsW1wiYmFja2dyb3VuZC1jb2xvclwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIixcImJvcmRlci1yaWdodC1jb2xvclwiLFwiYm9yZGVyLXRvcC1jb2xvclwiLFwiY29sb3JcIixcImZpbGxcIixcImZsb29kLWNvbG9yXCIsXCJsaWdodGluZy1jb2xvclwiLFwib3V0bGluZS1jb2xvclwiLFwic3RvcC1jb2xvclwiLFwic3Ryb2tlXCIsXCJ0ZXh0LWRlY29yYXRpb24tY29sb3JcIl0pLGEuY29uc3VtZUNvbG9yPWEuY29uc3VtZVBhcmVudGhlc2lzZWQuYmluZChudWxsLGMpLGEubWVyZ2VDb2xvcnM9ZH0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe2Z1bmN0aW9uIGIoKXt2YXIgYj1oLmV4ZWMoYSk7Zz1iP2JbMF06dm9pZCAwfWZ1bmN0aW9uIGMoKXt2YXIgYT1OdW1iZXIoZyk7cmV0dXJuIGIoKSxhfWZ1bmN0aW9uIGQoKXtpZihcIihcIiE9PWcpcmV0dXJuIGMoKTtiKCk7dmFyIGE9ZigpO3JldHVyblwiKVwiIT09Zz9OYU46KGIoKSxhKX1mdW5jdGlvbiBlKCl7Zm9yKHZhciBhPWQoKTtcIipcIj09PWd8fFwiL1wiPT09Zzspe3ZhciBjPWc7YigpO3ZhciBlPWQoKTtcIipcIj09PWM/YSo9ZTphLz1lfXJldHVybiBhfWZ1bmN0aW9uIGYoKXtmb3IodmFyIGE9ZSgpO1wiK1wiPT09Z3x8XCItXCI9PT1nOyl7dmFyIGM9ZztiKCk7dmFyIGQ9ZSgpO1wiK1wiPT09Yz9hKz1kOmEtPWR9cmV0dXJuIGF9dmFyIGcsaD0vKFtcXCtcXC1cXHdcXC5dK3xbXFwoXFwpXFwqXFwvXSkvZztyZXR1cm4gYigpLGYoKX1mdW5jdGlvbiBkKGEsYil7aWYoXCIwXCI9PShiPWIudHJpbSgpLnRvTG93ZXJDYXNlKCkpJiZcInB4XCIuc2VhcmNoKGEpPj0wKXJldHVybntweDowfTtpZigvXlteKF0qJHxeY2FsYy8udGVzdChiKSl7Yj1iLnJlcGxhY2UoL2NhbGNcXCgvZyxcIihcIik7dmFyIGQ9e307Yj1iLnJlcGxhY2UoYSxmdW5jdGlvbihhKXtyZXR1cm4gZFthXT1udWxsLFwiVVwiK2F9KTtmb3IodmFyIGU9XCJVKFwiK2Euc291cmNlK1wiKVwiLGY9Yi5yZXBsYWNlKC9bLStdPyhcXGQqXFwuKT9cXGQrKFtFZV1bLStdP1xcZCspPy9nLFwiTlwiKS5yZXBsYWNlKG5ldyBSZWdFeHAoXCJOXCIrZSxcImdcIiksXCJEXCIpLnJlcGxhY2UoL1xcc1srLV1cXHMvZyxcIk9cIikucmVwbGFjZSgvXFxzL2csXCJcIiksZz1bL05cXCooRCkvZywvKE58RClbKlxcL11OL2csLyhOfEQpT1xcMS9nLC9cXCgoTnxEKVxcKS9nXSxoPTA7aDxnLmxlbmd0aDspZ1toXS50ZXN0KGYpPyhmPWYucmVwbGFjZShnW2hdLFwiJDFcIiksaD0wKTpoKys7aWYoXCJEXCI9PWYpe2Zvcih2YXIgaSBpbiBkKXt2YXIgaj1jKGIucmVwbGFjZShuZXcgUmVnRXhwKFwiVVwiK2ksXCJnXCIpLFwiXCIpLnJlcGxhY2UobmV3IFJlZ0V4cChlLFwiZ1wiKSxcIiowXCIpKTtpZighaXNGaW5pdGUoaikpcmV0dXJuO2RbaV09an1yZXR1cm4gZH19fWZ1bmN0aW9uIGUoYSxiKXtyZXR1cm4gZihhLGIsITApfWZ1bmN0aW9uIGYoYixjLGQpe3ZhciBlLGY9W107Zm9yKGUgaW4gYilmLnB1c2goZSk7Zm9yKGUgaW4gYylmLmluZGV4T2YoZSk8MCYmZi5wdXNoKGUpO3JldHVybiBiPWYubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBiW2FdfHwwfSksYz1mLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gY1thXXx8MH0pLFtiLGMsZnVuY3Rpb24oYil7dmFyIGM9Yi5tYXAoZnVuY3Rpb24oYyxlKXtyZXR1cm4gMT09Yi5sZW5ndGgmJmQmJihjPU1hdGgubWF4KGMsMCkpLGEubnVtYmVyVG9TdHJpbmcoYykrZltlXX0pLmpvaW4oXCIgKyBcIik7cmV0dXJuIGIubGVuZ3RoPjE/XCJjYWxjKFwiK2MrXCIpXCI6Y31dfXZhciBnPVwicHh8ZW18ZXh8Y2h8cmVtfHZ3fHZofHZtaW58dm1heHxjbXxtbXxpbnxwdHxwY1wiLGg9ZC5iaW5kKG51bGwsbmV3IFJlZ0V4cChnLFwiZ1wiKSksaT1kLmJpbmQobnVsbCxuZXcgUmVnRXhwKGcrXCJ8JVwiLFwiZ1wiKSksaj1kLmJpbmQobnVsbCwvZGVnfHJhZHxncmFkfHR1cm4vZyk7YS5wYXJzZUxlbmd0aD1oLGEucGFyc2VMZW5ndGhPclBlcmNlbnQ9aSxhLmNvbnN1bWVMZW5ndGhPclBlcmNlbnQ9YS5jb25zdW1lUGFyZW50aGVzaXNlZC5iaW5kKG51bGwsaSksYS5wYXJzZUFuZ2xlPWosYS5tZXJnZURpbWVuc2lvbnM9Zjt2YXIgaz1hLmNvbnN1bWVQYXJlbnRoZXNpc2VkLmJpbmQobnVsbCxoKSxsPWEuY29uc3VtZVJlcGVhdGVkLmJpbmQodm9pZCAwLGssL14vKSxtPWEuY29uc3VtZVJlcGVhdGVkLmJpbmQodm9pZCAwLGwsL14sLyk7YS5jb25zdW1lU2l6ZVBhaXJMaXN0PW07dmFyIG49ZnVuY3Rpb24oYSl7dmFyIGI9bShhKTtpZihiJiZcIlwiPT1iWzFdKXJldHVybiBiWzBdfSxvPWEubWVyZ2VOZXN0ZWRSZXBlYXRlZC5iaW5kKHZvaWQgMCxlLFwiIFwiKSxwPWEubWVyZ2VOZXN0ZWRSZXBlYXRlZC5iaW5kKHZvaWQgMCxvLFwiLFwiKTthLm1lcmdlTm9uTmVnYXRpdmVTaXplUGFpcj1vLGEuYWRkUHJvcGVydGllc0hhbmRsZXIobixwLFtcImJhY2tncm91bmQtc2l6ZVwiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihpLGUsW1wiYm9yZGVyLWJvdHRvbS13aWR0aFwiLFwiYm9yZGVyLWltYWdlLXdpZHRoXCIsXCJib3JkZXItbGVmdC13aWR0aFwiLFwiYm9yZGVyLXJpZ2h0LXdpZHRoXCIsXCJib3JkZXItdG9wLXdpZHRoXCIsXCJmbGV4LWJhc2lzXCIsXCJmb250LXNpemVcIixcImhlaWdodFwiLFwibGluZS1oZWlnaHRcIixcIm1heC1oZWlnaHRcIixcIm1heC13aWR0aFwiLFwib3V0bGluZS13aWR0aFwiLFwid2lkdGhcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoaSxmLFtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIixcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCIsXCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCIsXCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiLFwiYm90dG9tXCIsXCJsZWZ0XCIsXCJsZXR0ZXItc3BhY2luZ1wiLFwibWFyZ2luLWJvdHRvbVwiLFwibWFyZ2luLWxlZnRcIixcIm1hcmdpbi1yaWdodFwiLFwibWFyZ2luLXRvcFwiLFwibWluLWhlaWdodFwiLFwibWluLXdpZHRoXCIsXCJvdXRsaW5lLW9mZnNldFwiLFwicGFkZGluZy1ib3R0b21cIixcInBhZGRpbmctbGVmdFwiLFwicGFkZGluZy1yaWdodFwiLFwicGFkZGluZy10b3BcIixcInBlcnNwZWN0aXZlXCIsXCJyaWdodFwiLFwic2hhcGUtbWFyZ2luXCIsXCJzdHJva2UtZGFzaG9mZnNldFwiLFwidGV4dC1pbmRlbnRcIixcInRvcFwiLFwidmVydGljYWwtYWxpZ25cIixcIndvcmQtc3BhY2luZ1wiXSl9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhiKXtyZXR1cm4gYS5jb25zdW1lTGVuZ3RoT3JQZXJjZW50KGIpfHxhLmNvbnN1bWVUb2tlbigvXmF1dG8vLGIpfWZ1bmN0aW9uIGQoYil7dmFyIGQ9YS5jb25zdW1lTGlzdChbYS5pZ25vcmUoYS5jb25zdW1lVG9rZW4uYmluZChudWxsLC9ecmVjdC8pKSxhLmlnbm9yZShhLmNvbnN1bWVUb2tlbi5iaW5kKG51bGwsL15cXCgvKSksYS5jb25zdW1lUmVwZWF0ZWQuYmluZChudWxsLGMsL14sLyksYS5pZ25vcmUoYS5jb25zdW1lVG9rZW4uYmluZChudWxsLC9eXFwpLykpXSxiKTtpZihkJiY0PT1kWzBdLmxlbmd0aClyZXR1cm4gZFswXX1mdW5jdGlvbiBlKGIsYyl7cmV0dXJuXCJhdXRvXCI9PWJ8fFwiYXV0b1wiPT1jP1shMCwhMSxmdW5jdGlvbihkKXt2YXIgZT1kP2I6YztpZihcImF1dG9cIj09ZSlyZXR1cm5cImF1dG9cIjt2YXIgZj1hLm1lcmdlRGltZW5zaW9ucyhlLGUpO3JldHVybiBmWzJdKGZbMF0pfV06YS5tZXJnZURpbWVuc2lvbnMoYixjKX1mdW5jdGlvbiBmKGEpe3JldHVyblwicmVjdChcIithK1wiKVwifXZhciBnPWEubWVyZ2VXcmFwcGVkTmVzdGVkUmVwZWF0ZWQuYmluZChudWxsLGYsZSxcIiwgXCIpO2EucGFyc2VCb3g9ZCxhLm1lcmdlQm94ZXM9ZyxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGQsZyxbXCJjbGlwXCJdKX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBmdW5jdGlvbihiKXt2YXIgYz0wO3JldHVybiBhLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gYT09PWs/YltjKytdOmF9KX19ZnVuY3Rpb24gZChhKXtyZXR1cm4gYX1mdW5jdGlvbiBlKGIpe2lmKFwibm9uZVwiPT0oYj1iLnRvTG93ZXJDYXNlKCkudHJpbSgpKSlyZXR1cm5bXTtmb3IodmFyIGMsZD0vXFxzKihcXHcrKVxcKChbXildKilcXCkvZyxlPVtdLGY9MDtjPWQuZXhlYyhiKTspe2lmKGMuaW5kZXghPWYpcmV0dXJuO2Y9Yy5pbmRleCtjWzBdLmxlbmd0aDt2YXIgZz1jWzFdLGg9bltnXTtpZighaClyZXR1cm47dmFyIGk9Y1syXS5zcGxpdChcIixcIiksaj1oWzBdO2lmKGoubGVuZ3RoPGkubGVuZ3RoKXJldHVybjtmb3IodmFyIGs9W10sbz0wO288ai5sZW5ndGg7bysrKXt2YXIgcCxxPWlbb10scj1qW29dO2lmKHZvaWQgMD09PShwPXE/e0E6ZnVuY3Rpb24oYil7cmV0dXJuXCIwXCI9PWIudHJpbSgpP206YS5wYXJzZUFuZ2xlKGIpfSxOOmEucGFyc2VOdW1iZXIsVDphLnBhcnNlTGVuZ3RoT3JQZXJjZW50LEw6YS5wYXJzZUxlbmd0aH1bci50b1VwcGVyQ2FzZSgpXShxKTp7YTptLG46a1swXSx0Omx9W3JdKSlyZXR1cm47ay5wdXNoKHApfWlmKGUucHVzaCh7dDpnLGQ6a30pLGQubGFzdEluZGV4PT1iLmxlbmd0aClyZXR1cm4gZX19ZnVuY3Rpb24gZihhKXtyZXR1cm4gYS50b0ZpeGVkKDYpLnJlcGxhY2UoXCIuMDAwMDAwXCIsXCJcIil9ZnVuY3Rpb24gZyhiLGMpe2lmKGIuZGVjb21wb3NpdGlvblBhaXIhPT1jKXtiLmRlY29tcG9zaXRpb25QYWlyPWM7dmFyIGQ9YS5tYWtlTWF0cml4RGVjb21wb3NpdGlvbihiKX1pZihjLmRlY29tcG9zaXRpb25QYWlyIT09Yil7Yy5kZWNvbXBvc2l0aW9uUGFpcj1iO3ZhciBlPWEubWFrZU1hdHJpeERlY29tcG9zaXRpb24oYyl9cmV0dXJuIG51bGw9PWRbMF18fG51bGw9PWVbMF0/W1shMV0sWyEwXSxmdW5jdGlvbihhKXtyZXR1cm4gYT9jWzBdLmQ6YlswXS5kfV06KGRbMF0ucHVzaCgwKSxlWzBdLnB1c2goMSksW2QsZSxmdW5jdGlvbihiKXt2YXIgYz1hLnF1YXQoZFswXVszXSxlWzBdWzNdLGJbNV0pO3JldHVybiBhLmNvbXBvc2VNYXRyaXgoYlswXSxiWzFdLGJbMl0sYyxiWzRdKS5tYXAoZikuam9pbihcIixcIil9XSl9ZnVuY3Rpb24gaChhKXtyZXR1cm4gYS5yZXBsYWNlKC9beHldLyxcIlwiKX1mdW5jdGlvbiBpKGEpe3JldHVybiBhLnJlcGxhY2UoLyh4fHl8enwzZCk/JC8sXCIzZFwiKX1mdW5jdGlvbiBqKGIsYyl7dmFyIGQ9YS5tYWtlTWF0cml4RGVjb21wb3NpdGlvbiYmITAsZT0hMTtpZighYi5sZW5ndGh8fCFjLmxlbmd0aCl7Yi5sZW5ndGh8fChlPSEwLGI9YyxjPVtdKTtmb3IodmFyIGY9MDtmPGIubGVuZ3RoO2YrKyl7dmFyIGo9YltmXS50LGs9YltmXS5kLGw9XCJzY2FsZVwiPT1qLnN1YnN0cigwLDUpPzE6MDtjLnB1c2goe3Q6aixkOmsubWFwKGZ1bmN0aW9uKGEpe2lmKFwibnVtYmVyXCI9PXR5cGVvZiBhKXJldHVybiBsO3ZhciBiPXt9O2Zvcih2YXIgYyBpbiBhKWJbY109bDtyZXR1cm4gYn0pfSl9fXZhciBtPWZ1bmN0aW9uKGEsYil7cmV0dXJuXCJwZXJzcGVjdGl2ZVwiPT1hJiZcInBlcnNwZWN0aXZlXCI9PWJ8fChcIm1hdHJpeFwiPT1hfHxcIm1hdHJpeDNkXCI9PWEpJiYoXCJtYXRyaXhcIj09Ynx8XCJtYXRyaXgzZFwiPT1iKX0sbz1bXSxwPVtdLHE9W107aWYoYi5sZW5ndGghPWMubGVuZ3RoKXtpZighZClyZXR1cm47dmFyIHI9ZyhiLGMpO289W3JbMF1dLHA9W3JbMV1dLHE9W1tcIm1hdHJpeFwiLFtyWzJdXV1dfWVsc2UgZm9yKHZhciBmPTA7ZjxiLmxlbmd0aDtmKyspe3ZhciBqLHM9YltmXS50LHQ9Y1tmXS50LHU9YltmXS5kLHY9Y1tmXS5kLHc9bltzXSx4PW5bdF07aWYobShzLHQpKXtpZighZClyZXR1cm47dmFyIHI9ZyhbYltmXV0sW2NbZl1dKTtvLnB1c2goclswXSkscC5wdXNoKHJbMV0pLHEucHVzaChbXCJtYXRyaXhcIixbclsyXV1dKX1lbHNle2lmKHM9PXQpaj1zO2Vsc2UgaWYod1syXSYmeFsyXSYmaChzKT09aCh0KSlqPWgocyksdT13WzJdKHUpLHY9eFsyXSh2KTtlbHNle2lmKCF3WzFdfHwheFsxXXx8aShzKSE9aSh0KSl7aWYoIWQpcmV0dXJuO3ZhciByPWcoYixjKTtvPVtyWzBdXSxwPVtyWzFdXSxxPVtbXCJtYXRyaXhcIixbclsyXV1dXTticmVha31qPWkocyksdT13WzFdKHUpLHY9eFsxXSh2KX1mb3IodmFyIHk9W10sej1bXSxBPVtdLEI9MDtCPHUubGVuZ3RoO0IrKyl7dmFyIEM9XCJudW1iZXJcIj09dHlwZW9mIHVbQl0/YS5tZXJnZU51bWJlcnM6YS5tZXJnZURpbWVuc2lvbnMscj1DKHVbQl0sdltCXSk7eVtCXT1yWzBdLHpbQl09clsxXSxBLnB1c2goclsyXSl9by5wdXNoKHkpLHAucHVzaCh6KSxxLnB1c2goW2osQV0pfX1pZihlKXt2YXIgRD1vO289cCxwPUR9cmV0dXJuW28scCxmdW5jdGlvbihhKXtyZXR1cm4gYS5tYXAoZnVuY3Rpb24oYSxiKXt2YXIgYz1hLm1hcChmdW5jdGlvbihhLGMpe3JldHVybiBxW2JdWzFdW2NdKGEpfSkuam9pbihcIixcIik7cmV0dXJuXCJtYXRyaXhcIj09cVtiXVswXSYmMTY9PWMuc3BsaXQoXCIsXCIpLmxlbmd0aCYmKHFbYl1bMF09XCJtYXRyaXgzZFwiKSxxW2JdWzBdK1wiKFwiK2MrXCIpXCJ9KS5qb2luKFwiIFwiKX1dfXZhciBrPW51bGwsbD17cHg6MH0sbT17ZGVnOjB9LG49e21hdHJpeDpbXCJOTk5OTk5cIixbayxrLDAsMCxrLGssMCwwLDAsMCwxLDAsayxrLDAsMV0sZF0sbWF0cml4M2Q6W1wiTk5OTk5OTk5OTk5OTk5OTlwiLGRdLHJvdGF0ZTpbXCJBXCJdLHJvdGF0ZXg6W1wiQVwiXSxyb3RhdGV5OltcIkFcIl0scm90YXRlejpbXCJBXCJdLHJvdGF0ZTNkOltcIk5OTkFcIl0scGVyc3BlY3RpdmU6W1wiTFwiXSxzY2FsZTpbXCJOblwiLGMoW2ssaywxXSksZF0sc2NhbGV4OltcIk5cIixjKFtrLDEsMV0pLGMoW2ssMV0pXSxzY2FsZXk6W1wiTlwiLGMoWzEsaywxXSksYyhbMSxrXSldLHNjYWxlejpbXCJOXCIsYyhbMSwxLGtdKV0sc2NhbGUzZDpbXCJOTk5cIixkXSxza2V3OltcIkFhXCIsbnVsbCxkXSxza2V3eDpbXCJBXCIsbnVsbCxjKFtrLG1dKV0sc2tld3k6W1wiQVwiLG51bGwsYyhbbSxrXSldLHRyYW5zbGF0ZTpbXCJUdFwiLGMoW2ssayxsXSksZF0sdHJhbnNsYXRleDpbXCJUXCIsYyhbayxsLGxdKSxjKFtrLGxdKV0sdHJhbnNsYXRleTpbXCJUXCIsYyhbbCxrLGxdKSxjKFtsLGtdKV0sdHJhbnNsYXRlejpbXCJMXCIsYyhbbCxsLGtdKV0sdHJhbnNsYXRlM2Q6W1wiVFRMXCIsZF19O2EuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxqLFtcInRyYW5zZm9ybVwiXSksYS50cmFuc2Zvcm1Ub1N2Z01hdHJpeD1mdW5jdGlvbihiKXt2YXIgYz1hLnRyYW5zZm9ybUxpc3RUb01hdHJpeChlKGIpKTtyZXR1cm5cIm1hdHJpeChcIitmKGNbMF0pK1wiIFwiK2YoY1sxXSkrXCIgXCIrZihjWzRdKStcIiBcIitmKGNbNV0pK1wiIFwiK2YoY1sxMl0pK1wiIFwiK2YoY1sxM10pK1wiKVwifX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7Yi5jb25jYXQoW2FdKS5mb3JFYWNoKGZ1bmN0aW9uKGIpe2IgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlJiYoZFthXT1iKSxlW2JdPWF9KX12YXIgZD17fSxlPXt9O2MoXCJ0cmFuc2Zvcm1cIixbXCJ3ZWJraXRUcmFuc2Zvcm1cIixcIm1zVHJhbnNmb3JtXCJdKSxjKFwidHJhbnNmb3JtT3JpZ2luXCIsW1wid2Via2l0VHJhbnNmb3JtT3JpZ2luXCJdKSxjKFwicGVyc3BlY3RpdmVcIixbXCJ3ZWJraXRQZXJzcGVjdGl2ZVwiXSksYyhcInBlcnNwZWN0aXZlT3JpZ2luXCIsW1wid2Via2l0UGVyc3BlY3RpdmVPcmlnaW5cIl0pLGEucHJvcGVydHlOYW1lPWZ1bmN0aW9uKGEpe3JldHVybiBkW2FdfHxhfSxhLnVucHJlZml4ZWRQcm9wZXJ0eU5hbWU9ZnVuY3Rpb24oYSl7cmV0dXJuIGVbYV18fGF9fShkKX0oKSxmdW5jdGlvbigpe2lmKHZvaWQgMD09PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikuYW5pbWF0ZShbXSkub25jYW5jZWwpe3ZhciBhO2lmKHdpbmRvdy5wZXJmb3JtYW5jZSYmcGVyZm9ybWFuY2Uubm93KXZhciBhPWZ1bmN0aW9uKCl7cmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpfTtlbHNlIHZhciBhPWZ1bmN0aW9uKCl7cmV0dXJuIERhdGUubm93KCl9O3ZhciBiPWZ1bmN0aW9uKGEsYixjKXt0aGlzLnRhcmdldD1hLHRoaXMuY3VycmVudFRpbWU9Yix0aGlzLnRpbWVsaW5lVGltZT1jLHRoaXMudHlwZT1cImNhbmNlbFwiLHRoaXMuYnViYmxlcz0hMSx0aGlzLmNhbmNlbGFibGU9ITEsdGhpcy5jdXJyZW50VGFyZ2V0PWEsdGhpcy5kZWZhdWx0UHJldmVudGVkPSExLHRoaXMuZXZlbnRQaGFzZT1FdmVudC5BVF9UQVJHRVQsdGhpcy50aW1lU3RhbXA9RGF0ZS5ub3coKX0sYz13aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZTt3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZT1mdW5jdGlvbihkLGUpe3ZhciBmPWMuY2FsbCh0aGlzLGQsZSk7Zi5fY2FuY2VsSGFuZGxlcnM9W10sZi5vbmNhbmNlbD1udWxsO3ZhciBnPWYuY2FuY2VsO2YuY2FuY2VsPWZ1bmN0aW9uKCl7Zy5jYWxsKHRoaXMpO3ZhciBjPW5ldyBiKHRoaXMsbnVsbCxhKCkpLGQ9dGhpcy5fY2FuY2VsSGFuZGxlcnMuY29uY2F0KHRoaXMub25jYW5jZWw/W3RoaXMub25jYW5jZWxdOltdKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZC5mb3JFYWNoKGZ1bmN0aW9uKGEpe2EuY2FsbChjLnRhcmdldCxjKX0pfSwwKX07dmFyIGg9Zi5hZGRFdmVudExpc3RlbmVyO2YuYWRkRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGImJlwiY2FuY2VsXCI9PWE/dGhpcy5fY2FuY2VsSGFuZGxlcnMucHVzaChiKTpoLmNhbGwodGhpcyxhLGIpfTt2YXIgaT1mLnJlbW92ZUV2ZW50TGlzdGVuZXI7cmV0dXJuIGYucmVtb3ZlRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihhLGIpe2lmKFwiY2FuY2VsXCI9PWEpe3ZhciBjPXRoaXMuX2NhbmNlbEhhbmRsZXJzLmluZGV4T2YoYik7Yz49MCYmdGhpcy5fY2FuY2VsSGFuZGxlcnMuc3BsaWNlKGMsMSl9ZWxzZSBpLmNhbGwodGhpcyxhLGIpfSxmfX19KCksZnVuY3Rpb24oYSl7dmFyIGI9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LGM9bnVsbCxkPSExO3RyeXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKGIpLmdldFByb3BlcnR5VmFsdWUoXCJvcGFjaXR5XCIpLGY9XCIwXCI9PWU/XCIxXCI6XCIwXCI7Yz1iLmFuaW1hdGUoe29wYWNpdHk6W2YsZl19LHtkdXJhdGlvbjoxfSksYy5jdXJyZW50VGltZT0wLGQ9Z2V0Q29tcHV0ZWRTdHlsZShiKS5nZXRQcm9wZXJ0eVZhbHVlKFwib3BhY2l0eVwiKT09Zn1jYXRjaChhKXt9ZmluYWxseXtjJiZjLmNhbmNlbCgpfWlmKCFkKXt2YXIgZz13aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZTt3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZT1mdW5jdGlvbihiLGMpe3JldHVybiB3aW5kb3cuU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3ImJkFycmF5LnByb3RvdHlwZS5mcm9tJiZiW1N5bWJvbC5pdGVyYXRvcl0mJihiPUFycmF5LmZyb20oYikpLEFycmF5LmlzQXJyYXkoYil8fG51bGw9PT1ifHwoYj1hLmNvbnZlcnRUb0FycmF5Rm9ybShiKSksZy5jYWxsKHRoaXMsYixjKX19fShjKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXt2YXIgYz1iLnRpbWVsaW5lO2MuY3VycmVudFRpbWU9YSxjLl9kaXNjYXJkQW5pbWF0aW9ucygpLDA9PWMuX2FuaW1hdGlvbnMubGVuZ3RoP2Y9ITE6cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGQpfXZhciBlPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZT1mdW5jdGlvbihhKXtyZXR1cm4gZShmdW5jdGlvbihjKXtiLnRpbWVsaW5lLl91cGRhdGVBbmltYXRpb25zUHJvbWlzZXMoKSxhKGMpLGIudGltZWxpbmUuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpfSl9LGIuQW5pbWF0aW9uVGltZWxpbmU9ZnVuY3Rpb24oKXt0aGlzLl9hbmltYXRpb25zPVtdLHRoaXMuY3VycmVudFRpbWU9dm9pZCAwfSxiLkFuaW1hdGlvblRpbWVsaW5lLnByb3RvdHlwZT17Z2V0QW5pbWF0aW9uczpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9kaXNjYXJkQW5pbWF0aW9ucygpLHRoaXMuX2FuaW1hdGlvbnMuc2xpY2UoKX0sX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlczpmdW5jdGlvbigpe2IuYW5pbWF0aW9uc1dpdGhQcm9taXNlcz1iLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXMuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBhLl91cGRhdGVQcm9taXNlcygpfSl9LF9kaXNjYXJkQW5pbWF0aW9uczpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbnM9dGhpcy5fYW5pbWF0aW9ucy5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuXCJmaW5pc2hlZFwiIT1hLnBsYXlTdGF0ZSYmXCJpZGxlXCIhPWEucGxheVN0YXRlfSl9LF9wbGF5OmZ1bmN0aW9uKGEpe3ZhciBjPW5ldyBiLkFuaW1hdGlvbihhLHRoaXMpO3JldHVybiB0aGlzLl9hbmltYXRpb25zLnB1c2goYyksYi5yZXN0YXJ0V2ViQW5pbWF0aW9uc05leHRUaWNrKCksYy5fdXBkYXRlUHJvbWlzZXMoKSxjLl9hbmltYXRpb24ucGxheSgpLGMuX3VwZGF0ZVByb21pc2VzKCksY30scGxheTpmdW5jdGlvbihhKXtyZXR1cm4gYSYmYS5yZW1vdmUoKSx0aGlzLl9wbGF5KGEpfX07dmFyIGY9ITE7Yi5yZXN0YXJ0V2ViQW5pbWF0aW9uc05leHRUaWNrPWZ1bmN0aW9uKCl7Znx8KGY9ITAscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGQpKX07dmFyIGc9bmV3IGIuQW5pbWF0aW9uVGltZWxpbmU7Yi50aW1lbGluZT1nO3RyeXtPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LmRvY3VtZW50LFwidGltZWxpbmVcIix7Y29uZmlndXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBnfX0pfWNhdGNoKGEpe310cnl7d2luZG93LmRvY3VtZW50LnRpbWVsaW5lPWd9Y2F0Y2goYSl7fX0oMCxlKSxmdW5jdGlvbihhLGIsYyl7Yi5hbmltYXRpb25zV2l0aFByb21pc2VzPVtdLGIuQW5pbWF0aW9uPWZ1bmN0aW9uKGIsYyl7aWYodGhpcy5pZD1cIlwiLGImJmIuX2lkJiYodGhpcy5pZD1iLl9pZCksdGhpcy5lZmZlY3Q9YixiJiYoYi5fYW5pbWF0aW9uPXRoaXMpLCFjKXRocm93IG5ldyBFcnJvcihcIkFuaW1hdGlvbiB3aXRoIG51bGwgdGltZWxpbmUgaXMgbm90IHN1cHBvcnRlZFwiKTt0aGlzLl90aW1lbGluZT1jLHRoaXMuX3NlcXVlbmNlTnVtYmVyPWEuc2VxdWVuY2VOdW1iZXIrKyx0aGlzLl9ob2xkVGltZT0wLHRoaXMuX3BhdXNlZD0hMSx0aGlzLl9pc0dyb3VwPSExLHRoaXMuX2FuaW1hdGlvbj1udWxsLHRoaXMuX2NoaWxkQW5pbWF0aW9ucz1bXSx0aGlzLl9jYWxsYmFjaz1udWxsLHRoaXMuX29sZFBsYXlTdGF0ZT1cImlkbGVcIix0aGlzLl9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbigpLHRoaXMuX2FuaW1hdGlvbi5jYW5jZWwoKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxiLkFuaW1hdGlvbi5wcm90b3R5cGU9e191cGRhdGVQcm9taXNlczpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX29sZFBsYXlTdGF0ZSxiPXRoaXMucGxheVN0YXRlO3JldHVybiB0aGlzLl9yZWFkeVByb21pc2UmJmIhPT1hJiYoXCJpZGxlXCI9PWI/KHRoaXMuX3JlamVjdFJlYWR5UHJvbWlzZSgpLHRoaXMuX3JlYWR5UHJvbWlzZT12b2lkIDApOlwicGVuZGluZ1wiPT1hP3RoaXMuX3Jlc29sdmVSZWFkeVByb21pc2UoKTpcInBlbmRpbmdcIj09YiYmKHRoaXMuX3JlYWR5UHJvbWlzZT12b2lkIDApKSx0aGlzLl9maW5pc2hlZFByb21pc2UmJmIhPT1hJiYoXCJpZGxlXCI9PWI/KHRoaXMuX3JlamVjdEZpbmlzaGVkUHJvbWlzZSgpLHRoaXMuX2ZpbmlzaGVkUHJvbWlzZT12b2lkIDApOlwiZmluaXNoZWRcIj09Yj90aGlzLl9yZXNvbHZlRmluaXNoZWRQcm9taXNlKCk6XCJmaW5pc2hlZFwiPT1hJiYodGhpcy5fZmluaXNoZWRQcm9taXNlPXZvaWQgMCkpLHRoaXMuX29sZFBsYXlTdGF0ZT10aGlzLnBsYXlTdGF0ZSx0aGlzLl9yZWFkeVByb21pc2V8fHRoaXMuX2ZpbmlzaGVkUHJvbWlzZX0sX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKTt2YXIgYSxjLGQsZSxmPSEhdGhpcy5fYW5pbWF0aW9uO2YmJihhPXRoaXMucGxheWJhY2tSYXRlLGM9dGhpcy5fcGF1c2VkLGQ9dGhpcy5zdGFydFRpbWUsZT10aGlzLmN1cnJlbnRUaW1lLHRoaXMuX2FuaW1hdGlvbi5jYW5jZWwoKSx0aGlzLl9hbmltYXRpb24uX3dyYXBwZXI9bnVsbCx0aGlzLl9hbmltYXRpb249bnVsbCksKCF0aGlzLmVmZmVjdHx8dGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuS2V5ZnJhbWVFZmZlY3QpJiYodGhpcy5fYW5pbWF0aW9uPWIubmV3VW5kZXJseWluZ0FuaW1hdGlvbkZvcktleWZyYW1lRWZmZWN0KHRoaXMuZWZmZWN0KSxiLmJpbmRBbmltYXRpb25Gb3JLZXlmcmFtZUVmZmVjdCh0aGlzKSksKHRoaXMuZWZmZWN0IGluc3RhbmNlb2Ygd2luZG93LlNlcXVlbmNlRWZmZWN0fHx0aGlzLmVmZmVjdCBpbnN0YW5jZW9mIHdpbmRvdy5Hcm91cEVmZmVjdCkmJih0aGlzLl9hbmltYXRpb249Yi5uZXdVbmRlcmx5aW5nQW5pbWF0aW9uRm9yR3JvdXAodGhpcy5lZmZlY3QpLGIuYmluZEFuaW1hdGlvbkZvckdyb3VwKHRoaXMpKSx0aGlzLmVmZmVjdCYmdGhpcy5lZmZlY3QuX29uc2FtcGxlJiZiLmJpbmRBbmltYXRpb25Gb3JDdXN0b21FZmZlY3QodGhpcyksZiYmKDEhPWEmJih0aGlzLnBsYXliYWNrUmF0ZT1hKSxudWxsIT09ZD90aGlzLnN0YXJ0VGltZT1kOm51bGwhPT1lP3RoaXMuY3VycmVudFRpbWU9ZTpudWxsIT09dGhpcy5faG9sZFRpbWUmJih0aGlzLmN1cnJlbnRUaW1lPXRoaXMuX2hvbGRUaW1lKSxjJiZ0aGlzLnBhdXNlKCkpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LF91cGRhdGVDaGlsZHJlbjpmdW5jdGlvbigpe2lmKHRoaXMuZWZmZWN0JiZcImlkbGVcIiE9dGhpcy5wbGF5U3RhdGUpe3ZhciBhPXRoaXMuZWZmZWN0Ll90aW1pbmcuZGVsYXk7dGhpcy5fY2hpbGRBbmltYXRpb25zLmZvckVhY2goZnVuY3Rpb24oYyl7dGhpcy5fYXJyYW5nZUNoaWxkcmVuKGMsYSksdGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3QmJihhKz1iLmdyb3VwQ2hpbGREdXJhdGlvbihjLmVmZmVjdCkpfS5iaW5kKHRoaXMpKX19LF9zZXRFeHRlcm5hbEFuaW1hdGlvbjpmdW5jdGlvbihhKXtpZih0aGlzLmVmZmVjdCYmdGhpcy5faXNHcm91cClmb3IodmFyIGI9MDtiPHRoaXMuZWZmZWN0LmNoaWxkcmVuLmxlbmd0aDtiKyspdGhpcy5lZmZlY3QuY2hpbGRyZW5bYl0uX2FuaW1hdGlvbj1hLHRoaXMuX2NoaWxkQW5pbWF0aW9uc1tiXS5fc2V0RXh0ZXJuYWxBbmltYXRpb24oYSl9LF9jb25zdHJ1Y3RDaGlsZEFuaW1hdGlvbnM6ZnVuY3Rpb24oKXtpZih0aGlzLmVmZmVjdCYmdGhpcy5faXNHcm91cCl7dmFyIGE9dGhpcy5lZmZlY3QuX3RpbWluZy5kZWxheTt0aGlzLl9yZW1vdmVDaGlsZEFuaW1hdGlvbnMoKSx0aGlzLmVmZmVjdC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpe3ZhciBkPWIudGltZWxpbmUuX3BsYXkoYyk7dGhpcy5fY2hpbGRBbmltYXRpb25zLnB1c2goZCksZC5wbGF5YmFja1JhdGU9dGhpcy5wbGF5YmFja1JhdGUsdGhpcy5fcGF1c2VkJiZkLnBhdXNlKCksYy5fYW5pbWF0aW9uPXRoaXMuZWZmZWN0Ll9hbmltYXRpb24sdGhpcy5fYXJyYW5nZUNoaWxkcmVuKGQsYSksdGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3QmJihhKz1iLmdyb3VwQ2hpbGREdXJhdGlvbihjKSl9LmJpbmQodGhpcykpfX0sX2FycmFuZ2VDaGlsZHJlbjpmdW5jdGlvbihhLGIpe251bGw9PT10aGlzLnN0YXJ0VGltZT9hLmN1cnJlbnRUaW1lPXRoaXMuY3VycmVudFRpbWUtYi90aGlzLnBsYXliYWNrUmF0ZTphLnN0YXJ0VGltZSE9PXRoaXMuc3RhcnRUaW1lK2IvdGhpcy5wbGF5YmFja1JhdGUmJihhLnN0YXJ0VGltZT10aGlzLnN0YXJ0VGltZStiL3RoaXMucGxheWJhY2tSYXRlKX0sZ2V0IHRpbWVsaW5lKCl7cmV0dXJuIHRoaXMuX3RpbWVsaW5lfSxnZXQgcGxheVN0YXRlKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbj90aGlzLl9hbmltYXRpb24ucGxheVN0YXRlOlwiaWRsZVwifSxnZXQgZmluaXNoZWQoKXtyZXR1cm4gd2luZG93LlByb21pc2U/KHRoaXMuX2ZpbmlzaGVkUHJvbWlzZXx8KC0xPT1iLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXMuaW5kZXhPZih0aGlzKSYmYi5hbmltYXRpb25zV2l0aFByb21pc2VzLnB1c2godGhpcyksdGhpcy5fZmluaXNoZWRQcm9taXNlPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGEsYil7dGhpcy5fcmVzb2x2ZUZpbmlzaGVkUHJvbWlzZT1mdW5jdGlvbigpe2EodGhpcyl9LHRoaXMuX3JlamVjdEZpbmlzaGVkUHJvbWlzZT1mdW5jdGlvbigpe2Ioe3R5cGU6RE9NRXhjZXB0aW9uLkFCT1JUX0VSUixuYW1lOlwiQWJvcnRFcnJvclwifSl9fS5iaW5kKHRoaXMpKSxcImZpbmlzaGVkXCI9PXRoaXMucGxheVN0YXRlJiZ0aGlzLl9yZXNvbHZlRmluaXNoZWRQcm9taXNlKCkpLHRoaXMuX2ZpbmlzaGVkUHJvbWlzZSk6KGNvbnNvbGUud2FybihcIkFuaW1hdGlvbiBQcm9taXNlcyByZXF1aXJlIEphdmFTY3JpcHQgUHJvbWlzZSBjb25zdHJ1Y3RvclwiKSxudWxsKX0sZ2V0IHJlYWR5KCl7cmV0dXJuIHdpbmRvdy5Qcm9taXNlPyh0aGlzLl9yZWFkeVByb21pc2V8fCgtMT09Yi5hbmltYXRpb25zV2l0aFByb21pc2VzLmluZGV4T2YodGhpcykmJmIuYW5pbWF0aW9uc1dpdGhQcm9taXNlcy5wdXNoKHRoaXMpLHRoaXMuX3JlYWR5UHJvbWlzZT1uZXcgUHJvbWlzZShmdW5jdGlvbihhLGIpe3RoaXMuX3Jlc29sdmVSZWFkeVByb21pc2U9ZnVuY3Rpb24oKXthKHRoaXMpfSx0aGlzLl9yZWplY3RSZWFkeVByb21pc2U9ZnVuY3Rpb24oKXtiKHt0eXBlOkRPTUV4Y2VwdGlvbi5BQk9SVF9FUlIsbmFtZTpcIkFib3J0RXJyb3JcIn0pfX0uYmluZCh0aGlzKSksXCJwZW5kaW5nXCIhPT10aGlzLnBsYXlTdGF0ZSYmdGhpcy5fcmVzb2x2ZVJlYWR5UHJvbWlzZSgpKSx0aGlzLl9yZWFkeVByb21pc2UpOihjb25zb2xlLndhcm4oXCJBbmltYXRpb24gUHJvbWlzZXMgcmVxdWlyZSBKYXZhU2NyaXB0IFByb21pc2UgY29uc3RydWN0b3JcIiksbnVsbCl9LGdldCBvbmZpbmlzaCgpe3JldHVybiB0aGlzLl9hbmltYXRpb24ub25maW5pc2h9LHNldCBvbmZpbmlzaChhKXt0aGlzLl9hbmltYXRpb24ub25maW5pc2g9XCJmdW5jdGlvblwiPT10eXBlb2YgYT9mdW5jdGlvbihiKXtiLnRhcmdldD10aGlzLGEuY2FsbCh0aGlzLGIpfS5iaW5kKHRoaXMpOmF9LGdldCBvbmNhbmNlbCgpe3JldHVybiB0aGlzLl9hbmltYXRpb24ub25jYW5jZWx9LHNldCBvbmNhbmNlbChhKXt0aGlzLl9hbmltYXRpb24ub25jYW5jZWw9XCJmdW5jdGlvblwiPT10eXBlb2YgYT9mdW5jdGlvbihiKXtiLnRhcmdldD10aGlzLGEuY2FsbCh0aGlzLGIpfS5iaW5kKHRoaXMpOmF9LGdldCBjdXJyZW50VGltZSgpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCk7dmFyIGE9dGhpcy5fYW5pbWF0aW9uLmN1cnJlbnRUaW1lO3JldHVybiB0aGlzLl91cGRhdGVQcm9taXNlcygpLGF9LHNldCBjdXJyZW50VGltZShhKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbi5jdXJyZW50VGltZT1pc0Zpbml0ZShhKT9hOk1hdGguc2lnbihhKSpOdW1iZXIuTUFYX1ZBTFVFLHRoaXMuX3JlZ2lzdGVyKCksdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGIsYyl7Yi5jdXJyZW50VGltZT1hLWN9KSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxnZXQgc3RhcnRUaW1lKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbi5zdGFydFRpbWV9LHNldCBzdGFydFRpbWUoYSl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9hbmltYXRpb24uc3RhcnRUaW1lPWlzRmluaXRlKGEpP2E6TWF0aC5zaWduKGEpKk51bWJlci5NQVhfVkFMVUUsdGhpcy5fcmVnaXN0ZXIoKSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYixjKXtiLnN0YXJ0VGltZT1hK2N9KSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxnZXQgcGxheWJhY2tSYXRlKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbi5wbGF5YmFja1JhdGV9LHNldCBwbGF5YmFja1JhdGUoYSl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKTt2YXIgYj10aGlzLmN1cnJlbnRUaW1lO3RoaXMuX2FuaW1hdGlvbi5wbGF5YmFja1JhdGU9YSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYil7Yi5wbGF5YmFja1JhdGU9YX0pLG51bGwhPT1iJiYodGhpcy5jdXJyZW50VGltZT1iKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxwbGF5OmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9wYXVzZWQ9ITEsdGhpcy5fYW5pbWF0aW9uLnBsYXkoKSwtMT09dGhpcy5fdGltZWxpbmUuX2FuaW1hdGlvbnMuaW5kZXhPZih0aGlzKSYmdGhpcy5fdGltZWxpbmUuX2FuaW1hdGlvbnMucHVzaCh0aGlzKSx0aGlzLl9yZWdpc3RlcigpLGIuYXdhaXRTdGFydFRpbWUodGhpcyksdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGEpe3ZhciBiPWEuY3VycmVudFRpbWU7YS5wbGF5KCksYS5jdXJyZW50VGltZT1ifSksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0scGF1c2U6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuY3VycmVudFRpbWUmJih0aGlzLl9ob2xkVGltZT10aGlzLmN1cnJlbnRUaW1lKSx0aGlzLl9hbmltYXRpb24ucGF1c2UoKSx0aGlzLl9yZWdpc3RlcigpLHRoaXMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihhKXthLnBhdXNlKCl9KSx0aGlzLl9wYXVzZWQ9ITAsdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sZmluaXNoOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9hbmltYXRpb24uZmluaXNoKCksdGhpcy5fcmVnaXN0ZXIoKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxjYW5jZWw6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbi5jYW5jZWwoKSx0aGlzLl9yZWdpc3RlcigpLHRoaXMuX3JlbW92ZUNoaWxkQW5pbWF0aW9ucygpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LHJldmVyc2U6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpO3ZhciBhPXRoaXMuY3VycmVudFRpbWU7dGhpcy5fYW5pbWF0aW9uLnJldmVyc2UoKSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYSl7YS5yZXZlcnNlKCl9KSxudWxsIT09YSYmKHRoaXMuY3VycmVudFRpbWU9YSksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sYWRkRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbihhLGIpe3ZhciBjPWI7XCJmdW5jdGlvblwiPT10eXBlb2YgYiYmKGM9ZnVuY3Rpb24oYSl7YS50YXJnZXQ9dGhpcyxiLmNhbGwodGhpcyxhKX0uYmluZCh0aGlzKSxiLl93cmFwcGVyPWMpLHRoaXMuX2FuaW1hdGlvbi5hZGRFdmVudExpc3RlbmVyKGEsYyl9LHJlbW92ZUV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24oYSxiKXt0aGlzLl9hbmltYXRpb24ucmVtb3ZlRXZlbnRMaXN0ZW5lcihhLGImJmIuX3dyYXBwZXJ8fGIpfSxfcmVtb3ZlQ2hpbGRBbmltYXRpb25zOmZ1bmN0aW9uKCl7Zm9yKDt0aGlzLl9jaGlsZEFuaW1hdGlvbnMubGVuZ3RoOyl0aGlzLl9jaGlsZEFuaW1hdGlvbnMucG9wKCkuY2FuY2VsKCl9LF9mb3JFYWNoQ2hpbGQ6ZnVuY3Rpb24oYil7dmFyIGM9MDtpZih0aGlzLmVmZmVjdC5jaGlsZHJlbiYmdGhpcy5fY2hpbGRBbmltYXRpb25zLmxlbmd0aDx0aGlzLmVmZmVjdC5jaGlsZHJlbi5sZW5ndGgmJnRoaXMuX2NvbnN0cnVjdENoaWxkQW5pbWF0aW9ucygpLHRoaXMuX2NoaWxkQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGEpe2IuY2FsbCh0aGlzLGEsYyksdGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3QmJihjKz1hLmVmZmVjdC5hY3RpdmVEdXJhdGlvbil9LmJpbmQodGhpcykpLFwicGVuZGluZ1wiIT10aGlzLnBsYXlTdGF0ZSl7dmFyIGQ9dGhpcy5lZmZlY3QuX3RpbWluZyxlPXRoaXMuY3VycmVudFRpbWU7bnVsbCE9PWUmJihlPWEuY2FsY3VsYXRlSXRlcmF0aW9uUHJvZ3Jlc3MoYS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbihkKSxlLGQpKSwobnVsbD09ZXx8aXNOYU4oZSkpJiZ0aGlzLl9yZW1vdmVDaGlsZEFuaW1hdGlvbnMoKX19fSx3aW5kb3cuQW5pbWF0aW9uPWIuQW5pbWF0aW9ufShjLGUpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGIpe3RoaXMuX2ZyYW1lcz1hLm5vcm1hbGl6ZUtleWZyYW1lcyhiKX1mdW5jdGlvbiBlKCl7Zm9yKHZhciBhPSExO2kubGVuZ3RoOylpLnNoaWZ0KCkuX3VwZGF0ZUNoaWxkcmVuKCksYT0hMDtyZXR1cm4gYX12YXIgZj1mdW5jdGlvbihhKXtpZihhLl9hbmltYXRpb249dm9pZCAwLGEgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3R8fGEgaW5zdGFuY2VvZiB3aW5kb3cuR3JvdXBFZmZlY3QpZm9yKHZhciBiPTA7YjxhLmNoaWxkcmVuLmxlbmd0aDtiKyspZihhLmNoaWxkcmVuW2JdKX07Yi5yZW1vdmVNdWx0aT1mdW5jdGlvbihhKXtmb3IodmFyIGI9W10sYz0wO2M8YS5sZW5ndGg7YysrKXt2YXIgZD1hW2NdO2QuX3BhcmVudD8oLTE9PWIuaW5kZXhPZihkLl9wYXJlbnQpJiZiLnB1c2goZC5fcGFyZW50KSxkLl9wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGQuX3BhcmVudC5jaGlsZHJlbi5pbmRleE9mKGQpLDEpLGQuX3BhcmVudD1udWxsLGYoZCkpOmQuX2FuaW1hdGlvbiYmZC5fYW5pbWF0aW9uLmVmZmVjdD09ZCYmKGQuX2FuaW1hdGlvbi5jYW5jZWwoKSxkLl9hbmltYXRpb24uZWZmZWN0PW5ldyBLZXlmcmFtZUVmZmVjdChudWxsLFtdKSxkLl9hbmltYXRpb24uX2NhbGxiYWNrJiYoZC5fYW5pbWF0aW9uLl9jYWxsYmFjay5fYW5pbWF0aW9uPW51bGwpLGQuX2FuaW1hdGlvbi5fcmVidWlsZFVuZGVybHlpbmdBbmltYXRpb24oKSxmKGQpKX1mb3IoYz0wO2M8Yi5sZW5ndGg7YysrKWJbY10uX3JlYnVpbGQoKX0sYi5LZXlmcmFtZUVmZmVjdD1mdW5jdGlvbihiLGMsZSxmKXtyZXR1cm4gdGhpcy50YXJnZXQ9Yix0aGlzLl9wYXJlbnQ9bnVsbCxlPWEubnVtZXJpY1RpbWluZ1RvT2JqZWN0KGUpLHRoaXMuX3RpbWluZ0lucHV0PWEuY2xvbmVUaW1pbmdJbnB1dChlKSx0aGlzLl90aW1pbmc9YS5ub3JtYWxpemVUaW1pbmdJbnB1dChlKSx0aGlzLnRpbWluZz1hLm1ha2VUaW1pbmcoZSwhMSx0aGlzKSx0aGlzLnRpbWluZy5fZWZmZWN0PXRoaXMsXCJmdW5jdGlvblwiPT10eXBlb2YgYz8oYS5kZXByZWNhdGVkKFwiQ3VzdG9tIEtleWZyYW1lRWZmZWN0XCIsXCIyMDE1LTA2LTIyXCIsXCJVc2UgS2V5ZnJhbWVFZmZlY3Qub25zYW1wbGUgaW5zdGVhZC5cIiksdGhpcy5fbm9ybWFsaXplZEtleWZyYW1lcz1jKTp0aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzPW5ldyBkKGMpLHRoaXMuX2tleWZyYW1lcz1jLHRoaXMuYWN0aXZlRHVyYXRpb249YS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbih0aGlzLl90aW1pbmcpLHRoaXMuX2lkPWYsdGhpc30sYi5LZXlmcmFtZUVmZmVjdC5wcm90b3R5cGU9e2dldEZyYW1lczpmdW5jdGlvbigpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHRoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXM/dGhpcy5fbm9ybWFsaXplZEtleWZyYW1lczp0aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzLl9mcmFtZXN9LHNldCBvbnNhbXBsZShhKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLmdldEZyYW1lcygpKXRocm93IG5ldyBFcnJvcihcIlNldHRpbmcgb25zYW1wbGUgb24gY3VzdG9tIGVmZmVjdCBLZXlmcmFtZUVmZmVjdCBpcyBub3Qgc3VwcG9ydGVkLlwiKTt0aGlzLl9vbnNhbXBsZT1hLHRoaXMuX2FuaW1hdGlvbiYmdGhpcy5fYW5pbWF0aW9uLl9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbigpfSxnZXQgcGFyZW50KCl7cmV0dXJuIHRoaXMuX3BhcmVudH0sY2xvbmU6ZnVuY3Rpb24oKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLmdldEZyYW1lcygpKXRocm93IG5ldyBFcnJvcihcIkNsb25pbmcgY3VzdG9tIGVmZmVjdHMgaXMgbm90IHN1cHBvcnRlZC5cIik7dmFyIGI9bmV3IEtleWZyYW1lRWZmZWN0KHRoaXMudGFyZ2V0LFtdLGEuY2xvbmVUaW1pbmdJbnB1dCh0aGlzLl90aW1pbmdJbnB1dCksdGhpcy5faWQpO3JldHVybiBiLl9ub3JtYWxpemVkS2V5ZnJhbWVzPXRoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXMsYi5fa2V5ZnJhbWVzPXRoaXMuX2tleWZyYW1lcyxifSxyZW1vdmU6ZnVuY3Rpb24oKXtiLnJlbW92ZU11bHRpKFt0aGlzXSl9fTt2YXIgZz1FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlO0VsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD1cIlwiO3JldHVybiBjJiZjLmlkJiYoZD1jLmlkKSxiLnRpbWVsaW5lLl9wbGF5KG5ldyBiLktleWZyYW1lRWZmZWN0KHRoaXMsYSxjLGQpKX07dmFyIGg9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiZGl2XCIpO2IubmV3VW5kZXJseWluZ0FuaW1hdGlvbkZvcktleWZyYW1lRWZmZWN0PWZ1bmN0aW9uKGEpe2lmKGEpe3ZhciBiPWEudGFyZ2V0fHxoLGM9YS5fa2V5ZnJhbWVzO1wiZnVuY3Rpb25cIj09dHlwZW9mIGMmJihjPVtdKTt2YXIgZD1hLl90aW1pbmdJbnB1dDtkLmlkPWEuX2lkfWVsc2UgdmFyIGI9aCxjPVtdLGQ9MDtyZXR1cm4gZy5hcHBseShiLFtjLGRdKX0sYi5iaW5kQW5pbWF0aW9uRm9yS2V5ZnJhbWVFZmZlY3Q9ZnVuY3Rpb24oYSl7YS5lZmZlY3QmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGEuZWZmZWN0Ll9ub3JtYWxpemVkS2V5ZnJhbWVzJiZiLmJpbmRBbmltYXRpb25Gb3JDdXN0b21FZmZlY3QoYSl9O3ZhciBpPVtdO2IuYXdhaXRTdGFydFRpbWU9ZnVuY3Rpb24oYSl7bnVsbD09PWEuc3RhcnRUaW1lJiZhLl9pc0dyb3VwJiYoMD09aS5sZW5ndGgmJnJlcXVlc3RBbmltYXRpb25GcmFtZShlKSxpLnB1c2goYSkpfTt2YXIgaj13aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZTtPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LFwiZ2V0Q29tcHV0ZWRTdHlsZVwiLHtjb25maWd1cmFibGU6ITAsZW51bWVyYWJsZTohMCx2YWx1ZTpmdW5jdGlvbigpe2IudGltZWxpbmUuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpO3ZhciBhPWouYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBlKCkmJihhPWouYXBwbHkodGhpcyxhcmd1bWVudHMpKSxiLnRpbWVsaW5lLl91cGRhdGVBbmltYXRpb25zUHJvbWlzZXMoKSxhfX0pLHdpbmRvdy5LZXlmcmFtZUVmZmVjdD1iLktleWZyYW1lRWZmZWN0LHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5nZXRBbmltYXRpb25zPWZ1bmN0aW9uKCl7cmV0dXJuIGRvY3VtZW50LnRpbWVsaW5lLmdldEFuaW1hdGlvbnMoKS5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPT1hLmVmZmVjdCYmYS5lZmZlY3QudGFyZ2V0PT10aGlzfS5iaW5kKHRoaXMpKX19KGMsZSksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSl7YS5fcmVnaXN0ZXJlZHx8KGEuX3JlZ2lzdGVyZWQ9ITAsZy5wdXNoKGEpLGh8fChoPSEwLHJlcXVlc3RBbmltYXRpb25GcmFtZShlKSkpfWZ1bmN0aW9uIGUoYSl7dmFyIGI9ZztnPVtdLGIuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhLl9zZXF1ZW5jZU51bWJlci1iLl9zZXF1ZW5jZU51bWJlcn0pLGI9Yi5maWx0ZXIoZnVuY3Rpb24oYSl7YSgpO3ZhciBiPWEuX2FuaW1hdGlvbj9hLl9hbmltYXRpb24ucGxheVN0YXRlOlwiaWRsZVwiO3JldHVyblwicnVubmluZ1wiIT1iJiZcInBlbmRpbmdcIiE9YiYmKGEuX3JlZ2lzdGVyZWQ9ITEpLGEuX3JlZ2lzdGVyZWR9KSxnLnB1c2guYXBwbHkoZyxiKSxnLmxlbmd0aD8oaD0hMCxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZSkpOmg9ITF9dmFyIGY9KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImRpdlwiKSwwKTtiLmJpbmRBbmltYXRpb25Gb3JDdXN0b21FZmZlY3Q9ZnVuY3Rpb24oYil7dmFyIGMsZT1iLmVmZmVjdC50YXJnZXQsZz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBiLmVmZmVjdC5nZXRGcmFtZXMoKTtjPWc/Yi5lZmZlY3QuZ2V0RnJhbWVzKCk6Yi5lZmZlY3QuX29uc2FtcGxlO3ZhciBoPWIuZWZmZWN0LnRpbWluZyxpPW51bGw7aD1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KGgpO3ZhciBqPWZ1bmN0aW9uKCl7dmFyIGQ9ai5fYW5pbWF0aW9uP2ouX2FuaW1hdGlvbi5jdXJyZW50VGltZTpudWxsO251bGwhPT1kJiYoZD1hLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzKGEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24oaCksZCxoKSxpc05hTihkKSYmKGQ9bnVsbCkpLGQhPT1pJiYoZz9jKGQsZSxiLmVmZmVjdCk6YyhkLGIuZWZmZWN0LGIuZWZmZWN0Ll9hbmltYXRpb24pKSxpPWR9O2ouX2FuaW1hdGlvbj1iLGouX3JlZ2lzdGVyZWQ9ITEsai5fc2VxdWVuY2VOdW1iZXI9ZisrLGIuX2NhbGxiYWNrPWosZChqKX07dmFyIGc9W10saD0hMTtiLkFuaW1hdGlvbi5wcm90b3R5cGUuX3JlZ2lzdGVyPWZ1bmN0aW9uKCl7dGhpcy5fY2FsbGJhY2smJmQodGhpcy5fY2FsbGJhY2spfX0oYyxlKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXtyZXR1cm4gYS5fdGltaW5nLmRlbGF5K2EuYWN0aXZlRHVyYXRpb24rYS5fdGltaW5nLmVuZERlbGF5fWZ1bmN0aW9uIGUoYixjLGQpe3RoaXMuX2lkPWQsdGhpcy5fcGFyZW50PW51bGwsdGhpcy5jaGlsZHJlbj1ifHxbXSx0aGlzLl9yZXBhcmVudCh0aGlzLmNoaWxkcmVuKSxjPWEubnVtZXJpY1RpbWluZ1RvT2JqZWN0KGMpLHRoaXMuX3RpbWluZ0lucHV0PWEuY2xvbmVUaW1pbmdJbnB1dChjKSx0aGlzLl90aW1pbmc9YS5ub3JtYWxpemVUaW1pbmdJbnB1dChjLCEwKSx0aGlzLnRpbWluZz1hLm1ha2VUaW1pbmcoYywhMCx0aGlzKSx0aGlzLnRpbWluZy5fZWZmZWN0PXRoaXMsXCJhdXRvXCI9PT10aGlzLl90aW1pbmcuZHVyYXRpb24mJih0aGlzLl90aW1pbmcuZHVyYXRpb249dGhpcy5hY3RpdmVEdXJhdGlvbil9d2luZG93LlNlcXVlbmNlRWZmZWN0PWZ1bmN0aW9uKCl7ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LHdpbmRvdy5Hcm91cEVmZmVjdD1mdW5jdGlvbigpe2UuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxlLnByb3RvdHlwZT17X2lzQW5jZXN0b3I6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXM7bnVsbCE9PWI7KXtpZihiPT1hKXJldHVybiEwO2I9Yi5fcGFyZW50fXJldHVybiExfSxfcmVidWlsZDpmdW5jdGlvbigpe2Zvcih2YXIgYT10aGlzO2E7KVwiYXV0b1wiPT09YS50aW1pbmcuZHVyYXRpb24mJihhLl90aW1pbmcuZHVyYXRpb249YS5hY3RpdmVEdXJhdGlvbiksYT1hLl9wYXJlbnQ7dGhpcy5fYW5pbWF0aW9uJiZ0aGlzLl9hbmltYXRpb24uX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uKCl9LF9yZXBhcmVudDpmdW5jdGlvbihhKXtiLnJlbW92ZU11bHRpKGEpO2Zvcih2YXIgYz0wO2M8YS5sZW5ndGg7YysrKWFbY10uX3BhcmVudD10aGlzfSxfcHV0Q2hpbGQ6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9Yj9cIkNhbm5vdCBhcHBlbmQgYW4gYW5jZXN0b3Igb3Igc2VsZlwiOlwiQ2Fubm90IHByZXBlbmQgYW4gYW5jZXN0b3Igb3Igc2VsZlwiLGQ9MDtkPGEubGVuZ3RoO2QrKylpZih0aGlzLl9pc0FuY2VzdG9yKGFbZF0pKXRocm93e3R5cGU6RE9NRXhjZXB0aW9uLkhJRVJBUkNIWV9SRVFVRVNUX0VSUixuYW1lOlwiSGllcmFyY2h5UmVxdWVzdEVycm9yXCIsbWVzc2FnZTpjfTtmb3IodmFyIGQ9MDtkPGEubGVuZ3RoO2QrKyliP3RoaXMuY2hpbGRyZW4ucHVzaChhW2RdKTp0aGlzLmNoaWxkcmVuLnVuc2hpZnQoYVtkXSk7dGhpcy5fcmVwYXJlbnQoYSksdGhpcy5fcmVidWlsZCgpfSxhcHBlbmQ6ZnVuY3Rpb24oKXt0aGlzLl9wdXRDaGlsZChhcmd1bWVudHMsITApfSxwcmVwZW5kOmZ1bmN0aW9uKCl7dGhpcy5fcHV0Q2hpbGQoYXJndW1lbnRzLCExKX0sZ2V0IHBhcmVudCgpe3JldHVybiB0aGlzLl9wYXJlbnR9LGdldCBmaXJzdENoaWxkKCl7cmV0dXJuIHRoaXMuY2hpbGRyZW4ubGVuZ3RoP3RoaXMuY2hpbGRyZW5bMF06bnVsbH0sZ2V0IGxhc3RDaGlsZCgpe3JldHVybiB0aGlzLmNoaWxkcmVuLmxlbmd0aD90aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoLTFdOm51bGx9LGNsb25lOmZ1bmN0aW9uKCl7Zm9yKHZhciBiPWEuY2xvbmVUaW1pbmdJbnB1dCh0aGlzLl90aW1pbmdJbnB1dCksYz1bXSxkPTA7ZDx0aGlzLmNoaWxkcmVuLmxlbmd0aDtkKyspYy5wdXNoKHRoaXMuY2hpbGRyZW5bZF0uY2xvbmUoKSk7cmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBHcm91cEVmZmVjdD9uZXcgR3JvdXBFZmZlY3QoYyxiKTpuZXcgU2VxdWVuY2VFZmZlY3QoYyxiKX0scmVtb3ZlOmZ1bmN0aW9uKCl7Yi5yZW1vdmVNdWx0aShbdGhpc10pfX0sd2luZG93LlNlcXVlbmNlRWZmZWN0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlNlcXVlbmNlRWZmZWN0LnByb3RvdHlwZSxcImFjdGl2ZUR1cmF0aW9uXCIse2dldDpmdW5jdGlvbigpe3ZhciBhPTA7cmV0dXJuIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihiKXthKz1kKGIpfSksTWF0aC5tYXgoYSwwKX19KSx3aW5kb3cuR3JvdXBFZmZlY3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuR3JvdXBFZmZlY3QucHJvdG90eXBlLFwiYWN0aXZlRHVyYXRpb25cIix7Z2V0OmZ1bmN0aW9uKCl7dmFyIGE9MDtyZXR1cm4gdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGIpe2E9TWF0aC5tYXgoYSxkKGIpKX0pLGF9fSksYi5uZXdVbmRlcmx5aW5nQW5pbWF0aW9uRm9yR3JvdXA9ZnVuY3Rpb24oYyl7dmFyIGQsZT1udWxsLGY9ZnVuY3Rpb24oYil7dmFyIGM9ZC5fd3JhcHBlcjtpZihjJiZcInBlbmRpbmdcIiE9Yy5wbGF5U3RhdGUmJmMuZWZmZWN0KXJldHVybiBudWxsPT1iP3ZvaWQgYy5fcmVtb3ZlQ2hpbGRBbmltYXRpb25zKCk6MD09YiYmYy5wbGF5YmFja1JhdGU8MCYmKGV8fChlPWEubm9ybWFsaXplVGltaW5nSW5wdXQoYy5lZmZlY3QudGltaW5nKSksYj1hLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzKGEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24oZSksLTEsZSksaXNOYU4oYil8fG51bGw9PWIpPyhjLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYSl7YS5jdXJyZW50VGltZT0tMX0pLHZvaWQgYy5fcmVtb3ZlQ2hpbGRBbmltYXRpb25zKCkpOnZvaWQgMH0sZz1uZXcgS2V5ZnJhbWVFZmZlY3QobnVsbCxbXSxjLl90aW1pbmcsYy5faWQpO3JldHVybiBnLm9uc2FtcGxlPWYsZD1iLnRpbWVsaW5lLl9wbGF5KGcpfSxiLmJpbmRBbmltYXRpb25Gb3JHcm91cD1mdW5jdGlvbihhKXthLl9hbmltYXRpb24uX3dyYXBwZXI9YSxhLl9pc0dyb3VwPSEwLGIuYXdhaXRTdGFydFRpbWUoYSksYS5fY29uc3RydWN0Q2hpbGRBbmltYXRpb25zKCksYS5fc2V0RXh0ZXJuYWxBbmltYXRpb24oYSl9LGIuZ3JvdXBDaGlsZER1cmF0aW9uPWR9KGMsZSksYi50cnVlPWF9KHt9LGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KCkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViLWFuaW1hdGlvbnMtbmV4dC1saXRlLm1pbi5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy93ZWItYW5pbWF0aW9ucy1qcy93ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy93ZWItYW5pbWF0aW9ucy1qcy93ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsInZhciBnO1xuXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxuZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXM7XG59KSgpO1xuXG50cnkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcbn0gY2F0Y2goZSkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxuXHRcdGcgPSB3aW5kb3c7XG59XG5cbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XG5cbm1vZHVsZS5leHBvcnRzID0gZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvd2VicGFjay9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21haW4uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy9tYWluLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgJ3dlYi1hbmltYXRpb25zLWpzL3dlYi1hbmltYXRpb25zLW5leHQtbGl0ZS5taW4nO1xyXG5pbXBvcnQgcmVuZGVyZXIgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL3Zkb20nO1xyXG5pbXBvcnQgeyB3IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2QnO1xyXG5pbXBvcnQgJ0Bkb2pvL3RoZW1lcy9kb2pvL2luZGV4LmNzcyc7XHJcblxyXG5pbXBvcnQgQXBwIGZyb20gJy4vd2lkZ2V0cy9BcHAnO1xyXG5cclxuY29uc3QgciA9IHJlbmRlcmVyKCgpID0+IHcoQXBwLCB7fSkpO1xyXG5yLm1vdW50KCk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy9tYWluLnRzIiwiaW1wb3J0IHsgdiwgdyB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcclxuaW1wb3J0IFdpZGdldEJhc2UgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xyXG5cclxuaW1wb3J0IHsgQ2F0IH0gZnJvbSAnLi9DYXQnO1xyXG5pbXBvcnQgeyBEb2cgfSBmcm9tICcuL0RvZyc7XHJcbmltcG9ydCAqIGFzIGNzcyBmcm9tICcuL3N0eWxlcy9hcHAubS5jc3MnO1xyXG5pbXBvcnQgeyBDb3JlQXVkaW8gfSBmcm9tICcuL0NvcmVBdWRpbyc7XHJcbmltcG9ydCBTbGlkZXIgZnJvbSAnQGRvam8vd2lkZ2V0cy9zbGlkZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwIGV4dGVuZHMgV2lkZ2V0QmFzZSB7XHJcblx0cHJpdmF0ZSBjb3JlQXVkaW8gPSBuZXcgQ29yZUF1ZGlvKCk7XHJcblx0cHJpdmF0ZSBjaG9pY2U6IHN0cmluZyA9ICcnO1xyXG5cdHByaXZhdGUgZXhjaXRlZFZhbHVlID0gMTtcclxuXHRwcml2YXRlIHBsYXlpbmcgPSBmYWxzZTtcclxuXHJcblx0cHJpdmF0ZSBfb25DaG9pY2VDbGljayhjaG9pY2U6IHN0cmluZykge1xyXG5cdFx0dGhpcy5jaG9pY2UgPSBjaG9pY2U7XHJcblx0XHR0aGlzLmludmFsaWRhdGUoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX29uU3BlYWtDbGljaygpIHtcclxuXHRcdHRoaXMucGxheWluZyA9IHRydWU7XHJcblx0XHR0aGlzLmNvcmVBdWRpby5wbGF5KHRoaXMuY2hvaWNlLCB0aGlzLmV4Y2l0ZWRWYWx1ZSwgKCkgPT4ge1xyXG5cdFx0XHR0aGlzLnBsYXlpbmcgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5pbnZhbGlkYXRlKCk7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuaW52YWxpZGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZXhjaXRlZENoYW5nZSh2YWx1ZTogbnVtYmVyKSB7XHJcblx0XHR0aGlzLmV4Y2l0ZWRWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0dGhpcy5pbnZhbGlkYXRlKCk7XHJcblx0fVxyXG5cclxuXHRwcm90ZWN0ZWQgcmVuZGVyKCkge1xyXG5cclxuXHRcdGNvbnN0IHsgZXhjaXRlZFZhbHVlLCBjaG9pY2UsIHBsYXlpbmcgfSA9IHRoaXM7XHJcblxyXG5cdFx0cmV0dXJuIHYoJ2RpdicsIHsgY2xhc3NlczogY3NzLnJvb3QgfSwgW1xyXG5cdFx0XHR2KCdoZWFkZXInLCB7IGNsYXNzZXM6IGNzcy5oZWFkZXIgfSwgW1xyXG5cdFx0XHRcdHYoJ2J1dHRvbicsIHsgY2xhc3NlczogY3NzLmJ1dHRvbiwgb25jbGljazogKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5fb25DaG9pY2VDbGljaygnY2F0Jyk7XHJcblx0XHRcdFx0fX0sIFsgJ0NhdHMnIF0pLFxyXG5cdFx0XHRcdHYoJ3AnLCB7fSwgWyd2cyddKSxcclxuXHRcdFx0XHR2KCdidXR0b24nLCB7IGNsYXNzZXM6IGNzcy5idXR0b24sIG9uY2xpY2s6ICgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuX29uQ2hvaWNlQ2xpY2soJ2RvZycpO1xyXG5cdFx0XHRcdH19LCBbICdEb2dzJyBdKVxyXG5cdFx0XHRdKSxcclxuXHRcdFx0dGhpcy5jaG9pY2UgPyB2KCdkaXYnLCB7IGNsYXNzZXM6IGNzcy5jb250cm9scyB9LCBbXHJcblx0XHRcdFx0dyhTbGlkZXIsIHtcclxuXHRcdFx0XHRcdGV4dHJhQ2xhc3NlczogeyByb290OiBjc3Muc2xpZGVyIH0sXHJcblx0XHRcdFx0XHRsYWJlbDogYEhvdyBFeGNpdGVkIGlzIHRoZSAke2Nob2ljZX1gLFxyXG5cdFx0XHRcdFx0dmFsdWU6IGV4Y2l0ZWRWYWx1ZSxcclxuXHRcdFx0XHRcdG1pbjogMC4xLFxyXG5cdFx0XHRcdFx0bWF4OiAzLFxyXG5cdFx0XHRcdFx0c3RlcDogMC4xLFxyXG5cdFx0XHRcdFx0b25DaGFuZ2U6IHRoaXMuX2V4Y2l0ZWRDaGFuZ2VcclxuXHRcdFx0XHR9KSxcclxuXHRcdFx0XHR2KCdidXR0b24nLCB7XHJcblx0XHRcdFx0XHRjbGFzc2VzOiBjc3MuYnV0dG9uLFxyXG5cdFx0XHRcdFx0b25jbGljazogdGhpcy5fb25TcGVha0NsaWNrLFxyXG5cdFx0XHRcdFx0ZGlzYWJsZWQ6IHBsYXlpbmdcclxuXHRcdFx0XHR9LCBbICdTcGVhaycgXSlcclxuXHRcdFx0XSkgOiB1bmRlZmluZWQsXHJcblx0XHRcdHRoaXMuY2hvaWNlID09PSAnY2F0JyA/IHcoQ2F0LCB7IGFuaW1hdGlvblNwZWVkOiBleGNpdGVkVmFsdWUgfSkgOiB1bmRlZmluZWQsXHJcblx0XHRcdHRoaXMuY2hvaWNlID09PSAnZG9nJyA/IHcoRG9nLCB7IGFuaW1hdGlvblNwZWVkOiBleGNpdGVkVmFsdWUgfSkgOiB1bmRlZmluZWRcclxuXHRcdF0pO1xyXG5cdH1cclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvd2lkZ2V0cy9BcHAudHMiLCJpbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xyXG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9zdHlsZXMvY2F0Lm0uY3NzJztcclxuaW1wb3J0IHsgdiB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcclxuaW1wb3J0IFdlYkFuaW1hdGlvbiBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWV0YS9XZWJBbmltYXRpb24nO1xyXG5pbXBvcnQgVGhlbWVkTWl4aW4gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQnO1xyXG5cclxuY29uc3QgaGVhZCA9IHJlcXVpcmUoJy4vYXNzZXRzL2NhdC1oZWFkLnBuZycpO1xyXG5jb25zdCBib2R5ID0gcmVxdWlyZSgnLi9hc3NldHMvY2F0LWJvZHkucG5nJyk7XHJcbmNvbnN0IHRhaWwgPSByZXF1aXJlKCcuL2Fzc2V0cy9jYXQtdGFpbC5wbmcnKTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2F0UHJvcGVydGllcyB7XHJcblx0YW5pbWF0aW9uU3BlZWQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENhdCBleHRlbmRzIFRoZW1lZE1peGluKFdpZGdldEJhc2UpPENhdFByb3BlcnRpZXM+IHtcclxuXHJcblx0cHJpdmF0ZSBfZ2V0SGVhZEFuaW1hdGlvbihhbmltYXRpb25TcGVlZDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRpZDogJ2NhdC1oZWFkJyxcclxuXHRcdFx0ZWZmZWN0czogW1xyXG5cdFx0XHRcdHsgbWFyZ2luQm90dG9tOiAnMHB4JyB9LFxyXG5cdFx0XHRcdHsgbWFyZ2luQm90dG9tOiAnNXB4JyB9LFxyXG5cdFx0XHRcdHsgbWFyZ2luQm90dG9tOiAnMHB4JyB9XHJcblx0XHRcdF0gYXMgYW55LFxyXG5cdFx0XHR0aW1pbmc6IHtcclxuXHRcdFx0XHRkdXJhdGlvbjogODAwLFxyXG5cdFx0XHRcdGl0ZXJhdGlvbnM6IEluZmluaXR5XHJcblx0XHRcdH0sXHJcblx0XHRcdGNvbnRyb2xzOiB7XHJcblx0XHRcdFx0cGxheTogdHJ1ZSxcclxuXHRcdFx0XHRwbGF5YmFja1JhdGU6IGFuaW1hdGlvblNwZWVkXHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF9nZXRUYWlsQW5pbWF0aW9uKGFuaW1hdGlvblNwZWVkOiBudW1iZXIpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGlkOiAnY2F0LXRhaWwnLFxyXG5cdFx0XHRlZmZlY3RzOiBbXHJcblx0XHRcdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoMGRlZyknIH0sXHJcblx0XHRcdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoLTEwZGVnKScgfSxcclxuXHRcdFx0XHR7IHRyYW5zZm9ybTogJ3JvdGF0ZSgwZGVnKScgfVxyXG5cdFx0XHRdLFxyXG5cdFx0XHR0aW1pbmc6IHtcclxuXHRcdFx0XHRkdXJhdGlvbjogMTAwMCxcclxuXHRcdFx0XHRpdGVyYXRpb25zOiBJbmZpbml0eVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb250cm9sczoge1xyXG5cdFx0XHRcdHBsYXk6IHRydWUsXHJcblx0XHRcdFx0cGxheWJhY2tSYXRlOiBhbmltYXRpb25TcGVlZFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIHJlbmRlcigpIHtcclxuXHRcdGNvbnN0IHsgYW5pbWF0aW9uU3BlZWQgfSA9IHRoaXMucHJvcGVydGllcztcclxuXHJcblx0XHR0aGlzLm1ldGEoV2ViQW5pbWF0aW9uKS5hbmltYXRlKCdjYXQtaGVhZCcsIHRoaXMuX2dldEhlYWRBbmltYXRpb24oYW5pbWF0aW9uU3BlZWQpKTtcclxuXHRcdHRoaXMubWV0YShXZWJBbmltYXRpb24pLmFuaW1hdGUoJ2NhdC10YWlsJywgdGhpcy5fZ2V0VGFpbEFuaW1hdGlvbihhbmltYXRpb25TcGVlZCkpO1xyXG5cclxuXHRcdHJldHVybiB2KCdkaXYnLCB7IGNsYXNzZXM6IGNzcy5yb290IH0sIFtcclxuXHRcdFx0dignaW1nJywgeyBrZXk6ICdjYXQtaGVhZCcsIHNyYzogaGVhZCwgY2xhc3NlczogY3NzLmhlYWQgfSksXHJcblx0XHRcdHYoJ2ltZycsIHsga2V5OiAnY2F0LWJvZHknLCBzcmM6IGJvZHksIGNsYXNzZXM6IGNzcy5ib2R5IH0pLFxyXG5cdFx0XHR2KCdpbWcnLCB7IGtleTogJ2NhdC10YWlsJywgc3JjOiB0YWlsLCBjbGFzc2VzOiBjc3MudGFpbCB9KVxyXG5cdFx0XSk7XHJcblx0fVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL0NhdC50cyIsImNvbnN0IEF1ZGlvQ29udGV4dCA9ICg8YW55PiB3aW5kb3cpLkF1ZGlvQ29udGV4dCB8fCAoPGFueT4gd2luZG93KS53ZWJraXRBdWRpb0NvbnRleHQ7IC8vIHNhZmFyaSA6XFxcblxuZXhwb3J0IGNsYXNzIENvcmVBdWRpbyB7XG5cdHByaXZhdGUgY29udGV4dCE6IEF1ZGlvQ29udGV4dDtcblxuXHRwcml2YXRlIGF1ZGlvTWFwID0gbmV3IE1hcDxzdHJpbmcsIEF1ZGlvQnVmZmVyPigpO1xuXG5cdGFzeW5jIHBsYXkoc291bmQ6IHN0cmluZywgc3BlZWQ6IG51bWJlciwgb25TdG9wOiAoKSA9PiB2b2lkKSB7XG5cdFx0aWYgKCF0aGlzLmNvbnRleHQpIHtcblx0XHRcdHRoaXMuY29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblx0XHR9XG5cblx0XHQvLyBDaHJvbWUgYW5kIFNhZmFyaSBhcmUgYm90aCBhd2Z1bFxuXHRcdGlmICh0aGlzLmNvbnRleHQuc3RhdGUgPT09ICdzdXNwZW5kZWQnKSB7XG5cdFx0XHR0aGlzLmNvbnRleHQucmVzdW1lKCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc291cmNlID0gdGhpcy5jb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXHRcdHNvdXJjZS5idWZmZXIgPSBhd2FpdCB0aGlzLmxvYWRDYWNoZWQoc291bmQpO1xuXHRcdHNvdXJjZS5jb25uZWN0KHRoaXMuY29udGV4dC5kZXN0aW5hdGlvbik7XG5cdFx0c291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNwZWVkO1xuXHRcdHNvdXJjZS5sb29wID0gdHJ1ZTtcblx0XHRzb3VyY2Uuc3RhcnQodGhpcy5jb250ZXh0LmN1cnJlbnRUaW1lKTtcblxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0c291cmNlLnN0b3AoKTtcblx0XHRcdG9uU3RvcCgpO1xuXHRcdH0sIDUwMDApO1xuXG5cdFx0Y29uc29sZS5sb2coc291bmQpO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkQ2FjaGVkKHNvdW5kOiBzdHJpbmcpIHtcblx0XHRpZiAodGhpcy5hdWRpb01hcC5oYXMoc291bmQpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hdWRpb01hcC5nZXQoc291bmQpITtcblx0XHR9XG5cblx0XHRjb25zdCBidWZmZXIgPSBhd2FpdCB0aGlzLmxvYWRBdWRpbyhzb3VuZCk7XG5cdFx0dGhpcy5hdWRpb01hcC5zZXQoc291bmQsIGJ1ZmZlcik7XG5cdFx0cmV0dXJuIGJ1ZmZlcjtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgbG9hZEF1ZGlvKHNvdW5kOiBzdHJpbmcpIHtcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBmZXRjaChgYXNzZXRzL3NvdW5kcy8ke3NvdW5kfS5tcDNgKTtcblx0XHRjb25zdCBhdWRpb0RhdGEgPSBhd2FpdCByZXN1bHQuYXJyYXlCdWZmZXIoKTtcblx0XHRpZiAodGhpcy5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YS5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGF1ZGlvRGF0YSk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlPEF1ZGlvQnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdHRoaXMuY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYXVkaW9EYXRhLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdFx0fSlcblx0XHR9XG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL0NvcmVBdWRpby50cyIsImltcG9ydCB7IFRoZW1lZE1peGluLCB0aGVtZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkJztcclxuaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlJztcclxuaW1wb3J0ICogYXMgY3NzIGZyb20gJy4vc3R5bGVzL2RvZy5tLmNzcyc7XHJcbmltcG9ydCB7IHYgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XHJcbmltcG9ydCBXZWJBbmltYXRpb24gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvV2ViQW5pbWF0aW9uJztcclxuXHJcbmNvbnN0IGhlYWQgPSByZXF1aXJlKCcuL2Fzc2V0cy9kb2ctaGVhZC5wbmcnKTtcclxuY29uc3QgYm9keSA9IHJlcXVpcmUoJy4vYXNzZXRzL2RvZy1ib2R5LnBuZycpO1xyXG5jb25zdCB0YWlsID0gcmVxdWlyZSgnLi9hc3NldHMvZG9nLXRhaWwucG5nJyk7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERvZ1Byb3BlcnRpZXMge1xyXG5cdGFuaW1hdGlvblNwZWVkOiBudW1iZXI7XHJcbn1cclxuXHJcbkB0aGVtZShjc3MpXHJcbmV4cG9ydCBjbGFzcyBEb2cgZXh0ZW5kcyBUaGVtZWRNaXhpbihXaWRnZXRCYXNlKTxEb2dQcm9wZXJ0aWVzPiB7XHJcblxyXG5cdHByaXZhdGUgX2dldEhlYWRBbmltYXRpb24oYW5pbWF0aW9uU3BlZWQ6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0aWQ6ICdkb2ctaGVhZCcsXHJcblx0XHRcdGVmZmVjdHM6IFtcclxuXHRcdFx0XHR7IG1hcmdpbkJvdHRvbTogJzBweCcgfSxcclxuXHRcdFx0XHR7IG1hcmdpbkJvdHRvbTogJzVweCcgfSxcclxuXHRcdFx0XHR7IG1hcmdpbkJvdHRvbTogJzBweCcgfVxyXG5cdFx0XHRdIGFzIGFueSxcclxuXHRcdFx0dGltaW5nOiB7XHJcblx0XHRcdFx0ZHVyYXRpb246IDgwMCxcclxuXHRcdFx0XHRpdGVyYXRpb25zOiBJbmZpbml0eVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb250cm9sczoge1xyXG5cdFx0XHRcdHBsYXk6IHRydWUsXHJcblx0XHRcdFx0cGxheWJhY2tSYXRlOiBhbmltYXRpb25TcGVlZFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfZ2V0VGFpbEFuaW1hdGlvbihhbmltYXRpb25TcGVlZDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRpZDogJ2RvZy10YWlsJyxcclxuXHRcdFx0ZWZmZWN0czogW1xyXG5cdFx0XHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKDEwZGVnKScgfSxcclxuXHRcdFx0XHR7IHRyYW5zZm9ybTogJ3JvdGF0ZSgtMTBkZWcpJyB9LFxyXG5cdFx0XHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKDEwZGVnKScgfVxyXG5cdFx0XHRdLFxyXG5cdFx0XHR0aW1pbmc6IHtcclxuXHRcdFx0XHRkdXJhdGlvbjogMTAwMCxcclxuXHRcdFx0XHRpdGVyYXRpb25zOiBJbmZpbml0eVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb250cm9sczoge1xyXG5cdFx0XHRcdHBsYXk6IHRydWUsXHJcblx0XHRcdFx0cGxheWJhY2tSYXRlOiBhbmltYXRpb25TcGVlZFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIHJlbmRlcigpIHtcclxuXHRcdGNvbnN0IHsgYW5pbWF0aW9uU3BlZWQgfSA9IHRoaXMucHJvcGVydGllcztcclxuXHJcblx0XHR0aGlzLm1ldGEoV2ViQW5pbWF0aW9uKS5hbmltYXRlKCdkb2ctaGVhZCcsIHRoaXMuX2dldEhlYWRBbmltYXRpb24oYW5pbWF0aW9uU3BlZWQpKTtcclxuXHRcdHRoaXMubWV0YShXZWJBbmltYXRpb24pLmFuaW1hdGUoJ2RvZy10YWlsJywgdGhpcy5fZ2V0VGFpbEFuaW1hdGlvbihhbmltYXRpb25TcGVlZCkpO1xyXG5cclxuXHRcdHJldHVybiB2KCdkaXYnLCB7IGNsYXNzZXM6IGNzcy5yb290IH0sIFtcclxuXHRcdFx0dignaW1nJywgeyBrZXk6ICdkb2ctaGVhZCcsIHNyYzogaGVhZCwgY2xhc3NlczogY3NzLmhlYWQgfSksXHJcblx0XHRcdHYoJ2ltZycsIHsga2V5OiAnZG9nLWJvZHknLCBzcmM6IGJvZHksIGNsYXNzZXM6IGNzcy5ib2R5IH0pLFxyXG5cdFx0XHR2KCdpbWcnLCB7IGtleTogJ2RvZy10YWlsJywgc3JjOiB0YWlsLCBjbGFzc2VzOiBjc3MudGFpbCB9KVxyXG5cdFx0XSk7XHJcblx0fVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL0RvZy50cyIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImNhdC1ib2R5LjRtTnhKX054LnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC1ib2R5LnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWJvZHkucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImNhdC1oZWFkLjFMTjBGeEpKLnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC1oZWFkLnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWhlYWQucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImNhdC10YWlsLjJnd01zaE50LnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC10YWlsLnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LXRhaWwucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImRvZy1ib2R5LjFpTTJoUlU4LnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2RvZy1ib2R5LnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImRvZy1oZWFkLjM1S3J2VmlKLnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2RvZy1oZWFkLnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWhlYWQucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImRvZy10YWlsLjF2NkFkdzAwLnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2RvZy10YWlsLnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLXRhaWwucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL2FwcFwiLFwicm9vdFwiOlwiYXBwLW1fX3Jvb3RfXzJsajQyXCIsXCJidXR0b25cIjpcImFwcC1tX19idXR0b25fXzFobUtuXCIsXCJoZWFkZXJcIjpcImFwcC1tX19oZWFkZXJfXzNfZ3R2XCIsXCJjb250cm9sc1wiOlwiYXBwLW1fX2NvbnRyb2xzX18yaGtBclwiLFwic2xpZGVyXCI6XCJhcHAtbV9fc2xpZGVyX19vb2d0V1wifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy93aWRnZXRzL3N0eWxlcy9hcHAubS5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vc3JjL3dpZGdldHMvc3R5bGVzL2FwcC5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9jYXRcIixcInJvb3RcIjpcImNhdC1tX19yb290X18ySU9yZFwiLFwiaGVhZFwiOlwiY2F0LW1fX2hlYWRfXzFpQ2JSXCIsXCJib2R5XCI6XCJjYXQtbV9fYm9keV9fVkJZMllcIixcInRhaWxcIjpcImNhdC1tX190YWlsX18xNlItZVwifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy93aWRnZXRzL3N0eWxlcy9jYXQubS5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vc3JjL3dpZGdldHMvc3R5bGVzL2NhdC5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9kb2dcIixcInJvb3RcIjpcImRvZy1tX19yb290X18xenFkalwiLFwiaGVhZFwiOlwiZG9nLW1fX2hlYWRfX2g1WTdpXCIsXCJib2R5XCI6XCJkb2ctbV9fYm9keV9fMVBiZy1cIixcInRhaWxcIjpcImRvZy1tX190YWlsX18xSzcxdFwifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy93aWRnZXRzL3N0eWxlcy9kb2cubS5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vc3JjL3dpZGdldHMvc3R5bGVzL2RvZy5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iXSwic291cmNlUm9vdCI6IiJ9