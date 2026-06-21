const VEHICLE_DB = {
  'honda civic': { make: 'Honda', model: 'Civic', year: 2024, type: 'sedan', hp: 158, torque: 138, zeroToSixty: 7.5, mpg: '32/42', msrp: 24650, drivetrain: 'FWD', engine: '2.0L I4' },
  'toyota camry': { make: 'Toyota', model: 'Camry', year: 2024, type: 'sedan', hp: 203, torque: 184, zeroToSixty: 7.2, mpg: '28/39', msrp: 26400, drivetrain: 'FWD', engine: '2.5L I4' },
  'toyota corolla': { make: 'Toyota', model: 'Corolla', year: 2024, type: 'sedan', hp: 169, torque: 151, zeroToSixty: 7.8, mpg: '32/41', msrp: 22350, drivetrain: 'FWD', engine: '2.0L I4' },
  'ford mustang': { make: 'Ford', model: 'Mustang', year: 2024, type: 'sports', hp: 315, torque: 350, zeroToSixty: 4.8, mpg: '19/28', msrp: 32515, drivetrain: 'RWD', engine: '2.3L Turbo I4' },
  'chevrolet corvette': { make: 'Chevrolet', model: 'Corvette', year: 2024, type: 'sports', hp: 490, torque: 465, zeroToSixty: 2.9, mpg: '16/24', msrp: 68300, drivetrain: 'RWD', engine: '6.2L V8' },
  'tesla model 3': { make: 'Tesla', model: 'Model 3', year: 2024, type: 'ev', hp: 283, torque: 310, zeroToSixty: 4.2, mpg: '132 MPGe', msrp: 38990, drivetrain: 'RWD', engine: 'Electric' },
  'tesla model y': { make: 'Tesla', model: 'Model Y', year: 2024, type: 'ev', hp: 295, torque: 310, zeroToSixty: 4.8, mpg: '122 MPGe', msrp: 43990, drivetrain: 'AWD', engine: 'Electric' },
  'bmw m3': { make: 'BMW', model: 'M3', year: 2024, type: 'sports', hp: 473, torque: 406, zeroToSixty: 3.8, mpg: '16/23', msrp: 74900, drivetrain: 'RWD', engine: '3.0L Turbo I6' },
  'jeep wrangler': { make: 'Jeep', model: 'Wrangler', year: 2024, type: 'suv', hp: 285, torque: 260, zeroToSixty: 6.2, mpg: '17/25', msrp: 32995, drivetrain: '4WD', engine: '3.6L V6' },
  'ford f-150': { make: 'Ford', model: 'F-150', year: 2024, type: 'truck', hp: 325, torque: 400, zeroToSixty: 5.9, mpg: '19/24', msrp: 36380, drivetrain: '4WD', engine: '2.7L Turbo V6' },
  'honda cr-v': { make: 'Honda', model: 'CR-V', year: 2024, type: 'suv', hp: 190, torque: 179, zeroToSixty: 7.8, mpg: '28/34', msrp: 29600, drivetrain: 'FWD', engine: '1.5L Turbo I4' },
  'toyota rav4': { make: 'Toyota', model: 'RAV4', year: 2024, type: 'suv', hp: 203, torque: 184, zeroToSixty: 7.8, mpg: '27/35', msrp: 28675, drivetrain: 'AWD', engine: '2.5L I4' },
  'porsche 911': { make: 'Porsche', model: '911', year: 2024, type: 'sports', hp: 379, torque: 331, zeroToSixty: 3.8, mpg: '18/25', msrp: 106100, drivetrain: 'RWD', engine: '3.0L Turbo Flat-6' },
  'mazda mx-5': { make: 'Mazda', model: 'MX-5 Miata', year: 2024, type: 'sports', hp: 181, torque: 151, zeroToSixty: 5.7, mpg: '26/34', msrp: 28675, drivetrain: 'RWD', engine: '2.0L I4' },
  'subaru wrx': { make: 'Subaru', model: 'WRX', year: 2024, type: 'sports', hp: 271, torque: 258, zeroToSixty: 5.4, mpg: '19/26', msrp: 32000, drivetrain: 'AWD', engine: '2.4L Turbo Boxer-4' },
  'hyundai ioniq 5': { make: 'Hyundai', model: 'Ioniq 5', year: 2024, type: 'ev', hp: 225, torque: 258, zeroToSixty: 7.4, mpg: '110 MPGe', msrp: 41500, drivetrain: 'RWD', engine: 'Electric' },
  'rivian r1t': { make: 'Rivian', model: 'R1T', year: 2024, type: 'truck', hp: 533, torque: 610, zeroToSixty: 3.5, mpg: '70 MPGe', msrp: 73000, drivetrain: 'AWD', engine: 'Electric' },
  'lamborghini huracan': { make: 'Lamborghini', model: 'Huracán', year: 2024, type: 'sports', hp: 631, torque: 417, zeroToSixty: 2.8, mpg: '13/18', msrp: 274838, drivetrain: 'AWD', engine: '5.2L V10' },
}

function lookupVehicle(name) {
  const key = name.toLowerCase().trim()
  if (VEHICLE_DB[key]) return VEHICLE_DB[key]

  for (const [dbKey, specs] of Object.entries(VEHICLE_DB)) {
    if (key.includes(dbKey) || dbKey.includes(key)) return specs
    const fullName = `${specs.make} ${specs.model}`.toLowerCase()
    if (key.includes(fullName) || fullName.includes(key)) return specs
  }
  return null
}

export const definition = {
  name: 'compare_vehicles',
  description:
    'Compare two vehicles side-by-side using the built-in spec database. Works for popular models like Civic, Camry, Mustang, Model 3, F-150, etc. Use web_search for vehicles not in the database.',
  input_schema: {
    type: 'object',
    properties: {
      vehicle_a: { type: 'string', description: 'First vehicle, e.g. "Honda Civic" or "Tesla Model 3"' },
      vehicle_b: { type: 'string', description: 'Second vehicle, e.g. "Toyota Corolla" or "BMW M3"' },
    },
    required: ['vehicle_a', 'vehicle_b'],
  },
}

export async function execute({ vehicle_a, vehicle_b }) {
  const a = lookupVehicle(vehicle_a)
  const b = lookupVehicle(vehicle_b)

  if (!a && !b) {
    return {
      error: `Neither "${vehicle_a}" nor "${vehicle_b}" found in database. Try web_search for these models.`,
      availableVehicles: Object.keys(VEHICLE_DB).map(k => VEHICLE_DB[k].make + ' ' + VEHICLE_DB[k].model),
    }
  }

  const comparison = {
    vehicle_a: a ? { name: `${a.make} ${a.model} (${a.year})`, ...a } : { name: vehicle_a, found: false },
    vehicle_b: b ? { name: `${b.make} ${b.model} (${b.year})`, ...b } : { name: vehicle_b, found: false },
  }

  if (a && b) {
    comparison.differences = {
      horsepower: { a: a.hp, b: b.hp, winner: a.hp > b.hp ? a.make + ' ' + a.model : b.make + ' ' + b.model },
      zero_to_sixty: { a: a.zeroToSixty + 's', b: b.zeroToSixty + 's', winner: a.zeroToSixty < b.zeroToSixty ? a.make + ' ' + a.model : b.make + ' ' + b.model },
      msrp: { a: '$' + a.msrp.toLocaleString(), b: '$' + b.msrp.toLocaleString(), cheaper: a.msrp < b.msrp ? a.make + ' ' + a.model : b.make + ' ' + b.model },
      fuel_economy: { a: a.mpg, b: b.mpg },
      drivetrain: { a: a.drivetrain, b: b.drivetrain },
    }
  }

  if (!a) comparison.note_a = `"${vehicle_a}" not in database — use web_search for specs.`
  if (!b) comparison.note_b = `"${vehicle_b}" not in database — use web_search for specs.`

  return comparison
}
