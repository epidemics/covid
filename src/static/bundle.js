/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/frontend/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/core-js/es/object/values.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/es/object/values.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ../../modules/es.object.values */ "./node_modules/core-js/modules/es.object.values.js");
var path = __webpack_require__(/*! ../../internals/path */ "./node_modules/core-js/internals/path.js");

module.exports = path.Object.values;


/***/ }),

/***/ "./node_modules/core-js/features/object/values.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/features/object/values.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(/*! ../../es/object/values */ "./node_modules/core-js/es/object/values.js");

module.exports = parent;


/***/ }),

/***/ "./node_modules/core-js/internals/an-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/an-object.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-includes.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/array-includes.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");
var toAbsoluteIndex = __webpack_require__(/*! ../internals/to-absolute-index */ "./node_modules/core-js/internals/to-absolute-index.js");

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ "./node_modules/core-js/internals/classof-raw.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/classof-raw.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "./node_modules/core-js/internals/copy-constructor-properties.js":
/*!***********************************************************************!*\
  !*** ./node_modules/core-js/internals/copy-constructor-properties.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var ownKeys = __webpack_require__(/*! ../internals/own-keys */ "./node_modules/core-js/internals/own-keys.js");
var getOwnPropertyDescriptorModule = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-non-enumerable-property.js":
/*!**************************************************************************!*\
  !*** ./node_modules/core-js/internals/create-non-enumerable-property.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-property-descriptor.js":
/*!**********************************************************************!*\
  !*** ./node_modules/core-js/internals/create-property-descriptor.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "./node_modules/core-js/internals/descriptors.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/descriptors.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/document-create-element.js":
/*!*******************************************************************!*\
  !*** ./node_modules/core-js/internals/document-create-element.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ "./node_modules/core-js/internals/enum-bug-keys.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/enum-bug-keys.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ "./node_modules/core-js/internals/export.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/export.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var getOwnPropertyDescriptor = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js").f;
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");
var copyConstructorProperties = __webpack_require__(/*! ../internals/copy-constructor-properties */ "./node_modules/core-js/internals/copy-constructor-properties.js");
var isForced = __webpack_require__(/*! ../internals/is-forced */ "./node_modules/core-js/internals/is-forced.js");

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/fails.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/internals/fails.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/get-built-in.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/get-built-in.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(/*! ../internals/path */ "./node_modules/core-js/internals/path.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};


/***/ }),

/***/ "./node_modules/core-js/internals/global.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/global.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/core-js/internals/has.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/internals/has.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "./node_modules/core-js/internals/hidden-keys.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/hidden-keys.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),

/***/ "./node_modules/core-js/internals/ie8-dom-define.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/ie8-dom-define.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var createElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/indexed-object.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/indexed-object.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),

/***/ "./node_modules/core-js/internals/inspect-source.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/inspect-source.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store.inspectSource != 'function') {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;


/***/ }),

/***/ "./node_modules/core-js/internals/internal-state.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/internal-state.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_WEAK_MAP = __webpack_require__(/*! ../internals/native-weak-map */ "./node_modules/core-js/internals/native-weak-map.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var objectHas = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "./node_modules/core-js/internals/shared-key.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-forced.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-forced.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ "./node_modules/core-js/internals/is-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-object.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-pure.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/is-pure.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ "./node_modules/core-js/internals/native-weak-map.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/native-weak-map.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "./node_modules/core-js/internals/inspect-source.js");

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));


/***/ }),

/***/ "./node_modules/core-js/internals/object-define-property.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/object-define-property.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "./node_modules/core-js/internals/to-primitive.js");

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-descriptor.js":
/*!******************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-descriptor.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "./node_modules/core-js/internals/object-property-is-enumerable.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "./node_modules/core-js/internals/to-primitive.js");
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-names.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-names.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "./node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-symbols.js":
/*!***************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-symbols.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ "./node_modules/core-js/internals/object-keys-internal.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/object-keys-internal.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var indexOf = __webpack_require__(/*! ../internals/array-includes */ "./node_modules/core-js/internals/array-includes.js").indexOf;
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-keys.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/object-keys.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "./node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-property-is-enumerable.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-property-is-enumerable.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;


/***/ }),

/***/ "./node_modules/core-js/internals/object-to-array.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/object-to-array.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "./node_modules/core-js/internals/object-keys.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var propertyIsEnumerable = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "./node_modules/core-js/internals/object-property-is-enumerable.js").f;

// `Object.{ entries, values }` methods implementation
var createMethod = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var keys = objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

module.exports = {
  // `Object.entries` method
  // https://tc39.github.io/ecma262/#sec-object.entries
  entries: createMethod(true),
  // `Object.values` method
  // https://tc39.github.io/ecma262/#sec-object.values
  values: createMethod(false)
};


/***/ }),

/***/ "./node_modules/core-js/internals/own-keys.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/own-keys.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var getOwnPropertyNamesModule = __webpack_require__(/*! ../internals/object-get-own-property-names */ "./node_modules/core-js/internals/object-get-own-property-names.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "./node_modules/core-js/internals/object-get-own-property-symbols.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ "./node_modules/core-js/internals/path.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/path.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

module.exports = global;


/***/ }),

/***/ "./node_modules/core-js/internals/redefine.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/redefine.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "./node_modules/core-js/internals/inspect-source.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});


/***/ }),

/***/ "./node_modules/core-js/internals/require-object-coercible.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/require-object-coercible.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/set-global.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/set-global.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared-key.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/shared-key.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var uid = __webpack_require__(/*! ../internals/uid */ "./node_modules/core-js/internals/uid.js");

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared-store.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/shared-store.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;


/***/ }),

/***/ "./node_modules/core-js/internals/shared.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/shared.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");
var store = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.4',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ "./node_modules/core-js/internals/to-absolute-index.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-absolute-index.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ../internals/to-integer */ "./node_modules/core-js/internals/to-integer.js");

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-indexed-object.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-indexed-object.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "./node_modules/core-js/internals/indexed-object.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-integer.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/to-integer.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-length.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/to-length.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ../internals/to-integer */ "./node_modules/core-js/internals/to-integer.js");

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-primitive.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/to-primitive.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "./node_modules/core-js/internals/uid.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/internals/uid.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),

/***/ "./node_modules/core-js/modules/es.object.values.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/modules/es.object.values.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var $values = __webpack_require__(/*! ../internals/object-to-array */ "./node_modules/core-js/internals/object-to-array.js").values;

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
$({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/frontend/case-map.ts":
/*!**********************************!*\
  !*** ./src/frontend/case-map.ts ***!
  \**********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var plotly_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! plotly.js */ "plotly.js");
/* harmony import */ var plotly_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(plotly_js__WEBPACK_IMPORTED_MODULE_0__);

var MAP_ID = "mapid";
function makeMap(regions_data) {
    function unpack(rows, key) {
        return rows.map(function (row) {
            return row[key];
        });
    }
    function get_text(dict) {
        return Object.keys(dict).map(function (country) {
            var last_data = get_last_data(dict[country]);
            return last_data["FT_Infected"];
        });
    }
    function get_last_data(row) {
        var sorted = Object.keys(row["data"]["estimates"]["days"]).sort();
        var last = sorted[sorted.length - 1];
        return row["data"]["estimates"]["days"][last];
    }
    function get_risk(row) {
        var last_data = get_last_data(row);
        return last_data["FT_Infected"] / row["population"];
    }
    function get_z(dict) {
        return Object.keys(dict).map(function (country) {
            var risk = get_risk(dict[country]);
            return Math.log(risk * 1000) / Math.log(2);
        });
    }
    function value_to_labels(v) {
        var x = Math.pow(2, v) * 1000;
        if (x >= 1000) {
            return (x / 1000).toString() + "k";
        }
        return x.toString();
    }
    function get_locations(dict) {
        return Object.keys(dict).map(function (country) {
            return dict[country]["iso_alpha_3"];
        });
    }
    function get_customdata(dict) {
        return Object.keys(dict).map(function (country) {
            return {
                country_to_search: country.replace(" ", "+"),
                infected_per_1m: get_risk(dict[country]) * 1000000,
                country_name: dict[country]["name"],
                est_active: get_last_data(dict[country])["FT_Infected"]
            };
        });
    }
    var tick_values = [-3, -1, 1, 3, 5];
    var tick_names = tick_values.map(value_to_labels);
    var data = [
        {
            type: "choroplethmapbox",
            name: "COVID-19: Active infections estimate",
            geojson: "https://storage.googleapis.com/static-covid/static/casemap-geo.json",
            featureidkey: "properties.iso_a3",
            locations: get_locations(regions_data["regions"]),
            z: get_z(regions_data["regions"]),
            zmax: 5,
            zmin: -3,
            text: get_text(regions_data["regions"]),
            colorscale: [
                [0, "rgb(255,255,0)"],
                [1, "rgb(255,0,0)"]
            ],
            showscale: true,
            customdata: get_customdata(regions_data["regions"]),
            hovertemplate: "<b>%{customdata.country_name}</b><br><br>" +
                "Estimations:<br>" +
                "Infected per 1M: <b>%{customdata.infected_per_1m:,.0f}</b><br>" +
                "Infected total: <b>%{customdata.est_active:,.0f}</b>" +
                "<extra></extra>",
            hoverlabel: {
                font: {
                    family: "DM Sans"
                }
            },
            colorbar: {
                y: 0,
                yanchor: "bottom",
                title: {
                    text: "Infected per 1M",
                    side: "right",
                    font: {
                        color: "#B5B5B5",
                        family: "DM Sans"
                    }
                },
                tickvals: tick_values,
                ticktext: tick_names,
                tickfont: {
                    color: "#B5B5B5",
                    family: "DM Sans"
                }
            }
        }
    ];
    var layout = {
        title: {
            text: "COVID-19: Active infections estimate (fraction of population)",
            font: {
                color: "#E9E9E9",
                size: 25,
                family: "DM Sans"
            }
        },
        mapbox: {
            style: "carto-darkmatter"
        },
        paper_bgcolor: "#222028",
        geo: {
            showframe: false,
            showcoastlines: false
        }
    };
    plotly_js__WEBPACK_IMPORTED_MODULE_0__["newPlot"](caseMap, data, layout).then(function (gd) {
        gd.on("plotly_click", function (d) {
            var pt = (d.points || [])[0];
            window.open("/?selection=" + pt.customdata["country_to_search"]);
        });
    });
}
var caseMap = document.getElementById(MAP_ID);
if (caseMap !== null) {
    plotly_js__WEBPACK_IMPORTED_MODULE_0__["d3"].json("https://storage.googleapis.com/static-covid/static/data-main-v3.json", function (err, data) {
        // TODO error handling
        makeMap(data);
    });
}


/***/ }),

/***/ "./src/frontend/consulting-alert.ts":
/*!******************************************!*\
  !*** ./src/frontend/consulting-alert.ts ***!
  \******************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! moment */ "moment");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_0__);

var KEY = "consulting_dismissed";
var DISMISSAL_DURATION = { days: 1 };
var ALERT_ID = "consultingAlert";
// control the consulting alert, using a Storage object
function controlConsultingAlert($alert, storage) {
    var alertId = $alert.dataset.id;
    function shouldDisplay() {
        if (!storage) {
            return true;
        }
        var raw = storage.getItem(KEY);
        if (raw === null) {
            return true;
        }
        var dismissed;
        try {
            dismissed = JSON.parse(raw);
            dismissed.date = moment__WEBPACK_IMPORTED_MODULE_0__(dismissed.date);
            if (!dismissed.date.isValid()) {
                throw new Error();
            }
        }
        catch (_a) {
            // the stored item is somehow invalid, remove it
            storage.removeItem(KEY);
            return true;
        }
        // display if the alert has a different id or the maximal
        // date has not yet been exceded
        return (dismissed.id !== alertId ||
            dismissed.date.add(DISMISSAL_DURATION).isBefore(moment__WEBPACK_IMPORTED_MODULE_0__()));
    }
    if (shouldDisplay()) {
        $($alert)
            .removeClass("d-none")
            .on("closed.bs.alert", function () {
            var dismissed = {
                date: moment__WEBPACK_IMPORTED_MODULE_0__().toISOString(),
                id: alertId
            };
            storage.setItem(KEY, JSON.stringify(dismissed));
        });
    }
}
var $alert = document.getElementById(ALERT_ID);
if ($alert) {
    controlConsultingAlert($alert, window.sessionStorage);
}


/***/ }),

/***/ "./src/frontend/custom-plotly-image-saver.ts":
/*!***************************************************!*\
  !*** ./src/frontend/custom-plotly-image-saver.ts ***!
  \***************************************************/
/*! exports provided: saveImage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "saveImage", function() { return saveImage; });
/* harmony import */ var plotly_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! plotly.js */ "plotly.js");
/* harmony import */ var plotly_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(plotly_js__WEBPACK_IMPORTED_MODULE_0__);

var saveImage = (function () {
    var $offscreenElem = null;
    var $canvas = null;
    var VECTOR_EFFECT_REGEX = /vector-effect: non-scaling-stroke;/g;
    // adapted form https://stackoverflow.com/questions/20830309/download-file-using-an-ajax-request
    function download(canvas, filename, type) {
        //for IE
        if (canvas.msToBlob && window.navigator.msSaveBlob) {
            var blob = canvas.msToBlob(type);
            window.navigator.msSaveBlob(blob, filename);
            return;
        }
        /// create an "off-screen" anchor tag
        var link = document.createElement("a"), event;
        document.body.appendChild(link);
        /// the key here is to set the download attribute of the a tag
        link.download = filename;
        /// convert canvas content to data-uri for link. When download
        /// attribute is set the content pointed to by link will be
        /// pushed as "download" in HTML5 capable browsers
        link.href = canvas.toDataURL();
        var fireEvent = link.fireEvent;
        /// create a "fake" click-event to trigger the download
        if (document.createEvent) {
            event = document.createEvent("MouseEvents");
            event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);
        }
        else if (fireEvent) {
            fireEvent("onclick");
        }
        document.body.removeChild(link);
    }
    return function saveImage(plotlyElement, opts) {
        var scale = opts.scale || 1;
        var format = opts.format || "png";
        var name = opts.name || "plot";
        var background = opts.background || "black";
        var compose = opts.compose ||
            function ($canvas, plot, width, height) {
                $canvas.width = width;
                $canvas.height = height;
                var ctx = $canvas.getContext("2d");
                ctx.filter = "invert(1)";
                ctx.drawImage(plot, 0, 0);
            };
        var width = opts.width || plotlyElement._fullLayout.width;
        var height = opts.height || plotlyElement._fullLayout.height;
        var layout = Object.assign({}, plotlyElement.layout, {
            paper_bgcolor: background,
            plot_bgcolor: background,
            width: width,
            height: height
        });
        if ($offscreenElem === null) {
            $offscreenElem = document.createElement("div");
            $offscreenElem.id = "plot_image_download_container";
            $offscreenElem.style.position = "fixed";
            $offscreenElem.style.left = "-99999px";
            document.body.appendChild($offscreenElem);
            $canvas = document.createElement("canvas");
            // document.body.appendChild($canvas);
        }
        plotly_js__WEBPACK_IMPORTED_MODULE_0__["newPlot"]($offscreenElem, plotlyElement.data, layout, plotlyElement.config).then(function () {
            var svg = plotly_js__WEBPACK_IMPORTED_MODULE_0__["Snapshot"].toSVG($offscreenElem, "svg", scale);
            // fixes the lines becoming thin
            svg = svg.replace(VECTOR_EFFECT_REGEX, "");
            var img = new window.Image();
            img.onload = function () {
                compose($canvas, img, width * scale, height * scale);
                download($canvas, name + "." + format, format);
                plotly_js__WEBPACK_IMPORTED_MODULE_0__["purge"]($offscreenElem);
            };
            img.onerror = function (err) {
                // TODO better error handling, for now try to fallback to Plotly code
                plotly_js__WEBPACK_IMPORTED_MODULE_0__["downloadImage"]($offscreenElem, opts);
            };
            img.src = "data:image/svg+xml;base64," + btoa(svg);
        });
    };
})();


/***/ }),

/***/ "./src/frontend/index.ts":
/*!*******************************!*\
  !*** ./src/frontend/index.ts ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_features_object_values__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/features/object/values */ "./node_modules/core-js/features/object/values.js");
/* harmony import */ var core_js_features_object_values__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_features_object_values__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _case_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./case-map */ "./src/frontend/case-map.ts");
/* harmony import */ var _lines__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lines */ "./src/frontend/lines.ts");
/* harmony import */ var _consulting_alert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./consulting-alert */ "./src/frontend/consulting-alert.ts");






/***/ }),

/***/ "./src/frontend/lines.ts":
/*!*******************************!*\
  !*** ./src/frontend/lines.ts ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tz_lookup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tz_lookup */ "./src/frontend/tz_lookup.ts");
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! d3 */ "d3");
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(d3__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var plotly_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! plotly.js */ "plotly.js");
/* harmony import */ var plotly_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(plotly_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _string_score__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./string_score */ "./src/frontend/string_score.ts");
/* harmony import */ var _custom_plotly_image_saver__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./custom-plotly-image-saver */ "./src/frontend/custom-plotly-image-saver.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};





var GLEAMVIZ_TRACE_SCALE = 1000; // it gives infections per 1000
var CRITICAL_CARE_RATE = 0.05; // rate of cases requiring critical care
var SELECTION_PARAM = "selection";
var MITIGATION_PARAM = "mitigation";
var CHANNEL_PARAM = "channel";
var REGION_FALLBACK = "united kingdom";
var MAX_CHART_WIDTH_RATIO = 2;
var MAX_CHART_HEIGHT_RATIO = 1;
var MIN_CHART_SIZE = 500;
function controlModelVisualization($container) {
    function getUrlParams() {
        var urlString = window.location.href;
        var url = new URL(urlString);
        return {
            region: url.searchParams.get(SELECTION_PARAM) ||
                Object(_tz_lookup__WEBPACK_IMPORTED_MODULE_0__["guessRegion"])({ fallback: REGION_FALLBACK }),
            channel: url.searchParams.get(CHANNEL_PARAM) || "main",
            mitigation: url.searchParams.get(MITIGATION_PARAM) || "none"
        };
    }
    var baseData;
    var selected = getUrlParams();
    function getMitigationId() {
        var mitigationIds = {
            none: "None",
            weak: "Low",
            moderate: "Medium",
            strong: "High"
        };
        return mitigationIds[selected.mitigation];
    }
    function updateInfectionTotals() {
        if (typeof baseData === "undefined")
            return;
        var _a = baseData.regions[selected.region], population = _a.population, data = _a.data;
        var dates = Object.keys(data.estimates.days);
        var maxDate = dates[0];
        dates.slice(1).forEach(function (date) {
            if (new Date(maxDate) < new Date(date)) {
                maxDate = date;
            }
        });
        var infections = data.estimates.days[maxDate];
        var formatDate = function (date) {
            var _a = date.split("-").map(function (n) { return parseInt(n); }), year = _a[0], month = _a[1], day = _a[2];
            var monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
            ];
            var monthString = monthNames[month - 1];
            return monthString + " " + day + ", " + year;
        };
        d3__WEBPACK_IMPORTED_MODULE_1__["select"]("#infections-date").html("" + formatDate(maxDate));
        d3__WEBPACK_IMPORTED_MODULE_1__["select"]("#infections-confirmed").html(formatAbsoluteInteger(infections["JH_Confirmed"] -
            infections["JH_Recovered"] -
            infections["JH_Deaths"]));
        d3__WEBPACK_IMPORTED_MODULE_1__["select"]("#infections-estimated").html(formatAbsoluteInteger(infections["FT_Infected"]));
        /* Temporarily swithed off - we do not have confidence intervals for non-FT estimates
        d3.select("#infections-estimated-ci").html(
          `${formatInfectionTotal(
            infections["FT_Infected_q05"]
          )} - ${formatInfectionTotal(infections["FT_Infected_q95"])}`
        );
        */
        d3__WEBPACK_IMPORTED_MODULE_1__["select"]("#infections-population").html(formatAbsoluteInteger(population));
    }
    function updateStatistics() {
        if (typeof baseData === "undefined")
            return;
        var _a = baseData.regions[selected.region], population = _a.population, data = _a.data;
        var mitigation = getMitigationId();
        var stats = data.mitigation_stats[mitigation];
        var total_infected = formatStatisticsLine(stats.TotalInfected_per1000_q05, stats.TotalInfected_per1000_q95, population);
        $("#total-infected").html(total_infected);
        var sim_infected = formatStatisticsLine(stats.MaxActiveInfected_per1000_q05, stats.MaxActiveInfected_per1000_q95, population);
        $("#sim-infected").html(sim_infected);
    }
    var formatBigInteger = d3__WEBPACK_IMPORTED_MODULE_1__["format"](".2s");
    var formatStatisticsLine = function (q05, q95, population) {
        var _q05 = formatBigInteger(q05 * (population / 1000));
        var _q95 = formatBigInteger(q95 * (population / 1000));
        var _q05_perc = formatPercentNumber(q05 / 1000);
        var _q95_perc = formatPercentNumber(q95 / 1000);
        return (formatRange(_q05, _q95) + " (" + formatRange(_q05_perc, _q95_perc) + ")");
    };
    var formatRange = function (lower, upper) {
        if (lower == upper) {
            return "~" + lower;
        }
        else {
            return lower + "-" + upper;
        }
    };
    var formatPercentNumber = d3__WEBPACK_IMPORTED_MODULE_1__["format"](".2p");
    var formatAbsoluteInteger = function (number) {
        if (typeof number !== "number" || isNaN(number)) {
            return "&mdash;";
        }
        number = Math.round(number);
        if (number < 10000 && number > -10000) {
            return String(number);
        }
        else {
            return number.toLocaleString();
        }
    };
    // graph layout
    var layout = __assign(__assign({}, calculateChartSize()), { 
        //margin: { t: 0 },
        margin: { r: 20 }, paper_bgcolor: "#222028", plot_bgcolor: "#222028", xaxis: {
            type: "date",
            /*  title: "Date",
            titlefont: {
              family: "DM Sans, sans-serif",
              size: 18,
              color: "white"
            }, */
            ticks: "outside",
            tickfont: {
                family: "DM Sans, sans-serif",
                size: 14,
                color: "white"
            },
            tick0: 0,
            dtick: 0.0,
            ticklen: 8,
            tickwidth: 1,
            tickcolor: "#fff",
            rangeselector: { visible: true }
        }, yaxis: {
            title: "Active infections (% of population)",
            titlefont: {
                family: "DM Sans, sans-serif",
                size: 16,
                color: "white"
            },
            tickfont: {
                family: "DM Sans, sans-serif",
                size: 14,
                color: "white"
            },
            ticks: "outside",
            tick0: 0,
            dtick: 0.0,
            ticklen: 8,
            tickwidth: 1,
            tickformat: ".1%",
            tickcolor: "#fff",
            showline: true,
            linecolor: "#fff",
            linewidth: 1,
            showgrid: false,
            zeroline: true,
            zerolinecolor: "#fff",
            zerolinewidth: 1,
            // this way the axis does not change width on data load
            range: [0, 0.099]
        }, showlegend: true, legend: {
            x: 1,
            xanchor: "right",
            y: 1,
            yanchor: "top",
            bgcolor: "#22202888",
            font: {
                color: "#fff"
            }
        } });
    var DOWNLOAD_PLOT_SCALE = 2;
    var getDownloadPlotTitle = function () {
        var regions = baseData.regions;
        if (!(selected.region in regions)) {
            return "COVID-19 Forecast";
        }
        return "COVID-19 Forecast for " + regions[selected.region].name;
    };
    var customToImage = {
        name: "Download plot",
        title: "",
        icon: plotly_js__WEBPACK_IMPORTED_MODULE_2__["Icons"].camera,
        click: function (gd) {
            return Object(_custom_plotly_image_saver__WEBPACK_IMPORTED_MODULE_4__["saveImage"])(gd, {
                name: selected.region,
                scale: DOWNLOAD_PLOT_SCALE,
                width: 800,
                height: 600,
                format: "png",
                background: "black",
                compose: function ($canvas, plot, width, height) {
                    $canvas.width = width;
                    $canvas.height = height;
                    var ctx = $canvas.getContext("2d");
                    ctx.filter = "invert(1)";
                    ctx.drawImage(plot, 0, 0);
                    var LINE_SPACING = 0.15;
                    var y = 0;
                    function drawCenteredText(text, size) {
                        y += (1 + LINE_SPACING) * size;
                        ctx.font = Math.round(size) + "px \"DM Sans\"";
                        var x = (width - ctx.measureText(text).width) / 2;
                        ctx.fillText(text, x, y);
                        y += LINE_SPACING * size;
                    }
                    ctx.fillStyle = "white";
                    drawCenteredText(getDownloadPlotTitle(), 20 * DOWNLOAD_PLOT_SCALE);
                    ctx.fillStyle = "light gray";
                    drawCenteredText("by epidemicforecasting.org", 12 * DOWNLOAD_PLOT_SCALE);
                }
            });
        }
    };
    var plotlyConfig = {
        displaylogo: false,
        responsive: false,
        scrollZoom: false,
        modeBarButtonsToAdd: [customToImage],
        modeBarButtonsToRemove: ["toImage"]
    };
    function calculateChartSize() {
        var idealWidth = $container.clientWidth;
        var idealHeight = window.innerHeight * 0.7;
        var maxWidth = idealHeight * MAX_CHART_WIDTH_RATIO;
        var maxHeight = idealWidth * MAX_CHART_HEIGHT_RATIO;
        return {
            width: Math.max(Math.min(idealWidth, maxWidth), MIN_CHART_SIZE),
            height: Math.max(Math.min(idealHeight, maxHeight), MIN_CHART_SIZE)
        };
    }
    function makePlotlyResponsive() {
        d3__WEBPACK_IMPORTED_MODULE_1__["select"](".js-plotly-plot .plotly .svg-container")
            .attr("style", null);
        d3__WEBPACK_IMPORTED_MODULE_1__["selectAll"](".js-plotly-plot .plotly .main-svg")
            .attr("height", null)
            .attr("width", null)
            .attr("viewBox", "0 0 " + layout.width + " " + layout.height);
    }
    function renderChart(traces) {
        if (traces === void 0) { traces = []; }
        plotly_js__WEBPACK_IMPORTED_MODULE_2__["react"]($container, traces, layout, plotlyConfig)
            .then(makePlotlyResponsive);
    }
    renderChart();
    // `on` is not part of the HTMLElement interface, but Plotly adds it
    // @ts-ignore
    $container.on('plotly_restyle', makePlotlyResponsive);
    // @ts-ignore
    $container.on('plotly_relayout', makePlotlyResponsive);
    window.addEventListener('resize', function () {
        var size = calculateChartSize();
        if (size.width !== layout.width || size.height !== layout.height) {
            Object.assign(layout, size);
            plotly_js__WEBPACK_IMPORTED_MODULE_2__["relayout"]($container, size);
        }
    });
    // Checks if the max and traces have been loaded and preprocessed for the given region;
    // if not, loads them and does preprocessing; then caches it in the region object.
    // Finally calls thenTracesMax(mitigationTraces, max_Y_val).
    function loadGleamvizTraces(regionRec, thenTracesMax) {
        if (typeof regionRec.cached_gleam_traces !== "undefined") {
            thenTracesMax(regionRec.cached_gleam_traces, regionRec.cached_gleam_max_y);
        }
        // Not cached, load and preprocess
        var tracesUrl = regionRec.data.infected_per_1000.traces_url;
        d3__WEBPACK_IMPORTED_MODULE_1__["json"]("https://storage.googleapis.com/static-covid/static/" + tracesUrl).then(function (mitigationsData) {
            // TODO error handling
            var highestVals = [];
            // Iterate over mitigations (groups)
            Object.values(mitigationsData).forEach(function (mitigationTraces) {
                // Iterate over Plotly traces in groups
                Object.values(mitigationTraces).forEach(function (trace) {
                    trace.text = [];
                    // Scale all trace Ys to percent
                    Object.keys(trace.y).forEach(function (i) {
                        trace.y[i] = trace.y[i] / GLEAMVIZ_TRACE_SCALE;
                        var number = Math.round(trace.y[i] * regionRec.population);
                        // we want to show SI number, but it has to be integer
                        var precision = 3;
                        if (number < Math.pow(10, precision)) {
                            // for small numbers just use the decimal formatting
                            trace.text.push(d3__WEBPACK_IMPORTED_MODULE_1__["format"]("d")(number));
                        }
                        else {
                            // otherwise use the SI formatting
                            trace.text.push(d3__WEBPACK_IMPORTED_MODULE_1__["format"]("." + precision + "s")(number));
                        }
                    });
                    highestVals.push(Math.max.apply(Math, trace.y));
                    // When x has length 1, extend it to a day sequence of len(y) days
                    if (trace.x.length === 1) {
                        var xStart = new Date(trace.x[0]);
                        trace.x[0] = xStart;
                        for (var i = 1; i < trace.y.length; ++i) {
                            trace.x[i] = d3__WEBPACK_IMPORTED_MODULE_1__["timeDay"].offset(xStart, i);
                        }
                    }
                    if (trace["hoverinfo"] !== "skip") {
                        trace["hoverlabel"] = { namelength: -1 };
                        trace["hovertemplate"] = "%{text}<br />%{y:.2%}";
                    }
                });
            });
            var maxY = Math.max.apply(Math, highestVals);
            // Cache the values in the region
            regionRec.cached_gleam_traces = mitigationsData;
            regionRec.cached_gleam_max_y = maxY;
            // Callback
            thenTracesMax(mitigationsData, maxY);
        });
    }
    $("#mitigation input[type=radio]").each(function (_index, elem) {
        if (elem.value === selected.mitigation) {
            elem.checked = true;
        }
        elem.addEventListener("click", function () {
            selected.mitigation = elem.value;
            updatePlot();
        });
    });
    // update the graph
    function updatePlot() {
        var mitigationId = getMitigationId();
        // update the name of the region in the text below the graph
        updateRegionInText(selected.region);
        // update the summary statistics per selected mitigation strength
        updateStatistics();
        // Load and preprocess the per-region graph data
        loadGleamvizTraces(baseData.regions[selected.region], function (mitigTraces, maxVal) {
            layout.yaxis.range = [0, maxVal];
            AddCriticalCareTrace(mitigTraces[mitigationId]);
            // redraw the lines on the graph
            renderChart(mitigTraces[mitigationId]);
        });
    }
    function AddCriticalCareTrace(traces) {
        var line_title = "Hospital critical care capacity (approximate)";
        var lastTrace = traces[traces.length - 1];
        if (lastTrace && lastTrace.name === line_title)
            return;
    }
    function updateRegionInText(region) {
        var countryName = regionDict[region].name;
        jQuery(".selected-region").html(countryName);
    }
    function setGetParamUrl(key, value) {
        var params = new URLSearchParams(window.location.search);
        params.set(key, value);
        var url = window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?" +
            params.toString();
        return url;
    }
    function getRegionUrl(region) {
        return setGetParamUrl(SELECTION_PARAM, region);
    }
    var $regionList = document.getElementById("regionList");
    var $regionDropdownLabel = document.getElementById("regionDropdownLabel");
    var $regionFilter = document.getElementById("regionFilter");
    var $regionDropdown = document.getElementById("regionDropdown");
    // contains all the regions for the purpose of the dropdown menu
    var regionList = [];
    var regionDict = {};
    // the offset in the regionList of the currently focused region
    var focusedRegionIdx = 0;
    var filterQuery = "";
    // listen for dropdown trigger
    jQuery($regionDropdown).on("show.bs.dropdown", function () {
        // clear the fitler value
        $regionFilter.value = "";
        $($regionList).css("max-height", $(window).height() * 0.5);
    });
    jQuery($regionDropdown).on("shown.bs.dropdown", function () {
        if (filterQuery !== "") {
            filterQuery = "";
            reorderDropdown();
        }
        // and focus the filter field
        $regionFilter.focus();
    });
    // make the dropdown entry
    function addRegionDropdown(region_key, name) {
        var link = document.createElement("a");
        link.innerHTML = name;
        link.href = getRegionUrl(region_key);
        link.addEventListener("click", function (evt) {
            evt.preventDefault();
            // change the region
            changeRegion(region_key, true);
        });
        var item = { key: region_key, name: name, dropdownEntry: link };
        // add it to the dict and list
        regionDict[region_key] = item;
        regionList.push(item);
    }
    // the dropdown items are restorted depending on a search query
    function reorderDropdown() {
        // we score each region item with how good the region name matches the query
        regionList.forEach(function (region) {
            region.score = Object(_string_score__WEBPACK_IMPORTED_MODULE_3__["string_score"])(region.name, filterQuery);
        });
        // then we sort the list
        regionList.sort(function (a, b) {
            // first by score
            if (a.score < b.score) {
                return 1;
            }
            if (a.score > b.score) {
                return -1;
            }
            // then alphabetically
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0;
        });
        var bestScore = regionList[0].score;
        for (var i = 0; i < regionList.length; i++) {
            var _a = regionList[i], score = _a.score, dropdownEntry = _a.dropdownEntry;
            // re-add the entry, this sorts the dom elements
            $regionList.appendChild(dropdownEntry);
            // if we have good matches we only want to show those
            if (score < bestScore / 1000) {
                // correct the focus offset so it does not so something silly
                if (focusedRegionIdx >= i) {
                    focusedRegionIdx = i - 1;
                }
                $regionList.removeChild(dropdownEntry);
                continue;
            }
        }
    }
    // update the look of the of the dropdown entries
    function restyleDropdownElements() {
        regionList.forEach(function (_a, index) {
            var key = _a.key, dropdownEntry = _a.dropdownEntry;
            var className = "dropdown-item";
            // TODO maybe differentiate visually between 'current' and 'focused'
            if (key === selected.region) {
                className += " active";
            }
            if (index === focusedRegionIdx) {
                className += " active";
                // TODO something like this:
                // dropdownEntry.scrollIntoView(false);
            }
            dropdownEntry.className = className;
        });
    }
    $regionFilter.addEventListener("keyup", function () {
        if (filterQuery === $regionFilter.value) {
            // dont do anything if the query didnt change
            return;
        }
        filterQuery = $regionFilter.value;
        if (filterQuery !== "") {
            // focus the first element in the list
            focusedRegionIdx = 0;
        }
        reorderDropdown();
        restyleDropdownElements();
    });
    // listen on regionFilter events
    $regionFilter.addEventListener("keydown", function (evt) {
        // on enter we select the currently highlighted entry
        if (evt.key === "Enter") {
            changeRegion(regionList[focusedRegionIdx].key, true);
            $($regionDropdown).dropdown("toggle");
        }
        else if (evt.key === "ArrowUp") {
            focusedRegionIdx = Math.max(focusedRegionIdx - 1, 0);
            restyleDropdownElements();
        }
        else if (evt.key === "ArrowDown") {
            focusedRegionIdx = Math.min(focusedRegionIdx + 1, regionList.length - 1);
            restyleDropdownElements();
        }
    });
    // populate the region dropdown label
    // FIXME: this is kind of a hack and only looks nonsilly because the label is allcapsed
    $regionDropdownLabel.innerHTML = selected.region;
    // change the displayed region
    function changeRegion(newRegion, pushState) {
        if (!(newRegion in baseData.regions)) {
            newRegion = REGION_FALLBACK;
            pushState = false;
        }
        // update the global state
        selected.region = newRegion;
        // change url
        if (history.pushState && pushState) {
            var path = getRegionUrl(newRegion);
            window.history.pushState({ path: path }, "", path);
        }
        // set the main label
        $regionDropdownLabel.innerHTML = regionDict[selected.region].name;
        // update the graph
        restyleDropdownElements();
        updatePlot();
        updateInfectionTotals();
    }
    // Load the basic data (estimates and graph URLs) for all generated countries
    Promise.all([
        "data-" + selected.channel + "-v3.json",
    ].map(function (path) {
        return d3__WEBPACK_IMPORTED_MODULE_1__["json"]("https://storage.googleapis.com/static-covid/static/" + path);
    })).then(function (data) {
        baseData = data[0];
        // populate the dropdown menu with countries from received data
        var listOfRegions = Object.keys(baseData.regions);
        listOfRegions.forEach(function (key) {
            return addRegionDropdown(key, baseData.regions[key].name);
        });
        reorderDropdown();
        restyleDropdownElements();
        // initialize the graph
        changeRegion(selected.region, false);
        // initialize the select picker
        $('[data-toggle="tooltip"]').tooltip();
    });
}
var $container = document.getElementById("my_dataviz");
if ($container) {
    controlModelVisualization($container);
}


/***/ }),

/***/ "./src/frontend/string_score.ts":
/*!**************************************!*\
  !*** ./src/frontend/string_score.ts ***!
  \**************************************/
/*! exports provided: string_score */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "string_score", function() { return string_score; });
/*!
 * string_score.js: String Scoring Algorithm 0.1.22
 *
 * http://joshaven.com/string_score
 * https://github.com/joshaven/string_score
 *
 * Free to use, modify, etc... see attached license for more info
 * Copyright (C) 2009-2015 Joshaven Potter <yourtech@gmail.com>
 * MIT License: http://opensource.org/licenses/MIT
 * Special thanks to all of the contributors listed here https://github.com/joshaven/string_score
 *
 * Updated: Tue Mar 10 2015
 */
/*jslint nomen:true, white:true, browser:true,devel:true */
/**
 * Scores a string against another string.
 *    string_score('Hello World', 'he');       //=> 0.5931818181818181
 *    string_score('Hello World', 'Hello');    //=> 0.7318181818181818
 */
function string_score(string, word, fuzziness) {
    // If the string is equal to the word, perfect match.
    if (string === word) {
        return 1;
    }
    //if it's not a perfect match and is empty return 0
    if (word === "") {
        return 0;
    }
    var runningScore = 0, charScore, finalScore, lString = string.toLowerCase(), strLength = string.length, lWord = word.toLowerCase(), wordLength = word.length, idxOf, startAt = 0, fuzzies = 1, fuzzyFactor, i;
    // Cache fuzzyFactor for speed increase
    if (fuzziness) {
        fuzzyFactor = 1 - fuzziness;
    }
    // Walk through word and add up scores.
    // Code duplication occurs to prevent checking fuzziness inside for loop
    if (fuzziness) {
        for (i = 0; i < wordLength; i += 1) {
            // Find next first case-insensitive match of a character.
            idxOf = lString.indexOf(lWord[i], startAt);
            if (idxOf === -1) {
                fuzzies += fuzzyFactor;
            }
            else {
                if (startAt === idxOf) {
                    // Consecutive letter & start-of-string Bonus
                    charScore = 0.7;
                }
                else {
                    charScore = 0.1;
                    // Acronym Bonus
                    // Weighing Logic: Typing the first character of an acronym is as if you
                    // preceded it with two perfect character matches.
                    if (string[idxOf - 1] === " ") {
                        charScore += 0.8;
                    }
                }
                // Same case bonus.
                if (string[idxOf] === word[i]) {
                    charScore += 0.1;
                }
                // Update scores and startAt position for next round of indexOf
                runningScore += charScore;
                startAt = idxOf + 1;
            }
        }
    }
    else {
        for (i = 0; i < wordLength; i += 1) {
            idxOf = lString.indexOf(lWord[i], startAt);
            if (-1 === idxOf) {
                return 0;
            }
            if (startAt === idxOf) {
                charScore = 0.7;
            }
            else {
                charScore = 0.1;
                if (string[idxOf - 1] === " ") {
                    charScore += 0.8;
                }
            }
            if (string[idxOf] === word[i]) {
                charScore += 0.1;
            }
            runningScore += charScore;
            startAt = idxOf + 1;
        }
    }
    // Reduce penalty for longer strings.
    finalScore =
        (0.5 * (runningScore / strLength + runningScore / wordLength)) / fuzzies;
    if (lWord[0] === lString[0] && finalScore < 0.85) {
        finalScore += 0.15;
    }
    return finalScore;
}


/***/ }),

/***/ "./src/frontend/tz_lookup.ts":
/*!***********************************!*\
  !*** ./src/frontend/tz_lookup.ts ***!
  \***********************************/
/*! exports provided: guessRegion */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "guessRegion", function() { return guessRegion; });
function guessRegion(fallback) {
    var tzName;
    try {
        tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    catch (_a) {
        return fallback;
    }
    var tz = tzLookup[tzName];
    if (tz === undefined) {
        return fallback;
    }
    return tz.toLowerCase();
}
var tzLookup = {
    "Europe/Andorra": "Andorra",
    "Asia/Dubai": "United Arab Emirates",
    "Asia/Kabul": "Afghanistan",
    "America/Antigua": "Antigua and Barbuda",
    "America/Anguilla": "Anguilla",
    "Europe/Tirane": "Albania",
    "Asia/Yerevan": "Armenia",
    "Africa/Luanda": "Angola",
    "Antarctica/McMurdo": "Antarctica",
    "Antarctica/Casey": "Antarctica",
    "Antarctica/Davis": "Antarctica",
    "Antarctica/DumontDUrville": "Antarctica",
    "Antarctica/Mawson": "Antarctica",
    "Antarctica/Palmer": "Antarctica",
    "Antarctica/Rothera": "Antarctica",
    "Antarctica/Syowa": "Antarctica",
    "Antarctica/Troll": "Antarctica",
    "Antarctica/Vostok": "Antarctica",
    "America/Argentina/Buenos_Aires": "Argentina",
    "America/Argentina/Cordoba": "Argentina",
    "America/Argentina/Salta": "Argentina",
    "America/Argentina/Jujuy": "Argentina",
    "America/Argentina/Tucuman": "Argentina",
    "America/Argentina/Catamarca": "Argentina",
    "America/Argentina/La_Rioja": "Argentina",
    "America/Argentina/San_Juan": "Argentina",
    "America/Argentina/Mendoza": "Argentina",
    "America/Argentina/San_Luis": "Argentina",
    "America/Argentina/Rio_Gallegos": "Argentina",
    "America/Argentina/Ushuaia": "Argentina",
    "Pacific/Pago_Pago": "American Samoa",
    "Europe/Vienna": "Austria",
    "Australia/Lord_Howe": "Australia",
    "Antarctica/Macquarie": "Australia",
    "Australia/Hobart": "Australia",
    "Australia/Currie": "Australia",
    "Australia/Melbourne": "Australia",
    "Australia/Sydney": "Australia",
    "Australia/Broken_Hill": "Australia",
    "Australia/Brisbane": "Australia",
    "Australia/Lindeman": "Australia",
    "Australia/Adelaide": "Australia",
    "Australia/Darwin": "Australia",
    "Australia/Perth": "Australia",
    "Australia/Eucla": "Australia",
    "America/Aruba": "Aruba",
    "Europe/Mariehamn": "Åland Islands",
    "Asia/Baku": "Azerbaijan",
    "Europe/Sarajevo": "Bosnia and Herzegovina",
    "America/Barbados": "Barbados",
    "Asia/Dhaka": "Bangladesh",
    "Europe/Brussels": "Belgium",
    "Africa/Ouagadougou": "Burkina Faso",
    "Europe/Sofia": "Bulgaria",
    "Asia/Bahrain": "Bahrain",
    "Africa/Bujumbura": "Burundi",
    "Africa/Porto-Novo": "Benin",
    "America/St_Barthelemy": "Saint Barthélemy",
    "Atlantic/Bermuda": "Bermuda",
    "Asia/Brunei": "Brunei Darussalam",
    "America/La_Paz": "Bolivia (Plurinational State of)",
    "America/Kralendijk": "Bonaire, Sint Eustatius and Saba",
    "America/Noronha": "Brazil",
    "America/Belem": "Brazil",
    "America/Fortaleza": "Brazil",
    "America/Recife": "Brazil",
    "America/Araguaina": "Brazil",
    "America/Maceio": "Brazil",
    "America/Bahia": "Brazil",
    "America/Sao_Paulo": "Brazil",
    "America/Campo_Grande": "Brazil",
    "America/Cuiaba": "Brazil",
    "America/Santarem": "Brazil",
    "America/Porto_Velho": "Brazil",
    "America/Boa_Vista": "Brazil",
    "America/Manaus": "Brazil",
    "America/Eirunepe": "Brazil",
    "America/Rio_Branco": "Brazil",
    "America/Nassau": "Bahamas",
    "Asia/Thimphu": "Bhutan",
    "Africa/Gaborone": "Botswana",
    "Europe/Minsk": "Belarus",
    "America/Belize": "Belize",
    "America/St_Johns": "Canada",
    "America/Halifax": "Canada",
    "America/Glace_Bay": "Canada",
    "America/Moncton": "Canada",
    "America/Goose_Bay": "Canada",
    "America/Blanc-Sablon": "Canada",
    "America/Toronto": "Canada",
    "America/Nipigon": "Canada",
    "America/Thunder_Bay": "Canada",
    "America/Iqaluit": "Canada",
    "America/Pangnirtung": "Canada",
    "America/Atikokan": "Canada",
    "America/Winnipeg": "Canada",
    "America/Rainy_River": "Canada",
    "America/Resolute": "Canada",
    "America/Rankin_Inlet": "Canada",
    "America/Regina": "Canada",
    "America/Swift_Current": "Canada",
    "America/Edmonton": "Canada",
    "America/Cambridge_Bay": "Canada",
    "America/Yellowknife": "Canada",
    "America/Inuvik": "Canada",
    "America/Creston": "Canada",
    "America/Dawson_Creek": "Canada",
    "America/Fort_Nelson": "Canada",
    "America/Vancouver": "Canada",
    "America/Whitehorse": "Canada",
    "America/Dawson": "Canada",
    "Indian/Cocos": "Cocos (Keeling) Islands",
    "Africa/Kinshasa": "Congo, Democratic Republic of the",
    "Africa/Lubumbashi": "Congo, Democratic Republic of the",
    "Africa/Bangui": "Central African Republic",
    "Africa/Brazzaville": "Congo",
    "Europe/Zurich": "Switzerland",
    "Africa/Abidjan": "Côte d'Ivoire",
    "Pacific/Rarotonga": "Cook Islands",
    "America/Santiago": "Chile",
    "America/Punta_Arenas": "Chile",
    "Pacific/Easter": "Chile",
    "Africa/Douala": "Cameroon",
    "Asia/Shanghai": "China",
    "Asia/Urumqi": "China",
    "America/Bogota": "Colombia",
    "America/Costa_Rica": "Costa Rica",
    "America/Havana": "Cuba",
    "Atlantic/Cape_Verde": "Cabo Verde",
    "America/Curacao": "Curaçao",
    "Indian/Christmas": "Christmas Island",
    "Asia/Nicosia": "Cyprus",
    "Asia/Famagusta": "Cyprus",
    "Europe/Prague": "Czech Republic",
    "Europe/Berlin": "Germany",
    "Europe/Busingen": "Germany",
    "Africa/Djibouti": "Djibouti",
    "Europe/Copenhagen": "Denmark",
    "America/Dominica": "Dominica",
    "America/Santo_Domingo": "Dominican Republic",
    "Africa/Algiers": "Algeria",
    "America/Guayaquil": "Ecuador",
    "Pacific/Galapagos": "Ecuador",
    "Europe/Tallinn": "Estonia",
    "Africa/Cairo": "Egypt",
    "Africa/El_Aaiun": "Western Sahara",
    "Africa/Asmara": "Eritrea",
    "Europe/Madrid": "Spain",
    "Africa/Ceuta": "Spain",
    "Atlantic/Canary": "Spain",
    "Africa/Addis_Ababa": "Ethiopia",
    "Europe/Helsinki": "Finland",
    "Pacific/Fiji": "Fiji",
    "Atlantic/Stanley": "Falkland Islands (Malvinas)",
    "Pacific/Chuuk": "Micronesia (Federated States of)",
    "Pacific/Pohnpei": "Micronesia (Federated States of)",
    "Pacific/Kosrae": "Micronesia (Federated States of)",
    "Atlantic/Faroe": "Faroe Islands",
    "Europe/Paris": "France",
    "Africa/Libreville": "Gabon",
    "Europe/London": "United Kingdom of Great Britain and Northern Ireland",
    "America/Grenada": "Grenada",
    "Asia/Tbilisi": "Georgia",
    "America/Cayenne": "French Guiana",
    "Europe/Guernsey": "Guernsey",
    "Africa/Accra": "Ghana",
    "Europe/Gibraltar": "Gibraltar",
    "America/Godthab": "Greenland",
    "America/Danmarkshavn": "Greenland",
    "America/Scoresbysund": "Greenland",
    "America/Thule": "Greenland",
    "Africa/Banjul": "Gambia",
    "Africa/Conakry": "Guinea",
    "America/Guadeloupe": "Guadeloupe",
    "Africa/Malabo": "Equatorial Guinea",
    "Europe/Athens": "Greece",
    "Atlantic/South_Georgia": "South Georgia and the South Sandwich Islands",
    "America/Guatemala": "Guatemala",
    "Pacific/Guam": "Guam",
    "Africa/Bissau": "Guinea-Bissau",
    "America/Guyana": "Guyana",
    "Asia/Hong_Kong": "Hong Kong",
    "America/Tegucigalpa": "Honduras",
    "Europe/Zagreb": "Croatia",
    "America/Port-au-Prince": "Haiti",
    "Europe/Budapest": "Hungary",
    "Asia/Jakarta": "Indonesia",
    "Asia/Pontianak": "Indonesia",
    "Asia/Makassar": "Indonesia",
    "Asia/Jayapura": "Indonesia",
    "Europe/Dublin": "Ireland",
    "Asia/Jerusalem": "Israel",
    "Europe/Isle_of_Man": "Isle of Man",
    "Asia/Kolkata": "India",
    "Indian/Chagos": "British Indian Ocean Territory",
    "Asia/Baghdad": "Iraq",
    "Asia/Tehran": "Iran (Islamic Republic of)",
    "Atlantic/Reykjavik": "Iceland",
    "Europe/Rome": "Italy",
    "Europe/Jersey": "Jersey",
    "America/Jamaica": "Jamaica",
    "Asia/Amman": "Jordan",
    "Asia/Tokyo": "Japan",
    "Africa/Nairobi": "Kenya",
    "Asia/Bishkek": "Kyrgyzstan",
    "Asia/Phnom_Penh": "Cambodia",
    "Pacific/Tarawa": "Kiribati",
    "Pacific/Enderbury": "Kiribati",
    "Pacific/Kiritimati": "Kiribati",
    "Indian/Comoro": "Comoros",
    "America/St_Kitts": "Saint Kitts and Nevis",
    "Asia/Pyongyang": "Korea (Democratic People's Republic of)",
    "Asia/Seoul": "Korea, Republic of",
    "Asia/Kuwait": "Kuwait",
    "America/Cayman": "Cayman Islands",
    "Asia/Almaty": "Kazakhstan",
    "Asia/Qyzylorda": "Kazakhstan",
    "Asia/Qostanay": "Kazakhstan",
    "Asia/Aqtobe": "Kazakhstan",
    "Asia/Aqtau": "Kazakhstan",
    "Asia/Atyrau": "Kazakhstan",
    "Asia/Oral": "Kazakhstan",
    "Asia/Vientiane": "Lao People's Democratic Republic",
    "Asia/Beirut": "Lebanon",
    "America/St_Lucia": "Saint Lucia",
    "Europe/Vaduz": "Liechtenstein",
    "Asia/Colombo": "Sri Lanka",
    "Africa/Monrovia": "Liberia",
    "Africa/Maseru": "Lesotho",
    "Europe/Vilnius": "Lithuania",
    "Europe/Luxembourg": "Luxembourg",
    "Europe/Riga": "Latvia",
    "Africa/Tripoli": "Libya",
    "Africa/Casablanca": "Morocco",
    "Europe/Monaco": "Monaco",
    "Europe/Chisinau": "Moldova, Republic of",
    "Europe/Podgorica": "Montenegro",
    "America/Marigot": "Saint Martin (French part)",
    "Indian/Antananarivo": "Madagascar",
    "Pacific/Majuro": "Marshall Islands",
    "Pacific/Kwajalein": "Marshall Islands",
    "Europe/Skopje": "North Macedonia",
    "Africa/Bamako": "Mali",
    "Asia/Yangon": "Myanmar",
    "Asia/Ulaanbaatar": "Mongolia",
    "Asia/Hovd": "Mongolia",
    "Asia/Choibalsan": "Mongolia",
    "Asia/Macau": "Macao",
    "Pacific/Saipan": "Northern Mariana Islands",
    "America/Martinique": "Martinique",
    "Africa/Nouakchott": "Mauritania",
    "America/Montserrat": "Montserrat",
    "Europe/Malta": "Malta",
    "Indian/Mauritius": "Mauritius",
    "Indian/Maldives": "Maldives",
    "Africa/Blantyre": "Malawi",
    "America/Mexico_City": "Mexico",
    "America/Cancun": "Mexico",
    "America/Merida": "Mexico",
    "America/Monterrey": "Mexico",
    "America/Matamoros": "Mexico",
    "America/Mazatlan": "Mexico",
    "America/Chihuahua": "Mexico",
    "America/Ojinaga": "Mexico",
    "America/Hermosillo": "Mexico",
    "America/Tijuana": "Mexico",
    "America/Bahia_Banderas": "Mexico",
    "Asia/Kuala_Lumpur": "Malaysia",
    "Asia/Kuching": "Malaysia",
    "Africa/Maputo": "Mozambique",
    "Africa/Windhoek": "Namibia",
    "Pacific/Noumea": "New Caledonia",
    "Africa/Niamey": "Niger",
    "Pacific/Norfolk": "Norfolk Island",
    "Africa/Lagos": "Nigeria",
    "America/Managua": "Nicaragua",
    "Europe/Amsterdam": "Netherlands",
    "Europe/Oslo": "Norway",
    "Asia/Kathmandu": "Nepal",
    "Pacific/Nauru": "Nauru",
    "Pacific/Niue": "Niue",
    "Pacific/Auckland": "New Zealand",
    "Pacific/Chatham": "New Zealand",
    "Asia/Muscat": "Oman",
    "America/Panama": "Panama",
    "America/Lima": "Peru",
    "Pacific/Tahiti": "French Polynesia",
    "Pacific/Marquesas": "French Polynesia",
    "Pacific/Gambier": "French Polynesia",
    "Pacific/Port_Moresby": "Papua New Guinea",
    "Pacific/Bougainville": "Papua New Guinea",
    "Asia/Manila": "Philippines",
    "Asia/Karachi": "Pakistan",
    "Europe/Warsaw": "Poland",
    "America/Miquelon": "Saint Pierre and Miquelon",
    "Pacific/Pitcairn": "Pitcairn",
    "America/Puerto_Rico": "Puerto Rico",
    "Asia/Gaza": "Palestine, State of",
    "Asia/Hebron": "Palestine, State of",
    "Europe/Lisbon": "Portugal",
    "Atlantic/Madeira": "Portugal",
    "Atlantic/Azores": "Portugal",
    "Pacific/Palau": "Palau",
    "America/Asuncion": "Paraguay",
    "Asia/Qatar": "Qatar",
    "Indian/Reunion": "Réunion",
    "Europe/Bucharest": "Romania",
    "Europe/Belgrade": "Serbia",
    "Europe/Kaliningrad": "Russian Federation",
    "Europe/Moscow": "Russian Federation",
    "Europe/Simferopol": "Ukraine",
    "Europe/Kirov": "Russian Federation",
    "Europe/Astrakhan": "Russian Federation",
    "Europe/Volgograd": "Russian Federation",
    "Europe/Saratov": "Russian Federation",
    "Europe/Ulyanovsk": "Russian Federation",
    "Europe/Samara": "Russian Federation",
    "Asia/Yekaterinburg": "Russian Federation",
    "Asia/Omsk": "Russian Federation",
    "Asia/Novosibirsk": "Russian Federation",
    "Asia/Barnaul": "Russian Federation",
    "Asia/Tomsk": "Russian Federation",
    "Asia/Novokuznetsk": "Russian Federation",
    "Asia/Krasnoyarsk": "Russian Federation",
    "Asia/Irkutsk": "Russian Federation",
    "Asia/Chita": "Russian Federation",
    "Asia/Yakutsk": "Russian Federation",
    "Asia/Khandyga": "Russian Federation",
    "Asia/Vladivostok": "Russian Federation",
    "Asia/Ust-Nera": "Russian Federation",
    "Asia/Magadan": "Russian Federation",
    "Asia/Sakhalin": "Russian Federation",
    "Asia/Srednekolymsk": "Russian Federation",
    "Asia/Kamchatka": "Russian Federation",
    "Asia/Anadyr": "Russian Federation",
    "Africa/Kigali": "Rwanda",
    "Asia/Riyadh": "Saudi Arabia",
    "Pacific/Guadalcanal": "Solomon Islands",
    "Indian/Mahe": "Seychelles",
    "Africa/Khartoum": "Sudan",
    "Europe/Stockholm": "Sweden",
    "Asia/Singapore": "Singapore",
    "Atlantic/St_Helena": "Saint Helena, Ascension and Tristan da Cunha",
    "Europe/Ljubljana": "Slovenia",
    "Arctic/Longyearbyen": "Svalbard and Jan Mayen",
    "Europe/Bratislava": "Slovakia",
    "Africa/Freetown": "Sierra Leone",
    "Europe/San_Marino": "San Marino",
    "Africa/Dakar": "Senegal",
    "Africa/Mogadishu": "Somalia",
    "America/Paramaribo": "Suriname",
    "Africa/Juba": "South Sudan",
    "Africa/Sao_Tome": "Sao Tome and Principe",
    "America/El_Salvador": "El Salvador",
    "America/Lower_Princes": "Sint Maarten (Dutch part)",
    "Asia/Damascus": "Syrian Arab Republic",
    "Africa/Mbabane": "Eswatini",
    "America/Grand_Turk": "Turks and Caicos Islands",
    "Africa/Ndjamena": "Chad",
    "Indian/Kerguelen": "French Southern Territories",
    "Africa/Lome": "Togo",
    "Asia/Bangkok": "Thailand",
    "Asia/Dushanbe": "Tajikistan",
    "Pacific/Fakaofo": "Tokelau",
    "Asia/Dili": "Timor-Leste",
    "Asia/Ashgabat": "Turkmenistan",
    "Africa/Tunis": "Tunisia",
    "Pacific/Tongatapu": "Tonga",
    "Europe/Istanbul": "Turkey",
    "America/Port_of_Spain": "Trinidad and Tobago",
    "Pacific/Funafuti": "Tuvalu",
    "Asia/Taipei": "Taiwan, Province of China",
    "Africa/Dar_es_Salaam": "Tanzania, United Republic of",
    "Europe/Kiev": "Ukraine",
    "Europe/Uzhgorod": "Ukraine",
    "Europe/Zaporozhye": "Ukraine",
    "Africa/Kampala": "Uganda",
    "Pacific/Midway": "United States Minor Outlying Islands",
    "Pacific/Wake": "United States Minor Outlying Islands",
    "America/New_York": "United States",
    "America/Detroit": "United States",
    "America/Kentucky/Louisville": "United States",
    "America/Kentucky/Monticello": "United States",
    "America/Indiana/Indianapolis": "United States",
    "America/Indiana/Vincennes": "United States",
    "America/Indiana/Winamac": "United States",
    "America/Indiana/Marengo": "United States",
    "America/Indiana/Petersburg": "United States",
    "America/Indiana/Vevay": "United States",
    "America/Chicago": "United States",
    "America/Indiana/Tell_City": "United States",
    "America/Indiana/Knox": "United States",
    "America/Menominee": "United States",
    "America/North_Dakota/Center": "United States",
    "America/North_Dakota/New_Salem": "United States",
    "America/North_Dakota/Beulah": "United States",
    "America/Denver": "United States",
    "America/Boise": "United States",
    "America/Phoenix": "United States",
    "America/Los_Angeles": "United States",
    "America/Anchorage": "United States",
    "America/Juneau": "United States",
    "America/Sitka": "United States",
    "America/Metlakatla": "United States",
    "America/Yakutat": "United States",
    "America/Nome": "United States",
    "America/Adak": "United States",
    "Pacific/Honolulu": "United States",
    "America/Montevideo": "Uruguay",
    "Asia/Samarkand": "Uzbekistan",
    "Asia/Tashkent": "Uzbekistan",
    "Europe/Vatican": "Holy See",
    "America/St_Vincent": "Saint Vincent and the Grenadines",
    "America/Caracas": "Venezuela (Bolivarian Republic of)",
    "America/Tortola": "Virgin Islands (British)",
    "America/St_Thomas": "Virgin Islands (U.S.)",
    "Asia/Ho_Chi_Minh": "Viet Nam",
    "Pacific/Efate": "Vanuatu",
    "Pacific/Wallis": "Wallis and Futuna",
    "Pacific/Apia": "Samoa",
    "Asia/Aden": "Yemen",
    "Indian/Mayotte": "Mayotte",
    "Africa/Johannesburg": "South Africa",
    "Africa/Lusaka": "Zambia",
    "Africa/Harare": "Zimbabwe"
};


/***/ }),

/***/ "d3":
/*!*********************!*\
  !*** external "d3" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = d3;

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = moment;

/***/ }),

/***/ "plotly.js":
/*!*************************!*\
  !*** external "Plotly" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = Plotly;

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map