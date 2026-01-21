import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { userService } from '../services/user.service'
import { boardService } from '../services/board.service.local'
import { addBoard, loadBoards } from '../store/board.actions'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { store } from '../store/store'

import { Icon } from 'monday-ui-react-core'
import { Board } from 'monday-ui-react-core/icons'

export function Templates() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const boards = useSelector((storeState) => storeState.boardModule.boards) || []
    const loggedInUser = userService.getLoggedinUser()

    async function onShowTable() {
        // Check if user is logged in
        if (!loggedInUser) {
            navigate('/login')
            return
        }

        // Reload boards to get latest
        await dispatch(loadBoards())
        const currentBoards = store.getState().boardModule.boards || []

        // If boards exist, navigate to first board
        if (currentBoards.length > 0) {
            navigate(`/board/${currentBoards[0]._id}`)
            return
        }

        // If no boards exist, create a demo board
        try {
            const emptyBoard = boardService.getEmptyBoard()
            emptyBoard.title = 'My First Board'
            emptyBoard.companyName = loggedInUser.companyName
            emptyBoard.visibility = 'public'
            emptyBoard.allowedUsers = []
            emptyBoard.description = 'Welcome to your first board! This is a demo board that you can edit or remove.'
            
            const savedBoard = await dispatch(addBoard(emptyBoard))
            await dispatch(loadBoards())
            showSuccessMsg('Demo board created!')
            navigate(`/board/${savedBoard._id}`)
        } catch (err) {
            console.error('Error creating board:', err)
            showErrorMsg('Failed to create board')
        }
    }

    return <section className='templates-container flex'>
        <div className="template-picker" onClick={onShowTable} >
            <div><Icon iconType={Icon.type.SVG} icon={Board} iconSize={40} /></div> Show Table
        </div>
    </section>
}