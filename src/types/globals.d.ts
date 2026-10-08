declare module "*.css" {
  const content: any;
  export default content;
}

declare module "lenis/dist/lenis.css" {
  const content: any;
  export default content;
}

interface Window {
  __lenis?: any;
}

// Extend Better Auth types to include custom role and fields
declare module "better-auth/react" {
  export function createAuthClient(options?: any): any;
  export function useStore(...args: any[]): any;
  export interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
}
