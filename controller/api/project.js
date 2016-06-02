'use strict';

const md5 = require('../../lib/md5');
const util = require('../../lib/util');

const projectDb = require('../../models/project');
const reportDb = require('../../models/report');

/**
 * 添加上报项目
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const addProject = function*(req, res) {

	let ctx = this;
	let data = ctx.request.body;
	let token;
	let csrf = ctx.request.body['csrf'];

	if (csrf !== ctx.session.csrf) {
		res = {
			code: 400,
			msg: '不明网站来源提交'
		}
	} else if (!data.name || !data.uri) {
		ctx.body = {
			code: 401,
			msg: '缺少必要参数'
		};
		return;
	}

	/**
	 * 项目识别码根据title和urimd5后识别
	 * @type {[type]}
	 */
	token = md5(data.name).slice(0, 10) + '-' + md5(data.name + data.uri).slice(11, -10) + '-' + md5(data.uri).slice(-10);


	let projectResult = yield projectDb.find({
		token: token
	});

	if (projectResult.length) {
		ctx.body = {
			code: 401,
			msg: '已存在记录'
		};
		return;
	}

	data['token'] = token;
	data['userid'] = ctx.cookies.get('uin');
	data['id'] = (+new Date()).toString().slice(-8);
	data['time'] = util.time.format('yy-mm-dd hh:ii:ss', +new Date());
	delete data['csrf'];

	ctx.body = ctx.request.body;

	let result = yield projectDb.insert(data);

	if (result.id) {
		res = {
			code: 200,
			result: result
		};
	} else {
		res = {
			code: 401,
			msg: '服务器错误'
		};
	}

	ctx.body = res;
}

/**
 * 删除整个上报项目并且清空该项目下的所有上报记录
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const delProject = function*(req, res) {

	let ctx = this;
	let result;

	// 如果id不为空，请csrf检验成功
	if (ctx.params.id && ctx.params.csrf === ctx.session.csrf) {
		result = yield reportDb.remove({
			id: ctx.params.id
		});
		result = yield projectDb.remove({
			id: ctx.params.id
		})
		res = {
			code: 200
		};
	} else {
		res = {
			code: 500,
			msg: '服务器错误'
		}
	}
	ctx.body = res;
}

module.exports = {
	addProject: addProject,
	delProject: delProject
}