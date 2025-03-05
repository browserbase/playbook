import os
import requests
from playwright.sync_api import Playwright, sync_playwright
from browserbase import Browserbase

bb = Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])

def create_context():
    '''
    Creates a new context using the Browserbase SDK and returns the context ID.
    '''
    context = bb.contexts.create(project_id=os.environ["BROWSERBASE_PROJECT_ID"])
    print("Context ID:", context.id)
    return context.id

def create_session(context_id):
    '''
    Creates a new session using the Browserbase SDK and returns the session ID.
    '''
    session = bb.sessions.create(project_id=os.environ["BROWSERBASE_PROJECT_ID"],
                                browser_settings={
                                    "context": {
                                        "id": context_id,
                                        "persist": True
                                    }
                                },
                                keep_alive=True,
                                proxies=True)
    return session

def create_debug_url(session_id):
    '''
    Create a debug URL to view and interact with the session while it is running
    This URL is only available while the session is active
    '''
    url = f"https://www.browserbase.com/v1/sessions/{session_id}/debug"

    headers = {"X-BB-API-Key": os.environ["BROWSERBASE_API_KEY"]}

    response = requests.request("GET", url, headers=headers)
    debug_url = response.json()['debuggerFullscreenUrl']

    print(debug_url)

with sync_playwright() as playwright:
    # Create a context ID to use in the session
    context_id = create_context()

    # Connect to the session
    session = create_session(context_id)
    browser = playwright.chromium.connect_over_cdp(session.connect_url)

    # Create a debug URL to view and interact with the session while it is running
    session_id = session.id
    create_debug_url(session_id)

    # Get the context and page from the browser
    context = browser.contexts[0]
    page = context.pages[0]

    # Navigate to the Wikipedia page
    page.goto('https://en.wikipedia.org/w/index.php')

    # This is where you can interact with the page and do your manual login or add code to automate the login

    print("Session replay URL:", f"https://browserbase.com/sessions/{session_id}")