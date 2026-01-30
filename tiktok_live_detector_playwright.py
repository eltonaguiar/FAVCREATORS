
import asyncio
import json
import os
from playwright.async_api import async_playwright

def get_output_path(username):
    out_dir = r"C:\Users\zerou\Documents\FAVCREATORS"
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, f"tiktok_live_{username}_playwright.json")

async def is_tiktok_live_playwright(username):
    url = f"https://www.tiktok.com/@{username}/live"
    async with async_playwright() as p:
        # Use non-headless for more reliability
        browser = await p.chromium.launch(headless=False, args=["--start-maximized"])
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        # Set extra headers to mimic a real browser
        await page.set_extra_http_headers({
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": '"Chromium";v="120", "Not:A-Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
        })
        await page.goto(url, timeout=30000)
        # Wait for the main content to load
        await page.wait_for_selector('body', timeout=15000)
        is_live = False
        details = {}
        # Try to detect live badge, video, or "LIVE NOW" text
        try:
            # Wait for a live badge or video element (if present)
            badge = await page.query_selector('span[data-e2e="live-badge"]')
            if badge:
                badge_text = await badge.inner_text()
                if "LIVE" in badge_text.upper():
                    is_live = True
                    details['badge_text'] = badge_text
            # Check for video element (live stream)
            video = await page.query_selector('video')
            if video:
                is_live = True
                details['video_found'] = True
            # Check for "LIVE NOW" text in the DOM
            content = await page.content()
            if 'LIVE NOW' in content or 'isLive":true' in content:
                is_live = True
                details['live_now_text'] = True
        except Exception as e:
            details['exception'] = str(e)
        await browser.close()
        return is_live, details

def main():
    username = "starfireara"
    is_live = False
    details = {}
    try:
        is_live, details = asyncio.run(is_tiktok_live_playwright(username))
    except Exception as e:
        details['error'] = str(e)
    output = {
        "username": username,
        "is_live": is_live,
        "details": details
    }
    out_path = get_output_path(username)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"Result written to {out_path}")

if __name__ == "__main__":
    main()
