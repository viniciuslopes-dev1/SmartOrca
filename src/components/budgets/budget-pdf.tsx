"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/formatters";
import { unitLabels } from "@/lib/labels";
import type { BudgetGroupWithItems, BudgetWithRelations, Settings } from "@/types/database.types";

const brand = {
  blue: "#3f5d70",
  blueDark: "#163f4a",
  navy: "#214f8f",
  lightBlue: "#d8e9f8",
  sector: "#6ea9d8",
  green: "#cfe8bf",
  border: "#111827"
};

const styles = StyleSheet.create({
  cover: {
    alignItems: "center",
    backgroundColor: brand.blue,
    color: "#ffffff",
    display: "flex",
    justifyContent: "center",
    padding: 0
  },
  coverFrame: {
    alignItems: "center",
    height: 450,
    justifyContent: "center",
    padding: 0,
    width: 550
  },
  coverLogo: { height: 370, objectFit: "contain", width: 550 },
  coverCompany: { fontSize: 34, fontWeight: "bold", letterSpacing: 2, marginBottom: 10, textAlign: "center" },
  page: {
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 7.5,
    paddingBottom: 76,
    paddingHorizontal: 18,
    paddingTop: 154
  },
  topBand: { backgroundColor: brand.blue, height: 16, left: 0, position: "absolute", right: 0, top: 0 },
  header: { height: 116, left: 28, position: "absolute", right: 28, top: 24 },
  headerMeta: { left: 8, lineHeight: 1.08, position: "absolute", top: 44, width: 215 },
  headerMetaLine: { fontSize: 10, marginBottom: 0 },
  headerMetaLabel: { fontWeight: "bold" },
  headerLogoWrap: { alignItems: "center", left: 0, position: "absolute", right: 0, top: 20 },
  headerLogo: { height: 82, objectFit: "contain", width: 182 },
  headerLogoFallback: { borderColor: brand.blue, borderWidth: 1.5, color: brand.blue, fontSize: 16, fontWeight: "bold", padding: 12, textAlign: "center", width: 182 },
  pageNumber: { fontSize: 11.5, position: "absolute", right: 0, top: 36 },
  documentTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center", textDecoration: "underline" },
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
  row: { borderBottomColor: brand.border, borderBottomWidth: 0.7, flexDirection: "row", minHeight: 22 },
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
  cell: {
    borderRightColor: brand.border,
    borderRightWidth: 0.7,
    justifyContent: "center",
    lineHeight: 1.2,
    padding: 3
  },
  codeCol: { width: "7%" },
  sectorCol: { width: "12%" },
  serviceCol: { width: "42%" },
  unitCol: { width: "8%" },
  qtyCol: { width: "8%" },
  priceCol: { width: "11%" },
  totalCol: { borderRightWidth: 0, width: "12%" },
  sectorCell: { alignItems: "center", backgroundColor: brand.sector, fontSize: 7, fontWeight: "bold", textAlign: "center" },
  codeCell: { backgroundColor: brand.lightBlue, fontSize: 6.5, textAlign: "center" },
  serviceCell: { backgroundColor: "#f1f5f9", fontSize: 6.8, lineHeight: 1.3 },
  unitCell: { fontSize: 6.7, textAlign: "center" },
  moneyCell: { fontSize: 6.8, textAlign: "right" },
  totalCell: { backgroundColor: brand.green, fontSize: 6.8, fontWeight: "bold", textAlign: "right" },
  subtotalRow: { flexDirection: "row", marginLeft: "77%" },
  subtotalLabel: { backgroundColor: "#eef6e9", fontSize: 8, fontWeight: "bold", padding: 5, textAlign: "center", width: "48%" },
  subtotalValue: { backgroundColor: "#eef6e9", fontSize: 8, fontWeight: "bold", padding: 5, textAlign: "right", width: "52%" },
  infoGrid: { flexDirection: "row", marginBottom: 16, marginTop: 4 },
  infoBox: { borderColor: "#cbd5e1", borderWidth: 1, flex: 1, marginRight: 8, padding: 9 },
  infoBoxLast: { marginRight: 0 },
  infoTitle: { color: brand.blueDark, fontSize: 8, fontWeight: "bold", marginBottom: 4, textTransform: "uppercase" },
  infoText: { fontSize: 8, lineHeight: 1.35 },
  footer: { bottom: 0, height: 44, left: 0, position: "absolute", right: 0 },
  contactStrip: { backgroundColor: brand.blue, color: "#ffffff", flexDirection: "row", height: 44, paddingHorizontal: 95, paddingTop: 15 },
  contactCol: { flex: 1, textAlign: "center" },
  contactLine: { fontSize: 10 }
});

export function BudgetPdfDocument({ budget, settings }: { budget: BudgetWithRelations; settings?: Settings | null }) {
  const groups = getGroups(budget);

  return (
    <Document>
      <CoverPage settings={settings} />
      <Page size="A4" style={styles.page}>
        <PageChrome budget={budget} settings={settings} />
        <Text style={styles.documentTitle}>Proposta Comercial</Text>

        {groups.map((group, groupIndex) => (
          <GroupTable key={group.id} group={group} groupIndex={groupIndex} startIndex={itemStartIndex(groups, groupIndex)} />
        ))}

        <TotalsAndNotes budget={budget} />
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
      </View>
    </Page>
  );
}

function PageChrome({ budget, settings }: { budget: BudgetWithRelations; settings?: Settings | null }) {
  const proposalLogoUrl = settings?.proposal_logo_url ?? settings?.logo_url;

  return (
    <>
      <View fixed style={styles.topBand} />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {proposalLogoUrl ? <Image fixed src={proposalLogoUrl} style={styles.watermarkLogo} /> : <Text fixed style={styles.watermarkText}>ORCAMENTO</Text>}
      <View fixed style={styles.header}>
        <View style={styles.headerMeta}>
          <MetaLine label="Cliente" value={budget.clients?.name} />
          <MetaLine label="Empresa" value={settings?.company_name} />
          <MetaLine label="Prazo de Execução" value={budget.execution_deadline} />
          <MetaLine label="Proposta" value={proposalNumber(budget)} />
        </View>
        <View style={styles.headerLogoWrap}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {proposalLogoUrl ? <Image src={proposalLogoUrl} style={styles.headerLogo} /> : <Text style={styles.headerLogoFallback}>{settings?.company_name ?? "Logo"}</Text>}
        </View>
        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Página: ${Math.max(pageNumber - 1, 1)}/${Math.max(totalPages - 1, 1)}`}
        />
      </View>
      <View fixed style={styles.footer}>
        <View style={styles.contactStrip}>
          <View style={styles.contactCol}>
            <Text style={styles.contactLine}>{settings?.company_phone ?? "-"}</Text>
          </View>
          <View style={styles.contactCol}>
            <Text style={styles.contactLine}>{settings?.company_email ?? "-"}</Text>
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
      {groupIndex === 0 ? <Text style={styles.tableTitle}>Descritivo Orçamentário</Text> : null}
      <View style={styles.row} wrap={false}>
        <Text style={[styles.headCell, styles.codeCol]}>Código</Text>
        <Text style={[styles.headCell, styles.sectorCol]}>Setores</Text>
        <Text style={[styles.headCell, styles.serviceCol]}>Serviço</Text>
        <Text style={[styles.headCell, styles.unitCol]}>Unid</Text>
        <Text style={[styles.headCell, styles.qtyCol]}>Qnt.</Text>
        <Text style={[styles.headCell, styles.priceCol]}>Valor</Text>
        <Text style={[styles.headCell, styles.totalCol]}>Valor Total</Text>
      </View>
      {group.budget_items.map((item, index) => (
        <View key={item.id} style={styles.row} wrap={false}>
          <Text style={[styles.cell, styles.codeCell, styles.codeCol]}>S-{String(startIndex + index + 1).padStart(3, "0")}</Text>
          <Text style={[styles.cell, styles.sectorCell, styles.sectorCol]}>{index === 0 ? group.name : ""}</Text>
          <Text style={[styles.cell, styles.serviceCell, styles.serviceCol]}>{item.name}{item.description ? ` - ${item.description}` : ""}</Text>
          <Text style={[styles.cell, styles.unitCell, styles.unitCol]}>{formatUnit(item.unit)}</Text>
          <Text style={[styles.cell, styles.qtyCol, { textAlign: "right" }]}>{numberText(item.quantity)}</Text>
          <Text style={[styles.cell, styles.moneyCell, styles.priceCol]}>{formatCurrency(item.price_unit)}</Text>
          <Text style={[styles.cell, styles.totalCell, styles.totalCol]}>{formatCurrency(item.subtotal)}</Text>
        </View>
      ))}
      <View style={styles.subtotalRow} wrap={false}>
        <Text style={styles.subtotalLabel}>Total:</Text>
        <Text style={styles.subtotalValue}>{formatCurrency(group.subtotal)}</Text>
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
          <Text style={styles.infoTitle}>Condições comerciais</Text>
          <Text style={styles.infoText}>Pagamento: {budget.payment_terms || "-"}</Text>
          <Text style={styles.infoText}>Validade: {formatSimpleDate(budget.valid_until)}</Text>
          <Text style={styles.infoText}>Prazo: {budget.execution_deadline || "-"}</Text>
        </View>
        <View style={[styles.infoBox, styles.infoBoxLast]}>
          <Text style={styles.infoTitle}>Observações</Text>
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
            <Text style={styles.infoTitle}>Escopo não incluso</Text>
            <Text style={styles.infoText}>{budget.excluded_scope || "-"}</Text>
          </View>
        </View>
      ) : null}
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

function formatUnit(value: string | null | undefined) {
  if (!value) return "-";
  return unitLabels[value as keyof typeof unitLabels] ?? value;
}

function formatSimpleDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
