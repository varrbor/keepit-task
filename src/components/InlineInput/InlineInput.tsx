import { useEffect, useRef, useState } from 'react';
import { MAX_NAME_LENGTH } from '../../utils/sanitize';
import './InlineInput.css';

interface Props {
  initialValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function InlineInput({ initialValue = '', placeholder = 'Name…', onConfirm, onCancel }: Props) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const commit = () => {
    if (done.current) return;
    done.current = true;
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
    else onCancel();
  };

  const cancel = () => {
    if (done.current) return;
    done.current = true;
    onCancel();
  };

  return (
    <input
      ref={ref}
      className="inline-input"
      value={value}
      maxLength={MAX_NAME_LENGTH}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        else if (e.key === 'Escape') cancel();
      }}
      onBlur={commit}
    />
  );
}
