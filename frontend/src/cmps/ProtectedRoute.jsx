import { Navigate } from 'react-router-dom';
import { userService } from '../services/user.service';

export function ProtectedRoute({ children }) {
  const loggedInUser = userService.getLoggedinUser();
  
  if (!loggedInUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
