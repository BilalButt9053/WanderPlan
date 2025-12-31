import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(({ asChild, children, open, setOpen, ...props }, ref) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen?.(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 
      ref, 
      onClick: handleClick,
      ...props 
    });
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(
  ({ className, align = "center", children, open, setOpen, ...props }, ref) => {
    const contentRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target)) {
          setOpen?.(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          {
            "right-0": align === "end",
            "left-0": align === "start",
            "left-1/2 -translate-x-1/2": align === "center",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const handleClick = (e) => {
    onClick?.(e);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
