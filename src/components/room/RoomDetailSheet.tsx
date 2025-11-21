import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/currency-input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import type { RoomWithContract, Resident, Contract } from '../../types';
import { User, Calendar, CreditCard, Edit, Save, X } from 'lucide-react';
import { db } from '../../services/db';

interface RoomDetailSheetProps {
    room: RoomWithContract | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDataChange?: () => void;
}

export function RoomDetailSheet({ room, open, onOpenChange, onDataChange }: RoomDetailSheetProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [residentData, setResidentData] = useState<Partial<Resident>>({});
    const [contractData, setContractData] = useState<Partial<Contract>>({});
    const [memo, setMemo] = useState('');

    useEffect(() => {
        if (room) {
            setResidentData(room.resident || {});
            setContractData(room.currentContract || {});
            setMemo(room.resident?.memo || '');
        }
    }, [room]);

    if (!room) return null;

    const handleSave = () => {
        // Save resident data
        if (room.resident && residentData.id) {
            db.residents.update({
                ...room.resident,
                ...residentData,
                memo
            } as Resident);
        }

        // Save contract data
        if (room.currentContract && contractData.id) {
            db.contracts.update({
                ...room.currentContract,
                ...contractData
            } as Contract);
        }

        setIsEditMode(false);
        onDataChange?.();
    };

    const handleCancel = () => {
        setResidentData(room.resident || {});
        setContractData(room.currentContract || {});
        setMemo(room.resident?.memo || '');
        setIsEditMode(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="text-2xl font-bold">{room.number}호 상세 정보</SheetTitle>
                            <SheetDescription>
                                {room.type} | {room.floor}층
                            </SheetDescription>
                        </div>
                        <Button
                            variant={isEditMode ? "ghost" : "outline"}
                            size="sm"
                            onClick={() => setIsEditMode(!isEditMode)}
                        >
                            {isEditMode ? (
                                <>
                                    <X className="w-4 h-4 mr-2" />
                                    취소
                                </>
                            ) : (
                                <>
                                    <Edit className="w-4 h-4 mr-2" />
                                    수정
                                </>
                            )}
                        </Button>
                    </div>
                </SheetHeader>

                <div className="mt-6">
                    <Tabs defaultValue="resident" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="resident">입실자</TabsTrigger>
                            <TabsTrigger value="contract">계약 정보</TabsTrigger>
                            <TabsTrigger value="memo">메모</TabsTrigger>
                        </TabsList>

                        <TabsContent value="resident" className="space-y-4 mt-4">
                            <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{room.resident?.name || '공실'}</h3>
                                        <p className="text-sm text-slate-500">{room.resident?.phone || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">이름</Label>
                                    <Input
                                        id="name"
                                        value={residentData.name || ''}
                                        onChange={(e) => setResidentData({ ...residentData, name: e.target.value })}
                                        className="col-span-3"
                                        readOnly={!isEditMode}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">연락처</Label>
                                    <Input
                                        id="phone"
                                        value={residentData.phone || ''}
                                        onChange={(e) => setResidentData({ ...residentData, phone: e.target.value })}
                                        className="col-span-3"
                                        readOnly={!isEditMode}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="emergency" className="text-right">비상연락</Label>
                                    <Input
                                        id="emergency"
                                        value={residentData.emergencyPhone || ''}
                                        onChange={(e) => setResidentData({ ...residentData, emergencyPhone: e.target.value })}
                                        className="col-span-3"
                                        readOnly={!isEditMode}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="contract" className="space-y-4 mt-4">
                            {room.currentContract ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>보증금</Label>
                                            {isEditMode ? (
                                                <CurrencyInput
                                                    value={contractData.deposit || 0}
                                                    onChange={(value) => setContractData({ ...contractData, deposit: value })}
                                                />
                                            ) : (
                                                <div className="text-lg font-semibold">{room.currentContract.deposit.toLocaleString()}원</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>월세</Label>
                                            {isEditMode ? (
                                                <CurrencyInput
                                                    value={contractData.rent || 0}
                                                    onChange={(value) => setContractData({ ...contractData, rent: value })}
                                                />
                                            ) : (
                                                <div className="text-lg font-semibold">{room.currentContract.rent.toLocaleString()}원</div>
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>계약 시작일</Label>
                                        {isEditMode ? (
                                            <Input
                                                type="date"
                                                value={contractData.startDate || ''}
                                                onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {room.currentContract.startDate}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>계약 종료일</Label>
                                        {isEditMode ? (
                                            <Input
                                                type="date"
                                                value={contractData.endDate || ''}
                                                onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {room.currentContract.endDate}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>납부일</Label>
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={contractData.paymentDay || 1}
                                                onChange={(e) => setContractData({ ...contractData, paymentDay: Number(e.target.value) })}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm">
                                                <CreditCard className="w-4 h-4" />
                                                매월 {room.currentContract.paymentDay}일
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500">
                                    진행 중인 계약이 없습니다.
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="memo" className="mt-4">
                            <div className="space-y-2">
                                <Label>관리자 메모</Label>
                                <textarea
                                    className="w-full min-h-[200px] p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    placeholder="특이사항을 입력하세요..."
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    readOnly={!isEditMode}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {isEditMode && (
                    <SheetFooter className="mt-8">
                        <Button variant="outline" onClick={handleCancel}>취소</Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            저장하기
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
