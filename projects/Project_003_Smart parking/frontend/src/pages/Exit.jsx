import { useState } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

const PAYMENT_METHODS = [
  { value: 'cash', label: '現金', icon: '💵' },
  { value: 'credit_card', label: '信用卡', icon: '💳' },
  { value: 'line_pay', label: 'LINE Pay', icon: '📱' },
  { value: 'easycard', label: '悠遊卡', icon: '🎫' },
];

export default function Exit() {
  const [plateNumber, setPlateNumber] = useState('');
  const [step, setStep] = useState('input'); // input | calculate | pay
  const [loading, setLoading] = useState(false);
  const [exitData, setExitData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [result, setResult] = useState(null);
  const showToast = useToast();

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      showToast('請輸入車牌號碼', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await api.calculateExit(plateNumber.trim());
      setExitData(data);
      setStep('calculate');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);

    try {
      const data = await api.confirmExit(plateNumber.trim(), paymentMethod);
      setResult(data);
      setStep('result');
      showToast(data.message, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlateNumber('');
    setStep('input');
    setExitData(null);
    setResult(null);
    setPaymentMethod('cash');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {step === 'input' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">車輛出場查詢</h3>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">車牌號碼</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg tracking-wider uppercase"
                placeholder="ABC-1234"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? '查詢中...' : '查詢停車費用'}
            </button>
          </form>
        </div>
      )}

      {step === 'calculate' && exitData && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">停車費用明細</h3>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">車牌號碼</span>
              <span className="font-semibold">{exitData.record.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">車輛類型</span>
              <span className="font-semibold">
                {exitData.record.vehicleType === 'vip' ? 'VIP' :
                 exitData.record.vehicleType === 'monthly' ? '月租' : '臨停'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">進場時間</span>
              <span>{new Date(exitData.record.entryTime).toLocaleString('zh-TW')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">停車時間</span>
              <span>{exitData.totalMinutes} 分鐘</span>
            </div>
            {exitData.isMonthlyActive && (
              <div className="flex justify-between">
                <span className="text-gray-600">月租狀態</span>
                <span className="text-green-600 font-semibold">有效期限內</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-800 font-semibold">應收金額</span>
              <span className="text-2xl font-bold text-primary-600">
                ${exitData.calculatedFee}
              </span>
            </div>
          </div>

          {exitData.calculatedFee > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">付款方式</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition ${
                      paymentMethod === method.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition"
            >
              返回
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? '處理中...' : exitData.calculatedFee > 0 ? `模擬付款 $${exitData.calculatedFee}` : '確認出場'}
            </button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-lg font-semibold text-green-800 mb-2">{result.message}</p>
          <div className="text-sm text-green-700 space-y-1">
            <p>費用：${result.fee}</p>
            <p>付款方式：{PAYMENT_METHODS.find((m) => m.value === result.paymentMethod)?.label}</p>
            {result.warning && (
              <p className="text-red-600 font-semibold mt-2">⚠️ {result.warning}</p>
            )}
          </div>
          <button
            onClick={handleReset}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            處理下一台車
          </button>
        </div>
      )}
    </div>
  );
}
