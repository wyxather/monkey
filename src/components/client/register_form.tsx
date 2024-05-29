'use client'

import { register } from '@/actions/auth/register/action'
import { RegisterResult } from '@/actions/auth/register/result'
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

function RegisterFormContent(props: {
  state: { result: RegisterResult; message: string }
}) {
  const router = useRouter()
  const status = useFormStatus()
  const modal = useDisclosure()

  useEffect(() => {
    switch (props.state.result) {
      case RegisterResult.Error: {
        props.state.result = RegisterResult.Undefined
        modal.onOpen()
        break
      }
      case RegisterResult.Ok: {
        props.state.result = RegisterResult.Undefined
        router.push('/auth/login')
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
          name='password1'
          label='Password'
          minLength={8}
          maxLength={64}
          isRequired
          isDisabled={status.pending}
        />

        <Input
          type='password'
          name='password2'
          label='Confirm Password'
          minLength={8}
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
            Already have an account? login here
          </Link>

          <Button
            type='submit'
            color='primary'
            variant={!status.pending ? 'flat' : 'faded'}
            isLoading={status.pending}>
            Register
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

export function RegisterForm() {
  const ref = useRef<HTMLFormElement>(null)
  const state = useFormState(register, {
    result: RegisterResult.Undefined,
    message: '',
  })
  return (
    <form
      ref={ref}
      action={async (data: FormData) => {
        state[1](data)
        ref.current?.reset()
      }}>
      <RegisterFormContent state={state[0]} />
    </form>
  )
}
