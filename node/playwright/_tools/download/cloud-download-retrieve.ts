/**
 * Run using npx tsx downloads/cloud-download-retrieve.ts
**/

import dotenv from "dotenv";
import { writeFileSync } from "fs";
import JSZip from "jszip";
dotenv.config();

const BROWSERBASE_SESSION_ID = "<session-id>";
const BROWSERBASE_API_KEY = process.env["BROWSERBASE_API_KEY"]!;

const options = {
    method: 'GET',
    headers: {'X-BB-API-Key': BROWSERBASE_API_KEY}
  };
  
  const response = await fetch(`https://api.browserbase.com/v1/sessions/${BROWSERBASE_SESSION_ID}/downloads`, options)
//   const data = await response.json();

console.log(response);


// The response is a ZIP file containing the downloaded files
const zipBuffer = await response.arrayBuffer();

// Extract the file from the ZIP
const zip = new JSZip();
const contents = await zip.loadAsync(zipBuffer);

// Add debugging
console.log("ZIP contents:", Object.keys(contents.files));

if (Object.keys(contents.files).length === 0) {
  console.log("No files found in the ZIP archive");
  console.log("ZIP buffer size:", zipBuffer.byteLength, "bytes");
}

// Get the first file in the ZIP (assuming there's only one)
const [filename, file] = Object.entries(contents.files)[0] as [string, JSZip.JSZipObject];
const fileData = await file.async('nodebuffer');

// Download the file to the user's downloads folder
const downloadsPath = `./downloads/files/${filename}`;

// Save the file
writeFileSync(downloadsPath, fileData);
console.log(`File saved to: ${downloadsPath}`);