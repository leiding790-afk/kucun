import { useState, useEffect, FormEvent } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  QrCode, 
  CheckSquare, 
  BarChart3, 
  AlertTriangle, 
  Search, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';
import { Product, TabType } from '../types';

interface DashboardProps {
  products: Product[];
  onNavigate: (tab: TabType) => void;
  onSelectProduct: (product: Product) => void;
  onAuditStock: (productId: string, newStock: number) => void;
  todayInboundCount: number;
  todayOutboundCount: number;
}

export default function Dashboard({
  products,
  onNavigate,
  onSelectProduct,
  onAuditStock,
  todayInboundCount,
  todayOutboundCount
}: DashboardProps) {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanResult, setScanResult] = useState<Product | null>(null);
  const [auditProduct, setAuditProduct] = useState<string>('');
  const [auditQty, setAuditQty] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'error'>('idle');

  // Calculate live total stock offset
  const baseOffset = 10489;
  const currentTotal = products.reduce((acc, p) => acc + p.stock, 0) + baseOffset;

  // Filter low stock items directly
  const lowStockAlerts = products.filter((p) => p.stock <= p.minStock);

  const handleScanSimulation = (e: FormEvent) => {
    e.preventDefault();
    setScanStatus('scanning');
    
    setTimeout(() => {
      const match = products.find(
        (p) => p.sku.toLowerCase() === barcodeInput.trim().toLowerCase() ||
               p.name.includes(barcodeInput.trim())
      );
      if (match) {
        setScanResult(match);
        setScanStatus('found');
      } else {
        setScanStatus('error');
      }
    }, 800);
  };

  const startScan = () => {
    setScanModalOpen(true);
    setScanStatus('idle');
    setBarcodeInput('');
    setScanResult(null);
  };

  const handleApplyAudit = () => {
    if (auditProduct) {
      onAuditStock(auditProduct, auditQty);
      setAuditModalOpen(false);
    }
  };

  const handleQuickInboundFromScan = () => {
    if (scanResult) {
      setScanModalOpen(false);
      onNavigate('inbound');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Summary Bento Grid */}
      <section className="grid grid-cols-2 gap-3 mt-4">
        {/* Total Stock */}
        <div className="col-span-2 bg-white p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100/80 transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-1 h-5">
            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
              总库存量
            </span>
            <span className="text-[#005bbf] bg-blue-50 p-1 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="font-bold text-3xl text-[#005bbf] tracking-tight py-1 font-sans">
            {currentTotal.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 bg-[#89fa9b]/35 border border-[#89fa9b]/40 text-[#002108] px-2.5 py-1 rounded-full w-fit">
            <TrendingUp className="w-3.5 h-3.5 text-[#00722f]" />
            <span className="text-[11px] font-bold">较昨日 +2.4%</span>
          </div>
        </div>

        {/* Today Inbound */}
        <div className="bg-white p-4 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-gray-100/80">
          <div className="text-[12px] font-medium text-gray-400 mb-1">今日入库</div>
          <div className="font-bold text-2xl text-[#00722f]">{todayInboundCount}</div>
          <div className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            预计今日送达
          </div>
        </div>

        {/* Today Outbound */}
        <div className="bg-white p-4 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-gray-100/80">
          <div className="text-[12px] font-medium text-gray-400 mb-1">今日出库</div>
          <div className="font-bold text-2xl text-amber-600">{todayOutboundCount}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            待装车运输
          </div>
        </div>
      </section>

      {/* Weekly Trends Visual */}
      <section className="bg-white p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100/80">
        <h2 className="font-semibold text-sm mb-4 text-gray-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#005bbf]" /> 每周库存流转动态
        </h2>
        <div className="flex items-end justify-between h-28 gap-3 px-1">
          {[
            { day: '周一', value: 40, label: '42%' },
            { day: '周二', value: 65, label: '65%' },
            { day: '周三', value: 55, label: '55%' },
            { day: '周四', value: 85, label: '85%' },
            { day: '周五', value: 70, label: '70%' },
            { day: '周六', value: 95, label: '95%' },
            { day: '周日', value: 30, label: '30%' },
          ].map((bar, idx) => (
            <div key={idx} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-full bg-slate-50 rounded-t-lg h-24 flex items-end relative overflow-hidden">
                <div
                  style={{ height: bar.label }}
                  className="w-full bg-gradient-to-t from-[#005bbf] to-blue-400 rounded-t-lg transition-all duration-1000 origin-bottom"
                ></div>
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {Math.round(bar.value * 124)} 件
                </div>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{bar.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="font-semibold text-sm mb-3.5 text-gray-700">快速核心操作</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={startScan}
            className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-[#005bbf] text-white rounded-2xl shadow-md cursor-pointer hover:bg-blue-700 active:scale-95 transition-all duration-200"
          >
            <QrCode className="w-6 h-6 mb-1.5" />
            <span className="text-[11px] font-semibold">快速扫描</span>
          </button>
          <button
            onClick={() => {
              if (products.length > 0) {
                setAuditProduct(products[0].id);
                setAuditQty(products[0].stock);
              }
              setAuditModalOpen(true);
            }}
            className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-gray-50 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-2xl cursor-pointer active:scale-95 transition-all duration-200 border border-gray-100"
          >
            <CheckSquare className="w-6 h-6 mb-1.5 text-blue-600" />
            <span className="text-[11px] font-semibold">库存盘点</span>
          </button>
          <button
            onClick={() => setAnalyticsModalOpen(true)}
            className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-gray-50 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-2xl cursor-pointer active:scale-95 transition-all duration-200 border border-gray-100"
          >
            <BarChart3 className="w-6 h-6 mb-1.5 text-blue-600" />
            <span className="text-[11px] font-semibold">变动统计</span>
          </button>
        </div>
      </section>

      {/* Low Stock Alert List */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" /> 实时低库存预警
          </h2>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-[#005bbf] text-[12px] font-bold hover:underline"
          >
            查看全部
          </button>
        </div>

        <div className="space-y-2.5">
          {lowStockAlerts.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
              目前没有库存紧缺的商品，运营状态良好。
            </div>
          ) : (
            lowStockAlerts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white p-3.5 rounded-xl border-l-[5px] border-red-500 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3.5 hover:shadow-md cursor-pointer transition-all border border-gray-100"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs font-mono">PKG</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-400 font-mono tracking-wider truncate">
                    SKU: {p.sku}
                  </div>
                  <div className="font-medium text-[14px] text-gray-900 truncate">
                    {p.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold text-sm">剩余 {p.stock} 件</div>
                  <div className="text-[10px] text-gray-400 font-mono">警戒阀值: {p.minStock}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modal 1: Barcode Scan Simulator */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-[#005bbf] p-4 text-white flex justify-between items-center">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <QrCode className="w-5 h-5" /> 智能条码模拟扫描
              </h3>
              <button
                onClick={() => setScanModalOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                无需真实的摄像头支持，输入条码或匹配关键词，即可快速模拟扫描入库/出库行为。
              </p>

              <form onSubmit={handleScanSimulation} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="输入条码(如 RT-900X)或商品名"
                    className="flex-1 h-11 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#005bbf] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="h-11 px-4 bg-[#005bbf] hover:bg-blue-700 text-white font-medium text-xs rounded-lg active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Search className="w-4 h-4" /> 搜索
                  </button>
                </div>
                
                {/* Pre-fill Shortcuts */}
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">点击快捷条码测试:</div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {products.slice(0, 4).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setBarcodeInput(p.sku)}
                        className="text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100 hover:bg-sky-100 transition-colors"
                      >
                        {p.sku}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* Scan Status Display */}
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 min-h-[90px] flex flex-col justify-center items-center">
                {scanStatus === 'idle' && (
                  <div className="text-center">
                    <QrCode className="w-8 h-8 text-gray-300 mx-auto mb-1 animate-pulse" />
                    <span className="text-xs text-gray-400">等待输入条码中...</span>
                  </div>
                )}

                {scanStatus === 'scanning' && (
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-[#005bbf] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <span className="text-xs text-[#005bbf] font-medium block">正在识别货位码与 SKU 数据库...</span>
                  </div>
                )}

                {scanStatus === 'error' && (
                  <div className="text-center text-red-500">
                    <span className="text-xs font-semibold block">⚠️ 未能检索到匹配 SKU!</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">请确定条码或词条输入正确</span>
                  </div>
                )}

                {scanStatus === 'found' && scanResult && (
                  <div className="w-full flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#89fa9b]/40 flex items-center justify-center text-[#00722f] text-xs font-bold leading-none">
                      SUCCESS
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">
                        {scanResult.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        SKU: {scanResult.sku} | 余量: {scanResult.stock}件
                      </div>
                    </div>
                    <button
                      onClick={handleQuickInboundFromScan}
                      className="px-2.5 py-1.5 bg-[#005bbf] hover:bg-blue-700 text-white rounded text-[11px] font-bold shrink-0 transition-colors flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> 去操作
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Inventory Audit */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-500" /> 物流库存盘点核准
              </h3>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-on-surface-variant font-medium">
                当仓库管理员通过现场扫码检查核准实物、发现数据和物理记录偏差时，在此可以直接强制纠偏。
              </p>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-1">选择盘货商品</label>
                  <select
                    value={auditProduct}
                    onChange={(e) => {
                      setAuditProduct(e.target.value);
                      const matched = products.find((prod) => prod.id === e.target.value);
                      if (matched) setAuditQty(matched.stock);
                    }}
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:bg-white focus:ring-1 focus:ring-[#005bbf]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-1">
                    物理核销后实际件数
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAuditQty((prev) => Math.max(0, prev - 1))}
                      className="w-10 h-10 border border-gray-200 text-gray-600 rounded-lg flex items-center justify-center text-xl hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={auditQty}
                      onChange={(e) => setAuditQty(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 h-11 text-center font-semibold text-lg border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setAuditQty((prev) => prev + 1)}
                      className="w-10 h-10 border border-gray-200 text-gray-600 rounded-lg flex items-center justify-center text-xl hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="flex-1 h-11 border border-gray-200 text-gray-500 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleApplyAudit}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
                >
                  确认校准数据
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Variations / Analytics Breakdown */}
      {analyticsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-400" /> 库存品类占比统计
              </h3>
              <button
                onClick={() => setAnalyticsModalOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                分析当前物理货架所有商品的仓储占比，以便于科学分配储位与提高物流吞吐效率。
              </p>

              {/* Simple Vector Pie/Progress visual for categories */}
              <div className="space-y-4 text-sm">
                {[
                  { name: '电子产品', count: products.filter(p => p.category === '电子产品').reduce((sum, p) => sum + p.stock, 0), color: 'bg-[#1a73e8]' },
                  { name: '硬件组件', count: products.filter(p => p.category === '硬件').reduce((sum, p) => sum + p.stock, 0), color: 'bg-amber-500' },
                  { name: '办公家具', count: products.filter(p => p.category === '办公家具').reduce((sum, p) => sum + p.stock, 0), color: 'bg-emerald-500' },
                ].map((cat, idx) => {
                  const totalCounts = products.reduce((sum, p) => sum + p.stock, 1); // Avoid div by zero
                  const pct = Math.round((cat.count / totalCounts) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700">{cat.name}</span>
                        <span className="text-[#005bbf]">{cat.count} 件 ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[11px] text-[#004493] leading-relaxed">
                💡 <strong>储位优化建议:</strong> 电子产品类目前在库量较大，建议将 Area A02 - 11 等核心主通道位置优先配置给该品类以便高频拣货。
              </div>

              <button
                onClick={() => setAnalyticsModalOpen(false)}
                className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors"
              >
                返回工作台
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
