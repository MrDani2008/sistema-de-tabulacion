import { ensureSpreadsheetSheets } from './googleSheets';

export async function initializeSheets(): Promise<{ spreadsheetId: string }> {
  const spreadsheetId = await ensureSpreadsheetSheets();
  return { spreadsheetId };
}
