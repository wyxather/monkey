import User from '@/models/user'
import { HttpRequest, HttpResponse } from '@/utils/http'
import { Mongoose } from '@/utils/mongoose'

function RegisterError(cause: string) {
  return Error('Failed to register', { cause })
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
    return HttpResponse.badRequest(RegisterError('Username must be define'))
  }
  if (username.length <= 0) {
    return HttpResponse.badRequest(
      RegisterError('Username length must be equal or greater than 1')
    )
  }

  const password = formData.get('password')
  if (password === null) {
    return HttpResponse.badRequest(RegisterError('Password must be define'))
  }
  if (password.length <= 7) {
    return HttpResponse.badRequest(
      RegisterError('Password length must be equal or greater than 8')
    )
  }

  try {
    const result = await User.register(username.toString(), password.toString())
    if (result === false) {
      return HttpResponse.forbidden(RegisterError('Username already exist'))
    }
  } catch (error: any) {
    return HttpResponse.internalServerError(error)
  }

  return HttpResponse.ok({ message: 'Successfully registered' })
}
