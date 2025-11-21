import { DndContext, useSensor, useSensors, PointerSensor, type DragEndEvent } from '@dnd-kit/core';
import { useMemo } from 'react';
import { CanvasRoomItem } from './CanvasRoomItem';
import type { RoomWithContract } from '../../types';
import { db } from '../../services/db';

interface RoomCanvasProps {
    rooms: RoomWithContract[];
    onRoomsChange: (rooms: RoomWithContract[]) => void;
    isEditMode: boolean;
    onRoomClick?: (room: RoomWithContract) => void;
    selectedFloor?: string;
}

const FLOOR_HEIGHT = 900; // Height per floor section (800px canvas + 100px header)
const CANVAS_WIDTH = 2000;
const SINGLE_FLOOR_HEIGHT = 800;

export function RoomCanvas({ rooms, onRoomsChange, isEditMode, onRoomClick, selectedFloor = 'ALL' }: RoomCanvasProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags when clicking
            },
        })
    );

    // Group rooms by floor and calculate display positions
    const { roomsByFloor, adjustedRooms, totalHeight } = useMemo(() => {
        const grouped: Record<number, RoomWithContract[]> = {};

        rooms.forEach(room => {
            if (!grouped[room.floor]) {
                grouped[room.floor] = [];
            }
            grouped[room.floor].push(room);
        });

        const floors = Object.keys(grouped).map(Number).sort((a, b) => b - a); // Sort descending (top floor first)

        const adjusted = rooms.map(room => {
            const floorIndex = floors.indexOf(room.floor);
            const displayY = selectedFloor === 'ALL'
                ? room.y + (floorIndex * FLOOR_HEIGHT) + 100 // Add 100px for header
                : room.y;

            return {
                ...room,
                displayY,
                floorIndex
            };
        });

        const height = selectedFloor === 'ALL'
            ? floors.length * FLOOR_HEIGHT
            : SINGLE_FLOOR_HEIGHT;

        return {
            roomsByFloor: grouped,
            adjustedRooms: adjusted,
            totalHeight: height
        };
    }, [rooms, selectedFloor]);

    const floors = Object.keys(roomsByFloor).map(Number).sort((a, b) => b - a);

    // Collision detection utility
    const checkCollision = (
        room: RoomWithContract & { displayY?: number; floorIndex?: number },
        newX: number,
        newY: number,
        newWidth?: number,
        newHeight?: number
    ): boolean => {
        const roomWidth = newWidth || room.width || 200;
        const roomHeight = newHeight || room.height || 120;

        // Check canvas boundaries (within floor section)
        if (newX < 0 || newY < 0 || newX + roomWidth > CANVAS_WIDTH || newY + roomHeight > SINGLE_FLOOR_HEIGHT) {
            return true; // Collision with boundary
        }

        // Check collision with other rooms on the SAME floor
        const roomsOnSameFloor = rooms.filter(r => r.floor === room.floor);

        for (const otherRoom of roomsOnSameFloor) {
            if (otherRoom.id === room.id) continue;

            const otherWidth = otherRoom.width || 200;
            const otherHeight = otherRoom.height || 120;

            // AABB (Axis-Aligned Bounding Box) collision detection
            const collision = !(
                newX + roomWidth <= otherRoom.x ||
                newX >= otherRoom.x + otherWidth ||
                newY + roomHeight <= otherRoom.y ||
                newY >= otherRoom.y + otherHeight
            );

            if (collision) {
                return true; // Collision detected
            }
        }

        return false; // No collision
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        if (!active) return;

        const roomIndex = rooms.findIndex(r => r.id === active.id);
        if (roomIndex === -1) return;

        const room = rooms[roomIndex];

        // Calculate new position (relative to floor, not display position)
        const newX = Math.max(0, room.x + delta.x);
        const newY = Math.max(0, room.y + delta.y);

        // Check for collisions
        if (checkCollision(room, newX, newY)) {
            return; // Don't update if collision detected
        }

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

        // Check for collisions with new dimensions
        if (checkCollision(room, room.x, room.y, width, height)) {
            return; // Don't update if collision detected
        }

        const newRoom = { ...room, width, height };

        // Update local state
        const newRooms = [...rooms];
        newRooms[roomIndex] = newRoom;
        onRoomsChange(newRooms);

        // Update DB
        db.rooms.update(newRoom);
    };

    return (
        <div
            className="relative w-full bg-slate-100/50 rounded-xl border border-slate-200 overflow-auto shadow-inner"
            style={{ height: selectedFloor === 'ALL' ? 'auto' : '800px', maxHeight: '800px' }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                {/* Grid background for visual guide */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Floor headers and dividers (only in ALL mode) */}
                {selectedFloor === 'ALL' && floors.map((floor, index) => (
                    <div
                        key={floor}
                        className="absolute left-0 right-0 border-b-2 border-slate-300 bg-slate-200/80 backdrop-blur-sm"
                        style={{
                            top: index * FLOOR_HEIGHT,
                            height: 100,
                            zIndex: 50
                        }}
                    >
                        <div className="flex items-center justify-between px-6 h-full">
                            <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-bold text-slate-700">{floor}층</h3>
                                <span className="text-sm text-slate-500">
                                    {roomsByFloor[floor]?.length || 0}개 방
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    {adjustedRooms.map(room => (
                        <CanvasRoomItem
                            key={room.id}
                            room={{ ...room, y: room.displayY || room.y }}
                            isEditMode={isEditMode}
                            onClick={() => onRoomClick?.(room)}
                            onResize={handleResize}
                        />
                    ))}
                </DndContext>
            </div>
        </div>
    );
}
