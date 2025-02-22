var utils = require('./utils');
var gets = require('./gets');

var input = '';
var stdin_flag = true;

var scanf = module.exports = function(format) {
  var re = new RegExp('[^%]*%[A-Za-z][^%]*', 'g');
  var selector = format.match(re);

  var result, len = selector.length;
  var json_flag = false,
    count = 0,
    keys = Array.prototype.slice.call(arguments, 1);

  if (!this.sscanf) {
    // clear sscanf cache
    if (!stdin_flag)
      input = '';
    stdin_flag = true;
  }

  if (keys.length > 0) {
    result = {};
    json_flag = true;
  } else if (len > 1) {
    result = [];
  } else {
    return dealType(selector[0]);
  }

  selector.forEach(function(val) {
    if (json_flag) {
      result[keys.shift() || count++] = dealType(val);
    } else {
      result.push(dealType(val));
    }
  });

  return result;
};

var sscanfcache={obj:null,index:0};
module.exports.sscanf = function(str, format) {
  if (str.constructor != String || !str.length) {
    return null;
  }

  // clear scanf cache
  if (stdin_flag) input = '';
	
	if (sscanfcache.obj==str)	
		input = str.substr(sscanfcache.index);		
	else{
		sscanfcache.obj=input = str;
		sscanfcache.index=0;
	}
  stdin_flag = false;

  var res=scanf.apply({ sscanf: true }, Array.prototype.slice.call(arguments, 1));
  sscanfcache.index=str.length-input.length;
  return res;
};

var getInput = function(pre, next, match, type) {
  var result;
  if (!input.length || input === '\r') {
    if (stdin_flag) {
      input = gets();
    } else {
      return null;
    }
  }

  // match format
  var replace = '(' + match + ')';
  var tmp = input;

  // while scan string, replace before and after
  if (type === 'STR' && next.trim().length > 0) {
    var before_macth = utils.regslashes(pre);
    var after_match = utils.regslashes(next) + '[\\w\\W]*';
    if (before_macth.length) {
      tmp = tmp.replace(new RegExp(before_macth), '');
    }
    tmp = tmp.replace(new RegExp(after_match), '');
  } else {
    replace = utils.regslashes(pre) + replace;
  }
  
  var m = tmp.match(new RegExp(replace));

  if (!m) {
    // todo strip match
    return null;
  }
  result = m[1];

  // strip match content
  input = input.substr(input.indexOf(result)).replace(result, '').replace(next, '');

  return result;
};

var getInteger = function(pre, next) {
  var text = getInput(pre, next, '[-]?[A-Za-z0-9]+');
  if (!text) {
    return null;
  } else if (text[0] == '0') {
    if (text[1] == 'x' || text[1] == 'X') {
      return utils.hex2int(text);
    } else {
      return utils.octal2int(text);
    }
  } else {
    return parseInt(text);
  }
};

var getFloat = function(pre, next) {
  var text = getInput(pre, next, '[-]?[0-9]+[\.]?[0-9]*');
  return parseFloat(text);
};

var getHex = function(pre, next) {
  var text = getInput(pre, next, '[A-Za-z0-9]+');
  return utils.hex2int(text);
};

var getOctal = function(pre, next) {
  var text = getInput(pre, next, '[A-Za-z0-9]+');
  return utils.octal2int(text);
};

var getString = function(pre, next) {
  var text = getInput(pre, next, '([\\w]|\\S[^\\][^\\ ])+(\\\\[\\w\\ ][\\w\\:]*)*', 'STR');
  if (/\\/.test(text))
    text = utils.stripslashes(text);
  return text;
};

var getLine = function(pre, next) {
  var text = getInput(pre, next, '[^\n\r]*');
  if (/\\/.test(text))
    text = utils.stripslashes(text);
  return text;
};

var dealType = function(format) {
  var ret;
  var res = format.match(/%[A-Za-z]/);
  var res2 = format.match(/[^%]*/);
  if (!res) {
    return null;
  }
  var type = res[0];
  var pre = !!res2 ? res2[0] : null;
  var next = format.substr(format.indexOf(type) + type.length);

  switch (type) {
    case '%d':
      ret = getInteger(pre, next);
      break;
    case '%s':
      ret = getString(pre, next);
      break;
    case '%S':
      ret = getLine(pre, next);
      break;
    case '%X':
    case '%x':
      ret = getHex(pre, next);
      break;
    case '%O':
    case '%o':
      ret = getOctal(pre, next);
      break;
    case '%f':
      ret = getFloat(pre, next);
      break;
  }
  return ret;
};
