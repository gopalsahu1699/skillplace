'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>
      <div className="bg-white border border-border rounded-xl p-6 max-w-2xl">
        <div className="flex items-center gap-6 mb-6">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">S</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Student User</h2>
            <p className="text-sm text-muted-foreground">student@example.com</p>
          </div>
        </div>
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue="Student User" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="student@example.com" disabled />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+91 9876543210" />
            </div>
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 max-w-2xl mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
        <form className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button type="submit" variant="outline">Update Password</Button>
        </form>
      </div>
    </div>
  )
}
