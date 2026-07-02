import { sheets, auth as googleAuth, sheets_v4 } from '@googleapis/sheets';

const requiredSheets = [
  { title: 'Equipos', headers: ['id', 'nombre', 'institucionId', 'oradores', 'creadoEn'] },
  { title: 'Instituciones', headers: ['id', 'nombre'] },
  { title: 'Oradores', headers: ['id', 'nombre', 'equipoId'] },
  { title: 'Salas', headers: ['id', 'nombre'] },
  { title: 'Rondas', headers: ['id', 'nombre', 'numero', 'estado', 'fecha', 'abiertaEn'] },
  { title: 'Debates', headers: ['id', 'rondaId', 'salaId', 'ag', 'ao', 'bg', 'bo', 'publicado'] },
  { title: 'Resultados', headers: ['id', 'debateId', 'equipoId', 'puntuacion', 'speakerScores', 'comentarios', 'confirmado'] },
  { title: 'ClasificacionGeneral', headers: ['equipoId', 'nombreEquipo', 'puntos', 'victorias', 'total', 'rondasJugadas'] },
  { title: 'ClasificacionOradores', headers: ['oradorId', 'nombreOrador', 'equipoId', 'puntos', 'debates'] }
];

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('Falta la variable de entorno GOOGLE_SERVICE_ACCOUNT_KEY');
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('No se pudo parsear GOOGLE_SERVICE_ACCOUNT_KEY como JSON');
  }
}

let cachedSheetsClient: sheets_v4.Sheets | null = null;
let cachedSpreadsheetId: string | null = null;
let sheetsInitialized = false;

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (cachedSheetsClient) return cachedSheetsClient;
  const authClient = new googleAuth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  cachedSheetsClient = sheets({ version: 'v4', auth: authClient });
  return cachedSheetsClient;
}

async function getSpreadsheetId(): Promise<string> {
  if (cachedSpreadsheetId) return cachedSpreadsheetId;
  const envId = process.env.GOOGLE_SHEETS_ID;
  if (envId) {
    cachedSpreadsheetId = envId;
    return envId;
  }

  const client = await getSheetsClient();
  const result = await client.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'Torneo BP'
      }
    }
  });

  const id = result.data.spreadsheetId;
  if (!id) {
    throw new Error('No se pudo crear la hoja de cálculo de Google Sheets');
  }

  cachedSpreadsheetId = id;
  return id;
}

export async function ensureSpreadsheetSheets(): Promise<string> {
  if (sheetsInitialized) return cachedSpreadsheetId!;
  const client = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  const spreadsheet = await client.spreadsheets.get({ spreadsheetId });
  const existingSheets = spreadsheet.data.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean) as string[];

  const requests: sheets_v4.Schema$Request[] = [];
  requiredSheets.forEach((sheet) => {
    if (!existingSheets.includes(sheet.title)) {
      requests.push({ addSheet: { properties: { title: sheet.title } } });
    }
  });

  if (requests.length > 0) {
    await client.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
  }

  for (const sheet of requiredSheets) {
    await ensureSheetHeaders(client, spreadsheetId, sheet.title, sheet.headers);
  }

  sheetsInitialized = true;
  return spreadsheetId;
}

async function ensureSheetHeaders(client: sheets_v4.Sheets, spreadsheetId: string, sheetName: string, headers: string[]) {
  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z1`
  });

  if (!response.data.values || response.data.values.length === 0 || response.data.values[0].length === 0) {
    await client.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });
  }
}

export async function readSheetObjects<T>(sheetName: string): Promise<T[]> {
  await ensureSpreadsheetSheets();
  const client = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  const result = await client.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z`
  });
  const rows = result.data.values || [];
  if (rows.length <= 1) return [];

  const header = rows[0].map((value) => String(value));
  return rows.slice(1).map((row) => {
    const record: Record<string, any> = {};
    header.forEach((key, index) => {
      record[key] = row[index] ?? '';
    });
    return record as T;
  });
}

export async function writeSheetObjects(sheetName: string, data: unknown[], headers: string[]): Promise<void> {
  await ensureSpreadsheetSheets();
  const client = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  const values = [headers, ...data.map((item) => headers.map((header) => {
    const value = (item as Record<string, any>)[header];
    return value === undefined || value === null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  }))];

  await client.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1:Z${values.length}`,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

export { requiredSheets };
