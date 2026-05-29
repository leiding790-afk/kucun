import { useState, FormEvent, DragEvent, ChangeEvent } from 'react';
import { 
  Search, 
  MapPin, 
  Plus, 
  X, 
  Tag, 
  Boxes, 
  Truck, 
  TrendingUp, 
  AlertTriangle,
  SlidersHorizontal,
  FolderPlus,
  Upload,
  FileSpreadsheet,
  FileCode,
  Info,
  Download,
  CheckCircle,
  Copy,
  Trash2
} from 'lucide-react';
import { Product } from '../types';

interface InventoryListProps {
  products: Product[];
  categories: string[];
  suppliers: string[];
  locations: string[];
  onUpdateCategories: (categories: string[]) => void;
  onUpdateSuppliers: (suppliers: string[]) => void;
  onUpdateLocations: (locations: string[]) => void;
  onSelectProduct: (product: Product) => void;
  onAddNewProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onBulkAddProducts?: (products: Product[]) => void;
}

export default function InventoryList({
  products,
  categories = [],
  suppliers = [],
  locations = [],
  onUpdateCategories,
  onUpdateSuppliers,
  onUpdateLocations,
  onSelectProduct,
  onAddNewProduct,
  onUpdateStock,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAddProducts
}: InventoryListProps) {
  const [search, setSearch] = useState('');
  const [selectedChip, setSelectedChip] = useState<string>('全部');
  const [sortByDateAndStock, setSortByDateAndStock] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  
  // Custom master parameter controller toggle
  const [configOpen, setConfigOpen] = useState(false);
  const [configSubTab, setConfigSubTab] = useState<'categories' | 'suppliers' | 'locations'>('categories');
  
  // Create New Product Modal form states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState(categories[0] || '电子产品');
  const [newInitialStock, setNewInitialStock] = useState(1);
  const [newMinStock, setNewMinStock] = useState(10);
  const [newSupplier, setNewSupplier] = useState(suppliers[0] || '');
  const [newLocation, setNewLocation] = useState(locations[0] || '');

  // Bulk Upload Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsedItems, setParsedItems] = useState<Product[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Edit fields for selected Product Details
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editCat, setEditCat] = useState(categories[0] || '电子产品');
  const [editStockVal, setEditStockVal] = useState(0);
  const [editMinStock, setEditMinStock] = useState(10);
  const [editLocation, setEditLocation] = useState(locations[0] || '');
  const [editSupplier, setEditSupplier] = useState(suppliers[0] || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Quick configuration inputs state
  const [newConfigCategory, setNewConfigCategory] = useState('');
  const [newConfigSupplier, setNewConfigSupplier] = useState('');
  const [newConfigLocation, setNewConfigLocation] = useState('');

  // Filtering Logic
  let filteredList = products.filter((p) => {
    const matchesSearch = p.name.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedChip === '全部') return true;
    if (selectedChip === '低库存') return p.stock <= p.minStock;
    return p.category === selectedChip;
  });

  // Sorting
  if (sortByDateAndStock) {
    // Sort critical stock first
    filteredList = [...filteredList].sort((a, b) => a.stock - b.stock);
  }

  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;

    onAddNewProduct({
      sku: newSku.toUpperCase().trim(),
      name: newName.trim(),
      category: newCat,
      stock: newInitialStock,
      minStock: newMinStock,
      warehouseLocation: newLocation,
      imageUrl: '', 
      supplier: newSupplier
    });

    // Reset fields
    setNewSku('');
    setNewName('');
    setNewInitialStock(1);
    setNewMinStock(10);
    setCreateModalOpen(false);
  };

  const handleSaveProductEdit = () => {
    if (selectedProductDetails) {
      if (onUpdateProduct) {
        onUpdateProduct({
          ...selectedProductDetails,
          sku: editSku.toUpperCase().trim(),
          name: editName.trim(),
          category: editCat,
          stock: editStockVal,
          minStock: editMinStock,
          warehouseLocation: editLocation,
          supplier: editSupplier
        });
      } else {
        onUpdateStock(selectedProductDetails.id, editStockVal);
      }
      setSelectedProductDetails(null);
    }
  };

  // CSV and JSON parser helpers
  const parseCSV = (text: string): Product[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) return [];

    const parsed: Product[] = [];
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    const colIndex = {
      sku: headers.findIndex(h => h.includes('sku') || h.includes('货号') || h.includes('编码')),
      name: headers.findIndex(h => h.includes('name') || h.includes('名称') || h.includes('产品') || h.includes('物料')),
      category: headers.findIndex(h => h.includes('category') || h.includes('分类') || h.includes('品类')),
      stock: headers.findIndex(h => h.includes('stock') || h.includes('库存') || h.includes('数量')),
      minStock: headers.findIndex(h => h.includes('min') || h.includes('警戒') || h.includes('安全')),
      location: headers.findIndex(h => h.includes('location') || h.includes('位置') || h.includes('储位') || h.includes('货位')),
      supplier: headers.findIndex(h => h.includes('supplier') || h.includes('供应商') || h.includes('来源'))
    };

    // If headers cannot be detected cleanly, assume default order:
    // SKU, Name, Category, Stock, MinStock, Location, Supplier
    const isCustomHeader = Object.values(colIndex).some(index => index !== -1);

    for (let i = 1; i < lines.length; i++) {
      // Split by comma but respect quotes if any
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 2) continue;

      let sku = '';
      let name = '';
      let category = categories[0] || '电子产品';
      let stock = 0;
      let minStock = 10;
      let warehouseLocation = locations[0] || 'A区 - 货位 1';
      let supplier = suppliers[0] || '';

      if (isCustomHeader) {
        sku = colIndex.sku !== -1 ? cols[colIndex.sku] : cols[0];
        name = colIndex.name !== -1 ? cols[colIndex.name] : cols[1];
        category = colIndex.category !== -1 ? cols[colIndex.category] : (categories[0] || '电子产品');
        stock = colIndex.stock !== -1 ? parseInt(cols[colIndex.stock]) || 0 : 0;
        minStock = colIndex.minStock !== -1 ? parseInt(cols[colIndex.minStock]) || 10 : 10;
        warehouseLocation = colIndex.location !== -1 ? cols[colIndex.location] : (locations[0] || 'A区 - 货位 1');
        supplier = colIndex.supplier !== -1 ? cols[colIndex.supplier] : (suppliers[0] || '');
      } else {
        // Fallback default structure
        sku = cols[0] || '';
        name = cols[1] || '';
        category = cols[2] || (categories[0] || '电子产品');
        stock = parseInt(cols[3]) || 0;
        minStock = parseInt(cols[4]) || 10;
        warehouseLocation = cols[5] || (locations[0] || 'A区 - 货位 1');
        supplier = cols[6] || (suppliers[0] || '');
      }

      if (sku && name) {
        parsed.push({
          id: `prod-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          sku: sku.toUpperCase().trim(),
          name: name.trim(),
          category,
          stock,
          minStock,
          warehouseLocation,
          imageUrl: '',
          supplier
        });
      }
    }
    return parsed;
  };

  const parseJSON = (text: string): Product[] => {
    const raw = JSON.parse(text);
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map((item: any, idx: number) => ({
      id: item.id || `prod-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      sku: (item.sku || item.SKU || '').toUpperCase().trim(),
      name: item.name || item.名称 || item.productName || '',
      category: item.category || item.分类 || categories[0] || '电子产品',
      stock: parseInt(item.stock ?? item.库存 ?? item.qty ?? 0) || 0,
      minStock: parseInt(item.minStock ?? item.安全库存 ?? item.min_stock ?? 10) || 10,
      warehouseLocation: item.warehouseLocation || item.warehouse_location || item.储位 || item.location || locations[0] || 'A区 - 货位 1',
      imageUrl: item.imageUrl || '',
      supplier: item.supplier || item.供应商 || item.vendor || suppliers[0] || ''
    })).filter((p: Product) => p.sku && p.name);
  };

  const processContentText = (text: string) => {
    try {
      setParseError(null);
      let list: Product[] = [];
      const trimmed = text.trim();
      
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        list = parseJSON(trimmed);
      } else {
        list = parseCSV(trimmed);
      }

      if (list.length === 0) {
        setParseError('未成功解析出任何符合条件的产品。请检查格式。');
      } else {
        setParsedItems(list);
      }
    } catch (e: any) {
      setParseError(`解析失败: ${e.message || '请检查语法格式'}`);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setParseError(null);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPasteText(content);
        processContentText(content);
      }
    };
    reader.onerror = () => {
      setParseError('读取文件出错！');
    };
    reader.readAsText(file);
  };

  const handleDemoFill = (type: 'csv' | 'json') => {
    if (type === 'csv') {
      const demo = `货号,产品名称,所属分类,当前库存,安全库存,储位货区,供应商\nSKU-DEMO-01,便携全功能机械键盘 v2,电子产品,150,15,A区 - 货位 2,华为智选有限公司\nSKU-DEMO-02,高级人体工学网椅,办公家具,45,8,C区 - 货位 1,联想仓储渠道处\nSKU-DEMO-03,8口千兆工业级数交换机,硬件,88,12,B区 - 货位 3,大疆科技创新部`;
      setPasteText(demo);
      processContentText(demo);
    } else {
      const demo = `[\n  {\n    "sku": "SKU-JSON-99",\n    "name": "多功能折叠液晶显示器 27寸",\n    "category": "电子产品",\n    "stock": 35,\n    "minStock": 5,\n    "warehouseLocation": "A区 - 货位 1",\n    "supplier": "小米自营事业部"\n  }\n]`;
      setPasteText(demo);
      processContentText(demo);
    }
  };

  const handleConfirmImport = () => {
    if (onBulkAddProducts && parsedItems.length > 0) {
      onBulkAddProducts(parsedItems);
      setParsedItems([]);
      setPasteText('');
      setUploadModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 mt-4 relative">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">库存清单与建档</h2>
        <p className="text-xs text-gray-500 mt-1">全面核查实物、自定义SKU及支持任意产品和货盘批量上传</p>
      </div>

      {/* Sticky Search bar */}
      <section className="space-y-3.5 bg-gray-50/95 py-2">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#005bbf] transition-colors w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="按 SKU 或货品模糊名称搜索..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white focus:ring-1 focus:ring-[#005bbf] focus:border-[#005bbf] outline-none text-xs transition-all"
            />
          </div>
          <button
            onClick={() => setSortByDateAndStock(!sortByDateAndStock)}
            className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all ${
              sortByDateAndStock
                ? 'bg-blue-50 border-[#005bbf] text-[#005bbf]'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
            }`}
            title="优先看低仓促款型"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Chips Selection & Bulk Upload Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1 font-sans">
            {['全部', '低库存', ...categories].map((chip) => {
              const isSel = selectedChip === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedChip(chip)}
                  className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-all ${
                    isSel
                      ? 'bg-[#005bbf] text-white shadow-sm font-semibold'
                      : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>批量上传</span>
          </button>
        </div>
      </section>

      {/* Dynamic Master Config Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setConfigOpen(!configOpen)}
          className="w-full h-11 bg-slate-100 hover:bg-slate-200/85 text-[#005bbf] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all outline-none border border-gray-250/50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {configOpen ? '关闭快捷配置箱' : '🔧 快捷配置 (分类清单、供货商渠道、仓库货架自定义)'}
        </button>

        {configOpen && (
          <div className="bg-white border border-gray-200/90 p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-bold text-xs text-gray-700 tracking-wider">🛠️ 储运基础参数配置箱</span>
              <span className="text-[10px] text-gray-400">增删数据后，登记入库、建档表单实时联锁更新</span>
            </div>

            {/* Sub Tabs Selector */}
            <div className="flex border-b border-gray-100 pb-0.5 gap-1">
              <button
                type="button"
                onClick={() => setConfigSubTab('categories')}
                className={`flex-1 py-1.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center justify-center gap-1 cursor-pointer ${
                  configSubTab === 'categories'
                    ? 'border-[#005bbf] text-[#005bbf] bg-blue-50/20'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <span>🛍️ 分类清单</span>
                <span className="bg-blue-100 text-[#005bbf] text-[10px] px-1.5 py-0.2 rounded-full font-mono">{categories.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfigSubTab('suppliers')}
                className={`flex-1 py-1.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center justify-center gap-1 cursor-pointer ${
                  configSubTab === 'suppliers'
                    ? 'border-orange-600 text-orange-600 bg-orange-50/20'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <span>🚚 合作渠道</span>
                <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.2 rounded-full font-mono">{suppliers.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfigSubTab('locations')}
                className={`flex-1 py-1.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center justify-center gap-1 cursor-pointer ${
                  configSubTab === 'locations'
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <span>📍 货位货架</span>
                <span className="bg-emerald-100 text-emerald-600 text-[10px] px-1.5 py-0.2 rounded-full font-mono">{locations.length}</span>
              </button>
            </div>

            {/* Sub Tab Panel - Categories */}
            {configSubTab === 'categories' && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                <p className="text-[11px] text-gray-400">
                  修改分类变动会实时更新分类筛选卡片(Chips)和商品列表下拉菜单。
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例如: 智能穿戴、办公耗材"
                    value={newConfigCategory}
                    onChange={(e) => setNewConfigCategory(e.target.value)}
                    className="flex-1 h-9.5 px-3 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-gray-50/50 focus:bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newConfigCategory.trim();
                        if (val && !categories.includes(val)) {
                          onUpdateCategories([...categories, val]);
                          setNewConfigCategory('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newConfigCategory.trim();
                      if (val && !categories.includes(val)) {
                        onUpdateCategories([...categories, val]);
                        setNewConfigCategory('');
                      }
                    }}
                    className="h-9.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                  >
                    + 新建品类
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 rounded-lg bg-slate-50/50">
                  {categories.map((c) => (
                    <div key={c} className="flex items-center justify-between gap-1.5 bg-white border border-gray-150 h-8 px-2.5 rounded-md shadow-sm">
                      <span className="font-semibold text-gray-700 truncate text-xs">{c}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateCategories(categories.filter((item) => item !== c))}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        title="删除分类"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full py-4 text-center text-gray-400 text-xs font-mono">
                      暂无自定义品类，请添加建档
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub Tab Panel - Suppliers */}
            {configSubTab === 'suppliers' && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                <p className="text-[11px] text-gray-400">
                  配置和增加合作的货源供应商，入库登记时将直接可选。
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例如: 顺丰冷链速运、创美供应链"
                    value={newConfigSupplier}
                    onChange={(e) => setNewConfigSupplier(e.target.value)}
                    className="flex-1 h-9.5 px-3 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500 font-medium bg-gray-50/50 focus:bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newConfigSupplier.trim();
                        if (val && !suppliers.includes(val)) {
                          onUpdateSuppliers([...suppliers, val]);
                          setNewConfigSupplier('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newConfigSupplier.trim();
                      if (val && !suppliers.includes(val)) {
                        onUpdateSuppliers([...suppliers, val]);
                        setNewConfigSupplier('');
                      }
                    }}
                    className="h-9.5 px-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                  >
                    + 新建货源渠道
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 rounded-lg bg-slate-50/50">
                  {suppliers.map((s) => (
                    <div key={s} className="flex items-center justify-between gap-1.5 bg-white border border-gray-150 h-8 px-2.5 rounded-md shadow-sm">
                      <span className="font-semibold text-gray-700 truncate text-xs">{s}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateSuppliers(suppliers.filter((item) => item !== s))}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        title="删除渠道"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {suppliers.length === 0 && (
                    <div className="col-span-full py-4 text-center text-gray-400 text-xs font-mono">
                      暂无自定义供应商渠道，请添加建档
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub Tab Panel - Locations */}
            {configSubTab === 'locations' && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                <p className="text-[11px] text-gray-400">
                  增删货架和货位储区，所有登记商品及修改储位都将自动看齐此处的变量。
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例如: C区-货位-12、E区-货位-05"
                    value={newConfigLocation}
                    onChange={(e) => setNewConfigLocation(e.target.value)}
                    className="flex-1 h-9.5 px-3 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium bg-gray-50/50 focus:bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = newConfigLocation.trim();
                        if (val && !locations.includes(val)) {
                          onUpdateLocations([...locations, val]);
                          setNewConfigLocation('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newConfigLocation.trim();
                      if (val && !locations.includes(val)) {
                        onUpdateLocations([...locations, val]);
                        setNewConfigLocation('');
                      }
                    }}
                    className="h-9.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                  >
                    + 新建储位货位
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 rounded-lg bg-slate-50/50">
                  {locations.map((l) => (
                    <div key={l} className="flex items-center justify-between gap-1.5 bg-white border border-gray-150 h-8 px-2.5 rounded-md shadow-sm">
                      <span className="font-semibold text-gray-700 truncate text-xs">{l}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateLocations(locations.filter((item) => item !== l))}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        title="删除货位"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {locations.length === 0 && (
                    <div className="col-span-full py-4 text-center text-gray-400 text-xs font-mono">
                      暂无储位位置，请添加建档
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meta info info line */}
      <div className="flex justify-between items-center text-xs text-gray-400 font-medium pb-1 border-b border-gray-100">
        <span>已加载 {filteredList.length} 件配套物料货盘</span>
        <button
          onClick={() => setSortByDateAndStock(!sortByDateAndStock)}
          className="text-[#005bbf] hover:underline flex items-center gap-0.5"
        >
          {sortByDateAndStock ? '默认顺序' : '按供货紧俏低仓排序'}
        </button>
      </div>

      {/* Inventory Cards list */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">
            对不起，未检索到该筛选条件的任何产品，您可以点击下方 [+] 或者右上角 [批量上传] 快速建档！
          </div>
        ) : (
          filteredList.map((p) => {
            const isOutOfStock = p.stock === 0;
            const isLowStock = p.stock > 0 && p.stock <= p.minStock;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProductDetails(p);
                  setEditSku(p.sku);
                  setEditName(p.name);
                  setEditCat(p.category);
                  setEditStockVal(p.stock);
                  setEditMinStock(p.minStock);
                  setEditLocation(p.warehouseLocation);
                  setEditSupplier(p.supplier);
                  setIsConfirmingDelete(false);
                }}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex gap-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200 active:scale-[0.99]"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img className="w-full h-full object-cover" src={p.imageUrl} alt={p.name} />
                  ) : (
                    <Boxes className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                <div className="flex-grow flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-gray-400 font-medium font-mono uppercase tracking-wider">
                        SKU: {p.sku}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        isOutOfStock 
                          ? 'bg-red-50 text-red-600'
                          : isLowStock 
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isOutOfStock ? '缺货' : isLowStock ? '库存偏低' : '货源充沛'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[14px] text-gray-900 mt-0.5 truncate pr-2">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-gray-450 mt-0.5">品类: {p.category}</p>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <span className="text-gray-450 text-[11px] flex items-center gap-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#005bbf]" /> {p.warehouseLocation}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-400 leading-none">实存仓储</span>
                      <span className={`font-bold text-base mt-0.5 ${isOutOfStock ? 'text-red-500' : 'text-[#005bbf]'}`}>
                        {p.stock} 件
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button for creation */}
      <button
        type="button"
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#005bbf] text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer border border-[#005bbf]/10"
        title="手动单件建档"
      >
        <Plus className="w-6 h-6 stroke-[2.5px]" />
      </button>

      {/* Product Detail & Edit Modal Slider */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="bg-[#005bbf] p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-base leading-none">编辑产品货盘建档属性</h3>
              <button
                type="button"
                onClick={() => setSelectedProductDetails(null)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedProductDetails.imageUrl ? (
                    <img src={selectedProductDetails.imageUrl} alt={selectedProductDetails.name} className="w-full h-full object-cover" />
                  ) : (
                    <Boxes className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 font-mono block">修改SKU与基础信息：</span>
                  <p className="font-bold text-xs text-gray-700 truncate">{selectedProductDetails.name}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-450 font-semibold mb-1">SKU 货号</label>
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#005bbf] font-mono text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-450 font-semibold mb-1">产品货盘物料名称</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#005bbf] text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-450 font-semibold mb-1">所属分类</label>
                    <select
                      value={editCat}
                      onChange={(e) => setEditCat(e.target.value)}
                      className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800"
                    >
                      {categories.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-450 font-semibold mb-1">供货渠道商</label>
                    <select
                      value={editSupplier}
                      onChange={(e) => setEditSupplier(e.target.value)}
                      className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 truncate"
                    >
                      {suppliers.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-450 font-semibold mb-1">预分配储区货架</label>
                    <select
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800"
                    >
                      {locations.map((l, idx) => (
                        <option key={idx} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-450 font-semibold mb-1">安全库存水位线</label>
                    <input
                      type="number"
                      value={editMinStock}
                      onChange={(e) => setEditMinStock(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#005bbf] text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-1 p-3 border border-blue-100 bg-blue-50/20 rounded-xl">
                  <label className="block text-[11px] font-semibold text-gray-500">
                    当前实物可用量 (Stock adjustment)
                  </label>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditStockVal((prev) => Math.max(0, prev - 1))}
                      className="w-8 h-8 border border-gray-250 bg-white rounded flex items-center justify-center text-sm hover:bg-gray-100 select-none font-bold text-gray-800"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={editStockVal}
                      onChange={(e) => setEditStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 h-8 px-2 text-center text-sm font-bold bg-white border border-gray-250 rounded outline-none w-16 text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => setEditStockVal((prev) => prev + 1)}
                      className="w-8 h-8 border border-gray-255 bg-white rounded flex items-center justify-center text-sm hover:bg-gray-100 select-none font-bold text-gray-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Deletion option */}
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                  {!isConfirmingDelete ? (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(true)}
                      className="w-full h-9 border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除该 SKU 物料货盘建档
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl space-y-2 text-left">
                      <p className="text-[10px] text-red-700 font-bold text-center leading-normal">
                        ⚠️ 确认从仓储系统库房中永久销账该 SKU 货盘？（不可撤销）
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsConfirmingDelete(false)}
                          className="flex-1 h-8 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeleteProduct) {
                              onDeleteProduct(selectedProductDetails.id);
                            }
                            setSelectedProductDetails(null);
                          }}
                          className="flex-1 h-8 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          确认删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedProductDetails(null)}
                  className="flex-1 h-10 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductEdit}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Creation Modal (Dialog) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="bg-[#005bbf] p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-base leading-none flex items-center gap-1.5">
                <FolderPlus className="w-5 h-5 text-green-350" /> 新建产品货盘档案
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">SKU 货号 *</label>
                <input
                  type="text"
                  required
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="例如 HL-CH-092"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-mono text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">货品/托盘名称 *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="定义仓储流转产品名称"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">所属分类</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full h-10 px-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white text-gray-800"
                  >
                    {categories.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">货源供应商</label>
                  <select
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full h-10 px-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white text-gray-800 truncate"
                  >
                    {suppliers.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">初始在库数量</label>
                  <input
                    type="number"
                    min={0}
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">警戒安全水位值</label>
                  <input
                    type="number"
                    min={1}
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">分配指定储区货区</label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full h-10 px-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white text-gray-800"
                >
                  {locations.map((l, idx) => (
                    <option key={idx} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-grow h-11 border border-gray-200 text-gray-500 font-bold text-xs rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-grow h-11 bg-[#005bbf] hover:bg-blue-700 text-white font-bold text-xs rounded-lg active:scale-95 transition-all w-32"
                >
                  建立货品档案
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-base leading-none flex items-center gap-1.5">
                <Upload className="w-5 h-5 text-emerald-250" /> 批量上传导入货盘与库存
              </h3>
              <button
                type="button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setParsedItems([]);
                  setPasteText('');
                  setParseError(null);
                }}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Choice Tabs */}
            <div className="flex border-b border-gray-100 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setUploadTab('upload')}
                className={`flex-1 py-3 text-center font-bold tracking-wide transition-all ${
                  uploadTab === 'upload' 
                    ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/10' 
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                拖拽/上传文件
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('paste')}
                className={`flex-1 py-3 text-center font-bold tracking-wide transition-all ${
                  uploadTab === 'paste' 
                    ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/10' 
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                粘贴文本数据 (CSV / JSON)
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {uploadTab === 'upload' ? (
                <div className="space-y-3">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                      dragActive 
                        ? 'border-emerald-600 bg-emerald-50/30' 
                        : 'border-gray-200 hover:border-emerald-500 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-gray-300" />
                    <p className="text-gray-600 font-semibold text-center">可将 CSV 或 JSON 文件拖拽于此</p>
                    <p className="text-gray-400 text-[10px] text-center">或点击下方选择本地文件</p>
                    
                    <label className="mt-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors inline-block cursor-pointer">
                      选择文件
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-gray-500 font-semibold">输入或粘贴原始 CSV 或 JSON (含表头):</label>
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => {
                      setPasteText(e.target.value);
                      processContentText(e.target.value);
                    }}
                    placeholder="货号,产品名称,所属分类,当前库存,安全库存,储位货区,供应商&#13;SKU-A,产品A,电子产品,100,10,A区,货源商A"
                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none font-mono text-[10px] focus:ring-1 focus:ring-emerald-500 text-gray-800 bg-gray-50/50"
                  />
                </div>
              )}

              {/* Demo template loaders */}
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="font-semibold text-[10px] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    格式速查与快捷样例:
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoFill('csv')}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded text-[10px] font-medium flex items-center justify-center gap-1"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> 载入 CSV 范本
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('json')}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded text-[10px] font-medium flex items-center justify-center gap-1"
                  >
                    <FileCode className="w-3 h-3 text-amber-600" /> 载入 JSON 范本
                  </button>
                </div>
              </div>

              {/* Parsing status feedbacks */}
              {parseError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p className="font-medium text-[10px]">{parseError}</p>
                </div>
              )}

              {parsedItems.length > 0 && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="font-bold text-[10px]">就绪：成功解析并匹配到 {parsedItems.length} 款合格产品物料</p>
                  </div>

                  {/* Tiny preview container list */}
                  <div className="border border-gray-100 rounded-lg divide-y divide-gray-50 max-h-32 overflow-y-auto bg-gray-50/30">
                    {parsedItems.map((pi, idx) => (
                      <div key={idx} className="p-2 flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] text-[#005bbf] font-semibold">{pi.sku}</p>
                          <p className="text-[10px] text-gray-700 truncate font-semibold">{pi.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] text-gray-400">{pi.warehouseLocation}</p>
                          <p className="font-bold text-gray-800">{pi.stock} 件</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUploadModalOpen(false);
                  setParsedItems([]);
                  setPasteText('');
                  setParseError(null);
                }}
                className="flex-1 h-10 border border-gray-250 text-gray-500 font-bold text-xs rounded-xl bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={parsedItems.length === 0}
                onClick={handleConfirmImport}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl disabled:bg-gray-200 disabled:text-gray-450 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                导入 {parsedItems.length > 0 ? `(${parsedItems.length} 款)` : ''} 到系统
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
