import { notFound } from "next/navigation";

import { ChecklistTab } from "@/components/expedientes/tabs/checklist-tab";
import { GeneralTab } from "@/components/expedientes/tabs/general-tab";
import { PartesTab } from "@/components/expedientes/tabs/partes-tab";
import { PersonasTab } from "@/components/expedientes/tabs/personas-tab";
import { PlazosTab } from "@/components/expedientes/tabs/plazos-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUserId } from "@/lib/auth/session";
import { feriadosASet } from "@/lib/business/dias-habiles";
import { calcularEstadoSemaforo } from "@/lib/business/semaforo";
import { obtenerExpediente } from "@/lib/db/queries/expedientes";
import { listarFeriados } from "@/lib/db/queries/feriados";
import { listarPartesPorExpediente } from "@/lib/db/queries/partes";
import { listarPersonasPorExpediente } from "@/lib/db/queries/personas";
import { listarPlazosPorExpediente } from "@/lib/db/queries/plazos";
import { listarTareasPorExpediente } from "@/lib/db/queries/tareas";

export default async function ExpedienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const expediente = await obtenerExpediente(userId, id);
  if (!expediente) notFound();

  const [personas, partes, plazosRaw, tareas, feriados] = await Promise.all([
    listarPersonasPorExpediente(userId, id),
    listarPartesPorExpediente(userId, id),
    listarPlazosPorExpediente(userId, id),
    listarTareasPorExpediente(userId, id),
    listarFeriados(userId),
  ]);

  const feriadosSet = feriadosASet(feriados);
  const plazos = plazosRaw.map(({ plazo, persona }) => ({
    plazo,
    persona,
    estado: calcularEstadoSemaforo({
      fechaVencimiento: plazo.fechaVencimiento,
      cumplido: plazo.cumplido,
      feriados: feriadosSet,
    }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground">Expediente {expediente.numero}</p>
        <h1 className="text-xl font-semibold">{expediente.caratula}</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="partes">Partes</TabsTrigger>
          <TabsTrigger value="plazos">Plazos</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab expediente={expediente} />
        </TabsContent>
        <TabsContent value="personas">
          <PersonasTab expedienteId={id} personas={personas} />
        </TabsContent>
        <TabsContent value="partes">
          <PartesTab expedienteId={id} partes={partes} />
        </TabsContent>
        <TabsContent value="plazos">
          <PlazosTab expedienteId={id} personas={personas} plazos={plazos} />
        </TabsContent>
        <TabsContent value="checklist">
          <ChecklistTab expedienteId={id} personas={personas} tareas={tareas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
