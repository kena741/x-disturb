"use client";

import React, { useEffect, useState } from "react";
import {
  sendNotification,
  fetchNotificationHistory,
  Notification,
  sendNotficationMobile,
} from "@/app/api/notification-api";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";
import { AdminPageContent } from "@/components/admin/admin-layout";
import {
  AdminTableShell,
  AdminDataTableEmpty,
} from "@/components/admin/data-table";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getNotificationStatusTone } from "@/lib/admin-status-badge";
import { formatAdminDate } from "@/lib/admin-display";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categories = ["Orthodox", "Protestant", "Mosque", "Library", "other"];

const PushNotificationPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "category" | "referral">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [history, setHistory] = useState<Notification[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) return toast.error("Title and Message required");

    setIsSending(true);

    try {
      let target = "";
      if (targetType === "all") {
        target = "all";
      } else if (targetType === "category") {
        if (!selectedCategory) return toast.error("Please select a category.");
        target = selectedCategory;
      } else if (targetType === "referral") {
        if (!referralCode) return toast.error("Please enter a referral code.");
        target = referralCode;
      }

      const payload: {
        title: string;
        message: string;
        target: string;
        targetType: "all" | "category" | "referral";
        status: "Scheduled" | "Sent";
        scheduledAt: Date | null;
      } = {
        title,
        message,
        target,
        targetType,
        status: isScheduled ? "Scheduled" : "Sent",
        scheduledAt:
          isScheduled && scheduledDateTime ? new Date(scheduledDateTime) : null,
      };

      await sendNotification(payload);
      await sendNotficationMobile({
        message: payload.message,
        target: payload.target,
        targetType: payload.targetType,
        title: payload.title,
      });
      setTitle("");
      setMessage("");
      setSelectedCategory("");
      setReferralCode("");
      setTargetType("all");
      setIsScheduled(false);
      setScheduledDateTime("");
      await loadHistory();
      toast.success("Notification sent");
    } catch (err) {
      toast.error("Something went wrong.");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const loadHistory = async () => {
    const data = await fetchNotificationHistory();
    setHistory(
      data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    );
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <AdminPageContent>
      <div className="max-w-3xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-3">
          <h3 className="admin-section-title text-base">Target Audience</h3>
          <div className="flex flex-wrap gap-4">
            {(
              [
                { value: "all", label: "All Users" },
                { value: "category", label: "By Category" },
                { value: "referral", label: "By Referral Code" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="targetType"
                  value={option.value}
                  checked={targetType === option.value}
                  onChange={() => setTargetType(option.value)}
                  className="accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {targetType === "category" && (
          <div className="space-y-2">
            <Label>Select Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {targetType === "referral" && (
          <div className="space-y-2">
            <Label htmlFor="referral-code">Referral Code</Label>
            <Input
              id="referral-code"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="e.g. XYZ123"
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="schedule"
              checked={isScheduled}
              onCheckedChange={(checked) => setIsScheduled(checked === true)}
            />
            <Label htmlFor="schedule" className="cursor-pointer">
              Schedule Notification
            </Label>
          </div>

          {isScheduled && (
            <Input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
            />
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={isSending}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader size={16} className="animate-spin" />
              Sending…
            </>
          ) : (
            "Send Notification"
          )}
        </Button>
      </div>

      <section className="space-y-4">
        <h3 className="admin-section-title">Notification History</h3>
        <AdminTableShell>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground">Message</TableHead>
                  <TableHead className="text-muted-foreground">Target</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <AdminDataTableEmpty
                    colSpan={5}
                    message="No notifications sent yet"
                  />
                ) : (
                  history.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="font-medium">{notif.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {notif.message}
                      </TableCell>
                      <TableCell className="text-sm">{notif.target}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatAdminDate(notif.createdAt.toDate())}
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge
                          label={notif.status}
                          tone={getNotificationStatusTone(notif.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </AdminTableShell>
      </section>
    </AdminPageContent>
  );
};

export default PushNotificationPage;
