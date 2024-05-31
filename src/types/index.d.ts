/// <reference types="./character" />

export type StringMap = Record<string, string>;

declare global {
  namespace Express {
    export interface User {
      id?: string;
      email?: string;
    }
  }
}

export * from './auth';
export * from './schemas';
