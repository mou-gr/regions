(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsonParser = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var punycode = require('punycode');

function BackslashError(offset, err) {
  this.__proto__ = new Error(err);
  this.__proto__.name = 'BackslashError';
  this.offset = offset;
}

function isOctalDigit(c) {
  return c >= '0' && c <= '7';
}

function isHexDigit(c) {
  return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}

function parseHex(u) {
  u = parseInt(u, 16);
  // http://stackoverflow.com/a/9109467/510036
  return punycode.ucs2.encode([u]);
}

function process(arr, pos, stopChar) {
  var escaped = false;
  var ret = [];

  function assertHexDigit(pos) {
    var c = arr[pos];
    if (!isHexDigit(c)) {
      throw new BackslashError(pos, 'Unexpected token ILLEGAL');
    }
    return c;
  }

  while (pos < arr.length) {
    var c = arr[pos];
    pos++;
    if (escaped) {
      escaped = false;
      switch (c) {
        case 'n':
          ret.push('\n');
          continue;
        case 'r':
          ret.push('\r');
          continue;
        case 'f':
          ret.push('\f');
          continue;
        case 'b':
          ret.push('\b');
          continue;
        case 't':
          ret.push('\t');
          continue;
        case 'v':
          ret.push('\v');
          continue;
        case '\\':
          ret.push('\\') ;
          continue;
      }
      if (c === 'x') {
        ret.push(parseHex(assertHexDigit(pos) + assertHexDigit(pos + 1)));
        pos += 2;
        continue;
      }
      if (c === 'u') {
        ret.push(parseHex(assertHexDigit(pos) + assertHexDigit(pos + 1) + assertHexDigit(pos + 2) + assertHexDigit(pos + 3)));
        pos += 4;
        continue;
      }
      if (isOctalDigit(c)) {
        var o;
        if (isOctalDigit(o = arr[pos])) {
          pos++;
          c += o;
          if (isOctalDigit(o = arr[pos]) && (c[0] <= '3')) {
            pos++;
            c += o;
          }
        }
        ret.push(punycode.ucs2.encode([parseInt(c, 8)]));
        continue;
      }
      ret.push(c);
    } else if (c === '\\') {
      escaped = true;
    } else if (c === stopChar) {
      pos--;
      break;
    } else {
      ret.push(c);
    }
  }
  return arguments.length === 3 ? {end: pos, value: ret.join('')} : ret.join('');
}

module.exports = function backslash(str) {
  return process(str, 0);
};

module.exports.parseUntil = function parseUntil(str, pos, stopChar) {
  return process(str, pos, stopChar);
};

},{"punycode":3}],2:[function(require,module,exports){
var backslash = require('backslash');
module.exports = {
  validate: validate,
  parse: parse
};

/**
 * Validates a json string.
 * Errors are returned
 * @param jsonString
 * @param allowDuplicatedKeys
 * @returns {String} error. undefined if no error
 */
function validate(jsonString, allowDuplicatedKeys) {
  var error;
  allowDuplicatedKeys = allowDuplicatedKeys || false;
  if (typeof jsonString !== 'string') {
    error = 'Input must be a string';
  } else {
    try {
      // Try to find a value starting from index 0
      _findValue(jsonString, 0, allowDuplicatedKeys, false);
    } catch(e) {
      error = e.message;
    }
  }
  return error;
}

/**
 * Parses a json. Errors are thrown if any
 * @param jsonString
 * @param allowDuplicatedKeys
 * @returns {Object}
 */
function parse(jsonString, allowDuplicatedKeys) {
  if (typeof jsonString !== 'string') {
    throw new Error('Input must be a string');
  }

  allowDuplicatedKeys = allowDuplicatedKeys || false;

  // Try to find a value starting from index 0
  var value = _findValue(jsonString, 0, allowDuplicatedKeys, true);
  return value.value;
}

/**
 * Find the comma separator, ], } or end of file
 * @param {String} str - original json string
 * @param {Number} startInd - starting index
 * @returns {{start: Number, end: Number, value: String}} value: the separator found
 * @private
 */
function _findSeparator(str, startInd) {
  var len = str.length;
  var sepStartInd = startInd;
  var sepEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (ch === ',') {
      sepEndInd = i;
      break;
    } else if ( ch === ']' || ch === '}') {
      sepEndInd = i - 1;
      break;
    } else if (!_isWhiteSpace(ch)) {
      throw _syntaxError(str, i, 'expecting end of expression or separator');
    }
  }

  var value;
  if (sepEndInd === undefined) {
    sepEndInd = len;
    value = str[sepEndInd];
  } else {
    value = str[sepEndInd];
    sepEndInd++;
  }
  return {
    start: sepStartInd,
    end: sepEndInd,
    value: value
  };
}

/**
 * Find the semi-colon separator ':'
 * @param {String} str - original json string
 * @param {Number} startInd
 * @returns {{start: Number, end: Number}}
 * @private
 */
function _findSemiColonSeparator(str, startInd) {
  var len = str.length;
  var semiColStartInd = startInd;
  var semiColEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (ch === ':') {
      semiColEndInd = i;
      break;
    } else if (!_isWhiteSpace(ch)) {
      throw _syntaxError(str, i, 'expecting \':\'');
    }
  }
  if (semiColEndInd === undefined) {
    throw _syntaxError(str, i, 'expecting \':\'');
  }
  semiColEndInd++;
  return {
    start: semiColStartInd,
    end: semiColEndInd
  };
}

/**
 * Find a value it can be number, array, object, strings or boolean
 * @param {String} str - original json string
 * @param {Number} startInd
 * @param {Boolean} allowDuplicatedKeys - allow duplicated keys in objects or not
 * @returns {{value: *, start: Number, end: Number}}
 * @private
 */
function _findValue(str, startInd, allowDuplicatedKeys, parse) {
  var len = str.length;
  var valueStartInd;
  var valueEndInd;
  var isArray = false;
  var isObject = false;
  var isString = false;
  var isNumber = false;
  var dotFound = false;
  var whiteSpaceInNumber = false;
  var value;

  for (var i = startInd; i < len; i++) {

    var ch = str[i];
    if (valueStartInd === undefined) {
      if (!_isWhiteSpace(ch)) {
        if (ch === '[') {
          isArray = true;
        } else if (ch === '{') {
          isObject = true;
        } else if (ch === '"') {
          isString = true;
        } else if (_isTrueFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 3;
          valueEndInd = i;
          value = true;
          break;
        } else if (_isFalseFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 4;
          valueEndInd = i;
          value = false;
          break;
        } else if (_isNullFromIndex(str, i)) {
          valueStartInd = i;
          i = i + 3;
          valueEndInd = i;
          value = null;
          break;
        } else if (_isNumber(ch)) {
          isNumber = true;
        } else if (ch === '-') {
          isNumber = true;
        } else {
          throw _syntaxError(str, i, '');
        }
        valueStartInd = i;
      }
    } else {
      if (isArray) {
        var arr = _findArray(str, i, allowDuplicatedKeys, parse);
        valueEndInd = arr.end;
        value = arr.value;
        break;
      } else if (isObject) {
        var obj = _findObject(str, i, allowDuplicatedKeys, parse);
        valueEndInd = obj.end;
        value = obj.value;
        break;
      } else if (isString && ch === '"' && _hasEvenNumberOfBackSlash(str, i - 1)) {
        valueEndInd = i;
        value = backslash(str.substring(valueStartInd + 1, valueEndInd));
        break;
      } else if (isNumber) {
        if(_isWhiteSpace(ch)) {
          whiteSpaceInNumber = true;
        } else if (ch === ',' || ch === ']' || ch === '}') {
          value = parseFloat(str.substring(valueStartInd, valueEndInd), 10);
          valueEndInd = i - 1;
          break;
        } else if (_isNumber(ch) && !whiteSpaceInNumber) {
          continue;
        } else if (ch === '.' && !dotFound && !whiteSpaceInNumber) {
          dotFound = true;
        } else {
          throw _syntaxError(str, i, 'expecting number');
        }
      }
    }
  }

  if (valueEndInd === undefined) {
    if (isNumber) {
      value = parseFloat(str.substring(valueStartInd, i), 10);
      valueEndInd = i - 1;
    } else {
      throw _syntaxError(str, i, 'unclosed statement');
    }
  }
  valueEndInd++;
  return {
    value: value,
    start: valueStartInd,
    end: valueEndInd
  };
}

/**
 * Find a key in an object
 * @param {String} str - original json string
 * @param {Number} startInd
 * @returns {{start: Number, end: Number, value: String}}
 * @private
 */
function _findKey(str, startInd) {
  var len = str.length;
  var keyStartInd;
  var keyEndInd;
  for (var i = startInd; i < len; i++) {
    var ch = str[i];
    if (keyStartInd === undefined) {
      if (!_isWhiteSpace(ch)) {
        if (ch !== '"') {
          throw _syntaxError(str, i, 'expecting String');
        }
        keyStartInd = i;
      }
    } else {
      if (ch === '"' && _hasEvenNumberOfBackSlash(str, i - 1)) {
        keyEndInd = i;
        break;
      }
    }
  }

  if (keyEndInd === undefined) {
    throw _syntaxError(str, len, 'expecting String');
  }

  var value = backslash(str.substring(keyStartInd + 1, keyEndInd));
  if (value === '') {
    throw _syntaxError(str, keyStartInd, 'empty string');
  }
  keyEndInd++;
  return {
    start: keyStartInd,
    end: keyEndInd,
    value: value
  };
}

/**
 * Find an object by identifying the key, ':' separator and value
 * @param {String} str - original json string
 * @param {Number} startInd
 * @param {Boolean} allowDuplicatedKeys
 * @returns {{start: Number, end: Number, value: Object}}
 * @private
 */
function _findObject(str, startInd, allowDuplicatedKeys, parse) {
  var i = startInd;
  var sepValue = ',';
  var obj = {};
  var keys = [];
  var values = [];

  var j = startInd;
  while (_isWhiteSpace(str[j])) {
    j++;
  }

  if (str[j] === '}') {
    return {
      start: startInd,
      end: j,
      value: obj
    };
  }

  while (sepValue === ',') {
    var key = _findKey(str, i);
    var semi = _findSemiColonSeparator(str, key.end);
    var value = _findValue(str, semi.end, allowDuplicatedKeys, parse);
    var sepIndex = _findSeparator(str, value.end);

    if (!allowDuplicatedKeys) {
      if(keys.indexOf(key.value) !== -1) {
        throw _syntaxError(str, key.end, 'duplicated keys "' + key.value + '"');
      }
    }
    keys.push(key.value);
    values.push(value.value);
    i = sepIndex.end;
    sepValue = sepIndex.value;
  }

  if (parse) {
    var indx = 0;
    for(indx = 0; indx < keys.length; indx++) {
      obj[keys[indx]] = values[indx];
    }
  }

  return {
    start: startInd,
    end: i,
    value: obj
  };
}

/**
 * Going backward from an index, determine if there are even number
 * of consecutive backslashes in the string
 * @param {String} str - original json string
 * @param {Number} endInd
 * @returns {Boolean}
 * @private
 */
function _hasEvenNumberOfBackSlash(str, endInd) {
  var i = endInd;
  var count = 0;
  while(i > -1 && str[i] === '\\') {
    count++;
    i--;
  }
  return (count % 2) === 0;
}

/**
 * Find an array by identifying values separated by ',' separator
 * @param {String} str - original json string
 * @param {Number} startInd
 * @returns {{start: Number, end: Number, value: Array}}
 * @private
 */
function _findArray(str, startInd, allowDuplicatedKeys, parse) {
  var i = startInd;
  var sepValue = ',';
  var arr = [];

  var j = startInd;
  while (_isWhiteSpace(str[j])) {
    j++;
  }

  if (str[j] === ']') {
    return {
      start: startInd,
      end: j,
      value: arr
    };
  }

  while (sepValue === ',') {
    var value = _findValue(str, i, allowDuplicatedKeys, parse);
    var sepIndex = _findSeparator(str, value.end);

    if (parse) {
      arr.push(value.value);
    }
    i = sepIndex.end;
    sepValue = sepIndex.value;
  }
  return {
    start: startInd,
    end: i,
    value: arr
  };
}

/**
 * Determine if the string is 'true' from specified index
 * @param {String} str - original json string
 * @param {Number} ind
 * @returns {Boolean}
 * @private
 */
function _isTrueFromIndex(str, ind) {
  return (str.substr(ind, 4) === 'true');
}

/**
 * Determine if the string is 'false' from specified index
 * @param {String} str - original json string
 * @param {Number} ind
 * @returns {Boolean}
 * @private
 */
function _isFalseFromIndex(str, ind) {
  return (str.substr(ind, 5) === 'false');
}

/**
 * Determine if the string is 'null' from specified index
 * @param {String} str - original json string
 * @param {Number} ind
 * @returns {Boolean}
 * @private
 */
function _isNullFromIndex(str, ind) {
  return (str.substr(ind, 4) === 'null');
}

var white = new RegExp(/^\s$/);
/**
 * Determine if this character is a white space
 * @param {String} ch - single character string
 * @returns {Boolean}
 * @private
 */
function _isWhiteSpace(ch){
  return white.test(ch);
}

var numberReg = new RegExp(/^\d$/);
/**
 * Determine if this character is a numeric character
 * @param {String} ch - single character string
 * @returns {Boolean}
 * @private
 */
function _isNumber(ch) {
  return numberReg.test(ch);
}

/**
 * Generate syntax error
 * @param {String} str - original json string
 * @param {Number} index - index in which the error was detected
 * @param {String} reason
 * @returns {Error}
 * @private
 */
function _syntaxError(str, index, reason) {
  var regionLen = 10;

  var regionStr;
  if (str.length < index + regionLen) {
    regionStr = str.substr(_normalizeNegativeNumber(str.length - regionLen), str.length);
  } else if (index - (regionLen/2) < 0) {
    regionStr = str.substr(0, regionLen);
  } else {
    regionStr = str.substr(_normalizeNegativeNumber(index - (regionLen/2)), regionLen);
  }

  var message;
  if (reason) {
    message = 'Syntax error: ' + reason + ' near ' + regionStr;
  } else {
    message = 'Syntax error near ' + regionStr;
  }
  return new Error(message);
}

/**
 * Return 0 if number is negative, the original number otherwise
 * @param {Number} num
 * @returns {Number}
 * @private
 */
function _normalizeNegativeNumber(num) {
  return (num < 0) ? 0 : num;
}
},{"backslash":1}],3:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2])(2)
});
