/**
 * Barez ERP — Double-Entry Accounting Engine
 * Pure functions: given journals + chart of accounts, compute
 * balances, trial balance, and IFRS financial statements.
 * No I/O — fully testable and reusable on server or client.
 */
import type { Account, Journal, AccountType } from '@/types/accounting'

export interface AccountBalance { debit: number; credit: number }
export type BalanceMap = Record<string, AccountBalance>

/** Arabic-Egyptian number formatting with 2 decimals. */
export function fmt(n: number | null | undefined): string {
  return Number(n || 0).toLocaleString('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Sum debit/credit per account code across all journal lines. */
export function calcBalances(journals: Journal[], accounts: Account[]): BalanceMap {
  const b: BalanceMap = {}
  accounts.forEach(a => { b[a.code] = { debit: 0, credit: 0 } })
  journals.forEach(j => (j.lines ?? []).forEach(l => {
    if (!b[l.account_code]) b[l.account_code] = { debit: 0, credit: 0 }
    b[l.account_code].debit  += Number(l.debit)  || 0
    b[l.account_code].credit += Number(l.credit) || 0
  }))
  return b
}

/** Net signed balance of an account respecting its normal side. */
export function accountNet(acc: Account, bal: AccountBalance | undefined): number {
  const d = bal?.debit ?? 0, c = bal?.credit ?? 0
  return acc.normal_balance === 'debit' ? d - c : c - d
}

export interface JournalFilter {
  projectId?: string | null   // null/undefined or 'all' = every project
  month?: string | null       // '01'..'12'
  year?: string | null        // '2026'
}

export function filterJournals(journals: Journal[], f: JournalFilter): Journal[] {
  return journals.filter(j => {
    if (f.projectId && f.projectId !== 'all' && j.project_id !== f.projectId) return false
    if (f.month && j.entry_date?.slice(5, 7) !== f.month) return false
    if (f.year  && j.entry_date?.slice(0, 4) !== f.year)  return false
    return true
  })
}

// ── Trial Balance ──────────────────────────────────────────
export interface TrialBalanceRow {
  code: string; name: string; standard: string | null
  debit: number; credit: number; net: number
}
export interface TrialBalance {
  rows: TrialBalanceRow[]
  totalDebit: number; totalCredit: number; difference: number; balanced: boolean
}

export function trialBalance(journals: Journal[], accounts: Account[]): TrialBalance {
  const bal = calcBalances(journals, accounts)
  let totalDebit = 0, totalCredit = 0
  const rows: TrialBalanceRow[] = []
  accounts.forEach(a => {
    const b = bal[a.code] ?? { debit: 0, credit: 0 }
    if (!b.debit && !b.credit) return
    totalDebit += b.debit; totalCredit += b.credit
    rows.push({ code: a.code, name: a.name, standard: a.standard,
      debit: b.debit, credit: b.credit, net: accountNet(a, b) })
  })
  const difference = Math.abs(totalDebit - totalCredit)
  return { rows, totalDebit, totalCredit, difference, balanced: difference < 0.01 }
}

// ── Profit & Loss (IAS 1) ──────────────────────────────────
export interface PLLine { code: string; name: string; standard: string | null; amount: number }
export interface ProfitLoss {
  revenue: PLLine[]; expenses: PLLine[]
  totalRevenue: number; totalExpenses: number; net: number; margin: number
}

export function profitLoss(journals: Journal[], accounts: Account[]): ProfitLoss {
  const bal = calcBalances(journals, accounts)
  const pick = (type: AccountType) => accounts
    .filter(a => a.type === type)
    .map(a => ({ code: a.code, name: a.name, standard: a.standard, amount: accountNet(a, bal[a.code]) }))
    .filter(x => x.amount !== 0)
  const revenue  = pick('revenue')
  const expenses = pick('expense')
  const totalRevenue  = revenue.reduce((s, x) => s + x.amount, 0)
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0)
  const net = totalRevenue - totalExpenses
  return { revenue, expenses, totalRevenue, totalExpenses, net,
    margin: totalRevenue > 0 ? Math.round((net / totalRevenue) * 100) : 0 }
}

// ── Balance Sheet (IAS 1) ──────────────────────────────────
export interface BSLine { code?: string; name: string; amount: number }
export interface BalanceSheet {
  assets: BSLine[]; liabilities: BSLine[]; equity: BSLine[]
  totalAssets: number; totalLiabilities: number; totalEquity: number
  balanced: boolean
}

export function balanceSheet(journals: Journal[], accounts: Account[]): BalanceSheet {
  const bal = calcBalances(journals, accounts)
  const pick = (type: AccountType): BSLine[] => accounts
    .filter(a => a.type === type)
    .map(a => ({ code: a.code, name: a.name, amount: accountNet(a, bal[a.code]) }))
    .filter(x => x.amount !== 0)
  const assets = pick('asset'), liabilities = pick('liability'), equity = pick('equity')
  // Roll current-period profit into equity (retained earnings effect)
  const { net } = profitLoss(journals, accounts)
  if (net !== 0) equity.push({ name: 'صافي الربح للفترة', amount: net })
  const totalAssets      = assets.reduce((s, x) => s + x.amount, 0)
  const totalLiabilities = liabilities.reduce((s, x) => s + x.amount, 0)
  const totalEquity      = equity.reduce((s, x) => s + x.amount, 0)
  return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 }
}

// ── Cash Flow (IAS 7, direct method, simplified) ───────────
export interface CashFlow {
  operatingInflow: number; operatingOutflow: number; netOperating: number; netChange: number
}

export function cashFlow(journals: Journal[], accounts: Account[]): CashFlow {
  const { totalRevenue, totalExpenses, net } = profitLoss(journals, accounts)
  return { operatingInflow: totalRevenue, operatingOutflow: totalExpenses, netOperating: net, netChange: net }
}

// ── Ledger (per account, running balance) ──────────────────
export interface LedgerRow {
  date: string; description: string; ref: string
  debit: number; credit: number; running: number
}

export function ledger(journals: Journal[], account: Account): {
  rows: LedgerRow[]; totalDebit: number; totalCredit: number; closing: number
} {
  const entries: Omit<LedgerRow, 'running'>[] = []
  journals.forEach(j => (j.lines ?? []).forEach(l => {
    if (l.account_code !== account.code) return
    entries.push({
      date: j.entry_date,
      description: j.description + (l.description ? ` | ${l.description}` : ''),
      ref: j.ref, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0,
    })
  }))
  entries.sort((a, b) => a.date.localeCompare(b.date))
  let running = 0, totalDebit = 0, totalCredit = 0
  const rows: LedgerRow[] = entries.map(e => {
    totalDebit += e.debit; totalCredit += e.credit
    running += account.normal_balance === 'debit' ? e.debit - e.credit : e.credit - e.debit
    return { ...e, running }
  })
  return { rows, totalDebit, totalCredit,
    closing: account.normal_balance === 'debit' ? totalDebit - totalCredit : totalCredit - totalDebit }
}
