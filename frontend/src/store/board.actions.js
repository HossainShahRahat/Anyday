import { boardService, ON_DRAG_CARD, ON_DRAG_GROUP, ON_DRAG_LABEL, ON_DRAG_STATUS, ON_DRAG_TASK, ADD_TASK_COMMENT } from "../services/board.service.local.js";
import { store } from './store.js'
import { ADD_BOARD, REMOVE_BOARD, SET_BOARDS, UPDATE_BOARD, SET_BOARD, SET_PREV_BOARD } from "./board.reducer.js";
import { socketService, SOCKET_EMIT_UPDATE_BOARD } from "../services/socket.service.js";

// Action Creators:
export function getActionRemoveboard(boardId) {
    return {
        type: REMOVE_BOARD,
        boardId
    }
}

export function getActionAddboard(board) {
    return {
        type: ADD_BOARD,
        board
    }
}

export function getActionUpdateboard(board) {
    return {
        type: UPDATE_BOARD,
        board
    }
}

export async function loadBoard(boardId, filterBy) {
    try {
        const board = await boardService.getById(boardId, filterBy)
        store.dispatch({ type: SET_BOARD, board })
        return board
    } catch (err) {
        console.log('Cannot load board', err)
        throw err
    }
}

export async function loadBoards() {
    try {
        const boards = await boardService.query()
        store.dispatch({ type: SET_BOARDS, boards })
    } catch (err) {
        console.log('Cannot load boards', err)
        throw err
    }
}

export async function duplicateBoard(board) {
    try {
        const duplicatedBoard = await boardService.duplicate(board)
        store.dispatch(getActionAddboard(duplicatedBoard))
    } catch (err) {
        console.log('Cannot duplicate board', err)
        throw err
    }
}

export async function removeBoard(boardId) {
    try {
        await boardService.remove(boardId)
        store.dispatch(getActionRemoveboard(boardId))
    } catch (err) {
        console.log('Cannot remove board', err)
        throw err
    }
}

export async function addBoard(board) {
    try {
        const savedBoard = await boardService.save(board)
        store.dispatch(getActionAddboard(savedBoard))
        return savedBoard
    } catch (err) {
        console.log('Cannot add board', err)
        throw err
    }
}

export async function updateBoard(board, data, type) {
    try {
        const boardToUpdate = await boardService.updateBoardService(board, data, type)
        store.dispatch(getActionUpdateboard(boardToUpdate))
        const savedBoard = await boardService.save(boardToUpdate)
        socketService.emit(SOCKET_EMIT_UPDATE_BOARD, savedBoard._id)
        return savedBoard
    } catch (err) {
        throw err
    }
}

export async function updateGroup(board, data, type) {
    try {
        const boardToUpdate = await boardService.updateGroupsService(board, data, type)
        store.dispatch(getActionUpdateboard(boardToUpdate))
        const savedBoard = await boardService.save(boardToUpdate)
        socketService.emit(SOCKET_EMIT_UPDATE_BOARD, savedBoard._id)
        return savedBoard
    } catch (err) {
        console.log('Cannot save board', err)
        throw err
    }
}

export async function updateTask(board, data, type) {
    try {
        const boardToUpdate = await boardService.updateTaskService(board, data, type)
        store.dispatch(getActionUpdateboard(boardToUpdate))
        const savedBoard = await boardService.save(boardToUpdate)
        socketService.emit(SOCKET_EMIT_UPDATE_BOARD, savedBoard._id)
        return savedBoard
    } catch (err) {
        console.log('Cannot save board', err)
        throw err
    }
}

export async function addTaskComment(board, groupId, taskId, txt, imgUrl = '', byMember = null) {
    try {
        const comment = boardService.getEmptyTaskComment(txt, imgUrl, byMember)
        const taskChanges = { comment, taskId, groupId }
        return await updateTask(board, taskChanges, ADD_TASK_COMMENT)
    } catch (err) {
        console.log('Cannot add task comment', err)
        throw err
    }
}

export function setPrevBoard(board) {
    store.dispatch({ type: SET_PREV_BOARD, prevBoard: board })
}

export function onGroupDragStart(board) {
    const newBoard = structuredClone(board)
    // avoid mutating group objects in-place; create new group objects with isCollapsed true
    newBoard.groups = (newBoard.groups || []).map(group => ({ ...(group || {}), isCollapsed: true }))
    store.dispatch({ type: SET_BOARD, board: newBoard })
}

export function handleOnDragEnd(res, data) {
    if (!res.destination) return
    let board
    if (data) {
        if (data.prevBoard) board = data.prevBoard
        if (data.board) board = data.board
    }
    // work on a deep clone to avoid mutating the original board in-place
    const boardCopy = board ? structuredClone(board) : { groups: [], statuses: [], cmpsOrder: [] }
    const { source, destination, type, draggableId } = res
    const draggedFromId = source.droppableId
    const draggedToId = destination.droppableId
    switch (type) {
        case 'task-list':
            if (source.droppableId !== destination.droppableId) {
                const sourceGroup = boardCopy.groups.find(group => group.id === draggedFromId)
                const destGroup = boardCopy.groups.find(group => group.id === draggedToId)
                const sourceTasks = sourceGroup && sourceGroup.tasks ? sourceGroup.tasks : []
                const destTasks = destGroup && destGroup.tasks ? destGroup.tasks : []
                const [removed] = sourceTasks.splice(source.index, 1)
                destTasks.splice(destination.index, 0, removed)
            } else {
                const group = boardCopy.groups.find(group => group.id === draggedFromId)
                const [removed] = (group.tasks || []).splice(source.index, 1)
                group.tasks.splice(destination.index, 0, removed)
            }
            return updateBoard(boardCopy, boardCopy.groups, ON_DRAG_GROUP)
        case 'group-list':
            // operate on a clone of the incoming group list to avoid mutating caller data
            const groupsToUpdate = structuredClone(data.grouplist || [])
            const [reorderedGroup] = groupsToUpdate.splice(res.source.index, 1)
            groupsToUpdate.splice(res.destination.index, 0, reorderedGroup)
            boardCopy.groups = groupsToUpdate
            store.dispatch({ type: SET_BOARD, board: boardCopy })
            return updateBoard(boardCopy, groupsToUpdate, ON_DRAG_GROUP)
        case 'label-list':
            const newOrderedLabels = structuredClone(data.cmpsOrder || [])
            const [reorderedLabel] = newOrderedLabels.splice(res.source.index, 1)
            newOrderedLabels.splice(res.destination.index, 0, reorderedLabel)
            boardCopy.cmpsOrder = newOrderedLabels
            return updateBoard(boardCopy, newOrderedLabels, ON_DRAG_LABEL)
        case 'statuses-list':
            const newOrderedStatuses = structuredClone(data.statuses || [])
            const [reorderedStatus] = newOrderedStatuses.splice(res.source.index, 1)
            newOrderedStatuses.splice(res.destination.index, 0, reorderedStatus)
            boardCopy.statuses = newOrderedStatuses
            return updateBoard(boardCopy, newOrderedStatuses, ON_DRAG_STATUS)
        case 'task-card':
            if (source.droppableId !== destination.droppableId) {
                const destStatus = boardCopy.statuses.find(status => status.id === draggedToId)
                const groupToUpdate = boardCopy.groups.find(group =>
                    (group.tasks || []).find(task => task.id === draggableId))
                const taskToUpdate = groupToUpdate && groupToUpdate.tasks ? groupToUpdate.tasks.find(task => task.id === draggableId) : null
                if (taskToUpdate && destStatus) taskToUpdate.status = destStatus.label
            } else {
                // reorder statuses array safely
                const statusIdx = boardCopy.statuses.findIndex(s => s.id === draggedFromId)
                if (statusIdx >= 0) {
                    const [removed] = boardCopy.statuses.splice(source.index, 1)
                    boardCopy.statuses.splice(destination.index, 0, removed)
                }
            }
            return updateBoard(boardCopy, boardCopy.groups, ON_DRAG_CARD)

        default:
            return updateGroup(boardCopy, boardCopy.groups, ON_DRAG_TASK)
    }
}
