import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Room, RoomType, RoomStatus } from '../../types';

interface RoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    room?: Room | null;
    onSave: (room: Omit<Room, 'id'> | Room) => void;
    ownerId: string;
}

export function RoomDialog({ open, onOpenChange, room, onSave, ownerId }: RoomDialogProps) {
    const [formData, setFormData] = useState({
        number: '',
        floor: 1,
        type: 'WINDOW' as RoomType,
        status: 'VACANT' as RoomStatus,
        basePrice: 350000,
        x: 20,
        y: 20,
        width: 200,
        height: 120
    });

    useEffect(() => {
        if (room) {
            setFormData({
                number: room.number,
                floor: room.floor,
                type: room.type,
                status: room.status,
                basePrice: room.basePrice,
                x: room.x,
                y: room.y,
                width: room.width || 200,
                height: room.height || 120
            });
        } else {
            setFormData({
                number: '',
                floor: 1,
                type: 'WINDOW',
                status: 'VACANT',
                basePrice: 350000,
                x: 20,
                y: 20,
                width: 200,
                height: 120
            });
        }
    }, [room, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (room) {
            onSave({ ...room, ...formData });
        } else {
            onSave({ ...formData, ownerId });
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{room ? '방 수정' : '방 추가'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="number" className="text-right">호실</Label>
                            <Input
                                id="number"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="floor" className="text-right">층</Label>
                            <Input
                                id="floor"
                                type="number"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">타입</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as RoomType })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WINDOW">창문형</SelectItem>
                                    <SelectItem value="NO_WINDOW">무창</SelectItem>
                                    <SelectItem value="EN_SUITE">화장실</SelectItem>
                                    <SelectItem value="DUPLEX">복층</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">상태</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as RoomStatus })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VACANT">공실</SelectItem>
                                    <SelectItem value="OCCUPIED">입실중</SelectItem>
                                    <SelectItem value="LEAVING_SOON">퇴실예정</SelectItem>
                                    <SelectItem value="RESERVED">예약</SelectItem>
                                    <SelectItem value="MAINTENANCE">수리중</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="basePrice" className="text-right">기본 가격</Label>
                            <Input
                                id="basePrice"
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            취소
                        </Button>
                        <Button type="submit">저장</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
