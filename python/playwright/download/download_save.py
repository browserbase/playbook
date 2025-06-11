import os
import requests
from playwright.sync_api import sync_playwright, Page
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.environ["BROWSERBASE_API_KEY"]
PROJECT_ID = os.environ["BROWSERBASE_PROJECT_ID"]

def create_session() -> str:
    """
    Create a Browserbase session - a single browser instance.

    :returns: The new session's ID.
    """
    sessions_url = "https://www.browserbase.com/v1/sessions"
    headers = {"x-bb-api-key": API_KEY}
    # Include your project ID in the json payload
    json = {"projectId": PROJECT_ID}

    response = requests.post(sessions_url, json=json, headers=headers)

    # Raise an exception if there wasn't a good response from the endpoint
    response.raise_for_status()
    return response.json()["id"]


def get_zipped_downloads(session_id: str) -> bytes:
    """
    Get a zipped archive of the files that were downloaded during the session.

    :returns: the zipped file data
    """
    session_url = (
        f"https://www.browserbase.com/v1/sessions/{session_id}/downloads"
    )
    headers = {"x-bb-api-key": API_KEY}
    response = requests.get(session_url, headers=headers)

    # Raise an exception if there wasn't a good response from the endpoint
    response.raise_for_status()
    return response.content


def run(browser_tab: Page):
    # Head to the test downloads page
    browser_tab.goto(
        "https://browser-tests-alpha.vercel.app/api/download-test"
    )

    # Click the download button
    print("Downloading the MP3 file to the remote browser...")
    browser_tab.get_by_role("link", name="Download File").click()

    ...


session_id = create_session()
print(f"{session_id=}")

with sync_playwright() as playwright:
    # Use the session ID to connect to the browser
    browser = playwright.chromium.connect_over_cdp(
        f"wss://connect.browserbase.com?apiKey={API_KEY}&sessionId={session_id}"
    )

    # Required to avoid playwright overriding the location
    session = browser.new_browser_cdp_session()
    session.send(
        "Browser.setDownloadBehavior",
        {
            "behavior": "allow",
            "downloadPath": "downloads",
            "eventsEnabled": True,
        },
    )

    # Print a bit of info about the browser we've connected to
    print(
        "Connected to Browserbase.",
        f"{browser.browser_type.name} version {browser.version}",
    )

    context = browser.contexts[0]
    browser_tab = context.pages[0]

    try:
        # Perform our browser commands
        run(browser_tab)

    finally:
        # Clean up
        browser_tab.close()
        browser.close()

print(
    "Retrieving files that were downloaded to the remote browser during the session..."
)
zipped_downloads = get_zipped_downloads(session_id)
with open("downloads.zip", "wb") as file:
    file.write(zipped_downloads)

print("Downloaded files are in the downloads.zip file.")
