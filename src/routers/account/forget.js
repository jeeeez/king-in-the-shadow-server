import uuid from 'node-uuid';
import router from '../router';
import EmailService from '../../services/email';
import ParameterValidator from '../../middlewares/parameter-valid';
import { md5 } from '../../services/hash';
import User from '../../models/user';

router.post('account/password/forget',
	ParameterValidator.body({
		email: {
			required: '邮箱不能为空！',
			notEmpty: '邮箱不能为空！',
			email: '邮箱格式不正确！'
		}
	}), async function name(ctx, next) {
		try {
			const { email } = ctx.request.body;
			const user = await User.get({ email });

			if (!user) {
				return ctx.customResponse.error(`邮箱 ${email} 尚未注册！`);
			}

			const retrieveCode = uuid.v4().replace(/\-/g, '').substr(0, 6);

			await User.update({ email }, { retrieveCode });

			EmailService.sender(email, '找回密码', `
			<p>尊敬的用户，您好</p>
			<p>验证码为 ${retrieveCode}，该验证码仅用于找回密码，使用后立即失效。</p>
			`);

			ctx.customResponse.success('验证码已发送至邮箱，请注意查收！');
		} catch (error) {
			ctx.customResponse.error(error.message);
		}
	});


router.post('account/password/reset',
	ParameterValidator.body({
		email: {
			required: '邮箱不能为空！',
			notEmpty: '邮箱不能为空！',
			email: '邮箱格式不正确！'
		},
		retrieveCode: {
			required: '验证码不能为空！',
			notEmpty: '验证码不能为空！',
			pattern: /^[\S]{6}$/
		},
		password: {
			required: '新密码不能为空！',
			notEmpty: '新密码不能为空！',
			pattern: /^[\S]{6,12}$/
		}
	}),
	async function(ctx, next) {
		try {
			const { email, retrieveCode, password } = ctx.request.body;

			const user = await User.get({ email, retrieveCode });

			if (!user) {
				return ctx.customResponse.error('邮箱或验证码不正确！');
			}

			// 修改密码并重置 retrieveCode
			await User.update({ email, retrieveCode }, {
				password: md5(password),
				retrieveCode: ''
			});

			ctx.customResponse.success('密码修改成功！');
		} catch (error) {
			ctx.customResponse.error(error.message);
		}
	});
