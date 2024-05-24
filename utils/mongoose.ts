import mongoose from 'mongoose'

declare global {
  var instance: {
    connection?: typeof mongoose
    promise?: Promise<typeof mongoose>
  }
}

const uri = process.env.MONGODB_URI!
if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

let cached = global.instance
if (!cached) {
  cached = global.instance = { connection: undefined, promise: undefined }
}

export namespace Mongoose {
  export async function connect() {
    if (cached.connection !== undefined) {
      return cached.connection
    }

    if (cached.promise === undefined) {
      const options = {
        bufferCommands: false,
      }

      mongoose.set('transactionAsyncLocalStorage', true)
      mongoose.connection.on('open', () => console.log('mongoose open'))
      mongoose.connection.on('close', () => console.log('mongoose close'))
      mongoose.connection.on('error', (error) => console.log(error))
      mongoose.connection.on('connected', () =>
        console.log('mongoose connected')
      )
      mongoose.connection.on('disconnecting', () =>
        console.log('mongoose disconnecting')
      )
      mongoose.connection.on('disconnected', () =>
        console.log('mongoose disconnected')
      )
      mongoose.connection.on('reconnected', () =>
        console.log('mongoose reconnected')
      )

      cached.promise = mongoose.connect(uri, options)
    }

    try {
      cached.connection = await cached.promise
    } catch (error) {
      cached.promise = undefined
      throw error
    }

    return cached.connection
  }
}
