import { title } from "@/components/primitives";
import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Avatar } from "@heroui/avatar";
//@ts-ignore
import { isAxiosError } from "axios";
// Import HeroUI components
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Card, CardHeader, CardBody } from "@heroui/card";
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
} from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";

import { DeleteIcon, EditIcon } from "@/components/icons";
import RenderValueInput from "@/components/RenderValueInput";
import RenderPersonaDetailValue from "@/components/RenderPersonaDetailValue.tsx";
import { Detail, Persona } from "@/types/types";
import {
  getDetails,
  getPersonas,
  createDetail,
  deleteDetail,
  createPersona,
  deletePersona,
  updateDetail,
} from "@/utils/data";
import { handleError } from "@/utils/utilityFunctions.ts";

type DetailValueType = "String" | "Date" | "File" | "Image" | "";

export default function DashboardPage() {
  let navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // States for fetching and displaying existing details/personas
  const [details, setDetails] = useState<Detail[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaKey, setPersonaKey] = useState<string>("");

  // States for setting new detail data
  const [newDetailKey, setNewDetailKey] = useState<string>("");
  const [newDetailValueType, setNewDetailValueType] =
    useState<DetailValueType>("");
  const [newDetailString, setNewDetailString] = useState<string>("");
  const [newDetailDate, setNewDetailDate] = useState<string>("");
  const [newDetailFile, setNewDetailFile] = useState<File | null>(null);
  const [newDetailImage, setNewDetailImage] = useState<File | null>(null);

  // States for editing a detail
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingDetail, setEditingDetail] = useState<Detail | null>(null);
  const [editDetailKey, setEditDetailKey] = useState<string>("");
  const [editDetailValueType, setEditDetailValueType] =
    useState<DetailValueType>("");
  const [editDetailString, setEditDetailString] = useState<string>("");
  const [editDetailDate, setEditDetailDate] = useState<string>("");
  const [editDetailFile, setEditDetailFile] = useState<File | null>(null);
  const [editDetailImage, setEditDetailImage] = useState<File | null>(null);

  // State for profileImage
  const [profileImageUrl, setProfileImageUrl] = useState<
    string | null | undefined
  >("");

  // State for name of user
  const [name, setName] = useState<string | null | undefined>("");

  // Fetch existing Details related to user
  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDetails();
      console.log("In fetchDetails Home.tsx", data);
      data ? setDetails(data) : setDetails([]);
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing Personas related to user
  const fetchPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPersonas();
      data ? setPersonas(data) : setPersonas([]); // if personas, set personas
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = () => {
    const profilePictureDetail = details.find(
      (detail) =>
        detail.key.toLowerCase() === "profile_picture" &&
        detail.value_type.toLowerCase() === "image",
    );
    const profileImageUrl = profilePictureDetail?.image_value;

    setProfileImageUrl(profileImageUrl);

    const nameDetail = details.find(
      (detail) =>
        detail.key.toLowerCase() === "name" &&
        detail.value_type.toLowerCase() === "string",
    );

    const name = nameDetail?.string_value;

    setName(name);
  };


  useEffect(() => {
    fetchDetails();
    fetchPersonas();
  }, []);


  useEffect(() => {
    fetchProfile();
  }, [details]);

  const handleCreatePersonaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("key", personaKey);

    try {
      await createPersona(formData);
      await fetchPersonas();
      setPersonaKey("");
    } catch (err: any) {
      if (isAxiosError(err)) {
        handleError(err, setError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for creating a new detail
  const handleCreateDetailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();

    formData.append("key", newDetailKey);
    formData.append("value_type", newDetailValueType.toLowerCase());

    // Conditionally append based on selected type and value existence
    if (newDetailValueType.toLowerCase() === "string" && newDetailString) {
      formData.append("string_value", newDetailString);
    }
    if (newDetailValueType.toLowerCase() === "date" && newDetailDate) {
      formData.append("date_value", newDetailDate);
    }
    if (newDetailValueType.toLowerCase() === "file" && newDetailFile) {
      formData.append("file_value", newDetailFile);
    }
    if (newDetailValueType.toLowerCase() === "image" && newDetailImage) {
      formData.append("image_value", newDetailImage);
    }

    try {
      await createDetail(formData);
      await fetchDetails();
      // Clear form fields
      setNewDetailKey("");
      setNewDetailValueType("");
      setNewDetailString("");
      setNewDetailDate("");
      setNewDetailFile(null);
      setNewDetailImage(null);
    } catch (err: any) {
      if (isAxiosError(err)) {
        handleError(err, setError);
      }
    } finally {
      setLoading(false);
    }
  };

  // When editing
  const handleEditClick = (detail: Detail) => {
    setEditingDetail(detail);
    setEditDetailKey(detail.key);
    setEditDetailValueType(detail.value_type as DetailValueType);
    setEditDetailString(detail.string_value || "");
    setEditDetailDate(detail.date_value || "");
    setEditDetailFile(null);
    setEditDetailImage(null);
    setIsEditModalOpen(true);
  };

  // Close the edit modal
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingDetail(null); // clear when close
    setError(null); // clear errors when close
  };

  const handleUpdateDetailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDetail) return;
    setError(null);
    setLoading(true);
    const formData = new FormData();

    formData.append("key", editDetailKey); // get editDetailKey to append to FormData
    formData.append("value_type", editDetailValueType.toLowerCase()); // convert to lowercase for backend

    // Append value based on  the value type
    if (editDetailValueType.toLowerCase() === "string") {
      formData.append("string_value", editDetailString);
    } else if (editDetailValueType.toLowerCase() === "date") {
      formData.append("date_value", editDetailDate);
    } else if (editDetailValueType.toLowerCase() === "file") {
      if (editDetailFile) {
        formData.append("file_value", editDetailFile);
      }
    } else if (editDetailValueType.toLowerCase() === "image") {
      if (editDetailImage) {
        formData.append("image_value", editDetailImage);
      }
    }

    try {
      await updateDetail(editingDetail.id, formData);
      await fetchDetails(); // since detail updated, fetch details again
      handleEditModalClose(); // close the modal
    } catch (err: any) {
      if (isAxiosError(err)) {
        handleError(err, setError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle a delete of the detail
  const handleDeleteClick = async (detailId: string) => {
    if (!window.confirm("Are you sure you want to delete this detail?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteDetail(detailId);
      console.log("Detail deleted successfully!");
      await fetchDetails(); // Refresh the list
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Handle the delete of a persona
  const handlePersonaDeleteClick = async (personaId: string) => {
    if (!window.confirm("Are you sure you want to delete this persona?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deletePersona(personaId);
      console.log("Persona deleted successfully!");
      await fetchPersonas(); // Refresh the list
    } catch (err: any) {
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      {/* <h1 className="text-3xl font-bold mb-6">Dashboard</h1> */}
      <h1 className={title()}>Dashboard</h1>

      {/* Profile image and name section */}
      <div className="mb-8 flex flex-col items-center">
        {/* Profile Image */}
        {profileImageUrl ? (
          <Avatar
            isBordered
            className="w-20 h-20 text-large mb-4"
            color="default"
            size="lg"
            src={profileImageUrl}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        {/* Name */}
        {name ? <p className="text-l">{name}</p> : <p>-</p>}
      </div>
      {/* End of Profile image section */}

      <hr className="my-8" />

      <div className="flex gap-3">
        {/* Form to create New Details */}
        <Card className="flex w-1/2 mb-8 items-center  p-5">
          <CardHeader className=" gap-3 flex-col items-start">
            <p className="text-md">Add a new detail</p>
          </CardHeader>
          <CardBody>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <Form
              className="w-full justify-center items-start space-y-4"
              onSubmit={handleCreateDetailSubmit}
            >

              <Input
                isRequired
                label="Detail Key"
                placeholder="e.g., Phone Number, Graduation Date"
                type="text"
                value={newDetailKey}
                onChange={(e) => setNewDetailKey(e.target.value)}
              />

              <Select
                isRequired
                label="Value type"
                placeholder="Select a value type"
                value={newDetailValueType}
                variant={"flat"}
                onChange={(e) =>
                  setNewDetailValueType(e.target.value as DetailValueType)
                }
              >
                <SelectItem key="String">String value</SelectItem>
                <SelectItem key="Date">Date value</SelectItem>
                <SelectItem key="File">File value</SelectItem>
                <SelectItem key="Image">Image value</SelectItem>
              </Select>

              <RenderValueInput
                detailDate={newDetailDate}
                detailFile={newDetailFile}
                detailImage={newDetailImage}
                detailString={newDetailString}
                detailValueType={newDetailValueType}
                setDetailDate={setNewDetailDate}
                setDetailFile={setNewDetailFile}
                setDetailImage={setNewDetailImage}
                setDetailString={setNewDetailString}
              />
              <Button type="submit" variant="bordered">
                Create Detail
              </Button>
            </Form>
          </CardBody>
        </Card>

        <Card className="flex w-1/2 mb-8 items-center  p-5">
          <CardHeader className=" gap-3 flex-col items-start">
            <p className="text-md">Add a new persona</p>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleCreatePersonaSubmit}>
              <Input
                isRequired
                label="Persona Title"
                placeholder="Eg. Social, Professional"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonaKey(e.target.value)
                }
                type="text"
                value={personaKey}
              />
              <Button type="submit" variant="bordered">
                Create Persona
              </Button>
            </Form>
          </CardBody>
        </Card>
      </div>

      <hr className="my-8" />
      <h3 className={title({size:"sm"})}>Details</h3>
      <Table aria-label="Details table">
        <TableHeader>
          <TableColumn>DETAIL NAME</TableColumn>
          <TableColumn>DETAIL VALUE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {details.map((detail) => (
            <TableRow key={detail.id}>
              <TableCell>
                {detail.key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </TableCell>
              <TableCell>
                <RenderPersonaDetailValue detail={detail}/>
              </TableCell>
              <TableCell className="relative flex items-center gap-3">
                <>
                  <Tooltip content="Edit detail">
                    <button
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      onClick={() => handleEditClick(detail)}
                    >
                      <EditIcon />
                    </button>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete detail">
                    <button
                      className="text-lg text-default-400 cursor-pointer"
                      onClick={() => handleDeleteClick(detail.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </Tooltip>
                </>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <hr className="my-8" />

      <h3 className={title({size:"sm"})}>Personas</h3>
      <Table aria-label="Your personas table">
        <TableHeader>
          <TableColumn>PERSONA</TableColumn>
          <TableColumn>CREATED AT</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {personas.map((persona) => (
            <TableRow key={persona.id}>
              <TableCell>{persona.key}</TableCell>
              <TableCell>
                {new Date(persona.created_at).toLocaleString("en-UK", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </TableCell>
              <TableCell className="relative flex items-center gap-3">
                <>
                  <Tooltip content="Edit persona">
                    <button
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      onClick={() => navigate(`/persona/${persona.id}/`)}
                    >
                      <EditIcon />
                    </button>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete persona">
                    <button
                      className="text-lg text-default-400 cursor-pointer"
                      onClick={() => handlePersonaDeleteClick(persona.id)}
                    >
                      <DeleteIcon />
                    </button>
                  </Tooltip>
                </>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={isEditModalOpen}
        placement="center"
        onClose={handleEditModalClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Detail: {editingDetail?.key}
              </ModalHeader>
              <ModalBody>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <Form className="space-y-4" onSubmit={handleUpdateDetailSubmit}>
                  <label
                    className="form-control w-full max-w-xs"
                    htmlFor="detailKeyInput"
                  >
                    <span className="label-text">Detail Key</span>
                    <Input
                      isDisabled
                      isRequired
                      id="DetailKeyInput"
                      type="text"
                      variant="flat"
                      value={editDetailKey}
                      className="w-full max-w-xs"
                    />
                  </label>

                  {editingDetail && (
                    <RenderValueInput
                      detailDate={editDetailDate}
                      detailFile={editDetailFile}
                      detailImage={editDetailImage}
                      detailString={editDetailString}
                      detailValueType={editDetailValueType}
                      setDetailDate={setEditDetailDate}
                      setDetailFile={setEditDetailFile}
                      setDetailImage={setEditDetailImage}
                      setDetailString={setEditDetailString}
                    />
                  )}
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
