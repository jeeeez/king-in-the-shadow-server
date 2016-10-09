import mongoose from 'mongoose';
import config from '../constants/config';

// mongoose 默认使用内置的 Promise 模块
// 为了向后兼容我们使用 ES6 的 Promise 替换
// @see http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

mongoose.connect(config.mongodb);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	console.log('connections opened!');
});

export default mongoose;
