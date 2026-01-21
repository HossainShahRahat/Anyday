const dbService = require("../../services/db.service");
const logger = require("../../services/logger.service");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  query,
  getById,
  getByUsername,
  remove,
  update,
  add,
};

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy);
  try {
    const collection = await dbService.getCollection("user");
    var users = await collection.find(criteria).toArray();
    users = users.map((user) => {
      delete user.password;
      user.createdAt = ObjectId(user._id).getTimestamp();
      return user;
    });
    return users;
  } catch (err) {
    logger.error("cannot find users", err);
    throw err;
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection("user");
    const user = await collection.findOne({ _id: ObjectId(userId) });
    if (!user) return null;
    delete user.password;
    // Removed reviewService reference - not needed
    return user;
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err);
    throw err;
  }
}
async function getByUsername(email) {
  try {
    const collection = await dbService.getCollection("user");
    const user = await collection.findOne({ email });
    return user;
  } catch (err) {
    logger.error(`while finding user by email: ${email}`, err);
    throw err;
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection("user");
    await collection.deleteOne({ _id: ObjectId(userId) });
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err);
    throw err;
  }
}

async function update(user) {
  try {
    const prevUser = await getById(user._id);
    // Update allowed fields
    if (user.fullname !== undefined) prevUser.fullname = user.fullname;
    if (user.imgUrl !== undefined) prevUser.imgUrl = user.imgUrl;
    if (user.email !== undefined) prevUser.email = user.email;
    if (user.address !== undefined) prevUser.address = user.address;
    if (user.companyName !== undefined) prevUser.companyName = user.companyName;
    // Note: role and password should be updated through separate endpoints for security
    const userToSave = prevUser;
    const collection = await dbService.getCollection("user");
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave });
    return userToSave;
  } catch (err) {
    logger.error(`cannot update user ${user._id}`, err);
    throw err;
  }
}

async function approve(userId, approverId = null) {
  try {
    const collection = await dbService.getCollection("user");
    const update = { $set: { approved: true, approvedBy: approverId } };
    await collection.updateOne({ _id: ObjectId(userId) }, update);
    const saved = await getById(userId);
    return saved;
  } catch (err) {
    logger.error(`cannot approve user ${userId}`, err);
    throw err;
  }
}

async function add(user) {
  try {
    // Normalize fields and include optional auth/profile metadata
    const role = user.role || "Employee";
    // Founders are auto-approved, others need approval
    const isApproved = role === "Founder";
    
    const userToAdd = {
      email: user.email,
      password: user.password,
      fullname: user.fullname || user.fullName || "",
      username: user.userName || user.username || "",
      imgUrl: user.imgUrl || user.profileImage || "",
      address: user.address || "",
      companyName: user.companyName || "",
      role: role,
      approved: isApproved,
      approvedBy: isApproved ? null : user.approvedBy || null,
    };
    const collection = await dbService.getCollection("user");
    await collection.insertOne(userToAdd);
    return userToAdd;
  } catch (err) {
    logger.error("cannot add user", err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: "i" };
    criteria.$or = [
      {
        email: txtCriteria,
      },
      {
        fullname: txtCriteria,
      },
    ];
  }
  if (filterBy.minBalance) {
    criteria.score = { $gte: filterBy.minBalance };
  }
  return criteria;
}
