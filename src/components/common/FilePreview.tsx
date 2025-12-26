import { useState, useEffect } from 'react';
import { File, ExternalLink, Loader2, ImageOff, Download } from 'lucide-react';
import api from '@/services/api';
import { format } from 'date-fns';

interface FilePreviewProps {
    file: {
        id: number;
        file_path: string;
        createdAt: string;
    };
}

export function FilePreview({ file }: FilePreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    // Extract filename
    const fileName = file.file_path.split(/[/\\]/).pop() || 'Unknown file';
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);

    useEffect(() => {
        let objectUrl: string | null = null;

        const fetchFile = async () => {
            if (!fileName) return;

            setIsLoading(true);
            setError(false);

            try {
                // Fetch as blob using the authenticated API instance
                // We use the /uploads/ endpoint pattern we suspect works or needs to work
                // Note: If your backend serves static files from a different root, we might need to adjust this URL.
                // However, using 'api' instance ensures auth headers are sent.
                const response = await api.get(`/uploads/${fileName}`, {
                    responseType: 'blob',
                    // IMPORTANT: This prevents axios from parsing response as JSON
                    // and also helps if the server returns binary data
                    baseURL: 'http://localhost:8080' // Override base URL just for this request if needed, or rely on API default 
                });

                // Create object URL from blob
                const blob = new Blob([response.data], {
                    type: response.headers['content-type'] || 'application/octet-stream'
                });
                objectUrl = URL.createObjectURL(blob);
                setPreviewUrl(objectUrl);
            } catch (err) {
                console.error(`Failed to fetch file ${fileName}:`, err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (isImage) {
            fetchFile();
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [file.file_path, fileName, isImage]);

    // Handler for download/external view click
    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();

        // If we already have the blob URL (images), use it
        if (previewUrl) {
            const link = document.createElement('a');
            link.href = previewUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // For non-images or failed images, try to fetch and download
        try {
            const response = await api.get(`/uploads/${fileName}`, {
                responseType: 'blob',
                baseURL: 'http://localhost:8080'
            });

            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/octet-stream'
            });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            // Fallback: try opening in new tab directly (might fail if auth needed for direct link)
            window.open(`http://localhost:8080/uploads/${fileName}`, '_blank');
        }
    };

    return (
        <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-3">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                        Uploaded {format(new Date(file.createdAt), 'MMM d, yyyy')}
                    </p>
                </div>
                <button
                    onClick={handleDownload}
                    className="text-primary hover:text-primary/80 transition-colors p-1 rounded-full hover:bg-muted"
                    title="Download/View"
                >
                    {isImage ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                </button>
            </div>

            {isImage && (
                <div className="mt-2 min-h-[100px] bg-muted/20 rounded border flex items-center justify-center overflow-hidden relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs">Loading preview...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                            <ImageOff className="h-6 w-6 opacity-50" />
                            <span className="text-xs">Preview unavailable</span>
                        </div>
                    ) : previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={fileName}
                            className="max-w-full h-auto rounded"
                            style={{ maxHeight: '400px' }}
                        />
                    ) : null}
                </div>
            )}
        </div>
    );
}
