import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Payment } from '../../types';

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment?: Payment | null;
    onSave: (payment: Omit<Payment, 'id'> | Payment) => void;
}

export function PaymentDialog({ open, onOpenChange, payment, onSave }: PaymentDialogProps) {
    const [formData, setFormData] = useState({
        paidAmount: 0,
        paidDate: '',
        status: 'UNPAID' as Payment['status'],
        memo: ''
    });

    useEffect(() => {
        if (payment) {
            setFormData({
                paidAmount: payment.paidAmount,
                paidDate: payment.paidDate || '',
                status: payment.status,
                memo: payment.memo
            });
        } else {
            setFormData({
                paidAmount: 0,
                paidDate: '',
                status: 'UNPAID',
                memo: ''
            });
        }
    }, [payment, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (payment) {
            onSave({
                ...payment,
                ...formData,
                paidDate: formData.paidDate || null
            });
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>납부 기록</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paidAmount" className="text-right">납부 금액</Label>
                            <Input
                                id="paidAmount"
                                type="number"
                                value={formData.paidAmount}
                                onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paidDate" className="text-right">납부일</Label>
                            <Input
                                id="paidDate"
                                type="date"
                                value={formData.paidDate}
                                onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">상태</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Payment['status'] })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PAID">납부 완료</SelectItem>
                                    <SelectItem value="UNPAID">미납</SelectItem>
                                    <SelectItem value="PARTIAL">부분 납부</SelectItem>
                                    <SelectItem value="OVERDUE">연체</SelectItem>
                                </SelectContent>
                            </Select>
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
