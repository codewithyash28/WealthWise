// Stytch Client Authentication Configuration
export const STYTCH_CONFIG = {
  projectId: "project-test-eda16afd-8df2-46a3-865c-fef3b1173a9e",
  publicToken: "public-token-test-a814ff57-b46f-4c81-951a-08f08363aa86",
  secret: "secret-test-hIMuUz8-ElpCG90hGLGu_3ULxjyN0ZBSZZo="
};

export interface StytchUser {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  authMethod: "otp" | "passwordless" | "oauth" | "passkey" | "guest";
  createdAt: string;
}
