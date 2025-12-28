export interface DashboardStats {
  total_incidents: number
  open_incidents: number
  resolved_incidents: number
  responses: number
  stats: {
    open: number
    urgent: number
    resolved_today: number
  }
  assigned: any[]
}
