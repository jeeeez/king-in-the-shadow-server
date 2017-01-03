// @see:https://help.aliyun.com/document_detail/29456.html
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
	"host": "smtpdm.aliyun.com",
	"port": 25,
	"secureConnection": true, // use SSL
	"auth": {
		"user": 'noreply@fjvpn.com', // user name
		"pass": 'ALIyun5383139' // password
	}
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
	from: '非匠<noreply@fjvpn.com>', // sender address mailfrom must be same with the user
	to: '450994392@qq.com', // list of receivers
	// cc: 'haha<xxx@xxx.com>', // copy for receivers
	// bcc: 'haha<xxxx@xxxx.com>', // secret copy for receivers
	subject: 'Hello', // Subject line
	text: 'Hello world', // plaintext body
	html: `
			<div>
			    <div style="float:left;width:200px;font-size:30px;color:green;">
			        非匠VPN
			    </div>
			    <div style="margin-left:200px;border-left:2px solid #b2b2b2;">
			        <p style="line-height:30px;color:#b2b2b2;font-size:14px;">
			            本邮件内容由系统自动发送，请勿直接回复
			        </p>
			    </div>
			</div>
			<div>
			    亲爱的客户 PickerLee 您好
			</div>`, // html body
	attachments: [
		// {
		// 	filename: 'text0.txt',
		// 	content: 'hello world!'
		// }, {
		// 	filename: 'text1.txt',
		// 	path: './app.js'
		// }, {
		// 	filename: 'test.JPG',
		// 	path: './Desert.jpg',
		// 	cid: '01'
		// }
	]
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info) {
	if (error) {
		return console.log(error);
	}
	console.log('Message sent: ' + info.response);

});
