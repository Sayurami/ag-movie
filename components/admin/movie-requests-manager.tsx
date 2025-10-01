"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import type { MovieRequest } from "@/lib/types"
import { Mail, Phone, Calendar, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function MovieRequestsManager() {
  const [requests, setRequests] = useState<MovieRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [editingRequest, setEditingRequest] = useState<MovieRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed" | "rejected">("pending")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Load movie requests
  const loadRequests = async () => {
    const supabase = createClient()
    try {
      let query = supabase.from("movie_requests").select("*").order("created_at", { ascending: false })
      
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error("Error loading requests:", error)
        // If auth error, show empty state
        if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
          setRequests([])
          return
        }
        throw error
      }
      setRequests(data || [])
    } catch (error) {
      console.error("Failed to load movie requests:", error)
      setRequests([])
      toast({
        title: "Error",
        description: "Failed to load movie requests. Please check your database connection.",
        variant: "destructive",
      })
    }
  }

  // Update request status and notes
  const handleUpdateRequest = async () => {
    if (!editingRequest) return

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("movie_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingRequest.id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Request updated successfully",
      })
      setEditingRequest(null)
      loadRequests()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      })
    }
  }

  // Delete request
  const handleDeleteRequest = async (requestId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("movie_requests")
        .delete()
        .eq("id", requestId)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Request deleted successfully",
      })
      loadRequests()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      })
    }
  }

  // Edit request
  const handleEditRequest = (request: MovieRequest) => {
    setEditingRequest(request)
    setAdminNotes(request.admin_notes || "")
    setStatus(request.status)
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in_progress":
        return "default"
      case "completed":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Load requests on component mount
  useEffect(() => {
    setMounted(true)
    loadRequests()
  }, [filterStatus])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Movie Requests ({requests.length})</h3>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadRequests} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No movie requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{request.title}</h4>
                      <Badge variant={getStatusBadgeVariant(request.status)} className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {request.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">
                        {request.type === "movie" ? "Movie" : "TV Show"}
                      </Badge>
                      {request.year && (
                        <Badge variant="outline">{request.year}</Badge>
                      )}
                    </div>
                    {request.description && (
                      <p className="text-muted-foreground mb-3">{request.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditRequest(request)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Request</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the request for "{request.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRequest(request.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{request.requester_email}</span>
                  </div>
                  {request.requester_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{request.requester_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Requested:</span>
                    <span className="text-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="text-foreground">
                      {new Date(request.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {request.admin_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h5 className="font-semibold text-sm mb-1">Admin Notes:</h5>
                    <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Request Dialog */}
      {editingRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Request: {editingRequest.title}
            </CardTitle>
            <CardDescription>Update the request status and add admin notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "pending" | "in_progress" | "completed" | "rejected") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add notes about this request..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                These notes are for internal use and won't be shared with the requester
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateRequest} disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Request"}
              </Button>
              <Button onClick={() => setEditingRequest(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
