const express = require("express");
const {
  registerUser,
  authUser,
  allUsersBySearch,
  getUserDetails,
  deleteUserDetails,
  addVideoLink,
  updateUserById,
  getVideoLinkDetails,
  sendEmail,
  verifyOtpEmail,
  sendOTPSignup,
  verifyOTPSignup,
  sendOTPLogin,
  verifyOTPLogin,
  processVideoLink,
  newSignup,
  newSignupVerify,
  newLogin,
  sendOTPEmail,
  resetPassword,
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
  getDesignationList,
  getAllVideos,
  sendBrevoEmailTest,
} = require("../controllers/userController");
const { protect } = require("../middleware/authController");
const { route } = require("express/lib/application");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsersBySearch);
router.route("/login").post(authUser);
router.route("/getDetailsByID").post(protect, getUserDetails);
router.route("/deleteUser").post(protect, deleteUserDetails);
router.route("/addVideoLink").post(protect, addVideoLink);
router.route("/updateUserdeatils").post(protect, updateUserById);
router.route("/getVideoLinkDetails").post(protect, getVideoLinkDetails);
router.route("/sendEmail").post(protect, sendEmail);
router.route("/verifyOtpEmail").post(protect, verifyOtpEmail);
router.route("/sendOTPSignup").post(sendOTPSignup);
router.route("/verifyOTPSignup").post(verifyOTPSignup);
router.route("/verifyOTPLogin").post(verifyOTPLogin);
router.route("/sendOTPLogin").post(sendOTPLogin);
router.route("/process_video").post(processVideoLink);
router.route("/newSignup").post(newSignup);
router.route("/newSignupVerify").post(newSignupVerify);
router.route("/newLogin").post(newLogin);
router.route("/sendOTPEmail").post(sendOTPEmail);
router.route("/resetPassword").post(resetPassword);
router.route("/getAllCountries").get(getAllCountries);
router.route("/getStatesByCountry/:countryId").get(getStatesByCountry);
router.route("/getCitiesByState/:stateId").get(getCitiesByState);
router.route("/getDesignationList").get(protect, getDesignationList);
router.route("/getAllVideos").get(protect, getAllVideos);


module.exports = router;
