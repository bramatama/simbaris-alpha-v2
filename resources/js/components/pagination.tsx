import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links?: PaginationLinkType[];
    lastPage?: number;
}

export function Pagination({ links, lastPage }: PaginationProps) {
    // Sembunyikan pagination jika tidak ada data atau hanya ada 1 halaman
    if (!links || (lastPage && lastPage <= 1)) return null;

    return (
        <ShadcnPagination className="mt-6 mb-2">
            <PaginationContent className="flex-wrap justify-center gap-1 sm:gap-2">
                {links.map((link, index) => {
                    const isPrevious =
                        link.label.includes('&laquo;') ||
                        link.label.toLowerCase().includes('previous');
                    const isNext =
                        link.label.includes('&raquo;') ||
                        link.label.toLowerCase().includes('next');
                    const isArrow = isPrevious || isNext;

                    return (
                        <PaginationItem key={index}>
                            <PaginationLink
                                href={link.url || '#'}
                                isActive={link.active}
                                size={isArrow ? 'default' : 'icon'}
                                aria-label={
                                    isPrevious
                                        ? 'Halaman sebelumnya'
                                        : isNext
                                          ? 'Halaman berikutnya'
                                          : `Halaman ${link.label}`
                                }
                                className={
                                    !link.url
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                            >
                                {isPrevious ? (
                                    <span className="flex items-center gap-1 px-1">
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            Sebelumnya
                                        </span>
                                    </span>
                                ) : isNext ? (
                                    <span className="flex items-center gap-1 px-1">
                                        <span className="hidden sm:inline">
                                            Berikutnya
                                        </span>
                                        <ChevronRight className="h-4 w-4" />
                                    </span>
                                ) : (
                                    link.label
                                )}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </ShadcnPagination>
    );
}
