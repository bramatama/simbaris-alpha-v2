import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';

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
                    // Laravel default mengirimkan label HTML entities untuk panah
                    let label = link.label
                        .replace(/&laquo;/g, '«')
                        .replace(/&raquo;/g, '»')
                        .trim();

                    // Buat tombol Previous/Next sedikit lebih lebar
                    const isArrow = label.includes('«') || label.includes('»');

                    return (
                        <PaginationItem key={index}>
                            <PaginationLink
                                href={link.url || '#'}
                                isActive={link.active}
                                size={isArrow ? 'default' : 'icon'}
                                className={
                                    !link.url
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                            >
                                {label}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </ShadcnPagination>
    );
}
