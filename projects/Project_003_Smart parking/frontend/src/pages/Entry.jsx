import { useState } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

const VEHICLE_TYPES = [
  { value: 'temporary', label: '臨停' },
  { value: 'monthly', label: '月租' },
  { value: 'vip', label: 'VIP' },
];

export default function Entry() {
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('temporary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      showToast('請輸入車牌號碼', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await api.entry(plateNumber.trim(), vehicleType);
      setResult(data);
      showToast(data.message, 'success');
      setPlateNumber('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">車輛進場登記</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">車輛類型</label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setVehicleType(type.value)}
                  className={`py-3 rounded-lg font-medium transition ${
                    vehicleType === type.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? '處理中...' : '確認進場'}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-lg font-semibold text-green-800">{result.message}</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>剩餘車位：{result.availableSpaces}</p>
            <p>進場時間：{new Date(result.record.entryTime).toLocaleString('zh-TW')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
