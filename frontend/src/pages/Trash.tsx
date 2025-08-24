// import { title } from "@/components/primitives";
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from "react-router";
// import DefaultLayout from "@/layouts/default";
// import axios, { AxiosError } from 'axios';
// import RenderValueInput from "@/components/RenderValueInput";
//
// import {
//     getDetails,
//     createDetail,
//     deleteDetail,
//     updateDetail,
//     getPersonas,
//     createPersona,
//     deletePersona,
//     updatePersona,
//     handleLogout
// } from '../utils/data';
// import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
// import { Button } from "@heroui/button";
// import { Input } from "@heroui/input"
// import { Form } from "@heroui/form";
// import { Select, SelectSection, SelectItem } from "@heroui/select";
// import { Detail, Persona, RenderValueInputProps } from '../types';
//
//
//
// export default function DashboardPage() {
//     let navigate = useNavigate();
//     const [details, setDetails] = useState<Detail[]>([]);
//     const [personas, setPersonas] = useState<Persona[]>([]);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//
//     const [detailKey, setDetailKey] = useState('');
//     const [detailValueType, setDetailValueType] = useState<string>('String');
//     const [detailString, setDetailString] = useState<string | null>('');
//     const [detailDate, setDetailDate] = useState<string | null>(null);;
//     const [detailFile, setDetailFile] = useState<File | null>(null);;
//     const [detailImage, setDetailImage] = useState<File | null>(null);;
//     const [formMessage, setFormMessage] = useState<string | null>('');
//
//     // Function to fetch all Details
//     const fetchDetails = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data = await getDetails();
//             console.log("In fetchDetails Home.tsx", data)
//             data ? setDetails(data) : setDetails([]);
//         } catch (err) {
//             // Check if it is an Axios error
//             if (axios.isAxiosError(err)) {
//                 setError(err.message);
//                 console.error("Error fetching details:", err.response?.data || err.message);
//             } else if (err instanceof Error) {
//                 // Else it is a standard error
//                 setError(err.message);
//                 console.error("Error fetching details:", err.message);
//             } else {
//                 // Else it is an error of unkown type
//                 setError("An unknown error occurred.");
//                 console.error("Error fetching details (unknown type):", err);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // Function to fetch all Personas
//     const fetchPersonas = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const data = await getPersonas();
//             console.log("In fetchPersonas Home.jsx", data)
//             data ? setPersonas(data) : setPersonas([]);
//         } catch (err) {
//             // Check if it is an Axios error
//             if (axios.isAxiosError(err)) {
//                 setError(err.message);
//                 console.error("Error fetching details:", err.response?.data || err.message);
//             } else if (err instanceof Error) {
//                 // Else it is a standard error
//                 setError(err.message);
//                 console.error("Error fetching details:", err.message);
//             } else {
//                 // Else it is an error of unkown type
//                 setError("An unknown error occurred.");
//                 console.error("Error fetching details (unknown type):", err);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const profilePictureDetail = details.find(
//         (detail) => detail.key === 'profile_picture' && detail.value_type === 'Image'
//     )
//     const profilePictureUrl = profilePictureDetail?.image_value;
//
//     const handleDeletePersona = async (id: string) => {
//         setLoading(true);
//         setError(null);
//         try {
//             await deletePersona(id)
//         } catch (err) {
//             // Check if it is an Axios error
//             if (axios.isAxiosError(err)) {
//                 setError(err.message);
//                 console.error("Error fetching details:", err.response?.data || err.message);
//             } else if (err instanceof Error) {
//                 // Else it is a standard error
//                 setError(err.message);
//                 console.error("Error fetching details:", err.message);
//             } else {
//                 // Else it is an error of unkown type
//                 setError("An unknown error occurred.");
//                 console.error("Error fetching details (unknown type):", err);
//             }
//         } finally {
//             setLoading(false);
//         }
//     }
//
//
//     // Fetch details on component mount
//     useEffect(() => {
//         console.log("In Home.jsx useEffect")
//         fetchDetails();
//         fetchPersonas();
//     }, []);
//
//
//
//     // Handle form submission for creating a new detail
//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         // await createDetail()
//         const formData = new FormData();
//         formData.append("key", detailKey);
//         formData.append("value_type", detailValueType.toLowerCase());
//
//         // Only append the active value
//         if (detailValueType.toLowerCase() === "string" && detailString !== null && detailString !== undefined) formData.append("string_value", detailString);
//         if (detailValueType.toLowerCase() === "date" && detailDate !== null && detailDate !== undefined) formData.append("date_value", detailDate);
//         if (detailValueType.toLowerCase() === "file" && detailFile) formData.append("file_value", detailFile);
//         if (detailValueType.toLowerCase() === "image" && detailImage) formData.append("image_value", detailImage);
//
//         try {
//             await createDetail(formData);
//             alert("Detail created!");
//         } catch (err) {
//             console.error(err);
//         }
//         setDetailKey("")
//         setDetailDate(null)
//         setDetailString("")
//         setDetailFile(null)
//     }
//
//
//     return (
//         <DefaultLayout>
//             <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
//                 <div className="flex flex-col items-center text-center">
//                     <h1 className={title()}>Dashboard</h1>
//                     {profilePictureUrl ? (
//                         <img
//                             src={profilePictureUrl}
//                             alt="Profile"
//                             className="w-32 h-32 border-3 rounded-full"
//                         />
//                     ) : (
//                         <div className="w-32 h-32 ">
//                             No Image
//                         </div>
//                     )}
//                 </div>
//                 <div>
//                     <Card className="mt-10">
//                         <CardBody className="mt-10">
//                             <Form>
//                                 <h2>Add new data</h2>
//                                 <Select
//                                     className="max-w-xs"
//                                     items={[{ key: 'String', value: 'String' },
//                                     { key: 'Date', value: 'Date' },
//                                     { key: 'File', value: 'File' }]}
//                                     label="Favorite Animal"
//                                     placeholder="Select an animal"
//                                 >
//                                     {(item) => <SelectItem>{item.key}</SelectItem>}
//                                 </Select>
//                                 <Input
//                                     isRequired
//                                     errorMessage="Please enter a valid email"
//                                     label="Email"
//                                     labelPlacement="outside"
//                                     name="email"
//                                     placeholder="Enter your email"
//                                     type="email"
//                                     className="mb-5"
//                                 // onChange={(e) => setUsername(e.target.value)}
//                                 />
//                                 {/* <RenderValueInput/> */}
//                             </Form>
//                         </CardBody>
//                     </Card>
//                 </div>
//             </section>
//         </DefaultLayout>
//     )
// }
