import { Sidebar } from './Sidebar';
import { ScrollArea } from '../ui/scroll-area';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center px-6 justify-between shadow-sm z-10">
                    <h2 className="text-lg font-semibold text-slate-800">대시보드</h2>
                    <div className="flex items-center gap-4">
                        {/* Add user profile or notifications here */}
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                            A
                        </div>
                    </div>
                </header>
                <ScrollArea className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
