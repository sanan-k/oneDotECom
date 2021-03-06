const { getUser } = require("../Service/userService");
const { hash } = require("../Helper/encryption");
const { generateJWT } = require("../Service/AuthService");
const {
  createSession,
  clearSession,
  checkSession,
} = require("../Service/Session");

const { sys_messages } = require("../config.json");

const login = async (ctx) => {
  const { userName, password } = ctx.params;
  const user = await getUser(userName);
  const hashedPassword = hash(password);

  if (user && hashedPassword === user.password) {
    const token = await generateJWT({ userName, role: user.role });
    const sessionCreated = createSession(token, user.role);
    if (sessionCreated) {
      return token;
    }

    throw ctx.Error(500, sys_messages.error.CREATE_SESSION_FAILED);
  }

  throw ctx.Error(400, sys_messages.error.INVALID_CREDENTIAL);
};

const logout = (ctx) => {
  const { token } = ctx.auth;

  if (checkSession(token)) {
    const sessionCleared = clearSession(token);
    if (sessionCleared) {
      return true;
    }

    throw ctx.Error(500, sys_messages.error.CLEAR_SESSION_FAILED);
  }

  return sys_messages.warning.SESSION_NOT_FOUND;
};

module.exports = {
  login,
  logout,
};
