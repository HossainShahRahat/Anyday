import { boardService } from "../services/board.service.local"

export const SET_BOARD = 'SET_BOARD'
export const SET_PREV_BOARD = 'SET_PREV_BOARD'
export const SET_BOARDS = 'SET_BOARDS'
export const REMOVE_BOARD = 'REMOVE_BOARD'
export const ADD_BOARD = 'ADD_BOARD'
export const UPDATE_BOARD = 'UPDATE_BOARD'
export const UNDO_REMOVE_BOARD = 'UNDO_REMOVE_BOARD'
export const SET_FILTERBY = 'SET_FILTERBY'

// Default safely from service, but don't allow this import to crash the module
let defaultFilter = {}
try {
    if (boardService && typeof boardService.getDefaultFilter === 'function') {
        defaultFilter = boardService.getDefaultFilter()
    }
} catch (err) {
    // keep defaultFilter as empty object
}

const initialState = {
    // unified, explicit shape
    boards: [],        // list of boards
    board: null,       // single active board (null when none selected)
    isLoading: false,
    prevBoard: null,
    lastRemovedBoard: null,
    filterBy: defaultFilter
}

export function boardReducer(state = initialState, action = {}) {
    // Always operate on a copy
    let newState = { ...state }

    // Helper safe accessors
    const safeBoards = (state.boards && Array.isArray(state.boards)) ? state.boards : []

    switch (action.type) {
        case SET_BOARD: {
            // Ensure we don't set undefined
            const board = action.board === undefined ? null : action.board
            newState = { ...state, board }
            break
        }
        case SET_PREV_BOARD: {
            const prevBoard = action.prevBoard === undefined ? null : action.prevBoard
            newState = { ...state, prevBoard }
            break
        }
        case SET_BOARDS: {
            const boards = Array.isArray(action.boards) ? action.boards : []
            newState = { ...state, boards }
            break
        }
        case REMOVE_BOARD: {
            const boardId = action.boardId
            if (!boardId) break
            const lastRemovedBoard = safeBoards.find(b => b && b._id === boardId) || null
            const boards = safeBoards.filter(b => !(b && b._id === boardId))
            newState = { ...state, boards, lastRemovedBoard }
            // If we removed the currently selected board, unset it
            if (state.board && state.board._id === boardId) newState.board = null
            break
        }
        case ADD_BOARD: {
            const boardToAdd = action.board
            if (!boardToAdd) break
            newState = { ...state, boards: [...safeBoards, boardToAdd] }
            break
        }
        case UPDATE_BOARD: {
            const updated = action.board
            if (!updated || !updated._id) break
            const boards = safeBoards.map(b => (b && b._id === updated._id) ? updated : b)
            const board = (state.board && state.board._id === updated._id) ? updated : state.board
            newState = { ...state, boards, board }
            break
        }
        case UNDO_REMOVE_BOARD: {
            if (state.lastRemovedBoard) {
                const boards = [...safeBoards, state.lastRemovedBoard]
                newState = { ...state, boards, lastRemovedBoard: null }
            }
            break
        }
        case SET_FILTERBY: {
            const filterBy = (action.filterBy === undefined) ? state.filterBy : action.filterBy
            newState = { ...state, filterBy }
            break
        }
        default:
            return state
    }

    return newState
}
