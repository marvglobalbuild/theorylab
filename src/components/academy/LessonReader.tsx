import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Music2,
  Play,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Staff } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import { PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { formatAcademyLevel } from "@/content/academy-curriculum";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";
import type { AcademyLesson, AcademyLessonProgress, ServiceResult } from "@/services";

interface LessonReaderProps {
  lesson: AcademyLesson;
  progress: AcademyLessonProgress | null;
  persistenceAvailable: boolean;
  statusNotice?: string | null;
  onRecordVisit: () => Promise<ServiceResult<AcademyLessonProgress>>;
  onToggleCompleted: (
    nextCompleted: boolean,
    score?: number | null,
  ) => Promise<ServiceResult<AcademyLessonProgress>>;
}

export function LessonReader({
  lesson,
  progress,
  persistenceAvailable,
  statusNotice,
  onRecordVisit,
  onToggleCompleted,
}: LessonReaderProps) {
  const piano = usePiano();
  const [activeAudioKey, setActiveAudioKey] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const recordedVisitSlugRef = useRef<string | null>(null);

  const isCompleted = progress?.status === "completed";

  useEffect(() => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setSaveFeedback(null);
    setActiveAudioKey(null);
  }, [lesson.slug]);

  useEffect(() => {
    if (!persistenceAvailable) return;
    if (recordedVisitSlugRef.current === lesson.slug) return;
    recordedVisitSlugRef.current = lesson.slug;
    onRecordVisit().catch(() => undefined);
  }, [lesson.slug, onRecordVisit, persistenceAvailable]);

  const handlePlay = (key: string, steps?: typeof lesson.workedExample.audioSteps) => {
    if (!steps || steps.length === 0) return;
    setActiveAudioKey(key);
    piano.playPhrase(steps, (step) => {
      if (!step) {
        setActiveAudioKey(null);
      }
    });
  };

  const handleMarkComplete = async () => {
    setIsSavingProgress(true);
    setSaveFeedback(null);

    const answeredCount = lesson.practiceActivities.filter((q) => checkedQuestions[q.id]).length;
    const correctCount = lesson.practiceActivities.filter(
      (q) => checkedQuestions[q.id] && selectedAnswers[q.id] === q.correctOptionId,
    ).length;
    const computedScore =
      answeredCount > 0
        ? Math.round((correctCount / lesson.practiceActivities.length) * 100)
        : null;

    const result = await onToggleCompleted(!isCompleted, computedScore);
    setIsSavingProgress(false);

    if (result.status === "unavailable") {
      setSaveFeedback(result.message);
    } else {
      setSaveFeedback(
        !isCompleted ? "Lesson completion recorded in Supabase." : "Marked lesson as in progress.",
      );
    }
  };

  return (
    <article className="space-y-10">
      {statusNotice && (
        <PreviewNotice
          title={persistenceAvailable ? "Published curriculum sync" : "Read-only study mode"}
          message={statusNotice}
        />
      )}

      {/* Header & metadata */}
      <header className="space-y-4 border-b border-border pb-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/learn/paths"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to learning paths
          </Link>
          <span className="text-xs tabular-nums text-muted-foreground">
            Path {lesson.pathNumeral} · {formatAcademyLevel(lesson.level)} ·{" "}
            {lesson.estimatedMinutes} min
          </span>
        </div>

        <p className="eyebrow text-crimson-deep">
          {lesson.pathTitle} — {lesson.courseTitle}
        </p>
        <h1 className="type-display-lg text-balance text-foreground">{lesson.title}</h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          {lesson.summary}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
          <span>{lesson.moduleTitle}</span>
          {persistenceAvailable && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-primary" aria-hidden /> Completed
                  </>
                ) : progress?.status === "in_progress" ? (
                  <>
                    <Circle className="size-3.5 text-crimson-deep" aria-hidden /> In progress (
                    <span className="tabular-nums">{progress.progressPercent}%</span>)
                  </>
                ) : (
                  <>
                    <Circle className="size-3.5 text-muted-foreground" aria-hidden /> Not yet
                    completed
                  </>
                )}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Learning Objectives */}
      <section
        aria-labelledby="objectives-heading"
        className="rounded-[2px] border border-border bg-paper p-6"
      >
        <h2 id="objectives-heading" className="eyebrow text-crimson-deep">
          Learning objectives
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-foreground">
          {lesson.objectives.map((objective) => (
            <li key={objective} className="flex items-start gap-3">
              <Check className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Progressive Theory Explanations */}
      <div className="space-y-8">
        {lesson.sections.map((section) => {
          const audioKey = `sec-${section.id}`;
          const isPlaying = activeAudioKey === audioKey;
          return (
            <section key={section.id} className="space-y-4">
              <h2 className="type-display-md text-foreground">{section.heading}</h2>
              <div className="space-y-3 text-[0.95rem] leading-[1.7] text-muted-foreground">
                {section.body.map((paragraph, pIdx) => (
                  <p key={pIdx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              {(section.notation || section.audioSteps) && (
                <div className="rounded-[2px] border border-border bg-paper p-5">
                  {section.notation && (
                    <div className="overflow-hidden rounded-[2px] border border-border bg-background px-4 py-3">
                      <Staff
                        clef={section.notation.clef}
                        keySignature={section.notation.keySignature}
                        timeSignature={section.notation.timeSignature}
                        chords={section.notation.chords}
                        beamNotes={section.notation.beamNotes}
                        tuplet={section.notation.tuplet}
                        height={150}
                        label={section.notation.label}
                      />
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    {section.notation?.caption ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {section.notation.caption}
                      </p>
                    ) : (
                      <span />
                    )}

                    {section.audioSteps && section.audioSteps.length > 0 && (
                      <Button
                        type="button"
                        variant={isPlaying ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlay(audioKey, section.audioSteps)}
                      >
                        <Play className="size-3.5" aria-hidden />
                        {section.audioLabel ?? "Play musical example"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Repertoire Spotlight */}
      <section
        aria-labelledby="repertoire-heading"
        className="rounded-[2px] border border-border bg-paper p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p
              id="repertoire-heading"
              className="eyebrow inline-flex items-center gap-1.5 text-crimson-deep"
            >
              <Music2 className="size-3.5" aria-hidden /> In real repertoire
            </p>
            <h2 className="font-display text-xl text-foreground">
              {lesson.repertoireExample.composer} — {lesson.repertoireExample.work}
            </h2>
            <p className="text-xs text-muted-foreground">{lesson.repertoireExample.barReference}</p>
          </div>

          {lesson.repertoireExample.audioSteps && (
            <Button
              type="button"
              variant={activeAudioKey === "repertoire" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePlay("repertoire", lesson.repertoireExample.audioSteps)}
            >
              <Play className="size-3.5" aria-hidden />
              {lesson.repertoireExample.audioLabel ?? "Hear excerpt"}
            </Button>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {lesson.repertoireExample.insight}
        </p>
      </section>

      {/* Step-by-step Worked Example */}
      <section
        aria-labelledby="worked-heading"
        className="rounded-[2px] border border-border bg-paper p-6 space-y-4"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
          <div>
            <p id="worked-heading" className="eyebrow text-crimson-deep">
              Worked example
            </p>
            <h2 className="mt-1 font-display text-xl text-foreground">
              {lesson.workedExample.title}
            </h2>
          </div>
          {lesson.workedExample.audioSteps && (
            <Button
              type="button"
              variant={activeAudioKey === "worked" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePlay("worked", lesson.workedExample.audioSteps)}
            >
              <Play className="size-3.5" aria-hidden />
              {lesson.workedExample.audioLabel ?? "Play worked example"}
            </Button>
          )}
        </div>

        <p className="text-sm font-medium text-foreground">{lesson.workedExample.scenario}</p>

        {lesson.workedExample.notation && (
          <div className="overflow-hidden rounded-[2px] border border-border bg-background px-4 py-3">
            <Staff
              clef={lesson.workedExample.notation.clef}
              keySignature={lesson.workedExample.notation.keySignature}
              timeSignature={lesson.workedExample.notation.timeSignature}
              chords={lesson.workedExample.notation.chords}
              beamNotes={lesson.workedExample.notation.beamNotes}
              tuplet={lesson.workedExample.notation.tuplet}
              height={145}
              label={lesson.workedExample.notation.label}
            />
            {lesson.workedExample.notation.caption && (
              <p className="mt-2 text-xs text-muted-foreground">
                {lesson.workedExample.notation.caption}
              </p>
            )}
          </div>
        )}

        <ol className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
          {lesson.workedExample.steps.map((step, sIdx) => (
            <li key={sIdx} className="flex items-start gap-3">
              <span className="mt-0.5 text-xs font-medium tabular-nums text-crimson-deep">
                {sIdx + 1}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="border-t border-border pt-3 text-sm font-medium text-foreground">
          {lesson.workedExample.conclusion}
        </p>
      </section>

      {/* Interactive Practice Activities inside lesson */}
      {lesson.practiceActivities.length > 0 && (
        <section aria-labelledby="practice-heading" className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p id="practice-heading" className="eyebrow text-crimson-deep">
                Interactive concept check
              </p>
              <h2 className="type-display-md mt-1 text-foreground">Practise within this lesson</h2>
            </div>
          </div>

          <div className="space-y-5">
            {lesson.practiceActivities.map((question, qIdx) => {
              const selected = selectedAnswers[question.id];
              const isChecked = Boolean(checkedQuestions[question.id]);
              const isCorrect = selected === question.correctOptionId;

              return (
                <div
                  key={question.id}
                  className="rounded-[2px] border border-border bg-paper p-6 space-y-4"
                >
                  <p className="text-xs font-medium tabular-nums text-muted-foreground">
                    Question {qIdx + 1} of {lesson.practiceActivities.length}
                  </p>
                  <p className="text-base font-medium text-foreground">{question.prompt}</p>

                  {question.notation && (
                    <div className="overflow-hidden rounded-[2px] border border-border bg-background px-4 py-3">
                      <Staff
                        clef={question.notation.clef}
                        keySignature={question.notation.keySignature}
                        timeSignature={question.notation.timeSignature}
                        chords={question.notation.chords}
                        height={140}
                        label={question.notation.label}
                      />
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((opt) => {
                      const active = selected === opt.id;
                      const showRight = isChecked && opt.id === question.correctOptionId;
                      const showWrong = isChecked && active && !showRight;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedAnswers((prev) => ({ ...prev, [question.id]: opt.id }));
                            setCheckedQuestions((prev) => ({ ...prev, [question.id]: true }));
                          }}
                          className={cn(
                            "flex min-h-11 items-center justify-between rounded-[2px] border px-4 py-2.5 text-left text-sm transition-colors",
                            showRight && "border-primary bg-primary/10 text-foreground font-medium",
                            showWrong && "border-destructive bg-destructive/10 text-foreground",
                            !showRight &&
                              !showWrong &&
                              active &&
                              "border-foreground bg-background text-foreground font-medium",
                            !active &&
                              !showRight &&
                              "border-border bg-background text-foreground hover:border-foreground/50",
                          )}
                        >
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isChecked && (
                    <div
                      role="status"
                      className="flex items-start justify-between gap-4 border-t border-border pt-4 text-sm"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {isCorrect ? "Correct." : "Not quite — review the explanation:"}
                        </p>
                        <p className="text-muted-foreground">{question.explanation}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAnswers((prev) => {
                            const next = { ...prev };
                            delete next[question.id];
                            return next;
                          });
                          setCheckedQuestions((prev) => {
                            const next = { ...prev };
                            delete next[question.id];
                            return next;
                          });
                        }}
                      >
                        <RotateCcw className="size-3.5" aria-hidden /> Reset
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Summary & Key Takeaways */}
      <section
        aria-labelledby="summary-heading"
        className="rounded-[2px] border border-border bg-paper p-6 space-y-4"
      >
        <p
          id="summary-heading"
          className="eyebrow inline-flex items-center gap-1.5 text-crimson-deep"
        >
          <BookOpen className="size-3.5" aria-hidden /> Summary & key takeaways
        </p>
        <p className="text-sm leading-relaxed text-foreground">{lesson.summaryText}</p>
        <ul className="space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
          {lesson.keyTakeaways.map((takeaway) => (
            <li key={takeaway} className="flex items-start gap-2.5">
              <span className="text-crimson-deep" aria-hidden>
                —
              </span>
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Completion & Sequential Navigation Footer */}
      <footer className="space-y-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            type="button"
            variant={isCompleted ? "outline" : "default"}
            disabled={isSavingProgress}
            onClick={handleMarkComplete}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="size-4 text-primary" aria-hidden />
                {isSavingProgress ? "Updating..." : "Completed (click to reopen)"}
              </>
            ) : (
              <>
                <Check className="size-4" aria-hidden />
                {isSavingProgress ? "Saving progress..." : "Mark lesson as completed"}
              </>
            )}
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            {lesson.previousLessonSlug && (
              <Button asChild variant="outline">
                <Link
                  to="/learn/lessons/$lessonSlug"
                  params={{ lessonSlug: lesson.previousLessonSlug }}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Previous lesson
                </Link>
              </Button>
            )}
            {lesson.nextLessonSlug && (
              <Button asChild>
                <Link
                  to="/learn/lessons/$lessonSlug"
                  params={{ lessonSlug: lesson.nextLessonSlug }}
                >
                  Next lesson: {lesson.nextLessonTitle}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {saveFeedback && (
          <p role="status" className="text-xs text-muted-foreground">
            {saveFeedback}
          </p>
        )}
      </footer>
    </article>
  );
}
