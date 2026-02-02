import { NextRequest, NextResponse } from "next/server";
import { handleDemoMode } from "@/lib/demo-mode";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled
  const demoResponse = handleDemoMode(request, "/api/auth/signin");
  if (demoResponse) {
    return demoResponse;
  }
  try {
    const { email, password } = await request.json();

    const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;

    if (!userPoolId || !clientId) {
      return NextResponse.json(
        { error: "Cognito configuration missing" },
        { status: 500 },
      );
    }

    // Calculate secret hash if client secret exists
    let secretHash = "";
    if (clientSecret) {
      const hmac = crypto.createHmac("sha256", clientSecret);
      hmac.update(email + clientId);
      secretHash = hmac.digest("base64");
    }

    // Call AWS Cognito API directly
    const cognitoUrl = `https://cognito-idp.${region}.amazonaws.com/`;

    const response = await fetch(cognitoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        Authorization: "AWS4-HMAC-SHA256 Credential=.../...", // This would need AWS SDK for proper signing
      },
      body: JSON.stringify({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          ...(secretHash && { SECRET_HASH: secretHash }),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Authentication failed" },
        { status: 401 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
