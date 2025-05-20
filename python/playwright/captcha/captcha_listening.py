import os

import requests
from playwright.sync_api import sync_playwright, ConsoleMessage, Page
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

API_KEY = os.environ["BROWSERBASE_API_KEY"]
PROJECT_ID = os.environ["BROWSERBASE_PROJECT_ID"]


def create_session() -> str:
    """
    Create a Browserbase session - a single browser instance.

    :returns: The new session's ID.
    """
    sessions_url = "https://api.browserbase.com/v1/sessions"
    headers = {
        "Content-Type": "application/json",
        "x-bb-api-key": API_KEY,
    }
    # Include your project ID in the JSON payload
    json = {
        "projectId": PROJECT_ID,
        "proxies": True,  # enable proxies
    }

    response = requests.post(sessions_url, json=json, headers=headers)

    # Raise an exception if there wasn't a good response from the endpoint
    response.raise_for_status()
    return response.json()["id"]


class SolveState:
    """
    A simple class to track the state of the CAPTCHA solution.
    """

    started = False
    finished = False

    # These messages are sent to the browser's console automatically
    # when a CAPTCHA is detected and solved.
    START_MSG = "browserbase-solving-started"
    END_MSG = "browserbase-solving-finished"

    def handle_console(self, msg: ConsoleMessage) -> None:
        """
        Handle messages coming from the browser's console.
        """
        if msg.text == self.START_MSG:
            self.started = True
            print("AI has started solving the CAPTCHA...")
            return

        if msg.text == self.END_MSG:
            self.finished = True
            print("AI solved the CAPTCHA!")
            return


def run(browser_tab: Page):
    state = SolveState()
    browser_tab.on("console", state.handle_console)

    # Use Google's CAPTCHA demo.
    target_url = "https://www.google.com/recaptcha/api2/demo"

    print(f"Target URL: {target_url}")
    browser_tab.goto(target_url)

    try:
        # There's a chance that solving the CAPTCHA is so quick it misses the
        # end message. In this case, this function waits the 10 seconds and
        # the issue is reconciled with the "Solving mismatch" error below.
        with browser_tab.expect_console_message(
            lambda msg: msg.text == SolveState.END_MSG,
            timeout=10000,
        ):
            # Do nothing and wait for the event or timeout
            pass

    except PlaywrightTimeoutError:
        print("Timeout: No CAPTCHA solving event detected after 10 seconds")
        print(f"Solve state: {state.started=} {state.finished=}")
        # This should only be treated as an error if `state.started` is True,
        # otherwise it just means no CAPTCHA was given.

    # If we didn't see both a start and finish message, raise an error.
    if state.started != state.finished:
        raise Exception(
            f"Solving mismatch! {state.started=} {state.finished=}"
        )

    if state.started == state.finished == False:
        print("No CAPTCHA was presented, or was solved too quick to see.")
    else:
        print("CAPTCHA is complete.")

    # Wait for some page content to load.
    # Anything in `body` should be visible
    print("Waiting for the page to load...")
    browser_tab.locator("body").wait_for(state="visible")

    print(f"{browser_tab.url=}")
    print(f"{browser_tab.title()=}")


with sync_playwright() as playwright:
    session_id = create_session()
    browser = playwright.chromium.connect_over_cdp(
        f"wss://connect.browserbase.com?apiKey={API_KEY}&sessionId={session_id}"
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