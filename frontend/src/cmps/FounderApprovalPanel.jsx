import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { userService } from '../services/user.service'
import { approveUser } from '../store/auth.actions'
import { showErrorMsg } from '../services/event-bus.service'

export default function FounderApprovalPanel() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loadingIds, setLoadingIds] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    setIsLoading(true)
    try {
      const users = await userService.getUsers()
      const pending = (users || []).filter(u => !u.approved)
      setPendingUsers(pending)
    } catch (err) {
      showErrorMsg('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  async function onApprove(userId) {
    setLoadingIds(prev => new Set(prev).add(userId))
    try {
      await dispatch(approveUser(userId))
      // remove approved user from list
      setPendingUsers(prev => prev.filter(u => u._id !== userId))
    } catch (err) {
      showErrorMsg('Approve failed')
    } finally {
      setLoadingIds(prev => {
        const s = new Set(prev)
        s.delete(userId)
        return s
      })
    }
  }

  if (isLoading) return <div>Loading pending users...</div>

  if (!pendingUsers.length) return <div>No pending users to approve.</div>

  return (
    <div className="founder-approval-panel">
      <h3>Pending Users</h3>
      <table className="approval-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Role</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map(user => (
            <tr key={user._id}>
              <td>{user.fullname || user.fullName || user.username}</td>
              <td>{user.companyName || '-'}</td>
              <td>{user.role || 'Employee'}</td>
              <td>{user.email}</td>
              <td>
                <button
                  onClick={() => onApprove(user._id)}
                  disabled={loadingIds.has(user._id)}
                >
                  {loadingIds.has(user._id) ? 'Approving...' : 'Approve'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
