import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userService } from "../services/user.service";
import { approveUser } from "../store/auth.actions";
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service";
import { Icon, Loader } from "monday-ui-react-core";
import { Check, Person, Work, Email } from "monday-ui-react-core/icons";

export default function FounderApprovalPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setIsLoading(true);
    try {
      const users = await userService.getUsers();
      // Filter out Founders (they're auto-approved) and only show pending Co-Founders and Employees
      const pending = (users || []).filter((u) => !u.approved && u.role !== "Founder");
      setPendingUsers(pending);
    } catch (err) {
      showErrorMsg("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function onApprove(userId) {
    setLoadingIds((prev) => new Set(prev).add(userId));
    try {
      await dispatch(approveUser(userId));
      // Remove approved user from list
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      showSuccessMsg("User approved successfully!");
    } catch (err) {
      showErrorMsg("Failed to approve user");
    } finally {
      setLoadingIds((prev) => {
        const s = new Set(prev);
        s.delete(userId);
        return s;
      });
    }
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Loader size={Loader.sizes.LARGE} />
      </div>
    );
  }

  if (!pendingUsers.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '40px auto'
      }}>
        <Icon 
          iconType={Icon.type.SVG} 
          icon={Check} 
          iconSize={48} 
          style={{ color: '#00c875', marginBottom: '20px' }}
        />
        <h2 style={{ 
          fontSize: '24px', 
          color: '#323338', 
          marginBottom: '10px',
          fontWeight: '600'
        }}>
          All Clear!
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: '#676879',
          margin: 0
        }}>
          No pending users to approve at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="founder-approval-panel" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0'
    }}>
      <div style={{
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '32px',
          color: '#323338',
          marginBottom: '8px',
          fontWeight: '600'
        }}>
          User Approvals
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#676879',
          margin: 0
        }}>
          Review and approve pending user registrations
        </p>
      </div>

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
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
                  letterSpacing: '0.5px'
                }}>
                  User
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#323338',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Company
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#323338',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Role
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#323338',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'right',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#323338',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user, index) => (
                <tr 
                  key={user._id}
                  style={{
                    borderBottom: index < pendingUsers.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{
                    padding: '20px',
                    fontSize: '15px',
                    color: '#323338'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      {user.imgUrl ? (
                        <img 
                          src={user.imgUrl} 
                          alt={user.fullname}
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
                        <div style={{
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          {user.fullname || user.fullName || user.username || 'Unknown User'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '20px',
                    fontSize: '15px',
                    color: '#323338'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Icon iconType={Icon.type.SVG} icon={Work} iconSize={16} style={{ color: '#676879' }} />
                      <span>{user.companyName || '-'}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '20px',
                    fontSize: '15px',
                    color: '#323338'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      backgroundColor: user.role === 'Founder' ? '#e3f2fd' : 
                                     user.role === 'Co-Founder' ? '#f3e5f5' : '#e8f5e9',
                      color: user.role === 'Founder' ? '#1976d2' : 
                            user.role === 'Co-Founder' ? '#7b1fa2' : '#388e3c'
                    }}>
                      {user.role || 'Employee'}
                    </span>
                  </td>
                  <td style={{
                    padding: '20px',
                    fontSize: '15px',
                    color: '#323338'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Icon iconType={Icon.type.SVG} icon={Email} iconSize={16} style={{ color: '#676879' }} />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '20px',
                    textAlign: 'right'
                  }}>
                    <button
                      onClick={() => onApprove(user._id)}
                      disabled={loadingIds.has(user._id)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: loadingIds.has(user._id) ? '#ccc' : '#00c875',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loadingIds.has(user._id) ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s',
                        opacity: loadingIds.has(user._id) ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingIds.has(user._id)) {
                          e.currentTarget.style.backgroundColor = '#00b368';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loadingIds.has(user._id)) {
                          e.currentTarget.style.backgroundColor = '#00c875';
                        }
                      }}
                    >
                      {loadingIds.has(user._id) ? (
                        <>
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <Icon iconType={Icon.type.SVG} icon={Check} iconSize={16} />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
