"use client";

import {
  addCategory,
  deleteCategory,
  editCategory,
} from "@/actions/categories/action";
import { ActionResult, ActionState } from "@/actions/types";
import { Balance } from "@/components/balance";
import { CategoryObject } from "@/models/category";
import { TransactionObject } from "@/models/transaction";
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
} from "@nextui-org/react";
import { Types } from "mongoose";
import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FaPlus, FaSearch } from "react-icons/fa";
import { FaEllipsisVertical, FaPencil, FaTrash } from "react-icons/fa6";

function AddFormContent(props: { state: ActionState; onClose: () => void }) {
  const status = useFormStatus();

  useEffect(() => {
    if (props.state.error === null) {
      props.onClose();
    }
  }, [props.state.error]);

  return (
    <>
      <ModalHeader className="bg-blue-500">Add Category</ModalHeader>

      <ModalBody className="mt-6 mb-3">
        <Input
          isDisabled={status.pending}
          isRequired
          type="text"
          name="name"
          label="Name"
          minLength={1}
          maxLength={64}
        />
      </ModalBody>

      <ModalFooter>
        <span className="text-danger text-xs">
          {props.state.error?.message}
        </span>

        <Button
          isDisabled={status.pending}
          variant="ghost"
          onPress={props.onClose}
        >
          Cancel
        </Button>

        <Button
          isLoading={status.pending}
          type="submit"
          variant={status.pending ? "faded" : "ghost"}
          color="primary"
        >
          Create
        </Button>
      </ModalFooter>
    </>
  );
}

function AddForm(props: { onClose: () => void }) {
  const [state, action] = useFormState(addCategory, ActionResult.state());
  return (
    <form action={action}>
      <AddFormContent state={state} onClose={props.onClose} />
    </form>
  );
}

function DeleteFormContent(props: {
  state: ActionState;
  category: CategoryObject;
  onClose: () => void;
}) {
  const status = useFormStatus();

  useEffect(() => {
    if (props.state.error === null) {
      props.onClose();
    }
  }, [props.state.error]);

  return (
    <>
      <ModalHeader className="bg-red-500">Delete Category</ModalHeader>

      <ModalBody className="mt-6 mb-3">
        <input
          readOnly
          hidden
          name="_id"
          value={props.category._id.toString()}
        />

        <p>Are you sure you want to delete {props.category.name}?</p>

        <p className="text-xs">
          (Every transactions associate with {props.category.name} will also be
          deleted)
        </p>
      </ModalBody>

      <ModalFooter>
        <span className="text-danger text-xs">
          {props.state.error?.message}
        </span>

        <Button
          isDisabled={status.pending}
          variant="ghost"
          onPress={props.onClose}
        >
          Cancel
        </Button>

        <Button
          isLoading={status.pending}
          type="submit"
          variant={status.pending ? "faded" : "ghost"}
          color="danger"
        >
          Delete
        </Button>
      </ModalFooter>
    </>
  );
}

function DeleteForm(props: { category: CategoryObject; onClose: () => void }) {
  const [state, action] = useFormState(deleteCategory, ActionResult.state());
  return (
    <form action={action}>
      <DeleteFormContent
        state={state}
        category={props.category}
        onClose={props.onClose}
      />
    </form>
  );
}

function EditFormContent(props: {
  state: ActionState;
  category: CategoryObject;
  onClose: () => void;
}) {
  const status = useFormStatus();

  useEffect(() => {
    if (props.state.error === null) {
      props.onClose();
    }
  }, [props.state.error]);

  return (
    <>
      <ModalHeader className="bg-gray-500">Edit Category</ModalHeader>

      <ModalBody className="mt-6 mb-3">
        <input
          readOnly
          hidden
          name="_id"
          value={props.category._id.toString()}
        />

        <Input
          isDisabled={status.pending}
          isRequired
          type="text"
          name="name"
          label="Name"
          placeholder={props.category.name}
          defaultValue={props.category.name}
          minLength={1}
          maxLength={64}
        />
      </ModalBody>

      <ModalFooter>
        <span className="text-danger text-xs">
          {props.state.error?.message}
        </span>

        <Button
          isDisabled={status.pending}
          variant="ghost"
          onPress={props.onClose}
        >
          Cancel
        </Button>

        <Button
          isLoading={status.pending}
          type="submit"
          variant={status.pending ? "faded" : "ghost"}
          color="warning"
        >
          Edit
        </Button>
      </ModalFooter>
    </>
  );
}

function EditForm(props: { category: CategoryObject; onClose: () => void }) {
  const [state, action] = useFormState(editCategory, ActionResult.state());
  return (
    <form action={action}>
      <EditFormContent
        state={state}
        category={props.category}
        onClose={props.onClose}
      />
    </form>
  );
}

export function CategoriesTable(props: {
  categories: CategoryObject[];
  transactions: TransactionObject[];
}) {
  const [actionCategory, setActionCategory] = useState(props.categories.at(0));
  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "descending",
  });

  const modal = {
    add: useDisclosure(),
    delete: useDisclosure(),
    edit: useDisclosure(),
  };

  const categoriesBalance = useMemo(() => {
    const map = new Map<Types.ObjectId, number>();
    props.categories.forEach((category) => {
      map.set(category._id, 0);
    });
    props.transactions.forEach((transaction) => {
      let balance = map.get(transaction.category._id);
      if (balance !== undefined) {
        balance += transaction.balance;
        map.set(transaction.category._id, balance);
      }
    });
    return map;
  }, [props.categories, props.transactions]);

  const filteredCategories = useMemo(() => {
    let filteredCategories = [...props.categories];
    if (filterValue) {
      const filterValueLowerCase = filterValue.toLowerCase();
      filteredCategories = filteredCategories.filter(
        (category) =>
          (category.name.toLowerCase().includes(filterValueLowerCase) ||
            categoriesBalance.get(category._id)) ??
          "0".toString().includes(filterValueLowerCase),
      );
    }
    return filteredCategories;
  }, [props.categories, filterValue, categoriesBalance]);

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      let first: number;
      let second: number;
      switch (sortDescriptor.column) {
        case "name": {
          first = a.name as unknown as number;
          second = b.name as unknown as number;
          break;
        }
        case "transactions": {
          first = categoriesBalance.get(a._id) ?? 0;
          second = categoriesBalance.get(b._id) ?? 0;
          break;
        }
        default:
          return 0;
      }
      const cmp = first > second ? -1 : first < second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredCategories, categoriesBalance]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            startContent={<FaSearch />}
            value={filterValue}
            placeholder="Search categories..."
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />

          <div className="flex gap-3">
            <Button
              color="primary"
              endContent={<FaPlus />}
              onPress={modal.add.onOpen}
            >
              Add New
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {props.categories.length > 0 ? (
              <>
                Total {props.categories.length} categor
                {props.categories.length > 1 ? "ies" : "y"}.
                {filterValue && (
                  <>
                    {filteredCategories.length > 0 ? (
                      <>
                        {" "}
                        Found {filteredCategories.length} categor
                        {filteredCategories.length > 1 ? "ies" : "y"}.
                      </>
                    ) : (
                      " No category found."
                    )}
                  </>
                )}
              </>
            ) : (
              "No category found."
            )}
          </span>
        </div>
      </div>
    );
  }, [
    props.categories.length,
    filterValue,
    setFilterValue,
    filteredCategories.length,
  ]);

  return (
    <>
      <Table
        aria-label="Categories Table"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          <TableColumn key="name" allowsSorting>
            NAME
          </TableColumn>

          <TableColumn key="transactions" allowsSorting>
            TRANSACTIONS
          </TableColumn>

          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={sortedCategories}
          emptyContent={"No category to display"}
        >
          {(category) => (
            <TableRow key={category._id.toString()}>
              <TableCell>
                <User name={category.name} avatarProps={{ radius: "lg" }} />
              </TableCell>

              <TableCell>
                <Balance balance={categoriesBalance.get(category._id) ?? 0} />
              </TableCell>

              <TableCell>
                <Dropdown backdrop="blur">
                  <DropdownTrigger>
                    <Button variant="light" isIconOnly>
                      <FaEllipsisVertical />
                    </Button>
                  </DropdownTrigger>

                  <DropdownMenu
                    aria-label="Actions Menu"
                    onAction={(key) => {
                      setActionCategory(category);
                      switch (key) {
                        case "delete": {
                          modal.delete.onOpen();
                          break;
                        }
                        case "edit": {
                          modal.edit.onOpen();
                          break;
                        }
                      }
                    }}
                  >
                    <DropdownItem key="edit" startContent={<FaPencil />}>
                      Edit category
                    </DropdownItem>

                    <DropdownItem
                      key="delete"
                      color="danger"
                      className="text-danger"
                      startContent={<FaTrash />}
                    >
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
        isOpen={modal.add.isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        hideCloseButton
        backdrop="blur"
        onOpenChange={modal.add.onOpenChange}
      >
        <ModalContent>
          {(onClose) => <AddForm onClose={onClose} />}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal.delete.isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        hideCloseButton
        backdrop="blur"
        onOpenChange={modal.delete.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <DeleteForm category={actionCategory!} onClose={onClose} />
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={modal.edit.isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        hideCloseButton
        backdrop="blur"
        onOpenChange={modal.edit.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <EditForm category={actionCategory!} onClose={onClose} />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
