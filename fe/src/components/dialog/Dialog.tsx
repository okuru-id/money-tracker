import { useEffect, useCallback } from "react";
import { IconX } from "@tabler/icons-react";
import "./dialog.css";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
}: DialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
      <div
        className={`dialog dialog--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="dialog__header">
            <h3 className="dialog__title">{title}</h3>
            <button
              className="dialog__close"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <IconX size={18} />
            </button>
          </div>
        )}
        {description && (
          <p className="dialog__description">{description}</p>
        )}
        <div className="dialog__content">{children}</div>
      </div>
    </div>
  );
}

/* Compound Components for more flexibility */

interface DialogRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function DialogRoot({
  open,
  onOpenChange,
  children,
  size = "md",
}: DialogRootProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
      <div
        className={`dialog dialog--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="dialog__header">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="dialog__title">{children}</h3>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="dialog__description">{children}</p>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="dialog__content">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="dialog__footer">{children}</div>;
}

export function DialogClose({
  children,
  onClick,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="dialog__close" onClick={onClick} aria-label="Close">
      {children || <IconX size={18} />}
    </button>
  );
}