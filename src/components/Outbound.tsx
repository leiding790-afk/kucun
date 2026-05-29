import { useState } from 'react';
import { 
  Search, 
  Barcode, 
  MapPin, 
  Clock, 
  Plus, 
  Minus, 
  CheckCircle,
  Truck,
  Trash2,
  AlertCircle,
  PackageOpen
} from 'lucide-react';
import { Product, OutboundItem } from '../types';

interface OutboundProps {
  products: Product[];
  outboundCart: OutboundItem[];
  onUpdateCartQty: (productId: string, qty: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onConfirmOutbound: (location: string, isExpress: boolean) => void;
}

export default function Outbound({
  products,
  outboundCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onAddToCart,
  onConfirmOutbound
}: OutboundProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('中心配送枢纽');
  const [isExpress, setIsExpress] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [localQuantities, setLocalQuantities] = useState<Record<string, string>>({});

  // Search product catalog
  const foundProducts = products.filter(
    (p) => p.name.includes(searchQuery) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total items dispatched
  const totalUnits = outboundCart.reduce((sum, item) => sum + item.qty, 0);

  // Map cart items with actual product details
  const cartWithDetails = outboundCart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter(item => item.product !== undefined) as Array<OutboundItem & { product: Product }>;

  const handleSelectItemForCart = (productId: string) => {
    onAddToCart(productId);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleApplyShipping = () => {
    if (outboundCart.length === 0) return;
    onConfirmOutbound(selectedLocation, isExpress);
  };

  return (
    <div className="space-y-6 pb-20 mt-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">出库申请</h1>
        <p className="text-xs text-gray-500 mt-1">管理并核对物料订单的包装出库与运输安排</p>
      </div>

      {/* Product Search & Inject Barcode */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          placeholder="快速搜索产品名称 or SKU 添加到待交付..."
          className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#005bbf] focus:border-transparent outline-none text-sm transition-all"
        />
        <div className="absolute inset-y-0 right-3.5 flex items-center">
          <button
            onClick={() => {
              // Add a random product into cart for mock scanning speed
              const match = products[Math.floor(Math.random() * products.length)];
              onAddToCart(match.id);
            }}
            className="text-[#005bbf] p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="模拟扫描条码添加"
          >
            <Barcode className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Dropdown */}
        {showSearchResults && searchQuery && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-gray-50">
            {foundProducts.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 font-medium">
                无匹配产品，您可以检查输入或新建商品
              </div>
            ) : (
              foundProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectItemForCart(p.id)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{p.name}</span>
                    <span className="text-[10px] text-gray-400">目前库存: {p.stock} 单位</span>
                  </div>
                  <span className="font-mono text-[#005bbf] bg-blue-50 px-2.5 py-1 rounded font-bold">
                    {p.sku}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Destination / Customer section */}
      <section className="p-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100/90">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[#005bbf]" /> 核心揽收件目的地与优先级
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 ml-1">客户结算网点 / 位置</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] outline-none text-xs cursor-pointer appearance-none"
            >
              <option value="中心配送枢纽">中心配送枢纽 (Hub 01)</option>
              <option value="西区零售店 #4">西区零售店 #4 (Branch West)</option>
              <option value="北部物流中心">北部物流中心 (Northern Depot)</option>
              <option value="直接客户出货">直接客户分拨 (Direct Client Mail)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 ml-1">运输时效优先级</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsExpress(false)}
                className={`flex-1 h-11 rounded-xl text-xs font-bold leading-none transition-all ${
                  !isExpress
                    ? 'bg-blue-50 border border-[#005bbf] text-[#005bbf]'
                    : 'border border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
              >
                标准 (Regular)
              </button>
              <button
                type="button"
                onClick={() => setIsExpress(true)}
                className={`flex-1 h-11 rounded-xl text-xs font-bold leading-none transition-all ${
                  isExpress
                    ? 'bg-amber-50 border border-amber-600 text-amber-600'
                    : 'border border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
              >
                加急 (Express)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Items Grid */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            已选择的订单提用商品 ({cartWithDetails.length})
          </h2>
          {outboundCart.length === 0 && products.length > 0 && (
            <button
              onClick={() => {
                // Prepopulate standard images list items into outbound Cart for testing as mockup
                onAddToCart(products[0].id); // 工业传感器 A1
                onAddToCart(products[1].id); // 屏蔽电源线
              }}
              className="text-xs text-[#005bbf] font-bold hover:underline"
            >
              一键推荐预填
            </button>
          )}
        </div>

        {cartWithDetails.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col justify-center items-center gap-2">
            <PackageOpen className="w-10 h-10 text-gray-300" />
            <span>暂未挑选物料。搜索并在上方点击添加，或尝试一键推荐预填。</span>
          </div>
        ) : (
          <div className="space-y-3">
            {cartWithDetails.map((item) => {
              const p = item.product;
              const isLowStock = p.stock <= p.minStock;
              return (
                <div
                  key={item.productId}
                  className="bg-white p-3.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-gray-100 relative group transition-all hover:shadow-md"
                >
                  {/* Remove Button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onRemoveFromCart(item.productId)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="移除出库"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-mono">
                          PKG
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <span className="text-[10px] text-gray-400 font-mono block">SKU: {p.sku}</span>
                      <h3 className="font-bold text-[14px] text-gray-900 truncate mt-0.5">{p.name}</h3>
                      
                      <div className="mt-3.5 flex items-end justify-between">
                        <div>
                          <span className="text-[11px] text-gray-400 block font-mono">
                            可用库存: {p.stock} 单位
                          </span>
                          <div className="flex items-center gap-3 mt-1.5">
                            <button
                              onClick={() => {
                                setLocalQuantities((prev) => {
                                  const next = { ...prev };
                                  delete next[item.productId];
                                  return next;
                                });
                                if (item.qty > 1) {
                                  onUpdateCartQty(item.productId, item.qty - 1);
                                } else {
                                  onRemoveFromCart(item.productId);
                                }
                              }}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all active:scale-95 font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={localQuantities[item.productId] !== undefined ? localQuantities[item.productId] : item.qty}
                              onChange={(e) => {
                                const text = e.target.value;
                                setLocalQuantities((prev) => ({ ...prev, [item.productId]: text }));
                                
                                if (text !== '') {
                                  let parsed = parseInt(text);
                                  if (!isNaN(parsed) && parsed >= 0) {
                                    if (parsed > p.stock) {
                                      parsed = p.stock;
                                    }
                                    onUpdateCartQty(item.productId, parsed);
                                  }
                                }
                              }}
                              onBlur={() => {
                                setLocalQuantities((prev) => {
                                  const next = { ...prev };
                                  delete next[item.productId];
                                  return next;
                                });
                                if (item.qty < 1) {
                                  onUpdateCartQty(item.productId, 1);
                                }
                              }}
                              className="w-12 h-8 text-center text-sm font-bold text-[#005bbf] font-mono bg-gray-150 focus:bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              disabled={item.qty >= p.stock}
                              onClick={() => {
                                setLocalQuantities((prev) => {
                                  const next = { ...prev };
                                  delete next[item.productId];
                                  return next;
                                });
                                onUpdateCartQty(item.productId, item.qty + 1);
                              }}
                              className="w-8 h-8 rounded-full border border-[#005bbf] flex items-center justify-center text-[#005bbf] hover:bg-blue-50 transition-all disabled:opacity-40 active:scale-95 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isLowStock 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-[#86f898]/30 text-[#00722f]'
                        }`}>
                          {isLowStock ? '低库存' : '有货'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Summary & Action Commit Card */}
      {cartWithDetails.length > 0 && (
        <section className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-500">累计待出库总数</span>
            <span className="text-xl font-bold text-[#005bbf]">{totalUnits} 单位</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>预计出库审核、物流封箱装载耗时：45 分钟。</span>
          </div>

          {/* Warning if any item has qty > stock */}
          {cartWithDetails.some((item) => item.qty > item.product.stock) && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>注意：部分商品出库数量已超出当前配额！请校准！</span>
            </div>
          )}

          <button
            onClick={handleApplyShipping}
            disabled={cartWithDetails.some((item) => item.qty > item.product.stock)}
            className="w-full h-11 bg-[#e65100] hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> 确认物料出库 (总计 {totalUnits} 单位)
          </button>
        </section>
      )}
    </div>
  );
}
