export const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
    return localISOTime;
};

export const formatDate = (start: string, end?: string): string => {
    if (!start) return '-';
    const startDate = new Date(start).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
    const endDate = end
        ? new Date(end).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
          })
        : null;

    return startDate === endDate || !endDate
        ? startDate
        : `${startDate} - ${endDate}`;
};

export const formatAuditTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date(dateString));
};
