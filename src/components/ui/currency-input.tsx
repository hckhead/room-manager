import { Input } from './input';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/currency';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState(formatCurrency(value));

    useEffect(() => {
        setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const numValue = parseInt(rawValue, 10) || 0;
        setDisplayValue(formatCurrency(numValue));
        onChange(numValue);
    };

    const handleBlur = () => {
        // Ensure formatting is correct on blur
        setDisplayValue(formatCurrency(value));
    };

    return (
        <Input
            {...props}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            inputMode="numeric"
        />
    );
}
