import { Client } from "@notionhq/client";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://tattoo-consent.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  const {
    "Nombre Menor": NombreMenor,
    "Fecha Nacimiento": FechaNacimiento,
    "Email Menor": EmailMenor,
    "Nombre Tutor": NombreTutor,
    "Email Tutor": EmailTutor,
    Tatuador,
    "Zona a Tatuar": ZonaTatuar,
    Sesiones,
    Fecha,
    Valor,
    Abono,
    "Firma Tutor": FirmaTutor,
    "Firma Tatuador": FirmaTatuador,
    // NUEVOS CAMPOS
    "Nombre Cliente": NombreCliente,
    "Email Cliente": EmailCliente,
    "Teléfono Cliente": TelefonoCliente,
    "Teléfono Emergencia": TelefonoEmergencia,
    Alergias,
  } = req.body;

  const calcularEdad = (fecha) => {
    if (!fecha) return null;
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const EdadCliente = calcularEdad(FechaNacimiento);

  const rawProperties = {
    "Nombre Cliente": NombreCliente
      ? { rich_text: [{ text: { content: NombreCliente } }] }
      : undefined,
    "Email Cliente": EmailCliente ? { email: EmailCliente } : undefined,
    "Teléfono Cliente": TelefonoCliente
      ? { phone_number: TelefonoCliente }
      : undefined,
    "Teléfono Emergencia": TelefonoEmergencia
      ? { phone_number: TelefonoEmergencia }
      : undefined,
    Alergias: Alergias ? { rich_text: [{ text: { content: Alergias } }] } : undefined,

    "Nombre Menor": {
      title: [{ text: { content: NombreMenor || "Sin nombre" } }],
    },
    "Fecha Nacimiento": FechaNacimiento
      ? { date: { start: FechaNacimiento } }
      : undefined,
    "Edad Cliente": EdadCliente !== null ? { number: EdadCliente } : undefined,
    "Email Menor": EmailMenor ? { email: EmailMenor } : undefined,
    "Nombre Tutor": {
      rich_text: [{ text: { content: NombreTutor } }],
    },
    "Email Tutor": { email: EmailTutor },
    Tatuador: {
      multi_select: Array.isArray(Tatuador)
        ? Tatuador.map(t => typeof t === 'string' ? { name: t } : t)
        : typeof Tatuador === 'string'
          ? [{ name: Tatuador }]
          : [Tatuador].filter(Boolean),
    },
    "Zona a Tatuar": ZonaTatuar
      ? { rich_text: [{ text: { content: ZonaTatuar } }] }
      : undefined,
    Sesiones: Sesiones ? { number: parseInt(Sesiones) } : undefined,
    Fecha: { date: { start: Fecha } },
    Valor: Valor ? { number: parseInt(Valor) } : undefined,
    Abono: Abono ? { number: parseInt(Abono) } : undefined,
    "Firma Cliente": { url: FirmaCliente },
    "Firma Tatuador": { url: FirmaTatuador },
    "Menor de Edad": { checkbox: true },
  };

  const properties = Object.fromEntries(
    Object.entries(rawProperties).filter(([, v]) => v !== undefined)
  );

  try {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al agregar a Notion (menor):", error);
    res.status(500).json({ error: "Error al agregar a Notion" });
  }
}

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
