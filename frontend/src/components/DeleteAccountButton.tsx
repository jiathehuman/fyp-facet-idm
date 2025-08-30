import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@heroui/modal"
import api from "../api"
// @ts-ignore
import { AxiosResponse } from "axios";

const DeleteAccountButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // delete the user accoutn
  const handleDelete = async () => {
    try {
      const res: AxiosResponse = await api.delete("/api/delete-account/");
      navigate("/")
    } catch (err: any) {
      console.error("Error fetching details:", err);
      throw err;
    }
  };

  return (
    <>
      {/* Button that is to be rendered */}
      <Button color="danger" onPress={() => setIsOpen(true)}>
        Delete Account
      </Button>
      {/* Modal that opens when user clicks on the button */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} placement="center">
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Deletion
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete your account? <br />
                  <strong>This action cannot be undone.</strong>
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDelete}>
                  Yes, Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteAccountButton;