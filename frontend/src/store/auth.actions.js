import { userService } from "../services/user.service.js";
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js";
import { boardService as boardServiceLocal } from "../services/board.service.local.js";
import { boardService } from "../services/board.service.js";
import { addBoard } from "./board.actions.js";

export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";
export const APPROVE_USER = "APPROVE_USER";

export function signupUser(userData) {
  return async (dispatch) => {
    try {
      const user = await userService.signup(userData);
      dispatch({ type: SIGNUP_SUCCESS, user });
      
      // If user is Founder and approved (auto-approved), create a demo board for new company
      if (user.role === 'Founder' && user.approved && user.companyName) {
        try {
          // Check if company already has boards
          const allBoards = await boardService.query();
          const companyBoards = allBoards.filter(b => b.companyName === user.companyName);
          
          // Only create demo board if company has no boards
          if (companyBoards.length === 0) {
            const demoBoard = boardServiceLocal.getEmptyBoard();
            demoBoard.title = 'My First Board';
            demoBoard.companyName = user.companyName;
            demoBoard.visibility = 'public';
            demoBoard.allowedUsers = [];
            demoBoard.description = 'Welcome to your first board! This is a demo board that you can edit or remove.';
            
            await dispatch(addBoard(demoBoard));
            showSuccessMsg('Demo board created for your company!');
          }
        } catch (boardErr) {
          console.error('Error creating demo board:', boardErr);
          // Don't fail signup if board creation fails
        }
      }
      
      // Success message handled in signup component with toastify
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
      // Show specific error message from backend
      const errorMsg = err.response?.data?.err || err.message || "Invalid email or password";
      showErrorMsg(errorMsg);
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
