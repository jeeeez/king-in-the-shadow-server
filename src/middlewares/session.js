/**
 * 用户会话中间件
 * @authors Picker Lee (https://github.com/li2274221)
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
			return SESSIONS[token];
		},

		set user(session) {
			// 如果session为空则表示删除当前token对应的session
			if (!session) {
				const token = ctx.headers['king-token'];
				if (!token) return;

				delete SESSIONS[token];
				return;
			}
			// 当系统的session个数超出最大阈值，则自动删除最前面的session
			// 虽然Object中的属性是无序（不可靠）的，但是如果key值为String类型，一般还是会以添加顺序为序
			// --TODO:为session设置最后使用时间，按该时间的倒序排序，优先删除最久没使用的session
			const tokens = Object.keys(SESSIONS);
			if (tokens.length >= MAX_SESSION_AMOUNT) {
				delete SESSIONS[tokens[0]];
			}

			ctx.session.token = generateToken();
			SESSIONS[ctx.session.token] = session;
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
