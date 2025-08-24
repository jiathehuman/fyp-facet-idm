import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";

import RenderPersonaDetailValue from "@/components/RenderPersonaDetailValue.tsx";
//@ts-ignore

import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import {
  createAPIKey,
  createPersonaDetail,
  deleteAPIKey,
  deletePersonaDetail,
  getAPIKeys,
  getPersona,
  getPersonaDetails,
  getUnassignedPersonaDetails,
} from "@/utils/data";
import { handleError } from "@/utils/utilityFunctions.ts";
import { APIKey, Detail, Persona, PersonaDetail } from "@/types/types";
import { DeleteIcon, PlusIcon } from "@/components/icons.tsx";

export default function PersonaPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [details, setDetails] = useState<PersonaDetail[] | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[] | null>(null);
  const [unassignedDetails, setUnassignedDetails] =
    useState<PersonaDetail[] | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };

  const fetchPersona = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPersona(id);

      data ? setPersona(data) : setPersona(null);
    } catch (err: any) {
      // Check if it is an Axios error
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonaDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPersonaDetails(id);

      data ? setDetails(data) : setDetails(null);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUnassignedPersonaDetails(id);

      data ? setUnassignedDetails(data) : setUnassignedDetails(null);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetail = async (detail: Detail) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();

    formData.append("persona", String(id));
    formData.append("detail", detail.id);
    try {
      await createPersonaDetail(formData);
      await fetchPersonaDetails(String(id));
      await fetchUnassignedDetails(String(id));
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignDetail = async (detail: Detail) => {
    setLoading(true);
    setError(null);
    try {
      await deletePersonaDetail(id, detail.id);
      await fetchPersonaDetails(String(id));
      await fetchUnassignedDetails(String(id));
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const fetchAPIKeys = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAPIKeys(id);

      data ? setApiKeys(data) : setApiKeys(null);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const newKey = await createAPIKey(String(id));

      console.log(newKey);
      await fetchAPIKeys(String(id));
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAPIKey = async (prefix: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteAPIKey(prefix);
      await fetchAPIKeys(String(id));
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPersona(id);
      fetchPersonaDetails(id);
      fetchUnassignedDetails(id);
      fetchUnassignedDetails(id);
      fetchAPIKeys(id);
    }
  }, []);

  return (
    <DefaultLayout>
      <Modal isOpen={isOpen} size={"md"} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Generate API Key
              </ModalHeader>
              <ModalBody>
                <p>
                  Generate an API Key. Only provide this API Key to outside
                  clients you trust. This API Key will grant them access to this
                  persona. Enjoy!
                </p>
                <p>
                  Access persona at: http://127.0.0.1:8000/api/persona/{id} with
                  this key
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={generateAPIKey}>
                  Generate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {loading ? (
        <Spinner />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <div className="inline-block max-w-lg text-center justify-center">
              <h1 className={title()}>
                <span>{persona && persona.key} </span>Persona
              </h1>
              <p>
                Created on:{" "}
                {persona &&
                  new Date(persona.created_at).toLocaleString("en-UK", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
              </p>
            </div>
          </section>
          <section>
            <p className={title({ size: "sm" })}>Assigned Details.</p>
            {details ? (
              <Table aria-label="Assigned details table">
                <TableHeader>
                  <TableColumn>DETAIL NAME</TableColumn>
                  <TableColumn>DETAIL VALUE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {/*@ts-ignore*/}
                  {details.map((detail: Detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        {detail.key
                          .split("_")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </TableCell>
                      <TableCell>
                        <RenderPersonaDetailValue detail={detail} />
                      </TableCell>
                      <TableCell>
                        <Tooltip content="Add detail to persona">
                          <button
                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                            onClick={() => handleUnassignDetail(detail)}
                          >
                            <DeleteIcon />
                          </button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div>
                <p className={subtitle()}>No Unassigned Detail.</p>
              </div>
            )}
          </section>
          <section>
            <p className={title({ size: "sm" })}>API Keys.</p>
            {apiKeys ? (
              <Table aria-label="Assigned details table">
                <TableHeader>
                  <TableColumn>DESCRIPTION</TableColumn>
                  <TableColumn>KEY</TableColumn>
                  <TableColumn>CREATED ON</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey: APIKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>{apiKey.description}</TableCell>
                      <TableCell>{apiKey.api_key}</TableCell>
                      <TableCell>{apiKey.created_at}</TableCell>
                      <TableCell>
                        <Tooltip content="Add detail to persona">
                          <button
                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                            onClick={() => handleDeleteAPIKey(apiKey.prefix)}
                          >
                            <DeleteIcon />
                          </button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div>
                <p className={subtitle()}>Generate API keys.</p>
              </div>
            )}
            <Button onPress={() => handleOpen()}>
              <p>Add API Key</p>
            </Button>
          </section>
          <section>
            <p className={title({ size: "sm" })}>Unassigned Details.</p>
            {unassignedDetails ? (
              <Table aria-label="Unassigned details table">
                <TableHeader>
                  <TableColumn>DETAIL NAME</TableColumn>
                  <TableColumn>DETAIL VALUE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {/*@ts-ignore*/}
                  {unassignedDetails.map((detail: Detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        {detail.key
                          .split("_")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </TableCell>
                      <TableCell>
                        <RenderPersonaDetailValue detail={detail} />
                      </TableCell>
                      <TableCell>
                        <Tooltip content="Add detail to persona">
                          <button
                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                            onClick={() => handleAddDetail(detail)}
                          >
                            <PlusIcon />
                          </button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div>
                <p className={subtitle()}>No Unassigned Detail.</p>
              </div>
            )}
          </section>
        </>
      )}
    </DefaultLayout>
  );
}
