import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  description?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 sm:px-8">
      {/* Blue Backdrop - Clicking dark area closes modal */}
      <div 
        className="absolute inset-0 bg-blue-950/60 dark:bg-blue-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Dialog container */}
      <div className="relative bg-background text-foreground rounded-[20px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-blue-100/20 dark:border-blue-900/40">
        
        {/* Header section */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
          <div>
            {title && <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 p-2 rounded-full transition-colors flex-shrink-0 ml-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

