'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Search, History } from 'lucide-react'

export default function AuditLogsPage() {
  const { auditLogs, employees } = useData()
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string>('all')

  const filteredLogs = auditLogs
    .filter(log => {
      const performer = employees.find(e => e.id === log.performed_by)
      const matchSearch = log.module.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
        performer?.full_name.toLowerCase().includes(search.toLowerCase())
      const matchModule = moduleFilter === 'all' || log.module === moduleFilter
      return matchSearch && matchModule
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const modules = [...new Set(auditLogs.map(l => l.module))]

  const getActionColor = (metadata: Record<string, unknown> | null) => {
    const action = metadata?.action as string
    switch (action) {
      case 'create': return 'bg-green-500/10 text-green-500'
      case 'update': return 'bg-blue-500/10 text-blue-500'
      case 'delete': return 'bg-red-500/10 text-red-500'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatChanges = (oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null) => {
    if (!oldValue && newValue) {
      return Object.entries(newValue).map(([key, value]) => (
        <div key={key} className="text-xs">
          <span className="text-muted-foreground">{key}:</span>{' '}
          <span className="text-green-600">{String(value)}</span>
        </div>
      )).slice(0, 3)
    }
    if (oldValue && newValue) {
      return Object.entries(newValue).map(([key, value]) => {
        const oldVal = oldValue[key]
        if (oldVal !== value) {
          return (
            <div key={key} className="text-xs">
              <span className="text-muted-foreground">{key}:</span>{' '}
              <span className="text-red-600 line-through">{String(oldVal)}</span>{' '}
              <span className="text-green-600">{String(value)}</span>
            </div>
          )
        }
        return null
      }).filter(Boolean).slice(0, 3)
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system changes and activities</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Activity Log ({auditLogs.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module} className="capitalize">{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => {
                  const performer = employees.find(e => e.id === log.performed_by)
                  const action = log.metadata?.action as string
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                      <TableCell className="capitalize">{log.module}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm capitalize">{log.entity_type}</p>
                          <p className="text-xs text-muted-foreground font-mono">{log.entity_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.metadata)}>
                          {action || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {formatChanges(log.old_value, log.new_value)}
                      </TableCell>
                      <TableCell>{performer?.full_name || log.performed_by}</TableCell>
                    </TableRow>
                  )
                })}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
