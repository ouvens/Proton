/**
 * nodejs端web开发常见工具类
 */

'use strict';

const debug = require('./debug');

let emptyObject = {};
let noop = function() {};

let util = {
	time: emptyObject,
	session: emptyObject,
	cookie: emptyObject,
	html: emptyObject,
	string: emptyObject,
	debug: debug,
	array: emptyObject
}

/**
 * util.time.format('yyyy-mm-dd hh-ii-ss', +new Date());
 * @type {[type]}
 * 传入时间戳或时间字符串，获取时间格式含有各种方式，根据yy、mm、dd、hh、ii、ss来替换匹配
 */
util.time.format = format;

/**
 * util.time.getDay(+new Date());
 * @type {[type]}
 * 获取星期值
 */
util.time.getDay = getDay;

util.html.htmlEncode = htmlEncode;
util.html.htmlDecode = htmlDecode;
util.html.toRaw = toRaw;

util.string.json2str = json2str;

util.array.inArray = inArray;
util.array.removeFromArray = removeFromArray;


function format(format, timestamp) {

	timestamp = new Date(timestamp);

	let year = timestamp.getFullYear(); //获取完整的年份(4位,1970)
	let month = timestamp.getMonth() + 1 < 10 ? '0' + (timestamp.getMonth() + 1) : timestamp.getMonth() + 1; //获取月份(0-11,0代表1月,用的时候记得加上1)
	let date = timestamp.getDate() < 10 ? '0' + timestamp.getDate() : timestamp.getDate(); //获取日(1-31)

	let hour = timestamp.getHours() < 10 ? '0' + timestamp.getHours() : timestamp.getHours(); //获取小时数(0-23)
	let minite = timestamp.getMinutes() < 10 ? '0' + timestamp.getMinutes() : timestamp.getMinutes(); //获取分钟数(0-59)
	let second = timestamp.getSeconds() < 10 ? '0' + timestamp.getSeconds() : timestamp.getSeconds(); //获取秒数(0-59)

	return format.replace(/y+/ig, year).replace(/m+/ig, month).replace(/d+/ig, date).replace(/h+/ig, hour).replace(/i+/ig, minite).replace(/s+/ig, second);
}

function getDay(timestamp) {
	const Day = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
	return Day[timestamp.getDay()];

}

function htmlEncode(str) {
	let s = "";
	if (str.length == 0) return "";
	s = str.replace(/&/g, "&amp;");
	s = s.replace(/</g, "&lt;");
	s = s.replace(/>/g, "&gt;");
	s = s.replace(/ /g, "&nbsp;");
	s = s.replace(/\'/g, "&#39;");
	s = s.replace(/\"/g, "&quot;");
	s = s.replace(/\n/g, "<br>");
	return s;
}

function htmlDecode(str) {
	let s = "";
	if (str.length == 0) return "";
	s = str.replace(/&amp;/g, "&");
	s = s.replace(/&lt;/g, "<");
	s = s.replace(/&gt;/g, ">");
	s = s.replace(/&nbsp;/g, " ");
	s = s.replace(/&#39;/g, "\'");
	s = s.replace(/&quot;/g, "\"");
	s = s.replace(/<br>/g, "\n");
	return s;
}

function toRaw(str) {
	return str.replace(/\<.+?\s*\/\>/gi, '');
}

function json2str(json) {
	var arr = [];
	for (var key in json) {
		arr.push(key + '=' + json[key]);
	}
	return arr.join('&');
}

function inArray(item, array) {
	for (let el of array) {
		if (el === item) {
			return true;
		}
	}
	return false;
}

function removeFromArray(item, array) {
	for (let i = 0, len = array.length; i < len; i++) {
		if (array[i] === item) {
			array.splice(i, 1);
			break;
		}
	}
	return array;
}

module.exports = util;