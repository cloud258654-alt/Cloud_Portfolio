import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../components/Layout';

export default function Monthly() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    plateNumber: '',
    ownerName: '',
    phone: '',
    startDate: '',
    endDate: '',
  });
  const showToast = useToast();

  const fetchCars = async () => {
    try {
      const data = await api.getMonthlyCars();
      setCars(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateMonthlyCar(editing.id, form);
        showToast('月租車更新成功', 'success');
      } else {
        await api.createMonthlyCar(form);
        showToast('月租車新增成功', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ plateNumber: '', ownerName: '', phone: '', startDate: '', endDate: '' });
      fetchCars();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = (car) => {
    setEditing(car);
    setForm({
      plateNumber: car.plateNumber,
      ownerName: car.ownerName,
      phone: car.phone,
      startDate: car.startDate.split('T')[0],
      endDate: car.endDate.split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此月租車紀錄？')) return;
    try {
      await api.deleteMonthlyCar(id);
      showToast('月租車已刪除', 'success');
      fetchCars();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isExpired = (endDate) => new Date() > new Date(endDate);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">月租車管理</h3>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ plateNumber: '', ownerName: '', phone: '', startDate: '', endDate: '' });
            setShowForm(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + 新增月租車
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h4 className="font-semibold mb-4">{editing ? '編輯月租車' : '新增月租車'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">車牌號碼 *</label>
                <input
                  type="text"
                  value={form.plateNumber}
                  onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                  disabled={!!editing}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">車主姓名 *</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日期 *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">結束日期 *</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition"
              >
                {editing ? '更新' : '新增'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">車牌</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">車主</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">開始日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">結束日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{car.plateNumber}</td>
                  <td className="px-4 py-3">{car.ownerName}</td>
                  <td className="px-4 py-3 text-sm">{car.phone}</td>
                  <td className="px-4 py-3 text-sm">{new Date(car.startDate).toLocaleDateString('zh-TW')}</td>
                  <td className="px-4 py-3 text-sm">{new Date(car.endDate).toLocaleDateString('zh-TW')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isExpired(car.endDate)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isExpired(car.endDate) ? '⚠ 已過期' : '有效'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleEdit(car)}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
              {cars.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    尚無月租車資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
