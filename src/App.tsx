import { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Inbound from './components/Inbound';
import Outbound from './components/Outbound';
import InventoryList from './components/InventoryList';
import LoginScreen from './components/LoginScreen';
import NewcomerManagement from './components/NewcomerManagement';

import { Product, PendingInbound, OutboundItem, TabType, UserAccount, OutboundShipment } from './types';
import { INITIAL_PRODUCTS } from './data';
import { Sparkles, CheckCircle2, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';

export default function App() {
  // Master Tab State
  const [tab, setTab] = useState<TabType>('dashboard');

  // Logged-in Operator User state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('si_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing current user', e);
      }
    }
    return null;
  });

  // Persist current session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('si_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('si_current_user');
    }
  }, [currentUser]);

  // Products Database (persisted with localStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('si_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved products, fallback', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Pending Inbounds (persisted with localStorage)
  const [pendingInbounds, setPendingInbounds] = useState<PendingInbound[]>(() => {
    const saved = localStorage.getItem('si_pending_inbounds');
    return saved ? JSON.parse(saved) : [];
  });

  // Outbound Cart (persisted with localStorage)
  const [outboundCart, setOutboundCart] = useState<OutboundItem[]>(() => {
    const saved = localStorage.getItem('si_outbound_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Cumulative Metrics for Daily Performance Panels
  const [todayInboundCount, setTodayInboundCount] = useState<number>(() => {
    const saved = localStorage.getItem('si_today_inbound');
    return saved ? parseInt(saved) : 428;
  });

  const [todayOutboundCount, setTodayOutboundCount] = useState<number>(() => {
    const saved = localStorage.getItem('si_today_outbound');
    return saved ? parseInt(saved) : 156;
  });

  // Outbound Shipments History Database (persisted with localStorage)
  const [outboundShipments, setOutboundShipments] = useState<OutboundShipment[]>(() => {
    const saved = localStorage.getItem('si_outbound_shipments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing shipments', e);
      }
    }
    // Return high quality visual mock shipments
    return [
      {
        id: 'ship-1',
        date: '周一',
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
        location: '北京分拨中心',
        trackingNumber: 'SF18903829410',
        items: [
          { productName: '礁依瓶 (350ml)', sku: 'BTL-JY-350', qty: 42, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmHSpw2WT9c-t3D0aAccF-X4PmJNvBZ8ap4Fyc5QAW9mQe2WL9qyxclMlC8WfqppZk-vQxDcZzrM385U1FtPSKzdztuPynIp4ECAdSZPdFxg-KW_X_RfyVje0yf_AnVTeg3t3bW-PeO8btzhfFyIC5_NuqTGrQI9en9QetmzTHZdsrrYcmVziry7ZxmSm4I-C-X6Ffdv8FQczf3gf0yZuvVD_zLGMIWUBcqcmO2SEFrPaDIuNz7burmpcjUTvRL9TW1mEHaTemNiE' },
          { productName: '圆柱瓶 (350ml)', sku: 'BTL-YZ-350', qty: 35, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB52AR0JHYMGP28yFAq3GeA-FbdyNJu-7aRx5HsfRAa_1pdLVAKRPFBgBmXfNT1P2O74OyoN009lDKHbzlfU3T30oWUwzk2lo_eliQQvdf1mJlIb2mingq412lvUy8T4HYHg4MOXaRz4s_TUC7Ll0cbrpq6x2VXI6WyQ_XLNZqHKePg7PvFcak2dgWR6TulZo5Ne9ADznAQUQzcnQHnLHDIAFemoVPCd9rmtnsGkkcahlDiX4boji-7I8mLbl6xy2ayY4ScvzfEbQo' },
          { productName: '塔瓶 (350ml)', sku: 'BTL-TP-350', qty: 28, imageUrl: '' }
        ],
        totalQty: 105,
        status: '已签收',
        isExpress: true,
        statusLog: [
          { time: '08:30', description: '【仓库核心枢纽】 订单已被揽收，配单合流装箱已完成' },
          { time: '10:15', description: '【顺丰速运】 快件已在深圳宝安转运中心发出' },
          { time: '14:40', description: '【顺丰速运】 快件到达北京顺义转运中心，正在进行二次分拨' },
          { time: '16:55', description: '【派送中】 快件由北京顺义派件员李师傅 (138-0021-3921) 运送中' },
          { time: '18:12', description: '【已签收】 北京分拨中心已成功签收，经手人: 仓库收货核签主管' }
        ]
      },
      {
        id: 'ship-2',
        date: '周一',
        timestamp: Date.now() - 3600000 * 5, // 5 hours ago
        location: '西区零售店 #4',
        trackingNumber: 'SF1204892301',
        items: [
          { productName: '工业传感器 A1', sku: 'PRO-992-BX', qty: 51, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmHSpw2WT9c-t3D0aAccF-X4PmJNvBZ8ap4Fyc5QAW9mQe2WL9qyxclMlC8WfqppZk-vQxDcZzrM385U1FtPSKzdztuPynIp4ECAdSZPdFxg-KW_X_RfyVje0yf_AnVTeg3t3bW-PeO8btzhfFyIC5_NuqTGrQI9en9QetmzTHZdsrrYcmVziry7ZxmSm4I-C-X6Ffdv8FQczf3gf0yZuvVD_zLGMIWUBcqcmO2SEFrPaDIuNz7burmpcjUTvRL9TW1mEHaTemNiE' }
        ],
        totalQty: 51,
        status: '在途运输',
        isExpress: false,
        statusLog: [
          { time: '09:12', description: '【仓库核心枢纽】 出库申请通过，开始装车配载' },
          { time: '11:30', description: '【顺丰速运】 快件由顺丰揽收并发出，下一站: 华北分拨中心' },
          { time: '15:40', description: '【顺丰速运】 快件正在途往华北转运枢纽，时效预计明日11:00签署' }
        ]
      },
      {
        id: 'ship-3',
        date: '周一',
        timestamp: Date.now() - 3600000 * 8, // 8 hours ago
        location: '北部物流中心',
        trackingNumber: 'SF1602931298',
        items: [
          { productName: 'Zenith 智能手表', sku: 'WCH-LT-V2', qty: 120, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtkJPOYcYW6uCdKOU8x75Cb16H6_pItPJOG5Ws-4ZAwDRbJ14udO2DE4QKHTMcr2rtjyx42fwXt0D1ibSC7EYVrIcFPNPBScvksHHaGB5T1yCBTz_a8N1QO_j4-YkvF1P0UX3H47Cd-p1VHILBhT2M2JoiqvpI7pQamD0F4S6OeT_E2AF9O9_20oe7_FThXk-oMfuzyHk742awovEyAcbmwYDMEK8qETeMRE41i-HYURxt1s7xqhqrs1XcWXIqKo07pu0yT5qObbc' }
        ],
        totalQty: 120,
        status: '派送中',
        isExpress: true,
        statusLog: [
          { time: '07:15', description: '【仓库核心枢纽】 打包装箱并生成托运单' },
          { time: '09:00', description: '【顺丰速运】 快件已到达北部大区转运枢纽' },
          { time: '13:30', description: '【派送中】 快件已发出，派件员张师傅(139-4493-2018)正在开往北部物流中心' }
        ]
      },
      {
        id: 'ship-4',
        date: '周一',
        timestamp: Date.now() - 3600000 * 12, // 12 hours ago
        location: '直接客户直接分拨',
        trackingNumber: 'SF1592305882',
        items: [
          { productName: '27" 4K 显示器', sku: 'MON-4K-27', qty: 80, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbPe4zWggdHY1XAVj3kxmoSzIc2G93r1JZpxJP3oyJs3yRbbBMXgxfEjDF2Xx8Ol--Vi9VeGAYJXxJqM73D7moA51Lwk_gZW766X5ArPf4ed8Rfl3x1puBAJrHzNG8LzDjnCa8CDBItfy0p_55i-sK7B8uW5lG86Fi4pfRO4CE53CVivs-R8okhJaRktScVqNeB3cV7jcmydf24qYh2ofzJ94kuRHrmHNYclBLhmn9B0hEvddiqxG1RibcJbhRphsJ1xAkMLPBCXo' }
        ],
        totalQty: 80,
        status: '待配货',
        isExpress: false,
        statusLog: [
          { time: '06:10', description: '【系统消息】 客户下达直发订单申请，当前订单处于待配货配载阶段' }
        ]
      }
    ];
  });

  // Dynamic system configurations (Categories, Suppliers, Locations)
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('si_categories');
    return saved ? JSON.parse(saved) : ['电子产品', '硬件', '办公家具'];
  });

  const [suppliers, setSuppliers] = useState<string[]>(() => {
    const saved = localStorage.getItem('si_suppliers');
    return saved ? JSON.parse(saved) : [
      'Global Logistics Co.',
      'Apex Manufacturing',
      'TechParts Int.',
      'SmartLink Electronics',
      'Nexus Supply Chain'
    ];
  });

  const [locations, setLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem('si_locations');
    return saved ? JSON.parse(saved) : [
      'A区 - 货位 1',
      'A区 - 货位 11',
      'A区 - 货位 42',
      'B区 - 货位 4',
      'B区 - 货位 5',
      'C区 - 货位 2',
      'C区 - 货位 12',
      'D区 - 货位 15'
    ];
  });

  // Sync Master Config lists to localStorage
  useEffect(() => {
    localStorage.setItem('si_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('si_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('si_locations', JSON.stringify(locations));
  }, [locations]);

  // Global Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Sync Products to local storage
  useEffect(() => {
    localStorage.setItem('si_products', JSON.stringify(products));
  }, [products]);

  // Sync Pending Inbounds
  useEffect(() => {
    localStorage.setItem('si_pending_inbounds', JSON.stringify(pendingInbounds));
  }, [pendingInbounds]);

  // Sync Outbound Cart
  useEffect(() => {
    localStorage.setItem('si_outbound_cart', JSON.stringify(outboundCart));
  }, [outboundCart]);

  // Sync Metrics
  useEffect(() => {
    localStorage.setItem('si_today_inbound', todayInboundCount.toString());
  }, [todayInboundCount]);

  useEffect(() => {
    localStorage.setItem('si_today_outbound', todayOutboundCount.toString());
  }, [todayOutboundCount]);

  useEffect(() => {
    localStorage.setItem('si_outbound_shipments', JSON.stringify(outboundShipments));
  }, [outboundShipments]);

  // Trigger Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Actions 1: Inbound Operations
  const handleAddPendingInbound = (item: Omit<PendingInbound, 'id'>) => {
    const newItem: PendingInbound = {
      ...item,
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setPendingInbounds((prev) => [...prev, newItem]);
    showToast(`已添加待确认入库：${item.name} (${item.qty}件)`, 'info');
  };

  const handleRemovePendingInbound = (id: string) => {
    const target = pendingInbounds.find((item) => item.id === id);
    setPendingInbounds((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      showToast(`已从暂存列表中移除：${target.name}`, 'info');
    }
  };

  const handleConfirmAllInbounds = () => {
    if (pendingInbounds.length === 0) return;

    // Apply quantities updating matching products
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      pendingInbounds.forEach((inbound) => {
        const index = updated.findIndex((p) => p.sku === inbound.sku);
        if (index !== -1) {
          // Update extant item stock
          updated[index] = {
            ...updated[index],
            stock: updated[index].stock + inbound.qty
          };
        } else {
          // Or add as new custom category item dynamically
          updated.push({
            id: `prod-${Date.now()}-${Math.random()}`,
            sku: inbound.sku,
            name: inbound.name,
            category: categories[0] || '电子产品',
            stock: inbound.qty,
            minStock: 10,
            warehouseLocation: inbound.location,
            imageUrl: '',
            supplier: inbound.supplier
          });
        }
      });
      return updated;
    });

    // Increment Today's Inbound Count
    const totalInboundQty = pendingInbounds.reduce((sum, item) => sum + item.qty, 0);
    setTodayInboundCount((prev) => prev + totalInboundQty);

    // Clear list
    setPendingInbounds([]);
    showToast(`🎉 成功更新入库，账套已增加 ${totalInboundQty} 件配准量！`, 'success');
  };

  // Actions 2: Outbound Actions
  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
      showToast(`⚠️ 商品 ${product.name} 目前缺货，无法选择出库。`, 'error');
      return;
    }

    setOutboundCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === productId);
      if (existingIdx !== -1) {
        const currentQty = prev[existingIdx].qty;
        if (currentQty >= product.stock) {
          showToast(`已达到 ${product.name} 库存最大限额！`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: currentQty + 1
        };
        showToast(`已增加待出货：${product.name}`, 'info');
        return updated;
      } else {
        showToast(`已配准出库项：${product.name}`, 'info');
        return [...prev, { productId, qty: 1 }];
      }
    });
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;

    if (qty > p.stock) {
      showToast(`${p.name} 的出库数量不能大于现有库存 ${p.stock} 件！`, 'error');
      return;
    }

    setOutboundCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, qty } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setOutboundCart((prev) => prev.filter((item) => item.productId !== productId));
    if (product) {
      showToast(`已移除出货单：${product.name}`, 'info');
    }
  };

  const handleConfirmOutbound = (location: string, isExpress: boolean, trackingNumber?: string) => {
    if (outboundCart.length === 0) return;

    // Checks quantities safety limits first
    let hasSafetyError = false;
    outboundCart.forEach((item) => {
      const match = products.find((p) => p.id === item.productId);
      if (match && item.qty > match.stock) {
        hasSafetyError = true;
      }
    });

    if (hasSafetyError) {
      showToast(`无法提交！部分物料请求出货量超出配剩额，请校对！`, 'error');
      return;
    }

    // Deduct quantities
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = outboundCart.find((c) => c.productId === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.qty)
          };
        }
        return p;
      })
    );

    // Increase today's metrics
    const totalOutboundQty = outboundCart.reduce((sum, item) => sum + item.qty, 0);
    setTodayOutboundCount((prev) => prev + totalOutboundQty);

    // Create dynamic Outbound Shipment and prepend to database
    const trackingNo = trackingNumber ? trackingNumber.trim() : ('SF' + Math.floor(1000000000 + Math.random() * 9000000000));
    const shipmentItems = outboundCart.map((item) => {
      const matchP = products.find((prod) => prod.id === item.productId);
      return {
        productName: matchP ? matchP.name : '物料商品',
        sku: matchP ? matchP.sku : 'UNKNOWN-SKU',
        qty: item.qty,
        imageUrl: matchP ? matchP.imageUrl : ''
      };
    });

    const newShipment: OutboundShipment = {
      id: `ship-${Date.now()}`,
      date: '周一', // Consistent with demo day (Monday)
      timestamp: Date.now(),
      location: location.trim() || '中心配送枢纽',
      trackingNumber: trackingNo,
      items: shipmentItems,
      totalQty: totalOutboundQty,
      status: '待配货',
      isExpress: isExpress,
      statusLog: [
        {
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          description: `【仓库核心枢纽】 确认出库！申请已核签通过，出货配单已合流生成`
        }
      ]
    };

    setOutboundShipments((prev) => [newShipment, ...prev]);

    // Clear outbound cart
    setOutboundCart([]);
    showToast(
      `🚚 出库申请已签发！订单交付中 (目标: ${location}${trackingNumber ? ` | 单号: ${trackingNumber}` : ''} | 预计45分钟交付)`,
      'success'
    );
  };

  // Actions 3: Direct inventory / Product definition
  const handleAddNewProduct = (newProd: Omit<Product, 'id'>) => {
    const isSkuExtant = products.some((p) => p.sku === newProd.sku);
    if (isSkuExtant) {
      showToast(`物料 SKU 编码 ${newProd.sku} 重复！自动并入库位。`, 'error');
      return;
    }

    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [...prev, created]);
    showToast(`🎉 成功添加全新库存货品物料建档: ${newProd.name}`, 'success');
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    const target = products.find((n) => n.id === productId);
    if (target) {
      showToast(`货品 ${target.name} 强制储值已校准为: ${newStock}件`, 'success');
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    showToast(`🎉 成功更新产品物料建档: ${updatedProduct.name}`, 'success');
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setOutboundCart((prev) => prev.filter((item) => item.productId !== productId));
    showToast(`🗑️ 已成功对货盘 [${target.name}] 进行永久销档删除！`, 'success');
  };

  const handleBulkAddProducts = (newProds: Product[]) => {
    let addedCount = 0;
    let skippedCount = 0;
    
    setProducts((prev) => {
      const merged = [...prev];
      newProds.forEach((np) => {
        const exists = merged.some((p) => p.sku.toUpperCase() === np.sku.toUpperCase());
        if (!exists) {
          merged.push({
            ...np,
            id: np.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });
          addedCount++;
        } else {
          skippedCount++;
        }
      });
      return merged;
    });

    setTimeout(() => {
      if (addedCount > 0) {
        showToast(`🎉 批量导入成功！新增 ${addedCount} 款产品${skippedCount ? ` (跳过 ${skippedCount} 冲突 SKU)` : ''}`, 'success');
      } else {
        showToast(`批量导入已跳过：所有 SKU 在系统内均已存在`, 'info');
      }
    }, 100);
  };

  const handleSelectProductFromAlert = (p: Product) => {
    setTab('inventory');
    showToast(`已精确定位查找：${p.name}`, 'info');
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans antialiased selection:bg-blue-100 pb-24">
      {/* Top Header */}
      {!isSuperAdmin && (
        <Header tab={tab} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      )}

      {/* Main Container viewport */}
      <main className={`${isSuperAdmin ? 'py-4' : 'pt-16'} px-4 max-w-lg mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center`}>
        {!currentUser ? (
          <LoginScreen 
            onLoginSuccess={(user) => setCurrentUser(user)} 
            showToast={showToast} 
          />
        ) : isSuperAdmin ? (
          <NewcomerManagement
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            showToast={showToast}
            onDirectLogin={(user) => setCurrentUser(user)}
          />
        ) : (
          <>
            {tab === 'dashboard' && (
              <Dashboard
                products={products}
                onNavigate={setTab}
                onSelectProduct={handleSelectProductFromAlert}
                onAuditStock={handleUpdateStock}
                todayInboundCount={todayInboundCount}
                todayOutboundCount={todayOutboundCount}
                outboundShipments={outboundShipments}
              />
            )}

            {tab === 'inbound' && (
              <Inbound
                products={products}
                pendingInbounds={pendingInbounds}
                suppliers={suppliers}
                locations={locations}
                onAddPendingInbound={handleAddPendingInbound}
                onRemovePendingInbound={handleRemovePendingInbound}
                onConfirmAllInbounds={handleConfirmAllInbounds}
                onQuickPrefill={(sku) => showToast(`自动在途核对中 ${sku}`, 'info')}
              />
            )}

            {tab === 'outbound' && (
              <Outbound
                products={products}
                outboundCart={outboundCart}
                onUpdateCartQty={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onAddToCart={handleAddToCart}
                onConfirmOutbound={handleConfirmOutbound}
              />
            )}

            {tab === 'inventory' && (
              <InventoryList
                products={products}
                categories={categories}
                suppliers={suppliers}
                locations={locations}
                onUpdateCategories={setCategories}
                onUpdateSuppliers={setSuppliers}
                onUpdateLocations={setLocations}
                onSelectProduct={(p) => showToast(p.name, 'info')}
                onAddNewProduct={handleAddNewProduct}
                onUpdateStock={handleUpdateStock}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onBulkAddProducts={handleBulkAddProducts}
                currentUser={currentUser}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent global feedback toast alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full py-2.5 px-5 text-xs shadow-xl z-50 flex items-center gap-2.5 animate-bounce font-medium border border-gray-800">
          {toastType === 'success' && <CheckCircle2 className="w-4 h-4 text-[#86f898]" />}
          {toastType === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toastType === 'info' && <ShoppingBag className="w-4 h-4 text-sky-400" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Global Navigation pill menu */}
      {currentUser && !isSuperAdmin && <BottomNav currentTab={tab} onTabChange={setTab} />}
    </div>
  );
}
