import { useState, useEffect } from "react";

import {
  DATE_PICKER,
  LABEL_STATUS_PICKER,
  MEMEBER_PICKER,
  PRIORITY_PICKER,
  STATUS_PICKER,
  UPDATE_TASK_DATE,
  UPDATE_TASK_LABEL_STATUS,
  UPDATE_TASK_PRIORITY,
  UPDATE_TASK_STATUS,
  UPDATE_TASK_MEMBERS,
} from "../../services/board.service.local";

import {
  DialogContentContainer,
  DatePicker,
  Avatar,
  Search,
  Icon,
} from "monday-ui-react-core";
import { CloseSmall } from "monday-ui-react-core/icons";

// removed unused image imports to avoid ESLint warnings

import { userService } from "../../services/user.service.js";
import dayjs from "dayjs";

export function DynamicModal({ cmp, setIsModalOpen, onUpdateTaskLabel }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const users = await userService.getUsers();
      setUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      setUsers([]);
    }
  }

  function getDate(date) {
    setIsModalOpen(false);
    const data = cmp?.data ? { ...cmp.data } : {};
    const ts = date ? dayjs(date).unix() : null;
    onUpdateTaskLabel(UPDATE_TASK_DATE, data, ts);
  }

  function onStatusPick(status) {
    const data = cmp?.data ? { ...cmp.data } : {};
    onUpdateTaskLabel(UPDATE_TASK_STATUS, data, status);
  }

  function onPriorityPick(priority) {
    const data = cmp?.data ? { ...cmp.data } : {};
    onUpdateTaskLabel(UPDATE_TASK_PRIORITY, data, priority);
  }
  function onLabelStatusPick(labelStatus) {
    const data = cmp?.data ? { ...cmp.data } : {};
    onUpdateTaskLabel(UPDATE_TASK_LABEL_STATUS, data, labelStatus);
  }

  function onMemberPick(user, isDelete = false) {
    const data = cmp?.data ? { ...cmp.data, isDelete } : { isDelete };
    onUpdateTaskLabel(UPDATE_TASK_MEMBERS, data, user);
    setIsModalOpen(false);
  }

  // Defensive: if cmp or type is missing, render nothing
  if (!cmp || !cmp.type) return null;

  switch (cmp.type) {
    case STATUS_PICKER:
      return (
        <div
          onClick={() => setIsModalOpen(false)}
          className="status-picker-container"
          style={{
            left: (cmp.pos && cmp.pos.left) || 0,
            top: (cmp.pos && cmp.pos.top) || 0,
            position: "absolute",
          }}
        >
          <div className="arrow-up arrow-up-modal"></div>
          <div className="status-picker-view">
            {(cmp.info || []).map((status, idx) => {
              return (
                <button
                  onClick={() => onStatusPick(status.label)}
                  key={idx}
                  style={{ background: status.bgColor }}
                  className="status-picker"
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    case LABEL_STATUS_PICKER:
      return (
        <div
          onClick={() => setIsModalOpen(false)}
          className="status-picker-container"
          style={{
            left: (cmp.pos && cmp.pos.left) || 0,
            top: (cmp.pos && cmp.pos.top) || 0,
            position: "absolute",
          }}
        >
          <div className="arrow-up arrow-up-modal"></div>
          <div className="status-picker-view">
            {(cmp.info || []).map((labelStatus, idx) => {
              return (
                <button
                  onClick={() => onLabelStatusPick(labelStatus.label)}
                  key={idx}
                  style={{ background: labelStatus.bgColor }}
                  className="status-picker"
                >
                  {labelStatus.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    case MEMEBER_PICKER:
      return (
        <div
          className="member-picker-view"
          style={{
            left: (cmp.pos && cmp.pos.left) || 0,
            top: (cmp.pos && cmp.pos.top) || 0,
            position: "absolute",
          }}
        >
          <div className="members-dropdown">
            <DialogContentContainer className="monday-style-story-chips_search-bar">
              <div className="member-picker-user-container">
                <Icon
                  onClick={() => setIsModalOpen(false)}
                  className="member-picker-close-modal"
                  iconType={Icon.type.SVG}
                  icon={CloseSmall}
                  iconLabel="my bolt svg icon"
                  iconSize={18}
                />
                <div className="member-picker-user-delete-container">
                  {(cmp.info && Array.isArray(cmp.info.members)
                    ? cmp.info.members
                    : []
                  ).map((member) => (
                    <div
                      className="member-picker-user-delete"
                      key={member._id || Math.random()}
                    >
                      <Avatar
                        size={Avatar.sizes.SMALL}
                        src={member.imgUrl}
                        type={Avatar.types.IMG}
                        ariaLabel={member.fullname}
                      />
                      <span className="member-picker-user-delete-fullname">
                        {member.fullname}
                      </span>
                      <Icon
                        onClick={() => onMemberPick(member, true)}
                        className="member-picker-user-delete-btn"
                        iconType={Icon.type.SVG}
                        icon={CloseSmall}
                        iconLabel="my bolt svg icon"
                        iconSize={12}
                      />
                    </div>
                  ))}
                </div>
                <Search placeholder="Search names, positions, or a team" />
                <div className="member-picker-suggested">Suggested people</div>
                {users &&
                  users.map((user) => (
                    <div
                      key={user._id || Math.random()}
                      className="member-picker-user"
                      onClick={() => onMemberPick(user)}
                    >
                      <div className="member-picker-fullname">
                        {user.fullname}
                      </div>
                      <img
                        className="member-picker-img"
                        src={
                          user.imgUrl
                            ? user.imgUrl
                            : "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10228639569717408&height=50&width=50&ext=1677684524&hash=AeSzD8dsx8BSqcN34cg"
                        }
                        alt=""
                      />
                    </div>
                  ))}
              </div>
            </DialogContentContainer>
          </div>
        </div>
      );

    case DATE_PICKER:
      return (
        <div
          className="date-picker-view"
          style={{
            left: (cmp.pos && cmp.pos.left) || 0,
            top: (cmp.pos && cmp.pos.top) || 0,
            position: "absolute",
          }}
        >
          <div className="arrow-up arrow-up-modal"></div>
          <DialogContentContainer
            className={"styles.datepickerDialogContentContainer"}
          >
            <DatePicker data-testid="date-picker" onPickDate={getDate} />
          </DialogContentContainer>
        </div>
      );
    case PRIORITY_PICKER:
      return (
        <div
          onClick={() => setIsModalOpen(false)}
          className="status-picker-container"
          style={{ left: cmp.pos.left, top: cmp.pos.top, position: "absolute" }}
        >
          <div className="arrow-up arrow-up-modal"></div>
          <div className="status-picker-view">
            {(cmp.info || []).map((priority, idx) => {
              return (
                <button
                  onClick={() => onPriorityPick(priority.label)}
                  key={idx}
                  style={{ background: priority.bgColor }}
                  className="status-picker"
                >
                  {priority.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
}
