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
	const { state, planID, skip = 0, limit = 10 } = ctx.request.query;
	// 查询条件
	const condition = {};
	if (state) condition.state = Number(state);
	if (planID) condition.planID = planID;

	const orders = await Order.getList(condition, { skip: Number(skip), limit: Number(limit) }).exec().catch(error => ctx.customResponse.error(error.message));

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

	const { state, planID, skip = 0, limit = 10 } = ctx.request.query;
	// 查询条件
	const condition = {};
	if (userID) condition.userID = userID;
	if (planID) condition.planID = planID;
	if (state) condition.state = Number(state);

	const orders = await Order.getList(condition, { skip: Number(skip), limit: Number(limit) }).exec().catch(error => ctx.customResponse.error(error.message));

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
			state: 0,
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

/**
 * 获取订单信息
 * 仅超级管理员以及订单所属者可操作
 */
router.get('order/:orderNo', accountAuth.user, async function(ctx, next) {
	const user = ctx.session.user;
	const orderNo = ctx.params.orderNo;

	try {
		// 获取订单详细信息
		const order = await Order.get({ No: orderNo });
		if (!order) return ctx.customResponse.error('订单不存在');

		if (order.userID !== user._id && user.role !== G.accountRoles.superAdmin) {
			return ctx.customResponse.error('权限不足');
		}

		ctx.customResponse.success(order);
	} catch (error) {
		ctx.customResponse.error(error.message)
	}
});

/**
 * 删除订单
 * 1、仅超级管理员以及订单所属者可操作
 * 2、仅可删除未付款和过期状态的订单
 */
router.delete('order/:orderNo', accountAuth.user, async function(ctx, next) {
	const user = ctx.session.user;

	const orderNo = ctx.params.orderNo;

	// 获取订单详细信息
	const order = await Order.get({ No: orderNo }).catch(error => ctx.customResponse.error(error.message));

	if (order === undefined) return;

	if (!order) return ctx.customResponse.error('订单不存在');

	if (order.userID !== user._id && user.role !== G.accountRoles.superAdmin) {
		return ctx.customResponse.error('权限不足');
	}

	if (order.state === 1) {
		return ctx.customResponse.error('无法删除已付款的订单数据');
	}

	await Order.update({ No: orderNo }, { state: 100 }).then(() => {
		ctx.customResponse.success('删除成功');
	}).catch(error => ctx.customResponse.error(error.message));
});

// 创建订单编号，确保唯一性
function createOrderNo() {
	return uuid.v4().split('-')[4];
}
