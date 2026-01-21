const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = {}, user = null) {
    try {
        const criteria = _buildCriteria(filterBy, user)

        const collection = await dbService.getCollection('board')
        var boards = await collection.find(criteria).toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

function _buildCriteria(filterBy, user = null) {
    const criteria = {}
    
    // Title filter (if provided)
    if (filterBy.title) {
        criteria.title = { $regex: filterBy.title, $options: 'i' }
    }

    // Role-based visibility filtering
    if (user) {
        const isFounder = user.role === 'Founder' || user.role === 'Co-Founder'
        
        if (isFounder) {
            // Founders/Co-Founders see all boards in their company
            if (user.companyName) {
                criteria.companyName = user.companyName
            }
        } else {
            // Employees see only public boards or boards they're assigned to
            const visibilityCriteria = {
                $or: [
                    { visibility: 'public' },
                    { visibility: { $exists: false } }, // Legacy boards (default to public)
                    { allowedUsers: { $in: [user._id] } }
                ]
            }
            
            // Filter by company
            if (user.companyName) {
                criteria.companyName = user.companyName
            }
            
            // Combine title filter with visibility criteria
            const andConditions = [visibilityCriteria]
            if (criteria.title) {
                andConditions.push({ title: criteria.title })
                delete criteria.title
            }
            
            criteria.$and = andConditions
        }
    }

    return criteria
}

async function getById(boardId, user = null) {
    try {
        const collection = await dbService.getCollection('board')
        const board = await collection.findOne({ _id: ObjectId(boardId) })
        
        if (!board) return null
        
        // Check permissions if user is provided
        if (user) {
            const isFounder = user.role === 'Founder' || user.role === 'Co-Founder'
            
            // Founders can access any board in their company
            if (isFounder) {
                if (user.companyName && board.companyName !== user.companyName) {
                    return null // Different company
                }
                return board
            }
            
            // Employees can only access:
            // 1. Public boards in their company
            // 2. Private boards they're assigned to
            if (board.companyName && board.companyName !== user.companyName) {
                return null // Different company
            }
            
            const isPublic = !board.visibility || board.visibility === 'public'
            const isAssigned = board.allowedUsers && board.allowedUsers.includes(user._id)
            
            if (!isPublic && !isAssigned) {
                return null // Private board, not assigned
            }
        }
        
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ _id: ObjectId(boardId) })
        return boardId
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        // Set default visibility and company info if not provided
        if (!board.visibility) {
            board.visibility = 'public' // Default to public for new boards
        }
        if (!board.allowedUsers) {
            board.allowedUsers = []
        }
        
        const collection = await dbService.getCollection('board')
        await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        const boardToSave = { ...board }
        delete boardToSave._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: ObjectId(board._id) }, { $set: boardToSave })
        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function addBoardMsg(boardId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: ObjectId(boardId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add board msg ${boardId}`, err)
        throw err
    }
}

async function removeBoardMsg(boardId, msgId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: ObjectId(boardId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add board msg ${boardId}`, err)
        throw err
    }
}

async function trackView(boardId, user) {
    try {
        const collection = await dbService.getCollection('board')
        const board = await collection.findOne({ _id: ObjectId(boardId) })
        
        if (!board) {
            throw new Error('Board not found')
        }
        
        // Initialize lastSeenBy array if it doesn't exist
        if (!board.lastSeenBy) {
            board.lastSeenBy = []
        }
        
        // Remove existing entry for this user if present
        board.lastSeenBy = board.lastSeenBy.filter(
            entry => entry.userId !== user._id.toString()
        )
        
        // Add new entry at the beginning
        const lastSeenEntry = {
            userId: user._id.toString(),
            fullname: user.fullname || user.username || 'Unknown',
            imgUrl: user.imgUrl || '',
            lastSeenAt: Date.now()
        }
        
        board.lastSeenBy.unshift(lastSeenEntry)
        
        // Keep only the last 10 users
        if (board.lastSeenBy.length > 10) {
            board.lastSeenBy = board.lastSeenBy.slice(0, 10)
        }
        
        // Update the board in database
        await collection.updateOne(
            { _id: ObjectId(boardId) },
            { $set: { lastSeenBy: board.lastSeenBy } }
        )
        
        // Return updated board
        return await getById(boardId)
    } catch (err) {
        logger.error(`cannot track view for board ${boardId}`, err)
        throw err
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addBoardMsg,
    removeBoardMsg,
    trackView
}
