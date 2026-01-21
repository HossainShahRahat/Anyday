import { userService } from "../services/user.service.js";
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js";

export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";
export const APPROVE_USER = "APPROVE_USER";

export function signupUser(userData) {
  return async (dispatch) => {
    try {
      const user = await userService.signup(userData);
      dispatch({ type: SIGNUP_SUCCESS, user });
      showSuccessMsg("Signup successful");
      return user;
    } catch (err) {
      showErrorMsg("Signup failed");
      throw err;
    }
  };
}

export function loginUser(credentials) {
  return async (dispatch) => {
    try {
      const user = await userService.login(credentials);
      dispatch({ type: LOGIN_SUCCESS, user });
      showSuccessMsg("Login successful");
      return user;
    } catch (err) {
      showErrorMsg("Login failed");
      throw err;
    }
  };
}

export function logout() {
  return async (dispatch) => {
    await userService.logout();
    dispatch({ type: LOGOUT });
  };
}

export function approveUser(userId) {
  return async (dispatch) => {
    try {
      const updated = await userService.approve(userId);
      dispatch({ type: APPROVE_USER, user: updated });
      showSuccessMsg("User approved successfully");
      return updated;
    } catch (err) {
      console.error("AuthActions: err in approveUser", err);
      showErrorMsg("Cannot approve user");
      throw err;
    }
  };
}
