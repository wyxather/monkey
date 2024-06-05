"use client";

import {
  addProfile,
  deleteProfile,
  editProfile,
} from "@/actions/profiles/action";
import { ActionResult, ActionState } from "@/actions/types";
import { Balance } from "@/components/balance";
import { ProfileObject } from "@/models/profile";
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
      <ModalHeader className="bg-blue-500">Add Profile</ModalHeader>

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

        <Input
          isDisabled={status.pending}
          type="text"
          name="description"
          label="Description"
          maxLength={64}
        />

        <Input
          isDisabled={status.pending}
          isRequired
          type="number"
          name="balance"
          label="Balance"
          placeholder="0.00"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">Rp</span>
            </div>
          }
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
          variant={status.pending ? "faded" : "ghost"}
          color="primary"
          type="submit"
        >
          Create
        </Button>
      </ModalFooter>
    </>
  );
}

function AddForm(props: { onClose: () => void }) {
  const [state, action] = useFormState(addProfile, ActionResult.state());
  return (
    <form action={action}>
      <AddFormContent state={state} onClose={props.onClose} />
    </form>
  );
}

function DeleteFormContent(props: {
  state: ActionState;
  profile: ProfileObject;
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
      <ModalHeader className="bg-red-500">Delete Profile</ModalHeader>

      <ModalBody className="mt-6 mb-3">
        <input
          readOnly
          hidden
          name="_id"
          value={props.profile._id.toString()}
        />

        <p>Are you sure you want to delete {props.profile.name}?</p>

        <p className="text-xs">
          (Every transactions associate with {props.profile.name} will also be
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
          variant={status.pending ? "faded" : "ghost"}
          color="danger"
          type="submit"
        >
          Delete
        </Button>
      </ModalFooter>
    </>
  );
}

function DeleteForm(props: { profile: ProfileObject; onClose: () => void }) {
  const [state, action] = useFormState(deleteProfile, ActionResult.state());
  return (
    <form action={action}>
      <DeleteFormContent
        state={state}
        profile={props.profile}
        onClose={props.onClose}
      />
    </form>
  );
}

function EditFormContent(props: {
  state: ActionState;
  profile: ProfileObject;
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
      <ModalHeader className="bg-gray-500">Edit Profile</ModalHeader>

      <ModalBody className="mt-6 mb-3">
        <input
          readOnly
          hidden
          name="_id"
          value={props.profile._id.toString()}
        />

        <Input
          isDisabled={status.pending}
          isRequired
          type="text"
          name="name"
          label="Name"
          placeholder={props.profile.name}
          defaultValue={props.profile.name}
          minLength={1}
          maxLength={64}
        />

        <Input
          isDisabled={status.pending}
          isClearable
          type="text"
          name="description"
          label="Description"
          placeholder={props.profile.description}
          defaultValue={props.profile.description}
          maxLength={64}
        />

        <Input
          isDisabled={status.pending}
          isRequired
          type="number"
          name="balance"
          label="Balance"
          placeholder={props.profile.balance.toString()}
          defaultValue={props.profile.balance.toString()}
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">Rp</span>
            </div>
          }
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
          variant={status.pending ? "faded" : "ghost"}
          color="warning"
          type="submit"
        >
          Edit
        </Button>
      </ModalFooter>
    </>
  );
}

function EditForm(props: { profile: ProfileObject; onClose: () => void }) {
  const [state, action] = useFormState(editProfile, ActionResult.state());
  return (
    <form action={action}>
      <EditFormContent
        state={state}
        profile={props.profile}
        onClose={props.onClose}
      />
    </form>
  );
}

export function ProfilesTable(props: { profiles: ProfileObject[] }) {
  const [actionProfile, setActionProfile] = useState(props.profiles.at(0));
  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "profile",
    direction: "descending",
  });

  const modal = {
    add: useDisclosure(),
    delete: useDisclosure(),
    edit: useDisclosure(),
  };

  const filteredProfiles = useMemo(() => {
    let filteredProfiles = [...props.profiles];
    if (filterValue) {
      const filterValueLowerCase = filterValue.toLowerCase();
      filteredProfiles = filteredProfiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(filterValueLowerCase) ||
          profile.description.toLowerCase().includes(filterValueLowerCase) ||
          profile.balance.toString().includes(filterValueLowerCase),
      );
    }
    return filteredProfiles;
  }, [props.profiles, filterValue]);

  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      let first: number;
      let second: number;
      switch (sortDescriptor.column) {
        case "profile": {
          first = a.name as unknown as number;
          second = b.name as unknown as number;
          break;
        }
        case "balance": {
          first = a.balance;
          second = b.balance;
          break;
        }
        default: {
          return 0;
        }
      }
      const cmp = first > second ? -1 : first < second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredProfiles]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            startContent={<FaSearch />}
            value={filterValue}
            placeholder="Search profiles..."
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
            {props.profiles.length > 0 ? (
              <>
                Total {props.profiles.length} profile
                {props.profiles.length > 1 && "s"}.
                {filterValue && (
                  <>
                    {filteredProfiles.length > 0 ? (
                      <>
                        {" "}
                        Found {filteredProfiles.length} profile
                        {filteredProfiles.length > 1 && "s"}.
                      </>
                    ) : (
                      " No profile found."
                    )}
                  </>
                )}
              </>
            ) : (
              "No profile found."
            )}
          </span>
        </div>
      </div>
    );
  }, [
    props.profiles.length,
    filterValue,
    setFilterValue,
    filteredProfiles.length,
  ]);

  return (
    <>
      <Table
        isCompact
        isHeaderSticky
        aria-label="Profiles Table"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader>
          <TableColumn key="profile" allowsSorting>
            PROFILE
          </TableColumn>

          <TableColumn key="balance" allowsSorting>
            BALANCE
          </TableColumn>

          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={sortedProfiles}
          emptyContent={"No profile to display"}
        >
          {(profile) => (
            <TableRow key={profile._id.toString()}>
              <TableCell>
                <User
                  name={profile.name}
                  description={profile.description}
                  avatarProps={{ radius: "lg" }}
                />
              </TableCell>

              <TableCell>
                <Balance balance={profile.balance} />
              </TableCell>

              <TableCell>
                <Dropdown backdrop="blur">
                  <DropdownTrigger>
                    <Button isIconOnly variant="light">
                      <FaEllipsisVertical />
                    </Button>
                  </DropdownTrigger>

                  <DropdownMenu
                    aria-label="Actions Menu"
                    onAction={(key) => {
                      setActionProfile(profile);
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
                      Edit profile
                    </DropdownItem>

                    <DropdownItem
                      key="delete"
                      color="danger"
                      className="text-danger"
                      startContent={<FaTrash />}
                    >
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
            <DeleteForm profile={actionProfile!} onClose={onClose} />
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
          {(onClose) => <EditForm profile={actionProfile!} onClose={onClose} />}
        </ModalContent>
      </Modal>
    </>
  );
}
