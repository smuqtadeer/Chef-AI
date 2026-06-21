import * as webSearch from './webSearch.js'
import * as webFetch from './webFetch.js'
import * as compareVehicles from './compareVehicles.js'
import * as estimateCarPayment from './estimateCarPayment.js'
import * as getMaintenanceSchedule from './getMaintenanceSchedule.js'

const TOOL_MODULES = [
  webSearch,
  webFetch,
  compareVehicles,
  estimateCarPayment,
  getMaintenanceSchedule,
]

export const TOOL_DEFINITIONS = TOOL_MODULES.map(m => m.definition)

export const TOOL_LABELS = {
  web_search: '🔍 Searching the web',
  web_fetch: '🌐 Fetching page',
  compare_vehicles: '⚖️ Comparing vehicles',
  estimate_car_payment: '💰 Calculating payment',
  get_maintenance_schedule: '🔧 Checking maintenance schedule',
}

export function formatToolInput(name, input) {
  switch (name) {
    case 'web_search':
      return `query: "${input.query}"`
    case 'web_fetch':
      return `url: ${input.url}`
    case 'compare_vehicles':
      return `${input.vehicle_a} vs ${input.vehicle_b}`
    case 'estimate_car_payment':
      return `$${input.vehicle_price?.toLocaleString()} · ${input.annual_interest_rate}% APR · ${input.loan_term_months} mo`
    case 'get_maintenance_schedule':
      return `${input.vehicle_type} · ${input.current_mileage?.toLocaleString()} mi`
    default:
      return JSON.stringify(input, null, 2)
  }
}

export function formatToolResultSummary(name, result) {
  if (result?.error) return `Error: ${result.error}`

  switch (name) {
    case 'web_search':
      return `${result.resultCount ?? 0} result(s) found`
    case 'web_fetch':
      return result.contentLength ? `${result.contentLength.toLocaleString()} chars fetched` : 'Page fetched'
    case 'compare_vehicles':
      if (result.differences?.msrp) {
        return `Cheaper: ${result.differences.msrp.cheaper}`
      }
      return 'Comparison complete'
    case 'estimate_car_payment':
      return result.monthly_payment ? `${result.monthly_payment}/mo` : 'Calculated'
    case 'get_maintenance_schedule':
      return result.upcoming_services?.length
        ? `Next: ${result.upcoming_services[0].at_mileage}`
        : 'Schedule loaded'
    default:
      return 'Done'
  }
}

const executors = Object.fromEntries(TOOL_MODULES.map(m => [m.definition.name, m.execute]))

export async function executeTool(name, input) {
  const fn = executors[name]
  if (!fn) return { error: `Unknown tool: ${name}` }
  return fn(input)
}
