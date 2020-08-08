const { genSaltSync, compareSync, hashSync } = require('bcrypt');
const { response } = require('../helpers/response');
const {
	RegisterValidation,
	LoginValidation,
	VerifyValidation,
} = require('../helpers/validation');
const {
	Register,
	Login,
	insertOTP,
	checkOTP,
	deleteOTP,
	updateUser,
} = require('../models/Auth');
const randomCode = require('randomatic');
const { sendOTP } = require('../helpers/sendEmail');
const {createToken} = require('../helpers/createToken');

module.exports = {
	Register: async (req, res) => {
		try {
			const data = req.body;
			const validation = RegisterValidation(data);
			if (validation.error === undefined) {
				data.password = hashSync(req.body.password, genSaltSync(1));
				const emailCheck = await Login(data.email);
				if (emailCheck.length === 0) {
					const result = await Register(data);
					data.code = randomCode('a0', 6);
					sendOTP(data);
					const otp = {
						code: data.code,
						email: result.email,
					};
					insertOTP(otp);
					delete result.password;
					return response(res, true, result, 200);
				}
				return response(res, false, 'Email has been registered', 400);
			}
			let errorMessage = validation.error.details[0].message;
			errorMessage = errorMessage.replace(/"/g, '');
			return response(res, false, errorMessage, 400);
		} catch (error) {
			console.log(error);
			return response(res, false, 'Internal Server Error', 500);
		}
	},

	Verification: async (req, res) => {
		try {
			const data = req.body;
			const validation = VerifyValidation(data);
			if (validation.error === undefined) {
				const codeCheck = await checkOTP(data.email);
				const emailCheck = await Login(data.email);

				if (emailCheck.length !== 0) {
					if (codeCheck.length !== 0) {
						if (
							data.code === codeCheck[0].code &&
							data.email === codeCheck[0].email
						) {
							const update = {
								is_active: 1,
							};
							await updateUser(update, data.email);
							await deleteOTP(data.email);
							return response(res, true, 'Verification Success', 200);
						}
						return console.log('no');
					}
					return console.log(emailCheck);
				}
			}
			let errorMessage = validation.error.details[0].message;
			errorMessage = errorMessage.replace(/"/g, '');
			console.log(errorMessage);
		} catch (error) {
			console.log(error);
		}
	},
	Login: async (req, res) => {
		try {
			const data = req.body;
			const validation = LoginValidation(data);
			if (validation.error === undefined) {
				const emailCheck = await Login(data.email);
				
				if (emailCheck.length !== 0) {
					if(emailCheck[0].is_active === 1){
						if(compareSync(data.password, emailCheck[0].password)){
							const token = createToken(emailCheck, process.env.JWT_KEY, '24h')
							emailCheck[0].token = token
							delete emailCheck[0].is_active
							delete emailCheck[0].password
							return response(res, true, emailCheck, 200)
						}
						return response(res, false, 'Password wrong', 400)
					}
					return response(res, false, 'Account is not verified', 400)
				}
				return response(res, false, 'Email is not registered', 404);
			}
			// const emailCheck = await Login
		} catch (error) {
			console.log(error);
		}
	},
};
