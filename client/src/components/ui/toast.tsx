import * as React from "react";
import {
  ToastProps,
  ToastProvider,
  ToastViewport,
} from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg bg-white p-4 shadow-lg",
        className
      )}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    />
  )
);
Toast.displayName = "Toast";

const toastVariants = cva(
  "flex justify-between items-center shadow-lg p-4 rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900",
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  message: string;
  onClose?: () => void;
}

const ToastContent = React.forwardRef<HTMLDivElement, ToastContentProps>(
  ({ className, variant, message, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="hover:bg-black/10 ml-4 p-1 rounded-full"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
);
ToastContent.displayName = "ToastContent";

export { Toast, ToastContent, ToastProvider, ToastViewport };
