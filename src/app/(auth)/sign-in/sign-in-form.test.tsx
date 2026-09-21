import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SignInForm } from "./sign-in-form";

vi.mock("./actions", () => ({
  signInAction: vi.fn(async (_prevState: string | undefined, formData: FormData) => {
    if (formData.get("email") === "bad@test.local") return "Email ou senha inválidos.";
    return undefined;
  }),
}));

describe("SignInForm", () => {
  it("marks email and password as required", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Senha")).toBeRequired();
  });

  it("shows the error message returned by the sign-in action", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "bad@test.local");
    await user.type(screen.getByLabelText("Senha"), "whatever");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email ou senha inválidos.");
  });
});
