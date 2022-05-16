

class DateUtils {
    static getCurrentDay() {
        const dayInMillis = 1000 * 60 * 60 * 24;

        const millis = Date.now();

        const day = (millis - millis % dayInMillis) / dayInMillis;

        return day;
    }

    static dayToHex(day: number) {
        return day.toString(16).toUpperCase()
    }
}

export { DateUtils };