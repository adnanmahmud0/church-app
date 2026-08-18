"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { HeartIcon, PencilIcon, TrashIcon, PlusIcon, LandmarkIcon, SmartphoneIcon } from "lucide-react"
import { GivingMobilePreview } from "@/components/giving-mobile-preview"
import { PageSkeleton } from "@/components/page-skeleton"

export default function GivingDashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [funds, setFunds] = useState<any[]>([])
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isFundModalOpen, setIsFundModalOpen] = useState(false)
  const [editingFund, setEditingFund] = useState<any>(null)
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [sumRes, fundsRes, bankRes] = await Promise.all([
        apiFetch("/giving/summary"),
        apiFetch("/giving/funds"),
        apiFetch("/giving/bank-details")
      ])
      
      if (sumRes.success) setSummary(sumRes.data)
      if (fundsRes.success) setFunds(fundsRes.data)
      if (bankRes.success) setBankDetails(bankRes.data)
    } catch (error) {
      toast.error("Failed to load giving data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveFund = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      icon: formData.get("icon") as string,
      color: formData.get("color") as string,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
      isActive: formData.get("isActive") === "on",
    }

    try {
      if (editingFund) {
        await apiFetch(`/giving/funds/${editingFund._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        })
        toast.success("Fund updated")
      } else {
        await apiFetch("/giving/funds", {
          method: "POST",
          body: JSON.stringify(payload)
        })
        toast.success("Fund created")
      }
      setIsFundModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to save fund")
    }
  }

  const handleDeleteFund = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fund?")) return
    try {
      await apiFetch(`/giving/funds/${id}`, { method: "DELETE" })
      toast.success("Fund deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete fund")
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return
    try {
      await apiFetch(`/giving/transactions/${id}`, { method: "DELETE" })
      toast.success("Transaction deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete transaction")
    }
  }

  const handleSaveBankDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      accountName: formData.get("accountName") as string,
      sortCode: formData.get("sortCode") as string,
      accountNumber: formData.get("accountNumber") as string,
      note: formData.get("note") as string,
    }

    try {
      await apiFetch("/giving/bank-details", {
        method: "PATCH",
        body: JSON.stringify(payload)
      })
      toast.success("Bank details updated")
      fetchData()
    } catch (error) {
      toast.error("Failed to update bank details")
    }
  }

  const openFundModal = (fund?: any) => {
    setEditingFund(fund || null)
    setIsFundModalOpen(true)
  }

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Giving & Donations</h2>
          <Button variant="outline" size="icon" onClick={() => setIsMobilePreviewOpen(true)} title="View Mobile App Visualization" className="rounded-full">
            <SmartphoneIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total This Year</CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{summary?.totalThisYear?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <LandmarkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{summary?.totalThisMonth?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalDonors || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.recentTransactions?.length || 0} (Recent)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* RECENT TRANSACTIONS */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest 10 donations across all funds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary?.recentTransactions?.map((txn: any) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">{txn.donor}</TableCell>
                    <TableCell>{txn.fund}</TableCell>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell className="text-right">£{txn.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(txn.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {summary?.recentTransactions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No recent transactions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* BANK DETAILS */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
            <CardDescription>
              These details are shown to users to complete their transfer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" name="accountName" defaultValue={bankDetails?.accountName} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortCode">Sort Code</Label>
                  <Input id="sortCode" name="sortCode" defaultValue={bankDetails?.sortCode} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account No.</Label>
                  <Input id="accountNumber" name="accountNumber" defaultValue={bankDetails?.accountNumber} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Instructions Note</Label>
                <Input id="note" name="note" defaultValue={bankDetails?.note} required />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* FUND MANAGEMENT */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fund Categories</CardTitle>
            <CardDescription>Manage active giving funds.</CardDescription>
          </div>
          <Dialog open={isFundModalOpen} onOpenChange={setIsFundModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openFundModal()}><PlusIcon className="mr-2 h-4 w-4" /> Add Fund</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFund ? 'Edit Fund' : 'Create Fund'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveFund} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Fund Name</Label>
                  <Input id="name" name="name" defaultValue={editingFund?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" defaultValue={editingFund?.description} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (slug)</Label>
                    <Input id="icon" name="icon" defaultValue={editingFund?.icon || "dollar-sign"} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color (Hex)</Label>
                    <Input id="color" name="color" type="color" defaultValue={editingFund?.color || "#3B82F6"} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input id="sortOrder" name="sortOrder" type="number" defaultValue={editingFund?.sortOrder || 0} required />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="isActive" name="isActive" defaultChecked={editingFund ? editingFund.isActive : true} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <Button type="submit" className="w-full mt-4">Save Fund</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map((fund: any) => (
                <TableRow key={fund._id}>
                  <TableCell>{fund.sortOrder}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: fund.color }}></div>
                      {fund.name}
                    </div>
                  </TableCell>
                  <TableCell>{fund.description}</TableCell>
                  <TableCell>
                    <Badge variant={fund.isActive ? "default" : "secondary"}>
                      {fund.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openFundModal(fund)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteFund(fund._id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <DialogContent className="sm:max-w-max bg-transparent border-none shadow-none p-0 flex justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Mobile App Preview</DialogTitle>
          <GivingMobilePreview summary={summary} funds={funds} bankDetails={bankDetails} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
