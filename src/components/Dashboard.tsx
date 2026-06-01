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
  Sparkles,
  Truck,
  MapPin,
  Clock,
  Copy,
  Check,
  Activity
} from 'lucide-react';
import { Product, TabType, OutboundShipment } from '../types';

interface DashboardProps {
  products: Product[];
  onNavigate: (tab: TabType) => void;
  onSelectProduct: (product: Product) => void;
  onAuditStock: (productId: string, newStock: number) => void;
  todayInboundCount: number;
  todayOutboundCount: number;
  outboundShipments: OutboundShipment[];
}

export default function Dashboard({
  products,
  onNavigate,
  onSelectProduct,
  onAuditStock,
  todayInboundCount,
  todayOutboundCount,
  outboundShipments
}: DashboardProps) {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanResult, setScanResult] = useState<Product | null>(null);
  const [auditProduct, setAuditProduct] = useState<string>('');
  const [auditQty, setAuditQty] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'error'>('idle');

  // Logistics tracking states
  const [trackingSearch, setTrackingSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'全部' | '运输中' | '已签收'>('全部');

  const [selectedDay, setSelectedDay] = useState<'周一' | '周二' | '周三' | '周四' | '周五' | '周六' | '周日'>('周一');

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Daily Outbound quantity list lookup
  const getDailyDetails = (day: string) => {
    const mockDetails: Record<string, Array<{ name: string; sku: string; qty: number }>> = {
      '周一': [
        { name: '礁依瓶 (350ml)', sku: 'BTL-JY-350', qty: 42 },
        { name: '圆柱瓶 (350ml)', sku: 'BTL-YZ-350', qty: 35 },
        { name: '塔瓶 (350ml)', sku: 'BTL-TP-350', qty: 28 },
      ],
      '周二': [
        { name: '27" 4K 显示器', sku: 'MON-4K-27', qty: 80 },
        { name: 'Zenith 智能手表', sku: 'WCH-LT-V2', qty: 120 },
        { name: '环保运输箱', sku: 'PACK-L-01', qty: 80 },
      ],
      '周三': [
        { name: '机械键盘', sku: 'KB-MECH-PRO', qty: 98 },
        { name: '人体工学网眼椅', sku: 'CH-ERGO-01', qty: 100 },
      ],
      '周四': [
        { name: '工业级路由器', sku: 'RT-900X', qty: 150 },
        { name: 'Intel Core i9-13900K', sku: 'CPU-12938-B1', qty: 204 },
      ],
      '周五': [
        { name: '屏蔽电源线', sku: 'CBL-PWR-90', qty: 120 },
        { name: '环保运输箱', sku: 'PACK-L-01', qty: 300 },
      ],
      '周六': [
        { name: '礁依瓶 (350ml)', sku: 'BTL-JY-350', qty: 220 },
        { name: '圆柱瓶 (350ml)', sku: 'BTL-YZ-350', qty: 200 },
        { name: '塔瓶 (350ml)', sku: 'BTL-TP-350', qty: 100 },
      ],
      '周日': [
        { name: 'Studio Pro X1 耳机', sku: 'AUD-PRO-001', qty: 50 },
        { name: 'Air-Max Velocity 运动鞋', sku: 'RUN-992-RED', qty: 60 },
      ],
    };

    // Gather real-time shipments for selectedDay
    const dayRealItems: Array<{ name: string; sku: string; qty: number }> = [];
    if (outboundShipments) {
      outboundShipments
        .filter((s) => s.date === day)
        .forEach((shipment) => {
          shipment.items.forEach((item) => {
            const existing = dayRealItems.find((x) => x.sku === item.sku);
            if (existing) {
              existing.qty += item.qty;
            } else {
              dayRealItems.push({
                name: item.productName,
                sku: item.sku,
                qty: item.qty
              });
            }
          });
        });
    }

    const baseItems = mockDetails[day] || [];
    const combined = baseItems.map(item => ({ ...item }));

    dayRealItems.forEach((realVal) => {
      const match = combined.find((c) => c.sku === realVal.sku);
      if (match) {
        match.qty += realVal.qty;
      } else {
        combined.push(realVal);
      }
    });

    return combined;
  };

  const selectedDayItems = getDailyDetails(selectedDay);
  const selectedDayTotalQty = selectedDayItems.reduce((sum, item) => sum + item.qty, 0);

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#005bbf]" /> 每周库存流转图
          </h2>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 border border-gray-200/50 rounded-full font-bold">
            💡 点击任一天查看流转明细
          </span>
        </div>
        <div className="flex items-end justify-between h-28 gap-3 px-1">
          {[
            { day: '周一', value: 40, label: '42%', mockQty: 105 },
            { day: '周二', value: 65, label: '65%', mockQty: 280 },
            { day: '周三', value: 55, label: '55%', mockQty: 198 },
            { day: '周四', value: 85, label: '85%', mockQty: 354 },
            { day: '周五', value: 70, label: '70%', mockQty: 420 },
            { day: '周六', value: 95, label: '95%', mockQty: 520 },
            { day: '周日', value: 30, label: '30%', mockQty: 110 },
          ].map((bar, idx) => {
            const isSelected = selectedDay === bar.day;
            // Calculate dynamic total for chart bar tooltip (incorporating real output for Monday)
            const resolvedQty = bar.day === '周一' 
              ? getDailyDetails('周一').reduce((sum, item) => sum + item.qty, 0)
              : bar.mockQty;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDay(bar.day as any)}
                className="w-full flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`w-full rounded-t-lg h-24 flex items-end relative overflow-hidden transition-all pb-1 px-0.5 border ${
                  isSelected ? 'bg-blue-50/55 border-blue-200/70' : 'bg-slate-50/70 border-transparent hover:bg-slate-50'
                }`}>
                  <div
                    style={{ height: bar.label }}
                    className={`w-full rounded-t-lg transition-all duration-300 origin-bottom ${
                      isSelected 
                        ? 'bg-gradient-to-t from-[#005bbf] to-blue-400 shadow-[0_0_8px_rgba(0,91,191,0.25)]' 
                        : 'bg-gradient-to-t from-gray-300 to-gray-400 group-hover:from-blue-400 group-hover:to-blue-300'
                    }`}
                  ></div>
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {resolvedQty} 件
                  </div>
                </div>
                <span className={`text-[11px] font-bold transition-all ${
                  isSelected ? 'text-[#005bbf] font-extrabold scale-105' : 'text-gray-400'
                }`}>{bar.day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dynamic Detailed List for selectedDay */}
      <section className="bg-white p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100/80">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#005bbf] rounded-full"></span>
            <h3 className="font-bold text-xs text-gray-700">【{selectedDay}】当日流转明细</h3>
          </div>
          <span className="text-[11px] font-bold text-gray-400">
            当日总出库: <span className="text-red-500 font-mono text-[13px] font-extrabold">{selectedDayTotalQty}</span> 件
          </span>
        </div>

        <div className="space-y-2 max-h-[190px] overflow-y-auto pr-0.5 scrollbar-thin">
          {selectedDayItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">目前该天无出库流转动态</div>
          ) : (
            selectedDayItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-gray-50/70 hover:bg-gray-100/50 rounded-xl border border-gray-200/30 transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50/60 flex items-center justify-center text-[#005bbf] font-mono text-[11px] font-extrabold shrink-0 border border-blue-100/50">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-700 truncate">{item.name}</p>
                    <p className="text-[9px] text-gray-400 font-mono tracking-wide mt-0.5">SKU: {item.sku}</p>
                  </div>
                </div>
                <div className="font-mono text-xs font-extrabold text-slate-700 bg-white border border-gray-100 px-2 py-0.5 rounded-lg shadow-sm">
                  {item.qty} 件
                </div>
              </div>
            ))
          )}
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
          <button
            onClick={() => setTrackingModalOpen(true)}
            className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-amber-50 text-amber-800 border border-amber-200/50 hover:bg-amber-100 rounded-2xl cursor-pointer active:scale-95 transition-all duration-200"
          >
            <Truck className="w-6 h-6 mb-1.5 text-amber-600" />
            <span className="text-[11px] font-semibold text-amber-900">物流到货</span>
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

      {/* Model 4: Customer Deliveries & Logistics Tracking Status Details */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[82vh]">
            <div className="bg-gradient-to-r from-amber-600 to-amber-705 p-4 text-white flex justify-between items-center shrink-0" style={{ backgroundImage: 'linear-gradient(to right, #d97706, #b45309)' }}>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-100 animate-pulse" /> 物流监控与客户到货追踪
              </h3>
              <button
                onClick={() => setTrackingModalOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 flex" />
              </button>
            </div>

            <div className="p-4 space-y-3 bg-gray-50 border-b border-gray-100 shrink-0">
              {/* Filter Tabs */}
              <div className="flex gap-1.5 bg-gray-200/60 p-1 rounded-xl text-xs font-bold text-gray-500">
                {(['全部', '运输中', '已签收'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilterStatus(status)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                      filterStatus === status 
                        ? 'bg-white text-gray-905 font-extrabold shadow-sm' 
                        : 'hover:text-gray-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Dynamic search bar */}
              <div className="relative">
                <input
                  type="text"
                  value={trackingSearch}
                  onChange={(e) => setTrackingSearch(e.target.value)}
                  placeholder="搜索客户到货情况、物流消息动态"
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-gray-200 bg-white focus:ring-1 focus:ring-amber-500 outline-none text-xs"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                {trackingSearch && (
                  <button
                    onClick={() => setTrackingSearch('')}
                    className="absolute right-2.5 top-2.5 p-0.5 text-gray-400 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(() => {
                const filtered = (outboundShipments || []).filter((s) => {
                  // Status tab filter
                  if (filterStatus === '运输中') {
                    if (s.status === '已签收') return false;
                  } else if (filterStatus === '已签收') {
                    if (s.status !== '已签收') return false;
                  }
                  
                  // Search string filter
                  if (trackingSearch.trim()) {
                    const search = trackingSearch.toLowerCase();
                    const matchesLoc = s.location.toLowerCase().includes(search);
                    const matchesTrack = s.trackingNumber.toLowerCase().includes(search);
                    const matchesItem = s.items.some(i => i.productName.toLowerCase().includes(search) || i.sku.toLowerCase().includes(search));
                    return matchesLoc || matchesTrack || matchesItem;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-400">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5px]" />
                      <p className="text-xs">未找到符合搜索条件的物流单据</p>
                    </div>
                  );
                }

                return filtered.map((s) => {
                  return (
                    <div 
                      key={s.id}
                      className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2.5 hover:shadow-md transition-all"
                    >
                      {/* Customer position / state banner */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-extrabold text-xs text-gray-800 truncate">{s.location}</span>
                          {s.isExpress && (
                            <span className="px-1 text-[8px] font-bold text-red-500 bg-red-50 rounded border border-red-200 shrink-0">
                              加急 (Express)
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap shrink-0 ${
                          s.status === '已签收' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-155' 
                            : s.status === '派送中'
                            ? 'bg-teal-50 text-teal-700 border border-teal-155 animate-pulse'
                            : s.status === '在途运输'
                            ? 'bg-amber-50 text-amber-700 border border-amber-155'
                            : 'bg-blue-50 text-blue-700 border border-blue-155'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      {/* Items details breakdown summary */}
                      <div className="bg-gray-50/75 rounded-lg p-2 text-[10px] space-y-1">
                        <div className="text-gray-400 font-bold border-b border-gray-200/40 pb-1 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-[#005bbf]" /> 发载物资明细 ({s.items.length})
                        </div>
                        {s.items.map((item, id) => (
                          <div key={id} className="flex justify-between items-center text-gray-600">
                            <span className="truncate font-semibold max-w-[180px]">{item.productName}</span>
                            <span className="font-mono text-gray-500">{item.sku} <strong className="text-gray-800 font-extrabold">x{item.qty}</strong></span>
                          </div>
                        ))}
                      </div>

                      {/* Logistics tracking express track label with copy */}
                      <div className="flex items-center justify-between text-[11px] font-medium border-t border-gray-100 pt-2.5 bg-white">
                        <div className="flex items-center gap-1 text-gray-500">
                          <span className="font-semibold text-[10px]">顺丰单号:</span>
                          <span className="font-mono font-bold text-gray-700">{s.trackingNumber}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleCopyToClipboard(s.trackingNumber, s.id)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                            copiedId === s.id
                              ? 'bg-green-50 border-green-200 text-green-600 font-extrabold'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          {copiedId === s.id ? (
                            <>
                              <Check className="w-2.5 h-2.5" /> 已复制!
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5 animate-bounce" /> 复制单号
                            </>
                          )}
                        </button>
                      </div>

                      {/* Horizontal timeline updates */}
                      <div className="pt-2 border-t border-dashed border-gray-150/60 pl-1.5 space-y-2">
                        <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 最新物流流转动态
                        </div>
                        <div className="space-y-2 border-l border-amber-200/40 ml-1 pl-3.5 relative">
                          {s.statusLog.map((log, index) => (
                            <div key={index} className="relative text-[10px] leading-tight space-y-0.5">
                              {/* Pulse point dot overlay */}
                              <span className={`absolute -left-[18px] top-1 w-2 h-2 rounded-full border border-white ${
                                index === 0 
                                  ? 'bg-amber-600 ring-2 ring-amber-100 animate-pulse' 
                                  : 'bg-gray-300'
                              }`} />
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-mono font-bold ${index === 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                                  {log.time}
                                </span>
                              </div>
                              <p className={`font-semibold ${index === 0 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>
                                {log.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setTrackingModalOpen(false)}
                className="w-full h-11 bg-gray-950 justify-center hover:bg-gray-800 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center shadow-lg"
              >
                关闭物流追踪
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
