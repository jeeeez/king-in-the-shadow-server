/**
 * 注册用户
 * @authors Picker Lee (https://github.com/jeezlee)
 * @email   450994392@qq.com
 * @date    2016-11-17 22:06:09
 */

import router from '../router';
import ResponseUtils from '../../utils/response';

import User from '../../models/user';
import accountAuth from '../../middlewares/auth';
import ShadowrocksService from '../../services/shadowrocks';
import ParameterValidator from '../../middlewares/parameter-valid';


// 获取当前注册用户列表（所有）
router.get('users', accountAuth.admin, async function(ctx, next) {
	try {
		const users = await User.getList();

		// 响应数据集
		const responseKeys = ['id', 'email', 'validated', 'createDate', 'validateDate', 'port', 'auth', 'role', 'expireDate'];

		ctx.customResponse.success(ResponseUtils.map(users, responseKeys));

	} catch (error) {
		ctx.customResponse.error(error.message);
	}
});
