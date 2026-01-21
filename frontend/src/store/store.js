import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { boardReducer } from "./board.reducer.js";
import { userReducer } from "./user.reducer.js";
import { systemReducer } from "./system.reducer";
import { authReducer } from "./auth.reducer";

const rootReducer = combineReducers({
  boardModule: boardReducer,
  userModule: userReducer,
  authModule: authReducer,
  systemModule: systemReducer,
});

// Setup Redux DevTools and thunk middleware
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = composeEnhancers(applyMiddleware(thunk));

export const store = createStore(rootReducer, middleware);
