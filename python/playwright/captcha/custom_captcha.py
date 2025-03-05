from playwright.sync_api import Playwright, sync_playwright
from browserbase import Browserbase
import os

company = "alt platform";

bb = Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])

def run(playwright: Playwright) -> None:
    session = bb.sessions.create(
        project_id=os.environ["BROWSERBASE_PROJECT_ID"],
        browser_settings={
            "captchaImageSelector": "#c_turingtestpage_ctl00_maincontent_captcha1_CaptchaImage",
            "captchaInputSelector": "#ctl00_MainContent_txtTuringText"
        }
    )
    # Connect to the remote session
    browser = playwright.chromium.connect_over_cdp(session.connect_url)
    context = browser.contexts[0]
    page = context.pages[0]

    print(f"View session replay at https://browserbase.com/sessions/{session.id}")
    
    # Navigate to the website
    page.goto("https://nmlsconsumeraccess.org/")
    
    # Wait for page load
    page.wait_for_load_state("networkidle")
    print("Success!")
    
    # Search for company
    page.wait_for_selector('input[type="text"]')
    page.click('input[type="text"]')
    page.locator('input[type="text"]').first.fill(company)
    
    # Click search
    page.click('input[id="searchButton"]')
    
    # Click the terms and conditions checkbox
    page.click('#ctl00_MainContent_cbxAgreeToTerms')
    
    # Wait for captcha to be solved
    print("Captcha auto-solving...")
    page.wait_for_timeout(5000)
    
    # Click continue
    page.click('#ctl00_MainContent_btnContinue')
    page.wait_for_load_state("networkidle")
    
    print("Shutting down...")
    page.close()
    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
