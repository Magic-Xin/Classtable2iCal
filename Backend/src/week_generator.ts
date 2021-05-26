import * as tools from "./tools_function"

export default async function (total_weeks: number, first_week: string): Promise<string> {
    let iCalData: string = "";
    const first_week_obj: Date = new Date(Date.parse(first_week));
    const delta_7: number = 7 * 24 * 60 * 60 * 1000;
    const utc_now: string = await tools.utc2String(new Date(Date.now()));

    for (let i: number = 0; i < total_weeks; i++) {
        const curr_week: number = i + 1;
        const curr_week_obj: Date = new Date(first_week_obj.getTime() + i * delta_7);
        const end_date_obj: Date = new Date(curr_week_obj.getTime() + delta_7)
        const begin_date: string = await tools.date2String(curr_week_obj);
        const end_date: string = await tools.date2String(end_date_obj);

        const ical_base =
            "\nBEGIN:VEVENT\n" +
            "CREATED:" + utc_now + "\n" +
            "DTSTAMP:" + utc_now + "\n" +
            "TZID:Asia/Shanghai\n" +
            "SEQUENCE:0\n" +
            "SUMMARY:第" + curr_week + "周\n" +
            "DTSTART;VALUE=DATE:" + begin_date + "\n" +
            "DTEND;VALUE=DATE:" + end_date + "\n" +
            "UID:" + await tools.uuidv4() + "\n" +
            "END:VEVENT\n";

        iCalData += ical_base;
    }

    return iCalData;
}