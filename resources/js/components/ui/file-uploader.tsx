import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios, { AxiosProgressEvent } from 'axios';
import { 
    UploadCloud, FileText, Image as ImageIcon, X, 
    RefreshCw, CheckCircle2, AlertCircle, FileCode2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type UploadVariant = 'image' | 'document';

interface FileUploaderProps {
    variant: UploadVariant;
    endpoint: string; // URL endpoint API untuk mengunggah 1 file
    maxSizeMB?: number;
    multiple?: boolean;
    accept?: string;
    onUploadSuccess: (fileId: string, responsePath: string) => void;
    onRemove: (fileId: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface TrackedFile {
    id: string;
    file: File;
    preview: string | null;
    progress: number;
    speed: string;
    timeRemaining: string;
    status: UploadState;
    errorMessage?: string;
    abortController?: AbortController;
}

// --- Helper Functions ---
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return 'Menghitung...';
    if (seconds < 60) return `${Math.round(seconds)} dtk`;
    const min = Math.floor(seconds / 60);
    const sec = Math.round(seconds % 60);
    return `${min} mnt ${sec} dtk`;
};

export function FileUploader({
    variant,
    endpoint,
    maxSizeMB = 5,
    multiple = false,
    accept,
    onUploadSuccess,
    onRemove,
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [trackedFiles, setTrackedFiles] = useState<TrackedFile[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Default accept berdasarkan varian
    const defaultAccept = variant === 'image' ? 'image/jpeg,image/png,image/jpg' : 'application/pdf';
    const acceptedTypes = accept || defaultAccept;

    // Bersihkan URL preview saat komponen di-unmount untuk mencegah memory leak
    useEffect(() => {
        return () => {
            trackedFiles.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
        };
    }, []);

    const startUpload = async (trackedFile: TrackedFile) => {
        const controller = new AbortController();
        const formData = new FormData();
        formData.append('file', trackedFile.file);

        // Update state to uploading
        setTrackedFiles(prev => prev.map(f => 
            f.id === trackedFile.id 
                ? { ...f, status: 'uploading', progress: 0, errorMessage: undefined, abortController: controller } 
                : f
        ));

        let lastLoaded = 0;
        let lastTime = Date.now();

        try {
            const response = await axios.post(endpoint, formData, {
                signal: controller.signal,
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    const total = progressEvent.total || trackedFile.file.size;
                    const loaded = progressEvent.loaded;
                    const percent = Math.round((loaded * 100) / total);

                    const currentTime = Date.now();
                    const timeDiff = (currentTime - lastTime) / 1000; // dalam detik

                    if (timeDiff > 0.5 || percent === 100) { // Update metrik tiap 0.5 detik
                        const bytesDiff = loaded - lastLoaded;
                        const speedBps = bytesDiff / timeDiff;
                        const remainingBytes = total - loaded;
                        const timeRemSec = remainingBytes / speedBps;

                        setTrackedFiles(prev => prev.map(f => 
                            f.id === trackedFile.id 
                                ? { 
                                    ...f, 
                                    progress: percent, 
                                    speed: `${formatBytes(speedBps)}/s`, 
                                    timeRemaining: formatTime(timeRemSec) 
                                  } 
                                : f
                        ));

                        lastLoaded = loaded;
                        lastTime = currentTime;
                    }
                }
            });

            // Berhasil
            setTrackedFiles(prev => prev.map(f => 
                f.id === trackedFile.id ? { ...f, status: 'success', progress: 100 } : f
            ));
            
            // Kembalikan path dari server ke parent component
            onUploadSuccess(trackedFile.id, response.data.path || response.data.url);

        } catch (error: any) {
            if (axios.isCancel(error)) return; // Diabaikan jika dibatalkan oleh pengguna
            
            setTrackedFiles(prev => prev.map(f => 
                f.id === trackedFile.id ? { 
                    ...f, 
                    status: 'error', 
                    errorMessage: error.response?.data?.message || 'Gagal terhubung ke server.' 
                } : f
            ));
        }
    };

    const processFiles = (files: FileList | File[]) => {
        const newFiles: TrackedFile[] = Array.from(files).map(file => {
            
            // Validasi Ukuran
            if (file.size > maxSizeMB * 1024 * 1024) {
                return {
                    id: Math.random().toString(36).substring(7),
                    file,
                    preview: null,
                    progress: 0,
                    speed: '',
                    timeRemaining: '',
                    status: 'error',
                    errorMessage: `Maksimal ukuran ${maxSizeMB}MB.`
                };
            }

            return {
                id: Math.random().toString(36).substring(7),
                file,
                preview: variant === 'image' ? URL.createObjectURL(file) : null,
                progress: 0,
                speed: 'Menghitung...',
                timeRemaining: 'Menghitung...',
                status: 'idle',
            };
        });

        const filesToSet = multiple ? [...trackedFiles, ...newFiles] : [newFiles[0]];
        setTrackedFiles(filesToSet);

        // Langsung mulai unggah otomatis untuk file yang lolos validasi (status: idle)
        filesToSet.forEach(f => {
            if (f.status === 'idle') startUpload(f);
        });
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [trackedFiles, multiple]);

    const handleRemove = (id: string) => {
        const file = trackedFiles.find(f => f.id === id);
        if (file && file.status === 'uploading' && file.abortController) {
            file.abortController.abort(); // Hentikan unggahan jika sedang berjalan
        }
        if (file && file.preview) URL.revokeObjectURL(file.preview);
        
        setTrackedFiles(prev => prev.filter(f => f.id !== id));
        onRemove(id);
    };

    return (
        <div className="space-y-4 w-full">
            {/* AREA DROPZONE */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden group",
                    isDragging 
                        ? "border-primary bg-primary/10 scale-[1.02] shadow-sm" 
                        : "border-border/70 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={acceptedTypes}
                    multiple={multiple}
                    onChange={(e) => {
                        if (e.target.files) processFiles(e.target.files);
                        e.target.value = ''; // Reset input
                    }}
                />
                
                <div className={cn(
                    "flex flex-col items-center transition-transform duration-300",
                    isDragging && "scale-110"
                )}>
                    {variant === 'image' ? (
                        <ImageIcon className={cn("w-10 h-10 mb-3", isDragging ? "text-primary animate-bounce" : "text-muted-foreground/50 group-hover:text-primary/70")} />
                    ) : (
                        <UploadCloud className={cn("w-10 h-10 mb-3", isDragging ? "text-primary animate-bounce" : "text-muted-foreground/50 group-hover:text-primary/70")} />
                    )}
                    
                    <span className="text-sm font-semibold text-foreground">
                        {isDragging ? 'Lepaskan file sekarang...' : 'Tarik & lepas file di sini'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                        Atau klik untuk menelusuri (Maks {maxSizeMB}MB)
                    </span>
                </div>
            </div>

            {/* DAFTAR FILE & PROGRESS */}
            {trackedFiles.length > 0 && (
                <div className="space-y-3">
                    {trackedFiles.map((file) => {
                        const fileFormat = file.file.name.split('.').pop()?.toUpperCase() || 'FILE';
                        
                        return (
                            <div key={file.id} className={cn(
                                "flex items-start gap-3 p-3 border rounded-lg bg-card shadow-sm transition-all",
                                file.status === 'error' && "border-destructive/30 bg-destructive/5",
                                file.status === 'success' && "border-emerald-500/30 bg-emerald-500/5"
                            )}>
                                {/* THUMBNAIL / ICON */}
                                <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border/50">
                                    {variant === 'image' && file.preview ? (
                                        <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileCode2 className={cn("w-6 h-6", file.status === 'error' ? "text-destructive" : "text-muted-foreground")} />
                                    )}
                                </div>

                                {/* FILE INFO & PROGRESS */}
                                <div className="flex-1 min-w-0 py-0.5">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="truncate text-sm font-semibold text-foreground pr-2" title={file.file.name}>
                                            {file.file.name}
                                        </span>
                                        <span className="text-[10px] font-medium text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded-sm">
                                            {fileFormat} • {formatBytes(file.file.size)}
                                        </span>
                                    </div>

                                    {file.status === 'uploading' && (
                                        <div className="space-y-1.5 animate-in fade-in">
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary transition-all duration-300 ease-out" 
                                                    style={{ width: `${file.progress}%` }} 
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                                                <span>{file.progress}% • {file.speed}</span>
                                                <span>{file.timeRemaining} tersisa</span>
                                            </div>
                                        </div>
                                    )}

                                    {file.status === 'error' && (
                                        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate" title={file.errorMessage}>{file.errorMessage}</span>
                                        </div>
                                    )}

                                    {file.status === 'success' && (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                            <span>Berhasil diunggah</span>
                                        </div>
                                    )}
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex items-center gap-1 shrink-0 h-full">
                                    {file.status === 'error' && (
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="icon" 
                                            className="h-7 w-7 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                            onClick={() => startUpload(file)}
                                            title="Coba Lagi"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemove(file.id)}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}