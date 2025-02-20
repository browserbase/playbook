import os
import time
from playwright.sync_api import sync_playwright
from browserbase import Browserbase
# import environment variables
from dotenv import load_dotenv
load_dotenv()

# Load environment variables
BROWSERBASE_API_KEY = os.getenv("BROWSERBASE_API_KEY")
BROWSERBASE_PROJECT_ID = os.getenv("BROWSERBASE_PROJECT_ID")

# Initialize Browserbase SDK
bb = Browserbase(api_key=BROWSERBASE_API_KEY)

print("Launching browser...")

def main():
    with sync_playwright() as p:
        # Create a new session
        session = bb.sessions.create(
            project_id=BROWSERBASE_PROJECT_ID,
            # keep_alive=True,
            proxies=True
        )
        
        # Connect to the session using CDP
        browser = p.chromium.connect_over_cdp(session.connect_url)
        
        # Get the default context and page
        context = browser.contexts[0]
        page = context.pages[0]

        print(f"View session replay at https://browserbase.com/sessions/{session.id}")
        
        # # Navigate to the website
        page.goto("https://www.aeromexico.com/en-us")
        
        # Handle cookies modal
        page.wait_for_selector('.CookiesModal--btn.Btn.Btn--filledRed', state='visible', timeout=60000)
        page.locator('button', has_text='Accept').click()
        page.wait_for_selector('.Modal.Modal--HOME_COOKIES', state='hidden')

        # Fill out the origin and destination fields
        page.get_by_placeholder("Type an origin").click()
        page.get_by_placeholder("Type an origin").fill("SFO")
        page.wait_for_selector(".NewBookerAirportAutocompleteList")
        page.locator(".NewBookerAirportAutocompleteList").first.click()

        page.get_by_placeholder("Please type a destination.").click()
        page.get_by_placeholder("Please type a destination.").fill("MEX")
        page.wait_for_selector(".NewBookerAirportAutocompleteList")
        page.locator(".NewBookerAirportAutocompleteList").first.click()

        # Select dates
        page.get_by_text("Departure — Return").click()
        page.get_by_role("button", name="1", exact=True).nth(1).click() # 1st of next month
        page.get_by_role("button", name="8", exact=True).nth(1).click() # 8th of next month

        # Search for flights
        page.get_by_label("Find flight").click()

        # wait for the page to be idle
        page.wait_for_load_state('networkidle', timeout=60000)

        # Log the page content
        print(page.content())

        # Close the page and browser
        page.close()
        browser.close()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")