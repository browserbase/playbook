from playwright.sync_api import sync_playwright, Playwright
import os
import time
import requests
from dotenv import load_dotenv
load_dotenv()

def create_session():
    url = "https://www.browserbase.com/v1/sessions"

    payload = {
        "projectId": os.environ["BROWSERBASE_PROJECT_ID"],
        "keepAlive": False,
        "proxies": True,
    }
    headers = {
        "X-BB-API-Key": os.environ["BROWSERBASE_API_KEY"],
        "Content-Type": "application/json"
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    return response.json()

def create_debug_url(session_id):
    url = f"https://www.browserbase.com/v1/sessions/{session_id}/debug"

    headers = {"X-BB-API-Key": os.environ["BROWSERBASE_API_KEY"]}

    response = requests.request("GET", url, headers=headers)
    debug_url = response.json()['debuggerFullscreenUrl']

    print(debug_url)

def main():
    # Create session
    session = create_session()
    session_id = session["id"]
    print(f"Session ID: {session_id}")

    create_debug_url(session_id)

    # Use Playwright to interact with the session
    with sync_playwright() as playwright:
        browser = playwright.chromium.connect_over_cdp(
            f'wss://connect.browserbase.com?apiKey={os.environ["BROWSERBASE_API_KEY"]}&sessionId={session_id}'
        )

        # Get the first page or create a new one
        context = browser.contexts[0]
        page = context.pages[0] if context.pages else context.new_page()

        # Navigate to the website
        page.goto("https://www.aeromexico.com/en-us")

        # Handle cookies modal
        page.wait_for_selector('.CookiesModal--btn.Btn.Btn--filledRed', state='visible', timeout=60000)
        page.locator('button', has_text='Accept').click()
        page.wait_for_selector('.Modal.Modal--HOME_COOKIES', state='hidden')

        # Fill out origin and destination fields
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
        page.get_by_role("button", name="1", exact=True).nth(1).click()  # 1st of next month
        page.get_by_role("button", name="8", exact=True).nth(1).click()  # 8th of next month

        # Search for flights
        page.get_by_label("Find flight").click()

        # Wait for the page to be idle
        page.wait_for_load_state("networkidle", timeout=60000)

        # Log the page content
        print(page.content())

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")