import os
import requests
from dotenv import load_dotenv
load_dotenv()

def get_zipped_downloads(session_id: str) -> bytes:
    """
    Get a zipped archive of the files that were downloaded during the session.

    :returns: the zipped file data
    """
    session_url = (
        f"https://www.browserbase.com/v1/sessions/{session_id}/downloads"
    )
    headers = {"x-bb-api-key": os.environ["BROWSERBASE_API_KEY"]}
    response = requests.get(session_url, headers=headers)

    # Raise an exception if there wasn't a good response from the endpoint
    response.raise_for_status()

    return response.content

session_id = "<session_id>"
print(get_zipped_downloads(session_id))
