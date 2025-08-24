/**
 * RenderPersonaDetailValue component
 * Takes in a Detail instance and renders the appropriate field.
 * Eg. If it is a file value, return a link to download the file.
 * Eg. If it is a string value, render as a text betwen <span></span>
 */
import React from "react";

import { Detail } from "@/types/types.ts";

interface DetailValueRendererProps {
  detail: Detail;
}

const DetailValueRenderer: React.FC<DetailValueRendererProps> = ({
  detail,
}) => {
  const valueTypeLower = detail.value_type.toLowerCase();

  const hasValue =
    (valueTypeLower === "string" && detail.string_value) ||
    (valueTypeLower === "date" && detail.date_value) ||
    (valueTypeLower === "file" && detail.file_value) ||
    (valueTypeLower === "image" && detail.image_value);

  const isFileOrImageType =
    valueTypeLower === "file" || valueTypeLower === "image";

  if (!hasValue) {
    return <span>-</span>;
  }

  // Render a link for file/image types
  if (isFileOrImageType) {
    const fileOrImageUrl = detail.file_value || detail.image_value;
    // noopenner is used to prevent tabnabbing (new tab does not have access to window.opener)
    // noreferrer is used to enhance user privacy - prevent browser from sending referrer header
    // _blank opens a new tab
    return (
      <a
        className="text-blue-500 hover:underline"
        href={fileOrImageUrl || "#"}
        rel="noopener noreferrer"
        target="_blank"
      >
        View
      </a>
    );
  }

  if (valueTypeLower === "string") {
    return <span>{detail.string_value}</span>;
  }

  if (valueTypeLower === "date") {
    return <span>{detail.date_value}</span>;
  }

  return <span>-</span>;
};

export default DetailValueRenderer;
