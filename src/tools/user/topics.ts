/**
 * User Topics - LLM guidance for user-related features
 */

import { APP_ORIGIN } from "../../core/config.js";

export const USER_TOPICS = {
  // Token verification guide
  verify_token: `S4E.io API Token Verification

Use the "verify_token" command to check if your API token is valid.

Successful Response:
- User email
- Account details
- Permission level

Failed Response:
- Invalid token message
- Possible reasons:
  1. Token was copied incorrectly
  2. Token was deleted or revoked
  3. Token has expired

Where to Get Your Token:
1. Go to ${APP_ORIGIN}

2. Click on the profile icon in the top right corner
3. Go to Settings > Profile
4. Copy from the API Token section`,

  // User info guide
  user_info: `S4E.io User Information

Use the "get_user_info" command to view your account details.

Returned Information:
- email: Your registered email address
- name/surname: Your name
- position: Your job title
- industry: Your industry
- privileges: Permission level (admin, user, etc.)
- two_factor_auth: 2FA status
- scheme: Theme preference (light/dark)

To change this information:
${APP_ORIGIN} > Settings > Profile`,

  // API Token management
  api_token: `S4E.io API Token Management

Creating a Token:
1. Go to ${APP_ORIGIN} > Settings > Profile
2. Navigate to the API Token section
3. Copy the existing token or generate a new one

Security Recommendations:
- Do not share your token with anyone
- Do not hard-code the token in source code
- Rotate your token regularly
- Change it immediately if you suspect suspicious activity

Token Usage:
In your Claude Desktop config file:
{
  "env": {
    "S4E_API_TOKEN": "your-token-here"
  }
}`,
} as const;

export type UserTopicKey = keyof typeof USER_TOPICS;
