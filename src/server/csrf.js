/** Write requests must come from this app. SameSite=Lax is the other half of the guard. */
export function forbiddenOrigin(request) {
    const origin = request.headers.get("origin");
    if (!origin)
        return true;
    let sent;
    try {
        sent = new URL(origin);
    }
    catch {
        return true;
    }
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = (request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol).replace(/:$/, "");
    if (!host)
        return true;
    return sent.host !== host || sent.protocol.replace(/:$/, "") !== proto;
}
