// Freedom Point Calculator — Core Logic
// Ported from Volare's original FreedomPoint_Calculator.html

export interface DebtItem {
  label: string;
  amount: number;
}

export interface CalculatorInputs {
  // Section 1: Income Replacement
  income: number;
  otherIncome: number;
  // Section 2: Personal Assets
  savings: number;
  inheritance: number;
  otherAssets: number;
  personalDebt: number;
  // Section 3: Business Debt
  businessDebts: DebtItem[];
  // Section 4: Transaction Costs
  taxRate: number;
  feeRate: number;
  // Section 5: Valuation
  ebitda: number;
  multMin: number;
  multMax: number;
  healthScore: number;
}

export interface CalculatorResults {
  // Section 1
  incomeToCover: number;
  nestEgg: number;
  // Section 2
  grossPersonalAssets: number;
  netPersonalAssets: number;
  // Section 3
  totalBusinessDebt: number;
  // Freedom Point
  netProceedsRequired: number;
  taxOnProceeds: number;
  fees: number;
  grossSalePriceNeeded: number;
  // Valuation
  currentMultiple: number;
  currentValuation: number;
  valuationAt60: number;
  valuationAt80: number;
  valuationAt100: number;
  multipleAt60: number;
  multipleAt80: number;
  multipleAt100: number;
  // Gap
  gap: number;
  progressPercent: number;
  isAboveFreedomPoint: boolean;
  // Flags
  hasIncomeData: boolean;
  hasAssetData: boolean;
  hasDebtData: boolean;
  hasValuationData: boolean;
  hasFullData: boolean;
}

const ANCHORS: [number, number][] = [
  [0, 0],
  [31, 0.199],
  [60, 0.426],
  [80, 0.65],
  [100, 1.0],
];

function getMultiple(health: number, lo: number, hi: number): number {
  health = Math.max(0, Math.min(100, health));
  let f = 0;
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [h0, f0] = ANCHORS[i];
    const [h1, f1] = ANCHORS[i + 1];
    if (health >= h0 && health <= h1) {
      f = f0 + ((health - h0) / (h1 - h0)) * (f1 - f0);
      break;
    }
  }
  return lo + f * (hi - lo);
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    income, otherIncome, savings, inheritance, otherAssets, personalDebt,
    businessDebts, taxRate, feeRate, ebitda, multMin, multMax, healthScore,
  } = inputs;

  const lo = multMin || 1.15;
  const hi = multMax || 7.84;
  const taxPct = (taxRate || 20) / 100;
  const feePct = (feeRate || 12) / 100;
  const frictional = taxPct + feePct;

  // Section 1: Income Replacement
  const incomeToCover = Math.max(0, income - otherIncome);
  const nestEgg = incomeToCover * 33;

  // Section 2: Personal Assets
  const grossPersonalAssets = savings + inheritance + otherAssets;
  const netPersonalAssets = Math.max(0, grossPersonalAssets - personalDebt);

  // Section 3: Business Debt
  const totalBusinessDebt = businessDebts.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Freedom Point
  const hasIncomeData = income > 0;
  const hasAssetData = grossPersonalAssets > 0;
  const hasDebtData = totalBusinessDebt > 0;
  const hasValuationData = ebitda > 0;
  const hasFullData = hasIncomeData && hasAssetData;

  const netProceedsRequired = Math.max(0, nestEgg - netPersonalAssets + totalBusinessDebt);
  const grossSalePriceNeeded = netProceedsRequired > 0 ? netProceedsRequired / (1 - frictional) : 0;
  const taxOnProceeds = grossSalePriceNeeded * taxPct;
  const fees = grossSalePriceNeeded * feePct;

  // Valuation
  const currentMultiple = getMultiple(healthScore, lo, hi);
  const currentValuation = hasValuationData ? ebitda * currentMultiple : 0;
  const multipleAt60 = getMultiple(60, lo, hi);
  const multipleAt80 = getMultiple(80, lo, hi);
  const multipleAt100 = getMultiple(100, lo, hi);
  const valuationAt60 = hasValuationData ? ebitda * multipleAt60 : 0;
  const valuationAt80 = hasValuationData ? ebitda * multipleAt80 : 0;
  const valuationAt100 = hasValuationData ? ebitda * multipleAt100 : 0;

  // Gap
  const gap = grossSalePriceNeeded - currentValuation;
  const progressPercent = grossSalePriceNeeded > 0
    ? Math.min(100, Math.round((currentValuation / grossSalePriceNeeded) * 100))
    : 0;
  const isAboveFreedomPoint = gap <= 0 && hasFullData && hasValuationData;

  return {
    incomeToCover, nestEgg,
    grossPersonalAssets, netPersonalAssets,
    totalBusinessDebt,
    netProceedsRequired, taxOnProceeds, fees, grossSalePriceNeeded,
    currentMultiple, currentValuation,
    valuationAt60, valuationAt80, valuationAt100,
    multipleAt60, multipleAt80, multipleAt100,
    gap, progressPercent, isAboveFreedomPoint,
    hasIncomeData, hasAssetData, hasDebtData, hasValuationData, hasFullData,
  };
}

export function formatCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}
