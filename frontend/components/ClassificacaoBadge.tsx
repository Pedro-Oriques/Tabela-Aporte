interface Props {
  classificacao: string;
}

function getBadgeStyle(classificacao: string): React.CSSProperties {
  switch (classificacao) {
    case 'Aporte Forte':
      return {
        background: 'color-mix(in srgb, var(--color-green) 15%, transparent)',
        color: 'var(--color-green)',
        border: '1px solid color-mix(in srgb, var(--color-green) 35%, transparent)',
      };
    case 'Aporte':
      return {
        background: 'color-mix(in srgb, var(--color-blue) 15%, transparent)',
        color: 'var(--color-blue)',
        border: '1px solid color-mix(in srgb, var(--color-blue) 35%, transparent)',
      };
    case 'Aporte Pequeno':
      return {
        background: 'color-mix(in srgb, var(--color-amber) 15%, transparent)',
        color: 'var(--color-amber)',
        border: '1px solid color-mix(in srgb, var(--color-amber) 35%, transparent)',
      };
    case 'Não Comprar':
      return {
        background: 'color-mix(in srgb, var(--color-red) 15%, transparent)',
        color: 'var(--color-red)',
        border: '1px solid color-mix(in srgb, var(--color-red) 35%, transparent)',
      };
    default:
      return {
        background: 'color-mix(in srgb, var(--color-text-secondary) 15%, transparent)',
        color: 'var(--color-text-secondary)',
      };
  }
}

export default function ClassificacaoBadge({ classificacao }: Props) {
  return (
    <span
      className="inline-block px-3 py-1 text-xs font-semibold"
      style={{ borderRadius: 'var(--radius-btn)', ...getBadgeStyle(classificacao) }}
    >
      {classificacao}
    </span>
  );
}
