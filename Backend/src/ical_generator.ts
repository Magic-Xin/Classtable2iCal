import * as tools from "./tools_function"

interface class_info {
    ClassName: string;
    StartWeek: number;
    EndWeek: number;
    WeekStatus: number;
    Weekday: number;
    ClassStartTimeId: number;
    ClassEndTimeId: number;
    Classroom: string;
    Teacher: string;
    ClassSerial: string;
}

interface time_table {
    name: string;
    startTime: number;
    endTime: number;
}

const weekdays: string[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export default async function (reqJson: any): Promise<string> {
    let iCalData: string = "";

    const first_week: string = reqJson["first_week"];
    const dul_week: number = reqJson["dul_week"];
    const inform_time: string = await inform_Time(reqJson["inform_time"]);
    const class_info: class_info[] = reqJson["class_info"];
    const utc_now: string = await tools.utc2String(new Date(Date.now()));

    if (reqJson["enable_dultimetable"]) {
        const dulStart: number = await first_Timetable(reqJson["first_week"]);
        let time_table_first: time_table[], time_table_second: time_table[];
        if (dulStart) {
            time_table_first = reqJson["dul_time_table"].summer;
            time_table_second = reqJson["dul_time_table"].winter;
        } else {
            time_table_first = reqJson["dul_time_table"].winter;
            time_table_second = reqJson["dul_time_table"].summer;
        }

        iCalData = await dul_Timetable(iCalData, first_week, dulStart, dul_week, inform_time, class_info,
            time_table_first, time_table_second, utc_now);
    }

    return iCalData;
}

async function first_Timetable(first_week: string): Promise<number> {
    const first_month: number = new Date(Date.parse(first_week)).getMonth() + 1;
    return (first_month >= 5 && first_month < 10) ? 1 : 0;
}

async function inform_Time(inform_time: number): Promise<string> {
    if (inform_time <= 60) {
        return "-P0DT0H" + inform_time + "M0S";
    } else if (inform_time > 60 && inform_time <= 1440) {
        const minutes: number = inform_time % 60;
        const hours: number = inform_time / 60;
        return "P0DT" + hours + "H" + minutes + "M0S";
    } else {
        const minutes: number = inform_time % 60;
        const hours: number = inform_time / 60;
        const days: number = inform_time / 1440;
        return "-P" + days + "DT" + hours + "H" + minutes + "M0S";
    }
}

async function dul_Timetable(iCalData: string, first_week: string, dulStart: number, dul_week: number,
                             inform_time: string, class_info: class_info[], time_table_first: time_table[],
                             time_table_second: time_table[], utc_now: string): Promise<string> {
    let extra_status: string = "1";
    const initial_time: Date = new Date(Date.parse(first_week));

    for (let i: number = 0; i < class_info.length; i++) {
        const obj: class_info = class_info[i];

        // first_time_table
        let delta_time: number = 7 * (obj.StartWeek - 1) + obj.Weekday - 1;
        if (obj.WeekStatus === 1) {
            if (obj.WeekStatus % 2 === 0) {
                delta_time += 7;
            }
        } else if (obj.WeekStatus === 2) {
            if (obj.WeekStatus % 2 != 0) {
                delta_time += 7;
            }
        }
        delta_time *= 24 * 60 * 60 * 1000;
        const first_time_obj: Date = new Date(initial_time.getTime() + delta_time);
        if (obj.WeekStatus != 0) {
            extra_status = "2;BYDAY=" + weekdays[obj.Weekday - 1];
        }

        const final_stime_str = await tools.date2String(first_time_obj) + "T" +
            String(time_table_first[obj.ClassStartTimeId].startTime);
        const final_etime_str = await tools.date2String(first_time_obj) + "T" +
            String(time_table_first[obj.ClassEndTimeId].endTime);
        let delta_week: number = 7 * (dul_week - obj.StartWeek - 1);
        if ((obj.WeekStatus === 1 && dul_week % 2 === 1) || (obj.WeekStatus === 2 && dul_week % 2 === 0)) {
            delta_week -= 7;
        }
        delta_week++;
        delta_week *= 24 * 60 * 60 * 1000;
        const stop_time_obj: Date = new Date(first_time_obj.getTime() + delta_week);
        const stop_time_str: string = await tools.utc2String(stop_time_obj);

        // second_time_table
        let _delta_time: number = 7 * (dul_week - 1) + obj.Weekday - 1;
        if (obj.WeekStatus === 1) {
            if (obj.WeekStatus % 2 === 0) {
                _delta_time += 7;
            }
        } else if (obj.WeekStatus === 2) {
            if (obj.WeekStatus % 2 != 0) {
                _delta_time += 7;
            }
        }
        _delta_time *= 24 * 60 * 60 * 1000;
        const _first_time_obj: Date = new Date(initial_time.getTime() + _delta_time);

        const _final_stime_str = await tools.date2String(first_time_obj) + "T" +
            String(time_table_second[obj.ClassStartTimeId].startTime);
        const _final_etime_str = await tools.date2String(first_time_obj) + "T" +
            String(time_table_second[obj.ClassEndTimeId].endTime);
        let _delta_week: number = 7 * (obj.EndWeek - dul_week);
        if ((obj.WeekStatus === 1 && dul_week % 2 === 1) || (obj.WeekStatus === 2 && dul_week % 2 === 0)) {
            _delta_week -= 7;
        }
        _delta_week++;
        _delta_week *= 24 * 60 * 60 * 1000;
        const _stop_time_obj: Date = new Date(_first_time_obj.getTime() + _delta_week);
        const _stop_time_str: string = await tools.utc2String(_stop_time_obj);

        // Generate Teacher & ClassSerial
        let teacher: string, serial: string;
        if (obj.Teacher != undefined) {
            teacher = "教师：" + obj.Teacher + "\t";
        } else {
            teacher = "";
        }
        if (obj.ClassSerial != undefined) {
            serial = "课程序号：" + obj.ClassSerial;
        } else {
            serial = "";
        }

        // Generate Alarm trigger
        let alarm_base: string;
        if (inform_time) {
            alarm_base = "BEGIN:VALARM\nACTION:DISPLAY\nDESCRIPTION:This is an event reminder\n" +
                "TRIGGER:" + inform_time + "\nX-WR-ALARMUID:" + await tools.uuidv4() + "\nUID:" + await tools.uuidv4() + "\nEND:VALARM\n";
        } else {
            alarm_base = "";
        }

        const ical_base: string = "BEGIN:VEVENT\n" +
            "CREATED:" + utc_now + "\nDTSTAMP:" + utc_now + "\nSUMMARY:" + obj.ClassName + "\n" +
            "DESCRIPTION:" + teacher + serial + "\nLOCATION:" + obj.Classroom + "\n" +
            "TZID:Asia/Shanghai\nSEQUENCE:0\nUID:" + await tools.uuidv4() + "\nRRULE:FREQ=WEEKLY;UNTIL=" + stop_time_str +
            ";INTERVAL=" + extra_status + "\nDTSTART;TZID=Asia/Shanghai:" + final_stime_str +
            "\nDTEND;TZID=Asia/Shanghai:" + final_etime_str + "\nX-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC\n" + alarm_base +
            "END:VEVENT\n"
        const _ical_base: string = "BEGIN:VEVENT\n" +
            "CREATED:" + utc_now + "\nDTSTAMP:" + utc_now + "\nSUMMARY:" + obj.ClassName + "\n" +
            "DESCRIPTION:" + teacher + serial + "\nLOCATION:" + obj.Classroom + "\n" +
            "TZID:Asia/Shanghai\nSEQUENCE:0\nUID:" + await tools.uuidv4() + "\nRRULE:FREQ=WEEKLY;UNTIL=" + _stop_time_str +
            ";INTERVAL=" + extra_status + "\nDTSTART;TZID=Asia/Shanghai:" + _final_stime_str +
            "\nDTEND;TZID=Asia/Shanghai:" + _final_etime_str + "\nX-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC\n" + alarm_base +
            "END:VEVENT\n"

        iCalData += ical_base + _ical_base;
    }
    return iCalData;
}