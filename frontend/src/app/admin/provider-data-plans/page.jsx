"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronRight, Link2 } from "lucide-react";
import adminApi from "@/lib/adminApi";
import toast from "react-hot-toast";
import RequirePermission from "@/components/RequirePermission";

const PLAN_TYPES = ["SME", "SME2", "Gifting", "Corporate", "Coupon", "Awoof"];

const EMPTY_PLAN = {
  providerId: "",
  networkId: "",
  name: "",
  planCode: "",
  type: "SME",
  buyingPrice: "",
  userPrice: "",
  vendorPrice: "",
  validity: "30",
  status: "On",
};

const btnBase = {
  border: "none", borderRadius: ".75rem", padding: ".5rem 1rem", cursor: "pointer",
  fontFamily: "inherit", fontWeight: 600, fontSize: ".8rem", display: "flex", alignItems: "center", gap: ".4rem",
};

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function DataPlansPage() {
  const [apiProviders, setApiProviders] = useState([]);
  const [selectedApiProvider, setSelectedApiProvider] = useState(null);
  const [activeDataProvider, setActiveDataProvider] = useState(null);
  const [plans, setPlans] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [planModal, setPlanModal] = useState(null);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

  const loadApiProviders = useCallback(() => {
    adminApi.get("/admin/api-links").then((r) => {
      const all = r.data.data?.links || r.data.data?.apiLinks || [];
      const dataOnes = all.filter((l) => l.type === "Data");
      setApiProviders(dataOnes);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadApiProviders();
    adminApi.get("/admin/networks").then((r) => setNetworks(r.data.data?.networks || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedApiProvider) { setActiveDataProvider(null); setPlans([]); return; }
    const name = selectedApiProvider.name;
    const slug = slugify(name);
    setResolving(true);
    adminApi.get("/admin/data-providers").then(async (r) => {
      const list = r.data.data?.providers || [];
      let dp = list.find((p) => p.slug === slug || p.name === name);
      if (!dp) {
        const res = await adminApi.post("/admin/data-providers", { name, slug, status: "On" });
        dp = res.data.data?.provider;
      }
      setActiveDataProvider(dp);
    }).catch(() => toast.error("Could not resolve provider"))
      .finally(() => setResolving(false));
  }, [selectedApiProvider]);

  const loadPlans = useCallback(() => {
    if (!activeDataProvider) return;
    setLoading(true);
    adminApi.get("/admin/provider-data-plans", { params: { providerId: activeDataProvider.id } })
      .then((r) => setPlans(r.data.data?.plans || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeDataProvider]);

  useEffect(() => { loadPlans(); }, [activeDataProvider]);

  const grouped = {};
  plans.forEach((p) => {
    const key = `${p.networkId}-${p.type}`;
    if (!grouped[key]) grouped[key] = { networkId: p.networkId, networkName: p.network?.name || "", type: p.type, plans: [] };
    grouped[key].plans.push(p);
  });
  const groups = Object.values(grouped).sort((a, b) => {
    if (a.networkId !== b.networkId) return a.networkId - b.networkId;
    return PLAN_TYPES.indexOf(a.type) - PLAN_TYPES.indexOf(b.type);
  });

  const toggleGroup = (key) => setExpandedGroups((e) => ({ ...e, [key]: !e[key] }));

  const openAddPlan = (networkId, type) => {
    setPlanForm({ ...EMPTY_PLAN, providerId: String(activeDataProvider?.id || ""), networkId: networkId ? String(networkId) : "", type: type || "SME" });
    setPlanModal("add");
  };

  const openEditPlan = (p) => {
    setPlanForm({ providerId: String(p.providerId), networkId: String(p.networkId), name: p.name, planCode: p.planCode, type: p.type, buyingPrice: p.buyingPrice || "", userPrice: p.userPrice, vendorPrice: p.vendorPrice || "", validity: p.validity, status: p.status || "On" });
    setPlanModal(p);
  };

  const setF = (k) => (e) => setPlanForm((f) => ({ ...f, [k]: e.target.value }));

  const savePlan = async () => {
    if (!planForm.networkId || !planForm.name || !planForm.planCode || !planForm.type || !planForm.userPrice) {
      toast.error("Network, Name, Plan Code, Type and User Price required"); return;
    }
    try {
      if (planModal === "add") { await adminApi.post("/admin/provider-data-plans", planForm); toast.success("Plan added"); }
      else { await adminApi.put(`/admin/provider-data-plans/${planModal.id}`, planForm); toast.success("Plan updated"); }
      setPlanModal(null); loadPlans();
    } catch (err) { toast.error(err?.response?.data?.msg || "Failed"); }
  };

  const deletePlan = async (id) => {
    if (!confirm("Delete this plan?")) return;
    try { await adminApi.delete(`/admin/provider-data-plans/${id}`); toast.success("Deleted"); loadPlans(); }
    catch { toast.error("Failed"); }
  };

  const inputStyle = { width: "100%", padding: ".625rem .875rem", border: "1px solid #e2e8f0", borderRadius: ".75rem", fontFamily: "inherit", fontSize: ".875rem", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: ".78rem", fontWeight: 600, color: "#475569", marginBottom: ".3rem" };
  const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" };
  const modalBox = { background: "white", borderRadius: "1.25rem", padding: "1.75rem", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" };

  return (
    <RequirePermission permission="data_plans_manage">
    <div style={{ minHeight: "100vh" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-.03em", margin: 0 }}>Data Plans</h1>
        <p style={{ color: "#64748b", fontSize: ".875rem", marginTop: ".25rem" }}>Select a provider from your configured API Providers to manage its data plans.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Provider Sidebar from API Providers */}
        <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,.05)", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: ".5rem" }}>
            <Link2 size={14} color="#64748b" />
            <p style={{ margin: 0, fontWeight: 700, fontSize: ".8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em" }}>Data API Providers</p>
          </div>
          {apiProviders.length === 0 ? (
            <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#94a3b8", fontSize: ".82rem", lineHeight: 1.6 }}>
              No Data providers found.<br />
              Go to <a href="/admin/api-links" style={{ color: "#2563eb" }}>API Providers</a> and add one with type <strong>Data</strong>.
            </div>
          ) : (
            apiProviders.map((p) => (
              <div key={p.id} onClick={() => setSelectedApiProvider(p)} style={{ padding: ".875rem 1.25rem", cursor: "pointer", borderBottom: "1px solid #f8fafc", background: selectedApiProvider?.id === p.id ? "#eff6ff" : "transparent", borderLeft: selectedApiProvider?.id === p.id ? "3px solid #2563eb" : "3px solid transparent", transition: "background .15s" }}>
                <div style={{ fontWeight: 700, fontSize: ".875rem", color: selectedApiProvider?.id === p.id ? "#1d4ed8" : "#1e293b" }}>{p.name}</div>
                <div style={{ fontSize: ".72rem", color: "#94a3b8", marginTop: ".15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.value || "No URL set"}</div>
              </div>
            ))
          )}
        </div>

        {/* Plans Area */}
        <div>
          {!selectedApiProvider ? (
            <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #f1f5f9", padding: "4rem", textAlign: "center", color: "#94a3b8" }}>
              Select a provider from the left to manage its data plans.
            </div>
          ) : resolving ? (
            <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #f1f5f9", padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Setting up provider...</div>
          ) : (
            <>
              <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #f1f5f9", padding: "1.25rem 1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem", color: "#1e293b" }}>{selectedApiProvider.name}</h2>
                  <p style={{ margin: ".2rem 0 0", fontSize: ".8rem", color: "#64748b" }}>
                    slug: <code style={{ background: "#f8fafc", padding: "1px 6px", borderRadius: "4px" }}>{activeDataProvider?.slug}</code>
                    {selectedApiProvider.value && <> · <span style={{ color: "#94a3b8" }}>{selectedApiProvider.value}</span></>}
                  </p>
                </div>
                <button onClick={() => openAddPlan(null, null)} style={{ ...btnBase, background: "#2563eb", color: "white" }}>
                  <Plus size={15} /> Add Plan
                </button>
              </div>

              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1rem", fontSize: ".82rem", color: "#92400e" }}>
                <strong>Activate:</strong> Go to <a href="/admin/api-configs?tab=Data" style={{ color: "#b45309", fontWeight: 700 }}>API Config → Data tab</a> and set "Active Plan Provider" for each type to <strong>{activeDataProvider?.slug}</strong>.
              </div>

              {loading ? (
                <div style={{ background: "white", borderRadius: "1.25rem", padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Loading plans...</div>
              ) : groups.length === 0 ? (
                <div style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #f1f5f9", padding: "4rem", textAlign: "center", color: "#94a3b8" }}>
                  No plans yet for {selectedApiProvider.name}.<br />
                  <button onClick={() => openAddPlan(null, null)} style={{ ...btnBase, background: "#2563eb", color: "white", marginTop: "1rem", display: "inline-flex" }}>
                    <Plus size={15} /> Add First Plan
                  </button>
                </div>
              ) : (
                groups.map((g) => {
                  const key = `${g.networkId}-${g.type}`;
                  const isOpen = expandedGroups[key] !== false;
                  return (
                    <div key={key} style={{ background: "white", borderRadius: "1.25rem", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,.04)", marginBottom: "1rem", overflow: "hidden" }}>
                      <div onClick={() => toggleGroup(key)} style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "#f8fafc", borderBottom: isOpen ? "1px solid #f1f5f9" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                          {isOpen ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
                          <span style={{ fontWeight: 800, fontSize: ".9rem", color: "#1e293b" }}>{g.networkName}</span>
                          <span style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 10px", borderRadius: "999px", fontSize: ".73rem", fontWeight: 700 }}>{g.type}</span>
                          <span style={{ color: "#94a3b8", fontSize: ".78rem" }}>{g.plans.length} plan{g.plans.length !== 1 ? "s" : ""}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); openAddPlan(g.networkId, g.type); }} style={{ ...btnBase, background: "#eff6ff", color: "#2563eb", padding: ".35rem .75rem", fontSize: ".75rem" }}>
                          <Plus size={13} /> Add
                        </button>
                      </div>
                      {isOpen && (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".83rem" }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                                {["Plan Name", "Plan Code", "Validity", "Buying", "User", "Vendor", "Status", ""].map((h) => (
                                  <th key={h} style={{ padding: ".7rem 1rem", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {g.plans.map((p) => (
                                <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                  <td style={{ padding: ".75rem 1rem", fontWeight: 600, color: "#1e293b" }}>{p.name}</td>
                                  <td style={{ padding: ".75rem 1rem" }}><code style={{ background: "#f8fafc", padding: "2px 6px", borderRadius: "6px", fontSize: ".78rem" }}>{p.planCode}</code></td>
                                  <td style={{ padding: ".75rem 1rem", color: "#64748b" }}>{p.validity}d</td>
                                  <td style={{ padding: ".75rem 1rem", color: "#64748b" }}>&#8358;{p.buyingPrice}</td>
                                  <td style={{ padding: ".75rem 1rem", fontWeight: 700, color: "#1e293b" }}>&#8358;{p.userPrice}</td>
                                  <td style={{ padding: ".75rem 1rem", color: "#64748b" }}>&#8358;{p.vendorPrice}</td>
                                  <td style={{ padding: ".75rem 1rem" }}>
                                    <span style={{ background: p.status === "On" ? "#dcfce7" : "#fee2e2", color: p.status === "On" ? "#166534" : "#991b1b", padding: "2px 8px", borderRadius: "999px", fontSize: ".72rem", fontWeight: 700 }}>{p.status}</span>
                                  </td>
                                  <td style={{ padding: ".75rem 1rem", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", gap: ".4rem" }}>
                                      <button onClick={() => openEditPlan(p)} style={{ border: "none", background: "#eff6ff", color: "#2563eb", borderRadius: ".5rem", padding: ".35rem .6rem", cursor: "pointer" }}><Edit2 size={13} /></button>
                                      <button onClick={() => deletePlan(p.id)} style={{ border: "none", background: "#fee2e2", color: "#dc2626", borderRadius: ".5rem", padding: ".35rem .6rem", cursor: "pointer" }}><Trash2 size={13} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      {planModal && (
        <div style={modalOverlay} onClick={() => setPlanModal(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>
                {planModal === "add" ? `Add Plan — ${selectedApiProvider?.name}` : "Edit Plan"}
              </h3>
              <button onClick={() => setPlanModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".875rem" }}>
              <div>
                <label style={labelStyle}>Network</label>
                <select value={planForm.networkId} onChange={setF("networkId")} style={inputStyle}>
                  <option value="">Select Network</option>
                  {networks.map((n) => <option key={n.id} value={String(n.id)}>{n.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Plan Type</label>
                <select value={planForm.type} onChange={setF("type")} style={inputStyle}>
                  {PLAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Plan Name</label>
                <input value={planForm.name} onChange={setF("name")} placeholder="e.g. 1GB - 30 Days" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Plan Code <span style={{ color: "#94a3b8", fontWeight: 400 }}>(provider's ID)</span></label>
                <input value={planForm.planCode} onChange={setF("planCode")} placeholder="e.g. 123" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Buying Price (&#8358;)</label>
                <input type="number" value={planForm.buyingPrice} onChange={setF("buyingPrice")} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>User Price (&#8358;)</label>
                <input type="number" value={planForm.userPrice} onChange={setF("userPrice")} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Vendor Price (&#8358;)</label>
                <input type="number" value={planForm.vendorPrice} onChange={setF("vendorPrice")} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Validity (days)</label>
                <input type="number" value={planForm.validity} onChange={setF("validity")} placeholder="30" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={planForm.status} onChange={setF("status")} style={inputStyle}>
                  <option value="On">On</option>
                  <option value="Off">Off</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button onClick={() => setPlanModal(null)} style={{ ...btnBase, background: "#f1f5f9", color: "#475569" }}>Cancel</button>
              <button onClick={savePlan} style={{ ...btnBase, background: "#2563eb", color: "white" }}>{planModal === "add" ? "Add Plan" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RequirePermission>
  );
}
