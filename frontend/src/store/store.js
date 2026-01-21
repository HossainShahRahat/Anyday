import { createStore, combineReducers } from 'redux'

import { boardReducer } from './board.reducer.js'
import { userReducer } from './user.reducer.js'
import { systemReducer } from './system.reducer'
import { authReducer } from './auth.reducer'

const rootReducer = combineReducers({
    boardModule: boardReducer,
    userModule: userReducer,
    authModule: authReducer,
    systemModule: systemReducer,
})

const middleware = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__() : undefined
export const store = createStore(rootReducer, middleware)
