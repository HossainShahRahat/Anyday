import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { userService } from '../services/user.service.js'
import { loginUser } from "../store/auth.actions";
import { loadBoards, addBoard } from "../store/board.actions";
import { boardService } from "../services/board.service.local";
import { store } from "../store/store";

import { Icon } from "monday-ui-react-core";
import { MoveArrowRight, LogIn } from "monday-ui-react-core/icons";

import logo from '../assets/img/logo.png'

export function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const boards = useSelector((storeState) => storeState.boardModule.boards) || []

    function handleChange({ target }) {
        let { value, name: field } = target
        setCredentials(prev => ({ ...prev, [field]: value }))
        setError("") // Clear error when user types
    }

    function getEmptyBoardByType(boardType) {
        const titles = {
            'dev board': 'Software Development',
            'marketing board': 'Marketing',
            'PRM board': 'Project Management',
            'CRM board': 'Sales & CRM'
        }
        
        const emptyBoardTemplate = boardService.getEmptyBoard();
        return {
            title: titles[boardType] || 'New Board',
            isStarred: false,
            groups: [],
            statuses: emptyBoardTemplate.statuses || [],
            priorities: emptyBoardTemplate.priorities || [],
            labelStatuses: emptyBoardTemplate.labelStatuses || [],
            cmpsOrder: emptyBoardTemplate.cmpsOrder || [],
            style: 'lightblue'
        }
    }

    function findBoardByType(boardsList, boardType) {
        const titleMap = {
            'dev board': 'Software Development',
            'marketing board': 'Marketing',
            'PRM board': 'Project Management',
            'CRM board': 'Sales & CRM'
        }
        
        const targetTitle = titleMap[boardType];
        return boardsList.find(board => board.title === targetTitle);
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
        if (!credentials.email.match(valid)) {
            setError("Please enter a valid email address");
            return;
        }
        
        if (!credentials.password) {
            setError("Please enter your password");
            return;
        }
        
        try {
            const user = await dispatch(loginUser(credentials));
            
            // Check if there's a pending template selection
            const pendingTemplate = sessionStorage.getItem('pendingTemplate');
            
            // Load boards after login
            await dispatch(loadBoards());
            const currentBoards = store.getState().boardModule.boards || [];
            
            // If no boards exist and there's a pending template, create default boards
            if (currentBoards.length === 0 && pendingTemplate) {
                await createDefaultBoards();
                await dispatch(loadBoards());
                const updatedBoards = store.getState().boardModule.boards || [];
                
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
            const errorMsg = err.response?.data?.err || err.message || "Invalid email or password";
            setError(errorMsg);
        }
    }

    return (
        <section className='login-page'>
            <Link to='/' className="top-header">
                <div className='login-signup-logo'>
                    <img className="login-logo" src={logo} alt="logo" /> Anyday<span>.com</span>
                </div>
            </Link>
            <div className="router-wrapper">
                <div className="email-password-container">
                    <h1 className="login-header">
                        <b>Log</b>{" In"}
                    </h1>

                    <div className="email-page-two">
                        <form className="email-password-input-and-button-container" onSubmit={onSubmitLogin}>
                            <div className="form-input-container">
                                <span className="email-password-label">Email</span>
                                <div className="email-input-container">
                                    <input
                                        onChange={handleChange}
                                        id="user_email"
                                        value={credentials.email}
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
                                        value={credentials.password}
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                            </div>
                            {error && (
                                <div style={{ 
                                    color: '#e2445c', 
                                    marginTop: '15px', 
                                    marginBottom: '15px', 
                                    fontSize: '14px',
                                    padding: '12px',
                                    backgroundColor: '#ffe5e5',
                                    borderRadius: '4px',
                                    border: '1px solid #e2445c',
                                    fontWeight: '500'
                                }}>
                                    {error}
                                </div>
                            )}
                            <div className="next-btn-wrapper">
                                <div className="next-btn-container">
                                    <button
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

                    <div className="login-seperator-container">
                        <div className="login-seperator">
                            <span className="seperator-line"></span>
                        </div>
                    </div>

                    <div className="suggest-signup-container">
                        <span className="signup-quest">Don't you have an account yet?</span>
                        <div>
                            <Link className="sign-up" to="/signup">Sign up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}