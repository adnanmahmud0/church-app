import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { GivingFund, GivingTransaction, BankDetails } from './giving.model';
import { IGivingFund, IGivingTransaction, IBankDetails } from './giving.interface';
import { JwtPayload } from 'jsonwebtoken';

const seedFundsIfEmpty = async () => {
  const count = await GivingFund.countDocuments();
  if (count === 0) {
    const defaultFunds = [
      { name: 'Tithe', description: 'Your regular 10% offering', icon: 'dollar-sign', color: '#3B82F6', isActive: true, sortOrder: 1 },
      { name: 'Offering', description: 'Freewill offering to the Lord', icon: 'heart', color: '#EF4444', isActive: true, sortOrder: 2 },
      { name: 'Building Fund', description: 'Help us build for the future', icon: 'star', color: '#F59E0B', isActive: true, sortOrder: 3 },
      { name: 'Missions', description: 'Support global outreach', icon: 'globe', color: '#10B981', isActive: true, sortOrder: 4 },
    ];
    await GivingFund.insertMany(defaultFunds);
  }
};

const seedBankDetailsIfEmpty = async () => {
  const count = await BankDetails.countDocuments();
  if (count === 0) {
    await BankDetails.create({
      accountName: 'PIWC Stoneyburn',
      sortCode: '80-22-60',
      accountNumber: '00000000',
      reference: 'PIWC-GIFT',
      note: 'Please use your full name as the payment reference so we can acknowledge your gift.',
    });
  }
};

const getFunds = async (activeOnly: boolean = true) => {
  await seedFundsIfEmpty();
  const query = activeOnly ? { isActive: true } : {};
  return await GivingFund.find(query).sort({ sortOrder: 1 }).lean();
};

const createFund = async (payload: Partial<IGivingFund>) => {
  return await GivingFund.create(payload);
};

const updateFund = async (id: string, payload: Partial<IGivingFund>) => {
  const updated = await GivingFund.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Fund not found');
  return updated;
};

const deleteFund = async (id: string) => {
  const deleted = await GivingFund.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Fund not found');
  return deleted;
};

const getBankDetails = async () => {
  await seedBankDetailsIfEmpty();
  return await BankDetails.findOne().lean();
};

const updateBankDetails = async (payload: Partial<IBankDetails>) => {
  await seedBankDetailsIfEmpty();
  const details = await BankDetails.findOne();
  if (!details) throw new ApiError(StatusCodes.NOT_FOUND, 'Bank details not found');
  
  Object.assign(details, payload);
  await details.save();
  return details;
};

const recordTransaction = async (payload: IGivingTransaction) => {
  // ensure fund exists
  const fund = await GivingFund.findById(payload.fundId);
  if (!fund) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid fund ID');

  const txn = await GivingTransaction.create(payload);
  return { id: txn._id, status: txn.status, createdAt: txn.createdAt };
};

const getHistory = async (userId: string, year?: string) => {
  const query: any = { userId };
  if (year) {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31T23:59:59.999Z`);
    query.createdAt = { $gte: start, $lte: end };
  }

  const transactions = await GivingTransaction.find(query)
    .populate('fundId')
    .sort({ createdAt: -1 })
    .lean();

  const totalThisYear = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  const mappedTxns = transactions.map((t: any) => ({
    id: t._id,
    fund: t.fundId?.name || 'Unknown Fund',
    amount: t.amount,
    currency: t.currency,
    status: t.status,
    date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  return {
    totalThisYear,
    currency: 'GBP', // default
    transactions: mappedTxns,
  };
};

const getSummary = async () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [yearTxns, monthTxns, allTxns] = await Promise.all([
    GivingTransaction.find({ createdAt: { $gte: startOfYear } }).lean(),
    GivingTransaction.find({ createdAt: { $gte: startOfMonth } }).lean(),
    GivingTransaction.find().populate('fundId').sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const totalThisYear = yearTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalThisMonth = monthTxns.reduce((sum, t) => sum + t.amount, 0);
  
  // count unique users
  const uniqueUsers = new Set(yearTxns.filter(t => t.userId).map(t => t.userId));
  const totalDonors = uniqueUsers.size;

  // calculate by fund from all yearTxns or allTxns? Usually "this year" by fund is standard, let's do all time to be safe or this year. The prompt says "totalThisYear", "totalThisMonth", "byFund"
  // Let's aggregate byFund from yearTxns for current year, but we'll fetch full funds to get names
  const funds = await getFunds(false);
  const byFundMap: Record<string, { total: number, count: number }> = {};
  
  yearTxns.forEach(t => {
    const fid = t.fundId.toString();
    if (!byFundMap[fid]) byFundMap[fid] = { total: 0, count: 0 };
    byFundMap[fid].total += t.amount;
    byFundMap[fid].count += 1;
  });

  const byFund = Object.keys(byFundMap).map(fid => {
    const fName = funds.find(f => f._id?.toString() === fid)?.name || 'Unknown';
    return { fund: fName, total: byFundMap[fid].total, count: byFundMap[fid].count };
  });

  const recentTransactions = allTxns.map((t: any) => ({
    id: t._id,
    fund: t.fundId?.name || 'Unknown Fund',
    amount: t.amount,
    currency: t.currency,
    status: t.status,
    date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    donor: t.userId || 'Anonymous',
  }));

  return {
    totalThisYear,
    totalThisMonth,
    totalDonors,
    byFund,
    recentTransactions,
  };
};

export const GivingService = {
  getFunds,
  createFund,
  updateFund,
  deleteFund,
  getBankDetails,
  updateBankDetails,
  recordTransaction,
  getHistory,
  getSummary,
};
