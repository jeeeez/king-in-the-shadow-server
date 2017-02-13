/**
 * 服务套餐
 * @authors Picker Lee (https://github.com/pickerlee)
 * @email   450994392@qq.com
 * @date    2017-02-13 21:01:00
 */

import mongoose from './mongodb';
import Decorator from './decorator';

const Schema = mongoose.Schema;

const schema = new Schema({
	name: String, // 套餐名称
	price: Number, // 套餐价格
	month: Number, // 套餐时间（月）
	state: Boolean // 套餐状态
}, { collection: 'plans' });


const PlanModel = mongoose.model('plan', schema);

@Decorator.get(PlanModel)
@Decorator.create(PlanModel)
@Decorator.update(PlanModel)
@Decorator.getList(PlanModel)
@Decorator.count(PlanModel)
export default new class Plan {}();
