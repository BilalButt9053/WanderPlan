import * as React from "react";
import { cn } from "@/lib/utils";

const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSelect = (newValue, label) => {
    setSelectedValue(newValue);
    setSelectedLabel(label);
    if (onValueChange) onValueChange(newValue);
    setOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { open, setOpen, selectedValue, selectedLabel, handleSelect })
      )}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, open, setOpen, selectedValue, selectedLabel, handleSelect, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    onClick={() => setOpen && setOpen(!open)}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, selectedValue, selectedLabel }) => {
  return <span className={selectedLabel ? "" : "text-muted-foreground"}>{selectedLabel || placeholder}</span>;
};

const SelectContent = React.forwardRef(({ className, children, open, handleSelect, selectedValue, ...props }, ref) => {
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { handleSelect, selectedValue })
      )}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, handleSelect, selectedValue, ...props }, ref) => {
  const isSelected = selectedValue === value;
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent/50",
        className
      )}
      onClick={() => handleSelect && handleSelect(value, children)}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
