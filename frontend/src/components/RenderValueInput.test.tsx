/**
 * Test for RenderValueInput
 * Uses the Jest library and react testing library
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DetailValueRenderer from "./RenderPersonaDetailValue"; // update path if different

type TestDetail = {
    value_type: string;
    string_value?: string | null;
    date_value?: string | null;
    file_value?: string | null;
    image_value?: string | null;
};

// Render the DetailValueRenderer
const renderWith = (detail: TestDetail) =>
    render(<DetailValueRenderer detail={detail as any} />);

describe("DetailValueRenderer", () => {
    test("renders '-' when value is missing/empty", () => {
        renderWith({ value_type: "string", string_value: "" });
        expect(screen.getByText("-")).toBeInTheDocument();
    });

    test("renders string values", () => {
        renderWith({ value_type: "string", string_value: "Hello world" });
        expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    test("renders date values", () => {
        renderWith({ value_type: "date", date_value: "2024-05-25" });
        expect(screen.getByText("2024-05-25")).toBeInTheDocument();
    });

    test("renders link for file value with correct attrs", () => {
        const url = "https://example.com/file.pdf";
        renderWith({ value_type: "file", file_value: url });
        const link = screen.getByRole("link", { name: /view/i });
        expect(link).toHaveAttribute("href", url);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("renders link for image value with correct attrs", () => {
        const url = "https://example.com/image.png";
        renderWith({ value_type: "image", image_value: url });
        const link = screen.getByRole("link", { name: /view/i });
        expect(link).toHaveAttribute("href", url);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("prefers file link for file value", () => {
        const fileUrl = "https://example.com/file-first.bin";
        renderWith({
            value_type: "file",
            file_value: fileUrl
        });
        // Filter by the element's accessible name
        const link = screen.getByRole("link", { name: /view/i });
        // Check if the link rendered is the file provided
        expect(link).toHaveAttribute("href", fileUrl);
    });

    test("handles value_type case-insensitively", () => {
        renderWith({ value_type: "StRiNg", string_value: "Mixed case works" });
        expect(screen.getByText("Mixed case works")).toBeInTheDocument();
    });

    test("unknown type renders '-'", () => {
        renderWith({ value_type: "number" as any });
        expect(screen.getByText("-")).toBeInTheDocument();
    });
});