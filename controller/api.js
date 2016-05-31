'use strict';
/**
 * 中间件加载
 * @type {[type]}
 */

const coRequest = require("co-request");
const session = require('koa-session-redis3');
const util = require('../lib/util');
const md5 = require('../lib/md5');

const render = require('../lib/render');
const config = require('./common/config')

//引用的数据库表
const reportDb = require('../models/report');
const deviceDb = require('../models/device');
const userDb = require('../models/user');
const projectDb = require('../models/project');

/**
 * 上报规范：
 * @yield {[type]} [description]
 */
const report = function*() {

    let ctx = this;
    let reportArr = [];

    let userAgent;
    let device;
    /**
     * 判断userAgent内核
     */
    if (/trident/i.test(ctx.header['user-agent'])) {
        userAgent = 'browser-ie';
    } else if (/chrome/i.test(ctx.header['user-agent'])) {
        userAgent = 'browser-chrome';
    } else if (/safari/i.test(ctx.header['user-agent'])) {
        userAgent = 'borwser-safari';
    } else if (/firefox/i.test(ctx.header['user-agent'])) {
        userAgent = 'borwser-firefox';
    } else {
        userAgent = 'browser-unknown';
    }

    /**
     * 判断机型号，默认根据user-agent判断
     */
    if (/ipad|ipod|iphone/i.test(ctx.header['user-agent'])) {
        device = 'ios';
    } else if (/andrdoid/i.test(ctx.header['user-agent'])) {
        device = 'android';
    } else {
        device = 'pc';
    }

    // 处理信息提交到缓存数组
    for (let i = 0, record; record = ctx.query['url[' + i + ']']; i++) {

        reportArr.push({
            // APP和server上报必备上报信息, web端与badjs保持一致即可
            id: ctx.query.id,
            from: ctx.query.from || ctx.originalUrl,
            msg: ctx.query['msg[' + i + ']'] || ctx.query['msg'],
            type: ctx.query.type || 0,
            network: ctx.query.network || '未知网络类型',
            device: ctx.query.device || device,
            userAgent: ctx.query.userAgent || userAgent,
            uin: ctx.cookies.get('uin'),

            // 可选上报信息, 详细字段件report表
            level: ctx.query['level[' + i + ']'] || ctx.query['level'],
            url: ctx.query['url[' + i + ']'] || ctx.query['url'],
            row: ctx.query['rowNum[' + i + ']'] || ctx.query['rowNum'],
            col: ctx.query['colNum[' + i + ']'] || ctx.query['colNum'],
            count: ctx.query.count || 1,
            time: util.time.format('yy-mm-dd hh:ii:ss', ctx.query.t || +new Date()),
            ext: ctx.query.ext || {},

            // cookie或自动判断信息
            reportid: (+new Date()).toString().slice(-8), //时间戳后8位作为唯一id
            domain: ctx.host,
            ip: ctx.ip
        });
    }

    /**
     * 插入report数据操作
     */
    for (let item of reportArr) {
        let result = yield reportDb.insert(item);
    }

    ctx.body = ctx.body || '';
};

/**
 * 添加关联的设备信息
 * @yield {[type]} [description]
 */
const addDevice = function*(req, res) {
    let ctx = this;

    if (ctx.query.deviceid && ctx.query.devicename && ctx.query.type) {
        let result = yield deviceDb.insert({
            deviceid: ctx.query.deviceid,
            devicename: ctx.query.devicename,
            type: ctx.query.type,
            userid: ctx.cookies.get('uin')
        });

        res = {
            code: 200,
            result: result
        }
    } else {
        res = {
            code: 400,
            msg: '缺少参数'
        }
    }

    ctx.body = res;
}

const register = function*(req, res) {

    let ctx = this;
    let pwdToken;

    let username = ctx.request.body['username'];
    let pwd = ctx.request.body['pwd'];

    /**
     * 确保用户名和密码输入
     */
    if (!username || !pwd) {
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

const logout = function*(req, res) {

    let ctx = this;
    let pwdToken;

    let uin = ctx.cookies.get('uin');

    ctx.cookies.set('token', null);
    ctx.cookies.set('uin', null);

    res = {
        code: 200,
        result: {

        }
    };
    ctx.body = res;
}

const auth = function*(req, res) {

    let ctx = this;
    let pwdToken;

    let username = ctx.request.body['username'];
    let pwd = ctx.request.body['pwd'];

    /**
     * 确保用户名和密码输入
     */
    if (!username || !pwd) {
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

        if (result) {

            console.log(result.userid);
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

const addProject = function*(req, res) {

    let ctx = this;
    let data = ctx.request.body;
    let token;

    if (!data.name || !data.uri) {
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

const test = function*(req, res) {

    var result = yield reportDb.remove();
    var record = yield reportDb.find({});
    var result = yield projectDb.remove();
    var record = yield projectDb.find({});
    var result = yield userDb.remove();
    var record = yield userDb.find({});

    this.body = record;
}

module.exports = {
    report: report,
    register: register,
    auth: auth,
    logout: logout,
    addProject: addProject,
    addDevice: addDevice,
    test: test
}