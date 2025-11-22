import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomCanvas } from '../components/canvas/RoomCanvas';
import { db } from '../services/db';
import { type RoomWithContract } from '../types';
import { Layout, Save, Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RoomDetailSheet } from '../components/room/RoomDetailSheet';

export default function Dashboard() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<RoomWithContract[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<RoomWithContract[]>([]);
    const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomWithContract | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = () => {
        if (!user) return;

        const rawRooms = db.rooms.getAll(user.id);

        const enrichedRooms: RoomWithContract[] = rawRooms.map(room => {
            const contract = db.contracts.getActive(room.id);
            const resident = contract ? db.residents.get(contract.residentId) : undefined;

            return {
                ...room,
                currentContract: contract,
                resident: resident
            };
        });

        setRooms(enrichedRooms);
    };

    // Filter rooms by floor whenever rooms or selectedFloor changes
    useEffect(() => {
        if (selectedFloor === 'ALL') {
            setFilteredRooms(rooms);
        } else {
            setFilteredRooms(rooms.filter(r => r.floor === Number(selectedFloor)));
        }
    }, [rooms, selectedFloor]);

    // Get unique floors for filter dropdown
    const uniqueFloors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);

    const handleRoomsChange = (newRooms: RoomWithContract[]) => {
        setRooms(newRooms);
    };

    const handleRoomClick = (room: RoomWithContract) => {
        if (isEditMode) return; // Don't open sheet in edit mode
        setSelectedRoom(room);
        setIsSheetOpen(true);
    };

    const handleAddRoom = () => {
        if (!user) return;

        // Create a new room with default values
        db.rooms.create({
            ownerId: user.id,
            number: `${300 + rooms.length}`, // Simple numbering
            floor: 3,
            type: 'WINDOW',
            status: 'VACANT',
            basePrice: 350000,
            x: 20, // Default position
            y: 20,
        });

        loadData(); // Refresh the room list
    };

    return (
        <AppLayout>
            <div className="flex flex-col space-y-6">
                {/* Toolbar */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="층 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">전체 층</SelectItem>
                                {uniqueFloors.map(floor => (
                                    <SelectItem key={floor} value={String(floor)}>
                                        {floor}층
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditMode && (
                            <Button variant="outline" size="sm" onClick={handleAddRoom}>
                                <Plus className="w-4 h-4 mr-2" />
                                방 추가
                            </Button>
                        )}
                        <Button
                            variant={isEditMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsEditMode(!isEditMode)}
                        >
                            {isEditMode ? (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    배치 저장
                                </>
                            ) : (
                                <>
                                    <Layout className="w-4 h-4 mr-2" />
                                    배치 수정
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <RoomCanvas
                    rooms={filteredRooms}
                    onRoomsChange={handleRoomsChange}
                    isEditMode={isEditMode}
                    onRoomClick={handleRoomClick}
                    selectedFloor={selectedFloor}
                />

                <RoomDetailSheet
                    room={selectedRoom}
                    open={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                    onDataChange={loadData}
                />
            </div>
        </AppLayout>
    );
}
