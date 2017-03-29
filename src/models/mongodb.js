import mongoose from 'mongoose';
import config from '../constants/config';

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PSW;

console.log(DB_USERNAME, DB_PASSWORD);
console.log(config.mongodb);

// mongoose 默认使用内置的 Promise 模块
// 为了向后兼容我们使用 ES6 的 Promise 替换
// @see http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

mongoose.connect(config.mongodb, {
	user: DB_USERNAME,
	pass: DB_PASSWORD,
	server: {
		socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 },
		// sets how many times to try reconnecting
		reconnectTries: Number.MAX_VALUE,
		// sets the delay between every retry (milliseconds)
		reconnectInterval: 1000
	},
	replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	console.log('connections opened!');
});

export default mongoose;
