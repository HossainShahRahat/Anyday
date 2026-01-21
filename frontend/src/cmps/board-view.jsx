import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import { CHANGE_TITLE, CHANGE_DESCRIPTION } from "../services/board.service.local";
import { updateBoard } from "../store/board.actions";
import { utilService } from "../services/util.service";
import { userService } from "../services/user.service";
import { socketService, SOCKET_EVENT_BOARD_USERS, SOCKET_EMIT_JOIN_BOARD, SOCKET_EMIT_LEAVE_BOARD } from "../services/socket.service";

import {
  EditableHeading,
  Flex,
  AvatarGroup,
  Avatar,
  Icon,
  Tooltip,
} from "monday-ui-react-core";
import { Activity, Favorite, Info, Home } from "monday-ui-react-core/icons";

export function BoardView({ board }) {
  const [newTitle, setNewTitle] = useState(board?.title || "");
  const [description, setDescription] = useState(board?.description || "simple description");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [liveUsers, setLiveUsers] = useState([]);
  const loggedInUser = userService.getLoggedinUser();

  useEffect(() => {
    if (board?.title) {
      setNewTitle(board.title);
    }
  }, [board?.title]);

  useEffect(() => {
    if (board?.description !== undefined) {
      setDescription(board.description || "simple description");
    } else if (!board?.description) {
      setDescription("simple description");
    }
  }, [board?.description]);

  useEffect(() => {
    if (!board?._id || !loggedInUser) return;

    // Add current user to live users immediately
    setLiveUsers(prev => {
      if (!prev.find(u => u.userId === loggedInUser._id)) {
        return [...prev, {
          userId: loggedInUser._id,
          fullname: loggedInUser.fullname,
          imgUrl: loggedInUser.imgUrl
        }];
      }
      return prev;
    });

    // Join board room
    socketService.emit(SOCKET_EMIT_JOIN_BOARD, {
      boardId: board._id,
      user: {
        userId: loggedInUser._id,
        fullname: loggedInUser.fullname,
        imgUrl: loggedInUser.imgUrl
      }
    });

    // Listen for user join/leave events
    socketService.on(SOCKET_EVENT_BOARD_USERS, handleUserUpdate);

    return () => {
      // Leave board room
      socketService.emit(SOCKET_EMIT_LEAVE_BOARD, {
        boardId: board._id,
        user: {
          userId: loggedInUser._id,
          fullname: loggedInUser.fullname,
          imgUrl: loggedInUser.imgUrl
        }
      });
      socketService.off(SOCKET_EVENT_BOARD_USERS, handleUserUpdate);
      setLiveUsers([]);
    };
  }, [board?._id, loggedInUser?._id, loggedInUser?.fullname, loggedInUser?.imgUrl]);

  function handleUserUpdate({ type, user }) {
    setLiveUsers(prev => {
      if (type === 'join') {
        // Add user if not already present
        if (!prev.find(u => u.userId === user.userId)) {
          return [...prev, user];
        }
        return prev;
      } else if (type === 'leave') {
        // Remove user
        return prev.filter(u => u.userId !== user.userId);
      }
      return prev;
    });
  }

  function onFinishEditing() {
    updateBoard(board, newTitle, CHANGE_TITLE);
  }

  function handleChange(value) {
    value = !value ? board.title : value;
    setNewTitle(value);
  }

  function toggleDescription() {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  }

  // Combine live users with last seen users, prioritizing live users
  const allUsers = [];
  const liveUserIds = new Set(liveUsers.map(u => u.userId));
  
  // Add live users first
  liveUsers.forEach(user => {
    allUsers.push({ ...user, isLive: true });
  });
  
  // Add last seen users (excluding live ones)
  if (board?.lastSeenBy) {
    board.lastSeenBy.forEach(user => {
      if (!liveUserIds.has(user.userId)) {
        allUsers.push({ ...user, isLive: false });
      }
    });
  }

  return (
    <section className="board-view">
      <div className="board-header-main">
        <div className="board-header-top">
          <div className="board-header-left">
            <div className="board-title">
              <div className="monday-storybook-tooltip_bottom">
                <Tooltip content="Click to Edit" animationType="expand">
                  <EditableHeading
                    className="board-title-heading"
                    onFinishEditing={onFinishEditing}
                    onChange={handleChange}
                    type={EditableHeading.types.h1}
                    autoSize={true}
                    value={newTitle}
                  />
                </Tooltip>
              </div>
            </div>
            <div className="board-info-toggle">
              <div className="monday-storybook-tooltip_bottom">
                <Tooltip
                  content="Show board description"
                  animationType="expand"
                >
                  <button className="info-header">
                    <Icon
                      iconType={Icon.type.SVG}
                      ignoreFocusStyle={true}
                      icon={Info}
                      iconLabel="my bolt svg icon"
                      iconSize={20}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>
            <div className="star-header-container">
              <div className="monday-storybook-tooltip_bottom">
                <Tooltip content="Add to favorites" animationType="expand">
                  <button className="star">
                    <Icon
                      iconType={Icon.type.SVG}
                      ignoreFocusStyle={true}
                      icon={Favorite}
                      iconLabel="my bolt svg icon"
                      iconSize={20}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="board-header-right">
            <div className="board-actions">
              <div className="monday-storybook-tooltip_bottom">
                <Tooltip content="Board activity" animationType="expand">
                  <button className="activity-logger">
                    <Icon
                      iconType={Icon.type.SVG}
                      icon={Activity}
                      iconLabel="my bolt svg icon"
                      iconSize={20}
                    />
                  </button>
                </Tooltip>
              </div>

              {(allUsers.length > 0 || liveUsers.length > 0) && (
                <button className="last-seen-action">
                  <Flex direction={Flex.directions.ROW} gap={8} align={Flex.align.CENTER}>
                    <div>Last seen</div>
                    <AvatarGroup size={Avatar.sizes.SMALL} max={5}>
                      {allUsers.slice(0, 5).map((user) => {
                        const timeAgo = user.isLive ? 'Now' : utilService.time_ago(user.lastSeenAt);
                        const tooltipContent = `${user.fullname} - ${timeAgo}`;
                        return (
                          <Tooltip key={user.userId} content={tooltipContent} animationType="expand">
                            <div style={{ position: 'relative' }}>
                              <Avatar
                                type={Avatar.types.IMG}
                                src={user.imgUrl || 'https://static-00.iconduck.com/assets.00/profile-user-icon-256x256-zhsk04ey.png'}
                                ariaLabel={user.fullname}
                              />
                              {user.isLive && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  right: 0,
                                  width: '10px',
                                  height: '10px',
                                  backgroundColor: '#00c875',
                                  borderRadius: '50%',
                                  border: '2px solid #fff'
                                }} />
                              )}
                            </div>
                          </Tooltip>
                        );
                      })}
                    </AvatarGroup>
                  </Flex>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="board-header-description">
          <div 
            className="board-header-txt" 
            style={{ 
              whiteSpace: isDescriptionExpanded ? 'normal' : 'nowrap',
              overflow: isDescriptionExpanded ? 'visible' : 'hidden',
              textOverflow: isDescriptionExpanded ? 'clip' : 'ellipsis',
              maxWidth: isDescriptionExpanded ? 'none' : '600px',
              cursor: 'text',
              minWidth: '200px'
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newValue = e.target.textContent || "simple description";
              if (newValue !== description) {
                setDescription(newValue);
                updateBoard(board, newValue, CHANGE_DESCRIPTION);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.target.blur();
              }
            }}
          >
            {description}
          </div>
          {description && description.length > 100 && (
            <div className="description-modal" onClick={toggleDescription}>
              {isDescriptionExpanded ? 'See Less' : 'See More'}
            </div>
          )}
        </div>
        <div className="header-tablist">
          <div className="tablist-container">
            <div className="main-table-txt">
              <NavLink className="main-table-a" to={`/board/${board._id}`}>
                <Icon
                  iconType={Icon.type.SVG}
                  icon={Home}
                  iconSize={16}
                  style={{ marginRight: "5px" }}
                />
                Main Table
              </NavLink>
            </div>
            <span>|</span>
            <div className="kanban-a">
              <NavLink to={`/${board._id}/views/kanban`}>Kanban</NavLink>
            </div>
            <span>|</span>
            <div className="kanban-a">
              <NavLink to={`/${board._id}/views/dashboard`}>Dashboard</NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
