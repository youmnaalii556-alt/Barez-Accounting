/**
 * Barez ERP — Double-Entry Accounting Engine
 * Pure functions over accounts + journals (schema.sql shape).
 * Lines reference accounts by UUID (account_id); balances respect
 * each account's `nature` (debit/credit). No I/O — fully testable.
 */
import type { Account, Journal, AccountType } from '@/types/accounting'

export interface AccountBalance { debit: number; credit: number }
export type BalanceMap = Record<string, AccountBalance>  // keyed by account_id

/** Arabic-Egyptian number formatting with 2 decimals. */
export function fmt(n: number | null | undefined): string {
  return Number(n || 0).toLocaleString('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Sum debit/credit per account_id across all (posted) journal lines. */
export function calcBalances(journals: Journal[]): BalanceMap {
  const b: BalanceMap = {}
  journals.forEach(j => (j.lines ?? []).forEach(l => {
    if (!b[l.account_id]) b[l.account_id] = { debit: 0, credit: 0 }
    b[l.account_id].debit  += Number(l.debit)  || 0
    b[l.account_id].credit += Number(l.credit) || 0
  }))
  return b
}

/** Net signed balance of an account respecting its normal side. */
export function accountNet(acc: Account, bal: AccountBalance | undefined): number {
  const d = bal?.debit ?? 0, c = bal?.credit ?? 0
  return acc.nature === 'debit' ? d - c : c - d
}

export interface JournalFilter { projectId?: string | null; month?: string | null; year?: string | null }

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
  code: string; name: string; debit: number; credit: number; net: number
}
export interface TrialBalance {
  rows: TrialBalanceRow[]
  totalDebit: number; totalCredit: number; difference: number; balanced: boolean
}

export function trialBalance(journals: Journal[], accounts: Account[]): TrialBalance {
  const bal = calcBalances(journals)
  let totalDebit = 0, totalCredit = 0
  const rows: TrialBalanceRow[] = []
  accounts.forEach(a => {
    const b = bal[a.id]
    if (!b || (!b.debit && !b.credit)) return
    totalDebit += b.debit; totalCredit += b.credit
    rows.push({ code: a.code, name: a.name_ar, debit: b.debit, credit: b.credit, net: accountNet(a, b) })
  })
  rows.sort((x, y) => x.code.localeCompare(y.code))
  const difference = Math.abs(totalDebit - totalCredit)
  return { rows, totalDebit, totalCredit, difference, balanced: difference < 0.01 }
}

// ── Profit & Loss (IAS 1) ──────────────────────────────────
export interface PLLine { code: string; name: string; amount: number }
export interface ProfitLoss {
  revenue: PLLine[]; expenses: PLLine[]
  totalRevenue: number; totalExpenses: number; net: number; margin: number
}

export function profitLoss(journals: Journal[], accounts: Account[]): ProfitLoss {
  const bal = calcBalances(journals)
  const pick = (type: AccountType) => accounts
    .filter(a => a.type === type)
    .map(a => ({ code: a.code, name: a.name_ar, amount: accountNet(a, bal[a.id]) }))
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
  totalAssets: number; totalLiabilities: number; totalEquity: number; balanced: boolean
}

export function balanceSheet(journals: Journal[], accounts: Account[]): BalanceSheet {
  const bal = calcBalances(journals)
  const pick = (type: AccountType): BSLine[] => accounts
    .filter(a => a.type === type)
    .map(a => ({ code: a.code, name: a.name_ar, amount: accountNet(a, bal[a.id]) }))
    .filter(x => x.amount !== 0)
  const assets = pick('asset'), liabilities = pick('liability'), equity = pick('equity')
  const { net } = profitLoss(journals, accounts)
  if (net !== 0) equity.push({ name: 'صافي الربح للفترة', amount: net })
  const totalAssets      = assets.reduce((s, x) => s + x.amount, 0)
  const totalLiabilities = liabilities.reduce((s, x) => s + x.amount, 0)
  const totalEquity      = equity.reduce((s, x) => s + x.amount, 0)
  return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 }
}

// ── Cash Flow (IAS 7, direct, simplified) ──────────────────
export interface CashFlow { operatingInflow: number; operatingOutflow: number; netOperating: number; netChange: number }

export function cashFlow(journals: Journal[], accounts: Account[]): CashFlow {
  const { totalRevenue, totalExpenses, net } = profitLoss(journals, accounts)
  return { operatingInflow: totalRevenue, operatingOutflow: totalExpenses, netOperating: net, netChange: net }
}

// ── Ledger (per account, running balance) ──────────────────
export interface LedgerRow { date: string; description: string; ref: string; debit: number; credit: number; running: number }

export function ledger(journals: Journal[], account: Account): {
  rows: LedgerRow[]; totalDebit: number; totalCredit: number; closing: number
} {
  const entries: Omit<LedgerRow, 'running'>[] = []
  journals.forEach(j => (j.lines ?? []).forEach(l => {
    if (l.account_id !== account.id) return
    entries.push({
      date: j.entry_date,
      description: j.description + (l.description ? ` | ${l.description}` : ''),
      ref: j.entry_no, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0,
    })
  }))
  entries.sort((a, b) => a.date.localeCompare(b.date))
  let running = 0, totalDebit = 0, totalCredit = 0
  const rows: LedgerRow[] = entries.map(e => {
    totalDebit += e.debit; totalCredit += e.credit
    running += account.nature === 'debit' ? e.debit - e.credit : e.credit - e.debit
    return { ...e, running }
  })
  return { rows, totalDebit, totalCredit,
    closing: account.nature === 'debit' ? totalDebit - totalCredit : totalCredit - totalDebit }
}

/** Accounts that can receive postings (leaf nodes = not a parent of any other account). */
export function postableAccounts(accounts: Account[]): Account[] {
  const parents = new Set(accounts.map(a => a.parent_id).filter(Boolean) as string[])
  return accounts.filter(a => !parents.has(a.id))
}
