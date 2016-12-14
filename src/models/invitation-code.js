/**
 * 注册邀请码
 * @authors Picker Lee (https://github.com/pickerlee)
 * @email   450994392@qq.com
 * @date    2016-10-27 16:10:55
 */

import mongoose from './mongodb';
import Decorator from './decorator';

const Schema = mongoose.Schema;

const schema = new Schema({
	code: String, // 邀请码
	inviterId: String, //邀请人 ID
	inviteeId: String, // 被邀请人 ID
	state: Number, // 邀请码状态
	createDate: Number, // 邀请码创建时间
	consumeDate: Number // 使用时间
}, { collection: 'invitationCodes' });


const InvitationCodeModel = mongoose.model('invitationCode', schema);

@Decorator.count(InvitationCodeModel)
@Decorator.instance(InvitationCodeModel)
@Decorator.create(InvitationCodeModel)
@Decorator.get(InvitationCodeModel)
@Decorator.update(InvitationCodeModel)
@Decorator.getList(InvitationCodeModel)
export default new class InvitationCode {}();
