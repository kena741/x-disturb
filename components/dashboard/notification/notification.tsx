"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import {
  clearAllNotifications,
  deleteNotification,
  loadMoreNotifications,
  markAllAsRead,
  markAsRead,
} from "@/features/notifications/notificationsSlice";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const loading = useAppSelector((state) => state.notifications.loading);

  const [showClearAlert, setShowClearAlert] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(
    null
  );

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
    setShowClearAlert(false);
  };

  const handleDeleteNotification = (id: string) => {
    dispatch(deleteNotification(id));
    setNotificationToDelete(null);
  };

  const formatTime = (timestamp: number) =>
    formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">
            All notifications
          </CardTitle>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(markAllAsRead())}
              >
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearAlert(true)}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <Button asChild>
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex items-start gap-3 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={notification.user}
                    />
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {notification.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {notification.user}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entered zone: {notification.zone}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="mr-1 whitespace-nowrap text-xs text-muted-foreground">
                      {formatTime(notification.timestamp)}
                    </span>

                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
                      {!notification.read && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => dispatch(markAsRead(notification.id))}
                              aria-label="Mark as read"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Mark as read</TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setNotificationToDelete(notification.id)}
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-center border-t border-border p-4">
                <Button
                  variant="outline"
                  onClick={() => dispatch(loadMoreNotifications())}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showClearAlert} onOpenChange={setShowClearAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All notifications will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Clear all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={notificationToDelete !== null}
        onOpenChange={(open) => !open && setNotificationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This notification will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                notificationToDelete &&
                handleDeleteNotification(notificationToDelete)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
