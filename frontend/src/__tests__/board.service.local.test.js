jest.mock('../services/http.service.js', () => ({
  httpService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}))

jest.mock('../services/user.service.js', () => ({
  userService: {
    getLoggedinUser: () => ({ _id: 'u_test', fullname: 'Test User' })
  }
}))

// polyfill structuredClone for the test environment
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))

const { boardService, ADD_TASK_COMMENT } = require('../services/board.service.local.js')

describe('board.service.local smoke', () => {
  test('updateTaskService - add comment (mocked http)', async () => {
    // prepare a board and mock httpService.get to return it
    const board = boardService.getEmptyBoard()
    board._id = 'board_test'
    // ensure at least one group and task exist
    board.groups = board.groups && board.groups.length ? board.groups : [boardService.getEmptyGroup()]
    const groupId = board.groups[0].id
    board.groups[0].tasks = board.groups[0].tasks && board.groups[0].tasks.length ? board.groups[0].tasks : [{ id: 't1', title: 'T1', comments: [] }]
    const taskId = board.groups[0].tasks[0].id

  // mock httpService.get used by internal getById to return our prepared board
  const mocked = require('../services/http.service.js')
  const mockHttp = mocked.httpService
  mockHttp.get.mockResolvedValue(board)

    const comment = { id: 'c1', txt: 'Hello', byMember: { fullname: 'Test User' }, createdAt: Date.now() }
    const result = await boardService.updateTaskService({ _id: 'board_test' }, { groupId, taskId, comment }, ADD_TASK_COMMENT)

    const updatedTask = result.groups.find(g => g.id === groupId).tasks.find(t => t.id === taskId)
    expect(Array.isArray(updatedTask.comments)).toBe(true)
    expect(updatedTask.comments[0]).toMatchObject({ id: 'c1', txt: 'Hello' })
  })
})
