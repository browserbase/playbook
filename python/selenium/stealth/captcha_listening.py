import os
import time

import requests
from selenium import webdriver
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.remote_connection import RemoteConnection

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


class BrowserbaseConnection(RemoteConnection):
    """
    Manage a single session with Browserbase.
    """

    _session_id: str

    def __init__(self, *args, **kwargs):
        self._session_id = create_session()
        super().__init__(*args, **kwargs)

    def get_remote_connection_headers(self, parsed_url, keep_alive=False):
        headers = super().get_remote_connection_headers(parsed_url, keep_alive)

        # Update headers to include the Browserbase required information
        headers["x-bb-api-key"] = API_KEY
        headers["session-id"] = self._session_id

        return headers


class SolveState:
    """
    A simple class to track the state of the CAPTCHA solution.
    """

    start_time = 0
    finish_time = 0

    # These messages are sent to the browser's console automatically
    # when a CAPTCHA is detected and solved.
    START_MSG = "browserbase-solving-started"
    END_MSG = "browserbase-solving-finished"

    def handle_console(self, msg: dict) -> None:
        """
        Handle messages coming from the browser's console.
        """
        # Only process INFO messages
        if msg["level"] != "INFO":
            return

        if self.START_MSG in msg["message"]:
            self.start_time = msg["timestamp"]
            print("AI has started solving the CAPTCHA...")
            return

        if self.END_MSG in msg["message"]:
            self.finish_time = msg["timestamp"]
            print("AI solved the CAPTCHA!")
            return


def run(driver: WebDriver):
    # Keep track of the CAPTCHA state
    state = SolveState()

    # Use Google's CAPTCHA demo.
    target_url = "https://www.google.com/recaptcha/api2/demo"

    # Instruct the browser to go to the target page
    driver.get(target_url)

    for _ in range(10):
        # Walk through all the browser logs and use them to update the state
        for entry in driver.get_log("browser"):
            state.handle_console(entry)

        # If the finish time has been recorded, we're done
        if state.finish_time > 0:
            break

        # Wait a bit and check the logs again.
        time.sleep(0.5)

    if state.start_time == state.finish_time == 0:
        print(f"No CAPTCHA was detected.")
    if state.start_time > 0:
        print(f"CAPTCHA was detected at {state.start_time}")
        if state.finish_time > 0:
            solution_time = state.finish_time - state.start_time
            print(f"CAPTCHA was solved in {solution_time / 1000} seconds")
        else:
            print("CAPTCHA was not solved. Try increasing the sleep time.")

    # Print out a bit of info about the page it landed on
    print(f"{driver.current_url=} | {driver.title=}")

    ...


# Use the custom class to create and connect to a new browser session
connection = BrowserbaseConnection("http://connect.browserbase.com/webdriver")
options = webdriver.ChromeOptions()
# Enable all browser console logs to catch the CAPTCHA solution messages
options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
driver = webdriver.Remote(connection, options=options)

# Print a bit of info about the browser we've connected to
print(
    "Connected to Browserbase",
    f"{driver.name} version {driver.caps['browserVersion']}",
)

try:
    # Perform our browser commands
    run(driver)

finally:
    # Make sure to quit the driver so your session ends!
    driver.quit()