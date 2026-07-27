export function timeAgo(dateString) {
    if (!dateString) return null;

    const then = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - then) / 1000);

    const intervals = [
        { label: 'year', secondsInUnit: 31536000 },
        { label: 'month', secondsInUnit: 2592000 },
        { label: 'week', secondsInUnit: 604800 },
        { label: 'day', secondsInUnit: 86400 },
        { label: 'hour', secondsInUnit: 3600 },
        { label: 'minute', secondsInUnit: 60 },
        { label: 'second', secondsInUnit: 1 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.secondsInUnit);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}