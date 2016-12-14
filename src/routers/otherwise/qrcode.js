/**
 * 二维码接口
 * @authors Picker Lee (https://github.com/pickerlee)
 * @email   450994392@qq.com
 * @date    2016-10-08 22:26:24
 */

import qrcode from 'qr-image';
import router from '../router';

router.get('qrcode', async function(ctx, next) {
	const context = ctx.query.context || 'context is required';
	const imageBuffer = qrcode.imageSync(context, { type: 'png' });

	ctx.set('Content-Type', 'image/png');
	ctx.body = imageBuffer;

	// ctx.customResponse.success('data:image/png;base64,' + qrcode.imageSync(context, { type: 'png' }).toString('base64'));
});
