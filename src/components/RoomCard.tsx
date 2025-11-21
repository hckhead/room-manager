import type { RoomWithContract } from '../types';
import { cn } from '../lib/utils';
import { User, Home, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface RoomCardProps {
    room: RoomWithContract;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

const statusColors = {
    VACANT: 'border-slate-200 bg-white hover:border-slate-300',
    OCCUPIED: 'border-green-200 bg-green-50/50 hover:border-green-300',
    LEAVING_SOON: 'border-amber-200 bg-amber-50/50 hover:border-amber-300',
    RESERVED: 'border-orange-200 bg-orange-50/50 hover:border-orange-300',
    MAINTENANCE: 'border-red-200 bg-red-50/50 hover:border-red-300',
};

const statusBadges = {
    VACANT: { text: '공실', variant: 'secondary' as const },
    OCCUPIED: { text: '입실중', variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' },
    LEAVING_SOON: { text: '퇴실예정', variant: 'destructive' as const, className: 'bg-amber-500 hover:bg-amber-600' },
    RESERVED: { text: '예약중', variant: 'outline' as const, className: 'text-orange-600 border-orange-200' },
    MAINTENANCE: { text: '수리중', variant: 'destructive' as const },
};

export function RoomCard({ room, onClick, className, style }: RoomCardProps) {
    const badge = statusBadges[room.status];

    return (
        <Card
            className={cn(
                "w-[200px] h-[120px] cursor-pointer transition-all shadow-sm hover:shadow-md",
                statusColors[room.status],
                className
            )}
            onClick={onClick}
            style={style}
        >
            <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold text-slate-800">
                    {room.number}호
                </CardTitle>
                <Badge
                    variant={badge.variant}
                    className={cn("text-[10px] px-1.5 h-5", 'className' in badge ? badge.className : '')}
                >
                    {badge.text}
                </Badge>
            </CardHeader>
            <CardContent className="p-3 pt-2">
                <div className="space-y-1.5">
                    {room.status === 'OCCUPIED' || room.status === 'LEAVING_SOON' ? (
                        <>
                            <div className="flex items-center text-sm font-medium text-slate-700">
                                <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                <span className="truncate">{room.resident?.name || '입실자 정보 없음'}</span>
                            </div>
                            {room.currentContract && (
                                <div className="flex items-center text-xs text-slate-500">
                                    <Clock className="w-3 h-3 mr-1.5" />
                                    <span>~ {new Date(room.currentContract.endDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center text-xs text-slate-400 mt-2">
                            <Home className="w-3.5 h-3.5 mr-1.5" />
                            <span>{room.type}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
