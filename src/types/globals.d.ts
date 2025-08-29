export {}

export type Roles = 'admin' | 'customer';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}