'use server'

import { TransactionResult } from '@/actions/transactions/result'
import Transaction, { TransactionObject } from '@/models/transaction'
import { getUserSession } from '@/utilities/server/auth'
import { Mongoose } from '@/utilities/server/mongoose'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { parseZonedDateTime } from '@internationalized/date'

export async function getTransactions() {
  let transactions: TransactionObject[] = []
  try {
    await Mongoose.connect()
    const user = await getUserSession()
    transactions = await Transaction.find({ user: user?._id })
      .lean()
      .populate(['profile', 'category'])
    transactions = JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    console.error(error)
  }
  return transactions
}

export async function addTransaction(
  state: { result: TransactionResult; message: string },
  data: FormData
) {
  if (state.result !== TransactionResult.Undefined) {
    return {
      result: TransactionResult.Error,
      message: 'Invalid transaction state.',
    }
  }

  const input = {
    profile: data.get('profile'),
    category: data.get('category'),
    description: data.get('description'),
    balance: Number(data.get('balance')),
    date: data.get('date'),
  }

  const Schema = z.object({
    profile: z
      .string({ message: 'Profile must be a string.' })
      .min(24, { message: 'Profile must be at least 24 characters.' })
      .max(24, { message: 'Profile must not exceed 24 characters.' }),
    category: z
      .string({ message: 'Category must be a string.' })
      .min(24, { message: 'Category must be at least 24 characters.' })
      .max(24, { message: 'Category must not exceed 24 characters.' }),
    description: z
      .string({ message: 'Description must be a string.' })
      .max(64, { message: 'Description must no exceed 64 characters.' }),
    balance: z.number({ message: 'Balance must be a number.' }),
    date: z.string({ message: 'Date must be a string.' }).refine(
      (date) => {
        try {
          parseZonedDateTime(date)
          return true
        } catch (error) {
          return false
        }
      },
      { message: 'Date must be a valid zoned date time format.' }
    ),
  })

  const schema = Schema.safeParse(input)
  if (!schema.success) {
    return {
      result: TransactionResult.Error,
      message: schema.error.issues[0].message,
    }
  }

  try {
    await Mongoose.connect()
    const user = await getUserSession()
    await Transaction.create({ ...schema.data, user: user?._id })
  } catch (error: any) {
    return { result: TransactionResult.Error, message: error.message }
  }

  revalidatePath('/transactions')

  return { result: TransactionResult.Ok, message: '' }
}

export async function deleteTransaction(
  state: { result: TransactionResult; message: string },
  data: FormData
) {
  if (state.result !== TransactionResult.Undefined) {
    return {
      result: TransactionResult.Error,
      message: 'Invalid transaction state.',
    }
  }

  const input = {
    _id: data.get('_id'),
  }

  const Schema = z.object({
    _id: z
      .string({ message: 'Id must be a string.' })
      .min(24, { message: 'Id must be at least 24 characters.' })
      .max(24, { message: 'Id must not exceed 24 characters.' }),
  })

  const schema = Schema.safeParse(input)
  if (!schema.success) {
    return {
      result: TransactionResult.Error,
      message: schema.error.issues[0].message,
    }
  }

  try {
    await Mongoose.connect()
    const user = await getUserSession()
    await Transaction.deleteOne({ ...schema.data, user: user?._id })
  } catch (error: any) {
    return { result: TransactionResult.Error, message: error.message }
  }

  revalidatePath('/transactions')

  return { result: TransactionResult.Ok, message: '' }
}

export async function editTransaction(
  state: { result: TransactionResult; message: string },
  data: FormData
) {
  if (state.result !== TransactionResult.Undefined) {
    return {
      result: TransactionResult.Error,
      message: 'Invalid transaction state.',
    }
  }

  const input = {
    _id: data.get('_id'),
    profile: data.get('profile'),
    category: data.get('category'),
    description: data.get('description'),
    balance: Number(data.get('balance')),
    date: data.get('date'),
  }

  const Schema = z.object({
    _id: z
      .string({ message: 'Profile must be a string.' })
      .min(24, { message: 'Profile must be at least 24 characters.' })
      .max(24, { message: 'Profile must not exceed 24 characters.' }),
    profile: z
      .string({ message: 'Profile must be a string.' })
      .min(24, { message: 'Profile must be at least 24 characters.' })
      .max(24, { message: 'Profile must not exceed 24 characters.' }),
    category: z
      .string({ message: 'Category must be a string.' })
      .min(24, { message: 'Category must be at least 24 characters.' })
      .max(24, { message: 'Category must not exceed 24 characters.' }),
    description: z
      .string({ message: 'Description must be a string.' })
      .max(64, { message: 'Description must no exceed 64 characters.' }),
    balance: z.number({ message: 'Balance must be a number.' }),
    date: z.string({ message: 'Date must be a string.' }).refine(
      (date) => {
        try {
          parseZonedDateTime(date)
          return true
        } catch (error) {
          return false
        }
      },
      { message: 'Date must be a valid zoned date time format.' }
    ),
  })

  const schema = Schema.safeParse(input)
  if (!schema.success) {
    return {
      result: TransactionResult.Error,
      message: schema.error.issues[0].message,
    }
  }

  try {
    await Mongoose.connect()
    const user = await getUserSession()
    await Transaction.findOneAndUpdate(
      { _id: schema.data._id, user: user?._id },
      schema.data
    )
  } catch (error: any) {
    return { result: TransactionResult.Error, message: error.message }
  }

  revalidatePath('/transactions')

  return { result: TransactionResult.Ok, message: '' }
}
