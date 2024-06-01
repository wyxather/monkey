"use client";

import { register } from "@/actions/auth/register/action";
import { ActionResult, ActionState } from "@/actions/types";
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
} from "@nextui-org/react";
import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";

function RegisterFormContent(props: { state: ActionState }) {
  const status = useFormStatus();
  const modal = useDisclosure();

  useEffect(() => {
    if (props.state.error) {
      modal.onOpen();
    }
  }, [props.state.error]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <Input
          isDisabled={status.pending}
          isRequired
          type="text"
          name="username"
          label="Username"
          minLength={1}
          maxLength={64}
        />
        <Input
          isDisabled={status.pending}
          isRequired
          type="password"
          name="password"
          label="Password"
          minLength={8}
          maxLength={64}
        />
        <Input
          isDisabled={status.pending}
          isRequired
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          minLength={8}
          maxLength={64}
        />
        <div className="flex justify-end gap-4">
          <Link
            isDisabled={status.pending}
            showAnchorIcon
            href="/auth/login"
            underline="always"
          >
            Already have an account? login here
          </Link>
          <Button
            isLoading={status.pending}
            type="submit"
            variant={!status.pending ? "flat" : "faded"}
            color="primary"
          >
            Register
          </Button>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        hideCloseButton
        placement="center"
        backdrop="blur"
        onOpenChange={modal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-red-500">Error</ModalHeader>
              <ModalBody className="mt-6 mb-3">
                {props.state.error?.message}
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={() => onClose()}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export function RegisterForm() {
  const ref = useRef<HTMLFormElement>(null);
  const state = useFormState(register, ActionResult.state());
  return (
    <form
      ref={ref}
      action={(data: FormData) => {
        state[1](data);
        ref.current?.reset();
      }}
    >
      <RegisterFormContent state={state[0]} />
    </form>
  );
}
