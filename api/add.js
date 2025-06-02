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
    Cliente,
    "Email Cliente": EmailCliente,
    "Teléfono Cliente": TelefonoCliente,
    "Teléfono Emergencia": TelefonoEmergencia,
    "Edad Cliente": EdadCliente,
    "Menor de Edad": MenorEdad,
    "Nombre Tutor": NombreTutor,
    "Email Tutor": EmailTutor,
    Tatuador,
    "Zona a Tatuar": ZonaTatuar,
    Sesiones,
    Fecha,
    Valor,
    Abono,
    Alergias,
    "Firma Cliente": FirmaCliente
  } = req.body;

  try {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        Cliente: { title: [{ text: { content: Cliente || "Sin nombre" } }] },
        "Email Cliente": { email: EmailCliente },
        "Teléfono Cliente": { phone_number: TelefonoCliente },
        "Teléfono Emergencia": { phone_number: TelefonoEmergencia },
        "Edad Cliente": { number: parseInt(EdadCliente) },
        "Menor de Edad": { checkbox: MenorEdad },
        "Nombre Tutor": NombreTutor ? { rich_text: [{ text: { content: NombreTutor } }] } : undefined,
        "Email Tutor": EmailTutor ? { email: EmailTutor } : undefined,
        Tatuador: Tatuador && Tatuador.length > 0 ? Tatuador.map((tatuador) => ({
          name: tatuador.name
        })) : [], // Multi-select arreglado
        "Zona a Tatuar": ZonaTatuar ? { rich_text: [{ text: { content: ZonaTatuar } }] } : undefined,
        Sesiones: Sesiones ? { number: parseInt(Sesiones) } : undefined,
        Fecha: { date: { start: Fecha } },
        Valor: Valor ? { number: parseInt(Valor) } : undefined,
        Abono: Abono ? { number: parseInt(Abono) } : undefined,
        Alergias: { rich_text: [{ text: { content: Alergias } }] },
        "Firma Cliente": { url: FirmaCliente }
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al agregar a Notion:", error);
    res.status(500).json({ error: "Error al agregar a Notion" });
  }
}

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
