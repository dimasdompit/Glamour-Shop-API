const { response } = require("../helpers/response");
const {
  AddColorsValidation,
  UpdateColorsValidation,
} = require("../helpers/validation");
const {
  getAllColorsModel,
  getColorDetailsModel,
  addColorsModel,
  updateColorsModel,
  deleteColorsModel,
  getColorByNameModel,
} = require("../models/Colors");

module.exports = {
  /* ============ SHOW ALL Colors ============ */
  getAllColors: async (req, res) => {
    try {
      const result = await getAllColorsModel();
      if (result[0]) {
        return response(res, true, result, 200);
      }
      return response(res, false, `Colors Not Found`, 404);
    } catch (error) {
      console.log(error.message);
      return response(res, false, "Internal Server Error", 500);
    }
  },

  /* ============ SHOW CATEGORY DETAILS ============ */
  getColorDetails: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await getColorDetailsModel(id);
      if (result[0]) {
        return response(res, true, result, 200);
      }
      return response(res, false, `Color with ID = ${id} Not Found`, 404);
    } catch (error) {
      console.log(error);
      return response(res, false, "Internal Server Error", 500);
    }
  },

  /* ============ ADD Colors ============ */
  addColors: async (req, res) => {
    const data = req.body;
    const oldData = await getColorByNameModel(data.color);
    const existName = {
      ...oldData[0],
    };
    try {
      if (data.color === existName.color) {
        return response(res, false, "Color name is already exist!", 401);
      } else {
        const validation = AddColorsValidation(data);
        if (validation.error === undefined) {
          const result = await addColorsModel(data);
          return response(res, true, result, 201);
        }
        let errorMsg = validation.error.details[0].message;
        errorMsg = errorMsg.replace(/"/g, "");
        return response(res, false, errorMsg, 400);
      }
    } catch (error) {
      console.log(error);
      return response(res, false, "Internal Server Error", 500);
    }
  },

  /* ============ UPDATE Colors ============ */
  updateColors: async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    const oldData = await getColorByNameModel(data.color);
    const existName = {
      ...oldData[0],
    };
    try {
      if (data.color === existName.color) {
        return response(res, false, `Color name is already exist!`, 401);
      } else {
        const validation = UpdateColorsValidation(data);
        if (validation.error === undefined) {
          const result = await updateColorsModel(data, id);
          return response(res, true, result, 200);
        }
        let errorMsg = validation.error.details[0].message;
        errorMsg = errorMsg.replace(/"/g, "");
        return response(res, false, errorMsg, 400);
      }
    } catch (error) {
      console.log(error);
      return response(res, false, "Internal Server Error", 500);
    }
  },

  /* ============ DELETE Colors ============ */
  deleteColors: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await deleteColorsModel(id);
      if (result.affectedRows === 1) {
        return response(res, true, result, 200);
      }
      return response(res, false, `Colors with ID = ${id} Not Found`, 404);
    } catch (error) {
      console.log(error);
      return response(res, false, "Internal Server Error", 500);
    }
  },
};
