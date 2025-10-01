"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Send, CheckCircle } from "lucide-react"

interface RequestMovieFormProps {
  initialTitle?: string
  initialType?: "movie" | "tv_show"
}

export function RequestMovieForm({ initialTitle = "", initialType = "movie" }: RequestMovieFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [type, setType] = useState<"movie" | "tv_show">(initialType)
  const [year, setYear] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least the title and your email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("movie_requests")
        .insert([{
          title: title.trim(),
          type,
          year: year ? parseInt(year) : null,
          description: description.trim() || null,
          requester_email: email.trim(),
          requester_phone: phone.trim() || null,
          status: "pending",
        }])

      if (error) throw error

      setSubmitted(true)
      toast({
        title: "Request Submitted",
        description: "Thank you! We'll review your request and get back to you within 2-5 business days.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h2>
          <p className="text-muted-foreground mb-4">
            Thank you for your request. We'll review it and get back to you within 2-5 business days.
          </p>
          <p className="text-sm text-muted-foreground">
            We'll contact you at <strong>{email}</strong> with updates.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Content</CardTitle>
        <CardDescription>
          Help us improve our library by requesting movies or TV shows you'd like to see.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter movie or TV show title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(value: "movie" | "tv_show") => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv_show">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="year">Year (Optional)</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2023"
              min="1900"
              max="2030"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional information about the content you're requesting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll use this to contact you about your request
              </p>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                For urgent requests or follow-up
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• We'll review your request within 2-5 business days</li>
              <li>• If we have the content, we'll add it to our library</li>
              <li>• We'll notify you via email when it's available</li>
              <li>• If we can't find it, we'll let you know and keep your request on file</li>
            </ul>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
