import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the primary value proposition", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /trusted home for french & english bulldog matches/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/stripe and paypal deposits lock in your pick/i),
    ).toBeVisible();
  });
});
