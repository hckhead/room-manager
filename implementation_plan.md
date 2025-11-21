# Implementation Plan - Management Functions & Enhanced Layout

The user wants to enable actual data editing (functional implementation) and improve the layout flexibility (moving away from rigid grids).

## User Review Required
> [!IMPORTANT]
> I will implement **Room Resizing** to give true layout freedom.
> I will enable **Data Persistence** for the Room Detail Sheet so changes to residents and contracts are saved.

## Proposed Changes

### Data Layer (`src/services/db.ts`)
- [ ] Add `update` methods for `residents` and `contracts`.
- [ ] Ensure `rooms.update` handles dimension changes (width/height).

### Room Management (`src/components/room/RoomDetailSheet.tsx`)
- [ ] Convert read-only displays to editable Forms.
- [ ] Manage local form state.
- [ ] Implement "Save" handler to update `Resident` and `Contract` data via `db` service.
- [ ] Add validation (basic).

### Layout Engine (`src/components/canvas`)
#### [MODIFY] `CanvasRoomItem.tsx`
- [ ] Add resize handles (bottom-right corner).
- [ ] Implement resize logic (updating `width` and `height`).
- [ ] Prevent drag when resizing.

#### [MODIFY] `RoomCanvas.tsx`
- [ ] Pass resize handlers.

### Dashboard Logic (`src/pages/Dashboard.tsx`)
- [ ] Implement `handleSaveRoomDetails` to coordinate updates.
- [ ] Implement `handleAddRoom` to create new rooms on the canvas.
- [ ] Implement `handleDeleteRoom` (optional but good for freedom).

## Verification Plan
### Automated Tests
- None (Manual verification preferred for UI interactions).

### Manual Verification
1.  **Editing**: Open a room, change resident name/rent, save. Re-open to verify persistence.
2.  **Layout**:
    -   Drag a room (already implemented).
    -   **Resize** a room: Drag the corner to change size.
    -   **Add Room**: Click "Add Room" and see a new room appear.
