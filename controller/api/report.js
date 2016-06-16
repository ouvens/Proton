'use strict';
/**
 * 中间件加载
 * @type {[type]}
 */
const util = require('../../lib/util');
const md5 = require('../../lib/md5');

//引用的数据库表
const reportDb = require('../../models/report');
const projectDb = require('../../models/project');
const userDb = require('../../models/user');

/**
 * web错误上报规范接口
 * @yield {[type]} [description]
 */
const reportBad = function*() {

    let ctx = this;
    let reportArr = [];

    let device;

    //如果没找到项目则不处理 
    let project = yield projectDb.findOne({
        id: ctx.query.id,
        type: 'bad'
    });

    if (!project) {
        // 如果项目id不存在则不上报
        ctx.body = '';
        return;
    } else if (project.domain.indexOf(ctx.hostname) >= 0) {
        // 如果域名匹配不成功，则不进行上报
        ctx.body = '';
        return;
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
    if (ctx.query['url[' + 0 + ']']) {
        for (let i = 0, record; record = ctx.query['url[' + i + ']']; i++) {
            reportArr.push({
                // APP和server上报必备上报信息, web端与badjs保持一致即可
                id: ctx.query.id,
                from: ctx.query.from || ctx.originalUrl,
                msg: ctx.query['msg[' + i + ']'] || ctx.query['msg'],
                type: ctx.query.type || 'bad',
                network: ctx.query.network || '未知网络类型',
                device: ctx.query.device || device,
                userAgent: ctx.header['user-agent'] || '未知浏览器',
                uin: ctx.cookies.get('uin'),

                // 可选上报信息, 详细字段件report表
                level: ctx.query['level[' + i + ']'] || ctx.query['level'],
                url: ctx.query['target[' + i + ']'] || ctx.query['target'],
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
    } else {
        reportArr.push({
            // APP和server上报必备上报信息, web端与badjs保持一致即可
            id: ctx.query.id,
            from: ctx.query.from || ctx.originalUrl,
            msg: ctx.query['msg'],
            type: ctx.query.type || 'bad',
            network: ctx.query.network || '未知网络类型',
            device: ctx.query.device || device,
            userAgent: ctx.header['user-agent'] || '未知浏览器',
            uin: ctx.cookies.get('uin'),

            // 可选上报信息, 详细字段件report表
            level: ctx.query['level'],
            url: ctx.query['target'],
            row: ctx.query['rowNum'],
            col: ctx.query['colNum'],
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
 * web统计量上报规范接口
 * @yield {[type]} [description]
 */
const reportStatis = function*() {

    let ctx = this;
    let reportArr = [];

    let device;
    let result;

    //如果没找到项目则不处理 
    let project = yield projectDb.findOne({
        id: ctx.query.id,
        type: 'statis'
    });

    if (!project) {
        // 如果项目id不存在则不上报
        ctx.body = '';
        return;
    } else if (project.domain.indexOf(ctx.hostname) < 0) {
        // 如果域名匹配不成功，则不进行上报
        ctx.body = '';
        return;
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

    let date = util.time.format('yy-mm-dd', +new Date());

    let statisData = {
        // APP和server上报必备上报信息, web端与badjs保持一致即可
        id: ctx.query.id,
        from: ctx.query.from || ctx.originalUrl,
        // msg: ctx.query['msg[' + i + ']'] || ctx.query['msg'],
        type: ctx.query.type || 'statis',
        network: ctx.query.network || '未知网络类型',
        device: ctx.query.device || device,
        userAgent: ctx.header['user-agent'] || '未知浏览器',
        uin: ctx.cookies.get('uin'),

        // cookie或自动判断信息
        reportid: (+new Date()).toString().slice(-8), //时间戳后8位作为唯一id
        domain: ctx.host,
        ip: ctx.ip
    };

    // 查询今天的访问记录
    let visitor = yield reportDb.findOne({
        id: ctx.query.id,
        ip: ctx.ip,
        type: 'statis',
        userAgent: ctx.header['user-agent']
    });

    // 如果没有设置pv、uv，则定义空对象
    if (!project['pv']) {
        project['pv'] = {};
        project['pv'][date] = 0;
    }

    if (!project['uv']) {
        project['uv'] = {};
        project['uv'][date] = 0;
    }

    console.log(visitor);
    if (visitor) {
        // 如果当天有上报，则增加pv
        project['pv'][date] = project['pv'][date] + 1;

        // 如果没有上报，增加pv和uv
    } else {

        project['pv'][date] = project['pv'][date] + 1;
        project['uv'][date] = project['uv'][date] + 1;

        result = yield reportDb.insert(statisData);
    }

    result = yield projectDb.update({
        id: ctx.query.id
    }, project);

    ctx.body = ctx.body || '';
};

/**
 * 清空整个项目的上报记录
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const delReport = function*(req, res) {

    let ctx = this;
    let result;

    // 如果id不为空，请csrf检验成功
    if (ctx.params.id && ctx.params.csrf === ctx.session.csrf) {
        result = yield reportDb.remove({
            id: ctx.params.id
        });
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

/**
 * 删除指定的一条上报记录
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const delOneReport = function*(req, res) {

    let ctx = this;
    let result;

    // 如果id不为空，请csrf检验成功
    if (ctx.params.reportid && ctx.params.csrf === ctx.session.csrf) {
        result = yield reportDb.remove({
            reportid: ctx.params.reportid
        });
        res = {
            code: 200,
            result: result
        };
    } else {
        res = {
            code: 400,
            msg: '请求被拒绝'
        }
    }
    ctx.body = res;
}

module.exports = {
    reportBad: reportBad,
    reportStatis: reportStatis,
    delReport: delReport,
    delOneReport: delOneReport
}