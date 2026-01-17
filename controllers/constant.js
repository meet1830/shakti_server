import Constant from "../models/constant.js";

export const getConstants = async (req, res) => {
  try {
    const allConstants = await Constant.find({});

    const constants = {};
    allConstants.forEach((constant) => {
      constants[constant.key] = constant.value;
    });

    res.status(200).json({
      success: true,
      constants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve constants",
      error: error.message,
    });
  }
};
