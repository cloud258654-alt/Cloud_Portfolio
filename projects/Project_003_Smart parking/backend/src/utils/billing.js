function calculateFee(entryTime, exitTime, vehicleType, rateSettings, monthlyCar) {
  if (vehicleType === 'vip') {
    return 0;
  }

  if (vehicleType === 'monthly' && monthlyCar) {
    const now = new Date();
    const endDate = new Date(monthlyCar.endDate);
    if (now <= endDate) {
      return 0;
    }
  }

  return calculateStandardFee(entryTime, exitTime, rateSettings);
}

function calculateStandardFee(entryTime, exitTime, rateSettings) {
  const diffMs = exitTime - entryTime;
  let totalMinutes = Math.ceil(diffMs / (1000 * 60));

  if (totalMinutes <= rateSettings.freeMinutes) {
    return 0;
  }

  totalMinutes -= rateSettings.freeMinutes;

  totalMinutes = Math.max(0, totalMinutes - (rateSettings.exitGraceMinutes || 0));

  const hours = Math.ceil(totalMinutes / 60);
  const dailyMax = rateSettings.dailyMaxFee;
  const hourlyRate = rateSettings.hourlyRate;

  const totalDays = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);

  let fee = 0;

  fee += totalDays * dailyMax;

  if (remainingMinutes > 0) {
    const remainingHours = Math.ceil(remainingMinutes / 60);
    const dayFee = remainingHours * hourlyRate;
    fee += Math.min(dayFee, dailyMax);
  }

  return fee;
}

function validateEntry(plateNumber) {
  const plateRegex = /^[A-Z0-9]{2,4}-[A-Z0-9]{2,4}$|^[A-Z0-9]{3,8}$/;
  return plateRegex.test(plateNumber.toUpperCase().replace(/\s/g, ''));
}

module.exports = { calculateFee, validateEntry };
