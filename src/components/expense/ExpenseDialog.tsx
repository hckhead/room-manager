import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/currency-input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Expense } from '../../types';

interface ExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense?: Expense | null;
    onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
}

const EXPENSE_CATEGORIES = {
    UTILITY: { label: '공과금', subcategories: ['전기', '수도', '가스', '인터넷'] },
    MAINTENANCE: { label: '유지보수', subcategories: ['청소', '소독', '정기점검'] },
    REPAIR: { label: '수리', subcategories: ['배관', '전기', '도배', '장판', '기타'] },
    OTHER: { label: '기타', subcategories: ['세금', '보험', '관리비', '기타'] }
};

export function ExpenseDialog({ open, onOpenChange, expense, onSave }: ExpenseDialogProps) {
    const [formData, setFormData] = useState({
        category: 'UTILITY' as Expense['category'],
        subcategory: '',
        amount: 0,
        date: '',
        description: '',
        memo: ''
    });

    useEffect(() => {
        if (expense) {
            setFormData({
                category: expense.category,
                subcategory: expense.subcategory,
                amount: expense.amount,
                date: expense.date,
                description: expense.description,
                memo: expense.memo
            });
        } else {
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                category: 'UTILITY',
                subcategory: '',
                amount: 0,
                date: today,
                description: '',
                memo: ''
            });
        }
    }, [expense, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (expense) {
            onSave({ ...expense, ...formData });
        } else {
            onSave({
                ...formData,
                createdAt: new Date().toISOString()
            });
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{expense ? '지출 수정' : '지출 추가'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">카테고리</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as Expense['category'], subcategory: '' })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subcategory" className="text-right">세부 항목</Label>
                            <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPENSE_CATEGORIES[formData.category].subcategories.map((sub) => (
                                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">금액</Label>
                            <CurrencyInput
                                id="amount"
                                value={formData.amount}
                                onChange={(value) => setFormData({ ...formData, amount: value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">날짜</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">설명</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
