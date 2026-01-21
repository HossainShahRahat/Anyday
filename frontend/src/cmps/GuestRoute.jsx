import { Navigate } from 'react-router-dom';
import { userService } from '../services/user.service';
import { store } from '../store/store';

export function GuestRoute({ children }) {
  const loggedInUser = userService.getLoggedinUser();
  
  if (loggedInUser) {
    // Get boards from store
    const boards = store.getState().boardModule.boards || [];
    // Redirect to first board if available, otherwise home
    if (boards.length > 0) {
      return <Navigate to={`/board/${boards[0]._id}`} replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
}
