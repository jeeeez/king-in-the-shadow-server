import 'colors';
import path from 'path';
import Koa from 'koa';
import convert from 'koa-convert';
import json from 'koa-json';
import bodyparser from 'koa-bodyparser';

import session from './middlewares/session';

const configPath = process.env.NODE_ENV === 'development' ? '../bin/dev.config.js' : '../bin/prod.config.js';
const CONFIG = require(configPath);

const app = new Koa();

// middlewares
app.use(convert(bodyparser()));
app.use(convert(json()));
app.use(session);

import customResponse from './middlewares/response';
app.use(customResponse);

import router from './routers/index';
app.use(router.routes()).use(router.allowedMethods());

// http请求错误日志
app.use(CONFIG.middlewares.logger);

app.use(ctx => {
	if (ctx.path === '/favicon.ico') return;

	if (ctx.status === 404) {
		ctx.customResponse.error('接口不存在', 404);
	}
});

app.on('error', function(err, ctx) {
	console.error(err);
});

app.listen(CONFIG.PORT, function(error) {
	if (error) {
		return console.error(error);
	}
	console.log(`Listening at http://localhost:${CONFIG.PORT}`);
});
