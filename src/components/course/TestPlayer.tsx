'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle, XCircle, ChevronRight, RotateCcw, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import type { Test, TestQuestion } from '@/types'

interface TestPlayerProps {
  test: Test
  lessonId: string
  onComplete?: (passed: boolean, score: number) => void
}

interface QuizState {
  currentQuestion: number
  answers: Record<string, string>
  submitted: boolean
  score: number
  passed: boolean
  timeRemaining: number | null
  showResults: boolean
}

export default function TestPlayer({ test, lessonId, onComplete }: TestPlayerProps) {
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    submitted: false,
    score: 0,
    passed: false,
    timeRemaining: test.time_limit_minutes ? test.time_limit_minutes * 60 : null,
    showResults: false,
  })

  const fetchQuestions = useCallback(async () => {
    const { data } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', test.id)
      .order('order_index', { ascending: true })

    setQuestions(data || [])
    setLoading(false)
  }, [test.id])

  useEffect(() => {
    Promise.resolve().then(() => fetchQuestions())
  }, [fetchQuestions])

  useEffect(() => {
    if (quizState.submitted || quizState.timeRemaining === null) return

    const timer = setInterval(() => {
      setQuizState((prev) => {
        if (prev.timeRemaining === null || prev.timeRemaining <= 0) {
          clearInterval(timer)
          return { ...prev, submitted: true, showResults: true }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState.submitted, quizState.timeRemaining])

  const handleAnswer = useCallback((questionId: string, option: string) => {
    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: option },
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)

    let correct = 0
    const totalQuestions = questions.length

    questions.forEach((q) => {
      if (quizState.answers[q.id] === q.correct_answer) {
        correct++
      }
    })

    const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0
    const passed = score >= test.passing_score

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('test_attempts').insert({
          user_id: user.id,
          test_id: test.id,
          answers: quizState.answers,
          score,
          passed,
          completed_at: new Date().toISOString(),
        })
      }

      setQuizState((prev) => ({
        ...prev,
        submitted: true,
        score,
        passed,
        showResults: true,
      }))

      if (passed) {
        notify.quizSubmitted(score)
      } else {
        notify.quizFailed()
      }

      onComplete?.(passed, score)
    } catch {
      notify.genericError('Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, questions, quizState.answers, test.id, test.passing_score, onComplete])

  const handleRetry = useCallback(() => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      submitted: false,
      score: 0,
      passed: false,
      timeRemaining: test.time_limit_minutes ? test.time_limit_minutes * 60 : null,
      showResults: false,
    })
  }, [test.time_limit_minutes])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No questions available for this test.</p>
      </div>
    )
  }

  if (quizState.showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <div
              className={cn(
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                quizState.passed ? 'bg-green-100' : 'bg-red-100'
              )}
            >
              {quizState.passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {quizState.passed ? 'Congratulations!' : 'Keep Practicing'}
            </h2>
            <p className="text-slate-500 mb-4">
              {quizState.passed
                ? 'You passed the test!'
                : `You need ${test.passing_score}% to pass. Try again!`}
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-xl px-6 py-3 mb-6">
              <span className="text-sm text-slate-500">Your Score:</span>
              <span
                className={cn(
                  'text-2xl font-bold',
                  quizState.passed ? 'text-green-600' : 'text-red-600'
                )}
              >
                {quizState.score}%
              </span>
            </div>

            <div className="text-left space-y-4 mt-6">
              <h3 className="font-semibold text-slate-900">Review Answers</h3>
              {questions.map((q, i) => {
                const userAnswer = quizState.answers[q.id]
                const isCorrect = userAnswer === q.correct_answer
                return (
                  <div
                    key={q.id}
                    className={cn(
                      'p-4 rounded-xl border',
                      isCorrect
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          Q{i + 1}. {q.question}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Your answer:{' '}
                          <span
                            className={isCorrect ? 'text-green-700' : 'text-red-700'}
                          >
                            {userAnswer || 'Not answered'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700">
                            Correct: {q.correct_answer}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-sm text-slate-500 mt-1 italic">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {!quizState.passed && (
              <Button
                onClick={handleRetry}
                className="mt-6 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[quizState.currentQuestion]
  const answeredCount = Object.keys(quizState.answers).length
  const quizProgress =
    ((quizState.currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{test.title}</h2>
          <p className="text-sm text-slate-500">
            Question {quizState.currentQuestion + 1} of {questions.length}
          </p>
        </div>
        {quizState.timeRemaining !== null && (
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono',
              quizState.timeRemaining < 60
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-slate-100 text-slate-700'
            )}
            role="timer"
            aria-label="Time remaining"
          >
            <Clock className="h-4 w-4" />
            {formatTime(quizState.timeRemaining)}
          </div>
        )}
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${quizProgress}%` }}
          role="progressbar"
          aria-valuenow={quizProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <Card className="border-slate-200 mb-6">
        <CardContent className="p-6">
          <p className="font-semibold text-slate-900 mb-4">{currentQ.question}</p>

          {currentQ.options && (
            <div className="space-y-2" role="radiogroup" aria-label={`Question ${quizState.currentQuestion + 1}`}>
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQ.id, option)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all',
                    quizState.answers[currentQ.id] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                  role="radio"
                  aria-checked={quizState.answers[currentQ.id] === option}
                >
                  <span className="text-sm font-medium text-slate-500 mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() =>
            setQuizState((prev) => ({
              ...prev,
              currentQuestion: Math.max(0, prev.currentQuestion - 1),
            }))
          }
          disabled={quizState.currentQuestion === 0}
          className="border-slate-300"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1" role="tablist" aria-label="Question navigation">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() =>
                setQuizState((prev) => ({ ...prev, currentQuestion: i }))
              }
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                i === quizState.currentQuestion
                  ? 'bg-blue-600 w-4'
                  : quizState.answers[questions[i].id]
                    ? 'bg-blue-300'
                    : 'bg-slate-200'
              )}
              role="tab"
              aria-selected={i === quizState.currentQuestion}
              aria-label={`Question ${i + 1}${quizState.answers[questions[i].id] ? ' (answered)' : ''}`}
            />
          ))}
        </div>

        {quizState.currentQuestion === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount < questions.length || submitting}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Submit Test
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() =>
              setQuizState((prev) => ({
                ...prev,
                currentQuestion: Math.min(
                  questions.length - 1,
                  prev.currentQuestion + 1
                ),
              }))
            }
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
