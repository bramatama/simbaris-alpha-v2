import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    onConfirm: () => void;
    isProcessing?: boolean;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title = 'Konfirmasi Tindakan',
    description = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    onConfirm,
    isProcessing = false,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'default',
}: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <div
                        className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full ${
                            variant === 'destructive'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-primary/10 text-primary'
                        }`}
                    >
                        {variant === 'destructive' ? (
                            <AlertCircle className="h-6 w-6" />
                        ) : (
                            <HelpCircle className="h-6 w-6" />
                        )}
                    </div>
                    <DialogTitle
                        className={
                            variant === 'destructive'
                                ? 'font-bold text-destructive'
                                : 'font-bold'
                        }
                    >
                        {title}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isProcessing}>
                            {cancelText}
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        variant={variant}
                        className="gap-2"
                    >
                        {isProcessing && <Spinner className="h-4 w-4" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
