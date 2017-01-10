// import argv from 'yargs';

const NODE_ENV = process.env.NODE_ENV;

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PSW;

export default {
	mongodb: NODE_ENV === `mongodb://${DB_USERNAME}:${DB_PASSWORD}@` +
		'development' ? '127.0.0.1:27017/test' : 'mongodb://23.105.209.85:27017/test',

	// 每日最多能创建的邀请码
	maxInvitationAmount: 100
};
