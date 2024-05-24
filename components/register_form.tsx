'use client'

import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RegisterForm() {
  const router = useRouter()
  const [messageValue, setMessageValue] = useState('')
  const [waitForMessage, setWaitForMessage] = useState(false)
  const messageModal = useDisclosure()

  return (
    <>
      <form
        className='w-full'
        method='post'
        action='/api/auth/register'
        onSubmit={async (event) => {
          event.preventDefault()

          if (waitForMessage === true) {
            return
          }
          setWaitForMessage(true)

          const form = event.currentTarget
          const formData = new FormData(form)

          try {
            const response = await fetch(form.action, {
              method: form.method,
              body: formData,
            })
            if (!response.ok) {
              const json = await response.json()
              messageModal.onOpen()
              setMessageValue(
                json.error.message + '. ' + json.error.cause + '.'
              )
              return
            }

            router.push('/auth/login')
            return
          } catch (error) {
            console.error(error)
          }

          setWaitForMessage(false)
        }}
      >
        <Input
          autoFocus
          name='username'
          label='Username'
          variant='underlined'
          minLength={1}
          isRequired
        />
        <Input
          name='password'
          type='password'
          label='Password'
          variant='underlined'
          minLength={8}
          isRequired
        />
        <div className='flex justify-end mt-6 gap-4'>
          <Button
            type='submit'
            color='primary'
            variant={waitForMessage ? 'faded' : 'flat'}
            isDisabled={waitForMessage}
          >
            Register
          </Button>
        </div>
      </form>

      <Modal
        backdrop='blur'
        isOpen={messageModal.isOpen}
        onOpenChange={messageModal.onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Error</ModalHeader>

              <ModalBody>{messageValue}</ModalBody>

              <ModalFooter>
                <Button onPress={onClose}>Ok</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
