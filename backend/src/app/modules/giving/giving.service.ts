import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { GivingFund, GivingTransaction, BankDetails } from './giving.model';
import { IGivingFund, IGivingTransaction, IBankDetails } from './giving.interface';
import { User } from '../user/user.model';
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

  const recentTransactions = await Promise.all(allTxns.map(async (t: any) => {
    let donorName = 'Anonymous';
    if (t.userId) {
      const user = await User.findById(t.userId).lean();
      if (user) {
        donorName = user.name || user.email || t.userId;
      } else {
        donorName = t.userId;
      }
    }
    
    return {
      id: t._id,
      fund: t.fundId?.name || 'Unknown Fund',
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      donor: donorName,
    };
  }));

  return {
    totalThisYear,
    totalThisMonth,
    totalDonors,
    byFund,
    recentTransactions,
  };
};

const getProfileGivingSummary = async (userId: string) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [yearTxns, allTxns] = await Promise.all([
    GivingTransaction.find({ userId, createdAt: { $gte: startOfYear } }).sort({ createdAt: -1 }).lean(),
    GivingTransaction.find({ userId }).sort({ createdAt: -1 }).lean(),
  ]);

  const totalThisYear = yearTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalAllTime = allTxns.reduce((sum, t) => sum + t.amount, 0);

  const lastGift = allTxns.length > 0 ? {
    amount: allTxns[0].amount,
    currency: allTxns[0].currency,
    date: new Date(allTxns[0].createdAt as any).toISOString().split('T')[0],
    date_display: new Date(allTxns[0].createdAt as any).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  } : null;

  // Calculate giving streak
  let streak = 0;
  if (allTxns.length > 0) {
    const today = new Date();
    // Normalize to start of current week (Monday)
    const currentDay = today.getDay() || 7; // 1-7 (Mon-Sun)
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - currentDay + 1);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    let checkWeekStart = new Date(startOfCurrentWeek);
    
    // Create a Set of week timestamps where the user donated
    const donationWeeks = new Set(allTxns.map(t => {
      const d = new Date(t.createdAt as any);
      const day = d.getDay() || 7;
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - day + 1);
      weekStart.setHours(0, 0, 0, 0);
      return weekStart.getTime();
    }));

    // First, check if they donated this week or last week to start the streak
    const lastWeekStart = new Date(startOfCurrentWeek);
    lastWeekStart.setDate(startOfCurrentWeek.getDate() - 7);
    
    if (donationWeeks.has(startOfCurrentWeek.getTime()) || donationWeeks.has(lastWeekStart.getTime())) {
      let currentCheckTime = donationWeeks.has(startOfCurrentWeek.getTime()) ? startOfCurrentWeek.getTime() : lastWeekStart.getTime();
      
      while (donationWeeks.has(currentCheckTime)) {
        streak++;
        const nextCheck = new Date(currentCheckTime);
        nextCheck.setDate(nextCheck.getDate() - 7);
        currentCheckTime = nextCheck.getTime();
      }
    }
  }

  return {
    total_given_this_year: totalThisYear,
    currency: allTxns.length > 0 ? allTxns[0].currency : 'GBP',
    year: now.getFullYear(),
    last_gift: lastGift,
    giving_streak_weeks: streak,
    total_given_all_time: totalAllTime,
    total_donations_count: allTxns.length,
  };
};

const getUserGivingHistory = async (userId: string, page: number = 1, limit: number = 20, year?: number) => {
  const skip = (page - 1) * limit;
  const query: any = { userId };
  
  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    query.createdAt = { $gte: start, $lte: end };
  }

  const [transactions, total] = await Promise.all([
    GivingTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    GivingTransaction.countDocuments(query),
  ]);

  const mappedData = transactions.map((t: any) => ({
    id: t._id,
    amount: t.amount,
    currency: t.currency,
    donated_at: t.createdAt.toISOString(),
    date_display: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  return {
    data: mappedData,
    pagination: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      has_next_page: page * limit < total,
    }
  };
};

const getTotalThisYear = async (userId: string) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const yearTxns = await GivingTransaction.find({ userId, createdAt: { $gte: startOfYear }, status: 'completed' }).lean();
  const total = yearTxns.reduce((sum, t) => sum + t.amount, 0);
  return { totalThisYear: total };
};

const deleteTransaction = async (id: string) => {
  const deleted = await GivingTransaction.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Transaction not found');
  return deleted;
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
  getProfileGivingSummary,
  getUserGivingHistory,
  getTotalThisYear,
  deleteTransaction,
};
