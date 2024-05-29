'use server'

import { ProfileResult } from '@/actions/profiles/result'
import Profile, { ProfileObject } from '@/models/profile'
import { getUserSession } from '@/utilities/server/auth'
import { Mongoose } from '@/utilities/server/mongoose'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function getProfiles() {
  let profiles: ProfileObject[] = []
  try {
    await Mongoose.connect()
    const user = await getUserSession()
    profiles = await Profile.find({ user: user?._id }).lean()
    profiles = JSON.parse(JSON.stringify(profiles))
  } catch (error) {
    console.error(error)
  }
  return profiles
}

export async function addProfile(
  state: { result: ProfileResult; message: string },
  data: FormData
) {
  if (state.result !== ProfileResult.Undefined) {
    return {
      result: ProfileResult.Error,
      message: 'Invalid profile state.',
    }
  }

  const Schema = z.object({
    name: z
      .string()
      .min(1, { message: 'Name must be at least 1 character long.' })
      .max(64, { message: 'Name must not exceed 64 characters long.' }),
    description: z
      .string()
      .max(64, { message: 'Description must not exceed 64 characters long.' }),
    balance: z.number(),
  })

  const input = {
    name: data.get('name'),
    description: data.get('description'),
    balance: Number(data.get('balance')),
  }

  const schema = Schema.safeParse(input)
  if (!schema.success) {
    return {
      result: ProfileResult.Error,
      message: schema.error.issues[0].message,
    }
  }

  try {
    await Mongoose.connect()
    const user = await getUserSession()
    await Profile.create({ ...schema.data, user: user?._id })
  } catch (error: any) {
    return { result: ProfileResult.Error, message: error.message }
  }

  revalidatePath('/profiles')

  return { result: ProfileResult.Ok, message: '' }
}

export async function deleteProfile(
  state: { result: ProfileResult; message: string },
  data: FormData
) {
  if (state.result !== ProfileResult.Undefined) {
    return {
      result: ProfileResult.Error,
      message: 'Invalid profile state.',
    }
  }

  const Schema = z.object({
    _id: z
      .string()
      .min(24, { message: 'Id must be exactly 24 characters long.' })
      .max(24, { message: 'Id must be exactly 24 characters long.' }),
  })

  const input = {
    _id: data.get('_id'),
  }

  const schema = Schema.safeParse(input)
  if (!schema.success) {
    return {
      result: ProfileResult.Error,
      message: schema.error.issues[0].message,
    }
  }

  try {
    await Mongoose.connect()
    const user = await getUserSession()
    await Profile.deleteOne({ ...schema.data, user: user?._id })
  } catch (error: any) {
    return { result: ProfileResult.Error, message: error.message }
  }

  revalidatePath('/profiles')

  return { result: ProfileResult.Ok, message: '' }
}

export async function editProfile(
  state: { result: ProfileResult; message: string },
  data: FormData
) {
  if (state.result !== ProfileResult.Undefined) {
    return {
      result: ProfileResult.Error,
      message: 'Invalid profile state.',
    }
  }

  const Schema = z.object({
    _id: z
      .string()
      .min(24, { message: 'Id must be exactly 24 characters long.' })
      .max(24, { message: 'Id must be exactly 24 characters long.' }),
    name: z
      .string()
      .min(1, { message: 'Name must be at least 1 character long.' })
      .max(64, { message: 'Name must not exceed 64 characters long.' }),
    description: z
      .string()
      .max(64, { message: 'Description must not exceed 64 characters long.' }),
    balance: z.number(),
  })

  const input = {
    _id: data.get('_id'),
    name: data.get('name'),
    description: data.get('description'),
    balance: Number(data.get('balance')),
  }

  const schema = Schema.safeParse(input)
  if (!schema.success) {
    return {
      result: ProfileResult.Error,
      message: schema.error.issues[0].message,
    }
  }

  try {
    await Mongoose.connect()
    const user = await getUserSession()
    await Profile.findOneAndUpdate(
      { _id: schema.data._id, user: user?._id },
      schema.data
    )
  } catch (error: any) {
    return { result: ProfileResult.Error, message: error.message }
  }

  revalidatePath('/profiles')

  return { result: ProfileResult.Ok, message: '' }
}
