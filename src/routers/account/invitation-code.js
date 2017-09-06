import router from '../router';
import uuid from 'node-uuid';
import accountAuth from '../../middlewares/auth';
import User from '../../models/user';
import InvitationCode from '../../models/invitation-code';
import ParameterValidator from '../../middlewares/parameter-valid';

import G from '../../constants/index';

// 查看今日邀请码
router.get('account/invitation-codes', accountAuth.user, async function (ctx, next) {
	try {
		const user = ctx.session.user;

		const today = new Date();
		const todayStart = +new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const todayEnd = todayStart + 1 * 24 * 60 * 60 * 1000 - 1;
		const invitationCodes = await InvitationCode.getList({
			inviterId: user.id,
			createDate: {
				$gt: todayStart,
				$lt: todayEnd
			}
		});

		ctx.customResponse.success(invitationCodes.map(invitationCode => {
			return {
				code: invitationCode.code,
				state: invitationCode.state,
				createDate: invitationCode.createDate,
				consumeDate: invitationCode.consumeDate,
				inviteeId: invitationCode.inviteeId,
				type: invitationCode.type
			};
		}));
	} catch (error) {
		ctx.customResponse.error(error.message)
	}
});


// 创建邀请码
router.post('account/invitation-codes', accountAuth.superAdmin, async function (ctx, next) {
	try {
		const user = ctx.session.user;

		// 邀请码类型
		const type = ctx.request.body.type || 'YEAR';

		// const today = new Date();
		// const todayStart = +new Date(today.getFullYear(), today.getMonth(), today.getDate());
		// const todayEnd = todayStart + 1 * 24 * 60 * 60 * 1000 - 1;

		// 不限制邀请码创建数量
		// const count = await InvitationCode.count({
		// 	inviterId: user.id,
		// 	createDate: { $gt: todayStart, $lt: todayEnd }
		// }).catch(error => ctx.customResponse.error(error.message));

		// if (count >= G.maxInvitationAmount) {
		// 	return ctx.customResponse.error(`每日最多能创建${G.maxInvitationAmount}个邀请码，今日邀请码额度已用完`);
		// }

		const code = await createInvitationCode();
		const createDate = +new Date();
		const codeEntity = await InvitationCode.create({
			code,
			createDate,
			inviterId: user.id,
			state: 1,
			type
		});

		ctx.customResponse.success({
			code,
			createDate,
			state: 1,
			type
		});
	} catch (error) {
		ctx.customResponse.error(error.message)
	}
});

/**
 * 创建邀请码，确保唯一性
 */
function createInvitationCode() {
	const code = uuid.v4().split('-')[4];
	return InvitationCode.count({
		code
	}).then(count => {
		if (count > 0) {
			return createInvitationCode();
		} else {
			return Promise.resolve(code);
		}
	});
}
