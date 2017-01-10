// import argv from 'yargs';

const NODE_ENV = process.env.NODE_ENV;


export default {
	mongodb: NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/test' : 'mongodb://23.105.209.85:27017/test',

	// 每日最多能创建的邀请码
	maxInvitationAmount: 100
};
