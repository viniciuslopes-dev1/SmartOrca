import type { CatalogItemType, CatalogUnit } from "@/types/database.types";

export type ParsedCatalogItem = {
  source_sheet: string;
  source_row: number;
  name: string;
  description: string;
  type: CatalogItemType;
  unit: CatalogUnit;
  category: string;
  cost_unit: number;
  price_unit: number;
  default_margin: number;
  is_active: boolean;
  notes: string;
  warnings: string[];
};

type HeaderKey = "code" | "category" | "name" | "description" | "type" | "unit" | "cost" | "price" | "margin" | "coefficient" | "notes";

const headerAliases: Record<HeaderKey, string[]> = {
  code: ["codigo", "cod", "item codigo", "referencia", "sku"],
  category: ["setor", "categoria", "grupo", "classe", "familia"],
  name: ["nome", "item", "produto", "servico", "serviço", "insumo", "descricao", "descrição", "descricao do servico", "descrição do serviço"],
  description: ["detalhe", "detalhes", "complemento", "observacao", "observação", "descricao detalhada", "descrição detalhada"],
  type: ["tipo", "natureza", "classificacao", "classificação"],
  unit: ["un", "und", "unid", "unidade", "medida", "um"],
  cost: ["custo", "valor custo", "valor de custo", "custo unitario", "custo unitário", "preco custo", "preço custo"],
  price: ["preco", "preço", "valor", "valor unitario", "valor unitário", "preco unitario", "preço unitário", "venda", "preco venda", "preço venda"],
  margin: ["margem", "lucro", "markup"],
  coefficient: ["coef", "coeficiente", "multiplicador", "fator"],
  notes: ["obs", "observacoes", "observações", "nota", "notas"]
};

export async function parseCatalogExcel(file: File) {
  const parsed: ParsedCatalogItem[] = [];

  if (file.name.toLowerCase().endsWith(".csv")) {
    const rows = parseCsv(await file.text());
    const detected = detectHeader(rows);
    if (!detected) return [];
    const { headerRowIndex, columns } = detected;
    for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
      const item = parseRow(rows[rowIndex] ?? [], columns, file.name, rowIndex + 1);
      if (item) parsed.push(item);
    }
    return parsed;
  }

  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);

  for (const sheet of sheets) {
    const rows = sheet.data;
    const sheetName = sheet.sheet;
    const detected = detectHeader(rows);
    if (!detected) continue;

    const { headerRowIndex, columns } = detected;
    for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] ?? [];
      const item = parseRow(row, columns, sheetName, rowIndex + 1);
      if (item) parsed.push(item);
    }
  }

  return parsed;
}

function parseCsv(text: string) {
  const separator = text.includes(";") ? ";" : ",";
  return text.split(/\r?\n/).map((line) => line.split(separator).map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, "\"")));
}

function detectHeader(rows: unknown[][]) {
  const max = Math.min(rows.length, 25);
  let best: { headerRowIndex: number; columns: Partial<Record<HeaderKey, number>>; score: number } | null = null;

  for (let rowIndex = 0; rowIndex < max; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const columns: Partial<Record<HeaderKey, number>> = {};
    row.forEach((value, columnIndex) => {
      const key = identifyHeader(String(value));
      if (key && columns[key] === undefined) columns[key] = columnIndex;
    });

    const score = Number(columns.name !== undefined) * 3
      + Number(columns.price !== undefined) * 2
      + Number(columns.cost !== undefined) * 2
      + Number(columns.unit !== undefined)
      + Number(columns.category !== undefined)
      + Number(columns.coefficient !== undefined);

    if (!best || score > best.score) best = { headerRowIndex: rowIndex, columns, score };
  }

  if (!best || best.score < 4 || best.columns.name === undefined) return null;
  return best;
}

function identifyHeader(value: string): HeaderKey | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  for (const [key, aliases] of Object.entries(headerAliases) as Array<[HeaderKey, string[]]>) {
    if (aliases.some((alias) => normalized === normalizeText(alias) || normalized.includes(normalizeText(alias)))) return key;
  }

  return null;
}

function parseRow(row: unknown[], columns: Partial<Record<HeaderKey, number>>, sheetName: string, sourceRow: number): ParsedCatalogItem | null {
  const rawName = readCell(row, columns.name);
  const name = cleanText(rawName);
  if (!name || isLikelyTotalRow(name)) return null;

  const category = cleanText(readCell(row, columns.category));
  const description = cleanText(readCell(row, columns.description));
  const rawCost = parseNumber(readCell(row, columns.cost));
  const rawPrice = parseNumber(readCell(row, columns.price));
  const coefficient = parseNumber(readCell(row, columns.coefficient));
  const cost = rawCost ?? 0;
  const price = rawPrice ?? (rawCost !== null && coefficient !== null ? rawCost * coefficient : cost);
  const notes = buildNotes(readCell(row, columns.code), readCell(row, columns.notes), sheetName, sourceRow);
  const warnings: string[] = [];

  if (rawPrice === null && rawCost === null) warnings.push("Sem preço/custo detectado; item importado com valor zerado.");
  if (price === 0) warnings.push("Preço unitário zerado.");

  return {
    source_sheet: sheetName,
    source_row: sourceRow,
    name,
    description,
    type: inferType(readCell(row, columns.type), category, name),
    unit: normalizeUnit(readCell(row, columns.unit)),
    category,
    cost_unit: roundMoney(cost),
    price_unit: roundMoney(price),
    default_margin: roundMoney(Math.max(price - cost, 0)),
    is_active: true,
    notes,
    warnings
  };
}

function readCell(row: unknown[], index: number | undefined) {
  if (index === undefined) return "";
  return row[index] === undefined || row[index] === null ? "" : String(row[index]);
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeText(value: string) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseNumber(value: string) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  const normalized = cleaned
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUnit(value: string): CatalogUnit {
  const unit = normalizeText(value);
  if (["m2", "m 2", "metro quadrado", "metros quadrados"].includes(unit)) return "m2";
  if (["m3", "m 3", "metro cubico", "metros cubicos"].includes(unit)) return "m3";
  if (["m", "ml", "metro", "metro linear", "metros lineares"].includes(unit)) return "linear_meter";
  if (["h", "hr", "hora", "horas"].includes(unit)) return "hour";
  if (["dia", "diaria", "diarias"].includes(unit)) return "day";
  if (unit === "kg" || unit === "quilo") return "kg";
  if (["pacote", "pct", "kit"].includes(unit)) return "package";
  if (["un", "und", "unid", "unidade", "ponto", "ambiente", "projeto"].includes(unit)) return "unit";
  return "other";
}

function inferType(rawType: string, category: string, name: string): CatalogItemType {
  const text = normalizeText(`${rawType} ${category} ${name}`);
  if (text.includes("mao de obra") || text.includes("maodeobra") || text.includes("instalacao") || text.includes("instalação")) return "labor";
  if (text.includes("material") || text.includes("insumo") || text.includes("cimento") || text.includes("tinta") || text.includes("piso") || text.includes("tubo") || text.includes("parafuso")) return "material";
  if (text.includes("equipamento") || text.includes("locacao") || text.includes("locação")) return "equipment";
  if (text.includes("taxa") || text.includes("transporte") || text.includes("frete")) return "fee_other";
  if (text.includes("produto")) return "product";
  return "service";
}

function buildNotes(code: string, notes: string, sheetName: string, row: number) {
  const parts = [
    cleanText(code) ? `Código original: ${cleanText(code)}` : "",
    cleanText(notes),
    `Importado de ${sheetName}, linha ${row}`
  ].filter(Boolean);
  return parts.join(" | ");
}

function isLikelyTotalRow(name: string) {
  const normalized = normalizeText(name);
  return normalized === "total" || normalized.startsWith("subtotal") || normalized.includes("total geral");
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
