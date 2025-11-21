import { DndContext, useSensor, useSensors, PointerSensor, type DragEndEvent } from '@dnd-kit/core';
import { CanvasRoomItem } from './CanvasRoomItem';
import type { RoomWithContract } from '../../types';
import { db } from '../../services/db';

interface RoomCanvasProps {
    rooms: RoomWithContract[];
    onRoomsChange: (rooms: RoomWithContract[]) => void;
    isEditMode: boolean;
    onRoomClick?: (room: RoomWithContract) => void;
}

export function RoomCanvas({ rooms, onRoomsChange, isEditMode, onRoomClick }: RoomCanvasProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags when clicking
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        if (!active) return;

        const roomIndex = rooms.findIndex(r => r.id === active.id);
        if (roomIndex === -1) return;

        const room = rooms[roomIndex];

        // Calculate new position
        const newX = Math.max(0, room.x + delta.x); // Prevent negative coordinates
        const newY = Math.max(0, room.y + delta.y);

        // Update local state
        const newRooms = [...rooms];
        newRooms[roomIndex] = { ...room, x: newX, y: newY };
        onRoomsChange(newRooms);

        // Update DB
        db.rooms.update({ ...room, x: newX, y: newY });
    };

    const handleResize = (id: string, width: number, height: number) => {
        const roomIndex = rooms.findIndex(r => r.id === id);
        if (roomIndex === -1) return;

        const room = rooms[roomIndex];
        const newRoom = { ...room, width, height };

        // Update local state
        const newRooms = [...rooms];
        newRooms[roomIndex] = newRoom;
        onRoomsChange(newRooms);

        // Update DB
        db.rooms.update(newRoom);
    };

    return (
        <div className="relative w-full h-[800px] bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            {/* Grid background for visual guide */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                {rooms.map(room => (
                    <CanvasRoomItem
                        key={room.id}
                        room={room}
                        isEditMode={isEditMode}
                        onClick={() => onRoomClick?.(room)}
                        onResize={handleResize}
                    />
                ))}
            </DndContext>
        </div>
    );
}
