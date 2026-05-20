"use client";

import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Save, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/data-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { useImportCatalogItems } from "@/hooks/useCatalogItems";
import { parseCatalogExcel, type ParsedCatalogItem } from "@/lib/catalog-excel-import";
import { formatCurrency } from "@/lib/formatters";
import { catalogTypeLabels, unitLabels } from "@/lib/labels";

export default function CatalogImportPage() {
  const [items, setItems] = useState<ParsedCatalogItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const importItems = useImportCatalogItems();

  const importableItems = useMemo(() => items.filter((item) => item.name.trim()), [items]);
  const warningCount = items.reduce((sum, item) => sum + item.warnings.length, 0);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setIsParsing(true);
    setParseError(null);
    importItems.reset();

    try {
      const parsed = await parseCatalogExcel(file);
      setItems(parsed);
      if (parsed.length === 0) setParseError("Não encontrei uma tabela de itens reconhecível neste arquivo.");
    } catch {
      setParseError("Não foi possível ler o Excel. Verifique se o arquivo é .xlsx, .xls ou .csv exportado corretamente.");
      setItems([]);
    } finally {
      setIsParsing(false);
    }
  }

  function saveItems() {
    importItems.mutate(
      importableItems.map((item) => ({
        name: item.name,
        description: item.description || null,
        type: item.type,
        unit: item.unit,
        category: item.category || null,
        cost_unit: item.cost_unit,
        price_unit: item.price_unit,
        default_margin: item.default_margin,
        is_active: true,
        notes: item.notes || null
      }))
    );
  }

  return (
    <>
      <PageHeader
        title="Importar itens por Excel"
        description="Suba a planilha do cliente para transformar serviços, materiais e mão de obra em itens reutilizáveis do catálogo."
        actions={
          <Link href="/catalog" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Arquivo de origem</h2>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => handleFile(event.target.files?.[0])} />
            <p className="text-sm text-slate-500">
              O importador tenta reconhecer colunas com nomes diferentes, como descrição, serviço, produto, setor, categoria, unidade, valor custo e valor unitário.
            </p>
          </div>

          {isParsing ? <p className="text-sm font-medium text-slate-700">Lendo planilha...</p> : null}
          {parseError ? <p className="text-sm font-medium text-red-700">{parseError}</p> : null}
          {importItems.isError ? <p className="text-sm font-medium text-red-700">{(importItems.error as Error).message}</p> : null}
          {importItems.isSuccess ? <p className="text-sm font-medium text-emerald-700">{importItems.data.length} itens importados para o catálogo.</p> : null}
        </CardContent>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold">Prévia da importação</h2>
              <p className="text-sm text-slate-500">{items.length} itens detectados · {warningCount} avisos de conferência</p>
            </div>
            <Button type="button" onClick={saveItems} disabled={importableItems.length === 0 || importItems.isPending}>
              {importItems.isPending ? <Upload className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
              {importItems.isPending ? "Salvando..." : "Salvar no catálogo"}
            </Button>
          </div>
        </CardHeader>
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Nenhum arquivo lido" description="Selecione um Excel para revisar os itens antes de salvar." />
          </div>
        ) : (
          <div className="industrial-scrollbar overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Unidade</th>
                  <th className="px-4 py-3">Custo</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-4 py-3">Avisos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {items.map((item, index) => (
                  <tr key={`${item.source_sheet}-${item.source_row}-${index}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.description || "Sem descrição adicional"}</div>
                    </td>
                    <td className="px-4 py-3">{item.category || "-"}</td>
                    <td className="px-4 py-3">{catalogTypeLabels[item.type]}</td>
                    <td className="px-4 py-3">{unitLabels[item.unit]}</td>
                    <td className="px-4 py-3">{formatCurrency(item.cost_unit)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(item.price_unit)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.source_sheet}, linha {item.source_row}</td>
                    <td className="px-4 py-3 text-xs text-amber-700">{item.warnings.join(" ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
