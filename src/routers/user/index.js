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


/**
 * 管理员为用户充值天数
 */
router.post('users/:userID/activate',
	accountAuth.superAdmin,
	ParameterValidator.body({
		days: {
			required: '充值天数不能为空',
			pattern: /[1-9][0-9]*/,
		}
	}),
	async function(ctx, next) {
		try {
			const userID = ctx.params.userID;
			const { days } = ctx.request.body;
			const user = await User.get({ _id: userID });
			if (!user) {
				return ctx.customResponse.error('用户不存在');
			}

			const prexExprieDate = Math.max((user.expireDate || 0), Date.now());
			const daysMills = 24 * 60 * 60 * 1000 * days;

			const expireDate = prexExprieDate + daysMills;

			await User.update({ _id: userID }, { expireDate });

			if ((user.expireDate || 0) < Date.now()) {
				ShadowrocksService.updateOnePort(user.port, user.auth);
			}

			// 返回用户当前的有效时间
			ctx.customResponse.success({ expireDate });

		} catch (error) {
			ctx.customResponse.error(error.message);
		}
	});
