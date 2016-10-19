import logger from 'koa-logger';
module.exports = {
	PORT: 8099,
	middlewares: function(app) {
		app.use(logger());
	}
};
