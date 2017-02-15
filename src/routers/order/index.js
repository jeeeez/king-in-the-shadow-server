/**
 * 订单
 * @authors Picker Lee (https://github.com/pickerlee)
 * @email   450994392@qq.com
 * @date    2015-02-15 20:440:02
 */

import uuid from 'node-uuid';
import G from '../../constants/index';
import router from '../router';

import objFilter from '../../services/object-filter';

import Plan from '../../models/plan';
import Order from '../../models/order';
import accountAuth from '../../middlewares/auth';
import ParameterValidator from '../../middlewares/parameter-valid';


// 所有订单列表
router.get('orders', accountAuth.user, async function(ctx, next) {
	const { state, planID, skip, limit } = ctx.request.body;
	// 查询条件
	const condition = { state, planID };

	const orders = await Order.getList(condition, { skip, limit }).exec().catch(error => ctx.customResponse.error(error.message));

	if (orders === undefined) return;

	const result = orders.map(entity => {
		return objFilter(entity, [
			'No',
			'name',
			'userID',
			'planID',
			'createDate',
			'amount',
			'payment',
			'paymentDate',
			'description',
			'state']);
	});
	ctx.customResponse.success(result);
});

// 用户的订单列表
router.get('user/:userID/orders', accountAuth.user, async function(ctx, next) {
	const userID = ctx.params.userID;
	const user = ctx.session.user;

	// 普通、VIP用户仅能看到自己的订单
	if ((user.role === G.accountRoles.member || user.role === G.accountRoles.VIP) &&
		user._id !== userID) {
		return ctx.customResponse.error('权限不足');
	}

	const { state, planID, skip, limit } = ctx.request.body;
	// 查询条件
	const condition = { userID, state, planID };

	const orders = await Order.getList(condition, { skip, limit }).exec().catch(error => ctx.customResponse.error(error.message));

	if (orders === undefined) return;

	const result = orders.map(entity => {
		return objFilter(entity, [
			'No',
			'name',
			'userID',
			'planID',
			'createDate',
			'amount',
			'payment',
			'paymentDate',
			'description',
			'state']);
	});
	ctx.customResponse.success(result);
});


// 创建订单
router.post('orders', accountAuth.user,
	// 参数验证
	ParameterValidator.body('name', 'planID'),
	async function(ctx, next) {
		const user = ctx.session.user;

		const { name, planID } = ctx.request.body;

		const plan = await Plan.get({ _id: planID }).catch(error => ctx.customResponse.error(error.message));
		if (plan === undefined) return;

		if (!plan) {
			return ctx.customResponse.error('套餐不存在')
		}

		const No = createOrderNo();

		const entity = await Order.create({
			No,
			name,
			planID,
			userID: user._id,
			state: 1,
			createDate: +new Date(),
			amount: plan.price
		}).catch(error => ctx.customResponse.error(error.message));

		if (entity === undefined) return;

		ctx.customResponse.success(objFilter(entity, [
			'No',
			'name',
			'userID',
			'planID',
			'createDate',
			'amount',
			'payment',
			'paymentDate',
			'description',
			'state'
		]));
	}
);

// 创建订单编号，确保唯一性
function createOrderNo() {
	return uuid.v4().split('-')[4];
}
