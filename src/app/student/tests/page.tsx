import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

const tests = [
  { id: '1', title: 'AutoCAD Basics Quiz', course: 'AutoCAD 2D & 3D', duration: 30, attempts: 2, maxAttempts: 3, lastScore: 75, passed: true },
  { id: '2', title: 'SolidWorks Mid-term', course: 'SolidWorks', duration: 45, attempts: 0, maxAttempts: 3, lastScore: null, passed: false },
]

const previousAttempts = [
  { test: 'AutoCAD Basics Quiz', date: '2024-01-20', score: 75, passed: true },
  { test: 'AutoCAD Basics Quiz', date: '2024-01-18', score: 45, passed: false },
]

export default function TestsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Tests</h1>

      <h2 className="text-lg font-semibold text-foreground mb-4">Available Tests</h2>
      <div className="space-y-4 mb-8">
        {tests.map((test) => (
          <div key={test.id} className="bg-white border border-border rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{test.title}</h3>
              <p className="text-sm text-muted-foreground">{test.course}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {test.duration} min</span>
                <span>Attempts: {test.attempts}/{test.maxAttempts}</span>
                {test.lastScore !== null && (
                  <span className={test.passed ? 'text-green-600' : 'text-red-600'}>
                    Last: {test.lastScore}%
                  </span>
                )}
              </div>
            </div>
            <Button disabled={test.attempts >= test.maxAttempts}>
              {test.attempts === 0 ? 'Start Test' : 'Retake'}
            </Button>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Previous Attempts</h2>
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Test</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Score</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Result</th>
            </tr>
          </thead>
          <tbody>
            {previousAttempts.map((attempt, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm text-foreground">{attempt.test}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{attempt.date}</td>
                <td className="px-4 py-3 text-sm text-foreground">{attempt.score}%</td>
                <td className="px-4 py-3">
                  {attempt.passed ? (
                    <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Passed</Badge>
                  ) : (
                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
