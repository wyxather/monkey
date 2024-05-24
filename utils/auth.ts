import { UserObject } from '@/models/user'
import {
  EncryptJWT,
  JWTPayload,
  JWTVerifyResult,
  SignJWT,
  jwtDecrypt,
  jwtVerify,
} from 'jose'
import { Types } from 'mongoose'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { HttpRequest, HttpResponse } from './http'

const SIGN_KEY = new TextEncoder().encode(process.env.AUTH_SIGN_KEY)
const SIGN_ALG = 'HS256'

const ENCRYPT_KEY = new TextEncoder().encode(process.env.AUTH_ENCRYPT_KEY)
const ENCRYPT_KEY_ALG = 'dir'
const ENCRYPT_CONTENT_ALG = 'A256GCM'

const EXPIRATION_DURATION = 5 * 60 * 1000

const COOKIE_NAME = 'session'

export type UserSession = {
  _id: Types.ObjectId
}

function sign(payload: JWTPayload, issuetAt: number, expirationTime: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: SIGN_ALG })
    .setIssuedAt(issuetAt)
    .setExpirationTime(expirationTime)
    .sign(SIGN_KEY)
}

function verify(jwt: string) {
  return jwtVerify(jwt, SIGN_KEY, {
    algorithms: [SIGN_ALG],
  })
}

function encrypt(
  payload: JWTPayload,
  issuetAt: number,
  expirationTime: number
) {
  return new EncryptJWT(payload)
    .setProtectedHeader({
      alg: ENCRYPT_KEY_ALG,
      enc: ENCRYPT_CONTENT_ALG,
    })
    .setIssuedAt(issuetAt)
    .setExpirationTime(expirationTime)
    .encrypt(ENCRYPT_KEY)
}

function decrypt(jwt: string) {
  return jwtDecrypt(jwt, ENCRYPT_KEY, {
    keyManagementAlgorithms: [ENCRYPT_KEY_ALG],
    contentEncryptionAlgorithms: [ENCRYPT_CONTENT_ALG],
  })
}

function setSessionCookie(
  response: HttpResponse,
  value: string,
  expires: number
) {
  response.cookies.set({
    name: COOKIE_NAME,
    value,
    expires,
    httpOnly: true,
    sameSite: 'strict',
  })
}

export function getSessionCookie(request: HttpRequest) {
  return request.cookies.get(COOKIE_NAME)
}

export async function getSession(cookie: RequestCookie) {
  const decryptedSession = await decrypt(cookie.value)
  const verifiedSession = await verify(decryptedSession.payload.jwt as string)
  return verifiedSession
}

export function getUserSession(payload: JWTPayload) {
  return payload.user as UserSession
}

export async function createSession(user: UserObject, response: HttpResponse) {
  const userSession: UserSession = {
    _id: user._id!,
  }
  const iat = Date.now()
  const expires = iat + EXPIRATION_DURATION
  const signedSession = await sign({ user: userSession }, iat, expires)
  const encryptedSession = await encrypt({ jwt: signedSession }, iat, expires)
  setSessionCookie(response, encryptedSession, expires)
}

export async function updateSession(
  session: JWTVerifyResult<JWTPayload>,
  response: HttpResponse
) {
  const userSession = getUserSession(session.payload)
  const expires = Date.now() + EXPIRATION_DURATION
  const signedSession = await sign(
    { user: userSession },
    session.payload.iat!,
    expires
  )
  const encryptedSession = await encrypt(
    { jwt: signedSession },
    session.payload.iat!,
    expires
  )
  setSessionCookie(response, encryptedSession, expires)
}

export function destroySession(response: HttpResponse) {
  setSessionCookie(response, '', 0)
}
