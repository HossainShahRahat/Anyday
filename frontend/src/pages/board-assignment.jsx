import React, { useEffect, useState } from 'react'
import { NavBar } from '../cmps/nav-bar'
import { userService } from '../services/user.service'
import { boardService } from '../services/board.service'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { Icon } from 'monday-ui-react-core'
import { Board, Person, Check, Close } from 'monday-ui-react-core/icons'
import { Loader } from 'monday-ui-react-core'

export function BoardAssignmentPage() {
  const loggedInUser = userService.getLoggedinUser()
  const [boards, setBoards] = useState([])
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [assignments, setAssignments] = useState({}) // { boardId: [userId1, userId2] }

  useEffect(() => {
    if (!loggedInUser) return
    
    let isMounted = true
    
    async function loadData() {
      setIsLoading(true)
      try {
        // Load all boards for the company
        const allBoards = await boardService.query()
        const companyBoards = allBoards.filter(
          board => board.companyName === loggedInUser.companyName
        )
        if (!isMounted) return
        setBoards(companyBoards)

        // Load all employees
        const allUsers = await userService.getUsers()
        const companyEmployees = allUsers.filter(
          user => user.companyName === loggedInUser.companyName && 
                  user.role === 'Employee' && 
                  user.approved
        )
        if (!isMounted) return
        setEmployees(companyEmployees)

        // Load current assignments
        const currentAssignments = {}
        companyBoards.forEach(board => {
          currentAssignments[board._id] = board.allowedUsers || []
        })
        if (!isMounted) return
        setAssignments(currentAssignments)
      } catch (err) {
        if (!isMounted) return
        showErrorMsg('Failed to load data')
        console.error('Error loading data:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [loggedInUser?._id, loggedInUser?.companyName])

  async function toggleAssignment(boardId, userId) {
    try {
      const board = boards.find(b => b._id === boardId)
      if (!board) return

      const currentAssigned = assignments[boardId] || []
      const isAssigned = currentAssigned.includes(userId)

      let updatedAssigned
      if (isAssigned) {
        // Remove assignment
        updatedAssigned = currentAssigned.filter(id => id !== userId)
      } else {
        // Add assignment
        updatedAssigned = [...currentAssigned, userId]
      }

      // Update board
      const updatedBoard = {
        ...board,
        allowedUsers: updatedAssigned,
        visibility: updatedAssigned.length === 0 ? 'public' : 'private'
      }

      await boardService.save(updatedBoard)

      // Update local state
      setAssignments(prev => ({
        ...prev,
        [boardId]: updatedAssigned
      }))

      showSuccessMsg(
        isAssigned 
          ? 'Employee removed from board' 
          : 'Employee assigned to board'
      )
    } catch (err) {
      showErrorMsg('Failed to update assignment')
      console.error('Error updating assignment:', err)
    }
  }

  function isEmployeeAssigned(boardId, userId) {
    return (assignments[boardId] || []).includes(userId)
  }

  if (!loggedInUser || (loggedInUser.role !== 'Founder' && loggedInUser.role !== 'Co-Founder')) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only Founders and Co-Founders can assign boards to employees.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader size={Loader.sizes.LARGE} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ 
        flex: 1, 
        marginLeft: '65px',
        padding: '40px',
        backgroundColor: '#f5f6fa'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ 
              fontSize: '32px', 
              color: '#323338', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Board Assignment
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#676879',
              margin: 0
            }}>
              Assign boards to employees to control their access
            </p>
          </div>

          {employees.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Icon 
                iconType={Icon.type.SVG} 
                icon={Person} 
                iconSize={48} 
                style={{ color: '#676879', marginBottom: '20px' }}
              />
              <h2 style={{ 
                fontSize: '24px', 
                color: '#323338', 
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                No Employees Yet
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#676879',
                margin: 0
              }}>
                Approved employees will appear here for board assignment.
              </p>
            </div>
          ) : boards.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Icon 
                iconType={Icon.type.SVG} 
                icon={Board} 
                iconSize={48} 
                style={{ color: '#676879', marginBottom: '20px' }}
              />
              <h2 style={{ 
                fontSize: '24px', 
                color: '#323338', 
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                No Boards Available
              </h2>
              <p style={{ 
                fontSize: '16px', 
                color: '#676879',
                margin: 0
              }}>
                Create boards first to assign them to employees.
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f5f5f5',
                      borderBottom: '2px solid #e0e0e0'
                    }}>
                      <th style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#323338',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: '#f5f5f5',
                        zIndex: 10
                      }}>
                        Employee
                      </th>
                      {boards.map(board => (
                        <th 
                          key={board._id}
                          style={{
                            padding: '16px 20px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#323338',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            minWidth: '150px'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Icon iconType={Icon.type.SVG} icon={Board} iconSize={16} />
                            <span style={{ fontSize: '12px' }}>{board.title}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee, empIndex) => (
                      <tr 
                        key={employee._id}
                        style={{
                          borderBottom: empIndex < employees.length - 1 ? '1px solid #f0f0f0' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{
                          padding: '20px',
                          fontSize: '15px',
                          color: '#323338',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: '#fff',
                          zIndex: 5
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            {employee.imgUrl ? (
                              <img 
                                src={employee.imgUrl} 
                                alt={employee.fullname}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999'
                              }}>
                                <Icon iconType={Icon.type.SVG} icon={Person} iconSize={20} />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                {employee.fullname || employee.email}
                              </div>
                              <div style={{ fontSize: '13px', color: '#676879' }}>
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        {boards.map(board => {
                          const isAssigned = isEmployeeAssigned(board._id, employee._id)
                          return (
                            <td 
                              key={board._id}
                              style={{
                                padding: '20px',
                                textAlign: 'center'
                              }}
                            >
                              <button
                                onClick={() => toggleAssignment(board._id, employee._id)}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  border: 'none',
                                  backgroundColor: isAssigned ? '#00c875' : '#e0e0e0',
                                  color: isAssigned ? '#fff' : '#999',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = isAssigned ? '#00b368' : '#d0d0d0'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = isAssigned ? '#00c875' : '#e0e0e0'
                                }}
                                title={isAssigned ? 'Remove assignment' : 'Assign board'}
                              >
                                <Icon 
                                  iconType={Icon.type.SVG} 
                                  icon={isAssigned ? Check : Close} 
                                  iconSize={20} 
                                />
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
