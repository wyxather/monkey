'use client'

import {
  addProfile,
  deleteProfile,
  editProfile,
} from '@/actions/profiles/action'
import { ProfileResult } from '@/actions/profiles/result'
import { ProfileObject } from '@/models/profile'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
  useDisclosure,
} from '@nextui-org/react'
import { useEffect, useMemo, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { FaPlus, FaSearch } from 'react-icons/fa'
import { FaEllipsisVertical, FaPencil, FaTrash } from 'react-icons/fa6'
import { Balance } from '../balance'

function AddFormContent(props: {
  onClose: () => void
  state: { result: ProfileResult; message: string }
}) {
  const status = useFormStatus()

  useEffect(() => {
    switch (props.state.result) {
      case ProfileResult.Ok: {
        props.state.result = ProfileResult.Undefined
        props.onClose()
        break
      }
      case ProfileResult.Error: {
        props.state.result = ProfileResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-blue-500'>Add Profile</ModalHeader>
      <ModalBody className='mt-6 mb-3'>
        <Input
          type='text'
          name='name'
          label='Name'
          minLength={1}
          maxLength={64}
          isDisabled={status.pending}
          isRequired
        />
        <Input
          type='text'
          name='description'
          label='Description'
          isDisabled={status.pending}
        />
        <Input
          type='number'
          name='balance'
          label='Balance'
          placeholder='0.00'
          startContent={
            <div className='pointer-events-none flex items-center'>
              <span className='text-default-400 text-small'>Rp</span>
            </div>
          }
          isRequired
          isDisabled={status.pending}
        />
      </ModalBody>
      <ModalFooter>
        {props.state.result !== ProfileResult.Undefined && (
          <span className='text-danger text-xs'>{props.state.message}</span>
        )}
        <Button
          variant='ghost'
          isDisabled={status.pending}
          onPress={props.onClose}>
          Cancel
        </Button>
        <Button
          type='submit'
          variant={status.pending ? 'faded' : 'ghost'}
          color='primary'
          isLoading={status.pending}>
          Create
        </Button>
      </ModalFooter>
    </>
  )
}

function DeleteFormContent(props: {
  onClose: () => void
  state: { result: ProfileResult; message: string }
  profile: ProfileObject
}) {
  const status = useFormStatus()

  useEffect(() => {
    switch (props.state.result) {
      case ProfileResult.Ok: {
        props.state.result = ProfileResult.Undefined
        props.onClose()
        break
      }
      case ProfileResult.Error: {
        props.state.result = ProfileResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-red-500'>Delete Profile</ModalHeader>
      <ModalBody className='mt-6 mb-3'>
        <input
          name='_id'
          readOnly
          hidden
          value={props.profile._id?.toString()}
        />
        <p>Are you sure you want to delete {props.profile.name}?</p>
        <p className='text-xs'>
          (Every transactions associate with {props.profile.name} will also be
          deleted)
        </p>
      </ModalBody>
      <ModalFooter>
        {props.state.result !== ProfileResult.Undefined && (
          <span className='text-danger text-xs'>{props.state.message}</span>
        )}
        <Button
          variant='ghost'
          isDisabled={status.pending}
          onPress={props.onClose}>
          Cancel
        </Button>
        <Button
          type='submit'
          variant={status.pending ? 'faded' : 'ghost'}
          color='danger'
          isLoading={status.pending}>
          Delete
        </Button>
      </ModalFooter>
    </>
  )
}

function EditFormContent(props: {
  onClose: () => void
  state: { result: ProfileResult; message: string }
  profile: ProfileObject
}) {
  const status = useFormStatus()

  useEffect(() => {
    switch (props.state.result) {
      case ProfileResult.Ok: {
        props.state.result = ProfileResult.Undefined
        props.onClose()
        break
      }
      case ProfileResult.Error: {
        props.state.result = ProfileResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-gray-500'>Edit Profile</ModalHeader>
      <ModalBody className='mt-6 mb-3'>
        <input
          name='_id'
          readOnly
          hidden
          value={props.profile._id?.toString()}
        />
        <Input
          type='text'
          name='name'
          label='Name'
          placeholder={props.profile.name}
          defaultValue={props.profile.name}
          minLength={1}
          maxLength={64}
          isDisabled={status.pending}
          isRequired
        />
        <Input
          type='text'
          name='description'
          label='Description'
          placeholder={props.profile.description}
          defaultValue={props.profile.description}
          isDisabled={status.pending}
        />
        <Input
          type='number'
          name='balance'
          label='Balance'
          placeholder={props.profile.balance.toString()}
          defaultValue={props.profile.balance.toString()}
          startContent={
            <div className='pointer-events-none flex items-center'>
              <span className='text-default-400 text-small'>Rp</span>
            </div>
          }
          isRequired
          isDisabled={status.pending}
        />
      </ModalBody>
      <ModalFooter>
        {props.state.result !== ProfileResult.Undefined && (
          <span className='text-danger text-xs'>{props.state.message}</span>
        )}
        <Button
          variant='ghost'
          isDisabled={status.pending}
          onPress={props.onClose}>
          Cancel
        </Button>
        <Button
          type='submit'
          variant={status.pending ? 'faded' : 'ghost'}
          color='warning'
          isLoading={status.pending}>
          Edit
        </Button>
      </ModalFooter>
    </>
  )
}

export function ProfilesTable(props: { profiles: ProfileObject[] }) {
  const [actionProfile, setActionProfile] = useState<ProfileObject | null>(null)
  const [filterValue, setFilterValue] = useState('')
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'profile',
    direction: 'ascending',
  })
  const modal = {
    add: useDisclosure(),
    delete: useDisclosure(),
    edit: useDisclosure(),
  }
  const form = {
    add: useFormState(addProfile, {
      result: ProfileResult.Undefined,
      message: '',
    }),
    delete: useFormState(deleteProfile, {
      result: ProfileResult.Undefined,
      message: '',
    }),
    edit: useFormState(editProfile, {
      result: ProfileResult.Undefined,
      message: '',
    }),
  }

  const filteredProfiles = useMemo(() => {
    let filteredProfiles = [...props.profiles]
    if (filterValue) {
      filteredProfiles = filteredProfiles.filter((profiles) =>
        profiles.name.toLowerCase().includes(filterValue.toLowerCase())
      )
    }
    return filteredProfiles
  }, [props.profiles, filterValue])

  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a] as number
      const second = b[sortDescriptor.column as keyof typeof b] as number
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, filteredProfiles])

  const topContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='flex justify-between gap-3 items-end'>
          <Input
            isClearable
            className='w-full sm:max-w-[44%]'
            placeholder='Search profiles...'
            startContent={<FaSearch />}
            value={filterValue}
            onClear={() => setFilterValue('')}
            onValueChange={setFilterValue}
          />
          <div className='flex gap-3'>
            <Button
              color='primary'
              endContent={<FaPlus />}
              onPress={modal.add.onOpen}>
              Add New
            </Button>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-default-400 text-small'>
            {props.profiles.length > 0 ? (
              <>
                Total {props.profiles.length} profile
                {props.profiles.length > 1 && <>s</>}.
                {filterValue && (
                  <>
                    {filteredProfiles.length > 0 ? (
                      <>
                        {' '}
                        Found {filteredProfiles.length} profile
                        {filteredProfiles.length > 1 && <>s</>}.
                      </>
                    ) : (
                      ' No profile found.'
                    )}
                  </>
                )}
              </>
            ) : (
              'No profile found.'
            )}
          </span>
        </div>
      </div>
    )
  }, [
    props.profiles.length,
    filterValue,
    setFilterValue,
    filteredProfiles.length,
  ])

  return (
    <>
      <Table
        aria-label='Profiles Table'
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'>
        <TableHeader>
          <TableColumn
            key='name'
            allowsSorting>
            PROFILE
          </TableColumn>

          <TableColumn
            key='balance'
            allowsSorting>
            BALANCE
          </TableColumn>

          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={sortedProfiles}
          emptyContent={'No profile to display'}>
          {(profile) => (
            <TableRow key={profile._id?.toString()}>
              <TableCell>
                <User
                  name={profile.name}
                  description={profile.description}
                  avatarProps={{ radius: 'lg' }}
                />
              </TableCell>

              <TableCell>
                <Balance balance={profile.balance} />
              </TableCell>

              <TableCell>
                <Dropdown backdrop='blur'>
                  <DropdownTrigger>
                    <Button
                      variant='light'
                      isIconOnly>
                      <FaEllipsisVertical />
                    </Button>
                  </DropdownTrigger>

                  <DropdownMenu
                    aria-label='Actions Menu'
                    onAction={(key) => {
                      setActionProfile(profile)
                      switch (key) {
                        case 'delete': {
                          modal.delete.onOpen()
                          break
                        }
                        case 'edit': {
                          modal.edit.onOpen()
                          break
                        }
                      }
                    }}>
                    <DropdownItem
                      key='edit'
                      startContent={<FaPencil />}>
                      Edit profile
                    </DropdownItem>

                    <DropdownItem
                      key='delete'
                      color='danger'
                      className='text-danger'
                      startContent={<FaTrash />}>
                      Delete profile
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        backdrop='blur'
        isDismissable={false}
        isKeyboardDismissDisabled
        isOpen={modal.add.isOpen}
        hideCloseButton
        onOpenChange={modal.add.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form action={form.add[1]}>
              <AddFormContent
                onClose={onClose}
                state={form.add[0]}
              />
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop='blur'
        isDismissable={false}
        isKeyboardDismissDisabled
        isOpen={modal.delete.isOpen}
        hideCloseButton
        onOpenChange={modal.delete.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form action={form.delete[1]}>
              <DeleteFormContent
                onClose={onClose}
                state={form.delete[0]}
                profile={actionProfile!}
              />
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop='blur'
        isDismissable={false}
        isKeyboardDismissDisabled
        isOpen={modal.edit.isOpen}
        hideCloseButton
        onOpenChange={modal.edit.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form action={form.edit[1]}>
              <EditFormContent
                onClose={onClose}
                state={form.edit[0]}
                profile={actionProfile!}
              />
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
