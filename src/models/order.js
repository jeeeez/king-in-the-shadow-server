/**
 * 订单
 * @authors Picker Lee (https://github.com/jeezlee)
 * @email   450994392@qq.com
 * @date    2017-02-13 21:01:00
 */

import mongoose from './mongodb';
import Decorator from './decorator';

const Schema = mongoose.Schema;

const schema = new Schema({
	No: String, // 订单编号
	name: String, // 订单名称
	userID: String, // 用户ID
	planID: String, // 套餐ID
	createDate: Number, // 创建时间
	amount: Number, // 订单金额
	payment: Number, // 实付金额
	paymentDate: Number, // 付款时间
	description: String, // 订单描述（付款记录）
	state: Number // 订单状态 0:未付款 1:已付款 2:过期 100:已删除
}, { collection: 'orders' });


const OrderModel = mongoose.model('order', schema);

@Decorator.ALL(OrderModel)
export default new class Order {}();
