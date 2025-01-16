import { format, differenceInYears, differenceInMonths } from 'date-fns';

/**
 * Formats the "Member Since" message based on the creation date.
 * @param {string | Date} createdAt - The creation date as a string or Date object.
 * @returns {string} - A human-readable message.
 */
export const formatMemberSince = (createdAt) => {
    if (!createdAt) return "Invalid date";

    const createdDate = new Date(createdAt);
    if (isNaN(createdDate)) return "Invalid date";

    const now = new Date();

    // Calculate differences
    const yearsDiff = differenceInYears(now, createdDate);
    const monthsDiff = differenceInMonths(now, createdDate);

    // Format output based on difference
    if (yearsDiff > 0) {
        return `joined ${yearsDiff} year${yearsDiff > 1 ? 's' : ''} ago`;
    } else if (monthsDiff > 0) {
        return `joined ${monthsDiff} month${monthsDiff > 1 ? 's' : ''} ago`;
    } else {
        return `joined ${format(createdDate, "MMMM yyyy")}`; // e.g., "Member since January 2023"
    }
};

/**
 * Formats the time difference between now and the provided date.
 * @param {string | Date} createdAt - The date to calculate time from as a string or Date object.
 * @returns {string} - A human-readable time difference message.
 */
export const formatTime = (createdAt) => {
    if (!createdAt) return "Invalid date";

    const postDate = new Date(createdAt);
    if (isNaN(postDate)) return "Invalid date";

    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    // Time units in seconds
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;

    if (diffInSeconds < minute) {
        return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < hour) {
        const minutes = Math.floor(diffInSeconds / minute);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < day) {
        const hours = Math.floor(diffInSeconds / hour);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < month) {
        const days = Math.floor(diffInSeconds / day);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < year) {
        const months = Math.floor(diffInSeconds / month);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(diffInSeconds / year);
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
};
