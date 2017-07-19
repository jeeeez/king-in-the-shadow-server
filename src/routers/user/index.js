/**
 * 注册用户
 * @authors Picker Lee (https://github.com/jeezlee)
 * @email   450994392@qq.com
 * @date    2016-11-17 22:06:09
 */

import router from '../router';

import User from '../../models/user';
import accountAuth from '../../middlewares/auth';
import ShadowrocksService from '../../services/shadowrocks';
import ParameterValidator from '../../middlewares/parameter-valid';


// 获取当前注册用户列表（所有）
router.get('users', accountAuth.admin, async function(ctx, next) {
	const users = await User.getList().catch(error => ctx.customResponse.error(error.message));
	if (!users) return;

	ctx.customResponse.success(users.map(user => {
		return {
			id: user.id,
			email: user.email,
			validated: user.validated,
			createDate: user.createDate,
			validateDate: user.validateDate,
			port: user.port,
			auth: user.auth,
			role: user.role
		};
	}));
});
