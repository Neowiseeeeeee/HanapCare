import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications();
  const markAsRead = useMarkNotificationRead();

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alert': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default: return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <PageHeader 
        title="Notifications" 
        description="System alerts and updates."
        action={
          <Button variant="outline" disabled={!notifications?.some(n => !n.isRead)}>
            Mark All as Read
          </Button>
        }
      />

      <div className="space-y-4">
        {isLoading ? (
          <Card><CardContent className="p-6"><LoadingTable columns={1} rows={3} /></CardContent></Card>
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState 
            title="All caught up" 
            description="You don't have any notifications right now."
            icon={<Bell className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className={`overflow-hidden transition-colors ${!notif.isRead ? 'bg-primary/5 border-primary/20' : 'opacity-70'}`}>
              <CardContent className="p-4 flex gap-4">
                <div className="shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`text-base ${!notif.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm mt-1 mb-3 text-muted-foreground">{notif.message}</p>
                  
                  {!notif.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notif.id)} className="h-8 px-2 text-xs">
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
