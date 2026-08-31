import { forwardRef, useId, type InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, id, className = "", ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--ink)]">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:text-stone-400 ${
            error ? "border-red-300 bg-red-50/40" : "border-[var(--line)] bg-white focus:border-[var(--brand)]"
          } ${className}`}
          {...rest}
        />
        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-[var(--muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Field.displayName = "Field";
