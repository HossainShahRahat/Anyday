import { EditableHeading } from 'monday-ui-react-core'
import { CHANGE_TASK_TITLE, DELETE_TASK, DUPLICATE_TASK } from '../../services/board.service.local'
import { updateTask } from '../../store/board.actions'
import { MenuButton, Menu, MenuItem } from 'monday-ui-react-core'
import { Open, Duplicate, Delete } from 'monday-ui-react-core/icons'
import { useState } from 'react'
import { showSuccessMsg } from '../../services/event-bus.service'
import { TaskDetails } from '../task-details'

export function TaskCard({ task, group, board, snapshot }) {

    const safeBoard = board || { groups: [] }
    const safeGroup = group || { id: 'group-unknown' }
    const safeTask = task || { id: 'task-unknown', title: '' }

    const [isOpenDetails, setIsOpenDetails] = useState(false)

    function onDuplicateTask(taskToDuplicate) {
        const data = { taskToDuplicate, id: taskToDuplicate.id, groupId: safeGroup.id }
        updateTask(safeBoard, data, DUPLICATE_TASK)
        showSuccessMsg(`Task duplicated successfully`)
    }

    function onDeleteTask(taskToDelete) {
        const data = { taskId: taskToDelete.id, groupId: safeGroup.id }
        updateTask(safeBoard, data, DELETE_TASK)
        showSuccessMsg(`Task deleted successfully taskId:${data.id} `)
    }

    function onFinishEditingInTask(value) {
        let taskChanges = { title: value, taskId: safeTask.id, groupId: safeGroup.id }
        updateTask(safeBoard, taskChanges, CHANGE_TASK_TITLE)
    }

    return <section className='card'>

        <EditableHeading className='card-task-title'
            onFinishEditing={onFinishEditingInTask}
            type={EditableHeading.types.h5}
            value={safeTask.title} />

        <div className="card-menu-btn-container flex"
            style={{ display: snapshot.isDragging ? 'none' : '' }}>
            <MenuButton className="task-preview-menu-btn">
                <Menu
                    id="menu"
                    size="medium"
                    style={{
                        backgroundColor: 'red',
                        color: 'red'
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            setIsOpenDetails(!isOpenDetails);
                        }}
                        icon={Open}
                        title="Open"
                    />
                    <MenuItem
                        onClick={() => onDuplicateTask(task)}
                        icon={Duplicate}
                        title="Duplicate Task"
                    />
                    <MenuItem
                        onClick={() => onDeleteTask(task)}
                        icon={Delete}
                        title="Delete"
                    />
                </Menu>
            </MenuButton>
        </div>
        {isOpenDetails && <TaskDetails
                board={safeBoard}
                task={safeTask}
                group={safeGroup}
                isOpenDetails={isOpenDetails}
                setIsOpenDetails={setIsOpenDetails} />}

    </section>
}