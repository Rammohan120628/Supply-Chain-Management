import {
  Label,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {  HiTrash } from "react-icons/hi";
import axios from "axios";
import _ from "lodash";

import { Icon } from '@iconify/react/dist/iconify.js';
import QuotationReqBulkTable from "./QuotationReqBulkTable";
import toast, { Toaster } from 'react-hot-toast';
import SessionModal from "../SessionModal";

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

const columnHelper = createColumnHelper<TableTypeDense>();

const QuotationBulkUploadLocationrequest = () => {
  /* ────────────────────── STATE ────────────────────── */
  const [showTable, setShowTable] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
 
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [selectedDates, setSelectedDates] = useState<
    { date: string; day: number }[]
  >([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [itemData, setItemData] = useState<TableTypeDense[]>([]);
  const [selectedItems, setSelectedItems] = useState<TableTypeDense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 20;
  const [itemsSearch, setItemsSearch] = useState("");

  const currentDate = new Date();
  const requestPeriod = currentDate.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });

  /* ────────────────────── MEMOIZED FILTERS ────────────────────── */
  const filteredSelectedItems = useMemo(
    () =>
      selectedItems.filter(
        (item) =>
          (item.itemName ?? "").toLowerCase().includes(itemsSearch.toLowerCase()) ||
          (item.itemId ?? "").toString().includes(itemsSearch) ||
          (item.packageId ?? "").toLowerCase().includes(itemsSearch.toLowerCase())
      ),
    [selectedItems, itemsSearch]
  );

  const filteredOptions = useMemo(
    () =>
      locations.filter((loc) =>
        loc.locationId.toLowerCase().includes(search.toLowerCase())
      ),
    [locations, search]
  );

  const filteredItemData = useMemo(
    () =>
      itemData.filter(
        (item) =>
          (item.itemName ?? "")
            .toLowerCase()
            .includes(modalSearch.toLowerCase()) ||
          (item.itemId ?? "").toString().includes(modalSearch) ||
          (item.packageId ?? "")
            .toLowerCase()
            .includes(modalSearch.toLowerCase()) ||
          (item.supplierId ?? "")
            .toLowerCase()
            .includes(modalSearch.toLowerCase())
      ),
    [itemData, modalSearch]
  );

  const paginatedItemData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItemData.slice(start, start + itemsPerPage);
  }, [filteredItemData, currentPage]);

  const selectedCount = useMemo(
    () => filteredItemData.filter((i) => i.isSelected).length,
    [filteredItemData]
  );

  const totalPages = Math.ceil(filteredItemData.length / itemsPerPage);
const refresh = () => {
    setSelectedItems([]);
    setSelectedDates([]);
    // handleSelect({ locationId: selectedLocation, locationName });
    setIsOpen(false);
    setSearch("");
    setCurrentPage(1);
    setSelectedLocation("");
    setLocationName("")
  setItemsSearch("");
}
  /* ────────────────────── API CALLS ────────────────────── */
  // locations
  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("authToken");
        if (!token) {
      setSessionExpired(true);
      return;
    }
      if (!token) {
        toast.error("No token found. Please log in.", {
          duration: 2000,
          position: 'top-right',
        });
        return;
      }
      try {
        const { data } = await axios.get(
          "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/dropDownLocation",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (data.success) setLocations(data.data);
        else toast.error(data.message || "Failed to fetch locations.", {
          duration: 2000,
          position: 'top-right',
        });
      } catch (err) {
        toast.error("Error fetching locations. Please try again.", {
          duration: 2000,
          position: 'top-right',
        });
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  // items (when a location is selected)
  const fetchItems = async (locationId: string) => {
    const token = localStorage.getItem("authToken");
      if (!token) {
      setSessionExpired(true);
      return;
    }
    if (!token) {
      toast.error("No token found. Please log in.", {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }
    const period = `01-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${currentDate.getFullYear()}`;
    try {
      const { data } = await axios.get(
        `http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/loadAPLForLocationRequestProcess/${locationId}/${period}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        const mapped: TableTypeDense[] = data.data.map((i: any) => ({
          itemId: i.itemId,
          itemName: i.itemName,
          packageId: i.packageId,
          supplierId: i.supplierId || i.supplierID || i.supId || "N/A",
          status: "Active",
          statuscolor: "success",
          budget: i.grandTotal?.toString() || "0.0",
          isSelected: false,
          totalQty: "0.0",
          quantities: {},
        }));
        setItemData(mapped);
      } else toast.error(data.message || "Failed to fetch items.", {
        duration: 2000,
        position: 'top-right',
      });
    } catch (err) {
      toast.error("Error fetching items. Please try again.", {
        duration: 2000,
        position: 'top-right',
      });
      console.error(err);
    }
  };

  /* ────────────────────── HANDLERS ────────────────────── */
  const handleSelect = (loc: any) => {
    setSelectedLocation(loc.locationId);
    setLocationName(loc.locationName);
    setIsOpen(false);
    setSearch("");
    setCurrentPage(1);
    fetchItems(loc.locationId);
  };

  const handleDateCheckbox = (dateStr: string, day: number) => {
    setSelectedDates((prev) => {
      const exists = prev.find((d) => d.date === dateStr);
      if (exists) {
        const newDates = prev.filter((d) => d.date !== dateStr);
        setSelectedItems((items) =>
          items.map((it) => {
            const qty = { ...it.quantities };
            delete qty[dateStr];
            return {
              ...it,
              quantities: qty,
              totalQty: Object.values(qty)
                .reduce((s, v) => s + Number.parseFloat(v || "0"), 0)
                .toFixed(1),
            };
          })
        );
        return newDates;
      }
      return [...prev, { date: dateStr, day }].sort((a, b) => a.day - b.day);
    });
  };

  const handleItemCheckbox = useCallback(
    _.debounce((itemId: number) => {
      setItemData((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((i) => i.itemId === itemId);
        if (idx > -1) copy[idx].isSelected = !copy[idx].isSelected;
        return copy;
      });
    }, 100),
    []
  );

  const handleQuantityChange = (
    itemId: number,
    date: string,
    value: string
  ) => {
    const parsed = value === "" ? "0.0" : Number.parseFloat(value).toFixed(3);
    setSelectedItems((prev) =>
      prev.map((it) =>
        it.itemId === itemId
          ? {
              ...it,
              quantities: { ...it.quantities, [date]: parsed },
              totalQty: Object.values({ ...it.quantities, [date]: parsed })
                .reduce((s, v) => s + Number.parseFloat(v || "0"), 0)
                .toFixed(1),
            }
          : it
      )
    );
  };

  const handleAddItems = () => {
    const newly = filteredItemData.filter((i) => i.isSelected);
    const unique = newly.filter(
      (n) => !selectedItems.some((e) => e.itemId === n.itemId)
    );

    if (unique.length < newly.length) {
      toast.error("Duplicate items not added.", {
        duration: 2000,
        position: 'top-right',
      });
    }

    setSelectedItems((prev) => [
      ...prev,
      ...unique.map((i) => ({
        ...i,
        name: i.itemName,
        post: "Item",
        pname: i.itemName,
        quantities: {},
        totalQty: "0.0",
      })),
    ]);

    setOpenModal(false);
    setItemData((prev) => prev.map((i) => ({ ...i, isSelected: false })));
    setModalSearch("");
    setCurrentPage(1);
  };

  const handleDeleteItem = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("authToken");
      if (!token) {
      setSessionExpired(true);
      return;
    }
    const userId = localStorage.getItem("userId");

    if (!token) {
      toast.error("No token found. Please log in.", {
        duration: 2000,
        position: 'top-right',
      });
      setSaving(false);
      return;
    }
    if (!userId) {
      toast.error("User ID not found. Please log in again.", {
        duration: 2000,
        position: 'top-right',
      });
      setSaving(false);
      return;
    }
    if (!selectedLocation) {
      toast.error("Please select a location.", {
        duration: 2000,
        position: 'top-right',
      });
      setSaving(false);
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("No items selected.", {
        duration: 2000,
        position: 'top-right',
      });
      setSaving(false);
      return;
    }
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date.", {
        duration: 2000,
        position: 'top-right',
      });
      setSaving(false);
      return;
    }

    // ---- quantity validation ----
    const missing: string[] = [];
    for (const it of selectedItems) {
      for (const d of selectedDates) {
        const q = Number.parseFloat(it.quantities?.[d.date] || "0");
        if (q <= 0) missing.push(`Item "${it.itemName}" needs quantity on ${d.date}`);
      }
    }
    if (missing.length) {
      const show = missing.slice(0, 3).join("; ");
      const more = missing.length > 3 ? ` and ${missing.length - 3} more` : "";
      toast.error(`Missing quantities: ${show}${more}.`, {
        duration: 4000,
        position: 'top-right',
      });
      setSaving(false);
      return;
    }

    // ---- payload ----
    const qtyTemplate: Record<string, number> = {};
    const renderedTemplate: Record<string, boolean> = {};
    for (let d = 1; d <= 31; d++) {
      qtyTemplate[`qty${d}`] = 0;
      renderedTemplate[`qtyRendered${d}`] = false;
    }

    const payload = {
      locationId: selectedLocation,
      entityId: "ENT001",
      userFk: Number(userId),
      period: `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-01`,
      subList: selectedItems.map((it) => {
        const qty = { ...qtyTemplate };
        const rend = { ...renderedTemplate };
        for (const d of selectedDates) {
          const day = Number.parseInt(d.date.split("-")[0], 10);
          const val = Number.parseFloat(it.quantities?.[d.date] || "0.0").toFixed(
            1
          );
          qty[`qty${day}`] = Number(val);
          rend[`qtyRendered${day}`] = Boolean(
            it.quantities?.[d.date] && Number(it.quantities[d.date]) > 0
          );
        }
        return {
          itemId: it.itemId,
          packageId: it.packageId,
          entOrder: 1,
          supplierId: it.supplierId || "N/A",
          ...qty,
          ...rend,
        };
      }),
    };

    try {
      const { data } = await axios.post(
        "http://43.254.31.234:9070/api-gateway-scm/request-and-po-service-scm/requestAndPOController/saveLocationRequestProcess",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Saved successfully!", {
          duration: 2000,
          position: 'top-right',
        });
        setTimeout(() => {
          refresh();
        }, 2000);
      } else {
        toast.error(data.message || "Failed to save.", {
          duration: 2000,
          position: 'top-right',
        });
      }
    } catch (err) {
      toast.error("Error saving data. Please try again.", {
        duration: 2000,
        position: 'top-right',
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ────────────────────── TABLE DEFINITIONS ────────────────────── */
  const [columnVisibility, setColumnVisibility] = useState({});

  const defaultColumns = [
    columnHelper.accessor("itemId", {
      header: () => "Item Id",
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
    columnHelper.accessor("pname", {
      header: () => "Item Name",
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
    columnHelper.accessor("packageId", {
      header: () => "Package Id",
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
    ...selectedDates.map((d) =>
      columnHelper.display({
        id: d.date,
        header: () => <span>{d.day}</span>,
        cell: ({ row }) => (
          <input
            type="number"
            value={row.original.quantities?.[d.date] || "0.0"}
            onChange={(e) =>
              handleQuantityChange(
                row.original.itemId!,
                d.date,
                e.target.value
              )
            }
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
            step="0.001"
            min="0"
          />
        ),
      })
    ),
    columnHelper.accessor("totalQty", {
      header: () => "Total QTY",
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
    columnHelper.display({
      id: "delete",
      header: () => "Delete",
      cell: ({ row }) => (
        <Button
          color="failure"
          size="xs"
          onClick={() => handleDeleteItem(row.original.itemId!)}
        >
          <HiTrash className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const defaultColumns1 = [
    columnHelper.display({
      id: "checkbox",
      header: () => "Select",
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.isSelected || false}
          onChange={() => handleItemCheckbox(row.original.itemId!)}
          className="w-4 h-4 cursor-pointer"
        />
      ),
    }),
    columnHelper.accessor("itemId", {
      header: () => "Item Id",
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
    columnHelper.accessor("itemName", {
      header: () => "Item Name",
      cell: (info) => (
        <Badge
          color={`light${info.row.original.statuscolor}`}
          className="capitalize"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("packageId", {
      header: () => "Package Id",
      cell: (info) => <p className="text-base">{info.getValue()}</p>,
    }),
    columnHelper.accessor("supplierId", {
      header: () => "Supplier ID",
      cell: (info) => <p className="text-base">{info.getValue() || "N/A"}</p>,
    }),
  ];

  const table = useReactTable({
    data: filteredSelectedItems,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const table1 = useReactTable({
    data: paginatedItemData,
    columns: defaultColumns1,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleListClick = () => {
    setShowTable(true);
  };
  // const handleAddClick = () => {
  //   setShowTable(false);
  // };

  /* ────────────────────── RENDER ────────────────────── */
  let content;
  if (showTable) {
    content = <QuotationReqBulkTable />;
  } else {
    content = (
      <div className="space-y-4">
        {/* ── Header ── */}
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="grid grid-cols-20 gap-6">
            <h1 className="ml-0 mt-4 lg:col-span-5 whitespace-nowrap">
              Location Request No : Auto#
            </h1>
            <div className="lg:col-span-5 col-span-12">
              <div className="relative mt-2">
                <input
                  id="requestPeriod"
                  type="text"
                  value={requestPeriod}
                  readOnly
                  className="form-control peer w-full px-16 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <label
                  htmlFor="requestPeriod"
                  className="absolute left-5 top-2 text-black transition-all duration-200 pointer-events-none
                            peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                            peer-[:not(:placeholder-shown)]:px-1"
                >
                  Request Period
                </label>
              </div>
            </div>
          </div>

          <br />
          <Label className="text-blue-600 text-lg font-semibold">
            Location Information
          </Label>

          <div className="grid grid-cols-20 gap-6">
            <h1 className="ml-0 mt-4 lg:col-span-5 whitespace-nowrap">
              Location Id *
            </h1>

            {/* Location dropdown */}
            <div className="lg:col-span-5 col-span-12">
              <div className="flex-1 relative mt-2">
                <div
                  className="border border-gray-300 rounded-md text-gray-500 h-10 flex items-center justify-between px-2 cursor-pointer select-md"
                  onClick={() => setIsOpen((v) => !v)}
                >
                  <span className="text-black">
                    {selectedLocation || "Please Select"}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isOpen && (
                  <div className="absolute z-10 bg-white border border-gray-300 rounded-md w-full mt-1">
                    <input
                      type="text"
                      placeholder="Search locations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full p-2 border-b border-gray-300 focus:outline-none"
                      autoFocus
                    />
                    <div className="max-h-40 overflow-y-auto">
                      {filteredOptions.length ? (
                        filteredOptions.map((loc) => (
                          <div
                            key={loc.pk}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelect(loc)}
                          >
                            {loc.locationId}
                          </div>
                        ))
                      ) : (
                        <div className="p-2">No locations found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location name (read-only) */}
            <div className="lg:col-span-5 col-span-12">
              <div className="relative mt-2">
                <input
                  id="locationName"
                  type="text"
                  value={locationName}
                  readOnly
                  className="form-control peer w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <label
                  htmlFor="locationName"
                  className="absolute left-3 top-2 text-black transition-all duration-200 pointer-events-none
                            peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 
                            peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white 
                            peer-[:not(:placeholder-shown)]:px-1"
                >
                  Location Name
                </label>
              </div>
            </div>

            {/* Select Items button */}
            <div>
              <Button
                onClick={() => setOpenModal(true)}
                className="px-10 whitespace-nowrap mt-1"
                color="primary"
              >
                Select Items
              </Button>

              {/* ── Items Modal ── */}
              <Modal
                show={openModal}
                onClose={() => setOpenModal(false)}
                size="5xl"
              >
                <ModalHeader className="rounded-t-md pb-0">
                  Item Details
                </ModalHeader>
                <ModalBody>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-blue-600 text-sm font-semibold">
                      {selectedCount} selected
                    </Label>
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full max-w-xs p-2 border-b border-gray-300 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  {/* Items table inside modal */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          {table1
                            .getHeaderGroups()
                            .map((hg) => (
                              <tr key={hg.id}>
                                {hg.headers.map((h) => (
                                  <th
                                    key={h.id}
                                    className="text-base text-white whitespace-nowrap font-semibold text-left border-b p-2 bg-blue-600"
                                  >
                                    {h.isPlaceholder
                                      ? null
                                      : flexRender(
                                          h.column.columnDef.header,
                                          h.getContext()
                                        )}
                                  </th>
                                ))}
                              </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y">
                          {table1.getRowModel().rows.length ? (
                            table1.getRowModel().rows.map((row) => (
                              <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                  <td
                                    key={cell.id}
                                    className="whitespace-nowrap p-2 text-sm"
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="text-center p-4">
                                No items found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-between mt-4">
                    <Button
                      color="gray"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      color="gray"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={handleAddItems} className="bg-primary">
                    ADD
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => setOpenModal(false)}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>
            </div>
          </div>
        </div>

        {/* ── Selected Items Table + Date Checkboxes ── */}
        <div className="w-[1050px]">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-blue-600 text-lg font-semibold whitespace-nowrap">
              Items :
            </Label>
            <input
              type="text"
              placeholder="Search items..."
              value={itemsSearch}
              onChange={(e) => setItemsSearch(e.target.value)}
              className="form-control-input max-w-xs"
            />
          </div>

          {/* Selected items table */}
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          className="text-base text-white whitespace-nowrap font-semibold text-left border-b p-2 bg-blue-600"
                        >
                          {h.isPlaceholder
                            ? null
                            : flexRender(
                                h.column.columnDef.header,
                                h.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y">
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="whitespace-nowrap p-2 text-sm"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={defaultColumns.length}
                        className="text-center p-4 text-sm"
                      >
                        No items selected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Date checkboxes */}
          <div className="mt-6">
            <div className="grid grid-cols-6 gap-3">
              {(() => {
                const daysInMonth = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  0
                ).getDate();
                const list = [];
                for (let d = 1; d <= daysInMonth; d++) {
                  const fmt = `${String(d).padStart(2, "0")}-${String(
                    currentDate.getMonth() + 1
                  ).padStart(2, "0")}-${currentDate.getFullYear()}`;
                  list.push({ fmt, day: d });
                }
                return list.map(({ fmt, day }) => (
                  <div key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={selectedDates.some((sd) => sd.date === fmt)}
                      onChange={() => handleDateCheckbox(fmt, day)}
                    />
                    <label className="text-sm cursor-pointer">{fmt}</label>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
   <>
       <div className="flex items-center gap-3  ">
         {/* <h1 className="text-2xl mr-115 text-indigo-700 whitespace-nowrap">Location Request Creation</h1> */}
        <div className="mb-">
           {showTable ? (
           <>
           </>
          ) : (
            <div className="flex f gap-2 mt- justify-center items-center mb-2">
        <h1 className="text-2xl mr-140 text-indigo-700 whitespace-nowrap">Location Request Creation</h1>
            
           
              <Badge
                            color="success"
                            onClick={handleSave}
                          >
                            {saving ? (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  ) : (
    <Icon icon="tabler:file-time" className="text-base w-8 h-6" />
  )}
            
                          </Badge>
                          <Badge
            
                            color="warning"
            
                            onClick={refresh}
                          >
            
            
                            <Icon icon="tabler:refresh" className="text-base w-8 h-6" />
                          </Badge>
                          <Badge
                            color="primary"
                            onClick={handleListClick}
                          >
                            <Icon icon="tabler:list" className="text-base w-8 h-6" />
                          </Badge>
            
            </div>
          )}
        </div>
      </div>
      {content}
      <Toaster />
                  {sessionExpired && <SessionModal/>}
      
    </>
  );
};

export default QuotationBulkUploadLocationrequest;