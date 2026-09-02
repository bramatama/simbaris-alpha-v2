import { AlertCircleIcon, CheckCircle2Icon, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState, useRef } from 'react';

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
    const [visible, setVisible] = useState(true);
    const [closing, setClosing] = useState(false);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        setVisible(true);
        setClosing(false);
        // after 5 seconds, start animate-out
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
                setVisible(false);
                onCloseRef.current?.();
            }, 250);
            return () => clearTimeout(removeTimer);
        }
    }, [closing]);

    if (!visible) return null;
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
                className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity cursor-pointer hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </Alert>
    );
}
