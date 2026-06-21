const SCHEDULES = {
  sedan: {
    '5,000': ['Oil & filter change', 'Tire rotation', 'Fluid level check'],
    '15,000': ['Replace cabin air filter', 'Inspect brake pads', 'Check battery'],
    '30,000': ['Replace engine air filter', 'Inspect spark plugs', 'Flush brake fluid'],
    '60,000': ['Replace spark plugs', 'Inspect timing belt/chain', 'Service transmission fluid'],
    '90,000': ['Replace timing belt (if applicable)', 'Inspect suspension components', 'Flush coolant'],
    '100,000': ['Replace serpentine belt', 'Full brake inspection', 'Check wheel bearings'],
  },
  suv: {
    '5,000': ['Oil & filter change', 'Tire rotation', 'Inspect CV joints'],
    '15,000': ['Replace cabin air filter', 'Inspect brake pads', 'Check 4WD/AWD system'],
    '30,000': ['Replace engine air filter', 'Inspect differential fluid', 'Check transfer case'],
    '60,000': ['Replace spark plugs', 'Service transmission fluid', 'Inspect suspension bushings'],
    '90,000': ['Replace timing belt (if applicable)', 'Flush coolant', 'Inspect driveshaft'],
    '100,000': ['Full drivetrain inspection', 'Replace serpentine belt', 'Check wheel bearings'],
  },
  truck: {
    '5,000': ['Oil & filter change', 'Tire rotation', 'Inspect trailer hitch'],
    '15,000': ['Replace cabin air filter', 'Inspect brake pads', 'Check towing components'],
    '30,000': ['Replace engine air filter', 'Inspect differential fluid', 'Check frame for rust'],
    '60,000': ['Replace spark plugs', 'Service transmission fluid', 'Inspect leaf springs'],
    '90,000': ['Replace timing belt (if applicable)', 'Flush coolant', 'Inspect bed liner/mounts'],
    '100,000': ['Full drivetrain inspection', 'Replace serpentine belt', 'Check towing capacity components'],
  },
  sports: {
    '5,000': ['Synthetic oil change', 'Tire rotation & pressure check', 'Brake inspection'],
    '10,000': ['Inspect brake fluid', 'Check suspension bushings', 'Wheel alignment check'],
    '20,000': ['Replace engine air filter', 'Inspect brake pads & rotors', 'Check clutch (manual)'],
    '40,000': ['Replace spark plugs', 'Flush brake fluid', 'Inspect performance tires'],
    '60,000': ['Service transmission fluid', 'Inspect timing components', 'Check exhaust system'],
    '100,000': ['Full performance inspection', 'Replace belts', 'Suspension rebuild assessment'],
  },
  ev: {
    '7,500': ['Tire rotation', 'Brake fluid check', 'Cabin air filter inspection'],
    '15,000': ['Replace cabin air filter', 'Inspect brake pads (regen braking)', 'Check coolant (battery)'],
    '30,000': ['Brake fluid flush', 'Inspect suspension', 'Battery health check'],
    '60,000': ['Replace wiper blades', 'Full brake inspection', 'Check charging port'],
    '100,000': ['Battery coolant service', 'Inspect high-voltage cables', 'Software update check'],
  },
}

export const definition = {
  name: 'get_maintenance_schedule',
  description:
    'Get typical maintenance schedule and service items for a vehicle type at a given mileage. Vehicle types: sedan, suv, truck, sports, ev.',
  input_schema: {
    type: 'object',
    properties: {
      vehicle_type: {
        type: 'string',
        enum: ['sedan', 'suv', 'truck', 'sports', 'ev'],
        description: 'Type of vehicle',
      },
      current_mileage: {
        type: 'number',
        description: 'Current odometer reading in miles',
      },
    },
    required: ['vehicle_type', 'current_mileage'],
  },
}

export async function execute({ vehicle_type, current_mileage }) {
  const schedule = SCHEDULES[vehicle_type]
  if (!schedule) {
    return { error: `Unknown vehicle type "${vehicle_type}". Use: sedan, suv, truck, sports, or ev.` }
  }

  const milestones = Object.keys(schedule).map(Number).sort((a, b) => a - b)
  const upcoming = milestones.filter(m => m >= current_mileage).slice(0, 3)
  const overdue = milestones.filter(m => m < current_mileage && m >= current_mileage - 10000)

  const result = {
    vehicle_type,
    current_mileage: `${current_mileage.toLocaleString()} miles`,
    upcoming_services: upcoming.map(m => ({
      at_mileage: `${m.toLocaleString()} miles`,
      miles_until: m - current_mileage,
      services: schedule[m.toLocaleString()],
    })),
    possibly_overdue: overdue.map(m => ({
      at_mileage: `${m.toLocaleString()} miles`,
      services: schedule[m.toLocaleString()],
    })),
    full_schedule: Object.entries(schedule).map(([mileage, services]) => ({
      mileage: `${mileage} miles`,
      services,
    })),
    tip: 'Always check your owner\'s manual for manufacturer-specific intervals.',
  }

  return result
}
