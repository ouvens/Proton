'use strict';

const jsSHA = require('jssha');
const coRequest = require("co-request");

const APP_ID = 'wx80792921613f141d';
const SECRET = 'c053bd3e1d2bb098f3ce46e2c4552698';

const oAuthHeader = {
	Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImp0aSI6IjU3MjA3YzdmNzBlMWUifQ.eyJpc3MiOiJhcGkueGlhb2RhbzM2MC5jb20iLCJqdGkiOiI1NzIwN2M3ZjcwZTFlIiwiaWF0IjoxNDYxNzQ2ODE1LCJleHAiOjE0OTMyODI4MTUsIm1pZCI6OTU0ODMsInBsYXRmb3JtIjozLCJ0b2tlbl90eXBlIjoiQmVhcmVyIn0._DWpwiqvTbaYNhbGC4qQT_iIW63XR72OWY-iEPXNeSw'
};

/**
 * 获取微信分享签名api
 * @param {[type]} ctx           [description]
 * @yield {[type]} [description]
 */
const getWxJsConfig = function*(ctx) {

	let tokenRes, token, ticketRes, ticket, url, noncestr, appid, timestamp, signature, wxJsConfig;

	tokenRes = yield coRequest({
		url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APP_ID + '&secret=' + SECRET,
		method: 'get'
	});

	token = tokenRes.body && (JSON.parse(tokenRes.body)).access_token || '';

	ticketRes = yield coRequest({
		url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi',
		method: 'get'
	});

	ticket = ticketRes.body && JSON.parse(ticketRes.body).ticket || '';


	url = 'http://' + ctx.host + ctx.path;
	noncestr = _createNonceStr();
	timestamp = _createTimeStamp();
	signature = _calcSignature(ticket, noncestr, timestamp, url);

	wxJsConfig = {
		nonceStr: noncestr,
		appid: APP_ID,
		timestamp: timestamp,
		signature: signature,
		url: url
	};

	// 创建noncestr
	function _createNonceStr() {
		return Math.random().toString(36).substr(2, 15);
	};

	// 创建timestamp
	function _createTimeStamp() {
		return parseInt(new Date().getTime() / 1000) + '';
	}

	// 计算签名方法
	function _calcSignature(ticket, noncestr, ts, url) {
		var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + ts + '&url=' + url;
		let shaObj = new jsSHA('SHA-1', 'TEXT');
		shaObj.update(str);

		return shaObj.getHash('HEX');
	}

	return wxJsConfig;
}

/**
 * 域名域名白名单设置
 * @type {Array}
 */
const domains = [
	'127.0.0.1',
	'127.0.0.1:8086',
	'www.xiaodao360.com',
	'test.xiaodao360.cn',
	'www.xiaodaowang.cn'
];

module.exports = {
	oAuthHeader: oAuthHeader,
	getWxJsConfig: getWxJsConfig,
	domains: domains
}