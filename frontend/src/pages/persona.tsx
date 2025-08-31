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
// @ts-ignore
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
  const personaId = String(id || "");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [persona, setPersona] = useState<Persona | null>(null);
  const [details, setDetails] = useState<PersonaDetail[] | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[] | null>(null);
  const [unassignedDetails, setUnassignedDetails] = useState<PersonaDetail[] | null>(null);

  // newly generated raw key (only shown once)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState<"Copy" | "Copied!">("Copy");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // ---------- Fetchers ----------
  const fetchPersona = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPersona(pid);
      console.log(data)
      setPersona(data ?? null);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonaDetails = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPersonaDetails(pid);
      setDetails(data ?? null);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedDetails = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUnassignedPersonaDetails(pid);
      setUnassignedDetails(data ?? null);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const fetchAPIKeys = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAPIKeys(pid);
      setApiKeys(data ?? null);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Mutations ----------
  const handleAddDetail = async (detail: Detail) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("persona", personaId);
      formData.append("detail", detail.id);
      await createPersonaDetail(formData);
      await fetchPersonaDetails(personaId);
      await fetchUnassignedDetails(personaId);
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
      await deletePersonaDetail(personaId, detail.id);
      await fetchPersonaDetails(personaId);
      await fetchUnassignedDetails(personaId);
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
      // Accept any shape; your console showed res.data.api_key
      const newKey: any = await createAPIKey(personaId);

      const raw =
        (newKey && (newKey.api_key || newKey.key || newKey.token || null)) ?? null;

      if (raw) {
        setGeneratedKey(raw); // flips modal content to show/copy the key
        setCopyLabel("Copy");
      } else {
        console.error("Create API key response missing raw key:", newKey);
        setGeneratedKey(null);
        setError(
          "Backend did not return the raw API key. Ensure the create endpoint includes `api_key` (or `key`) once."
        );
      }

      // Refresh table (lists only prefixes & metadata)
      await fetchAPIKeys(personaId);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const copyKey = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 1500);
    } catch {
      setCopyLabel("Copy");
    }
  };

  const handleDeleteAPIKey = async (prefix: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteAPIKey(prefix);
      await fetchAPIKeys(personaId);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // @ts-ignore
  const ExportCSV = ({ data, fileName = "data.csv" }) => {
  const downloadCSV = () => {
    const headers = Object.keys(data[0]).join(","); // get column headers
    // @ts-ignore
    const rows = data.map(row => Object.values(row).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    link.click();
  };

  return <Button onPress={downloadCSV}>Download CSV</Button>
};


// @ts-ignore
const ExportJSON = ({ data, fileName = "data.json" }) => {
  const downloadJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2); // pretty print
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    link.click();
  };

  return <Button onPress={downloadJSON}>Download JSON</Button>;
};

  // ---------- Effects ----------
  useEffect(() => {
    if (!id) return;
    fetchPersona(personaId);
    fetchPersonaDetails(personaId);
    fetchUnassignedDetails(personaId);
    fetchAPIKeys(personaId);
  }, [id]);

  return (
    <DefaultLayout>
      {/* Generate API Key Modal */}
      <Modal isOpen={isOpen} size="md" onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {generatedKey ? "Your new API Key" : "Generate API Key"}
              </ModalHeader>

              <ModalBody className="space-y-3">
                {!generatedKey ? (
                  <>
                    <p>
                      Generate an API Key. Only share this API key with trusted clients.
                      It grants access to this persona.
                    </p>
                    <p>
                      Access persona at:
                      <code>http://127.0.0.1:8000/api/persona/{id}</code> using this key.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">
                      This key is shown <strong>only once</strong>. Store it securely now.
                    </p>
                    <div className="rounded-md border p-3 font-mono text-sm break-all">
                      {generatedKey}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onPress={copyKey}>
                        {copyLabel}
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setGeneratedKey(null)}
                      >
                        Hide key
                      </Button>
                    </div>
                  </>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setGeneratedKey(null);
                    onClose();
                  }}
                >
                  Close
                </Button>
                {!generatedKey && (
                  <Button color="primary" onPress={generateAPIKey}>
                    Generate
                  </Button>
                )}
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
          {/* Header */}
          <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <div className="inline-block max-w-lg text-center justify-center">
              <h1 className={`${title()} mt-3`}>{persona?.key} Persona</h1>
              <p>
                Created on:{" "}
                {persona &&
                  new Date(persona.created_at).toLocaleString("en-GB", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
              </p>
            </div>
          </section>

          {/* Assigned Details */}
          <section className="pb-10">
            <p className={title({ size: "sm" })}>Assigned Details.</p>
            {details && details.length > 0 ? (
              <Table aria-label="Assigned details table">
                <TableHeader>
                  <TableColumn>DETAIL NAME</TableColumn>
                  <TableColumn>DETAIL VALUE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {/* @ts-ignore */}
                  {details.map((detail: Detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        {detail.key
                          .split("_")
                          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </TableCell>
                      <TableCell>
                        <RenderPersonaDetailValue detail={detail} />
                      </TableCell>
                      <TableCell>
                        <Tooltip content="Remove detail from persona">
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
                <p className={subtitle()}>No Assigned Details.</p>
              </div>
            )}
          </section>

          {/* API Keys */}
          <section className="pb-10">
            <p className={title({ size: "sm" })}>API Keys.</p>
            {apiKeys && apiKeys.length > 0 ? (
              <Table aria-label="API keys table">
                <TableHeader>
                  <TableColumn>DESCRIPTION</TableColumn>
                  <TableColumn>KEY PREFIX</TableColumn>
                  <TableColumn>CREATED ON</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey: APIKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>{apiKey.description}</TableCell>
                      <TableCell>{apiKey.prefix}</TableCell>
                      <TableCell>
                        {new Date(apiKey.created_at).toLocaleString("en-GB", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <Tooltip content="Delete API key">
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
                <p className={subtitle()}>
                  No API Keys. Generate one to share with a client.
                </p>
              </div>
            )}
            <Button onPress={onOpen} className="mt-5">
              <p>Add API Key</p>
            </Button>
          </section>

          {/* Unassigned Details */}
          <section>
            <p className={title({ size: "sm" })}>Unassigned Details.</p>
            {unassignedDetails && unassignedDetails.length > 0 ? (
              <Table aria-label="Unassigned details table">
                <TableHeader>
                  <TableColumn>DETAIL NAME</TableColumn>
                  <TableColumn>DETAIL VALUE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {/* @ts-ignore */}
                  {unassignedDetails.map((detail: Detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        {detail.key
                          .split("_")
                          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
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
                <p className={subtitle()}>No Unassigned Details.</p>
              </div>
            )}
          </section>
          <div className="flex gap-3 my-5">
            <ExportJSON data={details}/>
            <ExportCSV data={details}/>
          </div>
        </>
      )}
    </DefaultLayout>
  );
}
