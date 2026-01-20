import { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { ADD_GROUP_TASK } from "../../services/board.service.local";
import { updateGroup } from "../../store/board.actions";
import { TaskCard } from "./task-card";
import { EditableHeading } from 'monday-ui-react-core'


export function StatusesList({ status, board, provided }) {

    const safeBoard = board || { groups: [] }
    const [newTaskTitle, setNewTaskTitle] = useState('')

    function onAddGroupTask() {
        // Defensive: do nothing when title or board missing
        if (!newTaskTitle) {
            console.warn('Skipping add task: empty title')
            return
        }
        if (!safeBoard.groups || !safeBoard.groups.length) {
            console.warn('No groups available to add task')
            setNewTaskTitle('')
            return
        }
        // Add the new task to first group with the requested status
        updateGroup(safeBoard, { group: { id: safeBoard.groups[0].id }, newTaskTitle, status: status.label }, ADD_GROUP_TASK)
        setNewTaskTitle('')
    }

    function handleChangeTask(value) {
        setNewTaskTitle(value)
    }

    return <Droppable key={status.id} droppableId={status.id} type='task-card' >
        {prov =>
            <section className='kanban-label-list'
                style={{ backgroundColor: status.bgColor }}
                {...prov.droppableProps}
                ref={prov.innerRef}>
                <div className="list-title"
                    {...provided.dragHandleProps}
                >{status.label}</div>
                <div className="cards-container flex column">
                    {(safeBoard.groups || []).map(group =>
                        (group.tasks || []).map((task, idx) =>
                            task && task.status === status.label ?
                                <Draggable
                                    draggableId={task.id}
                                    key={task.id}
                                    index={idx}
                                >
                                    {(provided, snapshot) =>
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}>

                                            <TaskCard task={task} group={group} board={safeBoard} snapshot={snapshot} />
                                        </div>
                                    }
                                </Draggable>
                                : null)
                    )}
                    {prov.placeholder}
                </div>
                <EditableHeading
                    className='editable-add-task-kanban'
                    type={EditableHeading.types.h6}
                    onFinishEditing={onAddGroupTask}
                    onChange={handleChangeTask}
                    placeholder={'+ Add Item'}
                    value={newTaskTitle}
                    brandFont
                />
            </section>
        }
    </Droppable>
}