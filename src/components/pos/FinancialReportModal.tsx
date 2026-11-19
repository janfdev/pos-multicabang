import { useState, useEffect } from 'react';
import { BarChart3, X, Download, Printer, TrendingUp, DollarSign, Package, Percent } from 'lucide-react';

export function FinancialReportModal({
  isOpen,
  initialOutletId = 'ALL',
  onClose,
}: {
  isOpen: boolean;
  initialOutletId?: string;
  onClose: () => void;
}) {
  const [outletId, setOutletId] = useState(initialOutletId);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/reports/financial?outletId=${outletId}`)
        .then((res) => res.json())
        .then((data) => {
          setReport(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, outletId]);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    if (!report) return;

    const headers = ['Metrik', 'Nilai'];
    const rows = [
      ['Cakupan Cabang', outletId === 'ALL' ? 'Semua Cabang (Konsolidasi)' : outletId.toUpperCase()],
      ['Tanggal Laporan', new Date().toLocaleDateString('id-ID')],
      ['Omzet Penjualan (Gross Revenue)', `Rp ${report.grossRevenue.toLocaleString('id-ID')}`],
      ['Total HPP / Modal', `Rp ${report.totalCost.toLocaleString('id-ID')}`],
      ['Laba Kotor (Gross Profit)', `Rp ${report.grossProfit.toLocaleString('id-ID')}`],
      ['Margin Keuntungan', `${report.grossMarginPct}%`],
      ['Total Transaksi', `${report.totalTransactions}`],
      ['Total Barang Terjual', `${report.totalItemsSold} unit`],
      [],
      ['TOP PRODUK TERLARIS & PALING MENGUNTUNGKAN'],
      ['Nama Produk', 'Qty Terjual', 'Omzet (Rp)', 'HPP (Rp)', 'Laba Kotor (Rp)', 'Margin (%)'],
      ...report.topProducts.map((p: any) => [
        p.name,
        p.qty,
        p.revenue,
        p.cost,
        p.profit,
        `${p.margin}%`,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell: any) => `"${cell ?? ''}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-keuangan-pos-${outletId}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => `Rp ${(val || 0).toLocaleString('id-ID')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #financial-report-print, #financial-report-print * { visibility: visible !important; }
          #financial-report-print {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BarChart3 className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Laporan Keuangan &amp; Laba Rugi
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Analisis omzet, HPP, laba kotor, dan margin produk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Scope Selector */}
            <div className="flex bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setOutletId('ALL')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  outletId === 'ALL'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                Gabungan
              </button>
              <button
                type="button"
                onClick={() => setOutletId('toko-1')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  outletId === 'toko-1'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                Toko 1
              </button>
              <button
                type="button"
                onClick={() => setOutletId('toko-2')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  outletId === 'toko-2'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                Toko 2
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div id="financial-report-print" className="p-5 overflow-y-auto space-y-4">
          {loading || !report ? (
            <div className="py-12 text-center text-xs text-zinc-400">Memuat data keuangan...</div>
          ) : (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Omzet Penjualan
                  </span>
                  <p className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatRupiah(report.grossRevenue)}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Total HPP (Modal)
                  </span>
                  <p className="font-mono font-bold text-sm text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {formatRupiah(report.totalCost)}
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Laba Kotor
                  </span>
                  <p className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {formatRupiah(report.grossProfit)}
                  </p>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    Margin Keuntungan
                  </span>
                  <p className="font-mono font-bold text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                    {report.grossMarginPct}%
                  </p>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-emerald-600" />
                    <span>Top 5 Produk Paling Menguntungkan</span>
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {report.totalItemsSold} Unit Terjual
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5 px-3">Nama Produk</th>
                        <th className="p-2.5 text-center">Terjual</th>
                        <th className="p-2.5 text-right">Omzet</th>
                        <th className="p-2.5 text-right">Laba Kotor</th>
                        <th className="p-2.5 text-right pr-3">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {report.topProducts.map((p: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="p-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                            {p.name}
                          </td>
                          <td className="p-2.5 text-center font-mono">{p.qty}</td>
                          <td className="p-2.5 text-right font-mono font-semibold">
                            {formatRupiah(p.revenue)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(p.profit)}
                          </td>
                          <td className="p-2.5 text-right pr-3 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {p.margin}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={!report}
            className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
          >
            <Download className="size-3.5" />
            <span>Download CSV (Excel)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!report}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Printer className="size-3.5" />
            <span>Cetak Laporan (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
