import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: AdminSearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 pl-9 bg-background border-border focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

interface AdminFilterSelectOption {
  value: string;
  label: string;
}

interface AdminFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminFilterSelectOption[];
  placeholder: string;
  className?: string;
}

export function AdminFilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: AdminFilterSelectProps) {
  return (
    <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
      <SelectTrigger className={cn("h-10 bg-background border-border", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface AdminFilterPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminFilterPanel({ children, className }: AdminFilterPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdminFilterPillOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface AdminFilterPillsProps<T extends string> {
  options: AdminFilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function AdminFilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: AdminFilterPillsProps<T>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className="opacity-70">({opt.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
