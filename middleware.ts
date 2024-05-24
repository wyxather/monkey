import { JWTPayload, JWTVerifyResult } from 'jose'
import {
  destroySession,
  getSession,
  getSessionCookie,
  updateSession,
} from './utils/auth'
import { HttpRequest, HttpResponse } from './utils/http'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|auth).*)'],
}

export async function middleware(request: HttpRequest) {
  const sessionCookie = getSessionCookie(request)
  if (sessionCookie === undefined) {
    return HttpResponse.redirect(new URL('/auth/login', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/auth')) {
    return HttpResponse.redirect(new URL('/', request.url))
  }

  let session: JWTVerifyResult<JWTPayload>
  try {
    session = await getSession(sessionCookie)
  } catch (error) {
    const response = HttpResponse.redirect(new URL('/auth/login', request.url))
    destroySession(response)
    return response
  }

  const response = HttpResponse.next()
  try {
    await updateSession(session, response)
  } catch (error) {
    return response
  }

  return response
}
