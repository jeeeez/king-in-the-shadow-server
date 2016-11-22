import router from '../router';

import { md5 } from '../../services/hash';

import User from '../../models/user';
import ParameterValidator from '../../middlewares/parameter-valid';

// 用户登录
router.post('account/login',
	ParameterValidator.body({
		email: { required: '邮箱不能为空！', notEmpty: '邮箱不能为空！', email: '邮箱格式不正确！' },
		password: { required: '密码不能为空！', notEmpty: '密码不能为空！', pattern: /^[\S]{6,12}$/ }
	}),
	async function(ctx, next) {
		const { email, password } = ctx.request.body;

		const count = await User.count({ email }).catch(error => {
			return ctx.customResponse.error(error.message);
		});

		if (count === 0) {
			return ctx.customResponse.error(`用户 ${email} 不存在`);
		}

		const user = await User.get({ email, password: md5(password) }).catch(error => ctx.customResponse(error.message));

		if (!user) return ctx.customResponse.error(`密码不正确！`);

		const currentUser = {
			id: user._id,
			email: user.email,
			createDate: user.createDate,
			port: user.port,
			auth: user.auth,
			role: user.role
		};

		// 登录设置用户会话
		ctx.session.user = currentUser;

		ctx.customResponse.success({...currentUser, token: ctx.session.token });
	});
