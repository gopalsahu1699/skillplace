import { Award, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const certificates = [
  { id: '1', course: 'Resume Building', number: 'SP-2024-001', issued: '2024-01-15' },
]

export default function CertificatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Certificates</h1>
      {certificates.length === 0 ? (
        <div className="text-center py-16">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No certificates yet. Complete a course to earn your certificate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{cert.course}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Certificate #{cert.number}</p>
                    <p className="text-xs text-muted-foreground mt-1">Issued: {cert.issued}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
