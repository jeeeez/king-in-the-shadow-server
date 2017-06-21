/**
 * 用户会话中间件
 * @authors Picker Lee (https://github.com/pickerlee)
 * @email   450994392@qq.com
 * @date    2016-11-22 20:15:14
 */

import uuid from 'node-uuid';

// 最多维护100个有效会话
const MAX_SESSION_AMOUNT = 100;
const SESSIONS = {};

export default (ctx, next) => {
	ctx.session = {
		get user() {
			const token = ctx.headers['king-token'];
			const session = SESSIONS[token];
			if (session) {
				// 每次使用session都会重新激活
				session.date = +new Date();
				return session.user;
			}

			// return undefined;
		},

		set user(user) {
			// 如果user为空则表示删除当前token对应的session
			if (!user) {
				const token = ctx.headers['king-token'];
				if (!token) return;

				delete SESSIONS[token];
				return;
			}

			// 当系统的session个数超出最大阈值，则自动最久未使用的session
			const tokens = Object.keys(SESSIONS);
			if (tokens.length >= MAX_SESSION_AMOUNT) {
				const oldestSessionToken = tokens.sort((token1, token2) => {
					return SESSIONS[token1].date - SESSIONS[token2].date;
				})[0];
				delete SESSIONS[oldestSessionToken];
			}

			ctx.session.token = generateToken();
			SESSIONS[ctx.session.token] = {
				user: {
					id: user._id + '',
					auth: user.auth,
					createDate: user.createDate,
					email: user.email,
					port: user.port,
					role: user.role,
					password: user.password
				},
				date: +new Date()
			};
		}
	};
	return next();
};


// 生成token，确保唯一性
const generateToken = () => {
	const token = uuid.v4();
	if (SESSIONS[token]) {
		return generateToken();
	}
	return token;
};
