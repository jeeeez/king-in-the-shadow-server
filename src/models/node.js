/**
 * 服务器节点模型
 * @authors Picker Lee (https://github.com/li2274221)
 * @email   450994392@qq.com
 * @date    2016-10-09 12:49:00
 */

import mongoose from './mongodb';
import Decorator from './decorator';

const Schema = mongoose.Schema;

const schema = new Schema({
	name: String,
	host: String,
	port: Number,
	username: String,
	privateKeyPath: String,
	protocol: String,
	state: Boolean,
	createDate: Number
}, { collection: 'nodes' });


const NodeModel = mongoose.model('node', schema);

@Decorator.create(NodeModel)
@Decorator.update(NodeModel)
@Decorator.getList(NodeModel)
export default new class Node {}();
