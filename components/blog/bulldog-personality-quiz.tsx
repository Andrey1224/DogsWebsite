'use client';

import { useState } from 'react';
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';

type QuizAnswer = {
  text: string;
  french: number;
  english: number;
};

type QuizQuestion = {
  question: string;
  answers: QuizAnswer[];
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'What does your perfect Saturday look like?',
    answers: [
      {
        text: 'Coffee, a little drive, some errands, and no real plan for what happens next.',
        french: 1,
        english: 0,
      },
      {
        text: 'Coffee on the porch, a nice walk later, and absolutely nobody asking me to hurry.',
        french: 0,
        english: 1,
      },
    ],
  },
  {
    question: 'How important is personal space?',
    answers: [
      { text: 'Very important.', french: 0, english: 0 },
      { text: 'I can compromise.', french: 0, english: 1 },
      {
        text: 'I am happy to have a wrinkled supervisor follow me from room to room.',
        french: 1,
        english: 0,
      },
    ],
  },
  {
    question: 'What response do you expect when you talk to your dog?',
    answers: [
      { text: 'A polite tail wag.', french: 0, english: 1 },
      { text: 'A thoughtful look and quiet company.', french: 0, english: 1 },
      {
        text: 'Head tilts, grunts, dramatic sighs, and a full conversation.',
        french: 1,
        english: 0,
      },
    ],
  },
  {
    question: 'What kind of companion are you looking for?',
    answers: [
      {
        text: 'Someone who wants to know where I am going and why they were not consulted.',
        french: 1,
        english: 0,
      },
      {
        text: 'Someone warm, solid, loving, and happy simply to be beside me.',
        french: 0,
        english: 1,
      },
    ],
  },
  {
    question: 'What kind of walk sounds perfect?',
    answers: [
      { text: 'Let’s see what is around the corner.', french: 1, english: 0 },
      { text: 'Nice weather, nice view, and no rush.', french: 0, english: 1 },
      { text: 'A pleasant stroll followed by coffee outside.', french: 0, english: 1 },
    ],
  },
  {
    question: 'What kind of comedy makes you laugh most?',
    answers: [
      {
        text: 'A performer who knows exactly how funny they are.',
        french: 1,
        english: 0,
      },
      {
        text: 'A lovable character who has no idea they are funny.',
        french: 0,
        english: 1,
      },
      { text: 'Honestly, both.', french: 1, english: 1 },
    ],
  },
];

type ResultType = 'french' | 'english' | 'both';

const RESULTS: Record<ResultType, { title: string; description: string; accent: string }> = {
  french: {
    title: 'Your Match: French Bulldog',
    description:
      'You may love an expressive, curious little shadow who joins every conversation and turns an ordinary day into a story.',
    accent: 'text-sky-300',
  },
  english: {
    title: 'Your Match: English Bulldog',
    description:
      'You may love a strong, gentle companion whose calm presence, quiet loyalty, and accidental comedy make a house feel like home.',
    accent: 'text-amber-300',
  },
  both: {
    title: 'Your Match: Both Bulldogs',
    description:
      'You appreciate the Frenchie’s lively commentary and the English Bulldog’s steady warmth. You may simply need a bigger sofa.',
    accent: 'text-[#ff8b3d]',
  },
};

export function BulldogPersonalityQuiz() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [scores, setScores] = useState({ french: 0, english: 0 });
  const [resultType, setResultType] = useState<ResultType | null>(null);

  const question = QUIZ_QUESTIONS[questionIndex];
  const progress = resultType ? 100 : ((questionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const answer = question.answers[selectedAnswer];
    const nextScores = {
      french: scores.french + answer.french,
      english: scores.english + answer.english,
    };

    setScores(nextScores);
    setSelectedAnswer(null);

    if (questionIndex === QUIZ_QUESTIONS.length - 1) {
      const difference = nextScores.french - nextScores.english;
      setResultType(Math.abs(difference) <= 1 ? 'both' : difference > 0 ? 'french' : 'english');
      return;
    }

    setQuestionIndex((current) => current + 1);
  };

  const restart = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScores({ french: 0, english: 0 });
    setResultType(null);
  };

  const result = resultType ? RESULTS[resultType] : null;

  return (
    <section
      aria-labelledby="bulldog-personality-quiz-title"
      className="not-prose my-10 overflow-hidden rounded-2xl border border-[#ff6b00]/25 bg-gradient-to-br from-[#1b2435] to-[#111827] shadow-xl shadow-black/10"
    >
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-[#ff6b00] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5 md:p-7">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00]/10 text-[#ff6b00]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="bulldog-personality-quiz-title" className="m-0 text-xl font-bold text-white">
              The Bulldog Personality Test
            </h2>
            <p className="mb-0 mt-1 text-sm leading-relaxed text-slate-400">
              Six quick questions. No university approval required.
            </p>
          </div>
        </div>

        {result ? (
          <div
            aria-live="polite"
            className="rounded-xl border border-slate-700 bg-[#0f1623]/80 p-5"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Quiz complete
            </p>
            <h3 className={`mb-3 mt-0 text-2xl font-bold ${result.accent}`}>{result.title}</h3>
            <p className="m-0 leading-relaxed text-slate-200">{result.description}</p>
            <p className="mb-0 mt-4 text-xs leading-relaxed text-slate-500">
              This is a playful guide, not a temperament assessment. Every puppy is an individual.
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#ff6b00] hover:text-[#ff8b3d]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : (
          <div key={questionIndex}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[#ff8b3d]">
                Question {questionIndex + 1} of {QUIZ_QUESTIONS.length}
              </p>
              <span className="text-xs text-slate-500">Choose one</span>
            </div>

            <h3 className="mb-5 mt-0 text-xl font-bold leading-snug text-white md:text-2xl">
              {question.question}
            </h3>

            <div className="space-y-3" role="radiogroup" aria-label={question.question}>
              {question.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={answer.text}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedAnswer(index)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-white'
                        : 'border-slate-700/80 bg-[#0f1623]/70 text-slate-300 hover:border-slate-600 hover:bg-[#141d2c]'
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-[#ff8b3d]">
                      {isSelected ? <Check className="h-4 w-4" aria-hidden="true" /> : letter}
                    </span>
                    <span className="text-sm leading-relaxed">{answer.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={selectedAnswer === null}
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6b00] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e66000] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {questionIndex === QUIZ_QUESTIONS.length - 1 ? 'See my result' : 'Next question'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
