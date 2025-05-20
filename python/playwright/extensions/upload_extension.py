"""
This script zips up a Chrome browser extension, uploads it to Browserbase and
stores the extension ID in a text file for future use.

The extension files are compressed into an in-memory zip archive, then uploaded
to the extensions API endpoint.
The extension's new ID is printed out and also stored in a text file, which can
then be used to enable the extension on a per-session basis.
"""

import os
import zipfile
from io import BytesIO

import requests

API_KEY = os.environ["BROWSERBASE_API_KEY"]
EXTENSION_ID_FILE = "extension_id.txt"

# Location of the browser extension files. Must include a manifest.json
PATH_TO_FILES = "my_browser_extension"


def make_zip_buffer(path: str, save_local=False) -> BytesIO:
    """
    Create an in-memory zip file from the contents of the given folder.
    Mark save_local=True to save the zip file to a local file.
    """
    # Ensure we're looking at an extension
    assert "manifest.json" in os.listdir(
        path
    ), "No manifest.json found in the extension folder."

    # Create a BytesIO object to hold the zip file in memory
    memory_zip = BytesIO()

    # Create a ZipFile object
    with zipfile.ZipFile(memory_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        # Recursively walk through the directory
        for root, dirs, files in os.walk(path):
            for file in files:
                # Create the full file path
                file_path = os.path.join(root, file)
                # Calculate the archive name (path relative to the root directory)
                archive_name = os.path.relpath(file_path, path)
                # Add the file to the zip
                zf.write(file_path, archive_name)

    if save_local:
        with open(f"{path}.zip", "wb") as f:
            f.write(memory_zip.getvalue())

    return memory_zip


def upload_extension(data: bytes) -> str:
    """
    Upload an extension contained within the given data.

    :returns: ID of the new extension, to be used in a Browserbase session.
    """
    extensions_url = "https://www.browserbase.com/v1/extensions"
    headers = {"X-BB-API-Key": API_KEY}

    files = {"file": ("extension.zip", data)}

    response = requests.post(extensions_url, files=files, headers=headers)

    # Raise an exception if there wasn't a good response from the endpoint
    response.raise_for_status()

    result: dict[str, str] = response.json()
    # Show what we got
    print("--- Response data from API:")
    print(*[f"{key:<15} = {value}" for key, value in result.items()], sep="\n")
    print("---")

    return result["id"]


if __name__ == "__main__":
    buffer = make_zip_buffer(PATH_TO_FILES)
    extension_id = upload_extension(buffer.getvalue())
    print(f"{extension_id=}")

    with open(EXTENSION_ID_FILE, "w") as id_file:
        id_file.write(extension_id)
        print(f'Wrote the extension ID to "{EXTENSION_ID_FILE}"')
