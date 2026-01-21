import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { userService } from '../services/user.service.js'
import { loadUser, updateUser } from '../store/user.actions'
import { store } from '../store/store'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { socketService, SOCKET_EVENT_USER_UPDATED, SOCKET_EMIT_USER_WATCH } from '../services/socket.service'
import { NavBar } from '../cmps/nav-bar'
import { ImgUploader } from '../cmps/img-uploader'
import { Icon } from 'monday-ui-react-core'
import { Person, Email, Work, Location, Image } from 'monday-ui-react-core/icons'

export function UserDetails() {
  const loggedInUser = userService.getLoggedinUser()
  const params = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    address: '',
    companyName: '',
    imgUrl: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadUserData()
    if (params.id) {
      socketService.emit(SOCKET_EMIT_USER_WATCH, params.id)
      socketService.on(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
    }

    return () => {
      if (params.id) {
        socketService.off(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
      }
    }
  }, [params.id])

  async function loadUserData() {
    try {
      const userId = params.id || loggedInUser?._id
      if (!userId) {
        navigate('/login')
        return
      }
      await loadUser(userId)
      const watchedUser = store.getState().userModule.watchedUser
      const currentUser = watchedUser || loggedInUser
      if (currentUser) {
        setUser(currentUser)
        setFormData({
          fullname: currentUser.fullname || '',
          email: currentUser.email || '',
          address: currentUser.address || '',
          companyName: currentUser.companyName || '',
          imgUrl: currentUser.imgUrl || ''
        })
      }
    } catch (err) {
      showErrorMsg('Failed to load user data')
    }
  }

  function onUserUpdate(updatedUser) {
    showSuccessMsg(`User ${updatedUser.fullname} was updated`)
    store.dispatch({ type: 'SET_WATCHED_USER', user: updatedUser })
    setUser(updatedUser)
    setFormData({
      fullname: updatedUser.fullname || '',
      email: updatedUser.email || '',
      address: updatedUser.address || '',
      companyName: updatedUser.companyName || '',
      imgUrl: updatedUser.imgUrl || ''
    })
  }

  function handleChange({ target }) {
    const { name, value } = target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleImageUpload(imgUrl) {
    setFormData(prev => ({ ...prev, imgUrl }))
    if (user) {
      setUser(prev => ({ ...prev, imgUrl }))
    }
  }

  async function handleSave(ev) {
    ev.preventDefault()
    if (!user) return

    setIsSaving(true)
    try {
      const updatedUser = await updateUser({
        _id: user._id,
        ...formData
      })
      
      // Update local storage if it's the logged-in user
      if (loggedInUser && loggedInUser._id === updatedUser._id) {
        userService.saveLocalUser(updatedUser)
      }
      
      setUser(updatedUser)
      setFormData({
        fullname: updatedUser.fullname || '',
        email: updatedUser.email || '',
        address: updatedUser.address || '',
        companyName: updatedUser.companyName || '',
        imgUrl: updatedUser.imgUrl || ''
      })
      setIsEditing(false)
      toast.success('Profile updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })
    } catch (err) {
      showErrorMsg('Failed to update profile')
      console.error('Update error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        address: user.address || '',
        companyName: user.companyName || '',
        imgUrl: user.imgUrl || ''
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="loader">Loading user data...</div>
      </div>
    )
  }

  const isOwnProfile = loggedInUser && loggedInUser._id === user._id

  return (
    <section className="user-details-page">
      <NavBar />
      <div className="user-details-container" style={{ 
        maxWidth: '800px', 
        margin: '40px auto', 
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div className="user-details-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '30px',
          gap: '20px'
        }}>
          <div className="user-avatar-container" style={{ position: 'relative' }}>
            {formData.imgUrl ? (
              <img 
                src={formData.imgUrl} 
                alt={user.fullname}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #e0e0e0'
                }} 
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: '#999'
              }}>
                {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            {isEditing && (
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: '#0073ea',
                color: 'white',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                pointerEvents: 'none'
              }}>
                <Icon iconType={Icon.type.SVG} icon={Image} iconSize={18} />
              </div>
            )}
            {isEditing && (
              <div style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: '0', 
                width: '36px', 
                height: '36px', 
                overflow: 'hidden',
                zIndex: 10
              }}>
                <ImgUploader setImgSrc={handleImageUpload} />
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#323338' }}>
              {isEditing ? 'Edit Profile' : user.fullname || 'User'}
            </h1>
            {!isEditing && isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0073ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#323338', fontWeight: '500' }}>
                <Icon iconType={Icon.type.SVG} icon={Person} iconSize={16} />
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#323338', fontWeight: '500' }}>
                <Icon iconType={Icon.type.SVG} icon={Email} iconSize={16} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#323338', fontWeight: '500' }}>
                <Icon iconType={Icon.type.SVG} icon={Work} iconSize={16} />
                Company
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#323338', fontWeight: '500' }}>
                <Icon iconType={Icon.type.SVG} icon={Location} iconSize={16} />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0073ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f5f5f5',
                  color: '#323338',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="user-info" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="info-item" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px'
            }}>
              <Icon iconType={Icon.type.SVG} icon={Email} iconSize={20} />
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '16px', color: '#323338' }}>{user.email || 'Not provided'}</div>
              </div>
            </div>

            {user.companyName && (
              <div className="info-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
              }}>
                <Icon iconType={Icon.type.SVG} icon={Work} iconSize={20} />
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Company</div>
                  <div style={{ fontSize: '16px', color: '#323338' }}>{user.companyName}</div>
                </div>
              </div>
            )}

            {user.address && (
              <div className="info-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
              }}>
                <Icon iconType={Icon.type.SVG} icon={Location} iconSize={20} />
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Address</div>
                  <div style={{ fontSize: '16px', color: '#323338' }}>{user.address}</div>
                </div>
              </div>
            )}

            {user.role && (
              <div className="info-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
              }}>
                <Icon iconType={Icon.type.SVG} icon={Person} iconSize={20} />
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Role</div>
                  <div style={{ fontSize: '16px', color: '#323338' }}>{user.role}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
