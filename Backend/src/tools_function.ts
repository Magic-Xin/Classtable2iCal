async function date2String(date: Date): Promise<string> {
    const dd: string = String(date.getDate()).padStart(2, '0');
    const mm: string = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy: string = String(date.getFullYear());

    return yyyy + mm + dd;
}

async function utc2String(date: Date): Promise<string> {
    const dd: string = String(date.getDate()).padStart(2, '0');
    const mm: string = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy: string = String(date.getFullYear());
    const HH: string = String(date.getHours()).padStart(2, '0');
    const MM: string = String(date.getMinutes()).padStart(2, '0');
    const SS: string = String(date.getSeconds()).padStart(2, '0');

    return yyyy + mm + dd + "T" + HH + MM + SS + "Z";
}

async function uuidv4(): Promise<string> {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export {date2String, utc2String, uuidv4}