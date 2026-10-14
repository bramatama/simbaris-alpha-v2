import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

type PdfViewerDialogProps = {
    document: { name: string; url: string } | null;
    onClose: () => void;
};

export function PdfViewerDialog({ document, onClose }: PdfViewerDialogProps) {
    return (
        <Dialog
            open={!!document}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="flex h-[85vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b border-border/50 bg-muted/30 p-4">
                    <DialogTitle className="flex items-center gap-2 truncate pr-6 text-base">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        {document?.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="relative w-full flex-1 bg-muted/10">
                    {document && (
                        <iframe
                            src={`${document.url}#toolbar=0`}
                            className="absolute inset-0 h-full w-full border-0"
                            title="PDF Viewer"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}