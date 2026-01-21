import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { NavBar } from "../cmps/nav-bar";
import { SideGroupBar } from "../cmps/side-group-bar";
import { BoardHeader } from "../cmps/board-header";
import { handleOnDragEnd, loadBoard } from "../store/board.actions";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { StatusesList } from "../cmps/kanban/statuses-list";
import { Loader } from "monday-ui-react-core";
import {
  socketService,
  SOCKET_EMIT_SET_TOPIC,
  SOCKET_EVENT_UPDATE_BOARD,
} from "../services/socket.service";

export function Kanban() {
  const { boardId } = useParams();
  const board = useSelector((storeState) => storeState.boardModule.board);

  useEffect(() => {
    if (!boardId) return;
    loadBoard(boardId);
    socketService.emit(SOCKET_EMIT_SET_TOPIC, boardId);
    
    const handleBoardUpdate = (updatedBoardId) => {
      if (updatedBoardId === boardId) {
        loadBoard(boardId);
      }
    };
    
    socketService.on(SOCKET_EVENT_UPDATE_BOARD, handleBoardUpdate);
    
    return () => {
      socketService.off(SOCKET_EVENT_UPDATE_BOARD, handleBoardUpdate);
    };
  }, [boardId]);

  if (!board || !board.groups || !Array.isArray(board.statuses) || board.statuses.length === 0)
    return (
      <div className="loader">
        <Loader size={Loader.sizes.LARGE} />
      </div>
    );
  return (
    <section className="board-details">
      <NavBar />
      <SideGroupBar />
      <div className="board-container">
        <BoardHeader board={board} />

        <DragDropContext
          onDragEnd={(res) =>
            handleOnDragEnd(res, { board, statuses: board.statuses || [] })
          }
        >
          <Droppable
            droppableId={board._id}
            direction="horizontal"
            type="statuses-list"
          >
            {(provided) => (
              <section
                className="main-kanban-container flex"
                ref={provided.innerRef}
              >
                {(board.statuses || []).map((status, idx) => (
                  <Draggable
                    draggableId={status.id}
                    key={status.id}
                    index={idx}
                  >
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <StatusesList
                          key={status.label}
                          status={status}
                          board={board}
                          provided={provided}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </section>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </section>
  );
}
