"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/formatters";
import type { BudgetGroupWithItems, BudgetWithRelations, Settings } from "@/types/database.types";

const brand = {
  blue: "#3f5d70",
  blueDark: "#163f4a",
  navy: "#214f8f",
  lightBlue: "#d8e9f8",
  sector: "#6ea9d8",
  orange: "#f59e0b",
  green: "#cfe8bf",
  rose: "#f2c7c7",
  marble: "#f8fafc",
  gold: "#a79a61",
  border: "#111827"
};

const styles = StyleSheet.create({
  cover: {
    alignItems: "center",
    backgroundColor: brand.blue,
    color: "#ffffff",
    display: "flex",
    justifyContent: "center",
    padding: 42
  },
  coverFrame: {
    alignItems: "center",
    borderColor: "#ffffff",
    borderWidth: 5,
    height: 270,
    justifyContent: "center",
    padding: 28,
    width: 500
  },
  coverLogo: { height: 150, marginBottom: 18, objectFit: "contain", width: 340 },
  coverCompany: { fontSize: 34, fontWeight: "bold", letterSpacing: 2, marginBottom: 10, textAlign: "center" },
  coverSubtitle: { fontSize: 18, letterSpacing: 1.5, textAlign: "center" },
  page: {
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 7.5,
    paddingBottom: 118,
    paddingHorizontal: 18,
    paddingTop: 132
  },
  topBand: { backgroundColor: brand.blue, height: 16, left: 0, position: "absolute", right: 0, top: 0 },
  header: { height: 96, left: 28, position: "absolute", right: 28, top: 24 },
  headerMeta: { left: 0, lineHeight: 1.45, position: "absolute", top: 20, width: 190 },
  headerMetaLine: { fontSize: 11, marginBottom: 2 },
  headerMetaLabel: { fontWeight: "bold" },
  headerLogoWrap: { alignItems: "center", left: 205, position: "absolute", right: 205, top: 0 },
  headerLogo: { height: 58, objectFit: "contain", width: 150 },
  headerLogoFallback: { borderColor: brand.blue, borderWidth: 1.5, color: brand.blue, fontSize: 16, fontWeight: "bold", padding: 12, textAlign: "center", width: 150 },
  pageNumber: { fontSize: 11, position: "absolute", right: 0, top: 2 },
  documentTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", textDecoration: "underline" },
  watermarkLogo: { height: 360, objectFit: "contain", opacity: 0.055, position: "absolute", right: -75, top: 115, width: 470 },
  watermarkText: { color: "#e5e7eb", fontSize: 80, fontWeight: "bold", left: 70, opacity: 0.42, position: "absolute", top: 395 },
  groupTable: { borderColor: brand.border, borderWidth: 1, marginBottom: 12 },
  tableTitle: {
    backgroundColor: brand.blueDark,
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "bold",
    paddingVertical: 5,
    textAlign: "center",
    textTransform: "uppercase"
  },
  row: { borderBottomColor: brand.border, borderBottomWidth: 0.7, flexDirection: "row", minHeight: 21 },
  headCell: {
    alignItems: "center",
    backgroundColor: brand.navy,
    borderRightColor: brand.border,
    borderRightWidth: 0.7,
    color: "#ffffff",
    fontSize: 7.3,
    fontWeight: "bold",
    justifyContent: "center",
    padding: 3,
    textAlign: "center"
  },
  headCellOrange: { backgroundColor: brand.orange },
  cell: {
    borderRightColor: brand.border,
    borderRightWidth: 0.7,
    justifyContent: "center",
    padding: 3
  },
  codeCol: { width: "5.5%" },
  sectorCol: { width: "9.5%" },
  serviceCol: { width: "35%" },
  unitCol: { width: "4.8%" },
  qtyCol: { width: "7.2%" },
  costCol: { width: "9.5%" },
  priceCol: { width: "9.5%" },
  totalCol: { width: "10.5%" },
  timeCol: { borderRightWidth: 0, width: "8.5%" },
  sectorCell: { alignItems: "center", backgroundColor: brand.sector, fontSize: 7, fontWeight: "bold", textAlign: "center" },
  codeCell: { backgroundColor: brand.lightBlue, fontSize: 6.5, textAlign: "center" },
  serviceCell: { backgroundColor: "#f1f5f9", fontSize: 6.8, lineHeight: 1.25 },
  moneyCell: { fontSize: 6.8, textAlign: "right" },
  totalCell: { backgroundColor: brand.green, fontSize: 6.8, fontWeight: "bold", textAlign: "right" },
  timeCell: { backgroundColor: brand.rose, fontSize: 8, fontWeight: "bold", textAlign: "center" },
  subtotalRow: { flexDirection: "row", marginLeft: "69.5%" },
  subtotalLabel: { backgroundColor: "#eef6e9", fontSize: 8, fontWeight: "bold", padding: 5, textAlign: "center", width: "38%" },
  subtotalValue: { backgroundColor: "#eef6e9", fontSize: 8, fontWeight: "bold", padding: 5, textAlign: "right", width: "38%" },
  subtotalTime: { backgroundColor: "#f7ded1", fontSize: 8, fontWeight: "bold", padding: 5, textAlign: "center", width: "24%" },
  infoGrid: { flexDirection: "row", marginBottom: 16, marginTop: 4 },
  infoBox: { borderColor: "#cbd5e1", borderWidth: 1, flex: 1, marginRight: 8, padding: 9 },
  infoBoxLast: { marginRight: 0 },
  infoTitle: { color: brand.blueDark, fontSize: 8, fontWeight: "bold", marginBottom: 4, textTransform: "uppercase" },
  infoText: { fontSize: 8, lineHeight: 1.35 },
  signature: { alignItems: "center", marginTop: 26 },
  signatureName: { fontFamily: "Helvetica-Oblique", fontSize: 26, marginBottom: -2 },
  signatureLine: { borderTopColor: "#111827", borderTopWidth: 1, height: 1, width: 330 },
  signatureCompany: { fontSize: 12, fontWeight: "bold", marginTop: 7, textAlign: "center" },
  signatureDoc: { fontSize: 9, marginTop: 3, textAlign: "center" },
  footer: { bottom: 0, height: 104, left: 0, position: "absolute", right: 0 },
  dateStrip: {
    backgroundColor: brand.marble,
    borderBottomColor: brand.gold,
    borderBottomWidth: 6,
    borderTopColor: brand.gold,
    borderTopWidth: 6,
    fontSize: 12,
    fontWeight: "bold",
    height: 42,
    paddingTop: 12,
    textAlign: "center"
  },
  contactStrip: { backgroundColor: brand.blue, color: "#ffffff", flexDirection: "row", height: 62, paddingHorizontal: 95, paddingTop: 18 },
  contactCol: { flex: 1 },
  contactLine: { fontSize: 10, marginBottom: 8 },
  contactIcon: { fontSize: 12, fontWeight: "bold" }
});

export function BudgetPdfDocument({ budget, settings }: { budget: BudgetWithRelations; settings?: Settings | null }) {
  const groups = getGroups(budget);
  const cityDate = formatLongPlaceDate(budget.issue_date, budget.projects?.city ?? settings?.company_address);

  return (
    <Document>
      <CoverPage settings={settings} />
      <Page size="A4" style={styles.page}>
        <PageChrome budget={budget} settings={settings} cityDate={cityDate} />
        <Text style={styles.documentTitle}>Proposta Comercial</Text>

        {groups.map((group, groupIndex) => (
          <GroupTable key={group.id} group={group} groupIndex={groupIndex} startIndex={itemStartIndex(groups, groupIndex)} />
        ))}

        <TotalsAndNotes budget={budget} />
        <Signature settings={settings} />
      </Page>
    </Document>
  );
}

function CoverPage({ settings }: { settings?: Settings | null }) {
  return (
    <Page size="A4" style={styles.cover}>
      <View style={styles.coverFrame}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {settings?.logo_url ? <Image src={settings.logo_url} style={styles.coverLogo} /> : <Text style={styles.coverCompany}>{settings?.company_name ?? "Proposta"}</Text>}
        <Text style={styles.coverSubtitle}>{settings?.company_name ?? "Proposta Comercial"}</Text>
      </View>
    </Page>
  );
}

function PageChrome({ budget, settings, cityDate }: { budget: BudgetWithRelations; settings?: Settings | null; cityDate: string }) {
  return (
    <>
      <View fixed style={styles.topBand} />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {settings?.logo_url ? <Image fixed src={settings.logo_url} style={styles.watermarkLogo} /> : <Text fixed style={styles.watermarkText}>ORCAMENTO</Text>}
      <View fixed style={styles.header}>
        <View style={styles.headerMeta}>
          <MetaLine label="Cliente" value={budget.clients?.name} />
          <MetaLine label="Empresa" value={settings?.company_name} />
          <MetaLine label="Prazo de Execucao" value={budget.execution_deadline} />
          <MetaLine label="Proposta" value={proposalNumber(budget)} />
        </View>
        <View style={styles.headerLogoWrap}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {settings?.logo_url ? <Image src={settings.logo_url} style={styles.headerLogo} /> : <Text style={styles.headerLogoFallback}>{settings?.company_name ?? "Logo"}</Text>}
        </View>
        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Pagina: ${Math.max(pageNumber - 1, 1)}/${Math.max(totalPages - 1, 1)}`}
        />
      </View>
      <View fixed style={styles.footer}>
        <Text style={styles.dateStrip}>{cityDate}</Text>
        <View style={styles.contactStrip}>
          <View style={styles.contactCol}>
            <Text style={styles.contactLine}><Text style={styles.contactIcon}>Tel.</Text> {settings?.company_phone ?? "-"}</Text>
            <Text style={styles.contactLine}><Text style={styles.contactIcon}>Web</Text> {settings?.company_name ?? "-"}</Text>
          </View>
          <View style={styles.contactCol}>
            <Text style={styles.contactLine}><Text style={styles.contactIcon}>Empresa</Text> {settings?.company_name ?? "-"}</Text>
            <Text style={styles.contactLine}><Text style={styles.contactIcon}>Email</Text> {settings?.company_email ?? "-"}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

function MetaLine({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Text style={styles.headerMetaLine}>
      <Text style={styles.headerMetaLabel}>{label}: </Text>
      {value || "-"}
    </Text>
  );
}

function GroupTable({ group, groupIndex, startIndex }: { group: BudgetGroupWithItems; groupIndex: number; startIndex: number }) {
  return (
    <View style={styles.groupTable}>
      {groupIndex === 0 ? <Text style={styles.tableTitle}>Descritivo Orcamentario</Text> : null}
      <View style={styles.row} wrap={false}>
        <Text style={[styles.headCell, styles.codeCol]}>Codigo</Text>
        <Text style={[styles.headCell, styles.sectorCol]}>Setores</Text>
        <Text style={[styles.headCell, styles.serviceCol]}>Servico</Text>
        <Text style={[styles.headCell, styles.unitCol]}>Unid</Text>
        <Text style={[styles.headCell, styles.qtyCol]}>Qnt.</Text>
        <Text style={[styles.headCell, styles.headCellOrange, styles.costCol]}>Custo</Text>
        <Text style={[styles.headCell, styles.priceCol]}>Valor</Text>
        <Text style={[styles.headCell, styles.totalCol]}>Valor Total</Text>
        <Text style={[styles.headCell, styles.timeCol]}>Tempo</Text>
      </View>
      {group.budget_items.map((item, index) => (
        <View key={item.id} style={styles.row} wrap={false}>
          <Text style={[styles.cell, styles.codeCell, styles.codeCol]}>S-{String(startIndex + index + 1).padStart(3, "0")}</Text>
          <Text style={[styles.cell, styles.sectorCell, styles.sectorCol]}>{index === 0 ? group.name : ""}</Text>
          <Text style={[styles.cell, styles.serviceCell, styles.serviceCol]}>{item.name}{item.description ? ` - ${item.description}` : ""}</Text>
          <Text style={[styles.cell, styles.unitCol, { textAlign: "center" }]}>{item.unit}</Text>
          <Text style={[styles.cell, styles.qtyCol, { textAlign: "right" }]}>{numberText(item.quantity)}</Text>
          <Text style={[styles.cell, styles.moneyCell, styles.costCol]}>{formatCurrency(item.cost_unit)}</Text>
          <Text style={[styles.cell, styles.moneyCell, styles.priceCol]}>{formatCurrency(item.price_unit)}</Text>
          <Text style={[styles.cell, styles.totalCell, styles.totalCol]}>{formatCurrency(item.subtotal)}</Text>
          <Text style={[styles.cell, styles.timeCell, styles.timeCol]}>-</Text>
        </View>
      ))}
      <View style={styles.subtotalRow} wrap={false}>
        <Text style={styles.subtotalLabel}>Total:</Text>
        <Text style={styles.subtotalValue}>{formatCurrency(group.subtotal)}</Text>
        <Text style={styles.subtotalTime}>-</Text>
      </View>
    </View>
  );
}

function TotalsAndNotes({ budget }: { budget: BudgetWithRelations }) {
  return (
    <View>
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Resumo financeiro</Text>
          <Text style={styles.infoText}>Subtotal: {formatCurrency(budget.subtotal)}</Text>
          <Text style={styles.infoText}>Desconto: {formatCurrency(budget.discount_total)}</Text>
          <Text style={styles.infoText}>Taxas: {formatCurrency(budget.tax_total)}</Text>
          <Text style={[styles.infoText, { fontWeight: "bold", marginTop: 4 }]}>Total: {formatCurrency(budget.total)}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Condicoes comerciais</Text>
          <Text style={styles.infoText}>Pagamento: {budget.payment_terms || "-"}</Text>
          <Text style={styles.infoText}>Validade: {formatSimpleDate(budget.valid_until)}</Text>
          <Text style={styles.infoText}>Prazo: {budget.execution_deadline || "-"}</Text>
        </View>
        <View style={[styles.infoBox, styles.infoBoxLast]}>
          <Text style={styles.infoTitle}>Observacoes</Text>
          <Text style={styles.infoText}>{budget.customer_notes || budget.description || "-"}</Text>
        </View>
      </View>
      {budget.included_scope || budget.excluded_scope ? (
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Escopo incluso</Text>
            <Text style={styles.infoText}>{budget.included_scope || "-"}</Text>
          </View>
          <View style={[styles.infoBox, styles.infoBoxLast]}>
            <Text style={styles.infoTitle}>Escopo nao incluso</Text>
            <Text style={styles.infoText}>{budget.excluded_scope || "-"}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Signature({ settings }: { settings?: Settings | null }) {
  return (
    <View style={styles.signature} wrap={false}>
      <Text style={styles.signatureName}>{settings?.company_name ?? "Responsavel"}</Text>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureCompany}>{settings?.company_name ?? "Empresa"}</Text>
      <Text style={styles.signatureDoc}>CNPJ: {settings?.company_document ?? "-"}</Text>
    </View>
  );
}

function getGroups(budget: BudgetWithRelations): BudgetGroupWithItems[] {
  if (budget.budget_groups?.length) return budget.budget_groups;
  return [{
    id: "legacy-items",
    budget_id: budget.id,
    name: "Itens",
    type: "service",
    sort_order: 0,
    subtotal: budget.subtotal,
    notes: null,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
    budget_items: budget.budget_items ?? []
  }];
}

function itemStartIndex(groups: BudgetGroupWithItems[], groupIndex: number) {
  return groups.slice(0, groupIndex).reduce((total, group) => total + group.budget_items.length, 0);
}

function proposalNumber(budget: BudgetWithRelations) {
  return `${new Date(`${budget.issue_date}T00:00:00`).getFullYear().toString().slice(-2)}${String(budget.budget_number).padStart(4, "0")}`;
}

function numberText(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Number.isFinite(parsed) ? parsed : 0);
}

function formatSimpleDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatLongPlaceDate(value: string | null | undefined, location?: string | null) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  const dateText = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(Number.isNaN(date.getTime()) ? new Date() : date);
  const city = extractCity(location) || "Sao Paulo";
  return `${city}, ${dateText}`;
}

function extractCity(value?: string | null) {
  if (!value) return null;
  return value.split(",").map((part) => part.trim()).filter(Boolean).at(-2) ?? value.split(",")[0]?.trim() ?? null;
}
