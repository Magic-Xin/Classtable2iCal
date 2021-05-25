import week_generator from "./week_generator";
import ical_generator from "./ical_generator";

async function genHeaderData(): Promise<string> {
    const today: Date = new Date();
    const dd: string = String(today.getDate()).padStart(2, '0');
    const mm: string = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy: string = String(today.getFullYear());
    const date: string = yyyy + "-" + mm + "-" + dd;

    const CColor: string = "#ff9500";

    return 'BEGIN:VCALENDAR\n' +
        'VERSION:2.0\n' +
        'X-WR-CALNAME:' + date + ' 课程表\n' +
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

async function genEndData(): Promise<string> {
    return "END:VCALENDAR";
}

async function checkMode(MODE: string): Promise<boolean> {
    return MODE === "week_generator" || MODE === "ical_generator";
}

async function handleRequest(request: Request): Promise<Response> {
    if (request.method === "POST") {
        let reqJson: any = await request.json();
        if (!await checkMode(reqJson["mode"])) {
            return new Response(`{"status":500, "message": "ERROR: mode illegal."}`, {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST"
                }
            })
        }
        let Mode: string = reqJson["mode"];
        let iCalData: string = "";
        if (Mode === "week_generator") {
            iCalData += await week_generator(reqJson["total_weeks"], reqJson["first_week"]);
        } else if (Mode === 'ical_generator') {
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
        })
    }
    return new Response(``, {
        headers: {
            "content-type": "text/html;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST"
        }
    })
}

addEventListener("fetch", async (event) => {
    event.respondWith(handleRequest(event.request));
})