import {
  Button,
  Card,
  Tooltip,
  Badge,
} from "flowbite-react";
import { useState, useEffect, useRef } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  HiRefresh,
  HiDownload,
  HiInformationCircle,
  HiSearch,
  HiViewList,
  HiArrowRight,
} from 'react-icons/hi';
import { FaBoxOpen, FaChevronDown } from 'react-icons/fa';
import { GoArrowRight } from "react-icons/go";
import { Filter } from "lucide-react";
import axios from "axios";
import SessionModal from "../SessionModal";
import { useEntityFormatter } from "../Entity/UseEntityFormater";

// ---------- Interfaces (unchanged) ----------
export interface TableTypeDense {
  itemId?: number;
  itemName?: string;
  packageId?: string;
  supplierId?: string;
  status?: string;
  statuscolor?: string;
  budget?: string;
  name?: string;
  post?: string;
  pname?: string;
  isSelected?: boolean;
  totalQty?: string;
  quantities?: { [key: string]: string };
}

interface LocationItem {
  pk: number;
  id: number | null;
  locationId: string | null;
  locationName: string | null;
  period: string | null;
  category: string | null;
  reqNo: string | null;
  supplierId: string | null;
  supplierName: string | null;
  itemCode: string | null;
  itemName: string | null;
  conId: string | null;
  qtnReqNo: string | null;
  consolidationId: string | null;
  code: string | null;
  name: string;
  itemId: number;
  tranNo: string | null;
}

interface ItemDetail {
  pk: number;
  id: number | null;
  locationId: string | null;
  locationName: string | null;
  period: string | null;
  category: string | null;
  reqNo: string | null;
  supplierId: string | null;
  supplierName: string | null;
  itemCode: string | null;
  itemName: string;
  conId: string | null;
  qtnReqNo: string | null;
  consolidationId: string | null;
  code: string | null;
  name: string | null;
  itemId: number;
  tranNo: string | null;
}

interface PriceComparisonResponse {
  success: boolean;
  message: string;
  data: PriceComparisonMainItem[];
}

interface PriceComparisonMainItem {
  locationRequestHeaderPk: number;
  reqHeadFK: number;
  locationRequestDetailsPk: number;
  locationId: string | null;
  reqTransactionNo: string | null;
  locationName: string | null;
  period: string | null;
  periodStr: string | null;
  processed: boolean | null;
  isFinal: number;
  entityId: string | null;
  itemId: number;
  itemName: string | null;
  packageId: string | null;
  qty: number;
  locationReqFk: number;
  aplPk: number;
  locationFk: number;
  supplierId: string | null;
  supplierName: string | null;
  supplierIdLast: string | null;
  supplierNameLast: string | null;
  gpLast: number;
  supplierDeliveryDate: string | null;
  cwhDeliveryDate: string | null;
  deliveryMode: string | null;
  deliveryLocationId: string | null;
  entOrder: number;
  lastUser: string | null;
  lastUpdate: string | null;
  itemCount: number;
  totalItemCount: number;
  startDate: string | null;
  endDate: string | null;
  requestDate: string | null;
  requestDateStr: string | null;
  userFk: number;
  grandTotal: number;
  consLocReqPK: number;
  consolidationId: string;
  quotationProcessHeadPk: number;
  quotationProcessDetailPk: number;
  quantityMap: Record<string, any>;
  gp: number;
  np: number;
  gpOld: number;
  totalCost: number;
  renderedDate: boolean;
  qtyInside: number;
  date: string | null;
  receiveDate: string | null;
  dateStr: string | null;
  dateWiseQty: any[];
  uploadedItem: any[];
  subList: any[];
  dateBasedItem: any[];
  items: ItemInMainData[];
  quotationPreparedList: any[];
  finalizedList: any[];
  currencyId: string | null;
  currencyRate: number;
  deliveryModeHeader: number;
  quotationProcessStatusFk: number;
  quotationProcessStatus: string | null;
  quotationTransNo: string | null;
  renderDeleteIcon: boolean;
  region: string | null;
  term: number;
  gross: number;
  net: number;
  netPp: number;
  netUp: number;
  stats: string | null;
  disc: number;
  remarks: string | null;
  checkBox: boolean;
  preSupId: string | null;
  statusWord: string | null;
  statusFk: number;
  locReqCreationList: any[];
  consolidationList: any[];
  quotationReplyList: any[];
  finalizetheSupplierSelectionList: any[];
  autoGeneratePOList: any[];
  qty1: number;
  qty2: number;
  qty3: number;
  qty4: number;
  qty5: number;
  qty6: number;
  qty7: number;
  qty8: number;
  qty9: number;
  qty10: number;
  qty11: number;
  qty12: number;
  qty13: number;
  qty14: number;
  qty15: number;
  qty16: number;
  qty17: number;
  qty18: number;
  qty19: number;
  qty20: number;
  qty21: number;
  qty22: number;
  qty23: number;
  qty24: number;
  qty25: number;
  qty26: number;
  qty27: number;
  qty28: number;
  qty29: number;
  qty30: number;
  qty31: number;
  qtyRendered1: boolean;
  qtyRendered2: boolean;
  qtyRendered3: boolean;
  qtyRendered4: boolean;
  qtyRendered5: boolean;
  qtyRendered6: boolean;
  qtyRendered7: boolean;
  qtyRendered8: boolean;
  qtyRendered9: boolean;
  qtyRendered10: boolean;
  qtyRendered11: boolean;
  qtyRendered12: boolean;
  qtyRendered13: boolean;
  qtyRendered14: boolean;
  qtyRendered15: boolean;
  qtyRendered16: boolean;
  qtyRendered17: boolean;
  qtyRendered18: boolean;
  qtyRendered19: boolean;
  qtyRendered20: boolean;
  qtyRendered21: boolean;
  qtyRendered22: boolean;
  qtyRendered23: boolean;
  qtyRendered24: boolean;
  qtyRendered25: boolean;
  qtyRendered26: boolean;
  qtyRendered27: boolean;
  qtyRendered28: boolean;
  qtyRendered29: boolean;
  qtyRendered30: boolean;
  qtyRendered31: boolean;
  dateNum: number;
  downloadUrlPath: string | null;
}

interface ItemInMainData {
  locationRequestHeaderPk: number;
  reqHeadFK: number;
  locationRequestDetailsPk: number;
  locationId: string | null;
  reqTransactionNo: string | null;
  locationName: string | null;
  period: string | null;
  periodStr: string | null;
  processed: boolean | null;
  isFinal: number;
  entityId: string | null;
  itemId: number;
  itemName: string | null;
  packageId: string | null;
  qty: number;
  locationReqFk: number;
  aplPk: number;
  locationFk: number;
  supplierId: string | null;
  supplierName: string | null;
  supplierIdLast: string | null;
  supplierNameLast: string | null;
  gpLast: number;
  supplierDeliveryDate: string | null;
  cwhDeliveryDate: string | null;
  deliveryMode: string | null;
  deliveryLocationId: string | null;
  entOrder: number;
  lastUser: string | null;
  lastUpdate: string | null;
  itemCount: number;
  totalItemCount: number;
  startDate: string | null;
  endDate: string | null;
  requestDate: string | null;
  requestDateStr: string | null;
  userFk: number;
  grandTotal: number;
  consLocReqPK: number;
  consolidationId: string;
  quotationProcessHeadPk: number;
  quotationProcessDetailPk: number;
  quantityMap: Record<string, any>;
  gp: number;
  np: number;
  gpOld: number;
  totalCost: number;
  renderedDate: boolean;
  qtyInside: number;
  date: string | null;
  receiveDate: string | null;
  dateStr: string | null;
  dateWiseQty: any[];
  uploadedItem: any[];
  subList: SubListItem[];
  dateBasedItem: any[];
  items: any[];
  quotationPreparedList: any[];
  finalizedList: any[];
  currencyId: string | null;
  currencyRate: number;
  deliveryModeHeader: number;
  quotationProcessStatusFk: number;
  quotationProcessStatus: string | null;
  quotationTransNo: string | null;
  renderDeleteIcon: boolean;
  region: string | null;
  term: number;
  gross: number;
  net: number;
  netPp: number;
  netUp: number;
  stats: string | null;
  disc: number;
  remarks: string | null;
  checkBox: boolean;
  preSupId: string | null;
  statusWord: string | null;
  statusFk: number;
  locReqCreationList: any[];
  consolidationList: any[];
  quotationReplyList: any[];
  finalizetheSupplierSelectionList: any[];
  autoGeneratePOList: any[];
  qty1: number;
  qty2: number;
  qty3: number;
  qty4: number;
  qty5: number;
  qty6: number;
  qty7: number;
  qty8: number;
  qty9: number;
  qty10: number;
  qty11: number;
  qty12: number;
  qty13: number;
  qty14: number;
  qty15: number;
  qty16: number;
  qty17: number;
  qty18: number;
  qty19: number;
  qty20: number;
  qty21: number;
  qty22: number;
  qty23: number;
  qty24: number;
  qty25: number;
  qty26: number;
  qty27: number;
  qty28: number;
  qty29: number;
  qty30: number;
  qty31: number;
  qtyRendered1: boolean;
  qtyRendered2: boolean;
  qtyRendered3: boolean;
  qtyRendered4: boolean;
  qtyRendered5: boolean;
  qtyRendered6: boolean;
  qtyRendered7: boolean;
  qtyRendered8: boolean;
  qtyRendered9: boolean;
  qtyRendered10: boolean;
  qtyRendered11: boolean;
  qtyRendered12: boolean;
  qtyRendered13: boolean;
  qtyRendered14: boolean;
  qtyRendered15: boolean;
  qtyRendered16: boolean;
  qtyRendered17: boolean;
  qtyRendered18: boolean;
  qtyRendered19: boolean;
  qtyRendered20: boolean;
  qtyRendered21: boolean;
  qtyRendered22: boolean;
  qtyRendered23: boolean;
  qtyRendered24: boolean;
  qtyRendered25: boolean;
  qtyRendered26: boolean;
  qtyRendered27: boolean;
  qtyRendered28: boolean;
  qtyRendered29: boolean;
  qtyRendered30: boolean;
  qtyRendered31: boolean;
  dateNum: number;
  downloadUrlPath: string | null;
}

interface SubListItem {
  locationRequestHeaderPk: number;
  reqHeadFK: number;
  locationRequestDetailsPk: number;
  locationId: string | null;
  reqTransactionNo: string | null;
  locationName: string | null;
  period: string | null;
  periodStr: string | null;
  processed: boolean | null;
  isFinal: number;
  entityId: string | null;
  itemId: number;
  itemName: string | null;
  packageId: string | null;
  qty: number;
  locationReqFk: number;
  aplPk: number;
  locationFk: number;
  supplierId: string;
  supplierName: string;
  supplierIdLast: string | null;
  supplierNameLast: string | null;
  gpLast: number;
  supplierDeliveryDate: string | null;
  cwhDeliveryDate: string | null;
  deliveryMode: string | null;
  deliveryLocationId: string | null;
  entOrder: number;
  lastUser: string | null;
  lastUpdate: string | null;
  itemCount: number;
  totalItemCount: number;
  startDate: string | null;
  endDate: string | null;
  requestDate: string | null;
  requestDateStr: string | null;
  userFk: number;
  grandTotal: number;
  consLocReqPK: number;
  consolidationId: string | null;
  quotationProcessHeadPk: number;
  quotationProcessDetailPk: number;
  quantityMap: Record<string, any>;
  gp: number;
  np: number;
  gpOld: number;
  totalCost: number;
  renderedDate: boolean;
  qtyInside: number;
  date: string | null;
  receiveDate: string | null;
  dateStr: string | null;
  dateWiseQty: any[];
  uploadedItem: any[];
  subList: any[];
  dateBasedItem: any[];
  items: any[];
  quotationPreparedList: any[];
  finalizedList: any[];
  currencyId: string | null;
  currencyRate: number;
  deliveryModeHeader: number;
  quotationProcessStatusFk: number;
  quotationProcessStatus: string | null;
  quotationTransNo: string | null;
  renderDeleteIcon: boolean;
  region: string;
  term: number;
  gross: number;
  net: number;
  netPp: number;
  netUp: number;
  stats: string;
  disc: number;
  remarks: string;
  checkBox: boolean;
  preSupId: string | null;
  statusWord: string | null;
  statusFk: number;
  locReqCreationList: any[];
  consolidationList: any[];
  quotationReplyList: any[];
  finalizetheSupplierSelectionList: any[];
  autoGeneratePOList: any[];
  qty1: number;
  qty2: number;
  qty3: number;
  qty4: number;
  qty5: number;
  qty6: number;
  qty7: number;
  qty8: number;
  qty9: number;
  qty10: number;
  qty11: number;
  qty12: number;
  qty13: number;
  qty14: number;
  qty15: number;
  qty16: number;
  qty17: number;
  qty18: number;
  qty19: number;
  qty20: number;
  qty21: number;
  qty22: number;
  qty23: number;
  qty24: number;
  qty25: number;
  qty26: number;
  qty27: number;
  qty28: number;
  qty29: number;
  qty30: number;
  qty31: number;
  qtyRendered1: boolean;
  qtyRendered2: boolean;
  qtyRendered3: boolean;
  qtyRendered4: boolean;
  qtyRendered5: boolean;
  qtyRendered6: boolean;
  qtyRendered7: boolean;
  qtyRendered8: boolean;
  qtyRendered9: boolean;
  qtyRendered10: boolean;
  qtyRendered11: boolean;
  qtyRendered12: boolean;
  qtyRendered13: boolean;
  qtyRendered14: boolean;
  qtyRendered15: boolean;
  qtyRendered16: boolean;
  qtyRendered17: boolean;
  qtyRendered18: boolean;
  qtyRendered19: boolean;
  qtyRendered20: boolean;
  qtyRendered21: boolean;
  qtyRendered22: boolean;
  qtyRendered23: boolean;
  qtyRendered24: boolean;
  qtyRendered25: boolean;
  qtyRendered26: boolean;
  qtyRendered27: boolean;
  qtyRendered28: boolean;
  qtyRendered29: boolean;
  qtyRendered30: boolean;
  qtyRendered31: boolean;
  dateNum: number;
  downloadUrlPath: string | null;
}

interface AggregatedItem {
  consolidationId: string;
  item: ItemInMainData;
  subList: SubListItem[];
}

const columnHelper = createColumnHelper<SubListItem>();

// Compact columns for PriceTable (unchanged)
const defaultColumns = [
  columnHelper.accessor(
    row => `${row.supplierId || '-'} – ${row.supplierName || '-'}`,
    {
      id: 'supplier',
      header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Supplier</span>,
      cell: (info) => (
        <div className="text-[10px] font-medium text-gray-900 dark:text-white break-words max-w-[150px]">
          {info.getValue()}
        </div>
      ),
      enableSorting: true,
    }
  ),
  columnHelper.accessor("region", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Entity</span>,
    cell: (info) => <p className="text-[10px] font-medium text-gray-900 dark:text-white break-words">{info.getValue() || '-'}</p>,
    enableSorting: true,
  }),
  columnHelper.accessor("term", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Term</span>,
    cell: (info) => <p className="text-[10px] mr-3 font-medium text-gray-900 dark:text-white">{info.getValue()?.toString() || '-'}</p>,
    enableSorting: true,
  }),
  columnHelper.accessor("disc", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Disc.</span>,
   cell: (info) => (
      <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
        {info.getValue()?.toFixed(2) || '0.00'}
      </p>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("gross", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Gross</span>,
    cell: (info) => (
      <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
        {info.getValue()?.toFixed(2) || '0.00'}
      </p>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("net", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Net</span>,
      cell: (info) => (
      <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
        {info.getValue()?.toFixed(2) || '0.00'}
      </p>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("netPp", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Net P.P</span>,
    cell: (info) => (
      <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
        {info.getValue()?.toFixed(2) || '0.00'}
      </p>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("qty", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Qty</span>,
     cell: (info) => (
      <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
        {info.getValue()?.toFixed(2) || '0.00'}
      </p>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("totalCost", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Amount</span>,
    cell: (info) => (
      <p className="text-[10px] text-center font-bold text-gray-900 dark:text-white">
        {info.getValue()?.toFixed(2) || '0.00'}
      </p>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("netUp", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Net U.P</span>,
    cell: (info) => (
      <p className="text-[10px] text-center font-bold text-gray-900 dark:text-white">
        {info.getValue()?.toFixed(2) || '0.00'}
      </p>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("stats", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Status</span>,
    cell: (info) => <p className="text-[10px] font-medium text-gray-900 dark:text-white break-words">{info.getValue() || '-'}</p>,
    enableSorting: true,
  }),
  columnHelper.accessor("remarks", {
    header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Remarks</span>,
    cell: (info) => <p className="text-[10px] font-medium text-gray-900 dark:text-white break-words max-w-[120px]">{info.getValue() || '-'}</p>,
    enableSorting: true,
  }),
];

// Compact PriceTable component with space-efficient styling
const PriceTable = ({ subList }: { subList: SubListItem[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: subList,
    columns: [
      // S.No column (added)
      columnHelper.display({
        id: 'sno',
        header: () => <span className="font-medium text-white text-[10px] uppercase">S.No</span>,
        cell: ({ row }) => {
          const index = pagination.pageIndex * pagination.pageSize + row.index;
          return <span className="text-[11px] text-gray-600 dark:text-gray-400">{index + 1}</span>;
        },
        size: 40,
        enableSorting: false,
      }),
      // Supplier column
      columnHelper.accessor(
        row => `${row.supplierId || '-'} – ${row.supplierName || '-'}`,
        {
          id: 'supplier',
          header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Supplier</span>,
          cell: (info) => (
            <div className="text-[10px] font-medium text-gray-900 dark:text-white break-words max-w-[150px]">
              {info.getValue()}
            </div>
          ),
          enableSorting: true,
        }
      ),
      columnHelper.accessor("region", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Entity</span>,
        cell: (info) => <p className="text-[10px] font-medium text-gray-900 dark:text-white break-words">{info.getValue() || '-'}</p>,
        enableSorting: true,
      }),
      columnHelper.accessor("term", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Term</span>,
        cell: (info) => <p className="text-[10px] mr-3 font-medium text-gray-900 dark:text-white">{info.getValue()?.toString() || '-'}</p>,
        enableSorting: true,
      }),
      columnHelper.accessor("disc", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Disc.</span>,
        cell: (info) => (
          <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
            {info.getValue()?.toFixed(2) || '0.00'}
          </p>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("gross", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Gross</span>,
        cell: (info) => (
          <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
            {info.getValue()?.toFixed(2) || '0.00'}
          </p>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("net", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Net</span>,
        cell: (info) => (
          <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
            {info.getValue()?.toFixed(2) || '0.00'}
          </p>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("netPp", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Net P.P</span>,
        cell: (info) => (
          <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
            {info.getValue()?.toFixed(2) || '0.00'}
          </p>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("qty", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Qty</span>,
        cell: (info) => (
          <p className="text-[9px] font-bold text-black px-1.5 py-0.5 dark:bg-gray-700 dark:text-white">
            {info.getValue()?.toFixed(2) || '0.00'}
          </p>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("totalCost", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Amount</span>,
        cell: (info) => (
          <p className="text-[10px] text-center font-bold text-gray-900 dark:text-white">
            {info.getValue()?.toFixed(2) || '0.00'}
          </p>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("netUp", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Net U.P</span>,
        cell: (info) => (
          <p className="text-[10px] text-center font-bold text-gray-900 dark:text-white">
            {info.getValue()?.toFixed(2) || '0.00'}
          </p>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("stats", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Status</span>,
        cell: (info) => <p className="text-[10px] font-medium text-gray-900 dark:text-white break-words">{info.getValue() || '-'}</p>,
        enableSorting: true,
      }),
      columnHelper.accessor("remarks", {
        header: () => <span className="font-semibold text-[10px] uppercase dark:text-white">Remarks</span>,
        cell: (info) => <p className="text-[10px] font-medium text-gray-900 dark:text-white break-words max-w-[120px]">{info.getValue() || '-'}</p>,
        enableSorting: true,
      }),
    ],
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-1">
      {/* Header with search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a1 1 0 011-1h8a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zm2 2v8h6V6H7z" clipRule="evenodd" />
            </svg>
            Supplier Price Comparison <span className="font-bold text-blue-700">{table.getPrePaginationRowModel().rows.length} supplier(s)</span>
          </h3>
        </div>
        <div className="relative w-full lg:w-48">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[200px] overflow-y-auto border-collapse">
        <table className="w-full text-[10px]">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-1.5 py-1 text-left font-semibold text-white uppercase tracking-wider cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                    style={{ width: h.column.columnDef.size }}
                  >
                    <div className="flex items-center gap-0.5">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() && (
                        <span className="text-[8px]">{h.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnId = cell.column.id;
                    const numericColumns = ['disc', 'gross', 'net', 'netPp', 'qty', 'totalCost', 'netUp', 'term'];
                    const align = numericColumns.includes(columnId) ? 'text-right' : '';
                    const margin = numericColumns.includes(columnId) ? 'ml-3' : '';
                    return (
                      <td key={cell.id} className={`px-1.5 py-1 ${align} ${margin}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length} className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-[10px]">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - matches Quotationrequest style */}
      {subList.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 border-t border-gray-200 dark:border-gray-700 text-[10px]">
          <div className="text-gray-600 dark:text-gray-400">
            Showing{' '}
            <span className="font-medium">
              {pagination.pageIndex * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, subList.length)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{subList.length}</span> suppliers
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-1 text-[9px]"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={12} /> Prev
            </button>
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 text-[9px] font-medium">
              {pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-1 text-[9px]"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceComparisionPreview = () => {
  const formatter = useEntityFormatter(); // optional

  // ---------- State (unchanged) ----------
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTable] = useState(false);
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<LocationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemDetail[]>([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isItemLoading, setIsItemLoading] = useState(false);
  const [items, setItems] = useState<ItemDetail[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef1 = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodOpen, setPeriodOpen] = useState<boolean>(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [aggregatedData, setAggregatedData] = useState<AggregatedItem[]>([]);
  const [allItems, setAllItems] = useState<Record<string, ItemDetail[]>>({});
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const periodOptions = [...months];
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);

  // ---------- Handlers ----------
  // Click outside to close all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node) &&
        supplierDropdownRef1.current &&
        !supplierDropdownRef1.current.contains(event.target as Node) &&
        periodRef.current &&
        !periodRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
        setIsItemOpen(false);
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateForApi = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `01-${formattedMonth}-${year}`;
  };
  const formatDateForDisplay = (month: number, year: number): string => `${months[month]}-${year}`;
  const formatPeriodForYYYYMMDD = (month: number, year: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    return `${year}-${formattedMonth}-01`;
  };

  const handlePeriodSelect = (index: number) => {
    setSelectedMonth(index);
    setPeriodOpen(false);
    setSelectedLocation(null);
    setSelectedItem(null);
    setAggregatedData([]);
    setLocations([]);
    setFilteredLocations([]);
    setItems([]);
    setFilteredItems([]);
    setAllItems({});
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1;
    setSelectedYear(newYear);
    setSelectedLocation(null);
    setSelectedItem(null);
    setAggregatedData([]);
  };

  const isPeriodSelected = (index: number): boolean => selectedMonth !== null && index === selectedMonth;
  const displayValue = selectedMonth === null ? "Select Period" : formatDateForDisplay(selectedMonth, selectedYear);

  useEffect(() => {
    let defaultMonth: number, defaultYear: number;
    const tenderPeriodStr = localStorage.getItem("tenderPeriod");
    if (tenderPeriodStr) {
      const [day, month, year] = tenderPeriodStr.split('-').map(Number);
      const periodDate = new Date(year, month - 1, day);
      if (!isNaN(periodDate.getTime())) {
        defaultMonth = periodDate.getMonth();
        defaultYear = periodDate.getFullYear();
      } else {
        defaultMonth = new Date().getMonth();
        defaultYear = new Date().getFullYear();
      }
    } else {
      defaultMonth = new Date().getMonth();
      defaultYear = new Date().getFullYear();
    }
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
  }, []);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      if (selectedMonth === null) return;
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }
      setIsLocationsLoading(true);
      try {
        const formattedDate = formatDateForApi(selectedMonth, selectedYear);
        const { data } = await axios.get(
          `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadConsolidationLocReqForNp/${formattedDate}`,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        );
        if (data.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (data.success) {
          setLocations(data.data);
          setFilteredLocations(data.data);
        }
      } catch (err: any) {
        setSessionExpired(true);
        if (err?.response?.status === 401) setSessionExpired(true);
        console.error(err);
      }
      finally { setIsLocationsLoading(false); }
    };
    if (selectedMonth !== null) fetchLocations();
  }, [selectedMonth, selectedYear]);

  const fetchItems = async () => {
    if (!selectedLocation?.name) {
      setItems([]);
      setFilteredItems([]);
      return;
    }
    setIsItemLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No token found. Please log in.");
      setIsItemLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadItemFromConsolidationLocReq/${selectedLocation.name}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (data.status === 401) { setSessionExpired(true); return; }
      if (data.success) {
        setItems(data.data);
        setFilteredItems(data.data);
        setAllItems(prev => ({ ...prev, [selectedLocation.name]: data.data }));
      } else {
        setItems([]);
        setFilteredItems([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error fetching items.");
      setItems([]);
      setFilteredItems([]);
    } finally {
      setIsItemLoading(false);
    }
  };

  const handleProcessButton = async () => {
    if (selectedMonth === null) {
      toast.error("Please select a period.");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No token found. Please log in.");
      setIsLoading(false);
      return;
    }
    const periodStr = formatPeriodForYYYYMMDD(selectedMonth, selectedYear);
    let allAgg: AggregatedItem[] = [];
    try {
      if (selectedLocation && selectedItem) {
        const requestBody = { period: periodStr, consolidationId: selectedLocation.name, itemId: selectedItem.itemId };
        const { data } = await axios.post<PriceComparisonResponse>(
          `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/showPriceComparison`,
          requestBody,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        );
        if (data.success && data.data?.length) {
          const mainData = data.data[0];
          const matchingItem = mainData.items?.find(item => item.itemId === selectedItem.itemId);
          if (matchingItem) {
            allAgg.push({
              consolidationId: selectedLocation.name || '',
              item: matchingItem,
              subList: matchingItem.subList || [],
            });
          } else {
            toast.error(`Item ${selectedItem.itemId} not found.`);
          }
        } else {
          toast.error("No price comparison data found.");
        }
      } else {
        const targetLocations = selectedLocation ? [selectedLocation] : locations;
        const promises: Promise<void>[] = [];
        for (const loc of targetLocations) {
          let targetItems: ItemDetail[] = [];
          if (!allItems[loc.name || '']) {
            try {
              const { data: itemData } = await axios.get(
                `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/loadItemFromConsolidationLocReq/${loc.name}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (itemData.status === 401) { setSessionExpired(true); return; }
              if (itemData.success) {
                targetItems = itemData.data;
                setAllItems(prev => ({ ...prev, [loc.name || '']: targetItems }));
              } else continue;
            } catch (err) { console.error(err); continue; }
          } else {
            targetItems = allItems[loc.name || ''];
          }
          for (const item of targetItems) {
            const requestBody = { period: periodStr, consolidationId: loc.name, itemId: item.itemId };
            promises.push(
              axios.post<PriceComparisonResponse>(
                `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/showPriceComparison`,
                requestBody,
                { headers: { Authorization: `Bearer ${token}` } }
              ).then(({ data }) => {
                if (data.success && data.data.length) {
                  const main = data.data[0];
                  const matching = main.items.find(i => i.itemId === item.itemId);
                  if (matching) {
                    allAgg.push({
                      consolidationId: loc.name || '',
                      item: matching,
                      subList: matching.subList || [],
                    });
                  }
                }
              }).catch(err => { setSessionExpired(true); console.error(err); })
            );
          }
        }
        await Promise.all(promises);
        if (allAgg.length === 0) toast.error("No price comparison data found.");
      }
      allAgg.sort((a, b) => a.consolidationId.localeCompare(b.consolidationId) || a.item.itemId - b.item.itemId);
      setAggregatedData(allAgg);
    } catch (err: any) {
      let errorMessage = "Error fetching price comparison data.";
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.response?.status === 401) errorMessage = "Authentication failed.";
      else if (err.response?.status === 500) errorMessage = "Server error.";
      toast.error(errorMessage);
      setAggregatedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (selectedMonth === null || !selectedLocation) {
      toast.error("Please select period and consolidation ID.");
      return;
    }
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) { toast.error("No token found."); setIsDownloading(false); return; }
      const requestBody = {
        period: formatPeriodForYYYYMMDD(selectedMonth, selectedYear),
        consolidationId: selectedLocation.name,
      };
      const response = await axios.post(
        `http://43.254.31.234:9070/api-gateway-scm/tender-process-service-scm/tenderProcessController/priceComparisonReport`,
        requestBody,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      if (response.status === 401) { setSessionExpired(true); return; }
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PriceComparison_${selectedLocation.name}_${formatPeriodForYYYYMMDD(selectedMonth, selectedYear)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error downloading report.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (locationSearch.trim() === "") setFilteredLocations(locations);
    else {
      setFilteredLocations(
        locations.filter(location =>
          location.name?.toLowerCase().includes(locationSearch.toLowerCase()) ||
          location.locationName?.toLowerCase().includes(locationSearch.toLowerCase()) ||
          location.supplierName?.toLowerCase().includes(locationSearch.toLowerCase())
        )
      );
    }
  }, [locationSearch, locations]);

  useEffect(() => {
    if (itemSearch.trim() === "") setFilteredItems(items);
    else {
      setFilteredItems(
        items.filter(item =>
          item.itemId?.toString().includes(itemSearch) ||
          item.itemName?.toLowerCase().includes(itemSearch.toLowerCase()) ||
          item.itemCode?.toLowerCase().includes(itemSearch.toLowerCase())
        )
      );
    }
  }, [itemSearch, items]);

  const handleLocationSelect = (location: LocationItem) => {
    setSelectedLocation(location);
    setIsLocationDropdownOpen(false);
    setLocationSearch("");
    setSelectedItem(null);
    setAggregatedData([]);
    setItems([]);
    setFilteredItems([]);
  };

  const handleItemSelect = (item: ItemDetail) => {
    setSelectedItem(item);
    setIsItemOpen(false);
    setItemSearch("");
    setAggregatedData([]);
  };

  const refresh = () => {
    setSelectedLocation(null);
    setSelectedItem(null);
    setIsItemOpen(false);
    setAggregatedData([]);
    setPeriodOpen(false);
    setLocationSearch("");
    setItemSearch("");
    setFilteredLocations(locations);
    setFilteredItems(items);
  };

  const handleItemDropdownClick = () => {
    if (selectedLocation && items.length === 0) fetchItems();
    setIsItemOpen(!isItemOpen);
  };

  const isAnyLoading = isLoading || isItemLoading || isDownloading || isLocationsLoading;

  // ---------- Render ----------
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1f2937', color: '#fff', borderRadius: '8px', padding: '8px', fontSize: '12px' },
          success: { style: { background: '#059669' } },
          error: { style: { background: '#dc2626' } },
        }}
      />

      {isAnyLoading && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Loading...</span>
          </div>
        </div>
      )}

      {/* Page Header with Info Icon */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 mt-2 p-4">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">         <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-xl font-bold text-black dark:text-indigo-400">
            Price Comparison
          </h1>
          <Tooltip
            content={
              <div className="text-xs max-w-xs">
                <p className="font-semibold mb-1">Quick Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Select Period</li>
                  <li>Select Consolidation ID</li>
                  <li>Select Item (optional)</li>
                  <li>Fetch price comparison</li>
                  <li>View supplier prices</li>
                  <li>Download report if needed</li>
                </ol>
              </div>
            }
            placement="bottom"
            className="dark:bg-gray-800 dark:text-white z-50"
          >
            <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              <HiInformationCircle className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
        {!showTable && (
          <div className="flex items-center gap-1">
            <Tooltip content="Download report">
              <Button
                color="success"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                onClick={handleDownloadReport}
                disabled={isDownloading || selectedMonth === null || !selectedLocation}
              >
                {isDownloading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <HiDownload className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content="Refresh">
              <Button
                color="warning"
                size="xs"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                onClick={refresh}
              >
                <HiRefresh className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
      </div>

      {/* Main Form Card - redesigned for space efficiency */}
            <Card className="mb-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">

        <div className="p-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Period Picker */}
            <div className="relative w-full sm:w-48 md:w-52" ref={periodRef}>
              <button
                onClick={() => setPeriodOpen(!periodOpen)}
                className={`w-full px-3 py-1.5 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                  selectedMonth !== null
                    ? "border-blue-500 shadow-sm"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`p-1 rounded-full ${selectedMonth !== null ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <Calendar className={`w-3.5 h-3.5 ${selectedMonth !== null ? "text-blue-600" : "text-gray-500"}`} />
                  </div>
                  <span className={`text-xs font-medium truncate ${selectedMonth !== null ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                    {displayValue}
                  </span>
                </div>
                <FaChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${periodOpen ? "rotate-180" : ""}`} />
              </button>

              {periodOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleYearChange("prev")}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{selectedYear}</span>
                      <button
                        onClick={() => handleYearChange("next")}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {periodOptions.map((option, index) => (
                      <button
                        key={option}
                        onClick={() => handlePeriodSelect(index)}
                        className={`text-center py-1.5 rounded-lg cursor-pointer transition-all text-xs font-medium ${
                          isPeriodSelected(index)
                            ? "bg-blue-500 dark:bg-blue-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Consolidation ID Dropdown */}
            <div className="relative w-full sm:w-64 md:w-72" ref={supplierDropdownRef}>
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className={`w-full px-3 py-1.5 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                  selectedLocation
                    ? "border-blue-500 shadow-sm"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`p-1 rounded-full ${selectedLocation ? "bg-blue-100 dark:bg-blue-900" : "bg-blue-100 dark:bg-blue-700"}`}>
                    <FaBoxOpen className={`w-3.5 h-3.5 ${selectedLocation ? "text-blue-600" : "text-blue-500"}`} />
                  </div>
                  <span className={`text-xs font-medium truncate ${selectedLocation ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                    {selectedLocation?.name || "Consolidation ID"}
                  </span>
                </div>
                <FaChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isLocationDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="relative">
                      <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    <div
                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedLocation(null);
                        setIsLocationDropdownOpen(false);
                        setLocationSearch("");
                        setSelectedItem(null);
                        setAggregatedData([]);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">📌</span>                  
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">Please Select</span>
                      </div>
                    </div>
                    {filteredLocations.map((location) => (
                      <div
                        key={location.pk}
                        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                        onClick={() => handleLocationSelect(location)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${selectedLocation?.pk === location.pk ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"}`}>
                              {filteredLocations.indexOf(location)+1}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white">{location.name}</div>
                              {location.locationName && (
                                <div className="text-[9px] text-gray-500 dark:text-gray-400">{location.locationName}</div>
                              )}
                            </div>
                          </div>
                          {selectedLocation?.pk === location.pk && (
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-[8px]">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredLocations.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                        No options found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Item Dropdown */}
            <div className="relative w-full sm:w-64 md:w-72" ref={supplierDropdownRef1}>
              <button
                onClick={handleItemDropdownClick}
                className={`w-full px-3 py-1.5 flex items-center justify-between bg-white dark:bg-gray-800 border-2 rounded-md transition-all duration-200 ${
                  !selectedLocation
                    ? "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    : selectedItem
                    ? "border-blue-500 shadow-sm"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                }`}
                disabled={!selectedLocation}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`p-1 rounded-full ${selectedItem ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <HiViewList className={`w-3.5 h-3.5 ${selectedItem ? "text-blue-600" : "text-gray-500"}`} />
                  </div>
                  <span className={`text-xs font-medium truncate ${selectedItem ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                    {selectedItem ? `${selectedItem.itemId} - ${selectedItem.itemName}` : "All Items"}
                  </span>
                </div>
                {isItemLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <FaChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isItemOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {isItemOpen && selectedLocation && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="relative">
                      <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    <div
                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedItem(null);
                        setIsItemOpen(false);
                        setItemSearch("");
                        setAggregatedData([]);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <span className="text-xs">–</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">All Items</span>
                      </div>
                    </div>
                    {filteredItems.map((item) => (
                      <div
                        key={`${item.pk}-${item.itemId}`}
                        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${selectedItem?.itemId === item.itemId ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"}`}>
                              {filteredItems.indexOf(item)+1}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                {item.itemId} - {item.itemName}
                              </div>
                              {item.itemCode && (
                                <div className="text-[9px] text-gray-500 dark:text-gray-400">Code: {item.itemCode}</div>
                              )}
                            </div>
                          </div>
                          {selectedItem?.itemId === item.itemId && (
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-[8px]">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                        No items found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fetch Button */}
            <Tooltip content="Fetch price comparison">
              <Button
                className={`w-9 h-9 p-0 rounded-full text-white flex items-center justify-center transition-all duration-200 ${
                  selectedMonth === null
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                }`}
                disabled={isLoading || selectedMonth === null}
                onClick={handleProcessButton}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <HiArrowRight className="w-3 h-3" />
                )}
              </Button>
            </Tooltip>
          </div>
        </div>

      {/* Aggregated Items Sections */}
      {aggregatedData.length > 0 ? (
        aggregatedData.map((agg, index) => (
          <div key={`${agg.consolidationId}-${agg.item.itemId}`} className="mb-4">
            {/* Summary Cards - more compact */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 mb-2">
              <Card className="bg-blue-50 dark:bg-blue-900 border-blue-100 dark:border-blue-800 p-1.5">
                <div className="flex items-center gap-1">
                  <div className="p-0.5 bg-blue-500 dark:bg-blue-700 rounded">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-medium text-gray-600 dark:text-gray-300">Consolidation ID</p>
                    <p className="text-[9px] font-bold text-gray-900 dark:text-white max-w-30">
                      {agg.consolidationId}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900 border-green-100 dark:border-green-800 p-1.5">
                <div className="flex items-center gap-1">
                  <div className="p-0.5 bg-green-500 dark:bg-green-700 rounded">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-medium text-gray-600 dark:text-gray-300">Items</p>
                    <p className="text-[9px] font-bold text-gray-900 dark:text-white">{agg.item.itemId}</p>
                    <p className="text-[7px] text-black font-bold dark:text-white max-w-28">{agg.item.itemName}</p>
                  </div>
                </div>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-900 border-amber-100 dark:border-amber-800 p-1.5">
                <div className="flex items-center gap-1">
                  <div className="p-0.5 bg-amber-500 dark:bg-amber-700 rounded">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-medium text-gray-600 dark:text-gray-300">Package ID</p>
                    <p className="text-[9px] font-bold text-gray-900 dark:text-white">{agg.item.packageId || 'N/A'}</p>
                  </div>
                </div>
              </Card>
              <Card className="bg-indigo-50 dark:bg-indigo-900 border-indigo-100 dark:border-indigo-800 p-1.5">
                <div className="flex items-center gap-1">
                  <div className="p-0.5 bg-indigo-500 dark:bg-indigo-700 rounded">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-medium text-gray-600 dark:text-gray-300">Prev Price</p>
                    <p className="text-[9px] font-bold text-gray-900 dark:text-white">
                      {agg.item.gpLast?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-900 border-purple-100 dark:border-purple-800 p-1.5">
                <div className="flex items-center gap-1">
                  <div className="p-0.5 bg-purple-500 dark:bg-purple-700 rounded">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] font-medium text-gray-600 dark:text-gray-300">Prev Supplier</p>
                    <p className="text-[9px] font-bold text-gray-900 dark:text-white max-w-34">
                      {agg.item.supplierNameLast || 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Price Table */}
              <PriceTable subList={agg.subList} />
          </div>
        ))
      ) : (
        !isLoading && (
          <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-3 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded mb-1.5">
                <svg className="w-5 h-5 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4a1 1 0 011-1h8a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zm2 2v8h6V6H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">No Data</h4>
              <p className="text-gray-500 dark:text-gray-400 text-[9px]">
                Select a period, and optionally a consolidation ID and item to view price comparison.
              </p>
            </div>
          </Card>
        )
      )}
          </Card>

      {sessionExpired && <SessionModal />}
    </>
  );
};

export default PriceComparisionPreview;