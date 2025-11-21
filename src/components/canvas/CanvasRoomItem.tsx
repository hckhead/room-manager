import React, { useState, useCallback, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { RoomCard } from '../RoomCard';
import type { RoomWithContract } from '../../types';
import { GripHorizontal } from 'lucide-react';

interface CanvasRoomItemProps {
    room: RoomWithContract;
    isEditMode: boolean;
    onClick?: () => void;
    onResize?: (id: string, width: number, height: number) => void;
}

export function CanvasRoomItem({ room, isEditMode, onClick, onResize }: CanvasRoomItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: room.id,
        disabled: !isEditMode,
        data: { x: room.x, y: room.y }
    });

    const [size, setSize] = useState({ width: room.width || 200, height: room.height || 120 });

    useEffect(() => {
        setSize({ width: room.width || 200, height: room.height || 120 });
    }, [room.width, room.height]);

    const handleResizeStart = useCallback((e: React.PointerEvent) => {
        e.stopPropagation(); // Prevent drag
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handleMouseMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(100, startWidth + (moveEvent.clientX - startX));
            const newHeight = Math.max(60, startHeight + (moveEvent.clientY - startY));
            setSize({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            document.removeEventListener('pointermove', handleMouseMove);
            document.removeEventListener('pointerup', handleMouseUp);
            if (onResize) {
                // We need to pass the final size up
                // Since state update might be async, we calculate it again or use the last known
                // Actually, we should use the values from the last move, but here we can just use the state if we are careful,
                // or better, pass the calculated values from the event handler if we could.
                // For simplicity, let's trigger the callback with the *current* size in state, 
                // but wait, state update is async. 
                // Let's just rely on the fact that the user stops moving.
                // Better: call onResize in handleMouseMove? No, too many updates.
                // We'll just use the values from the last event?
                // Let's use a ref or just re-calculate.
            }
        };

        // We need to capture the final size for onResize. 
        // Let's modify handleMouseUp to take the final size.
        // Actually, let's just update the parent on mouse up using the latest size.
        // But `size` in handleMouseUp closure will be stale.
        // We can use a ref to track current size during drag.

        document.addEventListener('pointermove', handleMouseMove);
        document.addEventListener('pointerup', (upEvent) => {
            document.removeEventListener('pointermove', handleMouseMove);
            const finalWidth = Math.max(100, startWidth + (upEvent.clientX - startX));
            const finalHeight = Math.max(60, startHeight + (upEvent.clientY - startY));
            onResize?.(room.id, finalWidth, finalHeight);
        }, { once: true });
    }, [size, onResize, room.id]);

    const style: React.CSSProperties = {
        position: 'absolute',
        left: room.x,
        top: room.y,
        width: size.width,
        height: size.height,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.8 : 1,
        touchAction: 'none',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="group">
            <RoomCard
                room={room}
                onClick={isDragging ? undefined : onClick}
                className={isEditMode ? "cursor-move ring-2 ring-primary ring-offset-2 h-full w-full" : "h-full w-full"}
            />

            {isEditMode && (
                <div
                    className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-slate-600 bg-white rounded-tl-md shadow-sm border-t border-l border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPointerDown={handleResizeStart}
                >
                    <GripHorizontal className="w-4 h-4 transform -rotate-45" />
                </div>
            )}
        </div>
    );
}
