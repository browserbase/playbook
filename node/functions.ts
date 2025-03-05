import { Browserbase } from "@browserbasehq/sdk";
import axios from "axios";

const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

// CREATE A SESSION
async function createSession() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    // Add configuration options here
  });
  return session;
}

// CREATE A STEALTHY SESSION
async function createStealthSession() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    proxies: true,
    browserSettings: {
      advancedStealth: false,  // Only available on the Scale Plan -- reach out to hello@browserbase.com to upgrade
      fingerprint: {
        browsers: ["chrome", "firefox", "edge", "safari"],
        devices: ["desktop", "mobile"],
        locales: ["en-US", "en-GB"],
        operatingSystems: ["android", "ios", "linux", "macos", "windows"],
        screen: {
          maxWidth: 1920,
          maxHeight: 1080,
          minWidth: 1024,
          minHeight: 768,
        }
      },
      viewport: {
        width: 1920,
        height: 1080,
      },
      solveCaptchas: true,
    }
  });
  return session;
}

async function createSessionWithCustomProxies() {
  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
  const session = await bb.sessions.create({ 
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    proxies: [
        {
        "type": "external",
        "server": "http://...",
        "username": "user",
        "password": "pass",
        }
    ]
  });
  return session;
}

async function createSessionWithGeoLocation() {
  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
  const session = await bb.sessions.create({ 
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    proxies: [
        {
        "type": "browserbase",
        "geolocation": {
            "city": "New York",
            "state": "NY",
            "country": "US"
            }
        }
    ],
  });
  return session;
}

async function createSessionWithProxyRouting() {
  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
  const session = await bb.sessions.create({ 
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    proxies: [
      // Use an external proxy for wikipedia.org
      {
        "type": "external",
        "server": "http://...",
        "username": "user",
        "password": "pass",
        "domainPattern": "wikipedia\.org"
      },
      // Use an external proxy for all other .gov domains
      {
          "type": "external",
          "server": "http://...",
          "username": "user",
          "password": "pass",
          "domainPattern": ".*\.gov"
      },
      // Use the Browserbase proxies for all other domains
      // Excluding this line will not use a proxy on any other domains
      {
        "type": "browserbase"
      }
    ]
  });
  return session;
}

// CREATE HIGH SECURITY SESSION - No session recording and no logs
async function createHighSecuritySession() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      recordSession: false,
      logSession: false,
    },
  });
  return session;
}

// CREATE SESSION WITH METADATA
async function createSessionWithMetadata() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    userMetadata: {
      "key": "value",
      "key2": {
        "keyA": "valueA",
        "keyB": "valueB"
      }
    },
  });
  return session;
}

// LIST SESSIONS WITH METADATA
async function listSessionsWithMetadata(query: string) {
  const sessions = await bb.sessions.list({
      q: query
  });
  return sessions;
}
// EXAMPLE: listSessionsWithMetadata("user_metadata['client']:'enterprise_customer_xyz'")

// CREATE A CUSTOM CAPTCHA SESSION
async function createCustomCaptchaSession(imageSelector: string, inputSelector: string) {
  // Create a new session
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      //@ts-ignore
        captchaImageSelector: imageSelector, // should look like this: "#c_turingtestpage_ctl00_maincontent_captcha1_CaptchaImage"
        captchaInputSelector: inputSelector // should look like this: "#ctl00_MainContent_txtTuringText"
      }
  });
  return session;
}

// CAPTCHA SOLVING OFF
async function createSessionWithoutCaptchaSolving() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      solveCaptchas: false,
    },
  });
  return session;
}

// CREATE A CONTEXT
async function createContext() {
    const projectId = process.env.BROWSERBASE_PROJECT_ID;
    const options = {
        method: 'POST',
        headers: {
        'X-BB-API-Key': `${process.env.BROWSERBASE_API_KEY}`,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId })
    };
    const response = await fetch(`https://api.browserbase.com/v1/contexts`, options);
    const json = await response.json();
    return json;
}

// USE A CONTEXT
async function useContext(contextId: string) {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      context: { 
        id: contextId, 
        persist: true 
        }
    }
  })
  return session;
}

// CREATE SESSION - ALL PARAMS
async function createSessionAllParams() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      // advancedStealth: true,
      // context: {
      //   id: "<contextId>",
      //   persist: true
      // },
      // extensionId: "<extensionId>",
      fingerprint: {
        browsers: ["chrome", "firefox", "edge", "safari"],
        devices: ["desktop", "mobile"],
        locales: ["en-US", "en-GB"],
        operatingSystems: ["android", "ios", "linux", "macos", "windows"],
        screen: {
          maxWidth: 1920,
          maxHeight: 1080,
          minWidth: 1024,
          minHeight: 768,
        }
      },
      viewport: {
        width: 1920,
        height: 1080,
      },
      blockAds: true,
      solveCaptchas: true,
      recordSession: true,
      logSession: true,
      // timeout: 10000,
      // region: "us-east-1",
    },
    keepAlive: true,
    proxies: true,
    userMetadata: {
      "key": "value"
    },
  });
  return session;
}

// GET LIVE DEBUG URL
async function getLiveDebugURL(sessionId: string) {
    const options = {
        method: 'GET',
        headers: {'X-BB-API-Key': `${process.env.BROWSERBASE_API_KEY}`}
        };
    const response = await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}/debug`, options);
    const json = await response.json();
    return json.debuggerUrl;
    };

// GET PROJECT LIST
async function getProjectList() {
  const options = {
    method: 'GET',
    headers: {'X-BB-API-Key': `${process.env.BROWSERBASE_API_KEY}`}
  };
  
  const response = await fetch(`https://api.browserbase.com/v1/projects`, options)
  const data = await response.json();

  return data;
}

// GET PROJECT USAGE
async function getProjectUsage() {
  const response = await axios.get(
    `https://api.browserbase.com/v1/projects/${process.env.BROWSERBASE_PROJECT_ID}/usage`, 
    {
      headers: { "X-BB-API-Key": process.env.BROWSERBASE_API_KEY },
    }
  );
  return response.data;
}

// GET SESSION DETAILS
async function getSessionDetails(sessionId: string) {
  const options = {
    method: 'GET',
    headers: {'X-BB-API-Key': `${process.env.BROWSERBASE_API_KEY}`}
  };
  
  const response = await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}`, options)
  const data = await response.json();

  return data;
}

// GET SESSION LOGS
async function getSessionLogs(sessionId: string) {
  const options = {
    method: 'GET',
    headers: {'X-BB-API-Key': `${process.env.BROWSERBASE_API_KEY}`}
  };
  
  const response = await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}/logs`, options)
  const data = await response.json();

  return data;
}

// GET SESSION RECORDING
async function getSessionRecording(sessionId: string) {
  const options = {
    method: 'GET',
    headers: {'X-BB-API-Key': `${process.env.BROWSERBASE_API_KEY}`}
  };
  
  const response = await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}/recording`, options)
  const data = await response.json();

  return data;
}

export { createSession, createStealthSession, createHighSecuritySession, createCustomCaptchaSession, createSessionWithoutCaptchaSolving, createSessionWithMetadata, createContext, useContext, createSessionAllParams, getLiveDebugURL, getProjectList, getProjectUsage, getSessionDetails, getSessionLogs, getSessionRecording, createSessionWithCustomProxies, createSessionWithGeoLocation, createSessionWithProxyRouting };