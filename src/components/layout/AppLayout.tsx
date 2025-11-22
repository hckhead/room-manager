import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, Download, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { db } from '../../services/db';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    // Get room statistics
    const getRoomStats = () => {
        try {
            const allRooms = db.rooms.getAll('demo-user-id'); // TODO: Get from auth context
            const occupied = allRooms.filter(r => r.status === 'OCCUPIED').length;
            const vacant = allRooms.filter(r => r.status === 'VACANT').length;

            return {
                total: allRooms.length,
                occupied,
                vacant
            };
        } catch {
            return { total: 0, occupied: 0, vacant: 0 };
        }
    };

    const stats = getRoomStats();

    const handleExport = () => {
        try {
            const data = db.backup();

            // Generate filename
            const now = new Date();
            const timestamp = now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0') + '-' +
                String(now.getHours()).padStart(2, '0') +
                String(now.getMinutes()).padStart(2, '0') +
                String(now.getSeconds()).padStart(2, '0');

            const filename = `backup-${timestamp}.json`;

            // Convert to JSON string
            const jsonString = JSON.stringify(data, null, 2);

            // Create download link
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonString));
            element.setAttribute('download', filename);
            element.style.display = 'none';

            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);

            alert('백업 파일이 다운로드되었습니다.');
        } catch (error) {
            console.error('Export error:', error);
            alert('백업 파일 생성 중 오류가 발생했습니다.');
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!confirm('현재 데이터가 모두 삭제되고 가져온 데이터로 덮어씌워집니다. 계속하시겠습니까?')) {
            event.target.value = ''; // Reset input
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (db.restore(data)) {
                    alert('데이터 복구가 완료되었습니다. 페이지를 새로고침합니다.');
                    window.location.reload();
                } else {
                    alert('데이터 복구에 실패했습니다. 파일 형식을 확인해주세요.');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 flex-col">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center px-4 md:px-6 justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64">
                                <Sidebar onNavigate={() => setOpen(false)} />
                            </SheetContent>
                        </Sheet>

                        <div className="flex items-center gap-3">
                            {/* Desktop: App name + Stats */}
                            <h2 className="hidden md:block text-lg font-bold text-slate-800">고시원 관리</h2>

                            {/* Stats - visible on all screen sizes */}
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="hidden md:inline text-slate-400">|</span>
                                <span>전체 <strong className="text-slate-800">{stats.total}</strong>실</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-green-600">입실 <strong>{stats.occupied}</strong></span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-500">공실 <strong>{stats.vacant}</strong></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleExport} title="데이터 내보내기">
                            <Download className="w-5 h-5 text-slate-500" />
                        </Button>
                        <div className="relative">
                            <Button variant="ghost" size="icon" onClick={() => document.getElementById('import-file')?.click()} title="데이터 가져오기">
                                <Upload className="w-5 h-5 text-slate-500" />
                            </Button>
                            <input
                                id="import-file"
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleImport}
                            />
                        </div>

                        {/* Add user profile or notifications here */}
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                            A
                        </div>
                    </div>
                </header>
                <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
