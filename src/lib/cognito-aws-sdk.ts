import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";
const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET || "";

const calculateSecretHash = (username: string): string => {
  if (!clientSecret) return "";

  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
};

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const signUp = async (data: SignUpData) => {
  const secretHash = calculateSecretHash(data.email);

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: data.email,
    Password: data.password,
    UserAttributes: [
      { Name: "email", Value: data.email },
      { Name: "given_name", Value: data.firstName },
      { Name: "family_name", Value: data.lastName },
      { Name: "name", Value: `${data.firstName} ${data.lastName}` },
      { Name: "profile", Value: "" },
      { Name: "picture", Value: "" },
      { Name: "gender", Value: "unspecified" },
      { Name: "birthdate", Value: "1970-01-01" },
      { Name: "address", Value: JSON.stringify({}) },
      ...(data.phone ? [{ Name: "phone_number", Value: data.phone }] : []),
    ],
    SecretHash: secretHash || undefined,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Sign up failed");
  }
};

export const signIn = async (data: SignInData) => {
  const secretHash = calculateSecretHash(data.email);

  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: data.email,
      PASSWORD: data.password,
      ...(secretHash && { SECRET_HASH: secretHash }),
    },
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Sign in failed");
  }
};

export const confirmSignUp = async (email: string, code: string) => {
  const secretHash = calculateSecretHash(email);

  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
    SecretHash: secretHash || undefined,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Confirmation failed");
  }
};

export const forgotPassword = async (email: string) => {
  const secretHash = calculateSecretHash(email);

  const command = new ForgotPasswordCommand({
    ClientId: clientId,
    Username: email,
    SecretHash: secretHash || undefined,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Password reset failed");
  }
};

export const confirmPassword = async (
  email: string,
  code: string,
  newPassword: string,
) => {
  const secretHash = calculateSecretHash(email);

  const command = new ConfirmForgotPasswordCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
    SecretHash: secretHash || undefined,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Password confirmation failed");
  }
};
