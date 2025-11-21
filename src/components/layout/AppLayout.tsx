import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [open, setOpen] = useState(false);

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

                        <h2 className="text-lg font-semibold text-slate-800">대시보드</h2>
                    </div>

                    <div className="flex items-center gap-4">
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
