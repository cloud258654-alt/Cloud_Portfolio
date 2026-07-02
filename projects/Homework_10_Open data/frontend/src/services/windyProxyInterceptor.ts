const WINDY_API_ORIGIN = 'https://api.windy.com'
const PROXY_PREFIX = '/windy-api'

function rewriteUrl(url: string): string {
    if (url.startsWith(WINDY_API_ORIGIN)) {
        return PROXY_PREFIX + url.slice(WINDY_API_ORIGIN.length)
    }
    return url
}

let installed = false

export function installWindyProxyInterceptor(): void {
    if (installed) return
    installed = true

    const originalFetch = window.fetch.bind(window)
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
        if (typeof input === 'string') {
            input = rewriteUrl(input)
        } else if (input instanceof Request) {
            const newUrl = rewriteUrl(input.url)
            if (newUrl !== input.url) {
                input = new Request(newUrl, input)
            }
        }
        return originalFetch(input, init)
    }

    const originalOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (
        method: string,
        url: string | URL,
        ...args: any[]
    ) {
        if (typeof url === 'string') {
            url = rewriteUrl(url)
        }
        return originalOpen.call(this, method, url, ...args as [boolean, string | null | undefined, string | null | undefined])
    }
}
