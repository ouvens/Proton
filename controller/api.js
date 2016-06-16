'use strict';

// const coRequest = require("co-request");
// const util = require('../lib/util');
// const md5 = require('../lib/md5');
// const render = require('../lib/render');
// const config = require('./common/config')
// const config = require('./common/status')

//引用的数据库表
const reportDb = require('../models/report');
const deviceDb = require('../models/device');
const userDb = require('../models/user');
const projectDb = require('../models/project');

// 应用api模块
const reportApi = require('./api/report');
const userApi = require('./api/user');
const projectApi = require('./api/project');

/**
 * 运行临时测试脚本
 */
const test = function*(req, res) {
    // var result = yield reportDb.remove();
    // var record = yield reportDb.find({});
    // var result = yield projectDb.remove();
    // var record = yield projectDb.find({});
    // var result = yield userDb.remove();
    // var record = yield userDb.find({});

    let record = yield userDb.find({});
    this.body = record;
}

module.exports = {
    // 用户组相关api
    register: userApi.register,
    auth: userApi.auth,
    logout: userApi.logout,
    addAttention: userApi.addAttention,
    cancelAttention: userApi.cancelAttention,

    //上报项目相关api
    addProject: projectApi.addProject,
    delProject: projectApi.delProject,

    //上报请求相关api
    reportBad: reportApi.reportBad,
    delReport: reportApi.delReport,
    delOneReport: reportApi.delOneReport,

    reportStatis: reportApi.reportStatis,
    delStatis: projectApi.delStatis,

    // 测试命令行
    test: test
}