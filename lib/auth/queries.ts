// lib/auth/queries.ts

export type WpUser = {
  id: string;
  databaseId: number;
  name: string | null;
  email: string | null;
  username: string | null;
};

export type LoginPayload = {
  authToken: string | null;
  refreshToken: string | null;
  sessionToken: string | null;
  user: WpUser | null;
};

export type LoginResponse = { login: LoginPayload | null };
export type RefreshResponse = {
  refreshJwtAuthToken: { authToken: string | null } | null;
};
export type ViewerResponse = { viewer: WpUser | null };

export const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      sessionToken
      user {
        id
        databaseId
        name
        email
        username
      }
    }
  }
`;

export const REFRESH_MUTATION = /* GraphQL */ `
  mutation RefreshAuthToken($refreshToken: String!) {
    refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
      authToken
    }
  }
`;

export const VIEWER_QUERY = /* GraphQL */ `
  query Viewer {
    viewer {
      id
      databaseId
      name
      email
      username
    }
  }
`;
