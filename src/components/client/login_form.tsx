'use client'

import { login } from '@/actions/auth/login/action'
import { LoginResult } from '@/actions/auth/login/result'
import {
  Button,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'

function LoginFormContent(props: {
  state: { result: LoginResult; message: string }
}) {
  const router = useRouter()
  const status = useFormStatus()
  const modal = useDisclosure()

  useEffect(() => {
    switch (props.state.result) {
      case LoginResult.Error: {
        props.state.result = LoginResult.Undefined
        modal.onOpen()
        break
      }
      case LoginResult.Ok: {
        props.state.result = LoginResult.Undefined
        router.push('/')
        break
      }
    }
  }, [modal])

  return (
    <>
      <div className='flex flex-col gap-4 p-4'>
        <Input
          type='text'
          name='username'
          label='Username'
          minLength={1}
          maxLength={64}
          isRequired
          isDisabled={status.pending}
        />

        <Input
          type='password'
          name='password'
          label='Password'
          minLength={1}
          maxLength={64}
          isRequired
          isDisabled={status.pending}
        />

        <div className='flex justify-end gap-4'>
          <Link
            href='/auth/register'
            underline='always'
            showAnchorIcon
            isDisabled={status.pending}>
            Dont have an account? register here
          </Link>

          <Button
            type='submit'
            color='primary'
            variant={!status.pending ? 'flat' : 'faded'}
            isLoading={status.pending}>
            Login
          </Button>
        </div>
      </div>

      <Modal
        placement='center'
        backdrop='blur'
        hideCloseButton
        isDismissable={false}
        isKeyboardDismissDisabled
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='bg-red-500'>Error</ModalHeader>
              <ModalBody className='mt-6 mb-3'>{props.state.message}</ModalBody>
              <ModalFooter>
                <Button
                  variant='bordered'
                  onPress={onClose}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export function LoginForm() {
  const ref = useRef<HTMLFormElement>(null)
  const state = useFormState(login, {
    result: LoginResult.Undefined,
    message: '',
  })
  return (
    <form
      ref={ref}
      action={async (data: FormData) => {
        state[1](data)
        ref.current?.reset()
      }}>
      <LoginFormContent state={state[0]} />
    </form>
  )
}
