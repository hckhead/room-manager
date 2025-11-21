# Goshiwon Management System Walkthrough

## Overview
This is an enterprise-grade Goshiwon Management System built with React, TypeScript, Tailwind CSS, and Shadcn UI. It features a flexible canvas-based room layout engine and comprehensive resident management capabilities.

## Key Features

### 1. Dashboard & Layout Engine
- **Canvas Layout**: Free-form drag-and-drop interface for positioning rooms.
- **Edit Mode**: Toggle between "View" and "Edit" modes to prevent accidental changes.
- **Room Status**: Visual indicators for room status (Vacant, Occupied, Leaving Soon, etc.).
- **Sidebar Navigation**: Professional navigation structure.

### 2. Room Management
- **Room Details**: Click on any room to open a detailed management sheet.
- **Tabs**:
    - **Resident**: View and manage resident information.
    - **Contract**: Track deposit, rent, and contract dates.
    - **Memo**: Admin notes for specific rooms.

### 3. Technology Stack
- **Frontend**: React 18, Vite, TypeScript
- **UI Library**: Shadcn UI (Radix Primitives + Tailwind)
- **Drag & Drop**: @dnd-kit/core
- **State Management**: React Context (Auth) + Local State
- **Icons**: Lucide React

## Verification Steps

### 1. Layout Customization
1.  Navigate to the **Dashboard**.
2.  Click the **"배치 수정" (Edit Layout)** button in the top right.
3.  Drag rooms to desired positions on the canvas.
4.  Click **"배치 저장" (Save Layout)** to persist changes.

### 2. Room Details
1.  Ensure "Edit Mode" is **OFF**.
2.  Click on any room card.
3.  Verify the **Side Sheet** opens with room details.
4.  Check the "Resident", "Contract", and "Memo" tabs.

### 3. Navigation
1.  Use the **Sidebar** to navigate between pages (currently Dashboard is the main focus).
2.  Verify the active state of the current menu item.

## Next Steps
- Implement "Residents" and "Settings" pages.
- Add "Create Room" functionality in the UI.
- Integrate a real backend (Supabase or Firebase).
