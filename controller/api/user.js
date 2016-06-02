'use strict';

const md5 = require('../../lib/md5');
const util = require('../../lib/util');

const userDb = require('../../models/user');
const report = require('../../models/report');

/**
 * 用户注册接口
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const register = function*(req, res) {

	let ctx = this;
	let pwdToken;

	let username = ctx.request.body['username'];
	let pwd = ctx.request.body['pwd'];

	let csrf = ctx.request.body['csrf'];

	if (csrf !== ctx.session.csrf) {
		res = {
			code: 400,
			msg: '不明网站来源提交'
		}
	} else if (!username || !pwd) {
		res = {
			code: 401,
			msg: '用户或密码不能为空'
		}
	} else {

		/**
		 * 插入前检验是否存在
		 */
		let userResult = yield userDb.find({
			username: username
		});

		if (userResult.length) {
			res = {
				code: 410,
				msg: '用户名已存在'
			}
		} else {

			pwdToken = md5(username).slice(0, 10) + '-' + md5(username + pwd).slice(11, -10) + '-' + md5(pwd).slice(-10);

			let result = yield userDb.insert({
				userid: (+new Date()).toString().slice(-8),
				username: username,
				pwd: pwdToken,
				type: '1',
				collect: [],
				time: util.time.format('yy-mm-dd hh:ii:ss', +new Date())
			});

			/**
			 * 如果返回成功，则写入cookie信息，否则返回500
			 */
			if (result.userid) {
				ctx.cookies.set('token', pwdToken);
				ctx.cookies.set('uin', result.userid);

				res = {
					code: 200,
					result: result
				}
			} else {
				res = {
					code: 500,
					msg: '服务器操作错误'
				}
			}
		}
	}
	ctx.body = res;
};

/**
 * 用户注销接口
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const logout = function*(req, res) {

	let ctx = this;
	let pwdToken;

	let uin = ctx.cookies.get('uin');

	ctx.cookies.set('token', null);
	ctx.cookies.set('uin', null);

	res = {
		code: 200
	};
	ctx.body = res;
}

/**
 * 用户登录接口
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const auth = function*(req, res) {

	let ctx = this;
	let pwdToken;

	let username = ctx.request.body['username'];
	let pwd = ctx.request.body['pwd'];
	let csrf = ctx.request.body['csrf'];

	if (csrf !== ctx.session.csrf) {
		res = {
			code: 400,
			msg: '不明网站来源提交'
		}
	} else if (!username || !pwd) {
		res = {
			code: 401,
			msg: '用户或密码不能为空'
		}
	} else {
		pwdToken = md5(username).slice(0, 10) + '-' + md5(username + pwd).slice(11, -10) + '-' + md5(pwd).slice(-10);

		/**
		 * 查询
		 */
		let result = yield userDb.findOne({
			username: username,
			pwd: pwdToken
		});

		/**
		 * 如果找到记录则将信息加入cookie
		 */
		if (result) {
			ctx.cookies.set('token', pwdToken);
			ctx.cookies.set('uin', result.userid);

			res = {
				code: 200,
				result: result
			};
		} else {
			res = {
				code: 401,
				msg: '用户不存在'
			};
		}
	}
	ctx.body = res;
};

/**
 * 用户对错误信息添加关注，方便下次快速查看
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const addAttention = function*(req, res) {

	let ctx = this;
	let uin = ctx.cookies.get('uin');
	let reportid = ctx.request.body['reportid'];

	let csrf = ctx.request.body['csrf'];

	let result;

	// 如果id不为空，请csrf检验成功
	if (reportid && csrf === ctx.session.csrf) {

		result = yield userDb.findOne({
			userid: uin
		});

		if (!util.array.inArray(reportid, result.collect)) {

			result.collect.push(reportid);

			result = yield userDb.update({
				userid: uin
			}, result);

			res = {
				code: 200,
				result: result
			}
		} else {
			res = {
				code: 500,
				msg: '您已经关注'
			}
		}
	} else {
		res = {
			code: 400,
			msg: '请求被拒绝'
		}
	}
	ctx.body = res;
}


/**
 * 用户取消关注信息
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const cancelAttention = function*(req, res) {

	let ctx = this;
	let uin = ctx.cookies.get('uin');
	let reportid = ctx.params.reportid;

	let csrf = ctx.params.csrf;

	let result;

	// 如果id不为空，请csrf检验成功
	if (reportid && csrf === ctx.session.csrf) {

		result = yield userDb.findOne({
			userid: uin
		});

		if (util.array.inArray(reportid, result.collect)) {

			result.collect = util.array.removeFromArray(reportid, result.collect);

			result = yield userDb.update({
				userid: uin
			}, result);

			res = {
				code: 200,
				result: result
			}
		} else {
			res = {
				code: 500,
				msg: '您已经关注'
			}
		}

	} else {
		res = {
			code: 400,
			msg: '请求被拒绝'
		}
	}
	ctx.body = res;
}

module.exports = {
	auth: auth,
	register: register,
	logout: logout,
	addAttention: addAttention,
	cancelAttention: cancelAttention
}