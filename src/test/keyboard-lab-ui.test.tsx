import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KeyboardExplorer } from "@/components/keyboard-lab/KeyboardExplorer";
import { KeyboardTheoryGuide } from "@/components/keyboard-lab/KeyboardTheoryGuide";
import { KeyboardTrainer } from "@/components/keyboard-lab/KeyboardTrainer";
import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";

// Mock audio engine
const mockNoteOn = vi.fn();
const mockNoteOff = vi.fn();
const mockPlayPhrase = vi.fn();

vi.mock("@/lib/music/usePiano", () => ({
  usePiano: () => ({
    status: "ready",
    noteOn: mockNoteOn,
    noteOff: mockNoteOff,
    playPhrase: mockPlayPhrase,
  }),
}));

describe("Virtual Piano Keyboard UI Components", () => {
  it("renders VirtualPiano with white and black keys and handles pointer events", () => {
    const onPlay = vi.fn();
    const onRelease = vi.fn();

    render(
      <VirtualPiano
        startOctave={4}
        numOctaves={1}
        onNotePlay={onPlay}
        onNoteRelease={onRelease}
      />
    );

    // Should render piano group
    const pianoGroup = screen.getByRole("group", { name: /Interactive Virtual Piano Keyboard/i });
    expect(pianoGroup).toBeInTheDocument();

    // Find Middle C key
    const c4Button = screen.getByRole("button", { name: /C4 White Key \(Middle C\)/i });
    expect(c4Button).toBeInTheDocument();

    // Find C#4 black key
    const cSharpButton = screen.getByRole("button", { name: /C#4 Black Key/i });
    expect(cSharpButton).toBeInTheDocument();

    // Trigger pointer down on C4
    fireEvent.pointerDown(c4Button, { pointerId: 1 });
    expect(onPlay).toHaveBeenCalledWith("C4");
    expect(mockNoteOn).toHaveBeenCalledWith("C4");

    // Trigger pointer up
    fireEvent.pointerUp(c4Button, { pointerId: 1 });
    expect(onRelease).toHaveBeenCalledWith("C4");
    expect(mockNoteOff).toHaveBeenCalledWith("C4");
  });

  it("renders KeyboardExplorer and supports octave navigation and sustain pedal", () => {
    render(<KeyboardExplorer />);

    expect(screen.getByText(/Octave Span:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2 Octaves/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3 Octaves/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /4 Octaves \(Full Range\)/i })).toBeInTheDocument();

    // Check octave shift buttons
    const shiftDownBtn = screen.getByRole("button", { name: /Octave -/i });
    const shiftUpBtn = screen.getByRole("button", { name: /Octave \+/i });
    expect(shiftDownBtn).toBeInTheDocument();
    expect(shiftUpBtn).toBeInTheDocument();

    // Toggle 4 Octaves
    fireEvent.click(screen.getByRole("button", { name: /4 Octaves \(Full Range\)/i }));

    // Toggle Sustain pedal
    const sustainBtn = screen.getByRole("button", { name: /Sustain Pedal: OFF/i });
    fireEvent.click(sustainBtn);
    expect(screen.getByRole("button", { name: /Sustain Pedal: ENGAGED/i })).toBeInTheDocument();

    // Inspector card
    expect(screen.getByText(/Pitch Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/Middle C Anchor/i)).toBeInTheDocument();
  });

  it("renders KeyboardTrainer and handles practicing a note challenge", () => {
    render(<KeyboardTrainer />);

    expect(screen.getByText(/Interactive Keyboard Challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Accuracy/i)).toBeInTheDocument();

    // Toggle hint
    const hintBtn = screen.getByRole("button", { name: /Show hint/i });
    fireEvent.click(hintBtn);
    expect(screen.getByText(/Instructor Hint:/i)).toBeInTheDocument();

    // Find Middle C key and press it
    const c4Key = screen.getByRole("button", { name: /C4 White Key \(Middle C\)/i });
    fireEvent.pointerDown(c4Key, { pointerId: 1 });

    // Should reveal feedback banner
    expect(screen.getByText(/Correct!|Incorrect\./i)).toBeInTheDocument();
  });

  it("renders KeyboardTheoryGuide with 2-and-3 pattern, Middle C, and shortcuts reference", () => {
    render(<KeyboardTheoryGuide />);

    expect(screen.getByText(/The 2-and-3 Black Key Pattern/i)).toBeInTheDocument();
    expect(screen.getByText(/Middle C \(C4, MIDI 60\)/i)).toBeInTheDocument();
    expect(screen.getByText(/The Natural Semitones:/i)).toBeInTheDocument();
    expect(screen.getByText(/Enharmonic Equivalents on the Black Keys/i)).toBeInTheDocument();
    expect(screen.getByText(/Computer Keyboard Controls Reference/i)).toBeInTheDocument();
  });
});
