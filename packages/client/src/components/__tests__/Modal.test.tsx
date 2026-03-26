import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Modal from "../Modals/Modal";

describe("Modal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    title: "Test Modal",
    actionLabel: "Submit",
    body: <div>Modal body content</div>,
  };

  it("renders when isOpen is true", () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Test Modal");
    expect(screen.getByText("Modal body content")).toBeInTheDocument();
  });

  it("is hidden when isOpen is false", () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("modal-title")).not.toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    render(<Modal {...defaultProps} error="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls onSubmit when action button is clicked", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Modal {...defaultProps} onSubmit={onSubmit} />);
    await user.click(screen.getByText("Submit"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
