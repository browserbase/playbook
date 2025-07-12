from playwright.sync_api import Playwright, sync_playwright
from browserbase import Browserbase
import time
import os
from dotenv import load_dotenv

load_dotenv()

bb = Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])

def run(playwright: Playwright) -> None:
    session = bb.sessions.create(
        project_id=os.environ["BROWSERBASE_PROJECT_ID"],
        browser_settings={
            "extension_id": os.environ["EXTENSION_ID"]
        }
    )
    # Connect to the remote session
    browser = playwright.chromium.connect_over_cdp(session.connect_url)
    context = browser.contexts[0]
    page = context.pages[0]
    
    # Navigate to the website
    page.goto("chrome-extension://aeblfdkhhhdcdjpifhhbdiojplfjncoa/app/app.html#/page/welcome")
    
    # wait 60 seconds
    time.sleep(60)
    
    page.goto("https://browserbase.com/sign-in")
    time.sleep(10)

    
    print("Shutting down...")
    page.close()
    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
