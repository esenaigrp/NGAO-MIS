import { Incident } from "../store/slices/incidentsSlice"

export interface DashboardStats {
  incidents: {
    stats: {
      open: number
      urgent: number
      resolved_today: number
    }
    list: Incident[]
    byType: {
      name: string
      value: number
    }[]
    trend: {
      month: string
      count: number
    }[]
  }

  births: {
    total: number
    thisMonth: number
    trend: {
      month: string
      count: number
    }[]
    byGender: {
      name: "Male" | "Female"
      value: number
    }[]
  }

  deaths: {
    total: number
    thisMonth: number
    trend: {
      month: string
      count: number
    }[]
    byAgeGroup: {
      name: "0-18" | "19-35" | "36-60" | "60+"
      value: number
    }[]
  }

  marriages: {
    total: number
    thisMonth: number
    trend: {
      month: string
      count: number
    }[]
  }
}
