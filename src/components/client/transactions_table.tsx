'use client'

import {
  addTransaction,
  deleteTransaction,
  editTransaction,
} from '@/actions/transactions/action'
import { TransactionResult } from '@/actions/transactions/result'
import { CategoryObject } from '@/models/category'
import { ProfileObject } from '@/models/profile'
import { TransactionObject } from '@/models/transaction'
import {
  getLocalTimeZone,
  now,
  parseZonedDateTime,
} from '@internationalized/date'
import {
  Button,
  DatePicker,
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
  profiles: ProfileObject[]
  categories: CategoryObject[]
  onClose: () => void
  state: { result: TransactionResult; message: string }
}) {
  const status = useFormStatus()

  const [selectedProfileId, setSelectedProfileId] = useState<Set<string>>(
    new Set([props.profiles[0]._id?.toString() ?? ''])
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<Set<string>>(
    new Set([props.categories[0]._id?.toString() ?? ''])
  )

  const selectedProfile = useMemo(
    () =>
      props.profiles.find(
        (profile) =>
          profile._id?.toString() === Array.from(selectedProfileId)[0]
      ),
    [props.profiles, selectedProfileId]
  )
  const selectedCategory = useMemo(
    () =>
      props.categories.find(
        (category) =>
          category._id?.toString() === Array.from(selectedCategoryId)[0]
      ),
    [props.categories, selectedCategoryId]
  )

  useEffect(() => {
    switch (props.state.result) {
      case TransactionResult.Ok: {
        props.state.result = TransactionResult.Undefined
        props.onClose()
        break
      }
      case TransactionResult.Error: {
        props.state.result = TransactionResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-blue-500'>Add Transaction</ModalHeader>

      <ModalBody className='mt-6 mb-3'>
        <div className='flex'>
          <div className='text-sm flex-grow flex items-center'>Profile</div>
          <Dropdown
            shouldBlockScroll
            isDisabled={status.pending}>
            <DropdownTrigger>
              <User
                as='button'
                name={selectedProfile?.name}
                description={selectedProfile?.description}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label='Profile Selection Menu'
              disallowEmptySelection
              selectionMode='single'
              selectedKeys={selectedProfileId}
              onSelectionChange={
                setSelectedProfileId as unknown as (keys: any) => void
              }>
              {props.profiles.map((profile) => (
                <DropdownItem
                  variant='flat'
                  textValue={profile.name}
                  key={profile._id?.toString()}>
                  <User
                    name={profile.name}
                    description={profile.description}
                  />
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className='flex'>
          <div className='text-sm flex-grow flex items-center'>Category</div>
          <Dropdown
            shouldBlockScroll
            isDisabled={status.pending}>
            <DropdownTrigger>
              <User
                as='button'
                name={selectedCategory?.name}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label='Category Selection Menu'
              disallowEmptySelection
              selectionMode='single'
              selectedKeys={selectedCategoryId}
              onSelectionChange={
                setSelectedCategoryId as unknown as (keys: any) => void
              }>
              {props.categories.map((category) => (
                <DropdownItem
                  variant='flat'
                  textValue={category.name}
                  key={category._id?.toString()}>
                  <User name={category.name} />
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <input
          name='profile'
          value={selectedProfile?._id?.toString()}
          readOnly
          hidden
        />

        <input
          name='category'
          value={selectedCategory?._id?.toString()}
          readOnly
          hidden
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

        <DatePicker
          name='date'
          label='Date'
          isDisabled={status.pending}
          isRequired
          showMonthAndYearPickers
          placeholderValue={now(getLocalTimeZone())}
          defaultValue={now(getLocalTimeZone())}
        />
      </ModalBody>

      <ModalFooter>
        {props.state.result !== TransactionResult.Undefined && (
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
  state: { result: TransactionResult; message: string }
  transaction: TransactionObject
}) {
  const status = useFormStatus()

  useEffect(() => {
    switch (props.state.result) {
      case TransactionResult.Ok: {
        props.state.result = TransactionResult.Undefined
        props.onClose()
        break
      }
      case TransactionResult.Error: {
        props.state.result = TransactionResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-red-500'>Delete Transaction</ModalHeader>
      <ModalBody className='mt-6 mb-3'>
        <input
          name='_id'
          readOnly
          hidden
          value={props.transaction._id?.toString()}
        />
        <p>
          Are you sure you want to delete{' '}
          {(props.transaction.category as CategoryObject).name} transaction?
        </p>
        <p className='text-xs'>
          (Profile associate with this instance of{' '}
          {(props.transaction.category as CategoryObject).name} transaction will
          also be undone)
        </p>
      </ModalBody>
      <ModalFooter>
        {props.state.result !== TransactionResult.Undefined && (
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
  state: { result: TransactionResult; message: string }
  transaction: TransactionObject
  profiles: ProfileObject[]
  categories: CategoryObject[]
}) {
  const status = useFormStatus()

  const [selectedProfileId, setSelectedProfileId] = useState<Set<string>>(
    new Set([props.transaction.profile._id?.toString() ?? ''])
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<Set<string>>(
    new Set([props.transaction.category._id?.toString() ?? ''])
  )

  const selectedProfile = useMemo(
    () =>
      props.profiles.find(
        (profile) =>
          profile._id?.toString() === Array.from(selectedProfileId)[0]
      ),
    [props.profiles, selectedProfileId]
  )
  const selectedCategory = useMemo(
    () =>
      props.categories.find(
        (category) =>
          category._id?.toString() === Array.from(selectedCategoryId)[0]
      ),
    [props.categories, selectedCategoryId]
  )

  useEffect(() => {
    switch (props.state.result) {
      case TransactionResult.Ok: {
        props.state.result = TransactionResult.Undefined
        props.onClose()
        break
      }
      case TransactionResult.Error: {
        props.state.result = TransactionResult.Undefined
        break
      }
    }
  })

  return (
    <>
      <ModalHeader className='bg-gray-500'>Edit Transcation</ModalHeader>

      <ModalBody className='mt-6 mb-3'>
        <input
          name='_id'
          readOnly
          hidden
          value={props.transaction._id?.toString()}
        />

        <div className='flex'>
          <div className='text-sm flex-grow flex items-center'>Profile</div>
          <Dropdown
            shouldBlockScroll
            isDisabled={status.pending}>
            <DropdownTrigger>
              <User
                as='button'
                name={selectedProfile?.name}
                description={selectedProfile?.description}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label='Profile Selection Menu'
              disallowEmptySelection
              selectionMode='single'
              selectedKeys={selectedProfileId}
              onSelectionChange={
                setSelectedProfileId as unknown as (keys: any) => void
              }>
              {props.profiles.map((profile) => (
                <DropdownItem
                  textValue={profile.name}
                  variant='flat'
                  key={profile._id?.toString()}>
                  <User
                    name={profile.name}
                    description={profile.description}
                  />
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className='flex'>
          <div className='text-sm flex-grow flex items-center'>Category</div>
          <Dropdown
            shouldBlockScroll
            isDisabled={status.pending}>
            <DropdownTrigger>
              <User
                as='button'
                name={selectedCategory?.name}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label='Category Selection Menu'
              disallowEmptySelection
              selectionMode='single'
              selectedKeys={selectedCategoryId}
              onSelectionChange={
                setSelectedCategoryId as unknown as (keys: any) => void
              }>
              {props.categories.map((category) => (
                <DropdownItem
                  variant='flat'
                  textValue={category.name}
                  key={category._id?.toString()}>
                  <User name={category.name} />
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <input
          name='profile'
          value={selectedProfile?._id?.toString()}
          readOnly
          hidden
        />
        <input
          name='category'
          value={selectedCategory?._id?.toString()}
          readOnly
          hidden
        />
        <Input
          type='text'
          name='description'
          label='Description'
          isClearable
          placeholder={props.transaction.description}
          defaultValue={props.transaction.description}
          isDisabled={status.pending}
        />
        <Input
          type='number'
          name='balance'
          label='Balance'
          placeholder={props.transaction.balance.toString()}
          defaultValue={props.transaction.balance.toString()}
          startContent={
            <div className='pointer-events-none flex items-center'>
              <span className='text-default-400 text-small'>Rp</span>
            </div>
          }
          isRequired
          isDisabled={status.pending}
        />
        <DatePicker
          name='date'
          label='Date'
          isDisabled={status.pending}
          isRequired
          showMonthAndYearPickers
          placeholderValue={parseZonedDateTime(props.transaction.date)}
          defaultValue={parseZonedDateTime(props.transaction.date)}
        />
      </ModalBody>

      <ModalFooter>
        {props.state.result !== TransactionResult.Undefined && (
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

export function TransactionsTable(props: {
  profiles: ProfileObject[]
  categories: CategoryObject[]
  transactions: TransactionObject[]
}) {
  const [actionTransaction, setActionTransaction] =
    useState<TransactionObject | null>(null)
  const [filterValue, setFilterValue] = useState('')
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending',
  })
  const modal = {
    add: useDisclosure(),
    delete: useDisclosure(),
    edit: useDisclosure(),
  }
  const form = {
    add: useFormState(addTransaction, {
      result: TransactionResult.Undefined,
      message: '',
    }),
    delete: useFormState(deleteTransaction, {
      result: TransactionResult.Undefined,
      message: '',
    }),
    edit: useFormState(editTransaction, {
      result: TransactionResult.Undefined,
      message: '',
    }),
  }

  const filteredTransactions = useMemo(() => {
    let filteredTransactions = [...props.transactions]
    if (filterValue) {
      const filterValueLowerCase = filterValue.toLowerCase()
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(filterValueLowerCase) ||
          transaction.balance.toString().includes(filterValueLowerCase) ||
          parseZonedDateTime(transaction.date)
            .toDate()
            .toString()
            .toLowerCase()
            .includes(filterValueLowerCase) ||
          (transaction.category as CategoryObject).name
            .toLowerCase()
            .includes(filterValueLowerCase) ||
          (transaction.profile as ProfileObject).name
            .toLowerCase()
            .includes(filterValueLowerCase) ||
          (transaction.profile as ProfileObject).description
            .toLowerCase()
            .includes(filterValueLowerCase)
      )
    }
    return filteredTransactions
  }, [props.transactions, filterValue])

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let first: number
      let second: number
      switch (sortDescriptor.column) {
        case 'profile': {
          if (sortDescriptor.direction === 'ascending') {
          }
          first = (a.profile as ProfileObject).name as unknown as number
          second = (b.profile as ProfileObject).name as unknown as number
          break
        }
        case 'category': {
          first = (a.category as CategoryObject).name as unknown as number
          second = (b.category as CategoryObject).name as unknown as number
          break
        }
        case 'balance': {
          first = a.balance
          second = b.balance
          break
        }
        case 'date': {
          first = parseZonedDateTime(a.date) as unknown as number
          second = parseZonedDateTime(b.date) as unknown as number
          break
        }
        default: {
          return 0
        }
      }
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, filteredTransactions])

  const topContent = useMemo(() => {
    return (
      <div className='flex flex-col gap-4'>
        <div className='flex justify-between gap-3 items-end'>
          <Input
            isClearable
            className='w-full sm:max-w-[44%]'
            placeholder='Search transactions...'
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
            {props.transactions.length > 0 ? (
              <>
                Total {props.transactions.length} transaction
                {props.transactions.length > 1 && <>s</>}.
                {filterValue && (
                  <>
                    {filteredTransactions.length > 0 ? (
                      <>
                        {' '}
                        Found {filteredTransactions.length} transaction
                        {filteredTransactions.length > 1 && <>s</>}.
                      </>
                    ) : (
                      ' No transaction found.'
                    )}
                  </>
                )}
              </>
            ) : (
              'No transaction found.'
            )}
          </span>
        </div>
      </div>
    )
  }, [
    props.transactions.length,
    filterValue,
    setFilterValue,
    filteredTransactions.length,
  ])

  return (
    <>
      <Table
        aria-label='Transactions Table'
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'>
        <TableHeader>
          <TableColumn
            key='profile'
            allowsSorting>
            PROFILE
          </TableColumn>

          <TableColumn
            key='category'
            allowsSorting>
            CATEGORY
          </TableColumn>

          <TableColumn
            key='balance'
            allowsSorting>
            BALANCE
          </TableColumn>

          <TableColumn
            key='date'
            allowsSorting>
            DATE
          </TableColumn>

          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={sortedTransactions}
          emptyContent={'No transaction to display'}>
          {(transaction) => (
            <TableRow key={transaction._id?.toString()}>
              <TableCell>
                <User
                  name={(transaction.profile as ProfileObject).name}
                  description={
                    (transaction.profile as ProfileObject).description
                  }
                  avatarProps={{ radius: 'lg' }}
                />
              </TableCell>

              <TableCell>
                <User
                  name={(transaction.category as CategoryObject).name}
                  description={transaction.description}
                  avatarProps={{ radius: 'lg' }}
                />
              </TableCell>

              <TableCell>
                <Balance balance={transaction.balance} />
              </TableCell>

              <TableCell>
                {parseZonedDateTime(transaction.date).toDate().toString()}
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
                      setActionTransaction(transaction)
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
                      Edit transaction
                    </DropdownItem>

                    <DropdownItem
                      key='delete'
                      color='danger'
                      className='text-danger'
                      startContent={<FaTrash />}>
                      Delete transaction
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
                profiles={props.profiles}
                categories={props.categories}
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
                transaction={actionTransaction!}
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
                transaction={actionTransaction!}
                profiles={props.profiles}
                categories={props.categories}
              />
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
