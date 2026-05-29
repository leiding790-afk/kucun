import { useState } from 'react';
import { 
  Barcode, 
  ChevronRight, 
  MapPin, 
  Truck, 
  Plus, 
  Minus, 
  ListPlus, 
  CheckCircle2, 
  Trash2, 
  Sparkles,
  Search
} from 'lucide-react';
import { Product, PendingInbound } from '../types';

interface InboundProps {
  products: Product[];
  pendingInbounds: PendingInbound[];
  suppliers?: string[];
  locations?: string[];
  onAddPendingInbound: (item: Omit<PendingInbound, 'id'>) => void;
  onRemovePendingInbound: (id: string) => void;
  onConfirmAllInbounds: () => void;
  onQuickPrefill: (sku: string) => void;
}

export default function Inbound({
  products,
  pendingInbounds,
  suppliers = [],
  locations = [],
  onAddPendingInbound,
  onRemovePendingInbound,
  onConfirmAllInbounds
}: InboundProps) {
  // Local form states
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [qty, setQty] = useState<number | ''>(1);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPrefillDropdown, setShowPrefillDropdown] = useState(false);

  // Filter products for quick selection
  const filteredProducts = products.filter(
    (p) => p.sku.toLowerCase().includes(barcode.toLowerCase()) || 
           p.name.includes(barcode)
  );

  const selectSuggestedProduct = (p: Product) => {
    setBarcode(p.sku);
    setName(p.name);
    setSelectedSupplier(p.supplier || suppliers[0] || '');
    setSelectedLocation(p.warehouseLocation || locations[0] || '');
    setShowPrefillDropdown(false);
    setStep(2); // Auto proceed to next step
  };

  const handleManualAddToList = () => {
    if (!barcode.trim() || !name.trim()) return;
    
    onAddPendingInbound({
      sku: barcode.trim().toUpperCase(),
      name: name.trim(),
      qty: qty === '' ? 1 : qty,
      supplier: selectedSupplier || suppliers[0] || '',
      location: selectedLocation || locations[0] || ''
    });

    // Reset fields & reset to step 1
    setBarcode('');
    setName('');
    setSelectedSupplier('');
    setSelectedLocation('');
    setQty(1);
    setStep(1);
  };

  return (
    <div className="space-y-6 pb-20 mt-4">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">入库登记</h2>
        <p className="text-xs text-gray-500 mt-1">扫描包装条形码，并录入供应商及储区编码</p>
      </div>

      {/* Step Indicator */}
      <nav className="p-3 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-2 text-xs">
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold transition-all ${
              step >= 1 ? 'bg-[#005bbf] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              1
            </span>
            <span className={`font-semibold ${step === 1 ? 'text-[#005bbf]' : 'text-gray-400'}`}>
              扫描/选择
            </span>
          </button>
          
          <div className="h-0.5 flex-1 bg-gray-100"></div>

          <button 
            type="button"
            onClick={() => barcode && setStep(2)}
            disabled={!barcode}
            className="flex items-center gap-1.5 focus:outline-none disabled:opacity-40"
          >
            <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold transition-all ${
              step >= 2 ? 'bg-[#005bbf] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </span>
            <span className={`font-semibold ${step === 2 ? 'text-[#005bbf]' : 'text-gray-400'}`}>
              详情
            </span>
          </button>
          
          <div className="h-0.5 flex-1 bg-gray-100"></div>

          <button 
            type="button"
            onClick={() => barcode && setStep(3)}
            disabled={!barcode}
            className="flex items-center gap-1.5 focus:outline-none disabled:opacity-40"
          >
            <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold transition-all ${
              step >= 3 ? 'bg-[#005bbf] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </span>
            <span className={`font-semibold ${step === 3 ? 'text-[#005bbf]' : 'text-gray-400'}`}>
              确认
            </span>
          </button>
        </div>
      </nav>

      {/* Form Content */}
      <div className="space-y-4">
        {/* Step 1: Barcode & Product Details */}
        {step === 1 && (
          <div className="bg-white p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100 space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                产品条码 / SKU
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => {
                      setBarcode(e.target.value);
                      setShowPrefillDropdown(true);
                      // Auto-fill product name if perfect match is found
                      const found = products.find(p => p.sku === e.target.value.toUpperCase());
                      if (found) {
                        setName(found.name);
                        setSelectedSupplier(found.supplier);
                        setSelectedLocation(found.warehouseLocation);
                      }
                    }}
                    onFocus={() => setShowPrefillDropdown(true)}
                    placeholder="扫描或输入条码 (如 PRO-992-BX)"
                    className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#005bbf] focus:border-transparent outline-none transition-all font-mono"
                  />
                  {barcode && (
                    <button
                      type="button"
                      onClick={() => { setBarcode(''); setName(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
                    >
                      清除
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Simmons a barcode reader pre-fill randomly
                    const randomProduct = products[Math.floor(Math.random() * products.length)];
                    selectSuggestedProduct(randomProduct);
                  }}
                  className="h-11 w-12 bg-[#005bbf] hover:bg-blue-700 text-white rounded-lg flex items-center justify-center active:scale-95 transition-all shadow-sm"
                  title="模拟扫码自动补全"
                >
                  <Barcode className="w-5 h-5" />
                </button>
              </div>

              {/* Prefill suggestions dropdown */}
              {showPrefillDropdown && barcode && filteredProducts.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-gray-50">
                  <div className="p-2 text-[10px] text-gray-400 font-semibold bg-gray-50/50">
                    🔍 匹配已建档的产品列表
                  </div>
                  {filteredProducts.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => selectSuggestedProduct(p)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-gray-900 truncate pr-2">{p.name}</span>
                      <span className="font-mono text-gray-400 shrink-0">{p.sku}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                产品名称
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="初次入库产品请输入产品名称"
                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#005bbf] focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="button"
              disabled={!barcode || !name}
              onClick={() => setStep(2)}
              className="w-full h-11 bg-[#005bbf] text-white rounded-xl text-xs font-bold leading-none disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
            >
              下一步：录入储位详情 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Partners & Logistics Location */}
        {step === 2 && (
          <div className="bg-white p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-gray-400" /> 供应商 Partner
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] outline-none appearance-none cursor-pointer"
              >
                <option value="">选择供应商</option>
                {suppliers.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> 仓库目标储位 (Location)
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] outline-none appearance-none cursor-pointer"
              >
                <option value="">选择仓库储区</option>
                {locations.map((l, idx) => (
                  <option key={idx} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
              >
                返回修改
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 h-11 bg-[#005bbf] text-white rounded-xl text-xs font-bold leading-none hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
              >
                下一步：配置数量 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Quantities and Committing */}
        {step === 3 && (
          <div className="bg-white p-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-gray-400">入库登记数量</label>
                <p className="text-xs text-gray-500 mt-0.5">待入库登记单位</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.max(1, (typeof prev === 'number' ? prev : 1) - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded shadow-sm text-gray-600 active:scale-90 duration-150 text-base font-bold"
                >
                  <Minus className="w-4 h-4 text-[#005bbf]" />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => {
                    const valueStr = e.target.value;
                    if (valueStr === '') {
                      setQty('');
                    } else {
                      const valueNum = parseInt(valueStr);
                      if (!isNaN(valueNum)) {
                        setQty(valueNum);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (qty === '' || qty < 1) {
                      setQty(1);
                    }
                  }}
                  className="w-12 text-center text-lg font-bold text-[#005bbf] bg-transparent outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setQty((prev) => (typeof prev === 'number' ? prev : 0) + 1)}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-gray-100 rounded shadow-sm text-gray-600 active:scale-90 duration-150 text-base font-bold"
                >
                  <Plus className="w-4 h-4 text-[#005bbf]" />
                </button>
              </div>
            </div>

            {/* Selection Overview Banner */}
            <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">商品 SKU</span>
                <span className="font-mono font-bold text-gray-900">{barcode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">核准位置</span>
                <span className="font-semibold text-gray-900">{selectedLocation || '默认为 A区 - 货位 1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">供货来源</span>
                <span className="font-semibold text-gray-900">{selectedSupplier || '默认全球合伙物流'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 h-11 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                type="button"
                onClick={handleManualAddToList}
                className="flex-1 h-11 bg-[#005bbf] text-white rounded-xl text-xs font-bold leading-none hover:bg-blue-700 transition-all flex items-center justify-center gap-1"
              >
                <ListPlus className="w-4 h-4" /> 加入待入库列表
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recents Pending Confirmation list */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">
            待确认在途列表 ({pendingInbounds.length})
          </h3>
          {pendingInbounds.length > 0 && (
            <button
              onClick={onConfirmAllInbounds}
              className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
            >
              一键登记入库
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {pendingInbounds.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col justify-center items-center gap-1.5">
              <ListPlus className="w-8 h-8 text-gray-300" />
              <span>暂无待入库批次。录入上方商品加入列表。</span>
            </div>
          ) : (
            pendingInbounds.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-3 bg-slate-50 border border-gray-100 p-3.5 rounded-xl group relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-[14px] text-gray-800 truncate pr-2">
                      {item.name}
                    </span>
                    <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +{item.qty}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                    <span>SKU: {item.sku}</span>
                    <span className="truncate max-w-[120px] text-right">{item.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemovePendingInbound(item.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg font-medium text-xs transition-colors opacity-80 group-hover:opacity-100 ml-1.5"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Complete Inbound Master Action */}
      {pendingInbounds.length > 0 && (
        <div className="pt-2">
          <button
            onClick={onConfirmAllInbounds}
            className="w-full h-12 bg-[#006e2c] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 duration-200 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" /> 确认入库并更新账套 (共 {pendingInbounds.length} 批)
          </button>
        </div>
      )}
    </div>
  );
}
