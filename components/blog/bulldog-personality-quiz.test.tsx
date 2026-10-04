import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { BulldogPersonalityQuiz } from './bulldog-personality-quiz';

describe('BulldogPersonalityQuiz', () => {
  it('keeps the quiz compact and reveals a result after six answers', async () => {
    const user = userEvent.setup();
    render(<BulldogPersonalityQuiz />);

    expect(screen.getByText(/question 1 of 6/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next question/i })).toBeDisabled();
    expect(screen.queryByText(/question 2 of 6/i)).not.toBeInTheDocument();

    const choices = [
      /coffee, a little drive/i,
      /wrinkled supervisor/i,
      /head tilts, grunts/i,
      /why they were not consulted/i,
      /what is around the corner/i,
      /knows exactly how funny/i,
    ];

    for (const [index, choice] of choices.entries()) {
      await user.click(screen.getByRole('radio', { name: choice }));
      await user.click(
        screen.getByRole('button', {
          name: index === choices.length - 1 ? /see my result/i : /next question/i,
        }),
      );
    }

    expect(
      screen.getByRole('heading', { name: /your match: french bulldog/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('can restart after showing a result', async () => {
    const user = userEvent.setup();
    render(<BulldogPersonalityQuiz />);

    for (let index = 0; index < 6; index += 1) {
      await user.click(screen.getAllByRole('radio')[0]);
      await user.click(
        screen.getByRole('button', {
          name: index === 5 ? /see my result/i : /next question/i,
        }),
      );
    }

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText(/question 1 of 6/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next question/i })).toBeDisabled();
  });
});
