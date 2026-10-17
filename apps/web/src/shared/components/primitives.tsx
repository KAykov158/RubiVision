import { useId, useLayoutEffect, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { useTranslation } from '../i18n/useTranslation';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
};

export function Button({ className = '', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return <button {...props} className={`rv-button rv-button--${variant} ${className}`.trim()} type={type} />;
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label': string };

export function IconButton({ className = '', type = 'button', ...props }: IconButtonProps) {
  return <button {...props} className={`rv-icon-button ${className}`.trim()} type={type} />;
}

export function Card({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`rv-card ${className}`.trim()} />;
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function Field({ id, label, hint, error, className = '', ...inputProps }: FieldProps) {
  const hintId = useId();
  const errorId = useId();
  const describedBy = [inputProps['aria-describedby'], hint ? hintId : undefined, error ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div className="rv-field">
      <label className="rv-field__label" htmlFor={id}>{label}</label>
      <Input
        {...inputProps}
        id={id}
        className={className}
        aria-describedby={describedBy}
        aria-invalid={error ? true : inputProps['aria-invalid']}
      />
      {hint && <span className="rv-field__hint" id={hintId}>{hint}</span>}
      {error && <span className="rv-field__error" id={errorId}>{error}</span>}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`rv-input ${className}`.trim()} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export function Select({ label, error, id: providedId, className = '', children, ...props }: SelectProps) {
  const generatedId = useId();
  const errorId = useId();
  const id = providedId ?? generatedId;
  const describedBy = [props['aria-describedby'], error ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div className="rv-field">
      <label className="rv-field__label" htmlFor={id}>{label}</label>
      <select
        {...props}
        id={id}
        className={`rv-select ${className}`.trim()}
        aria-describedby={describedBy}
        aria-invalid={error ? true : props['aria-invalid']}
      >
        {children}
      </select>
      {error && <span className="rv-field__error" id={errorId}>{error}</span>}
    </div>
  );
}

type DialogProps = {
  id?: string;
  className?: string;
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Dialog({ id, className = '', open, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const t = useTranslation();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      id={id}
      aria-labelledby={titleId}
      className={`rv-dialog ${className}`.trim()}
      ref={dialogRef}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;

        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        )).filter((element) => !element.hidden && !element.closest('[aria-hidden="true"]')
          && getComputedStyle(element).visibility !== 'hidden' && element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable.at(-1);

        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="rv-dialog__header">
        <h2 id={titleId}>{title}</h2>
        <IconButton aria-label={t('closeDialog')} onClick={onClose}>×</IconButton>
      </header>
      <div className="rv-dialog__content">{children}</div>
    </dialog>
  );
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
};

export function Badge({ className = '', tone = 'neutral', ...props }: BadgeProps) {
  return <span {...props} className={`rv-badge rv-badge--${tone} ${className}`.trim()} />;
}

export function Spinner({ label }: { label?: string }) {
  const defaultLabel = useTranslation()('loading');
  const accessibleLabel = label ?? defaultLabel;
  return <span className="rv-spinner" role="status" aria-label={accessibleLabel}><span className="rv-spinner__shape" aria-hidden="true" /><span className="rv-visually-hidden">{accessibleLabel}</span></span>;
}

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} aria-hidden="true" className={`rv-skeleton ${className}`.trim()} />;
}

type StateProps = {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, children, action }: StateProps) {
  const titleId = useId();
  return <section className="rv-state" aria-labelledby={titleId}><h2 id={titleId}>{title}</h2>{children && <p>{children}</p>}{action}</section>;
}

export function ErrorState({ title, children, action }: StateProps) {
  return <section className="rv-state rv-state--error" role="alert"><h2>{title}</h2>{children && <p>{children}</p>}{action}</section>;
}

export function PageContainer({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return <main {...props} className={`rv-page-container ${className}`.trim()} />;
}
