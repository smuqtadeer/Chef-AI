export const definition = {
  name: 'estimate_car_payment',
  description:
    'Calculate estimated monthly car loan payments. Use when helping users figure out affordability, budget, or comparing financing options.',
  input_schema: {
    type: 'object',
    properties: {
      vehicle_price: { type: 'number', description: 'Total vehicle price in dollars' },
      down_payment: { type: 'number', description: 'Down payment amount in dollars (default 0)' },
      annual_interest_rate: { type: 'number', description: 'Annual interest rate as a percentage, e.g. 6.5 for 6.5% APR' },
      loan_term_months: { type: 'number', description: 'Loan term in months, e.g. 60 for 5 years' },
      trade_in_value: { type: 'number', description: 'Trade-in value in dollars (default 0)' },
    },
    required: ['vehicle_price', 'annual_interest_rate', 'loan_term_months'],
  },
}

export async function execute({
  vehicle_price,
  down_payment = 0,
  annual_interest_rate,
  loan_term_months,
  trade_in_value = 0,
}) {
  const principal = vehicle_price - down_payment - trade_in_value

  if (principal <= 0) {
    return {
      vehicle_price,
      down_payment,
      trade_in_value,
      principal: 0,
      monthly_payment: 0,
      note: 'No loan needed — down payment and trade-in cover the full price.',
    }
  }

  const monthlyRate = annual_interest_rate / 100 / 12
  let monthlyPayment

  if (monthlyRate === 0) {
    monthlyPayment = principal / loan_term_months
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, loan_term_months)) /
      (Math.pow(1 + monthlyRate, loan_term_months) - 1)
  }

  const totalPaid = monthlyPayment * loan_term_months
  const totalInterest = totalPaid - principal

  return {
    vehicle_price: `$${vehicle_price.toLocaleString()}`,
    down_payment: `$${down_payment.toLocaleString()}`,
    trade_in_value: `$${trade_in_value.toLocaleString()}`,
    loan_amount: `$${Math.round(principal).toLocaleString()}`,
    annual_interest_rate: `${annual_interest_rate}%`,
    loan_term: `${loan_term_months} months (${loan_term_months / 12} years)`,
    monthly_payment: `$${monthlyPayment.toFixed(2)}`,
    total_paid: `$${Math.round(totalPaid).toLocaleString()}`,
    total_interest: `$${Math.round(totalInterest).toLocaleString()}`,
    tip: 'Actual payments may vary with taxes, fees, insurance, and dealer add-ons.',
  }
}
