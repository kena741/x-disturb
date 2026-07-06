"use client";

import { useState } from "react";
import { Bell, MoreVertical, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import {
  clearAllNotifications,
  deleteNotification,
  markAllAsRead,
  markAsRead,
} from "@/features/notifications/notificationsSlice";
import { formatDistanceToNow } from "date-fns";

export default function NotificationPanel() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  const [isOpen, setIsOpen] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
    setShowClearAlert(false);
  };

  const handleDeleteNotification = (id: string) => {
    dispatch(deleteNotification(id));
    setNotificationToDelete(null);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(timestamp, { addSuffix: false });
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="relative rounded-full p-2 border border-input bg-background hover:bg-accent cursor-pointer">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary"
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[380px] p-0 bg-popover border-border scrollbar-hide"
          align="end"
        >
          <div className="flex items-center justify-between p-4 border-b border-border scrollbar-hide">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearAlert(true)}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Clear notification history
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40`}
                      alt={notification.user}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {notification.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      User: {notification.user}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entered Zone: {notification.zone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatTime(notification.timestamp)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted/50 transition">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setNotificationToDelete(notification.id)
                          }
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        {!notification.read && (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Mark as read
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-border flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
              <Link
                href="/dashboard/notifications"
                className="text-sm text-primary hover:text-primary/80 hover:underline flex items-center"
                onClick={() => setIsOpen(false)}
              >
                See all notification
              </Link>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Clear All Notifications Alert */}
      <AlertDialog open={showClearAlert} onOpenChange={setShowClearAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All notifications will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single Notification Alert */}
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
    </>
  );
}
