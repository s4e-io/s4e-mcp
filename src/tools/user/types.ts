/**
 * User related types
 */

export interface S4EUserInfo {
  id: number;
  email: string;
  name?: string;
  surname?: string;
  position?: string;
  industry?: string;
  privileges: string[];
  two_factor_auth: boolean;
  extension_usage: boolean;
  scheme: string;
  layout: string;
  [key: string]: unknown;
}
