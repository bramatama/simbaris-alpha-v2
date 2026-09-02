import { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

interface FormDialogProps {
    trigger: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: FormEvent) => void;
    title: string | ReactNode;
    titleClass?: string;
    description?: string | ReactNode;
    children: ReactNode;
    submitText: string;
    submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    isProcessing?: boolean;
    isDisabled?: boolean;
    cancelText?: string;
}

export function FormDialog({
    trigger,
    open,
    onOpenChange,
    onSubmit,
    title,
    titleClass,
    description,
    children,
    submitText,
    submitVariant = 'default',
    isProcessing = false,
    isDisabled = false,
    cancelText = 'Cancel',
}: FormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className={titleClass}>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <div className="space-y-4 py-6">{children}</div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {cancelText}
                        </Button>
                        <Button type="submit" variant={submitVariant} disabled={isDisabled || isProcessing}>
                            {isProcessing && <Spinner className="mr-2 h-4 w-4" />}
                            {submitText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
