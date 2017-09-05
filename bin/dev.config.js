import log4js from 'koa-log4';

module.exports = {
	PORT: 1099,
	middlewares: {
		logger: log4js.koaLogger(log4js.getLogger("http"), { level: 'auto' })
	}
};
