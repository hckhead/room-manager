import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/currency-input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import type { Resident, Room } from '../../types';

interface ResidentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resident?: Resident | null;
    rooms: Room[];
    onSave: (resident: Omit<Resident, 'id'> | Resident, contractData?: {
        roomId: string;
        startDate: string;
        endDate: string;
        deposit: number;
        rent: number;
        managementFee: number;
        paymentDay: number;
    }) => void;
}

export function ResidentDialog({ open, onOpenChange, resident, rooms, onSave }: ResidentDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        emergencyPhone: '',
        memo: ''
    });

    const [contractData, setContractData] = useState({
        roomId: '',
        startDate: '',
        endDate: '',
        deposit: 0,
        rent: 0,
        managementFee: 0,
        paymentDay: 1
    });

    useEffect(() => {
        if (resident) {
            setFormData({
                name: resident.name,
                phone: resident.phone,
                emergencyPhone: resident.emergencyPhone || '',
                memo: resident.memo || ''
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                emergencyPhone: '',
                memo: ''
            });
            setContractData({
                roomId: '',
                startDate: '',
                endDate: '',
                deposit: 0,
                rent: 0,
                managementFee: 0,
                paymentDay: 1
            });
        }
    }, [resident, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (resident) {
            onSave({ ...resident, ...formData });
        } else {
            // Creating new resident with contract
            onSave(formData, contractData.roomId ? contractData : undefined);
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{resident ? '입실자 수정' : '입실자 추가'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold">입실자 정보</h3>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">이름</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">연락처</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="emergencyPhone" className="text-right">비상연락</Label>
                                <Input
                                    id="emergencyPhone"
                                    value={formData.emergencyPhone}
                                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="memo" className="text-right">메모</Label>
                                <Input
                                    id="memo"
                                    value={formData.memo}
                                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>

                        {!resident && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="font-semibold">계약 정보 (선택)</h3>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="roomId" className="text-right">방 배정</Label>
                                        <Select
                                            value={contractData.roomId}
                                            onValueChange={(value) => setContractData({ ...contractData, roomId: value })}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="방 선택 (선택사항)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {rooms.filter(r => r.status === 'VACANT').map(room => (
                                                    <SelectItem key={room.id} value={room.id}>
                                                        {room.number}호 - {room.type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {contractData.roomId && (
                                        <>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="startDate" className="text-right">계약 시작</Label>
                                                <Input
                                                    id="startDate"
                                                    type="date"
                                                    value={contractData.startDate}
                                                    onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="endDate" className="text-right">계약 종료</Label>
                                                <Input
                                                    id="endDate"
                                                    type="date"
                                                    value={contractData.endDate}
                                                    onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="deposit" className="text-right">보증금</Label>
                                                <CurrencyInput
                                                    id="deposit"
                                                    value={contractData.deposit}
                                                    onChange={(value) => setContractData({ ...contractData, deposit: value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="rent" className="text-right">월세</Label>
                                                <CurrencyInput
                                                    id="rent"
                                                    value={contractData.rent}
                                                    onChange={(value) => setContractData({ ...contractData, rent: value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="managementFee" className="text-right">관리비</Label>
                                                <CurrencyInput
                                                    id="managementFee"
                                                    value={contractData.managementFee}
                                                    onChange={(value) => setContractData({ ...contractData, managementFee: value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="paymentDay" className="text-right">납부일</Label>
                                                <Input
                                                    id="paymentDay"
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={contractData.paymentDay}
                                                    onChange={(e) => setContractData({ ...contractData, paymentDay: Number(e.target.value) })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
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
