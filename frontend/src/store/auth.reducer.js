import { SIGNUP_SUCCESS, LOGIN_SUCCESS, LOGOUT, APPROVE_USER } from './auth.actions'

const initialState = {
    currentUser: null,
    pendingUsers: []
}

export function authReducer(state = initialState, action = {}) {
    switch (action.type) {
        case SIGNUP_SUCCESS:
            // new user may be pending approval
            return { ...state, currentUser: action.user }
        case LOGIN_SUCCESS:
            return { ...state, currentUser: action.user }
        case LOGOUT:
            return { ...state, currentUser: null }
        case APPROVE_USER:
            // move approved user out of pending list
            return { ...state, pendingUsers: state.pendingUsers.filter(u => u._id !== action.user._id) }
        default:
            return state
    }
}
