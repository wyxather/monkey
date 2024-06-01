import "server-only";

import { UserObject } from "@/models/user";
import { EncryptJWT, JWTPayload, SignJWT, jwtDecrypt, jwtVerify } from "jose";
import { Types } from "mongoose";
import { cookies } from "next/headers";
import { HttpResponse } from "./http";

const SIGN_KEY = new TextEncoder().encode(process.env.AUTH_SIGN_KEY);
const SIGN_ALG = "HS256";
const ENCRYPT_KEY = new TextEncoder().encode(process.env.AUTH_ENCRYPT_KEY);
const ENCRYPT_KEY_ALG = "dir";
const ENCRYPT_CONTENT_ALG = "A256GCM";
const EXPIRATION_DURATION = 5 * 60 * 1000;
const COOKIE_NAME = "session";

type UserSession = {
  _id: Types.ObjectId;
};

function sign(payload: JWTPayload, iat: number, exp: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: SIGN_ALG })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(SIGN_KEY);
}

function verify(jwt: string) {
  return jwtVerify(jwt, SIGN_KEY, {
    algorithms: [SIGN_ALG],
  });
}

function encrypt(payload: JWTPayload, iat: number, exp: number) {
  return new EncryptJWT(payload)
    .setProtectedHeader({
      alg: ENCRYPT_KEY_ALG,
      enc: ENCRYPT_CONTENT_ALG,
    })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .encrypt(ENCRYPT_KEY);
}

function decrypt(jwt: string) {
  return jwtDecrypt(jwt, ENCRYPT_KEY, {
    keyManagementAlgorithms: [ENCRYPT_KEY_ALG],
    contentEncryptionAlgorithms: [ENCRYPT_CONTENT_ALG],
  });
}

function setSessionCookie(
  value: string,
  expires: number,
  response?: HttpResponse,
) {
  response
    ? response.cookies.set({
        name: COOKIE_NAME,
        value,
        expires,
        httpOnly: true,
        sameSite: "strict",
      })
    : cookies().set({
        name: COOKIE_NAME,
        value,
        expires,
        httpOnly: true,
        sameSite: "strict",
      });
  return true;
}

function getSessionCookie() {
  return cookies().get(COOKIE_NAME)?.value;
}

export async function getSession() {
  const cookie = getSessionCookie();
  return cookie
    ? decrypt(cookie)
        .then((cookie) => verify(cookie.payload.jwt as string))
        .then((cookie) => cookie.payload)
        .catch(() => null)
    : null;
}

export async function getUserSession(session?: JWTPayload | null) {
  if (session === undefined) {
    return getSession().then((session) =>
      session ? (session.user as UserSession) : null,
    );
  }
  return session ? (session.user as UserSession) : null;
}

export async function createSession(
  userObject: UserObject,
  response?: HttpResponse,
) {
  const user: UserSession = {
    _id: userObject._id,
  };
  const iat = Date.now();
  const exp = iat + EXPIRATION_DURATION;
  return sign({ user }, iat, exp)
    .then((jwt) => encrypt({ jwt }, iat, exp))
    .then((session) => setSessionCookie(session, exp, response));
}

export async function updateSession(
  session: JWTPayload,
  response?: HttpResponse,
) {
  const exp = Date.now() + EXPIRATION_DURATION;
  return getUserSession(session).then((user) =>
    user
      ? sign({ user }, session.iat!, exp)
          .then((jwt) => encrypt({ jwt }, session.iat!, exp))
          .then((session) => setSessionCookie(session, exp, response))
          .catch(() => false)
      : false,
  );
}

export function destroySession(response?: HttpResponse) {
  setSessionCookie("", 0, response);
}
