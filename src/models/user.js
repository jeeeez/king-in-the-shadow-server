import G from '../constants';
import mongoose from './mongodb';
import Decorator from './decorator';

const Schema = mongoose.Schema;

const schema = new Schema({
	email: String,
	password: String,

	// 注册用的验证码
	signature: String,

	// 忘记密码用的验证码
	retrieveCode: String,

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
