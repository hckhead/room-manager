import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { db } from '../services/db';
import type { Contract, Room, Resident, Payment, Expense } from '../types';
import { TrendingUp, Wallet, AlertCircle, Calendar, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { formatCurrencyWithSuffix } from '../lib/currency';
import { PaymentDialog } from '../components/payment/PaymentDialog';
import { ExpenseDialog } from '../components/expense/ExpenseDialog';

export default function Finance() {
    const { user } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = () => {
        if (!user) return;

        const allContracts = db.contracts.getAll();
        const allRooms = db.rooms.getAll(user.id);
        const allResidents = db.residents.getAll();
        const allPayments = db.payments.getAll();
        const allExpenses = db.expenses.getAll();

        setContracts(allContracts);
        setRooms(allRooms);
        setResidents(allResidents);
        setPayments(allPayments);
        setExpenses(allExpenses);

        generateMonthlyPayments(selectedMonth);
    };

    const generateMonthlyPayments = (month: string) => {
        const activeContracts = db.contracts.getAll().filter(c => c.isActive);

        activeContracts.forEach(contract => {
            const existingPayment = db.payments.getByMonth(month)
                .find(p => p.contractId === contract.id);

            if (!existingPayment) {
                db.payments.create({
                    contractId: contract.id,
                    residentId: contract.residentId,
                    roomId: contract.roomId,
                    month,
                    amount: contract.rent + contract.managementFee,
                    paidAmount: 0,
                    paidDate: null,
                    status: 'UNPAID',
                    memo: '',
                    createdAt: new Date().toISOString()
                });
            }
        });

        setPayments(db.payments.getAll());
    };

    const handlePaymentSave = (payment: Omit<Payment, 'id'> | Payment) => {
        if ('id' in payment) {
            db.payments.update(payment);
        }
        loadData();
    };

    const handleExpenseSave = (expense: Omit<Expense, 'id'> | Expense) => {
        if ('id' in expense) {
            db.expenses.update(expense);
        } else {
            db.expenses.create(expense);
        }
        loadData();
    };

    const handleExpenseDelete = (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            db.expenses.delete(id);
            loadData();
        }
    };

    const monthlyPayments = payments.filter(p => p.month === selectedMonth);
    const totalDeposits = contracts.filter(c => c.isActive).reduce((sum, c) => sum + c.deposit, 0);
    const totalMonthlyIncome = contracts.filter(c => c.isActive).reduce((sum, c) => sum + c.rent + c.managementFee, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidPayments = monthlyPayments.filter(p => p.status === 'PAID').length;
    const unpaidPayments = monthlyPayments.filter(p => p.status === 'UNPAID' || p.status === 'OVERDUE').length;

    return (
        <AppLayout>
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">재무 현황</h1>
                    <p className="text-sm text-slate-500 mt-1">납부 관리 및 지출 현황</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">월 총 수입</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrencyWithSuffix(totalMonthlyIncome)}</div>
                            <p className="text-xs text-muted-foreground">월세 + 관리비 합계</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">보유 보증금</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrencyWithSuffix(totalDeposits)}</div>
                            <p className="text-xs text-muted-foreground">총 {contracts.filter(c => c.isActive).length}건의 계약</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 지출</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrencyWithSuffix(totalExpenses)}</div>
                            <p className="text-xs text-muted-foreground">{expenses.length}건의 지출</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">납부 현황</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{paidPayments} / {monthlyPayments.length}</div>
                            <p className="text-xs text-muted-foreground">미납 {unpaidPayments}건</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="payments" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="payments">납부 현황</TabsTrigger>
                        <TabsTrigger value="expenses">지출 관리</TabsTrigger>
                    </TabsList>

                    <TabsContent value="payments" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>납부 현황</CardTitle>
                                        <CardDescription>월별 납부 내역</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const date = new Date(selectedMonth + '-01');
                                                date.setMonth(date.getMonth() - 1);
                                                const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                                setSelectedMonth(newMonth);
                                                generateMonthlyPayments(newMonth);
                                            }}
                                        >
                                            이전 월
                                        </Button>
                                        <span className="text-sm font-medium">{selectedMonth}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const date = new Date(selectedMonth + '-01');
                                                date.setMonth(date.getMonth() + 1);
                                                const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                                setSelectedMonth(newMonth);
                                                generateMonthlyPayments(newMonth);
                                            }}
                                        >
                                            다음 월
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {monthlyPayments.length > 0 ? (
                                    <div className="space-y-3">
                                        {monthlyPayments.map(payment => {
                                            const resident = residents.find(r => r.id === payment.residentId);
                                            const room = rooms.find(r => r.id === payment.roomId);

                                            return (
                                                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{room?.number}호</span>
                                                            <span className="text-slate-600">{resident?.name}</span>
                                                            <Badge variant={
                                                                payment.status === 'PAID' ? 'default' :
                                                                    payment.status === 'OVERDUE' ? 'destructive' :
                                                                        'secondary'
                                                            }>
                                                                {payment.status === 'PAID' ? '납부 완료' :
                                                                    payment.status === 'OVERDUE' ? '연체' :
                                                                        payment.status === 'PARTIAL' ? '부분 납부' : '미납'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            납부 예정: {formatCurrencyWithSuffix(payment.amount)}
                                                            {payment.paidDate && ` | 납부일: ${payment.paidDate}`}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setPaymentDialogOpen(true);
                                                        }}
                                                    >
                                                        {payment.status === 'PAID' ? <Check className="w-4 h-4 mr-1" /> : <Pencil className="w-4 h-4 mr-1" />}
                                                        {payment.status === 'PAID' ? '수정' : '납부 기록'}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        이번 달 납부 내역이 없습니다
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="expenses" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>지출 관리</CardTitle>
                                        <CardDescription>모든 지출 내역</CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setSelectedExpense(null);
                                            setExpenseDialogOpen(true);
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        지출 추가
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {expenses.length > 0 ? (
                                    <div className="space-y-3">
                                        {expenses.map(expense => (
                                            <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{expense.subcategory}</span>
                                                        <Badge variant="outline">
                                                            {expense.category === 'UTILITY' ? '공과금' :
                                                                expense.category === 'MAINTENANCE' ? '유지보수' :
                                                                    expense.category === 'REPAIR' ? '수리' : '기타'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {expense.date} | {expense.description}
                                                    </div>
                                                    <div className="text-lg font-bold text-red-600">
                                                        {formatCurrencyWithSuffix(expense.amount)}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedExpense(expense);
                                                            setExpenseDialogOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleExpenseDelete(expense.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        지출 내역이 없습니다
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <PaymentDialog
                    open={paymentDialogOpen}
                    onOpenChange={setPaymentDialogOpen}
                    payment={selectedPayment}
                    onSave={handlePaymentSave}
                />

                <ExpenseDialog
                    open={expenseDialogOpen}
                    onOpenChange={setExpenseDialogOpen}
                    expense={selectedExpense}
                    onSave={handleExpenseSave}
                />
            </div>
        </AppLayout>
    );
}
