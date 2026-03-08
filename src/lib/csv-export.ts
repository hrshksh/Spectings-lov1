/** Export an array of objects to a CSV file download */
export function exportToCsv(filename: string, rows: Record<string, unknown>[], columns?: { key: string; label: string }[]) {
  if (rows.length === 0) return;

  const cols = columns ?? Object.keys(rows[0]).map(k => ({ key: k, label: k }));
  const header = cols.map(c => `"${c.label}"`).join(',');
  const body = rows.map(row =>
    cols.map(c => {
      const val = row[c.key];
      const str = val == null ? '' : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
