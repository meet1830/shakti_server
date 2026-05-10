import Constant from "../models/constant.js";

export const getConstants = async (req, res) => {
  try {
    const allConstants = await Constant.find({});

    const constantsMap = {};
    allConstants.forEach((constant) => {
      constantsMap[constant.key] = constant.value;
    });

    res.status(200).json({
      success: true,
      constants: constantsMap,
      allConstants, // Added for admin table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve constants",
      error: error.message,
    });
  }
};

export const updateConstant = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const updatedConstant = await Constant.findByIdAndUpdate(
      id,
      { value },
      { new: true, runValidators: true }
    );

    if (!updatedConstant) {
      return res.status(404).json({
        success: false,
        message: "Constant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Constant updated successfully",
      constant: updatedConstant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update constant",
      error: error.message,
    });
  }
};
