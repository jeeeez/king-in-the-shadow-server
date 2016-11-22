import log4js from 'koa-log4';

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(__dirname + '/logs/http.log'), 'http');
const logger = log4js.getLogger("http");
logger.setLevel('ERROR');
module.exports = {
	PORT: 8099,
	middlewares: {
		logger: log4js.koaLogger(log4js.getLogger("http"), { level: 'auto' })
	}
};
