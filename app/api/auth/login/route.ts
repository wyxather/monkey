import User, { UserObject } from '@/models/user'
import { createSession } from '@/utils/auth'
import { HttpRequest, HttpResponse } from '@/utils/http'
import { Mongoose } from '@/utils/mongoose'

function LoginError(cause: string) {
  return Error('Failed to login', { cause })
}

export async function POST(request: HttpRequest) {
  try {
    await Mongoose.connect()
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (error: any) {
    return HttpResponse.badRequest(error)
  }

  const username = formData.get('username')
  if (username === null) {
    return HttpResponse.badRequest(LoginError('Username must be define'))
  }

  const password = formData.get('password')
  if (password === null) {
    return HttpResponse.badRequest(LoginError('Password must be define'))
  }

  let user: UserObject | null
  try {
    user = await User.login(username.toString(), password.toString())
    if (user === null) {
      return HttpResponse.forbidden(LoginError('Wrong username or password'))
    }
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  const response = HttpResponse.ok({ message: 'Successfully logged in' })
  try {
    await createSession(user, response)
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  return response
}
