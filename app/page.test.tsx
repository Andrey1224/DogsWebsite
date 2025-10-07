import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the primary value proposition", () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        name: /trusted french & english bulldogs, raised with southern warmth/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/akC pedigrees, OFA screenings/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /view available puppies/i })).toBeVisible();
  });
});
