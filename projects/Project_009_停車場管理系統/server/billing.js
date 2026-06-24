export function calculateFee(vehicleType, entryTime, exitTime = new Date(), rateSetting) {
  const rate = {
    freeMinutes: rateSetting?.freeMinutes ?? 30,
    hourlyRate: rateSetting?.hourlyRate ?? 40,
    dailyMaxFee: rateSetting?.dailyMaxFee ?? 300
  };

  if (vehicleType === 'MONTHLY' || vehicleType === 'VIP') {
    return {
      minutes: diffMinutes(entryTime, exitTime),
      billableHours: 0,
      days: 0,
      fee: 0
    };
  }

  const minutes = diffMinutes(entryTime, exitTime);
  if (minutes <= rate.freeMinutes) {
    return { minutes, billableHours: 0, days: 0, fee: 0 };
  }

  const fullDays = Math.floor(minutes / 1440);
  const remainingMinutes = minutes % 1440;
  const remainingHours = Math.ceil(remainingMinutes / 60);
  const remainingFee = Math.min(remainingHours * rate.hourlyRate, rate.dailyMaxFee);

  return {
    minutes,
    billableHours: fullDays * 24 + remainingHours,
    days: fullDays,
    fee: fullDays * rate.dailyMaxFee + remainingFee
  };
}

function diffMinutes(entryTime, exitTime) {
  const start = new Date(entryTime).getTime();
  const end = new Date(exitTime).getTime();
  return Math.max(0, Math.ceil((end - start) / 60000));
}
