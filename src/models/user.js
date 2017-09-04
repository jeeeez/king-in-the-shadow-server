import G from '../constants';
import mongoose from './mongodb';
import Decorator from './decorator';

const Schema = mongoose.Schema;

const schema = new Schema({
	email: String,
	password: String,
	signature: String,
	createDate: Number,
	validated: Boolean,
	validateDate: Number,
	expireDate: Number,
	port: Number,
	auth: String,
	role: {
		type: String,
		default: G.accountRoles.member
	}
}, {
	collection: 'users'
});


const UserModel = mongoose.model('user', schema);

@Decorator.ALL(UserModel)
export default new class User {}();
