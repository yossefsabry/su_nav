import { ScheduleItem, DayOfWeek } from '@/types/schedule';

/**
 * Get the next N upcoming schedule items based on current date and time
 */
export function getUpcomingScheduleItems(allItems: ScheduleItem[], count: number = 4): ScheduleItem[] {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Map JavaScript's day (0=Sunday) to our DayOfWeek type
    const dayMap: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayMap[currentDay];

    // Create an array of all schedule items with calculated "distance" from now
    const itemsWithDistance = allItems.map(item => {
        // Get the day index for the item (0=Sunday, 1=Monday, etc.)
        const itemDayIndex = dayMap.indexOf(item.day);

        // Parse start time (format: "HH:MM" or "H:MM")
        const timeParts = item.startTime.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
        const itemTimeInMinutes = hours * 60 + minutes;

        // Calculate days until this item
        let daysUntil = itemDayIndex - currentDay;
        if (daysUntil < 0) {
            daysUntil += 7; // Next week
        } else if (daysUntil === 0 && itemTimeInMinutes <= currentTime) {
            daysUntil = 7; // This class is today but already passed, so next week
        }

        // Calculate total minutes until this item
        const totalMinutesUntil = daysUntil * 24 * 60 + (itemTimeInMinutes - currentTime);

        return {
            ...item,
            distance: totalMinutesUntil,
            daysUntil,
        };
    });

    // Sort by distance (nearest first) and take the first N items
    const upcoming = itemsWithDistance
        .filter(item => item.distance >= 0)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, count);

    return upcoming;
}

/**
 * Get a human-readable string for when an item is scheduled
 * e.g., "Today", "Tomorrow", "Monday"
 */
export function getScheduleDisplayTime(item: ScheduleItem): string {
    const now = new Date();
    const currentDay = now.getDay();
    const dayMap: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayMap[currentDay];

    const itemDayIndex = dayMap.indexOf(item.day);

    let daysUntil = itemDayIndex - currentDay;
    if (daysUntil < 0) {
        daysUntil += 7;
    }

    const timeParts = item.startTime.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const itemTimeInMinutes = hours * 60 + minutes;

    if (daysUntil === 0 && itemTimeInMinutes > currentTime) {
        return `Today`;
    } else if (daysUntil === 1) {
        return `Tomorrow`;
    } else {
        return item.day;
    }
}
