import { z } from "zod";
import { PrintLogClient } from "@/lib/printlog";

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

export const TOOLS: ToolDefinition[] = [
  // ── Prints ────────────────────────────────────────────────────────────────
  {
    name: "list_prints",
    description: "List print jobs for the current user, with optional filters and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number (1-based, default 1)" },
        pageSize: { type: "number", description: "Items per page (default 20)" },
        search: { type: "string", description: "Filter by name or description" },
        onlySuccessful: { type: "boolean", description: "Show only successful prints" },
        onlyFailed: { type: "boolean", description: "Show only failed prints" },
      },
    },
  },
  {
    name: "get_print",
    description: "Get full details for a single print job by ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Print ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_print",
    description: "Create a new print job record.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "object", description: "Print data (name, printerId, filamentId, duration, etc.)" },
      },
      required: ["data"],
    },
  },
  {
    name: "update_print",
    description: "Update an existing print job record.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Print ID" },
        data: { type: "object", description: "Updated print fields" },
      },
      required: ["id", "data"],
    },
  },
  {
    name: "delete_print",
    description: "Permanently delete a print job record.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Print ID to delete" },
      },
      required: ["id"],
    },
  },

  // ── Filaments ─────────────────────────────────────────────────────────────
  {
    name: "list_filaments",
    description: "List filament rolls for the current user.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number" },
        pageSize: { type: "number" },
        search: { type: "string", description: "Filter by brand or material" },
      },
    },
  },
  {
    name: "get_filament",
    description: "Get detailed information for a filament roll by ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Filament UUID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_filament",
    description: "Create a new filament roll record.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "object", description: "Filament data (brand, material, color, weight, etc.)" },
      },
      required: ["data"],
    },
  },
  {
    name: "update_filament",
    description: "Update an existing filament roll record.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Filament UUID" },
        data: { type: "object", description: "Updated filament fields" },
      },
      required: ["id", "data"],
    },
  },
  {
    name: "delete_filament",
    description: "Permanently delete a filament roll.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Filament UUID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_filament_brands",
    description: "Get the list of filament brands the user has used.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_filament_storage_locations",
    description: "Get the list of storage locations defined by the user.",
    inputSchema: { type: "object", properties: {} },
  },

  // ── Printers ──────────────────────────────────────────────────────────────
  {
    name: "list_printers",
    description: "List printers for the current user.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "get_printer",
    description: "Get detailed information for a specific printer.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Printer ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_printer",
    description: "Create a new printer record.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "object", description: "Printer data (name, brand, model, etc.)" },
      },
      required: ["data"],
    },
  },
  {
    name: "update_printer",
    description: "Update an existing printer record.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Printer ID" },
        data: { type: "object", description: "Updated printer fields" },
      },
      required: ["id", "data"],
    },
  },
  {
    name: "delete_printer",
    description: "Permanently delete a printer.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Printer ID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_printer_filament",
    description: "Get the currently loaded filament for a printer.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Printer ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "unload_printer_filament",
    description: "Unload all filament from a printer.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Printer ID" },
      },
      required: ["id"],
    },
  },

  // ── Printer Maintenance ───────────────────────────────────────────────────
  {
    name: "list_maintenance",
    description: "List printer maintenance entries.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "get_maintenance",
    description: "Get details for a specific maintenance entry.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Maintenance entry ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_maintenance",
    description: "Create a new printer maintenance entry.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "object", description: "Maintenance data (printerId, category, notes, date, etc.)" },
      },
      required: ["data"],
    },
  },
  {
    name: "update_maintenance",
    description: "Update an existing maintenance entry.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Maintenance entry ID" },
        data: { type: "object", description: "Updated maintenance fields" },
      },
      required: ["id", "data"],
    },
  },
  {
    name: "delete_maintenance",
    description: "Delete a maintenance entry.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Maintenance entry ID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_maintenance_categories",
    description: "Get available maintenance categories.",
    inputSchema: { type: "object", properties: {} },
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  {
    name: "list_notifications",
    description: "List notifications for the current user.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
  },
  {
    name: "get_unread_notification_count",
    description: "Get the count of unread notifications.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "mark_all_notifications_read",
    description: "Mark all notifications as read.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "delete_all_notifications",
    description: "Delete all notifications for the current user.",
    inputSchema: { type: "object", properties: {} },
  },

  // ── Feed & Reference ──────────────────────────────────────────────────────
  {
    name: "get_feed",
    description: "Get the user's print activity feed.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_materials",
    description: "Get available material types for filament selection.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_printer_categories",
    description: "Get available printer categories.",
    inputSchema: { type: "object", properties: {} },
  },
];

type ToolInput = Record<string, unknown>;

const IntId = z.object({ id: z.number().int().positive() });
const StrId = z.object({ id: z.string().min(1).max(128) });
const IntIdWithData = IntId.extend({ data: z.record(z.unknown()) });
const StrIdWithData = StrId.extend({ data: z.record(z.unknown()) });
const DataOnly = z.object({ data: z.record(z.unknown()) });

const PageOnly = z.object({
  page: z.number().int().positive().max(10_000).optional(),
  pageSize: z.number().int().positive().max(200).optional(),
});
const PageWithSearch = PageOnly.extend({
  search: z.string().max(256).optional(),
});
const ListPrintsInput = PageWithSearch.extend({
  onlySuccessful: z.boolean().optional(),
  onlyFailed: z.boolean().optional(),
});

function parse<T>(schema: z.ZodType<T>, input: ToolInput): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid tool input: ${result.error.issues.map((i) => i.message).join("; ")}`);
  }
  return result.data;
}

export async function callTool(
  name: string,
  input: ToolInput,
  client: PrintLogClient
): Promise<unknown> {
  switch (name) {
    // Prints
    case "list_prints": {
      const a = parse(ListPrintsInput, input);
      return client.listPrints({
        PageNumber: a.page,
        PageSize: a.pageSize,
        searchText: a.search,
        showOnlySuccessful: a.onlySuccessful,
        showOnlyFailed: a.onlyFailed,
      });
    }
    case "get_print":
      return client.getPrint(parse(IntId, input).id);
    case "create_print":
      return client.createPrint(parse(DataOnly, input).data);
    case "update_print": {
      const a = parse(IntIdWithData, input);
      return client.updatePrint(a.id, a.data);
    }
    case "delete_print":
      await client.deletePrint(parse(IntId, input).id);
      return { success: true };

    // Filaments
    case "list_filaments": {
      const a = parse(PageWithSearch, input);
      return client.listFilaments({
        PageNumber: a.page,
        PageSize: a.pageSize,
        searchText: a.search,
      });
    }
    case "get_filament":
      return client.getFilament(parse(StrId, input).id);
    case "create_filament":
      return client.createFilament(parse(DataOnly, input).data);
    case "update_filament": {
      const a = parse(StrIdWithData, input);
      return client.updateFilament(a.id, a.data);
    }
    case "delete_filament":
      await client.deleteFilament(parse(StrId, input).id);
      return { success: true };
    case "get_filament_brands":
      return client.getFilamentBrands();
    case "get_filament_storage_locations":
      return client.getFilamentStorageLocations();

    // Printers
    case "list_printers": {
      const a = parse(PageOnly, input);
      return client.listPrinters({ PageNumber: a.page, PageSize: a.pageSize });
    }
    case "get_printer":
      return client.getPrinter(parse(IntId, input).id);
    case "create_printer":
      return client.createPrinter(parse(DataOnly, input).data);
    case "update_printer": {
      const a = parse(IntIdWithData, input);
      return client.updatePrinter(a.id, a.data);
    }
    case "delete_printer":
      await client.deletePrinter(parse(IntId, input).id);
      return { success: true };
    case "get_printer_filament":
      return client.getPrinterFilament(parse(IntId, input).id);
    case "unload_printer_filament":
      return client.unloadPrinterFilament(parse(IntId, input).id);

    // Maintenance
    case "list_maintenance": {
      const a = parse(PageOnly, input);
      return client.listMaintenance({ PageNumber: a.page, PageSize: a.pageSize });
    }
    case "get_maintenance":
      return client.getMaintenance(parse(IntId, input).id);
    case "create_maintenance":
      return client.createMaintenance(parse(DataOnly, input).data);
    case "update_maintenance": {
      const a = parse(IntIdWithData, input);
      return client.updateMaintenance(a.id, a.data);
    }
    case "delete_maintenance":
      await client.deleteMaintenance(parse(IntId, input).id);
      return { success: true };
    case "get_maintenance_categories":
      return client.getMaintenanceCategories();

    // Notifications
    case "list_notifications": {
      const a = parse(PageOnly, input);
      return client.listNotifications({ PageNumber: a.page, PageSize: a.pageSize });
    }
    case "get_unread_notification_count":
      return client.getUnreadNotificationCount();
    case "mark_all_notifications_read":
      return client.markAllNotificationsRead();
    case "delete_all_notifications":
      await client.deleteAllNotifications();
      return { success: true };

    // Feed & Reference
    case "get_feed":
      return client.getFeed();
    case "get_materials":
      return client.getMaterials();
    case "get_printer_categories":
      return client.getPrinterCategories();

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
