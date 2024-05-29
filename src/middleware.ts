import 'server-only'

import {
  destroySession,
  getSession,
  getUserSession,
  updateSession,
} from '@/utilities/server/auth'
import { HttpRequest, HttpResponse } from '@/utilities/server/http'
import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/register).*)'],
}

export async function middleware(request: HttpRequest) {
  const session = await getSession()
  if (session) {
    const user = await getUserSession(session)
    if (user) {
      if (request.nextUrl.pathname.startsWith('/auth/login')) {
        return HttpResponse.redirect(new URL('/', request.url))
      }
      const response = HttpResponse.next()
      await updateSession(session, response)
      return response
    }
  }
  let response: NextResponse<unknown>
  if (request.nextUrl.pathname.startsWith('/auth/login')) {
    response = HttpResponse.next()
  } else {
    response = HttpResponse.redirect(new URL('/auth/login', request.url))
  }
  destroySession(response)
  return response
}
