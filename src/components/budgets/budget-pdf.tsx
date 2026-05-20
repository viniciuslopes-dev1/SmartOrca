"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { budgetGroupTypeLabels, budgetStatusLabels } from "@/lib/labels";
import type { BudgetWithRelations, Settings } from "@/types/database.types";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#1f2937", fontFamily: "Helvetica" },
  header: { borderBottomWidth: 1, borderBottomColor: "#0e7490", paddingBottom: 12, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 10, color: "#475569", marginTop: 3 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 14 },
  box: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", padding: 10 },
  boxTitle: { fontSize: 9, fontWeight: "bold", color: "#0369a1", marginBottom: 6, textTransform: "uppercase" },
  line: { marginBottom: 3 },
  table: { borderWidth: 1, borderColor: "#cbd5e1", marginBottom: 14 },
  groupHeader: { backgroundColor: "#f1f5f9", borderTopWidth: 1, borderTopColor: "#cbd5e1", padding: 6, flexDirection: "row", justifyContent: "space-between" },
  groupTitle: { fontWeight: "bold", color: "#0f172a" },
  groupMeta: { color: "#475569" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  head: { backgroundColor: "#e2e8f0", fontWeight: "bold" },
  cell: { padding: 6 },
  item: { width: "34%" },
  unit: { width: "12%" },
  qty: { width: "10%" },
  price: { width: "16%" },
  discount: { width: "12%" },
  total: { width: "16%" },
  totals: { marginLeft: "auto", width: 210, borderWidth: 1, borderColor: "#cbd5e1", padding: 10, marginBottom: 14 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#94a3b8", paddingTop: 6, fontWeight: "bold" },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#0f172a", marginBottom: 4, textTransform: "uppercase" },
  accept: { marginTop: 24, borderTopWidth: 1, borderTopColor: "#475569", paddingTop: 6, width: 260, textAlign: "center" }
});

export function BudgetPdfDocument({ budget, settings }: { budget: BudgetWithRelations; settings?: Settings | null }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Orçamento #{budget.budget_number} - {budget.title}</Text>
          <Text style={styles.subtitle}>{settings?.company_name ?? "Empresa não configurada"} · Status: {budgetStatusLabels[budget.status]}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Empresa/prestador</Text>
            <Text style={styles.line}>{settings?.company_name ?? "-"}</Text>
            <Text style={styles.line}>{settings?.company_document ?? "-"}</Text>
            <Text style={styles.line}>{settings?.company_phone ?? "-"}</Text>
            <Text style={styles.line}>{settings?.company_email ?? "-"}</Text>
            <Text style={styles.line}>{settings?.company_address ?? "-"}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Cliente e obra</Text>
            <Text style={styles.line}>{budget.clients?.name ?? "-"}</Text>
            <Text style={styles.line}>{budget.clients?.document ?? "-"}</Text>
            <Text style={styles.line}>Obra: {budget.projects?.name ?? "-"}</Text>
            <Text style={styles.line}>Emissão: {formatDate(budget.issue_date)}</Text>
            <Text style={styles.line}>Validade: {formatDate(budget.valid_until)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.head]}>
            <Text style={[styles.cell, styles.item]}>Item</Text>
            <Text style={[styles.cell, styles.unit]}>Un.</Text>
            <Text style={[styles.cell, styles.qty]}>Qtd.</Text>
            <Text style={[styles.cell, styles.price]}>Preço</Text>
            <Text style={[styles.cell, styles.discount]}>Desc.</Text>
            <Text style={[styles.cell, styles.total]}>Total</Text>
          </View>
          {(budget.budget_groups ?? []).map((group) => (
            <View key={group.id}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                <Text style={styles.groupMeta}>{budgetGroupTypeLabels[group.type]} · {formatCurrency(group.subtotal)}</Text>
              </View>
              {group.budget_items.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text style={[styles.cell, styles.item]}>{item.name}</Text>
                  <Text style={[styles.cell, styles.unit]}>{item.unit}</Text>
                  <Text style={[styles.cell, styles.qty]}>{item.quantity}</Text>
                  <Text style={[styles.cell, styles.price]}>{formatCurrency(item.price_unit)}</Text>
                  <Text style={[styles.cell, styles.discount]}>{formatCurrency(item.discount)}</Text>
                  <Text style={[styles.cell, styles.total]}>{formatCurrency(item.subtotal)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalLine}><Text>Subtotal</Text><Text>{formatCurrency(budget.subtotal)}</Text></View>
          <View style={styles.totalLine}><Text>Desconto</Text><Text>{formatCurrency(budget.discount_total)}</Text></View>
          <View style={styles.totalLine}><Text>Taxas/impostos</Text><Text>{formatCurrency(budget.tax_total)}</Text></View>
          <View style={styles.grandTotal}><Text>Total final</Text><Text>{formatCurrency(budget.total)}</Text></View>
        </View>

        <Section title="Condições de pagamento" value={budget.payment_terms} />
        <Section title="Prazo de execução" value={budget.execution_deadline} />
        <Section title="Escopo incluso" value={budget.included_scope} />
        <Section title="Escopo não incluso" value={budget.excluded_scope} />
        <Section title="Observações" value={budget.customer_notes} />

        <Text style={styles.accept}>Aceite do cliente</Text>
      </Page>
    </Document>
  );
}

function Section({ title, value }: { title: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text>{value}</Text>
    </View>
  );
}
