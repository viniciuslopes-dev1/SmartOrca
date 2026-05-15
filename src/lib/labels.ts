export const personTypeLabels = {
  individual: "Pessoa física",
  company: "Pessoa jurídica"
} as const;

export const projectStatusLabels = {
  planning: "Planejamento",
  estimating: "Em orçamento",
  waiting_approval: "Aguardando aprovação",
  approved: "Aprovado",
  in_progress: "Em execução",
  finished: "Finalizado",
  cancelled: "Cancelado"
} as const;

export const budgetStatusLabels = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Recusado",
  expired: "Expirado",
  cancelled: "Cancelado"
} as const;

export const catalogTypeLabels = {
  product: "Produto",
  service: "Serviço",
  labor: "Mão de obra",
  material: "Material",
  equipment: "Equipamento",
  fee_other: "Taxa/outros"
} as const;

export const unitLabels = {
  unit: "unidade",
  m2: "m²",
  m3: "m³",
  linear_meter: "metro linear",
  hour: "hora",
  day: "diária",
  kg: "kg",
  package: "pacote",
  other: "outro"
} as const;
