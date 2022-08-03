
const dayInMillis = 1000 * 60 * 60 * 24;
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

class DateUtils {
    static getCurrentDay() {
        

        const millis = Date.now();

        const day = (millis - millis % dayInMillis) / dayInMillis;

        return day;
    }

    static dayToHex(day: number) {
        return day.toString(16).toUpperCase()
    }

    static datePart(d: Date) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    static today() {
        return DateUtils.datePart(new Date());
    }

    static daysInTheFuture(days: number) {
        return new Date(DateUtils.today().getTime() + days * dayInMillis);
    }

    static yesterday() {
        return DateUtils.daysInTheFuture(-1);
    }

    static format(timestamp: number) {
        const now = new Date();
        const d = new Date(timestamp);
        if (DateUtils.sameDay(d, DateUtils.today())) {
            return DateUtils.getHourAndMinutes(d);
        } else if (DateUtils.sameDay(d, DateUtils.yesterday())) {
            return 'yesterday';
        } else if ((now.getDate() - d.getDate()) / dayInMillis < 7) {
            return weekdays[d.getDay()];
        } else {
            return d.toLocaleDateString();
        }
    }

    static formatDay(timestamp: number) {
        const now = new Date();
        const d = new Date(timestamp);
        if (DateUtils.sameDay(d, DateUtils.today())) {
            return 'today';
        } else if (DateUtils.sameDay(d, DateUtils.yesterday())) {
            return 'yesterday';
        } else if ((now.getDate() - d.getDate()) / dayInMillis < 7) {
            return weekdays[d.getDay()];
        } else {
            return d.toLocaleDateString();
        }
    }

    static getHourAndMinutes(d: Date) {
        return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }

    static sameDay(d1: Date, d2: Date) {
        return DateUtils.datePart(d1).getTime() === DateUtils.datePart(d2).getTime();
    }
}

export { DateUtils };