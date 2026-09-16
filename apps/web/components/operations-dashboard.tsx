"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, AlertTriangle, Layers, LogIn, MapPinned, RadioTower, Route, ShieldAlert, Truck, UsersRound, Zap, type LucideIcon } from "lucide-react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ActiveFault,
  Crew,
  FeederOverview,
  IncidentImpact,
  GeoJsonFeatureCollection,
  NetworkSummary,
  OpenIncident,
  WorkOrder,
  acknowledgeIncident,
  dispatchIncident,
  getActiveFaults,
  getCrews,
  getFeeders,
  getIncidentImpact,
  getMapLayer,
  getNetworkSummary,
  getOpenIncidents,
  getOpenWorkOrders,
  resolveIncident,
  login
} from "../lib/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginForm = z.infer<typeof loginSchema>;

type Session = {
  accessToken: string;
  email: string;
  role: string;
};

const mapStyleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://demotiles.maplibre.org/style.json";


type ImpactedMapIds = {
  segmentIds: Set<string>;
  serviceAreaIds: Set<string>;
  transformerIds: Set<string>;
};
type LoginFeature = {
  icon: LucideIcon;
  label: string;
};

export function OperationsDashboard() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {session ? <Dashboard session={session} onLogout={() => setSession(null)} /> : <LoginPanel onLogin={setSession} />}
    </main>
  );
}

function LoginPanel({ onLogin }: { onLogin: (session: Session) => void }) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "operations@gridlens.local",
      password: "gridlens-demo"
    }
  });

  async function submit(values: LoginForm) {
    setError(null);
    try {
      const response = await login(values.email, values.password);
      onLogin({
        accessToken: response.accessToken,
        email: response.user.email,
        role: response.user.role
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
    }
  }

  return (
    <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[420px_1fr]">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase text-cyan-300">GridLens</p>
        <h1 className="mt-4 text-4xl font-semibold">Utility Operations GIS</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
          Synthetic network monitoring workspace for feeders, transformers, service areas, telemetry, and incident workflows.
        </p>
        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(submit)}>
          <label className="block text-sm text-zinc-300">
            Email
            <input
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3 py-3 text-zinc-100 outline-none focus:border-cyan-400"
              {...form.register("email")}
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Password
            <input
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-3 py-3 text-zinc-100 outline-none focus:border-cyan-400"
              type="password"
              {...form.register("password")}
            />
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            className="inline-flex items-center gap-2 bg-cyan-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            <LogIn size={18} />
            Sign in
          </button>
        </form>
      </div>
      <div className="grid min-h-[520px] place-items-center border border-zinc-800 bg-zinc-900 p-6">
        <div className="grid w-full max-w-lg grid-cols-2 gap-3">
          {[
            { icon: RadioTower, label: "PostGIS network" },
            { icon: Zap, label: "Fault tracing" },
            { icon: UsersRound, label: "Crew dispatch" },
            { icon: Activity, label: "Telemetry" }
          ].map(({ icon: Icon, label }: LoginFeature) => (
            <div className="border border-zinc-800 bg-zinc-950 p-4" key={label}>
              <Icon className="text-cyan-300" size={24} />
              <p className="mt-8 text-sm font-medium text-zinc-200">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const token = session.accessToken;
  const queryClient = useQueryClient();
  const summaryQuery = useQuery({ queryKey: ["network-summary"], queryFn: () => getNetworkSummary(token) });
  const feedersQuery = useQuery({ queryKey: ["feeders"], queryFn: () => getFeeders(token) });
  const crewsQuery = useQuery({ queryKey: ["crews"], queryFn: () => getCrews(token) });
  const activeFaultsQuery = useQuery({
    queryKey: ["active-faults"],
    queryFn: () => getActiveFaults(token),
    refetchInterval: 10000
  });
  const openIncidentsQuery = useQuery({
    queryKey: ["open-incidents"],
    queryFn: () => getOpenIncidents(token),
    refetchInterval: 10000
  });
  const incidentImpactsQuery = useQuery({
    enabled: Boolean(openIncidentsQuery.data?.length),
    queryKey: ["incident-impacts", openIncidentsQuery.data?.map((incident) => incident.id).join(",")],
    queryFn: async () => {
      const impacts = await Promise.all((openIncidentsQuery.data ?? []).map((incident) => getIncidentImpact(token, incident.id)));
      return new Map(impacts.map((impact) => [impact.incidentId, impact]));
    },
    refetchInterval: 10000
  });
  const openWorkOrdersQuery = useQuery({
    queryKey: ["open-work-orders"],
    queryFn: () => getOpenWorkOrders(token),
    refetchInterval: 10000
  });
  const substationsQuery = useQuery({ queryKey: ["map", "substations"], queryFn: () => getMapLayer(token, "substations") });
  const segmentsQuery = useQuery({ queryKey: ["map", "segments"], queryFn: () => getMapLayer(token, "segments") });
  const transformersQuery = useQuery({ queryKey: ["map", "transformers"], queryFn: () => getMapLayer(token, "transformers") });
  const serviceAreasQuery = useQuery({ queryKey: ["map", "service-areas"], queryFn: () => getMapLayer(token, "service-areas") });
  const dispatchMutation = useMutation({
    mutationFn: (incidentId: string) => dispatchIncident(token, incidentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["crews"] }),
        queryClient.invalidateQueries({ queryKey: ["open-work-orders"] })
      ]);
    }
  });
  const incidentActionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "acknowledge" | "resolve" }) =>
      action === "acknowledge" ? acknowledgeIncident(token, id) : resolveIncident(token, id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["open-incidents"] }),
        queryClient.invalidateQueries({ queryKey: ["active-faults"] }),
        queryClient.invalidateQueries({ queryKey: ["open-work-orders"] })
      ]);
    }
  });

  const layers = useMemo(
    () => ({
      substations: substationsQuery.data,
      segments: segmentsQuery.data,
      transformers: transformersQuery.data,
      serviceAreas: serviceAreasQuery.data
    }),
    [serviceAreasQuery.data, segmentsQuery.data, substationsQuery.data, transformersQuery.data]
  );
  const impactedMapIds = useMemo<ImpactedMapIds>(() => {
    const impacts = [...(incidentImpactsQuery.data?.values() ?? [])];
    return {
      segmentIds: new Set(impacts.flatMap((impact) => impact.segmentIds)),
      serviceAreaIds: new Set(impacts.flatMap((impact) => impact.serviceAreaIds)),
      transformerIds: new Set(impacts.flatMap((impact) => impact.transformerIds))
    };
  }, [incidentImpactsQuery.data]);

  return (
    <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[360px_1fr]">
      <aside className="border-r border-zinc-800 bg-zinc-950 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-300">GridLens</p>
            <p className="mt-1 text-sm text-zinc-400">{session.email}</p>
          </div>
          <button className="border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-cyan-400" onClick={onLogout}>
            Logout
          </button>
        </div>
        <SummaryPanel summary={summaryQuery.data} />
        <FeederPanel feeders={feedersQuery.data ?? []} />
        <FaultPanel faults={activeFaultsQuery.data ?? []} />
        <IncidentPanel
          dispatchedIncidentIds={new Set((openWorkOrdersQuery.data ?? []).map((workOrder) => workOrder.incidentId))}
          impacts={incidentImpactsQuery.data ?? new Map<string, IncidentImpact>()}
          incidents={openIncidentsQuery.data ?? []}
          isActing={incidentActionMutation.isPending || dispatchMutation.isPending}
          onAcknowledge={(id) => incidentActionMutation.mutate({ id, action: "acknowledge" })}
          onDispatch={(id) => dispatchMutation.mutate(id)}
          onResolve={(id) => incidentActionMutation.mutate({ id, action: "resolve" })}
        />
        <DispatchPanel crews={crewsQuery.data ?? []} workOrders={openWorkOrdersQuery.data ?? []} />
      </aside>
      <section className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h1 className="text-xl font-semibold">Operations Map</h1>
            <p className="text-sm text-zinc-400">Role: {session.role}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Layers size={18} className="text-cyan-300" />
            Live synthetic layers
          </div>
        </header>
        <GridMap impactedIds={impactedMapIds} layers={layers} />
      </section>
    </section>
  );
}

function SummaryPanel({ summary }: { summary?: NetworkSummary }) {
  const values = [
    ["Substations", summary?.substations],
    ["Feeders", summary?.feeders],
    ["Segments", summary?.segments],
    ["Transformers", summary?.transformers],
    ["Service areas", summary?.serviceAreas],
    ["Est. customers", summary?.estimatedCustomers]
  ];

  return (
    <section className="mt-6 grid grid-cols-2 gap-2">
      {values.map(([label, value]) => (
        <div className="border border-zinc-800 bg-zinc-900 p-3" key={label}>
          <p className="text-xs text-zinc-500">{String(label)}</p>
          <p className="mt-1 text-2xl font-semibold">{value ?? "-"}</p>
        </div>
      ))}
    </section>
  );
}




function DispatchPanel({ crews, workOrders }: { crews: Crew[]; workOrders: WorkOrder[] }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-zinc-200">
        <span className="flex items-center gap-2">
          <Truck size={18} className="text-cyan-300" />
          Dispatch
        </span>
        <span className="text-xs text-zinc-500">{workOrders.length} orders</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {crews.map((crew) => (
          <div className="border border-zinc-800 bg-zinc-900 p-3" key={crew.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-200">{crew.code}</p>
              <span className={crew.status === "AVAILABLE" ? "text-xs text-emerald-300" : "text-xs text-zinc-500"}>{crew.status}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{crew.specialty}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {workOrders.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">No active work orders</div>
        ) : (
          workOrders.map((workOrder) => (
            <div className="border border-cyan-500/40 bg-cyan-950/20 p-3" key={workOrder.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-cyan-100">{workOrder.workOrderNumber}</p>
                <span className="text-xs text-cyan-300">{workOrder.status}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400"><Route className="mr-1 inline" size={13} />{workOrder.crewCode ?? workOrder.crewId}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
function IncidentPanel({
  dispatchedIncidentIds,
  impacts,
  incidents,
  isActing,
  onAcknowledge,
  onDispatch,
  onResolve
}: {
  dispatchedIncidentIds: Set<string>;
  impacts: Map<string, IncidentImpact>;
  incidents: OpenIncident[];
  isActing: boolean;
  onAcknowledge: (id: string) => void;
  onDispatch: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-zinc-200">
        <span className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-rose-300" />
          Open incidents
        </span>
        <span className="text-xs text-zinc-500">{incidents.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {incidents.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">No open incidents</div>
        ) : (
          incidents.map((incident) => {
            const impact = impacts.get(incident.id);
            return (
              <div className="border border-rose-500/50 bg-rose-950/20 p-3" key={incident.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-rose-100">{incident.incidentNumber}</p>
                  <span className="text-xs text-rose-300">{incident.priority}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-300">{incident.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{incident.status} · opened {new Date(incident.openedAt).toLocaleString()}</p>
                {impact ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 border border-rose-500/20 bg-zinc-950/40 p-2 text-xs">
                    <span className="text-zinc-500">Customers</span>
                    <span className="text-right text-rose-100">{impact.affected.estimatedCustomers}</span>
                    <span className="text-zinc-500">Transformers</span>
                    <span className="text-right text-zinc-300">{impact.affected.transformers}</span>
                    <span className="text-zinc-500">Service areas</span>
                    <span className="text-right text-zinc-300">{impact.affected.serviceAreas}</span>
                    <span className="text-zinc-500">Segments</span>
                    <span className="text-right text-zinc-300">{impact.affected.segments}</span>
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  {incident.status === "OPEN" ? (
                    <button
                      className="border border-rose-400/60 px-2 py-1 text-xs text-rose-100 hover:bg-rose-400/10 disabled:opacity-50"
                      disabled={isActing}
                      onClick={() => onAcknowledge(incident.id)}
                      type="button"
                    >
                      Ack
                    </button>
                  ) : null}
                  <button
                    className="border border-cyan-400/60 px-2 py-1 text-xs text-cyan-100 hover:bg-cyan-400/10 disabled:opacity-50"
                    disabled={isActing || dispatchedIncidentIds.has(incident.id)}
                    onClick={() => onDispatch(incident.id)}
                    type="button"
                  >
                    {dispatchedIncidentIds.has(incident.id) ? "Dispatched" : "Dispatch"}
                  </button>
                  <button
                    className="border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:border-rose-300 disabled:opacity-50"
                    disabled={isActing}
                    onClick={() => onResolve(incident.id)}
                    type="button"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
function FaultPanel({ faults }: { faults: ActiveFault[] }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-zinc-200">
        <span className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-300" />
          Active faults
        </span>
        <span className="text-xs text-zinc-500">{faults.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {faults.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">No active faults detected</div>
        ) : (
          faults.map((fault) => (
            <div className="border border-amber-500/50 bg-amber-950/20 p-3" key={fault.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-amber-100">{fault.faultType.replaceAll("_", " ")}</p>
                <span className="text-xs text-amber-300">{fault.severity}</span>
              </div>
              <p className="mt-1 break-all text-xs text-zinc-500">{fault.assetType}: {fault.assetId}</p>
              <p className="mt-3 text-xs text-zinc-400">Last detected {new Date(fault.lastDetectedAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
function FeederPanel({ feeders }: { feeders: FeederOverview[] }) {
  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
        <Zap size={18} className="text-cyan-300" />
        Feeders
      </div>
      <div className="mt-3 space-y-2">
        {feeders.map((feeder) => (
          <div className="border border-zinc-800 bg-zinc-900 p-3" key={feeder.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{feeder.code}</p>
              <span className="text-xs text-emerald-300">{feeder.status}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{feeder.name}</p>
            <p className="mt-3 text-sm text-zinc-300">{feeder.estimatedCustomerCount} estimated customers</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GridMap({ impactedIds, layers }: { impactedIds: ImpactedMapIds; layers: Record<string, GeoJsonFeatureCollection | undefined> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyleUrl,
      center: [-96.798, 32.778],
      zoom: 12
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    function applyLayers(targetMap: MapLibreMap) {
      addOrUpdateSource(targetMap, "serviceAreas", layers.serviceAreas);
      addOrUpdateSource(targetMap, "segments", layers.segments);
      addOrUpdateSource(targetMap, "transformers", layers.transformers);
      addOrUpdateSource(targetMap, "substations", layers.substations);
      addOrUpdateSource(targetMap, "impactedServiceAreas", filterFeatureCollection(layers.serviceAreas, impactedIds.serviceAreaIds));
      addOrUpdateSource(targetMap, "impactedSegments", filterFeatureCollection(layers.segments, impactedIds.segmentIds));
      addOrUpdateSource(targetMap, "impactedTransformers", filterFeatureCollection(layers.transformers, impactedIds.transformerIds));

      if (!targetMap.getLayer("serviceAreas-fill")) {
        targetMap.addLayer({
          id: "serviceAreas-fill",
          type: "fill",
          source: "serviceAreas",
          paint: { "fill-color": "#22c55e", "fill-opacity": 0.22 }
        });
      }
      if (!targetMap.getLayer("impactedServiceAreas-fill")) {
        targetMap.addLayer({
          id: "impactedServiceAreas-fill",
          type: "fill",
          source: "impactedServiceAreas",
          paint: { "fill-color": "#fb7185", "fill-opacity": 0.42 }
        });
      }
      if (!targetMap.getLayer("segments-line")) {
        targetMap.addLayer({
          id: "segments-line",
          type: "line",
          source: "segments",
          paint: { "line-color": "#facc15", "line-width": 4 }
        });
      }
      if (!targetMap.getLayer("impactedSegments-line")) {
        targetMap.addLayer({
          id: "impactedSegments-line",
          type: "line",
          source: "impactedSegments",
          paint: { "line-color": "#fb7185", "line-width": 7, "line-opacity": 0.9 }
        });
      }
      if (!targetMap.getLayer("transformers-circle")) {
        targetMap.addLayer({
          id: "transformers-circle",
          type: "circle",
          source: "transformers",
          paint: { "circle-color": "#38bdf8", "circle-radius": 7, "circle-stroke-color": "#082f49", "circle-stroke-width": 2 }
        });
      }
      if (!targetMap.getLayer("impactedTransformers-circle")) {
        targetMap.addLayer({
          id: "impactedTransformers-circle",
          type: "circle",
          source: "impactedTransformers",
          paint: { "circle-color": "#fb7185", "circle-radius": 10, "circle-stroke-color": "#4c0519", "circle-stroke-width": 3 }
        });
      }
      if (!targetMap.getLayer("substations-circle")) {
        targetMap.addLayer({
          id: "substations-circle",
          type: "circle",
          source: "substations",
          paint: { "circle-color": "#f97316", "circle-radius": 10, "circle-stroke-color": "#431407", "circle-stroke-width": 3 }
        });
      }
    }

    if (map.isStyleLoaded()) {
      applyLayers(map);
    } else {
      map.once("load", () => applyLayers(map));
    }
  }, [impactedIds, layers]);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute left-4 top-4 border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-sm text-zinc-300 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPinned size={16} className="text-cyan-300" />
          Synthetic Dallas-area training geometry
        </div>
      </div>
    </div>
  );
}

function filterFeatureCollection(data: GeoJsonFeatureCollection | undefined, ids: Set<string>): GeoJsonFeatureCollection {
  if (!data || ids.size === 0) {
    return { type: "FeatureCollection", features: [] };
  }

  return {
    type: "FeatureCollection",
    features: data.features.filter((feature) => typeof feature.id === "string" && ids.has(feature.id))
  };
}
function addOrUpdateSource(map: MapLibreMap, id: string, data?: GeoJsonFeatureCollection) {
  const empty: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
  const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;

  if (source) {
    source.setData(data ?? empty);
    return;
  }

  map.addSource(id, {
    type: "geojson",
    data: data ?? empty
  });
}


