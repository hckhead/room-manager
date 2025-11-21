import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import type { RoomWithContract } from '../../types';
import { User, Calendar, CreditCard } from 'lucide-react';

interface RoomDetailSheetProps {
    room: RoomWithContract | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RoomDetailSheet({ room, open, onOpenChange }: RoomDetailSheetProps) {
    if (!room) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">{room.number}호 상세 정보</SheetTitle>
                    <SheetDescription>
                        {room.type} | {room.floor}층
                    </SheetDescription>
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
                                    <Input id="name" value={room.resident?.name || ''} className="col-span-3" readOnly />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">연락처</Label>
                                    <Input id="phone" value={room.resident?.phone || ''} className="col-span-3" readOnly />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="emergency" className="text-right">비상연락</Label>
                                    <Input id="emergency" value={room.resident?.emergencyPhone || ''} className="col-span-3" readOnly />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="contract" className="space-y-4 mt-4">
                            {room.currentContract ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>보증금</Label>
                                            <div className="text-lg font-semibold">{room.currentContract.deposit.toLocaleString()}원</div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>월세</Label>
                                            <div className="text-lg font-semibold">{room.currentContract.rent.toLocaleString()}원</div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>계약 기간</Label>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {room.currentContract.startDate} ~ {room.currentContract.endDate}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>납부일</Label>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CreditCard className="w-4 h-4" />
                                            매월 {room.currentContract.paymentDay}일
                                        </div>
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
                                    defaultValue={room.resident?.memo}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <SheetFooter className="mt-8">
                    <Button type="submit">저장하기</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
