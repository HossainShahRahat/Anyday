const Cryptr = require("cryptr");
const bcrypt = require("bcrypt");
const userService = require("../user/user.service");
const logger = require("../../services/logger.service");
const cryptr = new Cryptr(process.env.SECRET1 || "Secret-Puk-1234");

module.exports = {
  signup,
  login,
  getLoginToken,
  validateToken,
};

async function login(email, password, isSocialMedia) {
  logger.debug(`auth.service - login with email: ${email}`);

  const user = await userService.getByUsername(email);
  if (!user) return Promise.reject("Invalid email or password");
  // If user is not approved, reject login (unless Founder or approved)
  if (user.role !== "Founder" && !user.approved)
    return Promise.reject("User not approved");
  // Check password for non-social logins
  if (!isSocialMedia) {
    const match = await bcrypt.compare(password, user.password);
    if (!match) return Promise.reject("Invalid email or password");
  }
  delete user.password;
  user._id = user._id.toString();
  return user;
}

async function signup({ email, password, fullname, imgUrl, companyName, role }) {
  const saltRounds = 10;

  logger.debug(
    `auth.service - signup with email: ${email}, fullname: ${fullname}, role: ${role}, companyName: ${companyName}`,
  );
  if (!email || !password || !fullname)
    return Promise.reject("Missing required signup information");

  const userExist = await userService.getByUsername(email);
  if (userExist) return Promise.reject("Username already taken");

  const hash = await bcrypt.hash(password, saltRounds);
  // New signups default to Employee role and require approval unless specified
  const userToSave = { email, password: hash, fullname, imgUrl, companyName, role };
  // Service layer will set defaults for role/approved if not provided
  return userService.add(userToSave);
}

function getLoginToken(user) {
  const userInfo = {
    _id: user._id,
    fullname: user.fullname,
    isAdmin: user.isAdmin,
    role: user.role,
    companyName: user.companyName || null,
  };
  return cryptr.encrypt(JSON.stringify(userInfo));
}

function validateToken(loginToken) {
  try {
    const json = cryptr.decrypt(loginToken);
    const loggedinUser = JSON.parse(json);
    return loggedinUser;
  } catch (err) {
    console.log("Invalid login token");
  }
  return null;
}
