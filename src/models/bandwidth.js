import G from '../constants';
import mongoose from './mongodb';
import Decorator from './decorator';

const Schema = mongoose.Schema;

const schema = new Schema({
	port: Number,
	createDate: Number,
	nodeId: String,
	input: { type: Number, default: 0 },
	output: { type: Number, default: 0 }
}, { collection: 'bandwidth' });


const Model = mongoose.model('bandwidth', schema);


@Decorator.ALL(Model)
export default new class Bandwidth {}();
