'use strict';
/**
 * 中间件加载
 * @type {[type]}
 */

const render = require('../lib/render');
const util = require('../lib/util');
const status = require('./common/status');

const projectDb = require('../models/project');
const reportDb = require('../models/report');
const userDb = require('../models/user');

const md5 = require('../lib/md5');

const addReport = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let userid = ctx.cookies.get('uin');

    /**
     * 添加csrf token
     * @type {[type]}
     */
    ctx.session.csrf = md5(Math.random(0, 1).toString()).slice(5, 15);

    // 拉取用户信息
    let userinfo = yield userDb.findOne({
        userid: userid
    });

    ctx.body = yield render('report/add-report-project', {
        csrf: ctx.session.csrf,
        userinfo: userinfo
    });
}

/**
 * 列出所有上报项目
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const listReport = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let userid = ctx.cookies.get('uin');
    let type = ctx.query.type || 'bad';
    let viewName;

    ctx.session.csrf = md5(Math.random(0, 1).toString()).slice(5, 15);

    // 不同上报类型分不同的模板
    switch (type) {
        case 'bad':
            viewName = 'report/list-bad';
            break;
        case 'speed':
            viewName = 'report/list-speed';
            break;
        case 'statis':
            viewName = 'report/list-statis';
            break;
        default:
            viewName = 'report/list';
            break;
    }

    // 拉取项目信息和用户信息
    let result = yield projectDb.find({
        userid: userid,
        type: type
    });
    console.log(result);

    let userinfo = yield userDb.findOne({
        userid: userid
    });

    res = yield render(viewName, {
        data: result,
        userinfo: userinfo,
        csrf: ctx.session.csrf
    });

    ctx.body = res;
}

/**
 * 列出上报错误的列表
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const listReportBad = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let reportid = ctx.query.id;
    let userid = ctx.cookies.get('uin');
    let msg = decodeURIComponent(ctx.query.msg);

    let condition = {};

    ctx.session.csrf = md5(Math.random(0, 1).toString()).slice(5, 15);

    if (reportid && msg) {
        let msgResult = yield reportDb.find({
            id: reportid
        }, {
            limit: 40,
            sort: {
                time: -1
            }
        });

        // 拉取上报信息和用户信息
        let reportResult = yield projectDb.findOne({
            id: reportid
        });
        let userinfo = yield userDb.findOne({
            userid: userid
        });

        if (reportResult) {
            res = yield render('report/list-report-bad', {
                data: msgResult,
                userinfo: userinfo,
                info: reportResult, // 设置全局信息，复用第一个元素的信息
                csrf: ctx.session.csrf
            });
        } else {
            res = {
                code: 404,
                msg: '没有数据'
            };
        }
    } else {
        res = {
            code: 404,
            msg: '没有数据'
        };
    }

    ctx.body = res;
}

/**
 * 错误量统计页面
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const countReportBad = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let reportid = ctx.query.id;
    let userid = ctx.cookies.get('uin');

    let condition = {};
    let dataArr = [];

    ctx.session.csrf = md5(Math.random(0, 1).toString()).slice(5, 15);

    if (reportid) {
        let msgResult = yield reportDb.distinct('msg', {
            id: reportid
        });
        let count;

        // 统计数据
        for (let msg of msgResult) {
            count = yield reportDb.count({
                msg: msg
            });

            dataArr.push({
                count: count,
                msg: msg
            })
        }

        // 拉取上报信息和用户星系
        let reportResult = yield projectDb.findOne({
            id: reportid
        });

        let userinfo = yield userDb.findOne({
            userid: userid
        });

        if (reportResult) {
            res = yield render('report/count-report-bad', {
                data: msgResult,
                userinfo: userinfo,
                info: reportResult, // 设置全局信息，复用第一个元素的信息
                countData: dataArr,
                csrf: ctx.session.csrf
            });
        } else {
            res = {
                code: 404,
                msg: '没有数据'
            };
        }

    } else {
        res = {
            code: 404,
            msg: '没有数据'
        };
    }

    ctx.body = res;
}

/**
 * 错误量报表页面
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const chartReportBad = function*(req, res) {
    status.authCheck(this);

    let ctx = this;

    let reportid = ctx.query.id;
    let day = parseInt(ctx.query.day, 10) || 8;
    let userid = ctx.cookies.get('uin');
    let now = +new Date();
    let timeMatch = 'yy-mm-dd';
    let timeRang = 1000 * 3600 * 24;

    let count, date;
    let dataArr = [],
        dateArr = [];
    /**
     * 添加csrf token
     * @type {[type]}
     */

    if (reportid) {
        /**
         * 逐个查询每天的上报量生成报表
         */
        for (let i = 0; i < day; i++) {
            date = util.time.format(timeMatch, now - timeRang * i)
            count = yield reportDb.count({
                id: reportid,
                time: new RegExp(date)
            });
            dateArr.unshift(date);
            dataArr.unshift(count);
        }

        let reportResult = yield projectDb.findOne({
            id: reportid
        });

        let userinfo = yield userDb.findOne({
            userid: userid
        });

        if (reportResult) {
            res = yield render('report/chart-report-bad', {
                info: reportResult, // 设置全局信息，复用第一个元素的信息
                userinfo: userinfo,
                dateArr: dateArr,
                dataArr: dataArr
            });
        } else {
            res = {
                code: 404,
                msg: '没有数据'
            };
        }
    } else {
        res = {
            code: 404,
            msg: '没有数据'
        };
    }

    ctx.body = res;
}

const myReportBad = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let userid = ctx.cookies.get('uin');
    let collect;

    let reportArr = [];
    let result;
    let newCollect = [];


    ctx.session.csrf = md5(Math.random(0, 1).toString()).slice(5, 15);

    let userinfo = yield userDb.findOne({
        userid: userid
    });

    if (userinfo.userid) {

        collect = userinfo.collect;

        for (let i = 0, reportid, len = collect.length; i < len; i++) {

            reportid = collect[i];

            result = yield reportDb.findOne({
                reportid: reportid
            });

            if (!!result) {
                reportArr.push(result);
                newCollect.push(reportid);
            }
        }

        // 如果关注表的记录不存在则需要更新表内容
        if (newCollect.length !== collect.length) {
            userinfo.collect = newCollect;
            result = yield userDb.update({
                userid: userid
            }, userinfo);
        }

        res = yield render('report/my-report-bad', {
            data: reportArr,
            userinfo: userinfo,
            csrf: ctx.session.csrf
        });

    } else {
        res = {
            code: 404,
            msg: '没有数据'
        };
    }

    ctx.body = res;
}


module.exports = {
    listReport: listReport,
    addReport: addReport,
    listReportBad: listReportBad,
    countReportBad: countReportBad,
    chartReportBad: chartReportBad,
    myReportBad: myReportBad
}