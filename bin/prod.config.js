import log4js from 'koa-log4';

module.exports = {
	PORT: 8099,
	middlewares: function(app) {
		app.use(log4js.koaLogger(log4js.getLogger("http"), { level: 'auto' }));
	}
};
