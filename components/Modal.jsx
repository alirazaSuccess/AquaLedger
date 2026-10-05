"use client";

import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}) {
  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close modal with Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full ${sizeClasses[size] || sizeClasses.md} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}