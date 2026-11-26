import { AlertCircleIcon, CheckCircle2Icon, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Alerts({
    title,
    description,
    variant,
    className,
    onClose,
    ...props
}: {
    title?: string;
    description?: string[];
    variant?: 'default' | 'success' | 'destructive';
    className?: string;
    onClose?: () => void;
}) {
    const [closing, setClosing] = useState(false);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const closeTimer = setTimeout(() => {
            setClosing(true);
        }, 5000);

        return () => {
            clearTimeout(closeTimer);
        };
    }, []);

    useEffect(() => {
        if (closing) {
            const removeTimer = setTimeout(() => {
                onCloseRef.current?.();
            }, 250);

            return () => clearTimeout(removeTimer);
        }
    }, [closing]);

    return (
        <Alert
            variant={variant}
            className={`${closing ? 'animate-out slide-out-to-right-2' : 'animate-in slide-in-from-right-2'} rounded-lg duration-300 fade-in fade-out ${className}`}
            {...props}
        >
            {variant === 'success' && <CheckCircle2Icon />}
            {variant === 'destructive' && <AlertCircleIcon />}
            <AlertTitle>{title}</AlertTitle>
            {description && variant === 'destructive' ? (
                <ul className="list-inside list-disc text-sm">
                    {Array.from(new Set(description)).map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            ) : (
                description && (
                    <AlertDescription>{description}</AlertDescription>
                )
            )}
            <button
                onClick={() => setClosing(true)}
                className="absolute top-4 right-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </Alert>
    );
}
