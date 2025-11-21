import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RoomDialog } from '../components/room/RoomDialog';
import { db } from '../services/db';
import type { Room, RoomStatus, RoomType } from '../types';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

export default function Rooms() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    useEffect(() => {
        loadRooms();
    }, [user]);

    useEffect(() => {
        filterRooms();
    }, [rooms, searchQuery, statusFilter, typeFilter]);

    const loadRooms = () => {
        if (!user) return;
        const allRooms = db.rooms.getAll(user.id);
        setRooms(allRooms);
    };

    const filterRooms = () => {
        let filtered = [...rooms];

        if (searchQuery) {
            filtered = filtered.filter(r => r.number.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(r => r.type === typeFilter);
        }

        setFilteredRooms(filtered);
    };

    const handleSave = (roomData: Omit<Room, 'id'> | Room) => {
        if ('id' in roomData) {
            db.rooms.update(roomData as Room);
        } else {
            db.rooms.create(roomData);
        }
        loadRooms();
    };

    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setIsDialogOpen(true);
    };

    const handleDelete = (room: Room) => {
        if (confirm(`${room.number}호를 삭제하시겠습니까?`)) {
            db.rooms.delete(room.id);
            loadRooms();
        }
    };

    const handleAddNew = () => {
        setSelectedRoom(null);
        setIsDialogOpen(true);
    };

    const getStatusBadge = (status: RoomStatus) => {
        const colors = {
            VACANT: 'bg-slate-100 text-slate-700',
            OCCUPIED: 'bg-green-100 text-green-700',
            LEAVING_SOON: 'bg-yellow-100 text-yellow-700',
            RESERVED: 'bg-blue-100 text-blue-700',
            MAINTENANCE: 'bg-red-100 text-red-700'
        };
        const labels = {
            VACANT: '공실',
            OCCUPIED: '입실중',
            LEAVING_SOON: '퇴실예정',
            RESERVED: '예약',
            MAINTENANCE: '수리중'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getTypeLabel = (type: RoomType) => {
        const labels = {
            WINDOW: '창문형',
            NO_WINDOW: '무창',
            EN_SUITE: '화장실',
            DUPLEX: '복층'
        };
        return labels[type];
    };

    return (
        <AppLayout>
            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">방 관리</h1>
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        방 추가
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="호실 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="상태 필터" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">전체 상태</SelectItem>
                            <SelectItem value="VACANT">공실</SelectItem>
                            <SelectItem value="OCCUPIED">입실중</SelectItem>
                            <SelectItem value="LEAVING_SOON">퇴실예정</SelectItem>
                            <SelectItem value="RESERVED">예약</SelectItem>
                            <SelectItem value="MAINTENANCE">수리중</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="타입 필터" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">전체 타입</SelectItem>
                            <SelectItem value="WINDOW">창문형</SelectItem>
                            <SelectItem value="NO_WINDOW">무창</SelectItem>
                            <SelectItem value="EN_SUITE">화장실</SelectItem>
                            <SelectItem value="DUPLEX">복층</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">호실</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">층</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">타입</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">기본 가격</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">작업</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{room.number}호</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{room.floor}층</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getTypeLabel(room.type)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(room.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{room.basePrice.toLocaleString()}원</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(room)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(room)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRooms.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            방이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            <RoomDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                room={selectedRoom}
                onSave={handleSave}
                ownerId={user?.id || ''}
            />
        </AppLayout>
    );
}
