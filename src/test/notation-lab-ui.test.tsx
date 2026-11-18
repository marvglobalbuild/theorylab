import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotationConstructor } from "@/components/notation-lab/NotationConstructor";
import { NotationExplorer } from "@/components/notation-lab/NotationExplorer";
import { NotationGuidedExercises } from "@/components/notation-lab/NotationGuidedExercises";
import { NotationTheoryGuide } from "@/components/notation-lab/NotationTheoryGuide";
import { NotationTrainer } from "@/components/notation-lab/NotationTrainer";

// Mock Tone.js and usePiano to test pure UI interactions
vi.mock("@/lib/music/usePiano", () => ({
  usePiano: () => ({
    noteOn: vi.fn(),
    noteOff: vi.fn(),
    playPhrase: vi.fn(),
  }),
}));

// Mock VexFlow Staff to avoid canvas/SVG rendering dependencies in jsdom
vi.mock("@/components/music/Staff", () => ({
  Staff: ({ chords, clef, label }: { chords: unknown[]; clef: string; label: string }) => (
    <div data-testid="mock-staff" data-clef={clef} aria-label={label}>
      Staff Clef: {clef} ({chords.length} chords)
    </div>
  ),
}));

describe("Music Notation Lab UI Components", () => {
  it("renders NotationExplorer and allows clef switching and note navigation", () => {
    render(<NotationExplorer />);

    expect(screen.getByText(/Active Clef:/i)).toBeInTheDocument();
    expect(screen.getByText(/𝄞 Treble \(G-Clef\)/i)).toBeInTheDocument();
    expect(screen.getByText(/𝄢 Bass \(F-Clef\)/i)).toBeInTheDocument();

    // Verify staff is displayed
    const staff = screen.getByTestId("mock-staff");
    expect(staff).toHaveAttribute("data-clef", "treble");

    // Switch to Bass clef
    fireEvent.click(screen.getByText(/𝄢 Bass \(F-Clef\)/i));
    expect(screen.getByTestId("mock-staff")).toHaveAttribute("data-clef", "bass");

    // Check Inspector card has staff location
    expect(screen.getByText(/Staff Location/i)).toBeInTheDocument();
  });

  it("renders NotationTrainer and handles answering a note challenge", () => {
    render(<NotationTrainer />);

    expect(screen.getByText(/Note Identification Challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Questions/i)).toBeInTheDocument();

    // Find answer buttons via container
    const promptHeader = screen.getByText(/Select the matching note name:/i);
    const optionsContainer = promptHeader.nextElementSibling;
    expect(optionsContainer).toBeDefined();

    const answerButtons = optionsContainer ? optionsContainer.querySelectorAll("button") : [];
    expect(answerButtons.length).toBe(4);

    // Click first answer button
    fireEvent.click(answerButtons[0]!);

    // Should reveal feedback banner
    expect(screen.getByText(/Correct!|Incorrect\./i)).toBeInTheDocument();
  });

  it("renders NotationConstructor and supports placing notes and rests", () => {
    render(<NotationConstructor />);

    expect(screen.getByText(/Interactive Constructor Canvas/i)).toBeInTheDocument();
    expect(screen.getByText(/Note & Rest Constructor Palette/i)).toBeInTheDocument();

    // Switch to Rest Mode
    fireEvent.click(screen.getByRole("button", { name: /^Rest \(Silence\)$/i }));
    expect(screen.getByText(/Pitch Letter \(Not applicable for rest\)/i)).toBeInTheDocument();

    // Switch back to Note Mode
    fireEvent.click(screen.getByRole("button", { name: /^Musical Note$/i }));

    // Place note on staff
    const placeBtn = screen.getByRole("button", { name: /Place on staff/i });
    expect(placeBtn).toBeInTheDocument();
    fireEvent.click(placeBtn);
  });

  it("renders NotationGuidedExercises and guides step progression", () => {
    render(<NotationGuidedExercises />);

    expect(screen.getByText(/Curriculum Guided Practice Modules/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Exercise 1: Treble Lines Mastery/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Choose the correct note:/i)).toBeInTheDocument();

    // Toggle hint
    const hintBtn = screen.getByRole("button", { name: /Show hint/i });
    fireEvent.click(hintBtn);
    expect(screen.getByText(/Hint:/i)).toBeInTheDocument();
  });

  it("renders NotationTheoryGuide with comprehensive explanations and tables", () => {
    render(<NotationTheoryGuide />);

    expect(screen.getByText(/Comprehensive Music Notation Reference Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/The 5-Line, 4-Space Musical Staff/i)).toBeInTheDocument();
    expect(screen.getByText(/The Grand Staff & The Middle C Bridge/i)).toBeInTheDocument();
    expect(screen.getByText(/Note Durations & Corresponding Rests/i)).toBeInTheDocument();
    expect(screen.getByText(/Whole Rest vs Half Rest Distinction:/i)).toBeInTheDocument();
  });
});
