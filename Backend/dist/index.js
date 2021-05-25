'use strict';

async function date2String(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return yyyy + mm + dd;
}
async function utc2String(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    const HH = String(date.getHours());
    const MM = String(date.getMinutes());
    const SS = String(date.getSeconds());
    return yyyy + mm + dd + "T" + HH + MM + SS + "Z";
}
async function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function week_generator (total_weeks, first_week) {
    let iCalData = "";
    const first_week_obj = new Date(Date.parse(first_week));
    const delta_7 = 7 * 24 * 60 * 60 * 1000;
    const utc_now = await utc2String(new Date(Date.now()));
    for (let i = 0; i < total_weeks; i++) {
        const curr_week = i + 1;
        const curr_week_obj = new Date(first_week_obj.getTime() + i * delta_7);
        const end_date_obj = new Date(curr_week_obj.getTime() + delta_7);
        const begin_date = await date2String(curr_week_obj);
        const end_date = await date2String(end_date_obj);
        const ical_base = "BEGIN:VEVENT\n" +
            "CREATED:" + utc_now + "\n" +
            "DTSTAMP:" + utc_now + "\n" +
            "TZID:Asia/Shanghai\n" +
            "SEQUENCE:0\n" +
            "SUMMARY:第" + curr_week + "周\n" +
            "DTSTART;VALUE=DATE:" + begin_date + "\n" +
            "DTEND;VALUE=DATE:" + end_date + "\n" +
            "UID:" + await uuidv4() + "\n" +
            "END:VEVENT\n";
        iCalData += ical_base;
    }
    return iCalData;
}

const weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
async function ical_generator (reqJson) {
    let iCalData = "";
    const first_week = reqJson["first_week"];
    const dul_week = reqJson["dul_week"];
    const inform_time = await inform_Time(reqJson["inform_time"]);
    const class_info = reqJson["class_info"];
    const utc_now = await utc2String(new Date(Date.now()));
    if (reqJson["enable_dultimetable"]) {
        const dulStart = await first_Timetable(reqJson["first_week"]);
        let time_table_first, time_table_second;
        if (dulStart) {
            time_table_first = reqJson["dul_time_table"].summer;
            time_table_second = reqJson["dul_time_table"].winter;
        }
        else {
            time_table_first = reqJson["dul_time_table"].winter;
            time_table_second = reqJson["dul_time_table"].summer;
        }
        iCalData = await dul_Timetable(iCalData, first_week, dulStart, dul_week, inform_time, class_info, time_table_first, time_table_second, utc_now);
    }
    return iCalData;
}
async function first_Timetable(first_week) {
    const first_month = new Date(Date.parse(first_week)).getMonth() + 1;
    return (first_month >= 5 && first_month < 10) ? 1 : 0;
}
async function inform_Time(inform_time) {
    if (inform_time <= 60) {
        return "-P0DT0H" + inform_time + "M0S";
    }
    else if (inform_time > 60 && inform_time <= 1440) {
        const minutes = inform_time % 60;
        const hours = inform_time / 60;
        return "P0DT" + hours + "H" + minutes + "M0S";
    }
    else {
        const minutes = inform_time % 60;
        const hours = inform_time / 60;
        const days = inform_time / 1440;
        return "-P" + days + "DT" + hours + "H" + minutes + "M0S";
    }
}
async function dul_Timetable(iCalData, first_week, dulStart, dul_week, inform_time, class_info, time_table_first, time_table_second, utc_now) {
    let extra_status = "1";
    const initial_time = new Date(Date.parse(first_week));
    for (let i = 0; i < class_info.length; i++) {
        const obj = class_info[i];
        // first_time_table
        let delta_time = 7 * (obj.StartWeek - 1) + obj.Weekday - 1;
        if (obj.WeekStatus === 1) {
            if (obj.WeekStatus % 2 === 0) {
                delta_time += 7;
            }
        }
        else if (obj.WeekStatus === 2) {
            if (obj.WeekStatus % 2 != 0) {
                delta_time += 7;
            }
        }
        delta_time *= 24 * 60 * 60 * 1000;
        const first_time_obj = new Date(initial_time.getTime() + delta_time);
        if (obj.WeekStatus != 0) {
            extra_status = "2;BYDAY=" + weekdays[obj.Weekday - 1];
        }
        const final_stime_str = await date2String(first_time_obj) + "T" +
            String(time_table_first[obj.ClassStartTimeId].startTime);
        const final_etime_str = await date2String(first_time_obj) + "T" +
            String(time_table_first[obj.ClassEndTimeId].endTime);
        let delta_week = 7 * (dul_week - obj.StartWeek - 1);
        if ((obj.WeekStatus === 1 && dul_week % 2 === 1) || (obj.WeekStatus === 2 && dul_week % 2 === 0)) {
            delta_week -= 7;
        }
        delta_week++;
        delta_week *= 24 * 60 * 60 * 1000;
        const stop_time_obj = new Date(first_time_obj.getTime() + delta_week);
        const stop_time_str = await utc2String(stop_time_obj);
        // second_time_table
        let _delta_time = 7 * (dul_week - 1) + obj.Weekday - 1;
        if (obj.WeekStatus === 1) {
            if (obj.WeekStatus % 2 === 0) {
                _delta_time += 7;
            }
        }
        else if (obj.WeekStatus === 2) {
            if (obj.WeekStatus % 2 != 0) {
                _delta_time += 7;
            }
        }
        _delta_time *= 24 * 60 * 60 * 1000;
        const _first_time_obj = new Date(initial_time.getTime() + _delta_time);
        const _final_stime_str = await date2String(first_time_obj) + "T" +
            String(time_table_second[obj.ClassStartTimeId].startTime);
        const _final_etime_str = await date2String(first_time_obj) + "T" +
            String(time_table_second[obj.ClassEndTimeId].endTime);
        let _delta_week = 7 * (obj.EndWeek - dul_week);
        if ((obj.WeekStatus === 1 && dul_week % 2 === 1) || (obj.WeekStatus === 2 && dul_week % 2 === 0)) {
            _delta_week -= 7;
        }
        _delta_week++;
        _delta_week *= 24 * 60 * 60 * 1000;
        const _stop_time_obj = new Date(_first_time_obj.getTime() + _delta_week);
        const _stop_time_str = await utc2String(_stop_time_obj);
        // Generate Teacher & ClassSerial
        let teacher, serial;
        if (obj.Teacher != undefined) {
            teacher = "教师：" + obj.Teacher + "\t";
        }
        else {
            teacher = "";
        }
        if (obj.ClassSerial != undefined) {
            serial = "课程序号：" + obj.ClassSerial;
        }
        else {
            serial = "";
        }
        // Generate Alarm trigger
        let alarm_base;
        if (inform_time) {
            alarm_base = "BEGIN:VALARM\nACTION:DISPLAY\nDESCRIPTION:This is an event reminder\n" +
                "TRIGGER:" + inform_time + "\nX-WR-ALARMUID:" + await uuidv4() + "\nUID:" + await uuidv4() + "\nEND:VALARM\n";
        }
        else {
            alarm_base = "";
        }
        const ical_base = "BEGIN:VEVENT\n" +
            "CREATED:" + utc_now + "\nDTSTAMP:" + utc_now + "\nSUMMARY:" + obj.ClassName + "\n" +
            "DESCRIPTION:" + teacher + serial + "\nLOCATION:" + obj.Classroom + "\n" +
            "TZID:Asia/Shanghai\nSEQUENCE:0\nUID:" + await uuidv4() + "\nRRULE:FREQ=WEEKLY;UNTIL=" + stop_time_str +
            ";INTERVAL=" + extra_status + "\nDTSTART;TZID=Asia/Shanghai:" + final_stime_str +
            "\nDTEND;TZID=Asia/Shanghai:" + final_etime_str + "\nX-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC\n" + alarm_base +
            "END:VEVENT\n";
        const _ical_base = "BEGIN:VEVENT\n" +
            "CREATED:" + utc_now + "\nDTSTAMP:" + utc_now + "\nSUMMARY:" + obj.ClassName + "\n" +
            "DESCRIPTION:" + teacher + serial + "\nLOCATION:" + obj.Classroom + "\n" +
            "TZID:Asia/Shanghai\nSEQUENCE:0\nUID:" + await uuidv4() + "\nRRULE:FREQ=WEEKLY;UNTIL=" + _stop_time_str +
            ";INTERVAL=" + extra_status + "\nDTSTART;TZID=Asia/Shanghai:" + _final_stime_str +
            "\nDTEND;TZID=Asia/Shanghai:" + _final_etime_str + "\nX-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC\n" + alarm_base +
            "END:VEVENT\n";
        iCalData += ical_base + _ical_base;
    }
    return iCalData;
}

async function genHeaderData() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = String(today.getFullYear());
    const date = mm + '/' + dd + '/' + yyyy;
    const CColor = "#ff9500";
    return 'BEGIN:VCALENDAR\n' +
        'VERSION:2.0\n' +
        'X-WR-CALNAME:' + date + '\n' +
        'X-APPLE-CALENDAR-COLOR:' + CColor + '\n' +
        'X-WR-TIMEZONE:Asia/Shanghai\n' +
        'BEGIN:VTIMEZONE\n' +
        'TZID:Asia/Shanghai\n' +
        'X-LIC-LOCATION:Asia/Shanghai\n' +
        'BEGIN:STANDARD\n' +
        'TZOFFSETFROM:+0800\n' +
        'TZOFFSETTO:+0800\n' +
        'TZNAME:CST\n' +
        'DTSTART:19700101T000000\n' +
        'END:STANDARD\n' +
        'END:VTIMEZONE\n';
}
async function genEndData() {
    return "END:VCALENDAR";
}
async function checkMode(MODE) {
    return MODE === "week_generator" || MODE === "ical_generator";
}
async function handleRequest(request) {
    if (request.method === "POST") {
        let reqJson = await request.json();
        if (!await checkMode(reqJson["mode"])) {
            return new Response(`{"status":500, "message": "ERROR: mode illegal."}`, {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST"
                }
            });
        }
        let Mode = reqJson["mode"];
        let iCalData = "";
        if (Mode === "week_generator") {
            iCalData += await week_generator(reqJson["total_weeks"], reqJson["first_week"]);
        }
        else if (Mode === 'ical_generator') {
            if (reqJson["enable_week_generator"]) {
                iCalData += await week_generator(reqJson["total_weeks"], reqJson["first_week"]);
            }
            iCalData += await ical_generator(reqJson);
        }
        return new Response(await genHeaderData() + iCalData + await genEndData(), {
            headers: {
                "cache-control": "no-store, no-cache, must-revalidate",
                "content-type": "text/calendar; charset=UTF-8",
                "content-disposition": "inline"
            }
        });
    }
    return new Response(``, {
        headers: {
            "content-type": "text/html;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST"
        }
    });
}
addEventListener("fetch", async (event) => {
    event.respondWith(handleRequest(event.request));
});
