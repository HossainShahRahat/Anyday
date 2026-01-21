import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { loginUser } from "../../store/auth.actions";
import { loadBoards, addBoard } from "../../store/board.actions";
import { boardService } from "../../services/board.service.local";
import { store } from "../../store/store";

import { Icon } from "monday-ui-react-core";
import { MoveArrowRight } from "monday-ui-react-core/icons";

export function LoginStepTwo({ props }) {
  const boards = useSelector((storeState) => storeState.boardModule.boards);
  const [loginCredentials, setLoginCredentials] = useState({
    email: props.credentials.email,
    username: "",
    password: "",
    fullname: "",
    imgUrl: "",
  });
  const navigate = useNavigate();

  function clearState() {
    setLoginCredentials({
      email: "",
      username: "",
      password: "",
      fullname: "",
      imgUrl: "",
    });
  }

  function handleChange({ target }) {
    let { value, name: field, type } = target;
    setLoginCredentials((prevMail) => ({ ...prevMail, [field]: value }));
  }

  const dispatch = useDispatch();
  const [error, setError] = useState("");
  
  function getEmptyBoardByType(boardType) {
    const titles = {
      'dev board': 'Software Development',
      'marketing board': 'Marketing',
      'PRM board': 'Project Management',
      'CRM board': 'Sales & CRM'
    }
    
    // Create a truly empty board with just basic structure
    const emptyBoardTemplate = boardService.getEmptyBoard();
    return {
      title: titles[boardType] || 'New Board',
      isStarred: false,
      groups: [], // Empty - no groups
      statuses: emptyBoardTemplate.statuses || [],
      priorities: emptyBoardTemplate.priorities || [],
      labelStatuses: emptyBoardTemplate.labelStatuses || [],
      cmpsOrder: emptyBoardTemplate.cmpsOrder || [],
      style: 'lightblue'
    }
  }

  function findBoardByType(boards, boardType) {
    const titleMap = {
      'dev board': 'Software Development',
      'marketing board': 'Marketing',
      'PRM board': 'Project Management',
      'CRM board': 'Sales & CRM'
    }
    
    const targetTitle = titleMap[boardType];
    return boards.find(board => board.title === targetTitle);
  }

  async function createDefaultBoards() {
    const boardTypes = ['dev board', 'marketing board', 'PRM board', 'CRM board'];
    
    try {
      for (const boardType of boardTypes) {
        const emptyBoard = getEmptyBoardByType(boardType);
        await dispatch(addBoard(emptyBoard));
      }
    } catch (err) {
      console.error('Error creating default boards:', err);
    }
  }
  
  async function onSubmitLogin(ev) {
    ev.preventDefault();
    setError(""); // Clear previous errors
    
    const valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!loginCredentials.email.match(valid)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!loginCredentials.password) {
      setError("Please enter your password");
      return;
    }
    
    try {
      const user = await dispatch(loginUser(loginCredentials));
      clearState();
      
      // Check if there's a pending template selection
      const pendingTemplate = sessionStorage.getItem('pendingTemplate');
      
      // Load boards after login
      await dispatch(loadBoards());
      const currentBoards = store.getState().boardModule.boards || [];
      
      // If no boards exist and there's a pending template, create default boards
      if (currentBoards.length === 0 && pendingTemplate) {
        await createDefaultBoards();
        // Reload boards after creating
        await dispatch(loadBoards());
        const updatedBoards = store.getState().boardModule.boards || [];
        
        // Find and navigate to the matching board
        const matchingBoard = findBoardByType(updatedBoards, pendingTemplate);
        if (matchingBoard) {
          sessionStorage.removeItem('pendingTemplate');
          navigate(`/board/${matchingBoard._id}`);
          return;
        }
      }
      
      // If boards exist and there's a pending template, navigate to matching board
      if (currentBoards.length > 0 && pendingTemplate) {
        const matchingBoard = findBoardByType(currentBoards, pendingTemplate);
        if (matchingBoard) {
          sessionStorage.removeItem('pendingTemplate');
          navigate(`/board/${matchingBoard._id}`);
          return;
        }
      }
      
      // Default navigation
      if (currentBoards.length > 0) {
        navigate(`/board/${currentBoards[0]._id}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      // Error message is already shown via showErrorMsg in auth.actions
      // Set local error state for display
      const errorMsg = err.response?.data?.err || err.message || "Invalid email or password";
      setError(errorMsg);
      // Stay on login page - don't navigate
    }
  }
  return (
    <section className="login-step-two">
      <div className="router-wrapper">
        <div className="email-password-container">
          <h1 className="login-header">
            <b>Log</b>
            {" In"}
          </h1>

          <div className="email-page-two">
            <form className="email-password-input-and-button-container">
              <div className="form-input-container">
                <span className="email-password-label">Email</span>
                <div className="email-input-container">
                  <input
                    onChange={handleChange}
                    id="user_email"
                    value={props.credentials.email}
                    placeholder="Example@company.com"
                    type="email"
                    name="email"
                    className="email-input"
                    aria-label="Enter your work email address"
                    required
                  />
                </div>
              </div>
              <div className="form-input-container">
                <span className="email-password-label">Password</span>
                <div className="password-input-container">
                  <input
                    onChange={handleChange}
                    className="password-input"
                    id="user_password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              {error && (
                <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px', fontSize: '14px' }}>
                  {error}
                </div>
              )}
              <div className="next-btn-wrapper">
                <div className="next-btn-container">
                  <button
                    onClick={onSubmitLogin}
                    type="submit"
                    className="next-btn"
                  >
                    <div className="next-wrapper">Log in</div>
                    <div className="right-arrow-icon">
                      <Icon
                        iconType={Icon.type.SVG}
                        icon={MoveArrowRight}
                        iconSize={18}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="login-to-other-acc">
            <button
              onClick={() => props.setLoginPaging("login-step-1")}
              className="other-acc-btn"
            >
              Login to another account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
