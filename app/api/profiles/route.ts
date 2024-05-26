import Profile, { ProfileDocument, ProfileObject } from '@/models/profile'
import {
  UserSession,
  getSession,
  getSessionCookie,
  getUserSession,
} from '@/utils/auth'
import { HttpRequest, HttpResponse } from '@/utils/http'
import { Mongoose } from '@/utils/mongoose'
import { NextRequest } from 'next/server'

export async function GET(request: HttpRequest) {
  try {
    await Mongoose.connect()
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  let userSession: UserSession
  try {
    const sessionCookie = getSessionCookie(request)
    if (sessionCookie === undefined) {
      return HttpResponse.unauthorized(Error('Invalid session cookie'))
    }
    const session = await getSession(sessionCookie)
    userSession = getUserSession(session.payload)
  } catch (error: any) {
    return HttpResponse.unauthorized(error)
  }

  let profiles: ProfileObject[]
  try {
    profiles = await Profile.find({
      user: userSession._id,
    }).lean()
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  return HttpResponse.ok(profiles)
}

export async function POST(request: HttpRequest) {
  try {
    await Mongoose.connect()
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  let userSession: UserSession
  try {
    const sessionCookie = getSessionCookie(request)
    if (sessionCookie === undefined) {
      return HttpResponse.unauthorized(Error('Invalid session cookie'))
    }
    const session = await getSession(sessionCookie)
    userSession = getUserSession(session.payload)
  } catch (error: any) {
    return HttpResponse.unauthorized(error)
  }

  let json
  try {
    json = await request.json()
  } catch (error: any) {
    return HttpResponse.badRequest(error)
  }

  const profile: ProfileObject = {
    user: userSession._id,
    name: json.name,
    description: json.description,
    balance: json.balance,
  }

  let createdProfile: ProfileDocument
  try {
    createdProfile = await Profile.create(profile)
  } catch (error: any) {
    return HttpResponse.badRequest(error)
  }

  return HttpResponse.ok({
    message: 'Profile has been created',
    createdProfile,
  })
}

export async function PATCH(request: NextRequest) {
  try {
    await Mongoose.connect()
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  let userSession: UserSession
  try {
    const sessionCookie = getSessionCookie(request)
    if (sessionCookie === undefined) {
      return HttpResponse.unauthorized(Error('Invalid session cookie'))
    }
    const session = await getSession(sessionCookie)
    userSession = getUserSession(session.payload)
  } catch (error: any) {
    return HttpResponse.unauthorized(error)
  }

  const _id = request.nextUrl.searchParams.get('_id')
  if (_id === null) {
    return HttpResponse.badRequest(Error("Param '_id' must be defined"))
  }

  let json
  try {
    json = await request.json()
  } catch (error: any) {
    return HttpResponse.badRequest(error)
  }

  const updatedProfile = await Profile.findOneAndUpdate(
    {
      _id,
      user: userSession.user._id,
    },
    json
  ).lean()
  if (updatedProfile === null) {
    return HttpResponse.notFound(
      Error("Couldn't find profile", { cause: "Profile doesn't exist" })
    )
  }

  return HttpResponse.ok({
    message: 'Profile has been updated',
    updatedProfile,
  })
}
