import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    Layers,
    FolderTree,
    CheckSquare,
    RefreshCw,
    Plus,
    ChevronDown,
    ChevronRight,
    Settings,
    Server,
    RotateCcw,
    Download,
    Search,
    FolderPlus,
    GitCommit,
    X,
    Edit3,
    Trash2,
    Calendar,
    AlertCircle,
    Clock,
    CheckCircle2,
    ExternalLink,
    Archive,
    Plug,
    ShieldCheck,
    XCircle,
    AlertTriangle,
    FolderOpen,
    FileText,
    Check,
} from "lucide-react";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type RoleStatus = "OPEN" | "CLOSED";
export type RequestStatus = "Ready" | "Working" | "Complete";
export type ResponsibilityStatus = "Active" | "In Progress" | "Completed";

export interface Role {
    id: string;
    title: string;
    description: string;
    status: RoleStatus;
    createdAt: string;
}

export interface Responsibility {
    id: string;
    roleId: string;
    title: string;
    description: string;
    status: ResponsibilityStatus | string;
}

export interface RequestItem {
    id: string;
    responsibilityId: string;
    description: string;
    dueDate: string;
    status: RequestStatus;
}

export interface AppData {
    roles: Role[];
    responsibilities: Responsibility[];
    requests: RequestItem[];
}

export interface GqlConfig {
    endpoint: string;
    authToken: string;
    useMockFallback: boolean;
}

export interface ToastMessage {
    text: string;
    type: "success" | "error";
}

export type ActiveTab = "hierarchy" | "requests";

export type ModalType = "role" | "responsibility" | "request" | "config" | null;

// ==========================================
// DEFAULT DATA & CONFIG
// ==========================================

const DEFAULT_DATA: AppData = {
    roles: [
        {
            id: "role-1",
            title: "Tech Lead for Team A",
            description:
                "Managing engineering deliverables, architectural standards, and technical roadmap for Team A.\n\n### Key Resources\n- [Team Wiki & Docs](https://www.google.com)\n- [Architecture Board Review](https://www.google.com)\n\n| Quarter | Focus Area | Status |\n|---|---|---|\n| Q1 | Core Scalability | In Progress |\n| Q2 | Multi-Region Auth | Planned |",
            status: "OPEN",
            createdAt: "2026-01-10",
        },
        {
            id: "role-2",
            title: "Homeowner",
            description:
                "Maintaining property value, home safety, regular systems maintenance, and improvement projects.\n\n### Useful Links\n- [Home Insurance Portal](https://www.google.com)\n- [Neighborhood HOA Guidelines](https://www.google.com)",
            status: "OPEN",
            createdAt: "2026-02-01",
        },
        {
            id: "role-3",
            title: "Church Deacon",
            description:
                "Serving on community welfare, benevolence fund allocation, and facilities upkeep.\n*(Note: Completed 3-year term in Dec 2025)*",
            status: "CLOSED",
            createdAt: "2023-01-15",
        },
    ],
    responsibilities: [
        {
            id: "resp-1",
            roleId: "role-1",
            title: "Lead for Feature X Development",
            description:
                "Drive end-to-end design, implementation, and deployment of Feature X authentication and scaling microservices.",
            status: "In Progress",
        },
        {
            id: "resp-2",
            roleId: "role-1",
            title: "Team Mentorship & Reviews",
            description: "Conduct weekly 1-on-1s, technical career planning, and code review standard enforcement.",
            status: "Active",
        },
        {
            id: "resp-3",
            roleId: "role-2",
            title: "Monthly Home Maintenance",
            description: "Execute routine preventive maintenance tasks around the house.",
            status: "Active",
        },
        {
            id: "resp-4",
            roleId: "role-3",
            title: "Benevolence Fund Audits",
            description: "Review quarterly financial disbursements and ensure compliance with council bylaws.",
            status: "Completed",
        },
    ],
    requests: [
        {
            id: "req-1",
            responsibilityId: "resp-1",
            description:
                "Complete API Design Document\nDraft the OpenAPI 3.0 specification for Auth endpoints and share with security engineering team for formal review.",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
            status: "Working",
        },
        {
            id: "req-2",
            responsibilityId: "resp-1",
            description:
                "Setup Kubernetes Staging Cluster\nProvision dedicated staging namespace, configure ingress controllers, and run automated smoke tests.",
            dueDate: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
            status: "Ready",
        },
        {
            id: "req-3",
            responsibilityId: "resp-2",
            description:
                "Submit Q2 Performance Review Summaries\nCompile feedback reports and submit them to the HR portal for all 5 direct reports.",
            dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
            status: "Working",
        },
        {
            id: "req-4",
            responsibilityId: "resp-3",
            description:
                "Replace HVAC Air Filters\nChange furnace and AC air filters in basement utility room and attic unit.",
            dueDate: new Date().toISOString().split("T")[0],
            status: "Ready",
        },
        {
            id: "req-5",
            responsibilityId: "resp-4",
            description:
                "Finalize Year-End Financial Audit Report\nSubmit audited statement sheets to the governing board.",
            dueDate: "2025-12-15",
            status: "Complete",
        },
    ],
};

const DEFAULT_GQL_CONFIG: GqlConfig = {
    endpoint: "http://localhost:3000/graphql",
    authToken: "",
    useMockFallback: true,
};

// ==========================================
// MARKDOWN PARSER UTILITY & COMPONENT
// ==========================================

const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({ content, className = "" }) => {
    const parseMarkdown = (rawText: string) => {
        if (!rawText) return null;
        const lines = rawText.split("\n");
        const elements: React.ReactNode[] = [];
        let inTable = false;
        let tableHeaders: string[] = [];
        let tableRows: string[][] = [];

        const flushTable = (key: string) => {
            if (inTable && tableHeaders.length > 0) {
                elements.push(
                    <div key={key} className="overflow-x-auto my-2">
                        <table className="min-w-full divide-y divide-slate-200 border border-slate-200 text-xs rounded-lg overflow-hidden">
                            <thead className="bg-slate-100 font-semibold text-slate-700">
                                <tr>
                                    {tableHeaders.map((h, i) => (
                                        <th
                                            key={i}
                                            className="px-3 py-1.5 text-left border-r border-slate-200 last:border-r-0"
                                        >
                                            {h.trim()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200 text-slate-600">
                                {tableRows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                                        {row.map((cell, cIdx) => (
                                            <td
                                                key={cIdx}
                                                className="px-3 py-1.5 border-r border-slate-200 last:border-r-0"
                                            >
                                                {renderFormattedText(cell.trim())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>,
                );
            }
            inTable = false;
            tableHeaders = [];
            tableRows = [];
        };

        const renderFormattedText = (text: string): React.ReactNode => {
            // Inline Markdown links: [text](url)
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const parts: React.ReactNode[] = [];
            let lastIdx = 0;
            let match: RegExpExecArray | null;

            while ((match = linkRegex.exec(text)) !== null) {
                if (match.index > lastIdx) {
                    parts.push(text.substring(lastIdx, match.index));
                }
                const title = match[1];
                const url = match[2];
                parts.push(
                    <a
                        key={match.index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-0.5 font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title}
                        <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-70" />
                    </a>,
                );
                lastIdx = match.index + match[0].length;
            }
            if (lastIdx < text.length) {
                parts.push(text.substring(lastIdx));
            }

            return parts.map((part, idx) => {
                if (typeof part !== "string") return part;
                // Bold and italic formatting
                const subParts = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
                return subParts.map((sub, sIdx) => {
                    if (sub.startsWith("**") && sub.endsWith("**")) {
                        return (
                            <strong key={sIdx} className="font-semibold text-slate-900">
                                {sub.slice(2, -2)}
                            </strong>
                        );
                    }
                    if (sub.startsWith("*") && sub.endsWith("*")) {
                        return (
                            <em key={sIdx} className="italic text-slate-700">
                                {sub.slice(1, -1)}
                            </em>
                        );
                    }
                    return sub;
                });
            });
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            // Check for table row
            if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
                const cells = trimmed
                    .split("|")
                    .slice(1, -1)
                    .map((c) => c.trim());
                if (cells.every((c) => /^:?-+:?$/.test(c))) {
                    return; // Skip alignment/separator row
                }
                if (!inTable) {
                    inTable = true;
                    tableHeaders = cells;
                } else {
                    tableRows.push(cells);
                }
                return;
            } else if (inTable) {
                flushTable(`table-${index}`);
            }

            // Headings
            if (trimmed.startsWith("### ")) {
                elements.push(
                    <h3 key={index} className="text-xs font-bold text-slate-900 mt-2 mb-1">
                        {renderFormattedText(trimmed.replace("### ", ""))}
                    </h3>,
                );
            } else if (trimmed.startsWith("## ")) {
                elements.push(
                    <h2 key={index} className="text-sm font-bold text-slate-900 mt-3 mb-1">
                        {renderFormattedText(trimmed.replace("## ", ""))}
                    </h2>,
                );
            } else if (trimmed.startsWith("# ")) {
                elements.push(
                    <h1 key={index} className="text-base font-bold text-slate-900 mt-3 mb-1">
                        {renderFormattedText(trimmed.replace("# ", ""))}
                    </h1>,
                );
            } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                elements.push(
                    <li key={index} className="ml-4 list-disc text-slate-600 my-0.5 leading-relaxed">
                        {renderFormattedText(trimmed.substring(2))}
                    </li>,
                );
            } else if (trimmed.length > 0) {
                elements.push(
                    <p key={index} className="my-1 leading-relaxed text-slate-600">
                        {renderFormattedText(line)}
                    </p>,
                );
            }
        });

        if (inTable) {
            flushTable("table-end");
        }

        return elements;
    };

    return <div className={`prose text-xs text-slate-700 max-w-none ${className}`}>{parseMarkdown(content)}</div>;
};

// ==========================================
// URGENCY CALCULATION UTILITY
// ==========================================

function getDueDateStatus(dueDateStr: string, status: RequestStatus) {
    if (status === "Complete") {
        return {
            label: "Complete",
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            dot: "bg-emerald-500",
            urgency: 3,
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueParts = dueDateStr.split("-");
    const due =
        dueParts.length === 3
            ? new Date(parseInt(dueParts[0], 10), parseInt(dueParts[1], 10) - 1, parseInt(dueParts[2], 10))
            : new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            label: `Overdue (${Math.abs(diffDays)}d)`,
            color: "bg-rose-50 text-rose-700 border-rose-200",
            dot: "bg-rose-500 animate-pulse",
            urgency: 0,
        };
    } else if (diffDays <= 3) {
        return {
            label: diffDays === 0 ? "Due Today" : `Due in ${diffDays}d`,
            color: "bg-amber-50 text-amber-700 border-amber-200",
            dot: "bg-amber-500",
            urgency: 1,
        };
    } else {
        return {
            label: `Due ${dueDateStr}`,
            color: "bg-slate-50 text-slate-600 border-slate-200",
            dot: "bg-slate-400",
            urgency: 2,
        };
    }
}

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
    // --- Persistent Application State ---
    const [appData, setAppData] = useState<AppData>(() => {
        try {
            const saved = localStorage.getItem("omnitrack_data_v1");
            return saved ? JSON.parse(saved) : DEFAULT_DATA;
        } catch {
            return DEFAULT_DATA;
        }
    });

    const [gqlConfig, setGqlConfig] = useState<GqlConfig>(() => {
        try {
            const saved = localStorage.getItem("omnitrack_gql_config");
            return saved ? JSON.parse(saved) : DEFAULT_GQL_CONFIG;
        } catch {
            return DEFAULT_GQL_CONFIG;
        }
    });

    // Sync to local storage
    useEffect(() => {
        localStorage.setItem("omnitrack_data_v1", JSON.stringify(appData));
    }, [appData]);

    useEffect(() => {
        localStorage.setItem("omnitrack_gql_config", JSON.stringify(gqlConfig));
    }, [gqlConfig]);

    // --- UI Navigation & Interaction State ---
    const [activeTab, setActiveTab] = useState<ActiveTab>("hierarchy");
    const [expandedRoles, setExpandedRoles] = useState<Set<string>>(() => new Set(["role-1", "role-2"]));
    const [expandedResp, setExpandedResp] = useState<Set<string>>(() => new Set(["resp-1"]));
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    // Filters & Search
    const [hierarchySearch, setHierarchySearch] = useState<string>("");
    const [showClosedRoles, setShowClosedRoles] = useState<boolean>(false);
    const [reqSearch, setReqSearch] = useState<string>("");
    const [reqFilterStatus, setReqFilterStatus] = useState<string>("ALL");
    const [reqFilterRole, setReqFilterRole] = useState<string>("ALL");

    // Menus Dropdown State
    const [newItemMenuOpen, setNewItemMenuOpen] = useState<boolean>(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);

    // Toast State
    const [toast, setToast] = useState<ToastMessage | null>(null);

    // Modal State
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [parentId, setParentId] = useState<string | null>(null);

    // Form State for Modals
    const [roleForm, setRoleForm] = useState<{ title: string; description: string; status: RoleStatus }>({
        title: "",
        description: "",
        status: "OPEN",
    });

    const [respForm, setRespForm] = useState<{ roleId: string; title: string; description: string; status: string }>({
        roleId: "",
        title: "",
        description: "",
        status: "Active",
    });

    const [reqForm, setReqForm] = useState<{
        responsibilityId: string;
        description: string;
        dueDate: string;
        status: RequestStatus;
    }>({
        responsibilityId: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        status: "Ready",
    });

    const [configForm, setConfigForm] = useState<GqlConfig>(gqlConfig);
    const [testResult, setTestResult] = useState<{
        status: "idle" | "loading" | "success" | "amber" | "error";
        message: string;
    }>({
        status: "idle",
        message: "",
    });

    // Autocomplete state for Request Modal parent responsibility selector
    const [respSearchQuery, setRespSearchQuery] = useState<string>("");
    const [respDropdownOpen, setRespDropdownOpen] = useState<boolean>(false);
    const [activeRespIndex, setActiveRespIndex] = useState<number>(-1);

    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ text, type });
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    // Close menus on outside click
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("#new-item-menu-container")) setNewItemMenuOpen(false);
            if (!target.closest("#settings-menu-container")) setSettingsMenuOpen(false);
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    // --- GRAPHQL API & MOCK RESOLVER ---
    const mockGraphQLResolver = useCallback(
        (query: string, variables: Record<string, unknown>) => {
            return new Promise<Record<string, unknown>>((resolve) => {
                setTimeout(() => {
                    if (query.includes("FetchFullData") || query.includes("roles {")) {
                        const mockRoles = appData.roles.map((r) => ({
                            id: r.id,
                            name: r.title,
                            description: r.description,
                            status: r.status,
                            responsibilities: appData.responsibilities
                                .filter((resp) => resp.roleId === r.id)
                                .map((resp) => ({
                                    id: resp.id,
                                    name: resp.title,
                                    description: resp.description,
                                    status: resp.status,
                                    requests: appData.requests
                                        .filter((req) => req.responsibilityId === resp.id)
                                        .map((req) => ({
                                            id: req.id,
                                            description: req.description,
                                            dueDate: req.dueDate,
                                            status: req.status,
                                        })),
                                })),
                        }));
                        resolve({ roles: mockRoles });
                    } else if (query.includes("roleCreate")) {
                        resolve({ roleCreate: { id: "role-" + Date.now() } });
                    } else if (query.includes("responsibilityCreate")) {
                        resolve({ responsibilityCreate: { id: "resp-" + Date.now() } });
                    } else if (query.includes("responsibilityAssociateToRole")) {
                        resolve({ responsibilityAssociateToRole: true });
                    } else if (query.includes("requestCreate")) {
                        resolve({ requestCreate: { id: "req-" + Date.now() } });
                    } else if (query.includes("requestAssociateToResponsibility")) {
                        resolve({ requestAssociateToResponsibility: true });
                    } else {
                        resolve({});
                    }
                }, 150);
            });
        },
        [appData],
    );

    const graphqlQuery = useCallback(
        async (query: string, variables: Record<string, unknown> = {}) => {
            try {
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (gqlConfig.authToken) {
                    headers["Authorization"] = gqlConfig.authToken.startsWith("Bearer ")
                        ? gqlConfig.authToken
                        : `Bearer ${gqlConfig.authToken}`;
                }

                const response = await fetch(gqlConfig.endpoint, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ query, variables }),
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                const result = await response.json();
                if (result.errors) throw new Error(result.errors[0].message);
                return result.data;
            } catch (err: unknown) {
                if (gqlConfig.useMockFallback) {
                    const errMsg = err instanceof Error ? err.message : String(err);
                    console.warn(`GraphQL endpoint unreachable (${errMsg}). Using mock fallback.`);
                    return mockGraphQLResolver(query, variables);
                }
                throw err;
            }
        },
        [gqlConfig, mockGraphQLResolver],
    );

    const fetchDataFromGraphQL = useCallback(
        async (showSuccess = true) => {
            setIsSyncing(true);
            try {
                const fetchQuery = `
          query FetchFullData {
            roles {
              id
              name
              description
              status
              responsibilities {
                id
                name
                description
                status
                requests {
                  id
                  description
                  dueDate
                  status
                }
              }
            }
          }
        `;

                const data = (await graphqlQuery(fetchQuery)) as { roles?: Array<any> };
                if (data && Array.isArray(data.roles)) {
                    const newRoles: Role[] = [];
                    const newResponsibilities: Responsibility[] = [];
                    const newRequests: RequestItem[] = [];

                    data.roles.forEach((roleGql) => {
                        newRoles.push({
                            id: roleGql.id,
                            title: roleGql.name || "Untitled Role",
                            description: roleGql.description || "",
                            status: roleGql.status === "CLOSED" || roleGql.status === "Closed" ? "CLOSED" : "OPEN",
                            createdAt: new Date().toISOString().split("T")[0],
                        });

                        if (Array.isArray(roleGql.responsibilities)) {
                            roleGql.responsibilities.forEach((respGql: any) => {
                                newResponsibilities.push({
                                    id: respGql.id,
                                    roleId: roleGql.id,
                                    title: respGql.name || "Untitled Responsibility",
                                    description: respGql.description || "",
                                    status: respGql.status || "Active",
                                });

                                if (Array.isArray(respGql.requests)) {
                                    respGql.requests.forEach((reqGql: any) => {
                                        newRequests.push({
                                            id: reqGql.id,
                                            responsibilityId: respGql.id,
                                            description: reqGql.description || "Untitled Request",
                                            dueDate: reqGql.dueDate || new Date().toISOString().split("T")[0],
                                            status: reqGql.status || "Ready",
                                        });
                                    });
                                }
                            });
                        }
                    });

                    setAppData({
                        roles: newRoles,
                        responsibilities: newResponsibilities,
                        requests: newRequests,
                    });

                    if (showSuccess) showToast("Data synced with GraphQL backend");
                }
            } catch (err: unknown) {
                const errMsg = err instanceof Error ? err.message : String(err);
                showToast(`Sync failed: ${errMsg}`, "error");
            } finally {
                setTimeout(() => setIsSyncing(false), 600);
            }
        },
        [graphqlQuery, showToast],
    );

    // --- MODAL HANDLERS ---
    const openModal = (type: ModalType, id: string | null = null, pId: string | null = null) => {
        setActiveModal(type);
        setEditingId(id);
        setParentId(pId);

        if (type === "role") {
            const existing = id ? appData.roles.find((r) => r.id === id) : null;
            setRoleForm({
                title: existing ? existing.title : "",
                description: existing ? existing.description : "",
                status: existing ? existing.status : "OPEN",
            });
        } else if (type === "responsibility") {
            const existing = id ? appData.responsibilities.find((r) => r.id === id) : null;
            const targetRoleId = existing ? existing.roleId : pId || appData.roles[0]?.id || "";
            setRespForm({
                roleId: targetRoleId,
                title: existing ? existing.title : "",
                description: existing ? existing.description : "",
                status: existing ? existing.status : "Active",
            });
        } else if (type === "request") {
            const existing = id ? appData.requests.find((r) => r.id === id) : null;
            const targetRespId = existing ? existing.responsibilityId : pId || appData.responsibilities[0]?.id || "";
            setReqForm({
                responsibilityId: targetRespId,
                description: existing ? existing.description : "",
                dueDate: existing ? existing.dueDate : new Date().toISOString().split("T")[0],
                status: existing ? existing.status : "Ready",
            });

            // Set up search query for autocomplete
            if (targetRespId) {
                const respObj = appData.responsibilities.find((r) => r.id === targetRespId);
                if (respObj) {
                    const roleObj = appData.roles.find((ro) => ro.id === respObj.roleId);
                    setRespSearchQuery(`${roleObj ? roleObj.title + " › " : ""}${respObj.title}`);
                } else {
                    setRespSearchQuery("");
                }
            } else {
                setRespSearchQuery("");
            }
            setRespDropdownOpen(false);
        } else if (type === "config") {
            setConfigForm({ ...gqlConfig });
            setTestResult({ status: "idle", message: "" });
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setEditingId(null);
        setParentId(null);
    };

    // --- ACTIONS & CRUD MUTATIONS ---
    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            setAppData((prev) => ({
                ...prev,
                roles: prev.roles.map((r) => (r.id === editingId ? { ...r, ...roleForm } : r)),
            }));
            showToast("Role updated successfully");
        } else {
            const gqlMutation = `
        mutation RoleCreate($name: String, $description: String) {
          roleCreate(name: $name, description: $description) { id }
        }
      `;
            const res = (await graphqlQuery(gqlMutation, {
                name: roleForm.title,
                description: roleForm.description,
            })) as any;
            const newId = res?.roleCreate?.id || "role-" + Date.now();

            const newRole: Role = {
                id: newId,
                title: roleForm.title,
                description: roleForm.description,
                status: roleForm.status,
                createdAt: new Date().toISOString().split("T")[0],
            };

            setAppData((prev) => ({ ...prev, roles: [...prev.roles, newRole] }));
            setExpandedRoles((prev) => new Set(prev).add(newId));
            showToast("Role saved successfully");
        }
        closeModal();
    };

    const toggleRoleStatus = (id: string) => {
        setAppData((prev) => ({
            ...prev,
            roles: prev.roles.map((r) => {
                if (r.id === id) {
                    const newStatus: RoleStatus = r.status === "OPEN" ? "CLOSED" : "OPEN";
                    showToast(`Role status changed to ${newStatus}`);
                    return { ...r, status: newStatus };
                }
                return r;
            }),
        }));
    };

    const deleteRole = (id: string) => {
        if (window.confirm("Are you sure you want to delete this role and all nested responsibilities and requests?")) {
            setAppData((prev) => {
                const respIdsToDelete = prev.responsibilities.filter((r) => r.roleId === id).map((r) => r.id);
                return {
                    roles: prev.roles.filter((r) => r.id !== id),
                    responsibilities: prev.responsibilities.filter((r) => r.roleId !== id),
                    requests: prev.requests.filter((req) => !respIdsToDelete.includes(req.responsibilityId)),
                };
            });
            showToast("Role deleted successfully");
        }
    };

    const handleSaveResponsibility = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            setAppData((prev) => ({
                ...prev,
                responsibilities: prev.responsibilities.map((r) => (r.id === editingId ? { ...r, ...respForm } : r)),
            }));
            showToast("Responsibility updated successfully");
        } else {
            const createRespMutation = `
        mutation ResponsibilityCreate($name: String, $description: String) {
          responsibilityCreate(name: $name, description: $description) { id }
        }
      `;
            const respData = (await graphqlQuery(createRespMutation, {
                name: respForm.title,
                description: respForm.description,
            })) as any;
            const respId = respData?.responsibilityCreate?.id || "resp-" + Date.now();

            const associateMutation = `
        mutation ResponsibilityAssociateToRole($roleId: String, $responsibilityId: String) {
          responsibilityAssociateToRole(roleId: $roleId, responsibilityId: $responsibilityId)
        }
      `;
            await graphqlQuery(associateMutation, { roleId: respForm.roleId, responsibilityId: respId });

            const newResp: Responsibility = {
                id: respId,
                roleId: respForm.roleId,
                title: respForm.title,
                description: respForm.description,
                status: respForm.status,
            };

            setAppData((prev) => ({ ...prev, responsibilities: [...prev.responsibilities, newResp] }));
            setExpandedRoles((prev) => new Set(prev).add(respForm.roleId));
            setExpandedResp((prev) => new Set(prev).add(respId));
            showToast("Responsibility created & linked");
        }
        closeModal();
    };

    const deleteResponsibility = (id: string) => {
        if (window.confirm("Are you sure you want to delete this responsibility and its associated requests?")) {
            setAppData((prev) => ({
                ...prev,
                responsibilities: prev.responsibilities.filter((r) => r.id !== id),
                requests: prev.requests.filter((req) => req.responsibilityId !== id),
            }));
            showToast("Responsibility deleted successfully");
        }
    };

    const handleSaveRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reqForm.responsibilityId) {
            alert("Please select a parent responsibility.");
            return;
        }

        if (editingId) {
            setAppData((prev) => ({
                ...prev,
                requests: prev.requests.map((r) => (r.id === editingId ? { ...r, ...reqForm } : r)),
            }));
            showToast("Request updated successfully");
        } else {
            const createReqMutation = `
        mutation RequestCreate($dueDate: String, $description: String) {
          requestCreate(dueDate: $dueDate, description: $description) { id }
        }
      `;
            const reqData = (await graphqlQuery(createReqMutation, {
                dueDate: reqForm.dueDate,
                description: reqForm.description,
            })) as any;
            const reqId = reqData?.requestCreate?.id || "req-" + Date.now();

            const associateReqMutation = `
        mutation RequestAssociateToResponsibility($responsibilityId: String, $requestId: String) {
          requestAssociateToResponsibility(responsibilityId: $responsibilityId, requestId: $requestId)
        }
      `;
            await graphqlQuery(associateReqMutation, { responsibilityId: reqForm.responsibilityId, requestId: reqId });

            const newReq: RequestItem = {
                id: reqId,
                responsibilityId: reqForm.responsibilityId,
                description: reqForm.description,
                dueDate: reqForm.dueDate,
                status: reqForm.status,
            };

            setAppData((prev) => ({ ...prev, requests: [...prev.requests, newReq] }));
            setExpandedResp((prev) => new Set(prev).add(reqForm.responsibilityId));
            showToast("Request created & linked");
        }
        closeModal();
    };

    const updateRequestStatus = (id: string, newStatus: RequestStatus) => {
        setAppData((prev) => ({
            ...prev,
            requests: prev.requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
        }));
        showToast(`Request status updated to ${newStatus}`);
    };

    const deleteRequest = (id: string) => {
        if (window.confirm("Are you sure you want to delete this request?")) {
            setAppData((prev) => ({
                ...prev,
                requests: prev.requests.filter((r) => r.id !== id),
            }));
            showToast("Request deleted successfully");
        }
    };

    const resetData = () => {
        if (window.confirm("Reset application data back to default sample roles and requests?")) {
            setAppData(DEFAULT_DATA);
            setExpandedRoles(new Set(["role-1", "role-2"]));
            setExpandedResp(new Set(["resp-1"]));
            showToast("Data reset to defaults successfully");
        }
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `omnitrack_backup_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Data exported successfully");
    };

    // --- CONNECTION TESTER ---
    const testGqlConnection = async () => {
        setTestResult({ status: "loading", message: "Testing GraphQL Endpoint..." });
        try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (configForm.authToken) {
                headers["Authorization"] = configForm.authToken.startsWith("Bearer ")
                    ? configForm.authToken
                    : `Bearer ${configForm.authToken}`;
            }

            const response = await fetch(configForm.endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify({ query: "{ roles { id } }" }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.errors) {
                    setTestResult({
                        status: "amber",
                        message: `Server reached, but GraphQL returned error: ${result.errors[0].message}`,
                    });
                } else {
                    setTestResult({
                        status: "success",
                        message: "Connection successful! Server CORS and headers verified.",
                    });
                }
            } else {
                setTestResult({
                    status: "amber",
                    message: `Server responded with HTTP status ${response.status}`,
                });
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            setTestResult({
                status: "error",
                message: `Connection failed (${errMsg}). Verify server and CORS policies.`,
            });
        }
    };

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        setGqlConfig(configForm);
        showToast("GraphQL settings saved successfully");
        closeModal();
        fetchDataFromGraphQL();
    };

    // --- HIERARCHY FILTER COMPUTATIONS ---
    const filteredRoles = useMemo(() => {
        let list = appData.roles;
        if (!showClosedRoles) {
            list = list.filter((r) => r.status === "OPEN");
        }

        const query = hierarchySearch.toLowerCase().trim();
        if (!query) return list;

        return list.filter((role) => {
            const roleResps = appData.responsibilities.filter((resp) => resp.roleId === role.id);
            const roleReqs = appData.requests.filter((req) =>
                roleResps.some((resp) => resp.id === req.responsibilityId),
            );

            return (
                role.title.toLowerCase().includes(query) ||
                role.description.toLowerCase().includes(query) ||
                roleResps.some(
                    (resp) =>
                        resp.title.toLowerCase().includes(query) || resp.description.toLowerCase().includes(query),
                ) ||
                roleReqs.some((req) => req.description.toLowerCase().includes(query))
            );
        });
    }, [appData, showClosedRoles, hierarchySearch]);

    const expandAllHierarchy = (expand: boolean) => {
        if (expand) {
            setExpandedRoles(new Set(appData.roles.map((r) => r.id)));
            setExpandedResp(new Set(appData.responsibilities.map((r) => r.id)));
        } else {
            setExpandedRoles(new Set());
            setExpandedResp(new Set());
        }
    };

    // --- MASTER REQUEST LIST COMPUTATIONS ---
    const masterRequests = useMemo(() => {
        let list: Array<{ req: RequestItem; resp: Responsibility; role: Role }> = [];

        appData.requests.forEach((req) => {
            const resp = appData.responsibilities.find((r) => r.id === req.responsibilityId);
            if (!resp) return;
            const role = appData.roles.find((r) => r.id === resp.roleId);
            if (!role) return;

            list.push({ req, resp, role });
        });

        const query = reqSearch.toLowerCase().trim();
        list = list.filter(({ req, resp, role }) => {
            if (reqFilterStatus !== "ALL" && req.status !== reqFilterStatus) return false;
            if (reqFilterRole !== "ALL" && role.id !== reqFilterRole) return false;
            if (
                query &&
                !req.description.toLowerCase().includes(query) &&
                !resp.title.toLowerCase().includes(query) &&
                !role.title.toLowerCase().includes(query)
            ) {
                return false;
            }
            return true;
        });

        list.sort((a, b) => {
            const statA = getDueDateStatus(a.req.dueDate, a.req.status);
            const statB = getDueDateStatus(b.req.dueDate, b.req.status);

            if (statA.urgency !== statB.urgency) {
                return statA.urgency - statB.urgency;
            }
            return new Date(a.req.dueDate).getTime() - new Date(b.req.dueDate).getTime();
        });

        return list;
    }, [appData, reqSearch, reqFilterStatus, reqFilterRole]);

    // Combined Options for Responsibility Combobox
    const respComboboxOptions = useMemo(() => {
        const q = respSearchQuery.toLowerCase().trim();
        const options: Array<{ id: string; label: string; respTitle: string; roleTitle: string }> = [];

        appData.roles.forEach((role) => {
            const resps = appData.responsibilities.filter((r) => r.roleId === role.id);
            resps.forEach((resp) => {
                const matches = !q || resp.title.toLowerCase().includes(q) || role.title.toLowerCase().includes(q);
                if (matches) {
                    options.push({
                        id: resp.id,
                        label: `${role.title} › ${resp.title}`,
                        respTitle: resp.title,
                        roleTitle: role.title,
                    });
                }
            });
        });

        return options;
    }, [appData, respSearchQuery]);

    return (
        <div className="h-full flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-indigo-500 selection:text-white min-h-screen">
            {/* HEADER BAR */}
            <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg flex items-center justify-center">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                OmniTrack
                                <span className="text-xs font-semibold uppercase bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                    3-Tier System
                                </span>
                            </h1>
                            <p className="text-xs text-slate-400">Roles → Responsibilities → Requests</p>
                        </div>
                    </div>

                    {/* Action Buttons & Tab Selector */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
                            <button
                                onClick={() => setActiveTab("hierarchy")}
                                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                                    activeTab === "hierarchy"
                                        ? "bg-indigo-600 text-white shadow"
                                        : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <FolderTree className="w-4 h-4" /> Roles Hierarchy
                            </button>
                            <button
                                onClick={() => setActiveTab("requests")}
                                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                                    activeTab === "requests"
                                        ? "bg-indigo-600 text-white shadow"
                                        : "text-slate-300 hover:text-white"
                                }`}
                            >
                                <CheckSquare className="w-4 h-4" /> Master Requests
                            </button>
                        </div>

                        {/* Sync Button */}
                        <button
                            onClick={() => fetchDataFromGraphQL(true)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold p-2 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
                            title="Refresh Data from GraphQL"
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-indigo-400" : ""}`} />
                            <span className="hidden md:inline">Sync</span>
                        </button>

                        {/* Global Add Menu Dropdown */}
                        <div className="relative" id="new-item-menu-container">
                            <button
                                onClick={() => setNewItemMenuOpen((prev) => !prev)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> New Item
                                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                            </button>

                            {newItemMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-slate-700 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => {
                                            setNewItemMenuOpen(false);
                                            openModal("role");
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 font-medium"
                                    >
                                        <FolderPlus className="w-3.5 h-3.5" /> New Role
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewItemMenuOpen(false);
                                            openModal("responsibility");
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 font-medium"
                                    >
                                        <GitCommit className="w-3.5 h-3.5" /> New Responsibility
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewItemMenuOpen(false);
                                            openModal("request");
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 font-medium"
                                    >
                                        <CheckSquare className="w-3.5 h-3.5" /> New Request
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Settings Dropdown */}
                        <div className="relative" id="settings-menu-container">
                            <button
                                onClick={() => setSettingsMenuOpen((prev) => !prev)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold p-2 rounded-xl border border-slate-700 transition-all flex items-center justify-center"
                                title="Settings & Data"
                            >
                                <Settings className="w-4 h-4" />
                            </button>

                            {settingsMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-slate-700 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => {
                                            setSettingsMenuOpen(false);
                                            openModal("config");
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 font-medium"
                                    >
                                        <Server className="w-3.5 h-3.5 text-indigo-500" /> Configure GraphQL API
                                    </button>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setSettingsMenuOpen(false);
                                            resetData();
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 font-medium"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" /> Reset Sample Data
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSettingsMenuOpen(false);
                                            exportData();
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Export JSON
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
                {/* TAB 1: ROLES HIERARCHY */}
                {activeTab === "hierarchy" && (
                    <div className="space-y-6">
                        {/* Filter Bar */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-80">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        value={hierarchySearch}
                                        onChange={(e) => setHierarchySearch(e.target.value)}
                                        placeholder="Search roles, responsibilities, requests..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={showClosedRoles}
                                        onChange={(e) => setShowClosedRoles(e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    />
                                    Show Closed Roles
                                </label>
                                <button
                                    onClick={() => expandAllHierarchy(true)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                                >
                                    Expand All
                                </button>
                                <button
                                    onClick={() => expandAllHierarchy(false)}
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                >
                                    Collapse All
                                </button>
                            </div>
                        </div>

                        {/* Roles Container */}
                        <div className="space-y-4">
                            {filteredRoles.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                    <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-sm font-semibold text-slate-700">No roles found</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Create a new role or toggle "Show Closed Roles" to see archived items.
                                    </p>
                                </div>
                            ) : (
                                filteredRoles.map((role) => {
                                    const isExpanded = expandedRoles.has(role.id);
                                    const roleResps = appData.responsibilities.filter(
                                        (resp) => resp.roleId === role.id,
                                    );

                                    return (
                                        <div
                                            key={role.id}
                                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all"
                                        >
                                            {/* Role Header */}
                                            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer select-none flex-1"
                                                    onClick={() => {
                                                        setExpandedRoles((prev) => {
                                                            const next = new Set(prev);
                                                            next.has(role.id)
                                                                ? next.delete(role.id)
                                                                : next.add(role.id);
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    <button className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-all shrink-0">
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h2 className="text-sm sm:text-base font-bold tracking-tight">
                                                                {role.title}
                                                            </h2>
                                                            <span
                                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                                                                    role.status === "OPEN"
                                                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                                        : "bg-slate-700 text-slate-400 border border-slate-600"
                                                                }`}
                                                            >
                                                                {role.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            Created: {role.createdAt} • {roleResps.length}{" "}
                                                            Responsibilities
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5 self-end sm:self-center">
                                                    <button
                                                        onClick={() => openModal("responsibility", null, role.id)}
                                                        title="Add Responsibility"
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all shadow-sm"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />{" "}
                                                        <span className="hidden sm:inline">Add Resp</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openModal("role", role.id)}
                                                        title="Edit Role"
                                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-all border border-slate-700"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRoleStatus(role.id)}
                                                        title={role.status === "OPEN" ? "Close Role" : "Reopen Role"}
                                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-all border border-slate-700"
                                                    >
                                                        {role.status === "OPEN" ? (
                                                            <Archive className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteRole(role.id)}
                                                        title="Delete Role"
                                                        className="bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 p-2 rounded-xl transition-all border border-slate-700"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Role Body (Collapsible) */}
                                            {isExpanded && (
                                                <div className="p-4 sm:p-6 space-y-6 bg-slate-50/50">
                                                    {/* Markdown Description */}
                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                        <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                                                            <FileText className="w-3.5 h-3.5" /> Role Description &
                                                            Resources
                                                        </div>
                                                        <MarkdownRenderer content={role.description} />
                                                    </div>

                                                    {/* Responsibilities List */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                            <GitCommit className="w-3.5 h-3.5 text-indigo-600" />{" "}
                                                            Responsibilities ({roleResps.length})
                                                        </h4>

                                                        {roleResps.length === 0 ? (
                                                            <div className="bg-white rounded-xl p-6 text-center border border-dashed border-slate-300">
                                                                <p className="text-xs text-slate-500">
                                                                    No responsibilities added to this role yet.
                                                                </p>
                                                                <button
                                                                    onClick={() =>
                                                                        openModal("responsibility", null, role.id)
                                                                    }
                                                                    className="mt-2 text-indigo-600 font-semibold hover:underline text-xs inline-flex items-center gap-1"
                                                                >
                                                                    <Plus className="w-3 h-3" /> Add first
                                                                    responsibility
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            roleResps.map((resp) => {
                                                                const isRespExpanded = expandedResp.has(resp.id);
                                                                const respRequests = appData.requests.filter(
                                                                    (req) => req.responsibilityId === resp.id,
                                                                );

                                                                return (
                                                                    <div
                                                                        key={resp.id}
                                                                        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ml-0 sm:ml-4"
                                                                    >
                                                                        {/* Responsibility Bar */}
                                                                        <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                                            <div
                                                                                className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                                                                                onClick={() => {
                                                                                    setExpandedResp((prev) => {
                                                                                        const next = new Set(prev);
                                                                                        next.has(resp.id)
                                                                                            ? next.delete(resp.id)
                                                                                            : next.add(resp.id);
                                                                                        return next;
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <button className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-300 shadow-sm shrink-0">
                                                                                    {isRespExpanded ? (
                                                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                                                    ) : (
                                                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                                                    )}
                                                                                </button>
                                                                                <div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <h5 className="text-xs sm:text-sm font-semibold text-slate-800">
                                                                                            {resp.title}
                                                                                        </h5>
                                                                                        <span
                                                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                                                                resp.status ===
                                                                                                "Completed"
                                                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                                                    : resp.status ===
                                                                                                        "In Progress"
                                                                                                      ? "bg-amber-100 text-amber-800"
                                                                                                      : "bg-slate-200 text-slate-700"
                                                                                            }`}
                                                                                        >
                                                                                            {resp.status}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className="text-[11px] text-slate-500">
                                                                                        {respRequests.length} Requests
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Responsibility Actions */}
                                                                            <div className="flex items-center gap-1 self-end sm:self-center">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        openModal(
                                                                                            "request",
                                                                                            null,
                                                                                            resp.id,
                                                                                        )
                                                                                    }
                                                                                    title="Add Request"
                                                                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm"
                                                                                >
                                                                                    <Plus className="w-3 h-3" /> Add
                                                                                    Request
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        openModal(
                                                                                            "responsibility",
                                                                                            resp.id,
                                                                                        )
                                                                                    }
                                                                                    title="Edit Responsibility"
                                                                                    className="bg-white hover:bg-slate-50 text-slate-600 p-1.5 rounded-lg border border-slate-200"
                                                                                >
                                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        deleteResponsibility(resp.id)
                                                                                    }
                                                                                    title="Delete Responsibility"
                                                                                    className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 p-1.5 rounded-lg border border-slate-200"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Responsibility Body */}
                                                                        {isRespExpanded && (
                                                                            <div className="p-4 space-y-4 bg-white">
                                                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                                    <MarkdownRenderer
                                                                                        content={resp.description}
                                                                                    />
                                                                                </div>

                                                                                {/* Nested Requests */}
                                                                                <div className="space-y-2">
                                                                                    <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                                                        Requests
                                                                                    </h6>

                                                                                    {respRequests.length === 0 ? (
                                                                                        <p className="text-xs text-slate-400 italic py-1">
                                                                                            No requests created yet.
                                                                                        </p>
                                                                                    ) : (
                                                                                        respRequests.map((req) => {
                                                                                            const lines =
                                                                                                req.description.split(
                                                                                                    "\n",
                                                                                                );
                                                                                            const reqTitle =
                                                                                                lines[0] ||
                                                                                                "Untitled Request";
                                                                                            const reqBodyMarkdown =
                                                                                                lines
                                                                                                    .slice(1)
                                                                                                    .join("\n");
                                                                                            const dueStatus =
                                                                                                getDueDateStatus(
                                                                                                    req.dueDate,
                                                                                                    req.status,
                                                                                                );

                                                                                            return (
                                                                                                <div
                                                                                                    key={req.id}
                                                                                                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                                                                                                >
                                                                                                    <div className="space-y-1 flex-1">
                                                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                                                            <span className="font-semibold text-xs text-slate-800">
                                                                                                                {
                                                                                                                    reqTitle
                                                                                                                }
                                                                                                            </span>
                                                                                                            <span
                                                                                                                className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${dueStatus.color}`}
                                                                                                            >
                                                                                                                <span
                                                                                                                    className={`w-1.5 h-1.5 rounded-full ${dueStatus.dot}`}
                                                                                                                ></span>
                                                                                                                {
                                                                                                                    dueStatus.label
                                                                                                                }
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        {reqBodyMarkdown && (
                                                                                                            <div className="line-clamp-2 text-[11px]">
                                                                                                                <MarkdownRenderer
                                                                                                                    content={
                                                                                                                        reqBodyMarkdown
                                                                                                                    }
                                                                                                                />
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>

                                                                                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                                                                                        <select
                                                                                                            value={
                                                                                                                req.status
                                                                                                            }
                                                                                                            onChange={(
                                                                                                                e,
                                                                                                            ) =>
                                                                                                                updateRequestStatus(
                                                                                                                    req.id,
                                                                                                                    e
                                                                                                                        .target
                                                                                                                        .value as RequestStatus,
                                                                                                                )
                                                                                                            }
                                                                                                            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                                                        >
                                                                                                            <option value="Ready">
                                                                                                                Ready
                                                                                                            </option>
                                                                                                            <option value="Working">
                                                                                                                Working
                                                                                                            </option>
                                                                                                            <option value="Complete">
                                                                                                                Complete
                                                                                                            </option>
                                                                                                        </select>
                                                                                                        <button
                                                                                                            onClick={() =>
                                                                                                                openModal(
                                                                                                                    "request",
                                                                                                                    req.id,
                                                                                                                )
                                                                                                            }
                                                                                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                                                                            title="Edit Request"
                                                                                                        >
                                                                                                            <Edit3 className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() =>
                                                                                                                deleteRequest(
                                                                                                                    req.id,
                                                                                                                )
                                                                                                            }
                                                                                                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                                                            title="Delete Request"
                                                                                                        >
                                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: MASTER REQUEST LIST */}
                {activeTab === "requests" && (
                    <div className="space-y-6">
                        {/* Header / Filter Toolbar */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        value={reqSearch}
                                        onChange={(e) => setReqSearch(e.target.value)}
                                        placeholder="Search request content..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <select
                                    value={reqFilterStatus}
                                    onChange={(e) => setReqFilterStatus(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Working">Working</option>
                                    <option value="Complete">Complete</option>
                                </select>
                                <select
                                    value={reqFilterRole}
                                    onChange={(e) => setReqFilterRole(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="ALL">All Roles</option>
                                    {appData.roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Legend */}
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Overdue
                                </span>
                                <span className="flex items-center gap-1 ml-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Due
                                    Soon (&le;3d)
                                </span>
                                <span className="flex items-center gap-1 ml-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> On
                                    Track
                                </span>
                            </div>
                        </div>

                        {/* Master Table / Card List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {masterRequests.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <h3 className="text-sm font-semibold text-slate-700">
                                            No requests match criteria
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Try adjusting your filters or search query.
                                        </p>
                                    </div>
                                ) : (
                                    masterRequests.map(({ req, resp, role }) => {
                                        const lines = req.description.split("\n");
                                        const reqTitle = lines[0] || "Untitled Request";
                                        const reqBody = lines.slice(1).join("\n");
                                        const dueStatus = getDueDateStatus(req.dueDate, req.status);

                                        return (
                                            <div
                                                key={req.id}
                                                className="p-4 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                            >
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {reqTitle}
                                                        </span>
                                                        <span
                                                            className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${dueStatus.color}`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${dueStatus.dot}`}
                                                            ></span>
                                                            {dueStatus.label}
                                                        </span>
                                                    </div>
                                                    {reqBody && (
                                                        <div className="line-clamp-1 text-[11px]">
                                                            <MarkdownRenderer content={reqBody} />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                                                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                            {role.title}
                                                        </span>
                                                        <span>›</span>
                                                        <span className="text-slate-600">{resp.title}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 self-end md:self-center">
                                                    <select
                                                        value={req.status}
                                                        onChange={(e) =>
                                                            updateRequestStatus(req.id, e.target.value as RequestStatus)
                                                        }
                                                        className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium"
                                                    >
                                                        <option value="Ready">Ready</option>
                                                        <option value="Working">Working</option>
                                                        <option value="Complete">Complete</option>
                                                    </select>
                                                    <button
                                                        onClick={() => openModal("request", req.id)}
                                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 bg-white"
                                                        title="Edit Request"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteRequest(req.id)}
                                                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 bg-white"
                                                        title="Delete Request"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* TOAST POPUP NOTIFICATION */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-800 text-xs font-medium">
                    {toast.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{toast.text}</span>
                </div>
            )}

            {/* MODAL DIALOG CONTAINER */}
            {activeModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-sm">
                                {activeModal === "role" && (editingId ? "Edit Role" : "Create New Role")}
                                {activeModal === "responsibility" &&
                                    (editingId ? "Edit Responsibility" : "Create New Responsibility")}
                                {activeModal === "request" && (editingId ? "Edit Request" : "Create New Request")}
                                {activeModal === "config" && "Configure GraphQL API"}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Content / Forms */}
                        <div className="p-6 overflow-y-auto space-y-4 text-xs">
                            {/* ROLE FORM */}
                            {activeModal === "role" && (
                                <form onSubmit={handleSaveRole} className="space-y-4">
                                    {editingId && (
                                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                                Role ID
                                            </span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                                {editingId}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={roleForm.title}
                                            onChange={(e) => setRoleForm({ ...roleForm, title: e.target.value })}
                                            placeholder="e.g. Tech Lead for Team A"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Description (Markdown Supported: Tables, Links, Lists)
                                        </label>
                                        <textarea
                                            rows={6}
                                            value={roleForm.description}
                                            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                            placeholder="## Overview&#10;Describe main scope..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    {editingId && (
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Status</label>
                                            <select
                                                value={roleForm.status}
                                                onChange={(e) =>
                                                    setRoleForm({ ...roleForm, status: e.target.value as RoleStatus })
                                                }
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                                            >
                                                <option value="OPEN">OPEN</option>
                                                <option value="CLOSED">CLOSED</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                                        >
                                            Save Role
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* RESPONSIBILITY FORM */}
                            {activeModal === "responsibility" && (
                                <form onSubmit={handleSaveResponsibility} className="space-y-4">
                                    {editingId && (
                                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                                Responsibility ID
                                            </span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                                {editingId}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Parent Role</label>
                                        <select
                                            value={respForm.roleId}
                                            onChange={(e) => setRespForm({ ...respForm, roleId: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                                        >
                                            {appData.roles.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Responsibility Title
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={respForm.title}
                                            onChange={(e) => setRespForm({ ...respForm, title: e.target.value })}
                                            placeholder="e.g. Lead for Feature X Development"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Description (Markdown Supported)
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={respForm.description}
                                            onChange={(e) => setRespForm({ ...respForm, description: e.target.value })}
                                            placeholder="Describe the overall scope and goals..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Status</label>
                                        <select
                                            value={respForm.status}
                                            onChange={(e) => setRespForm({ ...respForm, status: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                                        >
                                            Save Responsibility
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* REQUEST FORM */}
                            {activeModal === "request" && (
                                <form onSubmit={handleSaveRequest} className="space-y-4">
                                    {editingId && (
                                        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                                                Request ID
                                            </span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 select-all font-bold text-indigo-600">
                                                {editingId}
                                            </span>
                                        </div>
                                    )}

                                    {/* Combobox Search Selector */}
                                    <div className="relative">
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Parent Responsibility
                                        </label>
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                            <input
                                                type="text"
                                                value={respSearchQuery}
                                                onChange={(e) => {
                                                    setRespSearchQuery(e.target.value);
                                                    setRespDropdownOpen(true);
                                                }}
                                                onFocus={() => setRespDropdownOpen(true)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        setRespDropdownOpen(true);
                                                        setActiveRespIndex(
                                                            (prev) =>
                                                                (prev + 1) % Math.max(1, respComboboxOptions.length),
                                                        );
                                                    } else if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        setActiveRespIndex(
                                                            (prev) =>
                                                                (prev - 1 + respComboboxOptions.length) %
                                                                Math.max(1, respComboboxOptions.length),
                                                        );
                                                    } else if (
                                                        e.key === "Enter" &&
                                                        activeRespIndex >= 0 &&
                                                        activeRespIndex < respComboboxOptions.length
                                                    ) {
                                                        e.preventDefault();
                                                        const chosen = respComboboxOptions[activeRespIndex];
                                                        setReqForm({ ...reqForm, responsibilityId: chosen.id });
                                                        setRespSearchQuery(chosen.label);
                                                        setRespDropdownOpen(false);
                                                    } else if (e.key === "Escape") {
                                                        setRespDropdownOpen(false);
                                                    }
                                                }}
                                                placeholder="Search responsibility or role (Use ↑ ↓ arrows)..."
                                                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRespSearchQuery("");
                                                    setReqForm({ ...reqForm, responsibilityId: "" });
                                                    setRespDropdownOpen(true);
                                                }}
                                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {respDropdownOpen && (
                                            <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                                                {respComboboxOptions.length === 0 ? (
                                                    <div className="p-3 text-xs text-slate-400 text-center select-none">
                                                        No matching responsibilities found
                                                    </div>
                                                ) : (
                                                    respComboboxOptions.map((opt, idx) => {
                                                        const isSelected = opt.id === reqForm.responsibilityId;
                                                        const isHighlighted = idx === activeRespIndex;

                                                        return (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setReqForm({
                                                                        ...reqForm,
                                                                        responsibilityId: opt.id,
                                                                    });
                                                                    setRespSearchQuery(opt.label);
                                                                    setRespDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                                                                    isHighlighted
                                                                        ? "bg-indigo-100 text-indigo-700"
                                                                        : isSelected
                                                                          ? "bg-indigo-50/70 text-indigo-600 font-medium"
                                                                          : "hover:bg-indigo-50 hover:text-indigo-600 text-slate-700"
                                                                }`}
                                                            >
                                                                <div>
                                                                    <span className="block font-semibold">
                                                                        {opt.respTitle}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400">
                                                                        {opt.roleTitle}
                                                                    </span>
                                                                </div>
                                                                {isSelected && (
                                                                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Description (First line acts as Title, Markdown supported)
                                        </label>
                                        <textarea
                                            rows={5}
                                            required
                                            value={reqForm.description}
                                            onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                                            placeholder="API Specification Review&#10;Draft OpenAPI 3.0 specification file for Auth endpoints..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={reqForm.dueDate}
                                                onChange={(e) => setReqForm({ ...reqForm, dueDate: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Status</label>
                                            <select
                                                value={reqForm.status}
                                                onChange={(e) =>
                                                    setReqForm({ ...reqForm, status: e.target.value as RequestStatus })
                                                }
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs"
                                            >
                                                <option value="Ready">Ready</option>
                                                <option value="Working">Working</option>
                                                <option value="Complete">Complete</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                                        >
                                            Save Request
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* GRAPHQL CONFIG FORM */}
                            {activeModal === "config" && (
                                <form onSubmit={handleSaveConfig} className="space-y-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            GraphQL Endpoint URL
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={configForm.endpoint}
                                            onChange={(e) => setConfigForm({ ...configForm, endpoint: e.target.value })}
                                            placeholder="http://localhost:3000/graphql"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Target server endpoint processing GraphQL POST queries and mutations.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Authorization Token (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={configForm.authToken}
                                            onChange={(e) =>
                                                setConfigForm({ ...configForm, authToken: e.target.value })
                                            }
                                            placeholder="e.g. Bearer eyJhbGciOi..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-[11px] text-slate-600 space-y-1">
                                        <span className="font-semibold text-indigo-900 flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> CORS & Server Header
                                            Specs:
                                        </span>
                                        <p className="text-slate-500">
                                            Allowed Origins:{" "}
                                            <code className="bg-indigo-100/70 text-indigo-800 px-1 py-0.5 rounded">
                                                https://gemini.google.com
                                            </code>
                                            ,{" "}
                                            <code className="bg-indigo-100/70 text-indigo-800 px-1 py-0.5 rounded">
                                                http://localhost:3000
                                            </code>
                                        </p>
                                        <p className="text-slate-500">
                                            Methods:{" "}
                                            <code className="bg-slate-200/70 text-slate-700 px-1 py-0.5 rounded">
                                                POST
                                            </code>
                                            ,{" "}
                                            <code className="bg-slate-200/70 text-slate-700 px-1 py-0.5 rounded">
                                                OPTIONS
                                            </code>
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={configForm.useMockFallback}
                                                onChange={(e) =>
                                                    setConfigForm({ ...configForm, useMockFallback: e.target.checked })
                                                }
                                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                            />
                                            <span className="font-semibold text-slate-700">
                                                Enable local mock fallback if connection fails
                                            </span>
                                        </label>
                                        <p className="text-[10px] text-slate-500 mt-1 pl-6">
                                            Allows offline simulation or local testing when backend isn't reachable.
                                        </p>
                                    </div>

                                    {testResult.status !== "idle" && (
                                        <div
                                            className={`text-xs p-3 rounded-xl flex items-center gap-2 ${
                                                testResult.status === "loading"
                                                    ? "bg-slate-100 text-slate-600"
                                                    : testResult.status === "success"
                                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                      : testResult.status === "amber"
                                                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                                                        : "bg-rose-50 text-rose-800 border border-rose-200"
                                            }`}
                                        >
                                            {testResult.status === "loading" && (
                                                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                                            )}
                                            {testResult.status === "success" && (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            )}
                                            {testResult.status === "amber" && (
                                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                            )}
                                            {testResult.status === "error" && (
                                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                            )}
                                            <span>{testResult.message}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={testGqlConnection}
                                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-1.5"
                                            >
                                                <Plug className="w-3.5 h-3.5" /> Test
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => fetchDataFromGraphQL(true)}
                                                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-all flex items-center gap-1.5"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" /> Fetch Data
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-sm"
                                            >
                                                Save Configuration
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
