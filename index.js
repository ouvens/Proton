'use strict';

const http = require('http');

const koa = require('koa');
const logger = require('koa-logger');
const serve = require('koa-static');
const stylus = require('koa-stylus');
const koaBody = require('koa-body');

const session = require('koa-session-store');
const mongoStore = require('koa-session-mongo');

const router = require('./routes');

// Create koa app
const app = koa();

// middleware
app.use(logger());

//设置静态目录内容
app.use(serve('./views')).use(serve('./mock')).use(serve('./public'));

app.keys = ['sessionid'];


app.use(session({
	store: mongoStore.create({
		db: 'session_token'
	})
}));


app.on('error', function(err, ctx) {
	log.error('server error', err, ctx);
});

app.use(koaBody({
	formidable: {
		uploadDir: __dirname
	}
}));

/**
 * 运行时错误处理，这里很重要
 * @param  {[type]}	[description]
 * @return {[type]} [description]
 */
app.on('error', function(err) {
	log.error('server error', err);
});

app.use(router.routes());



// 创建服务器监听
http.createServer(app.callback()).listen(8086);
// app.listen(3000);

console.log('Server listening on port 8086');