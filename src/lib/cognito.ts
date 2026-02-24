import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import crypto from "crypto";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";
const clientSecret = process.env.NEXT_PUBLIC_COGNITO_CLIENT_SECRET || "";

if (!userPoolId || !clientId) {
}

const calculateSecretHash = (username: string): string => {
  if (!clientSecret) return "";

  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
};

export const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: clientId,
});

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

export const signUp = (data: SignUpData): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: data.email,
      }),
      new CognitoUserAttribute({
        Name: "given_name",
        Value: data.firstName,
      }),
      new CognitoUserAttribute({
        Name: "family_name",
        Value: data.lastName,
      }),
      new CognitoUserAttribute({
        Name: "name",
        Value: `${data.firstName} ${data.lastName}`,
      }),
      new CognitoUserAttribute({
        Name: "profile",
        Value: "",
      }),
      new CognitoUserAttribute({
        Name: "picture",
        Value: "",
      }),
      new CognitoUserAttribute({
        Name: "gender",
        Value: "unspecified",
      }),
      new CognitoUserAttribute({
        Name: "birthdate",
        Value: "1970-01-01",
      }),
      new CognitoUserAttribute({
        Name: "address",
        Value: JSON.stringify({}),
      }),
    ];

    if (data.phone) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: "phone_number",
          Value: data.phone,
        }),
      );
    }

    const secretHash = calculateSecretHash(data.email);

    userPool.signUp(
      data.email,
      data.password,
      attributeList,
      clientSecret
        ? [new CognitoUserAttribute({ Name: "SECRET_HASH", Value: secretHash })]
        : [],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      },
    );
  });
};

export const signIn = (data: SignInData): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: data.email,
      Password: data.password,
    });

    const userData = {
      Username: data.email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (result) => {
        resolve({ newPasswordRequired: true, result });
      },
    });
  });
};

export const signOut = (): void => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};

export const getCurrentUser = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      reject(new Error("No current user"));
      return;
    }

    cognitoUser.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }
      if (!session.isValid()) {
        reject(new Error("Session is not valid"));
        return;
      }
      cognitoUser.getUserAttributes((err: any, attributes: any) => {
        if (err) {
          reject(err);
          return;
        }
        const userData = attributes.reduce((acc: any, attribute: any) => {
          acc[attribute.getName()] = attribute.getValue();
          return acc;
        }, {});
        resolve({ session, userData });
      });
    });
  });
};

export const confirmSignUp = (email: string, code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const resendConfirmationCode = (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const forgotPassword = (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const confirmPassword = (
  email: string,
  code: string,
  newPassword: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};
