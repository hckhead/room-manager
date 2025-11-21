import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ResidentDialog } from '../components/resident/ResidentDialog';
import { db } from '../services/db';
import type { Resident, Room, Contract } from '../types';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

interface ResidentWithRoom extends Resident {
    room?: Room;
    contract?: Contract;
}

export default function Residents() {
    const { user } = useAuth();
    const [residents, setResidents] = useState<ResidentWithRoom[]>([]);
    const [filteredResidents, setFilteredResidents] = useState<ResidentWithRoom[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState<ResidentWithRoom | null>(null);

    // Load data when user changes
    useEffect(() => {
        loadData();
    }, [user]);

    // Update filtered list when data or query changes
    useEffect(() => {
        filterResidents();
    }, [residents, searchQuery]);

    const loadData = () => {
        if (!user) return;
        const allRooms = db.rooms.getAll(user.id);
        setRooms(allRooms);
        const allResidents = db.residents.getAll();
        const enriched = allResidents.map(resident => {
            const contracts = db.contracts.getByResident(resident.id);
            const active = contracts.find(c => c.isActive);
            const room = active ? allRooms.find(r => r.id === active.roomId) : undefined;
            return { ...resident, room, contract: active } as ResidentWithRoom;
        });
        setResidents(enriched);
    };

    const filterResidents = () => {
        let filtered = [...residents];
        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.phone.includes(searchQuery)
            );
        }
        setFilteredResidents(filtered);
    };

    const handleSave = (
        residentData: Omit<Resident, 'id'> | Resident,
        contractData?: {
            roomId: string;
            startDate: string;
            endDate: string;
            deposit: number;
            rent: number;
            managementFee: number;
            paymentDay: number;
        }
    ) => {
        let residentId: string;
        if ('id' in residentData) {
            db.residents.update(residentData as Resident);
            residentId = residentData.id;
        } else {
            const newResident = db.residents.create(residentData);
            residentId = newResident.id;
            if (contractData && contractData.roomId) {
                db.contracts.create({ ...contractData, residentId, isActive: true });
                const room = db.rooms.get(contractData.roomId);
                if (room) db.rooms.update({ ...room, status: 'OCCUPIED' });
            }
        }
        loadData();
    };

    const handleEdit = (resident: Resident) => {
        setSelectedResident(resident);
        setIsDialogOpen(true);
    };

    const handleDelete = (resident: ResidentWithRoom) => {
        setResidentToDelete(resident);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!residentToDelete) return;
        const contracts = db.contracts.getByResident(residentToDelete.id);
        contracts.forEach(contract => {
            db.contracts.delete(contract.id);
            const room = db.rooms.get(contract.roomId);
            if (room) db.rooms.update({ ...room, status: 'VACANT' });
        });
        db.residents.delete(residentToDelete.id);
        loadData();
        setDeleteDialogOpen(false);
        setResidentToDelete(null);
    };

    const handleAddNew = () => {
        setSelectedResident(null);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout>
            <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">입실자 관리</h1>
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        입실자 추가
                    </Button>
                </div>
                {/* Search */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="이름 또는 연락처 검색..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">이름</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">연락처</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">호실</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">계약 기간</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">보증금</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">월세</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">작업</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredResidents.map(resident => (
                                <tr key={resident.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{resident.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{resident.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {resident.room ? `${resident.room.number}호` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {resident.contract ? `${resident.contract.startDate} ~ ${resident.contract.endDate}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {resident.contract ? `${resident.contract.deposit.toLocaleString()}원` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {resident.contract ? `${resident.contract.rent.toLocaleString()}원` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(resident)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(resident)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Resident Dialog */}
                <ResidentDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    resident={selectedResident}
                    rooms={rooms}
                    onSave={handleSave}
                />
                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>입실자 삭제 확인</AlertDialogTitle>
                            <AlertDialogDescription>
                                {residentToDelete?.name}님의 정보를 정말 삭제하시겠습니까? 관련된 계약도 모두 삭제됩니다. 이 작업은 복구할 수 없습니다.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
