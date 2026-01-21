const boardService = require('./board.service.js')
const logger = require('../../services/logger.service')
const asyncLocalStorage = require('../../services/als.service')

async function getBoards(req, res) {
  try {
    logger.debug('Getting Boards')
    const filterBy = {
      title: req.query.title || ''
    }
    
    // Get logged-in user from asyncLocalStorage for role-based filtering
    const { loggedinUser } = asyncLocalStorage.getStore() || {}
    
    const boards = await boardService.query(filterBy, loggedinUser)
    res.json(boards)
  } catch (err) {
    logger.error('Failed to get boards', err)
    res.status(500).send({ err: 'Failed to get boards' })
  }
}

async function getBoardById(req, res) {
  try {
    const boardId = req.params.id
    const { loggedinUser } = asyncLocalStorage.getStore() || {}
    
    const board = await boardService.getById(boardId, loggedinUser)
    
    if (!board) {
      return res.status(403).send({ err: 'Access denied to this board' })
    }
    
    res.json(board)
  } catch (err) {
    logger.error('Failed to get board', err)
    res.status(500).send({ err: 'Failed to get board' })
  }
}

async function addBoard(req, res) {
  const { loggedinUser } = asyncLocalStorage.getStore() || {}

  try {
    const board = req.body
    board.owner = loggedinUser
    
    // Set company info from logged-in user
    if (loggedinUser && loggedinUser.companyName) {
      board.companyName = loggedinUser.companyName
    }
    
    // Set default visibility if not provided
    if (!board.visibility) {
      board.visibility = 'public'
    }
    
    // Initialize allowedUsers array if not provided
    if (!board.allowedUsers) {
      board.allowedUsers = []
    }
    
    const addedBoard = await boardService.add(board)
    res.json(addedBoard)
  } catch (err) {
    logger.error('Failed to add board', err)
    res.status(500).send({ err: 'Failed to add board' })
  }
}

async function updateBoard(req, res) {
  try {
    const board = req.body
    const updatedBoard = await boardService.update(board)
    console.log('updatedBoardupdatedBoard', updatedBoard);
    res.json(updatedBoard)
  } catch (err) {
    logger.error('Failed to update board', err)
    res.status(500).send({ err: 'Failed to update board' })

  }
}

async function removeBoard(req, res) {
  try {
    const boardId = req.params.id
    const removedId = await boardService.remove(boardId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove board', err)
    res.status(500).send({ err: 'Failed to remove board' })
  }
}

async function addBoardMsg(req, res) {
  const { loggedinUser } = req
  try {
    const boardId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedinUser
    }
    const savedMsg = await boardService.addBoardMsg(boardId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update board', err)
    res.status(500).send({ err: 'Failed to update board' })

  }
}

async function removeBoardMsg(req, res) {
  const { loggedinUser } = req
  try {
    const boardId = req.params.id
    const { msgId } = req.params

    const removedId = await boardService.removeBoardMsg(boardId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove board msg', err)
    res.status(500).send({ err: 'Failed to remove board msg' })

  }
}

async function trackBoardView(req, res) {
  try {
    const boardId = req.params.id
    const { loggedinUser } = asyncLocalStorage.getStore() || {}
    
    if (!loggedinUser) {
      return res.status(401).send({ err: 'Not authenticated' })
    }
    
    const updatedBoard = await boardService.trackView(boardId, loggedinUser)
    res.json(updatedBoard)
  } catch (err) {
    logger.error('Failed to track board view', err)
    res.status(500).send({ err: 'Failed to track board view' })
  }
}

module.exports = {
  getBoards,
  getBoardById,
  addBoard,
  updateBoard,
  removeBoard,
  addBoardMsg,
  removeBoardMsg,
  trackBoardView
}
