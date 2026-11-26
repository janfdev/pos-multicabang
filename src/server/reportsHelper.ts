export function buildFinancialReport(
  orders: any[],
  onlineOrders: any[],
  products: any[],
  outletId: string
) {
  const validPosOrders = orders.filter((o) => o.status !== 'VOIDED');
  const filteredOrders =
    outletId === 'ALL' ? validPosOrders : validPosOrders.filter((o) => o.outletId === outletId);

  const validOnline = onlineOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'READY' || o.status === 'PROCESSING'
  );
  const filteredOnline =
    outletId === 'ALL' ? validOnline : validOnline.filter((o) => o.outletId === outletId);

  let grossRevenue = 0;
  let totalCost = 0;
  let totalItemsSold = 0;
  const productSalesMap: Record<
    string,
    { productId: string; sku: string; name: string; category: string; qty: number; revenue: number; cost: number }
  > = {};

  const accumulate = (list: any[]) => {
    list.forEach((o) => {
      grossRevenue += o.totalAmount;
      o.items?.forEach((it: any) => {
        totalItemsSold += it.qty;
        const prod = products.find((p) => p.id === it.productId);
        const cost = (prod?.costPrice || 0) * it.qty;
        totalCost += cost;

        if (!productSalesMap[it.productId]) {
          productSalesMap[it.productId] = {
            productId: it.productId,
            sku: prod?.sku || it.productId,
            name: it.productName || prod?.name || it.productId,
            category: prod?.category || 'Sembako',
            qty: 0,
            revenue: 0,
            cost: 0,
          };
        }
        productSalesMap[it.productId].qty += it.qty;
        productSalesMap[it.productId].revenue += it.subtotal;
        productSalesMap[it.productId].cost += cost;
      });
    });
  };

  accumulate(filteredOrders);
  accumulate(filteredOnline);

  const grossProfit = grossRevenue - totalCost;
  const grossMarginPct = Number(grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : '0');

  const productBreakdown = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .map((p) => {
      const profit = p.revenue - p.cost;
      const marginPercent = Number(p.revenue > 0 ? ((profit / p.revenue) * 100).toFixed(1) : '0');
      return {
        productId: p.productId,
        sku: p.sku,
        name: p.name,
        category: p.category,
        unitsSold: p.qty,
        totalRevenue: p.revenue,
        totalCost: p.cost,
        grossProfit: profit,
        marginPercent,
      };
    });

  const topProducts = productBreakdown.slice(0, 5).map((p) => ({
    name: p.name,
    qty: p.unitsSold,
    revenue: p.totalRevenue,
    cost: p.totalCost,
    profit: p.grossProfit,
    margin: String(p.marginPercent),
  }));

  return {
    outletId,
    grossRevenue,
    totalRevenue: grossRevenue,
    totalCost,
    grossProfit,
    grossMarginPct,
    grossMarginPercent: grossMarginPct,
    totalTransactions: filteredOrders.length + filteredOnline.length,
    totalItemsSold,
    topProducts,
    productBreakdown,
    allOrders: filteredOrders,
  };
}
