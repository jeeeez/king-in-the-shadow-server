/**
 * 邮件发送服务
 * @see:./email-example.js
 */


import nodemailer from 'nodemailer';

// create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
	'host': 'smtpdm.aliyun.com',
	'port': 25,
	'secureConnection': true, // use SSL
	'auth': {
		'user': 'noreply@fjvpn.com', // user name
		'pass': 'ALIyun5383139' // password
	}
});


const sender = (toEmail, subject, html) => {
	const opts = {
		from: '非匠<noreply@fjvpn.com>',
		to: toEmail,
		bcc: 'PickerLee<450994392@qq.com',
		subject,
		html
	};

	transporter.sendMail(opts, (error, info) => {
		// --TODO:此处做邮件发送失败记录处理，写入本地文件
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});
};


export default { sender };
