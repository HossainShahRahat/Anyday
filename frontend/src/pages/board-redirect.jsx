import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { store } from '../store/store'
import { loadBoards } from '../store/board.actions'

export function BoardRedirect() {
  const navigate = useNavigate()
  const boards = useSelector((storeState) => storeState.boardModule.boards) || []

  useEffect(() => {
    async function redirectToBoard() {
      try {
        // Load boards if not already loaded
        if (boards.length === 0) {
          await loadBoards()
        }
        
        // Get latest boards from store
        const currentBoards = store.getState().boardModule.boards || []
        
        // Redirect to first board if available, otherwise home
        if (currentBoards.length > 0) {
          navigate(`/board/${currentBoards[0]._id}`, { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } catch (err) {
        console.error('Failed to redirect to board:', err)
        navigate('/', { replace: true })
      }
    }
    
    redirectToBoard()
  }, [navigate, boards.length])

  return null
}
