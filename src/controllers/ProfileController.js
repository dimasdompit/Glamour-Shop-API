const { genSaltSync, compareSync, hashSync } = require('bcrypt');
const { response } = require('../helpers/response');
const { editValidation, addAddressVal } = require('../helpers/validation');
const { editUser, getData, addAddress } = require('../models/Profile');
const fs = require('fs');

module.exports = {
	editProfile: async (req, res) => {
		try {
			const id = req.decoded.result[0].id;
			req.body.password
				? (req.body.password = hashSync(req.body.password, genSaltSync(1)))
				: null;
			const data = req.body;
			const getUser = await getData(id);
			let oldImage = getUser[0].image;
			if (!req.fileValidationError) {
				const image = req.file ? req.file.filename : null;
				image !== null ? (data.image = image) : null;
				const validate = editValidation(data);
				if (validate.error === undefined) {
					const result = await editUser(data, id);
					if (result.affectedRows === 1 && oldImage !== 'user-default.png')
						fs.unlinkSync(`./src/images/users/${oldImage}`);
					return response(res, true, result, 200);
				}
				let errorMessage = validate.error.details[0].message;
				errorMessage = errorMessage.replace(/"/g, '');
				fs.unlinkSync(`./src/images/users/${data.image}`);
				return response(res, false, errorMessage, 400);
			}
			return response(res, false, req.fileValidationError, 400);
		} catch (error) {
			console.log(error);
			return response(res, false, 'Internal Server Error', 500);
		}
	},

	getMyAddress: async (req, res) => {
		try {
			const id = req.decoded.result[0].id;
			const data = req.body;
			data.user_id = id;
			const validate = addAddressVal(data);
			if (validate.error === undefined) {
				const result = await addAddress(data)
				if(result){
					return response(res, true, result, 200);
				}
			}
			let errorMessage = validate.error.details[0].message;
			errorMessage = errorMessage.replace(/"/g, '');
			return response(res, false, errorMessage, 400);
		} catch (error) {
			console.log(error);
			return response(res, false, 'Internal Server Error', 500);
		}
	},
};
