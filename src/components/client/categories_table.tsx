'use client'

import {
  addCategory,
  deleteCategory,
  editCategory,
} from '@/actions/categories/action'
import { CategoryResult } from '@/actions/categories/result'
import { CategoryObject } from '@/models/category'
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
  state: { result: CategoryResult; message: string }
}) {
  const status = useFormStatus()

  useEffect(() => {
    switch (props.state.result) {
      case CategoryResult.Ok: {
        props.state.result = CategoryResult.Undefined
        props.onClose()
        break
      }
      case CategoryResult.Error: {
        props.state.result = CategoryResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-blue-500'>Add Category</ModalHeader>
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
      </ModalBody>
      <ModalFooter>
        {props.state.result !== CategoryResult.Undefined && (
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
  state: { result: CategoryResult; message: string }
  category: CategoryObject
}) {
  const status = useFormStatus()

  useEffect(() => {
    switch (props.state.result) {
      case CategoryResult.Ok: {
        props.state.result = CategoryResult.Undefined
        props.onClose()
        break
      }
      case CategoryResult.Error: {
        props.state.result = CategoryResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-red-500'>Delete Category</ModalHeader>
      <ModalBody className='mt-6 mb-3'>
        <input
          name='_id'
          readOnly
          hidden
          value={props.category._id?.toString()}
        />
        <p>Are you sure you want to delete {props.category.name}?</p>
        <p className='text-xs'>
          (Every transactions associate with {props.category.name} will also be
          deleted)
        </p>
      </ModalBody>
      <ModalFooter>
        {props.state.result !== CategoryResult.Undefined && (
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
  state: { result: CategoryResult; message: string }
  category: CategoryObject
}) {
  const status = useFormStatus()

  useEffect(() => {
    switch (props.state.result) {
      case CategoryResult.Ok: {
        props.state.result = CategoryResult.Undefined
        props.onClose()
        break
      }
      case CategoryResult.Error: {
        props.state.result = CategoryResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-gray-500'>Edit Category</ModalHeader>
      <ModalBody className='mt-6 mb-3'>
        <input
          name='_id'
          readOnly
          hidden
          value={props.category._id?.toString()}
        />
        <Input
          type='text'
          name='name'
          label='Name'
          placeholder={props.category.name}
          defaultValue={props.category.name}
          minLength={1}
          maxLength={64}
          isDisabled={status.pending}
          isRequired
        />
      </ModalBody>
      <ModalFooter>
        {props.state.result !== CategoryResult.Undefined && (
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

export function CategoriesTable(props: { categories: CategoryObject[] }) {
  const [actionCategory, setActionCategory] = useState<CategoryObject | null>(
    null
  )
  const [filterValue, setFilterValue] = useState('')
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending',
  })
  const modal = {
    add: useDisclosure(),
    delete: useDisclosure(),
    edit: useDisclosure(),
  }
  const form = {
    add: useFormState(addCategory, {
      result: CategoryResult.Undefined,
      message: '',
    }),
    delete: useFormState(deleteCategory, {
      result: CategoryResult.Undefined,
      message: '',
    }),
    edit: useFormState(editCategory, {
      result: CategoryResult.Undefined,
      message: '',
    }),
  }

  const filteredCategories = useMemo(() => {
    let filteredCategories = [...props.categories]
    if (filterValue) {
      filteredCategories = filteredCategories.filter((categories) =>
        categories.name.toLowerCase().includes(filterValue.toLowerCase())
      )
    }
    return filteredCategories
  }, [props.categories, filterValue])

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      const first = a[
        sortDescriptor.column as keyof typeof a
      ] as unknown as number
      const second = b[
        sortDescriptor.column as keyof typeof b
      ] as unknown as number
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, filteredCategories])

  const topContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='flex justify-between gap-3 items-end'>
          <Input
            isClearable
            className='w-full sm:max-w-[44%]'
            placeholder='Search categories...'
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
            {props.categories.length > 0 ? (
              <>
                Total {props.categories.length} categor
                {props.categories.length > 1 ? 'ies' : 'y'}.
                {filterValue && (
                  <>
                    {filteredCategories.length > 0 ? (
                      <>
                        {' '}
                        Found {filteredCategories.length} categor
                        {filteredCategories.length > 1 ? 'ies' : 'y'}.
                      </>
                    ) : (
                      ' No category found.'
                    )}
                  </>
                )}
              </>
            ) : (
              'No category found.'
            )}
          </span>
        </div>
      </div>
    )
  }, [
    props.categories.length,
    filterValue,
    setFilterValue,
    filteredCategories.length,
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
            NAME
          </TableColumn>

          <TableColumn
            key='transaction'
            allowsSorting>
            TRANSACTIONS
          </TableColumn>

          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={sortedCategories}
          emptyContent={'No category to display'}>
          {(category) => (
            <TableRow key={category._id?.toString()}>
              <TableCell>
                <User
                  name={category.name}
                  avatarProps={{ radius: 'lg' }}
                />
              </TableCell>

              <TableCell>
                <Balance balance={0} />
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
                      setActionCategory(category)
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
                      Edit category
                    </DropdownItem>

                    <DropdownItem
                      key='delete'
                      color='danger'
                      className='text-danger'
                      startContent={<FaTrash />}>
                      Delete category
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
                category={actionCategory!}
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
                category={actionCategory!}
              />
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
