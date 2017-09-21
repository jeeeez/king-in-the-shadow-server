import router from '../router';
import uuid from 'node-uuid';

import EmailService from '../../services/email';

import { md5, generateRamdomString } from '../../services/hash';

import G from '../../constants';

import User from '../../models/user';
import InvitationCodeModel from '../../models/invitation-code';

import accountAuth from '../../middlewares/auth';

import ShadowrocksService from '../../services/shadowrocks';
import Validator from '../../services/validator';
import ParameterValidator from '../../middlewares/parameter-valid';

/**
 * 用户注册
 * 流程：
 * 1. 用户提交 邮箱和密码
 * 2. 验证该邮箱是否已经被注册
 * 3. 创建账户（未开通VPN服务）
 * 4. 发送邮件至用户邮箱
 * 5. 用户点击验证邮箱后开通VPN服务
 */
router.post('account/register',
	ParameterValidator.body({
		email: {
			required: '邮箱不能为空！',
			notEmpty: '邮箱不能为空！',
			email: '邮箱格式不正确！'
		},
		password: {
			required: '密码不能为空！',
			notEmpty: '密码不能为空！',
			pattern: /^[\S]{6,12}$/
		}
	}),
	async function(ctx, next) {
		try {
			const {
				email
			} = ctx.request.body;

			const password = md5(ctx.request.body.password);

			const count = await User.count({
				email
			});

			if (count >= 1) return ctx.customResponse.error(`邮箱 ${email} 已被注册！`);


			// 邮箱验证用的随机字符串签名
			const signature = uuid.v4().replace(/\-/g, '');
			const createDate = +new Date();

			const user = await User.create({
				email,
				password,
				createDate,
				signature
			});

			// 发送注册邮件
			const emailHTML = `
				<p>尊敬的用户，您好</p>
				<p>欢迎使用非匠网络加速服务，点击<a href="${G.origin}/api/account/${signature}/validate">链接</a>即可完成非匠的注册！</p>
				`;

			EmailService.sender(email, '用户注册', emailHTML);

			ctx.session.user = user;

			ctx.customResponse.success({
				id: user.id,
				email: user.email,
				createDate: user.createDate,
				port: user.port,
				auth: user.auth,
				token: ctx.session.token,
				expireDate: ctx.session.expireDate
			});
		} catch (error) {
			ctx.customResponse.error(error.message);
		}
	});


/**
 * 用户邮箱验证
 * 1. 设置账户为已验证状态
 */
router.get('account/:signature/validate', async function(ctx, next) {
	try {
		const signature = ctx.params.signature;

		const user = await User.get({
			signature
		});

		if (!user) {
			return ctx.customResponse.error('无效的验证码！');
		}

		if (user.validated) {
			return ctx.customResponse.error('当前账户已验证成功！');
		}

		// 获取当前最大的端口号
		const lastUser = await User.getList().sort({
			port: -1
		}).limit(1).exec();
		const lastPort = lastUser.length ? lastUser[0].port : 8000;

		const port = lastPort + 1;

		// 随机 VPN 密码
		const auth = generateRamdomString(8);

		await User.update({
			_id: user.id
		}, {
			port,
			auth,
			validated: true,
			validateDate: +new Date(),
			expireDate: +new Date('2017-09-30 23:59:59')
		}).then(() => {
			ctx.customResponse.success('注册成功');

			// 为用户开通 shadowrocks 账户
			// ShadowrocksService.updateOnePort(port, auth);
		});

	} catch (error) {
		ctx.customResponse.error(error.message);
	}
});


router.post('account/activate',
	accountAuth.user,
	ParameterValidator.body('invitationCode'),
	async function(ctx, next) {

		const user = ctx.session.user;

		const code = ctx.request.body.invitationCode;

		// 验证邀请码的有效性
		const invitationCode = await InvitationCodeModel.get({
			code
		});

		if (!invitationCode) {
			return ctx.customResponse.error('无效的激活码');
		}

		if (!invitationCode.state) {
			return ctx.customResponse.error('激活码已被使用');
		}

		// 更新邀请码状态
		await InvitationCodeModel.update({
			code
		}, {
			state: 0,
			inviteeId: user.id,
			consumeDate: +new Date()
		});

		const lastExpireDate = Math.max(user.expireDate || 0, Date.now());
		const expireDate = lastExpireDate + getMilliseconds(invitationCode.type);

		await User.update({
			_id: user.id
		}, {
			expireDate
		}).then(() => {
			ctx.customResponse.success(invitationCode);

			// 为用户开通 shadowrocks 账户
			ShadowrocksService.updateOnePort(user.port, user.auth);
		});

	});

// 根据激活码类型获取其毫秒数
function getMilliseconds(type) {
	// 每日所持有的毫秒数
	const millisecondsOfOneDay = 24 * 60 * 60 * 1000;

	switch (type) {
		case 'YEAR':
			return 366 * millisecondsOfOneDay;
		case 'SEASON':
			return 3 * 31 * millisecondsOfOneDay;
		case 'MONTH':
			return 31 * millisecondsOfOneDay;
		case 'WEEK':
			return 7 * millisecondsOfOneDay;
		case 'DAY':
			return 1 * millisecondsOfOneDay;
		default:
			return 0;
	}
}
