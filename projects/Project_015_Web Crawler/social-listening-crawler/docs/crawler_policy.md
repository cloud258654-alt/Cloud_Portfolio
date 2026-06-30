# Crawler Policy & Ethical Scraping Guidelines

This document outlines the policies and best practices for crawling third-party forums and search engines.

## 1. Crawl Intervals & Rate Limiting
To prevent overloading target servers (Denial of Service) and to prevent IP blocking:
- **PTT BBS**: Limit crawl requests to a maximum of 1 request per second (1s sleep interval).
- **Dcard**: Honor API limits. A random delay of 1-3 seconds between forum list fetches and individual post crawls is required.
- **Google Search**: Minimize automated search queries to avoid triggering Captchas. Crawl no more than once per hour per keyword.
- **TikTok/TikTok/小紅書**: Prioritize official APIs where possible. If scraping, apply random user-agent rotation and sleep intervals between 3 to 10 seconds.

## 2. Robots.txt Compliance
- Always query and parse `/robots.txt` of target domains before crawling.
- Exclude paths specifically marked as `Disallow`.
- Honor `Crawl-delay` parameters in robots.txt.

## 3. User-Agent Configurations
Use descriptive User-Agent headers to identify our bot, including a contact email so webmasters can reach out if needed:
`Mozilla/5.0 (compatible; TaiwanSocialListeningBot/1.0; +crawler-support@example.com)`

## 4. IP Rotation and Proxies
- When running large crawls, rotate through clean proxy pools to distribute load and mitigate single IP blockages.
- Do not bypass security challenges (like Cloudflare Turnstile or CAPTCHAs) in a malicious way. Respect platforms that heavily protect their infrastructure.

## 5. Offline Data Import (Alternative)
For platforms that strictly ban web crawlers (e.g. Facebook Groups, Google Maps reviews, TikTok/TikTok/小紅書 with high anti-scraping measures), use standard CSV export/importers to allow users to manually drag-and-drop platform exports into the system instead of violating terms of service.
